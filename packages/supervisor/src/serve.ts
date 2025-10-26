import { pack, unpack } from "msgpackr"

export type ControlMessage = {
  readonly action: "subscribe" | "unsubscribe" | "dispatch"
  readonly signal: ControlSignal
}

export type ControlSignal = {
  readonly service: string
  readonly type: string
  readonly name?: string
}

export default function serve({
  verbose
}: {
  readonly verbose: boolean
} = {
  verbose: false
}) {
  const server = Bun.serve({
    port: 0,
    fetch(request, server) {
      if (verbose) {
        console.log(`BUS: HTTP ${request.method} ${request.url}`)
      }
      if (!server.upgrade(request, { data: undefined })) {
        return new Response("Upgrade failed!", { status: 500 })
      }
      if (verbose) {
        console.log("BUS: WS connected");
      }
      return
    },
    websocket: {
      message(ws, message) {
        const { action, signal } = unpack(
          message as Uint8Array,
        ) as ControlMessage
        const { service, type, name } = signal
        const topic =
          type === "event" || type === "command"
            ? `${service}/${type}/${name}`
            : `${service}/${type}`
        if (verbose) {
          console.log(`BUS: message: ${topic}`);
        }
        switch (action) {
          case "subscribe":
            ws.subscribe(topic)
            break
          case "unsubscribe":
            ws.unsubscribe(topic)
            break
          case "dispatch":
            server.publish(topic, pack(signal))
            break
        }
      },
    },
  })
  if (verbose) {
    console.log("BUS: server started")
  }
  return server
}
