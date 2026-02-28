<script setup lang="ts">
import { computed, useSlots } from 'vue'
import BaseSkeleton from './BaseSkeleton.vue'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Pencil, Trash2, Eye, MoreHorizontal, Printer, Copy } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  columns: Array<{
    key: string
    label: string
    width?: string
    minWidth?: string
    align?: 'left' | 'center' | 'right'
    format?: (value: any, item: any) => string
  }>
  data: Array<Record<string, any>>
  loading?: boolean
  actions?: Array<{
    icon: string
    label: string
    action: (item: any, event?: Event) => void
    variant?: 'default' | 'danger' | 'info' | 'warning'
    condition?: (item: any) => boolean
  }>
  formatCell?: (key: string, value: any, item: any) => string
  rowClass?: (item: any) => string | Record<string, boolean>
  showScrollbar?: boolean
  maxHeight?: string
  truncateCells?: boolean
  // Pagination
  pagination?: boolean
  currentPage?: number
  totalPages?: number
  totalItems?: number
  itemsPerPage?: number
  itemsPerPageOptions?: number[]
  allOptionValue?: number
  allOptionLabel?: string
}>(), {
  loading: false,
  showScrollbar: true,
  maxHeight: '600px',
  truncateCells: true,
  pagination: true,
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 10,
  itemsPerPageOptions: () => [10, 25, 50, 100],
  allOptionLabel: 'Tous',
})

const emit = defineEmits<{
  (e: 'row-click', item: any): void
  (e: 'update:currentPage', page: number): void
  (e: 'update:itemsPerPage', size: number): void
}>()

const slots = useSlots()

const ICONS: Record<string, any> = {
  edit: Pencil, pencil: Pencil,
  delete: Trash2, remove: Trash2, trash: Trash2,
  view: Eye, visibility: Eye, eye: Eye,
  more: MoreHorizontal, more_horiz: MoreHorizontal,
  print: Printer,
  content_copy: Copy, copy: Copy,
}

function getIconComp(name?: string) {
  return ICONS[name?.toLowerCase?.().trim() ?? ''] ?? MoreHorizontal
}

function actionClass(variant?: string, icon?: string) {
  const ic = icon?.toLowerCase?.() ?? ''
  if (variant === 'danger' || ic.includes('delete') || ic.includes('trash') || ic.includes('remove'))
    return 'hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
  if (ic.includes('edit') || ic.includes('pencil'))
    return 'hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
  if (ic.includes('view') || ic.includes('eye') || ic.includes('visibility'))
    return 'hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20'
  if (ic.includes('print'))
    return 'hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20'
  return 'hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
}

