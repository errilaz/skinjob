type Action = () => unknown
type Timeout = ReturnType<typeof setTimeout>

/** Simple throttling helper. */
export class ThrottledQueue {
  /** Milliseconds to wait between actions. */
  throttle: number
  private nextFire: Timeout | null = null
  private lastFire: number | null = null
  private readonly actions: Action[] = []

  constructor(throttle?: number) {
    this.throttle = throttle ?? 1000;
  }

  /** Add an action to the queue. */
  push(action: Action) {
    this.actions.push(action)
    if (this.nextFire === null) {
      const wait = Math.max(
        0,
        this.throttle - (Date.now() - (this.lastFire || 0)),
      )
      this.nextFire = setTimeout(() => this.fire(), wait)
    }
  }

  /** Stop any pending actions and clear the queue. */
  purge() {
    this.actions.splice(0)
    if (this.nextFire !== null) {
      clearTimeout(this.nextFire)
      this.nextFire = null
    }
  }

  private async fire() {
    const action = this.actions.shift()
    this.lastFire = Date.now()
    try {
      await Promise.resolve(action?.())
    } catch (error) {
      console.error(error)
    } finally {
      this.nextFire =
        this.actions.length === 0
          ? null
          : setTimeout(() => this.fire(), this.throttle)
    }
  }
}
