<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'

defineProps<{
  title: string
  description?: string
  icon?: any          // composant lucide
  badge?: string      // texte badge (ex: "En ligne", "3 publiés")
  badgeVariant?: 'success' | 'warning' | 'danger' | 'info' | 'default'
  to?: string | object  // route — si présent la card est cliquable
  disabled?: boolean
}>()
</script>

<template>
  <component
    :is="to ? 'router-link' : 'div'"
    v-bind="to ? { to } : {}"
    class="group flex items-start gap-4 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm transition-all duration-150"
    :class="[
      to && !disabled ? 'cursor-pointer hover:border-green-300 hover:shadow-md dark:hover:border-green-700' : '',
      disabled ? 'opacity-50 cursor-not-allowed' : '',
    ]"
  >
    <!-- Icône -->
    <div
      v-if="icon"
      class="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 transition-colors"
      :class="to && !disabled ? 'group-hover:bg-green-100 dark:group-hover:bg-green-900/30' : ''"
    >
      <component :is="icon" class="w-5 h-5" />
    </div>

    <!-- Texte -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 flex-wrap">
        <p class="text-sm font-bold text-gray-900 dark:text-white leading-snug">{{ title }}</p>
        <span
          v-if="badge"
          class="text-[11px] font-medium px-2 py-0.5 rounded-full"
          :class="{
            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400':  badgeVariant === 'success' || !badgeVariant,
            'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400':  badgeVariant === 'warning',
            'bg-red-100   text-red-700   dark:bg-red-900/30   dark:text-red-400':    badgeVariant === 'danger',
            'bg-blue-100  text-blue-700  dark:bg-blue-900/30  dark:text-blue-400':   badgeVariant === 'info',
            'bg-gray-100  text-gray-600  dark:bg-slate-700    dark:text-slate-300':  badgeVariant === 'default',
          }"
        >
          {{ badge }}
        </span>
      </div>
      <p v-if="description" class="text-xs text-gray-500 dark:text-slate-400 mt-0.5 leading-relaxed">
        {{ description }}
      </p>
      <!-- Slot pour contenu additionnel (stats, preview, etc.) -->
      <slot />
    </div>

    <!-- Chevron si cliquable -->
    <ChevronRight
      v-if="to && !disabled"
      class="flex-shrink-0 w-4 h-4 text-gray-400 dark:text-slate-500 mt-0.5 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-green-600 dark:group-hover:text-green-400"
    />
  </component>
</template>