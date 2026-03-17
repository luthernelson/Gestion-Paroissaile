<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Shield, ChevronDown, ChevronRight, Save, RotateCcw, Plus, X, Trash2 } from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import { useToast } from '@/stores/toast'

const router = useRouter()
const toast  = useToast()
const saving = ref(false)

// ─── Permissions prédéfinies groupées ────────────────────────────
const PERMISSION_GROUPS = [
  {
    key: 'membres', label: 'Membres',
    perms: [
      { key: 'membres.read',  label: 'Voir les membres',  description: 'Consulter la liste et les fiches membres' },
      { key: 'membres.write', label: 'Gérer les membres', description: 'Ajouter, modifier, archiver des membres' },
    ],
  },
  {
    key: 'calendrier', label: 'Calendrier',
    perms: [
      { key: 'calendrier.read',  label: 'Voir le calendrier',  description: 'Consulter les événements' },
      { key: 'calendrier.write', label: 'Gérer le calendrier', description: 'Créer et modifier des événements' },
    ],
  },
  {
    key: 'annonces', label: 'Annonces',
    perms: [
      { key: 'annonces.read',  label: 'Voir les annonces',    description: 'Lire les annonces publiées' },
      { key: 'annonces.write', label: 'Publier des annonces', description: 'Créer et publier des annonces' },
    ],
  },
  {
    key: 'finances', label: 'Finances',
    perms: [
      { key: 'finances.read',  label: 'Voir les finances',  description: 'Consulter les rapports financiers' },
      { key: 'finances.write', label: 'Gérer les finances', description: 'Saisir dépenses, dons et cotisations' },
    ],
  },
  {
    key: 'rapports', label: 'Rapports',
    perms: [
      { key: 'rapports.read', label: 'Consulter les rapports', description: 'Accéder aux statistiques et rapports' },
    ],
  },
  {
    key: 'groupes', label: 'Groupes',
    perms: [
      { key: 'groupes.read',  label: 'Voir les groupes',  description: 'Consulter les groupes et cellules' },
      { key: 'groupes.write', label: 'Gérer les groupes', description: 'Créer et administrer les groupes' },
    ],
  },
  {
    key: 'users', label: 'Utilisateurs',
    perms: [
      { key: 'users.read',  label: 'Voir les utilisateurs',  description: 'Consulter la liste des comptes' },
      { key: 'users.write', label: 'Gérer les utilisateurs', description: 'Créer, modifier, suspendre des comptes' },
    ],
  },
  {
    key: 'site', label: 'Site web',
    perms: [
      { key: 'site.read',  label: 'Voir la config site',  description: 'Consulter la configuration du site' },
      { key: 'site.write', label: 'Gérer la config site', description: 'Modifier la configuration du site' },
    ],
  },
  {
    key: 'settings', label: 'Paramètres',
    perms: [
      { key: 'settings', label: 'Paramètres système', description: "Configurer l'application" },
    ],
  },
]

const ALL_PERM_KEYS = PERMISSION_GROUPS.flatMap(g => g.perms.map(p => p.key))

