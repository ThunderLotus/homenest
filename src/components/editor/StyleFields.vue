<template>
  <div v-if="titlePath || cardPath || groupPath" class="space-y-3">
    <div v-if="titlePath" class="space-y-2">
      <span class="text-sm block font-medium">{{ t('editor.field.styleTitle') }}</span>

      <label class="block space-y-1">
        <span class="text-sm">{{ t('editor.field.fontSize') }}</span>
        <EditorStepperInput
          :value="get(titlePath, 'fontSize') ?? ''"
          :placeholder="titlePlaceholder('fontSize')"
          :input-class="inputClass"
          @update:value="(v: string) => set(titlePath, 'fontSize', v)"
          @step="(d: number) => step(titlePath, 'fontSize', d, titlePlaceholder('fontSize'))"
        />
      </label>

      <label class="block space-y-1">
        <span class="text-sm">{{ t('editor.field.fontWeight') }}</span>
        <select
          :value="String(get(titlePath, 'fontWeight') ?? '')"
          :class="inputClass"
          @change="set(titlePath, 'fontWeight', targetValue($event))"
        >
          <option value="">{{ titlePlaceholder('fontWeight') }}</option>
          <option v-for="weight in fontWeights" :key="weight" :value="weight">
            {{ weight }}
          </option>
        </select>
      </label>
    </div>

    <div v-if="cardPath" class="space-y-2">
      <div class="flex items-center justify-between gap-2">
        <span class="text-sm block font-medium">{{ t('editor.field.styleCard') }}</span>
        <button
          v-if="reset"
          type="button"
          class="text-xs px-2 py-1 rounded-md border border-fg/20 hover:bg-fg/10 transition-colors whitespace-nowrap"
          @click="reset.handler"
        >
          {{ reset.label }}
        </button>
      </div>

      <label class="block space-y-1">
        <span class="text-sm">{{ t('editor.field.borderRadius') }}</span>
        <EditorStepperInput
          :value="get(cardPath, 'borderRadius') ?? ''"
          :placeholder="cardPlaceholder('borderRadius')"
          :input-class="inputClass"
          @update:value="(v: string) => set(cardPath, 'borderRadius', v)"
          @step="(d: number) => step(cardPath, 'borderRadius', d, cardPlaceholder('borderRadius'))"
        />
      </label>

      <label class="block space-y-1">
        <span class="text-sm">{{ t('editor.field.padding') }}</span>
        <EditorStepperInput
          :value="get(cardPath, 'padding') ?? ''"
          :placeholder="cardPlaceholder('padding')"
          :input-class="inputClass"
          @update:value="(v: string) => set(cardPath, 'padding', v)"
          @step="(d: number) => step(cardPath, 'padding', d, cardPlaceholder('padding'))"
        />
      </label>

      <label class="block space-y-1">
        <span class="text-sm">{{ t('editor.field.gap') }}</span>
        <EditorStepperInput
          :value="get(cardPath, 'gap') ?? ''"
          :placeholder="cardPlaceholder('gap')"
          :input-class="inputClass"
          @update:value="(v: string) => set(cardPath, 'gap', v)"
          @step="(d: number) => step(cardPath, 'gap', d, cardPlaceholder('gap'))"
        />
      </label>

      <label class="block space-y-1">
        <span class="text-sm">{{ t('editor.field.width') }}</span>
        <EditorStepperInput
          :value="get(cardPath, 'width') ?? ''"
          :placeholder="cardPlaceholder('width')"
          :input-class="inputClass"
          :step="8"
          @update:value="(v: string) => set(cardPath, 'width', v)"
          @step="(d: number) => step(cardPath, 'width', d, cardPlaceholder('width'), 240)"
        />
      </label>

      <label class="block space-y-1">
        <span class="text-sm">{{ t('editor.field.background') }}</span>
        <div class="flex gap-1">
          <input
            type="color"
            :value="colorValue(get(cardPath, 'background'))"
            class="w-9 h-8 shrink-0 rounded-lg cursor-pointer border border-fg/10 bg-transparent"
            @input="set(cardPath, 'background', targetValue($event))"
          >
          <input type="text" :value="get(cardPath, 'background') ?? ''" :class="inputClass" @input="set(cardPath, 'background', targetValue($event))">
        </div>
        <EditorColorSwatches
          :active="String(get(cardPath, 'background') ?? '')"
          @select="(v: string) => set(cardPath, 'background', v)"
        />
      </label>

      <label class="block space-y-1">
        <span class="text-sm">{{ t('editor.field.color') }}</span>
        <div class="flex gap-1">
          <input
            type="color"
            :value="colorValue(get(cardPath, 'color'))"
            class="w-9 h-8 shrink-0 rounded-lg cursor-pointer border border-fg/10 bg-transparent"
            @input="set(cardPath, 'color', targetValue($event))"
          >
          <input type="text" :value="get(cardPath, 'color') ?? ''" :class="inputClass" @input="set(cardPath, 'color', targetValue($event))">
        </div>
        <EditorColorSwatches
          :active="String(get(cardPath, 'color') ?? '')"
          :allow-transparent="false"
          @select="(v: string) => set(cardPath, 'color', v)"
        />
      </label>

      <label class="block space-y-1">
        <span class="text-sm">{{ t('editor.field.fontSize') }}</span>
        <EditorStepperInput
          :value="get(cardPath, 'fontSize') ?? ''"
          :placeholder="cardPlaceholder('fontSize')"
          :input-class="inputClass"
          @update:value="(v: string) => set(cardPath, 'fontSize', v)"
          @step="(d: number) => step(cardPath, 'fontSize', d, cardPlaceholder('fontSize'))"
        />
      </label>

      <label class="flex items-center gap-2">
        <input
          type="checkbox"
          :checked="get(cardPath, 'hoverEffect') ?? true"
          @change="set(cardPath, 'hoverEffect', targetChecked($event))"
        >
        <span class="text-sm">{{ t('editor.field.hoverEffect') }}</span>
      </label>

      <label class="block space-y-1">
        <span class="text-sm">{{ t('editor.field.iconSize') }}</span>
        <EditorStepperInput
          :value="get(cardPath, 'iconSize') ?? ''"
          :placeholder="cardPlaceholder('iconSize')"
          :input-class="inputClass"
          @update:value="(v: string) => set(cardPath, 'iconSize', v)"
          @step="(d: number) => step(cardPath, 'iconSize', d, cardPlaceholder('iconSize'))"
        />
      </label>

      <label class="flex items-center gap-2">
        <input
          type="checkbox"
          :checked="get(cardPath, 'showIcon') ?? true"
          @change="set(cardPath, 'showIcon', targetChecked($event))"
        >
        <span class="text-sm">{{ t('editor.field.showIcon') }}</span>
      </label>
    </div>

    <div v-if="groupPath" class="space-y-2">
      <span class="text-sm block font-medium">{{ t('editor.field.styleGroup') }}</span>

      <label class="block space-y-1">
        <span class="text-sm">{{ t('editor.field.titleFontSize') }}</span>
        <EditorStepperInput
          :value="get(groupPath, 'titleFontSize') ?? ''"
          :input-class="inputClass"
          @update:value="(v: string) => set(groupPath, 'titleFontSize', v)"
          @step="(d: number) => step(groupPath, 'titleFontSize', d)"
        />
      </label>

      <label class="block space-y-1">
        <span class="text-sm">{{ t('editor.field.gap') }}</span>
        <EditorStepperInput
          :value="get(groupPath, 'gap') ?? ''"
          :input-class="inputClass"
          @update:value="(v: string) => set(groupPath, 'gap', v)"
          @step="(d: number) => step(groupPath, 'gap', d)"
        />
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StyleGroup } from '~/types/style'
import { CARD_STYLE_DEFAULTS, getStylePath, GROUP_STYLE_DEFAULTS, setStylePath, stepNumericValue, STYLE_TITLE_DEFAULTS } from '~/utils/style'

