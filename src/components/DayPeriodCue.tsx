import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { normalizeTime } from '../clock/time'
import type { ClockTime } from '../clock/time'
import type { DayPeriod, TimeLabelStyle } from '../game/types'

export type CueKind = 'sun' | 'moon'

/** When labels imply time-of-day, show a sun (day) or moon (night) cue. */
export function shouldShowPeriodCue(labelStyle: TimeLabelStyle, time: ClockTime): boolean {
  if (labelStyle === 'ampm') return true
  const n = normalizeTime(time)
  return labelStyle === 'phrase' && n.hours === 12 && n.minutes === 0
}

export function periodCueKind(period: DayPeriod, time: ClockTime): CueKind {
  const n = normalizeTime(time)
  if (n.hours === 12 && n.minutes === 0) {
    return period === 'am' ? 'moon' : 'sun' // midnight / midday
  }
  return period === 'am' ? 'sun' : 'moon'
}

const Wrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 3rem;
  height: 3rem;
  flex-shrink: 0;
`

const Svg = styled.svg`
  width: 2.5rem;
  height: 2.5rem;
  display: block;
`

type Props = {
  period: DayPeriod
  time: ClockTime
  labelStyle: TimeLabelStyle
}

export function DayPeriodCue({ period, time, labelStyle }: Props) {
  const { t } = useTranslation()
  if (!shouldShowPeriodCue(labelStyle, time)) return null
  const kind = periodCueKind(period, time)
  const label = kind === 'sun' ? t('a11y.day') : t('a11y.night')

  return (
    <Wrap role="img" aria-label={label}>
      {kind === 'sun' ? (
        <Svg viewBox="0 0 48 48" aria-hidden="true">
          <circle cx="24" cy="24" r="10" fill="#e6c35c" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
            const rad = (deg * Math.PI) / 180
            const x1 = 24 + Math.cos(rad) * 14
            const y1 = 24 + Math.sin(rad) * 14
            const x2 = 24 + Math.cos(rad) * 20
            const y2 = 24 + Math.sin(rad) * 20
            return (
              <line
                key={deg}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#e6c35c"
                strokeWidth="3"
                strokeLinecap="round"
              />
            )
          })}
        </Svg>
      ) : (
        <Svg viewBox="0 0 48 48" aria-hidden="true">
          <path
            d="M30 8a16 16 0 1 0 10 26 14 14 0 1 1-10-26z"
            fill="#5a7a9e"
          />
        </Svg>
      )}
    </Wrap>
  )
}
