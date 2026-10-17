import { describe, it, expect } from 'vitest'
import { timeEquals, normalizeTime } from '../clock/time'
import type { ClockTime } from '../clock/time'
import { isLegalTime, minuteStepForStage, STAGE_ORDER } from './stages'
import type { SessionState, StageId, Difficulty } from './types'
import { buildDistractors, choosePromptKind, nextPrompt } from './promptEngine'

function seeded(seed: number): () => number {
  // mulberry32
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function session(stage: StageId, difficulty: Difficulty): SessionState {
  return {
    stage,
    starsInStage: 0,
    totalStars: 0,
    adaptive: { recent: [], difficulty },
    muted: false,
    lastPromptKind: null,
  }
}

function minutesOf(t: ClockTime): number {
  const n = normalizeTime(t)
  return (n.hours % 12) * 60 + n.minutes
}

function circDist(a: ClockTime, b: ClockTime): number {
  const d = Math.abs(minutesOf(a) - minutesOf(b))
  return Math.min(d, 720 - d)
}

describe('choosePromptKind', () => {
  it('produces both kinds across many draws', () => {
    const rng = seeded(1)
    const kinds = new Set<string>()
    for (let i = 0; i < 50; i++) kinds.add(choosePromptKind(null, rng))
    expect(kinds).toEqual(new Set(['read', 'set']))
  })

  it('without a previous kind follows rng 50/50', () => {
    expect(choosePromptKind(null, () => 0.1)).toBe('read')
    expect(choosePromptKind(null, () => 0.9)).toBe('set')
  })

  it('forces the opposite kind when the variety roll is low', () => {
    expect(choosePromptKind('read', () => 0.1)).toBe('set')
    expect(choosePromptKind('set', () => 0.1)).toBe('read')
  })

  it('alternates reasonably often with a real rng', () => {
    const rng = seeded(7)
    let last = null as ReturnType<typeof choosePromptKind> | null
    let switches = 0
    for (let i = 0; i < 200; i++) {
      const k = choosePromptKind(last, rng)
      if (last && k !== last) switches++
      last = k
    }
    expect(switches).toBeGreaterThan(60)
  })
})

describe('buildDistractors', () => {
  const target: ClockTime = { hours: 3, minutes: 0 }

  it.each(STAGE_ORDER)('returns legal, unique, non-target times for %s', (stage) => {
    for (const difficulty of [0, 1, 2] as Difficulty[]) {
      const t: ClockTime = stage === 'hours' ? target : { hours: 3, minutes: 15 }
      const d = buildDistractors(t, stage, difficulty, 3, seeded(difficulty + 3))
      expect(d).toHaveLength(3)
      for (const x of d) {
        expect(isLegalTime(stage, x)).toBe(true)
        expect(timeEquals(x, t)).toBe(false)
      }
      const keys = new Set(d.map(minutesOf))
      expect(keys.size).toBe(3)
    }
  })

  it('difficulty 0 keeps distractors at least 2 hours away', () => {
    for (let i = 0; i < 30; i++) {
      const d = buildDistractors(target, 'quarter', 0, 3, seeded(i + 10))
      for (const x of d) expect(circDist(x, target)).toBeGreaterThanOrEqual(120)
    }
  })

  it('difficulty 2 uses close neighbors', () => {
    for (let i = 0; i < 30; i++) {
      const d = buildDistractors(target, 'quarter', 2, 3, seeded(i + 20))
      for (const x of d) expect(circDist(x, target)).toBeLessThanOrEqual(15 * 3)
    }
  })

  it('difficulty 2 on hours stage picks adjacent hours', () => {
    const d = buildDistractors(target, 'hours', 2, 2, seeded(5))
    expect(d.map((x) => circDist(x, target)).sort()).toEqual([60, 60])
  })

  it('handles wrap-around near 12', () => {
    const t: ClockTime = { hours: 12, minutes: 0 }
    const d = buildDistractors(t, 'hours', 2, 2, seeded(2))
    expect(d.map((x) => x.hours).sort((a, b) => a - b)).toEqual([1, 11])
  })
})

describe('nextPrompt', () => {
  it.each(STAGE_ORDER)('read prompts have shuffled options including target (%s)', (stage) => {
    for (const difficulty of [0, 1, 2] as Difficulty[]) {
      let seen = 0
      for (let i = 0; i < 80 && seen < 5; i++) {
        const p = nextPrompt(session(stage, difficulty), seeded(i * 31 + difficulty))
        if (p.kind !== 'read') continue
        seen++
        expect(p.options).toHaveLength(difficulty === 0 ? 3 : 4)
        expect(p.options!.some((o) => timeEquals(o, p.target))).toBe(true)
        expect(p.options!.filter((o) => timeEquals(o, p.target))).toHaveLength(1)
        expect(new Set(p.options!.map(minutesOf)).size).toBe(p.options!.length)
        for (const o of p.options!) expect(isLegalTime(stage, o)).toBe(true)
        expect(isLegalTime(stage, p.target)).toBe(true)
      }
      expect(seen).toBeGreaterThan(0)
    }
  })

  it('shuffles the target position among options', () => {
    const positions = new Set<number>()
    for (let i = 0; i < 100; i++) {
      const p = nextPrompt(session('five', 1), seeded(i + 100))
      if (p.kind === 'read') {
        positions.add(p.options!.findIndex((o) => timeEquals(o, p.target)))
      }
    }
    expect(positions.size).toBeGreaterThan(1)
  })

  it('set prompts have no options and stage snap step', () => {
    for (const stage of STAGE_ORDER) {
      let found = false
      for (let i = 0; i < 80 && !found; i++) {
        const p = nextPrompt(session(stage, 1), seeded(i + 200))
        if (p.kind !== 'set') continue
        found = true
        expect(p.options).toBeUndefined()
        expect(p.snapStep).toBe(minuteStepForStage(stage))
        expect(isLegalTime(stage, p.target)).toBe(true)
      }
      expect(found).toBe(true)
    }
  })

  it('any stage snaps to 1 minute', () => {
    for (let i = 0; i < 80; i++) {
      const p = nextPrompt(session('any', 1), seeded(i))
      if (p.kind === 'set') {
        expect(p.snapStep).toBe(1)
        return
      }
    }
    throw new Error('no set prompt generated')
  })

  it('shows hint only on easy set prompts', () => {
    for (const difficulty of [0, 1, 2] as Difficulty[]) {
      for (let i = 0; i < 80; i++) {
        const p = nextPrompt(session('half', difficulty), seeded(i + 300))
        if (p.kind === 'set') {
          expect(Boolean(p.showHint)).toBe(difficulty === 0)
        } else {
          expect(p.showHint).toBeFalsy()
        }
      }
    }
  })

  it('respects lastPromptKind variety nudge', () => {
    const s = { ...session('hours', 1), lastPromptKind: 'read' as const }
    const p = nextPrompt(s, () => 0.1)
    expect(p.kind).toBe('set')
  })
})
