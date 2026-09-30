// Currency API integration. Both APIs are free and need no API key.
//   Primary:  open.er-api.com   (≈160 currencies, updated daily)
//   Fallback: frankfurter.dev   (≈30 currencies, European Central Bank data)
// We always fetch USD-based rates once and derive any pair from them:
//   rate(from → to) = rates[to] / rates[from]

const PRIMARY_URL = 'https://open.er-api.com/v6/latest/USD'
const FALLBACK_URL = 'https://api.frankfurter.dev/v1/latest?base=USD'

async function fetchJson(url, signal) {
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error(`Request failed with status ${response.status}`)
  return response.json()
}

/** Returns { rates: {USD: 1, INR: 95.6, ...}, updatedAt: Date, source: string } */
export async function fetchRates(signal) {
  try {
    const data = await fetchJson(PRIMARY_URL, signal)
    if (data.result !== 'success') throw new Error('Rate service returned an error')
    return { rates: data.rates, updatedAt: new Date(data.time_last_update_unix * 1000), source: 'open.er-api.com' }
  } catch (error) {
    if (error.name === 'AbortError') throw error
    // Try the second provider before giving up
    const data = await fetchJson(FALLBACK_URL, signal)
    return { rates: { ...data.rates, USD: 1 }, updatedAt: new Date(data.date), source: 'frankfurter.dev (ECB)' }
  }
}

export function convertCurrency(amount, from, to, rates) {
  const rate = rates[to] / rates[from]
  return { rate, converted: amount * rate }
}

const currencyNames = typeof Intl.DisplayNames === 'function' ? new Intl.DisplayNames(['en'], { type: 'currency' }) : null

export function currencyName(code) {
  try {
    return currencyNames?.of(code) ?? code
  } catch {
    return code
  }
}

export const POPULAR_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'JPY', 'AUD', 'CAD', 'SGD', 'CNY']
