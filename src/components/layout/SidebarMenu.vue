<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import type { MenuItem } from '@/types/menu'
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Wallet,
  UsersRound,
  FileBarChart2,
  Settings,
  ChevronRight,
  X,
  Menu
} from 'lucide-vue-next'

defineProps<{
  menu: MenuItem[]
  permissions: string[]
}>()

const emit = defineEmits<{
  (e: 'item-click'): void
}>()

// Un seul item ouvert à la fois
const openItem = ref<string | null>(null)

const toggle = (label: string) => {
  openItem.value = openItem.value === label ? null : label
}

const canAccess = (permission?: string | null) => {
  if (!permission) return true
  return permission !== ''
}

const handleItemClick = () => emit('item-click')

// Map label → composant Lucide
const iconMap: Record<string, unknown> = {
  dashboard:     LayoutDashboard,
  membres:       Users,
  cultes:        CalendarDays,
  collectes:     Wallet,
  groupes:       UsersRound,
  rapports:      FileBarChart2,
  configuration: Settings,
}
</script>

<template>
  <aside class="w-62 md:w-68 bg-gray-50 border-r border-gray-200 flex flex-col h-full shadow-lg lg:shadow-sm">

    <!-- Header mobile -->
    <div class="lg:hidden flex items-center justify-between p-4 border-b border-gray-200 bg-white">
      <span class="font-semibold text-gray-800 text-base">Menu</span>
      <button @click="handleItemClick" class="p-2 hover:bg-gray-100 rounded transition">
        <X class="h-5 w-5 text-gray-600" />
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 py-3 overflow-y-auto">
      <template v-for="item in menu" :key="item.label">
        <template v-if="canAccess(item.permission)">

          <!-- Lien simple (sans enfants) -->
          <RouterLink
            v-if="item.route && !item.children"
            :to="item.route"
            class="menu-item group"
            active-class="menu-item--active"
            @click="handleItemClick"
          >
            <span class="active-bar" />
            <component
              :is="iconMap[item.icon ?? ''] ?? LayoutDashboard"
              class="menu-icon-svg"
            />
            <span class="menu-text">{{ item.label }}</span>
          </RouterLink>

          <!-- Lien avec sous-menus -->
          <div v-else>
            <button
              class="menu-item w-full group"
              :class="{ 'menu-item--active': openItem === item.label }"
              @click="toggle(item.label)"
            >
              <span class="active-bar" />
              <component
                :is="iconMap[item.icon ?? ''] ?? LayoutDashboard"
                class="menu-icon-svg"
              />
              <span class="menu-text flex-1 text-left">{{ item.label }}</span>
              <ChevronRight
                class="h-4 w-4 text-gray-400 transition-transform duration-200 flex-shrink-0"
                :class="openItem === item.label ? 'rotate-90' : ''"
              />
            </button>

            <!-- Sous-menus animés -->
            <Transition
              enter-active-class="transition-all duration-200 ease-out"
              enter-from-class="max-h-0 opacity-0"
              enter-to-class="max-h-96 opacity-100"
              leave-active-class="transition-all duration-150 ease-in"
              leave-from-class="max-h-96 opacity-100"
              leave-to-class="max-h-0 opacity-0"
            >
              <div
                v-if="openItem === item.label"
                class="submenu-container overflow-hidden"
              >
                <template v-for="child in item.children" :key="child.label">
                  <RouterLink
                    v-if="canAccess(child.permission)"
                    :to="child.route!"
                    class="submenu-item group"
                    active-class="submenu-item--active"
                    @click="handleItemClick"
                  >
                    <span class="submenu-dot" />
                    {{ child.label }}
                  </RouterLink>
                </template>
              </div>
            </Transition>
          </div>

        </template>
      </template>
    </nav>
  </aside>
</template>

<style scoped>
@reference "@/assets/main.css";

/* ── Item principal ── */
.menu-item {
  @apply relative flex items-center gap-3 px-4 py-3 text-gray-600
         hover:bg-green-50 hover:text-green-800 transition-colors duration-150 cursor-pointer;
}

/* ── Barre latérale verte ── */
.active-bar {
  @apply absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-transparent transition-all duration-200;
}

.menu-item:hover .active-bar {
  @apply bg-green-300;
}

/* ── État actif ── */
.menu-item--active {
  @apply bg-green-50 text-green-800 font-semibold;
}

.menu-item--active .active-bar {
  @apply bg-green-600 opacity-100;
}

.menu-item--active .menu-icon-svg {
  @apply text-green-700;
}

/* ── Icônes Lucide ── */
.menu-icon-svg {
  @apply h-5 w-5 text-green-600 group-hover:text-green-800 flex-shrink-0 transition-colors;
}

/* ── Texte du menu (plus grand) ── */
.menu-text {
  @apply text-base font-medium;
}

/* ── Sous-menus ── */
.submenu-container {
  @apply bg-white border-l-2 border-green-200 ml-6 my-0.5;
}

.submenu-item {
  @apply flex items-center gap-2.5 pl-4 pr-4 py-2.5 text-sm text-gray-500
         hover:text-green-700 hover:bg-green-50 transition-colors duration-150;
}

.submenu-dot {
  @apply w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0
         group-hover:bg-green-500 transition-colors;
}

/* ── Sous-menu actif : fond légèrement vert uniquement ── */
.submenu-item--active {
  @apply bg-green-50 text-green-600;
}

.submenu-item--active .submenu-dot {
  @apply bg-green-400;
}
</style>