export type AIContract = {
  readonly chat: (args: ChatArgs) => Promise<string>
  readonly createCompletion: (args: CreateCompletionArgs) => Promise<string | null>
  readonly models: () => Promise<string[]>
}

export type ChatArgs = {
  readonly model: string
  readonly content: string
}

export type CreateCompletionArgs = {
  readonly model: string
  readonly messages: CompletionMessage[]
}

export type CompletionMessage = {
  readonly role: CompletionRole
  readonly content: string
  readonly name?: string
}

export type CompletionRole = "system" | "user" | "assistant"
