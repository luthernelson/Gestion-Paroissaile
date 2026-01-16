<script setup lang="ts">
const emit = defineEmits<{
  (e: 'apply'): void
  (e: 'reset'): void
}>()
</script>

<template>
  <div class="bg-white border rounded p-4 flex gap-4 items-end">
    <slot />

    <div class="flex gap-2">
      <button
        @click="emit('apply')"
        class="px-4 py-2 bg-green-700 text-white rounded text-sm"
      >
        Filtrer
      </button>

      <button
        @click="emit('reset')"
        class="px-4 py-2 bg-gray-300 rounded text-sm"
      >
        Réinitialiser
      </button>
    </div>
  </div>
</template>
