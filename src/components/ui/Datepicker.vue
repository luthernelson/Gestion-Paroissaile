<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  modelValue?: string | null
  label?: string
  placeholder?: string
  error?: string
  hint?: string
  disabled?: boolean
  required?: boolean
  clearable?: boolean
  minDate?: string
  maxDate?: string
}>(), {
  placeholder: 'Sélectionner une date',
  disabled: false,
  required: false,
  clearable: true,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
}>()

const open       = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const dropdownStyle = ref<Record<string, string>>({})

const today      = new Date()
const viewYear   = ref(today.getFullYear())
const viewMonth  = ref(today.getMonth())

const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const DAYS   = ['Lu','Ma','Me','Je','Ve','Sa','Di']

const selected = computed(() => props.modelValue ? new Date(props.modelValue + 'T00:00:00') : null)

const displayValue = computed(() => {
  if (!selected.value) return ''
  return selected.value.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
})

const calendarDays = computed(() => {
  const firstDay = new Date(viewYear.value, viewMonth.value, 1)
  const lastDay  = new Date(viewYear.value, viewMonth.value + 1, 0)
  const startDow = (firstDay.getDay() + 6) % 7
  const days: Array<{ date: Date | null }> = []
  for (let i = 0; i < startDow; i++) days.push({ date: null })
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push({ date: new Date(viewYear.value, viewMonth.value, d) })
  }
  return days
})

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}
function isToday(date: Date) { return isSameDay(date, today) }
function isDisabled(date: Date) {
  if (props.minDate && date < new Date(props.minDate)) return true
  if (props.maxDate && date > new Date(props.maxDate)) return true
  return false
}

function selectDate(date: Date | null) {
  if (!date || isDisabled(date)) return
  emit('update:modelValue', date.toISOString().split('T')[0] || null)
  open.value = false
}

function prevMonth() {
  if (viewMonth.value === 0) { viewMonth.value = 11; viewYear.value-- }
  else viewMonth.value--
}
function nextMonth() {
  if (viewMonth.value === 11) { viewMonth.value = 0; viewYear.value++ }
  else viewMonth.value++
}
function clear() { emit('update:modelValue', null) }

// ── Positionnement fixe (évite le scroll drift) ───────────────────────────
function computePosition() {
  if (!triggerRef.value) return
  const rect = triggerRef.value.getBoundingClientRect()
  const spaceBelow = window.innerHeight - rect.bottom
  const dropH = 340 // hauteur estimée du calendrier

  if (spaceBelow >= dropH || spaceBelow > rect.top) {
    dropdownStyle.value = {
      position: 'fixed',
      top:  `${rect.bottom + 6}px`,
      left: `${rect.left}px`,
      width: `${Math.max(rect.width, 288)}px`,
    }
  } else {
    dropdownStyle.value = {
      position: 'fixed',
      bottom: `${window.innerHeight - rect.top + 6}px`,
      left:   `${rect.left}px`,
      width:  `${Math.max(rect.width, 288)}px`,
    }
  }
}

async function toggleOpen() {
  if (props.disabled) return
  open.value = !open.value
  if (open.value) {
    await nextTick()
    computePosition()
  }
}

function closeOnOutside(e: MouseEvent) {
  const target = e.target as Node
  if (!triggerRef.value?.contains(target)) {
    const dropdown = document.getElementById('datepicker-dropdown')
    if (!dropdown?.contains(target)) open.value = false
  }
}

// Reposition on scroll/resize
function onScrollResize() { if (open.value) computePosition() }

onMounted(() => {
  document.addEventListener('click', closeOnOutside)
  window.addEventListener('scroll', onScrollResize, true)
  window.addEventListener('resize', onScrollResize)
})
onUnmounted(() => {
  document.removeEventListener('click', closeOnOutside)
  window.removeEventListener('scroll', onScrollResize, true)
  window.removeEventListener('resize', onScrollResize)
})

watch(open, v => {
  if (v && selected.value) {
    viewYear.value  = selected.value.getFullYear()
    viewMonth.value = selected.value.getMonth()
  }
})
</script>

<template>
  <div class="flex flex-col gap-1.5 w-full">
    <label v-if="label" class="text-sm font-semibold text-gray-700 dark:text-slate-300">
      {{ label }}<span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>

    <!-- Trigger -->
    <div
      ref="triggerRef"
      class="relative flex items-center px-3.5 py-2.5 rounded-lg border bg-white dark:bg-slate-800 cursor-pointer transition-all duration-150 select-none"
      :class="[
        open        ? 'border-green-500 ring-2 ring-green-500/30' :
        error       ? 'border-red-400 bg-red-50' :
                      'border-gray-300 dark:border-slate-600 hover:border-gray-400',
        disabled && 'opacity-50 cursor-not-allowed',
      ]"
      @click="toggleOpen"
    >
      <Calendar class="h-4 w-4 text-gray-400 mr-2.5 flex-shrink-0" />
      <span class="flex-1 text-sm" :class="displayValue ? 'text-gray-800 dark:text-slate-200' : 'text-gray-400'">
        {{ displayValue || placeholder }}
      </span>
      <button v-if="clearable && modelValue" type="button"
              class="text-gray-400 hover:text-gray-600 ml-1 z-10"
              @click.stop="clear">
        <X class="h-4 w-4" />
      </button>
    </div>

    <!-- Calendrier — Teleport + fixed pour éviter le scroll drift -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 scale-95 -translate-y-1"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="open"
          id="datepicker-dropdown"
          :style="dropdownStyle"
          class="z-[9999] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-2xl p-3"
        >
          <!-- Nav mois -->
          <div class="flex items-center justify-between mb-3">
            <button type="button"
                    class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    @click.stop="prevMonth">
              <ChevronLeft class="h-4 w-4 text-gray-600 dark:text-slate-300" />
            </button>
            <span class="text-sm font-bold text-gray-800 dark:text-slate-200">
              {{ MONTHS[viewMonth] }} {{ viewYear }}
            </span>
            <button type="button"
                    class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    @click.stop="nextMonth">
              <ChevronRight class="h-4 w-4 text-gray-600 dark:text-slate-300" />
            </button>
          </div>

          <!-- Jours semaine -->
          <div class="grid grid-cols-7 mb-1">
            <div v-for="d in DAYS" :key="d"
                 class="text-center text-xs font-bold text-gray-400 py-1">{{ d }}</div>
          </div>

          <!-- Grille jours -->
          <div class="grid grid-cols-7 gap-0.5">
            <div v-for="(day, i) in calendarDays" :key="i">
              <button
                v-if="day.date"
                type="button"
                :disabled="isDisabled(day.date)"
                class="w-full aspect-square flex items-center justify-center text-sm rounded-lg transition-all duration-100 font-medium"
                :class="[
                  selected && isSameDay(day.date, selected)
                    ? 'bg-green-600 text-white shadow-sm'
                    : isToday(day.date)
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'text-gray-700 dark:text-slate-300 hover:bg-green-50 dark:hover:bg-slate-700',
                  isDisabled(day.date) && 'opacity-30 cursor-not-allowed hover:bg-transparent',
                ]"
                @click.stop="selectDate(day.date)"
              >{{ day.date.getDate() }}</button>
              <div v-else class="w-full aspect-square" />
            </div>
          </div>

          <!-- Aujourd'hui -->
          <div class="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
            <button type="button"
                    class="w-full text-xs text-green-600 dark:text-green-400 font-semibold hover:underline"
                    @click.stop="selectDate(today)">
              Aujourd'hui
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
    <p v-else-if="hint" class="text-xs text-gray-400">{{ hint }}</p>
  </div>
</template>