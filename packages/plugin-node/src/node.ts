import type { Plugin } from "@skinjob/supervisor"
import * as Path from "node:path"

const tsx = Path.resolve(import.meta.dir, "..", "node_modules", ".bin", "tsx")

export default function node(): Plugin {
  return {
    runner: {
      pattern: "*.node.worker.ts",
      command({ production, path }) {
        const envArgs = production ? "" : "watch --clear-screen=false"
        const register = `-r ${import.meta.dir}/register.cjs`
        return `${tsx} ${envArgs} ${register} ${path}`
      },
    },
  }
}
