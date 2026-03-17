<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import {
  Church, User, Clock, BookOpen, Heart,
  Plus, Trash2, Save, Star, Edit3,
  Bell, CreditCard, Shield, Pencil, ChevronDown,
} from 'lucide-vue-next'

import BaseInput    from '@/components/ui/BaseInput.vue'
import Datepicker   from '@/components/ui/Datepicker.vue'
import BaseButton   from '@/components/ui/BaseButton.vue'
import LocationPicker from '@/components/ui/LocationPicker.vue'
import { type LocationResult } from '@/components/ui/LocationPicker.vue'
import SelectDropdown from '@/components/ui/SelectInput.vue'
import ConfirmModal from '@/components/ui/confirmModal.vue'
import CompteModal  from '@/components/ui/CompteModal.vue'
import { type Compte } from '@/components/ui/CompteModal.vue'
import { useToast }   from '@/stores/toast'

const toast  = useToast()
const saving = ref(false)

// ══════════════════════════════════════════════
// INFOS PAROISSE
// ══════════════════════════════════════════════
interface CulteSchedule { id: number; jour: string; heure: string; libelle: string }
interface Valeur        { id: number; titre: string; description: string }

const form = reactive({
  nom:          'Église Évangélique du Cameroun – Paroisse Centrale',
  dateCreation: '1957-03-12',
  pasteur:      'Pasteur Jean-Baptiste Mbarga',
  histoire:     `Fondée en 1957 par des missionnaires bâlois, la Paroisse Centrale de Yaoundé est l'une des paroisses piliers de l'Église Évangélique du Cameroun. Depuis plus de six décennies, elle accompagne les fidèles dans leur croissance spirituelle, leur engagement communautaire et leur témoignage de foi.

Au fil des années, la paroisse a vu naître de nombreux ministères, des générations de chrétiens engagés et des initiatives sociales qui ont transformé le quartier et au-delà.`,
})

const localisation = ref<LocationResult | null>({
  label: 'Yaoundé, Centre, Cameroun', adresse: 'Avenue Kennedy, Bastos',
  ville: 'Yaoundé', pays: 'Cameroun', lat: 3.8480, lng: 11.5021,
})

const cultes = ref<CulteSchedule[]>([
  { id: 1, jour: 'Dimanche', heure: '08:00', libelle: 'Culte du matin'    },
  { id: 2, jour: 'Dimanche', heure: '10:30', libelle: 'Culte principal'   },
  { id: 3, jour: 'Mercredi', heure: '18:30', libelle: 'Culte de prière'   },
])

const valeurs = ref<Valeur[]>([
  { id: 1, titre: 'Foi',        description: 'Grandir ensemble dans la connaissance et la pratique de la Parole de Dieu.' },
  { id: 2, titre: 'Fraternité', description: "Une communauté unie par l'amour du prochain et le respect mutuel." },
  { id: 3, titre: 'Service',    description: 'Servir avec humilité, dévouement et un cœur tourné vers les autres.' },
])

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

function addCulte()              { cultes.value.push({ id: Date.now(), jour: 'Dimanche', heure: '08:00', libelle: '' }) }
function removeCulte(id: number) { cultes.value = cultes.value.filter(c => c.id !== id) }
function addValeur()             { valeurs.value.push({ id: Date.now(), titre: '', description: '' }) }
function removeValeur(id: number){ valeurs.value = valeurs.value.filter(v => v.id !== id) }

function handleCancel() {
  toast('info', "Aucune modification n'a été enregistrée.", 'Modifications annulées')
}

async function handleSave() {
  saving.value = true
  try {
    await new Promise(r => setTimeout(r, 1800))
    toast('success', 'Les paramètres ont été mis à jour.', 'Modifications enregistrées')
  } catch (err: any) {
    toast('error', err?.message || 'Une erreur est survenue.', 'Erreur')
  } finally {
    saving.value = false
  }
}

// ══════════════════════════════════════════════
// NOTIFICATIONS — canaux uniquement
// ══════════════════════════════════════════════
const canaux = reactive({ email: true, sms: false, push: true })

const canauxList = [
  { key: 'email', label: 'Email',             description: "Envoi de notifications par email aux membres" },
  { key: 'sms',   label: 'SMS',               description: "Envoi par SMS (coût par message)" },
  { key: 'push',  label: 'Notification Push', description: "Notifications dans l'application mobile" },
]

