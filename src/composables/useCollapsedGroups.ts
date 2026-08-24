import { getActiveConfigName } from '~/plugins/settings'

/**
 * Collapsed-state of dashboard groups, persisted per config name.
 *
 * Primary store is the server (`data/preferences_<configName>.json`) so the
 * state follows the user across devices/browsers.  localStorage is kept as a
 * synchronous cache to avoid a flash of un-collapsed content before the
 * server response arrives.
 *
 * Module-level singleton: every Group / the dashboard title share one ref,
 * so toggling one group stays in sync with the collapse-all button.
 */
const collapsed = ref<string[]>([])

function storageKey(): string {
  return `homenest:collapsed:${getActiveConfigName()}`
}

function loadFromCache(): void {
  try {
    const raw = localStorage.getItem(storageKey())
    collapsed.value = raw ? JSON.parse(raw) : []
  } catch {
    collapsed.value = []
  }
}

function persistToCache(): void {
  try {
    localStorage.setItem(storageKey(), JSON.stringify(collapsed.value))
  } catch {
    // private mode / quota — collapse state simply won't persist
  }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null

function persistToServer(): void {
  if (saveTimer) {
    clearTimeout(saveTimer)
  }
  saveTimer = setTimeout(async () => {
    saveTimer = null
    try {
      await $fetch('/api/preferences', {
        method: 'PUT',
        body: { collapsed: collapsed.value },
      })
    } catch {
      // offline / 401 — cache still holds the latest state
    }
  }, 800)
}

async function loadFromServer(): Promise<void> {
  try {
    const prefs = await $fetch<{ collapsed?: string[] }>('/api/preferences')
    if (Array.isArray(prefs?.collapsed)) {
      collapsed.value = prefs.collapsed
      persistToCache()
    }
  } catch {
    // not logged in or request failed — keep cache value
  }
}

function load(): void {
  loadFromCache()
  if (import.meta.client) {
    loadFromServer()
  }
}

// Defer initial load: this module is lazy-imported by Nuxt auto-imports,
// so it may first execute while a component is hydrating.  Writing to
// collapsed.value at that point mutates an active render dependency,
// triggering "Maximum recursive updates".  setTimeout pushes load() to
// the next macrotask, well after hydration is complete.
if (import.meta.client) {
  setTimeout(load)
} else {
  load()
}

function persist(): void {
  persistToCache()
  if (import.meta.client) {
    persistToServer()
  }
}

export function useCollapsedGroups() {
  return {
    collapsed,
    isCollapsed: (name: string) => collapsed.value.includes(name),
    toggle: (name: string) => {
      collapsed.value = collapsed.value.includes(name)
        ? collapsed.value.filter((n) => n !== name)
        : [...collapsed.value, name]
      persist()
    },
    collapseAll: (names: string[]) => {
      collapsed.value = [...new Set(names)]
      persist()
    },
    expandAll: () => {
      collapsed.value = []
      persist()
    },
  }
}
