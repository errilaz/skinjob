export type ChatCommand =
  | ChatMessageCommand
  | ChatVoiceCommand

export type ChatMessageCommand = {
  readonly service: "chat"
  readonly type: "command"
  readonly name: "message"
  readonly target: string
  readonly text: string
  readonly rich?: unknown
}

export type ChatVoiceCommand = {
  readonly service: "chat"
  readonly type: "command"
  readonly name: "voice"
  readonly target: string
  readonly voice: Uint8Array
}
