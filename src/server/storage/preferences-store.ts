import type { StorageDriver } from './driver'

export interface UserPreferences {
  collapsed: string[]
}

/**
 * Per-config user preferences (collapsed groups, etc.).
 */
export interface PreferencesStore {
  load: (configName: string) => Promise<UserPreferences>
  save: (configName: string, prefs: UserPreferences) => Promise<void>
}

/**
 * Filesystem / KV-backed PreferencesStore.
 */
export class DefaultPreferencesStore implements PreferencesStore {
  constructor(private driver: StorageDriver) {}

  private keyFor(configName: string): string {
    return `preferences_${configName || 'default'}.json`
  }

  async load(configName: string): Promise<UserPreferences> {
    const value = await this.driver.get<unknown>(this.keyFor(configName))

    if (!value) {
      return { collapsed: [] }
    }

    try {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value
      return {
        collapsed: Array.isArray(parsed?.collapsed) ? parsed.collapsed : [],
      }
    } catch {
      return { collapsed: [] }
    }
  }

  async save(configName: string, prefs: UserPreferences): Promise<void> {
    await this.driver.set(this.keyFor(configName), prefs)
  }
}
