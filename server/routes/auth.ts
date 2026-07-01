import type { FastifyInstance } from 'fastify'
import { getUserId, AUTH_ENABLED } from '../auth.js'

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: { key: string } }>('/auth/login', async (req, reply) => {
    const { key } = req.body
    if (!AUTH_ENABLED) return { userId: 'default' }
    const userId = getUserId(key)
    if (!userId) return reply.code(401).send({ error: 'Invalid key' })
    return { userId }
  })

  // verify stored key — goes through auth preHandler
  fastify.get('/auth/me', async (req) => {
    return { userId: req.userId }
  })
}
