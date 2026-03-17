<script setup lang="ts">
import { reactive, watch, computed } from 'vue'
import { CreditCard, Save, X } from 'lucide-vue-next'
import SelectDropdown from '@/components/ui/SelectInput.vue'

export interface Compte {
  id: number
  type: 'BANCAIRE' | 'MOBILE_MONEY'
  operateur: string
  nom: string
  numero: string
  titulaire: string
  actif: boolean
}

const props = defineProps<{
  modelValue: boolean
  compte?: Compte | null   // null = création, Compte = édition
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'save': [compte: Omit<Compte, 'id'>]
}>()

const OPERATEURS_BANQUE = [
  { label: 'Afriland First Bank', value: 'Afriland First Bank' },
  { label: 'SCB Cameroun',        value: 'SCB Cameroun' },
  { label: 'Société Générale',    value: 'Société Générale' },
  { label: 'UBA Cameroun',        value: 'UBA Cameroun' },
  { label: 'BICEC',               value: 'BICEC' },
  { label: 'Autre',               value: 'Autre' },
]
const OPERATEURS_MM = [
  { label: 'MTN Mobile Money', value: 'MTN' },
  { label: 'Orange Money',     value: 'Orange' },
  { label: 'Express Union',    value: 'Express Union' },
  { label: 'CamPost',          value: 'CamPost' },
]

const form = reactive<Omit<Compte, 'id'>>({
  type: 'BANCAIRE', operateur: '', nom: '', numero: '', titulaire: '', actif: true,
})

const isEdit = computed(() => !!props.compte)
const operateursOptions = computed(() =>
  form.type === 'BANCAIRE' ? OPERATEURS_BANQUE : OPERATEURS_MM
)

// Pré-remplir en mode édition
watch(() => props.modelValue, (open) => {
  if (!open) return
  if (props.compte) {
    Object.assign(form, {
      type: props.compte.type, operateur: props.compte.operateur,
      nom: props.compte.nom, numero: props.compte.numero,
      titulaire: props.compte.titulaire, actif: props.compte.actif,
    })
  } else {
    Object.assign(form, { type: props.compte === undefined ? 'BANCAIRE' : (form.type), operateur: '', nom: '', numero: '', titulaire: '', actif: true })
  }
})

// Réinitialiser opérateur si on change de type
watch(() => form.type, () => { form.operateur = '' })

function close() { emit('update:modelValue', false) }

function handleSave() {
  if (!form.operateur || !form.numero || !form.titulaire) return
  emit('save', { ...form })
  close()
}
</script>

<template>
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
        v-if="modelValue"
        class="fixed inset-0 z-[9998] flex items-center justify-center p-4"
        style="background: rgba(0,0,0,0.45);"
        @mousedown.self="close"
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
            v-if="modelValue"
            class="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700"
            role="dialog"
            aria-modal="true"
          >
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-slate-700">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CreditCard class="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p class="text-sm font-bold text-gray-900 dark:text-white">
                    {{ isEdit ? 'Modifier le compte' : 'Nouveau compte' }}
                  </p>
                  <p class="text-xs text-gray-400 mt-0.5">
                    {{ form.type === 'BANCAIRE' ? 'Compte bancaire' : 'Mobile Money' }}
                  </p>
                </div>
              </div>
              <button
                class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                @click="close"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Corps -->
            <div class="p-6 space-y-4">

              <!-- Type (création uniquement) -->
              <div v-if="!isEdit" class="flex gap-2">
                <button
                  type="button"
                  class="flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all"
                  :class="form.type === 'BANCAIRE'
                    ? 'border-green-400 bg-green-50 text-green-700 dark:bg-green-900/20 dark:border-green-600 dark:text-green-400'
                    : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-500'"
                  @click="form.type = 'BANCAIRE'"
                >
                  Bancaire
                </button>
                <button
                  type="button"
                  class="flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all"
                  :class="form.type === 'MOBILE_MONEY'
                    ? 'border-green-400 bg-green-50 text-green-700 dark:bg-green-900/20 dark:border-green-600 dark:text-green-400'
                    : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-500'"
                  @click="form.type = 'MOBILE_MONEY'"
                >
                  Mobile Money
                </button>
              </div>

              <!-- Opérateur -->
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-semibold text-gray-700 dark:text-slate-300">
                  {{ form.type === 'BANCAIRE' ? 'Banque' : 'Opérateur' }}
                  <span class="text-red-500">*</span>
                </label>
                <SelectDropdown
                  v-model="form.operateur"
                  :options="operateursOptions"
                  placeholder="Choisir..."
                />
              </div>

              <!-- Libellé -->
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Libellé du compte
                </label>
                <input
                  v-model="form.nom"
                  type="text"
                  placeholder="Ex: Compte principal"
                  class="h-[42px] px-3 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <!-- Numéro -->
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-semibold text-gray-700 dark:text-slate-300">
                  {{ form.type === 'BANCAIRE' ? 'Numéro de compte' : 'Numéro de téléphone' }}
                  <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.numero"
                  type="text"
                  :placeholder="form.type === 'BANCAIRE' ? 'Ex: 12345678901' : 'Ex: 677 000 001'"
                  class="h-[42px] px-3 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <!-- Titulaire -->
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Titulaire <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.titulaire"
                  type="text"
                  placeholder="Nom du titulaire"
                  class="h-[42px] px-3 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <!-- Actif -->
              <div class="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 dark:border-slate-700">
                <div>
                  <p class="text-sm font-medium text-gray-800 dark:text-white">Compte actif</p>
                  <p class="text-xs text-gray-400 mt-0.5">Visible dans les modules de l'application</p>
                </div>
                <button
                  class="relative w-10 h-6 rounded-full transition-colors flex-shrink-0"
                  :class="form.actif ? 'bg-green-500' : 'bg-gray-300 dark:bg-slate-600'"
                  @click="form.actif = !form.actif"
                >
                  <span
                    class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                    :class="form.actif ? 'translate-x-4' : ''"
                  />
                </button>
              </div>
            </div>

            <!-- Footer -->
            <div class="px-6 pb-6 flex justify-end gap-3">
              <button
                class="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                @click="close"
              >
                Annuler
              </button>
              <button
                class="px-4 py-2 rounded-xl text-sm font-semibold bg-green-600 hover:bg-green-700 text-white transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="!form.operateur || !form.numero || !form.titulaire"
                @click="handleSave"
              >
                <Save class="w-4 h-4" />
                {{ isEdit ? 'Mettre à jour' : 'Ajouter' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>