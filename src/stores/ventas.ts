import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface VentaRegistrada {
  numeroAprobacion: string
  numeroReferencia: string
  tarjetaEnmascarada: string
  importe: number
  nombre: string
  fecha: string
  estatus: 'Aprobada'
}

// Simula persistencia de las ventas hechas en esta sesión del navegador.
// Vive solo en memoria (Pinia) — se pierde al recargar la página o cerrar
// sesión, ya que no hay una base de datos real detrás de este backend simulado.
export const useVentasStore = defineStore('ventas', () => {
  const ventasLocales = ref<VentaRegistrada[]>([])

  function registrarVenta(venta: VentaRegistrada) {
    ventasLocales.value.unshift(venta)
  }

  function limpiar() {
    ventasLocales.value = []
  }

  return { ventasLocales, registrarVenta, limpiar }
})
