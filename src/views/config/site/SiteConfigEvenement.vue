<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ArrowLeft, CalendarDays, Globe, GlobeLock } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import SearchBar from '@/components/ui/SearchBar.vue'
import SelectInput from '@/components/ui/SelectInput.vue'
import { useToast } from '@/stores/toast'

const router = useRouter()
const toast  = useToast()
const saving = ref(false)

interface Evenement {
  id: number
  titre: string
  date: string
  type: string
  groupe?: string
  publie: boolean
}

const evenements = ref<Evenement[]>([])
const searchQuery  = ref('')
const filterType   = ref('')
const filterStatut = ref('')

const TYPE_OPTIONS = [
  { label: 'Tous les types', value: '' },
  { label: 'Culte',          value: 'Culte' },
  { label: 'Formation',      value: 'Formation' },
  { label: 'Réunion',        value: 'Réunion' },
  { label: 'Autre',          value: 'Autre' },
]
const STATUT_OPTIONS = [
  { label: 'Tous',       value: '' },
  { label: 'Publiés',    value: 'publie' },
  { label: 'Non publiés', value: 'non_publie' },
]

const filtered = computed(() => evenements.value.filter(ev => {
  const matchSearch = !searchQuery.value || ev.titre.toLowerCase().includes(searchQuery.value.toLowerCase())
  const matchType   = !filterType.value   || ev.type === filterType.value
  const matchStatut = !filterStatut.value || (filterStatut.value === 'publie' ? ev.publie : !ev.publie)
  return matchSearch && matchType && matchStatut
}))

const publishedCount = computed(() => evenements.value.filter(e => e.publie).length)

function togglePublish(ev: Evenement) {
  ev.publie = !ev.publie
}

async function handleSave() {
  saving.value = true
  try {
    await new Promise(r => setTimeout(r, 1000))
    // TODO: await siteApi.saveEvenementsPublication(evenements.value.map(e => ({ id: e.id, publie: e.publie })))
    toast('success', `${publishedCount.value} événement(s) publiés sur le site.`, 'Publication mise à jour')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await new Promise(r => setTimeout(r, 400))
  evenements.value = [
    { id: 1, titre: 'Culte dominical',            date: '2024-04-07', type: 'Culte',     publie: true },
    { id: 2, titre: 'Formation nouveaux diacres', date: '2024-04-10', type: 'Formation', groupe: 'Diacres', publie: true },
    { id: 3, titre: 'Réunion des anciens',         date: '2024-04-15', type: 'Réunion',   groupe: 'Anciens', publie: false },
    { id: 4, titre: 'Culte de jeunesse',           date: '2024-04-20', type: 'Culte',     groupe: 'Jeunes',  publie: true },
    { id: 5, titre: 'Journée de prière',           date: '2024-04-27', type: 'Autre',     publie: false },
    { id: 6, titre: 'Culte du mois de mai',        date: '2024-05-05', type: 'Culte',     publie: false },
  ]
})
</script>

<template>
  <div class="space-y-6 w-full">

    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div class="flex items-center gap-3">
        <button class="p-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 transition-colors" @click="router.back()">
          <ArrowLeft class="w-4 h-4 text-gray-500 dark:text-slate-400" />
        </button>
        <div>
          <h1 class="text-2xl md:text-3xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-white">Événements</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            <span class="font-semibold text-green-700 dark:text-green-400">{{ publishedCount }}</span> / {{ evenements.length }} publiés sur le site
          </p>
        </div>
      </div>
      <BaseButton variant="primary" :icon="CalendarDays" :label="saving ? 'Enregistrement...' : 'Enregistrer'" :loading="saving" @click="handleSave" />
    </div>

    <!-- Filtres -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <SearchBar v-model="searchQuery" placeholder="Rechercher un événement..." />
      <SelectInput v-model="filterType"   :options="TYPE_OPTIONS"   placeholder="Tous les types" />
      <SelectInput v-model="filterStatut" :options="STATUT_OPTIONS" placeholder="Tous" />
    </div>

    <!-- Liste -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <div class="divide-y divide-gray-100 dark:divide-slate-700">
        <div v-if="filtered.length === 0" class="py-12 text-center text-sm text-gray-400 dark:text-slate-500">
          Aucun événement trouvé
        </div>
        <div
          v-for="ev in filtered" :key="ev.id"
          class="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
        >
          <!-- Icône statut -->
          <div class="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
               :class="ev.publie ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-slate-800'">
            <Globe    v-if="ev.publie"  class="w-4 h-4 text-green-600 dark:text-green-400" />
            <GlobeLock v-else           class="w-4 h-4 text-gray-400 dark:text-slate-500" />
          </div>

          <!-- Infos -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ ev.titre }}</p>
            <div class="flex items-center gap-2 mt-0.5 flex-wrap">
              <span class="text-xs text-gray-500 dark:text-slate-400">{{ new Date(ev.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) }}</span>
              <span class="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300">{{ ev.type }}</span>
              <span v-if="ev.groupe" class="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">{{ ev.groupe }}</span>
            </div>
          </div>

          <!-- Toggle publication -->
          <div class="flex items-center gap-3 flex-shrink-0">
            <span class="text-xs font-medium hidden sm:block" :class="ev.publie ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-slate-500'">
              {{ ev.publie ? 'Publié' : 'Non publié' }}
            </span>
            <button
              class="relative w-10 h-6 rounded-full transition-colors"
              :class="ev.publie ? 'bg-green-500' : 'bg-gray-300 dark:bg-slate-600'"
              @click="togglePublish(ev)"
            >
              <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform" :class="ev.publie ? 'translate-x-4' : ''" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-end pb-8">
      <BaseButton variant="primary" size="lg" :icon="CalendarDays" :label="saving ? 'Enregistrement...' : 'Enregistrer'" :loading="saving" @click="handleSave" />
    </div>
  </div>
</template>