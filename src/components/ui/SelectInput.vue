<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { X, ChevronDown, Check, Search } from 'lucide-vue-next'

export interface Option {
  value: string | number
  label: string
  [key: string]: any
}

const props = withDefaults(defineProps<{
  modelValue?: Option[]
  options: Option[]
  label?: string
  placeholder?: string
  searchPlaceholder?: string
  error?: string
  hint?: string
  disabled?: boolean
  required?: boolean
  multiple?: boolean
  maxSelected?: number
  clearable?: boolean
}>(), {
  modelValue: () => [],
  multiple: true,
  disabled: false,
  required: false,
  clearable: true,
  placeholder: 'Sélectionner...',
  searchPlaceholder: 'Rechercher...',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: Option[]): void 
}>()

const open = ref(false)
const search = ref('')
const wrapperRef = ref<HTMLElement | null>(null)

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return props.options
  return props.options.filter(o => o.label.toLowerCase().includes(q))
})

const isSelected = (opt: Option) =>
  (props.modelValue ?? []).some(v => v.value === opt.value)

function toggle(opt: Option) {
  if (props.disabled) return
  const current = [...(props.modelValue ?? [])]
  const idx = current.findIndex(v => v.value === opt.value)
  if (idx >= 0) {
    current.splice(idx, 1)
  } else {
    if (props.maxSelected && current.length >= props.maxSelected) return
    if (!props.multiple) {
      
      emit('update:modelValue', [opt])
      open.value = false
      return
    }
    current.push(opt)
  }
  emit('update:modelValue', current)
}

function remove(opt: Option) {
  emit('update:modelValue', (props.modelValue ?? []).filter(v => v.value !== opt.value))
}

function clearAll() {
  emit('update:modelValue', [])
  search.value = ''
}

function closeOnOutside(e: MouseEvent) {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target as Node)) {
    open.value = false
    search.value = ''
  }
}

onMounted(() => document.addEventListener('click', closeOnOutside))
onUnmounted(() => document.removeEventListener('click', closeOnOutside))

watch(open, v => { if (!v) search.value = '' })
</script>

<template>
  <div ref="wrapperRef" class="flex flex-col gap-1.5 w-full">
    <!-- Label -->
    <label v-if="label" class="text-sm font-semibold text-gray-700 dark:text-slate-300">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>

    <!-- Trigger -->
    <div
      class="relative min-h-[42px] w-full px-3 py-2 flex flex-wrap gap-1.5 items-center cursor-pointer rounded-lg border transition-all duration-150"
      :class="[
        open ? 'border-green-500 ring-2 ring-green-500/30' : error ? 'border-red-400' : 'border-gray-300 dark:border-slate-600',
        disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-slate-700' : 'bg-white dark:bg-slate-800',
      ]"
      @click="!disabled && (open = !open)"
    >
      <!-- Tags sélectionnés -->
      <template v-if="modelValue && modelValue.length">
        <span
          v-for="item in modelValue" :key="item.value"
          class="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium px-2 py-0.5 rounded-full"
        >
          {{ item.label }}
          <button
            type="button"
            class="hover:text-red-500 transition-colors"
            @click.stop="remove(item)"
          >
            <X class="h-3 w-3" />
          </button>
        </span>
      </template>

      <!-- Placeholder -->
      <span v-else class="text-sm text-gray-400 dark:text-slate-500">{{ placeholder }}</span>

      <!-- Actions droite -->
      <div class="ml-auto flex items-center gap-1 pl-2 flex-shrink-0">
        <button
          v-if="clearable && modelValue && modelValue.length"
          type="button"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
          @click.stop="clearAll"
        >
          <X class="h-4 w-4" />
        </button>
        <ChevronDown
          class="h-4 w-4 text-gray-400 transition-transform duration-200"
          :class="open ? 'rotate-180' : ''"
        />
      </div>
    </div>

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-95 -translate-y-1"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-1"
    >
      <div
        v-if="open"
        class="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-xl overflow-hidden"
        style="min-width: 100%"
      >
        <!-- Recherche -->
        <div class="p-2 border-b border-gray-100 dark:border-slate-700">
          <div class="relative">
            <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              v-model="search"
              type="text"
              :placeholder="searchPlaceholder"
              class="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-slate-200 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500"
              @click.stop
            />
          </div>
        </div>

        <!-- Liste options -->
        <ul class="max-h-52 overflow-y-auto py-1 custom-scroll">
          <li v-if="!filtered.length" class="px-4 py-3 text-sm text-gray-400 text-center">Aucun résultat</li>
          <li
            v-for="opt in filtered" :key="opt.value"
            class="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors text-sm"
            :class="isSelected(opt) ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'"
            @click.stop="toggle(opt)"
          >
            <!-- Checkbox visuelle -->
            <span
              class="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors"
              :class="isSelected(opt) ? 'bg-green-600 border-green-600' : 'border-gray-300 dark:border-slate-500'"
            >
              <Check v-if="isSelected(opt)" class="h-3 w-3 text-white" />
            </span>
            {{ opt.label }}
          </li>
        </ul>

        <!-- Footer compteur -->
        <div v-if="multiple && modelValue && modelValue.length" class="px-4 py-2 border-t border-gray-100 dark:border-slate-700 text-xs text-gray-400">
          {{ modelValue.length }} sélectionné{{ modelValue.length > 1 ? 's' : '' }}
          <span v-if="maxSelected"> / {{ maxSelected }}</span>
        </div>
      </div>
    </Transition>

    <!-- Erreur / hint -->
    <p v-if="error" class="text-xs text-red-500 flex items-center gap-1">
      <svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
      {{ error }}
    </p>
    <p v-else-if="hint" class="text-xs text-gray-400">{{ hint }}</p>
  </div>
</template>

<style scoped>
.custom-scroll { scrollbar-width: thin; scrollbar-color: #16a34a #f0fdf4; }
.custom-scroll::-webkit-scrollbar { width: 5px; }
.custom-scroll::-webkit-scrollbar-track { background: #f0fdf4; }
.custom-scroll::-webkit-scrollbar-thumb { background: #16a34a; border-radius: 10px; }
</style>