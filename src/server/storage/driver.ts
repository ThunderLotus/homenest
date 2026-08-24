import type { Buffer } from 'node:buffer'

/**
 * Platform-agnostic persistent storage driver.
 *
 * All business code talks to this interface — never to `useStorage` or a
 * cloud SDK directly.  Swapping the implementation lets the same API run
 * on a traditional server (Nitro fs driver) or Vercel (KV + Blob) without
 * changing a single route handler.
 *
 * Keys are logical, forward-slash separated paths (e.g. `icons/abc.png`,
 * `users.json`, `config_foo.yml`).  Each driver maps them to its own
 * physical representation.
 */
export interface StorageDriver {
  /** Read a JSON-serialisable value, returning `null` when the key is absent. */
  get: <T>(key: string) => Promise<T | null>

  /** Write a JSON-serialisable value. */
  set: (key: string, value: unknown) => Promise<void>

  /** Remove a key.  No-op when the key does not exist. */
  delete: (key: string) => Promise<void>

  /** Whether a key exists. */
  has: (key: string) => Promise<boolean>

  /** Read raw bytes (icons, binary assets).  Returns `null` when absent. */
  getRaw: (key: string) => Promise<Buffer | null>

  /** Write raw bytes. */
  setRaw: (key: string, data: Buffer) => Promise<void>

  /**
   * Monotonically increasing version stamp for `key`.
   * On fs this is `floor(mtimeMs)`; on KV it is a stored counter.
   * Used by the config polling endpoint to detect external changes.
   */
  getVersion: (key: string) => Promise<number>
}
