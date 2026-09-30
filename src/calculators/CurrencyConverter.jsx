import { useMemo, useState } from 'react'
import ErrorMessage from '../components/ErrorMessage'
import HistoryList from '../components/HistoryList'
import InputField from '../components/InputField'
import ResultCard from '../components/ResultCard'
import SelectField from '../components/SelectField'
import { useCurrencyRates } from '../hooks/useCurrencyRates'
import { useHistory } from '../hooks/useHistory'
import { POPULAR_CURRENCIES, convertCurrency, currencyName } from '../utils/currency'
import { formatCurrency, formatNumber } from '../utils/format'
import { validateNumber } from '../utils/validation'

export default function CurrencyConverter() {
  const { rates, updatedAt, source, status, error, reload } = useCurrencyRates()
  const [amount, setAmount] = useState('1000')
  const [from, setFrom] = useState('USD')
  const [to, setTo] = useState('INR')
  const history = useHistory('currency')

  // Popular currencies first, then everything else alphabetically
  const options = useMemo(() => {
    if (!rates) return []
    const codes = Object.keys(rates)
    const popular = POPULAR_CURRENCIES.filter((code) => codes.includes(code))
    const others = codes.filter((code) => !popular.includes(code)).sort()
    return [...popular, ...others].map((code) => ({ value: code, label: `${code} — ${currencyName(code)}` }))
  }, [rates])

  const { value, error: inputError } = validateNumber(amount, { label: 'Amount', min: 0, max: 1e15 })
  const canConvert = rates && !inputError && rates[from] && rates[to]
  const result = canConvert ? convertCurrency(value, from, to, rates) : null

  const swap = () => {
    setFrom(to)
    setTo(from)
  }

  const saveToHistory = () => {
    if (result) history.addItem(`${formatCurrency(value, from)} → ${to}`, formatCurrency(result.converted, to))
  }

  const isLoading = status === 'loading'

  return (
    <div className="calc-grid">
      <div className="calc-form">
        <InputField label="Amount" name="currency-amount" value={amount} onChange={(e) => setAmount(e.target.value)} error={inputError} />

        {isLoading && !rates && (
          <div className="loading" role="status">
            <span className="spinner" aria-hidden="true" /> Loading live exchange rates…
          </div>
        )}

        {rates && (
          <div className="swap-row">
            <SelectField label="From" name="currency-from" value={from} onChange={(e) => setFrom(e.target.value)} options={options} />
            <button type="button" className="icon-btn swap-btn" onClick={swap} aria-label="Swap currencies" title="Swap currencies">
              ⇄
            </button>
            <SelectField label="To" name="currency-to" value={to} onChange={(e) => setTo(e.target.value)} options={options} />
          </div>
        )}

        {status === 'error' && (
          <div className="error-box">
            <ErrorMessage>{rates ? `${error} Showing the last saved rates instead.` : error}</ErrorMessage>
            <button type="button" className="btn btn-ghost btn-sm" onClick={reload}>
              Try again
            </button>
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="btn btn-primary" onClick={saveToHistory} disabled={!result}>
            Save to history
          </button>
          <button type="button" className="btn btn-ghost" onClick={reload} disabled={isLoading}>
            {isLoading ? 'Refreshing…' : '↻ Refresh rates'}
          </button>
        </div>

        {updatedAt && (
          <p className="muted small">
            Rates updated {updatedAt.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} · source: {source}. Rates are for reference only.
          </p>
        )}
      </div>

      <div className="calc-output">
        {result && (
          <ResultCard
            title="Converted amount"
            rows={[
              { label: `${formatCurrency(value, from)} =`, value: formatCurrency(result.converted, to), highlight: true },
              { label: 'Exchange rate', value: `1 ${from} = ${formatNumber(result.rate, 6)} ${to}` },
              { label: 'Inverse rate', value: `1 ${to} = ${formatNumber(1 / result.rate, 6)} ${from}` },
            ]}
          />
        )}
        <HistoryList items={history.items} onClear={history.clearHistory} />
      </div>
    </div>
  )
}
