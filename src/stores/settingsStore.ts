import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_SETTINGS } from '../types/settings'
import type { AppSettings } from '../types/settings'

interface SettingsState {
  settings: AppSettings
  setSettings: (s: AppSettings) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      setSettings: (settings) => set({ settings }),
    }),
    {
      name: 'dept-settings',
      // 旧バージョンのlocalStorageデータに新フィールドが欠けていても、デフォルト値で補完する
      merge: (persisted, current) => {
        const p = (persisted as SettingsState | undefined)?.settings
        return {
          ...current,
          settings: {
            editor: { ...DEFAULT_SETTINGS.editor, ...(p?.editor ?? {}) },
            ui:     { ...DEFAULT_SETTINGS.ui,     ...(p?.ui     ?? {}) },
          },
        }
      },
    },
  ),
)
