import { http } from './client'
import type { Tag } from '../types'

export const tagsApi = {
  list:   ()                                                     => http.get<Tag[]>('/tags'),
  create: (data: { name: string; color?: string })              => http.post<Tag>('/tags', data),
  update: (id: number, data: { name?: string; color?: string }) => http.put<Tag>(`/tags/${id}`, data),
  delete: (id: number)                                           => http.delete(`/tags/${id}`),
}
