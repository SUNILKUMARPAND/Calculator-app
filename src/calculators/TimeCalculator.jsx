import { useState } from 'react'
import EmptyResult from '../components/EmptyResult'
import FormActions from '../components/FormActions'
import InputField from '../components/InputField'
import ResultCard from '../components/ResultCard'
import SelectField from '../components/SelectField'
import Tabs from '../components/Tabs'
import { useForm } from '../hooks/useForm'
import { formatNumber } from '../utils/format'
import { TIME_UNITS, clockToMinutes, describeDuration, formatHMS, toSeconds } from '../utils/time'
import { validateFields } from '../utils/validation'

const MODES = [
  { id: 'arithmetic', label: 'Add / subtract time' },
  { id: 'convert', label: 'Convert units' },
  { id: 'difference', label: 'Time difference' },
]
const UNIT_OPTIONS = Object.entries(TIME_UNITS).map(([value, unit]) => ({ value, label: unit.label }))
const INITIAL = { h1: '', m1: '', s1: '', h2: '', m2: '', s2: '', op: 'add', amount: '', unit: 'minutes', start: '09:00', end: '17:30' }

const part = (label) => ({ label, min: 0, max: 1e6, required: false })

/** Hours / minutes / seconds inputs for one duration. */
function DurationInputs({ prefix, values, errors, onChange, legend }) {
  return (
    <fieldset className="fieldset">
      <legend>{legend}</legend>
      <div className="field-row three">
        <InputField label="Hours" name={`h${prefix}`} value={values[`h${prefix}`]} onChange={onChange} error={errors[`h${prefix}`]} placeholder="0" />
        <InputField label="Minutes" name={`m${prefix}`} value={values[`m${prefix}`]} onChange={onChange} error={errors[`m${prefix}`]} placeholder="0" />
        <InputField label="Seconds" name={`s${prefix}`} value={values[`s${prefix}`]} onChange={onChange} error={errors[`s${prefix}`]} placeholder="0" />
      </div>
    </fieldset>
  )
}

export default function TimeCalculator() {
  const { values, errors, setErrors, handleChange, reset } = useForm(INITIAL)
  const [mode, setMode] = useState('arithmetic')
  const [result, setResult] = useState(null)

  const fail = (fieldErrors) => {
    setErrors(fieldErrors)
    setResult(null)
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (mode === 'arithmetic') {
      const { errors: fieldErrors, data, isValid } = validateFields(values, {
        h1: part('Hours'),
        m1: part('Minutes'),
        s1: part('Seconds'),
        h2: part('Hours'),
        m2: part('Minutes'),
        s2: part('Seconds'),
      })
      if (!isValid) return fail(fieldErrors)
      const a = toSeconds({ hours: data.h1, minutes: data.m1, seconds: data.s1 })
      const b = toSeconds({ hours: data.h2, minutes: data.m2, seconds: data.s2 })
      if (a === 0 && b === 0) return fail({ h1: 'Enter at least one time value' })
      const total = values.op === 'add' ? a + b : a - b
      setErrors({})
      setResult([
        { label: 'Result (hh:mm:ss)', value: formatHMS(total), highlight: true },
        { label: 'In words', value: describeDuration(total) },
        { label: 'Total seconds', value: formatNumber(total, 0) },
        { label: 'Total minutes', value: formatNumber(total / 60, 2) },
        { label: 'Total hours', value: formatNumber(total / 3600, 4) },
      ])
      return
    }

    if (mode === 'convert') {
      const { errors: fieldErrors, data, isValid } = validateFields(values, { amount: { label: 'Value', min: 0, max: 1e12 } })
      if (!isValid) return fail(fieldErrors)
      const seconds = data.amount * TIME_UNITS[values.unit].seconds
      setErrors({})
      setResult([
        { label: 'Duration', value: describeDuration(seconds), highlight: true },
        ...Object.entries(TIME_UNITS).map(([key, unit]) => ({ label: unit.label, value: formatNumber(seconds / unit.seconds, key === 'seconds' ? 0 : 4) })),
        { label: 'hh:mm:ss', value: formatHMS(seconds) },
      ])
      return
    }

    // difference between two clock times
    const fieldErrors = {}
    if (!values.start) fieldErrors.start = 'Please choose a start time'
    if (!values.end) fieldErrors.end = 'Please choose an end time'
    if (Object.keys(fieldErrors).length) return fail(fieldErrors)
    let minutes = clockToMinutes(values.end) - clockToMinutes(values.start)
    const overnight = minutes < 0
    if (overnight) minutes += 24 * 60 // e.g. 22:00 → 06:00 crosses midnight
    setErrors({})
    setResult([
      { label: 'Time difference', value: describeDuration(minutes * 60), highlight: true },
      { label: 'hh:mm', value: formatHMS(minutes * 60).slice(0, 5) },
      { label: 'Decimal hours', value: formatNumber(minutes / 60, 2) },
      { label: 'Total minutes', value: formatNumber(minutes, 0) },
      ...(overnight ? [{ label: 'Note', value: 'End time is earlier, so it is treated as the next day' }] : []),
    ])
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
        <Tabs tabs={MODES} active={mode} onChange={changeMode} label="Time calculation" />

        {mode === 'arithmetic' && (
          <>
            <DurationInputs prefix="1" legend="Time 1" values={values} errors={errors} onChange={handleChange} />
            <SelectField
              label="Operation"
              name="op"
              value={values.op}
              onChange={handleChange}
              options={[
                { value: 'add', label: '+ Add' },
                { value: 'subtract', label: '− Subtract' },
              ]}
            />
            <DurationInputs prefix="2" legend="Time 2" values={values} errors={errors} onChange={handleChange} />
          </>
        )}

        {mode === 'convert' && (
          <div className="field-row">
            <InputField label="Value" name="amount" value={values.amount} onChange={handleChange} error={errors.amount} placeholder="7200" />
            <SelectField label="Unit" name="unit" value={values.unit} onChange={handleChange} options={UNIT_OPTIONS} />
          </div>
        )}

        {mode === 'difference' && (
          <div className="field-row">
            <InputField label="Start time" name="start" type="time" value={values.start} onChange={handleChange} error={errors.start} />
            <InputField label="End time" name="end" type="time" value={values.end} onChange={handleChange} error={errors.end} />
          </div>
        )}

        <FormActions onReset={handleReset} />
      </form>

      <div className="calc-output">
        {result ? <ResultCard title={MODES.find((m) => m.id === mode).label} rows={result} /> : <EmptyResult text="Add or subtract durations, convert between units, or find the time between two clock times." />}
      </div>
    </div>
  )
}