// Délais d'alerte (jours avant)
const rappelJours = reactive({
  evenement:   1,   // jours avant un événement
  cotisation:  7,   // jours avant échéance cotisation
  anniversaire: 1,  // jours avant un anniversaire
})

// Section déroulante comptes (exclusive)
const openCompteSection = ref<'BANCAIRE' | 'MOBILE_MONEY' | null>('BANCAIRE')
function toggleCompteSection(section: 'BANCAIRE' | 'MOBILE_MONEY') {
  openCompteSection.value = openCompteSection.value === section ? null : section
}

// ══════════════════════════════════════════════
// COMPTES & PAIEMENTS
// ══════════════════════════════════════════════
const comptes = ref<Compte[]>([
  { id: 1, type: 'BANCAIRE',     operateur: 'Afriland First Bank', nom: 'Compte principal', numero: '12345678901', titulaire: 'EEC Paroisse Centrale', actif: true  },
  { id: 2, type: 'BANCAIRE',     operateur: 'SCB Cameroun',        nom: 'Compte projet',    numero: '98765432109', titulaire: 'EEC Paroisse Centrale', actif: true  },
  { id: 3, type: 'MOBILE_MONEY', operateur: 'MTN',                 nom: 'MTN Mobile Money', numero: '677 000 001', titulaire: 'Pasteur Mbarga',        actif: true  },
  { id: 4, type: 'MOBILE_MONEY', operateur: 'Orange',              nom: 'Orange Money',     numero: '699 000 002', titulaire: 'Pasteur Mbarga',        actif: false },
])

const comptesBancaires   = computed(() => comptes.value.filter(c => c.type === 'BANCAIRE'))
const comptesMobileMoney = computed(() => comptes.value.filter(c => c.type === 'MOBILE_MONEY'))

const showCompteModal   = ref(false)
const editCompte        = ref<Compte | null>(null)
const defaultType       = ref<'BANCAIRE' | 'MOBILE_MONEY'>('BANCAIRE')

const confirmDeleteCompte = ref({ show: false, loading: false, id: 0 })

function openCreateCompte(type: 'BANCAIRE' | 'MOBILE_MONEY') {
  defaultType.value  = type
  editCompte.value   = null
  showCompteModal.value = true
}
function openCreateFromSection() {
  openCreateCompte(openCompteSection.value ?? 'BANCAIRE')
}
function openEditCompte(c: Compte) {
  editCompte.value   = c
  showCompteModal.value = true
}
function onSaveCompte(data: Omit<Compte, 'id'>) {
  if (editCompte.value) {
    Object.assign(editCompte.value, data)
    toast('success', 'Compte mis à jour.', 'Modification')
  } else {
    comptes.value.push({ id: Date.now(), ...data })
    toast('success', 'Compte ajouté.', 'Ajout')
  }
}
async function deleteCompte() {
  confirmDeleteCompte.value.loading = true
  await new Promise(r => setTimeout(r, 600))
  comptes.value = comptes.value.filter(c => c.id !== confirmDeleteCompte.value.id)
  confirmDeleteCompte.value.show = false
  toast('success', 'Compte supprimé.', 'Suppression')
}

function operateurIconStyle(op: string) {
  if (op === 'MTN')    return { bg: '#fef9c3', color: '#92400e' }
  if (op === 'Orange') return { bg: '#ffedd5', color: '#9a3412' }
  return { bg: '#dbeafe', color: '#1e40af' }
}

// ══════════════════════════════════════════════
// SÉCURITÉ
// ══════════════════════════════════════════════
const securite = reactive({
  motDePasseMinLength:   8,
  motDePasseExpiration:  90,
  motDePasseMajuscule:   true,
  motDePasseChiffre:     true,
  motDePasseSpecial:     false,
  sessionDuree:          480,
  twoFactor:             false,
})

const SESSION_OPTIONS = [
  { label: '30 minutes', value: 30   },
  { label: '1 heure',    value: 60   },
  { label: '4 heures',   value: 240  },
  { label: '8 heures',   value: 480  },
  { label: '24 heures',  value: 1440 },
]

