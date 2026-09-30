import { useState } from 'react'
import EmptyResult from '../components/EmptyResult'
import FormActions from '../components/FormActions'
import InputField from '../components/InputField'
import ResultCard from '../components/ResultCard'
import { useForm } from '../hooks/useForm'
import { calculateFuelCost } from '../utils/finance'
import { formatCurrency, formatNumber } from '../utils/format'
import { validateFields } from '../utils/validation'

const INITIAL = { distance: '', mileage: '', price: '', people: '1', roundTrip: false }

export default function FuelCostCalculator() {
  const { values, errors, setErrors, handleChange, reset } = useForm(INITIAL)
  const [result, setResult] = useState(null)

  const handleSubmit = (event) => {
    event.preventDefault()
    const { errors: fieldErrors, data, isValid } = validateFields(values, {
      distance: { label: 'Distance', gt: 0, max: 1e6 },
      mileage: { label: 'Mileage', gt: 0, max: 1000 },
      price: { label: 'Fuel price', gt: 0, max: 10000 },
      people: { label: 'Number of people', min: 1, max: 100, integer: true },
    })
    setErrors(fieldErrors)
    if (!isValid) {
      setResult(null)
      return
    }
    setResult({ ...calculateFuelCost(data.distance, data.mileage, data.price, values.roundTrip, data.people), people: data.people })
  }

  const handleReset = () => {
    reset()
    setResult(null)
  }

  return (
    <div className="calc-grid">
      <form className="calc-form" onSubmit={handleSubmit} noValidate>
        <InputField label="Distance (one way)" name="distance" suffix="km" value={values.distance} onChange={handleChange} error={errors.distance} placeholder="350" />
        <InputField label="Vehicle mileage" name="mileage" suffix="km/L" value={values.mileage} onChange={handleChange} error={errors.mileage} placeholder="15" />
        <InputField label="Fuel price" name="price" prefix="₹" suffix="/L" value={values.price} onChange={handleChange} error={errors.price} placeholder="105" />
        <InputField label="Split between" name="people" suffix="people" inputMode="numeric" value={values.people} onChange={handleChange} error={errors.people} />
        <label className="checkbox">
          <input type="checkbox" name="roundTrip" checked={values.roundTrip} onChange={handleChange} />
          Round trip (double the distance)
        </label>
        <FormActions onReset={handleReset} />
      </form>

      <div className="calc-output">
        {result ? (
          <ResultCard
            title="Trip cost"
            rows={[
              { label: 'Total trip cost', value: formatCurrency(result.totalCost), highlight: true },
              { label: 'Fuel required', value: `${formatNumber(result.fuelRequired)} L` },
              { label: 'Total distance', value: `${formatNumber(result.totalDistance)} km` },
              { label: 'Cost per km', value: formatCurrency(result.costPerKm) },
              ...(result.people > 1 ? [{ label: 'Cost per person', value: formatCurrency(result.costPerPerson) }] : []),
            ]}
          />
        ) : (
          <EmptyResult text="Plan your road trip budget: fuel needed and total cost." />
        )}
      </div>
    </div>
  )
}
