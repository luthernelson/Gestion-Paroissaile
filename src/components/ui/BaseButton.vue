<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'

withDefaults(defineProps<{
  label?: string
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'success'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  shape?: 'rounded' | 'pill' | 'square'
  icon?: any
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}>(), {
  type: 'button',
  variant: 'primary',
  size: 'md',
  shape: 'rounded',
  loading: false,
  disabled: false,
  iconPosition: 'left',
  fullWidth: false,
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 select-none',
      // Taille
      size === 'xs'  && 'text-xs px-2.5 py-1.5 gap-1',
      size === 'sm'  && 'text-sm px-3.5 py-2 gap-1.5',
      size === 'md'  && 'text-sm px-5 py-2.5 gap-2',
      size === 'lg'  && 'text-base px-6 py-3 gap-2.5',
      // Forme
      shape === 'rounded' && 'rounded-lg',
      shape === 'pill'    && 'rounded-full',
      shape === 'square'  && 'rounded-none',
      // Variante
      variant === 'primary'   && 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white focus:ring-green-500 shadow-sm hover:shadow-md',
      variant === 'secondary' && 'bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 focus:ring-gray-400',
      variant === 'danger'    && 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white focus:ring-red-500 shadow-sm',
      variant === 'ghost'     && 'bg-transparent hover:bg-green-50 active:bg-green-100 text-green-700 focus:ring-green-400',
      variant === 'outline'   && 'bg-transparent border-2 border-green-600 text-green-700 hover:bg-green-50 active:bg-green-100 focus:ring-green-400',
      variant === 'success'   && 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white focus:ring-emerald-400 shadow-sm',
      // Disabled / loading
      (disabled || loading) && 'opacity-50 cursor-not-allowed pointer-events-none',
      // Full width
      fullWidth && 'w-full',
    ]"
    @click="emit('click', $event)"
  >
    <!-- Spinner loading -->
    <Loader2 v-if="loading" class="animate-spin flex-shrink-0"
      :class="size === 'xs' ? 'h-3 w-3' : size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'"
    />

    <!-- Icône gauche -->
    <component
      v-else-if="icon && iconPosition === 'left'"
      :is="icon"
      class="flex-shrink-0"
      :class="size === 'xs' ? 'h-3 w-3' : size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'"
    />

    <!-- Slot ou label -->
    <slot>{{ label }}</slot>

    <!-- Icône droite -->
    <component
      v-if="icon && iconPosition === 'right' && !loading"
      :is="icon"
      class="flex-shrink-0"
      :class="size === 'xs' ? 'h-3 w-3' : size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'"
    />
  </button>
</template>