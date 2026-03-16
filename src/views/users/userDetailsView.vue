<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Pencil, ShieldOff, ShieldCheck, ArrowLeft } from 'lucide-vue-next'

import BaseButton from '@/components/ui/BaseButton.vue'
import { useToast } from '@/stores/toast'

const router = useRouter()
const route  = useRoute()
const toast  = useToast()

const isLoading = ref(false)
const user = ref<any>(null)
const userId = computed(() => route.params.id as string)

const ROLE_STYLES: Record<string, { badge: string; bg: string; color: string }> = {
  SUPER_ADMIN: { badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', bg: 'bg-purple-50 dark:bg-purple-900/20', color: 'text-purple-700 dark:text-purple-300' },
  PASTEUR:     { badge: 'bg-green-100  text-green-800  dark:bg-green-900/30  dark:text-green-300',  bg: 'bg-green-50  dark:bg-green-900/20',  color: 'text-green-700  dark:text-green-300'  },
  SECRETAIRE:  { badge: 'bg-blue-100   text-blue-800   dark:bg-blue-900/30   dark:text-blue-300',   bg: 'bg-blue-50   dark:bg-blue-900/20',   color: 'text-blue-700   dark:text-blue-300'   },
  TRESORIER:   { badge: 'bg-amber-100  text-amber-800  dark:bg-amber-900/30  dark:text-amber-300',  bg: 'bg-amber-50  dark:bg-amber-900/20',  color: 'text-amber-700  dark:text-amber-300'  },
  RESP_GROUPE: { badge: 'bg-teal-100   text-teal-800   dark:bg-teal-900/30   dark:text-teal-300',   bg: 'bg-teal-50   dark:bg-teal-900/20',   color: 'text-teal-700   dark:text-teal-300'   },
  MEMBRE:      { badge: 'bg-gray-100   text-gray-600   dark:bg-gray-700      dark:text-gray-300',   bg: 'bg-gray-50   dark:bg-slate-800',      color: 'text-gray-600   dark:text-gray-300'   },
}
const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Administrateur', PASTEUR: 'Pasteur', SECRETAIRE: 'Secrétaire',
  TRESORIER: 'Trésorier', RESP_GROUPE: 'Responsable de Groupe', MEMBRE: 'Membre',
}

const roleStyle  = computed(() => ROLE_STYLES[user.value?.role] ?? ROLE_STYLES.MEMBRE)
const roleLabel  = computed(() => ROLE_LABELS[user.value?.role]  ?? user.value?.role)

