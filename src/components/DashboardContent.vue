<template>
  <h1 v-if="pageTitleVisible" class="px-4 pt-6 flex items-center gap-2" :style="pageTitleStyle">
    <button
      v-if="!isEditing"
      type="button"
      class="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-fg-dimmed hover:text-fg hover:bg-fg/10 transition-colors"
      :title="allCollapsed ? t('editor.expandAll') : t('editor.collapseAll')"
      @click="onToggleAll"
    >
      <Icon :name="allCollapsed ? 'lucide:chevrons-down' : 'lucide:chevrons-up'" class="w-5 h-5" />
    </button>
    <span>{{ title }}</span>
  </h1>
  <EditorEditableGroups v-if="isEditing" />
  <template v-else>
    <Group
      v-for="(group, key) in $services"
      :key="key"
      v-bind="{ ...group, grid: $settings.layout.grid }"
    />
  </template>
  <Update v-if="$settings.checkUpdates" />
</template>

<script setup lang="ts">
const { $services, $settings } = useNuxtApp()
const { isEditing, draft, enterEdit } = useEditor()
const { isCollapsed, collapseAll, expandAll } = useCollapsedGroups()
const { t } = useI18n()
const { trPageTitle } = useContentI18n()
const route = useRoute()

const style = computed(() => (isEditing.value ? (draft.value?.style ?? {}) : ($settings.style ?? {})) as Record<string, any>)

const pageTitleVisible = computed(() => !!style.value.title?.fontSize || !!style.value.title?.fontWeight)
const pageTitleStyle = computed(() => ({
  fontSize: style.value.title?.fontSize,
  fontWeight: style.value.title?.fontWeight,
}))
const title = computed(() => trPageTitle(isEditing.value ? (draft.value?.title ?? '') : ($settings.title ?? '')))

const groupNames = computed(() => ($services ?? []).map((group) => group.title ?? ''))
const allCollapsed = computed(
  () => groupNames.value.length > 0 && groupNames.value.every((name) => isCollapsed(name)),
)

function onToggleAll() {
  if (allCollapsed.value) {
    expandAll()
  } else {
    collapseAll(groupNames.value)
  }
}

// Deep link `/config/:name?edit=1` starts editing immediately.
onMounted(() => {
  if (route.query.edit === '1') {
    enterEdit()
  }
})

if ($settings.error) {
  throw createError({
    message: $settings.error,
  })
}
</script>
