import type { ConfigStore } from './config-store'
import type { StorageDriver } from './driver'
import type { IconStore } from './icon-store'
import type { PreferencesStore } from './preferences-store'
import type { UserStore } from './user-store'
import process from 'node:process'
import { DefaultConfigStore } from './default-config-store'
import { FilesystemDriver } from './filesystem-driver'
import { DefaultIconStore } from './icon-store'
import { DefaultPreferencesStore } from './preferences-store'
import { DefaultUserStore } from './user-store'
import { VercelKVDriver } from './vercel-kv-driver'

export * from './config-store'
export * from './default-config-store'
export * from './driver'
export * from './icon-store'
export * from './preferences-store'
export * from './user-store'

// ── driver singleton ──────────────────────────────────────────────

let driver: StorageDriver | null = null

/**
 * Singleton persistent storage driver.
 *
 * Auto-selects based on environment:
 *  - `KV_REST_API_URL` present → VercelKVDriver (Vercel KV / Upstash Redis)
 *  - otherwise                → FilesystemDriver (Nitro fs, `data/` dir)
 *
 * Override explicitly with `MAFL_STORAGE_DRIVER=filesystem|vercel-kv`.
 */
export function useStorageDriver(): StorageDriver {
  if (driver) {
    return driver
  }

  const explicit = process.env.MAFL_STORAGE_DRIVER
  const vercelEnv = process.env.KV_REST_API_URL

  if (explicit === 'vercel-kv' || (!explicit && vercelEnv)) {
    driver = new VercelKVDriver()
  } else {
    driver = new FilesystemDriver()
  }

  return driver
}

// ── store singletons ──────────────────────────────────────────────

let configStore: ConfigStore | null = null
let userStore: UserStore | null = null
let preferencesStore: PreferencesStore | null = null
let iconStore: IconStore | null = null

export function useConfigStore(): ConfigStore {
  configStore ??= new DefaultConfigStore(useStorageDriver())
  return configStore
}

export function useUserStore(): UserStore {
  userStore ??= new DefaultUserStore(useStorageDriver())
  return userStore
}

export function usePreferencesStore(): PreferencesStore {
  preferencesStore ??= new DefaultPreferencesStore(useStorageDriver())
  return preferencesStore
}

export function useIconStore(): IconStore {
  iconStore ??= new DefaultIconStore(useStorageDriver())
  return iconStore
}
