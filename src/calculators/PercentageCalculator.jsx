import { useState } from 'react'
import EmptyResult from '../components/EmptyResult'
import ErrorMessage from '../components/ErrorMessage'
import FormActions from '../components/FormActions'
import InputField from '../components/InputField'
import ResultCard from '../components/ResultCard'
import Tabs from '../components/Tabs'
import { useForm } from '../hooks/useForm'
import { formatNumber } from '../utils/format'
import { PERCENTAGE_MODES } from '../utils/percentage'
import { validateFields } from '../utils/validation'

const INITIAL = { a: '', b: '' }

export default function PercentageCalculator() {
  const { values, errors, setErrors, handleChange, reset } = useForm(INITIAL)
  const [modeId, setModeId] = useState(PERCENTAGE_MODES[0].id)
  const [result, setResult] = useState(null)
  const [calcError, setCalcError] = useState('')

  const mode = PERCENTAGE_MODES.find((m) => m.id === modeId)

  const handleSubmit = (event) => {
    event.preventDefault()
    setCalcError('')
    const { errors: fieldErrors, data, isValid } = validateFields(values, {
      a: { label: mode.a.label },
      b: { label: mode.b.label },
    })
    setErrors(fieldErrors)
    if (!isValid) {
      setResult(null)
      return
    }
    try {
      setResult(mode.solve(data.a, data.b))
    } catch (error) {
      setResult(null)
      setCalcError(error.message)
    }
  }

  const handleReset = () => {
    reset()
    setResult(null)
    setCalcError('')
  }

  const changeMode = (id) => {
    setModeId(id)
    handleReset()
  }

  return (
    <div className="calc-grid">
      <form className="calc-form" onSubmit={handleSubmit} noValidate>
        <Tabs tabs={PERCENTAGE_MODES} active={modeId} onChange={changeMode} label="Percentage type" />
        <InputField label={mode.a.label} name="a" suffix={mode.a.suffix} value={values.a} onChange={handleChange} error={errors.a} placeholder={mode.a.placeholder} />
        <InputField label={mode.b.label} name="b" suffix={mode.b.suffix} value={values.b} onChange={handleChange} error={errors.b} placeholder={mode.b.placeholder} />
        <ErrorMessage>{calcError}</ErrorMessage>
        <FormActions onReset={handleReset} />
      </form>

      <div className="calc-output">
        {result ? (
          <ResultCard
            title={mode.label}
            rows={[
              { label: 'Answer', value: `${formatNumber(result.value, 4)}${mode.resultSuffix ?? ''}`, highlight: true },
              { label: 'Explanation', value: result.text },
            ]}
          />
        ) : (
          <EmptyResult text="Pick a percentage question above and fill in the two values." />
        )}
      </div>
    </div>
  )
}
