import CryptoJS from 'crypto-js'

// Misma clave que el backend simulado (api/_utils/crypto.ts).
// NOTA: en un escenario productivo real esta clave nunca debería vivir
// en el cliente. La forma correcta sería TLS + tokenización del lado
// del procesador de pagos (ej. Stripe Elements), donde el dato sensible
// jamás toca tu propio servidor en texto plano. Aquí se implementa así
// porque el reto técnico pide explícitamente cifrado AES visible en el flujo.
const SHARED_KEY = import.meta.env.VITE_AES_SHARED_KEY ?? 'eval-frontend-2026-demo-key'

export function encryptField(value: string): string {
  return CryptoJS.AES.encrypt(value, SHARED_KEY).toString()
}
