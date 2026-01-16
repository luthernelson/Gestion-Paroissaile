<script setup lang="ts">
interface Column {
  label: string
  key: string
}

defineProps<{
  columns: Column[]
  rows: Record<string, string | number | boolean>[]
}>()
</script>

<template>
  <div class="overflow-x-auto border rounded bg-white">
    <table class="min-w-full text-sm">
      <thead class="bg-gray-100">
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            class="px-4 py-2 text-left font-medium text-gray-700"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, index) in rows"
          :key="index"
          class="border-t hover:bg-gray-50"
        >
          <td
            v-for="col in columns"
            :key="col.key"
            class="px-4 py-2"
          >
            {{ row[col.key] }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
