import { useState, useRef, useCallback } from 'react'

export function useResizablePanel(storageKey: string, defaultWidth: number, min: number, max: number) {
  const [width, setWidthState] = useState<number>(() => {
    try {
      const v = localStorage.getItem(storageKey)
      if (v) return Math.max(min, Math.min(max, parseInt(v, 10)))
    } catch { /* ignore */ }
    return defaultWidth
  })

  const widthRef = useRef(width)
  widthRef.current = width

  const setWidth = useCallback((w: number) => {
    setWidthState(w)
    try { localStorage.setItem(storageKey, String(w)) } catch { /* ignore */ }
  }, [storageKey])

  // direction: 1 = sidebar (drag right = wider), -1 = preview (drag left = wider)
  const startResize = useCallback((e: React.MouseEvent, direction: 1 | -1) => {
    e.preventDefault()
    const startX = e.clientX
    const startWidth = widthRef.current

    const onMove = (mv: MouseEvent) => {
      const delta = (mv.clientX - startX) * direction
      setWidth(Math.max(min, Math.min(max, startWidth + delta)))
    }
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [setWidth, min, max])

  return { width, startResize }
}
