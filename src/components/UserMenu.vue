<template>
  <div v-if="!isEditing" class="fixed top-4 right-4 z-40">
    <button
      type="button"
      class="w-9 h-9 rounded-full flex items-center justify-center bg-fg/10 border border-fg/10 overflow-hidden text-fg transition-colors"
      :title="t('user.menu')"
      :aria-label="t('user.menu')"
      @click="menuOpen = !menuOpen"
    >
      <UserAvatar v-if="user" :user="user" size="md" />
      <Icon v-else name="lucide:circle-user" class="w-5 h-5" />
    </button>

    <div v-if="menuOpen">
      <button
        class="fixed inset-0 z-40 cursor-default"
        aria-hidden="true"
        tabindex="-1"
        @click="menuOpen = false"
      />
      <div class="absolute right-0 top-full mt-2 w-60 z-50 rounded-xl border border-fg/10 bg-background shadow-lg p-1 flex flex-col">
        <div class="px-3 py-2 border-b border-fg/10">
          <p class="text-sm font-medium truncate">
            {{ user?.username }}
          </p>
          <p class="text-xs text-fg-dimmed truncate">
            {{ user?.role === 'admin' ? t('auth.roleAdmin') : t('auth.roleUser') }}
          </p>
        </div>

        <button
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm hover:bg-fg/10 transition-colors text-left"
          @click="openProfile"
        >
          <Icon name="lucide:user-cog" class="w-4 h-4" />
          {{ t('user.profile') }}
        </button>

        <NuxtLink
          v-if="user?.role === 'admin'"
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm hover:bg-fg/10 transition-colors text-left"
          to="/admin/users"
          @click="menuOpen = false"
        >
          <Icon name="lucide:users" class="w-4 h-4" />
          {{ t('user.users') }}
        </NuxtLink>

        <button

          class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition-colors text-left"
          @click="onLogout"
        >
          <Icon name="lucide:log-out" class="w-4 h-4" />
          {{ t('user.logout') }}
        </button>
      </div>
    </div>

    <div v-if="profileOpen" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40" @click="profileOpen = false" />
      <div class="relative w-full max-w-md rounded-2xl border border-fg/10 bg-background shadow-xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">
            {{ t('user.profileTitle') }}
          </h2>
          <button
            class="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-fg/10 transition-colors text-fg-dimmed"
            :aria-label="t('user.close')"
            @click="profileOpen = false"
          >
            <Icon name="lucide:x" class="w-4 h-4" />
          </button>
        </div>

        <section class="space-y-4">
          <h3 class="text-sm font-semibold text-fg-dimmed uppercase tracking-wide">
            {{ t('user.avatar') }}
          </h3>

          <div class="flex items-center gap-4">
            <UserAvatar :user="previewUser" size="lg" />
            <button
              class="px-4 py-2 rounded-lg text-sm border border-fg/20 hover:bg-fg/10 transition-colors"
              @click="fileInput?.click()"
            >
              <Icon name="lucide:upload" class="w-4 h-4 inline -mt-0.5 mr-1.5" />
              {{ t('user.avatarUpload') }}
            </button>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="onPickFile"
            >
          </div>

          <div class="space-y-2">
            <span class="text-sm">{{ t('user.avatarPickStyle') }}</span>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="style in avatarStyles"
                :key="style"
                class="px-2.5 py-1 rounded-lg text-xs border transition-colors"
                :class="draftAvatarStyle === style
                  ? 'border-brand-500 bg-brand-500/10 text-brand-500'
                  : 'border-fg/10 text-fg-dimmed hover:bg-fg/10'"
                @click="onPickStyle(style)"
              >
                {{ t(`user.avatarStyle.${style}`) }}
              </button>
            </div>
          </div>

          <div v-if="draftAvatarStyle" class="space-y-3">
            <div class="grid grid-cols-6 gap-2 p-2 rounded-lg border border-fg/5 bg-fg/5">
              <button
                v-for="seed in avatarSeeds"
                :key="seed"
                class="aspect-square rounded-lg overflow-hidden border-2 transition-colors"
                :class="draftAvatarSeed === seed
                  ? 'border-brand-500'
                  : 'border-transparent hover:border-fg/20'"
                @click="onPickSeed(seed)"
              >
                <img
                  :src="`/api/avatar/preview?style=${draftAvatarStyle}&seed=${seed}${draftAvatarBgColor ? `&bgColor=${draftAvatarBgColor}` : ''}`"
                  :alt="seed"
                  class="w-full h-full object-cover"
                  loading="lazy"
                >
              </button>
            </div>

            <div class="space-y-3 pt-1 border-t border-fg/5">
              <div class="flex items-center gap-3">
                <span class="text-sm w-24 shrink-0">{{ t('user.avatarBgColor') }}</span>
                <input
                  v-model="draftAvatarBgColorPicker"
                  type="color"
                  class="w-8 h-8 rounded cursor-pointer bg-transparent border border-fg/10"
                >
                <input
                  v-model="draftAvatarBgColorHex"
                  type="text"
                  placeholder="transparent"
                  class="flex-1 px-2 py-1 rounded-lg bg-fg/5 border border-fg/10 text-sm text-fg w-24"
                >
                <button
                  v-if="draftAvatarBgColor"
                  type="button"
                  class="text-xs text-fg-dimmed hover:text-fg px-1"
                  @click="draftAvatarBgColor = ''"
                >
                  ×
                </button>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-sm w-24 shrink-0">{{ t('user.avatarRadius') }}</span>
                <input
                  v-model.number="draftAvatarRadiusPct"
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  class="flex-1 accent-brand-500"
                >
                <span class="text-xs text-fg w-10 text-right">{{ draftAvatarRadiusPct }}%</span>
              </div>
            </div>
          </div>

          <label class="block space-y-1.5">
            <span class="text-sm">{{ t('user.avatarUrl') }}</span>
            <input
              v-model="draftAvatarUrl"
              type="url"
              class="w-full px-3 py-2 rounded-lg bg-fg/5 border border-fg/10 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-brand-500"
              :placeholder="t('user.avatarUrlPlaceholder')"
            >
          </label>

          <p v-if="avatarError" class="text-sm text-red-500">
            {{ avatarError }}
          </p>

          <div class="flex gap-2.5">
            <button
              class="px-4 py-2 rounded-lg text-sm bg-fg text-background hover:opacity-80 transition-opacity disabled:opacity-60"
              :disabled="savingAvatar"
              @click="onSaveAvatar"
            >
              {{ t('user.save') }}
            </button>
            <button
              class="px-4 py-2 rounded-lg text-sm border border-fg/20 hover:bg-fg/10 transition-colors disabled:opacity-60"
              :disabled="savingAvatar || (!draftAvatarUrl && !draftAvatarStyle)"
              @click="onClearAvatar"
            >
              {{ t('user.clearAvatar') }}
            </button>
          </div>
        </section>

        <div class="border-t border-fg/10" />

        <section class="space-y-4">
          <h3 class="text-sm font-semibold text-fg-dimmed uppercase tracking-wide">
            {{ t('user.username') }}
          </h3>

          <label class="block space-y-1.5">
            <span class="text-sm">{{ t('user.username') }}</span>
            <input
              v-model="draftUsername"
              type="text"
              class="w-full px-3 py-2 rounded-lg bg-fg/5 border border-fg/10 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-brand-500"
              :placeholder="t('user.usernamePlaceholder')"
            >
          </label>

          <button
            class="px-4 py-2 rounded-lg text-sm bg-fg text-background hover:opacity-80 transition-opacity disabled:opacity-60"
            :disabled="!draftUsername || draftUsername === user?.username || saving"
            @click="onSaveUsername"
          >
            {{ t('user.save') }}
          </button>
        </section>

        <div class="border-t border-fg/10" />

        <section class="space-y-4">
          <h3 class="text-sm font-semibold text-fg-dimmed uppercase tracking-wide">
            {{ t('user.changePassword') }}
          </h3>

          <label class="block space-y-1.5">
            <span class="text-sm">{{ t('user.currentPassword') }}</span>
            <input
              v-model="currentPassword"
              type="password"
              class="w-full px-3 py-2 rounded-lg bg-fg/5 border border-fg/10 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
          </label>

          <label class="block space-y-1.5">
            <span class="text-sm">{{ t('user.newPassword') }}</span>
            <input
              v-model="newPassword"
              type="password"
              class="w-full px-3 py-2 rounded-lg bg-fg/5 border border-fg/10 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
          </label>

          <p v-if="passwordError" class="text-sm text-red-500">
            {{ passwordError }}
          </p>

          <button
            class="px-4 py-2 rounded-lg text-sm bg-fg text-background hover:opacity-80 transition-opacity disabled:opacity-60"
            :disabled="!currentPassword || !newPassword || saving"
            @click="onSavePassword"
          >
            {{ t('user.updatePassword') }}
          </button>
        </section>

        <div class="border-t border-fg/10" />

        <section class="space-y-3">
          <h3 class="text-sm font-semibold text-fg-dimmed uppercase tracking-wide">
            {{ t('user.sitesData') }}
          </h3>

          <a
            class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm border border-fg/20 hover:bg-fg/10 transition-colors"
            :href="`/api/config/export/${user?.username}`"
          >
            <Icon name="lucide:download" class="w-4 h-4" />
            {{ t('user.exportSites') }}
          </a>

          <div class="flex gap-2.5">
            <button
              class="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm border border-fg/20 hover:bg-fg/10 transition-colors disabled:opacity-50"
              :disabled="importing"
              @click="pickImport('append')"
            >
              <Icon name="lucide:plus" class="w-4 h-4" />
              {{ t('user.importAppend') }}
            </button>
            <button
              class="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm border border-fg/20 hover:bg-fg/10 transition-colors disabled:opacity-50"
              :disabled="importing"
              @click="pickImport('overwrite')"
            >
              <Icon name="lucide:upload" class="w-4 h-4" />
              {{ t('user.importOverwrite') }}
            </button>
          </div>

          <input
            ref="importInput"
            type="file"
            accept=".json,application/json"
            class="hidden"
            @change="onImportFile"
          >

          <p v-if="importMessage" class="text-sm" :class="importError ? 'text-red-500' : 'text-emerald-600'">
            {{ importMessage }}
          </p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AuthUser } from '~/composables/useAuth'
