<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Filter, ShieldOff, ShieldCheck, Trash2 } from 'lucide-vue-next'
import ConfirmModal from '@/components/ui/confirmModal.vue'

import BaseTable from '@/components/ui/BaseTable.vue'
import SearchBar from '@/components/ui/SearchBar.vue'
import SelectInput from '@/components/ui/SelectInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import DateRangePicker from '@/components/ui/DateRangePicker.vue'
import type { DateRange } from '@/components/ui/DateRangePicker.vue'

import { DEFAULT_PAGE_SIZE, ITEMS_PER_PAGE_OPTIONS } from '@/constants/pagination'
import { useToast } from '@/stores/toast'

const router = useRouter()
const toast  = useToast()

// ─── Modal confirmation ──────────────────────────────────────────
const confirmModal = ref<{
  show:    boolean
  variant: 'danger' | 'warning'
  title:   string
  message: string
  confirmLabel: string
  loading: boolean
  onConfirm: () => Promise<void>
}>({
  show:         false,
  variant:      'warning',
  title:        '',
  message:      '',
  confirmLabel: 'Confirmer',
  loading:      false,
  onConfirm:    async () => {},
})

function openConfirm(opts: {
  variant:      'danger' | 'warning'
  title:        string
  message:      string
  confirmLabel: string
  onConfirm:    () => Promise<void>
}) {
  confirmModal.value = { ...confirmModal.value, show: true, loading: false, ...opts }
}

async function handleConfirm() {
  confirmModal.value.loading = true
  try {
    await confirmModal.value.onConfirm()
    confirmModal.value.show = false
  } finally {
    confirmModal.value.loading = false
  }
}

const searchQuery  = ref('')
const filterRole   = ref('')
const filterStatus = ref('')
const filterPeriod = ref<DateRange>({ start: null, end: null })
const showFilters  = ref(false)

const ROLE_OPTIONS = [
  { label: 'Tous les rôles',        value: '' },
  { label: 'Super Administrateur',  value: 'SUPER_ADMIN' },
  { label: 'Pasteur',               value: 'PASTEUR' },
  { label: 'Secrétaire',            value: 'SECRETAIRE' },
  { label: 'Trésorier',             value: 'TRESORIER' },
  { label: 'Responsable de Groupe', value: 'RESP_GROUPE' },
  { label: 'Membre',                value: 'MEMBRE' },
]

const STATUS_OPTIONS = [
  { label: 'Tous les statuts', value: '' },
  { label: 'Actif',            value: 'ACTIF' },
  { label: 'Suspendu',         value: 'SUSPENDU' },
  { label: 'En attente',       value: 'EN_ATTENTE' },
]

const currentPage = ref(1)
const pageSize    = ref(DEFAULT_PAGE_SIZE)
const totalItems  = ref(0)
const totalPages  = ref(1)
const isLoading   = ref(false)
const users       = ref<any[]>([])

const columns = [
  { key: 'user',      label: 'Utilisateur', width: '30%' },
  { key: 'role',      label: 'Rôle',        width: '18%' },
  { key: 'status',    label: 'Statut',      width: '12%' },
  { key: 'groupe',    label: 'Groupe',      width: '18%' },
  { key: 'createdAt', label: 'Créé le',     width: '14%' },
]

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  PASTEUR:     'bg-green-100  text-green-800  dark:bg-green-900/30  dark:text-green-300',
  SECRETAIRE:  'bg-blue-100   text-blue-800   dark:bg-blue-900/30   dark:text-blue-300',
  TRESORIER:   'bg-amber-100  text-amber-800  dark:bg-amber-900/30  dark:text-amber-300',
  RESP_GROUPE: 'bg-teal-100   text-teal-800   dark:bg-teal-900/30   dark:text-teal-300',
  MEMBRE:      'bg-gray-100   text-gray-600   dark:bg-gray-700      dark:text-gray-300',
}
const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin', PASTEUR: 'Pasteur', SECRETAIRE: 'Secrétaire',
  TRESORIER: 'Trésorier', RESP_GROUPE: 'Resp. Groupe', MEMBRE: 'Membre',
}

