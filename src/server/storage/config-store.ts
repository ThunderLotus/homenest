import type { CompleteConfig } from '~/types'

/**
 * Platform-agnostic config storage abstraction.
 *
 * Business code (API routes, editor) talks to this interface only — never
 * to the filesystem directly.  Swapping the implementation lets the same
 * API run on a traditional server (fs), Vercel (Upstash/KV/Blob) or
 * Cloudflare (Workers KV/R2/D1) without changing a single route handler.
 */
export interface ConfigStore {
  /** Load the parsed config for `name`, falling back to defaults. */
  get: (name: string) => Promise<CompleteConfig>

  /** Monotonically increasing version stamp (mtime-based on fs). */
  getVersion: (name: string) => Promise<number>

  /** Persist `config` and return the reloaded, normalised copy. */
  update: (name: string, config: CompleteConfig) => Promise<CompleteConfig>

  /** Whether a config file exists on disk for `name`. */
  has: (name: string) => Promise<boolean>
}
