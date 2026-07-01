import { create } from 'zustand'
import { useSettingsStore } from './settingsStore'

export type AppView = 'board' | 'editor'

interface UIState {
  view:              AppView
  showPreview:       boolean
  showSettings:      boolean
  paletteMode:       'commands' | null
  focusBoardSearch:  boolean
  setView:              (v: AppView) => void
  togglePreview:        () => void
  toggleSettings:       () => void
  openPalette:          (mode: 'commands') => void
  closePalette:         () => void
  triggerBoardSearch:   () => void
  clearBoardSearchFocus:() => void
}

export const useUIStore = create<UIState>((set) => ({
  view:             'board',
  showPreview:      useSettingsStore.getState().settings.ui.defaultShowPreview,
  showSettings:     false,
  paletteMode:      null,
  focusBoardSearch: false,
  setView:               (v) => set({ view: v }),
  togglePreview:         () => set((s) => ({ showPreview: !s.showPreview })),
  toggleSettings:        () => set((s) => ({ showSettings: !s.showSettings })),
  openPalette:           (mode) => set({ paletteMode: mode }),
  closePalette:          () => set({ paletteMode: null }),
  triggerBoardSearch:    () => set({ view: 'board', focusBoardSearch: true }),
  clearBoardSearchFocus: () => set({ focusBoardSearch: false }),
}))
