<template>
  <div class="flex items-center gap-1">
    <input
      :value="value"
      :placeholder="placeholder"
      class="min-w-0" :class="[inputClass]"
      @input="emit('update:value', targetValue($event))"
      @change="emit('change', targetValue($event))"
      @keydown.up.prevent="emit('step', step)"
      @keydown.down.prevent="emit('step', -step)"
    >
    <div class="flex flex-col shrink-0">
      <button
        type="button"
        class="w-5 h-4 flex items-center justify-center rounded-t-md bg-fg/5 border border-fg/10 hover:bg-fg/15 transition-colors text-fg-dimmed"
        aria-label="increase"
        @click="emit('step', step)"
      >
        <Icon name="lucide:chevron-up" class="w-3 h-3" />
      </button>
      <button
        type="button"
        class="w-5 h-4 flex items-center justify-center rounded-b-md bg-fg/5 border border-fg/10 -mt-px hover:bg-fg/15 transition-colors text-fg-dimmed"
        aria-label="decrease"
        @click="emit('step', -step)"
      >
        <Icon name="lucide:chevron-down" class="w-3 h-3" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  value?: string
  placeholder?: string
  inputClass?: string
  step?: number
}>(), {
  step: 1,
})

const emit = defineEmits<{
  'update:value': [value: string]
  'change': [value: string]
  'step': [delta: number]
}>()
</script>
