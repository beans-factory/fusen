import MonacoEditor, { useMonaco, type OnMount } from '@monaco-editor/react'
import { useCallback, useEffect, useRef } from 'react'
import { useNoteStore, selectActiveNote } from '../stores/noteStore'
import { useUIStore }   from '../stores/uiStore'
import { useSettingsStore } from '../stores/settingsStore'
import { detectLanguage } from '../utils/language'
import { exportToZip } from '../utils/export'
import { DEFAULT_NOTE_TITLE } from '../constants'
import { setEditorInstance } from '../utils/editorRef'
import { useT } from '../i18n'

function useWikiLinkCompletion() {
  const monaco = useMonaco()

  useEffect(() => {
    if (!monaco) return

    const disposable = monaco.languages.registerCompletionItemProvider('markdown', {
      triggerCharacters: ['['],
      provideCompletionItems: (model, position) => {
        const lineText = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        })

        const bracketIdx = lineText.lastIndexOf('[[')
        if (bracketIdx === -1) return { suggestions: [] }

        const afterBracket = lineText.slice(bracketIdx + 2)
        if (afterBracket.includes(']]')) return { suggestions: [] }

        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber:   position.lineNumber,
          startColumn:     position.column - afterBracket.length,
          endColumn:       position.column,
        }

        const notes = useNoteStore.getState().notes
        return {
          suggestions: notes.map((note) => ({
            label:         note.title,
            kind:          monaco.languages.CompletionItemKind.File,
            insertText:    `${note.title}]]`,
            range,
            detail:        'Memo',
            documentation: { value: `Link to **${note.title}**` },
          })),
        }
      },
    })

    return () => disposable.dispose()
  }, [monaco])
}

export function Editor() {
  const activeNote = useNoteStore(selectActiveNote)
  const updateNote = useNoteStore((s) => s.updateNote)
  const { settings } = useSettingsStore()
  const { editor: es, ui: { theme } } = settings
  const t = useT()
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useWikiLinkCompletion()

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  const onChange = useCallback((val: string | undefined) => {
    if (!activeNote || val === undefined) return
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => updateNote(activeNote.id, { body: val }), 800)
  }, [activeNote, updateNote])

  // Register app commands inside Monaco so they appear in Monaco's command palette (F1 / Ctrl+K)
  const handleMount: OnMount = useCallback((editor) => {
    setEditorInstance(editor)
    editor.onDidDispose(() => setEditorInstance(null))

    // ── App commands (no keybindings — shortcuts handled at window level) ──

    editor.addAction({
      id:    'fusen.newMemo',
      label: `Fusen: ${t.commands.newMemo}`,
      run:   () => {
        useNoteStore.getState().createNote(DEFAULT_NOTE_TITLE)
        // note: view is already 'editor', no switch needed
      },
    })

    editor.addAction({
      id:    'fusen.togglePreview',
      label: `Fusen: ${t.commands.showPreview} / ${t.commands.hidePreview}`,
      run:   () => useUIStore.getState().togglePreview(),
    })

    editor.addAction({
      id:    'fusen.openSettings',
      label: `Fusen: ${t.commands.settings}`,
      run:   () => useUIStore.getState().toggleSettings(),
    })

    editor.addAction({
      id:    'fusen.toggleTheme',
      label: `Fusen: ${t.commands.lightTheme} / ${t.commands.darkTheme}`,
      run:   () => {
        const s = useSettingsStore.getState()
        const next = s.settings.ui.theme === 'dark' ? 'light' : 'dark'
        s.setSettings({ ...s.settings, ui: { ...s.settings.ui, theme: next } })
      },
    })

    editor.addAction({
      id:    'fusen.export',
      label: `Fusen: ${t.commands.export}`,
      run:   async () => {
        const { notes, tags } = useNoteStore.getState()
        const ok = window.confirm(
          `${t.commands.exportTitle}\n${notes.length} ${t.statusBar.notes} · ${tags.length} ${t.statusBar.tags} → ZIP`,
        )
        if (ok) await exportToZip(notes)
      },
    })
  }, [t])

  if (!activeNote) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 u-editor" style={{ color: 'var(--c-text-3)' }}>
        <p style={{ fontStyle: 'italic', fontSize: 12, letterSpacing: '0.03em', opacity: 0.4 }}>
          "Just how much debt do I owe anyway?"
        </p>
        <div className="flex gap-4 text-xs">
          <kbd className="px-1.5 py-0.5 rounded" style={{ background: 'var(--c-border)' }}>Ctrl+N</kbd>
          <span>{t.editor.shortcutNewNote}</span>
        </div>
      </div>
    )
  }

  return (
    <MonacoEditor
      key={activeNote.id}
      height="100%"
      language={detectLanguage(activeNote.title)}
      theme={theme === 'dark' ? 'vs-dark' : 'light'}
      value={activeNote.body}
      onChange={onChange}
      onMount={handleMount}
      options={{
        minimap:              { enabled: es.minimap },
        wordWrap:             es.wordWrap,
        lineNumbers:          es.lineNumbers,
        fontSize:             es.fontSize,
        fontFamily:           es.fontFamily,
        tabSize:              es.tabSize,
        lineHeight:           es.lineHeight || 0,
        smoothScrolling:      es.smoothScrolling,
        cursorBlinking:       es.cursorBlinking,
        renderLineHighlight:  es.renderLineHighlight,
        fontLigatures:           es.fontLigatures,
        stickyScroll:            { enabled: es.stickyScroll },
        mouseWheelZoom:          es.mouseWheelZoom,
        renderWhitespace:        es.renderWhitespace,
        trimAutoWhitespace:      es.trimAutoWhitespace,
        insertSpaces:            es.insertSpaces,
        autoClosingBrackets:     es.autoClosingBrackets,
        autoClosingQuotes:       es.autoClosingQuotes,
        autoSurround:            es.autoSurround,
        matchBrackets:           es.matchBrackets,
        bracketPairColorization: { enabled: es.bracketPairColorization },
        guides:                  { bracketPairs: es.guides, indentation: es.guides },
        scrollBeyondLastLine:    false,
        automaticLayout:         true,
        padding:                 { top: 16 },
      }}
    />
  )
}
