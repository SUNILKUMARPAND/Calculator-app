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
import { amortizationByYear, calculateEMI } from '../utils/finance'
import { formatCurrency, formatNumber } from '../utils/format'
import { validateFields } from '../utils/validation'

const INITIAL = { amount: '', rate: '', tenure: '', tenureUnit: 'years' }

export default function EMICalculator() {
  const { values, errors, setErrors, handleChange, reset } = useForm(INITIAL)
  const [result, setResult] = useState(null)
  const history = useHistory('emi')

  const handleSubmit = (event) => {
    event.preventDefault()
    const inYears = values.tenureUnit === 'years'
    const { errors: fieldErrors, data, isValid } = validateFields(values, {
      amount: { label: 'Loan amount', gt: 0, max: 1e12 },
      rate: { label: 'Interest rate', min: 0, max: 50 },
      tenure: { label: 'Loan tenure', gt: 0, max: inYears ? 40 : 480, integer: !inYears },
    })
    setErrors(fieldErrors)
    if (!isValid) {
      setResult(null)
      return
    }

    const months = Math.round(inYears ? data.tenure * 12 : data.tenure)
    if (months < 1) {
      setErrors({ tenure: 'Loan tenure must be at least 1 month' })
      setResult(null)
      return
    }

    const emi = calculateEMI(data.amount, data.rate, months)
    setResult({ ...emi, principal: data.amount, months, schedule: amortizationByYear(data.amount, data.rate, months) })
    history.addItem(`${formatCurrency(data.amount)} @ ${data.rate}% for ${months} months`, `EMI ${formatCurrency(emi.emi)}`)
  }

  const handleReset = () => {
    reset()
    setResult(null)
  }

  return (
    <div className="calc-grid">
      <form className="calc-form" onSubmit={handleSubmit} noValidate>
        <InputField label="Loan amount" name="amount" prefix="₹" value={values.amount} onChange={handleChange} error={errors.amount} placeholder="5,00,000" />
        <InputField label="Interest rate (per year)" name="rate" suffix="%" value={values.rate} onChange={handleChange} error={errors.rate} placeholder="8.5" />
        <div className="field-row">
          <InputField label="Loan tenure" name="tenure" value={values.tenure} onChange={handleChange} error={errors.tenure} placeholder="20" />
          <SelectField
            label="Tenure in"
            name="tenureUnit"
            value={values.tenureUnit}
            onChange={handleChange}
            options={[
              { value: 'years', label: 'Years' },
              { value: 'months', label: 'Months' },
            ]}
          />
        </div>
        <FormActions onReset={handleReset} />
      </form>

      <div className="calc-output">
        {result ? (
          <ResultCard
            title="Loan summary"
            rows={[
              { label: 'Monthly EMI', value: formatCurrency(result.emi), highlight: true },
              { label: 'Principal amount', value: formatCurrency(result.principal) },
              { label: 'Total interest', value: formatCurrency(result.totalInterest) },
              { label: 'Total payment', value: formatCurrency(result.totalPayment) },
              { label: 'Number of EMIs', value: formatNumber(result.months, 0) },
            ]}
          >
            <SplitBar
              parts={[
                { label: 'Principal', value: result.principal, display: formatCurrency(result.principal) },
                { label: 'Interest', value: result.totalInterest, display: formatCurrency(result.totalInterest) },
              ]}
            />
            <details className="schedule">
              <summary>Year-wise breakdown</summary>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Year</th>
                      <th scope="col">Principal paid</th>
                      <th scope="col">Interest paid</th>
                      <th scope="col">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.schedule.map((row) => (
                      <tr key={row.year}>
                        <td>{row.year}</td>
                        <td>{formatCurrency(row.principal)}</td>
                        <td>{formatCurrency(row.interest)}</td>
                        <td>{formatCurrency(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </ResultCard>
        ) : (
          <EmptyResult text="Enter your loan details and press Calculate to see your monthly EMI." />
        )}
        <HistoryList items={history.items} onClear={history.clearHistory} />
      </div>
    </div>
  )
}

