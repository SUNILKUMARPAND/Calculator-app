import { useEffect, useState } from 'react'

const readHash = () => window.location.hash.replace(/^#\/?/, '')

/**
 * Minimal "router": the selected calculator lives in the URL hash (#/emi),
 * so the browser back button works and a calculator can be bookmarked.
 * No react-router needed for a single-level menu.
 */
export function useHashRoute() {
  const [route, setRoute] = useState(readHash)

  useEffect(() => {
    const onHashChange = () => setRoute(readHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = (id) => {
    window.location.hash = id ? `/${id}` : '/'
    window.scrollTo({ top: 0 })
  }

  return [route, navigate]
}
