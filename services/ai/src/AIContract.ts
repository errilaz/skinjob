export type AIContract = {
  readonly chat: (args: ChatArgs) => Promise<string>
  readonly models: () => Promise<string[]>
}

export type ChatArgs = {
  readonly content: string
  readonly model: string
}
