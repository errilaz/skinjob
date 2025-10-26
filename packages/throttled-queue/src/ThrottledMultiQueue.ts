import { ThrottledQueue } from "./ThrottledQueue"

type Action = () => unknown

/** Simple helper for multiple named throttled queues. */
export class ThrottledMultiQueue {
  private readonly queues: Record<string, ThrottledQueue> = {}

  push(key: string, action: Action) {
    this.getQueue(key).push(action)
  }

  purge(key: string) {
    this.getQueue(key).purge()
  }

  throttle(key: string, ms: number) {
    this.getQueue(key).throttle = ms
  }

  private getQueue(key: string) {
    if (!this.queues[key]) {
      this.queues[key] = new ThrottledQueue()
    }
    return this.queues[key]
  }
}
