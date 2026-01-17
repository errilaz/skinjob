import type { Plugin } from "@skinjob/supervisor"
import * as Path from "node:path"

export default function docker(): Plugin {
  return {
    runner: {
      watch: true,
      pattern: "Dockerfile.*.worker",
      command({ path }) {
        const dir = Path.dirname(path)
        const filename = Path.basename(path)
        const service = filename.split(".")[1]
        return `#!/bin/bash
          cd ${dir}
          docker rm -f ${service} >/dev/null 2>&1 || true
          docker build \
            --file ${filename} \
            --tag ${service} \
            . && \
          docker run --detach --name ${service} ${service} && \
          docker wait ${service}
        `
      },
      cleanup({ path }) {
        const filename = Path.basename(path)
        const service = filename.split(".")[1]
        return `#!/bin/bash
          docker stop ${service} >/dev/null 2>&1 || true
          docker rm -f ${service} >/dev/null 2>&1 || true
          echo "=== cleaned up ${service}"
        `
      },
    },
  }
}
