<script setup lang="ts">
import { ref, computed } from 'vue'
import EventModal from '@/components/EventModal.vue'
import type { CalendarEvent } from '@/components/EventModal.vue'
import { ChevronLeft, ChevronRight, Plus, ChevronDown } from 'lucide-vue-next'

const today     = new Date()
const viewYear  = ref(2024)
const viewMonth = ref(3)

const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const DAYS   = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim']

const selectedType  = ref('Tous les types')
const selectedGroup = ref('Tous les groupes')
const showTypeDD    = ref(false)
const showGroupDD   = ref(false)
const TYPE_OPTIONS  = ['Tous les types', 'Culte', 'Formation', 'Réunion', 'Autre']
const GROUP_OPTIONS = ['Tous les groupes', 'Anciens', 'Diacres', 'Jeunes', 'Femmes']

const showModal  = ref(false)
const modalStart = ref('')
const modalEnd   = ref('')
const dragging   = ref(false)
const dragStart  = ref<string | null>(null)
const dragEnd    = ref<string | null>(null)

const events = ref<CalendarEvent[]>([
  { id: 1, title: 'Culte dominical',                  start: '2024-04-03', end: '2024-04-06', color: '#16a34a', type: 'Culte',     heure: '09h00', lieu: 'Église Centrale' },
  { id: 2, title: 'Formation nouveaux diacres (Evd)', start: '2024-04-10', end: '2024-04-13', color: '#eab308', type: 'Formation', group: 'Diacres', heure: '14h00', lieu: 'Salle A' },
  { id: 3, title: 'Réunion des anciens',              start: '2024-04-15', end: '2024-04-15', color: '#9ca3af', type: 'Réunion',   group: 'Anciens', heure: '10h00', lieu: 'Bureau pastoral' },
  { id: 4, title: 'Culte de jeunesse',                start: '2024-04-20', end: '2024-04-21', color: '#2563eb', type: 'Culte',     group: 'Jeunes',  heure: '16h00', lieu: 'Salle jeunesse' },
  { id: 5, title: 'Journée de prière',                start: '2024-04-27', end: '2024-04-27', color: '#ef4444', type: 'Autre',     heure: '08h00', lieu: 'Église Centrale' },
])

function iso(d: Date) {
  return d.toISOString().split('T')[0]
}

// ── Grille 42 cellules ──
const calendarDays = computed(() => {
  const firstDay = new Date(viewYear.value, viewMonth.value, 1)
  const lastDay  = new Date(viewYear.value, viewMonth.value + 1, 0)
  const startDow = (firstDay.getDay() + 6) % 7
  const days: Array<{ date: Date; outside: boolean }> = []

  for (let i = 0; i < startDow; i++) {
    const d = new Date(firstDay)
    d.setDate(d.getDate() - (startDow - i))
    days.push({ date: d, outside: true })
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push({ date: new Date(viewYear.value, viewMonth.value, d), outside: false })
  }
  while (days.length < 42) {
    const last = days[days.length - 1].date
    const next = new Date(last)
    next.setDate(next.getDate() + 1)
    days.push({ date: next, outside: true })
  }
  return days
})

// ── Drag preview ──
const dragPreviewDates = computed(() => {
  if (!dragStart.value || !dragEnd.value) return []
  const s = new Date(dragStart.value)
  const e = new Date(dragEnd.value)
  const [min, max] = s <= e ? [s, e] : [e, s]
  const dates: string[] = []
  const cur = new Date(min)
  while (cur <= max) { dates.push(iso(cur)); cur.setDate(cur.getDate() + 1) }
  return dates
})

// ── Filtrage événements ──
const filteredEvents = computed(() =>
  events.value.filter(ev =>
    (selectedType.value  === 'Tous les types'   || ev.type  === selectedType.value) &&
    (selectedGroup.value === 'Tous les groupes' || ev.group === selectedGroup.value)
  )
)

function eventsForDay(date: Date): CalendarEvent[] {
  const d = iso(date)
  return filteredEvents.value.filter(ev => ev.start <= d && ev.end >= d)
}

