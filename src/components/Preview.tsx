import { useEffect, useState } from 'react'
import { marked } from 'marked'
import { useNoteStore, selectActiveNote } from '../stores/noteStore'
import { useSettingsStore } from '../stores/settingsStore'

marked.use({ gfm: true })

export function Preview() {
  const activeNote = useNoteStore(selectActiveNote)
  const theme = useSettingsStore((s) => s.settings.ui.theme)
  const [html, setHtml] = useState('')

  useEffect(() => {
    Promise.resolve(marked.parse(activeNote?.body ?? '')).then(setHtml)
  }, [activeNote?.body])

  return (
    <div
      className={`p-4 text-sm md u-text-1 h-full ${theme}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
