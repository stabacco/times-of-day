import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { playSfx } from '../audio/sfx'
import { normalizeTime, timeEquals, timeToDigits } from '../clock/time'
import type { ClockTime } from '../clock/time'
import { initialAdaptive } from '../game/adaptive'
import { applyAnswer, initialSession } from '../game/progress'
import { nextPrompt } from '../game/promptEngine'
import { stageLabelKey } from '../game/stages'
import type { Prompt, SessionState, StageId } from '../game/types'
import { formatTimeLabel } from '../i18n/formatTime'

export const RESULT_FEEDBACK_MS = 900
export const UNLOCK_FEEDBACK_MS = 1600

/** Minimum distance (minutes) the starting hands sit from the target in set mode. */
const MIN_DRAFT_OFFSET_MINUTES = 30
const DAY_MINUTES = 12 * 60

export type FeedbackKind = 'correct' | 'wrong' | 'unlock'
export type Feedback = { kind: FeedbackKind; message: string }

type FeedbackState =
  | { phase: 'result'; correct: boolean; target: ClockTime; unlockedStage: StageId | null }
  | { phase: 'unlock'; stage: StageId }

type GameState = {
  session: SessionState
  prompt: Prompt
  draftTime: ClockTime
  feedback: FeedbackState | null
  lastChoice: ClockTime | null
}

export type GameSession = {
  session: SessionState
  prompt: Prompt
  draftTime: ClockTime
  feedback: Feedback | null
  /** The read-mode option the player last picked (while feedback is showing). */
  lastChoice: ClockTime | null
  setDraftTime: (t: ClockTime) => void
  selectOption: (t: ClockTime) => void
  checkSet: () => void
  toggleMute: () => void
  selectStage: (stage: StageId) => void
  dismissFeedbackAndContinue: () => void
}

/** Snap to the nearest multiple of `step` minutes, carrying into the hour. */
export function snapTime(t: ClockTime, step: number): ClockTime {
  const n = normalizeTime(t)
  const s = step > 0 ? step : 1
  const total = (n.hours % 12) * 60 + n.minutes
  const snapped = Math.round(total / s) * s
  return normalizeTime({ hours: Math.floor(snapped / 60), minutes: snapped % 60 })
}

/** A start position for set mode that is always a different time from the target. */
export function makeDraftTime(
  target: ClockTime,
  snapStep: number,
  rng: () => number = Math.random,
): ClockTime {
  const step = snapStep > 0 ? snapStep : 1
  const slots = DAY_MINUTES / step
  const minSlot = Math.ceil(MIN_DRAFT_OFFSET_MINUTES / step)
  const maxSlot = slots - minSlot
  const slot = minSlot + Math.floor(rng() * (maxSlot - minSlot + 1))
  const n = normalizeTime(target)
  return normalizeTime({ hours: n.hours, minutes: n.minutes + slot * step })
}

function startPrompt(session: SessionState): Pick<GameState, 'session' | 'prompt' | 'draftTime'> {
  const prompt = nextPrompt(session)
  return {
    // Remember the kind so the variety nudge in choosePromptKind works next time.
    session: { ...session, lastPromptKind: prompt.kind },
    prompt,
    draftTime: makeDraftTime(prompt.target, prompt.snapStep),
  }
}

function createGame(): GameState {
  return { ...startPrompt(initialSession()), feedback: null, lastChoice: null }
}

export function useGameSession(): GameSession {
  const { t, i18n } = useTranslation()
  const [game, setGame] = useState<GameState>(createGame)
  const gameRef = useRef(game)

  const commit = useCallback((next: GameState) => {
    gameRef.current = next
    setGame(next)
  }, [])

  const submitAnswer = useCallback(
    (correct: boolean, choice: ClockTime | null) => {
      const g = gameRef.current
      if (g.feedback) return
      const result = applyAnswer(g.session, correct)
      playSfx(result.unlocked ? 'unlock' : correct ? 'correct' : 'wrong', g.session.muted)
      commit({
        ...g,
        session: result.session,
        lastChoice: choice,
        feedback: {
          phase: 'result',
          correct,
          target: g.prompt.target,
          unlockedStage: result.advancedTo,
        },
      })
    },
    [commit],
  )

  const selectOption = useCallback(
    (choice: ClockTime) => {
      const g = gameRef.current
      if (g.feedback || g.prompt.kind !== 'read') return
      submitAnswer(timeEquals(choice, g.prompt.target), choice)
    },
    [submitAnswer],
  )

  const checkSet = useCallback(() => {
    const g = gameRef.current
    if (g.feedback || g.prompt.kind !== 'set') return
    const snapped = snapTime(g.draftTime, g.prompt.snapStep)
    submitAnswer(timeEquals(snapped, g.prompt.target), null)
  }, [submitAnswer])

  const setDraftTime = useCallback(
    (draft: ClockTime) => {
      const g = gameRef.current
      if (g.feedback) return
      commit({ ...g, draftTime: draft })
    },
    [commit],
  )

  const toggleMute = useCallback(() => {
    const g = gameRef.current
    commit({ ...g, session: { ...g.session, muted: !g.session.muted } })
  }, [commit])

  const selectStage = useCallback(
    (stage: StageId) => {
      const g = gameRef.current
      const session: SessionState = {
        ...g.session,
        stage,
        starsInStage: 0,
        adaptive: initialAdaptive(),
        lastPromptKind: null,
      }
      commit({ ...startPrompt(session), feedback: null, lastChoice: null })
    },
    [commit],
  )

  const dismissFeedbackAndContinue = useCallback(() => {
    const g = gameRef.current
    const fb = g.feedback
    if (!fb) return
    if (fb.phase === 'result' && fb.unlockedStage) {
      commit({ ...g, feedback: { phase: 'unlock', stage: fb.unlockedStage } })
      return
    }
    commit({ ...startPrompt(g.session), feedback: null, lastChoice: null })
  }, [commit])

  // Auto-advance after the feedback has been shown for a moment.
  useEffect(() => {
    const fb = game.feedback
    if (!fb) return
    const ms = fb.phase === 'unlock' ? UNLOCK_FEEDBACK_MS : RESULT_FEEDBACK_MS
    const id = window.setTimeout(dismissFeedbackAndContinue, ms)
    return () => window.clearTimeout(id)
  }, [game.feedback, dismissFeedbackAndContinue])

  // Messages are derived at render time so a language switch updates copy mid-feedback.
  const feedback = useMemo<Feedback | null>(() => {
    const fb = game.feedback
    if (!fb) return null
    if (fb.phase === 'unlock') {
      return { kind: 'unlock', message: t('unlock', { stage: t(stageLabelKey(fb.stage)) }) }
    }
    if (fb.correct) return { kind: 'correct', message: t('feedback.correct') }
    const locale = i18n.resolvedLanguage ?? i18n.language
    const primary = formatTimeLabel(fb.target, {
      style: game.prompt.labelStyle,
      period: game.prompt.period,
      locale,
    })
    const digits = timeToDigits(fb.target)
    const timeLabel = primary === digits ? digits : `${primary} (${digits})`
    return { kind: 'wrong', message: t('feedback.wrong', { time: timeLabel }) }
  }, [
    game.feedback,
    game.prompt.labelStyle,
    game.prompt.period,
    t,
    i18n.resolvedLanguage,
    i18n.language,
  ])

  return {
    session: game.session,
    prompt: game.prompt,
    draftTime: game.draftTime,
    feedback,
    lastChoice: game.lastChoice,
    setDraftTime,
    selectOption,
    checkSet,
    toggleMute,
    selectStage,
    dismissFeedbackAndContinue,
  }
}
