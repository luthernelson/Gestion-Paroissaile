<script setup lang="ts">
defineProps<{
  label: string
  type?: 'button' | 'submit'
  danger?: boolean
}>()

const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <button
    :type="type || 'button'"
    @click="emit('click')"
    :class="[
      'px-4 py-2 rounded text-sm font-medium transition',
      danger
        ? 'bg-red-600 hover:bg-red-700 text-white'
        : 'bg-green-700 hover:bg-green-800 text-white'
    ]"
  >
    {{ label }}
  </button>
</template>
