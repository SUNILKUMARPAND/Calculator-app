import { useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'

const systemTheme = () => (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')

/** Light/dark mode. Stored as data-theme on <html> so CSS variables can switch. */
export function useTheme() {
  const [theme, setTheme] = useLocalStorage('calc:theme', systemTheme())

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const toggleTheme = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  return { theme, toggleTheme }
}
