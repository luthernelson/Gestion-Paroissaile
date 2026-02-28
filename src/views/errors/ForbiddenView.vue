<template>
  <div class="min-h-full flex flex-col items-center justify-center bg-gray-50 px-4 text-center">

    <!-- 403 -->
    <h1 class="text-[180px] md:text-[220px] font-black leading-none text-green-600 select-none drop-shadow-sm">
      403
    </h1>

    <!-- Message -->
    <p class="text-xl md:text-2xl font-semibold text-gray-700 -mt-4">
      Accès refusé
    </p>
    <p class="text-gray-400 mt-2 text-sm md:text-base max-w-sm">
      Vous n'avez pas les permissions nécessaires pour accéder à cette page.
    </p>

    <!-- Bouton retour -->
    <RouterLink
      to="/dashboard"
      class="mt-8 inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition shadow-md"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
      Retour au tableau de bord
    </RouterLink>

  </div>
</template>
