<script setup lang="ts">
import Toast from 'primevue/toast'
import { useInactivityLogout } from './composables/useInactivityLogout'

useInactivityLogout()
</script>

<template>
  <div class="app-shell">
    <Toast position="top-right" />
    <router-view />
  </div>
</template>

<style>
.app-shell {
  min-height: 100vh;
}
</style>
