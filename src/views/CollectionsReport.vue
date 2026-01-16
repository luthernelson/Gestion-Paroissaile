<script setup lang="ts">
import { ref } from 'vue'
import PageTitle from '@/components/layout/PageTitle.vue'
import FilterBar from '@/components/ui/FilterBar.vue'
import DateRangePicker from '@/components/ui/DateRangePicker.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import StatCard from '@/components/ui/StartCard.vue'

const startDate = ref('')
const endDate = ref('')
const total = ref(0)

const rows = ref<any[]>([])

const columns = [
  { label: 'Date', key: 'date' },
  { label: 'Type', key: 'type' },
  { label: 'Montant', key: 'amount' }
]

const generate = () => {
  rows.value = [
    { date: '2025-01-10', type: 'Offrande', amount: 50000 }
  ]
  total.value = 50000
}
</script>

<template>
  <PageTitle title="Rapport des collectes" />

  <FilterBar @apply="generate">
    <DateRangePicker
      label="Période"
      :start-date="startDate"
      :end-date="endDate"
      @update:startDate="startDate = $event"
      @update:endDate="endDate = $event"
    />
  </FilterBar>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
    <StatCard label="Total collecté" :value="total + ' FCFA'" />
  </div>

  <div class="mt-6">
    <BaseTable :columns="columns" :rows="rows" />
  </div>
</template>
