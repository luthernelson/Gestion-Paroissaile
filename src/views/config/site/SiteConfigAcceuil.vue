<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ArrowLeft, Save, Home, Eye, EyeOff } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { useToast } from '@/stores/toast'

const router = useRouter()
const toast  = useToast()
const saving = ref(false)

const form = reactive({
  hero: {
    titre:       'Bienvenue à l\'Église Évangélique du Cameroun',
    sousTitre:   'Une communauté unie dans la foi, l\'espérance et l\'amour',
    boutonLabel: 'Nous rejoindre',
    boutonLien:  '/contact',
    imageUrl:    '',
  },
  verset: {
    texte:     'Car là où deux ou trois sont assemblés en mon nom, je suis au milieu d\'eux.',
    reference: 'Matthieu 18:20',
    actif:     true,
  },
  sections: {
    evenementsActif:    true,
    evenementsNombre:   3,
    predications:       true,
    apropos:            true,
    newsletter:         false,
    compteurStats:      true,
  },
})

// Sections toggleables
const sectionsList = [
  { key: 'evenementsActif',  label: 'Prochains événements',     description: 'Affiche les N prochains événements publiés' },
  { key: 'predications',     label: 'Dernières prédications',   description: 'Affiche les médias les plus récents' },
  { key: 'apropos',          label: 'À propos (résumé)',         description: 'Présentation courte de la paroisse' },
  { key: 'compteurStats',    label: 'Compteur de statistiques', description: 'Membres, années d\'existence, cultes...' },
  { key: 'newsletter',       label: 'Inscription newsletter',   description: 'Formulaire d\'abonnement aux actualités' },
]

async function handleSave() {
  saving.value = true
  try {
    await new Promise(r => setTimeout(r, 1200))
    toast('success', 'Page d\'accueil mise à jour.', 'Modifications enregistrées')
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
          <h1 class="text-2xl md:text-3xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-white">Page d'accueil</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Contenu et sections de la page principale</p>
        </div>
      </div>
      <BaseButton variant="primary" :icon="Save" :label="saving ? 'Enregistrement...' : 'Enregistrer'" :loading="saving" @click="handleSave" />
    </div>

    <!-- Bannière hero -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm">
      <div class="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
        <p class="text-sm font-bold text-gray-900 dark:text-white">Bannière principale (Hero)</p>
        <p class="text-xs text-gray-400 mt-0.5">Premier élément visible sur la page d'accueil</p>
      </div>
      <div class="p-6 space-y-4">
        <BaseInput v-model="form.hero.titre"       label="Titre principal"  placeholder="Bienvenue à notre paroisse" />
        <BaseInput v-model="form.hero.sousTitre"   label="Sous-titre"       placeholder="Votre slogan ou message d'accueil" />
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseInput v-model="form.hero.boutonLabel" label="Texte du bouton" placeholder="Ex: Nous rejoindre" />
          <BaseInput v-model="form.hero.boutonLien"  label="Lien du bouton"  placeholder="Ex: /contact" />
        </div>
        <BaseInput v-model="form.hero.imageUrl" label="Image de fond (URL)" placeholder="https://..." />
      </div>
    </div>

    <!-- Verset du moment -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm">
      <div class="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
        <div>
          <p class="text-sm font-bold text-gray-900 dark:text-white">Verset du moment</p>
          <p class="text-xs text-gray-400 mt-0.5">Affiché en bandeau sur la page d'accueil</p>
        </div>
        <label class="flex items-center gap-2 cursor-pointer select-none">
          <span class="text-xs font-medium text-gray-500 dark:text-slate-400">{{ form.verset.actif ? 'Visible' : 'Masqué' }}</span>
          <button
            class="relative w-10 h-6 rounded-full transition-colors"
            :class="form.verset.actif ? 'bg-green-500' : 'bg-gray-300 dark:bg-slate-600'"
            @click="form.verset.actif = !form.verset.actif"
          >
            <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform" :class="form.verset.actif ? 'translate-x-4' : ''" />
          </button>
        </label>
      </div>
      <div class="p-6 space-y-4" :class="!form.verset.actif ? 'opacity-50 pointer-events-none' : ''">
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-gray-700 dark:text-slate-300">Texte du verset</label>
          <textarea v-model="form.verset.texte" rows="3" class="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" placeholder="Entrez le verset biblique..." />
        </div>
        <BaseInput v-model="form.verset.reference" label="Référence" placeholder="Ex: Jean 3:16" />
      </div>
    </div>

    <!-- Sections visibles -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm">
      <div class="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
        <p class="text-sm font-bold text-gray-900 dark:text-white">Sections de la page</p>
        <p class="text-xs text-gray-400 mt-0.5">Activez ou désactivez les blocs visibles sur l'accueil</p>
      </div>
      <div class="divide-y divide-gray-100 dark:divide-slate-700">
        <div v-for="s in sectionsList" :key="s.key" class="flex items-center justify-between px-6 py-4">
          <div>
            <p class="text-sm font-medium text-gray-800 dark:text-white">{{ s.label }}</p>
            <p class="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{{ s.description }}</p>
            <div v-if="s.key === 'evenementsActif' && (form.sections as any)[s.key]" class="mt-2 flex items-center gap-2">
              <label class="text-xs text-gray-500">Nombre à afficher :</label>
              <input v-model.number="form.sections.evenementsNombre" type="number" min="1" max="9" class="w-14 h-7 px-2 text-xs rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-green-500" />
            </div>
          </div>
          <button
            class="relative w-10 h-6 rounded-full transition-colors flex-shrink-0"
            :class="(form.sections as any)[s.key] ? 'bg-green-500' : 'bg-gray-300 dark:bg-slate-600'"
            @click="(form.sections as any)[s.key] = !(form.sections as any)[s.key]"
          >
            <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform" :class="(form.sections as any)[s.key] ? 'translate-x-4' : ''" />
          </button>
        </div>
      </div>
    </div>

    <div class="flex justify-end pb-8">
      <BaseButton variant="primary" :icon="Save" size="lg" :label="saving ? 'Enregistrement...' : 'Enregistrer'" :loading="saving" @click="handleSave" />
    </div>
  </div>
</template>