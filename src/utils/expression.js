/**
 * A small, safe math expression evaluator (no eval / new Function).
 *
 * It works in two steps:
 *   1. tokenize()  – turns "2×sin(30)+5%" into a list of tokens
 *   2. parse*()    – a recursive-descent parser that evaluates the tokens
 *
 * Grammar (lowest → highest precedence):
 *   expression = term (("+" | "-") term)*
 *   term       = unary (("*" | "/") unary | <implicit multiply>)*
 *   unary      = ("-" | "+") unary | power
 *   power      = postfix ("^" unary)?          ← right-associative
 *   postfix    = primary ("!" | "%")*
 *   primary    = number | constant | function "(" expression ")" | "(" expression ")"
 */

export class CalcError extends Error {}

const DEG_TO_RAD = Math.PI / 180
// Trig results closer to zero than this are floating-point noise (e.g. sin(180°)).
const EPSILON = 1e-12

const CONSTANTS = {
  π: Math.PI,
  pi: Math.PI,
  e: Math.E,
}

const FUNCTION_NAMES = ['sqrt', 'sin', 'cos', 'tan', 'log', 'ln']
// Longest names first so "sqrt" is not read as something shorter.
const WORDS = [...FUNCTION_NAMES, 'ans', 'pi', 'π', 'e'].sort((a, b) => b.length - a.length)

function cleanTrig(value) {
  return Math.abs(value) < EPSILON ? 0 : value
}

function applyFunction(name, x, angleMode) {
  const angle = angleMode === 'deg' ? x * DEG_TO_RAD : x
  switch (name) {
    case 'sin':
      return cleanTrig(Math.sin(angle))
    case 'cos':
      return cleanTrig(Math.cos(angle))
    case 'tan':
      if (Math.abs(Math.cos(angle)) < EPSILON) throw new CalcError('tan is undefined at this angle')
      return cleanTrig(Math.tan(angle))
    case 'log':
      if (x <= 0) throw new CalcError('log needs a positive number')
      return Math.log10(x)
    case 'ln':
      if (x <= 0) throw new CalcError('ln needs a positive number')
      return Math.log(x)
    case 'sqrt':
      if (x < 0) throw new CalcError('Cannot take the square root of a negative number')
      return Math.sqrt(x)
    default:
      throw new CalcError(`Unknown function "${name}"`)
  }
}

export function factorial(n) {
  if (!Number.isInteger(n) || n < 0) throw new CalcError('Factorial needs a whole number ≥ 0')
  if (n > 170) throw new CalcError('Number too large for factorial')
  let result = 1
  for (let i = 2; i <= n; i++) result *= i
  return result
}

/** Split an input string into tokens: {type: 'number'|'word'|'op', value}. */
export function tokenize(input) {
  const src = input
    .replace(/\s+/g, '')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/[−–]/g, '-')
    .replace(/√/g, 'sqrt')
    .toLowerCase()

  const tokens = []
  let i = 0
  while (i < src.length) {
    const rest = src.slice(i)
    const ch = src[i]

    if (/[\d.]/.test(ch)) {
      const match = /^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/.exec(rest)
      if (!match) throw new CalcError('Invalid number')
      i += match[0].length
      if (src[i] === '.') throw new CalcError('A number can only have one decimal point')
      tokens.push({ type: 'number', value: parseFloat(match[0]) })
      continue
    }

    if ('+-*/^!%()'.includes(ch)) {
      tokens.push({ type: 'op', value: ch })
      i++
      continue
    }

    const word = WORDS.find((w) => rest.startsWith(w))
    if (word) {
      tokens.push({ type: 'word', value: word })
      i += word.length
      continue
    }

    throw new CalcError(`Unexpected character "${ch}"`)
  }
  return tokens
}

/**
 * Evaluate an expression string.
 * @param {string} input  e.g. "2(3+4)^2 - sin(30)"
 * @param {{angleMode?: 'deg'|'rad', ans?: number}} options
 * @returns {number}
 */
