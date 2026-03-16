<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Save, X, ArrowLeft } from 'lucide-vue-next'

import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import SelectInput from '@/components/ui/SelectInput.vue'
import { useToast } from '@/stores/toast'

const router = useRouter()
const route  = useRoute()
const toast  = useToast()

const isEditMode = computed(() => route.name === 'ConfigEditUsers')
const userId     = computed(() => route.params.id as string | undefined)

const isLoading = ref(false)
const saving    = ref(false)

const ROLES = [
  { value: 'SUPER_ADMIN', label: 'Super Administrateur', description: 'Accès total au système, configuration et gestion des utilisateurs.', color: 'text-purple-800 dark:text-purple-300', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-700' },
  { value: 'PASTEUR',     label: 'Pasteur',               description: 'Accès complet à la vie spirituelle, membres, calendrier et rapports.',    color: 'text-green-800  dark:text-green-300',  bg: 'bg-green-50  dark:bg-green-900/20',  border: 'border-green-200  dark:border-green-700'  },
  { value: 'SECRETAIRE',  label: 'Secrétaire',            description: 'Gestion du registre des membres, calendrier, annonces et correspondances.', color: 'text-blue-800   dark:text-blue-300',   bg: 'bg-blue-50   dark:bg-blue-900/20',   border: 'border-blue-200   dark:border-blue-700'   },
  { value: 'TRESORIER',   label: 'Trésorier',             description: 'Accès exclusif aux finances : cotisations, dons, dépenses et budgets.',     color: 'text-amber-800  dark:text-amber-300',  bg: 'bg-amber-50  dark:bg-amber-900/20',  border: 'border-amber-200  dark:border-amber-700'  },
  { value: 'RESP_GROUPE', label: 'Responsable de Groupe', description: 'Gestion de son groupe uniquement : membres, présences et rapports.',        color: 'text-teal-800   dark:text-teal-300',   bg: 'bg-teal-50   dark:bg-teal-900/20',   border: 'border-teal-200   dark:border-teal-700'   },
  { value: 'MEMBRE',      label: 'Membre',                description: 'Accès en lecture : profil personnel, calendrier et annonces.',              color: 'text-gray-700   dark:text-slate-300',  bg: 'bg-gray-50   dark:bg-slate-800',     border: 'border-gray-200   dark:border-slate-600'  },
]

const ALL_PERMISSIONS = [
  { key: 'membres.read',     label: 'Voir les membres',       description: 'Consulter la liste et les fiches membres' },
  { key: 'membres.write',    label: 'Gérer les membres',      description: 'Ajouter, modifier et archiver des membres' },
  { key: 'calendrier.read',  label: 'Voir le calendrier',     description: 'Consulter les événements' },
  { key: 'calendrier.write', label: 'Gérer le calendrier',    description: 'Créer et modifier des événements' },
  { key: 'annonces.read',    label: 'Voir les annonces',      description: 'Lire les annonces publiées' },
  { key: 'annonces.write',   label: 'Publier des annonces',   description: 'Créer et publier des annonces' },
  { key: 'finances.read',    label: 'Voir les finances',      description: 'Consulter les rapports financiers' },
  { key: 'finances.write',   label: 'Gérer les finances',     description: 'Saisir dépenses, dons et cotisations' },
  { key: 'rapports.read',    label: 'Consulter les rapports', description: 'Accéder aux statistiques et rapports' },
  { key: 'groupes.read',     label: 'Voir les groupes',       description: 'Consulter les groupes et cellules' },
  { key: 'groupes.write',    label: 'Gérer les groupes',      description: 'Créer et administrer les groupes' },
  { key: 'users.read',       label: 'Voir les utilisateurs',  description: 'Consulter la liste des comptes' },
  { key: 'users.write',      label: 'Gérer les utilisateurs', description: "Créer, modifier et suspendre des comptes" },
  { key: 'settings',         label: 'Paramètres système',     description: "Configurer l'application" },
]

const DEFAULT_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN:  ALL_PERMISSIONS.map(p => p.key),
  PASTEUR:      ['membres.read','membres.write','calendrier.read','calendrier.write','annonces.read','annonces.write','rapports.read','groupes.read','groupes.write'],
  SECRETAIRE:   ['membres.read','membres.write','calendrier.read','calendrier.write','annonces.read','annonces.write','rapports.read','groupes.read'],
  TRESORIER:    ['finances.read','finances.write','rapports.read','membres.read'],
  RESP_GROUPE:  ['groupes.read','groupes.write','membres.read','calendrier.read','annonces.read'],
  MEMBRE:       ['membres.read','calendrier.read','annonces.read'],
}

