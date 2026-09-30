import CopyButton from './CopyButton'

/**
 * Shows calculation results as label/value rows.
 * rows: [{ label, value, highlight? }]  – the highlighted row is shown big.
 * The copy button copies every row as plain text.
 */
export default function ResultCard({ title = 'Result', rows = [], tone, badge, children }) {
  const copyText = rows.map((row) => `${row.label}: ${row.value}`).join('\n')
  const main = rows.find((row) => row.highlight)
  const others = rows.filter((row) => !row.highlight)

  return (
    <section className={`result-card ${tone ? `tone-${tone}` : ''}`} aria-live="polite">
      <div className="result-head">
        <h3>{title}</h3>
        {rows.length > 0 && <CopyButton text={copyText} />}
      </div>

      {main && (
        <div className="result-main">
          <span className="result-main-label">{main.label}</span>
          <strong className="result-main-value">{main.value}</strong>
          {badge && <span className={`badge badge-${tone ?? 'neutral'}`}>{badge}</span>}
        </div>
      )}

      {others.length > 0 && (
        <dl className="result-rows">
          {others.map((row) => (
            <div className="result-row" key={row.label}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {children}
    </section>
  )
}
