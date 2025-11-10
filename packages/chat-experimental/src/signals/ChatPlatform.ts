export type ChatPlatform = {
  name: string
  capabilities: ChatCapabilities
}

export type ChatCapabilities = {
  pinType: "multiple" | "single"
  editMessage: boolean
  deleteMessage: boolean
}

export type ParseChatCapability = (
  abbreviation: string,
) => keyof ChatCapabilities
export type StringifyChatCapability = (
  capability: keyof ChatCapabilities,
) => string

export type ChatCapabilityType = "bit" | "flag"

