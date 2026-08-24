<template>
  <div class="min-h-screen">
    <div class="max-w-screen-2xl mx-auto xl:flex-row px-4" :class="{ 'pt-12': isEditing }">
      <slot />
    </div>
    <!-- Admin pages manage users, not the dashboard: hide the editor chrome and user menu. -->
    <template v-if="!isAdminPage">
      <EditorToolbar />
      <EditorPropertyPanel />
      <UserMenu />
    </template>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { isEditing } = useEditor()

const isAdminPage = computed(() => route.path.startsWith('/admin'))
</script>
