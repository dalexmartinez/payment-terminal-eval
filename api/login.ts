import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors } from './_utils/cors'
import { TOKEN_SUPERVISOR, TOKEN_OPERADOR } from './_data/tokens'

// POST /api/login
// Body: { username: string, password: string }
// Usuarios válidos (demo): supervisor1 / operador1, cualquier password
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' })
  }

  const { username, password } = req.body ?? {}

  if (!username || !password) {
    return res.status(400).json({ message: 'Usuario y contraseña son requeridos' })
  }

  const normalized = String(username).toLowerCase()

  if (normalized.includes('supervisor')) {
    return res.status(200).json({ token: TOKEN_SUPERVISOR })
  }

  if (normalized.includes('operador')) {
    return res.status(200).json({ token: TOKEN_OPERADOR })
  }

  return res.status(400).json({ message: 'Credenciales inválidas' })
}
