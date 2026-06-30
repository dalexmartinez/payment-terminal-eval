import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors } from './_utils/cors'
import { decryptField, maskCard, randomDigits, isWithinLength } from './_utils/crypto'
import { requireRole } from './_utils/auth'

// POST /api/venta — solo Operador
// Body: { importe, nombre, numeroTarjeta (AES), fechaExpiracion (AES), cvv (AES) }
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' })
  }

  if (!requireRole(req, res, ['Operador'])) return

  try {
    const { importe, nombre, numeroTarjeta, fechaExpiracion, cvv } = req.body ?? {}

    if (!importe || !nombre || !numeroTarjeta || !fechaExpiracion || !cvv) {
      return res.status(400).json({ message: 'Todos los campos de la venta son requeridos' })
    }

    if (!isWithinLength(nombre, 100)) {
      return res.status(400).json({ message: 'El nombre excede la longitud permitida' })
    }

    const tarjetaPlano = decryptField(numeroTarjeta)
    decryptField(fechaExpiracion)
    decryptField(cvv)

    if (!tarjetaPlano || tarjetaPlano.replace(/\D/g, '').length < 12) {
      return res.status(400).json({ message: 'No se pudo procesar la información de la tarjeta' })
    }

    return res.status(200).json({
      numeroAprobacion: randomDigits(6),
      numeroReferencia: randomDigits(8),
      tarjetaEnmascarada: maskCard(tarjetaPlano),
      importe,
      nombre,
      fecha: new Date().toISOString(),
    })
  } catch (err) {
    return res.status(400).json({ message: 'Error al procesar la venta' })
  }
}
