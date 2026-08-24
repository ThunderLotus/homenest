<template>
  <div ref="groupsEl" class="w-full">
    <div v-for="group in editGroups" :key="keyOf(group)" class="w-full">
      <Group
        v-bind="{ ...group, grid }"
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

const groupsEl = ref<HTMLElement | null>(null)

useDraggable(groupsEl, editGroups, {
  group: 'groups',
  handle: '.group-handle',
  animation: 150,
})
</script>
