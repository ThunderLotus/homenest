<template>
  <ServicePlaceholder v-if="loadingOverlay" />
  <div
    v-else-if="error && !data"
    class="p-4 gap-4 rounded-2xl flex transition-all text-red-500 text-sm"
    :class="cardHoverClasses"
    :style="cardInlineStyle"
  >
    <div class="self-center w-16 h-16 overflow-hidden flex items-center justify-center" :style="iconStyle">
      <span class="text-2xl">⚠</span>
    </div>
    <div>
      <h3 class="text-lg pr-1 font-semibold line-clamp-1" :style="titleStyle">
        {{ displayTitle }}
      </h3>
      <p class="text-sm line-clamp-2">
        {{ error.statusMessage || error.message }}
      </p>
    </div>
  </div>
  <Component
    :is="isLink ? 'a' : 'div'"
    v-else
    :href="link"
    :target="target"
    class="p-4 gap-4 rounded-2xl flex transition-all"
    :class="cardHoverClasses"
    :style="cardInlineStyle"
  >
    <div v-if="showIcon" class="flex-shrink-0 flex">
      <div class="self-center w-16 h-16 overflow-hidden" :style="iconStyle">
        <slot name="icon" :service="data">
          <ServiceBaseIcon v-if="icon" v-bind="icon" />
        </slot>
      </div>
    </div>
    <div>
      <h3 class="text-lg pr-1 font-semibold line-clamp-1 flex gap-2 items-center" :style="titleStyle">
        <slot name="title" :service="data">
          {{ displayTitle }}
        </slot>
        <slot v-if="status && status.enabled" name="status" :data="data">
          <ServiceBaseStatus :ping="{ ...data?.ping, animation: status?.animation }" />
        </slot>
      </h3>

      <p class="text-sm text-fg-dimmed line-clamp-1">
        <slot name="description" :service="data">
          {{ displayDescription }}
        </slot>
      </p>
      <template v-if="tags.length">
        <ServiceBaseTag
          v-for="(tag, key) in tags"
          :key="key"
          :tag="tag"
        />
      </template>
    </div>
  </Component>
</template>

<script setup lang="ts">
import type { Service, ServiceClient } from '~/types'
import type { StyleCard } from '~/types/style'
import { defu } from 'defu'

const props = defineProps<ServiceClient<Service> & { cardStyle?: StyleCard }>()

const { $settings } = useNuxtApp()
const { trServiceTitle, trServiceDescription } = useContentI18n()

const displayTitle = computed(() => trServiceTitle(props))
const displayDescription = computed(() => trServiceDescription(props))

const isLink = computed(() => isUrl(props.link || ''))
const target = computed(() => props.target || $settings.behaviour.target)

/** Global → group → card three-level merge (card wins). */
const mergedCardStyle = computed<StyleCard>(() => {
  try {
    return defu({}, props.style as StyleCard, props.cardStyle) ?? {}
  } catch {
    return {}
  }
})

const cardInlineStyle = computed(() => {
  const s = mergedCardStyle.value

  return {
    padding: s?.padding,
    borderRadius: s?.borderRadius,
    width: s?.width,
    background: s?.background,
    color: s?.color,
    fontSize: s?.fontSize,
  }
})

const titleStyle = computed(() => {
  const fontSize = mergedCardStyle.value?.fontSize

  return fontSize ? { fontSize } : undefined
})

const iconStyle = computed(() => {
  const size = mergedCardStyle.value?.iconSize

  return size ? { width: size, height: size } : undefined
})

const cardHoverClasses = computed(() => [
  mergedCardStyle.value?.hoverEffect === false ? '' : 'hover:bg-fg/5 dark:hover:bg-fg/9',
])

const showIcon = computed(() => mergedCardStyle.value?.showIcon !== false)

const immediate = computed(() => props.status?.enabled || !!props.type || false)
const { data, error, pauseUpdate } = useServiceData<Service>(props, {
  immediate: immediate.value,
})

const loadingOverlay = computed(() => {
  if (props.type && !data.value && !error.value) {
    return true
  }

  return false
})

defineExpose({ data })

onBeforeUnmount(pauseUpdate)
</script>