import { refreshConfig, suppressNextConfigReload } from '~/plugins/settings'

const { isEditing } = useEditor()
const { t } = useI18n()
const user = useAuthUser()

const menuOpen = ref(false)
const profileOpen = ref(false)
const saving = ref(false)

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') {
    if (profileOpen.value) {
      profileOpen.value = false
    } else if (menuOpen.value) {
      menuOpen.value = false
    }
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

const draftUsername = ref('')
const currentPassword = ref('')
const newPassword = ref('')
const passwordError = ref('')

const draftAvatarUrl = ref('')
const draftAvatarStyle = ref('')
const draftAvatarSeed = ref('')
const savingAvatar = ref(false)
const avatarError = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

const importing = ref(false)
const importError = ref(false)
const importMessage = ref('')
const importInput = ref<HTMLInputElement | null>(null)
let importMode: 'append' | 'overwrite' = 'append'

const avatarStyles = [
  'adventurer', 'adventurer-neutral', 'avataaars', 'avataaars-neutral',
  'big-ears', 'big-ears-neutral', 'big-smile', 'bottts', 'bottts-neutral',
  'croodles', 'croodles-neutral', 'fun-emoji', 'identicon', 'initials',
  'lorelei', 'lorelei-neutral', 'micah', 'miniavs', 'notionists',
  'notionists-neutral', 'open-peeps', 'personas', 'pixel-art',
  'pixel-art-neutral', 'rings', 'shapes', 'thumbs',
]

