<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'
import api from '../services/api'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  errorMsg.value = ''
  if (!username.value || !password.value) {
    errorMsg.value = 'Ingresa usuario y contraseña'
    return
  }

  loading.value = true
  try {
    const { data } = await api.post('/login', {
      username: username.value,
      password: password.value,
    })
    auth.setToken(data.token)
    router.push(auth.role === 'Supervisor' ? '/supervisor' : '/operador')
  } catch (err: any) {
    errorMsg.value = err.response?.data?.message ?? 'No se pudo iniciar sesión'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-screen">
    <div class="login-card pt-panel">
      <div class="brand">
        <span class="brand-dot" />
        <div>
          <p class="pt-eyebrow">Terminal de pagos</p>
          <h1>Acceso al sistema</h1>
        </div>
      </div>

      <p class="hint">
        Usa <span class="pt-mono">supervisor1</span> o <span class="pt-mono">operador1</span> con cualquier contraseña.
      </p>

      <form class="login-form" @submit.prevent="handleLogin">
        <label class="field-label" for="username">Usuario</label>
        <InputText
          id="username"
          v-model="username"
          placeholder="supervisor1"
          autocomplete="username"
          :disabled="loading"
        />

        <label class="field-label" for="password">Contraseña</label>
        <Password
          id="password"
          v-model="password"
          placeholder="••••••••"
          :feedback="false"
          toggleMask
          fluid
          :disabled="loading"
        />

        <Message v-if="errorMsg" severity="error" :closable="false">{{ errorMsg }}</Message>

        <Button
          type="submit"
          label="Ingresar"
          :loading="loading"
          class="submit-btn"
        />
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 380px;
  padding: 32px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.brand-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: var(--pt-accent);
  box-shadow: 0 0 12px var(--pt-accent);
  flex-shrink: 0;
}

h1 {
  font-size: 1.25rem;
  margin: 2px 0 0;
}

.hint {
  font-size: 0.85rem;
  color: var(--pt-text-dim);
  margin: 16px 0 24px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 0.8rem;
  color: var(--pt-text-dim);
  margin-top: 8px;
}

.submit-btn {
  margin-top: 16px;
  width: 100%;
}
</style>
