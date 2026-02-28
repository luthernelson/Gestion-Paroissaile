<script setup lang="ts">
import { ref } from 'vue'
import HeaderBar from './HeaderBar.vue'
import SidebarMenu from './SidebarMenu.vue'
import type { MenuItem } from '@/types/menu'
import menuData from '@/assets/Menu/Menu.json'

const menu = menuData as MenuItem[]

defineProps<{
  username: string
  permissions: string[]
}>()

const emit = defineEmits<{
  (e: 'logout'): void
}>()

const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}
</script>

<template>
  <div class="flex flex-col h-screen">
    <!-- Header -->
    <HeaderBar
      :username="username"
      @logout="emit('logout')"
      @toggle-menu="toggleMobileMenu"
    />

    <!-- Contenu principal avec sidebar et contenu -->
    <div class="flex flex-1 overflow-hidden bg-gray-100">

      <!-- Overlay mobile -->
      <Transition
        enter-active-class="transition-opacity duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isMobileMenuOpen"
          class="fixed inset-0 bg-black/50 z-40 lg:hidden"
          @click="closeMobileMenu"
        />
      </Transition>

      <!-- Sidebar -->
      <div
        :class="[
          'fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:transform-none',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        ]"
      >
        <SidebarMenu
          :menu="menu"
          :permissions="permissions"
          @item-click="closeMobileMenu"
        />
      </div>

      <!-- Zone de contenu principale -->
      <main class="flex-1 overflow-y-auto p-4 md:p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>