<template>
  <NuxtPwaManifest />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const { $settings, $i18n } = useNuxtApp()
const colorMode = useColorMode()
const { trPageTitle } = useContentI18n()

await $i18n.setLocale($settings.lang || 'zh')

const i18nHead = useLocaleHead({
  key: 'id',
})

useHead({
  title: computed(() => trPageTitle($settings.title)),
  htmlAttrs: {
    lang: i18nHead.value.htmlAttrs?.lang,
    dir: i18nHead.value.htmlAttrs?.dir as 'auto' | 'ltr' | 'rtl' | undefined,
  },
  bodyAttrs: {
    class: 'relative',
  },
})

onMounted(() => {
  colorMode.preference = $settings.theme || 'system'
})
</script>
