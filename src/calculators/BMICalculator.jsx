import { useState } from 'react'
import EmptyResult from '../components/EmptyResult'
import FormActions from '../components/FormActions'
import HistoryList from '../components/HistoryList'
import InputField from '../components/InputField'
import ResultCard from '../components/ResultCard'
import Tabs from '../components/Tabs'
import { useForm } from '../hooks/useForm'
import { useHistory } from '../hooks/useHistory'
import { formatNumber } from '../utils/format'
import { BMI_CATEGORIES, calculateBMI, feetInchesToCm, getBMICategory, healthyWeightRange, poundsToKg } from '../utils/health'
import { validateFields } from '../utils/validation'

const UNIT_TABS = [
  { id: 'metric', label: 'Metric (cm, kg)' },
  { id: 'imperial', label: 'Imperial (ft, lb)' },
]
const INITIAL = { heightCm: '', weightKg: '', feet: '', inches: '', pounds: '' }

// Where the BMI marker sits on the scale bar (scale drawn from BMI 12 to 40)
const SCALE_MIN = 12
const SCALE_MAX = 40
const markerPosition = (bmi) => `${Math.min(Math.max((bmi - SCALE_MIN) / (SCALE_MAX - SCALE_MIN), 0), 1) * 100}%`
// Width of each category band on that scale, e.g. Normal = 18.5 → 25
const bands = BMI_CATEGORIES.map((category, index) => ({
  ...category,
  width: Math.min(category.max, SCALE_MAX) - (index === 0 ? SCALE_MIN : BMI_CATEGORIES[index - 1].max),
}))

export default function BMICalculator() {
  const { values, errors, setErrors, handleChange, reset } = useForm(INITIAL)
  const [units, setUnits] = useState('metric')
  const [result, setResult] = useState(null)
  const history = useHistory('bmi')

  const handleSubmit = (event) => {
    event.preventDefault()
    const rules =
      units === 'metric'
        ? {
            heightCm: { label: 'Height', min: 50, max: 272 },
            weightKg: { label: 'Weight', min: 2, max: 650 },
          }
        : {
            feet: { label: 'Feet', min: 1, max: 8, integer: true },
            inches: { label: 'Inches', min: 0, max: 11.99, required: false },
            pounds: { label: 'Weight', min: 5, max: 1400 },
          }
    const { errors: fieldErrors, data, isValid } = validateFields(values, rules)
    setErrors(fieldErrors)
    if (!isValid) {
      setResult(null)
      return
    }

    const heightCm = units === 'metric' ? data.heightCm : feetInchesToCm(data.feet, data.inches)
    const weightKg = units === 'metric' ? data.weightKg : poundsToKg(data.pounds)
    const bmi = calculateBMI(weightKg, heightCm)
    const category = getBMICategory(bmi)
    setResult({ bmi, category, range: healthyWeightRange(heightCm) })
    history.addItem(`${formatNumber(heightCm, 1)} cm, ${formatNumber(weightKg, 1)} kg`, `BMI ${formatNumber(bmi, 1)} · ${category.label}`)
  }

  const handleReset = () => {
    reset()
    setResult(null)
  }

  const changeUnits = (next) => {
    setUnits(next)
    setErrors({})
    setResult(null)
  }

  const showInPounds = units === 'imperial'
  const weightText = (kg) => (showInPounds ? `${formatNumber(kg / 0.45359237, 1)} lb` : `${formatNumber(kg, 1)} kg`)

  return (
    <div className="calc-grid">
      <form className="calc-form" onSubmit={handleSubmit} noValidate>
        <Tabs tabs={UNIT_TABS} active={units} onChange={changeUnits} label="Units" />
        {units === 'metric' ? (
          <>
            <InputField label="Height" name="heightCm" suffix="cm" value={values.heightCm} onChange={handleChange} error={errors.heightCm} placeholder="170" />
            <InputField label="Weight" name="weightKg" suffix="kg" value={values.weightKg} onChange={handleChange} error={errors.weightKg} placeholder="65" />
          </>
        ) : (
          <>
            <div className="field-row">
              <InputField label="Height" name="feet" suffix="ft" inputMode="numeric" value={values.feet} onChange={handleChange} error={errors.feet} placeholder="5" />
              <InputField label="Inches" name="inches" suffix="in" value={values.inches} onChange={handleChange} error={errors.inches} placeholder="7" />
            </div>
            <InputField label="Weight" name="pounds" suffix="lb" value={values.pounds} onChange={handleChange} error={errors.pounds} placeholder="145" />
          </>
        )}
        <FormActions onReset={handleReset} />
        <p className="muted small">BMI is a screening tool for adults and does not account for muscle mass, age or body type.</p>
      </form>

      <div className="calc-output">
        {result ? (
          <ResultCard
            title="Your BMI"
            tone={result.category.tone}
            badge={result.category.label}
            rows={[
              { label: 'Body Mass Index', value: formatNumber(result.bmi, 1), highlight: true },
              { label: 'Category', value: result.category.label },
              { label: 'Healthy weight for your height', value: `${weightText(result.range.min)} – ${weightText(result.range.max)}` },
            ]}
          >
            <div className="bmi-scale" aria-hidden="true">
              <div className="bmi-scale-bar">
                {bands.map((band) => (
                  <span key={band.label} className={`bmi-seg tone-bg-${band.tone}`} style={{ flexGrow: band.width }} />
                ))}
                <span className="bmi-marker" style={{ left: markerPosition(result.bmi) }} />
              </div>
              <div className="bmi-scale-labels">
                {bands.map((band) => (
                  <span key={band.label} style={{ flexGrow: band.width }}>
                    {band.label}
                  </span>
                ))}
              </div>
            </div>
            <p className="small">{result.category.advice}</p>
          </ResultCard>
        ) : (
          <EmptyResult text="BMI categories: under 18.5 underweight · 18.5–24.9 normal · 25–29.9 overweight · 30+ obesity." />
        )}
        <HistoryList items={history.items} onClear={history.clearHistory} />
      </div>
    </div>
  )
}
