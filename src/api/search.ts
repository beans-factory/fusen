import { http } from './client'
import type { Note } from '../types'

export const searchApi = {
  search: (q: string) => http.get<Note[]>(`/search?q=${encodeURIComponent(q)}`),
}
