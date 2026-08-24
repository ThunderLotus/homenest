import type { CompleteConfig, ServicesGroup } from '~/types'

export type ConfigUpdateHandler = (data?: { name?: string }) => any

let suppressReloadUntil = 0
let reloadSuspended = false

/**
 * Ask the next version-check to be skipped. Called right after the editor
 * saves, which refreshes `$services`/`$settings` in place — the polling
 * would otherwise detect the version bump and trigger a redundant refresh.
 */
export function suppressNextConfigReload(): void {
  suppressReloadUntil = Date.now() + 1500
}

/**
 * Pause all version polling. Called when entering edit mode so an external
 * change (another tab saving) doesn't clobber the draft.
 */
export function suspendConfigReload(): void {
  reloadSuspended = true
}

/**
 * Resume version polling. Called when exiting edit mode.
 */
export function resumeConfigReload(): void {
  reloadSuspended = false
}

// Keep a no-op handler for backward compat with code that passes it around.
export function createConfigReloadHandler(): ConfigUpdateHandler {
  return () => {}
}

export function getConfigReloadHandler(): ConfigUpdateHandler {
  return createConfigReloadHandler()
}

let activeConfigName = 'default'

export function getActiveConfigName(): string {
  return activeConfigName
}

export function setActiveConfigName(name: string): void {
  activeConfigName = name
}

let servicesRef: ServicesGroup[] | null = null
let settingsRef: Omit<CompleteConfig, 'services'> | null = null

/**
 * Re-fetch the active config and apply it to the? live reactive
 * `$services`/`$settings`, so a save no longer needs a full page reload.
 * Consumers that read those values inside computed/render will re-render.
 */
export async function refreshConfig(): Promise<void> {
  if (!servicesRef || !settingsRef) {
    return
  }

  const fresh = await $fetch<CompleteConfig>(`/api/config/${getActiveConfigName()}`)
  servicesRef.splice(0, servicesRef.length, ...fresh.services)

  const next: Omit<CompleteConfig, 'services'> = { ...fresh }
  delete (next as Partial<CompleteConfig>).services
  Object.assign(settingsRef, next)
}

/** Last seen version stamp; 0 = not yet fetched. */
let lastVersion = 0

/**
 * Poll the config version endpoint.  If the version changed (another tab or
 * user saved), re-fetch the full config via `refreshConfig`.
 */
async function checkConfigVersion(): Promise<void> {
  if (reloadSuspended || Date.now() < suppressReloadUntil) {
    return
  }
  if (!servicesRef || !settingsRef) {
    return
  }

  try {
    const { version } = await $fetch<{ version: number }>(`/api/config/${getActiveConfigName()}/version`)
    if (lastVersion && version !== lastVersion) {
      await refreshConfig()
    }
    lastVersion = version
  } catch {
    // Network error or auth expired — silently skip this round.
  }
}

export default defineNuxtPlugin(async () => {
  const route = useRoute()
  const authUser = useAuthUser()

  // Effective config name: only admins may address a named config via the URL;
  // everyone else is pinned to their own (admin -> config.yml, user ->
  // config_<username>.yml). Unauthenticated visitors (the /login page) get an
  // empty payload and skip the fetch entirely.
  const name = authUser.value?.role === 'admin'
    ? String(route.params.name ?? 'default')
    : (authUser.value?.configName ?? 'default')

  setActiveConfigName(name)

  if (!authUser.value) {
    return {
      provide: { services: [] as ServicesGroup[], settings: {} as Omit<CompleteConfig, 'services'>, reloadConfig: getConfigReloadHandler(), refreshConfig },
    }
  }

  const asyncData = await useFetch<CompleteConfig>(`/api/config/${name}`, {
    key: `active-config-${name}`,
  })
  const { services, ...settings } = asyncData.data.value!

  // Reactive so `refreshConfig()` can swap in a saved config in place and
  // consumers (v-for over `$services`, computed reads of `$settings`) re-render
  // without a full page reload.
  const reactiveServices = reactive(services)
  const reactiveSettings = reactive(settings)
  servicesRef = reactiveServices
  settingsRef = reactiveSettings

  // Seed the version stamp so the first poll doesn't trigger a refresh.
  try {
    const { version } = await $fetch<{ version: number }>(`/api/config/${name}/version`)
    lastVersion = version
  } catch {
    // If the version endpoint is unavailable (e.g. older server), polling
    // simply stays inactive — the app still works, just no auto-refresh.
  }

  // Poll on tab focus (cheap — one tiny GET per focus event).
  if (import.meta.client) {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        checkConfigVersion()
      }
    })

    // Background poll every 30s for near-real-time sync across tabs.
    const timer = setInterval(checkConfigVersion, 30_000)
    onNuxtReady(() => {
      // Clean up on app teardown (HMR / route leave).
      const nuxtApp = useNuxtApp()
      ;(nuxtApp.hook as any)('app:beforeUnmount', () => clearInterval(timer))
    })
  }

  const { params } = route
  watch(
    () => String(params.name ?? 'default'),
    (next) => {
      if (next === name) {
        return
      }

      setActiveConfigName(next)
      reloadNuxtApp({ force: true })
    },
  )

  return {
    provide: { services: reactiveServices, settings: reactiveSettings, reloadConfig: getConfigReloadHandler(), refreshConfig },
  }
})