const form = reactive({
  prenom: '', nom: '', email: '', telephone: '',
  sexe: '', groupe: '', statut: 'ACTIF', password: '',
})

const selectedRole    = ref('')
const activePerms     = ref<string[]>([])
const isDefaultPerms  = ref(true)
const roleJustChanged = ref(false)

const SEXE_OPTIONS   = ['Homme', 'Femme']
const STATUT_OPTIONS = [
  { label: 'Actif',      value: 'ACTIF' },
  { label: 'Suspendu',   value: 'SUSPENDU' },
  { label: 'En attente', value: 'EN_ATTENTE' },
]

async function fetchUser() {
  if (!isEditMode.value) return
  isLoading.value = true
  try {
    await new Promise(r => setTimeout(r, 500))
    // TODO: const response = await usersApi.getById(userId.value)
    const data = {
      prenom: 'Samuel', nom: 'Ekwabi', email: 'ekwabi@eec.cm',
      telephone: '+237 677 123 456', sexe: 'Homme', role: 'PASTEUR',
      statut: 'ACTIF', groupe: 'Direction pastorale',
      permissions: ['membres.read','membres.write','calendrier.read','calendrier.write','annonces.read','annonces.write','rapports.read','groupes.read','groupes.write'],
    }
    Object.assign(form, {
      prenom: data.prenom, nom: data.nom, email: data.email,
      telephone: data.telephone, sexe: data.sexe,
      statut: data.statut, groupe: data.groupe,
    })
    selectedRole.value = data.role
    activePerms.value  = [...data.permissions]
    checkIsDefault()
  } catch (err: any) {
    toast('error', err?.message ?? "Impossible de charger l'utilisateur.", 'Erreur')
  } finally {
    isLoading.value = false
  }
}

watch(selectedRole, (newRole, oldRole) => {
  if (!oldRole) return
  if (isEditMode.value) {
    roleJustChanged.value = true
  } else {
    activePerms.value = [...(DEFAULT_PERMISSIONS[newRole] ?? [])]
    isDefaultPerms.value = true
  }
})

function applyRoleDefaults() {
  activePerms.value    = [...(DEFAULT_PERMISSIONS[selectedRole.value] ?? [])]
  isDefaultPerms.value = true
  roleJustChanged.value = false
}
function keepCurrentPerms() {
  roleJustChanged.value = false
  checkIsDefault()
}

function checkIsDefault() {
  const defaults = DEFAULT_PERMISSIONS[selectedRole.value] ?? []
  isDefaultPerms.value = activePerms.value.length === defaults.length && activePerms.value.every(p => defaults.includes(p))
}

watch(activePerms, checkIsDefault, { deep: true })

function togglePerm(key: string) {
  const idx = activePerms.value.indexOf(key)
  if (idx >= 0) activePerms.value.splice(idx, 1)
  else activePerms.value.push(key)
}
function resetPerms() {
  activePerms.value = [...(DEFAULT_PERMISSIONS[selectedRole.value] ?? [])]
}

