import path from "node:path";

const INVALID_CHARS = new RegExp('[<>:"/\\\\|?*\\u0000-\\u001F]')
const RESERVED_NAMES = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\.|$)/i

export function isValidFilename(name: string) {
  return (
    typeof name === "string" &&
    name.length > 0 &&
    name.length <= 255 &&
    name === path.basename(name) &&
    !INVALID_CHARS.test(name) &&
    !RESERVED_NAMES.test(name) &&
    !/[. ]$/.test(name)
  )
}