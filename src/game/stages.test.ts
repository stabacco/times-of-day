import { describe, it, expect } from 'vitest'
import {
  STAGE_ORDER,
  nextStage,
  minuteStepForStage,
  isLegalTime,
  randomLegalTime,
} from './stages'

describe('stages', () => {
  it('orders five stages', () => {
    expect(STAGE_ORDER).toEqual(['hours', 'half', 'quarter', 'five', 'any'])
  })

  it('nextStage advances then ends', () => {
    expect(nextStage('hours')).toBe('half')
    expect(nextStage('any')).toBeNull()
  })

  it('minute steps match pedagogy', () => {
    expect(minuteStepForStage('hours')).toBe(60)
    expect(minuteStepForStage('half')).toBe(30)
    expect(minuteStepForStage('quarter')).toBe(15)
    expect(minuteStepForStage('five')).toBe(5)
    expect(minuteStepForStage('any')).toBe(1)
  })

  it('legal times for hours are :00 only', () => {
    expect(isLegalTime('hours', { hours: 3, minutes: 0 })).toBe(true)
    expect(isLegalTime('hours', { hours: 3, minutes: 30 })).toBe(false)
  })

  it('randomLegalTime respects stage', () => {
    for (let i = 0; i < 40; i++) {
      const t = randomLegalTime('quarter', () => 0.42)
      expect(isLegalTime('quarter', t)).toBe(true)
    }
  })
})