const avatarSeeds = [
  'Felix', 'Ane', 'Mason', 'Riley', 'Jules', 'Kai', 'Zara', 'Theo',
  'Nova', 'Leo', 'Sage', 'Iris', 'Max', 'Nori', 'Ash', 'Bex', 'Mira', 'Pip',
]

const draftAvatarBgColor = ref('')
const draftAvatarRadiusPct = ref(100)

const draftAvatarBgColorPicker = computed({
  get() {
    return draftAvatarBgColor.value ? `#${draftAvatarBgColor.value}` : '#ffffff'
  },
  set(val: string) {
    draftAvatarBgColor.value = val ? val.slice(1).toLowerCase() : ''
  },
})

const draftAvatarBgColorHex = computed({
  get() {
    return draftAvatarBgColor.value ? `#${draftAvatarBgColor.value}` : ''
  },
  set(val: string) {
    const trimmed = val.trim()
    draftAvatarBgColor.value = trimmed.startsWith('#') && trimmed.length === 7
      ? trimmed.slice(1).toLowerCase()
      : ''
  },
})

const previewUser = computed(() => ({
  username: user.value?.username ?? '',
  avatarUrl: draftAvatarUrl.value || null,
  avatarStyle: draftAvatarStyle.value || null,
  avatarSeed: draftAvatarSeed.value || null,
  avatarBgColor: draftAvatarBgColor.value || null,
  avatarRadius: draftAvatarRadiusPct.value,
}))

