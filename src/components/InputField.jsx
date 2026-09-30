/**
 * Labelled input with optional prefix/suffix (₹, %, kg…), hint and error text.
 * Numeric fields use type="text" + inputMode="decimal": the phone shows a number
 * keypad, and our own validation (not the browser's) produces the error messages.
 */
export default function InputField({
  label,
  name,
  value,
  onChange,
  error,
  hint,
  prefix,
  suffix,
  type = 'text',
  inputMode = 'decimal',
  placeholder,
  ...rest
}) {
  const id = `field-${name}`
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <div className="input-wrap">
        {prefix && <span className="affix">{prefix}</span>}
        <input
          id={id}
          name={name}
          type={type}
          inputMode={type === 'text' ? inputMode : undefined}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          autoComplete="off"
          {...rest}
        />
        {suffix && <span className="affix">{suffix}</span>}
      </div>
      {error ? (
        <p className="field-error" id={`${id}-error`}>
          {error}
        </p>
      ) : (
        hint && (
          <p className="field-hint" id={`${id}-hint`}>
            {hint}
          </p>
        )
      )}
    </div>
  )
}
