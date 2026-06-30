import type { VercelRequest, VercelResponse } from '@vercel/node'
import { jwtDecode } from 'jwt-decode'

export type Role = 'Supervisor' | 'Operador'

interface TokenPayload {
  role?: Role
}

function extractToken(req: VercelRequest): string | null {
  const header = req.headers['authorization'] ?? req.headers['Authorization' as any]
  if (!header || typeof header !== 'string') return null
  const [scheme, token] = header.split(' ')
  if (scheme !== 'Bearer' || !token) return null
  return token
}

// NOTA: igual que en el resto del proyecto, solo se decodifica el payload,
// no se verifica la firma del JWT. En un backend real esto es insuficiente:
// la firma SIEMPRE debe validarse contra una clave/secreto del servidor
// para confirmar que el token no fue alterado. Aquí se omite porque jwtbuilder
// firma con una clave arbitraria que este backend simulado no conoce.
export function requireRole(req: VercelRequest, res: VercelResponse, allowed: Role[]): boolean {
  const token = extractToken(req)

  if (!token) {
    res.status(401).json({ message: 'Token de autorización requerido' })
    return false
  }

  let role: Role | undefined
  try {
    role = jwtDecode<TokenPayload>(token).role
  } catch {
    res.status(401).json({ message: 'Token inválido' })
    return false
  }

  if (!role || !allowed.includes(role)) {
    res.status(403).json({ message: `El rol "${role ?? 'desconocido'}" no tiene permiso para esta operación` })
    return false
  }

  return true
}
