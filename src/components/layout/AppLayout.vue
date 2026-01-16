<script setup lang="ts">
import HeaderBar from './HeaderBar.vue'
import SidebarMenu from './SidebarMenu.vue'
import type { MenuItem } from '@/types/menu'

defineProps<{
  menu: MenuItem[]
  username: string
  permissions: string[]
}>()

const emit = defineEmits<{
  (e: 'logout'): void
}>()
</script>

<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar -->
    <SidebarMenu
      :menu="menu"
      :permissions="permissions"
    />

    <!-- Main content -->
    <div class="flex flex-col flex-1">
      <HeaderBar
        :username="username"
        @logout="emit('logout')"
      />

      <main class="flex-1 overflow-y-auto p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>
