// Date helpers. All dates are handled in LOCAL time to avoid off-by-one-day
// bugs that happen when "2024-05-01" is parsed as UTC midnight.

const MS_PER_DAY = 24 * 60 * 60 * 1000

/** "2024-05-01" (from <input type="date">) → local Date, or null if empty/invalid. */
export function parseDateInput(value) {
  if (!value) return null
  const [y, m, d] = value.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return Number.isNaN(date.getTime()) ? null : date
}

/** Date → "2024-05-01" for <input type="date"> */
export function toInputValue(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export const todayInputValue = () => toInputValue(new Date())

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

export function weekdayName(date) {
  return new Intl.DateTimeFormat('en-IN', { weekday: 'long' }).format(date)
}

const daysInMonth = (year, monthIndex) => new Date(year, monthIndex + 1, 0).getDate()

/** Whole days between two dates (DST-safe because it compares UTC calendar days). */
export function daysBetween(start, end) {
  const a = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())
  const b = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate())
  return Math.round((b - a) / MS_PER_DAY)
}

/**
 * Calendar difference in years, months and days (like counting on a calendar).
 * Order of the arguments does not matter.
 */
export function diffYMD(dateA, dateB) {
  const [start, end] = dateA <= dateB ? [dateA, dateB] : [dateB, dateA]

  // 1. Count whole months: the most months we can add to `start` without passing `end`
  let totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
  if (addToDate(start, totalMonths, 'months') > end) totalMonths -= 1

  // 2. Whatever is left over is days
  const days = daysBetween(addToDate(start, totalMonths, 'months'), end)

  return {
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12,
    days,
    totalMonths,
    totalDays: daysBetween(start, end),
  }
}

export function formatYMD({ years, months, days }) {
  const part = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`
  return `${part(years, 'year')}, ${part(months, 'month')}, ${part(days, 'day')}`
}

/**
 * Add an amount of days/weeks/months/years. Month/year math clamps to the last
 * valid day, so 31 Jan + 1 month = 28/29 Feb (not 3 Mar).
 */
export function addToDate(date, amount, unit) {
  const result = new Date(date)
  if (unit === 'days') result.setDate(result.getDate() + amount)
  else if (unit === 'weeks') result.setDate(result.getDate() + amount * 7)
  else {
    const totalMonths = unit === 'years' ? amount * 12 : amount
    const target = new Date(date.getFullYear(), date.getMonth() + totalMonths, 1)
    const day = Math.min(date.getDate(), daysInMonth(target.getFullYear(), target.getMonth()))
    return new Date(target.getFullYear(), target.getMonth(), day)
  }
  return result
}

export function isWeekday(date) {
  const day = date.getDay()
  return day !== 0 && day !== 6
}

/** Monday–Friday count between two dates (inclusive of both ends). */
export function countWeekdays(start, end) {
  const [from, to] = start <= end ? [start, end] : [end, start]
  const totalDays = daysBetween(from, to) + 1
  const fullWeeks = Math.floor(totalDays / 7)
  let count = fullWeeks * 5
  // Walk the remaining 0–6 days
  const day = new Date(from)
  day.setDate(day.getDate() + fullWeeks * 7)
  for (let i = 0; i < totalDays % 7; i++) {
    if (isWeekday(day)) count++
    day.setDate(day.getDate() + 1)
  }
  return count
}

/** Next birthday on or after `fromDate` (29 Feb birthdays fall on 1 Mar in non-leap years). */
export function nextBirthday(dob, fromDate) {
  let next = new Date(fromDate.getFullYear(), dob.getMonth(), dob.getDate())
  if (daysBetween(fromDate, next) < 0) next = new Date(fromDate.getFullYear() + 1, dob.getMonth(), dob.getDate())
  return { date: next, daysLeft: daysBetween(fromDate, next) }
}
