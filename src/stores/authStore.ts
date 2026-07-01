import { create } from 'zustand'

const KEY_STORAGE = 'dept-auth-key'

interface AuthState {
  userId: string | null
  isAuthenticated: boolean
  isChecking: boolean
  login: (key: string) => Promise<boolean>
  logout: () => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  isAuthenticated: false,
  isChecking: true,

  checkAuth: async () => {
    const key = localStorage.getItem(KEY_STORAGE)
    if (!key) {
      // AUTH_ENABLED=false の場合、キーなしで /auth/me が通る
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const { userId } = await res.json()
          set({ userId, isAuthenticated: true, isChecking: false })
          return
        }
      } catch { /* ignore */ }
      set({ isAuthenticated: false, isChecking: false })
      return
    }
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${key}` },
      })
      if (res.ok) {
        const { userId } = await res.json()
        set({ userId, isAuthenticated: true, isChecking: false })
      } else {
        localStorage.removeItem(KEY_STORAGE)
        set({ userId: null, isAuthenticated: false, isChecking: false })
      }
    } catch {
      set({ isAuthenticated: false, isChecking: false })
    }
  },

  login: async (key: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      })
      if (!res.ok) return false
      const { userId } = await res.json()
      localStorage.setItem(KEY_STORAGE, key)
      set({ userId, isAuthenticated: true })
      return true
    } catch {
      return false
    }
  },

  logout: () => {
    localStorage.removeItem(KEY_STORAGE)
    set({ userId: null, isAuthenticated: false })
  },
}))
