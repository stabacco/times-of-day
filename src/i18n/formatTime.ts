import { normalizeTime, timeToDigits } from '../clock/time'
import type { ClockTime } from '../clock/time'

type Phraser = (hour: number, minutes: number, nextHour: number) => string | null

const EN_WORDS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen',
  'eighteen', 'nineteen', 'twenty', 'twenty-one', 'twenty-two', 'twenty-three',
  'twenty-four', 'twenty-five', 'twenty-six', 'twenty-seven', 'twenty-eight', 'twenty-nine',
]

const en: Phraser = (h, m, next) => {
  if (m === 0) return `${EN_WORDS[h]} o'clock`
  if (m === 15) return `quarter past ${EN_WORDS[h]}`
  if (m === 30) return `half past ${EN_WORDS[h]}`
  if (m === 45) return `quarter to ${EN_WORDS[next]}`
  if (m < 30) return `${EN_WORDS[m]} minute${m === 1 ? '' : 's'} past ${EN_WORDS[h]}`
  const to = 60 - m
  return `${EN_WORDS[to]} minute${to === 1 ? '' : 's'} to ${EN_WORDS[next]}`
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

function resolveLocale(locale: string): string {
  if (locale in PHRASERS) return locale
  const base = locale.split('-')[0].toLowerCase()
  if (base === 'zh') return 'zh-CN'
  return base in PHRASERS ? base : 'en'
}

export function formatTimePhrase(t: ClockTime, locale: string): string {
  const n = normalizeTime(t)
  const next = n.hours === 12 ? 1 : n.hours + 1
  const phrase = PHRASERS[resolveLocale(locale)](n.hours, n.minutes, next)
  return phrase ?? timeToDigits(n)
}
