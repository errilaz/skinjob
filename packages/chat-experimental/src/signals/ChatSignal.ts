import type { ChatCommand } from "./ChatCommand"
import type { ChatEvent } from "./ChatEvent"
import type { ChatPlatform } from "./ChatPlatform"

export type ChatSignal<P extends ChatPlatform = ChatPlatform> =
  | ChatEvent<P>
  | ChatCommand<P>
