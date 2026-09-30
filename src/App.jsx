import { useEffect, useState } from 'react'
import { CALCULATORS, searchCalculators } from './calculators'
import CalculatorCard from './components/CalculatorCard'
import Dashboard from './components/Dashboard'
import Layout from './components/Layout'
import { useHashRoute } from './hooks/useHashRoute'
import { useTheme } from './hooks/useTheme'

export default function App() {
  const { theme, toggleTheme } = useTheme()
  const [activeId, navigate] = useHashRoute()
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const active = CALCULATORS.find((calc) => calc.id === activeId)
  const filtered = searchCalculators(query)

  // Update the browser tab title for the open calculator
  useEffect(() => {
    document.title = active ? `${active.name} · All-in-One Calculator` : 'All-in-One Calculator'
  }, [active])

  // Close the mobile drawer with Escape
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (event) => event.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const openCalculator = (id) => {
    navigate(id)
    setMenuOpen(false)
  }

  const ActiveCalculator = active?.component

  return (
    <Layout
      headerProps={{
        theme,
        onToggleTheme: toggleTheme,
        onMenuClick: () => setMenuOpen((open) => !open),
        onHome: () => openCalculator(''),
        isMenuOpen: menuOpen,
      }}
      sidebarProps={{
        calculators: filtered,
        activeId: active ? active.id : '',
        onSelect: openCalculator,
        query,
        onQueryChange: setQuery,
        isOpen: menuOpen,
        onClose: () => setMenuOpen(false),
      }}
    >
      {active ? (
        <>
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <button type="button" className="link-btn" onClick={() => openCalculator('')}>
              ← All calculators
            </button>
          </nav>
          {/* key forces a fresh component (and fresh state) when switching calculators */}
          <CalculatorCard key={active.id} calculator={active}>
            <ActiveCalculator />
          </CalculatorCard>
        </>
      ) : (
        <Dashboard calculators={filtered} totalCount={CALCULATORS.length} query={query} onQueryChange={setQuery} onSelect={openCalculator} />
      )}
    </Layout>
  )
}
