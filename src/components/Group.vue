<template>
  <div v-if="!searchActive || visibleItems.length > 0" class="py-10" :style="groupContainerStyle">
    <h2
      v-if="title || edit"
      class="text-2xl font-light py-2 px-4 flex items-center gap-2"
      :style="groupTitleStyle"
      :class="[
        edit ? 'group-handle cursor-move select-none rounded-xl hover:bg-fg/5 dark:hover:bg-fg/9' : '',
        isSelectedGroup ? 'ring-2 ring-brand-500' : '',
      ]"
      @click="edit && onSelectGroup()"
    >
      <button

        type="button"
        class="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-fg-dimmed hover:text-fg hover:bg-fg/10 transition-colors"
        :title="groupCollapsed ? t('editor.expand') : t('editor.collapse')"
        @click.stop="onToggleCollapsed"
      >
        <Icon :name="groupCollapsed ? 'lucide:chevron-right' : 'lucide:chevron-down'" class="w-4 h-4" />
      </button>
      <span>{{ displayTitle || 'Untitled' }}</span>
    </h2>
    <EditorEditableGroupItems
      v-if="edit && groupKey && !groupCollapsed"
      :items="items"
      :grid="grid"
      :group-key="groupKey"
      :card-style="cardStyle"
    />
    <div v-else-if="!groupCollapsed || searchActive" :class="gridClasses" :style="gridGapStyle">
      <template v-for="item in visibleItems" :key="item.id">
        <Item v-bind="item" :card-style="cardStyle" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Layout, Service } from '~/types'
import type { Style, StyleCard, StyleGroupOverride } from '~/types/style'
import { defu } from 'defu'

export interface Props {
  title?: string
  items: Service[]
  grid: Layout['grid']
  edit?: boolean
  groupKey?: string
}

const props = defineProps<Props>()

const editor = useEditor()
const { $settings } = useNuxtApp()
const { isCollapsed, toggle } = useCollapsedGroups()
const search = useDashboardSearch()
const searchActive = search.active
const { t } = useI18n()
const { trGroupTitle } = useContentI18n()

const displayTitle = computed(() => trGroupTitle(props.title))

const visibleItems = computed(() => (search.active.value ? props.items.filter((item) => search.matches(item)) : props.items))

const style = computed<Style>(() => {
  if (props.edit) {
    return (editor.draft.value?.style ?? {}) as Style
  }

  return ($settings.style ?? {}) as Style
})

const groupOverride = computed<StyleGroupOverride | undefined>(() => {
  const group = style.value.group

  // Use `?? ''` so an untitled group (title `''`) can still receive the
  // `style.group['']` override written by the property panel.
  if (!group) {
    return undefined
  }

  return group[props.title ?? ''] as StyleGroupOverride | undefined
})

const groupTitleStyle = computed(() => {
  const group = style.value.group

  return {
    fontSize: groupOverride.value?.title?.fontSize ?? group?.titleFontSize,
    fontWeight: groupOverride.value?.title?.fontWeight,
  }
})

const groupContainerStyle = computed(() => {
  const gap = style.value.group?.gap

  return gap ? { paddingTop: gap, paddingBottom: gap } : undefined
})

/** Global card defaults merged with this group's override (card level merges later). */
const cardStyle = computed<StyleCard>(() => defu({}, groupOverride.value?.card, style.value.card))

const gridGapStyle = computed(() => (cardStyle.value.gap ? { gap: cardStyle.value.gap } : undefined))

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

const isSelectedGroup = computed(
  () => editor.selected.value?.kind === 'group' && editor.selected.value.key === props.groupKey,
)

function onSelectGroup() {
  if (props.groupKey) {
    editor.select({ kind: 'group', key: props.groupKey })
  }
}

const groupCollapsed = computed(() => isCollapsed(props.title ?? ''))

function onToggleCollapsed() {
  toggle(props.title ?? '')
}
</script>
