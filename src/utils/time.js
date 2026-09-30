// Duration helpers — everything is converted to seconds, calculated, then converted back.

export const TIME_UNITS = {
  seconds: { label: 'Seconds', seconds: 1 },
  minutes: { label: 'Minutes', seconds: 60 },
  hours: { label: 'Hours', seconds: 3600 },
  days: { label: 'Days', seconds: 86400 },
}

export const toSeconds = ({ hours = 0, minutes = 0, seconds = 0 }) => hours * 3600 + minutes * 60 + seconds

/** 3725 → { sign: '', days: 0, hours: 1, minutes: 2, seconds: 5 } */
export function splitSeconds(totalSeconds) {
  const sign = totalSeconds < 0 ? '−' : ''
  let rest = Math.round(Math.abs(totalSeconds))
  const days = Math.floor(rest / 86400)
  rest %= 86400
  const hours = Math.floor(rest / 3600)
  rest %= 3600
  return { sign, days, hours, minutes: Math.floor(rest / 60), seconds: rest % 60 }
}

/** 90061 → "1d 01:01:01"  ·  3725 → "01:02:05" */
export function formatHMS(totalSeconds) {
  const { sign, days, hours, minutes, seconds } = splitSeconds(totalSeconds)
  const pad = (n) => String(n).padStart(2, '0')
  return `${sign}${days ? `${days}d ` : ''}${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

/** 3725 → "1 hour 2 minutes 5 seconds" */
export function describeDuration(totalSeconds) {
  const { sign, days, hours, minutes, seconds } = splitSeconds(totalSeconds)
  const parts = [
    [days, 'day'],
    [hours, 'hour'],
    [minutes, 'minute'],
    [seconds, 'second'],
  ]
    .filter(([n]) => n > 0)
    .map(([n, word]) => `${n} ${word}${n === 1 ? '' : 's'}`)
  return parts.length ? `${sign}${parts.join(' ')}` : '0 seconds'
}

/** "14:30" → 870 (minutes since midnight) */
export function clockToMinutes(value) {
  const [h, m] = value.split(':').map(Number)
  return h * 60 + m
}