const reglesMotDePasse = [
  { key: 'motDePasseMajuscule', label: 'Majuscule requise'         },
  { key: 'motDePasseChiffre',   label: 'Chiffre requis'            },
  { key: 'motDePasseSpecial',   label: 'Caractère spécial requis'  },
]
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

    <div class="max-w-6xl mx-auto space-y-5">

      <!-- ══ GRILLE INFOS + CULTES/VALEURS ══ -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

        <!-- Colonne gauche -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col" style="height:740px">
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
            <BaseInput v-model="form.nom" label="Nom de la paroisse" placeholder="Ex: Paroisse Centrale de Yaoundé" :icon="Church" required />
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Datepicker v-model="form.dateCreation" label="Date de création" required />
              <BaseInput v-model="form.pasteur" label="Pasteur principal" placeholder="Nom du pasteur" :icon="User" required />
            </div>
            <LocationPicker v-model="localisation" label="Localisation" placeholder="Cliquez pour choisir sur la carte..." required hint="Sélectionnez la position exacte de la paroisse sur la carte" />
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
            <div class="rounded-xl p-4 flex gap-3" style="background:linear-gradient(135deg,#f0faf4,#e8f5e9);border:1px solid #c8e6c9">
              <div class="flex-shrink-0 w-1 rounded-full self-stretch" style="background:linear-gradient(180deg,#1a5c2a,#4ade80)"></div>
              <div>
                <p class="text-sm text-gray-700 leading-relaxed italic">« Car là où deux ou trois sont assemblés en mon nom, je suis au milieu d'eux. »</p>
                <p class="text-[11px] font-bold text-green-700 mt-1.5">Matthieu 18:20</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Colonne droite -->
        <div class="flex flex-col gap-5" style="height:740px">
          <!-- Horaires -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col" style="height:340px">
            <div class="flex items-center gap-3 px-6 py-4 border-b border-gray-50 flex-shrink-0">
              <div class="w-9 h-9 rounded-xl bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0"><Clock class="w-4 h-4" /></div>
              <div class="flex-1">
                <p class="font-bold text-gray-900 text-sm">Horaires des cultes</p>
                <p class="text-xs text-gray-400 mt-0.5">{{ cultes.length }} culte{{ cultes.length > 1 ? 's' : '' }} programmé{{ cultes.length > 1 ? 's' : '' }}</p>
              </div>
            </div>
            <div class="px-6 py-4 space-y-3 overflow-y-auto flex-1 scrollbar-thin">
              <TransitionGroup name="list">
                <div v-for="culte in cultes" :key="culte.id" class="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/60 hover:border-green-200 hover:bg-green-50/30 transition-all group">
                  <div class="flex flex-col gap-1 min-w-[120px]">
                    <label class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Jour</label>
                    <SelectDropdown v-model="culte.jour" :options="JOURS" :max-height="180" />
                  </div>
                  <div class="flex flex-col gap-1 w-[90px]">
                    <label class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Heure</label>
                    <input v-model="culte.heure" type="time" class="text-sm border border-gray-200 rounded-lg px-2 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800" />
                  </div>
                  <div class="flex flex-col gap-1 flex-1">
                    <label class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Libellé</label>
                    <input v-model="culte.libelle" type="text" placeholder="Ex: Culte principal" class="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 placeholder-gray-300" />
                  </div>
                  <button type="button" class="opacity-0 group-hover:opacity-100 mt-4 p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-all" @click="removeCulte(culte.id)">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </TransitionGroup>
              <BaseButton variant="ghost" size="sm" :icon="Plus" label="Ajouter un créneau" @click="addCulte" />
            </div>
          </div>

          <!-- Valeurs -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col" style="height:340px">
            <div class="flex items-center gap-3 px-6 py-4 border-b border-gray-50 flex-shrink-0">
              <div class="w-9 h-9 rounded-xl bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0"><Heart class="w-4 h-4" /></div>
              <div class="flex-1">
                <p class="font-bold text-gray-900 text-sm">Valeurs de la paroisse</p>
                <p class="text-xs text-gray-400 mt-0.5">{{ valeurs.length }} valeur{{ valeurs.length > 1 ? 's' : '' }} définie{{ valeurs.length > 1 ? 's' : '' }}</p>
              </div>
            </div>
            <div class="px-6 py-4 space-y-3 overflow-y-auto flex-1 scrollbar-thin">
              <TransitionGroup name="list">
                <div v-for="(valeur, index) in valeurs" :key="valeur.id" class="group relative border border-gray-100 rounded-xl p-4 hover:border-green-200 hover:shadow-sm transition-all" :style="`border-left:3px solid hsl(${140+index*25},55%,45%)`">
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2">
                      <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white" :style="`background:hsl(${140+index*25},55%,45%)`">{{ index+1 }}</div>
                      <Star class="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <button type="button" class="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-all" @click="removeValeur(valeur.id)">
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div class="space-y-3">
                    <input v-model="valeur.titre" type="text" placeholder="Titre de la valeur (ex: Foi, Fraternité...)" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-300" />
                    <textarea v-model="valeur.description" rows="2" placeholder="Description de cette valeur..." class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none placeholder-gray-300 leading-relaxed" />
                  </div>
                </div>
              </TransitionGroup>
              <BaseButton variant="ghost" size="sm" :icon="Plus" label="Ajouter une valeur" @click="addValeur" />
            </div>
          </div>
        </div>
      </div>

      <!-- ══ HISTOIRE ══ -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="flex items-center gap-3 px-6 py-4 border-b border-gray-50">
          <div class="w-9 h-9 rounded-xl bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0"><BookOpen class="w-4 h-4" /></div>
          <div>
            <p class="font-bold text-gray-900 text-sm">Histoire de la paroisse</p>
            <p class="text-xs text-gray-400 mt-0.5">Récit et contexte historique</p>
          </div>
        </div>
        <div class="px-6 py-5">
          <div class="relative">
            <Edit3 class="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
            <textarea v-model="form.histoire" rows="6" placeholder="Racontez l'histoire de votre paroisse..." class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all resize-none placeholder-gray-300 leading-relaxed" />
          </div>
          <p class="text-xs text-gray-400 mt-1.5 text-right">{{ form.histoire.length }} caractères</p>
        </div>
      </div>

      <!-- ══ NOTIFICATIONS ══ -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="flex items-center gap-3 px-6 py-4 border-b border-gray-50">
          <div class="w-9 h-9 rounded-xl bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0"><Bell class="w-4 h-4" /></div>
          <div>
            <p class="font-bold text-gray-900 text-sm">Notifications</p>
            <p class="text-xs text-gray-400 mt-0.5">Canaux d'envoi et délais d'alerte</p>
          </div>
        </div>

        <!-- Canaux -->
        <div class="divide-y divide-gray-100">
          <div v-for="canal in canauxList" :key="canal.key" class="flex items-center justify-between px-6 py-4">
            <div>
              <p class="text-sm font-medium text-gray-800">{{ canal.label }}</p>
              <p class="text-xs text-gray-400 mt-0.5">{{ canal.description }}</p>
            </div>
            <button
              class="relative w-10 h-6 rounded-full transition-colors flex-shrink-0"
              :class="(canaux as any)[canal.key] ? 'bg-green-500' : 'bg-gray-300'"
              @click="(canaux as any)[canal.key] = !(canaux as any)[canal.key]"
            >
              <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform" :class="(canaux as any)[canal.key] ? 'translate-x-4' : ''" />
            </button>
          </div>
        </div>

        <!-- Délais d'alerte -->
        <div class="px-6 py-5 border-t border-gray-100 space-y-4">
          <p class="text-xs font-bold uppercase tracking-wider text-gray-400">Délais d'alerte</p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-semibold text-gray-700">Événement calendrier</label>
              <div class="flex items-center gap-2">
                <input
                  v-model.number="rappelJours.evenement"
                  type="number" min="1" max="30"
                  class="w-16 h-[38px] px-2 text-sm text-center rounded-lg border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <span class="text-sm text-gray-500">jour(s) avant</span>
              </div>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-semibold text-gray-700">Cotisation</label>
              <div class="flex items-center gap-2">
                <input
                  v-model.number="rappelJours.cotisation"
                  type="number" min="1" max="30"
                  class="w-16 h-[38px] px-2 text-sm text-center rounded-lg border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <span class="text-sm text-gray-500">jour(s) avant</span>
              </div>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-semibold text-gray-700">Anniversaire</label>
              <div class="flex items-center gap-2">
                <input
                  v-model.number="rappelJours.anniversaire"
                  type="number" min="1" max="14"
                  class="w-16 h-[38px] px-2 text-sm text-center rounded-lg border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <span class="text-sm text-gray-500">jour(s) avant</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ COMPTES & PAIEMENTS ══ -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        <!-- Header avec bouton unique -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0"><CreditCard class="w-4 h-4" /></div>
            <div>
              <p class="font-bold text-gray-900 text-sm">Comptes & paiements</p>
              <p class="text-xs text-gray-400 mt-0.5">{{ comptes.length }} compte{{ comptes.length > 1 ? 's' : '' }} configuré{{ comptes.length > 1 ? 's' : '' }}</p>
            </div>
          </div>
          <button
            class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-green-600 hover:bg-green-700 text-white transition-colors"
            @click="openCreateFromSection"
          >
            <Plus class="w-3.5 h-3.5" />
            Ajouter un compte
          </button>
        </div>

        <!-- Accordion Bancaires -->
        <div class="border-b border-gray-100">
          <button
            type="button"
            class="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors text-left"
            @click="toggleCompteSection('BANCAIRE')"
          >
            <div class="flex items-center gap-3">
              <span class="text-sm font-semibold text-gray-800">Comptes bancaires</span>
              <span class="text-[11px] px-2 py-0.5 rounded-full font-medium"
                :class="comptesBancaires.length > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'">
                {{ comptesBancaires.length }}
              </span>
            </div>
            <ChevronDown
              class="w-4 h-4 text-gray-400 transition-transform duration-200"
              :class="openCompteSection === 'BANCAIRE' ? 'rotate-180' : ''"
            />
          </button>
          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <div v-if="openCompteSection === 'BANCAIRE'" class="px-6 pb-4 space-y-2">
              <p v-if="comptesBancaires.length === 0" class="text-xs text-gray-400 italic py-3 text-center">Aucun compte bancaire configuré</p>
              <div v-for="c in comptesBancaires" :key="c.id"
                class="flex items-center gap-3 p-3.5 rounded-xl border transition-colors"
                :class="c.actif ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'">
                <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-blue-50">
                  <CreditCard class="w-4 h-4 text-blue-600" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <p class="text-sm font-semibold text-gray-800 truncate">{{ c.nom }}</p>
                    <span v-if="!c.actif" class="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 text-gray-500">Inactif</span>
                  </div>
                  <p class="text-xs text-gray-500">{{ c.operateur }} · {{ c.numero }}</p>
                  <p class="text-xs text-gray-400">{{ c.titulaire }}</p>
                </div>
                <div class="flex items-center gap-1 flex-shrink-0">
                  <button class="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" @click="openEditCompte(c)"><Pencil class="w-3.5 h-3.5" /></button>
                  <button class="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" @click="confirmDeleteCompte = { show: true, loading: false, id: c.id }"><Trash2 class="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Accordion Mobile Money -->
        <div>
          <button
            type="button"
            class="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors text-left"
            @click="toggleCompteSection('MOBILE_MONEY')"
          >
            <div class="flex items-center gap-3">
              <span class="text-sm font-semibold text-gray-800">Mobile Money</span>
              <span class="text-[11px] px-2 py-0.5 rounded-full font-medium"
                :class="comptesMobileMoney.length > 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'">
                {{ comptesMobileMoney.length }}
              </span>
            </div>
            <ChevronDown
              class="w-4 h-4 text-gray-400 transition-transform duration-200"
              :class="openCompteSection === 'MOBILE_MONEY' ? 'rotate-180' : ''"
            />
          </button>
          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <div v-if="openCompteSection === 'MOBILE_MONEY'" class="px-6 pb-4 space-y-2">
              <p v-if="comptesMobileMoney.length === 0" class="text-xs text-gray-400 italic py-3 text-center">Aucun compte Mobile Money configuré</p>
              <div v-for="c in comptesMobileMoney" :key="c.id"
                class="flex items-center gap-3 p-3.5 rounded-xl border transition-colors"
                :class="c.actif ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'">
                <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black"
                  :style="`background:${operateurIconStyle(c.operateur).bg};color:${operateurIconStyle(c.operateur).color}`">
                  {{ c.operateur.substring(0, 2).toUpperCase() }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <p class="text-sm font-semibold text-gray-800 truncate">{{ c.nom }}</p>
                    <span v-if="!c.actif" class="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 text-gray-500">Inactif</span>
                  </div>
                  <p class="text-xs text-gray-500">{{ c.operateur }} · {{ c.numero }}</p>
                  <p class="text-xs text-gray-400">{{ c.titulaire }}</p>
                </div>
                <div class="flex items-center gap-1 flex-shrink-0">
                  <button class="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" @click="openEditCompte(c)"><Pencil class="w-3.5 h-3.5" /></button>
                  <button class="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" @click="confirmDeleteCompte = { show: true, loading: false, id: c.id }"><Trash2 class="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          </Transition>
        </div>

      </div>

      <!-- ══ SÉCURITÉ ══ -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="flex items-center gap-3 px-6 py-4 border-b border-gray-50">
          <div class="w-9 h-9 rounded-xl bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0"><Shield class="w-4 h-4" /></div>
          <div>
            <p class="font-bold text-gray-900 text-sm">Sécurité</p>
            <p class="text-xs text-gray-400 mt-0.5">Politique de mot de passe et session</p>
          </div>
        </div>
        <div class="p-6 space-y-6">

          <!-- Mot de passe -->
          <div>
            <p class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Politique de mot de passe</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-semibold text-gray-700">Longueur minimale</label>
                <div class="flex items-center gap-2">
                  <input v-model.number="securite.motDePasseMinLength" type="number" min="6" max="32"
                    class="w-20 h-[38px] px-3 text-sm rounded-lg border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500" />
                  <span class="text-sm text-gray-500">caractères</span>
                </div>
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-semibold text-gray-700">Expiration</label>
                <div class="flex items-center gap-2">
                  <input v-model.number="securite.motDePasseExpiration" type="number" min="0" max="365"
                    class="w-20 h-[38px] px-3 text-sm rounded-lg border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500" />
                  <span class="text-sm text-gray-500">jours (0 = jamais)</span>
                </div>
              </div>
            </div>
            <div class="flex flex-wrap gap-5">
              <label v-for="r in reglesMotDePasse" :key="r.key" class="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" class="w-4 h-4 accent-green-600" v-model="(securite as any)[r.key]" />
                <span class="text-sm text-gray-700">{{ r.label }}</span>
              </label>
            </div>
          </div>

          <!-- Session -->
          <div>
            <p class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Session</p>
            <div class="flex items-center gap-3 max-w-xs">
              <label class="text-sm font-semibold text-gray-700 whitespace-nowrap">Durée de session</label>
              <SelectDropdown v-model="securite.sessionDuree" :options="SESSION_OPTIONS" />
            </div>
          </div>

          <!-- 2FA -->
          <div class="flex items-center justify-between p-4 rounded-xl border border-gray-100">
            <div>
              <p class="text-sm font-semibold text-gray-800">Double authentification (2FA)</p>
              <p class="text-xs text-gray-400 mt-0.5">Exiger une vérification en deux étapes pour tous les utilisateurs</p>
            </div>
            <button
              class="relative w-10 h-6 rounded-full transition-colors flex-shrink-0"
              :class="securite.twoFactor ? 'bg-green-500' : 'bg-gray-300'"
              @click="securite.twoFactor = !securite.twoFactor"
            >
              <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform" :class="securite.twoFactor ? 'translate-x-4' : ''" />
            </button>
          </div>
        </div>
      </div>

      <!-- ══ BOUTONS ══ -->
      <div class="flex justify-end gap-3 pt-2 pb-8">
        <BaseButton variant="secondary" label="Annuler" @click="handleCancel" />
        <BaseButton variant="primary" :label="saving ? 'Enregistrement...' : 'Enregistrer les modifications'" :icon="Save" :loading="saving" size="lg" @click="handleSave" />
      </div>

    </div>

    <!-- CompteModal (composant) -->
    <CompteModal
      v-model="showCompteModal"
      :compte="editCompte"
      @save="onSaveCompte"
    />

    <!-- ConfirmModal suppression compte -->
    <ConfirmModal
      v-model="confirmDeleteCompte.show"
      variant="danger"
      title="Supprimer ce compte ?"
      message="Ce compte sera définitivement supprimé de la liste."
      confirm-label="Supprimer"
      :confirm-loading="confirmDeleteCompte.loading"
      @confirm="deleteCompte"
    />

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