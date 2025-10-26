import { type Glob, spawnSync } from "bun"
import FS from "node:fs/promises"
import Path from "node:path"

export function kill(pid: number) {
  if (process.platform === "win32") {
    spawnSync(["taskkill", "/PID", pid.toString(), "/T", "/F"], {
      stdio: ["ignore", "ignore", "ignore"],
    })
  } else {
    try {
      process.kill(-pid, "SIGKILL")
    } catch {
      process.kill(pid, "SIGKILL")
    }
  }
}

export async function scan(
  dir: string,
  ignores: Glob[],
  found: (path: string) => void,
) {
  const entries = await FS.readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = Path.join(dir, entry.name)
    if (ignores.some((ignore) => ignore.match(fullPath))) {
      continue
    }
    if (entry.isDirectory()) {
      scan(fullPath, ignores, found)
    } else {
      found(fullPath)
    }
  }
}
