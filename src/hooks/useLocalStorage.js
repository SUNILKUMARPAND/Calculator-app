import { useEffect, useState } from 'react'

/** Like useState, but the value survives page reloads. */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved !== null ? JSON.parse(saved) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage full or blocked (private mode) — the app still works, just without persistence.
    }
  }, [key, value])

  return [value, setValue]
}
