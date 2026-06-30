import type { VercelRequest, VercelResponse } from '@vercel/node'

// Dominio de producción + patrón de preview deployments de Vercel para este proyecto
// (Vercel genera URLs únicas por branch/PR, ej. payment-terminal-eval-git-feature-x.vercel.app)
const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/payment-terminal-eval\.vercel\.app$/,
  /^https:\/\/payment-terminal-eval-[a-z0-9-]+\.vercel\.app$/,
  /^http:\/\/localhost:\d+$/, // desarrollo local (vercel dev / vite dev)
]

function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return false
  return ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin))
}

export function applyCors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = req.headers.origin

  if (isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin as string)
    res.setHeader('Vary', 'Origin')
  }
  // Si el origen no está en la lista, simplemente no se setea el header:
  // el navegador del solicitante bloqueará la respuesta por política CORS.

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Headers de seguridad estándar en cada respuesta de la API
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return true // request handled, caller should return
  }
  return false
}
