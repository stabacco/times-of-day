import { describe, it, expect } from 'vitest'
import { initialAdaptive, recordAnswer, recentAccuracy } from './adaptive'
import type { AdaptiveState } from './types'

function feed(answers: boolean[], start: AdaptiveState = initialAdaptive()): AdaptiveState {
  return answers.reduce((s, a) => recordAnswer(s, a), start)
}

describe('adaptive', () => {
  it('starts empty at mid difficulty', () => {
    expect(initialAdaptive()).toEqual({ recent: [], difficulty: 1 })
  })

  it('recentAccuracy is 0 when empty and a ratio otherwise', () => {
    expect(recentAccuracy(initialAdaptive())).toBe(0)
    expect(recentAccuracy(feed([true, false, true, true]))).toBe(0.75)
  })

  it('does not mutate the input state', () => {
    const s = initialAdaptive()
    recordAnswer(s, true)
    expect(s).toEqual({ recent: [], difficulty: 1 })
  })

  it('keeps difficulty 1 with fewer than 5 answers', () => {
    expect(feed([true, true, true, true]).difficulty).toBe(1)
    expect(feed([false, false, false, false]).difficulty).toBe(1)
  })

  it('goes hard (2) at >= 0.85 accuracy with >= 5 answers', () => {
    const s = feed([true, true, true, true, true])
    expect(s.difficulty).toBe(2)
  })

  it('goes hard at 6/7 (~0.857) but not at 5/6 (~0.833)', () => {
    expect(feed([true, true, true, true, true, true, false]).difficulty).toBe(2)
    expect(feed([true, true, true, true, true, false]).difficulty).toBe(1)
  })

  it('goes hard at 9/10', () => {
    const s = feed([true, true, true, true, true, true, true, true, true, false])
    expect(s.difficulty).toBe(2)
  })

  it('stays mid at 0.8 (8/10)', () => {
    const s = feed([true, true, true, true, true, true, true, true, false, false])
    expect(recentAccuracy(s)).toBe(0.8)
    expect(s.difficulty).toBe(1)
  })

  it('goes easy (0) at <= 0.55 accuracy with >= 5 answers', () => {
    expect(feed([false, false, false, false, false]).difficulty).toBe(0)
    // 0.5
    expect(feed([true, false, true, false, true, false, true, false, true, false]).difficulty).toBe(0)
  })

  it('easy band edge: 0.5 is easy, 5/9 (~0.556) and 0.6 are mid', () => {
    expect(feed([true, true, true, true, true, false, false, false, false]).difficulty).toBe(1)
    expect(feed([true, true, true, true, false, false, false, false, false]).difficulty).toBe(0)
    const mid = feed([true, true, true, true, true, true, false, false, false, false])
    expect(recentAccuracy(mid)).toBe(0.6)
    expect(mid.difficulty).toBe(1)
  })

  it('stays mid between bands', () => {
    const s = feed([true, true, true, false, false, true, true])
    expect(s.difficulty).toBe(1)
  })

  it('keeps only the last 10 answers', () => {
    const s = feed(Array.from({ length: 15 }, (_, i) => i >= 5))
    expect(s.recent).toHaveLength(10)
    expect(s.recent.every(Boolean)).toBe(true)
    // oldest wrong answers dropped
    const t = feed([false, false, false, false, false, ...Array(10).fill(true)])
    expect(t.recent).toHaveLength(10)
    expect(recentAccuracy(t)).toBe(1)
    expect(t.difficulty).toBe(2)
  })

  it('recovers difficulty as window shifts', () => {
    let s = feed(Array(10).fill(false))
    expect(s.difficulty).toBe(0)
    s = feed(Array(10).fill(true), s)
    expect(s.difficulty).toBe(2)
  })
})
