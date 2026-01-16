<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>

<template>
  <div class="bg-white rounded shadow-sm border p-5">
    <h3 v-if="title" class="font-semibold mb-3 text-gray-800">
      {{ title }}
    </h3>
    <slot />
  </div>
</template>
