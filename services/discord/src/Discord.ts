import { Bus } from "@skinjob/bus"
import type {
  ChannelMessageEvent,
  ChatMessageCommand,
  DirectMessageEvent,
  DiscordPlatform,
} from "@skinjob/chat"
import type { RichText } from "@skinjob/rich-text"
import { ThrottledQueue } from "@skinjob/throttled-queue"
import {
  ChannelType,
  Client,
  type CloseEvent,
  type Message,
  type OmitPartialGroupDMChannel,
  Partials,
} from "discord.js"
import { getBusText, renderRichText, splitMaxLength } from "./utilities"

export namespace Discord {
  export const start = startClient

  export type Options = {
    readonly throttle?: number
    readonly debug?: boolean
  }
}

const intents = [
  "Guilds",
  "GuildMessages",
  "MessageContent",
  "GuildMembers",
  "DirectMessages",
] as const

const partials = [Partials.Channel]

const MAX_MESSAGE_LENGTH = 2000

function startClient(
  token: string,
  { throttle, debug }: Discord.Options = {
    throttle: 1000,
  },
) {
  console.log("DISCORD: connecting")
  const send = new ThrottledQueue(throttle)
  const client = new Client({ intents, partials })
  client.on("clientReady", onClientReady)
  client.on("error", onError)
  client.on("shardError", onError)
  client.on("shardDisconnect", onShardDisconnect)
  client.on("warn", (message) => console.warn(`DISCORD: ${message}`))
  client.on("invalidated", onInvalidated)
  if (debug) client.on("debug", onDebug)
  Bus.receive("chat", "command", "message", onMessageCommand)
  return client.login(token)

  function onClientReady() {
    console.log("DISCORD: connected")
    client.on("messageCreate", onMessageCreate)
  }

  function onError(error: Error) {
    console.error("DISCORD: error", error)
    process.exit(1)
  }

  function onShardDisconnect({ code }: CloseEvent) {
    console.log(`DISCORD: shard disconnected (${code})`)
    process.exit(0)
  }

  function onInvalidated() {
    console.log("DISCORD: invalidated")
    process.exit(0)
  }

  function onDebug(message: string) {
    console.log(`DISCORD: ${message}`)
  }

  function onMessageCreate(
    create: OmitPartialGroupDMChannel<Message<boolean>>,
  ) {
    if (debug) {
      console.log(`DISCORD: onMessageCreate: ${JSON.stringify(create)}`)
    }
    if (create.channel.type === ChannelType.GuildText) {
      if (!create.guildId) throw new Error("Expected 'guildId'.")
      Bus.send<ChannelMessageEvent<DiscordPlatform>>({
        service: "chat",
        type: "event",
        name: "message",
        source: {
          type: "channel",
          platform: "discord",
          guildId: create.guildId,
          channelId: create.channel.id,
        },
        messageType: "channel",
        channel: create.channel.name,
        nick: create.member?.nickname ?? create.author.username,
        userId: create.author.id,
        isMine: create.author.id === client.user?.id,
        text: getBusText(create.cleanContent, create.attachments),
      })
    } else if (create.channel.type === ChannelType.DM) {
      Bus.send<DirectMessageEvent<DiscordPlatform>>({
        service: "chat",
        type: "event",
        name: "message",
        source: {
          type: "direct",
          platform: "discord",
          authorId: create.author.id,
        },
        messageType: "direct",
        nick: create.member?.nickname ?? create.author.username,
        userId: create.author.id,
        isMine: create.author.id === create.client.user.id,
        text: getBusText(create.cleanContent, create.attachments),
      })
    }
  }

  function onMessageCommand({ target, text, rich }: ChatMessageCommand) {
    if (target.platform !== "discord") {
      return
    }
    if (!text || text.trim() === "") {
      return
    }
    if (target.type === "channel") {
      const guild = client.guilds.resolve(target.guildId)
      if (!guild) throw new Error("Invalid guild ID.")
      const channel = guild.channels.resolve(target.channelId)
      if (!channel) throw new Error("Invalid channel ID.")
      if (channel.type !== ChannelType.GuildText)
        throw new Error("Invalid channel type.")
      const message = rich ? renderRichText(rich as RichText.Span) : text
      const payloads = splitMaxLength(message, MAX_MESSAGE_LENGTH)
      for (const payload of payloads) {
        send.push(() => channel.send(payload))
      }
    } else if (target.type === "direct") {
      const user = client.users.resolve(target.authorId)
      if (!user) throw new Error("Could not find user.")
      const message = rich ? renderRichText(rich as RichText.Span) : text
      const payloads = splitMaxLength(message, MAX_MESSAGE_LENGTH)
      for (const payload of payloads) {
        send.push(() => user.send(payload))
      }
    }
  }
}