function getRoleClass(role: string)   { return ROLE_COLORS[role] ?? ROLE_COLORS.MEMBRE }
function getRoleLabel(role: string)   { return ROLE_LABELS[role] ?? role }

function getStatusClass(status: string) {
  switch (status) {
    case 'ACTIF':      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'SUSPENDU':   return 'bg-red-100   text-red-700   dark:bg-red-900/30   dark:text-red-400'
    case 'EN_ATTENTE': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    default:           return 'bg-gray-100  text-gray-600'
  }
}
function getStatusLabel(status: string) {
  switch (status) {
    case 'ACTIF':      return 'Actif'
    case 'SUSPENDU':   return 'Suspendu'
    case 'EN_ATTENTE': return 'En attente'
    default:           return status
  }
}

const AVATAR_BG = [
  'bg-green-100 text-green-800', 'bg-blue-100 text-blue-800',
  'bg-purple-100 text-purple-800', 'bg-amber-100 text-amber-800',
  'bg-teal-100 text-teal-800',
]
function initials(nom: string, prenom: string) {
  return `${(prenom?.[0] ?? '').toUpperCase()}${(nom?.[0] ?? '').toUpperCase()}`
}
function avatarBg(id: number) {
  return AVATAR_BG[id % AVATAR_BG.length]
}

async function fetchUsers() {
  isLoading.value = true
  try {
    const params: any = {
      page: currentPage.value, limit: pageSize.value,
      orderBy: 'createdAt', order: 'DESC',
    }
    if (searchQuery.value.trim()) params.search    = searchQuery.value.trim()
    if (filterRole.value)         params.role      = filterRole.value
    if (filterStatus.value)       params.status    = filterStatus.value
    if (filterPeriod.value.start) params.dateStart = filterPeriod.value.start
    if (filterPeriod.value.end)   params.dateEnd   = filterPeriod.value.end

    // TODO: remplacer par votre appel API réel
    // const response = await usersApi.list(params)
    // users.value      = response.details.items
    // totalItems.value = response.details.meta.total
    // totalPages.value = response.details.meta.totalPages

    await new Promise(r => setTimeout(r, 600))
    users.value = [
      { id: 1, nom: 'Mbarga',  prenom: 'Jean-Baptiste', email: 'mbarga@eec.cm',  role: 'SUPER_ADMIN', status: 'ACTIF',      groupe: 'Direction',          createdAt: '2023-01-12' },
      { id: 2, nom: 'Ekwabi',  prenom: 'Samuel',        email: 'ekwabi@eec.cm',  role: 'PASTEUR',     status: 'ACTIF',      groupe: 'Direction pastorale', createdAt: '2023-03-05' },
      { id: 3, nom: 'Fouda',   prenom: 'Marie-Claire',  email: 'fouda@eec.cm',   role: 'SECRETAIRE',  status: 'ACTIF',      groupe: 'Bureau exécutif',    createdAt: '2023-04-18' },
      { id: 4, nom: 'Nkeng',   prenom: 'Paul',          email: 'nkeng@eec.cm',   role: 'TRESORIER',   status: 'ACTIF',      groupe: 'Commission finance',  createdAt: '2023-05-22' },
      { id: 5, nom: 'Tchamba', prenom: 'Agnès',         email: 'tchamba@eec.cm', role: 'RESP_GROUPE', status: 'SUSPENDU',   groupe: 'Groupe Femmes',      createdAt: '2023-07-01' },
      { id: 6, nom: 'Biya',    prenom: 'Hervé',         email: 'biya@eec.cm',    role: 'MEMBRE',      status: 'EN_ATTENTE', groupe: 'Jeunesse',           createdAt: '2024-01-15' },
    ]
    totalItems.value = 6
    totalPages.value = 1
  } catch (err: any) {
    toast('error', err?.message ?? 'Impossible de charger les utilisateurs.', 'Erreur')
  } finally {
    isLoading.value = false
  }
}

