<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import type { MenuItem } from '@/types/menu'

defineProps<{
  menu: MenuItem[]
  permissions: string[]
}>()

const openItems = ref<string[]>([])

const toggle = (label: string) => {
  if (openItems.value.includes(label)) {
    openItems.value = openItems.value.filter(l => l !== label)
  } else {
    openItems.value.push(label)
  }
}

const canAccess = (permission?: string) => {
  if (!permission) return true
  return permission && permission !== '' && permission !== null
}
</script>

<template>
  <aside class="w-64 bg-green-900 text-white flex flex-col">
    <!-- Logo -->
    <div class="h-20 flex items-center justify-center border-b border-green-800">
      <div class="text-center">
        <p class="text-lg font-bold">EEC</p>
        <p class="text-xs">Gestion Paroissiale</p>
      </div>
    </div>

    <!-- Menu -->
    <nav class="flex-1 px-4 py-6 space-y-2 text-sm">
      <template v-for="item in menu" :key="item.label">
        <template v-if="canAccess(item.permission)">
          <!-- Menu simple -->
          <RouterLink
            v-if="item.route && !item.children"
            :to="item.route"
            class="menu-item"
          >
            {{ item.label }}
          </RouterLink>

          <!-- Menu avec sous-menus -->
          <div v-else>
            <button
              class="menu-item w-full flex justify-between"
              @click="toggle(item.label)"
            >
              {{ item.label }}
              <span>{{ openItems.includes(item.label) ? '−' : '+' }}</span>
            </button>

            <div
              v-if="openItems.includes(item.label)"
              class="ml-4 mt-1 space-y-1"
            >
              <RouterLink
                v-for="child in item.children"
                :key="child.label"
                v-if="canAccess(child.permission)"
                :to="child.route!"
                class="submenu-item"
              >
                {{ child.label }}
              </RouterLink>
            </div>
          </div>
        </template>
      </template>
    </nav>
  </aside>
</template>

<style scoped>
.menu-item {
  @apply block px-4 py-2 rounded hover:bg-green-800 transition;
}
.submenu-item {
  @apply block px-4 py-1 rounded hover:bg-green-700 text-sm;
}
.router-link-active {
  @apply bg-green-800 font-semibold;
}
</style>
