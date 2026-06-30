import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors } from './_utils/cors'
import { maskCard, randomDigits } from './_utils/crypto'

interface Transaccion {
  numeroAprobacion: string
  numeroReferencia: string
  tarjetaEnmascarada: string
  importe: number
  nombre: string
  fecha: string
  estatus: 'Aprobada'
}

const NOMBRES = [
  'Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez', 'Luis Hernández',
  'Sofía Ramírez', 'Diego Torres', 'Valeria Cruz', 'Jorge Flores', 'Camila Morales',
  'Roberto Sánchez', 'Paola Jiménez',
]

function generarTransacciones(cantidad: number): Transaccion[] {
  return Array.from({ length: cantidad }, (_, i) => {
    const fechaBase = new Date()
    fechaBase.setHours(fechaBase.getHours() - i)
    const tarjeta = `4${randomDigits(15)}`
    return {
      numeroAprobacion: randomDigits(6),
      numeroReferencia: randomDigits(8),
      tarjetaEnmascarada: maskCard(tarjeta),
      importe: Math.round((Math.random() * 5000 + 50) * 100) / 100,
      nombre: NOMBRES[i % NOMBRES.length],
      fecha: fechaBase.toISOString(),
      estatus: 'Aprobada',
    }
  })
}

// GET /api/consultas
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' })
  }

  return res.status(200).json({
    transacciones: generarTransacciones(12),
  })
}
