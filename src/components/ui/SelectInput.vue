<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ChevronDown } from 'lucide-vue-next'

// ─── Props ────────────────────────────────────────────────────────
interface SelectOption {
  label: string
  value: string | number
}

const props = withDefaults(defineProps<{
  // Options : tableau de strings OU d'objets { label, value }
  options: string[] | SelectOption[]
  modelValue?: string | number | null
  placeholder?: string
  // Hauteur max du panel en px avant scroll (défaut 220)
  maxHeight?: number
  // Désactivé
  disabled?: boolean
}>(), {
  placeholder: 'Sélectionner...',
  maxHeight: 220,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
}>()

// ─── Normalisation des options ─────────────────────────────────
const normalizedOptions = computed<SelectOption[]>(() =>
  props.options.map(opt =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  )
)

// ─── Label affiché dans le bouton ──────────────────────────────
const selectedLabel = computed(() => {
  if (props.modelValue === null || props.modelValue === undefined || props.modelValue === '') {
    return props.placeholder
  }
  return normalizedOptions.value.find(o => o.value === props.modelValue)?.label ?? props.placeholder
})

const hasValue = computed(() =>
  props.modelValue !== null && props.modelValue !== undefined && props.modelValue !== ''
)

// ─── Ouverture / fermeture ─────────────────────────────────────
const open = ref(false)
const buttonRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)

function toggle() {
  if (props.disabled) return
  open.value = !open.value
}

function select(value: string | number) {
  emit('update:modelValue', value)
  open.value = false
}

// Fermer si clic extérieur
function onClickOutside(e: MouseEvent) {
  const target = e.target as Node
  if (
    buttonRef.value && !buttonRef.value.contains(target) &&
    panelRef.value && !panelRef.value.contains(target)
  ) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', onClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', onClickOutside))
</script>

<template>
  <div class="relative inline-block w-full">

    <!-- Bouton déclencheur -->
    <button
      ref="buttonRef"
      type="button"
      class="flex w-full items-center justify-between gap-2 px-4 py-2 rounded-lg border text-sm font-semibold transition-colors"
      :class="[
        disabled
          ? 'bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-400 cursor-not-allowed'
          : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:border-green-400 dark:hover:border-green-500 cursor-pointer',
        open && !disabled ? 'border-green-400 dark:border-green-500 ring-2 ring-green-100 dark:ring-green-900/30' : '',
      ]"
      :disabled="disabled"
      @click="toggle"
    >
      <span
        class="truncate"
        :class="hasValue ? 'text-gray-800 dark:text-slate-100' : 'text-gray-400 dark:text-slate-500'"
      >
        {{ selectedLabel }}
      </span>
      <ChevronDown
        class="h-4 w-4 flex-shrink-0 text-gray-400 transition-transform duration-200"
        :class="open ? 'rotate-180' : ''"
      />
    </button>

    <!-- Panel déroulant -->
    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="opacity-0 scale-95 -translate-y-1"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-1"
    >
      <div
        v-if="open"
        ref="panelRef"
        class="absolute z-50 mt-1 w-full min-w-[140px] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-lg py-1 overflow-y-auto scrollbar-green"
        :style="{ maxHeight: `${maxHeight}px` }"
      >
        <button
          v-for="opt in normalizedOptions"
          :key="opt.value"
          type="button"
          class="w-full text-left px-4 py-2 text-sm transition-colors"
          :class="
            modelValue === opt.value
              ? 'text-green-700 dark:text-green-400 font-semibold bg-green-50 dark:bg-green-900/20'
              : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
          "
          @click="select(opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
.scrollbar-green {
  scrollbar-width: thin;
  scrollbar-color: #2d8a48 transparent;
}
.scrollbar-green::-webkit-scrollbar {
  width: 1px;
}
.scrollbar-green::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-green::-webkit-scrollbar-thumb {
  background-color: #2d8a48;
  border-radius: 99px;
}
.scrollbar-green::-webkit-scrollbar-thumb:hover {
  background-color: #1a5c2a;
}
</style>