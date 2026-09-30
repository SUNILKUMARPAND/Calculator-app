import { useEffect, useState } from 'react'
import { fetchRates } from '../utils/currency'

const CACHE_KEY = 'calc:currency-rates'
const CACHE_MS = 60 * 60 * 1000 // 1 hour

function readCache() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY))
    return cached ? { ...cached, updatedAt: new Date(cached.updatedAt), fetchedAt: new Date(cached.fetchedAt) } : null
  } catch {
    return null
  }
}

const isFresh = (cached) => Boolean(cached) && Date.now() - cached.fetchedAt.getTime() < CACHE_MS

/**
 * Loads exchange rates with loading / error states.
 * - Uses a 1-hour localStorage cache so we don't call the API on every visit.
 * - If the network fails but we have old cached rates, we keep showing them
 *   (with a warning) instead of breaking the converter.
 */
export function useCurrencyRates() {
  const [data, setData] = useState(readCache)
  // Start in "loading" only when the cache can't be used
  const [status, setStatus] = useState(() => (isFresh(readCache()) ? 'idle' : 'loading')) // idle | loading | error
  const [error, setError] = useState('')
  const [requestId, setRequestId] = useState(0)

  useEffect(() => {
    // First visit with a fresh cache: nothing to fetch
    if (requestId === 0 && isFresh(readCache())) return

    const controller = new AbortController()
    fetchRates(controller.signal)
      .then((result) => {
        const fresh = { ...result, fetchedAt: new Date() }
        setData(fresh)
        setStatus('idle')
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(fresh))
        } catch {
          // ignore storage errors
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        setStatus('error')
        setError('Could not load live exchange rates. Check your internet connection and try again.')
      })

    // Cancel the request if the component unmounts mid-flight
    return () => controller.abort()
  }, [requestId])

  /** Force a fresh request (Refresh / Try again buttons). */
  const reload = () => {
    setStatus('loading')
    setError('')
    setRequestId((id) => id + 1)
  }

  return { rates: data?.rates ?? null, updatedAt: data?.updatedAt ?? null, source: data?.source ?? '', status, error, reload }
}
