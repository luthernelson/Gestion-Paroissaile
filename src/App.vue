<!-- App.vue -->
<script setup lang="ts">
import { Toaster } from 'vue-sonner'
</script>

<template>
  <RouterView />
  <Teleport to="body">
    <Toaster
      position="top-left"
      :expand="true"
      rich-colors
      close-button
    />
  </Teleport>
</template>