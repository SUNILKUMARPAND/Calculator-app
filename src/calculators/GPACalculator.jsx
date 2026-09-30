import { useState } from 'react'
import EmptyResult from '../components/EmptyResult'
import ErrorMessage from '../components/ErrorMessage'
import ResultCard from '../components/ResultCard'
import SelectField from '../components/SelectField'
import Tabs from '../components/Tabs'
import { formatNumber } from '../utils/format'
import { GRADE_SCALES, gradePoints, weightedAverage } from '../utils/gpa'
import { validateNumber } from '../utils/validation'

const MODES = [
  { id: 'gpa', label: 'GPA (subjects)' },
  { id: 'cgpa', label: 'CGPA (semesters)' },
]
const SCALE_OPTIONS = Object.entries(GRADE_SCALES).map(([value, scale]) => ({ value, label: scale.label }))

let nextId = 1
const newSubject = (scaleKey) => ({ id: nextId++, name: '', credits: '', grade: GRADE_SCALES[scaleKey].grades[0].grade })
const newSemester = () => ({ id: nextId++, name: '', credits: '', sgpa: '' })
const startingSubjects = (scaleKey) => [newSubject(scaleKey), newSubject(scaleKey), newSubject(scaleKey)]
const startingSemesters = () => [newSemester(), newSemester()]

export default function GPACalculator() {
  const [mode, setMode] = useState('gpa')
  const [scaleKey, setScaleKey] = useState('ten')
  const [subjects, setSubjects] = useState(() => startingSubjects('ten'))
  const [semesters, setSemesters] = useState(startingSemesters)
  const [rowErrors, setRowErrors] = useState({}) // { [rowId]: 'message' }
  const [result, setResult] = useState(null)

  const scale = GRADE_SCALES[scaleKey]
  const rows = mode === 'gpa' ? subjects : semesters
  const setRows = mode === 'gpa' ? setSubjects : setSemesters

  const updateRow = (id, field, value) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, [field]: value } : row)))
    setRowErrors((current) => ({ ...current, [id]: undefined }))
  }
  const addRow = () => setRows((current) => [...current, mode === 'gpa' ? newSubject(scaleKey) : newSemester()])
  const removeRow = (id) => setRows((current) => (current.length > 1 ? current.filter((row) => row.id !== id) : current))

  const handleSubmit = (event) => {
    event.preventDefault()
    const errors = {}
    const items = []

    rows.forEach((row, index) => {
      const label = row.name.trim() || (mode === 'gpa' ? `Subject ${index + 1}` : `Semester ${index + 1}`)
      const credits = validateNumber(row.credits, { label: `${label}: credits`, gt: 0, max: 100 })
      const sgpa = mode === 'cgpa' ? validateNumber(row.sgpa, { label: `${label}: SGPA`, min: 0, max: scale.max }) : null
      const error = credits.error || sgpa?.error

      if (error) errors[row.id] = error
      else items.push({ credits: credits.value, points: mode === 'gpa' ? gradePoints(scaleKey, row.grade) : sgpa.value })
    })

    setRowErrors(errors)
    if (Object.keys(errors).length) {
      setResult(null)
      return
    }
    setResult({ ...weightedAverage(items), mode, count: items.length })
  }

  const handleReset = () => {
    if (mode === 'gpa') setSubjects(startingSubjects(scaleKey))
    else setSemesters(startingSemesters())
    setRowErrors({})
    setResult(null)
  }

  const changeScale = (event) => {
    const key = event.target.value
    setScaleKey(key)
    // Grades differ between scales, so reset each subject's grade to the top grade
    setSubjects((current) => current.map((row) => ({ ...row, grade: GRADE_SCALES[key].grades[0].grade })))
    setResult(null)
  }

  const changeMode = (next) => {
    setMode(next)
    setRowErrors({})
    setResult(null)
  }

  const errorList = Object.values(rowErrors).filter(Boolean)
  const percentage = result && scaleKey === 'ten' ? result.average * 9.5 : null

  return (
    <div className="calc-grid">
      <form className="calc-form" onSubmit={handleSubmit} noValidate>
        <Tabs tabs={MODES} active={mode} onChange={changeMode} label="GPA or CGPA" />
        <SelectField label="Grading scale" name="scale" value={scaleKey} onChange={changeScale} options={SCALE_OPTIONS} />

        <div className="row-list">
          <div className="row-head" aria-hidden="true">
            <span>{mode === 'gpa' ? 'Subject' : 'Semester'}</span>
            <span>Credits</span>
            <span>{mode === 'gpa' ? 'Grade' : 'SGPA'}</span>
            <span />
          </div>

          {rows.map((row, index) => (
            <div key={row.id} className={`row-item ${rowErrors[row.id] ? 'has-error' : ''}`}>
              <input
                aria-label={`${mode === 'gpa' ? 'Subject' : 'Semester'} ${index + 1} name`}
                placeholder={mode === 'gpa' ? `Subject ${index + 1}` : `Semester ${index + 1}`}
                value={row.name}
                onChange={(e) => updateRow(row.id, 'name', e.target.value)}
              />
              <input
                aria-label={`Row ${index + 1} credits`}
                inputMode="decimal"
                placeholder="4"
                value={row.credits}
                onChange={(e) => updateRow(row.id, 'credits', e.target.value)}
              />
              {mode === 'gpa' ? (
                <select aria-label={`Row ${index + 1} grade`} value={row.grade} onChange={(e) => updateRow(row.id, 'grade', e.target.value)}>
                  {scale.grades.map((g) => (
                    <option key={g.grade} value={g.grade}>
                      {g.grade} ({g.points})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  aria-label={`Row ${index + 1} SGPA`}
                  inputMode="decimal"
                  placeholder={scaleKey === 'ten' ? '8.2' : '3.4'}
                  value={row.sgpa}
                  onChange={(e) => updateRow(row.id, 'sgpa', e.target.value)}
                />
              )}
              <button type="button" className="icon-btn remove-btn" onClick={() => removeRow(row.id)} disabled={rows.length === 1} aria-label={`Remove row ${index + 1}`}>
                ✕
              </button>
            </div>
          ))}
        </div>

        <button type="button" className="btn btn-ghost btn-sm add-row" onClick={addRow}>
          + Add {mode === 'gpa' ? 'subject' : 'semester'}
        </button>

        {errorList.length > 0 && <ErrorMessage>{errorList[0]}</ErrorMessage>}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Calculate {mode === 'gpa' ? 'GPA' : 'CGPA'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={handleReset}>
            Reset
          </button>
        </div>
      </form>

      <div className="calc-output">
        {result ? (
          <ResultCard
            title={result.mode === 'gpa' ? 'Your GPA' : 'Your CGPA'}
            rows={[
              { label: result.mode === 'gpa' ? 'GPA' : 'CGPA', value: `${formatNumber(result.average, 2)} / ${scale.max}`, highlight: true },
              { label: 'Total credits', value: formatNumber(result.totalCredits, 2) },
              { label: 'Total grade points', value: formatNumber(result.totalPoints, 2) },
              { label: result.mode === 'gpa' ? 'Subjects' : 'Semesters', value: String(result.count) },
              ...(percentage !== null ? [{ label: 'Approx. percentage (× 9.5)', value: `${formatNumber(percentage, 2)}%` }] : []),
            ]}
          />
        ) : (
          <EmptyResult text={mode === 'gpa' ? 'Add each subject with its credits and grade.' : 'Add each semester with its credits and SGPA.'} />
        )}
      </div>
    </div>
  )
}
