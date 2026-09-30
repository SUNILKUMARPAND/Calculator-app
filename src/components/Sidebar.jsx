import { CATEGORIES } from '../calculators'
import SearchBox from './SearchBox'

/** Calculator menu, grouped by category and filtered by the search query. */
export default function Sidebar({ calculators, activeId, onSelect, query, onQueryChange, isOpen, onClose }) {
  return (
    <>
      <div className={`sidebar-backdrop ${isOpen ? 'is-visible' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside id="sidebar" className={`sidebar ${isOpen ? 'is-open' : ''}`} aria-label="Calculators">
        <div className="sidebar-top">
          <SearchBox id="sidebar-search" value={query} onChange={onQueryChange} />
        </div>

        <nav className="sidebar-nav">
          <button type="button" className={`nav-item ${activeId === '' ? 'is-active' : ''}`} onClick={() => onSelect('')}>
            <span className="nav-icon" aria-hidden="true">
              ▦
            </span>
            Dashboard
          </button>

          {CATEGORIES.map((category) => {
            const items = calculators.filter((calc) => calc.category === category)
            if (items.length === 0) return null
            return (
              <div className="nav-group" key={category}>
                <p className="nav-group-title">{category}</p>
                {items.map((calc) => (
                  <button
                    key={calc.id}
                    type="button"
                    className={`nav-item ${activeId === calc.id ? 'is-active' : ''}`}
                    aria-current={activeId === calc.id ? 'page' : undefined}
                    onClick={() => onSelect(calc.id)}
                  >
                    <span className="nav-icon" aria-hidden="true">
                      {calc.icon}
                    </span>
                    {calc.name}
                  </button>
                ))}
              </div>
            )
          })}

          {calculators.length === 0 && <p className="muted small sidebar-empty">No calculator matches “{query}”.</p>}
        </nav>
      </aside>
    </>
  )
}
