import { Service } from "@skinjob/service"
import type { AIChatContract } from "./AIChatContract"
import type { AIContract } from "@skinjob/ai"
import { Memory } from "./Memory"

export namespace AIChatService {
  export const start = startAIChat

  export type Options = {
    readonly serviceName?: string
    readonly debug?: boolean
    readonly ai?: {
      readonly serviceName?: string
      readonly requestTimeout?: number
    }
    readonly memory?: {
      readonly path?: string
    }
    readonly aiService?: string
  }
}

function startAIChat({
  debug,
  ...options
}: AIChatService.Options) {
  const memory = Memory.create({ path: options?.memory?.path })
  const ai = Service.client<AIContract>(options.aiService ?? "ai")

  const serviceName = options.serviceName ?? "aiChat"
  Service.host<AIChatContract>(serviceName, {
    async chat({ model, text, source, conversation }) {
      const content = await 
      const response = await client.chat.completions.create({
        model,
        messages: [{ role: "user", content }],
      })
      if (debug) {
        console.log(JSON.stringify(response))
      }
      return response.choices[0].message.content ?? "No response."
    },
    async models() {
      const models = await client.models.list({ timeout: 5000 })
      return models.data.map((model) => model.id)
    },
  })
}
