<template>
  <div ref="groupsEl" class="w-full" :class="containerClasses">
    <div v-for="group in editGroups" :key="keyOf(group)" :class="groupWrapperClasses">
      <Group
        v-bind="{ ...group, grid, layoutMode }"
        :edit="true"
        :group-key="keyOf(group)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DraftGroup } from '~/composables/useEditor'
import type { Layout } from '~/types'
import { useDraggable } from 'vue-draggable-plus'

const editor = useEditor()

const keyOf = (group: DraftGroup) => group._key

const editGroups = computed<DraftGroup[]>({
  get: () => (editor.draft.value?.services ?? []) as DraftGroup[],
  set: (value) => {
    if (editor.draft.value) {
      editor.draft.value.services = value
    }
  },
})

const grid = computed<Layout['grid']>(
  () =>
    editor.draft.value?.layout.grid ?? {
      small: 2,
      medium: 3,
      large: 4,
      xlarge: 4,
    },
)

const layoutMode = computed(() => editor.draft.value?.layout.mode)

/** Vertical mode: groups sit side-by-side and wrap (homepage-style columns). */
const containerClasses = computed(() => (layoutMode.value === 'vertical' ? 'flex flex-wrap items-start' : ''))

const groupWrapperClasses = computed(() => (layoutMode.value === 'vertical' ? 'flex-1 basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4' : 'w-full'))

const groupsEl = ref<HTMLElement | null>(null)

useDraggable(groupsEl, editGroups, {
  group: 'groups',
  handle: '.group-handle',
  animation: 150,
})
</script>
