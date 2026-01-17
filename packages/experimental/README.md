# Experimental

## Bus

- worker events: `bus:event/workerStarted`, `bus:event/workerStopped`
- service discovery/zero-downtime
  - workers can opt in to heartbeats?
  - workers can opt in to queueing?
  - services associated with workers?
  - queueing via plugin?

## Chat

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