// Palettes disponibles pour les nouveaux rôles
const PALETTES = [
  { color: 'text-indigo-700 dark:text-indigo-300', bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-200 dark:border-indigo-700' },
  { color: 'text-rose-700 dark:text-rose-300',     bg: 'bg-rose-50 dark:bg-rose-900/20',     border: 'border-rose-200 dark:border-rose-700'   },
  { color: 'text-cyan-700 dark:text-cyan-300',     bg: 'bg-cyan-50 dark:bg-cyan-900/20',     border: 'border-cyan-200 dark:border-cyan-700'   },
  { color: 'text-lime-700 dark:text-lime-300',     bg: 'bg-lime-50 dark:bg-lime-900/20',     border: 'border-lime-200 dark:border-lime-700'   },
  { color: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-700'},
]
let paletteIdx = 0

// ─── Types ───────────────────────────────────────────────────────
interface Role {
  id: string
  label: string
  description: string
  color: string
  bg: string
  border: string
  editable: boolean
  custom: boolean          // rôle créé par l'utilisateur
  permissions: string[]
  originalPermissions: string[]
}

// ─── Rôles ───────────────────────────────────────────────────────
const roles = ref<Role[]>([
  {
    id: 'SUPER_ADMIN', label: 'Super Administrateur',
    description: 'Accès total au système — non modifiable.',
    color: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-700',
    editable: false, custom: false,
    permissions: [...ALL_PERM_KEYS], originalPermissions: [...ALL_PERM_KEYS],
  },
  {
    id: 'PASTEUR', label: 'Pasteur',
    description: 'Vie spirituelle, membres, calendrier, rapports.',
    color: 'text-green-700 dark:text-green-300', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-700',
    editable: true, custom: false,
    permissions: ['membres.read','membres.write','calendrier.read','calendrier.write','annonces.read','annonces.write','rapports.read','groupes.read','groupes.write'],
    originalPermissions: ['membres.read','membres.write','calendrier.read','calendrier.write','annonces.read','annonces.write','rapports.read','groupes.read','groupes.write'],
  },
  {
    id: 'SECRETAIRE', label: 'Secrétaire',
    description: 'Membres, calendrier, annonces, rapports.',
    color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-700',
    editable: true, custom: false,
    permissions: ['membres.read','membres.write','calendrier.read','calendrier.write','annonces.read','annonces.write','rapports.read','groupes.read'],
    originalPermissions: ['membres.read','membres.write','calendrier.read','calendrier.write','annonces.read','annonces.write','rapports.read','groupes.read'],
  },
  {
    id: 'TRESORIER', label: 'Trésorier',
    description: 'Finances uniquement.',
    color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-700',
    editable: true, custom: false,
    permissions: ['finances.read','finances.write','rapports.read','membres.read'],
    originalPermissions: ['finances.read','finances.write','rapports.read','membres.read'],
  },
  {
    id: 'RESP_GROUPE', label: 'Responsable de Groupe',
    description: 'Son groupe uniquement.',
    color: 'text-teal-700 dark:text-teal-300', bg: 'bg-teal-50 dark:bg-teal-900/20', border: 'border-teal-200 dark:border-teal-700',
    editable: true, custom: false,
    permissions: ['groupes.read','groupes.write','membres.read','calendrier.read','annonces.read'],
    originalPermissions: ['groupes.read','groupes.write','membres.read','calendrier.read','annonces.read'],
  },
  {
    id: 'MEMBRE', label: 'Membre',
    description: 'Accès lecture uniquement.',
    color: 'text-gray-600 dark:text-slate-300', bg: 'bg-gray-50 dark:bg-slate-800', border: 'border-gray-200 dark:border-slate-600',
    editable: true, custom: false,
    permissions: ['membres.read','calendrier.read','annonces.read'],
    originalPermissions: ['membres.read','calendrier.read','annonces.read'],
  },
])

// ─── Rôle sélectionné ────────────────────────────────────────────
const selectedRoleId = ref('PASTEUR')
const selectedRole   = computed(() => roles.value.find(r => r.id === selectedRoleId.value) ?? roles.value[0])

function selectRole(id: string) {
  // Si création en cours, fermer sans valider
  showCreateForm.value = false
  selectedRoleId.value = id
  // Ouvrir le premier groupe à chaque changement de rôle
  openGroupKey.value = PERMISSION_GROUPS[0].key
}

// ─── Accordion exclusif — un seul groupe ouvert ───────────────────
const openGroupKey = ref<string>(PERMISSION_GROUPS[0].key)

function toggleGroup_accordion(key: string) {
  openGroupKey.value = openGroupKey.value === key ? '' : key
}

// ─── Helpers permissions ─────────────────────────────────────────
function hasPerm(key: string) {
  return selectedRole.value?.permissions?.includes(key) ?? false
}
function groupChecked(group: typeof PERMISSION_GROUPS[0]) {
  return group.perms.every(p => hasPerm(p.key))
}
function groupIndeterminate(group: typeof PERMISSION_GROUPS[0]) {
  const c = group.perms.filter(p => hasPerm(p.key)).length
  return c > 0 && c < group.perms.length
}
function togglePerm(key: string) {
  if (!selectedRole.value.editable) return
  const idx = selectedRole.value.permissions.indexOf(key)
  if (idx >= 0) selectedRole.value.permissions.splice(idx, 1)
  else selectedRole.value.permissions.push(key)
}
function toggleGroupPerms(group: typeof PERMISSION_GROUPS[0]) {
  if (!selectedRole.value.editable) return
  if (groupChecked(group)) {
    group.perms.forEach(p => {
      const idx = selectedRole.value.permissions.indexOf(p.key)
      if (idx >= 0) selectedRole.value.permissions.splice(idx, 1)
    })
  } else {
    group.perms.forEach(p => {
      if (!hasPerm(p.key)) selectedRole.value.permissions.push(p.key)
    })
  }
}
function toggleAll() {
  if (!selectedRole.value.editable) return
  if (selectedRole.value.permissions.length === ALL_PERM_KEYS.length) {
    selectedRole.value.permissions = []
  } else {
    selectedRole.value.permissions = [...ALL_PERM_KEYS]
  }
}

// ─── Changements non sauvegardés ─────────────────────────────────
const hasChanges = computed(() => {
  const role = selectedRole.value
  if (!role || !role.editable) return false
  const orig = new Set(role.originalPermissions)
  const curr = new Set(role.permissions)
  if (orig.size !== curr.size) return true
  return [...curr].some(k => !orig.has(k))
})

const resetMessage = computed(() =>
  `Les permissions du rôle "${selectedRole.value?.label ?? ''}" seront remises à leurs valeurs par défaut. Les modifications non sauvegardées seront perdues.`
)
const permCount  = computed(() => selectedRole.value?.permissions?.length ?? 0)
const allChecked = computed(() => (selectedRole.value?.permissions?.length ?? 0) === ALL_PERM_KEYS.length)

// ─── Helpers classes (évite guillemets imbriqués) ─────────────────
function roleItemClass(role: Role) {
  if (selectedRoleId.value === role.id) return [role.bg, role.border, 'border']
  return ['hover:bg-gray-50', 'dark:hover:bg-slate-800', 'border', 'border-transparent']
}
function roleIconClass(role: Role) {
  return selectedRoleId.value === role.id ? role.color : 'text-gray-400 dark:text-slate-500'
}
function roleIconBg(role: Role) {
  return selectedRoleId.value === role.id ? role.bg : 'bg-gray-100 dark:bg-slate-800'
}
function roleLabelClass(role: Role) {
  return selectedRoleId.value === role.id ? role.color : 'text-gray-800 dark:text-white'
}
function roleCountClass(role: Role) {
  return selectedRoleId.value === role.id ? role.color + ' opacity-70' : 'text-gray-400 dark:text-slate-500'
}
function roleChevronClass(role: Role) {
  return selectedRoleId.value === role.id ? role.color : 'text-gray-300 dark:text-slate-600'
}

// ─── Créer un nouveau rôle ────────────────────────────────────────
const showCreateForm = ref(false)
const newRole = ref({ label: '', description: '' })
const createError = ref('')

function openCreateForm() {
  newRole.value = { label: '', description: '' }
  createError.value = ''
  showCreateForm.value = true
  // On ne touche pas selectedRoleId — selectedRole doit rester défini
}

function cancelCreate() {
  showCreateForm.value = false
}

function confirmCreate() {
  const label = newRole.value.label.trim()
  if (!label) { createError.value = 'Le nom du rôle est obligatoire.'; return }
  if (roles.value.some(r => r.label.toLowerCase() === label.toLowerCase())) {
    createError.value = 'Un rôle avec ce nom existe déjà.'; return
  }

  const palette = PALETTES[paletteIdx % PALETTES.length]
  paletteIdx++

  const id = 'CUSTOM_' + label.toUpperCase().replace(/\s+/g, '_')
  const role: Role = {
    id,
    label,
    description: newRole.value.description || 'Rôle personnalisé',
    ...palette,
    editable: true,
    custom: true,
    permissions: [],
    originalPermissions: [],
  }
  roles.value.push(role)
  selectedRoleId.value = id
  showCreateForm.value = false
  openGroupKey.value = PERMISSION_GROUPS[0].key
  toast('success', `Rôle "${label}" créé. Assignez maintenant ses permissions.`, 'Rôle créé')
}

// ─── Supprimer un rôle custom ─────────────────────────────────────
const confirmDelete = ref({ show: false, loading: false, id: '' })

function askDeleteRole(role: Role) {
  confirmDelete.value = { show: true, loading: false, id: role.id }
}
async function handleDeleteRole() {
  confirmDelete.value.loading = true
  await new Promise(r => setTimeout(r, 600))
  const label = roles.value.find(r => r.id === confirmDelete.value.id)?.label ?? ''
  roles.value = roles.value.filter(r => r.id !== confirmDelete.value.id)
  if (selectedRoleId.value === confirmDelete.value.id) selectedRoleId.value = 'PASTEUR'
  confirmDelete.value.show = false
  toast('success', `Rôle "${label}" supprimé.`, 'Suppression')
}
const deleteRoleLabel = computed(() => roles.value.find(r => r.id === confirmDelete.value.id)?.label ?? '')
const deleteRoleTitle  = computed(() => `Supprimer le rôle ${deleteRoleLabel.value} ?`)

// ─── Réinitialiser ────────────────────────────────────────────────
const confirmReset = ref({ show: false, loading: false })
function askReset() { confirmReset.value = { show: true, loading: false } }
async function handleReset() {
  confirmReset.value.loading = true
  await new Promise(r => setTimeout(r, 500))
  selectedRole.value.permissions = [...selectedRole.value.originalPermissions]
  confirmReset.value.show = false
  toast('info', 'Permissions réinitialisées aux valeurs par défaut.', 'Réinitialisation')
}

// ─── Enregistrer ──────────────────────────────────────────────────
async function handleSave() {
  saving.value = true
  try {
    await new Promise(r => setTimeout(r, 1000))
    // TODO: await rolesApi.updatePermissions(selectedRole.value.id, selectedRole.value.permissions)
    selectedRole.value.originalPermissions = [...selectedRole.value.permissions]
    toast('success', `Permissions du rôle "${selectedRole.value?.label ?? ''}" mises à jour.`, 'Modifications enregistrées')
  } catch (err: any) {
    toast('error', err?.message ?? 'Une erreur est survenue.', 'Erreur')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-6 w-full">

    <!-- En-tête -->
    <div class="flex items-center gap-3">
      <button
        class="p-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        @click="router.back()"
      >
        <ArrowLeft class="w-4 h-4 text-gray-500 dark:text-slate-400" />
      </button>
      <div>
        <h1 class="text-2xl md:text-3xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-white">
          Rôles & permissions
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Définissez les permissions accordées à chaque rôle
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 items-start">

      <!-- ── Colonne gauche : liste des rôles ── -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div class="px-4 py-3.5 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
          <p class="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">Rôles</p>
          <button
            class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-green-600 hover:bg-green-700 text-white transition-colors"
            @click="openCreateForm"
          >
            <Plus class="w-3.5 h-3.5" />
            Nouveau
          </button>
        </div>

        <!-- Formulaire création inline -->


        <!-- Liste des rôles -->
        <div class="p-2">
          <button
            v-for="role in roles"
            :key="role.id"
            class="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-100 group"
            :class="roleItemClass(role)"
            @click="selectRole(role.id)"
          >
            <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors" :class="roleIconBg(role)">
              <Shield class="w-4 h-4" :class="roleIconClass(role)" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1.5">
                <p class="text-sm font-bold truncate" :class="roleLabelClass(role)">{{ role.label }}</p>
                <span v-if="role.custom" class="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400 flex-shrink-0">Custom</span>
              </div>
              <p class="text-[11px] mt-0.5" :class="roleCountClass(role)">
                {{ role.permissions.length }} permission{{ role.permissions.length > 1 ? 's' : '' }}
              </p>
            </div>
            <!-- Bouton supprimer pour les rôles custom -->
            <button
              v-if="role.custom"
              class="opacity-0 group-hover:opacity-100 p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex-shrink-0"
              title="Supprimer ce rôle"
              @click.stop="askDeleteRole(role)"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
            <ChevronRight v-else class="w-3.5 h-3.5 flex-shrink-0 transition-colors" :class="roleChevronClass(role)" />
          </button>
        </div>
      </div>

      <!-- ── Colonne droite : permissions ── -->
      <div v-if="selectedRoleId && selectedRole" class="space-y-4">

        <!-- Header du rôle sélectionné -->
        <div class="flex items-center gap-4 p-5 rounded-2xl border" :class="[selectedRole.bg, selectedRole.border]">
          <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" :class="selectedRole.bg">
            <Shield class="w-5 h-5" :class="selectedRole.color" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <h2 class="text-base font-black" :class="selectedRole.color">{{ selectedRole.label }}</h2>
              <span v-if="selectedRole.custom" class="text-[10px] px-1.5 py-0.5 rounded bg-white/50 dark:bg-black/20 font-medium" :class="selectedRole.color">Custom</span>
            </div>
            <p class="text-xs mt-0.5 opacity-75" :class="selectedRole.color">{{ selectedRole.description }}</p>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
            <span v-if="hasChanges" class="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-medium">
              Non sauvegardé
            </span>
            <button
              v-if="selectedRole.editable && hasChanges"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              @click="askReset"
            >
              <RotateCcw class="w-3 h-3" />
              Réinitialiser
            </button>
            <BaseButton
              v-if="selectedRole.editable"
              variant="primary"
              :icon="Save"
              size="sm"
              :label="saving ? 'Enregistrement...' : 'Enregistrer'"
              :loading="saving"
              :disabled="!hasChanges"
              @click="handleSave"
            />
          </div>
        </div>

        <!-- Info Super Admin -->
        <div v-if="!selectedRole.editable" class="flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
          <Shield class="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
          <p class="text-xs text-purple-700 dark:text-purple-300">
            Le rôle Super Administrateur a toutes les permissions et ne peut pas être modifié.
          </p>
        </div>

        <!-- Sélection globale -->
        <div v-if="selectedRole.editable" class="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm px-5 py-3.5 flex items-center justify-between">
          <label class="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              class="w-4 h-4 accent-green-600"
              :checked="allChecked"
              @change="toggleAll"
            />
            <span class="text-sm font-semibold text-gray-700 dark:text-slate-200">
              {{ allChecked ? 'Tout désélectionner' : 'Tout sélectionner' }}
            </span>
          </label>
          <span class="text-sm font-bold" :class="permCount > 0 ? 'text-green-700 dark:text-green-400' : 'text-gray-400'">
            {{ permCount }} / {{ ALL_PERM_KEYS.length }}
          </span>
        </div>

        <!-- Accordion exclusif — un seul groupe ouvert à la fois -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div
            v-for="(group, gi) in PERMISSION_GROUPS"
            :key="group.key"
            :class="gi < PERMISSION_GROUPS.length - 1 ? 'border-b border-gray-100 dark:border-slate-700' : ''"
          >
            <!-- En-tête groupe -->
            <button
              type="button"
              class="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-left"
              @click="toggleGroup_accordion(group.key)"
            >
              <!-- Checkbox groupe (stopPropagation pour ne pas fermer le groupe) -->
              <span class="flex-shrink-0" @click.stop>
                <input
                  type="checkbox"
                  class="w-4 h-4 accent-green-600"
                  :checked="groupChecked(group)"
                  :indeterminate="groupIndeterminate(group)"
                  :disabled="!selectedRole.editable"
                  @change="toggleGroupPerms(group)"
                />
              </span>

              <span class="flex-1 text-sm font-bold text-gray-800 dark:text-white">{{ group.label }}</span>

              <span class="text-xs text-gray-400 dark:text-slate-500 mr-1">
                {{ group.perms.filter(p => hasPerm(p.key)).length }} / {{ group.perms.length }}
              </span>

              <ChevronDown
                class="w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200"
                :class="openGroupKey === group.key ? 'rotate-180' : ''"
              />
            </button>

            <!-- Permissions du groupe — visibles uniquement si ce groupe est ouvert -->
            <Transition
              enter-active-class="transition-all duration-200 ease-out"
              enter-from-class="opacity-0 -translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition-all duration-150 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-1"
            >
              <div v-if="openGroupKey === group.key" class="px-5 pb-4 space-y-2">
                <label
                  v-for="perm in group.perms"
                  :key="perm.key"
                  class="flex items-start gap-3 p-3 rounded-xl border transition-all duration-100 select-none"
                  :class="[
                    selectedRole.editable ? 'cursor-pointer' : 'cursor-default',
                    hasPerm(perm.key)
                      ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                      : 'border-gray-100 dark:border-slate-700/50 bg-gray-50/50 dark:bg-slate-800/30 hover:border-gray-200 dark:hover:border-slate-700',
                  ]"
                >
                  <input
                    type="checkbox"
                    class="mt-0.5 w-4 h-4 accent-green-600 flex-shrink-0"
                    :checked="hasPerm(perm.key)"
                    :disabled="!selectedRole.editable"
                    @change="togglePerm(perm.key)"
                  />
                  <div class="min-w-0">
                    <p class="text-sm font-medium leading-snug" :class="hasPerm(perm.key) ? 'text-green-800 dark:text-green-300' : 'text-gray-700 dark:text-slate-300'">
                      {{ perm.label }}
                    </p>
                    <p class="text-xs mt-0.5" :class="hasPerm(perm.key) ? 'text-green-600 dark:text-green-400 opacity-80' : 'text-gray-400 dark:text-slate-500'">
                      {{ perm.description }}
                    </p>
                  </div>
                </label>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Bouton bas -->
        <div v-if="selectedRole.editable" class="flex justify-end pb-8">
          <BaseButton
            variant="primary"
            :icon="Save"
            size="lg"
            :label="saving ? 'Enregistrement...' : 'Enregistrer les modifications'"
            :loading="saving"
            :disabled="!hasChanges"
            @click="handleSave"
          />
        </div>

      </div>

      <!-- État vide si aucun rôle sélectionné (pendant création) -->
      <div v-else class="flex items-center justify-center h-64 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm">
        <div class="text-center">
          <Shield class="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
          <p class="text-sm text-gray-400 dark:text-slate-500">Sélectionnez ou créez un rôle</p>
        </div>
      </div>

    </div>

    <!-- Modal réinitialisation -->
    <ConfirmModal
      v-model="confirmReset.show"
      variant="warning"
      title="Réinitialiser les permissions ?"
      :message="resetMessage"
      confirm-label="Réinitialiser"
      :confirm-loading="confirmReset.loading"
      @confirm="handleReset"
    />

    <!-- Modal suppression rôle custom -->
    <ConfirmModal
      v-model="confirmDelete.show"
      variant="danger"
      :title="deleteRoleTitle"
      message="Ce rôle personnalisé sera définitivement supprimé. Les utilisateurs qui le possèdent devront être réassignés."
      confirm-label="Supprimer"
      :confirm-loading="confirmDelete.loading"
      @confirm="handleDeleteRole"
    />

  </div>

    <!-- ── Modal création d'un rôle ── -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showCreateForm"
          class="fixed inset-0 z-[9998] flex items-center justify-center p-4"
          style="background: rgba(0,0,0,0.45);"
          @mousedown.self="cancelCreate"
        >
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-2"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="showCreateForm"
              class="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700"
              role="dialog"
              aria-modal="true"
            >
              <!-- Header -->
              <div class="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-slate-700">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Shield class="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p class="text-sm font-bold text-gray-900 dark:text-white">Nouveau rôle</p>
                    <p class="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Toutes les permissions seront désactivées par défaut</p>
                  </div>
                </div>
                <button
                  class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                  @click="cancelCreate"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>

              <!-- Corps -->
              <div class="p-6 space-y-4">

                <!-- Nom -->
                <div class="flex flex-col gap-1.5">
                  <label class="text-sm font-semibold text-gray-700 dark:text-slate-300">
                    Nom du rôle <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="newRole.label"
                    type="text"
                    placeholder="Ex: Responsable Communication"
                    autofocus
                    class="w-full h-[42px] px-3 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200"
                    :class="createError ? 'border-red-400 dark:border-red-600' : 'border-gray-300 dark:border-slate-600'"
                    @keyup.enter="confirmCreate"
                    @keyup.esc="cancelCreate"
                  />
                  <p v-if="createError" class="text-xs text-red-500">{{ createError }}</p>
                </div>

                <!-- Description -->
                <div class="flex flex-col gap-1.5">
                  <label class="text-sm font-semibold text-gray-700 dark:text-slate-300">
                    Description <span class="text-xs font-normal text-gray-400">(optionnel)</span>
                  </label>
                  <textarea
                    v-model="newRole.description"
                    rows="3"
                    placeholder="Décrivez les responsabilités de ce rôle..."
                    class="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  />
                </div>

                <!-- Info permissions nulles -->
                <div class="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <svg class="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p class="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                    Le rôle sera créé sans aucune permission. Vous pourrez les assigner depuis l'interface de gestion des permissions.
                  </p>
                </div>
              </div>

              <!-- Footer -->
              <div class="px-6 pb-6 flex justify-end gap-3">
                <button
                  type="button"
                  class="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  @click="cancelCreate"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  class="px-4 py-2 rounded-xl text-sm font-semibold bg-green-600 hover:bg-green-700 text-white transition-colors flex items-center gap-2"
                  @click="confirmCreate"
                >
                  <Plus class="w-4 h-4" />
                  Créer le rôle
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

</template>