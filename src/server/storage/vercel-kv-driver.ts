import type { VercelKV } from '@vercel/kv'
import type { StorageDriver } from './driver'
import { Buffer } from 'node:buffer'

/**
 * Vercel KV-backed StorageDriver for serverless deployments.
 *
 * Uses `@vercel/kv` (Upstash Redis under the hood) for all persistent
 * data.  Binary assets (icons) are base64-encoded into KV — adequate
 * for typical favicon-sized images; switch to `@vercel/blob` if large
 * assets are needed.
 *
 * Version stamps are stored as a companion key (`__ver:<key>`) holding
 * `Date.now()`, updated on every `set`/`setRaw`/`delete`.  This gives
 * the same polling semantics as the fs mtime-based version.
 *
 * Activate by setting `KV_REST_API_URL` + `KV_REST_API_TOKEN` (Vercel
 * auto-injects these when a KV store is linked to the project).
 */
export class VercelKVDriver implements StorageDriver {
  private kv: Promise<VercelKV>

  constructor() {
    this.kv = import('@vercel/kv').then((m) => m.kv)
  }

  async get<T>(key: string): Promise<T | null> {
    const kv = await this.kv
    return kv.get<T>(key)
  }

  async set(key: string, value: unknown): Promise<void> {
    const kv = await this.kv
    await kv.set(key, value)
    await kv.set(this.versionKey(key), Date.now())
  }

  async delete(key: string): Promise<void> {
    const kv = await this.kv
    await kv.del(key)
    await kv.del(this.versionKey(key))
  }

  async has(key: string): Promise<boolean> {
    const kv = await this.kv
    const count = await kv.exists(key)
    return count > 0
  }

  async getRaw(key: string): Promise<Buffer | null> {
    const kv = await this.kv
    const encoded: string | null = await kv.get<string>(this.rawKey(key))
    if (!encoded) {
      return null
    }
    return Buffer.from(encoded, 'base64')
  }

  async setRaw(key: string, data: Buffer): Promise<void> {
    const kv = await this.kv
    await kv.set(this.rawKey(key), data.toString('base64'))
    await kv.set(this.versionKey(key), Date.now())
  }

  async getVersion(key: string): Promise<number> {
    const kv = await this.kv
    const version: number | null = await kv.get<number>(this.versionKey(key))
    return version ?? 0
  }

  private versionKey(key: string): string {
    return `__ver:${key}`
  }

  private rawKey(key: string): string {
    return `__raw:${key}`
  }
}
