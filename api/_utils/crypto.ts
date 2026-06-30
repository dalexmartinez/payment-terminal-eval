import CryptoJS from 'crypto-js'

// Clave compartida SOLO para esta simulación de evaluación técnica.
// En un escenario real, el cifrado de datos de tarjeta nunca debería
// depender de una clave estática compartida entre cliente y servidor;
// se usaría TLS + tokenización del lado del procesador de pagos (PCI-DSS).
const SHARED_KEY = process.env.AES_SHARED_KEY ?? 'eval-frontend-2026-demo-key'

export function decryptField(cipherText: string): string {
  const bytes = CryptoJS.AES.decrypt(cipherText, SHARED_KEY)
  return bytes.toString(CryptoJS.enc.Utf8)
}

export function maskCard(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, '')
  if (digits.length < 8) return '****'
  return `${digits.slice(0, 4)}*****${digits.slice(-4)}`
}

export function randomDigits(length: number): string {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10)
  }
  return result
}

// Límite defensivo de longitud para cualquier campo de texto libre que llegue
// al backend (ej. "nombre"). El brief no especifica un máximo, pero aceptar
// strings sin límite es una mala práctica en cualquier API pública.
export function isWithinLength(value: unknown, max: number): boolean {
  return typeof value === 'string' && value.length <= max
}