export function evaluate(input, { angleMode = 'deg', ans = 0 } = {}) {
  const tokens = tokenize(input)
  if (tokens.length === 0) throw new CalcError('Enter an expression')

  let pos = 0
  const peek = () => tokens[pos]
  const isOp = (token, value) => token?.type === 'op' && token.value === value
  // Can this token start a new operand? Used for implicit multiplication: 2π, 3(4), (1)(2)
  const startsOperand = (token) => token && (token.type !== 'op' || token.value === '(')

  function expect(value, message) {
    if (!isOp(peek(), value)) throw new CalcError(message)
    pos++
  }

  function parseExpression() {
    let { value } = parseTerm()
    while (isOp(peek(), '+') || isOp(peek(), '-')) {
      const op = tokens[pos++].value
      const right = parseTerm()
      // Calculator-style percent: 200 + 10% means 200 + (10% of 200) = 220
      const amount = right.isPercent ? value * right.value : right.value
      value = op === '+' ? value + amount : value - amount
    }
    return value
  }

  function parseTerm() {
    let { value, isPercent } = parseUnary()
    for (;;) {
      const token = peek()
      if (isOp(token, '*') || isOp(token, '/')) {
        pos++
        const right = parseUnary().value
        if (token.value === '/' && right === 0) throw new CalcError('Cannot divide by zero')
        value = token.value === '*' ? value * right : value / right
      } else if (startsOperand(token)) {
        value *= parseUnary().value
      } else {
        break
      }
      isPercent = false
    }
    return { value, isPercent }
  }

  function parseUnary() {
    if (isOp(peek(), '-')) {
      pos++
      const inner = parseUnary()
      return { value: -inner.value, isPercent: inner.isPercent }
    }
    if (isOp(peek(), '+')) {
      pos++
      return parseUnary()
    }
    return parsePower()
  }

  function parsePower() {
    const base = parsePostfix()
    if (!isOp(peek(), '^')) return base
    pos++
    const exponent = parseUnary().value
    if (base.value === 0 && exponent < 0) throw new CalcError('Cannot divide by zero')
    return { value: base.value ** exponent, isPercent: false }
  }

  function parsePostfix() {
    let value = parsePrimary()
    let isPercent = false
    for (;;) {
      if (isOp(peek(), '!')) {
        pos++
        value = factorial(value)
        isPercent = false
      } else if (isOp(peek(), '%')) {
        pos++
        value /= 100
        isPercent = true
      } else {
        return { value, isPercent }
      }
    }
  }

  function parsePrimary() {
    const token = tokens[pos++]
    if (!token) throw new CalcError('Incomplete expression')

    if (token.type === 'number') return token.value

    if (isOp(token, '(')) {
      const value = parseExpression()
      expect(')', 'Missing closing bracket')
      return value
    }

    if (token.type === 'word') {
      if (token.value === 'ans') return ans
      if (token.value in CONSTANTS) return CONSTANTS[token.value]
      expect('(', `${token.value} needs brackets, e.g. ${token.value}(30)`)
      const arg = parseExpression()
      expect(')', 'Missing closing bracket')
      return applyFunction(token.value, arg, angleMode)
    }

    if (isOp(token, ')')) throw new CalcError('Empty or unmatched brackets')
    throw new CalcError(`Unexpected "${token.value}"`)
  }

  const result = parseExpression()
  if (pos < tokens.length) {
    const token = tokens[pos]
    throw new CalcError(isOp(token, ')') ? 'Unmatched closing bracket' : `Unexpected "${token.value}"`)
  }
  if (Number.isNaN(result)) throw new CalcError('Result is not a real number')
  if (!Number.isFinite(result)) throw new CalcError('Result is too large')
  return result
}

/** Appends any missing ")" so "sin(30" can still be evaluated. */
export function closeBrackets(expr) {
  const open = (expr.match(/\(/g) || []).length
  const close = (expr.match(/\)/g) || []).length
  return open > close ? expr + ')'.repeat(open - close) : expr
}
