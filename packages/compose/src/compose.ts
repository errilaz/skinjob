// biome-ignore-all lint/suspicious/noExplicitAny: intentional

export type Next<Out> = (event: Out) => any | Promise<any>
export type Middleware<In, Out> = (
  event: In,
  next?: Next<Out>,
) => any | Promise<any>

/** Compose middlewares. Based on koa-compose. */
export function compose<T0, T1>(m1: Middleware<T0, T1>): Middleware<T0, T1>
export function compose<T0, T1, T2>(
  m1: Middleware<T0, T1>,
  m2: Middleware<T1, T2>,
): Middleware<T0, T2>
export function compose<T0, T1, T2, T3>(
  m1: Middleware<T0, T1>,
  m2: Middleware<T1, T2>,
  m3: Middleware<T2, T3>,
): Middleware<T0, T3>
export function compose<T0, T1, T2, T3, T4>(
  m1: Middleware<T0, T1>,
  m2: Middleware<T1, T2>,
  m3: Middleware<T2, T3>,
  m4: Middleware<T3, T4>,
): Middleware<T0, T4>
export function compose<T0, T1, T2, T3, T4, T5>(
  m1: Middleware<T0, T1>,
  m2: Middleware<T1, T2>,
  m3: Middleware<T2, T3>,
  m4: Middleware<T3, T4>,
  m5: Middleware<T4, T5>,
): Middleware<T0, T5>
export function compose<T0, T1, T2, T3, T4, T5, T6>(
  m1: Middleware<T0, T1>,
  m2: Middleware<T1, T2>,
  m3: Middleware<T2, T3>,
  m4: Middleware<T3, T4>,
  m5: Middleware<T4, T5>,
  m6: Middleware<T5, T6>,
): Middleware<T0, T6>
export function compose<T0, T1, T2, T3, T4, T5, T6, T7>(
  m1: Middleware<T0, T1>,
  m2: Middleware<T1, T2>,
  m3: Middleware<T2, T3>,
  m4: Middleware<T3, T4>,
  m5: Middleware<T4, T5>,
  m6: Middleware<T5, T6>,
  m7: Middleware<T6, T7>,
): Middleware<T0, T7>
export function compose<T0, T1, T2, T3, T4, T5, T6, T7, T8>(
  m1: Middleware<T0, T1>,
  m2: Middleware<T1, T2>,
  m3: Middleware<T2, T3>,
  m4: Middleware<T3, T4>,
  m5: Middleware<T4, T5>,
  m6: Middleware<T5, T6>,
  m7: Middleware<T6, T7>,
  m8: Middleware<T7, T8>,
): Middleware<T0, T8>
export function compose<T0, T1, T2, T3, T4, T5, T6, T7, T8, T9>(
  m1: Middleware<T0, T1>,
  m2: Middleware<T1, T2>,
  m3: Middleware<T2, T3>,
  m4: Middleware<T3, T4>,
  m5: Middleware<T4, T5>,
  m6: Middleware<T5, T6>,
  m7: Middleware<T6, T7>,
  m8: Middleware<T7, T8>,
  m9: Middleware<T8, T9>,
): Middleware<T0, T9>
export function compose<T0, T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(
  m1: Middleware<T0, T1>,
  m2: Middleware<T1, T2>,
  m3: Middleware<T2, T3>,
  m4: Middleware<T3, T4>,
  m5: Middleware<T4, T5>,
  m6: Middleware<T5, T6>,
  m7: Middleware<T6, T7>,
  m8: Middleware<T7, T8>,
  m9: Middleware<T8, T9>,
  m10: Middleware<T9, T10>,
): Middleware<T0, T10>
export function compose<T0, TN>(
  ...wares: Middleware<any, any>[]
): Middleware<T0, TN> {
  return (event, next) => {
    let index = -1
    return dispatch(event, 0)

    function dispatch(event: any, i: number): Promise<TN> {
      if (i <= index) {
        return Promise.reject(new Error("next() called multiple times"))
      }
      index = i
      const ware =
        i === wares.length ? (next as Middleware<any, any>) : wares[i]
      if (!ware) {
        return Promise.resolve(event)
      }
      try {
        return Promise.resolve(
          ware(event, (newEvent) => dispatch(newEvent, i + 1)),
        )
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}
