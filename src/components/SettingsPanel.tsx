import MonacoEditor from '@monaco-editor/react'
import { useState, useCallback } from 'react'
import { X, RotateCcw } from 'lucide-react'
import { useSettingsStore } from '../stores/settingsStore'
import { DEFAULT_SETTINGS } from '../types/settings'
import { useT } from '../i18n'
import type { AppSettings } from '../types/settings'

interface Props { onClose: () => void }

function merge(base: AppSettings, override: Partial<AppSettings>): AppSettings {
  return {
    editor: { ...base.editor, ...(override.editor ?? {}) },
    ui:     { ...base.ui,     ...(override.ui     ?? {}) },
  }
}

export function SettingsPanel({ onClose }: Props) {
  const { settings, setSettings } = useSettingsStore()
  const t = useT()
  const isDark = settings.ui.theme === 'dark'
  const [json, setJson] = useState(() => JSON.stringify(settings, null, 2))
  const [error, setError] = useState<string | null>(null)

  const onChange = useCallback((val: string | undefined) => {
    if (val === undefined) return
    setJson(val)
    try {
      const parsed = JSON.parse(val) as Partial<AppSettings>
      setSettings(merge(DEFAULT_SETTINGS, parsed))
      setError(null)
    } catch (e) {
      setError((e as Error).message.split('\n')[0])
    }
  }, [setSettings])

  const onReset = () => {
    const j = JSON.stringify(DEFAULT_SETTINGS, null, 2)
    setJson(j)
    setSettings(DEFAULT_SETTINGS)
    setError(null)
  }

  return (
    <div className="flex flex-col h-full u-sidebar">
      <div className="flex items-center justify-between px-4 h-9 border-b flex-shrink-0 u-toolbar u-border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium u-text-1">{t.settings.title}</span>
          <span className="text-xs px-1.5 py-0.5 rounded font-mono u-text-3" style={{ background: 'var(--c-border)' }}>
            {t.settings.badge}
          </span>
          {error && <span className="text-xs text-red-400 truncate max-w-xs">{error}</span>}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onReset} className="u-btn gap-1 px-2 text-xs">
            <RotateCcw size={12} /> {t.settings.reset}
          </button>
          <button onClick={onClose} className="u-btn" title={t.settings.close}>
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <MonacoEditor
          height="100%"
          language="json"
          theme={isDark ? 'vs-dark' : 'light'}
          value={json}
          onChange={onChange}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
            wordWrap: 'on',
            formatOnPaste: true,
            tabSize: 2,
          }}
        />
      </div>
    </div>
  )
}
