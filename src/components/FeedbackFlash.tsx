import styled from 'styled-components'

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

const Flash = styled.button<{ $kind: 'correct' | 'wrong' | 'unlock' }>`
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
  return (
    <Region role="status" aria-live="polite">
      {feedback && (
        <Flash type="button" $kind={feedback.kind} onClick={onDismiss}>
          {feedback.message}
        </Flash>
      )}
    </Region>
  )
}
