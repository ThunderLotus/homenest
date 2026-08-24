import type { ConfigStore } from './config-store'
import type { StorageDriver } from './driver'
import type { CompleteConfig } from '~/types'
import { configFileNameFor, getConfig, getDefaultConfig, hasConfigFile, loadConfig, saveConfig, setConfig } from '~/server/utils/config'

const CONFIG_CACHE_TTL = 5_000

const configCache = new Map<string, { config: CompleteConfig, expires: number }>()

/**
 * Default ConfigStore backed by a StorageDriver.
 *
 * Delegates YAML parsing / Zod validation / secrets recovery to
 * `config.ts` (which itself reads through the same StorageDriver).
 * Version stamps come from `driver.getVersion` — mtime on fs, a
 * companion KV key on Vercel.
 *
 * A global TTL cache (5 s) sits in front of the driver so that
 * repeated reads within the same request (Cloudflare Workers) or
 * within the same function instance (Vercel) avoid redundant KV
 * round-trips.
 */
export class DefaultConfigStore implements ConfigStore {
  constructor(private driver: StorageDriver) {}

  async get(name: string): Promise<CompleteConfig> {
    const cached = configCache.get(name)
    if (cached && cached.expires > Date.now()) {
      return cached.config
    }

    let config = await getConfig(name)

    if (!config) {
      if (!await hasConfigFile(name)) {
        return getDefaultConfig()
      }
      config = await loadConfig(name)
      await setConfig(config, name)
    }

    configCache.set(name, { config, expires: Date.now() + CONFIG_CACHE_TTL })
    return config
  }

  async getVersion(name: string): Promise<number> {
    return this.driver.getVersion(configFileNameFor(name))
  }

  async update(name: string, config: CompleteConfig): Promise<CompleteConfig> {
    await saveConfig(name, config)
    const reloaded = await loadConfig(name)
    await setConfig(reloaded, name)
    configCache.set(name, { config: reloaded, expires: Date.now() + CONFIG_CACHE_TTL })
    return reloaded
  }

  async has(name: string): Promise<boolean> {
    return hasConfigFile(name)
  }
}
