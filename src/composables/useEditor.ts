import type { CompleteConfig, Layout, Service, ServiceIcon, ServicesGroup, ServiceStatus } from '~/types'
import { getActiveConfigName, refreshConfig, resumeConfigReload, suppressNextConfigReload, suspendConfigReload } from '~/plugins/settings'
import { getServiceDescriptor } from '~/utils/registry'

export type EditTarget =
  | { kind: 'global' }
  | { kind: 'group', key: string }
  | { kind: 'service', groupKey: string, serviceId: string }

/** ServicesGroup extended with a client-only stable key used during editing. */
export interface DraftGroup extends ServicesGroup {
  _key: string
}

function uuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function createEditorState() {
  const isEditing = ref(false)
  const draft = ref<CompleteConfig | null>(null)
  const selected = ref<EditTarget | null>(null)
  const saving = ref(false)
  const error = ref<string | null>(null)

  const { $settings } = useNuxtApp()
  const colorMode = useColorMode()
  const { t, te } = useI18n()

  // The config being edited derives from the active config name (URL name for
  // admins, the signed-in user's own config otherwise), set by the settings
  // plugin. Multi-config navigation force-reloads the app, so reading it at
  // call time is always up to date.
  const configName = (): string => getActiveConfigName()

  // Live theme preview: apply draft.theme while editing so the user sees the
  // change immediately, without saving.
  watch(
    () => (isEditing.value ? draft.value?.theme : undefined),
    (theme) => {
      if (theme) {
        colorMode.preference = theme
      }
    },
  )

  const groupKeyOf = (group: ServicesGroup): string => (group as DraftGroup)._key

  function findGroup(key: string): DraftGroup | null {
    return (draft.value?.services.find((g) => groupKeyOf(g) === key) as DraftGroup | undefined) ?? null
  }

  async function enterEdit(): Promise<void> {
    if (isEditing.value) {
      return
    }

    try {
      const source = await $fetch<CompleteConfig>(`/api/config/${configName()}`)
      const clone: CompleteConfig = JSON.parse(JSON.stringify(source))
      clone.services.forEach((g) => ((g as DraftGroup)._key = uuid()))
      draft.value = clone
      selected.value = null
      error.value = null
      suspendConfigReload()
      isEditing.value = true
    } catch (e) {
      const err = e as { data?: { statusMessage?: string, message?: string }, message?: string }
      error.value = err?.data?.statusMessage || err?.data?.message || err?.message || 'Failed'
    }
  }

  function exitEdit(): void {
    isEditing.value = false
    draft.value = null
    selected.value = null
    // Revert the live theme preview back to the persisted value.
    colorMode.preference = $settings.theme || 'system'
    resumeConfigReload()
  }

  function cancel(): void {
    exitEdit()
  }

  async function save(): Promise<boolean> {
    if (!draft.value || saving.value) {
      return false
    }
    const problem = validateDraft()
    if (problem) {
      error.value = problem
      return false
    }
    saving.value = true
    error.value = null
    try {
      await $fetch(`/api/config/${configName()}`, { method: 'PUT', body: draft.value })
      // The server's watcher broadcasts `config:update` for this save; skip the
      // redundant reload and refresh the reactive state in place instead.
      suppressNextConfigReload()
      try {
        await refreshConfig()
      } catch {
        await reloadNuxtApp({ force: true })
        return true
      }
      exitEdit()
      return true
    } catch (e) {
      const err = e as { data?: { statusMessage?: string, message?: string }, message?: string }
      error.value = err?.data?.statusMessage || err?.data?.message || err?.message || 'Save failed'
      return false
    } finally {
      saving.value = false
    }
  }

  function select(target: EditTarget): void {
    selected.value = target
  }

  function clearSelection(): void {
    selected.value = null
  }

  // ----- groups -----
  function addGroup(): void {
    if (!draft.value) {
      return
    }
    const group: DraftGroup = { _key: uuid(), title: nextGroupTitle(), items: [] }
    draft.value.services.push(group)
    selected.value = { kind: 'group', key: group._key }
  }

  /** Pick a non-empty default title so a freshly added group is not blank. */
  function nextGroupTitle(): string {
    const existing = draft.value?.services.map((g) => g.title ?? '') ?? []
    let n = 1
    let candidate = 'New Group'
    while (existing.includes(candidate)) {
      n += 1
      candidate = `New Group ${n}`
    }
    return candidate
  }

  function removeGroup(key: string): void {
    if (!draft.value) {
      return
    }
    const idx = draft.value.services.findIndex((g) => groupKeyOf(g) === key)
    if (idx >= 0) {
      draft.value.services.splice(idx, 1)
    }
    if (selected.value?.kind === 'group' && selected.value.key === key) {
      selected.value = null
    }
  }

  const selectedGroup = computed<DraftGroup | null>(() => {
    if (selected.value?.kind !== 'group' || !draft.value) {
      return null
    }
    return findGroup(selected.value.key)
  })

  function setGroupTitle(value: string): void {
    const g = selectedGroup.value
    if (!g) {
      return
    }

    const next = value.trim() ? value.trim() : undefined
    const groupStyle = draft.value?.style?.group

    // Per-group style overrides are keyed by the group title; keep them
    // attached to the renamed group instead of orphaning the old key.
    if (groupStyle && typeof groupStyle === 'object') {
      const oldKey = g.title ?? ''
      const entry = (groupStyle as Record<string, unknown>)[oldKey]

      if (entry) {
        delete (groupStyle as Record<string, unknown>)[oldKey]
        ;(groupStyle as Record<string, unknown>)[next ?? ''] = entry
      }
    }

    g.title = next
  }

  function setGridValue(key: keyof Layout['grid'], raw: string): void {
    if (!draft.value) {
      return
    }
    const n = Number(raw)
    if (!raw || Number.isNaN(n)) {
      return
    }
    draft.value.layout.grid[key] = Math.max(1, Math.min(12, Math.round(n)))
  }

  function validateDraft(): string | null {
    const c = draft.value
    if (!c) {
      return null
    }
    for (const group of c.services) {
      for (const svc of group.items) {
        const desc = getServiceDescriptor(svc.type)
        for (const f of desc.fields) {
          if (!f.required) {
            continue
          }
          const v = svc.options?.[f.key]
          if (v === undefined || v === null || v === '') {
            const svcType = svc.type || 'base'
            const serviceLabel = svc.title
              || (te(`service.${svcType}.label`) ? t(`service.${svcType}.label`) : desc.label)
              || svc.type
              || t('editor.service.title')
            const fieldLabel = te(`service.${svcType}.${f.key}`) ? t(`service.${svcType}.${f.key}`) : f.label
            return t('editor.validation.requires', { service: serviceLabel, field: fieldLabel })
          }
        }
      }
    }
    return null
  }

  // ----- services -----
  function addService(type: string, groupKey?: string): void {
    if (!draft.value) {
      return
    }
    const desc = getServiceDescriptor(type)
    const svc: Service = {
      id: uuid(),
      title: desc.label,
      target: $settings.behaviour.target,
      tags: [],
      options: {},
    }
    if (type !== 'base') {
      svc.type = type
    }
    for (const f of desc.fields) {
      if (f.default !== undefined) {
        svc.options![f.key] = f.default
      }
    }

    // No `style` prefill: a fresh card inherits its effective style from the
    // group override -> theme card defaults cascade and only records a value
    // once the user edits one (reset restores that inheritance).

    let gKey = groupKey
    if (!gKey) {
      if (selected.value?.kind === 'group') {
        gKey = selected.value.key
      } else if (selected.value?.kind === 'service') {
        gKey = selected.value.groupKey
      }
    }
    const group = gKey ? findGroup(gKey) : null
    if (!group) {
      return
    }
    group.items.push(svc)
    selected.value = { kind: 'service', groupKey: group._key, serviceId: svc.id }
  }

  function removeService(groupKey: string, serviceId: string): void {
    if (!draft.value) {
      return
    }
    const group = findGroup(groupKey)
    if (!group) {
      return
    }
    const idx = group.items.findIndex((s) => s.id === serviceId)
    if (idx >= 0) {
      group.items.splice(idx, 1)
    }
    if (
      selected.value?.kind === 'service'
      && selected.value.groupKey === groupKey
      && selected.value.serviceId === serviceId
    ) {
      selected.value = null
    }
  }

  function duplicateService(groupKey: string, serviceId: string): void {
    if (!draft.value) {
      return
    }
    const group = findGroup(groupKey)
    if (!group) {
      return
    }
    const idx = group.items.findIndex((s) => s.id === serviceId)
    if (idx < 0) {
      return
    }
    const copy: Service = { ...group.items[idx], id: uuid() } as Service
    group.items.splice(idx + 1, 0, copy)
    selected.value = { kind: 'service', groupKey, serviceId: copy.id }
  }

  // ----- selectors -----
  const selectedService = computed<Service | null>(() => {
    const target = selected.value
    if (target?.kind !== 'service' || !draft.value) {
      return null
    }
    const group = findGroup(target.groupKey)
    return group?.items.find((s) => s.id === target.serviceId) ?? null
  })

  // ----- panel binding helpers (mutate the live draft object) -----
  function setIcon(service: Service, key: keyof ServiceIcon, value: string | number): void {
    if (value === '' || value === 0 || value === undefined) {
      const next = { ...(service.icon ?? {}) }
      delete next[key]
      service.icon = Object.keys(next).length ? (next as ServiceIcon) : undefined
      return
    }
    service.icon = { ...(service.icon ?? {}), [key]: value } as ServiceIcon
  }

  function setStatus(service: Service, key: keyof ServiceStatus, value: boolean | number | undefined): void {
    const next: Record<string, boolean | number> = { ...(service.status ?? {}) }
    if (value === undefined) {
      delete next[key]
    } else {
      next[key] = value
    }
    service.status = Object.keys(next).length ? (next as ServiceStatus) : undefined
  }

  function setOption(service: Service, key: string, value: unknown): void {
    const next = { ...(service.options ?? {}) }
    if (value === undefined || value === '') {
      delete next[key]
    } else {
      next[key] = value
    }
    service.options = Object.keys(next).length ? next : undefined
  }

  function setSecret(service: Service, key: string, value: string): void {
    if (!value) {
      service.secrets = null
      return
    }
    service.secrets = { ...(service.secrets ?? {}), [key]: value }
  }

  function toggleTag(service: Service, tagName: string): void {
    const names = (service.tags ?? []).map((t) => (typeof t === 'string' ? t : t.name))
    const next = names.includes(tagName) ? names.filter((n) => n !== tagName) : [...names, tagName]
    service.tags = next
  }

  const selectedTagNames = computed<string[]>(() => {
    const svc = selectedService.value
    if (!svc) {
      return []
    }
    return (svc.tags ?? []).map((t) => (typeof t === 'string' ? t : t.name))
  })

  return {
    isEditing,
    draft,
    selected,
    saving,
    error,
    enterEdit,
    exitEdit,
    cancel,
    save,
    select,
    clearSelection,
    addGroup,
    removeGroup,
    setGroupTitle,
    addService,
    removeService,
    duplicateService,
    setGridValue,
    selectedGroup,
    selectedService,
    setIcon,
    setStatus,
    setOption,
    setSecret,
    toggleTag,
    selectedTagNames,
  }
}

export const useEditor = createSharedComposable(createEditorState)
