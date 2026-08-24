<template>
  <div class="space-y-2">
    <div class="flex items-center gap-2">
      <div
        class="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg border border-fg/10 bg-fg/5 overflow-hidden"
      >
        <ServiceBaseIcon v-if="modelValue" :name="modelValue" :color="lucideColor" :stroke-width="lucideStrokeWidth" />
        <img v-else-if="urlValue" :src="urlValue" alt="" class="block h-full w-full">
        <span v-else class="text-xs text-fg-dimmed">–</span>
      </div>
      <input
        :value="modelValue"
        :placeholder="placeholder"
        :class="inputClass"
        @input="onManualInput"
      >
    </div>

    <button
      type="button"
      class="w-full px-3 py-1.5 rounded-lg text-sm border border-fg/20 hover:bg-fg/10 transition-colors"
      @click="toggle"
    >
      {{ openPicker ? t('editor.icon.close') : t('editor.icon.pick') }}
    </button>

    <div v-if="openPicker" class="border border-fg/10 rounded-xl bg-fg/5 p-2 space-y-2">
      <div class="flex gap-1">
        <button
          type="button"
          class="px-2 py-1 rounded-md text-xs border transition-colors"
          :class="mode === 'iconify' ? 'border-brand-500/40 bg-brand-500/10 text-brand-500' : 'border-fg/10 text-fg-dimmed hover:bg-fg/10'"
          @click="switchMode('iconify')"
        >
          {{ t('editor.icon.tabIconify') }}
        </button>
        <button
          type="button"
          class="px-2 py-1 rounded-md text-xs border transition-colors"
          :class="mode === 'homarr' ? 'border-brand-500/40 bg-brand-500/10 text-brand-500' : 'border-fg/10 text-fg-dimmed hover:bg-fg/10'"
          @click="switchMode('homarr')"
        >
          {{ t('editor.icon.tabHomarr') }}
        </button>
        <button
          type="button"
          class="px-2 py-1 rounded-md text-xs border transition-colors"
          :class="mode === 'lucide' ? 'border-brand-500/40 bg-brand-500/10 text-brand-500' : 'border-fg/10 text-fg-dimmed hover:bg-fg/10'"
          @click="switchMode('lucide')"
        >
          {{ t('editor.icon.tabLucide') }}
        </button>
      </div>

      <input
        ref="searchInput"
        v-model="query"
        :placeholder="t('editor.icon.search')"
        :class="inputClass"
      >

      <template v-if="mode === 'iconify'">
        <p v-if="loading" class="text-sm text-fg-dimmed px-1">
          {{ t('editor.icon.loading') }}
        </p>
        <p v-else-if="error" class="text-sm text-red-500 px-1">
          {{ error }}
        </p>
        <div v-else-if="shownIcons.length" class="grid grid-cols-6 gap-1 max-h-48 overflow-y-auto">
          <button
            v-for="icon in shownIcons"
            :key="icon"
            type="button"
            class="aspect-square flex items-center justify-center rounded-lg hover:bg-fg/10 transition-colors"
            :class="icon === modelValue ? 'ring-2 ring-brand-500' : ''"
            :title="icon"
            @click="onPick(icon)"
          >
            <Icon :name="icon" class="w-5 h-5" />
          </button>
        </div>
        <p v-else class="text-sm text-fg-dimmed px-1">
          {{ t('editor.icon.noResults') }}
        </p>
      </template>

      <template v-else-if="mode === 'homarr'">
        <div v-if="shownHomarr.length" class="grid grid-cols-6 gap-1 max-h-48 overflow-y-auto">
          <button
            v-for="icon in shownHomarr"
            :key="icon"
            type="button"
            class="aspect-square flex items-center justify-center rounded-lg hover:bg-fg/10 transition-colors"
            :class="urlValue === homarrUrl(icon) ? 'ring-2 ring-brand-500' : ''"
            :title="icon"
            @click="onPickHomarr(icon)"
          >
            <img :src="homarrUrl(icon)" alt="" loading="lazy" class="w-5 h-5">
          </button>
        </div>
        <p v-else class="text-sm text-fg-dimmed px-1">
          {{ t('editor.icon.noResults') }}
        </p>
        <div v-if="homarrLimit < homarrFiltered.length" class="text-center">
          <button
            type="button"
            class="px-3 py-1 rounded-md text-xs border border-fg/20 hover:bg-fg/10 transition-colors"
            @click="homarrLimit += 96"
          >
            {{ t('editor.icon.loadMore') }}
          </button>
        </div>
        <p class="text-xs text-fg-dimmed px-1">
          {{ t('editor.icon.homarrLicense') }}
        </p>
      </template>

      <template v-else>
        <p v-if="loading" class="text-sm text-fg-dimmed px-1">
          {{ t('editor.icon.loading') }}
        </p>
        <p v-else-if="error" class="text-sm text-red-500 px-1">
          {{ error }}
        </p>
        <div v-else-if="shownLucide.length" class="grid grid-cols-6 gap-1 max-h-48 overflow-y-auto">
          <button
            v-for="icon in shownLucide"
            :key="icon"
            type="button"
            class="aspect-square flex items-center justify-center rounded-lg hover:bg-fg/10 transition-colors"
            :class="icon === lucideSelected ? 'ring-2 ring-brand-500' : ''"
            :title="icon.replace('lucide:', '')"
            @click="onPickLucide(icon)"
          >
            <Icon :name="icon" class="w-5 h-5" :style="{ 'color': lucideColor || undefined, 'stroke-width': String(lucideStrokeWidth) }" />
          </button>
        </div>
        <p v-else class="text-sm text-fg-dimmed px-1">
          {{ t('editor.icon.noResults') }}
        </p>

        <div v-if="lucideSelected" class="space-y-2 border-t border-fg/10 pt-2">
          <div class="flex items-center gap-2">
            <span class="text-xs text-fg-dimmed w-20 shrink-0">{{ t('editor.icon.color') }}</span>
            <input
              v-model="lucideColor"
              type="color"
              class="w-8 h-8 rounded cursor-pointer bg-transparent border border-fg/10"
            >
            <input
              v-model="lucideColor"
              type="text"
              placeholder="#000000"
              class="flex-1 px-2 py-1 rounded-lg bg-fg/5 border border-fg/10 text-xs text-fg w-24"
            >
            <button
              v-if="lucideColor"
              type="button"
              class="text-xs text-fg-dimmed hover:text-fg px-1"
              @click="lucideColor = ''"
            >
              ×
            </button>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-fg-dimmed w-20 shrink-0">{{ t('editor.icon.strokeWidth') }}</span>
            <input
              v-model.number="lucideStrokeWidth"
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              class="flex-1 accent-brand-500"
            >
            <span class="text-xs text-fg w-8 text-right">{{ lucideStrokeWidth.toFixed(1) }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-fg-dimmed w-20 shrink-0">{{ t('editor.icon.iconSize') }}</span>
            <input
              v-model.number="lucideSize"
              type="range"
              min="16"
              max="64"
              step="2"
              class="flex-1 accent-brand-500"
            >
            <span class="text-xs text-fg w-8 text-right">{{ lucideSize }}px</span>
          </div>
          <div class="flex items-center justify-center py-1">
            <Icon
              :name="lucideSelected"
              :style="{ 'color': lucideColor || undefined, 'stroke-width': String(lucideStrokeWidth), 'width': `${lucideSize}px`, 'height': `${lucideSize}px` }"
            />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { HOMARR_ICONS } from '~/utils/homarrIcons'

withDefaults(
  defineProps<{
    modelValue?: string
    urlValue?: string
    placeholder?: string
    inputClass?: string
    iconColor?: string
    iconStrokeWidth?: number
    iconSize?: number
  }>(),
  {
    modelValue: '',
    urlValue: '',
    placeholder: '',
    inputClass: '',
    iconColor: '',
    iconStrokeWidth: 2,
    iconSize: 24,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'selectUrl': [url: string]
  'selectLucide': [data: { name: string, color: string, strokeWidth: number, size: number }]
}>()

const { t } = useI18n()

const openPicker = ref(false)
const mode = ref<'iconify' | 'homarr' | 'lucide'>('iconify')
const query = ref('')
const icons = ref<string[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const searchInput = ref<HTMLInputElement | null>(null)

const lucideSelected = ref('')
const lucideColor = ref('')
const lucideStrokeWidth = ref(2)
const lucideSize = ref(24)

const POPULAR_ICONS = [
  'simple-icons:github',
  'simple-icons:gitlab',
  'simple-icons:docker',
  'simple-icons:kubernetes',
  'simple-icons:nginx',
  'simple-icons:grafana',
  'simple-icons:homeassistant',
  'simple-icons:linux',
  'simple-icons:google',
  'simple-icons:microsoft',
  'simple-icons:apple',
  'simple-icons:amazon',
  'simple-icons:python',
  'simple-icons:nodejs',
  'simple-icons:react',
  'simple-icons:typescript',
  'mdi:home',
  'mdi:server',
  'mdi:cloud',
  'mdi:email',
  'mdi:web',
  'mdi:chart-box',
  'mdi:bell',
  'mdi:download',
  'mdi:music',
  'mdi:television',
  'mdi:leaf',
  'mdi:cog',
  'tabler:home',
  'tabler:server-2',
  'tabler:cloud',
  'tabler:database',
  'tabler:brand-docker',
  'tabler:device-tv',
  'tabler:music',
  'tabler:chart-dots',
  'tabler:bell',
  'tabler:leaf',
  'tabler:settings',
  'tabler:mail',
  'tabler:world',
  'tabler:cpu',
  'tabler:shield',
  'tabler:clock',
  'tabler:calendar',
  'ph:house',
  'ph:server',
  'ph:cloud',
  'ph:database',
  'ph:bell',
  'ph:gear',
  'ph:download',
  'ph:tv',
  'ph:music-notes',
  'ph:leaf',
  'ph:chart-line',
  'ph:envelope',
  'ph:globe',
  'lucide:home',
  'lucide:server',
  'lucide:cloud',
  'lucide:database',
  'lucide:settings',
  'lucide:bell',
  'lucide:download',
  'lucide:tv',
  'lucide:music',
  'lucide:leaf',
  'lucide:chart-line',
  'lucide:mail',
  'lucide:globe',
  'lucide:cpu',
  'lucide:shield',
  'carbon:home',
  'carbon:server',
  'carbon:database',
  'carbon:cloud',
  'carbon:settings',
  'carbon:bell',
  'carbon:download',
  'carbon:tv',
  'carbon:music',
  'carbon:leaf',
  'carbon:chart-line',
  'carbon:email',
  'carbon:globe',
  'carbon:cpu',
  'carbon:security',
  'heroicons:home-solid',
  'heroicons:server-solid',
  'heroicons:cloud-solid',
  'heroicons:database-solid',
  'heroicons:cog-6-tooth-solid',
  'heroicons:bell-solid',
  'heroicons:arrow-down-tray-solid',
  'heroicons:tv-solid',
  'heroicons:musical-note-solid',
  'heroicons:leaf-solid',
  'heroicons:chart-bar-solid',
  'heroicons:envelope-solid',
  'heroicons:globe-alt-solid',
  'heroicons:cpu-chip-solid',
  'heroicons:shield-check-solid',
  'material-symbols:home',
  'material-symbols:server',
  'material-symbols:cloud',
  'material-symbols:database',
  'material-symbols:settings',
  'material-symbols:notifications',
  'material-symbols:download',
  'material-symbols:tv',
  'material-symbols:music-note',
  'material-symbols:eco',
  'material-symbols:monitoring',
  'material-symbols:mail',
  'material-symbols:public',
  'material-symbols:memory',
  'material-symbols:shield',
]

const POPULAR_LUCIDE = [
  'lucide:home', 'lucide:server', 'lucide:cloud', 'lucide:database',
  'lucide:settings', 'lucide:bell', 'lucide:download', 'lucide:tv',
  'lucide:music', 'lucide:leaf', 'lucide:chart-line', 'lucide:mail',
  'lucide:globe', 'lucide:cpu', 'lucide:shield', 'lucide:clock',
  'lucide:calendar', 'lucide:star', 'lucide:heart', 'lucide:user',
  'lucide:users', 'lucide:folder', 'lucide:file', 'lucide:image',
  'lucide:video', 'lucide:link', 'lucide:search', 'lucide:globe-2',
  'lucide:menu', 'lucide:lock', 'lucide:key', 'lucide:eye',
  'lucide:edit', 'lucide:trash', 'lucide:plus', 'lucide:minus',
  'lucide:check', 'lucide:x', 'lucide:arrow-right', 'lucide:arrow-left',
  'lucide:arrow-up', 'lucide:arrow-down', 'lucide:github', 'lucide:twitter',
  'lucide:chrome', 'lucide:firefox', 'lucide:wifi', 'lucide:hard-drive',
  'lucide:monitor', 'lucide:smartphone', 'lucide:tablet', 'lucide:terminal',
  'lucide:code', 'lucide:bug', 'lucide:zap', 'lucide:palette',
  'lucide:brush', 'lucide:camera', 'lucide:mic', 'lucide:play',
  'lucide:pause', 'lucide:skip-forward', 'lucide:volume-2', 'lucide:shopping-cart',
  'lucide:credit-card', 'lucide:gift', 'lucide:map-pin', 'lucide:rocket',
]

const shownIcons = computed(() => (query.value.trim() ? icons.value : POPULAR_ICONS))

const shownLucide = computed(() => (query.value.trim() ? icons.value : POPULAR_LUCIDE))

const homarrFiltered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return q ? HOMARR_ICONS.filter((n) => n.toLowerCase().includes(q)) : HOMARR_ICONS
})
const homarrLimit = ref(96)
const shownHomarr = computed(() => homarrFiltered.value.slice(0, homarrLimit.value))

function homarrUrl(name: string): string {
  return `https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/${name}.svg`
}

let searchSeq = 0
let searchTimer: ReturnType<typeof setTimeout> | null = null

watch(query, (value) => {
  if (mode.value === 'homarr') {
    return
  }
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  if (!value.trim()) {
    searchSeq++
    icons.value = []
    loading.value = false
    error.value = null
    return
  }
  searchTimer = setTimeout(() => runSearch(value.trim()), 300)
})

async function runSearch(q: string) {
  const seq = ++searchSeq
  loading.value = true
  error.value = null
  try {
    const prefix = mode.value === 'lucide' ? `lucide:${q}` : q
    const data = await $fetch<{ icons?: string[] }>(
      `https://api.iconify.design/search?query=${encodeURIComponent(prefix)}&limit=48`,
    )
    if (seq !== searchSeq) {
      return
    }
    icons.value = data.icons ?? []
  } catch {
    if (seq !== searchSeq) {
      return
    }
    error.value = t('editor.icon.searchError')
  } finally {
    if (seq === searchSeq) {
      loading.value = false
    }
  }
}

function switchMode(next: 'iconify' | 'homarr' | 'lucide') {
  if (next === mode.value) {
    return
  }
  mode.value = next
  searchSeq++
  query.value = ''
  icons.value = []
  loading.value = false
  error.value = null
}

function onManualInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}

function onPick(icon: string) {
  emit('update:modelValue', icon)
}

function onPickHomarr(name: string) {
  emit('selectUrl', homarrUrl(name))
}

function onPickLucide(icon: string) {
  lucideSelected.value = icon
  emit('selectLucide', {
    name: icon,
    color: lucideColor.value,
    strokeWidth: lucideStrokeWidth.value,
    size: lucideSize.value,
  })
}

function toggle() {
  openPicker.value = !openPicker.value
  if (!openPicker.value) {
    searchSeq++
    query.value = ''
    icons.value = []
    loading.value = false
    error.value = null
  }
}

watch(openPicker, (open) => {
  if (open) {
    nextTick(() => searchInput.value?.focus())
  }
})
</script>
