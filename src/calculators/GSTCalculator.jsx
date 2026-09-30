import { useState } from 'react'
import EmptyResult from '../components/EmptyResult'
import FormActions from '../components/FormActions'
import InputField from '../components/InputField'
import ResultCard from '../components/ResultCard'
import Tabs from '../components/Tabs'
import { useForm } from '../hooks/useForm'
import { calculateGST } from '../utils/finance'
import { formatCurrency, formatPercent } from '../utils/format'
import { validateFields } from '../utils/validation'

const MODES = [
  { id: 'add', label: 'Add GST' },
  { id: 'remove', label: 'Remove GST' },
]
const GST_SLABS = ['5', '12', '18', '28']
const INITIAL = { amount: '', rate: '18' }

export default function GSTCalculator() {
  const { values, errors, setErrors, handleChange, setValue, reset } = useForm(INITIAL)
  const [mode, setMode] = useState('add')
  const [result, setResult] = useState(null)

  const handleSubmit = (event) => {
    event.preventDefault()
    const { errors: fieldErrors, data, isValid } = validateFields(values, {
      amount: { label: 'Amount', gt: 0, max: 1e12 },
      rate: { label: 'GST rate', min: 0, max: 100 },
    })
    setErrors(fieldErrors)
    if (!isValid) {
      setResult(null)
      return
    }
    setResult({ ...calculateGST(data.amount, data.rate, mode), rate: data.rate, mode })
  }

  const handleReset = () => {
    reset()
    setResult(null)
  }

  const changeMode = (next) => {
    setMode(next)
    setResult(null)
  }

  return (
    <div className="calc-grid">
      <form className="calc-form" onSubmit={handleSubmit} noValidate>
        <Tabs tabs={MODES} active={mode} onChange={changeMode} label="GST mode" />
        <InputField
          label={mode === 'add' ? 'Amount (before GST)' : 'Amount (including GST)'}
          name="amount"
          prefix="₹"
          value={values.amount}
          onChange={handleChange}
          error={errors.amount}
          placeholder="10,000"
        />
        <InputField label="GST rate" name="rate" suffix="%" value={values.rate} onChange={handleChange} error={errors.rate} />
        <div className="chips" aria-label="Common GST slabs">
          {GST_SLABS.map((slab) => (
            <button key={slab} type="button" className={`chip ${values.rate === slab ? 'is-active' : ''}`} onClick={() => setValue('rate', slab)}>
              {slab}%
            </button>
          ))}
        </div>
        <FormActions onReset={handleReset} />
      </form>

      <div className="calc-output">
        {result ? (
          <ResultCard
            title={result.mode === 'add' ? 'GST added' : 'GST removed'}
            rows={[
              result.mode === 'add'
                ? { label: 'Amount including GST', value: formatCurrency(result.grossAmount), highlight: true }
                : { label: 'Amount excluding GST', value: formatCurrency(result.netAmount), highlight: true },
              { label: `GST amount (${formatPercent(result.rate)})`, value: formatCurrency(result.gstAmount) },
              { label: 'CGST (half)', value: formatCurrency(result.gstAmount / 2) },
              { label: 'SGST (half)', value: formatCurrency(result.gstAmount / 2) },
              result.mode === 'add'
                ? { label: 'Amount excluding GST', value: formatCurrency(result.netAmount) }
                : { label: 'Amount including GST', value: formatCurrency(result.grossAmount) },
            ]}
          />
        ) : (
          <EmptyResult text="Add GST to a price, or pull the GST out of a price that already includes it." />
        )}
      </div>
    </div>
  )
}
