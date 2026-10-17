import { describe, expect, it } from 'vitest'
import {
  formatDaypart,
  formatTimeAmPm,
  formatTimeLabel,
  formatTimePhrase,
  formatTimeSecondary,
} from './formatTime'

describe('formatTimePhrase', () => {
  describe('en', () => {
    it("formats o'clock with hour numerals", () => {
      expect(formatTimePhrase({ hours: 3, minutes: 0 }, 'en')).toBe("3 o'clock")
      expect(formatTimePhrase({ hours: 12, minutes: 0 }, 'en')).toBe("12 o'clock")
    })
    it('formats half past', () => {
      expect(formatTimePhrase({ hours: 4, minutes: 30 }, 'en')).toBe('half past 4')
    })
    it('formats a quarter past and a quarter to', () => {
      expect(formatTimePhrase({ hours: 5, minutes: 15 }, 'en')).toBe('a quarter past 5')
      expect(formatTimePhrase({ hours: 3, minutes: 45 }, 'en')).toBe('a quarter to 4')
      expect(formatTimePhrase({ hours: 12, minutes: 45 }, 'en')).toBe('a quarter to 1')
    })
    it('formats minutes past and to', () => {
      expect(formatTimePhrase({ hours: 3, minutes: 5 }, 'en')).toBe('5 minutes past 3')
      expect(formatTimePhrase({ hours: 3, minutes: 50 }, 'en')).toBe('10 minutes to 4')
      expect(formatTimePhrase({ hours: 3, minutes: 1 }, 'en')).toBe('1 minute past 3')
      expect(formatTimePhrase({ hours: 3, minutes: 59 }, 'en')).toBe('1 minute to 4')
    })
  })

  describe('zh-CN', () => {
    it('formats hours and half', () => {
      expect(formatTimePhrase({ hours: 3, minutes: 0 }, 'zh-CN')).toBe('三点')
      expect(formatTimePhrase({ hours: 2, minutes: 0 }, 'zh-CN')).toBe('两点')
      expect(formatTimePhrase({ hours: 3, minutes: 30 }, 'zh-CN')).toBe('三点半')
    })
    it('falls back to digits for other minutes', () => {
      expect(formatTimePhrase({ hours: 3, minutes: 10 }, 'zh-CN')).toBe('3:10')
    })
  })

  it('uses English for unsupported locales', () => {
    expect(formatTimePhrase({ hours: 3, minutes: 0 }, 'ja')).toBe("3 o'clock")
  })
})

describe('formatTimeAmPm', () => {
  it('formats English compact hours and spaced minutes', () => {
    expect(formatTimeAmPm({ hours: 10, minutes: 0 }, 'pm', 'en')).toBe('10pm')
    expect(formatTimeAmPm({ hours: 3, minutes: 30 }, 'am', 'en')).toBe('3:30 am')
    expect(formatTimeAmPm({ hours: 12, minutes: 0 }, 'am', 'en')).toBe('12am')
  })
})

describe('formatDaypart', () => {
  it('returns midday and midnight at 12:00', () => {
    expect(formatDaypart({ hours: 12, minutes: 0 }, 'pm', 'en')).toBe('midday')
    expect(formatDaypart({ hours: 12, minutes: 0 }, 'am', 'en')).toBe('midnight')
    expect(formatDaypart({ hours: 12, minutes: 0 }, 'pm', 'fr')).toBe('midi')
    expect(formatDaypart({ hours: 12, minutes: 0 }, 'am', 'zh-CN')).toBe('午夜')
  })
  it('returns null away from 12:00', () => {
    expect(formatDaypart({ hours: 12, minutes: 15 }, 'pm', 'en')).toBeNull()
    expect(formatDaypart({ hours: 3, minutes: 0 }, 'am', 'en')).toBeNull()
  })
})

describe('formatTimeLabel', () => {
  it('digits style ignores period', () => {
    expect(
      formatTimeLabel({ hours: 3, minutes: 30 }, { style: 'digits', period: 'pm', locale: 'en' }),
    ).toBe('3:30')
  })
  it('phrase style uses midday/midnight at noon', () => {
    expect(
      formatTimeLabel({ hours: 12, minutes: 0 }, { style: 'phrase', period: 'pm', locale: 'en' }),
    ).toBe('midday')
    expect(
      formatTimeLabel({ hours: 12, minutes: 0 }, { style: 'phrase', period: 'am', locale: 'en' }),
    ).toBe('midnight')
  })
  it('phrase style uses school phrases otherwise', () => {
    expect(
      formatTimeLabel({ hours: 5, minutes: 15 }, { style: 'phrase', period: 'am', locale: 'en' }),
    ).toBe('a quarter past 5')
  })
  it('ampm style formats like 10pm / 3:30 am', () => {
    expect(
      formatTimeLabel({ hours: 10, minutes: 0 }, { style: 'ampm', period: 'pm', locale: 'en' }),
    ).toBe('10pm')
    expect(
      formatTimeLabel({ hours: 3, minutes: 30 }, { style: 'ampm', period: 'am', locale: 'en' }),
    ).toBe('3:30 am')
  })
})

describe('formatTimeSecondary', () => {
  it('shows digits under phrase and ampm labels', () => {
    expect(
      formatTimeSecondary({ hours: 5, minutes: 15 }, { style: 'phrase', period: 'am', locale: 'en' }),
    ).toBe('5:15')
    expect(
      formatTimeSecondary({ hours: 10, minutes: 0 }, { style: 'ampm', period: 'pm', locale: 'en' }),
    ).toBe('10:00')
  })
  it('shows ampm under midday/midnight', () => {
    expect(
      formatTimeSecondary({ hours: 12, minutes: 0 }, { style: 'phrase', period: 'pm', locale: 'en' }),
    ).toBe('12pm')
  })
})
