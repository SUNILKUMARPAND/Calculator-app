import { useState } from 'react'
import EmptyResult from '../components/EmptyResult'
import FormActions from '../components/FormActions'
import InputField from '../components/InputField'
import ResultCard from '../components/ResultCard'
import SelectField from '../components/SelectField'
import Tabs from '../components/Tabs'
import { useForm } from '../hooks/useForm'
import { addToDate, countWeekdays, isWeekday, diffYMD, formatDate, formatYMD, parseDateInput, todayInputValue, weekdayName } from '../utils/date'
import { formatNumber } from '../utils/format'
import { validateNumber } from '../utils/validation'

const MODES = [
  { id: 'add', label: 'Add to date' },
  { id: 'subtract', label: 'Subtract from date' },
  { id: 'difference', label: 'Difference between dates' },
]
const UNITS = [
  { value: 'days', label: 'Days' },
  { value: 'weeks', label: 'Weeks' },
  { value: 'months', label: 'Months' },
  { value: 'years', label: 'Years' },
]
const initialValues = () => ({ start: todayInputValue(), end: '', amount: '', unit: 'days', includeEnd: false })

export default function DateCalculator() {
  const { values, errors, setErrors, handleChange, reset } = useForm(initialValues())
  const [mode, setMode] = useState('add')
  const [result, setResult] = useState(null)

  const handleSubmit = (event) => {
    event.preventDefault()
    const start = parseDateInput(values.start)
    const fieldErrors = {}
    if (!start) fieldErrors.start = 'Please choose a date'

    if (mode === 'difference') {
      const end = parseDateInput(values.end)
      if (!end) fieldErrors.end = 'Please choose an end date'
      setErrors(fieldErrors)
      if (Object.keys(fieldErrors).length) {
        setResult(null)
        return
      }

      const diff = diffYMD(start, end)
      const extra = values.includeEnd ? 1 : 0
      // countWeekdays includes both ends; drop the last day unless the user asked to include it
      const later = start > end ? start : end
      const weekdays = countWeekdays(start, end) - (!values.includeEnd && isWeekday(later) ? 1 : 0)
      setResult({
        mode,
        rows: [
          { label: 'Difference', value: formatYMD(diff), highlight: true },
          { label: 'Total days', value: formatNumber(diff.totalDays + extra, 0) + (extra ? ' (end date included)' : '') },
          { label: 'In weeks', value: `${formatNumber(Math.floor((diff.totalDays + extra) / 7), 0)} weeks ${(diff.totalDays + extra) % 7} days` },
          { label: 'Weekdays (Mon–Fri)', value: formatNumber(weekdays, 0) },
          { label: 'Total months', value: formatNumber(diff.totalMonths, 0) },
        ],
      })
      return
    }

    const { value: amount, error } = validateNumber(values.amount, { label: 'Amount', min: 0, max: 100000, integer: true })
    if (error) fieldErrors.amount = error
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length) {
      setResult(null)
      return
    }

    const signed = mode === 'add' ? amount : -amount
    const date = addToDate(start, signed, values.unit)
    if (Number.isNaN(date.getTime()) || date.getFullYear() > 9999 || date.getFullYear() < 1) {
      setErrors({ amount: 'That goes outside the supported date range' })
      setResult(null)
      return
    }
    setResult({
      mode,
      rows: [
        { label: 'Result date', value: formatDate(date), highlight: true },
        { label: 'Day of week', value: weekdayName(date) },
        { label: 'Calculation', value: `${formatDate(start)} ${mode === 'add' ? '+' : '−'} ${amount} ${values.unit}` },
      ],
    })
  }

  const handleReset = () => {
    reset()
    setResult(null)
  }

  const changeMode = (next) => {
    setMode(next)
    setErrors({})
    setResult(null)
  }

  return (
    <div className="calc-grid">
      <form className="calc-form" onSubmit={handleSubmit} noValidate>
        <Tabs tabs={MODES} active={mode} onChange={changeMode} label="Date calculation" />
        <InputField label={mode === 'difference' ? 'Start date' : 'Date'} name="start" type="date" value={values.start} onChange={handleChange} error={errors.start} />

        {mode === 'difference' ? (
          <>
            <InputField label="End date" name="end" type="date" value={values.end} onChange={handleChange} error={errors.end} />
            <label className="checkbox">
              <input type="checkbox" name="includeEnd" checked={values.includeEnd} onChange={handleChange} />
              Include the end date (count both days)
            </label>
          </>
        ) : (
          <div className="field-row">
            <InputField label={mode === 'add' ? 'Add' : 'Subtract'} name="amount" inputMode="numeric" value={values.amount} onChange={handleChange} error={errors.amount} placeholder="45" />
            <SelectField label="Unit" name="unit" value={values.unit} onChange={handleChange} options={UNITS} />
          </div>
        )}
        <FormActions onReset={handleReset} />
      </form>

      <div className="calc-output">
        {result ? <ResultCard title={MODES.find((m) => m.id === result.mode).label} rows={result.rows} /> : <EmptyResult text="Add or subtract days, weeks, months or years — or count the days between two dates." />}
      </div>
    </div>
  )
}

