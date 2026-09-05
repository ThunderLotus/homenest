<template>
  <template v-if="isEditing && selected">
    <button
      class="fixed inset-0 z-40 cursor-default"
      aria-hidden="true"
      tabindex="-1"
      @click="clearSelection"
    />
    <div
      class="fixed inset-y-0 right-0 z-50 w-80 max-w-[85vw] overflow-y-auto border-l border-fg/10 bg-background shadow-xl p-4 space-y-5"
    >
      <div class="flex items-center justify-between">
        <h3 class="font-semibold">
          {{ panelTitle }}
        </h3>
        <button class="text-fg-dimmed hover:text-fg transition-colors" @click="clearSelection">
          ✕
        </button>
      </div>

      <!-- GLOBAL -->
      <template v-if="selected.kind === 'global' && draft">
        <label class="block space-y-1">
          <span class="text-sm">{{ t('editor.field.title') }}</span>
          <input v-model="editPageTitle" :class="inputClass">
        </label>

        <label class="block space-y-1">
          <span class="text-sm">{{ t('editor.field.theme') }}</span>
          <select v-model="draft.theme" :class="inputClass">
            <option v-for="theme in themes" :key="theme" :value="theme">
              {{ t(`editor.themes.${theme}`) }}
            </option>
          </select>
        </label>

        <label class="block space-y-1">
          <span class="text-sm">{{ t('editor.field.lang') }}</span>
          <select v-model="draft.lang" :class="inputClass">
            <option v-for="lang in langs" :key="lang" :value="lang">
              {{ lang }}
            </option>
          </select>
        </label>

        <label class="flex items-center gap-2">
          <input v-model="draft.checkUpdates" type="checkbox">
          <span class="text-sm">{{ t('editor.field.checkUpdates') }}</span>
        </label>

        <div class="pt-1 border-t border-fg/10">
          <label class="block space-y-1 mb-2">
            <span class="text-sm block font-medium">{{ t('editor.field.layoutMode.label') }}</span>
            <select
              :value="draft.layout.mode ?? 'grid'"
              :class="inputClass"
              @change="setLayoutMode(($event.target as HTMLSelectElement).value as 'grid' | 'vertical')"
            >
              <option value="grid">{{ t('editor.field.layoutMode.grid') }}</option>
              <option value="vertical">{{ t('editor.field.layoutMode.vertical') }}</option>
            </select>
          </label>
        </div>

        <div v-if="(draft.layout.mode ?? 'grid') === 'grid'" class="pt-1 border-t border-fg/10">
          <span class="text-sm block mb-2 font-medium">{{ t('editor.field.gridColumns') }}</span>
          <div class="grid grid-cols-2 gap-2">
            <label v-for="key in gridKeys" :key="key" class="block space-y-1">
              <span class="text-sm">{{ t(`editor.field.grid.${key}`) }}</span>
              <input
                :value="draft.layout.grid[key]"
                type="number"
                min="1"
                max="12"
                :class="inputClass"
                @input="setGridValue(key, targetValue($event))"
              >
            </label>
          </div>
        </div>

        <div class="pt-1 border-t border-fg/10">
          <span class="text-sm block mb-2 font-medium">{{ t('editor.field.style') }}</span>
          <EditorStyleFields
            :root="draft ?? {}"
            :title-path="['style', 'title']"
            :card-path="['style', 'card']"
            :group-path="['style', 'group']"
            :reset="{ label: t('editor.field.resetTheme'), handler: resetThemeStyle }"
          />
        </div>
      </template>

      <!-- GROUP -->
      <template v-else-if="selected.kind === 'group'">
        <label class="block space-y-1">
          <span class="text-sm">{{ t('editor.group.title') }}</span>
          <input
            v-model="editGroupTitle"
            :class="inputClass"
          >
        </label>

        <div class="pt-1 border-t border-fg/10">
          <span class="text-sm block mb-2 font-medium">{{ t('editor.field.style') }}</span>
          <EditorStyleFields
            :root="draft ?? {}"
            :title-path="groupStyleTitlePath"
            :card-path="groupStyleCardPath"
            :reset="{ label: t('editor.field.resetGroup'), handler: resetGroupStyle }"
          />
        </div>

        <button class="w-full px-3 py-1.5 rounded-lg text-sm text-red-500 border border-red-500/30 hover:bg-red-500/10 transition-colors" @click="removeGroup(selected.key)">
          {{ t('editor.group.delete') }}
        </button>
      </template>

      <!-- SERVICE -->
      <template v-else-if="selected.kind === 'service' && selectedService">
        <label class="block space-y-1">
          <span class="text-sm">{{ t('editor.field.title') }}</span>
          <input v-model="editServiceTitle" :class="inputClass">
        </label>

        <label class="block space-y-1">
          <span class="text-sm">{{ t('editor.field.description') }}</span>
          <textarea v-model="editServiceDescription" rows="2" :class="inputClass" />
        </label>

        <label class="block space-y-1">
          <span class="text-sm">{{ t('editor.field.link') }}</span>
          <input v-model="selectedService.link" :class="inputClass" @change="onLinkChange">
        </label>

        <label class="block space-y-1">
          <span class="text-sm">{{ t('editor.field.target') }}</span>
          <select v-model="selectedService.target" :class="inputClass">
            <option v-for="target in targets" :key="target" :value="target">
              {{ t(`editor.targets.${target}`) }}
            </option>
          </select>
        </label>

        <div>
          <span class="text-sm block mb-1">{{ t('editor.field.icon') }}</span>
          <div class="space-y-2">
            <EditorIconPicker
              :model-value="selectedService.icon?.name || ''"
              :url-value="selectedService.icon?.url || ''"
              :placeholder="t('editor.field.iconName')"
              :input-class="inputClass"
              :icon-color="selectedService.icon?.color || ''"
              :icon-stroke-width="selectedService.icon?.strokeWidth || 2"
              :icon-size="selectedService.icon?.size || 24"
              @update:model-value="onSelectIconName($event)"
              @select-url="onSelectIconUrl"
              @select-lucide="onSelectLucide"
            />
            <div class="flex gap-2">
              <input
                :value="selectedService.icon?.url || ''"
                :placeholder="t('editor.field.iconUrl')"
                :class="inputClass"
                @input="setIcon(selectedService, 'url', targetValue($event))"
              >
              <button
                class="shrink-0 px-2.5 py-1.5 rounded-lg text-sm border border-fg/20 hover:bg-fg/10 transition-colors flex items-center gap-1 disabled:opacity-50"
                :title="t('editor.icon.detect')"
                :disabled="detectingFavicon || (!selectedService?.link && !selectedService?.icon?.url)"
                @click="detectFavicon"
              >
                <Icon name="lucide:search" class="w-4 h-4" />
                <span v-if="detectingFavicon" class="animate-pulse">{{ t('editor.icon.detecting') }}</span>
              </button>
            </div>
            <p v-if="faviconError" class="text-xs text-red-500 px-1">
              {{ faviconError }}
            </p>
          </div>
        </div>

        <div>
          <span class="text-sm block mb-1">{{ t('editor.field.status') }}</span>
          <div class="space-y-2">
            <label class="flex items-center gap-2">
              <input
                type="checkbox"
                :checked="!!selectedService.status?.enabled"
                @change="setStatus(selectedService, 'enabled', targetChecked($event))"
              >
              <span class="text-sm">{{ t('editor.field.statusEnabled') }}</span>
            </label>
            <label class="flex items-center gap-2">
              <input
                type="number"
                min="1"
                :value="selectedService.status?.interval ?? 30"
                class="w-20 px-2 py-1 rounded-lg bg-fg/5 border border-fg/10 text-sm text-fg"
                @input="setStatus(selectedService, 'interval', targetValue($event) === '' ? undefined : Number(targetValue($event)))"
              >
              <span class="text-sm">{{ t('editor.field.statusInterval') }}</span>
            </label>
            <label class="flex items-center gap-2">
              <input
                type="checkbox"
                :checked="!!selectedService.status?.animation"
                @change="setStatus(selectedService, 'animation', targetChecked($event))"
              >
              <span class="text-sm">{{ t('editor.field.statusAnimation') }}</span>
            </label>
          </div>
        </div>

        <div v-if="draft?.tags?.length">
          <span class="text-sm block mb-1">{{ t('editor.field.tags') }}</span>
          <div class="flex flex-wrap gap-2">
            <label
              v-for="tag in draft.tags"
              :key="tag.name"
              class="flex items-center gap-1.5 text-sm cursor-pointer"
            >
              <input
                type="checkbox"
                :checked="selectedTagNames.includes(tag.name)"
                @change="toggleTag(selectedService, tag.name)"
              >
              {{ tag.name }}
            </label>
          </div>
        </div>

        <div v-if="registryFields.length">
          <span class="text-sm block mb-1">{{ t('editor.field.options') }}</span>
          <div class="space-y-2">
            <label v-for="field in registryFields" :key="field.key" class="block space-y-1">
              <span class="text-sm">{{ fieldLabel(field) }}</span>
              <input
                v-if="field.type === 'boolean'"
                type="checkbox"
                :checked="!!(selectedService.options?.[field.key] ?? field.default)"
                @change="setOption(selectedService, field.key, targetChecked($event))"
              >
              <input
                v-else-if="field.type === 'number'"
                type="number"
                :value="selectedService.options?.[field.key] ?? field.default ?? ''"
                :class="inputClass"
                @input="setOption(selectedService, field.key, targetValue($event) === '' ? undefined : Number(targetValue($event)))"
              >
              <select
                v-else-if="field.type === 'select'"
                :value="selectedService.options?.[field.key] ?? field.default ?? ''"
                :class="inputClass"
                @change="setOption(selectedService, field.key, targetValue($event))"
              >
                <option v-for="option in field.options" :key="String(option.value)" :value="option.value">
                  {{ optionLabel(field, option) }}
                </option>
              </select>
              <input
                v-else
                type="text"
                :value="selectedService.options?.[field.key] ?? field.default ?? ''"
                :class="inputClass"
                @input="setOption(selectedService, field.key, targetValue($event))"
              >
            </label>
          </div>
          <button
            v-if="selectedService.type === 'openweathermap' && selectedService.options?.city"
            class="w-full px-3 py-1.5 rounded-lg text-sm border border-fg/20 hover:bg-fg/10 transition-colors disabled:opacity-50"
            :disabled="citySearching"
            @click="searchCity"
          >
            {{ citySearching ? t('service.openweathermap.citySearching') : t('service.openweathermap.citySearch') }}
          </button>
          <button
            v-if="selectedService.type === 'openweathermap'"
            class="w-full px-3 py-1.5 rounded-lg text-sm border border-fg/20 hover:bg-fg/10 transition-colors disabled:opacity-50"
            :disabled="detecting"
            @click="detectCoords"
          >
            {{ detecting ? t('service.openweathermap.detecting') : t('service.openweathermap.detectCoords') }}
          </button>
          <p v-if="detectMessage" class="text-xs" :class="detectSuccess ? 'text-green-500' : 'text-red-500'">
            {{ detectMessage }}
          </p>
        </div>

        <div v-if="registrySecrets.length">
          <span class="text-sm block mb-1">{{ t('editor.field.secrets') }}</span>
          <div class="space-y-2">
            <label v-for="secret in registrySecrets" :key="secret" class="block space-y-1">
              <span class="text-sm">{{ secretLabel(secret) }}</span>
              <input
                type="password"
                autocomplete="off"
                :value="selectedService.secrets?.[secret] ?? ''"
                :placeholder="t('editor.field.secretPlaceholder')"
                :class="inputClass"
                @input="setSecret(selectedService, secret, targetValue($event))"
              >
            </label>
          </div>
        </div>

        <div class="pt-1 border-t border-fg/10">
          <span class="text-sm block mb-2 font-medium">{{ t('editor.field.style') }}</span>
          <EditorStyleFields
            :root="selectedService"
            :card-path="['style']"
            :group-title="serviceGroupTitle"
            :reset="{ label: t('editor.field.resetCard'), handler: resetServiceStyle }"
          />
        </div>

        <div class="flex gap-2 pt-2">
          <button
            class="flex-1 px-3 py-1.5 rounded-lg text-sm border border-fg/20 hover:bg-fg/10 transition-colors"
            @click="duplicateService(selected.groupKey, selected.serviceId)"
          >
            {{ t('editor.service.duplicate') }}
          </button>
          <button
            class="flex-1 px-3 py-1.5 rounded-lg text-sm text-red-500 border border-red-500/30 hover:bg-red-500/10 transition-colors"
            @click="removeService(selected.groupKey, selected.serviceId)"
          >
            {{ t('editor.service.delete') }}
          </button>
        </div>
      </template>
    </div>
  </template>
