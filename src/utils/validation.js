/**
 * Form validation shared by every form-based calculator.
 *
 * Usage:
 *   const { errors, data, isValid } = validateFields(values, {
 *     amount: { label: 'Loan amount', min: 1 },
 *     rate:   { label: 'Interest rate', min: 0, max: 100 },
 *   })
 *
 * Rule options:
 *   label     – used in error messages
 *   required  – default true; when false an empty field becomes `fallback` (default 0)
 *   min / max – inclusive bounds
 *   gt        – value must be strictly greater than this (e.g. gt: 0)
 *   integer   – must be a whole number
 */

/** "1,250.5" → 1250.5, "" → null, "abc" → NaN */
export function parseNumber(raw) {
  if (raw === null || raw === undefined) return null
  const cleaned = String(raw).replace(/,/g, '').trim()
  if (cleaned === '') return null
  return /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(cleaned) ? Number(cleaned) : NaN
}

export function validateNumber(raw, rule) {
  const { label, required = true, min, max, gt, integer } = rule
  const value = parseNumber(raw)

  if (value === null) {
    return required ? { error: `${label} is required` } : { value: rule.fallback ?? 0 }
  }
  if (Number.isNaN(value)) return { error: `${label} must be a valid number` }
  if (gt !== undefined && value <= gt) return { error: `${label} must be greater than ${gt}` }
  if (min !== undefined && value < min) return { error: `${label} must be at least ${min}` }
  if (max !== undefined && value > max) return { error: `${label} must be at most ${max}` }
  if (integer && !Number.isInteger(value)) return { error: `${label} must be a whole number` }
  return { value }
}

export function validateFields(values, rules) {
  const errors = {}
  const data = {}
  for (const [name, rule] of Object.entries(rules)) {
    const { value, error } = validateNumber(values[name], rule)
    if (error) errors[name] = error
    else data[name] = value
  }
  return { errors, data, isValid: Object.keys(errors).length === 0 }
}
