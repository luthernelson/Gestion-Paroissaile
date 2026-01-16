<script setup lang="ts">
interface Option {
  label: string
  value: string | number
}

defineProps<{
  label: string
  modelValue: string | number
  options: Option[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()
</script>

<template>
  <div class="space-y-1">
    <label class="text-sm text-gray-700">{{ label }}</label>
    <select
      class="w-full border rounded px-3 py-2 text-sm focus:ring focus:ring-green-200"
      :value="modelValue"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option
        v-for="opt in options"
        :key="opt.value"
        :value="opt.value"
      >
        {{ opt.label }}
      </option>
    </select>
  </div>
</template>
