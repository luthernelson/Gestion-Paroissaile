<script setup lang="ts">
import { ref } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import { Users, Church, Coins, UsersRound, ChevronDown, ChevronRight, RefreshCw } from 'lucide-vue-next'

// Données simulées
const stats = [
  { title: 'Membres',   value: '258',    subtitle: 'Membres',    icon: Users,      iconColor: 'green',  trend: 12,  trendLabel: 'ce mois' },
  { title: 'Cultes',    value: '8',      subtitle: 'Sarcitiaks', icon: Church,     iconColor: 'amber',  trend: 0,   trendLabel: '' },
  { title: 'Collectes', value: '1 250 €',subtitle: 'Exerciters', icon: Coins,      iconColor: 'amber',  trend: 8.3, trendLabel: 'vs mois dernier' },
  { title: 'Groupes',   value: '12',     subtitle: 'Groupes',    icon: UsersRound, iconColor: 'green',  trend: 2,   trendLabel: '' },
]

const derniersMembres = [
  { id: 1, nom: 'Andieree Tpaluane', detail: '1ob1ateide Riputh Mete Me', role: 'Paroissial', avatar: null },
  { id: 2, nom: 'Genoib Ilachex',    detail: '2oirt-6d 33221- Roups',      role: 'Paroissial', avatar: null },
  { id: 3, nom: 'Marice Chaste',     detail: '2oirt-45-33222- Roups',      role: 'Paroissial', avatar: null },
  { id: 4, nom: 'Bertoiane Roasen',  detail: '2oirt-6d 09m9- Routes',      role: 'Paroissial', avatar: null },
  { id: 5, nom: 'Sibeance Latter',   detail: '3oiut 2aetnoocale Mendaen',  role: 'Paroissial', avatar: null },
]

const dernieresCollectes = [
  { id: 1, libelle: 'Dimante nambical', detail: '2espace8-1t280', montant: '1 230 €' },
  { id: 2, libelle: 'Dern spaical',     detail: '3ante8-1taoun',   montant: '700 €' },
]

const prochainCulte = {
  date:    'Dimanche 28 avril 2024',
  heure:   'Gion o fot Coate, Douse',
  lieu:    'Église Centrale, Douala',
}

const loading = ref(false)

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

const avatarColors = [
  'bg-green-600', 'bg-amber-500', 'bg-blue-600',
  'bg-purple-600', 'bg-teal-600', 'bg-rose-500',
]
</script>

<template>
  <div class="p-4 md:p-6 space-y-6 bg-gray-50 dark:bg-slate-950 min-h-full">

    <!-- ── Titre ── -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl md:text-3xl font-black text-gray-800 dark:text-slate-100">
        Tableau de bord
      </h1>
      <button
        class="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-green-700 dark:hover:text-green-400 transition-colors"
        @click="loading = !loading"
      >
        <RefreshCw class="h-4 w-4" :class="loading ? 'animate-spin' : ''" />
        <span class="hidden sm:inline">Actualiser</span>
      </button>
    </div>

    <!-- ── Cartes stats ── -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="(stat, i) in stats"
        :key="i"
        class="rounded-2xl overflow-hidden shadow-sm border border-white/10 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
        :class="i === 1 || i === 2 ? 'bg-gradient-to-br from-yellow-400 to-amber-500' : 'bg-gradient-to-br from-green-700 to-green-900'"
      >
        <div class="p-4 md:p-5">
          <!-- Icône -->
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
            :class="i === 1 || i === 2 ? 'bg-white/20' : 'bg-white/15'"
          >
            <component :is="stat.icon" class="h-6 w-6 text-white" />
          </div>
          <!-- Titre -->
          <p class="text-white/80 text-sm font-semibold mb-1">{{ stat.title }}</p>
          <!-- Valeur -->
          <p class="text-white text-2xl md:text-3xl font-black leading-tight">{{ stat.value }}</p>
          <!-- Sous-titre + chevron -->
          <div class="flex items-center justify-between mt-2">
            <span class="text-white/70 text-xs">{{ stat.subtitle }}</span>
            <ChevronDown class="h-4 w-4 text-white/70" />
          </div>
        </div>
      </div>
    </div>

    <!-- ── Contenu principal ── -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- Derniers membres -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
          <h2 class="text-base font-bold text-gray-800 dark:text-slate-100">Derniers membres ajoutés</h2>
          <button class="text-xs text-green-600 dark:text-green-400 font-semibold hover:underline">Voir tout</button>
        </div>

        <ul class="divide-y divide-gray-50 dark:divide-slate-800">
          <li
            v-for="membre in derniersMembres"
            :key="membre.id"
            class="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <!-- Avatar initiales -->
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              :class="avatarColors[membre.id % avatarColors.length]"
            >
              {{ getInitials(membre.nom) }}
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-800 dark:text-slate-200 truncate">{{ membre.nom }}</p>
              <p class="text-xs text-gray-400 dark:text-slate-500 truncate">{{ membre.detail }}</p>
            </div>

            <!-- Badge rôle -->
            <span class="flex-shrink-0 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20">
              {{ membre.role }}
            </span>
          </li>
        </ul>
      </div>

      <!-- Colonne droite -->
      <div class="flex flex-col gap-5">

        <!-- Dernières collectes -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
            <h2 class="text-base font-bold text-gray-800 dark:text-slate-100">Dernières collectes</h2>
            <button class="text-xs text-green-600 dark:text-green-400 font-semibold hover:underline">Voir tout</button>
          </div>

          <ul class="divide-y divide-gray-50 dark:divide-slate-800">
            <li
              v-for="collecte in dernieresCollectes"
              :key="collecte.id"
              class="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <!-- Icône -->
              <div class="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                <Coins class="h-4 w-4 text-amber-500" />
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-800 dark:text-slate-200">{{ collecte.libelle }}</p>
                <p class="text-xs text-gray-400 dark:text-slate-500">{{ collecte.detail }}</p>
              </div>

              <!-- Montant -->
              <span class="text-sm font-bold text-gray-800 dark:text-slate-100 flex-shrink-0">
                {{ collecte.montant }}
              </span>
            </li>
          </ul>
        </div>

        <!-- Prochain culte -->
        <div class="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-amber-900/20 dark:to-yellow-900/10 rounded-2xl border border-amber-200 dark:border-amber-800 shadow-sm overflow-hidden">
          <div class="px-5 py-4 border-b border-amber-200/60 dark:border-amber-800/60">
            <h2 class="text-base font-bold text-gray-800 dark:text-slate-100">Prochain culte</h2>
          </div>

          <div class="px-5 py-4 flex items-center gap-4">
            <!-- Icône calendrier -->
            <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center flex-shrink-0 shadow-md">
              <Church class="h-7 w-7 text-white" />
            </div>

            <!-- Détails -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-gray-800 dark:text-slate-100">{{ prochainCulte.date }}</p>
              <p class="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{{ prochainCulte.heure }}</p>
              <p class="text-xs text-gray-500 dark:text-slate-400">{{ prochainCulte.lieu }}</p>
            </div>

            <!-- Flèche -->
            <ChevronRight class="h-5 w-5 text-amber-500 flex-shrink-0" />
          </div>
        </div>

      </div>
    </div>
  </div>
</template>