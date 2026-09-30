/** Frame around every calculator: icon, title, description and the calculator body. */
export default function CalculatorCard({ calculator, children }) {
  return (
    <article className="calculator-card">
      <header className="calculator-card-head">
        <span className="calc-icon" aria-hidden="true">
          {calculator.icon}
        </span>
        <div>
          <p className="eyebrow">{calculator.category}</p>
          <h2>{calculator.name}</h2>
          <p className="muted">{calculator.description}</p>
        </div>
      </header>
      <div className="calculator-card-body">{children}</div>
    </article>
  )
}
