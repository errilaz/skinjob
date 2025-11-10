# Chat Experimental

- s/service/namespace
- Turn everything into URLs


Bus signals

- `{namespace}:{type}?{name}`
- `irc.{network}:{type}/{name}`
- `chat:{type}/{name}`
- `ai:call/chat`

Chat peers

- `discord:direct/{id}`
- `discord:channel/{guildId}/{channelId}`
- `irc.freenode/{nick|channel}`
- `telegram:${chatId}`
