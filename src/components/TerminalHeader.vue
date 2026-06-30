<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import { useAuthStore } from '../stores/auth'

defineProps<{ title: string }>()

const auth = useAuthStore()
const router = useRouter()

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <header class="terminal-header">
    <div class="left">
      <p class="pt-eyebrow">SafePay</p>
      <h1>{{ title }}</h1>
    </div>
    <div class="right">
      <Tag :value="auth.role ?? ''" severity="info" class="role-tag" />
      <Button label="Cerrar sesión" severity="secondary" outlined size="small" @click="handleLogout" />
    </div>
  </header>
</template>

<style scoped>
.terminal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 28px;
  border-bottom: 1px solid var(--pt-panel-border);
}

h1 {
  font-size: 1.15rem;
  margin: 2px 0 0;
}

.right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.role-tag {
  font-family: var(--pt-mono);
  letter-spacing: 0.05em;
}
</style>
