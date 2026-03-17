<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ArrowLeft, Newspaper, Plus, Pencil, Trash2, Globe, GlobeLock } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import SearchBar from '@/components/ui/SearchBar.vue'
import SelectInput from '@/components/ui/SelectInput.vue'
import ConfirmModal from '@/components/ui/confirmModal.vue'
import { useToast } from '@/stores/toast'

const router = useRouter()
const toast  = useToast()

interface Annonce {
  id: number
  titre: string
  contenu: string
  statut: 'BROUILLON' | 'PUBLIE' | 'ARCHIVE'
  createdAt: string
}

const annonces     = ref<Annonce[]>([])
const searchQuery  = ref('')
const filterStatut = ref('')
const showForm     = ref(false)
const saving       = ref(false)
const editTarget   = ref<Annonce | null>(null)

const formData = ref({ titre: '', contenu: '', statut: 'BROUILLON' as Annonce['statut'] })

const STATUT_OPTIONS = [
  { label: 'Tous',       value: '' },
  { label: 'Brouillon',  value: 'BROUILLON' },
  { label: 'Publiés',    value: 'PUBLIE' },
  { label: 'Archivés',   value: 'ARCHIVE' },
]

const STATUT_MAP: Record<string, { label: string; class: string }> = {
  BROUILLON: { label: 'Brouillon', class: 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300' },
  PUBLIE:    { label: 'Publié',    class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  ARCHIVE:   { label: 'Archivé',   class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
}

const filtered = computed(() => annonces.value.filter(a => {
  const matchSearch = !searchQuery.value || a.titre.toLowerCase().includes(searchQuery.value.toLowerCase())
  const matchStatut = !filterStatut.value || a.statut === filterStatut.value
  return matchSearch && matchStatut
}))

const publishedCount = computed(() => annonces.value.filter(a => a.statut === 'PUBLIE').length)

// Modal suppression
const confirmModal = ref({ show: false, loading: false, id: 0 as number })
function askDelete(a: Annonce) { confirmModal.value = { show: true, loading: false, id: a.id } }
async function handleDelete() {
  confirmModal.value.loading = true
  await new Promise(r => setTimeout(r, 800))
  annonces.value = annonces.value.filter(a => a.id !== confirmModal.value.id)
  confirmModal.value.show = false
  toast('success', 'Annonce supprimée.', 'Suppression')
}

function openCreate() {
  editTarget.value = null
  formData.value = { titre: '', contenu: '', statut: 'BROUILLON' }
  showForm.value = true
}
function openEdit(a: Annonce) {
  editTarget.value = a
  formData.value = { titre: a.titre, contenu: a.contenu, statut: a.statut }
  showForm.value = true
}

async function handleSaveForm() {
  saving.value = true
  await new Promise(r => setTimeout(r, 900))
  if (editTarget.value) {
    Object.assign(editTarget.value, formData.value)
    toast('success', 'Annonce mise à jour.', 'Modification')
  } else {
    annonces.value.unshift({ id: Date.now(), ...formData.value, createdAt: new Date().toISOString() })
    toast('success', 'Annonce créée.', 'Création')
  }
  saving.value = false
  showForm.value = false
}

onMounted(async () => {
  await new Promise(r => setTimeout(r, 300))
  annonces.value = [
    { id: 1, titre: 'Culte spécial de Pâques',     contenu: 'Rejoignez-nous pour le culte de Pâques le dimanche 31 mars à 9h.',         statut: 'PUBLIE',    createdAt: '2024-03-20' },
    { id: 2, titre: 'Collecte de fonds pour l\'école', contenu: 'Nous lançons une collecte pour financer la nouvelle école du quartier.', statut: 'PUBLIE',    createdAt: '2024-03-18' },
    { id: 3, titre: 'Réunion des responsables',     contenu: 'Réunion obligatoire pour tous les responsables de groupes.',                statut: 'BROUILLON', createdAt: '2024-03-15' },
    { id: 4, titre: 'Journée portes ouvertes 2023', contenu: 'Retour sur notre journée portes ouvertes.',                                 statut: 'ARCHIVE',   createdAt: '2023-12-01' },
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
          <h1 class="text-2xl md:text-3xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-white">Annonces & actualités</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            <span class="font-semibold text-green-700 dark:text-green-400">{{ publishedCount }}</span> / {{ annonces.length }} publiées sur le site
          </p>
        </div>
      </div>
      <BaseButton variant="primary" :icon="Plus" label="Nouvelle annonce" @click="openCreate" />
    </div>

    <!-- Filtres -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <SearchBar v-model="searchQuery" placeholder="Rechercher une annonce..." />
      <SelectInput v-model="filterStatut" :options="STATUT_OPTIONS" placeholder="Tous les statuts" />
    </div>

    <!-- Formulaire création/édition inline -->
    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0">
      <div v-if="showForm" class="bg-white dark:bg-slate-900 rounded-2xl border-2 border-green-300 dark:border-green-700 shadow-sm">
        <div class="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
          <p class="text-sm font-bold text-gray-900 dark:text-white">{{ editTarget ? 'Modifier l\'annonce' : 'Nouvelle annonce' }}</p>
          <button class="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 p-1" @click="showForm = false">✕</button>
        </div>
        <div class="p-6 space-y-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-semibold text-gray-700 dark:text-slate-300">Titre *</label>
            <input v-model="formData.titre" type="text" class="h-[42px] px-3 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Titre de l'annonce" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-semibold text-gray-700 dark:text-slate-300">Contenu</label>
            <textarea v-model="formData.contenu" rows="4" class="px-3 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" placeholder="Contenu de l'annonce..." />
          </div>
          <div class="flex items-center gap-4 flex-wrap">
            <div class="flex flex-col gap-1.5 min-w-[160px]">
              <label class="text-sm font-semibold text-gray-700 dark:text-slate-300">Statut</label>
              <SelectInput v-model="formData.statut" :options="[{ label: 'Brouillon', value: 'BROUILLON' }, { label: 'Publier', value: 'PUBLIE' }, { label: 'Archiver', value: 'ARCHIVE' }]" />
            </div>
            <div class="flex gap-2 mt-auto">
              <button class="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors" @click="showForm = false">Annuler</button>
              <BaseButton variant="primary" :icon="saving ? undefined : Newspaper" :label="saving ? 'Enregistrement...' : 'Enregistrer'" :loading="saving" @click="handleSaveForm" />
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Liste annonces -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <div class="divide-y divide-gray-100 dark:divide-slate-700">
        <div v-if="filtered.length === 0" class="py-12 text-center text-sm text-gray-400 dark:text-slate-500">Aucune annonce trouvée</div>
        <div v-for="a in filtered" :key="a.id" class="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
          <div class="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mt-0.5"
               :class="a.statut === 'PUBLIE' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-slate-800'">
            <Globe     v-if="a.statut === 'PUBLIE'" class="w-4 h-4 text-green-600 dark:text-green-400" />
            <GlobeLock v-else                       class="w-4 h-4 text-gray-400 dark:text-slate-500" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ a.titre }}</p>
              <span class="text-[11px] font-medium px-2 py-0.5 rounded-full" :class="STATUT_MAP[a.statut].class">{{ STATUT_MAP[a.statut].label }}</span>
            </div>
            <p class="text-xs text-gray-500 dark:text-slate-400 mt-0.5 line-clamp-1">{{ a.contenu }}</p>
            <p class="text-xs text-gray-400 dark:text-slate-500 mt-1">{{ new Date(a.createdAt).toLocaleDateString('fr-FR') }}</p>
          </div>
          <div class="flex items-center gap-1 flex-shrink-0">
            <button class="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Modifier" @click="openEdit(a)"><Pencil class="w-4 h-4" /></button>
            <button class="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"  title="Supprimer" @click="askDelete(a)"><Trash2 class="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>

    <ConfirmModal
      v-model="confirmModal.show"
      variant="danger"
      title="Supprimer cette annonce ?"
      message="L'annonce sera définitivement supprimée du site."
      confirm-label="Supprimer"
      :confirm-loading="confirmModal.loading"
      @confirm="handleDelete"
    />
  </div>
</template>