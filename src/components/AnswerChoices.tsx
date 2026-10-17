import styled, { css } from 'styled-components'
import { timeEquals, timeToDigits } from '../clock/time'
import type { ClockTime } from '../clock/time'

export interface AnswerChoicesProps {
  options: ClockTime[]
  target: ClockTime
  /** The option the player picked; set once feedback is showing. */
  chosen: ClockTime | null
  disabled: boolean
  onSelect: (t: ClockTime) => void
}

type Outcome = 'correct' | 'wrong' | null

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
  width: 100%;
  max-width: 560px;
`

const Choice = styled.button<{ $outcome: Outcome }>`
  min-height: 64px;
  padding: 0.5rem 1rem;
  border: 3px solid ${({ theme }) => theme.colors.clockRim};
  border-radius: ${({ theme }) => theme.radii.button};
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.ink};
  font-family: ${({ theme }) => theme.fonts.display};
  font-weight: 700;
  font-size: 1.75rem;
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

export function AnswerChoices({ options, target, chosen, disabled, onSelect }: AnswerChoicesProps) {
  return (
    <Grid>
      {options.map((option) => {
        const digits = timeToDigits(option)
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
            onClick={() => onSelect(option)}
          >
            {digits}
          </Choice>
        )
      })}
    </Grid>
  )
}
