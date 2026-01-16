<script setup lang="ts">
defineProps<{
  username: string
}>()

const emit = defineEmits<{
  (e: 'logout'): void
}>()
</script>

<template>
  <header class="h-16 bg-white border-b flex items-center justify-between px-6">
    <h1 class="text-lg font-semibold text-gray-800">
      Application de Gestion Paroissiale
    </h1>

    <div class="flex items-center gap-4">
      <span class="text-sm text-gray-700">{{ username }}</span>

      <button
        @click="emit('logout')"
        class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
      >
        Déconnexion
      </button>
    </div>
  </header>
</template>
