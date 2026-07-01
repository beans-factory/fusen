import { useState, useEffect, useMemo, useRef } from 'react'
import { ChevronLeft, Eye, EyeOff, Settings, Tag as TagIcon, Check, Plus, Trash2, Pencil } from 'lucide-react'
import { BoardView }        from '../views/BoardView'
import { Editor }           from '../components/Editor'
import { Preview }          from '../components/Preview'
import { StatusBar }        from '../components/StatusBar'
import { SettingsPanel }    from '../components/SettingsPanel'
import { ConfirmModal }     from '../components/ConfirmModal'
import { ResizeHandle }     from '../components/ResizeHandle'
import { useUIStore }        from '../stores/uiStore'
import { useSettingsStore }  from '../stores/settingsStore'
import { useNoteStore, selectActiveNote } from '../stores/noteStore'
import { useResizablePanel } from '../hooks/useResizablePanel'
import { hexToRgba } from '../utils/color'
import { DEFAULT_NOTE_TITLE } from '../constants'
import { useT } from '../i18n'
import type { Note } from '../types'

// ─── Editor tag dropdown ──────────────────────────────────────────
function EditorTagPicker({ note, onClose }: { note: Note; onClose: () => void }) {
  const { tags, setNoteTags } = useNoteStore()
  const t = useT()
  const ref = useRef<HTMLDivElement>(null)
  const assignedIds = useMemo(() => new Set(note.tags.map((t) => t.id)), [note.tags])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const toggle = async (tagId: number) => {
    const newIds = new Set(assignedIds)
    if (newIds.has(tagId)) newIds.delete(tagId)
    else newIds.add(tagId)
    await setNoteTags(note.id, [...newIds])
  }

  return (
    <div
      ref={ref}
      className="absolute top-full right-0 mt-1 rounded-md shadow-xl z-30 overflow-hidden"
      style={{ minWidth: 160, background: 'var(--c-sidebar)', border: '1px solid var(--c-border)' }}
      onClick={(e) => e.stopPropagation()}
    >
      {tags.length === 0 ? (
        <div className="px-3 py-2 text-xs u-text-3">{t.editor.noTags}</div>
      ) : (
        tags.map((tag) => {
          const on = assignedIds.has(tag.id)
          return (
            <div
              key={tag.id}
              className="flex items-center gap-2 px-3 py-1.5 cursor-pointer text-xs u-text-2 hover:bg-[var(--c-hover)]"
              onClick={() => toggle(tag.id)}
            >
              <div
                className="flex items-center justify-center rounded flex-shrink-0"
                style={{
                  width: 14, height: 14,
                  border: `1.5px solid ${tag.color ?? '#6b7280'}`,
                  background: on ? (tag.color ?? '#6b7280') : 'transparent',
                }}
              >
                {on && <Check size={8} color="#fff" />}
              </div>
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: tag.color ?? '#6b7280' }} />
              <span className="truncate">{tag.name}</span>
            </div>
          )
        })
      )}
    </div>
  )
}

// ─── Top bar ─────────────────────────────────────────────────────
interface TopBarProps {
  activeNote:       Note | null
  statusBarColor:   string
  showPreview:      boolean
  settingsActive?:  boolean
  onBack:           () => void
  onNewMemo:        () => void
  onDelete:         () => void
  onTogglePreview:  () => void
  onToggleSettings: () => void
}

