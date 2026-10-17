import styled, { css, keyframes } from 'styled-components'
import { useTranslation } from 'react-i18next'
import { STAGE_ORDER, STARS_TO_UNLOCK, stageLabelKey } from '../game/stages'
import type { StageId } from '../game/types'

export interface ProgressStripProps {
  stage: StageId
  starsInStage: number
  muted: boolean
  /** Plays a short bloom on the stage control (caller disables for reduced motion). */
  bloom?: boolean
  onToggleMute: () => void
  onSelectStage: (stage: StageId) => void
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

const bloomKeyframes = keyframes`
  0% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
`

const StageSelect = styled.select<{ $bloom: boolean }>`
  ${({ $bloom }) =>
    $bloom &&
    css`
      animation: ${bloomKeyframes} 0.6s ease-out;
    `}
  min-height: 44px;
  max-width: 11rem;
  padding: 0.25rem 0.6rem;
  border: 2px solid ${({ theme }) => theme.colors.clockRim};
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.mint};
  color: ${({ theme }) => theme.colors.ink};
  font-family: ${({ theme }) => theme.fonts.display};
  font-weight: 600;
  cursor: pointer;

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.hourHand};
    outline-offset: 2px;
  }
`

const Progress = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-family: ${({ theme }) => theme.fonts.display};
  font-weight: 600;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.ink};
  font-variant-numeric: tabular-nums;
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
  stage,
  starsInStage,
  muted,
  bloom = false,
  onToggleMute,
  onSelectStage,
  languages,
  currentLng,
  onChangeLng,
}: ProgressStripProps) {
  const { t } = useTranslation()
  const goal = STARS_TO_UNLOCK
  const capped = Math.min(starsInStage, goal)

  return (
    <Strip>
      <StageSelect
        $bloom={bloom}
        value={stage}
        aria-label={t('a11y.stage')}
        onChange={(e) => onSelectStage(e.target.value as StageId)}
      >
        {STAGE_ORDER.map((id) => (
          <option key={id} value={id}>
            {t(stageLabelKey(id))}
          </option>
        ))}
      </StageSelect>
      <Progress
        role="img"
        aria-label={t('a11y.stageProgress', { current: capped, goal })}
      >
        <StarIcon aria-hidden="true">★</StarIcon>
        {capped}/{goal}
      </Progress>
      <Controls>
        <IconButton
          type="button"
          onClick={onToggleMute}
          aria-pressed={muted}
          aria-label={t('actions.sound')}
        >
          {muted ? '🔇' : '🔊'}
        </IconButton>
        <LangSelect
          value={currentLng}
          onChange={(e) => onChangeLng(e.target.value)}
          aria-label={t('a11y.language')}
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
