import type { ChatPeer } from "./ChatPeer"

export type ChatCommand =
  | ChatMessageCommand
  | ChatVoiceCommand

export type ChatMessageCommand = {
  readonly service: "chat"
  readonly type: "command"
  readonly name: "message"
  readonly target: ChatPeer
  readonly text: string
  readonly rich?: unknown
}

export type ChatVoiceCommand = {
  readonly service: "chat"
  readonly type: "command"
  readonly name: "voice"
  readonly target: ChatPeer
  readonly voice: Uint8Array
}

export type ChatTypingCommand = {
  readonly service: "chat"
  readonly type: "command"
  readonly name: "typing"
  readonly target: ChatPeer
}

