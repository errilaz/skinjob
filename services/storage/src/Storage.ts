import { Service } from "@skinjob/service"
import type { StorageContract } from "./StorageContract"

export const Storage = Service.client<StorageContract>("storage", 10_000)

export function createStorageClient(
  serviceName: string,
  requestTimeout?: number,
) {
  return Service.client<StorageContract>(serviceName, requestTimeout)
}
