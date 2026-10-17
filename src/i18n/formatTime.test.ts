import { describe, expect, it } from 'vitest'
import { formatTimePhrase } from './formatTime'

describe('formatTimePhrase', () => {
  describe('en', () => {
    it("formats o'clock", () => {
      expect(formatTimePhrase({ hours: 3, minutes: 0 }, 'en')).toBe("three o'clock")
      expect(formatTimePhrase({ hours: 12, minutes: 0 }, 'en')).toBe("twelve o'clock")
    })
    it('formats half past', () => {
      expect(formatTimePhrase({ hours: 3, minutes: 30 }, 'en')).toBe('half past three')
    })
    it('formats quarter past and quarter to', () => {
      expect(formatTimePhrase({ hours: 3, minutes: 15 }, 'en')).toBe('quarter past three')
      expect(formatTimePhrase({ hours: 3, minutes: 45 }, 'en')).toBe('quarter to four')
      expect(formatTimePhrase({ hours: 12, minutes: 45 }, 'en')).toBe('quarter to one')
    })
    it('formats minutes past and to', () => {
      expect(formatTimePhrase({ hours: 3, minutes: 5 }, 'en')).toBe('five minutes past three')
      expect(formatTimePhrase({ hours: 3, minutes: 50 }, 'en')).toBe('ten minutes to four')
      expect(formatTimePhrase({ hours: 3, minutes: 1 }, 'en')).toBe('one minute past three')
      expect(formatTimePhrase({ hours: 3, minutes: 59 }, 'en')).toBe('one minute to four')
    })
    it('accepts regional variants', () => {
      expect(formatTimePhrase({ hours: 3, minutes: 30 }, 'en-AU')).toBe('half past three')
    })
  })

  describe('zh-CN', () => {
    it('formats hours', () => {
      expect(formatTimePhrase({ hours: 3, minutes: 0 }, 'zh-CN')).toBe('三点')
      expect(formatTimePhrase({ hours: 2, minutes: 0 }, 'zh-CN')).toBe('两点')
      expect(formatTimePhrase({ hours: 12, minutes: 0 }, 'zh-CN')).toBe('十二点')
    })
    it('formats half hours', () => {
      expect(formatTimePhrase({ hours: 3, minutes: 30 }, 'zh-CN')).toBe('三点半')
    })
    it('formats quarter hours', () => {
      expect(formatTimePhrase({ hours: 3, minutes: 15 }, 'zh-CN')).toBe('三点十五分')
      expect(formatTimePhrase({ hours: 3, minutes: 45 }, 'zh-CN')).toBe('三点四十五分')
    })
    it('falls back to digits for other minutes', () => {
      expect(formatTimePhrase({ hours: 3, minutes: 10 }, 'zh-CN')).toBe('3:10')
    })
    it('resolves bare zh to zh-CN', () => {
      expect(formatTimePhrase({ hours: 3, minutes: 30 }, 'zh')).toBe('三点半')
    })
  })

  describe('other locales', () => {
    it('es', () => {
      expect(formatTimePhrase({ hours: 3, minutes: 0 }, 'es')).toBe('las tres en punto')
      expect(formatTimePhrase({ hours: 1, minutes: 30 }, 'es')).toBe('la una y media')
      expect(formatTimePhrase({ hours: 3, minutes: 45 }, 'es')).toBe('las cuatro menos cuarto')
    })
    it('fr', () => {
      expect(formatTimePhrase({ hours: 1, minutes: 0 }, 'fr')).toBe('une heure')
      expect(formatTimePhrase({ hours: 3, minutes: 30 }, 'fr')).toBe('trois heures et demie')
      expect(formatTimePhrase({ hours: 3, minutes: 45 }, 'fr')).toBe('quatre heures moins le quart')
    })
    it('it', () => {
      expect(formatTimePhrase({ hours: 1, minutes: 0 }, 'it')).toBe("l'una")
      expect(formatTimePhrase({ hours: 3, minutes: 30 }, 'it')).toBe('le tre e mezza')
    })
    it('de', () => {
      expect(formatTimePhrase({ hours: 3, minutes: 30 }, 'de')).toBe('halb vier')
      expect(formatTimePhrase({ hours: 3, minutes: 15 }, 'de')).toBe('Viertel nach drei')
      expect(formatTimePhrase({ hours: 3, minutes: 45 }, 'de')).toBe('Viertel vor vier')
    })
    it('pt', () => {
      expect(formatTimePhrase({ hours: 3, minutes: 0 }, 'pt')).toBe('três horas')
      expect(formatTimePhrase({ hours: 3, minutes: 30 }, 'pt')).toBe('três e meia')
    })
    it('falls back to digits for awkward minutes', () => {
      expect(formatTimePhrase({ hours: 3, minutes: 10 }, 'es')).toBe('3:10')
      expect(formatTimePhrase({ hours: 3, minutes: 10 }, 'de')).toBe('3:10')
    })
  })

  it('uses English for unsupported locales', () => {
    expect(formatTimePhrase({ hours: 3, minutes: 0 }, 'ja')).toBe("three o'clock")
  })

  it('ignores prototype keys like constructor and falls back to English', () => {
    const result = formatTimePhrase({ hours: 3, minutes: 0 }, 'constructor')
    expect(typeof result).toBe('string')
    expect(result).toBe("three o'clock")
  })
})
