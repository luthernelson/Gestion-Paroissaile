<template>
  <div
    class="p-4 md:p-6 bg-gray-50 dark:bg-slate-950 min-h-full select-none"
    @mouseup="onGlobalMouseUp"
  >
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl md:text-3xl font-black text-gray-800 dark:text-slate-100">
        Calendrier paroissial
      </h1>
    </div>

    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">

      <!-- Filtres -->
      <div class="px-5 py-4 border-b border-gray-100 dark:border-slate-700 flex flex-wrap items-center gap-3">

        <!-- Filtre type — utilise SelectDropdown -->
        <div class="w-48">
          <SelectDropdown
            v-model="selectedType"
            :options="TYPE_OPTIONS"
            placeholder="Tous les types"
          />
        </div>

        <!-- Filtre groupe — utilise SelectDropdown avec maxHeight réduit -->
        <div class="w-44">
          <SelectDropdown
            v-model="selectedGroup"
            :options="GROUP_OPTIONS"
            placeholder="Tous les groupes"
            :max-height="180"
          />
        </div>

        <!-- Navigation mois -->
        <div class="ml-auto flex items-center gap-2">
          <button class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors" @click="prevMonth">
            <ChevronLeft class="h-4 w-4 text-gray-600 dark:text-slate-300" />
          </button>
          <span class="text-sm font-bold text-gray-800 dark:text-slate-100 min-w-[130px] text-center">
            {{ MONTHS[viewMonth] }} {{ viewYear }}
          </span>
          <button class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors" @click="nextMonth">
            <ChevronRight class="h-4 w-4 text-gray-600 dark:text-slate-300" />
          </button>
        </div>
      </div>

      <!-- Grille -->
      <div class="overflow-x-auto">
        <div class="min-w-[700px]">

          <!-- En-têtes -->
          <div class="grid grid-cols-7 border-b border-gray-100 dark:border-slate-700">
            <div v-for="d in DAYS" :key="d" class="py-3 text-center text-sm font-bold text-gray-500 dark:text-slate-400">
              {{ d }}
            </div>
          </div>

          <!-- Semaines -->
          <div
            v-for="weekIdx in Math.ceil(calendarDays.length / 7)"
            :key="weekIdx"
            class="grid grid-cols-7 border-b border-gray-100 dark:border-slate-700 last:border-b-0"
          >
            <div
              v-for="colIdx in 7"
              :key="colIdx"
              class="border-r border-gray-100 dark:border-slate-700/50 last:border-r-0 cursor-pointer transition-colors duration-100 relative"
              :class="[
                !getSafeDay(weekIdx, colIdx)?.outside
                  ? 'bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800'
                  : 'bg-gray-50/60 dark:bg-slate-800/30',
                getSafeDate(weekIdx, colIdx) && isInDrag(getSafeDate(weekIdx, colIdx)!)
                  ? '!bg-green-50 dark:!bg-green-900/20'
                  : '',
              ]"
              @mousedown="handleCellMouseDown(weekIdx, colIdx)"
              @mouseenter="handleCellMouseEnter(weekIdx, colIdx)"
              @mouseup="handleCellMouseUp(weekIdx, colIdx)"
            >
              <div class="flex justify-between items-start px-2 pt-2 pb-1">
                <span
                  class="text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full"
                  :class="[
                    getSafeDay(weekIdx, colIdx)?.outside
                      ? 'text-gray-300 dark:text-slate-600'
                      : 'text-gray-700 dark:text-slate-200',
                    getSafeDate(weekIdx, colIdx) && isToday(getSafeDate(weekIdx, colIdx)!)
                      ? '!bg-green-600 !text-white'
                      : '',
                  ]"
                >
                  {{ getDayNumber(weekIdx, colIdx) }}
                </span>
                <Plus
                  v-if="getSafeDate(weekIdx, colIdx) && isInDrag(getSafeDate(weekIdx, colIdx)!)"
                  class="h-3.5 w-3.5 text-green-500 opacity-70 mt-1"
                />
              </div>

              <div class="px-0 pb-2 min-h-[60px] space-y-0.5">
                <template v-if="getSafeDate(weekIdx, colIdx)">
                  <div
                    v-for="band in getBandsForCell(weekIdx, colIdx)"
                    :key="band.event.id"
                    class="h-6 flex items-center overflow-hidden"
                    :style="getBandStyle(band)"
                  >
                    <span
                      v-if="band.isLineStart"
                      class="text-white text-xs font-semibold px-2 truncate leading-none w-full"
                    >
                      {{ band.event.title }}
                    </span>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Légende -->
      <div class="px-5 py-3 border-t border-gray-100 dark:border-slate-700 flex flex-wrap gap-4 items-center">
        <div v-for="ev in filteredEvents" :key="ev.id" class="flex items-center gap-1.5">
          <span class="w-4 h-3 rounded-sm" :style="{ backgroundColor: ev.color }" />
          <span class="text-xs text-gray-500 truncate max-w-[120px]">{{ ev.title }}</span>
        </div>
        <span class="text-xs text-gray-400 ml-auto italic hidden sm:block">
          Cliquez ou glissez pour ajouter un événement
        </span>
      </div>
    </div>

    <EventModal
      v-model="showModal"
      :start-date="modalStart"
      :end-date="modalEnd"
      @save="onEventSaved"
      @cancel="onModalCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import EventModal from '@/components/EventModal.vue'