const props = defineProps<{
  root: Record<string, any>
  titlePath?: string[]
  cardPath?: string[]
  groupPath?: string[]
  /** Group title this panel edits (service panel), used to resolve the group's card override for placeholders. */
  groupTitle?: string
  reset?: { label: string, handler: () => void }
}>()

const { draft } = useEditor()
const { $settings } = useNuxtApp()

const inputClass = 'w-full px-2.5 py-1.5 rounded-lg bg-fg/5 border border-fg/10 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-brand-500'

const fontWeights = [300, 400, 500, 600, 700]

function get(path: string[] | undefined, key: string): any {
  if (!path) {
    return undefined
  }
  return getStylePath(props.root, path, key)
}

const lengthFields = new Set([
  'borderRadius',
  'padding',
  'gap',
  'width',
  'iconSize',
  'fontSize',
  'titleFontSize',
])

function set(path: string[] | undefined, key: string, value: string | boolean | undefined): void {
  if (!path) {
    return
  }
  let v: string | boolean | undefined = value
  if (typeof v === 'string' && lengthFields.has(key)) {
    const trimmed = v.trim()
    // A unitless number typed into a length field is invalid CSS on its own
    // (browsers ignore `width: 400`) — normalize it to px on the way in.
    if (/^\d+(?:\.\d+)?$/.test(trimmed)) {
      v = `${trimmed}px`
    }
  }
  setStylePath(props.root, path, key, v)
}

