import type { FastifyInstance } from 'fastify'

interface TagParams { id: string }
interface CreateTagBody { name: string; color?: string }
interface UpdateTagBody { name?: string; color?: string }

export async function tagsRoutes(fastify: FastifyInstance) {
  fastify.get('/tags', async (req) => {
    return fastify.prisma.tag.findMany({
      where:   { userId: req.userId },
      orderBy: { name: 'asc' },
    })
  })

  fastify.post<{ Body: CreateTagBody }>('/tags', async (req, reply) => {
    const { name, color } = req.body
    const tag = await fastify.prisma.tag.create({
      data: { userId: req.userId, name, color },
    })
    return reply.code(201).send(tag)
  })

  fastify.put<{ Params: TagParams; Body: UpdateTagBody }>('/tags/:id', async (req, reply) => {
    const { name, color } = req.body
    const data: Record<string, unknown> = {}
    if (name  !== undefined) data.name  = name
    if (color !== undefined) data.color = color

    try {
      return await fastify.prisma.tag.update({
        where: { id: +req.params.id, userId: req.userId },
        data,
      })
    } catch {
      return reply.code(404).send({ error: 'Not found' })
    }
  })

  fastify.delete<{ Params: TagParams }>('/tags/:id', async (req, reply) => {
    try {
      await fastify.prisma.tag.delete({
        where: { id: +req.params.id, userId: req.userId },
      })
      return reply.code(204).send()
    } catch {
      return reply.code(404).send({ error: 'Not found' })
    }
  })
}
