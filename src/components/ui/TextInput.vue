<script setup lang="ts">
defineProps<{
  label: string
  modelValue: string
  type?: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <div class="space-y-1">
    <label class="text-sm text-gray-700">{{ label }}</label>
    <input
      :type="type || 'text'"
      :placeholder="placeholder"
      class="w-full border rounded px-3 py-2 text-sm focus:ring focus:ring-green-200"
      :value="modelValue"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>
