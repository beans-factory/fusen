import { useState } from 'react'
import { KeyRound, Loader2 } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { APP_NAME } from '../constants'
import { useT } from '../i18n'

export function Login() {
  const { login } = useAuthStore()
  const t = useT()
  const [key, setKey] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!key.trim() || loading) return
    setLoading(true)
    setError(false)
    const ok = await login(key.trim())
    if (!ok) { setError(true); setLoading(false) }
  }

  return (
    <div
      className="flex items-center justify-center h-full"
      style={{ background: '#1e1e1e' }}
    >
      <div
        style={{
          width: 340,
          background: '#252526',
          border: '1px solid #3c3c3c',
          borderRadius: 12,
          padding: '36px 32px 32px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Brand */}
        <div className="text-center mb-8">
          <div
            className="text-3xl font-bold tracking-widest uppercase mb-2"
            style={{ color: '#f5c842', letterSpacing: '0.25em' }}
          >
            {APP_NAME}
          </div>
          <p className="text-sm" style={{ color: '#6b6b6b' }}>{t.login.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="relative">
            <KeyRound
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: error ? '#f87171' : '#6b6b6b' }}
            />
            <input
              type="password"
              placeholder={t.login.placeholder}
              value={key}
              onChange={(e) => { setKey(e.target.value); setError(false) }}
              autoFocus
              style={{
                width: '100%', background: '#2d2d30', color: '#cccccc',
                border: `1px solid ${error ? '#f87171' : '#3c3c3c'}`,
                borderRadius: 6, padding: '10px 12px 10px 36px', fontSize: 13,
                outline: 'none', transition: 'border-color 0.15s',
              }}
              onFocus={(e)  => { if (!error) e.currentTarget.style.borderColor = '#f5c842' }}
              onBlur={(e)   => { if (!error) e.currentTarget.style.borderColor = '#3c3c3c' }}
            />
          </div>

          {error && (
            <p style={{ color: '#f87171', fontSize: 12, margin: 0, paddingLeft: 2 }}>
              {t.login.error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !key.trim()}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              marginTop: 4,
              padding: '11px 12px', background: '#f5c842', color: '#1e1e1e',
              border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600,
              cursor: loading || !key.trim() ? 'not-allowed' : 'pointer',
              opacity: loading || !key.trim() ? 0.45 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {t.login.submit}
          </button>
        </form>
      </div>
    </div>
  )
}
