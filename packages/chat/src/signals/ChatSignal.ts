import type { ChatPlatform } from "../platforms"
import type { ChatCommand } from "./ChatCommand"
import type { ChatEvent } from "./ChatEvent"

export type ChatSignal<P extends ChatPlatform = ChatPlatform> =
  | ChatEvent<P>
  | ChatCommand<P>
