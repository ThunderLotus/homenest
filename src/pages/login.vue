<template>
  <div class="w-full max-w-sm rounded-2xl border border-fg/10 bg-background shadow-xl p-6 space-y-5">
    <div class="flex items-start justify-between">
      <div class="space-y-1">
        <h1 class="text-xl font-semibold">
          {{ t('auth.title') }}
        </h1>
        <p class="text-sm text-fg-dimmed">
          {{ t('auth.subtitle') }}
        </p>
      </div>
      <select
        v-model="currentLang"
        class="shrink-0 px-2 py-1 rounded-lg bg-fg/5 border border-fg/10 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-brand-500"
        @change="onLangChange"
      >
        <option v-for="loc in locales" :key="loc.code" :value="loc.code">
          {{ loc.name }}
        </option>
      </select>
    </div>

    <form class="space-y-4" @submit.prevent="onSubmit">
      <label class="block space-y-1">
        <span class="text-sm">{{ t('auth.username') }}</span>
        <input
          v-model="username"
          type="text"
          autocomplete="username"
          :placeholder="t('auth.usernameHint')"
          class="w-full px-2.5 py-1.5 rounded-lg bg-fg/5 border border-fg/10 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
      </label>

      <label class="block space-y-1">
        <span class="text-sm">{{ t('auth.password') }}</span>
        <input
          v-model="password"
          type="password"
          autocomplete="current-password"
          :placeholder="t('auth.passwordHint')"
          class="w-full px-2.5 py-1.5 rounded-lg bg-fg/5 border border-fg/10 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
      </label>

      <p v-if="error" class="text-sm text-red-500">
        {{ error }}
      </p>

      <button
        type="submit"
        class="w-full px-3 py-2 rounded-lg text-sm font-medium bg-fg text-background hover:opacity-80 transition-opacity disabled:opacity-60"
        :disabled="submitting"
      >
        {{ submitting ? t('auth.loggingIn') : t('auth.login') }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const { t, locale, locales, setLocale } = useI18n()
const route = useRoute()

const currentLang = ref(locale.value)

onMounted(() => {
  const saved = localStorage.getItem('homenest-lang')
  if (saved && saved !== locale.value) {
    currentLang.value = saved
    setLocale(saved as string)
  }
})

function onLangChange(): void {
  setLocale(currentLang.value as string)
  localStorage.setItem('homenest-lang', currentLang.value)
}

const username = ref('')
const password = ref('')
const submitting = ref(false)
const error = ref('')

async function onSubmit(): Promise<void> {
  if (submitting.value) {
    return
  }

  submitting.value = true
  error.value = ''

  try {
    await login(username.value, password.value)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    reloadNuxtApp({ force: true, path: redirect })
  } catch {
    error.value = t('auth.loginFailed')
    submitting.value = false
  }
}
</script>