</template>

<script setup lang="ts">
import type { ServiceIcon } from '~/types/services'
import type { StyleCard, StyleGroup } from '~/types/style'
import { getActiveConfigName } from '~/plugins/settings'
import { getServiceDescriptor } from '~/utils/registry'
import { CARD_STYLE_DEFAULTS, GROUP_STYLE_DEFAULTS, STYLE_TITLE_DEFAULTS } from '~/utils/style'

const { t, locale, te } = useI18n()

const {
  isEditing,
  selected,
  draft,
  selectedGroup,
  selectedService,
  selectedTagNames,
  clearSelection,
  setGroupTitle,
  setGridValue,
  setLayoutMode,
  removeGroup,
  duplicateService,
  removeService,
  setIcon,
  setStatus,
  setOption,
  setSecret,
  toggleTag,
} = useEditor()

const editLang = computed(() => locale.value)
const baseLang = computed(() => draft.value?.baseLang || 'zh')
const isBaseLang = computed(() => editLang.value === baseLang.value)

function ensureSvcI18n(serviceId: string, lang: string) {
  if (!draft.value) {
    return {} as { title?: string, description?: string }
  }
  draft.value.i18n = draft.value.i18n || {}
  draft.value.i18n.services = draft.value.i18n.services || {}
  draft.value.i18n.services[serviceId] = draft.value.i18n.services[serviceId] || {}
  draft.value.i18n.services[serviceId][lang] = draft.value.i18n.services[serviceId][lang] || {}
  return draft.value.i18n.services[serviceId][lang]
}

