import { describe, it, expect } from 'vitest'
import { normalizeTime, timeEquals, timeToDigits } from './time'

describe('normalizeTime', () => {
  it('wraps hours into 1–12', () => {
    expect(normalizeTime({ hours: 0, minutes: 0 })).toEqual({ hours: 12, minutes: 0 })
    expect(normalizeTime({ hours: 13, minutes: 0 })).toEqual({ hours: 1, minutes: 0 })
  })
  it('wraps minutes into 0–59 and rolls hours', () => {
    expect(normalizeTime({ hours: 1, minutes: 60 })).toEqual({ hours: 2, minutes: 0 })
  })
})

describe('timeToDigits', () => {
  it('pads minutes', () => {
    expect(timeToDigits({ hours: 3, minutes: 5 })).toBe('3:05')
    expect(timeToDigits({ hours: 12, minutes: 0 })).toBe('12:00')
  })
})

describe('timeEquals', () => {
  it('compares normalized values', () => {
    expect(timeEquals({ hours: 12, minutes: 0 }, { hours: 0, minutes: 0 })).toBe(true)
  })
})
