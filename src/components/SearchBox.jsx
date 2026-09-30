export default function SearchBox({ value, onChange, id = 'search', placeholder = 'Search calculators…' }) {
  return (
    <div className="search">
      <label htmlFor={id} className="sr-only">
        Search calculators
      </label>
      <span className="search-icon" aria-hidden="true">
        ⌕
      </span>
      <input id={id} type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoComplete="off" />
    </div>
  )
}