function EditorTopBar({
  activeNote, statusBarColor, showPreview, settingsActive,
  onBack, onNewMemo, onDelete, onTogglePreview, onToggleSettings,
}: TopBarProps) {
  const { renameNote } = useNoteStore()
  const t = useT()
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft]     = useState('')
  const [titleHovered, setTitleHovered] = useState(false)
  const [showTagPicker, setShowTagPicker] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)

  const startRename = () => {
    if (!activeNote) return
    setTitleDraft(activeNote.title)
    setEditingTitle(true)
    setTimeout(() => { titleRef.current?.focus(); titleRef.current?.select() }, 0)
  }

  const commitRename = () => {
    if (titleDraft.trim() && activeNote) renameNote(activeNote.id, titleDraft.trim())
    setEditingTitle(false)
  }

  useEffect(() => { setEditingTitle(false) }, [activeNote?.id])

  return (
    <div className="flex items-center gap-0.5 px-2 h-9 border-b flex-shrink-0 u-toolbar u-border">

      {/* ← Back */}
      <button className="u-btn p-1 flex-shrink-0" onClick={onBack} title="ボードへ戻る">
        <ChevronLeft size={16} />
      </button>

      {/* + New Memo */}
      <button className="u-btn p-1 flex-shrink-0" onClick={onNewMemo} title={`${t.commands.newMemo} (Ctrl+N)`}>
        <Plus size={15} />
      </button>

      <div className="w-px h-4 mx-1 flex-shrink-0" style={{ background: 'var(--c-border)' }} />

      {/* Title — click to rename */}
      {activeNote ? (
        editingTitle ? (
          <input
            ref={titleRef}
            className="flex-1 min-w-0 bg-transparent outline-none text-sm u-text-1"
            style={{ padding: '1px 6px', border: '1px solid var(--c-accent)', borderRadius: 3 }}
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setEditingTitle(false) }}
          />
        ) : (
          <button
            className="flex items-center gap-1 flex-1 min-w-0 text-left u-btn"
            style={{ padding: '2px 4px', borderRadius: 3 }}
            title={t.editor.renameHint}
            onClick={startRename}
            onMouseEnter={() => setTitleHovered(true)}
            onMouseLeave={() => setTitleHovered(false)}
          >
            <span className="text-sm u-text-1 truncate font-medium">{activeNote.title}</span>
            <Pencil
              size={11}
              className="flex-shrink-0 transition-opacity"
              style={{ opacity: titleHovered ? 0.5 : 0, color: 'var(--c-text-3)' }}
            />
          </button>
        )
      ) : (
        <div className="flex-1" />
      )}

      {/* Tags */}
      {activeNote && !editingTitle && (
        <div className="relative flex items-center gap-1 flex-shrink-0 ml-1">
          {activeNote.tags.slice(0, 2).map((tag) => (
            <span
              key={tag.id}
              className="px-1.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
              style={{
                background: hexToRgba(tag.color ?? '#6b7280', 0.2),
                color: tag.color ?? 'var(--c-text-3)',
              }}
            >
              {tag.name}
            </span>
          ))}
          {activeNote.tags.length > 2 && (
            <span className="text-xs u-text-3 flex-shrink-0">+{activeNote.tags.length - 2}</span>
          )}
          <button
            className="u-btn p-0.5 flex-shrink-0"
            title={t.editor.editTags}
            onClick={() => setShowTagPicker((v) => !v)}
          >
            <TagIcon size={13} />
          </button>
          {showTagPicker && (
            <EditorTagPicker note={activeNote} onClose={() => setShowTagPicker(false)} />
          )}
        </div>
      )}

      <div className="w-1" />

      {/* Preview toggle */}
      <button
        className="u-btn flex-shrink-0"
        style={{ color: showPreview ? statusBarColor : undefined }}
        onClick={onTogglePreview}
        title="Toggle Preview"
      >
        {showPreview ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>

      {/* Settings */}
      <button
        className={`u-btn flex-shrink-0 ${settingsActive ? 'active' : ''}`}
        onClick={onToggleSettings}
        title="Settings (Ctrl+,)"
      >
        <Settings size={15} />
      </button>

      {/* Delete — separated, destructive */}
      {activeNote && (
        <>
          <div className="w-px h-4 mx-1 flex-shrink-0" style={{ background: 'var(--c-border)' }} />
          <button
            className="u-btn flex-shrink-0"
            style={{ color: 'var(--c-danger)' }}
            onClick={onDelete}
            title={t.board.deleteTitle}
          >
            <Trash2 size={14} />
          </button>
        </>
      )}
    </div>
  )
}

// ─── Editor view ─────────────────────────────────────────────────
function EditorView() {
  const activeNote = useNoteStore(selectActiveNote)
  const { createNote, deleteNote } = useNoteStore()
  const { showPreview, showSettings, togglePreview, toggleSettings, setView } = useUIStore()
  const statusBarColor = useSettingsStore((s) => s.settings.ui.statusBarColor)
  const t = useT()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { width: previewWidth, startResize: startPreviewResize } =
    useResizablePanel('dept-preview-w', 288, 160, 600)

  const handleNewMemo = async () => {
    await createNote(DEFAULT_NOTE_TITLE)
    // activeNoteId updated in store → Editor shows new note automatically
  }

  const handleDeleteConfirmed = () => {
    if (!activeNote) return
    const id = activeNote.id
    setShowDeleteConfirm(false)
    deleteNote(id)
    setView('board')
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 view-enter">
      <EditorTopBar
        activeNote={activeNote}
        statusBarColor={statusBarColor}
        showPreview={showPreview}
        settingsActive={showSettings}
        onBack={() => setView('board')}
        onNewMemo={handleNewMemo}
        onDelete={() => setShowDeleteConfirm(true)}
        onTogglePreview={togglePreview}
        onToggleSettings={toggleSettings}
      />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 min-w-0 u-editor">
          <Editor />
        </div>
        {showPreview && (
          <>
            <ResizeHandle color={statusBarColor} onMouseDown={(e) => startPreviewResize(e, -1)} />
            <div
              style={{ width: previewWidth, flexShrink: 0 }}
              className="border-l u-sidebar u-border overflow-y-auto"
            >
              <Preview />
            </div>
          </>
        )}
      </div>

      {showDeleteConfirm && activeNote && (
        <ConfirmModal
          title={t.board.deleteTitle}
          message={`"${activeNote.title}" — ${t.board.deleteUndo}`}
          confirm={t.board.delete}
          cancel={t.board.cancel}
          onOk={handleDeleteConfirmed}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  )
}

// ─── Root ────────────────────────────────────────────────────────
export function MainLayout() {
  const { view, showSettings, toggleSettings } = useUIStore()

  return (
    <>
      {view === 'board'
        ? <div key="board" className="flex flex-col flex-1 min-h-0 view-enter"><BoardView /></div>
        : <EditorView />
      }

      {/* Settings as a fixed overlay — consistent in both views */}
      {showSettings && (
        <div className="fixed inset-0 z-40 flex flex-col u-editor">
          <SettingsPanel onClose={toggleSettings} />
        </div>
      )}

      <StatusBar />
    </>
  )
}
