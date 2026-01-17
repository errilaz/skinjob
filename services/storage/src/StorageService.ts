import { Service } from "@skinjob/service"
import * as File from "node:fs/promises"
import * as Path from "node:path"
import type { StorageContract } from "./StorageContract"
import { isValidFilename } from "./utilities"

export namespace StorageService {
  export const start = startService

  export type Options = {
    readonly serviceName?: string
    readonly path?: string
  }
}

type Database = { [collectionName: string]: Collection | undefined }
type Collection = { [key: string]: unknown }

const SUFFIX = ".collection.json"

async function startService(options?: StorageService.Options) {
  const serviceName = options?.serviceName ?? "storage"
  const basePath = Path.resolve(options?.path ?? `./data/${serviceName}`)
  const database: Database = {}
  await load()

  async function load() {
    const filenames = await File.readdir(basePath)
    for (const filename of filenames) {
      if (!filename.endsWith(SUFFIX)) {
        continue;
      }
      const file = Bun.file(Path.join(basePath, filename))
      const collectionName = filename.slice(0, filename.length - SUFFIX.length)
      const collection = await file.json() as Collection
      database[collectionName] = collection
    }
  }

  async function sync(collectionName: string, collection: Collection) {
    try {
      const tmpPath = Path.join(basePath, `${collectionName}.collection.tmp`)
      const path = Path.join(basePath, `${collectionName}${SUFFIX}`)
      await File.mkdir(basePath, { recursive: true })
      const file = Bun.file(tmpPath)
      file.write(JSON.stringify(collection))
      if (process.platform === "win32") {
        File.rm(path, { force: true })
      }
      File.rename(tmpPath, path)
    } catch (error) {
      console.error(error)
    }
  }

  function getCollection(collectionName: string) {
    let collection = database[collectionName]
    if (!collection) {
      if (!isValidFilename(collectionName)) {
        throw new Error(`Invalid collection name: "${collectionName}".`)
      }
      collection = database[collectionName] = {}
    }
    return collection
  }

  return Service.host<StorageContract>(serviceName, {
    async collections() {
      return Object.keys(database)
    },
    async set(args) {
      const collection = getCollection(args.collection)
      const existed = !!collection[args.key]
      collection[args.key] = args.value
      void sync(args.collection, collection)
      return existed
    },
    async setAll(args) {
      const collection = getCollection(args.collection)
      for (const [key, value] of args.entries) {
        collection[key] = value
      }
      void sync(args.collection, collection)
      return args.entries.length
    },
    async list(args) {
      const collection = database[args.collection]
      if (!collection) {
        return []
      }
      return Object.keys(collection)
    },
    async get<T>(args: { collection: string, key: string }) {
      const collection = database[args.collection]
      if (!collection) {
        return undefined
      }
      return collection[args.key] as T
    },
    async getAll<T>(args: { collection: string }) {
      const collection = database[args.collection]
      if (!collection) {
        return []
      }
      return Object.entries(collection) as [string, T][]
    },
    async remove(args) {
      const collection = database[args.collection]
      if (!collection) {
        return false
      }
      const existed = !!collection[args.key]
      delete collection[args.key]
      void sync(args.collection, collection)
      return existed
    },
    async removeAll(args) {
      const collection = database[args.collection]
      if (!collection) {
        return 0
      }
      let deleted = 0
      for (const key of args.keys) {
        if (collection[key]) {
          deleted++
        }
        delete collection[key]
      }
      void sync(args.collection, collection)
      return deleted
    },
    async drop(args) {
      const collection = database[args.collection]
      if (!collection) {
        return false
      }
      delete database[args.collection]
      const path = Path.join(basePath, `${args.collection}${SUFFIX}`)
      await File.rm(path, { force: true })
      return true
    },
  })
}