// Actions fixes (view + edit) passées au BaseTable
const actions = [
  {
    icon: 'view',
    label: 'Voir le détail',
    action: (item: any) => router.push({ name: 'ConfigviewUtilisateurs', params: { id: item.id } }),
  },
  {
    icon: 'edit',
    label: 'Modifier',
    action: (item: any) => router.push({ name: 'ConfigEditUsers', params: { id: item.id } }),
  },
]

// Suspendre un utilisateur actif
function askSuspend(item: any) {
  openConfirm({
    variant:      'warning',
    title:        `Suspendre ${item.prenom} ${item.nom} ?`,
    message:      'Cet utilisateur ne pourra plus se connecter jusqu\'à réactivation.',
    confirmLabel: 'Suspendre',
    onConfirm:    async () => {
      // TODO: await usersApi.suspend(item.id)
      item.status = 'SUSPENDU'
      toast('warning', `${item.prenom} ${item.nom} a été suspendu.`, 'Compte suspendu')
    },
  })
}

// Réactiver un utilisateur suspendu
function askActivate(item: any) {
  openConfirm({
    variant:      'success' as any,
    title:        `Réactiver ${item.prenom} ${item.nom} ?`,
    message:      'L\'utilisateur pourra à nouveau se connecter à l\'application.',
    confirmLabel: 'Réactiver',
    onConfirm:    async () => {
      // TODO: await usersApi.activate(item.id)
      item.status = 'ACTIF'
      toast('success', `${item.prenom} ${item.nom} est à nouveau actif.`, 'Compte réactivé')
    },
  })
}

// Supprimer définitivement
function askDelete(item: any) {
  openConfirm({
    variant:      'danger',
    title:        `Supprimer ${item.prenom} ${item.nom} ?`,
    message:      'Cette action est irréversible. Le compte sera définitivement supprimé.',
    confirmLabel: 'Supprimer définitivement',
    onConfirm:    async () => {
      // TODO: await usersApi.delete(item.id)
      users.value = users.value.filter((u: any) => u.id !== item.id)
      toast('success', `${item.prenom} ${item.nom} a été supprimé.`, 'Utilisateur supprimé')
    },
  })
}

let searchTimeout: ReturnType<typeof setTimeout>
watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => { currentPage.value = 1; fetchUsers() }, 300)
})
watch([filterRole, filterStatus, filterPeriod], () => { currentPage.value = 1; fetchUsers() }, { deep: true })
watch([currentPage, pageSize], fetchUsers)

function resetFilters() {
  filterRole.value   = ''
  filterStatus.value = ''
  filterPeriod.value = { start: null, end: null }
  searchQuery.value  = ''
  currentPage.value  = 1
}

const hasActiveFilters = computed(() =>
  !!filterRole.value || !!filterStatus.value || !!filterPeriod.value.start || !!filterPeriod.value.end
)

onMounted(fetchUsers)
</script>

