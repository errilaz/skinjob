export type AIChatContract = {
  readonly chat: (args: AIChatRequest) => Promise<string>
}

export type AIChatRequest = {
  readonly source: string
  readonly conversation: string
  readonly model: string
  readonly text: string
}
