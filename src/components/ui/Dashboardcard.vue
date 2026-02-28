<script setup lang="ts">
import BaseSkeleton from './BaseSkeleton.vue'

withDefaults(defineProps<{
  title: string
  value?: string | number
  subtitle?: string
  icon?: any
  iconColor?: 'green' | 'blue' | 'red' | 'amber' | 'purple' | 'indigo' | 'teal'
  trend?: number       // % de variation ex: +12.5 ou -3.2
  trendLabel?: string  // ex: "vs mois dernier"
  loading?: boolean
  clickable?: boolean
}>(), {
  iconColor: 'green',
  loading: false,
  clickable: false,
})

const emit = defineEmits<{
  (e: 'click'): void
}>()

const colorMap: Record<string, { bg: string; text: string; light: string }> = {
  green:  { bg: 'bg-green-600',  text: 'text-green-600',  light: 'bg-green-100 dark:bg-green-900/30' },
  blue:   { bg: 'bg-blue-600',   text: 'text-blue-600',   light: 'bg-blue-100 dark:bg-blue-900/30' },
  red:    { bg: 'bg-red-500',    text: 'text-red-500',    light: 'bg-red-100 dark:bg-red-900/30' },
  amber:  { bg: 'bg-amber-500',  text: 'text-amber-500',  light: 'bg-amber-100 dark:bg-amber-900/30' },
  purple: { bg: 'bg-purple-600', text: 'text-purple-600', light: 'bg-purple-100 dark:bg-purple-900/30' },
  indigo: { bg: 'bg-indigo-600', text: 'text-indigo-600', light: 'bg-indigo-100 dark:bg-indigo-900/30' },
  teal:   { bg: 'bg-teal-600',   text: 'text-teal-600',   light: 'bg-teal-100 dark:bg-teal-900/30' },
}
</script>

<template>
  <div
    class="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5 flex flex-col gap-4 transition-all duration-200"
    :class="clickable ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''"
    @click="clickable && emit('click')"
  >
    <!-- En-tête : titre + icône -->
    <div class="flex items-start justify-between gap-3">
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide truncate">
          <BaseSkeleton v-if="loading" height="14px" width="60%" />
          <template v-else>{{ title }}</template>
        </p>
      </div>
      <div
        v-if="icon"
        class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        :class="colorMap[iconColor]?.light"
      >
        <component :is="icon" class="h-5 w-5" :class="colorMap[iconColor]?.text" />
      </div>
    </div>

    <!-- Valeur principale -->
    <div>
      <BaseSkeleton v-if="loading" height="36px" width="50%" rounded="lg" />
      <p v-else class="text-3xl font-black text-gray-800 dark:text-slate-100 leading-none tracking-tight">
        {{ value ?? '—' }}
      </p>
    </div>

    <!-- Tendance + sous-titre -->
    <div class="flex items-center justify-between gap-2 pt-1 border-t border-gray-50 dark:border-slate-800">
      <BaseSkeleton v-if="loading" height="14px" width="70%" />
      <template v-else>
        <!-- Trend -->
        <div v-if="trend !== undefined" class="flex items-center gap-1">
          <span
            class="inline-flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded-full"
            :class="trend >= 0
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'"
          >
            <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" :d="trend >= 0 ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'" />
            </svg>
            {{ trend >= 0 ? '+' : '' }}{{ trend }}%
          </span>
          <span v-if="trendLabel" class="text-xs text-gray-400 dark:text-slate-500">{{ trendLabel }}</span>
        </div>

        <!-- Subtitle -->
        <p v-if="subtitle" class="text-xs text-gray-400 dark:text-slate-500 truncate">{{ subtitle }}</p>

        <!-- Slot custom footer -->
        <slot name="footer" />
      </template>
    </div>

    <!-- Slot body supplémentaire -->
    <slot />
  </div>
</template>