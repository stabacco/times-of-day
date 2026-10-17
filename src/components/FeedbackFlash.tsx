import styled, { css, keyframes } from 'styled-components'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

export interface FeedbackFlashProps {
  feedback: { kind: 'correct' | 'wrong' | 'unlock'; message: string } | null
  onDismiss: () => void
}

const Region = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  min-height: 56px;
`

const pop = keyframes`
  0% { transform: scale(0.4) rotate(-20deg); opacity: 0; }
  60% { transform: scale(1.3) rotate(8deg); opacity: 1; }
  100% { transform: scale(1) rotate(0); opacity: 1; }
`

const Star = styled.span<{ $animate: boolean }>`
  display: inline-block;
  margin-right: 0.4rem;
  color: ${({ theme }) => theme.colors.star};
  ${({ $animate }) =>
    $animate &&
    css`
      animation: ${pop} 0.45s ease-out;
    `}
`

const Flash = styled.button<{ $kind: 'correct' | 'wrong' | 'unlock' }>`
  max-width: 100%;
  padding: 0.6rem 1.5rem;
  border: 3px solid
    ${({ theme, $kind }) => ($kind === 'wrong' ? theme.colors.hourHand : theme.colors.minuteHand)};
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme, $kind }) => ($kind === 'unlock' ? theme.colors.star : theme.colors.mint)};
  color: ${({ theme }) => theme.colors.ink};
  font-family: ${({ theme }) => theme.fonts.display};
  font-weight: 700;
  font-size: 1.25rem;
  cursor: pointer;

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.hourHand};
    outline-offset: 2px;
  }
`

export function FeedbackFlash({ feedback, onDismiss }: FeedbackFlashProps) {
  const reducedMotion = usePrefersReducedMotion()
  return (
    <Region role="status" aria-live="polite">
      {feedback && (
        <Flash type="button" $kind={feedback.kind} onClick={onDismiss}>
          {feedback.kind === 'correct' && (
            <Star aria-hidden="true" $animate={!reducedMotion}>
              ★
            </Star>
          )}
          {feedback.message}
        </Flash>
      )}
    </Region>
  )
}