import type { CalendarEvent } from '@/components/EventModal.vue'
import SelectDropdown from '@/components/ui/SelectInput.vue'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-vue-next'

interface BandInfo {
  event: CalendarEvent
  position: number
  isStart: boolean
  isEnd: boolean
  isLineStart: boolean
  isLineEnd: boolean
}

interface CalendarDay {
  date: Date
  outside: boolean
}

const today = new Date()
const viewYear = ref(2024)
const viewMonth = ref(3)

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

// Filtres — v-model string directement, plus besoin de gérer l'ouverture
const selectedType = ref('Tous les types')
const selectedGroup = ref('Tous les groupes')
const TYPE_OPTIONS = ['Tous les types', 'Culte', 'Formation', 'Réunion', 'Autre']
const GROUP_OPTIONS = ['Tous les groupes', 'Anciens', 'Diacres', 'Jeunes', 'Femmes']

const showModal = ref(false)
const modalStart = ref('')
const modalEnd = ref('')

const dragging = ref(false)
const dragStart = ref<string | null>(null)
const dragEnd = ref<string | null>(null)

const events = ref<CalendarEvent[]>([
  { id: 1, title: 'Culte dominical', start: '2024-04-03', end: '2024-04-06', color: '#16a34a', type: 'Culte', heure: '09h00', lieu: 'Église Centrale' },
  { id: 2, title: 'Formation nouveaux diacres (Evd)', start: '2024-04-10', end: '2024-04-13', color: '#eab308', type: 'Formation', group: 'Diacres', heure: '14h00', lieu: 'Salle A' },
  { id: 3, title: 'Réunion des anciens', start: '2024-04-15', end: '2024-04-15', color: '#9ca3af', type: 'Réunion', group: 'Anciens', heure: '10h00', lieu: 'Bureau pastoral' },
  { id: 4, title: 'Culte de jeunesse', start: '2024-04-20', end: '2024-04-21', color: '#2563eb', type: 'Culte', group: 'Jeunes', heure: '16h00', lieu: 'Salle jeunesse' },
  { id: 5, title: 'Journée de prière', start: '2024-04-27', end: '2024-04-27', color: '#ef4444', type: 'Autre', heure: '08h00', lieu: 'Église Centrale' },
])

