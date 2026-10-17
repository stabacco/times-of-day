import type { ClockTime } from '../clock/time'

export type StageId = 'hours' | 'half' | 'quarter' | 'five' | 'any'
export type PromptKind = 'read' | 'set'
export type Difficulty = 0 | 1 | 2 // easy, mid, hard within stage

/** How times are written for this prompt. */
export type TimeLabelStyle = 'digits' | 'phrase' | 'ampm'
export type DayPeriod = 'am' | 'pm'

export type Prompt = {
  kind: PromptKind
  target: ClockTime
  options?: ClockTime[] // read mode choices; one equals target
  showHint?: boolean
  snapStep: number
  /**
   * digits → "3:30"
   * phrase → "half past 3" / midday / midnight
   * ampm → "10pm" / "3:30 am"
   */
  labelStyle: TimeLabelStyle
  /** Morning vs afternoon/evening for am/pm and midday/midnight labels. */
  period: DayPeriod
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
