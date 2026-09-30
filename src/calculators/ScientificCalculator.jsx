import { useState } from 'react'
import Display from '../components/Display'
import HistoryList from '../components/HistoryList'
import Keypad from '../components/Keypad'
import Tabs from '../components/Tabs'
import { useExpression } from '../hooks/useExpression'
import { useKeyboard } from '../hooks/useKeyboard'

const KEYS = [
  { label: 'sin', value: 'sin(', variant: 'fn' },
  { label: 'cos', value: 'cos(', variant: 'fn' },
  { label: 'tan', value: 'tan(', variant: 'fn' },
  { label: '(', variant: 'fn', ariaLabel: 'Open bracket' },
  { label: ')', variant: 'fn', ariaLabel: 'Close bracket' },

  { label: 'log', value: 'log(', variant: 'fn', ariaLabel: 'Log base 10' },
  { label: 'ln', value: 'ln(', variant: 'fn', ariaLabel: 'Natural log' },
  { label: '√', value: 'sqrt(', variant: 'fn', ariaLabel: 'Square root' },
  { label: 'x²', value: '^2', variant: 'fn', ariaLabel: 'Square' },
  { label: 'xʸ', value: '^', variant: 'fn', ariaLabel: 'Power' },

  { label: 'π', variant: 'fn', ariaLabel: 'Pi' },
  { label: 'e', variant: 'fn', ariaLabel: "Euler's number" },
  { label: 'n!', value: '!', variant: 'fn', ariaLabel: 'Factorial' },
  { label: 'Ans', value: 'ans', variant: 'fn', ariaLabel: 'Last answer' },
  { label: '%', variant: 'fn', ariaLabel: 'Percent' },

  { label: '7' },
  { label: '8' },
  { label: '9' },
  { label: 'C', action: 'clear', variant: 'danger', ariaLabel: 'Clear' },
  { label: '⌫', action: 'backspace', variant: 'muted', ariaLabel: 'Delete' },

  { label: '4' },
  { label: '5' },
  { label: '6' },
  { label: '×', value: '*', variant: 'op', ariaLabel: 'Multiply' },
  { label: '÷', value: '/', variant: 'op', ariaLabel: 'Divide' },

  { label: '1' },
  { label: '2' },
  { label: '3' },
  { label: '+', variant: 'op', ariaLabel: 'Add' },
  { label: '−', value: '-', variant: 'op', ariaLabel: 'Subtract' },

  { label: '0', wide: true },
  { label: '.', ariaLabel: 'Decimal point' },
  { label: '=', action: 'equals', variant: 'primary', wide: true, ariaLabel: 'Equals' },
]

const ANGLE_TABS = [
  { id: 'deg', label: 'DEG' },
  { id: 'rad', label: 'RAD' },
]

export default function ScientificCalculator() {
  const [angleMode, setAngleMode] = useState('deg')
  const calc = useExpression('scientific', { angleMode })
  useKeyboard(calc)

  const handleAction = (action) => {
    if (action === 'clear') calc.clear()
    if (action === 'backspace') calc.backspace()
    if (action === 'equals') calc.calculate()
  }

  return (
    <div className="keypad-layout">
      <div className="keypad-panel">
        <div className="panel-toolbar">
          <Tabs tabs={ANGLE_TABS} active={angleMode} onChange={setAngleMode} label="Angle mode" />
          <span className="muted small">Angles in {angleMode === 'deg' ? 'degrees' : 'radians'}</span>
        </div>
        <Display {...calc} badge={angleMode.toUpperCase()} />
        <Keypad keys={KEYS} columns={5} onInput={calc.input} onAction={handleAction} />
        <p className="muted small keyboard-hint">Brackets close automatically: “sin(30” is read as “sin(30)”.</p>
      </div>
      <HistoryList items={calc.history.items} onClear={calc.history.clearHistory} onSelect={(item) => calc.recall(item.value)} />
    </div>
  )
}
