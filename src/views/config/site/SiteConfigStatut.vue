<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ArrowLeft, Save, Power, Globe, Construction, AlertTriangle } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import ConfirmModal from '@/components/ui/confirmModal.vue'
import { useToast } from '@/stores/toast'

const router = useRouter()
const toast  = useToast()
const saving = ref(false)

const form = reactive({
  statut:              'EN_LIGNE' as 'EN_LIGNE' | 'MAINTENANCE',
  messageMaintenance:  'Notre site est temporairement en maintenance. Nous serons de retour très bientôt.',
  dateRetour:          '',
  contactUrgence:      '',
})

const isOnline = computed(() => form.statut === 'EN_LIGNE')

// Modal confirmation avant de passer en maintenance
const confirmModal = ref({ show: false, loading: false })

function askToggle() {
  if (isOnline.value) {
    // Passer en maintenance → demander confirmation
    confirmModal.value = { show: true, loading: false }
  } else {
    // Repasser en ligne → direct
    form.statut = 'EN_LIGNE'
    toast('success', 'Le site est maintenant en ligne.', 'Site activé')
  }
}

async function handleConfirmMaintenance() {
  confirmModal.value.loading = true
  await new Promise(r => setTimeout(r, 800))
  form.statut = 'MAINTENANCE'
  confirmModal.value.show = false
  toast('warning', 'Le site est maintenant en maintenance.', 'Mode maintenance')
}

async function handleSave() {
  saving.value = true
  try {
    await new Promise(r => setTimeout(r, 1000))
    // TODO: await siteApi.saveStatut(form)
    toast('success', 'Paramètres du statut enregistrés.', 'Modifications enregistrées')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  // TODO: const data = await siteApi.getStatut()
  // Object.assign(form, data)
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
          <h1 class="text-2xl md:text-3xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-white">Statut du site</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Contrôlez l'accessibilité publique du site</p>
        </div>
      </div>
      <BaseButton variant="primary" :icon="Save" :label="saving ? 'Enregistrement...' : 'Enregistrer'" :loading="saving" @click="handleSave" />
    </div>

    <!-- Statut actuel -->
    <div
      class="flex items-center gap-4 p-5 rounded-2xl border"
      :class="isOnline
        ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
        : 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'"
    >
      <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
           :class="isOnline ? 'bg-green-100 dark:bg-green-900/40' : 'bg-amber-100 dark:bg-amber-900/40'">
        <Globe       v-if="isOnline"  class="w-6 h-6 text-green-600 dark:text-green-400" />
        <Construction v-else          class="w-6 h-6 text-amber-600 dark:text-amber-400" />
      </div>
      <div class="flex-1">
        <p class="font-bold" :class="isOnline ? 'text-green-800 dark:text-green-300' : 'text-amber-800 dark:text-amber-300'">
          Site {{ isOnline ? 'en ligne' : 'en maintenance' }}
        </p>
        <p class="text-xs mt-0.5" :class="isOnline ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'">
          {{ isOnline ? 'Votre site est accessible à tous les visiteurs.' : 'Les visiteurs voient la page de maintenance.' }}
        </p>
      </div>
      <button
        class="px-4 py-2 rounded-xl text-sm font-bold transition-colors flex-shrink-0"
        :class="isOnline
          ? 'bg-amber-500 hover:bg-amber-600 text-white'
          : 'bg-green-600 hover:bg-green-700 text-white'"
        @click="askToggle"
      >
        {{ isOnline ? 'Passer en maintenance' : 'Remettre en ligne' }}
      </button>
    </div>

    <!-- Message de maintenance -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm"
         :class="isOnline ? 'opacity-60' : ''">
      <div class="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center gap-3">
        <Construction class="w-4 h-4 text-amber-500" />
        <p class="text-sm font-bold text-gray-900 dark:text-white">Page de maintenance</p>
        <span v-if="isOnline" class="text-xs text-gray-400 ml-1">(inactif — site en ligne)</span>
      </div>
      <div class="p-6 space-y-4" :class="isOnline ? 'pointer-events-none' : ''">
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-gray-700 dark:text-slate-300">Message affiché aux visiteurs</label>
          <textarea
            v-model="form.messageMaintenance"
            rows="4"
            class="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            placeholder="Message de maintenance..."
          />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-semibold text-gray-700 dark:text-slate-300">Date de retour prévue <span class="font-normal text-gray-400">(optionnel)</span></label>
            <input v-model="form.dateRetour" type="datetime-local" class="h-[42px] px-3 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <BaseInput v-model="form.contactUrgence" label="Contact d'urgence (optionnel)" placeholder="email@paroisse.cm ou +237..." />
        </div>

        <!-- Aperçu page maintenance -->
        <div class="rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden mt-2">
          <div class="px-4 py-2 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
            <p class="text-xs font-medium text-gray-500 dark:text-slate-400">Aperçu — Page maintenance</p>
          </div>
          <div class="px-8 py-10 bg-white dark:bg-slate-900 text-center">
            <div class="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
              <Construction class="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <p class="font-bold text-gray-900 dark:text-white mb-2">Site en maintenance</p>
            <p class="text-sm text-gray-500 dark:text-slate-400 max-w-sm mx-auto">{{ form.messageMaintenance || '...' }}</p>
            <p v-if="form.dateRetour" class="text-xs text-amber-600 dark:text-amber-400 mt-3 font-medium">
              Retour prévu : {{ new Date(form.dateRetour).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) }}
            </p>
            <p v-if="form.contactUrgence" class="text-xs text-gray-400 mt-2">Contact : {{ form.contactUrgence }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-end pb-8">
      <BaseButton variant="primary" :icon="Save" size="lg" :label="saving ? 'Enregistrement...' : 'Enregistrer'" :loading="saving" @click="handleSave" />
    </div>

    <!-- Modal confirmation maintenance -->
    <ConfirmModal
      v-model="confirmModal.show"
      variant="warning"
      title="Passer le site en maintenance ?"
      message="Les visiteurs ne pourront plus accéder au site. Ils verront uniquement la page de maintenance configurée."
      confirm-label="Passer en maintenance"
      :confirm-loading="confirmModal.loading"
      @confirm="handleConfirmMaintenance"
    />
  </div>
</template>