function isToday(date: Date) { return iso(date) === iso(today) }
function isInDrag(date: Date) { return dragPreviewDates.value.includes(iso(date)) }

// ── Calcul des bandes continues par ligne ──
// Pour chaque événement qui s'étale sur plusieurs jours, on calcule
// pour chaque cellule de la grille : est-ce un début, milieu, ou fin de bande ?
// et si la bande est coupée par un saut de ligne, on gère les bords arrondis

interface BandInfo {
  event: CalendarEvent
  position: number   // index de l'événement dans la pile du jour (0,1,2...)
  isStart: boolean   // premier jour de l'événement visible
  isEnd: boolean     // dernier jour de l'événement visible
  isLineStart: boolean // premier de la ligne (lundi ou début événement)
  isLineEnd: boolean   // dernier de la ligne (dimanche ou fin événement)
}

const cellBands = computed(() => {
  const result = new Map<string, BandInfo[]>()

  for (const day of calendarDays.value) {
    result.set(iso(day.date), [])
  }

  // Pour chaque événement, assigner une position verticale stable
  for (const ev of filteredEvents.value) {
    const evStart = new Date(ev.start)
    const evEnd   = new Date(ev.end)

    // Parcourir toutes les cellules de la grille
    calendarDays.value.forEach((day, idx) => {
      const d = iso(day.date)
      if (d < ev.start || d > ev.end) return

      const bands = result.get(d)!
      const isStart     = d === ev.start
      const isEnd       = d === ev.end
      const colIdx      = idx % 7  // 0=lun, 6=dim
      const isLineStart = colIdx === 0 || isStart
      const isLineEnd   = colIdx === 6 || isEnd

      // Position verticale = nombre de bandes déjà présentes ce jour
      const position = bands.length

      bands.push({
        event: ev,
        position,
        isStart,
        isEnd,
        isLineStart,
        isLineEnd,
      })
    })
  }

  return result
})

// Style de la bande selon sa position dans la ligne
function getBandStyle(band: BandInfo): Record<string, string> {
  const color = band.event.color
  const borderRadius = [
    band.isLineStart ? '6px' : '0',  // top-left
    band.isLineEnd   ? '6px' : '0',  // top-right
    band.isLineEnd   ? '6px' : '0',  // bottom-right
    band.isLineStart ? '6px' : '0',  // bottom-left
  ].join(' ')

  return {
    backgroundColor: color,
    borderRadius,
    // Déborder légèrement à gauche/droite pour coller aux cellules voisines
    marginLeft:  band.isLineStart ? '2px' : '-1px',
    marginRight: band.isLineEnd   ? '2px' : '-1px',
  }
}

// ── Navigation ──
function prevMonth() {
  if (viewMonth.value === 0) { viewMonth.value = 11; viewYear.value-- }
  else viewMonth.value--
}
function nextMonth() {
  if (viewMonth.value === 11) { viewMonth.value = 0; viewYear.value++ }
  else viewMonth.value++
}

// ── Drag ──
function onMouseDown(date: Date) {
  dragging.value  = true
  dragStart.value = iso(date)
  dragEnd.value   = iso(date)
}
function onMouseEnter(date: Date) {
  if (dragging.value) dragEnd.value = iso(date)
}
function onMouseUp(date: Date) {
  if (!dragging.value) return
  dragging.value = false
  const s = new Date(dragStart.value!)
  const e = new Date(iso(date))
  const [min, max] = s <= e ? [s, e] : [e, s]
  modalStart.value = iso(min)
  modalEnd.value   = iso(max)
  showModal.value  = true
}
function onGlobalMouseUp() {
  if (dragging.value) {
    dragging.value  = false
    dragStart.value = null
    dragEnd.value   = null
  }
}

