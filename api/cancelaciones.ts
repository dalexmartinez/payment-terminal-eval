import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors } from './_utils/cors'
import { maskCard, randomDigits, isWithinLength } from './_utils/crypto'
import { requireRole } from './_utils/auth'

// PATCH /api/cancelaciones — solo Supervisor
// Body: { numeroReferencia, numeroTarjeta, tipo: 'Cancelacion' | 'Devolucion' }
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return

  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Método no permitido' })
  }

  if (!requireRole(req, res, ['Supervisor'])) return

  const { numeroReferencia, numeroTarjeta, tipo } = req.body ?? {}

  if (!numeroReferencia || !numeroTarjeta || !tipo) {
    return res.status(400).json({ message: 'Número de referencia, tarjeta y tipo son requeridos' })
  }

  if (!isWithinLength(numeroReferencia, 32) || !isWithinLength(numeroTarjeta, 32)) {
    return res.status(400).json({ message: 'Referencia o tarjeta exceden la longitud permitida' })
  }

  if (!['Cancelacion', 'Devolucion'].includes(tipo)) {
    return res.status(400).json({ message: 'Tipo de transacción inválido' })
  }

  return res.status(200).json({
    numeroAprobacion: randomDigits(6),
    numeroReferencia: randomDigits(8),
    tarjetaEnmascarada: maskCard(String(numeroTarjeta)),
    estatusAplicado: tipo === 'Cancelacion' ? 'Cancelada' : 'Devuelta',
    referenciaOriginal: numeroReferencia,
    fecha: new Date().toISOString(),
  })
}
