<template>
  <ClientOnly>
    <Component :is="component" v-bind="props" />

    <template #fallback>
      <ServicePlaceholder :animate="false" />
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import type { Service } from '~/types'
import type { StyleCard } from '~/types/style'
import { ServiceBase, ServiceIpApi, ServiceOpenWeatherMap } from '#components'
import ServicePlaceholder from './service/Placeholder.vue'

const props = defineProps<Service & { cardStyle?: StyleCard }>()

const serviceComponents: Record<string, Component> = {
  'base': ServiceBase,
  'ip-api': ServiceIpApi,
  'openweathermap': ServiceOpenWeatherMap,
}

const component = computed(() => serviceComponents[props.type ?? 'base'] ?? ServiceBase)
</script>
