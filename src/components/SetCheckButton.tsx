import styled from 'styled-components'
import { useTranslation } from 'react-i18next'

const Button = styled.button`
  min-width: 180px;
  min-height: 56px;
  padding: 0.5rem 2rem;
  border: 3px solid ${({ theme }) => theme.colors.minuteHand};
  border-radius: ${({ theme }) => theme.radii.button};
  background: ${({ theme }) => theme.colors.mint};
  color: ${({ theme }) => theme.colors.ink};
  font-family: ${({ theme }) => theme.fonts.display};
  font-weight: 700;
  font-size: 1.5rem;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.white};
  }

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.hourHand};
    outline-offset: 2px;
  }

  &:disabled {
    cursor: default;
    opacity: 0.6;
  }
`

export function SetCheckButton({ disabled, onCheck }: { disabled: boolean; onCheck: () => void }) {
  const { t } = useTranslation()
  return (
    <Button type="button" disabled={disabled} onClick={onCheck}>
      {t('actions.check')}
    </Button>
  )
}
