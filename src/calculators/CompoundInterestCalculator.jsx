import { useState } from 'react'
import EmptyResult from '../components/EmptyResult'
import FormActions from '../components/FormActions'
import InputField from '../components/InputField'
import ResultCard from '../components/ResultCard'
import SelectField from '../components/SelectField'
import SplitBar from '../components/SplitBar'
import { useForm } from '../hooks/useForm'
import { calculateCompoundInterest } from '../utils/finance'
import { formatCurrency, formatPercent } from '../utils/format'
import { validateFields } from '../utils/validation'

const FREQUENCIES = [
  { value: '1', label: 'Yearly' },
  { value: '2', label: 'Half-yearly' },
  { value: '4', label: 'Quarterly' },
  { value: '12', label: 'Monthly' },
  { value: '365', label: 'Daily' },
]

const INITIAL = { principal: '', rate: '', years: '', frequency: '4' }

export default function CompoundInterestCalculator() {
  const { values, errors, setErrors, handleChange, reset } = useForm(INITIAL)
  const [result, setResult] = useState(null)

  const handleSubmit = (event) => {
    event.preventDefault()
    const { errors: fieldErrors, data, isValid } = validateFields(values, {
      principal: { label: 'Principal', gt: 0, max: 1e12 },
      rate: { label: 'Interest rate', min: 0, max: 100 },
      years: { label: 'Time', gt: 0, max: 100 },
    })
    setErrors(fieldErrors)
    if (!isValid) {
      setResult(null)
      return
    }
    setResult({ ...calculateCompoundInterest(data.principal, data.rate, data.years, Number(values.frequency)), principal: data.principal })
  }

  const handleReset = () => {
    reset()
    setResult(null)
  }

  return (
    <div className="calc-grid">
      <form className="calc-form" onSubmit={handleSubmit} noValidate>
        <InputField label="Principal" name="principal" prefix="₹" value={values.principal} onChange={handleChange} error={errors.principal} placeholder="1,00,000" />
        <InputField label="Annual interest rate" name="rate" suffix="%" value={values.rate} onChange={handleChange} error={errors.rate} placeholder="7" />
        <InputField label="Time" name="years" suffix="years" value={values.years} onChange={handleChange} error={errors.years} placeholder="5" />
        <SelectField label="Compounding frequency" name="frequency" value={values.frequency} onChange={handleChange} options={FREQUENCIES} />
        <FormActions onReset={handleReset} />
      </form>

      <div className="calc-output">
        {result ? (
          <ResultCard
            title="Compound interest"
            rows={[
              { label: 'Final amount', value: formatCurrency(result.finalAmount), highlight: true },
              { label: 'Compound interest', value: formatCurrency(result.compoundInterest) },
              { label: 'Principal', value: formatCurrency(result.principal) },
              { label: 'Effective annual rate', value: formatPercent(result.effectiveRate, 3) },
            ]}
          >
            <SplitBar
              parts={[
                { label: 'Principal', value: result.principal, display: formatCurrency(result.principal) },
                { label: 'Interest', value: result.compoundInterest, display: formatCurrency(result.compoundInterest) },
              ]}
            />
          </ResultCard>
        ) : (
          <EmptyResult text="A = P × (1 + r/n)^(n×t). Fill in the form to see how your money compounds." />
        )}
      </div>
    </div>
  )
}
