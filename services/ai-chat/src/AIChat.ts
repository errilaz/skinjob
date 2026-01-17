import { Service } from "@skinjob/service"
import type { AIChatContract } from "./AIChatContract"

export const AIChat = Service.client<AIChatContract>("aiChat", 60_000)
