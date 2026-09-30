/**
 * Horizontal bar showing how a total is split, e.g. principal vs interest.
 * parts: exactly two [{ label, value, display }] — colours come from CSS (--series-1 / --series-2).
 */
export default function SplitBar({ parts }) {
  const total = parts.reduce((sum, part) => sum + part.value, 0)
  if (total <= 0) return null

  return (
    <figure className="split">
      <div className="split-bar" role="img" aria-label={parts.map((p) => `${p.label} ${Math.round((p.value / total) * 100)}%`).join(', ')}>
        {parts.map((part, index) =>
          part.value > 0 ? (
            <span
              key={part.label}
              className={`split-seg series-${index + 1}`}
              style={{ flexGrow: part.value }}
              title={`${part.label}: ${part.display}`}
            />
          ) : null,
        )}
      </div>
      <figcaption className="split-legend">
        {parts.map((part, index) => (
          <span key={part.label} className="legend-item">
            <span className={`legend-swatch series-${index + 1}`} aria-hidden="true" />
            {part.label} <strong>{Math.round((part.value / total) * 100)}%</strong>
          </span>
        ))}
      </figcaption>
    </figure>
  )
}
