import { pack, unpack } from "msgpackr"

const SKINJOB_PORT = process.env.SKINJOB_PORT
  ? parseInt(process.env.SKINJOB_PORT, 10)
  : 8000

export type BusSubscriber<S extends BusSignal> = (signal: S) => void

export type BusSubscription = { cancel: () => void }

export type BusSignal = {
  service: string
  type: string
  name: string
}

export type InternalSignal = BusSignal & {
  pid: number
}

type Action = () => void

type Subscribers = {
  [topic: string]: {
    [subscriberId: number]: BusSubscriber<BusSignal>
  }
}

/** Skinjob bus client. */
export class Bus {
  private static static: Bus

  private ready = false
  private nextSubscriberId = 0
  private readonly queuedActions: Action[] = []
  private subscribers: Subscribers = {}
  private readonly ws: WebSocket

  constructor(port: number) {
    this.ws = new WebSocket(`ws://localhost:${port}`)
    this.ws.addEventListener("open", () => {
      this.ready = true
      for (const action of this.queuedActions) {
        setImmediate(action)
      }
    })

    this.ws.addEventListener("message", (event) => {
      const signal = unpack(event.data) as InternalSignal
      if (signal.pid === process.pid) {
        return
      }
      const { service, type, name } = signal
      const topic =
        type === "event" || type === "command"
          ? `${service}/${type}/${name}`
          : `${service}/${type}`
      const topicSubscribers = this.subscribers[topic]
      if (!topicSubscribers) {
        return
      }
      for (const subscriberId in topicSubscribers) {
        setImmediate(() => topicSubscribers[subscriberId](signal))
      }
    })
  }

  static get default() {
    if (!Bus.static) {
      Bus.static = new Bus(SKINJOB_PORT);
    }
    return Bus.static;
  }

  private sendOrQueue(action: Action) {
    if (this.ready) {
      action()
    } else {
      this.queuedActions.push(action)
    }
  }

  static send<S extends BusSignal>(signal: S) {
    Bus.default.send(signal)
  }

  send<S extends BusSignal>(signal: S) {
    this.sendOrQueue(() => {
      this.ws.send(
        pack({
          action: "dispatch",
          signal: {
            ...signal,
            pid: process.pid,
          },
        }),
      )
    })
  }

  static receive<S extends BusSignal>(
    service: string,
    type: string,
    name: string | undefined,
    subscriber: BusSubscriber<S>,
  ) {
    return Bus.default.receive(service, type, name, subscriber)
  }

  receive<S extends BusSignal>(
    service: string,
    type: string,
    name: string | undefined,
    subscriber: BusSubscriber<S>,
  ) {
    const topic = name ? `${service}/${type}/${name}` : `${service}/${type}`
    const subscriberId = this.nextSubscriberId++
    let topicSubscriber = this.subscribers[topic]
    if (!topicSubscriber) {
      this.subscribers[topic] = topicSubscriber = {}
    }
    topicSubscriber[subscriberId] = subscriber as BusSubscriber<BusSignal>
    this.sendOrQueue(() =>
      this.ws.send(
        pack({
          action: "subscribe",
          signal: { service, type, name },
        }),
      ),
    )
    return {
      cancel: () => {
        delete this.subscribers[topic][subscriberId]
        this.sendOrQueue(() =>
          this.ws.send(
            pack({
              action: "unsubscribe",
              signal: { service, type, name },
            }),
          ),
        )
      },
    }
  }
}
