import { useEffect, useRef } from 'react'

/**
 * Keyboard support for the keypad calculators.
 * Ignores key presses while the user is typing in an input/select elsewhere.
 */
export function useKeyboard({ input, backspace, clear, calculate }) {
  // Keep the latest handlers in a ref so the listener is attached only once
  const handlers = useRef({ input, backspace, clear, calculate })
  useEffect(() => {
    handlers.current = { input, backspace, clear, calculate }
  })

  useEffect(() => {
    const onKeyDown = (event) => {
      const tag = event.target.tagName
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || event.ctrlKey || event.metaKey || event.altKey) return
      const h = handlers.current
      const { key } = event

      if (/^[\d.+\-*/^%()!]$/.test(key)) h.input(key)
      else if (key === 'Enter' || key === '=') h.calculate()
      else if (key === 'Backspace') h.backspace()
      else if (key === 'Escape' || key === 'Delete') h.clear()
      else return
      event.preventDefault()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
