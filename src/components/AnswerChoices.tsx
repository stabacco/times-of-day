import styled, { css } from 'styled-components'
import { useTranslation } from 'react-i18next'
import { timeEquals, timeToDigits } from '../clock/time'
import type { ClockTime } from '../clock/time'
import type { DayPeriod, TimeLabelStyle } from '../game/types'
import { formatTimeLabel } from '../i18n/formatTime'

export interface AnswerChoicesProps {
  options: ClockTime[]
  target: ClockTime
  /** The option the player picked; set once feedback is showing. */
  chosen: ClockTime | null
  disabled: boolean
  labelStyle: TimeLabelStyle
  period: DayPeriod
  onSelect: (t: ClockTime) => void
}

type Outcome = 'correct' | 'wrong' | null

const Grid = styled.div<{ $count: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $count }) => $count}, minmax(0, 1fr));
  gap: 0.45rem;
  width: 100%;
  max-width: 100%;
  height: 100%;
  align-items: stretch;
`

const Choice = styled.button<{ $outcome: Outcome; $long: boolean }>`
  height: 100%;
  min-height: 0;
  padding: 0.25rem 0.4rem;
  border: 3px solid ${({ theme }) => theme.colors.clockRim};
  border-radius: ${({ theme }) => theme.radii.button};
  background: ${({ theme }) => theme.colors.clockFace};
  box-shadow: 0 3px 0 ${({ theme }) => theme.colors.mint};
  color: ${({ theme }) => theme.colors.ink};
  font-family: ${({ theme }) => theme.fonts.display};
  font-weight: 700;
  font-size: ${({ $long }) => ($long ? '0.82rem' : 'clamp(0.95rem, 3vh, 1.35rem)')};
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.mint};
  }

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.hourHand};
    outline-offset: 2px;
  }

  &:disabled {
    cursor: default;
  }

  ${({ $outcome, theme }) =>
    $outcome === 'correct' &&
    css`
      background: ${theme.colors.mint};
      border-color: ${theme.colors.minuteHand};
    `}

  ${({ $outcome, theme }) =>
    $outcome === 'wrong' &&
    css`
      background: ${theme.colors.white};
      border-color: ${theme.colors.hourHand};
      opacity: 0.8;
    `}
`

export function AnswerChoices({
  options,
  target,
  chosen,
  disabled,
  labelStyle,
  period,
  onSelect,
}: AnswerChoicesProps) {
  const { i18n } = useTranslation()
  const locale = i18n.resolvedLanguage ?? i18n.language

  return (
    <Grid $count={Math.max(options.length, 1)}>
      {options.map((option) => {
        const digits = timeToDigits(option)
        const label = formatTimeLabel(option, { style: labelStyle, period, locale })
        const long = label.length > 6
        let outcome: Outcome = null
        if (chosen) {
          if (timeEquals(option, target)) outcome = 'correct'
          else if (timeEquals(option, chosen)) outcome = 'wrong'
        }
        return (
          <Choice
            key={digits}
            type="button"
            disabled={disabled}
            $outcome={outcome}
            $long={long}
            onClick={() => onSelect(option)}
          >
            {label}
          </Choice>
        )
      })}
    </Grid>
  )
}
