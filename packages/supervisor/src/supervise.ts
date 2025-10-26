import { Glob, type Subprocess, spawn } from "bun"
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
}

type Runner = Omit<RunnerConfiguration, "pattern"> & {
  readonly pattern: Glob
}

const DEFAULT_PATTERN = "*.worker.{js,ts,cjs,mjs,cts,mts}"
const DEFAULT_IGNORES = ["**/node_modules/**", "**/.git/**"]
const AUTOMATIC_PLUGINS = ["@skinjob/plugin-node"]
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
    watcher?.on("unlink", removeWorker)
  } else {
    scan(root, ignores, addWorker)
  }

  function addWorker(path: string) {
    const name = Path.basename(path)
    if (!isWorker(path)) {
      return
    }
    const command = getCommand(path)
    const process = start()
    const worker: Worker = { process, deaths: [] }
    workers[path] = worker

    function start() {
      console.log(`== starting worker: "${name}"`)
      if (verbose) {
        console.log(`$ ${command}`)
      }
      return spawn({
        cwd: root,
        env: { ...Bun.env, SKINJOB_PORT: port.toString() },
        cmd: ["/bin/sh", "-c", command],
        stdio: ["inherit", "inherit", "inherit"],
        onExit: died,
      })
    }

    function died() {
      if (!workers[path]) {
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
      const wait = backoff(worker.deaths.length)
      console.log(`== worker died: "${name}", restarting in ${wait}ms`)

      worker.startTimeout = setTimeout(() => {
        worker.process = start()
      }, wait)
    }
  }

  function removeWorker(path: string) {
    const name = Path.basename(path)
    if (!isWorker(path)) {
      return
    }
    console.log(`== removing worker: "${name}"`)
    const worker = workers[path]
    if (!worker) return
    clearTimeout(worker.startTimeout)
    delete workers[path]
    kill(worker.process.pid)
  }

  function isWorker(path: string) {
    for (const ignore of ignores) {
      if (ignore.match(path)) {
        return false
      }
    }
    for (const pattern of patterns) {
      if (pattern.match(path)) {
        return true
      }
    }
    for (const runner of runners) {
      if (runner.pattern.match(path)) {
        return true
      }
    }
    return false
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
        const pluginOrFactory = (await import(name)).default
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
