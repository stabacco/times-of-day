import styled, { css } from 'styled-components'
import { useTranslation } from 'react-i18next'
import { timeEquals, timeToDigits } from '../clock/time'
import type { ClockTime } from '../clock/time'
import type { TimeLabelStyle } from '../game/types'
import { formatTimePhrase } from '../i18n/formatTime'

export interface AnswerChoicesProps {
  options: ClockTime[]
  target: ClockTime
  /** The option the player picked; set once feedback is showing. */
  chosen: ClockTime | null
  disabled: boolean
  labelStyle: TimeLabelStyle
  onSelect: (t: ClockTime) => void
}

type Outcome = 'correct' | 'wrong' | null

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
  width: 100%;
  max-width: 100%;
`

const Choice = styled.button<{ $outcome: Outcome; $phrase: boolean }>`
  min-height: 56px; /* >= 48px touch target */
  padding: 0.5rem 0.75rem;
  border: 3px solid ${({ theme }) => theme.colors.clockRim};
  border-radius: ${({ theme }) => theme.radii.button};
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.ink};
  font-family: ${({ theme }) => theme.fonts.display};
  font-weight: 700;
  font-size: ${({ $phrase }) => ($phrase ? '1.15rem' : '1.75rem')};
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
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

function labelFor(time: ClockTime, style: TimeLabelStyle, locale: string): string {
  const digits = timeToDigits(time)
  if (style !== 'phrase') return digits
  const phrase = formatTimePhrase(time, locale)
  return phrase
}

export function AnswerChoices({
  options,
  target,
  chosen,
  disabled,
  labelStyle,
  onSelect,
}: AnswerChoicesProps) {
  const { i18n } = useTranslation()
  const locale = i18n.resolvedLanguage ?? i18n.language
  const usePhrase = labelStyle === 'phrase'

  return (
    <Grid>
      {options.map((option) => {
        const digits = timeToDigits(option)
        const label = labelFor(option, labelStyle, locale)
        const phraseLabel = usePhrase && label !== digits
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
            $phrase={phraseLabel}
            onClick={() => onSelect(option)}
          >
            {label}
          </Choice>
        )
      })}
    </Grid>
  )
}
