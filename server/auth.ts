import 'fastify'

declare module 'fastify' {
  interface FastifyRequest {
    userId: string
  }
}

function parseKeys(): Map<string, string> {
  const map = new Map<string, string>()
  for (const [k, v] of Object.entries(process.env)) {
    if (k.startsWith('USER_KEY_') && v) {
      map.set(v, k.slice('USER_KEY_'.length).toLowerCase())
    }
  }
  return map
}

const KEYS = parseKeys()

export const AUTH_ENABLED = KEYS.size > 0
export const getUserId = (key: string): string | null => KEYS.get(key) ?? null
