import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { Plus, Tag, Check, Search, Trash2, X, Pencil, StickyNote } from 'lucide-react'
import { useNoteStore } from '../stores/noteStore'
import { useUIStore }   from '../stores/uiStore'
import { useSettingsStore } from '../stores/settingsStore'
import { ConfirmModal } from '../components/ConfirmModal'
import { hexToRgba, PRESET_COLORS } from '../utils/color'
import { useT } from '../i18n'
import { APP_NAME, DEFAULT_NOTE_TITLE, LOCALE_MAP } from '../constants'
import type { Note, Tag as TagType } from '../types'

// ─── Color Picker ─────────────────────────────────────────────────
function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  const t = useT()
  return (
    <div>
      <div className="grid gap-1 mb-2" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            className="rounded cursor-pointer transition-transform hover:scale-110"
            style={{
              width: 20, height: 20, background: c, border: 'none', padding: 0,
              outline:       value.toLowerCase() === c ? `2.5px solid ${c}` : '2px solid transparent',
              outlineOffset: value.toLowerCase() === c ? 2 : 0,
            }}
            onClick={(e) => { e.preventDefault(); onChange(c) }}
          />
        ))}
      </div>
      <label className="flex items-center gap-1.5 cursor-pointer">
        <span
          className="block rounded flex-shrink-0"
          style={{ width: 20, height: 20, background: value, border: '2px solid var(--c-border)' }}
        />
        <span className="text-xs u-text-3">{t.board.custom}</span>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
        />
      </label>
    </div>
  )
}

// ─── Tag Edit Popover ─────────────────────────────────────────────
interface TagEditProps {
  tag:    TagType
  rect:   DOMRect
  onDone: () => void
}

