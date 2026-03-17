<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ArrowLeft, Save, Share2, ExternalLink } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { useToast } from '@/stores/toast'

const router = useRouter()
const toast  = useToast()
const saving = ref(false)

const reseaux = reactive([
  { key: 'facebook',  label: 'Facebook',   placeholder: 'https://facebook.com/votre-page',     icon: '📘', color: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400',    value: 'https://facebook.com/eec-yaounde' },
  { key: 'youtube',   label: 'YouTube',    placeholder: 'https://youtube.com/@votre-chaine',   icon: '▶️', color: 'bg-red-50   border-red-200   text-red-700   dark:bg-red-900/20   dark:border-red-800   dark:text-red-400',    value: 'https://youtube.com/@eec' },
  { key: 'instagram', label: 'Instagram',  placeholder: 'https://instagram.com/votre-compte',  icon: '📸', color: 'bg-pink-50  border-pink-200  text-pink-700  dark:bg-pink-900/20  dark:border-pink-800  dark:text-pink-400',   value: '' },
  { key: 'whatsapp',  label: 'WhatsApp',   placeholder: 'https://wa.me/237XXXXXXXXX',          icon: '💬', color: 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400',  value: 'https://wa.me/237677123456' },
  { key: 'twitter',   label: 'Twitter / X', placeholder: 'https://twitter.com/votre-compte',   icon: '🐦', color: 'bg-sky-50   border-sky-200   text-sky-700   dark:bg-sky-900/20   dark:border-sky-800   dark:text-sky-400',    value: '' },
  { key: 'tiktok',    label: 'TikTok',     placeholder: 'https://tiktok.com/@votre-compte',    icon: '🎵', color: 'bg-gray-50  border-gray-200  text-gray-700  dark:bg-slate-800    dark:border-slate-600 dark:text-slate-300',   value: '' },
])

async function handleSave() {
  saving.value = true
  try {
    await new Promise(r => setTimeout(r, 1000))
    // TODO: await siteApi.saveReseaux(Object.fromEntries(reseaux.map(r => [r.key, r.value])))
    toast('success', 'Liens des réseaux sociaux mis à jour.', 'Modifications enregistrées')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-6 w-full">

    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div class="flex items-center gap-3">
        <button class="p-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 transition-colors" @click="router.back()">
          <ArrowLeft class="w-4 h-4 text-gray-500 dark:text-slate-400" />
        </button>
        <div>
          <h1 class="text-2xl md:text-3xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-white">Réseaux sociaux</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Liens affichés dans le footer et les partages du site</p>
        </div>
      </div>
      <BaseButton variant="primary" :icon="Save" :label="saving ? 'Enregistrement...' : 'Enregistrer'" :loading="saving" @click="handleSave" />
    </div>

    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm">
      <div class="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center gap-3">
        <Share2 class="w-4 h-4 text-green-600" />
        <p class="text-sm font-bold text-gray-900 dark:text-white">Liens des réseaux sociaux</p>
        <p class="text-xs text-gray-400 ml-1">Laissez vide pour masquer l'icône sur le site</p>
      </div>

      <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div v-for="r in reseaux" :key="r.key" class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-2">
            <span class="text-base" style="font-size:16px">{{ r.icon }}</span>
            {{ r.label }}
            <span v-if="r.value" class="ml-auto">
              <a :href="r.value" target="_blank" class="p-1 rounded text-gray-400 hover:text-blue-500 transition-colors">
                <ExternalLink class="w-3 h-3" />
              </a>
            </span>
          </label>
          <div class="flex items-center gap-2">
            <input
              v-model="r.value"
              type="url"
              :placeholder="r.placeholder"
              class="flex-1 h-[42px] px-3 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
              :class="r.value
                ? `${r.color} border`
                : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200'"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Prévisualisation footer -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm">
      <div class="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
        <p class="text-sm font-bold text-gray-900 dark:text-white">Aperçu — Footer du site</p>
      </div>
      <div class="px-6 py-5">
        <div class="rounded-xl bg-gray-900 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
          <p class="text-xs text-gray-400">© 2024 Église Évangélique du Cameroun</p>
          <div class="flex items-center gap-3">
            <template v-for="r in reseaux" :key="r.key">
              <div v-if="r.value" class="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors" :title="r.label">
                <span style="font-size:14px">{{ r.icon }}</span>
              </div>
            </template>
            <p v-if="reseaux.every(r => !r.value)" class="text-xs text-gray-500 italic">Aucun réseau configuré</p>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-end pb-8">
      <BaseButton variant="primary" :icon="Save" size="lg" :label="saving ? 'Enregistrement...' : 'Enregistrer'" :loading="saving" @click="handleSave" />
    </div>
  </div>
</template>