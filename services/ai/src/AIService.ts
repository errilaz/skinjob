import { Service } from "@skinjob/service"
import { OpenAI } from "openai"
import type { AIContract } from "./AIContract"

export namespace AIService {
  export const start = startAI

  export type Service = {
    readonly chat: (text: string) => Promise<string>
  }

  export type Options = {
    readonly apiKey: string
    readonly baseURL?: string
    readonly serviceName?: string
  }
}

function startAI({ apiKey, baseURL, ...options }: AIService.Options) {
  const client = new OpenAI({
    apiKey,
    baseURL,
  })

  const serviceName = options.serviceName ?? "ai"
  Service.host<AIContract>(serviceName, {
    async chat({ content, model }) {
      const response = await client.chat.completions.create({
        model,
        messages: [{ role: "user", content }],
      })
      return response.choices[0].message.content ?? "No response."
    },
    async models() {
      const models = await client.models.list({ timeout: 5000 })
      return models.data.map((model) => model.id)
    },
  })
}
