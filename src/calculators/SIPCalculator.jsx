import { useState } from 'react'
import EmptyResult from '../components/EmptyResult'
import FormActions from '../components/FormActions'
import HistoryList from '../components/HistoryList'
import InputField from '../components/InputField'
import ResultCard from '../components/ResultCard'
import SplitBar from '../components/SplitBar'
import { useForm } from '../hooks/useForm'
import { useHistory } from '../hooks/useHistory'
import { calculateSIP } from '../utils/finance'
import { formatCurrency } from '../utils/format'
import { validateFields } from '../utils/validation'

const INITIAL = { monthly: '', rate: '', years: '' }

export default function SIPCalculator() {
  const { values, errors, setErrors, handleChange, reset } = useForm(INITIAL)
  const [result, setResult] = useState(null)
  const history = useHistory('sip')

  const handleSubmit = (event) => {
    event.preventDefault()
    const { errors: fieldErrors, data, isValid } = validateFields(values, {
      monthly: { label: 'Monthly investment', gt: 0, max: 1e10 },
      rate: { label: 'Expected return', min: 0, max: 100 },
      years: { label: 'Investment period', gt: 0, max: 60 },
    })
    setErrors(fieldErrors)
    if (!isValid) {
      setResult(null)
      return
    }
    const sip = calculateSIP(data.monthly, data.rate, data.years)
    setResult(sip)
    history.addItem(`${formatCurrency(data.monthly)}/month @ ${data.rate}% for ${data.years} yrs`, formatCurrency(sip.finalAmount))
  }

  const handleReset = () => {
    reset()
    setResult(null)
  }

  return (
    <div className="calc-grid">
      <form className="calc-form" onSubmit={handleSubmit} noValidate>
        <InputField label="Monthly investment" name="monthly" prefix="₹" value={values.monthly} onChange={handleChange} error={errors.monthly} placeholder="5,000" />
        <InputField label="Expected annual return" name="rate" suffix="%" value={values.rate} onChange={handleChange} error={errors.rate} placeholder="12" />
        <InputField label="Investment period" name="years" suffix="years" value={values.years} onChange={handleChange} error={errors.years} placeholder="10" />
        <FormActions onReset={handleReset} />
        <p className="muted small">Assumes you invest at the start of every month and returns compound monthly. Actual market returns vary.</p>
      </form>

      <div className="calc-output">
        {result ? (
          <ResultCard
            title="Investment growth"
            rows={[
              { label: 'Final amount', value: formatCurrency(result.finalAmount), highlight: true },
              { label: 'Total investment', value: formatCurrency(result.totalInvestment) },
              { label: 'Estimated returns', value: formatCurrency(result.estimatedReturns) },
            ]}
          >
            <SplitBar
              parts={[
                { label: 'Invested', value: result.totalInvestment, display: formatCurrency(result.totalInvestment) },
                { label: 'Returns', value: result.estimatedReturns, display: formatCurrency(result.estimatedReturns) },
              ]}
            />
          </ResultCard>
        ) : (
          <EmptyResult text="Enter your monthly SIP amount to see how it could grow." />
        )}
        <HistoryList items={history.items} onClear={history.clearHistory} />
      </div>
    </div>
  )
}
