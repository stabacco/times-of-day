import type { ClockTime } from '../clock/time'

export type StageId = 'hours' | 'half' | 'quarter' | 'five' | 'any'
export type PromptKind = 'read' | 'set'
export type Difficulty = 0 | 1 | 2 // easy, mid, hard within stage

/** How times are written for this prompt: digital clock vs spoken-style phrase. */
export type TimeLabelStyle = 'digits' | 'phrase'

export type Prompt = {
  kind: PromptKind
  target: ClockTime
  options?: ClockTime[] // read mode choices; one equals target
  showHint?: boolean
  snapStep: number
  /** Prefer digits or natural phrases (UI falls back to digits when no phrase exists). */
  labelStyle: TimeLabelStyle
}

export type AdaptiveState = {
  recent: boolean[] // true = correct; max length 10
  difficulty: Difficulty
}

export type SessionState = {
  stage: StageId
  starsInStage: number
  totalStars: number
  adaptive: AdaptiveState
  muted: boolean
  lastPromptKind: PromptKind | null
}
