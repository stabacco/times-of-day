import styled, { css, keyframes, useTheme } from 'styled-components'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

const Layer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: visible;
  z-index: 1;
`

const driftA = keyframes`
  0% { transform: translate(0, 0) rotate(-6deg); }
  50% { transform: translate(18px, -22px) rotate(8deg); }
  100% { transform: translate(0, 0) rotate(-6deg); }
`

const driftB = keyframes`
  0% { transform: translate(0, 0) rotate(4deg); }
  50% { transform: translate(-16px, -18px) rotate(-10deg); }
  100% { transform: translate(0, 0) rotate(4deg); }
`

const flap = keyframes`
  0%, 100% { transform: scaleX(1); }
  50% { transform: scaleX(0.55); }
`

const Critter = styled.div<{ $x: string; $y: string; $anim: 'a' | 'b'; $motion: boolean }>`
  position: absolute;
  left: ${({ $x }) => $x};
  top: ${({ $y }) => $y};
  width: clamp(1.1rem, 3.5vh, 1.75rem);
  height: clamp(0.9rem, 2.8vh, 1.35rem);
  ${({ $motion, $anim }) =>
    $motion &&
    css`
      animation: ${$anim === 'a' ? driftA : driftB} ${$anim === 'a' ? '7s' : '8.5s'} ease-in-out
        infinite;
    `}

  @media (max-height: 560px) {
    display: none;
  }
`

const WingPair = styled.g<{ $motion: boolean }>`
  transform-origin: 12px 10px;
  ${({ $motion }) =>
    $motion &&
    css`
      animation: ${flap} 0.55s ease-in-out infinite;
    `}
`

function ButterflySvg({ wing, motion }: { wing: string; motion: boolean }) {
  const { colors } = useTheme()
  return (
    <svg viewBox="0 0 24 20" width="100%" height="100%" aria-hidden="true">
      <WingPair $motion={motion}>
        <ellipse cx="7" cy="9" rx="6" ry="7" fill={wing} opacity="0.92" />
        <ellipse cx="17" cy="9" rx="6" ry="7" fill={wing} opacity="0.92" />
      </WingPair>
      <ellipse cx="12" cy="10" rx="1.6" ry="5" fill={colors.butterflyBody} />
      <circle cx="12" cy="4.5" r="1.4" fill={colors.butterflyBody} />
    </svg>
  )
}

export function Butterflies() {
  const { colors } = useTheme()
  const reduced = usePrefersReducedMotion()
  const motion = !reduced

  return (
    <Layer aria-hidden="true">
      <Critter $x="8%" $y="18%" $anim="a" $motion={motion}>
        <ButterflySvg wing={colors.butterflyWing} motion={motion} />
      </Critter>
      <Critter $x="78%" $y="28%" $anim="b" $motion={motion}>
        <ButterflySvg wing={colors.butterflyWingAlt} motion={motion} />
      </Critter>
    </Layer>
  )
}