function openProfile(): void {
  draftUsername.value = user.value?.username ?? ''
  currentPassword.value = ''
  newPassword.value = ''
  passwordError.value = ''
  draftAvatarUrl.value = user.value?.avatarUrl ?? ''
  draftAvatarStyle.value = user.value?.avatarStyle ?? ''
  draftAvatarSeed.value = user.value?.avatarSeed ?? ''
  draftAvatarBgColor.value = user.value?.avatarBgColor ?? ''
  draftAvatarRadiusPct.value = user.value?.avatarRadius !== undefined && user.value?.avatarRadius !== null
    ? user.value?.avatarRadius
    : 100
  avatarError.value = ''
  importMessage.value = ''
  importError.value = false
  menuOpen.value = false
  profileOpen.value = true
}

function onPickStyle(style: string): void {
  if (draftAvatarStyle.value === style) {
    draftAvatarStyle.value = ''
    draftAvatarSeed.value = ''
    return
  }

  draftAvatarStyle.value = style
  draftAvatarSeed.value = avatarSeeds[0] ?? ''
  draftAvatarUrl.value = ''
}

function onPickSeed(seed: string): void {
  draftAvatarSeed.value = seed
}

function onPickFile(event: Event): void {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) {
    return
  }

  if (!file.type.startsWith('image/')) {
    avatarError.value = t('user.avatarInvalid')
    return
  }

  resizeImage(file, 128)
    .then((dataUrl) => {
      draftAvatarUrl.value = dataUrl
      draftAvatarStyle.value = ''
      draftAvatarSeed.value = ''
      avatarError.value = ''
    })
    .catch(() => {
      avatarError.value = t('user.avatarFailed')
    })
    .finally(() => {
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    })
}

/** Downscale an image to max `maxSize` px via canvas, return a data URL. */
function resizeImage(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      const image = new Image()

      image.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height))
        const width = Math.max(1, Math.round(image.width * scale))
        const height = Math.max(1, Math.round(image.height * scale))
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          reject(new Error('no canvas context'))
          return
        }

        ctx.drawImage(image, 0, 0, width, height)
        resolve(canvas.toDataURL('image/webp', 0.85))
      }

      image.onerror = () => reject(new Error('image decode failed'))
      image.src = reader.result as string
    }

    reader.onerror = () => reject(new Error('file read failed'))
    reader.readAsDataURL(file)
  })
}

