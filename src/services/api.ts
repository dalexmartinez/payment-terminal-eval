import axios from 'axios'
import type { ToastServiceMethods } from 'primevue/toastservice'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

const TOKEN_STORAGE_KEY = 'pt_token'

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(TOKEN_STORAGE_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let toast: ToastServiceMethods | null = null

export function bindToast(instance: ToastServiceMethods) {
  toast = instance
}

api.interceptors.response.use(
  (response) => {
    toast?.add({
      severity: 'success',
      summary: `Status ${response.status}`,
      detail: 'Operación procesada correctamente',
      life: 3500,
    })
    return response
  },
  (error) => {
    const status = error.response?.status ?? 0
    const message = error.response?.data?.message ?? 'Ocurrió un error al procesar la solicitud'
    toast?.add({
      severity: 'error',
      summary: status ? `Status ${status}` : 'Error de red',
      detail: message,
      life: 5000,
    })
    return Promise.reject(error)
  },
)

export default api
