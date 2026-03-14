<!-- src/views/MembersReport.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import PageTitle from '@/components/layout/PageTitle.vue'
import FilterBar from '@/components/ui/FilterBar.vue'
import DateRangePicker from '@/components/ui/DateRangePicker.vue'
import SelectInput from '@/components/ui/SelectInput.vue'
import type { Option } from '@/components/ui/SelectInput.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import PrimaryButton from '@/components/ui/PrimaryButton.vue'

// Types
interface Member {
  id?: number
  name: string
  gender: 'Homme' | 'Femme' | 'Autre'
  status: 'Actif' | 'Inactif' | 'En attente'
  createdAt: string
  email?: string
  phone?: string
}

// État
const startDate = ref<string>('')
const endDate = ref<string>('')

const statusOptions: Option[] = [
  { label: 'Tous', value: '' },
  { label: 'Actif', value: 'active' },
  { label: 'Inactif', value: 'inactive' },
  { label: 'En attente', value: 'pending' }
]

const defaultOption = statusOptions[0]
if (!defaultOption) {
  throw new Error('statusOptions must have at least one option')
}

const selectedStatus = ref<Option[]>([defaultOption])

const rows = ref<Member[]>([])

// Colonnes du tableau
const columns: Array<{ label: string; key: keyof Member }> = [
  { label: 'Nom', key: 'name' },
  { label: 'Sexe', key: 'gender' },
  { label: 'Statut', key: 'status' },
  { label: "Date d'inscription", key: 'createdAt' }
]

const statusValue = computed(() => {
  return selectedStatus.value[0]?.value ?? ''
})

const selectedStatusLabel = computed(() => {
  return selectedStatus.value[0]?.label ?? 'Tous'
})

const generate = async (): Promise<void> => {
  try {
    console.log('Filtres appliqués:', {
      startDate: startDate.value,
      endDate: endDate.value,
      status: statusValue.value
    })
    
    rows.value = [
      {
        name: 'Jean Mbarga',
        gender: 'Homme',
        status: 'Actif',
        createdAt: '2024-03-10'
      },
      {
        name: 'Marie Claire',
        gender: 'Femme',
        status: 'Actif',
        createdAt: '2024-03-12'
      },
      {
        name: 'Pierre Ngono',
        gender: 'Homme',
        status: 'Inactif',
        createdAt: '2024-02-15'
      }
    ]
  } catch (error) {
    console.error('Erreur lors de la génération:', error)
  }
}

const reset = (): void => {
  rows.value = []
  startDate.value = ''
  endDate.value = ''
  const defaultOpt = statusOptions[0]
  if (defaultOpt) {
    selectedStatus.value = [defaultOpt]
  }
}
const exportPdf = (): void => {
  if (rows.value.length === 0) {
    alert('Aucune donnée à exporter')
    return
  }
  alert('Génération PDF - À implémenter')
}

const formattedRows = computed(() => {
  return rows.value.map(row => ({
    ...row,
    _rowClass: row.status === 'Inactif' ? 'bg-red-50 dark:bg-red-900/10' : '',
    createdAt: new Date(row.createdAt).toLocaleDateString('fr-FR')
  }))
})
</script>

<template>
  <PageTitle
    title="Rapport des membres"
    subtitle="Filtrer et générer le rapport"
  />

  <FilterBar 
    @apply="generate" 
    @reset="reset" 
  >
    <DateRangePicker
      label="Période d'inscription"
      :start-date="startDate"
      :end-date="endDate"
      @update:startDate="startDate = $event"
      @update:endDate="endDate = $event"
      placeholder="Sélectionner une période"
    />

    <SelectInput
      v-model="selectedStatus"
      :options="statusOptions"
      label="Statut"
      placeholder="Filtrer par statut"
      :multiple="false"
      :clearable="true"
    />
  </FilterBar>

  <!-- Résumé des filtres -->
  <div v-if="startDate || endDate || statusValue" class="mt-4 text-sm text-gray-600 dark:text-slate-400">
    Filtres actifs :
    <span v-if="startDate || endDate" class="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded">
      📅 {{ startDate || '...' }} → {{ endDate || '...' }}
    </span>
    <span v-if="statusValue" class="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded">
      🏷️ {{ selectedStatusLabel }}
    </span>
  </div>

  <!-- Tableau des résultats -->
  <div class="mt-6">
    <div v-if="rows.length === 0" class="text-center py-12 text-gray-500 dark:text-slate-400">
      Aucune donnée. Cliquez sur "Appliquer" pour générer le rapport.
    </div>

    <BaseTable
      v-else
      :columns="columns"
      :data="formattedRows"
      :itemsPerPage="10"
      :showPagination="true"
      class="mb-4"
    />

    <!-- Actions -->
    <div v-if="rows.length" class="mt-4 flex gap-3">
      <PrimaryButton
        label="Exporter en PDF"
        @click="exportPdf"
        :disabled="rows.length === 0"
      />
      
      <button 
        @click="reset"
        class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
      >
        Réinitialiser
      </button>
    </div>
  </div>
</template>