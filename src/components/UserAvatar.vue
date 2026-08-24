<template>
  <img
    v-if="imageSrc && !failed"
    :src="imageSrc"
    :alt="user.username"
    class="object-cover shrink-0 bg-fg/10"
    :class="sizeClass"
    :style="{ borderRadius }"
    loading="lazy"
    @error="failed = true"
  >
  <span
    v-else
    class="flex items-center justify-center font-medium shrink-0 bg-fg/10"
    :class="sizeClass"
    :style="{ borderRadius }"
  >
    {{ initials }}
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  user: { username: string, avatarUrl?: string | null, avatarStyle?: string | null, avatarSeed?: string | null, avatarBgColor?: string | null, avatarRadius?: number | null }
  size?: 'sm' | 'md' | 'lg'
}>()

const failed = ref(false)

const borderRadius = computed(() => {
  const pct = props.user.avatarRadius ?? 100
  return `${pct}%`
})

const imageSrc = computed(() => {
  if (props.user.avatarUrl) {
    return props.user.avatarUrl
  }

  if (props.user.avatarStyle) {
    const params = new URLSearchParams({ username: props.user.username, style: props.user.avatarStyle })
    if (props.user.avatarSeed) {
      params.set('seed', props.user.avatarSeed)
    }
    if (props.user.avatarBgColor) {
      params.set('bgColor', props.user.avatarBgColor)
    }
    return `/api/avatar?${params.toString()}`
  }

  return null
})

const initials = computed(() => props.user.username.slice(0, 1).toUpperCase())

const sizeClass = computed(() => {
  if (props.size === 'sm') {
    return 'w-7 h-7 text-xs'
  }
  if (props.size === 'lg') {
    return 'w-16 h-16 text-2xl'
  }
  return 'w-9 h-9 text-xs'
})

watch(
  () => [props.user.avatarUrl, props.user.avatarStyle, props.user.avatarSeed, props.user.avatarBgColor, props.user.avatarRadius],
  () => {
    failed.value = false
  },
)
</script>
