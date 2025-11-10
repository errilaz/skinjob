import { Bus } from "@skinjob/bus"
import {
  Chat,
  type ChatMessageEvent,
  type ChatMessageSource,
  type ChatPlatform,
} from "@skinjob/chat"

export namespace Bridge {
  export const start = startBridge
}

function startBridge(sources: ChatMessageSource[]) {
  Bus.receive<ChatMessageEvent<ChatPlatform>>("chat", "event", "message", onEvent)

  function onEvent(event: ChatMessageEvent<ChatPlatform>) {
    if (event.isMine) {
      return
    }
    for (const source of sources) {
      if (!eventMatchesSource(event.source, source)) {
        continue
      }
      for (const target of sources) {
        if (eventMatchesSource(target, source)) {
          continue
        }
        Chat.say(target, bridgeMessage(event))
        console.log(`sending from ${event.source.platform} to ${target.platform}`)
      }
    }
  }
}

function bridgeMessage(event: ChatMessageEvent) {
  return `<${event.nick}> ${event.text}`
}

function eventMatchesSource(
  eventSource: ChatMessageSource,
  sourcePattern: ChatMessageSource,
) {
  for (const [key, value] of Object.entries(sourcePattern)) {
    if (Reflect.get(eventSource, key) !== value) {
      return false
    }
  }
  return true
}
