<script setup lang="ts">
import { ref, reactive } from 'vue'
import {
  Church, MapPin, User, Calendar, Clock, BookOpen, Heart,
  Plus, Trash2, Save, ChevronDown, Star, Edit3
} from 'lucide-vue-next'

import BaseInput from '@/components/ui/BaseInput.vue'
import Datepicker from '@/components/ui/Datepicker.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import LocationPicker from '@/components/ui/LocationPicker.vue'
import  { type LocationResult } from '@/components/ui/LocationPicker.vue'

interface CulteSchedule {
  id: number
  jour: string
  heure: string
  libelle: string
}

interface Valeur {
  id: number
  titre: string
  description: string
}

const saving = ref(false)
const activeSection = ref<string | null>(null)

const form = reactive({
  nom: 'Église Évangélique du Cameroun – Paroisse Centrale',
  dateCreation: '1957-03-12',
  pasteur: 'Pasteur Jean-Baptiste Mbarga',
  histoire: `Fondée en 1957 par des missionnaires bâlois, la Paroisse Centrale de Yaoundé est l'une des paroisses piliers de l'Église Évangélique du Cameroun. Depuis plus de six décennies, elle accompagne les fidèles dans leur croissance spirituelle, leur engagement communautaire et leur témoignage de foi.

Au fil des années, la paroisse a vu naître de nombreux ministères, des générations de chrétiens engagés et des initiatives sociales qui ont transformé le quartier et au-delà.`,
})

const localisation = ref<LocationResult | null>({
  label: 'Yaoundé, Centre, Cameroun',
  adresse: 'Avenue Kennedy, Bastos',
  ville: 'Yaoundé',
  pays: 'Cameroun',
  lat: 3.8480,
  lng: 11.5021,
})

const cultes = ref<CulteSchedule[]>([
  { id: 1, jour: 'Dimanche', heure: '08:00', libelle: 'Culte du matin' },
  { id: 2, jour: 'Dimanche', heure: '10:30', libelle: 'Culte principal' },
  { id: 3, jour: 'Mercredi', heure: '18:30', libelle: 'Culte de prière' },
])

const valeurs = ref<Valeur[]>([
  { id: 1, titre: 'Foi', description: 'Grandir ensemble dans la connaissance et la pratique de la Parole de Dieu.' },
  { id: 2, titre: 'Fraternité', description: "Une communauté unie par l'amour du prochain et le respect mutuel." },
  { id: 3, titre: 'Service', description: 'Servir avec humilité, dévouement et un cœur tourné vers les autres.' },
])

const JOURS = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche']

function toggleSection(section: string) {
  activeSection.value = activeSection.value === section ? null : section
}

function addCulte() {
  cultes.value.push({ id: Date.now(), jour: 'Dimanche', heure: '08:00', libelle: '' })
}
function removeCulte(id: number) {
  cultes.value = cultes.value.filter(c => c.id !== id)
}
function addValeur() {
  valeurs.value.push({ id: Date.now(), titre: '', description: '' })
}
function removeValeur(id: number) {
  valeurs.value = valeurs.value.filter(v => v.id !== id)
}

