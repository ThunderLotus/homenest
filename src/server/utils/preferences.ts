import { usePreferencesStore } from '~/server/storage'

export interface UserPreferences {
  collapsed: string[]
}

export async function loadPreferences(configName: string): Promise<UserPreferences> {
  return usePreferencesStore().load(configName)
}

export async function savePreferences(configName: string, prefs: UserPreferences): Promise<void> {
  await usePreferencesStore().save(configName, prefs)
}
