#!/usr/bin/env bun
import { supervise } from "@skinjob/supervisor"
import * as Path from "node:path"
import options from "toptions"

// TODO: use `death`?

const parse = options({
  path: options.arg(0, process.cwd()),
  pattern: options.list("p"),
  ignore: options.list("i"),
  register: options.list("r"),
  production: options.bit(),
  noDefaultPattern: options.bit(),
  verbose: options.bit("v"),
  help: options.bit("h"),
})

const {
  path,
  pattern,
  ignore,
  register,
  production,
  noDefaultPattern,
  verbose,
  help,
} = parse(process.argv.slice(2))

if (help) {
  usage()
  process.exit()
}

const root = Path.resolve(path)
process.chdir(root)

void supervise({
  root,
  patterns: pattern,
  ignores: ignore,
  plugins: register,
  production,
  noDefaultPattern,
  verbose,
})

function usage() {
  console.log(`Usage: skinjob [path] [options]

  Options:
    path                      Path to bot directory (default: cwd)
    -p, --pattern <pattern>   Filename pattern to match
    -i, --ignore <pattern>    Exclude a glob pattern
    -r, --register <plugin>   Register a plugin
    --production              Production mode, disable file monitoring
    --noDefaultPattern        Don't use default pattern (*.worker.{ts,js})
    -v, --verbose             Verbose logs
    -h, --help                Display this message
`)
}
