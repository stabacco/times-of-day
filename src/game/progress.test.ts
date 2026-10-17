import { describe, it, expect } from 'vitest'
import { initialSession, applyAnswer, type AnswerResult } from './progress'
import { initialAdaptive } from './adaptive'
import { STARS_TO_UNLOCK } from './stages'
import type { SessionState } from './types'

function run(session: SessionState, answers: boolean[]) {
  let s = session
  let last: AnswerResult = { session, unlocked: false, advancedTo: null }
  for (const a of answers) {
    last = applyAnswer(s, a)
    s = last.session
  }
  return { s, last }
}

describe('progress', () => {
  it('initialSession starts at hours with nothing earned', () => {
    expect(initialSession()).toEqual({
      stage: 'hours',
      starsInStage: 0,
      totalStars: 0,
      adaptive: initialAdaptive(),
      muted: false,
      lastPromptKind: null,
    })
  })

  it('correct answer adds a star and records adaptive', () => {
    const r = applyAnswer(initialSession(), true)
    expect(r.session.starsInStage).toBe(1)
    expect(r.session.totalStars).toBe(1)
    expect(r.session.adaptive.recent).toEqual([true])
    expect(r.unlocked).toBe(false)
    expect(r.advancedTo).toBeNull()
  })

  it('wrong answer adds no star, keeps stage, records adaptive', () => {
    const r = applyAnswer(initialSession(), false)
    expect(r.session.starsInStage).toBe(0)
    expect(r.session.totalStars).toBe(0)
    expect(r.session.stage).toBe('hours')
    expect(r.session.adaptive.recent).toEqual([false])
  })

  it('does not mutate the input session', () => {
    const s = initialSession()
    applyAnswer(s, true)
    expect(s).toEqual(initialSession())
  })

  it('preserves muted and lastPromptKind', () => {
    const s: SessionState = { ...initialSession(), muted: true, lastPromptKind: 'set' }
    const r = applyAnswer(s, true)
    expect(r.session.muted).toBe(true)
    expect(r.session.lastPromptKind).toBe('set')
  })

  it('does not unlock before STARS_TO_UNLOCK', () => {
    const { s, last } = run(initialSession(), Array(STARS_TO_UNLOCK - 1).fill(true))
    expect(last.unlocked).toBe(false)
    expect(s.stage).toBe('hours')
    expect(s.starsInStage).toBe(STARS_TO_UNLOCK - 1)
  })

  it('unlocks the next stage at STARS_TO_UNLOCK with perfect accuracy', () => {
    const { s, last } = run(initialSession(), Array(STARS_TO_UNLOCK).fill(true))
    expect(last.unlocked).toBe(true)
    expect(last.advancedTo).toBe('half')
    expect(s.stage).toBe('half')
    expect(s.starsInStage).toBe(0)
    expect(s.totalStars).toBe(STARS_TO_UNLOCK)
    expect(s.adaptive).toEqual(initialAdaptive())
  })

  it('unlocked flag is only true on the unlocking answer', () => {
    const { s } = run(initialSession(), Array(STARS_TO_UNLOCK).fill(true))
    const next = applyAnswer(s, true)
    expect(next.unlocked).toBe(false)
    expect(next.advancedTo).toBeNull()
    expect(next.session.stage).toBe('half')
    expect(next.session.starsInStage).toBe(1)
  })

  it('does not unlock at 8 stars when recent accuracy < 0.7', () => {
    // Build a session at 7 stars with a poor window.
    const base: SessionState = {
      ...initialSession(),
      starsInStage: STARS_TO_UNLOCK - 1,
      totalStars: STARS_TO_UNLOCK - 1,
      adaptive: {
        recent: [false, false, false, false, false, false, true, true, true, true],
        difficulty: 1,
      },
    }
    // after correct: [f,f,f,f,f,t,t,t,t,t] = 0.5 < 0.7
    const r = applyAnswer(base, true)
    expect(r.session.starsInStage).toBe(STARS_TO_UNLOCK)
    expect(r.unlocked).toBe(false)
    expect(r.advancedTo).toBeNull()
    expect(r.session.stage).toBe('hours')
  })

  it('unlocks later once accuracy recovers to the floor', () => {
    let s: SessionState = {
      ...initialSession(),
      starsInStage: STARS_TO_UNLOCK,
      totalStars: STARS_TO_UNLOCK,
      adaptive: {
        recent: [false, false, false, false, false, true, true, true, true, true],
        difficulty: 0,
      },
    }
    let unlocked = false
    for (let i = 0; i < 10 && !unlocked; i++) {
      const r = applyAnswer(s, true)
      s = r.session
      unlocked = r.unlocked
    }
    expect(unlocked).toBe(true)
    expect(s.stage).toBe('half')
  })

  it('unlocks at exactly the accuracy floor (0.7)', () => {
    const base: SessionState = {
      ...initialSession(),
      starsInStage: STARS_TO_UNLOCK - 1,
      totalStars: STARS_TO_UNLOCK - 1,
      adaptive: {
        recent: [false, false, false, false, true, true, true, true, true, true],
        difficulty: 1,
      },
    }
    // after correct: [f,f,f,t,t,t,t,t,t,t] = 7/10
    const r = applyAnswer(base, true)
    expect(r.unlocked).toBe(true)
    expect(r.advancedTo).toBe('half')
  })

  it('unlocks with fewer than 5 recent answers once stars are met', () => {
    const base: SessionState = {
      ...initialSession(),
      starsInStage: STARS_TO_UNLOCK - 1,
      totalStars: STARS_TO_UNLOCK - 1,
      adaptive: { recent: [false, false], difficulty: 1 },
    }
    const r = applyAnswer(base, true)
    expect(r.session.adaptive).toEqual(initialAdaptive())
    expect(r.unlocked).toBe(true)
    expect(r.advancedTo).toBe('half')
  })

  it('wrong answers never decrease stage or stars', () => {
    let s: SessionState = {
      ...initialSession(),
      stage: 'quarter',
      starsInStage: 3,
      totalStars: 20,
    }
    for (let i = 0; i < 20; i++) {
      const r = applyAnswer(s, false)
      expect(r.unlocked).toBe(false)
      s = r.session
    }
    expect(s.stage).toBe('quarter')
    expect(s.starsInStage).toBe(3)
    expect(s.totalStars).toBe(20)
    expect(s.adaptive.difficulty).toBe(0)
  })

  it('walks through all stages and stops at the last', () => {
    let s = initialSession()
    const visited: string[] = [s.stage]
    for (let i = 0; i < STARS_TO_UNLOCK * 4; i++) {
      s = applyAnswer(s, true).session
      if (visited[visited.length - 1] !== s.stage) visited.push(s.stage)
    }
    expect(visited).toEqual(['hours', 'half', 'quarter', 'five', 'any'])
    expect(s.stage).toBe('any')
  })

  it('on the final stage never unlocks or advances', () => {
    let s: SessionState = { ...initialSession(), stage: 'any' }
    for (let i = 0; i < STARS_TO_UNLOCK + 4; i++) {
      const r = applyAnswer(s, true)
      expect(r.unlocked).toBe(false)
      expect(r.advancedTo).toBeNull()
      s = r.session
    }
    expect(s.stage).toBe('any')
    expect(s.starsInStage).toBe(STARS_TO_UNLOCK + 4)
  })
})
