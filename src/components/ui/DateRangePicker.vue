<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ChevronLeft, ChevronRight, CalendarRange, X } from 'lucide-vue-next'

export interface DateRange {
  start: string | null | undefined
  end: string | null | undefined
}

const props = withDefaults(defineProps<{
  modelValue?: DateRange
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
  modelValue: () => ({ start: null, end: null }),
  placeholder: 'Sélectionner une période',
  disabled: false,
  required: false,
  clearable: true,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: DateRange): void
}>()

const open = ref(false)
const wrapperRef = ref<HTMLElement | null>(null)
const hovered = ref<Date | null>(null)

const today = new Date()
const leftYear  = ref(today.getFullYear())
const leftMonth = ref(today.getMonth() === 0 ? 11 : today.getMonth() - 1)
const leftYearAdj = ref(today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear())

// Mois droit = mois courant
const rightMonth = computed(() => (leftMonth.value + 1) % 12)
const rightYear  = computed(() => leftMonth.value === 11 ? leftYearAdj.value + 1 : leftYearAdj.value)

const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const DAYS   = ['Lu','Ma','Me','Je','Ve','Sa','Di']

const startDate = computed(() => props.modelValue?.start ? new Date(props.modelValue.start) : null)
const endDate   = computed(() => props.modelValue?.end   ? new Date(props.modelValue.end)   : null)

const displayValue = computed(() => {
  const s = startDate.value
  const e = endDate.value
  if (!s && !e) return ''
  const fmt = (d: Date) => d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
  if (s && !e) return `${fmt(s)} → ...`
  if (s && e) return `${fmt(s)} → ${fmt(e)}`
  return ''
})

function buildDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const lastDay  = new Date(year, month + 1, 0)
  const startDow = (firstDay.getDay() + 6) % 7
  const days: Array<Date | null> = []
  for (let i = 0; i < startDow; i++) days.push(null)
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d))
  return days
}

const leftDays  = computed(() => buildDays(leftYearAdj.value, leftMonth.value))
const rightDays = computed(() => buildDays(rightYear.value, rightMonth.value))

function isSame(a: Date | null, b: Date | null) {
  if (!a || !b) return false
  return a.toDateString() === b.toDateString()
}

function inRange(date: Date) {
  const s = startDate.value
  const e = endDate.value || hovered.value
  if (!s || !e) return false
  const [min, max] = s <= e ? [s, e] : [e, s]
  return date > min && date < max
}

function isStart(date: Date) { return isSame(date, startDate.value) }
function isEnd(date: Date)   { return isSame(date, endDate.value) }

function isDisabled(date: Date) {
  if (props.minDate && date < new Date(props.minDate)) return true
  if (props.maxDate && date > new Date(props.maxDate)) return true
  return false
}

function selectDate(date: Date | null) {
  if (!date || isDisabled(date)) return
  const s = startDate.value
  const e = endDate.value
  const iso = (d: Date) => d.toISOString().split('T')[0]

  if (!s || (s && e)) {
    // Nouveau départ
    emit('update:modelValue', { start: iso(date), end: null })
  } else {
    // Fin de sélection
    if (date < s) {
      emit('update:modelValue', { start: iso(date), end: iso(s) })
    } else {
      emit('update:modelValue', { start: iso(s), end: iso(date) })
    }
  }
}

function prevMonth() {
  if (leftMonth.value === 0) { leftMonth.value = 11; leftYearAdj.value-- }
  else leftMonth.value--
}

function nextMonth() {
  if (leftMonth.value === 11) { leftMonth.value = 0; leftYearAdj.value++ }
  else leftMonth.value++
}

// Raccourcis rapides
const shortcuts = [
  { label: "Aujourd'hui",     action: () => setRange(0, 0) },
  { label: '7 derniers jours', action: () => setRange(-6, 0) },
  { label: '30 derniers jours',action: () => setRange(-29, 0) },
  { label: 'Ce mois',          action: () => setMonth(0) },
  { label: 'Mois dernier',     action: () => setMonth(-1) },
]

function setRange(startOffset: number, endOffset: number) {
  const s = new Date(); s.setDate(s.getDate() + startOffset)
  const e = new Date(); e.setDate(e.getDate() + endOffset)
  const iso = (d: Date) => d.toISOString().split('T')[0]
  emit('update:modelValue', { start: iso(s), end: iso(e) })
  open.value = false
}

function setMonth(offset: number) {
  const d = new Date()
  d.setMonth(d.getMonth() + offset)
  const s = new Date(d.getFullYear(), d.getMonth(), 1)
  const e = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  const iso = (dd: Date) => dd.toISOString().split('T')[0]
  emit('update:modelValue', { start: iso(s), end: iso(e) })
  open.value = false
}

function clear() {
  emit('update:modelValue', { start: null, end: null })
}

function closeOnOutside(e: MouseEvent) {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target as Node)) open.value = false
}

onMounted(() => document.addEventListener('click', closeOnOutside))
onUnmounted(() => document.removeEventListener('click', closeOnOutside))
</script>

