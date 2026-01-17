import type { Plugin } from "@skinjob/supervisor"

export default function shell(): Plugin {
  return {
    runner: {
      watch: true,
      pattern: "*.worker.sh",
      command({ path }) {
        return `/bin/sh -c ${path}`
      },
    },
  }
}
