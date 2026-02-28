<script setup lang="ts">
withDefaults(defineProps<{
  className?: string
  width?: string
  height?: string
  rounded?: 'sm' | 'md' | 'lg' | 'full' | 'none'
  lines?: number
}>(), {
  className: '',
  rounded: 'md',
  lines: 1,
})
</script>

<template>
  <!-- Plusieurs lignes -->
  <div v-if="lines > 1" class="space-y-2">
    <div
      v-for="i in lines"
      :key="i"
      class="animate-pulse bg-gray-200 dark:bg-gray-700"
      :class="[
        className,
        rounded === 'sm'   && 'rounded-sm',
        rounded === 'md'   && 'rounded',
        rounded === 'lg'   && 'rounded-lg',
        rounded === 'full' && 'rounded-full',
        rounded === 'none' && 'rounded-none',
        // Dernière ligne plus courte pour un effet naturel
        i === lines && lines > 1 && 'w-3/4',
      ]"
      :style="{
        width: i === lines && lines > 1 ? undefined : width,
        height: height ?? '1rem',
      }"
    >&nbsp;</div>
  </div>

  <!-- Ligne unique -->
  <div
    v-else
    class="animate-pulse bg-gray-200 dark:bg-gray-700"
    :class="[
      className,
      rounded === 'sm'   && 'rounded-sm',
      rounded === 'md'   && 'rounded',
      rounded === 'lg'   && 'rounded-lg',
      rounded === 'full' && 'rounded-full',
      rounded === 'none' && 'rounded-none',
    ]"
    :style="{ width, height: height ?? '1rem' }"
  >&nbsp;</div>
</template>