import type { FastifyInstance } from 'fastify'
import { formatNote, noteInclude } from '../noteHelpers'

export async function searchRoutes(fastify: FastifyInstance) {
  fastify.get<{ Querystring: { q?: string } }>('/search', async (req) => {
    const q = req.query.q?.trim() ?? ''
    if (!q) return []
    const notes = await fastify.prisma.note.findMany({
      where: {
        userId: req.userId,
        OR: [{ title: { contains: q } }, { body: { contains: q } }],
      },
      orderBy: { updatedAt: 'desc' },
      include: noteInclude,
      take: 50,
    })
    return notes.map(formatNote)
  })
}
