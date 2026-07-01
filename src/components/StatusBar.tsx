import { useNoteStore, selectActiveNote } from '../stores/noteStore'
import { useSettingsStore } from '../stores/settingsStore'
import { useAuthStore } from '../stores/authStore'
import { useT } from '../i18n'
import { LOCALE_MAP } from '../constants'

function isLight(hex: string | undefined): boolean {
  if (!hex || hex.length < 7) return false
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 128
}

function fmtDate(d: string, locale: string): string {
  return new Date(d).toLocaleString(locale, { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export function StatusBar() {
  const { notes, tags, isSaving } = useNoteStore()
  const activeNote = useNoteStore(selectActiveNote)
  const { logout, userId } = useAuthStore()
  const statusBarColor = useSettingsStore((s) => s.settings.ui.statusBarColor)
  const language       = useSettingsStore((s) => s.settings.ui.language)
  const t = useT()

  const fg = isLight(statusBarColor) ? '#1e1e1e' : '#ffffff'

  return (
    <div
      className="flex items-center gap-3 px-3 flex-shrink-0 select-none"
      style={{ height: 22, background: statusBarColor, color: fg, fontSize: 12 }}
    >
      <span style={{ opacity: 0.75 }}>{notes.length} {t.statusBar.notes}</span>
      <span style={{ opacity: 0.4 }}>·</span>
      <span style={{ opacity: 0.75 }}>{tags.length} {t.statusBar.tags}</span>

      {activeNote && (
        <>
          <span className="flex-1 truncate" style={{ opacity: 0.6 }}>{activeNote.title}</span>
          <span style={{ opacity: 0.75 }}>{isSaving ? t.statusBar.saving : t.statusBar.saved}</span>
          <span style={{ opacity: 0.5 }}>{fmtDate(activeNote.updatedAt, LOCALE_MAP[language])}</span>
        </>
      )}

      {userId && (
        <>
          <div style={{ flex: activeNote ? 0 : 1 }} />
          <span style={{ opacity: 0.7, fontWeight: 500 }}>{userId}</span>
          <button
            onClick={logout}
            style={{ opacity: 0.6, fontSize: 11, cursor: 'pointer', background: 'none', border: 'none', color: 'inherit', padding: 0 }}
          >
            {t.statusBar.logout}
          </button>
        </>
      )}
    </div>
  )
}
