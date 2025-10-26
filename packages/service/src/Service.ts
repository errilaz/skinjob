// biome-ignore-all lint/suspicious/noExplicitAny: intentional

import { Bus } from "@skinjob/bus"

const TIME_LIMIT = 15 * 1000

export type ServiceContract = Record<
  string,
  (args: any) => Promise<any>
>

export type ServiceCall = {
  type: "call"
  service: string
  name: string
  id: string
  args: unknown
}

export type ServiceReply = ServiceSuccess | ServiceFailure

export type ServiceSuccess = {
  type: "reply"
  service: string
  name: string
  id: string
  success: true
  result: unknown
}

export type ServiceFailure = {
  type: "reply"
  service: string
  name: string
  id: string
  success: false
  error: string
}

export class Service {
  private static static: Service

  private readonly bus: Bus

  constructor(bus: Bus) {
    this.bus = bus
  }

  static get default() {
    if (!Service.static) {
      Service.static = new Service(Bus.default)
    }
    return Service.static
  }

  static host<Contract extends ServiceContract>(
    service: string,
    instance: Contract,
  ) {
    return Service.default.host<Contract>(service, instance)
  }

  host<Contract extends ServiceContract>(service: string, instance: Contract) {
    return this.bus.receive(
      service,
      "call",
      undefined,
      async (signal: ServiceCall) => {
        try {
          const result = await instance[signal.name](signal.args)
          this.bus.send<ServiceSuccess>({
            service,
            type: "reply",
            name: signal.name,
            id: signal.id,
            success: true,
            result,
          })
        } catch (error: unknown) {
          this.bus.send<ServiceFailure>({
            type: "reply",
            service,
            id: signal.id,
            name: signal.name,
            success: false,
            error: String(error),
          })
        }
      },
    )
  }

  static client<Contract extends ServiceContract>(
    service: string,
    requestTimeout = TIME_LIMIT,
  ) {
    return Service.default.client<Contract>(service, requestTimeout)
  }

  client<Contract extends ServiceContract>(
    service: string,
    timeLimit = TIME_LIMIT,
  ): Contract {
    return new Proxy(
      {},
      {
        get: (_obj, name: string) => {
          return (args: unknown) => {
            return new Promise((resolve, reject) => {
              const id = randomId()
              let cancelled = false
              const timeout = setTimeout(timedOut, timeLimit)
              const { cancel } = this.bus.receive(
                service,
                "reply",
                undefined,
                (signal: ServiceReply) => {
                  if (cancelled) return
                  if (signal.id !== id) return
                  cancel()
                  clearTimeout(timeout)
                  if (!signal.success) {
                    reject(new Error(signal.error))
                    return
                  }
                  resolve(signal.result)
                },
              )
              this.bus.send<ServiceCall>({
                type: "call",
                service,
                id,
                name,
                args,
              })
              function timedOut() {
                cancelled = true
                cancel()
                reject(
                  new Error(`request.${service}: response time limit exceeded`),
                )
              }
            })
          }
        },
      },
    ) as Contract
  }
}

function randomId() {
  return Math.random().toString(36).slice(2)
}
