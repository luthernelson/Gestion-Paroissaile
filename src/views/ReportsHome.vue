<script setup lang="ts">
import PageTitle from '@/components/layout/PageTitle.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
</script>

<template>
  <PageTitle
    title="Rapports"
    subtitle="Sélectionnez un type de rapport"
  />

  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <BaseCard title="Rapport Membres">
      Liste et statistiques des membres
    </BaseCard>

    <BaseCard title="Rapport Collectes">
      Entrées financières par période
    </BaseCard>

    <BaseCard title="Rapport Activités">
      Activités et cultes réalisés
    </BaseCard>
  </div>
</template>