const STATUS_MAP: Record<string, { label: string; dot: string; text: string }> = {
  ACTIF:      { label: 'Actif',      dot: 'bg-green-500', text: 'text-green-700 dark:text-green-400' },
  SUSPENDU:   { label: 'Suspendu',   dot: 'bg-red-500',   text: 'text-red-700   dark:text-red-400'   },
  EN_ATTENTE: { label: 'En attente', dot: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-400' },
}
const statusInfo = computed(() => STATUS_MAP[user.value?.status] ?? STATUS_MAP.EN_ATTENTE)

const initials = computed(() => {
  if (!user.value) return '?'
  return `${(user.value.prenom?.[0] ?? '').toUpperCase()}${(user.value.nom?.[0] ?? '').toUpperCase()}`
})

const PERM_GROUPS = [
  { label: 'Membres',      keys: ['membres.read','membres.write'],       labels: { 'membres.read': 'Voir', 'membres.write': 'Gérer' } },
  { label: 'Calendrier',   keys: ['calendrier.read','calendrier.write'],  labels: { 'calendrier.read': 'Voir', 'calendrier.write': 'Gérer' } },
  { label: 'Annonces',     keys: ['annonces.read','annonces.write'],      labels: { 'annonces.read': 'Voir', 'annonces.write': 'Publier' } },
  { label: 'Finances',     keys: ['finances.read','finances.write'],      labels: { 'finances.read': 'Voir', 'finances.write': 'Gérer' } },
  { label: 'Rapports',     keys: ['rapports.read'],                       labels: { 'rapports.read': 'Consulter' } },
  { label: 'Groupes',      keys: ['groupes.read','groupes.write'],        labels: { 'groupes.read': 'Voir', 'groupes.write': 'Gérer' } },
  { label: 'Utilisateurs', keys: ['users.read','users.write'],            labels: { 'users.read': 'Voir', 'users.write': 'Gérer' } },
  { label: 'Paramètres',   keys: ['settings'],                            labels: { 'settings': 'Configurer' } },
]

function hasPermission(key: string) {
  return user.value?.permissions?.includes(key) ?? false
}

const ACTIVITY_COLORS: Record<string, string> = {
  login: 'bg-green-500', edit: 'bg-blue-500', create: 'bg-teal-500', delete: 'bg-red-500', default: 'bg-gray-400',
}

async function toggleStatus() {
  if (!user.value) return
  const next = user.value.status === 'ACTIF' ? 'SUSPENDU' : 'ACTIF'
  // TODO: appel API
  user.value.status = next
  toast(
    next === 'SUSPENDU' ? 'warning' : 'success',
    next === 'SUSPENDU' ? `${user.value.prenom} ${user.value.nom} a été suspendu.` : `${user.value.prenom} ${user.value.nom} est à nouveau actif.`,
    next === 'SUSPENDU' ? 'Compte suspendu' : 'Compte réactivé'
  )
}

async function fetchUser() {
  isLoading.value = true
  try {
    await new Promise(r => setTimeout(r, 500))
    // TODO: const response = await usersApi.getById(userId.value)
    user.value = {
      id: userId.value,
      prenom: 'Samuel', nom: 'Ekwabi',
      email: 'ekwabi@eec.cm', telephone: '+237 677 123 456',
      sexe: 'Homme', role: 'PASTEUR', status: 'ACTIF',
      groupe: 'Direction pastorale',
      createdAt: '2023-03-05T08:00:00',
      lastLogin:  '2026-03-16T09:14:00',
      permissions: ['membres.read','membres.write','calendrier.read','calendrier.write','annonces.read','annonces.write','rapports.read','groupes.read','groupes.write'],
      activity: [
        { type: 'login',  label: 'Connexion au tableau de bord',        date: '2026-03-16T09:14:00' },
        { type: 'edit',   label: "Modification du profil d'un membre",  date: '2026-03-15T17:42:00' },
        { type: 'create', label: "Ajout d'un événement au calendrier",  date: '2026-03-14T11:05:00' },
        { type: 'edit',   label: "Publication d'une annonce",           date: '2026-03-13T14:30:00' },
        { type: 'login',  label: 'Connexion au tableau de bord',        date: '2026-03-12T08:20:00' },
      ],
    }
  } catch (err: any) {
    toast('error', err?.message ?? "Impossible de charger l'utilisateur.", 'Erreur')
  } finally {
    isLoading.value = false
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}
function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

onMounted(fetchUser)
</script>

<template>
  <div class="space-y-5 w-full">

    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div class="flex items-center gap-3">
        <button
          class="p-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          @click="router.back()"
        >
          <ArrowLeft class="w-4 h-4 text-gray-500 dark:text-slate-400" />
        </button>
        <h1 class="text-2xl md:text-3xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-white">
          Détail utilisateur
        </h1>
      </div>

      <div v-if="user" class="flex items-center gap-3">
        <button
          class="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-colors"
          :class="user.status === 'ACTIF'
            ? 'border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20'
            : 'border-green-200 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/20'"
          @click="toggleStatus"
        >
          <ShieldOff v-if="user.status === 'ACTIF'" class="w-4 h-4" />
          <ShieldCheck v-else class="w-4 h-4" />
          {{ user.status === 'ACTIF' ? 'Suspendre' : 'Réactiver' }}
        </button>
        <BaseButton
          variant="primary"
          :icon="Pencil"
          label="Modifier"
          @click="router.push({ name: 'ConfigEditUsers', params: { id: userId } })"
        />
      </div>
    </div>

    <!-- Skeleton -->
    <template v-if="isLoading">
      <div v-for="i in 3" :key="i" class="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 animate-pulse">
        <div class="h-4 w-1/3 bg-gray-200 dark:bg-slate-700 rounded mb-4"></div>
        <div class="grid grid-cols-2 gap-4">
          <div v-for="j in 4" :key="j" class="h-10 bg-gray-100 dark:bg-slate-800 rounded-lg"></div>
        </div>
      </div>
    </template>

    <template v-else-if="user">

      <!-- Carte identité -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div class="p-6 flex items-center gap-5 border-b border-gray-100 dark:border-slate-700">
          <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0" :class="roleStyle.bg + ' ' + roleStyle.color">
            {{ initials }}
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="text-lg font-black text-gray-900 dark:text-white">{{ user.prenom }} {{ user.nom }}</h2>
            <p class="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{{ user.email }}</p>
            <div class="flex items-center gap-3 mt-2 flex-wrap">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="roleStyle.badge">{{ roleLabel }}</span>
              <span class="inline-flex items-center gap-1.5 text-xs font-medium" :class="statusInfo.text">
                <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" :class="statusInfo.dot" />
                {{ statusInfo.label }}
              </span>
            </div>
          </div>
          <div class="text-right hidden sm:block flex-shrink-0">
            <p class="text-xs text-gray-400 dark:text-slate-500">Dernière connexion</p>
            <p class="text-sm font-medium text-gray-700 dark:text-slate-200 mt-0.5">{{ formatDateTime(user.lastLogin) }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-slate-700">
          <div class="divide-y divide-gray-100 dark:divide-slate-700">
            <div class="px-6 py-3.5 flex justify-between items-center">
              <span class="text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wide">Téléphone</span>
              <span class="text-sm text-gray-800 dark:text-slate-200">{{ user.telephone || '—' }}</span>
            </div>
            <div class="px-6 py-3.5 flex justify-between items-center">
              <span class="text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wide">Sexe</span>
              <span class="text-sm text-gray-800 dark:text-slate-200">{{ user.sexe || '—' }}</span>
            </div>
            <div class="px-6 py-3.5 flex justify-between items-center">
              <span class="text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wide">Créé le</span>
              <span class="text-sm text-gray-800 dark:text-slate-200">{{ formatDate(user.createdAt) }}</span>
            </div>
          </div>
          <div class="divide-y divide-gray-100 dark:divide-slate-700">
            <div class="px-6 py-3.5 flex justify-between items-center">
              <span class="text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wide">Groupe</span>
              <span class="text-sm text-gray-800 dark:text-slate-200">{{ user.groupe || '—' }}</span>
            </div>
            <div class="px-6 py-3.5 flex justify-between items-center">
              <span class="text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wide">Rôle</span>
              <span class="text-sm font-medium" :class="roleStyle.color">{{ roleLabel }}</span>
            </div>
            <div class="px-6 py-3.5 flex justify-between items-center">
              <span class="text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wide">Statut</span>
              <span class="inline-flex items-center gap-1.5 text-sm font-medium" :class="statusInfo.text">
                <span class="w-1.5 h-1.5 rounded-full" :class="statusInfo.dot" />
                {{ statusInfo.label }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Permissions -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
          <div>
            <p class="text-sm font-bold text-gray-900 dark:text-white">Permissions</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ user.permissions.length }} permission{{ user.permissions.length > 1 ? 's' : '' }} accordée{{ user.permissions.length > 1 ? 's' : '' }}</p>
          </div>
          <BaseButton variant="secondary" size="sm" :icon="Pencil" label="Modifier" @click="router.push({ name: 'ConfigEditUsers', params: { id: userId } })" />
        </div>
        <div class="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div
            v-for="group in PERM_GROUPS" :key="group.label"
            class="rounded-xl border p-3.5"
            :class="group.keys.some(k => hasPermission(k))
              ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
              : 'border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-800/50'"
          >
            <p class="text-xs font-bold mb-2" :class="group.keys.some(k => hasPermission(k)) ? 'text-green-800 dark:text-green-300' : 'text-gray-500 dark:text-slate-400'">
              {{ group.label }}
            </p>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="key in group.keys" :key="key"
                class="text-[11px] px-2 py-0.5 rounded-full font-medium"
                :class="hasPermission(key)
                  ? 'bg-green-200 text-green-800 dark:bg-green-800/40 dark:text-green-300'
                  : 'bg-gray-200 text-gray-400 dark:bg-slate-700 dark:text-slate-500 line-through'"
              >
                {{ group.labels[key] }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Activité récente -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
          <p class="text-sm font-bold text-gray-900 dark:text-white">Activité récente</p>
          <p class="text-xs text-gray-400 mt-0.5">Dernières actions effectuées par cet utilisateur</p>
        </div>
        <div class="p-6">
          <div class="relative">
            <div class="absolute left-[11px] top-2 bottom-2 w-px bg-gray-100 dark:bg-slate-700" />
            <div class="space-y-4">
              <div v-for="(act, i) in user.activity" :key="i" class="relative flex items-start gap-4 pl-7">
                <span class="absolute left-0 top-1 w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-white dark:ring-slate-900"
                  :class="ACTIVITY_COLORS[act.type] ?? ACTIVITY_COLORS.default" />
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-gray-800 dark:text-slate-200">{{ act.label }}</p>
                  <p class="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{{ formatDateTime(act.date) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>

<style scoped></style>