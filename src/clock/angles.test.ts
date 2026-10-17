import { describe, it, expect } from 'vitest'
import {
  minutesToAngle,
  hoursToAngle,
  angleToMinutes,
  angleToHours,
  snapMinutes,
} from './angles'

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

  it('rounds to integer minutes when step <= 0', () => {
    expect(snapMinutes(7.4, 0)).toBe(7)
    expect(snapMinutes(7.6, -1)).toBe(8)
    expect(Number.isInteger(snapMinutes(22.3, 0))).toBe(true)
  })
})

describe('angleToMinutes', () => {
  it('converts and snaps', () => {
    expect(angleToMinutes(180, 5)).toBe(30)
  })

  it('returns integer minutes when snap <= 0', () => {
    expect(angleToMinutes(91, 0)).toBe(15)
    expect(Number.isInteger(angleToMinutes(45, 0))).toBe(true)
  })
})

describe('angleToHours', () => {
  it('maps 12 o\'clock and mid-hour', () => {
    expect(angleToHours(0, 0)).toBe(12)
    expect(angleToHours(105, 30)).toBe(3)
  })
})
