<template>
  <div class="flex min-h-screen font-sans">

    <!-- ═══════════════════════════════════
         PANNEAU VERT (gauche) — masqué mobile
    ═══════════════════════════════════ -->
    <div class="hidden md:flex relative w-[45%] flex-col items-center justify-center gap-8 px-8 py-12 overflow-hidden text-white"
         style="background: linear-gradient(160deg, #1a5c2a 0%, #2d8a48 50%, #1e7a38 100%)">

      <!-- Cercles décoratifs -->
      <div class="absolute -top-20 -right-20 w-[350px] h-[350px] rounded-full border border-white/10 pointer-events-none"></div>
      <div class="absolute -bottom-16 -left-16 w-[250px] h-[250px] rounded-full border border-white/[0.06] pointer-events-none"></div>
      <!-- Motif diagonal -->
      <div class="absolute inset-0 pointer-events-none"
           style="background-image: repeating-linear-gradient(45deg, transparent, transparent 30px, rgba(255,255,255,0.018) 30px, rgba(255,255,255,0.018) 31px),
                  radial-gradient(circle at 20% 20%, rgba(255,255,255,0.06) 0%, transparent 50%),
                  radial-gradient(circle at 80% 80%, rgba(255,255,255,0.05) 0%, transparent 50%)">
      </div>

      <!-- Logo + Titre côte à côte -->
      <div class="relative z-10 flex items-center gap-5 animate-float">
        <img src="../../assets/Files/logo.png" alt="EEC Logo"
             class="w-28 h-28 object-contain drop-shadow-2xl shrink-0" />
        <div>
          <h1 class="text-5xl font-black tracking-widest m-0 leading-none" style="text-shadow: 0 2px 12px rgba(0,0,0,0.3)">EEC</h1>
          <p class="text-sm font-light tracking-widest opacity-85 mt-1.5">Gestion Paroissiale</p>
        </div>
      </div>

      <!-- Ticker défilant -->
  <!--     <div class="relative z-10 w-full rounded-full py-3 overflow-hidden" style="background: rgba(0,0,0,0.2)">
        <div class="flex gap-12 w-max animate-ticker">
          <template v-for="n in 2" :key="n">
            <div v-for="item in values" :key="item.label + n"
                 class="flex items-center gap-2 whitespace-nowrap text-[0.82rem] font-medium opacity-90">
              <component :is="item.icon" class="w-4 h-4 shrink-0" />
              <span>{{ item.label }} — {{ item.desc }}</span>
            </div>
          </template>
        </div>
      </div> -->

      <!-- Cards valeurs -->
      <div class="relative z-10 grid grid-cols-2 gap-3 w-full max-w-[300px]">
        <div v-for="val in values.slice(0, 4)" :key="val.label"
             class="flex items-center gap-2.5 rounded-xl px-4 py-3 backdrop-blur-sm border border-white/20 transition-all duration-200 hover:-translate-y-0.5 cursor-default"
             style="background: rgba(255,255,255,0.12)">
          <span class="w-5 h-5 shrink-0"><component :is="val.icon" class="w-5 h-5" /></span>
          <span class="text-sm font-semibold tracking-wide">{{ val.label }}</span>
        </div>
      </div>

      <!-- Citation -->
      <div class="relative z-10 text-center max-w-xs border-t border-white/20 pt-4">
        <p class="text-[0.82rem] italic leading-relaxed opacity-85 mb-1">
          « Car là où deux ou trois sont réunis en mon nom, je suis au milieu d'eux. »
        </p>
        <cite class="text-[0.75rem] opacity-65 not-italic font-semibold tracking-wider">— Matthieu 18:20</cite>
      </div>
    </div>

    <!-- ═══════════════════════════════════
         PANNEAU FORMULAIRE (droite)
    ═══════════════════════════════════ -->
    <div class="flex-1 flex flex-col items-center justify-center px-6 py-10 gap-6 bg-[#f5f5f0]">
      <div class="bg-white rounded-2xl pt-6 pb-10 px-10 w-full max-w-md shadow-[0_4px_32px_rgba(0,0,0,0.08)]">

        <!-- Logo + titre (toujours visibles dans le formulaire) -->
        <div class="flex flex-col items-center mb-5">
          <img src="../../assets/Files/logo-eec.png" alt="EEC Logo"
               class="w-40 h-40 object-contain drop-shadow-md mb-1" style="margin-top: -16px;" />
          <h2 class="text-[1.6rem] font-extrabold text-gray-900 m-0 text-center leading-tight">
            Gestion Paroissiale
          </h2>
          <p class="text-sm text-gray-400 mt-1 text-center">Connectez-vous à votre espace</p>
        </div>

        <form @submit.prevent="handleLogin" class="flex flex-col gap-4">

          <!-- Identifiant -->
          <div class="flex flex-col gap-1.5">
            <label for="login" class="text-[0.8rem] font-semibold text-gray-600 tracking-wide">
              Identifiant ou email
            </label>
            <div class="relative flex items-center">
              <Mail class="absolute left-3.5 w-[18px] h-[18px] text-gray-400 pointer-events-none shrink-0" />
              <input
                id="login"
                v-model="form.login"
                type="text"
                placeholder="Identifiant ou email"
                autocomplete="username"
                class="w-full pl-10 pr-4 py-3 border-[1.5px] rounded-xl text-sm text-gray-900 bg-gray-50 outline-none transition-all duration-200 placeholder:text-gray-300"
                :class="errors.login
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-200 focus:border-green-700 focus:bg-white focus:shadow-[0_0_0_3px_rgba(45,138,72,0.12)]'"
              />
            </div>
            <span v-if="errors.login" class="text-[0.75rem] text-red-500 flex items-center gap-1">
              <AlertCircle class="w-3 h-3" /> {{ errors.login }}
            </span>
          </div>

          <!-- Mot de passe -->
          <div class="flex flex-col gap-1.5">
            <label for="password" class="text-[0.8rem] font-semibold text-gray-600 tracking-wide">
              Mot de passe
            </label>
            <div class="relative flex items-center">
              <Lock class="absolute left-3.5 w-[18px] h-[18px] text-gray-400 pointer-events-none shrink-0" />
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Mot de passe"
                autocomplete="current-password"
                class="w-full pl-10 pr-11 py-3 border-[1.5px] rounded-xl text-sm text-gray-900 bg-gray-50 outline-none transition-all duration-200 placeholder:text-gray-300"
                :class="errors.password
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-200 focus:border-green-700 focus:bg-white focus:shadow-[0_0_0_3px_rgba(45,138,72,0.12)]'"
              />
              <button
                type="button"
                class="absolute right-3.5 flex items-center text-gray-400 hover:text-green-700 transition-colors duration-200 cursor-pointer"
                @click="showPassword = !showPassword"
              >
                <Eye v-if="!showPassword" class="w-[18px] h-[18px]" />
                <EyeOff v-else class="w-[18px] h-[18px]" />
              </button>
            </div>
            <span v-if="errors.password" class="text-[0.75rem] text-red-500 flex items-center gap-1">
              <AlertCircle class="w-3 h-3" /> {{ errors.password }}
            </span>
          </div>

          <!-- Bouton connexion -->
          <button
            type="submit"
            :disabled="loading"
            class="mt-2 flex items-center justify-center min-h-[48px] rounded-xl font-bold text-sm tracking-widest text-white cursor-pointer transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed hover:enabled:-translate-y-px active:enabled:translate-y-0"
            style="background: linear-gradient(135deg, #1a5c2a, #2d8a48);
                   box-shadow: 0 4px 16px rgba(45,138,72,0.35);"
            onmouseover="if(!this.disabled) this.style.boxShadow='0 6px 20px rgba(45,138,72,0.45)'"
            onmouseout="this.style.boxShadow='0 4px 16px rgba(45,138,72,0.35)'"
          >
            <span v-if="!loading">SE CONNECTER</span>
            <Loader2 v-else class="w-5 h-5 animate-spin" />
          </button>

          <!-- Mot de passe oublié -->
          <div class="text-center">
            <a href="#"
               class="text-[0.82rem] text-green-700 font-medium no-underline hover:opacity-70 hover:underline transition-opacity">
              Mot de passe oublié ?
            </a>
          </div>

        </form>
      </div>


    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, Church, Handshake, Leaf, BookOpen, Heart, Gift } from 'lucide-vue-next'
