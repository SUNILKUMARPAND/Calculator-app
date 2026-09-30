import { useMemo, useState } from 'react'
import { CalcError, closeBrackets, evaluate } from '../utils/expression'
import { formatCalcResult, prettyExpression } from '../utils/format'
import { useHistory } from './useHistory'

const OPERATORS = ['+', '-', '*', '/', '^']
const FUNCTION_AT_END = /(sqrt|sin|cos|tan|log|ln)\($|ans$/

/**
 * State + input rules shared by the Basic and Scientific calculators.
 * The expression is stored as plain text ("2*sin(30)") and evaluated
 * by our own parser in utils/expression.js — never with eval().
 */
export function useExpression(historyId, { angleMode = 'deg' } = {}) {
  const [expression, setExpression] = useState('')
  const [lastAnswer, setLastAnswer] = useState(0)
  const [justEvaluated, setJustEvaluated] = useState(false)
  const [error, setError] = useState('')
  const history = useHistory(historyId)

  // Live preview of the result while typing (errors are silent here)
  const preview = useMemo(() => {
    if (!expression || justEvaluated) return ''
    try {
      return formatCalcResult(evaluate(closeBrackets(expression), { angleMode, ans: lastAnswer }))
    } catch {
      return ''
    }
  }, [expression, justEvaluated, angleMode, lastAnswer])

  const update = (next) => {
    setExpression(next)
    setError('')
    setJustEvaluated(false)
  }

  /** Handles every key press: digits, operators, functions, brackets… */
  const input = (key) => {
    let current = expression
    const isOperator = OPERATORS.includes(key)
    const startsValue = /^[\d.(]|^[a-zπ√]/i.test(key)

    // After "=", typing a number starts fresh; typing an operator continues from the answer
    if (justEvaluated) current = startsValue && key !== '%' && key !== '!' ? '' : current

    const last = current.slice(-1)

    if (isOperator) {
      if (current === '') {
        if (key !== '-') return update('0' + key) // "×5" → "0×5"
      } else if (OPERATORS.includes(last)) {
        // Allow a minus after × ÷ ^ for negatives (e.g. 5×−2), otherwise replace the operator
        if (key === '-' && last !== '-' && last !== '+') return update(current + key)
        const trimmed = current.replace(/[+\-*/^]+$/, '')
        return update((trimmed || (key === '-' ? '' : '0')) + key)
      } else if (last === '(' && key !== '-') {
        return // can't start a bracket with ×, ÷, + or ^
      }
    }

    if (key === '.') {
      const lastNumber = current.match(/[\d.]*$/)[0]
      if (lastNumber.includes('.')) return // one decimal point per number
      if (lastNumber === '') return update(current + '0.')
    }

    // Postfix keys (%, !, ), x²) need a value before them
    if ((key === '%' || key === '!' || key === ')' || key.startsWith('^')) && (current === ''|| OPERATORS.includes(last) || last === '(')) return

    update(current + key)
  }

  const backspace = () => {
    if (justEvaluated) return clear()
    const match = expression.match(FUNCTION_AT_END)
    update(match ? expression.slice(0, -match[0].length) : expression.slice(0, -1))
  }

  const clear = () => update('')

  const calculate = () => {
    if (!expression) return
    if (justEvaluated) return
    const complete = closeBrackets(expression)
    try {
      const value = evaluate(complete, { angleMode, ans: lastAnswer })
      const formatted = formatCalcResult(value)
      history.addItem(prettyExpression(complete), formatted)
      setLastAnswer(value)
      setExpression(formatted)
      setJustEvaluated(true)
      setError('')
    } catch (err) {
      setError(err instanceof CalcError ? err.message : 'Invalid expression')
    }
  }

  /** Put a previous result back on the display (history click). */
  const recall = (value) => {
    setExpression(value)
    setJustEvaluated(true)
    setError('')
  }

  return { expression, preview, error, justEvaluated, history, input, backspace, clear, calculate, recall }
}