function ensureGroupI18n(groupTitle: string) {
  if (!draft.value) {
    return {} as Record<string, string>
  }
  draft.value.i18n = draft.value.i18n || {}
  draft.value.i18n.groups = draft.value.i18n.groups || {}
  draft.value.i18n.groups[groupTitle] = draft.value.i18n.groups[groupTitle] || {}
  return draft.value.i18n.groups[groupTitle]
}

const editServiceTitle = computed({
  get() {
    const svc = selectedService.value
    if (!svc) {
      return ''
    }
    if (isBaseLang.value) {
      return svc.title ?? ''
    }
    return draft.value?.i18n?.services?.[svc.id]?.[editLang.value]?.title ?? svc.title ?? ''
  },
  set(val: string) {
    const svc = selectedService.value
    if (!svc) {
      return
    }
    if (isBaseLang.value) {
      svc.title = val
    } else {
      ensureSvcI18n(svc.id, editLang.value).title = val
    }
  },
})

const editServiceDescription = computed({
  get() {
    const svc = selectedService.value
    if (!svc) {
      return ''
    }
    if (isBaseLang.value) {
      return svc.description ?? ''
    }
    return draft.value?.i18n?.services?.[svc.id]?.[editLang.value]?.description ?? svc.description ?? ''
  },
  set(val: string) {
    const svc = selectedService.value
    if (!svc) {
      return
    }
    if (isBaseLang.value) {
      svc.description = val
    } else {
      ensureSvcI18n(svc.id, editLang.value).description = val
    }
  },
})