function iso(d: Date): string {
  if (!(d instanceof Date) || isNaN(d.getTime())) {
    const n = new Date()
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`
  }
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getSafeDay(weekIdx: number, colIdx: number): CalendarDay | undefined {
  return calendarDays.value[(weekIdx - 1) * 7 + (colIdx - 1)]
}
function getSafeDate(weekIdx: number, colIdx: number): Date | undefined {
  return getSafeDay(weekIdx, colIdx)?.date
}

const calendarDays = computed<CalendarDay[]>(() => {
  const firstDay = new Date(viewYear.value, viewMonth.value, 1)
  const lastDay = new Date(viewYear.value, viewMonth.value + 1, 0)
  const startDow = (firstDay.getDay() + 6) % 7
  const days: CalendarDay[] = []

  for (let i = 0; i < startDow; i++) {
    const d = new Date(firstDay)
    d.setDate(d.getDate() - (startDow - i))
    days.push({ date: d, outside: true })
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push({ date: new Date(viewYear.value, viewMonth.value, d), outside: false })
  }
  while (days.length < 42) {
    const next = new Date(days[days.length - 1].date)
    next.setDate(next.getDate() + 1)
    days.push({ date: next, outside: true })
  }
  return days
})

const dragPreviewDates = computed<string[]>(() => {
  if (!dragStart.value || !dragEnd.value) return []
  const s = new Date(dragStart.value)
  const e = new Date(dragEnd.value)
  const [min, max] = s <= e ? [s, e] : [e, s]
  const dates: string[] = []
  const cur = new Date(min)
  while (cur <= max) { dates.push(iso(cur)); cur.setDate(cur.getDate() + 1) }
  return dates
})

const filteredEvents = computed<CalendarEvent[]>(() =>
  events.value.filter(ev =>
    (selectedType.value === 'Tous les types' || ev.type === selectedType.value) &&
    (selectedGroup.value === 'Tous les groupes' || ev.group === selectedGroup.value)
  )
)

function isToday(date: Date): boolean { return iso(date) === iso(today) }
function isInDrag(date: Date): boolean { return dragPreviewDates.value.includes(iso(date)) }

const cellBands = computed<Map<string, BandInfo[]>>(() => {
  const result = new Map<string, BandInfo[]>()
  for (const day of calendarDays.value) result.set(iso(day.date), [])

  for (const ev of filteredEvents.value) {
    calendarDays.value.forEach((day, idx) => {
      const dayStr = iso(day.date)
      if (dayStr < ev.start || dayStr > ev.end) return
      const bands = result.get(dayStr)!
      const colIdx = idx % 7
      bands.push({
        event: ev,
        position: bands.length,
        isStart: dayStr === ev.start,
        isEnd: dayStr === ev.end,
        isLineStart: colIdx === 0 || dayStr === ev.start,
        isLineEnd: colIdx === 6 || dayStr === ev.end,
      })
    })
  }
  return result
})

function getBandsForCell(weekIdx: number, colIdx: number): BandInfo[] {
  const date = getSafeDate(weekIdx, colIdx)
  return date ? (cellBands.value.get(iso(date)) || []) : []
}
function getDayNumber(weekIdx: number, colIdx: number): number {
  return getSafeDate(weekIdx, colIdx)?.getDate() || 0
}
function getBandStyle(band: BandInfo): Record<string, string> {
  return {
    backgroundColor: band.event.color,
    borderRadius: [
      band.isLineStart ? '6px' : '0',
      band.isLineEnd ? '6px' : '0',
      band.isLineEnd ? '6px' : '0',
      band.isLineStart ? '6px' : '0',
    ].join(' '),
    marginLeft: band.isLineStart ? '2px' : '-1px',
    marginRight: band.isLineEnd ? '2px' : '-1px',
  }
}

function handleCellMouseDown(w: number, c: number) { const d = getSafeDate(w, c); if (d) onMouseDown(d) }
function handleCellMouseEnter(w: number, c: number) { const d = getSafeDate(w, c); if (d) onMouseEnter(d) }
function handleCellMouseUp(w: number, c: number) { const d = getSafeDate(w, c); if (d) onMouseUp(d) }

function prevMonth() { viewMonth.value === 0 ? (viewMonth.value = 11, viewYear.value--) : viewMonth.value-- }
function nextMonth() { viewMonth.value === 11 ? (viewMonth.value = 0, viewYear.value++) : viewMonth.value++ }

function onMouseDown(date: Date) {
  dragging.value = true
  dragStart.value = iso(date)
  dragEnd.value = iso(date)
}
function onMouseEnter(date: Date) { if (dragging.value) dragEnd.value = iso(date) }
function onMouseUp(date: Date) {
  if (!dragging.value || !dragStart.value) return
  dragging.value = false
  const s = new Date(dragStart.value), e = new Date(iso(date))
  const [min, max] = s <= e ? [s, e] : [e, s]
  modalStart.value = iso(min)
  modalEnd.value = iso(max)
  showModal.value = true
  dragStart.value = null
  dragEnd.value = null
}
function onGlobalMouseUp() {
  if (dragging.value) { dragging.value = false; dragStart.value = null; dragEnd.value = null }
}
function onEventSaved(ev: CalendarEvent) {
  const idx = events.value.findIndex(e => e.id === ev.id)
  idx >= 0 ? events.value[idx] = ev : events.value.push({ ...ev, id: Date.now() })
  dragStart.value = null; dragEnd.value = null
}
function onModalCancel() { dragStart.value = null; dragEnd.value = null }
</script>

<style scoped>
.select-none { user-select: none; }
</style>