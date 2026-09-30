// All number/currency formatting in one place so every calculator looks consistent.

export const LOCALE = 'en-IN'
export const DEFAULT_CURRENCY = 'INR'

/** 1234567.891 → "12,34,567.89" */
export function formatNumber(value, maxDigits = 2) {
  if (!Number.isFinite(value)) return '—'
  return new Intl.NumberFormat(LOCALE, { maximumFractionDigits: maxDigits }).format(value)
}

/** 1234.5 → "₹1,234.50" */
export function formatCurrency(value, currency = DEFAULT_CURRENCY) {
  if (!Number.isFinite(value)) return '—'
  try {
    return new Intl.NumberFormat(LOCALE, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(value)
  } catch {
    // Unknown currency code: fall back to "1,234.50 XYZ"
    return `${formatNumber(value)} ${currency}`
  }
}

export function formatPercent(value, maxDigits = 2) {
  return `${formatNumber(value, maxDigits)}%`
}

/**
 * Clean display for calculator results: removes floating-point noise
 * (0.1 + 0.2 → "0.3") and switches to exponent notation for huge/tiny numbers.
 */
export function formatCalcResult(value) {
  if (!Number.isFinite(value)) return 'Error'
  if (value === 0) return '0'
  const abs = Math.abs(value)
  if (abs >= 1e15 || abs < 1e-9) {
    return value.toExponential(8).replace(/\.?0+e/, 'e')
  }
  return String(parseFloat(value.toPrecision(12)))
}

/** Pretty-print a calculator expression: "2*3/4-sqrt(9)" → "2×3÷4−√(9)" */
export function prettyExpression(expr) {
  return expr
    .replace(/\*/g, '×')
    .replace(/\//g, '÷')
    .replace(/-/g, '−')
    .replace(/sqrt/g, '√')
    .replace(/ans/g, 'Ans')
}

export function plural(count, word) {
  return `${formatNumber(count, 0)} ${word}${count === 1 ? '' : 's'}`
}
