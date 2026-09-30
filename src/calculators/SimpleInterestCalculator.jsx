import { useState } from 'react'
import EmptyResult from '../components/EmptyResult'
import FormActions from '../components/FormActions'
import InputField from '../components/InputField'
import ResultCard from '../components/ResultCard'
import SelectField from '../components/SelectField'
import SplitBar from '../components/SplitBar'
import { useForm } from '../hooks/useForm'
import { calculateSimpleInterest } from '../utils/finance'
import { formatCurrency } from '../utils/format'
import { validateFields } from '../utils/validation'

const INITIAL = { principal: '', rate: '', time: '', timeUnit: 'years' }
const TIME_UNITS = [
  { value: 'years', label: 'Years' },
  { value: 'months', label: 'Months' },
  { value: 'days', label: 'Days' },
]

export default function SimpleInterestCalculator() {
  const { values, errors, setErrors, handleChange, reset } = useForm(INITIAL)
  const [result, setResult] = useState(null)

  const handleSubmit = (event) => {
    event.preventDefault()
    const { errors: fieldErrors, data, isValid } = validateFields(values, {
      principal: { label: 'Principal', gt: 0, max: 1e12 },
      rate: { label: 'Interest rate', min: 0, max: 100 },
      time: { label: 'Time', gt: 0, max: values.timeUnit === 'days' ? 36500 : values.timeUnit === 'months' ? 1200 : 100 },
    })
    setErrors(fieldErrors)
    if (!isValid) {
      setResult(null)
      return
    }
    // SI formula uses years, so convert months/days first
    const years = values.timeUnit === 'months' ? data.time / 12 : values.timeUnit === 'days' ? data.time / 365 : data.time
    setResult({ ...calculateSimpleInterest(data.principal, data.rate, years), principal: data.principal })
  }

  const handleReset = () => {
    reset()
    setResult(null)
  }

  return (
    <div className="calc-grid">
      <form className="calc-form" onSubmit={handleSubmit} noValidate>
        <InputField label="Principal" name="principal" prefix="₹" value={values.principal} onChange={handleChange} error={errors.principal} placeholder="50,000" />
        <InputField label="Annual interest rate" name="rate" suffix="%" value={values.rate} onChange={handleChange} error={errors.rate} placeholder="6" />
        <div className="field-row">
          <InputField label="Time" name="time" value={values.time} onChange={handleChange} error={errors.time} placeholder="3" />
          <SelectField label="Time in" name="timeUnit" value={values.timeUnit} onChange={handleChange} options={TIME_UNITS} />
        </div>
        <FormActions onReset={handleReset} />
      </form>

      <div className="calc-output">
        {result ? (
          <ResultCard
            title="Simple interest"
            rows={[
              { label: 'Total amount', value: formatCurrency(result.totalAmount), highlight: true },
              { label: 'Simple interest', value: formatCurrency(result.simpleInterest) },
              { label: 'Principal', value: formatCurrency(result.principal) },
            ]}
          >
            <SplitBar
              parts={[
                { label: 'Principal', value: result.principal, display: formatCurrency(result.principal) },
                { label: 'Interest', value: result.simpleInterest, display: formatCurrency(result.simpleInterest) },
              ]}
            />
          </ResultCard>
        ) : (
          <EmptyResult text="SI = P × R × T / 100. Enter the values to calculate interest." />
        )}
      </div>
    </div>
  )
}
