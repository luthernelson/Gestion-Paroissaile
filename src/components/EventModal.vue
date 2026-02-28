<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { X, Plus, Clock, MapPin, Users } from 'lucide-vue-next'

export interface CalendarEvent {
  id?: number
  title: string
  type: string
  group?: string
  heure?: string
  lieu?: string
  start: string
  end: string
  color: string
}

const props = withDefaults(defineProps<{
  modelValue: boolean
  startDate?: string
  endDate?: string
  event?: Partial<CalendarEvent>
  typeOptions?: string[]
  groupOptions?: string[]
}>(), {
  typeOptions: () => ['Culte', 'Formation', 'Réunion', 'Autre'],
  groupOptions: () => ['Anciens', 'Diacres', 'Jeunes', 'Femmes'],
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'save', event: CalendarEvent): void
  (e: 'cancel'): void
}>()

const saving = ref(false)

const defaultForm = (): CalendarEvent => ({
  title: '',
  type: '',
  group: '',
  heure: '',
  lieu: '',
  start: props.startDate ?? '',
  end:   props.endDate   ?? '',
  color: 'green',
})

const form = ref<CalendarEvent>(defaultForm())

// Sync quand la modal s'ouvre
watch(() => props.modelValue, (open) => {
  if (open) {
    form.value = {
      ...defaultForm(),
      ...props.event,
      start: props.startDate ?? props.event?.start ?? '',
      end:   props.endDate   ?? props.event?.end   ?? '',
    }
  }
})

function close() {
  emit('update:modelValue', false)
  emit('cancel')
}

function save() {
  if (!form.value.title.trim()) return
  saving.value = true
  setTimeout(() => {
    emit('save', { ...form.value, id: props.event?.id ?? Date.now() })
    saving.value = false
    emit('update:modelValue', false)
  }, 500)
}

const COLORS = ['green', 'yellow', 'gray', 'blue', 'red'] as const
const colorClass: Record<string, string> = {
  green:  'bg-green-500',
  yellow: 'bg-yellow-400',
  gray:   'bg-gray-400',
  blue:   'bg-blue-500',
  red:    'bg-red-500',
}

const displayPeriod = () => {
  if (!form.value.start) return ''
  const fmt = (s: string) => new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
  if (!form.value.end || form.value.start === form.value.end) return fmt(form.value.start)
  return `${fmt(form.value.start)} → ${fmt(form.value.end)}`
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click.self="close"
    >
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95 translate-y-4"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95 translate-y-2"
      >
        <div
          v-if="modelValue"
          class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 dark:border-slate-700 overflow-hidden"
        >
          <!-- ── En-tête ── -->
          <div class="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-green-700 to-green-800">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Plus class="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 class="text-base font-bold text-white leading-tight">
                  {{ event?.id ? 'Modifier l\'événement' : 'Nouvel événement' }}
                </h2>
                <p class="text-xs text-white/70 mt-0.5">{{ displayPeriod() }}</p>
              </div>
            </div>
            <button
              class="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              @click="close"
            >
              <X class="h-5 w-5 text-white" />
            </button>
          </div>

          <!-- ── Corps ── -->
          <div class="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">

            <!-- Titre -->
            <BaseInput
              v-model="form.title"
              label="Titre de l'événement"
              placeholder="Ex: Culte dominical"
              required
              :error="!form.title.trim() && saving ? 'Le titre est requis' : ''"
            />

            <!-- Type + Couleur -->
            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Type <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="form.type"
                  class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                >
                  <option value="">Choisir...</option>
                  <option v-for="t in typeOptions" :key="t">{{ t }}</option>
                </select>
              </div>

              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-semibold text-gray-700 dark:text-slate-300">Couleur</label>
                <div class="flex items-center gap-2 mt-1.5">
                  <button
                    v-for="c in COLORS" :key="c"
                    type="button"
                    class="w-7 h-7 rounded-full transition-all duration-150 hover:scale-110 ring-offset-2 ring-offset-white dark:ring-offset-slate-900"
                    :class="[
                      colorClass[c],
                      form.color === c ? 'ring-2 ring-gray-500 scale-110' : '',
                    ]"
                    @click="form.color = c"
                  />
                </div>
              </div>
            </div>

            <!-- Dates -->
            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-semibold text-gray-700 dark:text-slate-300">Date début</label>
                <input
                  v-model="form.start"
                  type="date"
                  class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-semibold text-gray-700 dark:text-slate-300">Date fin</label>
                <input
                  v-model="form.end"
                  type="date"
                  class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>
            </div>

            <!-- Heure + Lieu -->
            <div class="grid grid-cols-2 gap-4">
              <BaseInput
                v-model="form.heure"
                label="Heure"
                placeholder="09h00"
                :icon="Clock"
              />
              <BaseInput
                v-model="form.lieu"
                label="Lieu"
                placeholder="Église Centrale"
                :icon="MapPin"
              />
            </div>

            <!-- Groupe -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
                <Users class="h-4 w-4 text-green-600" />
                Groupe concerné
              </label>
              <select
                v-model="form.group"
                class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              >
                <option value="">Tous les groupes</option>
                <option v-for="g in groupOptions" :key="g">{{ g }}</option>
              </select>
            </div>

            <!-- Slot pour contenu additionnel depuis la vue parent -->
            <slot name="extra-fields" :form="form" />
          </div>

          <!-- ── Footer ── -->
          <div class="px-6 py-4 border-t border-gray-100 dark:border-slate-700 flex items-center justify-end gap-3 bg-gray-50 dark:bg-slate-800/50">
            <BaseButton label="Annuler" variant="ghost" @click="close" />
            <BaseButton
              :label="event?.id ? 'Mettre à jour' : 'Enregistrer'"
              variant="primary"
              :loading="saving"
              :icon="Plus"
              @click="save"
            />
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>