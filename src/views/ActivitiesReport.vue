<script setup lang="ts">
import { ref } from 'vue'
import PageTitle from '@/components/layout/PageTitle.vue'
import FilterBar from '@/components/ui/FilterBar.vue'
import DateRangePicker from '@/components/ui/DateRangePicker.vue'
import BaseTable from '@/components/ui/BaseTable.vue'

const startDate = ref('')
const endDate = ref('')
const rows = ref<any[]>([])

const columns = [
  { label: 'Activité', key: 'name' },
  { label: 'Type', key: 'type' },
  { label: 'Date', key: 'date' }
]

const generate = () => {
  rows.value = [
    { name: 'Culte dominical', type: 'Culte', date: '2025-02-02' }
  ]
}
</script>

<template>
  <PageTitle title="Rapport des activités" />

  <FilterBar @apply="generate">
    <DateRangePicker
      label="Période"
      :start-date="startDate"
      :end-date="endDate"
      @update:startDate="startDate = $event"
      @update:endDate="endDate = $event"
    />
  </FilterBar>

  <div class="mt-6">
    <BaseTable :columns="columns" :rows="rows" />
  </div>
</template>
