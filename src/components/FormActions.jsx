/** Calculate + Reset buttons used at the bottom of every form. */
export default function FormActions({ onReset, submitLabel = 'Calculate' }) {
  return (
    <div className="form-actions">
      <button type="submit" className="btn btn-primary">
        {submitLabel}
      </button>
      <button type="button" className="btn btn-ghost" onClick={onReset}>
        Reset
      </button>
    </div>
  )
}
