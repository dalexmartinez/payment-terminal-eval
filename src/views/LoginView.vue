<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import api from '../services/api'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const loading = ref(false)
const usernameError = ref('')
const passwordError = ref('')
const sessionNotice = ref('')

onMounted(() => {
  if (route.query.reason === 'expired') {
    sessionNotice.value = 'Sesión expirada. Por favor inicia sesión nuevamente.'
  }
})

async function handleLogin() {
  usernameError.value = ''
  passwordError.value = ''
  sessionNotice.value = ''

  let hasError = false
  if (!username.value) {
    usernameError.value = 'El usuario es requerido'
    hasError = true
  }
  if (!password.value) {
    passwordError.value = 'La contraseña es requerida'
    hasError = true
  }
  if (hasError) return

  loading.value = true
  try {
    const { data } = await api.post('/login', {
      username: username.value,
      password: password.value,
    })
    auth.setToken(data.token)
    router.push(auth.role === 'Supervisor' ? '/supervisor' : '/operador')
  } catch (err: any) {
    // El backend solo valida el usuario (la contraseña no se valida realmente
    // en esta simulación), así que el error de credenciales se asocia al campo usuario.
    usernameError.value = err.response?.data?.message ?? 'Usuario no encontrado'
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
          <p class="pt-eyebrow">SafePay</p>
          <h1>Acceso al sistema</h1>
        </div>
      </div>

      <p class="hint">Bienvenido al sistema de SafePay. Inicia sesión para continuar.</p>

      <p v-if="sessionNotice" class="session-notice">{{ sessionNotice }}</p>

      <form class="login-form" @submit.prevent="handleLogin">
        <label class="field-label" for="username">Usuario</label>
        <InputText
          id="username"
          v-model="username"
          placeholder="supervisor1"
          autocomplete="username"
          :disabled="loading"
          :invalid="!!usernameError"
        />
        <small v-if="usernameError" class="field-error">{{ usernameError }}</small>

        <label class="field-label" for="password">Contraseña</label>
        <Password
          id="password"
          v-model="password"
          placeholder="••••••••"
          :feedback="false"
          toggleMask
          fluid
          :disabled="loading"
          :invalid="!!passwordError"
        />
        <small v-if="passwordError" class="field-error">{{ passwordError }}</small>

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
  margin: 16px 0 8px;
}

.session-notice {
  font-size: 0.82rem;
  color: var(--pt-danger);
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  margin: 0 0 16px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-label {
  font-size: 0.8rem;
  color: var(--pt-text-dim);
  margin-top: 10px;
}

.field-error {
  color: var(--pt-danger);
  font-size: 0.75rem;
}

.submit-btn {
  margin-top: 20px;
  width: 100%;
}
</style>
