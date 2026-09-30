/** Recent calculations. Clicking an entry calls onSelect(entry) when provided. */
export default function HistoryList({ items, onClear, onSelect, title = 'History' }) {
  return (
    <section className="history">
      <div className="history-head">
        <h3>{title}</h3>
        {items.length > 0 && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClear}>
            Clear
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="muted small">No calculations yet.</p>
      ) : (
        <ul className="history-list">
          {items.map((item) => {
            const content = (
              <>
                <span className="history-label">{item.label}</span>
                <span className="history-value">{item.value}</span>
              </>
            )
            return (
              <li key={item.id}>
                {onSelect ? (
                  <button type="button" className="history-item" onClick={() => onSelect(item)} title="Use this result">
                    {content}
                  </button>
                ) : (
                  <div className="history-item">{content}</div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
