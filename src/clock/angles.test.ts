import { describe, it, expect } from 'vitest'
import { minutesToAngle, hoursToAngle, angleToMinutes, snapMinutes } from './angles'

describe('minutesToAngle', () => {
  it('maps 0 → 0 and 30 → 180', () => {
    expect(minutesToAngle(0)).toBe(0)
    expect(minutesToAngle(30)).toBe(180)
  })
})

describe('hoursToAngle', () => {
  it('includes minute contribution', () => {
    expect(hoursToAngle(3, 0)).toBe(90)
    expect(hoursToAngle(3, 30)).toBe(105)
  })
})

describe('snapMinutes', () => {
  it('snaps to step', () => {
    expect(snapMinutes(7, 5)).toBe(5)
    expect(snapMinutes(8, 5)).toBe(10)
  })
})

describe('angleToMinutes', () => {
  it('converts and snaps', () => {
    expect(angleToMinutes(180, 5)).toBe(30)
  })
})
