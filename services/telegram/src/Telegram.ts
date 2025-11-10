import { Bus } from "@skinjob/bus"
import type {
  ChannelMessageEvent,
  ChannelVoiceEvent,
  ChatMessageCommand,
  DirectMessageEvent,
  DirectVoiceEvent,
  TelegramPlatform,
} from "@skinjob/chat"
import { Telegraf } from "telegraf"
import { message } from "telegraf/filters"
import type { User } from "telegraf/types"

export namespace Telegram {
  export const start = startClient

  export type Options = {
    readonly token: string
    readonly debug?: boolean
  }
}

function startClient({ token, debug }: Telegram.Options) {
  console.log("TELEGRAM: connecting")

  const client = new Telegraf(token)
  listenToClientEvents(client)
  client.launch()
  Bus.receive("chat", "command", "message", onMessageCommand)

  function onMessageCommand({ target, text }: ChatMessageCommand) {
    if (target.platform !== "telegram") {
      return
    }
    if (!text || text.trim() === "") {
      return
    }
    client.telegram.sendMessage(target.chatId, text)
  }

  function listenToClientEvents(client: Telegraf) {
    client.on(message("text"), ({ message }) => {
      if (debug)
        console.log(`TELEGRAM: message/text: ${JSON.stringify(message)}`)
      if (message.chat.type === "private") {
        Bus.send<DirectMessageEvent<TelegramPlatform>>({
          service: "chat",
          type: "event",
          name: "message",
          messageType: "direct",
          source: {
            platform: "telegram",
            type: "direct",
            userId: message.from.id,
            chatId: message.chat.id,
          },
          nick: getNick(message.from),
          userId: message.from.id.toString(),
          isMine: message.from.id === client.botInfo?.id,
          text: message.text,
        })
      } else if (
        message.chat.type === "group" ||
        message.chat.type === "supergroup"
      ) {
        Bus.send<ChannelMessageEvent<TelegramPlatform>>({
          service: "chat",
          type: "event",
          name: "message",
          messageType: "channel",
          source: {
            platform: "telegram",
            type: "channel",
            userId: message.from.id,
            chatId: message.chat.id,
          },
          channel: message.chat.title,
          nick: getNick(message.from),
          userId: message.from.id.toString(),
          isMine: message.from.id === client.botInfo?.id,
          text: message.text,
        })
      }
    })

    client.on(message("voice"), async ({ message }) => {
      if (debug)
        console.log(`TELEGRAM: message/voice: ${JSON.stringify(message)}`)
      const url = await client.telegram.getFileLink(message.voice.file_id)
      if (message.chat.type === "private") {
        Bus.send<DirectVoiceEvent<TelegramPlatform>>({
          service: "chat",
          type: "event",
          name: "voice",
          messageType: "direct",
          source: {
            platform: "telegram",
            type: "direct",
            userId: message.from.id,
            chatId: message.chat.id,
          },
          nick: getNick(message.from),
          userId: message.from.id.toString(),
          isMine: message.from.id === client.botInfo?.id,
          voice: url.href,
        })
      } else if (
        message.chat.type === "group" ||
        message.chat.type === "supergroup"
      ) {
        Bus.send<ChannelVoiceEvent<TelegramPlatform>>({
          service: "chat",
          type: "event",
          name: "voice",
          messageType: "channel",
          source: {
            platform: "telegram",
            type: "channel",
            userId: message.from.id,
            chatId: message.chat.id,
          },
          channel: message.chat.title,
          nick: getNick(message.from),
          userId: message.from.id.toString(),
          isMine: message.from.id === client.botInfo?.id,
          voice: url.href,
        })
      }
    })
  }
}

function getNick(user: User) {
  let name = user.first_name
  if (user.last_name) {
    name += ` ${user.last_name}`
  }
  return name
}
