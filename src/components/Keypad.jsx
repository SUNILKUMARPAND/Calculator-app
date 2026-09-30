/**
 * Grid of calculator keys.
 * keys: [{ label, value?, action?, variant?, wide?, ariaLabel? }]
 *   value  – text appended to the expression (defaults to label)
 *   action – 'clear' | 'backspace' | 'equals' | custom string handled by onAction
 */
export default function Keypad({ keys, columns = 4, onInput, onAction }) {
  return (
    <div className={`keypad ${columns > 4 ? 'is-dense' : ''}`} style={{ '--cols': columns }}>
      {keys.map((key) => (
        <button
          key={key.label}
          type="button"
          className={`key ${key.variant ? `key-${key.variant}` : ''} ${key.wide ? 'key-wide' : ''}`}
          aria-label={key.ariaLabel ?? key.label}
          onClick={() => (key.action ? onAction(key.action) : onInput(key.value ?? key.label))}
        >
          {key.label}
        </button>
      ))}
    </div>
  )
}
