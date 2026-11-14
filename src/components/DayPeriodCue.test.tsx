import { describe, expect, it } from 'vitest'
import { isNightGardenScene, periodCueKind, shouldShowPeriodCue } from './DayPeriodCue'

describe('shouldShowPeriodCue', () => {
  it('shows for ampm labels', () => {
    expect(shouldShowPeriodCue('ampm', { hours: 3, minutes: 0 })).toBe(true)
  })
  it('shows for midday/midnight phrases', () => {
    expect(shouldShowPeriodCue('phrase', { hours: 12, minutes: 0 })).toBe(true)
  })
  it('hides for plain digits and ordinary phrases', () => {
    expect(shouldShowPeriodCue('digits', { hours: 3, minutes: 0 })).toBe(false)
    expect(shouldShowPeriodCue('phrase', { hours: 3, minutes: 15 })).toBe(false)
  })
})

describe('periodCueKind', () => {
  it('uses sun for midday and morning, moon for midnight and evening', () => {
    expect(periodCueKind('pm', { hours: 12, minutes: 0 })).toBe('sun')
    expect(periodCueKind('am', { hours: 12, minutes: 0 })).toBe('moon')
    expect(periodCueKind('am', { hours: 10, minutes: 0 })).toBe('sun')
    expect(periodCueKind('pm', { hours: 10, minutes: 0 })).toBe('moon')
  })
})

describe('isNightGardenScene', () => {
  it('is night only when the period cue would show a moon', () => {
    expect(isNightGardenScene('ampm', 'pm', { hours: 10, minutes: 0 })).toBe(true)
    expect(isNightGardenScene('phrase', 'am', { hours: 12, minutes: 0 })).toBe(true)
    expect(isNightGardenScene('ampm', 'am', { hours: 10, minutes: 0 })).toBe(false)
    expect(isNightGardenScene('digits', 'pm', { hours: 10, minutes: 0 })).toBe(false)
  })
})
