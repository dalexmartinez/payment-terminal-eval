import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const INACTIVITY_LIMIT_MS = 5 * 60 * 1000 // 5 minutos
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart'] as const

export function useInactivityLogout() {
  const router = useRouter()
  const auth = useAuthStore()
  let timer: ReturnType<typeof setTimeout> | null = null

  function resetTimer() {
    if (!auth.isAuthenticated) return
    if (timer) clearTimeout(timer)
    timer = setTimeout(handleTimeout, INACTIVITY_LIMIT_MS)
  }

  function handleTimeout() {
    if (!auth.isAuthenticated) return
    auth.logout()
    router.push({ name: 'login', query: { reason: 'expired' } })
  }

  function clearTimer() {
    if (timer) clearTimeout(timer)
    timer = null
  }

  onMounted(() => {
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, resetTimer))
    resetTimer()
  })

  onUnmounted(() => {
    ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, resetTimer))
    clearTimer()
  })
}
