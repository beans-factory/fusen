import JSZip from 'jszip'
import type { Note } from '../types'

function sanitizeName(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, '-').trim() || 'Untitled'
}

export async function exportToZip(notes: Note[]): Promise<void> {
  const zip = new JSZip()

  for (const note of notes) {
    const filename = `${sanitizeName(note.title)}.md`
    const tagLine  = note.tags.length > 0 ? `tags: [${note.tags.map((t) => t.name).join(', ')}]\n` : ''
    const content  = `---\ntitle: ${note.title}\n${tagLine}created: ${note.createdAt}\nupdated: ${note.updatedAt}\n---\n\n${note.body}`
    zip.file(filename, content)
  }

  const blob = await zip.generateAsync({ type: 'blob' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `dept-export-${new Date().toISOString().slice(0, 10)}.zip`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
