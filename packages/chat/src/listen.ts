// biome-ignore-all lint/suspicious/noExplicitAny: intentional

import { compose, type Middleware } from "@skinjob/compose"
import type { ChatSignal } from "./signals"
import { Bus } from "@skinjob/bus"

export function listen<S extends ChatSignal>(
  type: S["type"],
  name?: S["name"],
) {
  return listen

  function listen<T2>(m1: Middleware<S, T2>): void
  function listen<T2, T3>(m1: Middleware<S, T2>, m2: Middleware<T2, T3>): void
  function listen<T2, T3, T4>(
    m1: Middleware<S, T2>,
    m2: Middleware<T2, T3>,
    m3: Middleware<T3, T4>,
  ): void
  function listen<T2, T3, T4, T5>(
    m1: Middleware<S, T2>,
    m2: Middleware<T2, T3>,
    m3: Middleware<T3, T4>,
    m4: Middleware<T4, T5>,
  ): void
  function listen<T2, T3, T4, T5, T6>(
    m1: Middleware<S, T2>,
    m2: Middleware<T2, T3>,
    m3: Middleware<T3, T4>,
    m4: Middleware<T4, T5>,
    m5: Middleware<T5, T6>,
  ): void
  function listen<T2, T3, T4, T5, T6, T7>(
    m1: Middleware<S, T2>,
    m2: Middleware<T2, T3>,
    m3: Middleware<T3, T4>,
    m4: Middleware<T4, T5>,
    m5: Middleware<T5, T6>,
    m6: Middleware<T6, T7>,
  ): void
  function listen<T2, T3, T4, T5, T6, T7, T8>(
    m1: Middleware<S, T2>,
    m2: Middleware<T2, T3>,
    m3: Middleware<T3, T4>,
    m4: Middleware<T4, T5>,
    m5: Middleware<T5, T6>,
    m6: Middleware<T6, T7>,
    m7: Middleware<T7, T8>,
  ): void
  function listen<T2, T3, T4, T5, T6, T7, T8, T9>(
    m1: Middleware<S, T2>,
    m2: Middleware<T2, T3>,
    m3: Middleware<T3, T4>,
    m4: Middleware<T4, T5>,
    m5: Middleware<T5, T6>,
    m6: Middleware<T6, T7>,
    m7: Middleware<T7, T8>,
    m8: Middleware<T8, T9>,
  ): void
  function listen<T2, T3, T4, T5, T6, T7, T8, T9, T10>(
    m1: Middleware<S, T2>,
    m2: Middleware<T2, T3>,
    m3: Middleware<T3, T4>,
    m4: Middleware<T4, T5>,
    m5: Middleware<T5, T6>,
    m6: Middleware<T6, T7>,
    m7: Middleware<T7, T8>,
    m8: Middleware<T8, T9>,
    m9: Middleware<T9, T10>,
  ): void
  function listen<T2, T3, T4, T5, T6, T7, T8, T9, T10, T11>(
    m1: Middleware<S, T2>,
    m2: Middleware<T2, T3>,
    m3: Middleware<T3, T4>,
    m4: Middleware<T4, T5>,
    m5: Middleware<T5, T6>,
    m6: Middleware<T6, T7>,
    m7: Middleware<T7, T8>,
    m8: Middleware<T8, T9>,
    m9: Middleware<T9, T10>,
    m10: Middleware<T10, T11>,
  ): void
  function listen(
    ...wares: [Middleware<S, any>, ...Middleware<any, any>[]]
  ): void {
    const handler = compose(...(wares as [Middleware<any, any>]))
    Bus.receive("chat", type, name, (signal) => {
      handler(signal)
    })
  }
}
