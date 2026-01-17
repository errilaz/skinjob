import { Glob, type Subprocess, spawn, spawnSync } from "bun"
import { watch } from "chokidar"
import * as Path from "node:path"
import type { Plugin, RunnerConfiguration } from "./Plugin"
import serve from "./serve"
import { kill, scan } from "./utilities"

type PartialExcept<T, K extends keyof T> = Partial<Omit<T, K>> & Pick<T, K>

export type SupervisorOptions = {
  readonly root: string
  readonly patterns: string[]
  readonly ignores: string[]
  readonly plugins: string[]
  readonly production: boolean
  readonly noDefaultPattern: boolean
  readonly verbose: boolean
}

type Worker = {
  process: Subprocess
  deaths: number[]
  startTimeout?: NodeJS.Timeout
  runner: Runner | undefined
}

type Runner = Omit<RunnerConfiguration, "pattern"> & {
  readonly pattern: Glob
}

const DEFAULT_PATTERN = "*.worker.{js,ts,cjs,mjs,cts,mts}"
const DEFAULT_IGNORES = ["**/node_modules/**", "**/.git/**"]
const AUTOMATIC_PLUGINS = [
  "@skinjob/plugin-node",
  "@skinjob/plugin-shell",
  "@skinjob/plugin-docker",
]
const RESTART = {
  minTime: 250,
  maxTime: 10000,
  waitFactor: 2,
  logSize: 5,
}

// TODO: allow passing restart options

export default async function supervise({
  root,
  ...options
}: PartialExcept<SupervisorOptions, "root">) {
  const patterns = (
    options.noDefaultPattern
      ? (options.patterns ?? [])
      : [DEFAULT_PATTERN, ...(options.patterns ?? [])]
  ).map((pattern) => new Glob(`**/${pattern}`))
  const ignores = [...DEFAULT_IGNORES, ...(options.ignores ?? [])].map(
    (pattern) => new Glob(pattern),
  )
  const production = !!options.production
  const verbose = !!options.verbose

  const runners: Runner[] = []
  await loadPlugins(AUTOMATIC_PLUGINS, true)
  await loadPlugins(options.plugins ?? [], false)

  const server = serve({ verbose })
  const port = server.port as number
  const workers: Record<string, Worker> = {}

  const watcher = production
    ? null
    : watch(root, {
        ignored: ignores.map((ignore) => ignore.match.bind(ignore)),
      })

  if (watcher) {
    watcher?.on("add", addWorker)
    watcher?.on("change", changeWorker)
    watcher?.on("unlink", removeWorker)
  } else {
    scan(root, ignores, addWorker)
  }

  function addWorker(path: string) {
    const name = Path.basename(path)
    const [validWorker, runner] = isWorker(path)
    if (!validWorker) {
      return
    }
    if (workers[path]) {
      if (verbose) {
        console.log(`== worker already tracked, skipping add: "${name}"`)
      }
      return
    }
    const command = getCommand(path)
    const worker: Worker = { process: undefined as unknown as Subprocess, deaths: [], runner }
    workers[path] = worker
    worker.process = start()

    function start(): Subprocess {
      console.log(`== starting worker: "${name}"`)
      if (verbose) {
        console.log(`$ ${command}`)
      }
      let child: Subprocess
      const onExit = (): void => died(child)
      child = spawn({
        cwd: root,
        env: { ...Bun.env, SKINJOB_PORT: port.toString() },
        cmd: ["/bin/sh", "-c", command],
        stdio: ["inherit", "inherit", "inherit"],
        onExit,
      })
      return child
    }

    function died(process: Subprocess) {
      const active = workers[path]
      if (!active || active.process !== process) {
        return
      }
      const diedAt = Date.now()
      clearTimeout(worker.startTimeout)
      if (worker.deaths.length > RESTART.logSize) {
        worker.deaths.shift()
      }
      if (worker.deaths.length > 0) {
        const last = worker.deaths[worker.deaths.length - 1]
        if (last < diedAt - RESTART.maxTime * 2) {
          worker.deaths = []
        }
      }
      worker.deaths.push(diedAt)
      if (runner?.cleanup) {
        cleanupRunner(path, name, runner)
      }
      const wait = backoff(worker.deaths.length)
      console.log(`== worker died: "${name}", restarting in ${wait}ms`)

      worker.startTimeout = setTimeout(() => {
        worker.process = start()
      }, wait)
    }
  }

  function removeWorker(path: string) {
    const name = Path.basename(path)
    const [validWorker, runner] = isWorker(path)
    if (!validWorker) {
      return
    }
    const worker = workers[path]
    if (!worker) {
      return
    }
    console.log(`== removing worker: "${name}"`)
    clearTimeout(worker.startTimeout)
    delete workers[path]
    if (runner?.cleanup) {
      cleanupRunner(path, name, runner)
    }
    kill(worker.process.pid)
  }

  function cleanupRunner(path: string, name: string, runner: Runner) {
    if (runner?.cleanup) {
      console.log(`== cleaning up worker: "${name}"`)
      const command = runner.cleanup({ production, root, path })
      if (verbose) {
        console.log(`$ ${command}`)
      }
      spawnSync({
        cwd: root,
        env: { ...Bun.env, SKINJOB_PORT: port.toString() },
        cmd: ["/bin/sh", "-c", command],
        stdio: ["inherit", "inherit", "inherit"],
      })
    }
  }

  function changeWorker(path: string) {
    const [validWorker, runner] = isWorker(path)
    if (!validWorker || !runner?.watch) {
      return
    }
    const worker = workers[path]
    if (!worker) {
      return
    }
    removeWorker(path)
    addWorker(path)
  }

  function isWorker(path: string): [boolean, Runner | undefined] {
    for (const ignore of ignores) {
      if (ignore.match(path)) {
        return [false, undefined]
      }
    }
    for (const pattern of patterns) {
      if (pattern.match(path)) {
        return [true, undefined]
      }
    }
    for (const runner of runners) {
      if (runner.pattern.match(path)) {
        return [true, runner]
      }
    }
    return [false, undefined]
  }

  function getCommand(path: string) {
    for (const runner of runners) {
      if (runner.pattern.match(path) && runner.command) {
        return runner.command({ production, root, path })
      }
    }
    const envArgs = production ? "" : "--watch --no-clear-screen"
    return `bun --no-install ${envArgs} ${path}`
  }

  async function loadPlugins(plugins: string[], automatic: boolean) {
    for (const name of plugins) {
      try {
        const resolved = await Bun.resolve(name, `${root}/package.json`)
        const pluginOrFactory = (await import(resolved)).default
        if (!pluginOrFactory) {
          throw new Error(`Plugin "${name}" has no default export.`)
        }
        const plugin: Plugin =
          typeof pluginOrFactory === "function"
            ? await Promise.resolve(pluginOrFactory())
            : pluginOrFactory
        if (plugin.runner) {
          runners.push({
            ...plugin.runner,
            pattern: new Glob(`**/${plugin.runner.pattern}`),
          })
        }
        if (verbose) {
          console.log(`PLUGIN: loaded  "${name}"`)
        }
      } catch (error) {
        if (verbose) {
          console.log(`PLUGIN: failed to load  "${name}"`)
          console.error(error)
        }
        if (automatic) {
          continue
        }
        console.warn(`Could not load plugin "${name}".`)
        console.error(error)
        process.exit(1)
      }
    }
  }
}

function backoff(failures: number) {
  return Math.min(
    RESTART.maxTime,
    RESTART.waitFactor ** (failures - 1) * RESTART.minTime,
  )
}
