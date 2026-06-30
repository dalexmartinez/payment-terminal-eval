import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import ToastService from 'primevue/toastservice'
import App from './App.vue'
import router from './router'
import { bindToast } from './services/api'
import { useToast } from 'primevue/usetoast'

import 'primeicons/primeicons.css'
import './style.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: { darkModeSelector: '.app-dark' },
  },
})
app.use(ToastService)

app.mount('#app')

// Conecta el servicio de Toast de PrimeVue con el interceptor de Axios
app.runWithContext(() => {
  bindToast(useToast())
})
