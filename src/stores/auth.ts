import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { jwtDecode } from 'jwt-decode'

export type Role = 'Supervisor' | 'Operador'

interface TokenPayload {
  role: Role
  sub?: string
  exp?: number
}

const STORAGE_KEY = 'pt_token'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(sessionStorage.getItem(STORAGE_KEY))
  const role = ref<Role | null>(decodeRole(token.value))

  function decodeRole(t: string | null): Role | null {
    if (!t) return null
    try {
      const payload = jwtDecode<TokenPayload>(t)
      return payload.role ?? null
    } catch {
      return null
    }
  }

  const isAuthenticated = computed(() => !!token.value && !!role.value)

  function setToken(newToken: string) {
    token.value = newToken
    role.value = decodeRole(newToken)
    sessionStorage.setItem(STORAGE_KEY, newToken)
  }

  function logout() {
    token.value = null
    role.value = null
    sessionStorage.removeItem(STORAGE_KEY)
  }

  return { token, role, isAuthenticated, setToken, logout }
})
