export type ChatEvent =
  | ChatMessageEvent
  | ChatVoiceEvent

export type ChatMessageEvent =
  | DirectMessageEvent
  | ChannelMessageEvent

export type ChatVoiceEvent =
  | DirectVoiceEvent
  | ChannelVoiceEvent

export type DirectMessageEvent = {
  readonly service: "chat"
  readonly type: "event"
  readonly isMine: boolean
  readonly name: "message"
  readonly messageType: "direct"
  readonly source: string
  readonly userId: string
  readonly nick: string
  readonly text: string
}

export type ChannelMessageEvent = {
  readonly service: "chat"
  readonly type: "event"
  readonly isMine: boolean
  readonly name: "message"
  readonly messageType: "channel"
  readonly source: string
  readonly userId: string
  readonly channel: string
  readonly nick: string
  readonly text: string
}

export type DirectVoiceEvent = Omit<
  DirectMessageEvent,
  "text" | "name"
> & {
  readonly name: "voice"
  readonly voice: string
}

export type ChannelVoiceEvent = Omit<
  ChannelMessageEvent,
  "text" | "name"
> & {
  readonly name: "voice"
  readonly voice: string
}