async function onSaveAvatar(): Promise<void> {
  if (savingAvatar.value) {
    return
  }

  savingAvatar.value = true
  avatarError.value = ''

  try {
    const { user: updated } = await $fetch<{ user: AuthUser }>('/api/auth/avatar', {
      method: 'PUT',
      body: {
        url: draftAvatarUrl.value,
        style: draftAvatarStyle.value,
        seed: draftAvatarSeed.value,
        bgColor: draftAvatarBgColor.value || undefined,
        radius: draftAvatarRadiusPct.value,
      },
    })
    user.value = updated
    draftAvatarUrl.value = updated.avatarUrl ?? ''
    draftAvatarStyle.value = updated.avatarStyle ?? ''
    draftAvatarSeed.value = updated.avatarSeed ?? ''
    draftAvatarBgColor.value = updated.avatarBgColor ?? ''
    draftAvatarRadiusPct.value = updated.avatarRadius !== undefined && updated.avatarRadius !== null
      ? updated.avatarRadius
      : 100
  } catch (e: any) {
    avatarError.value = e?.data?.statusMessage || t('user.avatarFailed')
  } finally {
    savingAvatar.value = false
  }
}

async function onClearAvatar(): Promise<void> {
  draftAvatarUrl.value = ''
  draftAvatarStyle.value = ''
  draftAvatarSeed.value = ''
  draftAvatarBgColor.value = ''
  draftAvatarRadiusPct.value = 100
  await onSaveAvatar()
}

function pickImport(mode: 'append' | 'overwrite'): void {
  importMode = mode
  importMessage.value = ''
  importError.value = false
  importInput.value?.click()
}

async function onImportFile(event: Event): Promise<void> {
  const file = (event.target as HTMLInputElement).files?.[0]

  if (!file) {
    return
  }

  importing.value = true
  importError.value = false
  importMessage.value = ''

  try {
    const text = await file.text()
    const parsed = JSON.parse(text) as unknown
    let config = parsed

    // Accept both the app's own export (`{ exportedAt, config }`) and a bare
    // config JSON — either shape carries the site data under `config`/itself.
    if (parsed && typeof parsed === 'object' && 'config' in (parsed as Record<string, unknown>)) {
      config = (parsed as { config: unknown }).config
    }

    // The config write broadcasts `config:update`; skip the redundant reload
    // and re-sync in place (append) or reload exactly once (overwrite).
    suppressNextConfigReload()
    await $fetch('/api/config/import', {
      method: 'POST',
      body: { mode: importMode, config },
    })

    importMessage.value = t('user.importSuccess')

    if (importMode === 'overwrite') {
      // The imported file may replace title/lang/theme too — a full reload
      // re-reads them from the fresh config.
      profileOpen.value = false
      reloadNuxtApp({ force: true, path: '/' })
      return
    }

    // Append keeps the surrounding config; just re-sync the reactive state.
    await refreshConfig()
  } catch (e: any) {
    importError.value = true
    importMessage.value = e?.data?.statusMessage || t('user.importFailed')
  } finally {
    importing.value = false

    if (importInput.value) {
      importInput.value.value = ''
    }
  }
}

async function onSaveUsername(): Promise<void> {
  if (saving.value) {
    return
  }

  saving.value = true

  try {
    const { user: updated } = await $fetch<{ user: AuthUser }>('/api/auth/username', {
      method: 'PUT',
      body: { username: draftUsername.value },
    })
    user.value = updated
    profileOpen.value = false
    // Renaming a regular user moves their config_<username>.yml file, so a
    // full reload re-fetches the active config under the new name.
    reloadNuxtApp({ force: true, path: '/' })
  } catch {
    // keep modal open; server validates the name
  } finally {
    saving.value = false
  }
}

async function onSavePassword(): Promise<void> {
  if (saving.value) {
    return
  }

  saving.value = true
  passwordError.value = ''

  try {
    await $fetch('/api/auth/password', {
      method: 'PUT',
      body: {
        currentPassword: currentPassword.value,
        newPassword: newPassword.value,
      },
    })
    currentPassword.value = ''
    newPassword.value = ''
  } catch (e: any) {
    passwordError.value = e?.data?.statusMessage || 'Failed'
  } finally {
    saving.value = false
  }
}

async function onLogout(): Promise<void> {
  menuOpen.value = false
  await logout()
  reloadNuxtApp({ force: true, path: '/' })
}
</script>
