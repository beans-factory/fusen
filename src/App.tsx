import { useEffect } from 'react'
import { useNoteStore } from './stores/noteStore'
import { useSettingsStore } from './stores/settingsStore'
import { useAuthStore } from './stores/authStore'
import { MainLayout } from './layouts/MainLayout'
import { Login } from './components/Login'
import { CommandPalette } from './components/CommandPalette'
import { useKeyboard } from './hooks/useKeyboard'

export default function App() {
  const loadAll = useNoteStore((s) => s.loadAll)
  const theme = useSettingsStore((s) => s.settings.ui.theme)
  const { isAuthenticated, isChecking, checkAuth } = useAuthStore()

  useKeyboard()

  useEffect(() => { checkAuth() }, [checkAuth])
  useEffect(() => {
    if (isAuthenticated) loadAll()
  }, [isAuthenticated, loadAll])

  if (isChecking) {
    return <div style={{ height: '100%', background: '#1e1e1e' }} />
  }

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <div className={`h-full flex flex-col u-editor ${theme === 'dark' ? 'dark' : 'light'}`}>
      <MainLayout />
      <CommandPalette />
    </div>
  )
}
