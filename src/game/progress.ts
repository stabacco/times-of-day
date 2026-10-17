import { initialAdaptive, recentAccuracy, recordAnswer } from './adaptive'
import { ACCURACY_FLOOR, STARS_TO_UNLOCK, nextStage } from './stages'
import type { SessionState, StageId } from './types'

export type AnswerResult = {
  session: SessionState
  unlocked: boolean
  advancedTo: StageId | null
}

const MIN_SAMPLES_FOR_ACCURACY = 5

export function initialSession(): SessionState {
  return {
    stage: 'hours',
    starsInStage: 0,
    totalStars: 0,
    adaptive: initialAdaptive(),
    muted: false,
    lastPromptKind: null,
  }
}

export function applyAnswer(session: SessionState, correct: boolean): AnswerResult {
  const adaptive = recordAnswer(session.adaptive, correct)
  const updated: SessionState = {
    ...session,
    adaptive,
    starsInStage: session.starsInStage + (correct ? 1 : 0),
    totalStars: session.totalStars + (correct ? 1 : 0),
  }

  const accuracyOk =
    adaptive.recent.length < MIN_SAMPLES_FOR_ACCURACY || recentAccuracy(adaptive) >= ACCURACY_FLOOR
  const target = nextStage(updated.stage)

  if (target !== null && updated.starsInStage >= STARS_TO_UNLOCK && accuracyOk) {
    return {
      session: { ...updated, stage: target, starsInStage: 0, adaptive: initialAdaptive() },
      unlocked: true,
      advancedTo: target,
    }
  }
  return { session: updated, unlocked: false, advancedTo: null }
}
