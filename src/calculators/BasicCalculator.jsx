import Display from '../components/Display'
import HistoryList from '../components/HistoryList'
import Keypad from '../components/Keypad'
import { useExpression } from '../hooks/useExpression'
import { useKeyboard } from '../hooks/useKeyboard'

const KEYS = [
  { label: 'C', action: 'clear', variant: 'danger', ariaLabel: 'Clear' },
  { label: '⌫', action: 'backspace', variant: 'muted', ariaLabel: 'Delete' },
  { label: '%', variant: 'op', ariaLabel: 'Percent' },
  { label: '÷', value: '/', variant: 'op', ariaLabel: 'Divide' },
  { label: '7' },
  { label: '8' },
  { label: '9' },
  { label: '×', value: '*', variant: 'op', ariaLabel: 'Multiply' },
  { label: '4' },
  { label: '5' },
  { label: '6' },
  { label: '−', value: '-', variant: 'op', ariaLabel: 'Subtract' },
  { label: '1' },
  { label: '2' },
  { label: '3' },
  { label: '+', variant: 'op', ariaLabel: 'Add' },
  { label: '0', wide: true },
  { label: '.', ariaLabel: 'Decimal point' },
  { label: '=', action: 'equals', variant: 'primary', ariaLabel: 'Equals' },
]

export default function BasicCalculator() {
  const calc = useExpression('basic')
  useKeyboard(calc)

  const handleAction = (action) => {
    if (action === 'clear') calc.clear()
    if (action === 'backspace') calc.backspace()
    if (action === 'equals') calc.calculate()
  }

  return (
    <div className="keypad-layout">
      <div className="keypad-panel">
        <Display {...calc} />
        <Keypad keys={KEYS} onInput={calc.input} onAction={handleAction} />
        <p className="muted small keyboard-hint">Tip: you can type with your keyboard — Enter to calculate, Esc to clear.</p>
      </div>
      <HistoryList items={calc.history.items} onClear={calc.history.clearHistory} onSelect={(item) => calc.recall(item.value)} />
    </div>
  )
}
