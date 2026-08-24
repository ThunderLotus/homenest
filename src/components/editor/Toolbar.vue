<template>
  <div
    v-if="!isEditing"
    class="fixed top-4 right-16 z-50 flex items-center gap-2"
  >
    <div class="relative">
      <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-dimmed pointer-events-none" />
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="t('editor.searchCards')"
        class="h-9 w-56 rounded-full bg-fg/10 hover:bg-fg/15 border border-fg/10 text-fg text-sm pl-9 pr-8 outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-fg-dimmed"
      >
      <button
        v-if="searchQuery"
        type="button"
        class="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full text-fg-dimmed hover:text-fg hover:bg-fg/10 transition-colors"
        :aria-label="t('editor.clearSearch')"
        :title="t('editor.clearSearch')"
        @click="searchQuery = ''"
      >
        <Icon name="lucide:x" class="w-3.5 h-3.5" />
      </button>
    </div>

    <select
      :value="locale"
      :title="t('editor.field.lang')"
      class="h-9 rounded-full bg-fg/10 hover:bg-fg/15 border border-fg/10 text-fg text-sm pl-3 pr-2 cursor-pointer outline-none focus:ring-2 focus:ring-brand-500"
      @change="onLanguageChange"
    >
      <option value="zh">
        中文
      </option>
      <option value="en">
        English
      </option>
    </select>

    <select
      :value="themeValue"
      :title="t('editor.field.theme')"
      class="h-9 rounded-full bg-fg/10 hover:bg-fg/15 border border-fg/10 text-fg text-sm pl-3 pr-2 cursor-pointer outline-none focus:ring-2 focus:ring-brand-500"
      @change="onThemeChange"
    >
      <option v-for="th in themes" :key="th" :value="th">
        {{ t(`editor.themes.${th}`) }}
      </option>
    </select>

    <button
      class="w-9 h-9 rounded-full flex items-center justify-center bg-fg/10 hover:bg-fg/15 border border-fg/10 text-fg transition-colors"
      :title="t('editor.edit')"
      :aria-label="t('editor.edit')"
      @click="startEdit"
    >
      <Icon name="lucide:pencil" class="w-5 h-5" />
    </button>
  </div>

  <div
    v-else
    class="fixed inset-x-0 top-0 z-50 border-b border-fg/10 bg-background/80 backdrop-blur-md"
  >
    <div class="max-w-screen-2xl mx-auto px-4 py-2 flex items-center gap-3">
      <span class="text-sm font-medium">{{ t('editor.title') }}</span>

      <button
        class="px-2.5 py-1 rounded-lg text-sm bg-fg/10 hover:bg-fg/20 transition-colors"
        @click="addGroup"
      >
        {{ t('editor.addGroup') }}
      </button>

      <div class="relative">
        <button
          class="px-2.5 py-1 rounded-lg text-sm bg-fg/10 hover:bg-fg/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="!canAddService"
          @click="menuOpen = !menuOpen"
        >
          {{ t('editor.addService') }}
        </button>
        <div
          v-if="menuOpen"
          class="absolute top-full left-0 mt-1 w-48 rounded-xl border border-fg/10 bg-background shadow-lg p-1 flex flex-col"
        >
          <button
            v-for="desc in registryEntries"
            :key="desc.type"
            class="text-left px-3 py-1.5 rounded-lg text-sm hover:bg-fg/10 transition-colors"
            @click="onAddService(desc.type)"
          >
            {{ desc.label }}
          </button>
        </div>
      </div>

      <button
        class="px-2.5 py-1 rounded-lg text-sm bg-fg/10 hover:bg-fg/20 transition-colors"
        @click="selectGlobal"
      >
        {{ t('editor.global') }}
      </button>

      <div class="flex-1" />

      <span v-if="error" class="text-sm text-red-500">{{ error }}</span>

      <button
        class="px-3 py-1 rounded-lg text-sm border border-fg/20 hover:bg-fg/10 transition-colors disabled:opacity-50"
        :disabled="saving"
        @click="cancel"
      >
        {{ t('editor.cancel') }}
      </button>
      <button
        class="px-3 py-1 rounded-lg text-sm bg-fg text-background hover:opacity-80 transition-opacity disabled:opacity-50"
        :disabled="saving"
        @click="save"
      >
        {{ saving ? t('editor.saving') : t('editor.save') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CompleteConfig } from '~/types'
import { useDashboardSearch } from '~/composables/useDashboardSearch'
import { getActiveConfigName, refreshConfig, suppressNextConfigReload } from '~/plugins/settings'
import { serviceRegistry } from '~/utils/registry'

const { t, locale } = useI18n()
const { query: searchQuery } = useDashboardSearch()
const { isEditing, saving, error, enterEdit, cancel, save, addGroup, addService, select, selected } = useEditor()
const { $settings, $i18n } = useNuxtApp()
const colorMode = useColorMode()

const registryEntries = Object.values(serviceRegistry)
const menuOpen = ref(false)

const canAddService = computed(() => selected.value?.kind === 'group' || selected.value?.kind === 'service')

const themes = ['system', 'light', 'dark', 'deep', 'sepia', 'bluer'] as const

const themeValue = computed(() => $settings.theme || 'system')

async function onLanguageChange(event: Event) {
  const next = (event.target as HTMLSelectElement).value as 'en' | 'zh'

  // Instant UI switch without waiting for the config round-trip.
  await $i18n.setLocale(next)

  try {
    const name = getActiveConfigName()
    const config = await $fetch<CompleteConfig>(`/api/config/${name}`)
    config.lang = next
    suppressNextConfigReload()
    await $fetch(`/api/config/${name}`, { method: 'PUT', body: config })
    await refreshConfig()
  } catch {
    // Persistence failed (e.g. offline) — keep the visual change; the next
    // edit/save persists it anyway.
  }
}

async function onThemeChange(event: Event) {
  const next = (event.target as HTMLSelectElement).value as (typeof themes)[number]

  // Instant visual feedback without waiting for the config round-trip.
  colorMode.preference = next

  try {
    const name = getActiveConfigName()
    const config = await $fetch<CompleteConfig>(`/api/config/${name}`)
    config.theme = next
    // The config write broadcasts `config:update`; skip the redundant reload
    // and re-sync the reactive state in place (same pattern as the editor save).
    suppressNextConfigReload()
    await $fetch(`/api/config/${name}`, { method: 'PUT', body: config })
    await refreshConfig()
  } catch {
    // Persistence failed (e.g. offline) — keep the visual change; the next
    // edit/save persists it anyway.
  }
}

async function startEdit() {
  try {
    await enterEdit()
  } catch (e) {
    const err = e as { data?: { statusMessage?: string, message?: string }, message?: string }
    error.value = err?.data?.statusMessage || err?.data?.message || err?.message || 'Failed'
  }
}

function onAddService(type: string) {
  addService(type)
  menuOpen.value = false
}

function selectGlobal() {
  select({ kind: 'global' })
}
</script>
