import { normalizeTime, timeToDigits } from '../clock/time'
import type { ClockTime } from '../clock/time'
import type { DayPeriod, TimeLabelStyle } from '../game/types'

type Phraser = (hour: number, minutes: number, nextHour: number) => string | null

/** School-style English with hour numerals: "a quarter past 5", "half past 4". */
const en: Phraser = (h, m, next) => {
  if (m === 0) return `${h} o'clock`
  if (m === 15) return `a quarter past ${h}`
  if (m === 30) return `half past ${h}`
  if (m === 45) return `a quarter to ${next}`
  if (m < 30) return `${m} minute${m === 1 ? '' : 's'} past ${h}`
  const to = 60 - m
  return `${to} minute${to === 1 ? '' : 's'} to ${next}`
}

const ES_WORDS = ['', 'una', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce']
const esHour = (h: number) => `${h === 1 ? 'la' : 'las'} ${ES_WORDS[h]}`

const es: Phraser = (h, m, next) => {
  if (m === 0) return `${esHour(h)} en punto`
  if (m === 15) return `${esHour(h)} y cuarto`
  if (m === 30) return `${esHour(h)} y media`
  if (m === 45) return `${esHour(next)} menos cuarto`
  return null
}

const FR_WORDS = ['', 'une', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze']
const frHour = (h: number) => `${FR_WORDS[h]} heure${h === 1 ? '' : 's'}`

const fr: Phraser = (h, m, next) => {
  if (m === 0) return frHour(h)
  if (m === 15) return `${frHour(h)} et quart`
  if (m === 30) return `${frHour(h)} et demie`
  if (m === 45) return `${frHour(next)} moins le quart`
  return null
}

const IT_WORDS = ['', 'una', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto', 'nove', 'dieci', 'undici', 'dodici']
const itHour = (h: number) => (h === 1 ? "l'una" : `le ${IT_WORDS[h]}`)

const it: Phraser = (h, m, next) => {
  if (m === 0) return itHour(h)
  if (m === 15) return `${itHour(h)} e un quarto`
  if (m === 30) return `${itHour(h)} e mezza`
  if (m === 45) return `${itHour(next)} meno un quarto`
  return null
}

const DE_WORDS = ['', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf']

const de: Phraser = (h, m, next) => {
  if (m === 0) return `${h === 1 ? 'ein' : DE_WORDS[h]} Uhr`
  if (m === 15) return `Viertel nach ${DE_WORDS[h]}`
  if (m === 30) return `halb ${DE_WORDS[next]}`
  if (m === 45) return `Viertel vor ${DE_WORDS[next]}`
  return null
}

const PT_WORDS = ['', 'uma', 'duas', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze']

const pt: Phraser = (h, m, next) => {
  if (m === 0) return `${PT_WORDS[h]} hora${h === 1 ? '' : 's'}`
  if (m === 15) return `${PT_WORDS[h]} e quinze`
  if (m === 30) return `${PT_WORDS[h]} e meia`
  if (m === 45) return `quinze para ${next === 1 ? 'a' : 'as'} ${PT_WORDS[next]}`
  return null
}

const ZH_WORDS = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二']
const zhHour = (h: number) => `${h === 2 ? '两' : ZH_WORDS[h]}点`

const zh: Phraser = (h, m) => {
  if (m === 0) return zhHour(h)
  if (m === 30) return `${zhHour(h)}半`
  if (m === 15) return `${zhHour(h)}十五分`
  if (m === 45) return `${zhHour(h)}四十五分`
  return null
}

const PHRASERS: Record<string, Phraser> = { en, es, fr, it, de, pt, 'zh-CN': zh }

/** Midday / midnight (and locale equivalents) for exactly 12:00. */
const DAYPART: Record<string, { midday: string; midnight: string }> = {
  en: { midday: 'midday', midnight: 'midnight' },
  es: { midday: 'mediodía', midnight: 'medianoche' },
  fr: { midday: 'midi', midnight: 'minuit' },
  it: { midday: 'mezzogiorno', midnight: 'mezzanotte' },
  de: { midday: 'Mittag', midnight: 'Mitternacht' },
  pt: { midday: 'meio-dia', midnight: 'meia-noite' },
  'zh-CN': { midday: '中午', midnight: '午夜' },
}

function resolveLocale(locale: string | undefined | null): string {
  if (!locale || typeof locale !== 'string') return 'en'
  if (Object.hasOwn(PHRASERS, locale)) return locale
  const base = locale.split('-')[0].toLowerCase()
  if (base === 'zh') return 'zh-CN'
  return Object.hasOwn(PHRASERS, base) ? base : 'en'
}

export function formatTimePhrase(t: ClockTime, locale?: string | null): string {
  const n = normalizeTime(t)
  const next = n.hours === 12 ? 1 : n.hours + 1
  const phrase = PHRASERS[resolveLocale(locale)](n.hours, n.minutes, next)
  return phrase ?? timeToDigits(n)
}

/** "10pm", "3:30 am" — compact when on the hour. */
export function formatTimeAmPm(t: ClockTime, period: DayPeriod, locale?: string | null): string {
  const n = normalizeTime(t)
  const loc = resolveLocale(locale)
  if (loc === 'zh-CN') {
    const suffix = period === 'am' ? '上午' : '下午'
    return n.minutes === 0 ? `${suffix}${n.hours}点` : `${suffix}${timeToDigits(n)}`
  }
  if (loc === 'de') {
    const suffix = period === 'am' ? 'vorm.' : 'nachm.'
    return `${timeToDigits(n)} ${suffix}`
  }
  if (loc === 'es' || loc === 'pt') {
    const suffix = period === 'am' ? 'a. m.' : 'p. m.'
    return `${timeToDigits(n)} ${suffix}`
  }
  if (loc === 'fr') {
    const suffix = period === 'am' ? 'du matin' : "de l'apres-midi"
    return `${timeToDigits(n)} ${suffix}`
  }
  if (loc === 'it') {
    const suffix = period === 'am' ? 'di mattina' : 'di sera'
    return `${timeToDigits(n)} ${suffix}`
  }
  // English: "10pm" / "3:30 am"
  if (n.minutes === 0) return `${n.hours}${period}`
  return `${timeToDigits(n)} ${period}`
}

export function formatDaypart(t: ClockTime, period: DayPeriod, locale?: string | null): string | null {
  const n = normalizeTime(t)
  if (n.hours !== 12 || n.minutes !== 0) return null
  const parts = DAYPART[resolveLocale(locale)] ?? DAYPART.en
  return period === 'am' ? parts.midnight : parts.midday
}

export type FormatTimeLabelOpts = {
  style: TimeLabelStyle
  period: DayPeriod
  locale?: string | null
}

/**
 * Primary label for a prompt/choice.
 * - digits: "3:30"
 * - phrase: "half past 3", or midday/midnight at 12:00
 * - ampm: "10pm", "3:30 am"
 */
export function formatTimeLabel(t: ClockTime, opts: FormatTimeLabelOpts): string {
  const { style, period, locale } = opts
  if (style === 'ampm') return formatTimeAmPm(t, period, locale)
  if (style === 'phrase') {
    const daypart = formatDaypart(t, period, locale)
    if (daypart) return daypart
    return formatTimePhrase(t, locale)
  }
  return timeToDigits(t)
}

/** Secondary hint line (usually plain digits when the primary is not). */
export function formatTimeSecondary(t: ClockTime, opts: FormatTimeLabelOpts): string | null {
  const primary = formatTimeLabel(t, opts)
  const digits = timeToDigits(t)
  if (primary === digits) return null
  if (opts.style === 'ampm') return digits
  if (opts.style === 'phrase') {
    const daypart = formatDaypart(t, opts.period, opts.locale)
    if (daypart) return formatTimeAmPm(t, opts.period, opts.locale)
    return digits
  }
  return null
}
