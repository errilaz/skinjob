# skinjob

🚧 Preview Quality Software: Works On My Machine 🚧

### What is skinjob?

> Primarily a Bun-based **chat bot framework** but secretly a *"lightweight, hot-reloading local microservice supervisor and message bus"*

Skinjob:
1. Watches a directory for worker scripts, starts them, and reloads them when they change (or their dependencies change).
2. Provides helpers for communicating between them with events, commands, and remote function calls.
3. Provides protocols and utilities for creating platform-agnostic chat bots.

## Intro

In lieu of proper documentation and scaffoling, a quick introduction: creating a Discord bot that responds to one trigger which uses the OpenAI SDK.

Add the meta-package to a new Bun project:

`bun add skinjob`

Add a protocol:

`bun add @skinjob/discord`

Add a utility:

`bun add @skinjob/ai`

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

## TODO

### Features

- [x] Discord
- [ ] Support more discord features
- [ ] Telegram
- [ ] IRC/IRCCloud
- [ ] TTS/STT

### Hygiene

- [ ] Use bun catalogs
