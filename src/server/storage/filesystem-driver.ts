import type { Buffer } from 'node:buffer'
import type { StorageDriver } from './driver'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

/**
 * Filesystem-backed StorageDriver using Nitro's `useStorage('data')`.
 *
 * Suitable for self-hosted deployments (Docker, VPS, bare metal) where
 * the `data/` directory is a persistent volume.  This is the default
 * driver — no environment variables or extra dependencies required.
 */
export class FilesystemDriver implements StorageDriver {
  async get<T>(key: string): Promise<T | null> {
    const storage = useStorage('data')
    return storage.getItem<T>(key)
  }

  async set(key: string, value: unknown): Promise<void> {
    const storage = useStorage('data')
    await storage.setItem(key, value as any)
  }

  async delete(key: string): Promise<void> {
    const storage = useStorage('data')
    await storage.removeItem(key)
  }

  async has(key: string): Promise<boolean> {
    const storage = useStorage('data')
    return storage.hasItem(key)
  }

  async getRaw(key: string): Promise<Buffer | null> {
    const storage = useStorage('data')
    return storage.getItemRaw<Buffer>(key)
  }

  async setRaw(key: string, data: Buffer): Promise<void> {
    const storage = useStorage('data')
    await storage.setItemRaw(key, data)
  }

  async getVersion(key: string): Promise<number> {
    try {
      const file = path.resolve(process.cwd(), 'data', key)
      const stat = await fs.stat(file)
      return Math.floor(stat.mtimeMs)
    } catch {
      return 0
    }
  }
}
