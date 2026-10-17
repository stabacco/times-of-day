import type { ClockTime } from '../clock/time'
import { normalizeTime } from '../clock/time'
import type { StageId } from './types'

export const STAGE_ORDER: StageId[] = ['hours', 'half', 'quarter', 'five', 'any']
export const STARS_TO_UNLOCK = 8
export const ACCURACY_FLOOR = 0.7

export function stageIndex(id: StageId): number {
  return STAGE_ORDER.indexOf(id)
}

export function nextStage(id: StageId): StageId | null {
  const i = stageIndex(id)
  return i < 0 || i >= STAGE_ORDER.length - 1 ? null : STAGE_ORDER[i + 1]
}

export function minuteStepForStage(id: StageId): number {
  switch (id) {
    case 'hours':
      return 60
    case 'half':
      return 30
    case 'quarter':
      return 15
    case 'five':
      return 5
    case 'any':
      return 1
  }
}

export function isLegalTime(stage: StageId, t: ClockTime): boolean {
  const n = normalizeTime(t)
  const step = minuteStepForStage(stage)
  if (step === 60) return n.minutes === 0
  return n.minutes % step === 0
}

export function randomLegalTime(stage: StageId, rng: () => number = Math.random): ClockTime {
  const hours = 1 + Math.floor(rng() * 12)
  const step = minuteStepForStage(stage)
  if (step === 60) return normalizeTime({ hours, minutes: 0 })
  const slots = 60 / step
  const minutes = Math.floor(rng() * slots) * step
  return normalizeTime({ hours, minutes })
}

export function stageLabelKey(id: StageId): string {
  return `stages.${id}`
}
