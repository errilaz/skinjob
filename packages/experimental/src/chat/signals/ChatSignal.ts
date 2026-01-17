import type { ChatCommand } from "./ChatCommand"
import type { ChatEvent } from "./ChatEvent"

export type ChatSignal =
  | ChatEvent
  | ChatCommand
