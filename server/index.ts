import 'dotenv/config'
import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import prismaPlugin from './plugins/prisma.js'
import { notesRoutes }   from './routes/notes.js'
import { tagsRoutes }   from './routes/tags.js'
import { searchRoutes }  from './routes/search.js'
import { authRoutes }    from './routes/auth.js'
import { getUserId, AUTH_ENABLED } from './auth.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const isDev = process.env.NODE_ENV !== 'production'
const PORT  = parseInt(process.env.PORT ?? '3001', 10)

const app = Fastify({ logger: { level: 'warn' } })

await app.register(prismaPlugin)

// Auth guard — runs before all /api/* routes
app.addHook('preHandler', async (request, reply) => {
  if (!request.url.startsWith('/api/')) return

  if (!AUTH_ENABLED) {
    request.userId = 'default'
    return
  }

  // /api/auth/login is the only unauthenticated endpoint
  if (request.url.startsWith('/api/auth/login')) return

  const auth = request.headers['authorization']
  if (!auth?.startsWith('Bearer ')) {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
  const userId = getUserId(auth.slice(7))
  if (!userId) return reply.code(401).send({ error: 'Invalid key' })
  request.userId = userId
})

await app.register(authRoutes,    { prefix: '/api' })
await app.register(notesRoutes,   { prefix: '/api' })
await app.register(tagsRoutes,   { prefix: '/api' })
await app.register(searchRoutes,  { prefix: '/api' })

if (!isDev) {
  const dist = join(__dirname, '..', 'dist')
  await app.register(fastifyStatic, { root: dist, wildcard: false })
  app.setNotFoundHandler((_, reply) => void reply.sendFile('index.html'))
}

await app.listen({ port: PORT, host: '0.0.0.0' })
console.log(`[api] http://localhost:${PORT}`)
