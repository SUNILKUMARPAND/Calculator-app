import { CATEGORIES } from '../calculators'
import SearchBox from './SearchBox'

/** Home screen: a searchable grid of calculator tiles grouped by category. */
export default function Dashboard({ calculators, totalCount, query, onQueryChange, onSelect }) {
  return (
    <div className="dashboard">
      <section className="hero">
        <div>
          <h1>Every calculator you need, in one place.</h1>
          <p className="muted">
            {totalCount} calculators for maths, money, health, dates and conversions. Everything runs in your browser.
          </p>
        </div>
        <SearchBox id="dashboard-search" value={query} onChange={onQueryChange} placeholder="Search e.g. EMI, BMI, GST…" />
      </section>

      {calculators.length === 0 && (
        <div className="empty-state">
          <p>No calculator matches “{query}”.</p>
          <button type="button" className="btn btn-ghost" onClick={() => onQueryChange('')}>
            Clear search
          </button>
        </div>
      )}

      {CATEGORIES.map((category) => {
        const items = calculators.filter((calc) => calc.category === category)
        if (items.length === 0) return null
        return (
          <section key={category} className="tile-section">
            <h2 className="section-title">{category}</h2>
            <div className="tile-grid">
              {items.map((calc) => (
                <button key={calc.id} type="button" className="tile" onClick={() => onSelect(calc.id)}>
                  <span className="calc-icon" aria-hidden="true">
                    {calc.icon}
                  </span>
                  <span className="tile-text">
                    <span className="tile-title">{calc.name}</span>
                    <span className="tile-desc">{calc.description}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
