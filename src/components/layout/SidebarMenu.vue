<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import type { MenuItem } from '@/types/menu'

defineProps<{
  menu: MenuItem[]
  permissions: string[]
}>()

const emit = defineEmits<{
  (e: 'item-click'): void
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

const handleItemClick = () => {
  emit('item-click')
}
</script>

<template>
  <aside class="w-64 md:w-72 lg:w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full shadow-lg lg:shadow-sm">
    <!-- Header mobile avec fermeture -->
    <div class="lg:hidden flex items-center justify-between p-4 border-b border-gray-200 bg-white">
      <span class="font-semibold text-gray-800">Menu</span>
      <button
        @click="handleItemClick"
        class="p-2 hover:bg-gray-100 rounded transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Menu -->
    <nav class="flex-1 py-2 md:py-4 text-sm overflow-y-auto">
      <template v-for="item in menu" :key="item.label">
        <template v-if="canAccess(item.permission)">
          <!-- Menu simple -->
          <RouterLink
            v-if="item.route && !item.children"
            :to="item.route"
            class="menu-item group"
            @click="handleItemClick"
          >
            <span class="menu-icon">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <!-- Icône dynamique selon le menu -->
                <template v-if="item.label === 'Tableau de bord'">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </template>
                <template v-else-if="item.label === 'Membres'">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </template>
                <template v-else-if="item.label === 'Cultes & activités'">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </template>
                <template v-else-if="item.label === 'Collectes'">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </template>
                <template v-else-if="item.label === 'Groupes'">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </template>
                <template v-else-if="item.label === 'Rapports'">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </template>
                <template v-else-if="item.label === 'Configuration'">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </template>
                <template v-else>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </template>
              </svg>
            </span>
            <span class="menu-text">{{ item.label }}</span>
          </RouterLink>

          <!-- Menu avec sous-menus -->
          <div v-else>
            <button
              class="menu-item w-full group"
              @click="toggle(item.label)"
            >
              <span class="menu-icon">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </span>
              <span class="menu-text flex-1 text-left">{{ item.label }}</span>
              <span class="text-xs text-gray-400">
                {{ openItems.includes(item.label) ? '▼' : '▶' }}
              </span>
            </button>

            <div
              v-if="openItems.includes(item.label)"
              class="submenu-container"
            >
              <RouterLink
                v-for="child in item.children"
                :key="child.label"
                v-if="canAccess(child.permission)"
                :to="child.route!"
                class="submenu-item"
                @click="handleItemClick"
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
@reference "@/assets/main.css";
.menu-item {
  @apply flex items-center gap-3 px-4 md:px-5 py-2.5 md:py-3 text-gray-700 hover:bg-gray-100 transition cursor-pointer;
}

.menu-icon {
  @apply text-gray-500 group-hover:text-green-700 flex-shrink-0;
}

.menu-text {
  @apply text-sm font-medium;
}

.menu-item.router-link-active {
  @apply bg-gray-100 text-green-700;
}

.menu-item.router-link-active .menu-icon {
  @apply text-green-700;
}

.submenu-container {
  @apply bg-gray-100 py-1;
}

.submenu-item {
  @apply block px-4 md:px-5 pl-12 md:pl-14 py-2 text-sm text-gray-600 hover:bg-gray-200 hover:text-green-700 transition;
}

.submenu-item.router-link-active {
  @apply text-green-700 font-medium;
}
</style>