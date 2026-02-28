<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: string | number | null
  label?: string
  placeholder?: string
  type?: 'text' | 'number' | 'email' | 'password' | 'tel' | 'url' | 'search'
  size?: 'sm' | 'md' | 'lg'
  error?: string
  hint?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  clearable?: boolean
  icon?: any
  iconPosition?: 'left' | 'right'
  min?: number
  max?: number
  step?: number
  id?: string
}>(), {
  type: 'text',
  size: 'md',
  disabled: false,
  readonly: false,
  required: false,
  clearable: false,
  iconPosition: 'left',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | null): void
  (e: 'blur', event: FocusEvent): void
  (e: 'focus', event: FocusEvent): void
  (e: 'clear'): void
}>()

const inputId = computed(() => props.id ?? `input-${Math.random().toString(36).slice(2, 7)}`)

function onInput(e: Event) {
  const val = (e.target as HTMLInputElement).value
  emit('update:modelValue', props.type === 'number' ? (val === '' ? null : Number(val)) : val)
}

function clear() {
  emit('update:modelValue', props.type === 'number' ? null : '')
  emit('clear')
}
</script>

<template>
  <div class="flex flex-col gap-1.5 w-full">
    <!-- Label -->
    <label v-if="label" :for="inputId" class="text-sm font-semibold text-gray-700 dark:text-slate-300">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>

    <!-- Wrapper input -->
    <div class="relative flex items-center">
      <!-- Icône gauche -->
      <span v-if="icon && iconPosition === 'left'" class="absolute left-3 text-gray-400 dark:text-slate-500 pointer-events-none flex-shrink-0">
        <component :is="icon" :class="size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'" />
      </span>

      <input
        :id="inputId"
        :type="type"
        :value="modelValue ?? ''"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :min="min"
        :max="max"
        :step="step"
        :class="[
          'w-full border rounded-lg bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500',
          'transition-all duration-150 outline-none',
          'focus:ring-2 focus:ring-green-500 focus:border-green-500',
          // Taille
          size === 'sm' && 'text-sm py-1.5 px-3',
          size === 'md' && 'text-sm py-2.5 px-3.5',
          size === 'lg' && 'text-base py-3 px-4',
          // Padding icône gauche
          icon && iconPosition === 'left' && (size === 'sm' ? 'pl-8' : size === 'lg' ? 'pl-11' : 'pl-10'),
          // Padding icône droite ou clearable
          (icon && iconPosition === 'right') || clearable ? (size === 'sm' ? 'pr-8' : size === 'lg' ? 'pr-11' : 'pr-10') : '',
          // Erreur
          error
            ? 'border-red-400 focus:ring-red-400 focus:border-red-400 bg-red-50 dark:bg-red-900/10'
            : 'border-gray-300 dark:border-slate-600',
          // Disabled
          disabled && 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-slate-700',
          // Readonly
          readonly && 'bg-gray-50 dark:bg-slate-700 cursor-default',
        ]"
        @input="onInput"
        @blur="emit('blur', $event)"
        @focus="emit('focus', $event)"
      />

      <!-- Bouton clear -->
      <button
        v-if="clearable && modelValue !== '' && modelValue !== null && modelValue !== undefined"
        type="button"
        class="absolute right-3 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
        @click="clear"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Icône droite (si pas clearable) -->
      <span v-else-if="icon && iconPosition === 'right'" class="absolute right-3 text-gray-400 dark:text-slate-500 pointer-events-none">
        <component :is="icon" :class="size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'" />
      </span>
    </div>

    <!-- Erreur -->
    <p v-if="error" class="text-xs text-red-500 flex items-center gap-1">
      <svg class="h-3.5 w-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
      {{ error }}
    </p>

    <!-- Hint -->
    <p v-else-if="hint" class="text-xs text-gray-400 dark:text-slate-500">{{ hint }}</p>
  </div>
</template>