import { useRouter } from 'vue-router'




const form      = reactive({ login: '', password: '' })
const errors    = reactive({ login: '', password: '' })
const showPassword = ref(false)
const loading      = ref(false)
const router = useRouter()


const values = [
  { icon: Church,     label: 'Foi',           desc: "Grandir ensemble dans la parole de Dieu" },
  { icon: Handshake,  label: 'Fraternité',    desc: "Une communauté unie par l'amour du prochain" },
  { icon: Leaf,       label: 'Service',       desc: "Servir avec humilité et dévouement" },
  { icon: BookOpen,   label: 'Enseignement',  desc: "La parole de Dieu comme lumière de nos pas" },
  { icon: Heart,      label: 'Prière',        desc: "Le fondement de toute vie spirituelle" },
  { icon: Gift,       label: 'Générosité',    desc: "Donner de tout cœur pour l'édification de l'Église" },
]


const handleLogin = async () => {
  errors.login    = ''
  errors.password = ''

  if (!form.login)    { errors.login    = 'Veuillez saisir votre identifiant.'; return }
  if (!form.password) { errors.password = 'Veuillez saisir votre mot de passe.'; return }

  loading.value = true
  await new Promise(r => setTimeout(r, 1500))

  // 🔧 Simulation login — à remplacer par l'appel API réel
  localStorage.setItem('user_token', 'fake-token-dev')
  localStorage.setItem('user_permissions', JSON.stringify([]))

  loading.value = false
  router.push({ name: 'Dashboard' })
}
</script>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-8px); }
}

@keyframes ticker {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.animate-float  { animation: float  4s  ease-in-out linear infinite; }
.animate-ticker { animation: ticker 40s linear infinite; }
</style>