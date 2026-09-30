import { useLocalStorage } from './useLocalStorage'

const MAX_ITEMS = 20

/**
 * Per-calculator history saved in localStorage.
 * Each entry: { id, label, value, time }
 *   label – what was calculated (e.g. "₹5,00,000 @ 8.5% for 20 yrs")
 *   value – the main result (e.g. "EMI ₹4,339")
 */
export function useHistory(calculatorId) {
  const [items, setItems] = useLocalStorage(`calc:history:${calculatorId}`, [])

  const addItem = (label, value) => {
    setItems((current) => {
      // Skip exact duplicates of the latest entry (pressing Calculate twice)
      if (current[0]?.label === label && current[0]?.value === value) return current
      const entry = { id: Date.now(), label, value, time: new Date().toISOString() }
      return [entry, ...current].slice(0, MAX_ITEMS)
    })
  }

  const clearHistory = () => setItems([])

  return { items, addItem, clearHistory }
}
