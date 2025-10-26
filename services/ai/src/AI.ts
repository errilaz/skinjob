import { Service } from "@skinjob/service"
import type { AIContract } from "./AIContract"

export const AI = Service.client<AIContract>("ai")
