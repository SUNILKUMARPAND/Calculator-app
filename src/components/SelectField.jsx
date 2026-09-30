/** options: [{ value, label }] */
export default function SelectField({ label, name, value, onChange, options, hint }) {
  const id = `field-${name}`
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="input-wrap">
        <select id={id} name={name} value={value} onChange={onChange}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  )
}
