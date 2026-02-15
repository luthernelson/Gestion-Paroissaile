<script setup lang="ts">
defineProps<{
  username: string
}>()

const emit = defineEmits<{
  (e: 'logout'): void
  (e: 'toggle-menu'): void
}>()
</script>

<template>
  <header class="h-14 md:h-16 bg-gradient-to-r from-green-800 via-green-700 to-yellow-600 text-white flex items-center justify-between px-4 md:px-6 shadow-lg">
    <!-- Left: Hamburger (mobile) + Logo + Titre -->
    <div class="flex items-center gap-2 md:gap-3">
      <!-- Hamburger menu pour mobile -->
      <button
        @click="emit('toggle-menu')"
        class="lg:hidden p-1 hover:bg-white/10 rounded transition"
        aria-label="Toggle menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <!-- Logo -->
      <div class="w-8 h-8 md:w-9 md:h-9 bg-white rounded-full flex items-center justify-center p-1.5 shadow-md flex-shrink-0">
        <img 
          src="@/assets/Files/logo-eec.png" 
          alt="EEC Logo" 
          class="w-full h-full object-contain"
        />
      </div>

      <!-- Titre - Caché sur très petits écrans -->
      <span class="hidden sm:block text-xs md:text-sm font-bold tracking-wide">EEC Gestion Paroissiale</span>
    </div>

    <!-- Right: Info utilisateur -->
    <div class="flex items-center gap-2 md:gap-4">
      <div class="flex flex-col items-center gap-0.5 md:gap-1">
        <div class="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden bg-white border-2 border-white shadow-md flex-shrink-0">
          <img 
            src="@/assets/Files/user-avatar.png" 
            alt="User avatar"
            class="w-full h-full object-cover"
            @error="(e) => (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%23047857%22%3E%3Cpath d=%22M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z%22/%3E%3C/svg%3E'"
          />
        </div>
        <div class="flex flex-col items-center -mt-0.5">
          <span class="text-[10px] md:text-xs font-medium whitespace-nowrap">
            <span class="hidden sm:inline">Bonjour </span>{{ username }}
          </span>
          <button class="text-[8px] md:text-[10px] opacity-80 hover:opacity-100 hover:underline whitespace-nowrap">
            Admins et ajora
          </button>
        </div>
      </div>
    </div>
  </header>
</template>