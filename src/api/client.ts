const KEY_STORAGE = 'dept-auth-key'

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const key = localStorage.getItem(KEY_STORAGE) ?? ''
  const res = await fetch(`/api${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(key ? { Authorization: `Bearer ${key}` } : {}),
    },
    ...init,
  })
  if (res.status === 401) {
    localStorage.removeItem(KEY_STORAGE)
    window.location.reload()
    throw new Error('Unauthorized')
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const http = {
  get:    <T>(path: string)                => req<T>(path),
  post:   <T>(path: string, body: unknown) => req<T>(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown) => req<T>(path, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: (path: string)                   => req<void>(path, { method: 'DELETE' }),
}
