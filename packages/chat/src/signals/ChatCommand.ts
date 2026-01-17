import type { ChatPlatform } from "../platforms"

export type ChatCommand<P extends ChatPlatform> =
  | ChatMessageCommand<P>
  | ChatVoiceCommand<P>
  | ChatTypingCommand<P>

export type ChatMessageCommand<P extends ChatPlatform = ChatPlatform> = {
  readonly service: "chat"
  readonly type: "command"
  readonly name: "message"
  readonly target: P["directSource"] | P["channelSource"]
  readonly text: string
  readonly rich?: unknown
}

export type ChatTypingCommand<P extends ChatPlatform = ChatPlatform> = {
  readonly service: "chat"
  readonly type: "command"
  readonly name: "typing"
  readonly target: P["directSource"] | P["channelSource"]
}

export type ChatVoiceCommand<P extends ChatPlatform = ChatPlatform> = {
  readonly service: "chat"
  readonly type: "command"
  readonly name: "voice"
  readonly target: P["directSource"] | P["channelSource"]
  readonly voice: Uint8Array
}
