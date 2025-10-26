import type { DiscordPlatform } from "./DiscordPlatform"
import type { IrcPlatform } from "./IrcPlatform"
import type { TelegramPlatform } from "./TelegramPlatform"

export type ChatPlatform = IrcPlatform | TelegramPlatform | DiscordPlatform

export type ChatPlatformCode = ChatPlatform["platform"]

export type ChatMessageSource =
  | ChatPlatform["directSource"]
  | ChatPlatform["channelSource"]
