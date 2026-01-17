export type StorageContract = {
  readonly collections: () => Promise<string[]>
  readonly set: <T>(args: {
    collection: string
    key: string
    value: T
  }) => Promise<boolean>
  readonly setAll: <T>(args: {
    collection: string
    entries: [string, T][]
  }) => Promise<number>
  readonly list: (args: { collection: string }) => Promise<string[]>
  readonly get: <T>(args: {
    collection: string
    key: string
  }) => Promise<T | undefined>
  readonly getAll: <T>(args: { collection: string }) => Promise<[string, T][]>
  readonly remove: (args: {
    collection: string
    key: string
  }) => Promise<boolean>
  readonly removeAll: (args: {
    collection: string
    keys: string[]
  }) => Promise<number>
  readonly drop: (args: { collection: string }) => Promise<boolean>
}
