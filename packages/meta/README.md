# skinjob

🚧 Preview Quality Software: Works On My Machine 🚧

### What is skinjob?

> Primarily a Bun-based **chat bot framework** but secretly a *"lightweight, hot-reloading local microservice supervisor and message bus"*

Skinjob:
1. Watches a directory for worker scripts, starts them, and reloads them when they change (or their dependencies change).
2. Provides helpers for communicating between them with events, commands, and remote function calls.
3. Provides utilities for creating platform-agnostic, strongly-typed chat bots.

## Intro

In lieu of proper documentation and scaffoling, a quick introduction: creating a Discord bot that responds to one trigger which uses the OpenAI SDK.

Add the meta-package, a chat protocol, and the AI utility to a new Bun project:

```sh
bun add skinjob @skinjob/discord @skinjob/ai
```

Add a `.env` file:

```.env
DISCORD_TOKEN=<your bot token>
OPENAI_API_KEY=<your api key>
```

Add `discord.worker.ts` to the project:

```ts
import { Discord } from "@skinjob/discord"

Discord.start(Bun.env.DISCORD_TOKEN as string)
```

Add `ai.worker.ts` to the project:

```ts
import { AIService } from "@skinjob/ai/service"

const apiKey = Bun.env.OPENAI_API_KEY as string
AIService.start({ apiKey })
```

You can also provide `baseURL` to use another service that supports the OpenAI SDK, such as OpenRouter.

Add `ai.trigger.worker.ts` to the project:

```ts
import { Chat } from "skinjob"
import { AI } from "@skinjob/ai"

const MODEL = "x-ai/grok-4-fast"

Chat.onMessage(
  Chat.Filter.prefix("!ai "),
  Chat.reply(async ({ text }) => {
    return await AI.chat({ content: text, model: MODEL })
  })
)
```

Then start the bot!

```sh
bunx skinjob
```

### Backlog

- [ ] Bugs
  - [ ] supervisor: make process cleanup reliable
  - [ ] supervisor: handle renames
- [ ] Signal Protocols
  - [x] Chat
  - [ ] Authz
- [ ] Chat Services
  - [x] discord
  - [x] telegram
  - [ ] irc
  - [ ] irccloud
  - [ ] slack
  - [ ] matrix
  - [ ] signal
- [ ] Plugins
  - [x] node.js workers
  - [ ] deno workers
- [ ] AI
  - [x] basic chat completions
- [ ] Services
  - [x] basic bridge
- [ ] Telegram
  - [ ] rich text support
  - [ ] audio messages
  - [ ] video messages
- [ ] Discord
  - [ ] images
  - [ ] audio attachments
- [ ] Chat Signal Protocol
  - [ ] revisit/refine signal and filter typings (take advantage of narrowing)
    - better platform-agnostic identifier types for users/channels/etc
  - [ ] image attachments
  - [ ] audio attachments
  - [ ] "actions" in irc sense
  - [ ] join, part, quit, kick, ban, topic, notice
  - [ ] edit, delete, pin/unpin
  - [ ] system messages
  - [ ] move rich text types (not functions) into protocol, improve typing
  - [ ] click signal, "buttons" in rich text
  - [ ] support maxMessageLength in RichText rendering
  - [ ] export helper for plain text maxMessageLength
  - [ ] common filters, per-platform/network, channel, userID
  - [ ] authz filters
  - [ ] platform capability detection (e.g. buttons)
  - [ ] platform policy detection (e.g. log retention)
- [ ] Supervisor
  - [ ] worker signals
  - [ ] pub/sub patterns (`topic/*`) - if possible, for protocol-specific narrowing
- [ ] Services
  - [ ] speech
  - [ ] voice
  - [ ] configuration
- [ ] Bridge
  - [ ] better handling of bot responses
- [ ] Chores
  - [ ] Use Bun catalogs
- [ ] Pipe Dreams
  - [ ] plugin: dotnet workers
  - [ ] plugin: python workers
  - [ ] plugin: ruby workers
  - [ ] plugin: golang workers
  - [ ] plugin: lua workers
