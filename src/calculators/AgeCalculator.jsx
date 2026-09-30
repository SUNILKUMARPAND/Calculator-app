import { useState } from 'react'
import EmptyResult from '../components/EmptyResult'
import FormActions from '../components/FormActions'
import InputField from '../components/InputField'
import ResultCard from '../components/ResultCard'
import { useForm } from '../hooks/useForm'
import { daysBetween, diffYMD, formatDate, formatYMD, nextBirthday, parseDateInput, todayInputValue, weekdayName } from '../utils/date'
import { formatNumber, plural } from '../utils/format'

const initialValues = () => ({ dob: '', onDate: todayInputValue() })

export default function AgeCalculator() {
  const { values, errors, setErrors, handleChange, reset } = useForm(initialValues())
  const [result, setResult] = useState(null)

  const handleSubmit = (event) => {
    event.preventDefault()
    const dob = parseDateInput(values.dob)
    const onDate = parseDateInput(values.onDate)
    const fieldErrors = {}
    if (!dob) fieldErrors.dob = 'Please choose your date of birth'
    if (!onDate) fieldErrors.onDate = 'Please choose a date'
    if (dob && onDate && dob > onDate) fieldErrors.dob = 'Date of birth cannot be after the “age on” date'
    if (dob && dob.getFullYear() < 1800) fieldErrors.dob = 'Please enter a year after 1800'
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length) {
      setResult(null)
      return
    }

    const age = diffYMD(dob, onDate)
    setResult({ age, dob, birthday: nextBirthday(dob, onDate), totalDays: daysBetween(dob, onDate) })
  }

  const handleReset = () => {
    reset()
    setResult(null)
  }

  const birthdayText = (birthday) =>
    birthday.daysLeft === 0 ? '🎉 Today — happy birthday!' : `in ${plural(birthday.daysLeft, 'day')} (${formatDate(birthday.date)})`

  return (
    <div className="calc-grid">
      <form className="calc-form" onSubmit={handleSubmit} noValidate>
        <InputField label="Date of birth" name="dob" type="date" value={values.dob} onChange={handleChange} error={errors.dob} max={values.onDate || undefined} />
        <InputField label="Age on" name="onDate" type="date" value={values.onDate} onChange={handleChange} error={errors.onDate} hint="Defaults to today" />
        <FormActions onReset={handleReset} />
      </form>

      <div className="calc-output">
        {result ? (
          <ResultCard
            title="Your exact age"
            rows={[
              { label: 'Age', value: formatYMD(result.age), highlight: true },
              { label: 'Total months', value: formatNumber(result.age.totalMonths, 0) },
              { label: 'Total weeks', value: `${formatNumber(Math.floor(result.totalDays / 7), 0)} weeks ${result.totalDays % 7} days` },
              { label: 'Total days', value: formatNumber(result.totalDays, 0) },
              { label: 'Total hours (approx.)', value: formatNumber(result.totalDays * 24, 0) },
              { label: 'Born on a', value: weekdayName(result.dob) },
              { label: 'Next birthday', value: birthdayText(result.birthday) },
            ]}
          />
        ) : (
          <EmptyResult text="Enter your date of birth to get your age in years, months and days." />
        )}
      </div>
    </div>
  )
}
