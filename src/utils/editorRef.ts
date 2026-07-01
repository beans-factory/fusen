import type { editor } from 'monaco-editor'

let instance: editor.IStandaloneCodeEditor | null = null

export function setEditorInstance(e: editor.IStandaloneCodeEditor | null): void {
  instance = e
}

export function openEditorCommandPalette(): void {
  if (!instance) return
  instance.focus()
  instance.trigger('keyboard', 'editor.action.quickCommand', null)
}
