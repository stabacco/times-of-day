import type { AdaptiveState, Difficulty } from './types'

const WINDOW = 10
const MIN_SAMPLES = 5
const HARD_THRESHOLD = 0.85
const EASY_THRESHOLD = 0.55

export function initialAdaptive(): AdaptiveState {
  return { recent: [], difficulty: 1 }
}

export function recentAccuracy(state: AdaptiveState): number {
  if (state.recent.length === 0) return 0
  return state.recent.filter(Boolean).length / state.recent.length
}

export function recordAnswer(state: AdaptiveState, correct: boolean): AdaptiveState {
  const recent = [...state.recent, correct].slice(-WINDOW)
  const next: AdaptiveState = { recent, difficulty: 1 }
  let difficulty: Difficulty = 1
  if (recent.length >= MIN_SAMPLES) {
    const acc = recentAccuracy(next)
    if (acc >= HARD_THRESHOLD) difficulty = 2
    else if (acc <= EASY_THRESHOLD) difficulty = 0
  }
  return { recent, difficulty }
}
