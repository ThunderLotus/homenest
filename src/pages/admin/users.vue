<template>
  <div class="py-6 space-y-5">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-semibold">
          {{ t('admin.users') }}
        </h1>
        <p class="text-sm text-fg-dimmed">
          {{ authUser?.username }}
        </p>
      </div>

      <div class="flex items-center gap-2">
        <NuxtLink
          to="/"
          class="px-3 py-1.5 rounded-lg text-sm border border-fg/20 hover:bg-fg/10 transition-colors"
        >
          {{ t('admin.backToDashboard') }}
        </NuxtLink>
        <button
          class="px-3 py-1.5 rounded-lg text-sm bg-fg text-background hover:opacity-80 transition-opacity"
          @click="addOpen = true"
        >
          {{ t('admin.addUser') }}
        </button>
      </div>
    </div>

    <p v-if="notice" class="text-sm text-green-500">
      {{ notice }}
    </p>

    <div class="rounded-xl border border-fg/10 bg-background overflow-hidden">
      <div class="hidden md:grid grid-cols-12 gap-4 px-4 py-2 border-b border-fg/10 text-xs text-fg-dimmed uppercase tracking-wide">
        <span class="col-span-3">{{ t('admin.usernameCol') }}</span>
        <span class="col-span-2">{{ t('admin.roleCol') }}</span>
        <span class="col-span-7 text-right">{{ t('admin.actionsCol') }}</span>
      </div>

      <div v-for="user in users ?? []" :key="user.username" class="grid grid-cols-1 md:grid-cols-12 gap-3 items-center px-4 py-3 border-b border-fg/10 last:border-b-0">
        <div class="col-span-3 flex items-center gap-2">
          <UserAvatar :user="user" size="sm" />
          <span class="text-sm font-medium truncate">
            {{ user.username }}
          </span>
        </div>

        <span class="col-span-2">
          <span class="text-xs px-2 py-0.5 rounded-full bg-fg/10 text-fg-dimmed">
            {{ user.role === 'admin' ? t('auth.roleAdmin') : t('auth.roleUser') }}
          </span>
        </span>

        <div class="col-span-7 flex flex-wrap justify-start md:justify-end gap-2">
          <button
            class="px-2.5 py-1 rounded-lg text-xs border border-fg/20 hover:bg-fg/10 transition-colors"
            @click="resetTarget = user"
          >
            {{ t('admin.resetPassword') }}
          </button>

          <a
            class="px-2.5 py-1 rounded-lg text-xs border border-fg/20 hover:bg-fg/10 transition-colors"
            :href="`/api/config/export/${user.username}`"
          >
            {{ t('admin.exportConfig') }}
          </a>

          <button
            class="px-2.5 py-1 rounded-lg text-xs text-red-500 border border-red-500/30 hover:bg-red-500/10 transition-colors"
            :disabled="user.username === authUser?.username"
            @click="deleteTarget = user"
          >
            {{ t('admin.deleteUser') }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="addOpen" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40" @click="addOpen = false" />
      <div class="relative w-full max-w-sm rounded-2xl border border-fg/10 bg-background shadow-xl p-5 space-y-4">
        <h2 class="text-base font-medium">
          {{ t('admin.addUser') }}
        </h2>

        <label class="block space-y-1">
          <span class="text-sm">{{ t('admin.username') }}</span>
          <input
            v-model="draft.username"
            type="text"
            class="w-full px-2.5 py-1.5 rounded-lg bg-fg/5 border border-fg/10 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
        </label>

        <label class="block space-y-1">
          <span class="text-sm">{{ t('admin.password') }}</span>
          <input
            v-model="draft.password"
            type="password"
            class="w-full px-2.5 py-1.5 rounded-lg bg-fg/5 border border-fg/10 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
        </label>

        <label class="block space-y-1">
          <span class="text-sm">{{ t('admin.role') }}</span>
          <select
            v-model="draft.role"
            class="w-full px-2.5 py-1.5 rounded-lg bg-fg/5 border border-fg/10 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="user">
              {{ t('auth.roleUser') }}
            </option>
            <option value="admin">
              {{ t('auth.roleAdmin') }}
            </option>
          </select>
        </label>

        <p v-if="addError" class="text-sm text-red-500">
          {{ addError }}
        </p>

        <div class="flex justify-end gap-2 pt-1">
          <button
            class="px-3 py-1.5 rounded-lg text-sm border border-fg/20 hover:bg-fg/10 transition-colors"
            @click="addOpen = false"
          >
            {{ t('admin.cancel') }}
          </button>
          <button
            class="px-3 py-1.5 rounded-lg text-sm bg-fg text-background hover:opacity-80 transition-opacity"
            @click="onAdd"
          >
            {{ t('admin.add') }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="resetTarget" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40" @click="resetTarget = null" />
      <div class="relative w-full max-w-sm rounded-2xl border border-fg/10 bg-background shadow-xl p-5 space-y-4">
        <h2 class="text-base font-medium">
          {{ t('admin.resetPassword') }} — {{ resetTarget.username }}
        </h2>

        <label class="block space-y-1">
          <span class="text-sm">{{ t('admin.newPassword') }}</span>
          <input
            v-model="resetPassword"
            type="password"
            class="w-full px-2.5 py-1.5 rounded-lg bg-fg/5 border border-fg/10 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
        </label>

        <div class="flex justify-end gap-2">
          <button
            class="px-3 py-1.5 rounded-lg text-sm border border-fg/20 hover:bg-fg/10 transition-colors"
            @click="resetTarget = null"
          >
            {{ t('admin.cancel') }}
          </button>
          <button
            class="px-3 py-1.5 rounded-lg text-sm bg-fg text-background hover:opacity-80 transition-opacity"
            :disabled="!resetPassword"
            @click="onResetPassword"
          >
            {{ t('admin.set') }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="deleteTarget" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40" @click="deleteTarget = null" />
      <div class="relative w-full max-w-sm rounded-2xl border border-fg/10 bg-background shadow-xl p-5 space-y-4">
        <p class="text-sm">
          {{ t('admin.confirmDelete', { username: deleteTarget.username }) }}
        </p>
        <div class="flex justify-end gap-2">
          <button
            class="px-3 py-1.5 rounded-lg text-sm border border-fg/20 hover:bg-fg/10 transition-colors"
            @click="deleteTarget = null"
          >
            {{ t('admin.cancel') }}
          </button>
          <button
            class="px-3 py-1.5 rounded-lg text-sm bg-red-500 text-white hover:opacity-80 transition-opacity"
            @click="onDelete"
          >
            {{ t('admin.deleteUser') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AuthUser, UserRole } from '~/composables/useAuth'

const { t } = useI18n()
const authUser = useAuthUser()

const { data: users, refresh } = await useFetch<AuthUser[]>('/api/users', {
  key: 'admin:users',
})

const addOpen = ref(false)
const resetTarget = ref<AuthUser | null>(null)
const resetPassword = ref('')
const deleteTarget = ref<AuthUser | null>(null)
const notice = ref('')

const draft = ref({
  username: '',
  password: '',
  role: 'user' as UserRole,
})
const addError = ref('')

function showNotice(key: string): void {
  notice.value = t(key)
  setTimeout(() => {
    notice.value = ''
  }, 3000)
}

async function onAdd(): Promise<void> {
  addError.value = ''

  try {
    await $fetch('/api/users', {
      method: 'POST',
      body: draft.value,
    })
    draft.value = { username: '', password: '', role: 'user' }
    addOpen.value = false
    showNotice('admin.userAdded')
    refresh()
  } catch (e: any) {
    addError.value = e?.data?.statusMessage || t('admin.addFailed')
  }
}

async function onResetPassword(): Promise<void> {
  if (!resetTarget.value) {
    return
  }

  const target = resetTarget.value
  const newPassword = resetPassword.value

  if (!newPassword) {
    return
  }

  try {
    await $fetch(`/api/users/${target.username}/password`, {
      method: 'PUT',
      body: { newPassword },
    })
    showNotice('admin.passwordReset')
  } catch {
    showNotice('admin.resetFailed')
  }

  resetTarget.value = null
  resetPassword.value = ''
}

async function onDelete(): Promise<void> {
  if (!deleteTarget.value) {
    return
  }

  const target = deleteTarget.value

  try {
    await $fetch(`/api/users/${target.username}`, {
      method: 'DELETE',
    })
    showNotice('admin.userDeleted')
    refresh()
  } catch (e: any) {
    showNotice(e?.data?.statusMessage === 'You cannot delete your own account'
      ? 'admin.cannotDeleteSelf'
      : 'admin.deleteFailed')
  }

  deleteTarget.value = null
}
</script>
