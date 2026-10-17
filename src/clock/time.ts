export type ClockTime = { hours: number; minutes: number }

export function normalizeTime(t: ClockTime): ClockTime {
  let total = ((t.hours % 12) + 12) % 12 * 60 + t.minutes
  // treat 12 as 0 for arithmetic, then map 0 → 12 for display hours
  total = ((total % (12 * 60)) + 12 * 60) % (12 * 60)
  const hours24 = Math.floor(total / 60) // 0–11
  const minutes = total % 60
  return { hours: hours24 === 0 ? 12 : hours24, minutes }
}

export function timeEquals(a: ClockTime, b: ClockTime): boolean {
  const na = normalizeTime(a)
  const nb = normalizeTime(b)
  return na.hours === nb.hours && na.minutes === nb.minutes
}

export function timeToDigits(t: ClockTime): string {
  const n = normalizeTime(t)
  return `${n.hours}:${String(n.minutes).padStart(2, '0')}`
}
