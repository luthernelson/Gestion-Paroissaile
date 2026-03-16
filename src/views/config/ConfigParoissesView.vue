<script setup lang="ts">
import { ref, reactive } from 'vue'
import {
  Church, User, Clock, BookOpen, Heart,
  Plus, Trash2, Save, Star, Edit3,
} from 'lucide-vue-next'

import BaseInput from '@/components/ui/BaseInput.vue'
import Datepicker from '@/components/ui/Datepicker.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import LocationPicker from '@/components/ui/LocationPicker.vue'
import { type LocationResult } from '@/components/ui/LocationPicker.vue'
import SelectDropdown from '@/components/ui/SelectInput.vue'
import { useToast } from '@/stores/toast'

const toast = useToast()

interface CulteSchedule { id: number; jour: string; heure: string; libelle: string }
interface Valeur { id: number; titre: string; description: string }

const saving = ref(false)

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

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

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

function handleCancel() {
  toast('info', "Aucune modification n'a été enregistrée.", 'Modifications annulées')
}

async function handleSave() {
  saving.value = true
  const payload = { ...form, localisation: localisation.value, cultes: cultes.value, valeurs: valeurs.value }
  console.log('Payload API:', payload)
  try {
    await new Promise(r => setTimeout(r, 1800))
    toast('success', 'Les paramètres de la paroisse ont été mis à jour.', 'Modifications enregistrées')
  } catch (err: any) {
    toast('error', err?.message || 'Une erreur est survenue. Veuillez réessayer.', 'Erreur')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30 px-4 py-8">

    <!-- En-tête -->
    <div class="max-w-6xl mx-auto mb-8">
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
    </div>

    <div class="max-w-6xl mx-auto">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

        <!-- COLONNE GAUCHE -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col" style="height: 740px;">
          <div class="flex items-center gap-3 px-6 py-4 border-b border-gray-50 flex-shrink-0">
            <div class="w-9 h-9 rounded-xl bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0">
              <Church class="w-4 h-4" />
            </div>
            <div>
              <p class="font-bold text-gray-900 text-sm">Informations générales</p>
              <p class="text-xs text-gray-400 mt-0.5">Nom, date de création, localisation, pasteur</p>
            </div>
          </div>

          <div class="px-6 py-5 space-y-5 overflow-y-auto flex-1 scrollbar-thin">
            <BaseInput v-model="form.nom" label="Nom de la paroisse"
                      placeholder="Ex: Paroisse Centrale de Yaoundé" :icon="Church" required />
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Datepicker v-model="form.dateCreation" label="Date de création" required />
              <BaseInput v-model="form.pasteur" label="Pasteur principal"
                        placeholder="Nom du pasteur" :icon="User" required />
            </div>
            <LocationPicker v-model="localisation" label="Localisation"
              placeholder="Cliquez pour choisir sur la carte..." required
              hint="Sélectionnez la position exacte de la paroisse sur la carte" />

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

            <div class="grid grid-cols-3 gap-3">
              <div class="rounded-xl border border-gray-100 bg-gray-50 p-3 text-center">
                <p class="text-2xl font-black text-gray-900">{{ new Date().getFullYear() - parseInt(form.dateCreation) }}</p>
                <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-0.5">Ans d'existence</p>
              </div>
              <div class="rounded-xl border border-gray-100 bg-gray-50 p-3 text-center">
                <p class="text-2xl font-black text-gray-900">{{ cultes.length }}</p>
                <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-0.5">Cultes / semaine</p>
              </div>
              <div class="rounded-xl border border-gray-100 bg-gray-50 p-3 text-center">
                <p class="text-2xl font-black text-gray-900">{{ valeurs.length }}</p>
                <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-0.5">Valeurs fondatrices</p>
              </div>
            </div>

            <div class="rounded-xl p-4 flex gap-3" style="background: linear-gradient(135deg, #f0faf4, #e8f5e9); border: 1px solid #c8e6c9;">
              <div class="flex-shrink-0 w-1 rounded-full self-stretch" style="background: linear-gradient(180deg, #1a5c2a, #4ade80)"></div>
              <div>
                <p class="text-sm text-gray-700 leading-relaxed italic">
                  « Car là où deux ou trois sont assemblés en mon nom, je suis au milieu d'eux. »
                </p>
                <p class="text-[11px] font-bold text-green-700 mt-1.5">Matthieu 18:20</p>
              </div>
            </div>
          </div>
        </div>

        <!-- COLONNE DROITE -->
        <div class="flex flex-col gap-5" style="height: 740px;">

          <!-- Horaires -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col" style="height: 340px;">
            <div class="flex items-center gap-3 px-6 py-4 border-b border-gray-50 flex-shrink-0">
              <div class="w-9 h-9 rounded-xl bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0">
                <Clock class="w-4 h-4" />
              </div>
              <div class="flex-1">
                <p class="font-bold text-gray-900 text-sm">Horaires des cultes</p>
                <p class="text-xs text-gray-400 mt-0.5">
                  {{ cultes.length }} culte{{ cultes.length > 1 ? 's' : '' }} programmé{{ cultes.length > 1 ? 's' : '' }}
                </p>
              </div>
            </div>
            <div class="px-6 py-4 space-y-3 overflow-y-auto flex-1 scrollbar-thin">
              <TransitionGroup name="list">
                <div v-for="culte in cultes" :key="culte.id"
                  class="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/60 hover:border-green-200 hover:bg-green-50/30 transition-all group">

                  <!-- Jour — SelectDropdown -->
                  <div class="flex flex-col gap-1 min-w-[120px]">
                    <label class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Jour</label>
                    <SelectDropdown
                      v-model="culte.jour"
                      :options="JOURS"
                      :max-height="180"
                    />
                  </div>

                  <!-- Heure -->
                  <div class="flex flex-col gap-1 w-[90px]">
                    <label class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Heure</label>
                    <input v-model="culte.heure" type="time"
                      class="text-sm border border-gray-200 rounded-lg px-2 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800" />
                  </div>

                  <!-- Libellé -->
                  <div class="flex flex-col gap-1 flex-1">
                    <label class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Libellé</label>
                    <input v-model="culte.libelle" type="text" placeholder="Ex: Culte principal"
                      class="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 placeholder-gray-300" />
                  </div>

                  <!-- Supprimer -->
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

          <!-- Valeurs -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col" style="height: 340px;">
            <div class="flex items-center gap-3 px-6 py-4 border-b border-gray-50 flex-shrink-0">
              <div class="w-9 h-9 rounded-xl bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0">
                <Heart class="w-4 h-4" />
              </div>
              <div class="flex-1">
                <p class="font-bold text-gray-900 text-sm">Valeurs de la paroisse</p>
                <p class="text-xs text-gray-400 mt-0.5">
                  {{ valeurs.length }} valeur{{ valeurs.length > 1 ? 's' : '' }} définie{{ valeurs.length > 1 ? 's' : '' }}
                </p>
              </div>
            </div>
            <div class="px-6 py-4 space-y-3 overflow-y-auto flex-1 scrollbar-thin">
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
                    <input v-model="valeur.titre" type="text" placeholder="Titre de la valeur (ex: Foi, Fraternité...)"
                      class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-300" />
                    <textarea v-model="valeur.description" rows="2" placeholder="Description de cette valeur..."
                      class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none placeholder-gray-300 leading-relaxed" />
                  </div>
                </div>
              </TransitionGroup>
              <BaseButton variant="ghost" size="sm" :icon="Plus" label="Ajouter une valeur" @click="addValeur" />
            </div>
          </div>

        </div>
      </div>

      <!-- Histoire -->
      <div class="mt-5 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="flex items-center gap-3 px-6 py-4 border-b border-gray-50">
          <div class="w-9 h-9 rounded-xl bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0">
            <BookOpen class="w-4 h-4" />
          </div>
          <div>
            <p class="font-bold text-gray-900 text-sm">Histoire de la paroisse</p>
            <p class="text-xs text-gray-400 mt-0.5">Récit et contexte historique</p>
          </div>
        </div>
        <div class="px-6 py-5">
          <div class="relative">
            <Edit3 class="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
            <textarea v-model="form.histoire" rows="6" placeholder="Racontez l'histoire de votre paroisse..."
              class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all resize-none placeholder-gray-300 leading-relaxed" />
          </div>
          <p class="text-xs text-gray-400 mt-1.5 text-right">{{ form.histoire.length }} caractères</p>
        </div>
      </div>

      <!-- Boutons -->
      <div class="flex justify-end gap-3 pt-4 pb-8">
        <BaseButton variant="secondary" label="Annuler" @click="handleCancel" />
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

.scrollbar-thin { scrollbar-width: thin; scrollbar-color: #2d8a48 transparent; }
.scrollbar-thin::-webkit-scrollbar { width: 3px; }
.scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
.scrollbar-thin::-webkit-scrollbar-thumb { background-color: #2d8a48; border-radius: 99px; }
.scrollbar-thin::-webkit-scrollbar-thumb:hover { background-color: #1a5c2a; }
</style>