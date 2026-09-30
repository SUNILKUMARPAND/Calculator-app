import { useState } from 'react'
import EmptyResult from '../components/EmptyResult'
import FormActions from '../components/FormActions'
import InputField from '../components/InputField'
import ResultCard from '../components/ResultCard'
import { useForm } from '../hooks/useForm'
import { calculateTip } from '../utils/finance'
import { formatCurrency } from '../utils/format'
import { validateFields } from '../utils/validation'

const QUICK_TIPS = ['5', '10', '15', '20']
const INITIAL = { bill: '', tip: '10', people: '1' }

export default function TipCalculator() {
  const { values, errors, setErrors, handleChange, setValue, reset } = useForm(INITIAL)
  const [result, setResult] = useState(null)

  const handleSubmit = (event) => {
    event.preventDefault()
    const { errors: fieldErrors, data, isValid } = validateFields(values, {
      bill: { label: 'Bill amount', gt: 0, max: 1e10 },
      tip: { label: 'Tip percentage', min: 0, max: 100 },
      people: { label: 'Number of people', min: 1, max: 1000, integer: true },
    })
    setErrors(fieldErrors)
    if (!isValid) {
      setResult(null)
      return
    }
    setResult({ ...calculateTip(data.bill, data.tip, data.people), people: data.people })
  }

  const handleReset = () => {
    reset()
    setResult(null)
  }

  return (
    <div className="calc-grid">
      <form className="calc-form" onSubmit={handleSubmit} noValidate>
        <InputField label="Bill amount" name="bill" prefix="₹" value={values.bill} onChange={handleChange} error={errors.bill} placeholder="1,850" />
        <InputField label="Tip percentage" name="tip" suffix="%" value={values.tip} onChange={handleChange} error={errors.tip} />
        <div className="chips" aria-label="Quick tip percentages">
          {QUICK_TIPS.map((tip) => (
            <button key={tip} type="button" className={`chip ${values.tip === tip ? 'is-active' : ''}`} onClick={() => setValue('tip', tip)}>
              {tip}%
            </button>
          ))}
        </div>
        <InputField label="Number of people" name="people" inputMode="numeric" value={values.people} onChange={handleChange} error={errors.people} />
        <FormActions onReset={handleReset} />
      </form>

      <div className="calc-output">
        {result ? (
          <ResultCard
            title="Bill split"
            rows={[
              { label: result.people > 1 ? 'Amount per person' : 'Total to pay', value: formatCurrency(result.amountPerPerson), highlight: true },
              { label: 'Total tip', value: formatCurrency(result.totalTip) },
              { label: 'Total bill', value: formatCurrency(result.totalBill) },
              ...(result.people > 1 ? [{ label: 'Tip per person', value: formatCurrency(result.tipPerPerson) }] : []),
            ]}
          />
        ) : (
          <EmptyResult text="Work out the tip and split the bill fairly." />
        )}
      </div>
    </div>
  )
}
