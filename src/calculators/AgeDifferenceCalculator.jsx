import { useState } from 'react'
import EmptyResult from '../components/EmptyResult'
import FormActions from '../components/FormActions'
import InputField from '../components/InputField'
import ResultCard from '../components/ResultCard'
import { useForm } from '../hooks/useForm'
import { diffYMD, formatYMD, parseDateInput } from '../utils/date'
import { formatNumber } from '../utils/format'

const INITIAL = { name1: '', dob1: '', name2: '', dob2: '' }

export default function AgeDifferenceCalculator() {
  const { values, errors, setErrors, handleChange, reset } = useForm(INITIAL)
  const [result, setResult] = useState(null)

  const handleSubmit = (event) => {
    event.preventDefault()
    const dob1 = parseDateInput(values.dob1)
    const dob2 = parseDateInput(values.dob2)
    const fieldErrors = {}
    if (!dob1) fieldErrors.dob1 = 'Please choose a date of birth'
    if (!dob2) fieldErrors.dob2 = 'Please choose a date of birth'
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length) {
      setResult(null)
      return
    }

    const name1 = values.name1.trim() || 'Person 1'
    const name2 = values.name2.trim() || 'Person 2'
    const diff = diffYMD(dob1, dob2)
    let summary = `${name1} and ${name2} were born on the same day`
    if (diff.totalDays > 0) summary = dob1 < dob2 ? `${name1} is older than ${name2}` : `${name2} is older than ${name1}`
    setResult({ diff, summary })
  }

  const handleReset = () => {
    reset()
    setResult(null)
  }

  return (
    <div className="calc-grid">
      <form className="calc-form" onSubmit={handleSubmit} noValidate>
        <fieldset className="fieldset">
          <legend>Person 1</legend>
          <InputField label="Name (optional)" name="name1" inputMode="text" value={values.name1} onChange={handleChange} placeholder="Asha" />
          <InputField label="Date of birth" name="dob1" type="date" value={values.dob1} onChange={handleChange} error={errors.dob1} />
        </fieldset>
        <fieldset className="fieldset">
          <legend>Person 2</legend>
          <InputField label="Name (optional)" name="name2" inputMode="text" value={values.name2} onChange={handleChange} placeholder="Rahul" />
          <InputField label="Date of birth" name="dob2" type="date" value={values.dob2} onChange={handleChange} error={errors.dob2} />
        </fieldset>
        <FormActions onReset={handleReset} />
      </form>

      <div className="calc-output">
        {result ? (
          <ResultCard
            title="Age difference"
            rows={[
              { label: 'Difference', value: formatYMD(result.diff), highlight: true },
              { label: 'Who is older', value: result.summary },
              { label: 'In months', value: formatNumber(result.diff.totalMonths, 0) },
              { label: 'In days', value: formatNumber(result.diff.totalDays, 0) },
            ]}
          />
        ) : (
          <EmptyResult text="Compare two birthdays to see exactly how far apart they are." />
        )}
      </div>
    </div>
  )
}