const editGroupTitle = computed({
  get() {
    const g = selectedGroup.value
    if (!g) {
      return ''
    }
    const base = g.title ?? ''
    if (isBaseLang.value) {
      return base
    }
    return draft.value?.i18n?.groups?.[base]?.[editLang.value] ?? base
  },
  set(val: string) {
    if (isBaseLang.value) {
      setGroupTitle(val)
    } else {
      const g = selectedGroup.value
      if (!g) {
        return
      }
      const base = g.title ?? ''
      ensureGroupI18n(base)[editLang.value] = val
    }
  },
})

const editPageTitle = computed({
  get() {
    if (!draft.value) {
      return ''
    }
    const base = draft.value.title ?? ''
    if (isBaseLang.value) {
      return base
    }
    return draft.value.i18n?.title?.[editLang.value] ?? base
  },
  set(val: string) {
    if (!draft.value) {
      return
    }
    if (isBaseLang.value) {
      draft.value.title = val
    } else {
      draft.value.i18n = draft.value.i18n || {}
      draft.value.i18n.title = draft.value.i18n.title || {}
      draft.value.i18n.title[editLang.value] = val
    }
  },
})

const inputClass = 'w-full px-2.5 py-1.5 rounded-lg bg-fg/5 border border-fg/10 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-brand-500'

