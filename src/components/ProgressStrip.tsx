import styled from 'styled-components'
import { useTranslation } from 'react-i18next'

export interface ProgressStripProps {
  stageLabel: string
  stars: number
  muted: boolean
  onToggleMute: () => void
  languages: { code: string; label: string }[]
  currentLng: string
  onChangeLng: (code: string) => void
}

const Strip = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: 0.5rem 0.75rem;
  background: ${({ theme }) => theme.colors.white};
  border: 2px solid ${({ theme }) => theme.colors.mint};
  border-radius: ${({ theme }) => theme.radii.pill};
  font-family: ${({ theme }) => theme.fonts.body};
  color: ${({ theme }) => theme.colors.inkMuted};
`

const Stage = styled.span`
  padding: 0.25rem 0.9rem;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.mint};
  color: ${({ theme }) => theme.colors.ink};
  font-family: ${({ theme }) => theme.fonts.display};
  font-weight: 600;
`

const Stars = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-family: ${({ theme }) => theme.fonts.display};
  font-weight: 600;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.ink};
`

const StarIcon = styled.span`
  color: ${({ theme }) => theme.colors.star};
  font-size: 1.3rem;
`

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const IconButton = styled.button`
  min-width: 44px;
  min-height: 44px;
  padding: 0 0.9rem;
  border: 2px solid ${({ theme }) => theme.colors.clockRim};
  border-radius: ${({ theme }) => theme.radii.button};
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.inkMuted};
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.mint};
  }

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.hourHand};
    outline-offset: 2px;
  }
`

const LangSelect = styled.select`
  min-height: 44px;
  padding: 0 0.6rem;
  border: 2px solid ${({ theme }) => theme.colors.clockRim};
  border-radius: ${({ theme }) => theme.radii.button};
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.inkMuted};
  font-weight: 600;
  cursor: pointer;

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.hourHand};
    outline-offset: 2px;
  }
`

export function ProgressStrip({
  stageLabel,
  stars,
  muted,
  onToggleMute,
  languages,
  currentLng,
  onChangeLng,
}: ProgressStripProps) {
  const { t } = useTranslation()
  const muteLabel = muted ? t('actions.unmute') : t('actions.mute')

  return (
    <Strip>
      <Stage>{stageLabel}</Stage>
      <Stars aria-label={`${stars} stars`}>
        <StarIcon aria-hidden="true">★</StarIcon>
        {stars}
      </Stars>
      <Controls>
        <IconButton
          type="button"
          onClick={onToggleMute}
          aria-pressed={muted}
          aria-label={muteLabel}
        >
          {muted ? '🔇' : '🔊'}
        </IconButton>
        <LangSelect
          value={currentLng}
          onChange={(e) => onChangeLng(e.target.value)}
          aria-label="Language"
        >
          {languages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </LangSelect>
      </Controls>
    </Strip>
  )
}
