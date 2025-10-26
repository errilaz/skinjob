import type { ChatPlatform } from "../platforms"

export type ChatEvent<P extends ChatPlatform> =
  | ChatMessageEvent<P>
  | ChatVoiceEvent<P>

export type ChatMessageEvent<P extends ChatPlatform = ChatPlatform> =
  | DirectMessageEvent<P>
  | ChannelMessageEvent<P>

export type ChatVoiceEvent<P extends ChatPlatform = ChatPlatform> =
  | DirectVoiceEvent<P>
  | ChannelVoiceEvent<P>

export type DirectMessageEvent<P extends ChatPlatform> = {
  readonly service: "chat"
  readonly type: "event"
  readonly isMine: boolean
  readonly name: "message"
  readonly messageType: "direct"
  readonly source: P["directSource"]
  readonly userId: string
  readonly nick: string
  readonly text: string
}

export type ChannelMessageEvent<P extends ChatPlatform> = {
  readonly service: "chat"
  readonly type: "event"
  readonly isMine: boolean
  readonly name: "message"
  readonly messageType: "channel"
  readonly source: P["channelSource"]
  readonly userId: string
  readonly channel: string
  readonly nick: string
  readonly text: string
}

export type DirectVoiceEvent<P extends ChatPlatform> = Omit<
  DirectMessageEvent<P>,
  "text" | "name"
> & {
  readonly name: "voice"
  readonly voice: string
}

export type ChannelVoiceEvent<P extends ChatPlatform> = Omit<
  ChannelMessageEvent<P>,
  "text" | "name"
> & {
  readonly name: "voice"
  readonly voice: string
}
