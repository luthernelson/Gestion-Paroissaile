<script setup lang="ts">
import { ref } from 'vue'
import PageTitle from '@/components/layout/PageTitle.vue'
import FilterBar from '@/components/ui/FilterBar.vue'
import DateRangePicker from '@/components/ui/DateRangePicker.vue'
import SelectInput from '@/components/ui/SelectInput.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import PrimaryButton from '@/components/ui/PrimaryButton.vue'

const startDate = ref('')
const endDate = ref('')
const status = ref('')

const rows = ref<any[]>([])

const columns = [
  { label: 'Nom', key: 'name' },
  { label: 'Sexe', key: 'gender' },
  { label: 'Statut', key: 'status' },
  { label: 'Date inscription', key: 'createdAt' }
]

const generate = () => {
  // Appel API réel plus tard
  rows.value = [
    {
      name: 'Jean Mbarga',
      gender: 'Homme',
      status: 'Actif',
      createdAt: '2024-03-10'
    }
  ]
}

const exportPdf = () => {
  alert('Génération PDF')
}
</script>

<template>
  <PageTitle
    title="Rapport des membres"
    subtitle="Filtrer et générer le rapport"
  />

  <FilterBar @apply="generate" @reset="rows = []">
    <DateRangePicker
      label="Période"
      :start-date="startDate"
      :end-date="endDate"
      @update:startDate="startDate = $event"
      @update:endDate="endDate = $event"
    />

    <SelectInput
      label="Statut"
      v-model="status"
      :options="[
        { label: 'Tous', value: '' },
        { label: 'Actif', value: 'active' },
        { label: 'Inactif', value: 'inactive' }
      ]"
    />
  </FilterBar>

  <div class="mt-6">
    <BaseTable
      v-if="rows.length"
      :columns="columns"
      :rows="rows"
    />

    <div class="mt-4" v-if="rows.length">
      <PrimaryButton
        label="Exporter en PDF"
        @click="exportPdf"
      />
    </div>
  </div>
</template>
