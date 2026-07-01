import { useEffect } from 'react'
import { useUIStore } from '../stores/uiStore'
import { useNoteStore } from '../stores/noteStore'
import { DEFAULT_NOTE_TITLE } from '../constants'
import { openEditorCommandPalette } from '../utils/editorRef'

export function useKeyboard() {
  const { view, setView, toggleSettings, openPalette, triggerBoardSearch } = useUIStore()

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey
      if (!mod) return

      if (e.key === 'n' && !e.shiftKey) {
        e.preventDefault()
        useNoteStore.getState().createNote(DEFAULT_NOTE_TITLE).then(() => setView('editor'))
      }
      if (e.key === ',') { e.preventDefault(); toggleSettings() }
      if (e.key === '.') { e.preventDefault(); triggerBoardSearch() }
      if (e.key === 'k') {
        e.preventDefault()
        if (view === 'board') openPalette('commands')
        else openEditorCommandPalette()
      }
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [view, setView, toggleSettings, openPalette, triggerBoardSearch])
}