<template>
  <div class="space-y-4 w-full min-w-0">

    <div class="flex items-center justify-between gap-4 flex-wrap">
      <h1 class="text-2xl md:text-3xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-white">
        Utilisateurs
      </h1>
      <div class="flex items-center gap-3">
        <button
          class="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors relative"
          :class="{ '!bg-green-50 !text-green-700 !border-green-300': showFilters || hasActiveFilters }"
          :title="showFilters ? 'Masquer les filtres' : 'Afficher les filtres'"
          @click="showFilters = !showFilters"
        >
          <Filter class="w-4 h-4" />
          <span
            v-if="hasActiveFilters"
            class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-600 rounded-full border-2 border-white dark:border-slate-800"
          />
        </button>

        <BaseButton
          variant="primary"
          :icon="Plus"
          label="Nouvel utilisateur"
          @click="router.push({ name: 'ConfigNewUtilisateurs' })"
        />
      </div>
    </div>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-show="showFilters"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200/50 dark:border-slate-700/50 shadow-sm"
      >
        <div class="space-y-1">
          <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Recherche</label>
          <SearchBar v-model="searchQuery" placeholder="Nom, email..." />
        </div>
        <div class="space-y-1">
          <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Rôle</label>
          <SelectInput v-model="filterRole" :options="ROLE_OPTIONS" placeholder="Tous les rôles" :max-height="200" />
        </div>
        <div class="space-y-1">
          <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Statut</label>
          <SelectInput v-model="filterStatus" :options="STATUS_OPTIONS" placeholder="Tous les statuts" />
        </div>
        <div class="space-y-1">
          <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Période de création</label>
          <DateRangePicker v-model="filterPeriod" placeholder="Choisir une période" />
        </div>
        <div v-if="hasActiveFilters" class="sm:col-span-2 lg:col-span-4 flex justify-end">
          <button class="text-xs text-red-500 hover:text-red-700 font-medium transition-colors" @click="resetFilters">
            Réinitialiser tous les filtres
          </button>
        </div>
      </div>
    </Transition>

    <BaseTable
      :columns="columns"
      :data="users"
      :actions="actions"
      :loading="isLoading"
      :pagination="true"
      :show-scrollbar="true"
      v-model:current-page="currentPage"
      :total-pages="totalPages"
      :total-items="totalItems"
      v-model:items-per-page="pageSize"
      :items-per-page-options="ITEMS_PER_PAGE_OPTIONS"
    >
      <template #cell-user="{ item }">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0" :class="avatarBg(item.id)">
            {{ initials(item.nom, item.prenom) }}
          </div>
          <div class="min-w-0">
            <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ item.prenom }} {{ item.nom }}</p>
            <p class="text-xs text-gray-500 dark:text-slate-400 truncate">{{ item.email }}</p>
          </div>
        </div>
      </template>

      <template #cell-role="{ item }">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getRoleClass(item.role)">
          {{ getRoleLabel(item.role) }}
        </span>
      </template>

      <template #cell-status="{ item }">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getStatusClass(item.status)">
          <span class="w-1.5 h-1.5 rounded-full mr-1.5"
            :class="{ 'bg-green-500': item.status === 'ACTIF', 'bg-red-500': item.status === 'SUSPENDU', 'bg-amber-500': item.status === 'EN_ATTENTE' }"
          />
          {{ getStatusLabel(item.status) }}
        </span>
      </template>

      <template #cell-groupe="{ item }">
        <span class="text-sm text-gray-600 dark:text-slate-300 truncate">{{ item.groupe || '—' }}</span>
      </template>

      <template #cell-createdAt="{ item }">
        <span class="text-sm text-gray-500 dark:text-slate-400">
          {{ item.createdAt ? new Date(item.createdAt).toLocaleDateString('fr-FR') : '—' }}
        </span>
      </template>
      <!-- Slot actions custom pour les boutons conditionnels -->
      <template #actions="{ item }">
        <!-- Suspendre (si actif) -->
        <button
          v-if="item.status === 'ACTIF'"
          class="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
          title="Suspendre"
          @click.stop="askSuspend(item)"
        >
          <ShieldOff class="w-4 h-4" />
        </button>

        <!-- Réactiver (si suspendu) -->
        <button
          v-else-if="item.status === 'SUSPENDU'"
          class="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
          title="Réactiver"
          @click.stop="askActivate(item)"
        >
          <ShieldCheck class="w-4 h-4" />
        </button>

        <!-- Supprimer (toujours visible) -->
        <button
          class="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          title="Supprimer définitivement"
          @click.stop="askDelete(item)"
        >
          <Trash2 class="w-4 h-4" />
        </button>
      </template>

    </BaseTable>

  </div>

    <!-- Modal confirmation -->
    <ConfirmModal
      v-model="confirmModal.show"
      :variant="confirmModal.variant"
      :title="confirmModal.title"
      :message="confirmModal.message"
      :confirm-label="confirmModal.confirmLabel"
      :confirm-loading="confirmModal.loading"
      @confirm="handleConfirm"
    />

</template>

<style scoped></style>