import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Prompt, SessionState } from '../game/types'

const playSfx = vi.fn()
vi.mock('../audio/sfx', () => ({ playSfx: (...args: unknown[]) => playSfx(...args) }))

let prompts: Prompt[] = []
const seenSessions: SessionState[] = []
vi.mock('../game/promptEngine', () => ({
  nextPrompt: (session: SessionState) => {
    seenSessions.push(session)
    return prompts.shift() ?? { kind: 'read', target: { hours: 3, minutes: 0 }, options: [], snapStep: 60 }
  },
}))

import { makeDraftTime, RESULT_FEEDBACK_MS, snapTime, useGameSession } from './useGameSession'

const read = (h: number): Prompt => ({
  kind: 'read',
  target: { hours: h, minutes: 0 },
  options: [
    { hours: h, minutes: 0 },
    { hours: h === 12 ? 1 : h + 1, minutes: 0 },
  ],
  snapStep: 60,
})
const set = (h: number): Prompt => ({ kind: 'set', target: { hours: h, minutes: 0 }, snapStep: 60 })

describe('useGameSession', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    playSfx.mockClear()
    seenSessions.length = 0
    prompts = []
  })
  afterEach(() => vi.useRealTimers())

  it('records lastPromptKind on the first prompt', () => {
    prompts = [read(2)]
    const { result } = renderHook(() => useGameSession())
    expect(result.current.session.lastPromptKind).toBe('read')
  })

  it('correct read answer awards a star, plays sfx, then advances after feedback', () => {
    prompts = [read(2), set(5)]
    const { result } = renderHook(() => useGameSession())
    act(() => result.current.selectOption({ hours: 2, minutes: 0 }))
    expect(result.current.session.totalStars).toBe(1)
    expect(result.current.feedback?.kind).toBe('correct')
    expect(playSfx).toHaveBeenCalledWith('correct', false)

    act(() => vi.advanceTimersByTime(RESULT_FEEDBACK_MS))
    expect(result.current.feedback).toBeNull()
    expect(result.current.prompt.kind).toBe('set')
    expect(result.current.session.lastPromptKind).toBe('set')
    // nextPrompt is given the post-answer session
    expect(seenSessions[1].totalStars).toBe(1)
  })

  it('wrong read answer gives no star and ignores further input during feedback', () => {
    prompts = [read(2)]
    const { result } = renderHook(() => useGameSession())
    act(() => result.current.selectOption({ hours: 3, minutes: 0 }))
    expect(result.current.feedback?.kind).toBe('wrong')
    expect(playSfx).toHaveBeenCalledWith('wrong', false)
    act(() => result.current.selectOption({ hours: 2, minutes: 0 }))
    expect(result.current.session.totalStars).toBe(0)
    expect(result.current.session.adaptive.recent).toEqual([false])
  })

  it('set mode starts away from target and checks after snapping', () => {
    prompts = [set(4), read(1)]
    const { result } = renderHook(() => useGameSession())
    expect(result.current.draftTime).not.toEqual({ hours: 4, minutes: 0 })
    act(() => result.current.setDraftTime({ hours: 4, minutes: 12 }))
    act(() => result.current.checkSet())
    expect(result.current.feedback?.kind).toBe('correct')
  })

  it('unlocks the next stage after 8 correct and shows the unlock message', () => {
    prompts = Array.from({ length: 9 }, () => read(6))
    const { result } = renderHook(() => useGameSession())
    for (let i = 0; i < 8; i++) {
      act(() => result.current.selectOption({ hours: 6, minutes: 0 }))
      act(() => vi.advanceTimersByTime(RESULT_FEEDBACK_MS))
    }
    expect(result.current.session.stage).toBe('half')
    expect(result.current.feedback?.kind).toBe('unlock')
    expect(playSfx).toHaveBeenLastCalledWith('unlock', false)
    act(() => result.current.dismissFeedbackAndContinue())
    expect(result.current.feedback).toBeNull()
  })

  it('toggleMute silences sfx and keeps the session', () => {
    prompts = [read(2)]
    const { result } = renderHook(() => useGameSession())
    act(() => result.current.toggleMute())
    expect(result.current.session.muted).toBe(true)
    act(() => result.current.selectOption({ hours: 2, minutes: 0 }))
    expect(playSfx).toHaveBeenCalledWith('correct', true)
  })
})

describe('helpers', () => {
  it('snapTime carries into the hour', () => {
    expect(snapTime({ hours: 3, minutes: 58 }, 5)).toEqual({ hours: 4, minutes: 0 })
    expect(snapTime({ hours: 12, minutes: 40 }, 30)).toEqual({ hours: 12, minutes: 30 })
  })
  it('makeDraftTime never equals the target and stays on the snap grid', () => {
    for (const step of [60, 30, 15, 5, 1]) {
      for (let i = 0; i < 50; i++) {
        const d = makeDraftTime({ hours: 12, minutes: 0 }, step)
        expect(d).not.toEqual({ hours: 12, minutes: 0 })
        expect(d.minutes % step).toBe(0)
      }
    }
  })
})
