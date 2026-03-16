<script setup lang="ts">
import { ref, watch } from 'vue'
import { Search, X } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  debounce?: number
  disabled?: boolean
}>(), {
  modelValue: '',
  placeholder: 'Rechercher...',
  debounce: 0,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputRef  = ref<HTMLInputElement | null>(null)
const localValue = ref(props.modelValue)

// Sync si la valeur change de l'extérieur (ex: reset filtres)
watch(() => props.modelValue, (val) => {
  if (val !== localValue.value) localValue.value = val
})

// Debounce interne
let debounceTimer: ReturnType<typeof setTimeout>
watch(localValue, (val) => {
  if (props.debounce > 0) {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => emit('update:modelValue', val), props.debounce)
  } else {
    emit('update:modelValue', val)
  }
})

function clear() {
  localValue.value = ''
  inputRef.value?.focus()
}
</script>

<template>
  <div
    class="relative flex items-center w-full"
    :class="disabled ? 'opacity-50 pointer-events-none' : ''"
  >
    <!-- Icône loupe -->
    <Search
      class="absolute left-3 w-4 h-4 text-gray-400 dark:text-slate-500 pointer-events-none flex-shrink-0"
    />

    <!-- Input -->
    <input
      ref="inputRef"
      v-model="localValue"
      type="text"
      :placeholder="placeholder"
      :disabled="disabled"
      class="w-full h-[42px] pl-9 pr-8 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
    />

    <!-- Bouton effacer -->
    <button
      v-if="localValue"
      type="button"
      class="absolute right-2.5 p-0.5 rounded text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
      tabindex="-1"
      @click="clear"
    >
      <X class="w-3.5 h-3.5" />
    </button>
  </div>
</template>