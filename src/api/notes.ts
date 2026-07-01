import { http } from './client'
import type { Note } from '../types'

export const notesApi = {
  list:   ()                                                                                    => http.get<Note[]>('/notes'),
  create: (data: { title: string; body?: string; tagIds?: number[] })                           => http.post<Note>('/notes', data),
  update: (id: number, data: Partial<Pick<Note, 'title' | 'body'>> & { tagIds?: number[] })    => http.put<Note>(`/notes/${id}`, data),
  delete: (id: number)                                                                           => http.delete(`/notes/${id}`),
}
