import { useState } from 'react'
import EmptyResult from '../components/EmptyResult'
import FormActions from '../components/FormActions'
import HistoryList from '../components/HistoryList'
import InputField from '../components/InputField'
import ResultCard from '../components/ResultCard'
import SelectField from '../components/SelectField'
import SplitBar from '../components/SplitBar'
import { useForm } from '../hooks/useForm'
import { useHistory } from '../hooks/useHistory'
import { calculateLoanPayment } from '../utils/finance'
import { formatCurrency, formatNumber } from '../utils/format'
import { validateFields } from '../utils/validation'

const FREQUENCIES = [
  { value: '12', label: 'Monthly', noun: 'Monthly payment' },
  { value: '4', label: 'Quarterly', noun: 'Quarterly payment' },
  { value: '2', label: 'Half-yearly', noun: 'Half-yearly payment' },
  { value: '1', label: 'Yearly', noun: 'Yearly payment' },
]

const INITIAL = { principal: '', rate: '', years: '', frequency: '12' }

export default function LoanCalculator() {
  const { values, errors, setErrors, handleChange, reset } = useForm(INITIAL)
  const [result, setResult] = useState(null)
  const history = useHistory('loan')

  const handleSubmit = (event) => {
    event.preventDefault()
    const { errors: fieldErrors, data, isValid } = validateFields(values, {
      principal: { label: 'Principal amount', gt: 0, max: 1e12 },
      rate: { label: 'Interest rate', min: 0, max: 50 },
      years: { label: 'Loan duration', gt: 0, max: 50 },
    })
    setErrors(fieldErrors)
    if (!isValid) {
      setResult(null)
      return
    }

    const perYear = Number(values.frequency)
    const loan = calculateLoanPayment(data.principal, data.rate, data.years, perYear)
    if (loan.numberOfPayments < 1) {
      setErrors({ years: 'Duration is too short for this payment frequency' })
      setResult(null)
      return
    }
    const frequency = FREQUENCIES.find((f) => f.value === values.frequency)
    setResult({ ...loan, principal: data.principal, frequency })
    history.addItem(`${formatCurrency(data.principal)} @ ${data.rate}% for ${data.years} yrs (${frequency.label})`, formatCurrency(loan.payment))
  }

  const handleReset = () => {
    reset()
    setResult(null)
  }

  return (
    <div className="calc-grid">
      <form className="calc-form" onSubmit={handleSubmit} noValidate>
        <InputField label="Principal amount" name="principal" prefix="₹" value={values.principal} onChange={handleChange} error={errors.principal} placeholder="10,00,000" />
        <InputField label="Interest rate (per year)" name="rate" suffix="%" value={values.rate} onChange={handleChange} error={errors.rate} placeholder="10" />
        <InputField label="Loan duration" name="years" suffix="years" value={values.years} onChange={handleChange} error={errors.years} placeholder="5" hint="Decimals allowed, e.g. 2.5 years" />
        <SelectField label="Payment frequency" name="frequency" value={values.frequency} onChange={handleChange} options={FREQUENCIES} />
        <FormActions onReset={handleReset} />
      </form>

      <div className="calc-output">
        {result ? (
          <ResultCard
            title="Repayment summary"
            rows={[
              { label: result.frequency.noun, value: formatCurrency(result.payment), highlight: true },
              { label: 'Number of payments', value: formatNumber(result.numberOfPayments, 0) },
              { label: 'Total interest', value: formatCurrency(result.totalInterest) },
              { label: 'Total repayment', value: formatCurrency(result.totalRepayment) },
            ]}
          >
            <SplitBar
              parts={[
                { label: 'Principal', value: result.principal, display: formatCurrency(result.principal) },
                { label: 'Interest', value: result.totalInterest, display: formatCurrency(result.totalInterest) },
              ]}
            />
          </ResultCard>
        ) : (
          <EmptyResult text="Enter the loan details to see each payment, total interest and total repayment." />
        )}
        <HistoryList items={history.items} onClear={history.clearHistory} />
      </div>
    </div>
  )
}
