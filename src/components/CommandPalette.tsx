import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { FilePlus, Eye, EyeOff, Settings, Download, Sun, Moon } from 'lucide-react'
import { useNoteStore } from '../stores/noteStore'
import { useUIStore }   from '../stores/uiStore'
import { useSettingsStore } from '../stores/settingsStore'
import { exportToZip } from '../utils/export'
import { DEFAULT_NOTE_TITLE } from '../constants'
import { ConfirmModal } from './ConfirmModal'
import { useT } from '../i18n'

// ─── Shared shell ────────────────────────────────────────────────
interface Item {
  id:       string
  label:    string
  icon:     React.ReactNode
  shortcut?: string
  action:   () => void
}

interface PaletteShellProps {
  placeholder: string
  items:       Item[]
  onClose:     () => void
}

function PaletteShell({ placeholder, items, onClose }: PaletteShellProps) {
  const [query, setQuery]       = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? items.filter((i) => i.label.toLowerCase().includes(q)) : items
  }, [query, items])

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 10) }, [])
  useEffect(() => { setSelected(0) }, [query])

  const execute = useCallback((idx: number) => { filtered[idx]?.action() }, [filtered])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape')    { onClose(); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((s) => Math.min(s + 1, filtered.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)) }
    if (e.key === 'Enter')     { e.preventDefault(); execute(selected) }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center"
      style={{ paddingTop: '15vh', background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-lg shadow-2xl overflow-hidden"
        style={{ maxWidth: 520, background: 'var(--c-sidebar)', border: '1px solid var(--c-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          className="w-full px-4 py-3 text-sm outline-none"
          style={{ background: 'transparent', color: 'var(--c-text-1)', borderBottom: '1px solid var(--c-border)' }}
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <div style={{ maxHeight: 320, overflowY: 'auto' }}>
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm" style={{ color: 'var(--c-text-3)' }}>No results</div>
          ) : (
            filtered.map((item, i) => (
              <div
                key={item.id}
                className="flex items-center gap-3 px-4 py-2 cursor-pointer text-sm"
                style={{ background: i === selected ? 'var(--c-active)' : 'transparent', color: 'var(--c-text-1)' }}
                onMouseEnter={() => setSelected(i)}
                onClick={() => execute(i)}
              >
                <span style={{ color: 'var(--c-text-3)', flexShrink: 0 }}>{item.icon}</span>
                <span className="flex-1 truncate">{item.label}</span>
                {item.shortcut && (
                  <span className="text-xs" style={{ color: 'var(--c-text-3)' }}>{item.shortcut}</span>
                )}
              </div>
            ))
          )}
        </div>
        <div
          className="flex items-center gap-4 px-4 py-1.5 text-xs select-none"
          style={{ color: 'var(--c-text-3)', borderTop: '1px solid var(--c-border)' }}
        >
          <span>↑↓ navigate</span><span>↵ select</span><span>Esc close</span>
        </div>
      </div>
    </div>
  )
}

// ─── Command palette (Ctrl+K) ────────────────────────────────────
function CommandsPalette({ onClose }: { onClose: () => void }) {
  const notes  = useNoteStore((s) => s.notes)
  const tags   = useNoteStore((s) => s.tags)
  const { showPreview, togglePreview, toggleSettings, setView } = useUIStore()
  const { settings, setSettings } = useSettingsStore()
  const [confirmExport, setConfirmExport] = useState(false)
  const t = useT()

  const items: Item[] = useMemo(() => [
    {
      id: 'new-memo',
      label: t.commands.newMemo,
      shortcut: 'Ctrl+N',
      icon: <FilePlus size={14} />,
      action: () => {
        useNoteStore.getState().createNote(DEFAULT_NOTE_TITLE).then(() => setView('editor'))
        onClose()
      },
    },
    {
      id: 'toggle-preview',
      label: showPreview ? t.commands.hidePreview : t.commands.showPreview,
      icon: showPreview ? <EyeOff size={14} /> : <Eye size={14} />,
      action: () => { togglePreview(); onClose() },
    },
    {
      id: 'settings',
      label: t.commands.settings,
      shortcut: 'Ctrl+,',
      icon: <Settings size={14} />,
      action: () => { toggleSettings(); onClose() },
    },
    {
      id: 'export',
      label: t.commands.export,
      icon: <Download size={14} />,
      action: () => setConfirmExport(true),
    },
    {
      id: 'toggle-theme',
      label: settings.ui.theme === 'dark' ? t.commands.lightTheme : t.commands.darkTheme,
      icon: settings.ui.theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />,
      action: () => {
        setSettings({ ...settings, ui: { ...settings.ui, theme: settings.ui.theme === 'dark' ? 'light' : 'dark' } })
        onClose()
      },
    },
  ], [settings, showPreview, t, onClose, setView, togglePreview, toggleSettings, setSettings])

  return (
    <>
      <PaletteShell placeholder={t.commands.placeholder} items={items} onClose={onClose} />
      {confirmExport && (
        <ConfirmModal
          title={t.commands.exportTitle}
          message={`${notes.length} ${t.statusBar.notes} · ${tags.length} ${t.statusBar.tags} → ZIP`}
          confirm={t.commands.exportOk}
          cancel={t.board.cancel}
          onOk={async () => { setConfirmExport(false); await exportToZip(notes); onClose() }}
          onCancel={() => setConfirmExport(false)}
        />
      )}
    </>
  )
}

// ─── Root ────────────────────────────────────────────────────────
export function CommandPalette() {
  const { paletteMode, closePalette } = useUIStore()
  if (paletteMode === 'commands') return <CommandsPalette onClose={closePalette} />
  return null
}
