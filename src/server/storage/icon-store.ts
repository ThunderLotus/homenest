import type { Buffer } from 'node:buffer'
import type { StorageDriver } from './driver'

/**
 * Icon (binary asset) storage abstraction.
 *
 * Icons are downloaded from external URLs and cached locally so they
 * survive restarts and can be served from the same origin.
 */
export interface IconStore {
  /** Persist raw icon bytes under `filename`. */
  save: (filename: string, data: Buffer) => Promise<void>

  /** Load raw icon bytes, or `null` when not cached. */
  load: (filename: string) => Promise<Buffer | null>

  /** Remove a cached icon. No-op when the file does not exist. */
  delete: (filename: string) => Promise<void>
}

/**
 * Filesystem / KV-backed IconStore.
 */
export class DefaultIconStore implements IconStore {
  constructor(private driver: StorageDriver) {}

  private keyFor(filename: string): string {
    return `icons/${filename}`
  }

  async save(filename: string, data: Buffer): Promise<void> {
    await this.driver.setRaw(this.keyFor(filename), data)
  }

  async load(filename: string): Promise<Buffer | null> {
    return this.driver.getRaw(this.keyFor(filename))
  }

  async delete(filename: string): Promise<void> {
    await this.driver.delete(this.keyFor(filename))
  }
}
