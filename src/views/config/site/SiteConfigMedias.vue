<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ArrowLeft, MonitorPlay, Globe, GlobeLock, ExternalLink } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import SearchBar from '@/components/ui/SearchBar.vue'
import SelectInput from '@/components/ui/SelectInput.vue'
import { useToast } from '@/stores/toast'

const router = useRouter()
const toast  = useToast()
const saving = ref(false)

interface Media {
  id: number
  titre: string
  predicateur: string
  date: string
  type: 'VIDEO' | 'AUDIO'
  lien?: string
  publie: boolean
}

const medias      = ref<Media[]>([])
const searchQuery = ref('')
const filterType  = ref('')
const filterStatut = ref('')

const TYPE_OPTIONS   = [{ label: 'Tous', value: '' }, { label: 'Vidéo', value: 'VIDEO' }, { label: 'Audio', value: 'AUDIO' }]
const STATUT_OPTIONS = [{ label: 'Tous', value: '' }, { label: 'Publiés', value: 'publie' }, { label: 'Non publiés', value: 'non_publie' }]

const filtered = computed(() => medias.value.filter(m => {
  const matchSearch = !searchQuery.value || m.titre.toLowerCase().includes(searchQuery.value.toLowerCase()) || m.predicateur.toLowerCase().includes(searchQuery.value.toLowerCase())
  const matchType   = !filterType.value   || m.type === filterType.value
  const matchStatut = !filterStatut.value || (filterStatut.value === 'publie' ? m.publie : !m.publie)
  return matchSearch && matchType && matchStatut
}))

const publishedCount = computed(() => medias.value.filter(m => m.publie).length)

function togglePublish(m: Media) { m.publie = !m.publie }

async function handleSave() {
  saving.value = true
  try {
    await new Promise(r => setTimeout(r, 1000))
    // TODO: await siteApi.saveMediasPublication(...)
    toast('success', `${publishedCount.value} média(s) publiés sur le site.`, 'Publication mise à jour')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await new Promise(r => setTimeout(r, 300))
  medias.value = [
    { id: 1, titre: 'La puissance de la prière',    predicateur: 'Pasteur Ekwabi',   date: '2024-03-31', type: 'VIDEO', lien: 'https://youtube.com', publie: true  },
    { id: 2, titre: 'Marcher par la foi',            predicateur: 'Pasteur Ekwabi',   date: '2024-03-24', type: 'VIDEO', lien: 'https://youtube.com', publie: true  },
    { id: 3, titre: 'L\'amour de Dieu',              predicateur: 'Évangéliste Biya', date: '2024-03-17', type: 'AUDIO', publie: true  },
    { id: 4, titre: 'Vivre en communauté',           predicateur: 'Pasteur Ekwabi',   date: '2024-03-10', type: 'VIDEO', lien: 'https://youtube.com', publie: false },
    { id: 5, titre: 'La grâce suffisante',           predicateur: 'Diacre Nkeng',     date: '2024-03-03', type: 'AUDIO', publie: false },
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
          <h1 class="text-2xl md:text-3xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-white">Médias & prédications</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            <span class="font-semibold text-green-700 dark:text-green-400">{{ publishedCount }}</span> / {{ medias.length }} publiés sur le site
          </p>
        </div>
      </div>
      <BaseButton variant="primary" :icon="MonitorPlay" :label="saving ? 'Enregistrement...' : 'Enregistrer'" :loading="saving" @click="handleSave" />
    </div>

    <!-- Filtres -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <SearchBar v-model="searchQuery" placeholder="Titre, prédicateur..." />
      <SelectInput v-model="filterType"   :options="TYPE_OPTIONS"   placeholder="Tous les types" />
      <SelectInput v-model="filterStatut" :options="STATUT_OPTIONS" placeholder="Tous" />
    </div>

    <!-- Liste -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <div class="divide-y divide-gray-100 dark:divide-slate-700">
        <div v-if="filtered.length === 0" class="py-12 text-center text-sm text-gray-400 dark:text-slate-500">Aucun média trouvé</div>
        <div v-for="m in filtered" :key="m.id" class="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
          <!-- Type badge -->
          <div class="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
               :class="m.publie ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-slate-800'">
            <Globe     v-if="m.publie"  class="w-4 h-4 text-green-600 dark:text-green-400" />
            <GlobeLock v-else           class="w-4 h-4 text-gray-400 dark:text-slate-500" />
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ m.titre }}</p>
              <span class="text-[11px] px-2 py-0.5 rounded-full font-medium"
                :class="m.type === 'VIDEO' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'">
                {{ m.type === 'VIDEO' ? 'Vidéo' : 'Audio' }}
              </span>
            </div>
            <div class="flex items-center gap-2 mt-0.5">
              <span class="text-xs text-gray-500 dark:text-slate-400">{{ m.predicateur }}</span>
              <span class="text-gray-300 dark:text-slate-600">·</span>
              <span class="text-xs text-gray-400 dark:text-slate-500">{{ new Date(m.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) }}</span>
            </div>
          </div>

          <div class="flex items-center gap-3 flex-shrink-0">
            <a v-if="m.lien" :href="m.lien" target="_blank" class="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors" title="Voir le lien">
              <ExternalLink class="w-4 h-4" />
            </a>
            <span class="text-xs font-medium hidden sm:block" :class="m.publie ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-slate-500'">
              {{ m.publie ? 'Publié' : 'Non publié' }}
            </span>
            <button
              class="relative w-10 h-6 rounded-full transition-colors"
              :class="m.publie ? 'bg-green-500' : 'bg-gray-300 dark:bg-slate-600'"
              @click="togglePublish(m)"
            >
              <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform" :class="m.publie ? 'translate-x-4' : ''" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-end pb-8">
      <BaseButton variant="primary" size="lg" :icon="MonitorPlay" :label="saving ? 'Enregistrement...' : 'Enregistrer'" :loading="saving" @click="handleSave" />
    </div>
  </div>
</template>