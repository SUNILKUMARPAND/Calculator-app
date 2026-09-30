import { formatNumber, formatPercent } from './format'

/**
 * Each percentage mode is described by data: its two inputs and a `solve` function.
 * The PercentageCalculator component just renders whichever mode is selected,
 * so adding a new mode means adding one object here — no JSX changes.
 *
 * `resultSuffix` is shown after the answer ("%" when the answer is itself a percentage).
 * `solve` returns { value, text } or throws an Error with a friendly message.
 */
export const PERCENTAGE_MODES = [
  {
    id: 'of',
    label: '% of a number',
    a: { label: 'Percentage', suffix: '%', placeholder: '20' },
    b: { label: 'Number', placeholder: '450' },
    solve: (p, x) => {
      const value = (x * p) / 100
      return { value, text: `${formatPercent(p)} of ${formatNumber(x)} = ${formatNumber(value, 4)}` }
    },
  },
  {
    id: 'increase',
    label: '% increase',
    a: { label: 'Original value', placeholder: '1200' },
    b: { label: 'Increase by', suffix: '%', placeholder: '15' },
    solve: (x, p) => {
      const value = x * (1 + p / 100)
      return { value, text: `${formatNumber(x)} + ${formatPercent(p)} = ${formatNumber(value, 4)} (up by ${formatNumber(value - x, 4)})` }
    },
  },
  {
    id: 'decrease',
    label: '% decrease',
    a: { label: 'Original value', placeholder: '1200' },
    b: { label: 'Decrease by', suffix: '%', placeholder: '15' },
    solve: (x, p) => {
      const value = x * (1 - p / 100)
      return { value, text: `${formatNumber(x)} − ${formatPercent(p)} = ${formatNumber(value, 4)} (down by ${formatNumber(x - value, 4)})` }
    },
  },
  {
    id: 'original',
    label: 'Find original number',
    a: { label: 'Final value', placeholder: '1380' },
    b: { label: 'Change applied (+ increase / − decrease)', suffix: '%', placeholder: '15' },
    solve: (final, p) => {
      if (p === -100) throw new Error('A −100% change leaves 0, so the original value cannot be found')
      const value = final / (1 + p / 100)
      return { value, text: `${formatNumber(final)} is ${formatNumber(value, 4)} ${p >= 0 ? 'increased' : 'decreased'} by ${formatPercent(Math.abs(p))}` }
    },
  },
  {
    id: 'difference',
    resultSuffix: '%',
    label: '% difference',
    a: { label: 'First value', placeholder: '80' },
    b: { label: 'Second value', placeholder: '100' },
    solve: (x, y) => {
      if (x + y === 0) throw new Error('The average of the two values is 0, so % difference is undefined')
      const value = (Math.abs(x - y) / Math.abs((x + y) / 2)) * 100
      return { value, text: `Difference between ${formatNumber(x)} and ${formatNumber(y)} is ${formatPercent(value, 4)}` }
    },
  },
  {
    id: 'change',
    resultSuffix: '%',
    label: '% change (A → B)',
    a: { label: 'From', placeholder: '80' },
    b: { label: 'To', placeholder: '100' },
    solve: (from, to) => {
      if (from === 0) throw new Error('Cannot calculate % change from 0')
      const value = ((to - from) / Math.abs(from)) * 100
      return { value, text: `${formatNumber(from)} → ${formatNumber(to)} is a ${formatPercent(Math.abs(value), 4)} ${value >= 0 ? 'increase' : 'decrease'}` }
    },
  },
  {
    id: 'ratio',
    resultSuffix: '%',
    label: 'X is what % of Y',
    a: { label: 'X', placeholder: '45' },
    b: { label: 'Y', placeholder: '180' },
    solve: (x, y) => {
      if (y === 0) throw new Error('Y cannot be 0 (division by zero)')
      const value = (x / y) * 100
      return { value, text: `${formatNumber(x)} is ${formatPercent(value, 4)} of ${formatNumber(y)}` }
    },
  },
]
