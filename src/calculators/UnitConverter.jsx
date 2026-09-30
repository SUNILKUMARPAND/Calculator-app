import { useState } from 'react'
import ErrorMessage from '../components/ErrorMessage'
import InputField from '../components/InputField'
import ResultCard from '../components/ResultCard'
import SelectField from '../components/SelectField'
import Tabs from '../components/Tabs'
import { formatCalcResult, formatNumber } from '../utils/format'
import { UNIT_CATEGORIES, checkUnitValue, convertUnit } from '../utils/units'
import { validateNumber } from '../utils/validation'

const CATEGORY_TABS = Object.entries(UNIT_CATEGORIES).map(([id, category]) => ({ id, label: category.label }))

/** Readable number for conversions: grouped digits normally, exponent notation for extremes. */
function displayValue(value) {
  const abs = Math.abs(value)
  if (abs !== 0 && (abs >= 1e15 || abs < 1e-6)) return formatCalcResult(value)
  return formatNumber(value, 6)
}

export default function UnitConverter() {
  const [categoryKey, setCategoryKey] = useState('length')
  const [from, setFrom] = useState(UNIT_CATEGORIES.length.defaults[0])
  const [to, setTo] = useState(UNIT_CATEGORIES.length.defaults[1])
  const [amount, setAmount] = useState('1')

  const category = UNIT_CATEGORIES[categoryKey]
  const unitOptions = Object.entries(category.units).map(([value, unit]) => ({ value, label: unit.label }))

  // Converts live while typing — this is cheap, so no Calculate button is needed.
  const { value, error: inputError } = validateNumber(amount, { label: 'Value' })
  // Negative lengths, temperatures below absolute zero, etc.
  const rangeError = inputError ? null : checkUnitValue(value, categoryKey, from)
  const error = inputError || rangeError
  const converted = error ? null : convertUnit(value, categoryKey, from, to)

  const changeCategory = (key) => {
    setCategoryKey(key)
    setFrom(UNIT_CATEGORIES[key].defaults[0])
    setTo(UNIT_CATEGORIES[key].defaults[1])
  }

  const swap = () => {
    setFrom(to)
    setTo(from)
  }

  const unitShort = (key) => category.units[key].label.match(/\(([^)]+)\)/)?.[1] ?? category.units[key].label

  return (
    <div className="calc-grid">
      <div className="calc-form">
        <Tabs tabs={CATEGORY_TABS} active={categoryKey} onChange={changeCategory} label="Unit category" />
        <InputField label="Value" name="unit-value" value={amount} onChange={(e) => setAmount(e.target.value)} error={inputError} />
        <div className="swap-row">
          <SelectField label="From" name="unit-from" value={from} onChange={(e) => setFrom(e.target.value)} options={unitOptions} />
          <button type="button" className="icon-btn swap-btn" onClick={swap} aria-label="Swap units" title="Swap units">
            ⇄
          </button>
          <SelectField label="To" name="unit-to" value={to} onChange={(e) => setTo(e.target.value)} options={unitOptions} />
        </div>
        <ErrorMessage>{rangeError}</ErrorMessage>
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => setAmount('1')}>
            Reset
          </button>
        </div>
        {category.note && <p className="muted small">{category.note}</p>}
      </div>

      <div className="calc-output">
        {converted !== null && (
          <ResultCard
            title={`${category.label} conversion`}
            rows={[{ label: `${displayValue(value)} ${unitShort(from)} =`, value: `${displayValue(converted)} ${unitShort(to)}`, highlight: true }]}
          >
            <div className="table-wrap">
              <table>
                <caption className="sr-only">{`${displayValue(value)} ${unitShort(from)} in every ${category.label.toLowerCase()} unit`}</caption>
                <tbody>
                  {unitOptions.map((unit) => (
                    <tr key={unit.value} className={unit.value === to ? 'is-highlight' : ''}>
                      <th scope="row">{unit.label}</th>
                      <td>{displayValue(convertUnit(value, categoryKey, from, unit.value))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ResultCard>
        )}
      </div>
    </div>
  )
}