// A Homarr pick sets the URL and clears the name so the card renders the
// CDN-hosted SVG (`ServiceBaseIcon` prefers `name` over `url`).

/** Delete a previously cached icon file when switching to a different icon. */
function deleteCachedIcon(icon: ServiceIcon | undefined): void {
  const url = icon?.url
  if (url?.startsWith('/api/icons/')) {
    const filename = url.slice('/api/icons/'.length)
    $fetch(`/api/icons/${filename}`, { method: 'DELETE' }).catch(() => {})
  }
}

/** Iconify pick — set name, clear old cached url icon. */
function onSelectIconName(name: string): void {
  const svc = selectedService.value
  if (!svc) {
    return
  }
  deleteCachedIcon(svc.icon)
  setIcon(svc, 'name', name)
  setIcon(svc, 'url', '')
}

function onSelectIconUrl(url: string): void {
  const svc = selectedService.value
  if (!svc) {
    return
  }
  deleteCachedIcon(svc.icon)
  setIcon(svc, 'url', url)
  setIcon(svc, 'name', '')
}

function onSelectLucide(data: { name: string, color: string, strokeWidth: number, size: number }): void {
  const svc = selectedService.value
  if (!svc) {
    return
  }
  deleteCachedIcon(svc.icon)
  setIcon(svc, 'name', data.name)
  setIcon(svc, 'url', '')
  setIcon(svc, 'color', data.color)
  setIcon(svc, 'strokeWidth', data.strokeWidth)
  setIcon(svc, 'size', data.size)
}

const detectingFavicon = ref(false)
const faviconError = ref('')
let faviconTimer: ReturnType<typeof setTimeout> | null = null

// After the user types a link, prefer to auto-discover the site's favicon —
// but only when no icon has been set manually yet.
function onLinkChange(): void {
  if (faviconTimer) {
    clearTimeout(faviconTimer)
  }
  faviconTimer = setTimeout(() => {
    const svc = selectedService.value
    if (!svc || svc.icon?.name || svc.icon?.url) {
      return
    }
    void detectFavicon()
  }, 400)
}

async function detectFavicon(): Promise<void> {
  const svc = selectedService.value
  if (!svc || detectingFavicon.value) {
    return
  }

  detectingFavicon.value = true
  faviconError.value = ''

  try {
    let sourceUrl = svc.icon?.url || ''

    if (!sourceUrl) {
      if (!svc.link) {
        return
      }
      const found = await $fetch<{ url: string | null }>('/api/favicon', {
        method: 'POST',
        body: { url: svc.link },
      })
      sourceUrl = found.url || ''
    }

    if (!sourceUrl) {
      faviconError.value = t('editor.icon.detectFailed')
      return
    }

    if (selectedService.value !== svc) {
      return
    }

    const { localUrl } = await $fetch<{ localUrl: string }>('/api/icons/save', {
      method: 'POST',
      body: { url: sourceUrl },
    })

    if (selectedService.value !== svc) {
      return
    }

    setIcon(svc, 'url', localUrl)
    setIcon(svc, 'name', '')
  } catch (e: any) {
    faviconError.value = e?.data?.statusMessage || t('editor.icon.detectFailed')
  } finally {
    detectingFavicon.value = false
  }
}

const targets = ['_self', '_blank', '_parent', '_top']
const themes = ['system', 'light', 'dark', 'deep', 'sepia', 'bluer']
const langs = ['en', 'zh']
const gridKeys = ['small', 'medium', 'large', 'xlarge'] as const

const groupStyleTitlePath = computed(() => ['style', 'group', (selectedGroup.value?.title ?? '') as string, 'title'])
const groupStyleCardPath = computed(() => ['style', 'group', (selectedGroup.value?.title ?? '') as string, 'card'])

/**
 * Title of the group a selected service belongs to — lets the card panel's
 * placeholders resolve the group card override it inherits from.
 */
const serviceGroupTitle = computed<string | undefined>(() => {
  const target = selected.value
  if (target?.kind !== 'service' || !draft.value) {
    return undefined
  }
  const group = draft.value.services.find((g) => (g as { _key?: string })._key === target.groupKey)
  return group?.title
})

