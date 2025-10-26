export type DiscordPlatform = {
  readonly platform: "discord"
  readonly directSource: DiscordDirectSource
  readonly channelSource: DiscordChannelSource
}

export type DiscordChannelSource = {
  readonly platform: "discord"
  readonly type: "channel"
  readonly guildId: string
  readonly channelId: string
}

export type DiscordDirectSource = {
  readonly platform: "discord"
  readonly type: "direct"
  readonly authorId: string
}
