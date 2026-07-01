export const noteInclude = { noteTags: { include: { tag: true } } } as const

export function formatNote(note: { noteTags: { tag: unknown }[]; [key: string]: unknown }) {
  const { noteTags, ...rest } = note
  return { ...rest, tags: noteTags.map((nt) => nt.tag) }
}
