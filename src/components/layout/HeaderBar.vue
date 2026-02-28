<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

defineProps<{
  username: string
  email?: string
}>()

const emit = defineEmits<{
  (e: 'logout'): void
  (e: 'toggle-menu'): void
  (e: 'toggle-dark'): void
  (e: 'change-lang', lang: string): void
}>()

const isDark = ref(false)
const dropdownOpen = ref(false)
const langMenuOpen = ref(false)

const currentLang = ref<'fr' | 'en' | 'de'>('fr')

const languages = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English',  flag: '🇬🇧' },
  { code: 'de', label: 'Deutsch',  flag: '🇩🇪' },
]

function toggleDark() {
  isDark.value = !isDark.value
  emit('toggle-dark')
}

function selectLang(lang: typeof currentLang.value) {
  currentLang.value = lang
  langMenuOpen.value = false
  emit('change-lang', lang)
}

function closeAll(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('#user-dropdown-wrapper')) dropdownOpen.value = false
  if (!target.closest('#lang-dropdown-wrapper')) langMenuOpen.value = false
}

onMounted(() => document.addEventListener('click', closeAll))
onUnmounted(() => document.removeEventListener('click', closeAll))
</script>

<template>
  <header class="h-16 md:h-[4.5rem] bg-green-700 text-white flex items-center justify-between px-4 md:px-8 shadow-lg relative z-50">

    <!-- ── LEFT : Hamburger + Logo + Titre ── -->
    <div class="flex items-center gap-3 md:gap-4">
      <!-- Hamburger (mobile) -->
      <button
        @click="emit('toggle-menu')"
        class="lg:hidden p-1.5 hover:bg-white/10 rounded transition"
        aria-label="Toggle menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <!-- Logo agrandi -->
      <img
        src="@/assets/Files/logo-eec.png"
        alt="EEC Logo"
        class="w-14 h-14 md:w-20 md:h-20 object-contain flex-shrink-0 drop-shadow-md"
      />

      <!-- Titre -->
      <span class="hidden sm:block text-base md:text-xl font-bold tracking-wide">
        <span class="text-yellow-300">EEC</span> Gestion Paroissiale
      </span>
    </div>

    <!-- ── RIGHT : Actions + User ── -->
    <div class="flex items-center gap-2 md:gap-3">

      <!-- 🌙 Dark / Light mode -->
      <button
        @click="toggleDark"
        class="p-2 rounded-full hover:bg-white/15 transition"
        :aria-label="isDark ? 'Mode clair' : 'Mode sombre'"
      >
        <!-- Sun -->
        <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 md:h-6 md:w-6 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14A7 7 0 0012 5z"/>
        </svg>
        <!-- Moon -->
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 md:h-6 md:w-6 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"/>
        </svg>
      </button>

      <!-- 🌐 Langue (drapeau) -->
      <div id="lang-dropdown-wrapper" class="relative">
        <button
          @click.stop="langMenuOpen = !langMenuOpen; dropdownOpen = false"
          class="flex items-center gap-1.5 px-2 py-1.5 rounded-full hover:bg-white/15 transition text-sm md:text-base font-medium"
          aria-label="Changer de langue"
        >
          <span class="text-xl md:text-2xl leading-none">
            {{ languages.find(l => l.code === currentLang)?.flag }}
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>

        <!-- Langue dropdown -->
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 scale-95 -translate-y-1"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 -translate-y-1"
        >
          <div
            v-if="langMenuOpen"
            class="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100 text-gray-800 origin-top-right"
          >
            <button
              v-for="lang in languages"
              :key="lang.code"
              @click.stop="selectLang(lang.code as 'fr' | 'en' | 'de')"
              class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-green-50 transition text-sm font-medium"
              :class="currentLang === lang.code ? 'bg-green-50 text-green-700' : ''"
            >
              <span class="text-xl">{{ lang.flag }}</span>
              <span>{{ lang.label }}</span>
              <svg v-if="currentLang === lang.code" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-auto text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            </button>
          </div>
        </Transition>
      </div>

      <!-- 👤 User dropdown -->
      <div id="user-dropdown-wrapper" class="relative">
        <button
          @click.stop="dropdownOpen = !dropdownOpen; langMenuOpen = false"
          class="flex items-center gap-2 md:gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-white/15 transition"
        >
          <!-- Infos texte -->
          <div class="hidden sm:flex flex-col items-end">
            <span class="text-sm md:text-base font-semibold leading-tight whitespace-nowrap">
              Bonjour, {{ username }}
            </span>
            <span class="text-[10px] md:text-xs opacity-75 whitespace-nowrap">Admins et ajora</span>
          </div>

          <!-- Avatar -->
          <div class="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-white/60 shadow-md flex-shrink-0">
            <img
              src="@/assets/Files/user-avatar.png"
              alt="User avatar"
              class="w-full h-full object-cover"
              @error="(e) => (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%23047857%22%3E%3Cpath d=%22M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z%22/%3E%3C/svg%3E'"
            />
          </div>

          <!-- Chevron -->
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-70 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>

        <!-- User dropdown menu -->
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 scale-95 -translate-y-1"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 -translate-y-1"
        >
          <div
            v-if="dropdownOpen"
            class="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100 text-gray-800 origin-top-right"
          >
            <!-- En-tête utilisateur -->
            <div class="px-4 py-3 bg-green-50 border-b border-gray-100">
              <p class="text-sm font-bold text-green-800 truncate">{{ username }}</p>
              <p class="text-xs text-gray-500 truncate mt-0.5">{{ email ?? 'admin@eec-paroisse.org' }}</p>
            </div>

            <!-- Items -->
            <div class="py-1">
              <!-- Profil -->
              <button class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition text-sm">
                <span class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5.121 17.804A9 9 0 1118.88 6.196M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </span>
                <span class="font-medium">Mon profil</span>
              </button>

              <!-- Paramètres -->
              <button class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition text-sm">
                <span class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </span>
                <span class="font-medium">Paramètres</span>
              </button>
            </div>

            <!-- Déconnexion -->
            <div class="border-t border-gray-100 py-1">
              <button
                @click="emit('logout')"
                class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition text-sm text-red-600 group"
              >
                <span class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 group-hover:bg-red-200 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                </span>
                <span class="font-medium">Déconnexion</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>

    </div>
  </header>
</template>