async function handleSave() {
  saving.value = true
  const payload = {
    ...form,
    localisation: localisation.value,
    cultes: cultes.value,
    valeurs: valeurs.value,
  }
  console.log('Payload API:', payload)
  await new Promise(r => setTimeout(r, 1800))
  saving.value = false
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30 px-4 py-8">

    <div class="max-w-3xl mx-auto mb-8">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
             style="background: linear-gradient(135deg, #1a5c2a, #2d8a48)">
          <Church class="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 class="text-2xl font-black text-gray-900 tracking-tight">Paramètres Généraux</h1>
          <p class="text-sm text-gray-500 mt-0.5">Configuration de la paroisse</p>
        </div>
      </div>
  <!--     <div class="mt-6 h-1 rounded-full bg-gray-100 overflow-hidden">
        <div class="h-full rounded-full" style="width: 72%; background: linear-gradient(90deg, #1a5c2a, #4ade80)"></div>
      </div>
      <p class="text-xs text-gray-400 mt-1.5 text-right">72% complété</p> -->
    </div>

    <div class="max-w-3xl mx-auto space-y-4">

      <!-- SECTION 1 — Informations générales -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <button type="button"
          class="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-gray-50/80 transition-colors"
          @click="toggleSection('info')">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
               :class="activeSection === 'info' || activeSection === null ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">
            <Church class="w-4 h-4" />
          </div>
          <div class="flex-1">
            <p class="font-bold text-gray-900 text-sm">Informations générales</p>
            <p class="text-xs text-gray-400 mt-0.5">Nom, date de création, localisation, pasteur</p>
          </div>
          <ChevronDown class="w-4 h-4 text-gray-400 transition-transform duration-200"
                       :class="(activeSection === 'info' || activeSection === null) ? 'rotate-180' : ''" />
        </button>

        <div v-show="activeSection === 'info' || activeSection === null" class="px-6 pb-6 border-t border-gray-50">
          <div class="pt-5 space-y-5">
            <BaseInput v-model="form.nom" label="Nom de la paroisse"
                      placeholder="Ex: Paroisse Centrale de Yaoundé" :icon="Church" required />

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Datepicker v-model="form.dateCreation" label="Date de création" required />
              <BaseInput v-model="form.pasteur" label="Pasteur principal"
                        placeholder="Nom du pasteur" :icon="User" required />
            </div>

            <!-- LocationPicker avec carte -->
            <LocationPicker
              v-model="localisation"
              label="Localisation"
              placeholder="Cliquez pour choisir sur la carte..."
              required
              hint="Sélectionnez la position exacte de la paroisse sur la carte"
            />

            <!-- Résumé coordonnées -->
            <div v-if="localisation" class="grid grid-cols-3 gap-3">
              <div class="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
                <p class="text-[10px] font-bold uppercase tracking-wider text-green-600 mb-1">Ville</p>
                <p class="text-sm font-semibold text-gray-800 truncate">{{ localisation.ville || '—' }}</p>
              </div>
              <div class="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
                <p class="text-[10px] font-bold uppercase tracking-wider text-green-600 mb-1">Latitude</p>
                <p class="text-sm font-mono font-semibold text-gray-800">{{ localisation.lat.toFixed(4) }}</p>
              </div>
              <div class="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
                <p class="text-[10px] font-bold uppercase tracking-wider text-green-600 mb-1">Longitude</p>
                <p class="text-sm font-mono font-semibold text-gray-800">{{ localisation.lng.toFixed(4) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SECTION 2 — Horaires des cultes -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <button type="button"
          class="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-gray-50/80 transition-colors"
          @click="toggleSection('cultes')">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
               :class="activeSection === 'cultes' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">
            <Clock class="w-4 h-4" />
          </div>
          <div class="flex-1">
            <p class="font-bold text-gray-900 text-sm">Horaires des cultes</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ cultes.length }} culte{{ cultes.length > 1 ? 's' : '' }} programmé{{ cultes.length > 1 ? 's' : '' }}</p>
          </div>
          <ChevronDown class="w-4 h-4 text-gray-400 transition-transform duration-200"
                       :class="activeSection === 'cultes' ? 'rotate-180' : ''" />
        </button>

        <div v-show="activeSection === 'cultes'" class="border-t border-gray-50">
          <div class="px-6 py-4 space-y-3">
            <TransitionGroup name="list">
              <div v-for="culte in cultes" :key="culte.id"
                class="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/60 hover:border-green-200 hover:bg-green-50/30 transition-all group">
                <div class="flex flex-col gap-1 min-w-[110px]">
                  <label class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Jour</label>
                  <select v-model="culte.jour"
                    class="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800">
                    <option v-for="j in JOURS" :key="j">{{ j }}</option>
                  </select>
                </div>
                <div class="flex flex-col gap-1 w-[90px]">
                  <label class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Heure</label>
                  <input v-model="culte.heure" type="time"
                    class="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800" />
                </div>
                <div class="flex flex-col gap-1 flex-1">
                  <label class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Libellé</label>
                  <input v-model="culte.libelle" type="text" placeholder="Ex: Culte principal"
                    class="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 placeholder-gray-300" />
                </div>
                <button type="button"
                  class="opacity-0 group-hover:opacity-100 mt-4 p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-all"
                  @click="removeCulte(culte.id)">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </TransitionGroup>
            <BaseButton variant="ghost" size="sm" :icon="Plus" label="Ajouter un créneau" @click="addCulte" />
          </div>
        </div>
      </div>

      <!-- SECTION 3 — Histoire -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <button type="button"
          class="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-gray-50/80 transition-colors"
          @click="toggleSection('histoire')">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
               :class="activeSection === 'histoire' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">
            <BookOpen class="w-4 h-4" />
          </div>
          <div class="flex-1">
            <p class="font-bold text-gray-900 text-sm">Histoire de la paroisse</p>
            <p class="text-xs text-gray-400 mt-0.5">Récit et contexte historique</p>
          </div>
          <ChevronDown class="w-4 h-4 text-gray-400 transition-transform duration-200"
                       :class="activeSection === 'histoire' ? 'rotate-180' : ''" />
        </button>

        <div v-show="activeSection === 'histoire'" class="px-6 pb-6 border-t border-gray-50 pt-5">
          <label class="text-sm font-semibold text-gray-700 mb-1.5 block">Récit historique</label>
          <div class="relative">
            <Edit3 class="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
            <textarea v-model="form.histoire" rows="7"
              placeholder="Racontez l'histoire de votre paroisse..."
              class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all resize-none placeholder-gray-300 leading-relaxed" />
          </div>
          <p class="text-xs text-gray-400 mt-1.5 text-right">{{ form.histoire.length }} caractères</p>
        </div>
      </div>

      <!-- SECTION 4 — Valeurs -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <button type="button"
          class="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-gray-50/80 transition-colors"
          @click="toggleSection('valeurs')">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
               :class="activeSection === 'valeurs' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">
            <Heart class="w-4 h-4" />
          </div>
          <div class="flex-1">
            <p class="font-bold text-gray-900 text-sm">Valeurs de la paroisse</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ valeurs.length }} valeur{{ valeurs.length > 1 ? 's' : '' }} définie{{ valeurs.length > 1 ? 's' : '' }}</p>
          </div>
          <ChevronDown class="w-4 h-4 text-gray-400 transition-transform duration-200"
                       :class="activeSection === 'valeurs' ? 'rotate-180' : ''" />
        </button>

        <div v-show="activeSection === 'valeurs'" class="border-t border-gray-50">
          <div class="px-6 py-4 space-y-3">
            <TransitionGroup name="list">
              <div v-for="(valeur, index) in valeurs" :key="valeur.id"
                class="group relative border border-gray-100 rounded-xl p-4 hover:border-green-200 hover:shadow-sm transition-all"
                :style="`border-left: 3px solid hsl(${140 + index * 25}, 55%, 45%)`">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white"
                         :style="`background: hsl(${140 + index * 25}, 55%, 45%)`">{{ index + 1 }}</div>
                    <Star class="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <button type="button"
                    class="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-all"
                    @click="removeValeur(valeur.id)">
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
                <div class="space-y-3">
                  <input v-model="valeur.titre" type="text"
                    placeholder="Titre de la valeur (ex: Foi, Fraternité...)"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-300" />
                  <textarea v-model="valeur.description" rows="2"
                    placeholder="Description de cette valeur..."
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none placeholder-gray-300 leading-relaxed" />
                </div>
              </div>
            </TransitionGroup>
            <BaseButton variant="ghost" size="sm" :icon="Plus" label="Ajouter une valeur" @click="addValeur" />
          </div>
        </div>
      </div>

      <!-- Bouton Enregistrer -->
      <div class="flex justify-end gap-3 pt-2 pb-8">
        <BaseButton variant="secondary" label="Annuler" />
        <BaseButton variant="primary"
          :label="saving ? 'Enregistrement...' : 'Enregistrer les modifications'"
          :icon="Save" :loading="saving" size="lg" @click="handleSave" />
      </div>

    </div>
  </div>
</template>

<style scoped>
.list-enter-active, .list-leave-active { transition: all 0.25s ease; }
.list-enter-from { opacity: 0; transform: translateY(-8px); }
.list-leave-to   { opacity: 0; transform: translateX(20px); }
</style>