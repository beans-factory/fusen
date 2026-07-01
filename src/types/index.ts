export interface Tag {
  id:        number
  name:      string
  color:     string | null
  createdAt: string
  updatedAt: string
}

export interface Note {
  id:        number
  title:     string
  body:      string
  tags:      Tag[]
  createdAt: string
  updatedAt: string
}