function TagEditPopover({ tag, rect, onDone }: TagEditProps) {
  const { updateTag, deleteTag } = useNoteStore()
  const t = useT()
  const [name, setName]   = useState(tag.name)
  const [color, setColor] = useState(tag.color ?? '#6b7280')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onDone()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onDone])

  const save = async () => {
    const trimmed = name.trim()
    if (trimmed) await updateTag(tag.id, { name: trimmed, color })
    onDone()
  }

  const remove = async () => {
    await deleteTag(tag.id)
    onDone()
  }

  const top  = Math.min(rect.bottom + 6, window.innerHeight - 200)
  const left = Math.min(rect.left, window.innerWidth - 200)

  return (
    <div
      ref={ref}
      className="fixed z-30 rounded-md shadow-xl p-2.5"
      style={{ top, left, width: 192, background: 'var(--c-sidebar)', border: '1px solid var(--c-border)' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-2">
        <ColorPicker value={color} onChange={setColor} />
      </div>
      <input
        className="u-rename text-xs w-full mb-2"
        style={{ padding: '3px 6px' }}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') onDone() }}
        autoFocus
      />
      <div className="flex items-center justify-between">
        <button className="u-btn text-xs px-2 py-0.5 font-medium" onClick={save}>{t.board.save}</button>
        <button className="u-btn text-xs px-2 py-0.5" style={{ color: '#f87171' }} onClick={remove}>{t.board.delete}</button>
      </div>
    </div>
  )
}

// ─── New Tag Popover ──────────────────────────────────────────────
function NewTagPopover({ rect, onDone }: { rect: DOMRect; onDone: () => void }) {
  const { createTag } = useNoteStore()
  const t = useT()
  const [name, setName]   = useState('')
  const [color, setColor] = useState('#6b7280')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onDone()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onDone])

  const commit = async () => {
    if (name.trim()) await createTag(name.trim(), color)
    onDone()
  }

  const top  = Math.min(rect.bottom + 6, window.innerHeight - 210)
  const left = Math.min(rect.left, window.innerWidth - 200)

  return (
    <div
      ref={ref}
      className="fixed z-30 rounded-md shadow-xl p-2.5"
      style={{ top, left, width: 192, background: 'var(--c-sidebar)', border: '1px solid var(--c-border)' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-2">
        <ColorPicker value={color} onChange={setColor} />
      </div>
      <input
        className="u-rename text-xs w-full mb-2"
        style={{ padding: '3px 6px' }}
        placeholder={t.board.tagName}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') onDone() }}
        autoFocus
      />
      <div className="flex items-center justify-between">
        <button className="u-btn text-xs px-2 py-0.5 font-medium" onClick={commit}>{t.board.create}</button>
        <button className="u-btn text-xs px-2 py-0.5" onClick={onDone}>{t.board.cancel}</button>
      </div>
    </div>
  )
}

// ─── Tag Picker (multi-select, on card) ──────────────────────────
interface TagPickerProps {
  note:    Note
  allTags: TagType[]
  onClose: () => void
}

function TagPicker({ note, allTags, onClose }: TagPickerProps) {
  const { setNoteTags } = useNoteStore()
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

  const toggle = useCallback(async (tagId: number) => {
    const newIds = new Set(assignedIds)
    if (newIds.has(tagId)) newIds.delete(tagId)
    else newIds.add(tagId)
    await setNoteTags(note.id, [...newIds])
  }, [assignedIds, note.id, setNoteTags])

  return (
    <div
      ref={ref}
      className="absolute bottom-full left-0 mb-1 rounded-md shadow-xl z-20 overflow-hidden"
      style={{ minWidth: 160, background: 'var(--c-sidebar)', border: '1px solid var(--c-border)' }}
      onClick={(e) => e.stopPropagation()}
    >
      {allTags.length === 0 ? (
        <div className="px-3 py-2 text-xs u-text-3">{t.board.noTags}</div>
      ) : (
        allTags.map((tag) => {
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

// ─── Note Card ───────────────────────────────────────────────────
interface CardProps {
  note:     Note
  allTags:  TagType[]
  onClick:  () => void
  onDelete: () => void
}

function NoteCard({ note, allTags, onClick, onDelete }: CardProps) {
  const t = useT()
  const language = useSettingsStore((s) => s.settings.ui.language)
  const [showTagPicker, setShowTagPicker] = useState(false)

  const preview = note.body
    .replace(/^#+\s*/gm, '')
    .replace(/[*_`]/g, '')
    .trim()
    .slice(0, 160)

  const date = new Date(note.updatedAt).toLocaleDateString(LOCALE_MAP[language], { month: 'short', day: 'numeric' })

  return (
    <div
      className="note-card flex flex-col gap-2 p-3 cursor-pointer group relative"
      style={{ background: 'var(--c-sidebar)', minHeight: 128 }}
      onClick={onClick}
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-1">
        <span className="text-sm font-semibold u-text-1 leading-snug flex-1" style={{
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {note.title}
        </span>
        <button
          className="u-btn p-0.5 opacity-0 group-hover:opacity-100 flex-shrink-0 mt-0.5"
          style={{ color: 'var(--c-danger)' }}
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          title="Delete"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Body preview */}
      {preview && (
        <p className="text-xs u-text-3 leading-relaxed flex-1" style={{
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {preview}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center gap-1.5 mt-auto pt-1">
        {/* Tags */}
        <div className="flex items-center gap-1 flex-1 min-w-0 overflow-hidden">
          {note.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="text-xs px-1.5 py-px rounded-full font-medium flex-shrink-0"
              style={{
                background: hexToRgba(tag.color ?? '#6b7280', 0.2),
                color: tag.color ?? 'var(--c-text-3)',
              }}
            >
              {tag.name}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span className="text-xs u-text-3 flex-shrink-0">+{note.tags.length - 3}</span>
          )}
        </div>

        {/* Date + tag picker */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-xs u-text-3">{date}</span>
          <div className="relative">
            <button
              className="u-btn p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => { e.stopPropagation(); setShowTagPicker((v) => !v) }}
              title={t.editor.editTags}
            >
              <Tag size={11} />
            </button>
            {showTagPicker && (
              <TagPicker
                note={note}
                allTags={allTags}
                onClose={() => setShowTagPicker(false)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Board ───────────────────────────────────────────────────────
export function BoardView() {
  const { notes, tags, selectNote, createNote, deleteNote } = useNoteStore()
  const { setView, focusBoardSearch, clearBoardSearchFocus } = useUIStore()
  const statusBarColor = useSettingsStore((s) => s.settings.ui.statusBarColor)
  const t = useT()

  const [activeTags, setActiveTags]         = useState<Set<number>>(new Set())
  const [query, setQuery]                   = useState('')
  const [addingTagRect, setAddingTagRect]   = useState<DOMRect | null>(null)
  const [editingTagInfo, setEditingTagInfo] = useState<{ tag: TagType; rect: DOMRect } | null>(null)
  const [deleteTarget, setDeleteTarget]     = useState<Note | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (focusBoardSearch) { searchRef.current?.focus(); clearBoardSearchFocus() }
  }, [focusBoardSearch, clearBoardSearchFocus])

  const toggleActiveTag = useCallback((id: number) => {
    setActiveTags((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const filtered = useMemo(() => {
    let result = notes
    if (activeTags.size > 0) {
      result = result.filter((n) => n.tags.some((t) => activeTags.has(t.id)))
    }
    if (query.trim()) {
      const q = query.toLowerCase()
      result = result.filter((n) => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q))
    }
    return result
  }, [notes, activeTags, query])

  const openNote  = (note: Note) => { selectNote(note.id); setView('editor') }
  const handleNew = async () => {
    const tagIds = activeTags.size === 1 ? [...activeTags] : []
    await createNote(DEFAULT_NOTE_TITLE, tagIds)
    setView('editor')
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    const id = deleteTarget.id
    setDeleteTarget(null)
    deleteNote(id)
  }

  const allActive = activeTags.size === 0

  return (
    <div className="flex flex-col h-full u-editor">

      {/* Header */}
      <div className="flex items-center gap-2 px-4 h-9 border-b flex-shrink-0 u-toolbar u-border">
        <span
          className="text-xs font-bold uppercase select-none cursor-default"
          style={{ color: statusBarColor, letterSpacing: '0.2em' }}
        >
          {APP_NAME}
        </span>
        {filtered.length > 0 && (
          <span
            className="text-xs select-none"
            style={{
              background: 'var(--c-border)', color: 'var(--c-text-3)',
              padding: '1px 6px', borderRadius: 10, fontVariantNumeric: 'tabular-nums',
            }}
          >
            {filtered.length}
          </span>
        )}
        <div className="flex-1" />
        <button
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded"
          style={{
            background: statusBarColor, color: '#1e1e1e',
            border: 'none', cursor: 'pointer',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          onClick={handleNew}
        >
          <Plus size={13} /> {t.board.newMemo}
        </button>
      </div>

      {/* Search hero */}
      <div className="px-6 pt-5 pb-3 flex-shrink-0">
        <div
          className="relative rounded-lg transition-all"
          style={{ border: `1.5px solid ${query ? statusBarColor : 'var(--c-border)'}` }}
        >
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: query ? statusBarColor : 'var(--c-text-3)' }}
          />
          <input
            ref={searchRef}
            className="w-full bg-transparent outline-none u-text-1"
            style={{ padding: '9px 80px 9px 36px', fontSize: 13 }}
            placeholder={t.board.search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={(e) => (e.currentTarget.parentElement!.style.borderColor = statusBarColor)}
            onBlur={(e) => (e.currentTarget.parentElement!.style.borderColor = query ? statusBarColor : 'var(--c-border)')}
            onKeyDown={(e) => { if (e.key === 'Escape') { setQuery(''); searchRef.current?.blur() } }}
          />
          {query ? (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 u-btn p-0.5"
              onClick={() => { setQuery(''); searchRef.current?.focus() }}
            >
              <X size={13} />
            </button>
          ) : (
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs select-none pointer-events-none"
              style={{ color: 'var(--c-text-3)', background: 'var(--c-border)', padding: '1px 5px', borderRadius: 3 }}
            >
              Ctrl+.
            </span>
          )}
        </div>
      </div>

      {/* Tag chips — horizontal scroll, no wrap */}
      <div className="tags-scroll px-6 pb-3 flex-shrink-0">
        <button
          className="px-2.5 py-0.5 rounded-full text-xs font-medium"
          style={{
            background: allActive ? statusBarColor : 'var(--c-border)',
            color:      allActive ? '#1e1e1e'      : 'var(--c-text-2)',
            border: 'none', cursor: 'pointer',
          }}
          onClick={() => setActiveTags(new Set())}
        >
          {t.board.all}
        </button>

        {tags.map((tag) => {
          const active = activeTags.has(tag.id)
          const bg     = active ? hexToRgba(tag.color ?? '#6b7280', 0.2) : 'var(--c-border)'
          const fg     = active ? (tag.color ?? 'var(--c-text-1)') : 'var(--c-text-2)'
          return (
            <div key={tag.id} className="group flex items-center rounded-full overflow-visible" style={{ background: bg }}>
              <button
                className="flex items-center gap-1.5 pl-2 pr-1 py-0.5 text-xs font-medium"
                style={{ background: 'transparent', color: fg, border: 'none', cursor: 'pointer' }}
                onClick={() => toggleActiveTag(tag.id)}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: tag.color ?? '#6b7280' }} />
                {tag.name}
              </button>
              <button
                className="opacity-0 group-hover:opacity-100 pr-1.5 py-0.5 u-btn"
                style={{ background: 'transparent', border: 'none' }}
                title={t.editor.editTags}
                onClick={(e) => {
                  e.stopPropagation()
                  setEditingTagInfo({ tag, rect: e.currentTarget.getBoundingClientRect() })
                }}
              >
                <Pencil size={9} />
              </button>
            </div>
          )
        })}

        <button
          className="u-btn p-0.5"
          onClick={(e) => setAddingTagRect(e.currentTarget.getBoundingClientRect())}
        >
          <Plus size={12} />
        </button>
      </div>

      <div className="border-b u-border flex-shrink-0" />

      {/* Card grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: 'var(--c-text-3)' }}>
            {query ? (
              <>
                <Search size={28} style={{ opacity: 0.25 }} />
                <p className="text-sm">「<strong style={{ color: 'var(--c-text-2)' }}>{query}</strong>」{t.board.noResults}</p>
              </>
            ) : (
              <>
                <StickyNote size={32} style={{ opacity: 0.15 }} />
                <p style={{ fontStyle: 'italic', fontSize: 12, opacity: 0.35, maxWidth: 220, textAlign: 'center' }}>
                  "Just how much debt do I owe anyway?"
                </p>
                <button
                  className="u-btn gap-1.5 px-3 py-1.5 text-xs"
                  style={{ border: '1px solid var(--c-border)', borderRadius: 6, marginTop: 4 }}
                  onClick={handleNew}
                >
                  <Plus size={13} /> {t.board.newMemo}
                </button>
              </>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 14 }}>
            {filtered.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                allTags={tags}
                onClick={() => openNote(note)}
                onDelete={() => setDeleteTarget(note)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Popovers */}
      {addingTagRect && (
        <NewTagPopover rect={addingTagRect} onDone={() => setAddingTagRect(null)} />
      )}
      {editingTagInfo && (
        <TagEditPopover
          tag={editingTagInfo.tag}
          rect={editingTagInfo.rect}
          onDone={() => setEditingTagInfo(null)}
        />
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <ConfirmModal
          title={t.board.deleteTitle}
          message={`"${deleteTarget.title}" — ${t.board.deleteUndo}`}
          confirm={t.board.delete}
          cancel={t.board.cancel}
          onOk={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
