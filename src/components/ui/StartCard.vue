<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
}>()
</script>

<template>
  <div class="bg-white border rounded p-4 text-center">
    <p class="text-sm text-gray-500">{{ label }}</p>
    <p class="text-2xl font-bold text-green-800 mt-1">
      {{ value }}
    </p>
  </div>
</template>