// Reset buttons restore the inheritance chain one level up:
//  - card  -> clear the card's own overrides (group defaults apply)
//  - group -> clear the group's overrides (theme defaults apply)
//  - theme -> restore the theme's pre-built defaults
function resetServiceStyle(): void {
  const svc = selectedService.value
  if (!svc) {
    return
  }
  delete svc.style
}

function resetGroupStyle(): void {
  if (!draft.value?.style?.group) {
    return
  }
  const groupStyle = draft.value.style.group as Record<string, unknown>
  const title = selectedGroup.value?.title ?? ''
  if (groupStyle[title] !== undefined) {
    delete groupStyle[title]
  }
  if (Object.keys(groupStyle).length === 0) {
    delete draft.value.style.group
  }
}

function resetThemeStyle(): void {
  if (!draft.value) {
    return
  }
  const existing = draft.value.style ?? {}
  const overrides = existing.group ? { ...existing.group } : undefined
  if (overrides) {
    delete overrides.titleFontSize
    delete overrides.gap
  }
  draft.value.style = {
    ...existing,
    title: { ...STYLE_TITLE_DEFAULTS },
    card: { ...CARD_STYLE_DEFAULTS } as StyleCard,
    group: { ...(overrides ?? {}), ...GROUP_STYLE_DEFAULTS } as StyleGroup,
  }
}

const registryFields = computed(() => {
  const svc = selectedService.value
  return svc ? getServiceDescriptor(svc.type).fields : []
})

const registrySecrets = computed(() => {
  const svc = selectedService.value
  return svc ? getServiceDescriptor(svc.type).secretsFields : []
})

function fieldLabel(field: { key: string, label: string }): string {
  const svc = selectedService.value
  if (!svc) {
    return field.label
  }
  const key = `service.${svc.type || 'base'}.${field.key}`
  return te(key) ? t(key) : field.label
}

function optionLabel(field: { key: string }, option: { label: string, value: string | number }): string {
  const svc = selectedService.value
  if (!svc) {
    return option.label
  }
  const key = `service.${svc.type || 'base'}.${field.key}_${option.value}`
  return te(key) ? t(key) : option.label
}

function secretLabel(secret: string): string {
  const svc = selectedService.value
  if (!svc) {
    return secret
  }
  const key = `service.${svc.type || 'base'}.${secret}`
  return te(key) ? t(key) : secret
}

const detecting = ref(false)
const detectMessage = ref('')
const detectSuccess = ref(false)

async function detectCoords(): Promise<void> {
  const svc = selectedService.value
  if (!svc || detecting.value) {
    return
  }
  detecting.value = true
  detectMessage.value = ''
  detectSuccess.value = false
  try {
    const geo = await $fetch<{ lat: number, lon: number, place: string }>('/api/geo', {
      query: { lang: locale.value },
    })
    setOption(svc, 'lat', geo.lat)
    setOption(svc, 'lon', geo.lon)
    detectSuccess.value = true
    detectMessage.value = t('service.openweathermap.detectSuccess', { place: geo.place })
  } catch {
    detectSuccess.value = false
    detectMessage.value = t('service.openweathermap.detectFailed')
  } finally {
    detecting.value = false
  }
}

const citySearching = ref(false)

async function searchCity(): Promise<void> {
  const svc = selectedService.value
  if (!svc || citySearching.value) {
    return
  }
  const city = svc.options?.city
  if (!city) {
    return
  }
  citySearching.value = true
  detectMessage.value = ''
  detectSuccess.value = false
  try {
    const geo = await $fetch<{ lat: number, lon: number, place: string }>('/api/geo/city', {
      query: { q: city, id: svc.id, configName: getActiveConfigName() },
    })
    setOption(svc, 'lat', geo.lat)
    setOption(svc, 'lon', geo.lon)
    detectSuccess.value = true
    detectMessage.value = t('service.openweathermap.detectSuccess', { place: geo.place })
  } catch {
    detectSuccess.value = false
    detectMessage.value = t('service.openweathermap.cityNotFound', { city })
  } finally {
    citySearching.value = false
  }
}

const panelTitle = computed(() => {
  const target = selected.value
  if (!target) {
    return ''
  }
  if (target.kind === 'global') {
    return t('editor.globalSettings')
  }
  if (target.kind === 'group') {
    return t('editor.group.title')
  }
  const svc = selectedService.value
  return svc?.title || t('editor.service.title')
})
</script>
