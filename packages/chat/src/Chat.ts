// biome-ignore-all lint/suspicious/noExplicitAny: intentional

import { Bus } from "@skinjob/bus"
import type { Middleware } from "@skinjob/compose"
import { listen as _listen } from "./listen"
import type { ChatMessageSource, ChatPlatform } from "./platforms"
import type {
  ChatMessageCommand,
  ChatMessageEvent,
  ChatSignal,
  ChatVoiceCommand,
  ChatVoiceEvent,
} from "./signals"

export type ChatMessageOptions = {
  readonly rich?: unknown
}

export namespace Chat {
  export const listen = _listen

  export const onMessage = listen<ChatMessageEvent>("event", "message")
  export const onVoice = listen<ChatVoiceEvent>("event", "voice")

  export function say<P extends ChatPlatform>(
    target: ChatMessageSource,
    text: string,
    options?: ChatMessageOptions,
  ) {
    Bus.send<ChatMessageCommand<P>>({
      service: "chat",
      type: "command",
      name: "message",
      target,
      text,
      ...options,
    })
  }

  export function voice<P extends ChatPlatform>(
    target: ChatMessageSource,
    voice: Uint8Array,
  ) {
    Bus.send<ChatVoiceCommand<P>>({
      service: "chat",
      type: "command",
      name: "voice",
      target,
      voice,
    })
  }

  export function reply<T extends ChatMessageEvent>(
    fn: (m: T) => any,
  ): Middleware<T, any> {
    return async (event) => {
      if (event.isMine) return
      const text = await Promise.resolve(fn(event))
      say(event.source, text)
    }
  }

  export namespace Filter {
    export type TextSignal = ChatSignal & { text: string }
    export type MineSignal = ChatSignal & { isMine: boolean }

    export function test<T>(test: (event: T) => boolean): Middleware<T, T> {
      return (event, next) => {
        if (next && test(event)) next(event)
      }
    }

    export function text<T extends TextSignal>(text: string): Middleware<T, T> {
      return (event, next) => {
        if (event.text !== text) return
        next?.(event)
      }
    }

    export function prop<S extends ChatSignal, P extends keyof S>(
      prop: P,
      value: S[P],
    ): Middleware<S, S> {
      return (event, next) => {
        if (event[prop] !== value) return
        next?.(event)
      }
    }

    export function citext<T extends TextSignal>(
      text: string,
    ): Middleware<T, T> {
      return (event, next) => {
        if (event.text?.toLowerCase() !== text.toLowerCase()) return
        next?.(event)
      }
    }

    export interface RegexProps {
      args: string[]
    }
    /** Filters to requests where "text" matches given regex. Results stored in event.args. */
    export function regex<I extends TextSignal, O extends I>(
      re: RegExp,
    ): Middleware<I, O & RegexProps> {
      return (event, next) => {
        const args = re.exec(event.text)
        if (!args) return
        next?.({ ...event, args } as unknown as O & RegexProps)
      }
    }

    export interface PrefixProps {
      prefix: string
    }
    /** Filters to requests where event.text begins with given string. Removes from event.text and stores in event.prefix. */
    export function prefix<I extends TextSignal, O extends I>(
      prefix: string,
    ): Middleware<I, O & PrefixProps> {
      return (event, next) => {
        if (!event.text || !event.text.startsWith(prefix)) return
        next?.({
          ...event,
          prefix,
          text: event.text.substring(prefix.length),
        } as unknown as O & PrefixProps)
      }
    }

    /** Filters to requests where event.text begins with given string (case-insensitive). Removes from event.text and stores in event.prefix. */
    export function ciprefix<I extends TextSignal, O extends I>(
      prefix: string,
    ): Middleware<I, O & PrefixProps> {
      return (event, next) => {
        if (
          !event.text ||
          !event.text.toLowerCase().startsWith(prefix.toLowerCase())
        )
          return
        next?.({
          ...event,
          prefix,
          text: event.text.substring(prefix.length),
        } as unknown as O & PrefixProps)
      }
    }

    export function mine<T extends MineSignal>(): Middleware<T, T> {
      return test(({ isMine }) => isMine)
    }

    export function notMine<T extends MineSignal>(): Middleware<T, T> {
      return test(({ isMine }) => !isMine)
    }
  }
}
