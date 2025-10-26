export type IrcPlatform = {
  readonly platform: "irc"
  readonly directSource: IrcDirectSource
  readonly channelSource: IrcChannelSource
}

export type IrcDirectSource = {
  readonly platform: "irc"
  readonly type: "direct"
  readonly network: string
  readonly nick: string
}

export type IrcChannelSource = {
  readonly platform: "irc"
  readonly type: "channel"
  readonly network: string
  readonly channel: string
}
