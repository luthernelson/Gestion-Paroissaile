<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <div class="mb-6">
    <h2 class="text-xl font-semibold text-gray-800">
      {{ title }}
    </h2>
    <p
      v-if="subtitle"
      class="text-sm text-gray-500"
    >
      {{ subtitle }}
    </p>
  </div>
</template>