function onEventSaved(ev: CalendarEvent) {
  const idx = events.value.findIndex(e => e.id === ev.id)
  if (idx >= 0) events.value[idx] = ev
  else events.value.push({ ...ev, id: Date.now() })
  dragStart.value = null
  dragEnd.value   = null
}
function onModalCancel() {
  dragStart.value = null
  dragEnd.value   = null
}
</script>

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
        <div class="relative">
          <button
            class="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-semibold text-gray-700 dark:text-slate-300 hover:border-green-400 transition-colors"
            @click="showTypeDD = !showTypeDD; showGroupDD = false"
          >
            {{ selectedType }} <ChevronDown class="h-4 w-4 text-gray-400" />
          </button>
          <Transition enter-active-class="transition duration-100" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
            <div v-if="showTypeDD" class="absolute z-30 mt-1 w-52 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-lg py-1">
              <button v-for="opt in TYPE_OPTIONS" :key="opt" class="w-full text-left px-4 py-2 text-sm transition-colors" :class="selectedType === opt ? 'text-green-700 font-semibold bg-green-50 dark:bg-green-900/20' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'" @click="selectedType = opt; showTypeDD = false">{{ opt }}</button>
            </div>
          </Transition>
        </div>

        <div class="relative">
          <button
            class="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-semibold text-gray-700 dark:text-slate-300 hover:border-green-400 transition-colors"
            @click="showGroupDD = !showGroupDD; showTypeDD = false"
          >
            {{ selectedGroup }} <ChevronDown class="h-4 w-4 text-gray-400" />
          </button>
          <Transition enter-active-class="transition duration-100" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
            <div v-if="showGroupDD" class="absolute z-30 mt-1 w-44 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-lg py-1">
              <button v-for="opt in GROUP_OPTIONS" :key="opt" class="w-full text-left px-4 py-2 text-sm transition-colors" :class="selectedGroup === opt ? 'text-green-700 font-semibold bg-green-50 dark:bg-green-900/20' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'" @click="selectedGroup = opt; showGroupDD = false">{{ opt }}</button>
            </div>
          </Transition>
        </div>

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
                !calendarDays[(weekIdx - 1) * 7 + (colIdx - 1)].outside
                  ? 'bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800'
                  : 'bg-gray-50/60 dark:bg-slate-800/30',
                isInDrag(calendarDays[(weekIdx - 1) * 7 + (colIdx - 1)].date)
                  ? '!bg-green-50 dark:!bg-green-900/20'
                  : '',
              ]"
              @mousedown="onMouseDown(calendarDays[(weekIdx - 1) * 7 + (colIdx - 1)].date)"
              @mouseenter="onMouseEnter(calendarDays[(weekIdx - 1) * 7 + (colIdx - 1)].date)"
              @mouseup="onMouseUp(calendarDays[(weekIdx - 1) * 7 + (colIdx - 1)].date)"
            >
              <!-- Numéro du jour -->
              <div class="flex justify-between items-start px-2 pt-2 pb-1">
                <span
                  class="text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full"
                  :class="[
                    calendarDays[(weekIdx - 1) * 7 + (colIdx - 1)].outside
                      ? 'text-gray-300 dark:text-slate-600'
                      : 'text-gray-700 dark:text-slate-200',
                    isToday(calendarDays[(weekIdx - 1) * 7 + (colIdx - 1)].date)
                      ? '!bg-green-600 !text-white'
                      : '',
                  ]"
                >
                  {{ calendarDays[(weekIdx - 1) * 7 + (colIdx - 1)].date.getDate() }}
                </span>
                <Plus
                  v-if="isInDrag(calendarDays[(weekIdx - 1) * 7 + (colIdx - 1)].date)"
                  class="h-3.5 w-3.5 text-green-500 opacity-70 mt-1"
                />
              </div>

              <!-- Zone bandes événements -->
              <div class="px-0 pb-2 min-h-[60px] space-y-0.5">
                <template
                  v-for="band in cellBands.get(iso(calendarDays[(weekIdx - 1) * 7 + (colIdx - 1)].date))"
                  :key="band.event.id"
                >
                  <!-- Bande continue -->
                  <div
                    class="h-6 flex items-center overflow-hidden"
                    :style="getBandStyle(band)"
                  >
                    <!-- Texte uniquement sur le premier jour de chaque ligne -->
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

<style scoped>
.select-none { user-select: none; }
</style>