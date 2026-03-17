<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ArrowLeft, Save, Palette, Type, Image } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import SelectInput from '@/components/ui/SelectInput.vue'
import { useToast } from '@/stores/toast'

const router = useRouter()
const toast  = useToast()
const saving = ref(false)

const FONT_OPTIONS = [
  { label: 'Inter',       value: 'inter' },
  { label: 'Roboto',      value: 'roboto' },
  { label: 'Poppins',     value: 'poppins' },
  { label: 'Lato',        value: 'lato' },
  { label: 'Open Sans',   value: 'open-sans' },
  { label: 'Montserrat',  value: 'montserrat' },
]

const form = reactive({
  couleurPrimaire:   '#1a5c2a',
  couleurSecondaire: '#2d8a48',
  couleurAccent:     '#4ade80',
  police:            'poppins',
  logoUrl:           '',
  faviconUrl:        '',
  siteTitle:         'Église Évangélique du Cameroun',
  slogan:            'Une communauté unie par la foi',
})

// Prévisualisation couleurs
const previewStyle = (color: string) => ({ backgroundColor: color, width: '28px', height: '28px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)', display: 'inline-block', flexShrink: 0 })

async function handleSave() {
  saving.value = true
  try {
    await new Promise(r => setTimeout(r, 1200))
    // TODO: await siteApi.saveApparence(form)
    toast('success', 'Apparence du site mise à jour.', 'Modifications enregistrées')
  } catch (err: any) {
    toast('error', err?.message ?? 'Une erreur est survenue.', 'Erreur')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  // TODO: const data = await siteApi.getApparence()
  // Object.assign(form, data)
})
</script>

<template>
  <div class="space-y-6 w-full">

    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div class="flex items-center gap-3">
        <button class="p-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors" @click="router.back()">
          <ArrowLeft class="w-4 h-4 text-gray-500 dark:text-slate-400" />
        </button>
        <div>
          <h1 class="text-2xl md:text-3xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-white">Apparence</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Identité visuelle du site paroissial</p>
        </div>
      </div>
      <BaseButton variant="primary" :icon="Save" :label="saving ? 'Enregistrement...' : 'Enregistrer'" :loading="saving" @click="handleSave" />
    </div>

    <!-- Identité -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm">
      <div class="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center gap-3">
        <Image class="w-4 h-4 text-green-600" />
        <p class="text-sm font-bold text-gray-900 dark:text-white">Identité</p>
      </div>
      <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
        <BaseInput v-model="form.siteTitle" label="Nom du site" placeholder="Ex: Église Évangélique du Cameroun" />
        <BaseInput v-model="form.slogan"    label="Slogan"      placeholder="Ex: Une communauté unie par la foi" />
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-gray-700 dark:text-slate-300">Logo <span class="text-xs font-normal text-gray-400">(URL ou upload)</span></label>
          <div class="flex gap-3 items-center">
            <input v-model="form.logoUrl" type="text" placeholder="https://..." class="flex-1 h-[42px] px-3 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500" />
            <div v-if="form.logoUrl" class="w-10 h-10 rounded-lg border border-gray-200 dark:border-slate-600 overflow-hidden flex-shrink-0 bg-gray-50">
              <img :src="form.logoUrl" class="w-full h-full object-contain" alt="logo" />
            </div>
            <div v-else class="w-10 h-10 rounded-lg border border-dashed border-gray-300 dark:border-slate-600 flex-shrink-0 bg-gray-50 dark:bg-slate-800 flex items-center justify-center">
              <Image class="w-4 h-4 text-gray-300 dark:text-slate-600" />
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-gray-700 dark:text-slate-300">Favicon <span class="text-xs font-normal text-gray-400">(URL)</span></label>
          <input v-model="form.faviconUrl" type="text" placeholder="https://..." class="h-[42px] px-3 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
      </div>
    </div>

    <!-- Couleurs -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm">
      <div class="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center gap-3">
        <Palette class="w-4 h-4 text-green-600" />
        <p class="text-sm font-bold text-gray-900 dark:text-white">Couleurs</p>
      </div>
      <div class="p-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div v-for="(key, label) in { couleurPrimaire: 'Couleur primaire', couleurSecondaire: 'Couleur secondaire', couleurAccent: 'Couleur accent' }" :key="key" class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-gray-700 dark:text-slate-300">{{ label }}</label>
          <div class="flex items-center gap-2">
            <div :style="previewStyle((form as any)[key])" />
            <input
              v-model="(form as any)[key]"
              type="color"
              class="w-10 h-10 rounded-lg border border-gray-300 dark:border-slate-600 cursor-pointer bg-transparent p-0.5"
            />
            <input
              v-model="(form as any)[key]"
              type="text"
              class="flex-1 h-10 px-3 text-sm font-mono rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="#000000"
            />
          </div>
        </div>
      </div>

      <!-- Prévisualisation -->
      <div class="mx-6 mb-6 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700">
        <div class="px-5 py-3 flex items-center gap-3" :style="{ backgroundColor: form.couleurPrimaire }">
          <div class="w-6 h-6 rounded bg-white/20 flex-shrink-0"></div>
          <span class="text-sm font-bold text-white">{{ form.siteTitle }}</span>
          <div class="ml-auto flex gap-2">
            <div class="h-1.5 w-12 rounded-full bg-white/30"></div>
            <div class="h-1.5 w-12 rounded-full bg-white/30"></div>
            <div class="h-1.5 w-12 rounded-full bg-white/30"></div>
          </div>
        </div>
        <div class="px-5 py-4 bg-gray-50 dark:bg-slate-800 flex items-center gap-3">
          <div>
            <div class="h-2 w-40 rounded bg-gray-200 dark:bg-slate-600 mb-2"></div>
            <div class="h-1.5 w-56 rounded bg-gray-100 dark:bg-slate-700"></div>
          </div>
          <div class="ml-auto px-3 py-1.5 rounded-lg text-xs font-bold text-white" :style="{ backgroundColor: form.couleurSecondaire }">
            Bouton
          </div>
        </div>
      </div>
    </div>

    <!-- Typographie -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm">
      <div class="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center gap-3">
        <Type class="w-4 h-4 text-green-600" />
        <p class="text-sm font-bold text-gray-900 dark:text-white">Typographie</p>
      </div>
      <div class="p-6 max-w-xs">
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-gray-700 dark:text-slate-300">Police de caractères</label>
          <SelectInput v-model="form.police" :options="FONT_OPTIONS" />
        </div>
      </div>
    </div>

    <div class="flex justify-end pb-8">
      <BaseButton variant="primary" :icon="Save" size="lg" :label="saving ? 'Enregistrement...' : 'Enregistrer'" :loading="saving" @click="handleSave" />
    </div>
  </div>
</template>