/**
 * Stepper buttons/arrow keys: increment or decrement the numeric part of the
 * field's value (e.g. `16px` -> `17px`), keeping its unit. An empty field
 * steps from the `fallback` (the currently effective placeholder value) so the
 * first click materializes the inherited default instead of starting at zero.
 * `keywordBase` is the size a non-numeric value (`auto`) steps up/down from.
 */
function step(path: string[] | undefined, key: string, delta: number, fallback?: string, keywordBase = 16): void {
  const current = get(path, key) as string | undefined
  set(path, key, stepNumericValue(current, delta, fallback, keywordBase))
}

/** Theme-level card defaults (global `style.card`), when present. */
const themeCard = computed<Record<string, unknown> | undefined>(
  () => (draft.value?.style?.card ?? $settings.style?.card) as Record<string, unknown> | undefined,
)

/**
 * The nearest group card override for the current panel:
 * - group panel: extracted from `cardPath` (`['style','group',<title>,'card']`)
 * - service panel: read by `groupTitle` so placeholders inherit the group
 *   override just like the rendered card does.
 */
const groupCard = computed<Record<string, unknown> | undefined>(() => {
  const fromPath = groupCardFromPath()
  if (fromPath) {
    return fromPath
  }

  if (!props.groupTitle) {
    return undefined
  }
  const groupStyle = (draft.value?.style?.group ?? $settings.style?.group) as StyleGroup | undefined
  return groupStyle?.[props.groupTitle]?.card as Record<string, unknown> | undefined
})

/**
 * Effective value for an unset card field, shown as a placeholder so the
 * user sees what the card currently renders instead of a blank box.
 * Resolution: group override -> theme global `style.card` -> built-in default.
 */
function cardPlaceholder(key: string): string {
  const fromGroup = groupCard.value?.[key]
  if (fromGroup != null && fromGroup !== '') {
    return String(fromGroup)
  }

  const fromGlobal = themeCard.value?.[key]
  if (fromGlobal != null && fromGlobal !== '') {
    return String(fromGlobal)
  }

  return String(CARD_STYLE_DEFAULTS[key] ?? '')
}

/**
 * Effective value for an unset title field, shown as a placeholder so the
 * user sees what the title currently renders instead of a blank box.
 *
 * - group panel (titlePath contains `group`): font size inherits the group
 *   section default (`style.group.titleFontSize`), weight is the base
 *   `font-light` = 300 the group heading always renders with.
 * - global/theme panel: font size / weight inherit the theme `style.title`
 *   block (falling back to the built-in page-title defaults).
 */
function titlePlaceholder(key: string): string {
  const fromOverride = get(props.titlePath, key)
  if (fromOverride != null && fromOverride !== '') {
    return String(fromOverride)
  }

  const isGroupPanel = props.titlePath?.includes('group') ?? false

  if (key === 'fontSize') {
    if (isGroupPanel) {
      const fromGroup = getStylePath(props.root, ['style', 'group'], 'titleFontSize')
      if (fromGroup != null && fromGroup !== '') {
        return String(fromGroup)
      }
      return String(GROUP_STYLE_DEFAULTS.titleFontSize)
    }

    return String(STYLE_TITLE_DEFAULTS.fontSize)
  }

  if (key === 'fontWeight') {
    if (!isGroupPanel) {
      const fromTheme = getStylePath(props.root, ['style', 'title'], 'fontWeight')
      if (fromTheme != null && fromTheme !== '') {
        return String(fromTheme)
      }
    }
    return String(STYLE_TITLE_DEFAULTS.fontWeight)
  }

  return ''
}

/**
 * When the panel edits a group's style, `cardPath` is
 * `['style','group',<title>,'card']` — the group override is the nearest
 * fallback before the global card.
 */
function groupCardFromPath(): Record<string, unknown> | undefined {
  if (!props.cardPath) {
    return undefined
  }

  // A service card has cardPath ['style']; only group panel paths carry the
  // `group` segment between `style` and `card`.
  const gIdx = props.cardPath.indexOf('group')
  if (gIdx < 0 || gIdx + 2 >= props.cardPath.length) {
    return undefined
  }

  return getStylePath(props.root, props.cardPath.slice(0, gIdx + 2), 'card') as
    | Record<string, unknown>
    | undefined
}

function colorValue(value: unknown): string {
  if (typeof value !== 'string') {
    return '#000000'
  }

  if (/^#[0-9a-f]{6}$/i.test(value)) {
    return value
  }

  if (/^#[0-9a-f]{3}$/i.test(value)) {
    return `#${[...value.slice(1)].map((c) => c + c).join('')}`
  }

  return '#000000'
}

const { t } = useI18n()
</script>
