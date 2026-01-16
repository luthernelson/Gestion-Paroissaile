<script setup lang="ts">
defineProps<{
  startDate: string
  endDate: string
  label?: string
}>()

const emit = defineEmits<{
  (e: 'update:startDate', value: string): void
  (e: 'update:endDate', value: string): void
}>()
</script>

<template>
  <div class="space-y-1">
    <label v-if="label" class="text-sm text-gray-700">
      {{ label }}
    </label>

    <div class="flex gap-3">
      <!-- Date début -->
      <input
        type="date"
        class="w-full border rounded px-3 py-2 text-sm focus:ring focus:ring-green-200"
        :value="startDate"
        @input="emit('update:startDate', ($event.target as HTMLInputElement).value)"
      />

      <!-- Date fin -->
      <input
        type="date"
        class="w-full border rounded px-3 py-2 text-sm focus:ring focus:ring-green-200"
        :value="endDate"
        @input="emit('update:endDate', ($event.target as HTMLInputElement).value)"
      />
    </div>
  </div>
</template>
