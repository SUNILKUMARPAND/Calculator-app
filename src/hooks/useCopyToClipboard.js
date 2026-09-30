import { useEffect, useRef, useState } from 'react'

/** copy(text) → status becomes 'copied' (or 'error') for 2 seconds. */
export function useCopyToClipboard() {
  const [status, setStatus] = useState('idle')
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setStatus('copied')
    } catch {
      setStatus('error')
    }
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setStatus('idle'), 2000)
  }

  return { status, copy }
}
