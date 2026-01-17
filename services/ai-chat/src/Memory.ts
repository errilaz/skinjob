import type { AIChatRequest } from "./AIChatContract"

export namespace Memory {
  export const create = createMemory

  export type Message = {
    readonly source: string
    readonly conversation: string
    readonly time: number
    readonly text: string
    readonly textLength: string
    readonly summaryLevel: number
  }  
}

function createMemory({ path }: {
  readonly path?: string
}) {
  
}