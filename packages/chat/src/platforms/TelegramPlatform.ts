export type TelegramPlatform = {
  readonly platform: "telegram"
  readonly directSource: TelegramSource
  readonly channelSource: TelegramSource
}

export type TelegramSource = {
  readonly platform: "telegram"
  readonly type: "direct" | "channel"
  readonly chatId: number
  readonly userId: number
}
