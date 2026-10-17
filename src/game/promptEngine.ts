import type { ClockTime } from '../clock/time'
import { normalizeTime, timeEquals } from '../clock/time'
import { minuteStepForStage, randomLegalTime } from './stages'
import type { Difficulty, Prompt, PromptKind, SessionState, StageId } from './types'

type Rng = () => number

const DAY_MINUTES = 12 * 60
/** Easy: distractors at least this many minutes (2h) away on the clock face. */
const EASY_MIN_GAP = 120
/** Mid: distractors within this many minutes (3h) so options feel plausible. */
const MID_MAX_GAP = 180

const VARIETY_FLIP_CHANCE = 0.35

function toMinutes(t: ClockTime): number {
  const n = normalizeTime(t)
  return (n.hours % 12) * 60 + n.minutes
}

function fromMinutes(total: number): ClockTime {
  const m = ((total % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES
  return normalizeTime({ hours: Math.floor(m / 60), minutes: m % 60 })
}

function circularGap(a: number, b: number): number {
  const d = Math.abs(a - b)
  return Math.min(d, DAY_MINUTES - d)
}

function shuffle<T>(items: T[], rng: Rng): T[] {
  const out = items.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function choosePromptKind(last: PromptKind | null, rng: Rng = Math.random): PromptKind {
  const base: PromptKind = rng() < 0.5 ? 'read' : 'set'
  if (last && rng() < VARIETY_FLIP_CHANCE) return last === 'read' ? 'set' : 'read'
  return base
}

export function buildDistractors(
  target: ClockTime,
  stage: StageId,
  difficulty: Difficulty,
  count: number,
  rng: Rng = Math.random,
): ClockTime[] {
  const step = minuteStepForStage(stage)
  const targetMin = toMinutes(target)

  const candidates: { time: ClockTime; gap: number }[] = []
  for (let m = 0; m < DAY_MINUTES; m += step) {
    const time = fromMinutes(m)
    if (timeEquals(time, target)) continue
    candidates.push({ time, gap: circularGap(m, targetMin) })
  }

  let pool: { time: ClockTime; gap: number }[]
  if (difficulty === 0) {
    pool = candidates.filter((c) => c.gap >= EASY_MIN_GAP)
  } else if (difficulty === 1) {
    pool = candidates.filter((c) => c.gap <= MID_MAX_GAP)
  } else {
    // Hard: adjacent legal slots — the nearest `count`, ties (e.g. +1/-1 slot) broken randomly.
    pool = shuffle(candidates, rng)
      .sort((a, b) => a.gap - b.gap)
      .slice(0, count)
  }

  const chosen = shuffle(pool, rng).slice(0, count)

  // Fallback when the preferred pool is too small: fill from remaining, nearest/farthest per difficulty.
  if (chosen.length < count) {
    const used = new Set(chosen.map((c) => toMinutes(c.time)))
    const rest = candidates
      .filter((c) => !used.has(toMinutes(c.time)))
      .sort((a, b) => (difficulty === 0 ? b.gap - a.gap : a.gap - b.gap))
    chosen.push(...rest.slice(0, count - chosen.length))
  }

  return chosen.map((c) => c.time)
}

export function nextPrompt(session: SessionState, rng: Rng = Math.random): Prompt {
  const { stage } = session
  const difficulty = session.adaptive.difficulty
  const kind = choosePromptKind(session.lastPromptKind, rng)
  const target = randomLegalTime(stage, rng)
  const snapStep = minuteStepForStage(stage)

  // Mix plain digits, spoken phrases (incl. midday/midnight), and am/pm forms.
  const styleRoll = rng()
  let labelStyle = styleRoll < 1 / 3 ? 'digits' : styleRoll < 2 / 3 ? 'phrase' : 'ampm'
  const period = rng() < 0.5 ? 'am' : 'pm'
  // At 12:00, prefer phrase labels so kids see midday / midnight often.
  if (target.hours === 12 && target.minutes === 0 && rng() < 0.7) {
    labelStyle = 'phrase'
  }

  if (kind === 'read') {
    const optionCount = difficulty === 0 ? 3 : 4
    const distractors = buildDistractors(target, stage, difficulty, optionCount - 1, rng)
    return {
      kind,
      target,
      options: shuffle([target, ...distractors], rng),
      snapStep,
      labelStyle,
      period,
    }
  }

  return {
    kind,
    target,
    showHint: difficulty === 0,
    snapStep,
    labelStyle,
    period,
  }
}