<template>
  <div ref="wrapperRef" class="flex flex-col gap-1.5 w-full">
    <label v-if="label" class="text-sm font-semibold text-gray-700 dark:text-slate-300">
      {{ label }}<span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>

    <!-- Trigger -->
    <div
      class="relative flex items-center px-3.5 py-2.5 rounded-lg border bg-white dark:bg-slate-800 cursor-pointer transition-all duration-150"
      :class="[
        open ? 'border-green-500 ring-2 ring-green-500/30' : error ? 'border-red-400' : 'border-gray-300 dark:border-slate-600',
        disabled && 'opacity-50 cursor-not-allowed',
      ]"
      @click="!disabled && (open = !open)"
    >
      <CalendarRange class="h-4 w-4 text-gray-400 mr-2.5 flex-shrink-0" />
      <span class="flex-1 text-sm" :class="displayValue ? 'text-gray-800 dark:text-slate-200' : 'text-gray-400'">
        {{ displayValue || placeholder }}
      </span>
      <button v-if="clearable && (modelValue?.start || modelValue?.end)" type="button" class="text-gray-400 hover:text-gray-600 ml-1" @click.stop="clear">
        <X class="h-4 w-4" />
      </button>
    </div>

    <!-- Dropdown calendrier double -->
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
        class="absolute z-50 mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-2xl overflow-hidden"
        style="min-width: 580px"
      >
        <div class="flex">
          <!-- Raccourcis -->
          <div class="w-36 border-r border-gray-100 dark:border-slate-700 py-2 flex flex-col">
            <p class="px-3 py-1.5 text-[10px] font-bold uppercase text-gray-400 tracking-wider">Raccourcis</p>
            <button
              v-for="s in shortcuts" :key="s.label"
              type="button"
              class="text-left px-3 py-2 text-xs text-gray-600 dark:text-slate-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 transition-colors"
              @click.stop="s.action"
            >{{ s.label }}</button>
          </div>

          <!-- Calendriers -->
          <div class="flex-1 p-4">
            <div class="flex gap-6">
              <!-- Mois gauche -->
              <div class="flex-1">
                <div class="flex items-center justify-between mb-3">
                  <button type="button" class="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700" @click="prevMonth">
                    <ChevronLeft class="h-4 w-4 text-gray-500" />
                  </button>
                  <span class="text-sm font-bold text-gray-700 dark:text-slate-200">{{ MONTHS[leftMonth] }} {{ leftYearAdj }}</span>
                  <div class="w-6" />
                </div>
                <div class="grid grid-cols-7 mb-1">
                  <div v-for="d in DAYS" :key="d" class="text-center text-[10px] font-bold text-gray-400 py-1">{{ d }}</div>
                </div>
                <div class="grid grid-cols-7 gap-0.5">
                  <div v-for="(day, i) in leftDays" :key="i">
                    <button
                      v-if="day"
                      type="button"
                      :disabled="isDisabled(day)"
                      class="w-full aspect-square flex items-center justify-center text-xs rounded-lg transition-all font-medium"
                      :class="[
                        isStart(day) || isEnd(day) ? 'bg-green-600 text-white' :
                        inRange(day) ? 'bg-green-100 dark:bg-green-900/30 text-green-800' :
                        'text-gray-700 dark:text-slate-300 hover:bg-green-50 dark:hover:bg-slate-700',
                        isDisabled(day) && 'opacity-30 cursor-not-allowed',
                      ]"
                      @click="selectDate(day)"
                      @mouseenter="hovered = day"
                      @mouseleave="hovered = null"
                    >{{ day.getDate() }}</button>
                    <div v-else class="w-full aspect-square" />
                  </div>
                </div>
              </div>

              <!-- Séparateur -->
              <div class="w-px bg-gray-100 dark:bg-slate-700" />

              <!-- Mois droit -->
              <div class="flex-1">
                <div class="flex items-center justify-between mb-3">
                  <div class="w-6" />
                  <span class="text-sm font-bold text-gray-700 dark:text-slate-200">{{ MONTHS[rightMonth] }} {{ rightYear }}</span>
                  <button type="button" class="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700" @click="nextMonth">
                    <ChevronRight class="h-4 w-4 text-gray-500" />
                  </button>
                </div>
                <div class="grid grid-cols-7 mb-1">
                  <div v-for="d in DAYS" :key="d" class="text-center text-[10px] font-bold text-gray-400 py-1">{{ d }}</div>
                </div>
                <div class="grid grid-cols-7 gap-0.5">
                  <div v-for="(day, i) in rightDays" :key="i">
                    <button
                      v-if="day"
                      type="button"
                      :disabled="isDisabled(day)"
                      class="w-full aspect-square flex items-center justify-center text-xs rounded-lg transition-all font-medium"
                      :class="[
                        isStart(day) || isEnd(day) ? 'bg-green-600 text-white' :
                        inRange(day) ? 'bg-green-100 dark:bg-green-900/30 text-green-800' :
                        'text-gray-700 dark:text-slate-300 hover:bg-green-50 dark:hover:bg-slate-700',
                        isDisabled(day) && 'opacity-30 cursor-not-allowed',
                      ]"
                      @click="selectDate(day)"
                      @mouseenter="hovered = day"
                      @mouseleave="hovered = null"
                    >{{ day.getDate() }}</button>
                    <div v-else class="w-full aspect-square" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="mt-4 pt-3 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <span class="text-xs text-gray-400">
                <template v-if="startDate && !endDate">Sélectionnez la date de fin</template>
                <template v-else-if="startDate && endDate">{{ displayValue }}</template>
                <template v-else>Cliquez pour sélectionner le début</template>
              </span>
              <button v-if="startDate || endDate" type="button" class="text-xs text-red-400 hover:text-red-600 font-medium" @click.stop="clear">
                Effacer
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
    <p v-else-if="hint" class="text-xs text-gray-400">{{ hint }}</p>
  </div>
</template>