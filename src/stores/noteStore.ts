import { create } from 'zustand'
import type { Note, Tag } from '../types'
import { notesApi } from '../api/notes'
import { tagsApi }  from '../api/tags'

interface NoteState {
  notes:        Note[]
  tags:         Tag[]
  activeNoteId: number | null
  isSaving:     boolean
  loadAll:     () => Promise<void>
  selectNote:  (id: number) => void
  createNote:  (title?: string, tagIds?: number[]) => Promise<void>
  createTag:   (name: string, color?: string) => Promise<void>
  updateNote:  (id: number, data: Partial<Pick<Note, 'title' | 'body'>>) => Promise<void>
  deleteNote:  (id: number) => Promise<void>
  deleteTag:   (id: number) => Promise<void>
  renameNote:  (id: number, title: string) => Promise<void>
  updateTag:   (id: number, data: { name?: string; color?: string }) => Promise<void>
  setNoteTags: (noteId: number, tagIds: number[]) => Promise<void>
}

export const selectActiveNote = (s: NoteState): Note | null =>
  s.notes.find((n) => n.id === s.activeNoteId) ?? null

export const useNoteStore = create<NoteState>((set) => ({
  notes:        [],
  tags:         [],
  activeNoteId: null,
  isSaving:     false,

  loadAll: async () => {
    const [notes, tags] = await Promise.all([notesApi.list(), tagsApi.list()])
    set({ notes, tags })
  },

  selectNote: (id) => set({ activeNoteId: id }),

  createNote: async (title = 'Untitled', tagIds = []) => {
    const note = await notesApi.create({ title, tagIds })
    set((s) => ({ notes: [note, ...s.notes], activeNoteId: note.id }))
  },

  createTag: async (name, color) => {
    const tag = await tagsApi.create({ name, color })
    set((s) => ({ tags: [...s.tags, tag] }))
  },

  updateNote: async (id, data) => {
    set({ isSaving: true })
    try {
      const updated = await notesApi.update(id, data)
      set((s) => ({ isSaving: false, notes: s.notes.map((n) => (n.id === id ? updated : n)) }))
    } catch {
      set({ isSaving: false })
    }
  },

  deleteNote: async (id) => {
    await notesApi.delete(id)
    set((s) => ({
      notes:        s.notes.filter((n) => n.id !== id),
      activeNoteId: s.activeNoteId === id ? null : s.activeNoteId,
    }))
  },

  deleteTag: async (id) => {
    await tagsApi.delete(id)
    set((s) => ({
      tags:  s.tags.filter((t) => t.id !== id),
      notes: s.notes.map((n) => ({ ...n, tags: n.tags.filter((t) => t.id !== id) })),
    }))
  },

  renameNote: async (id, title) => {
    const updated = await notesApi.update(id, { title })
    set((s) => ({ notes: s.notes.map((n) => (n.id === id ? updated : n)) }))
  },

  updateTag: async (id, data) => {
    const updated = await tagsApi.update(id, data)
    set((s) => ({
      tags:  s.tags.map((t) => (t.id === id ? updated : t)),
      notes: s.notes.map((n) => ({ ...n, tags: n.tags.map((t) => (t.id === id ? updated : t)) })),
    }))
  },

  setNoteTags: async (noteId, tagIds) => {
    const updated = await notesApi.update(noteId, { tagIds })
    set((s) => ({ notes: s.notes.map((n) => (n.id === noteId ? updated : n)) }))
  },
}))
