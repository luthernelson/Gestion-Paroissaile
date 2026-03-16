<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  Palette, CalendarDays, Newspaper, MonitorPlay,
  Home, Share2, Power, Globe
} from 'lucide-vue-next'

import ConfigCard from '@/components/site/ConfigCard.vue'

// ─── Stats dynamiques chargées depuis l'API ───────────────────────
const stats = ref({
  siteStatus:          'EN_LIGNE' as 'EN_LIGNE' | 'MAINTENANCE',
  eventsPublished:     0,
  eventsTotal:         0,
  mediasPublished:     0,
  mediasTotal:         0,
  annoncesDraft:       0,
})

async function fetchStats() {
  // TODO: remplacer par votre appel API réel
  await new Promise(r => setTimeout(r, 400))
  stats.value = {
    siteStatus:      'EN_LIGNE',
    eventsPublished: 4,
    eventsTotal:     12,
    mediasPublished: 8,
    mediasTotal:     15,
    annoncesDraft:   2,
  }
}

onMounted(fetchStats)

// ─── Sections de configuration ────────────────────────────────────
const sections = [
  {
    key:         'apparence',
    title:       'Apparence',
    description: 'Couleurs, logo, favicon, typographie et identité visuelle du site.',
    icon:        Palette,
    //to:          { name: 'SiteConfigApparence' },
  },
  {
    key:         'accueil',
    title:       'Page d\'accueil',
    description: 'Bannière hero, verset du moment, sections visibles et mise en page.',
    icon:        Home,
    //to:          { name: 'SiteConfigAccueil' },
  },
  {
    key:         'evenements',
    title:       'Événements',
    description: 'Choisissez quels événements sont publiés sur le site et le calendrier public.',
    icon:        CalendarDays,
    //to:          { name: 'SiteConfigEvenements' },
  },
  {
    key:         'annonces',
    title:       'Annonces & actualités',
    description: 'Gérez les annonces publiées sur le site et leur statut de publication.',
    icon:        Newspaper,
    //to:          { name: 'SiteConfigAnnonces' },
  },
  {
    key:         'medias',
    title:       'Médias & prédications',
    description: 'Décidez quelles prédications et ressources sont accessibles publiquement.',
    icon:        MonitorPlay,
    //to:          { name: 'SiteConfigMedias' },
  },
  {
    key:         'reseaux',
    title:       'Réseaux sociaux',
    description: 'Liens Facebook, YouTube, Instagram, WhatsApp affichés sur le site.',
    icon:        Share2,
    //to:          { name: 'SiteConfigReseaux' },
  },
  {
    key:         'statut',
    title:       'Statut du site',
    description: 'Mettre le site en ligne ou en maintenance avec un message personnalisé.',
    icon:        Power,
    //to:          { name: 'SiteConfigStatut' },
  },
]
</script>

<template>
  <div class="space-y-6 w-full">

    <!-- En-tête -->
    <div class="flex items-center gap-4">
      <div class="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0"
           style="background: linear-gradient(135deg, #1a5c2a, #2d8a48)">
        <Globe class="w-5 h-5 text-white" />
      </div>
      <div>
        <h1 class="text-2xl md:text-3xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-white">
          Configuration du site
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Gérez ce qui est publié et affiché sur votre site paroissial
        </p>
      </div>
    </div>

    <!-- Bandeau statut site -->
    <div
      class="flex items-center gap-3 px-5 py-3.5 rounded-xl border"
      :class="stats.siteStatus === 'EN_LIGNE'
        ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
        : 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'"
    >
      <span
        class="w-2.5 h-2.5 rounded-full flex-shrink-0"
        :class="stats.siteStatus === 'EN_LIGNE' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'"
      />
      <p class="text-sm font-semibold"
         :class="stats.siteStatus === 'EN_LIGNE' ? 'text-green-800 dark:text-green-300' : 'text-amber-800 dark:text-amber-300'">
        Site {{ stats.siteStatus === 'EN_LIGNE' ? 'en ligne' : 'en maintenance' }}
      </p>
 <!--      <router-link
        :to="{ name: 'SiteConfigStatut' }"
        class="ml-auto text-xs font-medium underline underline-offset-2 transition-colors"
        :class="stats.siteStatus === 'EN_LIGNE'
          ? 'text-green-700 hover:text-green-900 dark:text-green-400'
          : 'text-amber-700 hover:text-amber-900 dark:text-amber-400'"
      >
        Modifier
      </router-link> -->
    </div>

    <!-- Résumé rapide -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
        <p class="text-2xl font-black text-gray-900 dark:text-white">
          {{ stats.eventsPublished }}<span class="text-sm font-normal text-gray-400 dark:text-slate-500"> / {{ stats.eventsTotal }}</span>
        </p>
        <p class="text-xs font-medium text-gray-500 dark:text-slate-400 mt-0.5">Événements publiés</p>
      </div>
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
        <p class="text-2xl font-black text-gray-900 dark:text-white">
          {{ stats.mediasPublished }}<span class="text-sm font-normal text-gray-400 dark:text-slate-500"> / {{ stats.mediasTotal }}</span>
        </p>
        <p class="text-xs font-medium text-gray-500 dark:text-slate-400 mt-0.5">Médias publiés</p>
      </div>
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4 col-span-2 sm:col-span-1">
        <p class="text-2xl font-black text-gray-900 dark:text-white">{{ stats.annoncesDraft }}</p>
        <p class="text-xs font-medium text-gray-500 dark:text-slate-400 mt-0.5">Annonces en attente</p>
      </div>
    </div>

    <!-- Grille des sections -->
    <div>
      <p class="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-3">
        Sections
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ConfigCard
          v-for="section in sections"
          :key="section.key"
          :title="section.title"
          :description="section.description"
          :icon="section.icon"
        />
      </div>
    </div>

  </div>
</template>

<style scoped></style>