import type { FastifyInstance } from 'fastify'
import { formatNote, noteInclude } from '../noteHelpers'

interface NoteParams { id: string }
interface CreateNoteBody { title: string; body?: string; tagIds?: number[] }
interface UpdateNoteBody { title?: string; body?: string; tagIds?: number[] }

export async function notesRoutes(fastify: FastifyInstance) {
  fastify.get('/notes', async (req) => {
    const notes = await fastify.prisma.note.findMany({
      where:   { userId: req.userId },
      orderBy: { updatedAt: 'desc' },
      include: noteInclude,
    })
    return notes.map(formatNote)
  })

  fastify.get<{ Params: NoteParams }>('/notes/:id', async (req, reply) => {
    const note = await fastify.prisma.note.findFirst({
      where:   { id: +req.params.id, userId: req.userId },
      include: noteInclude,
    })
    if (!note) return reply.code(404).send({ error: 'Not found' })
    return formatNote(note)
  })

  fastify.post<{ Body: CreateNoteBody }>('/notes', async (req, reply) => {
    const { title, body = '', tagIds = [] } = req.body
    const note = await fastify.prisma.note.create({
      data: {
        userId: req.userId,
        title,
        body,
        ...(tagIds.length > 0 && { noteTags: { create: tagIds.map((tagId) => ({ tagId })) } }),
      },
      include: noteInclude,
    })
    return reply.code(201).send(formatNote(note))
  })

  fastify.put<{ Params: NoteParams; Body: UpdateNoteBody }>('/notes/:id', async (req, reply) => {
    const { title, body, tagIds } = req.body
    const noteId = +req.params.id
    const data: Record<string, unknown> = {}
    if (title !== undefined) data.title = title
    if (body  !== undefined) data.body  = body

    try {
      if (tagIds !== undefined) {
        await fastify.prisma.noteTag.deleteMany({ where: { noteId } })
        const note = await fastify.prisma.note.update({
          where:   { id: noteId, userId: req.userId },
          data:    { ...data, ...(tagIds.length > 0 && { noteTags: { create: tagIds.map((tagId) => ({ tagId })) } }) },
          include: noteInclude,
        })
        return formatNote(note)
      }

      const note = await fastify.prisma.note.update({
        where:   { id: noteId, userId: req.userId },
        data,
        include: noteInclude,
      })
      return formatNote(note)
    } catch {
      return reply.code(404).send({ error: 'Not found' })
    }
  })

  fastify.delete<{ Params: NoteParams }>('/notes/:id', async (req, reply) => {
    try {
      await fastify.prisma.note.delete({ where: { id: +req.params.id, userId: req.userId } })
      return reply.code(204).send()
    } catch {
      return reply.code(404).send({ error: 'Not found' })
    }
  })
}
