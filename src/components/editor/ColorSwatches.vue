<template>
  <div class="flex flex-wrap gap-1.5">
    <button
      v-for="swatch in swatches"
      :key="swatch.value"
      type="button"
      class="w-6 h-6 rounded-md border border-fg/10 shrink-0 cursor-pointer transition-transform hover:scale-110"
      :class="isActive(swatch.value) ? 'ring-2 ring-brand-500 ring-offset-1 ring-offset-background' : ''"
      :style="swatchStyle(swatch.value)"
      :aria-label="swatch.label"
      :title="swatch.label"
      @click="emit('select', swatch.value)"
    />
  </div>
</template>

<script setup lang="ts">
interface ColorSwatch {
  label: string
  value: string
}

const props = withDefaults(
  defineProps<{
    /** Current field value, used to highlight the matching swatch. */
    active?: string
    /** Include the "transparent" swatch (background only — pointless for text color). */
    allowTransparent?: boolean
  }>(),
  {
    allowTransparent: true,
  },
)

const emit = defineEmits<{ select: [value: string] }>()

const PRESET_COLORS: ColorSwatch[] = [
  { label: 'Transparent', value: 'transparent' },
  { label: 'White', value: '#ffffff' },
  { label: 'Light gray', value: '#f5f5f5' },
  { label: 'Gray', value: '#d4d4d4' },
  { label: 'Black', value: '#000000' },
  { label: 'Dark gray', value: '#333333' },
  { label: 'Brand', value: '#69a870' },
  { label: 'Red', value: '#ef4444' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Green', value: '#22c55e' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Teal', value: '#14b8a6' },
  { label: 'Cyan', value: '#06b6d4' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Indigo', value: '#6366f1' },
  { label: 'Violet', value: '#8b5cf6' },
  { label: 'Pink', value: '#ec4899' },
  { label: 'Rose', value: '#f43f5e' },
]

const swatches = computed(() =>
  props.allowTransparent ? PRESET_COLORS : PRESET_COLORS.filter((c) => c.value !== 'transparent'),
)

function isActive(value: string): boolean {
  return String(props.active ?? '').toLowerCase() === value.toLowerCase()
}

function swatchStyle(value: string): Record<string, string> {
  if (value === 'transparent') {
    return {
      backgroundImage: 'conic-gradient(#d4d4d4 25%, transparent 0 50%, #d4d4d4 0 75%, transparent 0)',
      backgroundSize: '8px 8px',
    }
  }
  return { backgroundColor: value }
}
</script>
