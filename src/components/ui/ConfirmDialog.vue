<script setup lang="ts">
defineProps<{
  show: boolean
  title: string
  message: string
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center"
  >
    <div class="bg-white rounded p-6 w-96">
      <h3 class="font-semibold mb-2">{{ title }}</h3>
      <p class="text-sm text-gray-600 mb-4">{{ message }}</p>

      <div class="flex justify-end gap-3">
        <button
          @click="emit('cancel')"
          class="px-4 py-2 bg-gray-300 rounded"
        >
          Annuler
        </button>

        <button
          @click="emit('confirm')"
          class="px-4 py-2 bg-red-600 text-white rounded"
        >
          Confirmer
        </button>
      </div>
    </div>
  </div>
</template>