async function handleSave() {
  if (!form.prenom || !form.nom || !form.email || !selectedRole.value) {
    toast('warning', 'Veuillez remplir tous les champs obligatoires.', 'Champs manquants')
    return
  }
  saving.value = true
  try {
    const payload = { ...form, role: selectedRole.value, permissions: activePerms.value }
    console.log('Payload:', payload)
    await new Promise(r => setTimeout(r, 1400))
    if (isEditMode.value) {
      toast('success', `${form.prenom} ${form.nom} a été mis à jour.`, 'Modifications enregistrées')
      router.push({ name: 'ConfigviewUtilisateurs', params: { id: userId.value } })
    } else {
      toast('success', `${form.prenom} ${form.nom} a été créé avec succès.`, 'Utilisateur créé')
      router.push({ name: 'ConfigNewUtilisateurs' })
    }
  } catch (err: any) {
    toast('error', err?.message ?? 'Une erreur est survenue.', 'Erreur')
  } finally {
    saving.value = false
  }
}

function handleCancel() {
  router.back()
}

onMounted(fetchUser)
</script>

<template>
  <div class="space-y-6 w-full">

    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div class="flex items-center gap-3">
        <button
          class="p-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          @click="router.back()"
        >
          <ArrowLeft class="w-4 h-4 text-gray-500 dark:text-slate-400" />
        </button>
        <div>
          <h1 class="text-2xl md:text-3xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-white">
            {{ isEditMode ? "Modifier l'utilisateur" : 'Nouvel utilisateur' }}
          </h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {{ isEditMode ? 'Modifiez les informations, le rôle ou les permissions.' : 'Les permissions sont pré-sélectionnées selon le rôle choisi.' }}
          </p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <BaseButton variant="secondary" label="Annuler" :icon="X" @click="handleCancel" />
        <BaseButton variant="primary" :label="saving ? 'Enregistrement...' : (isEditMode ? 'Mettre à jour' : 'Enregistrer')" :icon="Save" :loading="saving" @click="handleSave" />
      </div>
    </div>

    <template v-if="isLoading">
      <div v-for="i in 3" :key="i" class="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 animate-pulse">
        <div class="h-4 w-1/4 bg-gray-200 dark:bg-slate-700 rounded mb-5"></div>
        <div class="grid grid-cols-2 gap-4">
          <div v-for="j in 4" :key="j" class="h-10 bg-gray-100 dark:bg-slate-800 rounded-lg"></div>
        </div>
      </div>
    </template>

    <template v-else>

      <!-- Informations personnelles -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
          <p class="text-sm font-bold text-gray-900 dark:text-white">Informations personnelles</p>
          <p class="text-xs text-gray-400 mt-0.5">Identité et coordonnées de l'utilisateur</p>
        </div>
        <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <BaseInput v-model="form.prenom"    label="Prénom *"   placeholder="Ex: Jean-Baptiste" required />
          <BaseInput v-model="form.nom"       label="Nom *"      placeholder="Ex: Mbarga"        required />
          <BaseInput v-model="form.email"     label="Email *"    placeholder="user@eec.cm"       required type="email" />
          <BaseInput v-model="form.telephone" label="Téléphone"  placeholder="+237 6XX XXX XXX" />
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-semibold text-gray-700 dark:text-slate-300">Sexe</label>
            <SelectInput v-model="form.sexe" :options="SEXE_OPTIONS" placeholder="Choisir..." />
          </div>
          <BaseInput v-model="form.groupe" label="Groupe / Ministère" placeholder="Ex: Jeunesse, Femmes..." />
        </div>
      </div>

      <!-- Rôle -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
          <p class="text-sm font-bold text-gray-900 dark:text-white">Rôle <span class="text-red-500">*</span></p>
          <p class="text-xs text-gray-400 mt-0.5">Sélectionnez le rôle de cet utilisateur</p>
        </div>
        <div class="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <button
            v-for="role in ROLES" :key="role.value"
            type="button"
            class="relative text-left p-4 rounded-xl border-2 transition-all duration-150"
            :class="selectedRole === role.value
              ? `${role.bg} ${role.border} ${role.color}`
              : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'"
            @click="selectedRole = role.value"
          >
            <span v-if="selectedRole === role.value" class="absolute top-3 right-3 w-4 h-4 rounded-full flex items-center justify-center bg-current">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 5l2 2 4-4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <p class="text-sm font-bold mb-1" :class="selectedRole === role.value ? role.color : 'text-gray-800 dark:text-white'">{{ role.label }}</p>
            <p class="text-xs leading-relaxed" :class="selectedRole === role.value ? role.color + ' opacity-75' : 'text-gray-500 dark:text-slate-400'">{{ role.description }}</p>
          </button>
        </div>
      </div>

      <!-- Alerte changement de rôle en mode édition -->
      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0">
        <div v-if="isEditMode && roleJustChanged" class="flex items-start gap-4 p-4 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20">
          <div class="flex-1">
            <p class="text-sm font-semibold text-amber-800 dark:text-amber-300">Rôle modifié</p>
            <p class="text-xs text-amber-700 dark:text-amber-400 mt-0.5">Souhaitez-vous réinitialiser les permissions selon les défauts du nouveau rôle, ou conserver les permissions actuelles ?</p>
          </div>
          <div class="flex gap-2 flex-shrink-0">
            <button class="px-3 py-1.5 text-xs font-semibold rounded-lg border border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 transition-colors" @click="keepCurrentPerms">Conserver</button>
            <button class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors" @click="applyRoleDefaults">Réinitialiser</button>
          </div>
        </div>
      </Transition>

      <!-- Permissions -->
      <div v-if="selectedRole" class="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
          <div>
            <p class="text-sm font-bold text-gray-900 dark:text-white">
              Permissions
              <span class="ml-2 text-xs font-normal px-2 py-0.5 rounded-full"
                :class="isDefaultPerms ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'">
                {{ isDefaultPerms ? 'par défaut du rôle' : 'modifiées' }}
              </span>
            </p>
            <p class="text-xs text-gray-400 mt-0.5">Cochez les permissions à accorder à cet utilisateur</p>
          </div>
          <button v-if="!isDefaultPerms" type="button" class="text-xs text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 underline underline-offset-2 transition-colors" @click="resetPerms">
            Réinitialiser
          </button>
        </div>
        <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <label
            v-for="perm in ALL_PERMISSIONS" :key="perm.key"
            class="flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-100 select-none"
            :class="activePerms.includes(perm.key)
              ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
              : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600'"
          >
            <input type="checkbox" class="mt-0.5 accent-green-600 w-4 h-4 flex-shrink-0" :checked="activePerms.includes(perm.key)" @change="togglePerm(perm.key)" />
            <div>
              <p class="text-sm font-medium text-gray-800 dark:text-white leading-snug">{{ perm.label }}</p>
              <p class="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{{ perm.description }}</p>
            </div>
          </label>
        </div>
      </div>

      <!-- Accès & sécurité -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
          <p class="text-sm font-bold text-gray-900 dark:text-white">Accès & sécurité</p>
          <p class="text-xs text-gray-400 mt-0.5">{{ isEditMode ? 'Statut du compte et réinitialisation du mot de passe' : 'Statut du compte et mot de passe initial' }}</p>
        </div>
        <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-semibold text-gray-700 dark:text-slate-300">Statut du compte</label>
            <SelectInput v-model="form.statut" :options="STATUT_OPTIONS" />
          </div>
          <BaseInput
            v-model="form.password"
            :label="isEditMode ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe temporaire'"
            type="password"
            :placeholder="isEditMode ? 'Laisser vide pour ne pas modifier' : '••••••••'"
          />
        </div>
      </div>

      <!-- Boutons bas -->
      <div class="flex justify-end gap-3 pb-8">
        <BaseButton variant="secondary" label="Annuler" :icon="X" @click="router.back()" />
        <BaseButton variant="primary" :label="saving ? 'Enregistrement...' : (isEditMode ? 'Mettre à jour' : 'Enregistrer')" :icon="Save" :loading="saving" size="lg" @click="handleSave" />
      </div>

    </template>
  </div>
</template>

<style scoped></style>