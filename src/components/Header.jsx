export default function Header({ theme, onToggleTheme, onMenuClick, onHome, isMenuOpen }) {
  const isDark = theme === 'dark'
  return (
    <header className="app-header">
      <button
        type="button"
        className="icon-btn menu-btn"
        onClick={onMenuClick}
        aria-label="Open calculator menu"
        aria-expanded={isMenuOpen}
        aria-controls="sidebar"
      >
        ☰
      </button>

      <a
        href="#/"
        className="brand"
        onClick={(event) => {
          event.preventDefault()
          onHome()
        }}
      >
        <span className="brand-logo" aria-hidden="true">
          ∑
        </span>
        <span className="brand-name">All-in-One Calculator</span>
      </a>

      <button
        type="button"
        className="icon-btn theme-btn"
        onClick={onToggleTheme}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        <span aria-hidden="true">{isDark ? '☀' : '☾'}</span>
        <span className="theme-label">{isDark ? 'Light' : 'Dark'}</span>
      </button>
    </header>
  )
}
