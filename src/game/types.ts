import type { ClockTime } from '../clock/time'

export type StageId = 'hours' | 'half' | 'quarter' | 'five' | 'any'
export type PromptKind = 'read' | 'set'
export type Difficulty = 0 | 1 | 2 // easy, mid, hard within stage

export type Prompt = {
  kind: PromptKind
  target: ClockTime
  options?: ClockTime[] // read mode choices; one equals target
  showHint?: boolean
  snapStep: number
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
