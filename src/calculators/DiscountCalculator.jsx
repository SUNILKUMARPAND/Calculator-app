import { useState } from 'react'
import EmptyResult from '../components/EmptyResult'
import FormActions from '../components/FormActions'
import InputField from '../components/InputField'
import ResultCard from '../components/ResultCard'
import { useForm } from '../hooks/useForm'
import { calculateDiscount } from '../utils/finance'
import { formatCurrency, formatPercent } from '../utils/format'
import { validateFields } from '../utils/validation'

const INITIAL = { price: '', discount: '', extra: '' }

export default function DiscountCalculator() {
  const { values, errors, setErrors, handleChange, reset } = useForm(INITIAL)
  const [result, setResult] = useState(null)

  const handleSubmit = (event) => {
    event.preventDefault()
    const { errors: fieldErrors, data, isValid } = validateFields(values, {
      price: { label: 'Original price', gt: 0, max: 1e12 },
      discount: { label: 'Discount', min: 0, max: 100 },
      extra: { label: 'Extra discount', min: 0, max: 100, required: false },
    })
    setErrors(fieldErrors)
    if (!isValid) {
      setResult(null)
      return
    }
    setResult({ ...calculateDiscount(data.price, data.discount, data.extra), price: data.price, hasExtra: data.extra > 0 })
  }

  const handleReset = () => {
    reset()
    setResult(null)
  }

  return (
    <div className="calc-grid">
      <form className="calc-form" onSubmit={handleSubmit} noValidate>
        <InputField label="Original price" name="price" prefix="₹" value={values.price} onChange={handleChange} error={errors.price} placeholder="2,499" />
        <InputField label="Discount" name="discount" suffix="%" value={values.discount} onChange={handleChange} error={errors.discount} placeholder="30" />
        <InputField
          label="Extra discount (optional)"
          name="extra"
          suffix="%"
          value={values.extra}
          onChange={handleChange}
          error={errors.extra}
          placeholder="10"
          hint="Applied on the already-discounted price, e.g. “30% + extra 10% off”"
        />
        <FormActions onReset={handleReset} />
      </form>

      <div className="calc-output">
        {result ? (
          <ResultCard
            title="Price after discount"
            tone="good"
            badge={`You save ${formatPercent(result.effectivePercent)}`}
            rows={[
              { label: 'Final price', value: formatCurrency(result.finalPrice), highlight: true },
              { label: 'Discount amount', value: formatCurrency(result.discountAmount) },
              { label: 'Original price', value: formatCurrency(result.price) },
              ...(result.hasExtra ? [{ label: 'Effective discount', value: formatPercent(result.effectivePercent) }] : []),
            ]}
          />
        ) : (
          <EmptyResult text="Find out what you actually pay after a sale discount." />
        )}
      </div>
    </div>
  )
}