const visiblePages = computed(() => {
  const total = props.totalPages
  const current = props.currentPage
  const max = 5
  if (total <= max) return Array.from({ length: total }, (_, i) => i + 1)
  let start = Math.max(1, current - 2)
  let end = Math.min(total, start + max - 1)
  if (end - start < max - 1) start = Math.max(1, end - max + 1)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

const rangeStart = computed(() => props.totalItems > 0 ? (props.currentPage - 1) * props.itemsPerPage + 1 : 0)
const rangeEnd   = computed(() => Math.min(props.currentPage * props.itemsPerPage, props.totalItems))
const hasActions = computed(() => (props.actions && props.actions.length > 0) || !!slots.actions)
const skeletonRows = 5
</script>

<template>
  <div class="flex flex-col w-full min-w-0 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">

    <!-- ── Tableau ── -->
    <div
      :class="showScrollbar ? 'custom-scrollbar' : ''"
      :style="{ maxHeight, overflowY: 'auto', overflowX: 'auto' }"
    >
      <!-- Desktop -->
      <table class="w-full text-sm text-left hidden md:table" style="table-layout: fixed">
        <!-- En-tête : jamais de skeleton -->
        <thead class="sticky top-0 z-20 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
          <tr>
            <th
              v-for="col in columns" :key="col.key"
              class="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 whitespace-nowrap"
              :class="col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'"
              :style="{ width: col.width, minWidth: col.minWidth }"
            >
              <slot :name="`head-${col.key}`" :column="col">{{ col.label }}</slot>
            </th>
            <th v-if="hasActions" class="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 text-right" style="width: 120px">
              Actions
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-100 dark:divide-slate-700/60">
          <!-- Skeleton rows -->
          <template v-if="loading">
            <tr v-for="i in skeletonRows" :key="`sk-${i}`" class="bg-white dark:bg-slate-900">
              <td v-for="col in columns" :key="col.key" class="px-5 py-4" :style="{ width: col.width }">
                <BaseSkeleton :height="'18px'" :width="i % 3 === 0 ? '60%' : i % 2 === 0 ? '80%' : '100%'" />
              </td>
              <td v-if="hasActions" class="px-5 py-4">
                <div class="flex justify-end gap-2">
                  <BaseSkeleton height="32px" width="32px" rounded="lg" />
                  <BaseSkeleton height="32px" width="32px" rounded="lg" />
                </div>
              </td>
            </tr>
          </template>

          <!-- Données -->
          <template v-else-if="data && data.length">
            <tr
              v-for="(item, idx) in data" :key="idx"
              class="bg-white dark:bg-slate-900 hover:bg-green-50/50 dark:hover:bg-slate-800 transition-colors duration-100"
              :class="[rowClass ? rowClass(item) : '', { 'cursor-pointer': $attrs.onRowClick }]"
              @click="emit('row-click', item)"
            >
              <td
                v-for="col in columns" :key="col.key"
                class="px-5 py-3.5 text-gray-800 dark:text-slate-200 min-w-0"
                :class="col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'"
                :style="{ width: col.width, minWidth: col.minWidth }"
              >
                <slot :name="`cell-${col.key}`" :item="item" :value="item[col.key]">
                  <div v-if="col.format" :class="truncateCells ? 'truncate' : ''">
                    {{ col.format(item[col.key], item) }}
                  </div>
                  <div v-else-if="formatCell" v-html="formatCell(col.key, item[col.key], item)" :class="truncateCells ? 'truncate' : ''" />
                  <span v-else :class="truncateCells ? 'block truncate' : ''">{{ item[col.key] }}</span>
                </slot>
              </td>

              <!-- Actions -->
              <td v-if="hasActions" class="px-5 py-3.5 text-right">
                <div class="flex justify-end items-center gap-1">
                  <template v-for="(action, ai) in actions" :key="ai">
                    <button
                      v-if="!action.condition || action.condition(item)"
                      class="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 transition-colors duration-150"
                      :class="actionClass(action.variant, action.icon)"
                      :title="action.label"
                      @click.stop="action.action(item, $event)"
                    >
                      <component :is="getIconComp(action.icon)" class="w-4 h-4" />
                    </button>
                  </template>
                  <slot name="actions" :item="item" />
                </div>
              </td>
            </tr>
          </template>

          <!-- Vide -->
          <tr v-else>
            <td :colspan="columns.length + (hasActions ? 1 : 0)" class="px-5 py-12 text-center text-gray-400 dark:text-slate-500">
              <slot name="empty">
                <div class="flex flex-col items-center gap-2">
                  <svg class="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <span class="text-sm">Aucune donnée disponible</span>
                </div>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Mobile cards -->
      <div class="md:hidden divide-y divide-gray-100 dark:divide-slate-700">
        <template v-if="loading">
          <div v-for="i in 3" :key="`sk-m-${i}`" class="p-4 space-y-3">
            <BaseSkeleton height="16px" width="60%" />
            <BaseSkeleton height="14px" width="80%" />
            <BaseSkeleton height="14px" width="40%" />
          </div>
        </template>
        <template v-else-if="data && data.length">
          <div v-if="slots['mobile-item']">
            <slot v-for="(item, idx) in data" :key="idx" name="mobile-item" :item="item" :index="idx" />
          </div>
          <div v-else v-for="(item, idx) in data" :key="`m-${idx}`" class="p-4 space-y-2 bg-white dark:bg-slate-900">
            <div v-for="col in columns" :key="col.key" class="flex justify-between items-center py-1 border-b border-gray-50 dark:border-slate-800 last:border-0">
              <span class="text-xs font-bold text-gray-400 uppercase">{{ col.label }}</span>
              <span class="text-sm text-gray-800 dark:text-slate-200 text-right max-w-[60%] truncate">
                <slot :name="`cell-${col.key}`" :item="item" :value="item[col.key]">
                  <span v-if="col.format">{{ col.format(item[col.key], item) }}</span>
                  <span v-else-if="formatCell" v-html="formatCell(col.key, item[col.key], item)" />
                  <span v-else>{{ item[col.key] }}</span>
                </slot>
              </span>
            </div>
            <div v-if="hasActions" class="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-slate-700">
              <template v-for="(action, ai) in actions" :key="ai">
                <button
                  v-if="!action.condition || action.condition(item)"
                  class="p-1.5 rounded-lg text-gray-400 transition-colors"
                  :class="actionClass(action.variant, action.icon)"
                  @click.stop="action.action(item, $event)" :title="action.label"
                >
                  <component :is="getIconComp(action.icon)" class="w-4 h-4" />
                </button>
              </template>
              <slot name="actions" :item="item" />
            </div>
          </div>
        </template>
        <div v-else class="p-8 text-center text-gray-400 dark:text-slate-500 text-sm">
          <slot name="empty">Aucune donnée disponible</slot>
        </div>
      </div>
    </div>

    <!-- ── Pagination ── -->
    <div v-if="pagination && !loading" class="border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
      <!-- Info + items par page -->
      <div class="flex items-center gap-4">
        <p class="text-sm text-gray-500 dark:text-slate-400">
          <span class="font-semibold text-gray-700 dark:text-slate-200">{{ rangeStart }}–{{ rangeEnd }}</span>
          sur
          <span class="font-semibold text-gray-700 dark:text-slate-200">{{ totalItems }}</span>
        </p>
        <select
          :value="itemsPerPage"
          @change="emit('update:itemsPerPage', Number(($event.target as HTMLSelectElement).value))"
          class="text-sm border border-gray-300 dark:border-slate-600 rounded-lg px-2 py-1 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
        >
          <option v-for="opt in itemsPerPageOptions" :key="opt" :value="opt">
            {{ allOptionValue !== undefined && opt === allOptionValue ? allOptionLabel : opt + ' / page' }}
          </option>
        </select>
      </div>

      <!-- Boutons pages -->
      <nav class="flex items-center gap-1">
        <button @click="emit('update:currentPage', 1)" :disabled="currentPage === 1" class="page-btn">
          <ChevronsLeft class="h-4 w-4" />
        </button>
        <button @click="emit('update:currentPage', currentPage - 1)" :disabled="currentPage === 1" class="page-btn">
          <ChevronLeft class="h-4 w-4" />
        </button>
        <button
          v-for="p in visiblePages" :key="p"
          @click="emit('update:currentPage', p)"
          class="page-btn min-w-[36px]"
          :class="p === currentPage ? 'page-btn--active' : ''"
        >{{ p }}</button>
        <button @click="emit('update:currentPage', currentPage + 1)" :disabled="currentPage === totalPages" class="page-btn">
          <ChevronRight class="h-4 w-4" />
        </button>
        <button @click="emit('update:currentPage', totalPages)" :disabled="currentPage === totalPages" class="page-btn">
          <ChevronsRight class="h-4 w-4" />
        </button>
      </nav>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.page-btn {
  @apply inline-flex items-center justify-center h-9 px-2 rounded-lg text-sm font-medium
         text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-600
         bg-white dark:bg-slate-800
         hover:bg-green-50 hover:text-green-700 hover:border-green-300
         dark:hover:bg-green-900/20 dark:hover:text-green-400
         disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white
         transition-colors duration-150;
}
.page-btn--active {
  @apply bg-green-600 text-white border-green-600 hover:bg-green-600 hover:text-white hover:border-green-600 font-bold;
}

.custom-scrollbar { scrollbar-width: thin; scrollbar-color: #16a34a #f0fdf4; }
.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f0fdf4; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #16a34a; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #15803d; }
</style>