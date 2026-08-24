<template>
  <div ref="listEl" :class="gridClasses" :style="gridGapStyle">
    <div
      v-for="item in editItems"
      :key="item.id"
      class="relative"
      :class="isSelected(item) ? 'ring-2 ring-brand-500 rounded-2xl' : ''"
      @click.stop.prevent="onSelect(item)"
    >
      <Item v-bind="item" :card-style="cardStyle" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Layout, Service } from '~/types'
import type { StyleCard } from '~/types/style'
import { useDraggable } from 'vue-draggable-plus'

export interface Props {
  items: Service[]
  grid: Layout['grid']
  groupKey?: string
  cardStyle?: StyleCard
}

const props = defineProps<Props>()

const editor = useEditor()

const editItems = computed({
  get: () => {
    if (!props.groupKey) {
      return props.items
    }
    const group = editor.draft.value?.services.find((g) => (g as any)._key === props.groupKey)
    return group ? group.items : props.items
  },
  set: (value) => {
    if (!props.groupKey) {
      return
    }
    const group = editor.draft.value?.services.find((g) => (g as any)._key === props.groupKey)
    if (group) {
      group.items = value
    }
  },
})

const listEl = ref<HTMLElement | null>(null)

useDraggable(listEl, editItems, {
  group: 'cards',
  animation: 150,
  emptyInsertThreshold: 50,
})

const gridGapStyle = computed(() => (props.cardStyle?.gap ? { gap: props.cardStyle.gap } : undefined))

const gridClasses = computed(() => [
  'grid',
  'grid-cols-1',
  `sm:grid-cols-${props.grid.small}`,
  `md:grid-cols-${props.grid.medium}`,
  `lg:grid-cols-${props.grid.large}`,
  `xl:grid-cols-${props.grid.xlarge}`,
  'gap-1',
  'lg:gap-2',
  'lg:gap-y-4',
])

const isSelected = (item: Service) => editor.selectedService.value?.id === item.id

function onSelect(item: Service) {
  if (props.groupKey) {
    editor.select({ kind: 'service', groupKey: props.groupKey, serviceId: item.id })
  }
}
</script>
