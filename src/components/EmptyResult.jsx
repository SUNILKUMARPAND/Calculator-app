/** Placeholder shown in the result area before the first calculation. */
export default function EmptyResult({ text }) {
  return (
    <div className="result-card result-empty">
      <p className="muted">{text}</p>
    </div>
  )
}
