import styled, { css, keyframes, useTheme } from 'styled-components'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

export type GardenCrittersProps = {
  night?: boolean
}

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

const buzz = keyframes`
  0% { transform: translate(0, 0) rotate(-4deg); }
  25% { transform: translate(10px, -8px) rotate(6deg); }
  50% { transform: translate(-6px, -14px) rotate(-2deg); }
  75% { transform: translate(8px, -4px) rotate(5deg); }
  100% { transform: translate(0, 0) rotate(-4deg); }
`

const flap = keyframes`
  0%, 100% { transform: scaleX(1); }
  50% { transform: scaleX(0.55); }
`

const glow = keyframes`
  0%, 100% { opacity: 0.25; transform: scale(0.7); }
  50% { opacity: 1; transform: scale(1.15); }
`

const floatFirefly = keyframes`
  0% { transform: translate(0, 0); }
  33% { transform: translate(12px, -18px); }
  66% { transform: translate(-10px, -8px); }
  100% { transform: translate(0, 0); }
`

const Critter = styled.div<{
  $x: string
  $y: string
  $anim: 'a' | 'b' | 'buzz' | 'fire'
  $motion: boolean
  $size?: string
}>`
  position: absolute;
  left: ${({ $x }) => $x};
  top: ${({ $y }) => $y};
  width: ${({ $size }) => $size ?? 'clamp(1.1rem, 3.5vh, 1.75rem)'};
  height: ${({ $size }) => $size ?? 'clamp(0.9rem, 2.8vh, 1.35rem)'};
  ${({ $motion, $anim }) =>
    $motion &&
    css`
      animation: ${$anim === 'a'
          ? driftA
          : $anim === 'b'
            ? driftB
            : $anim === 'buzz'
              ? buzz
              : floatFirefly}
        ${$anim === 'a' ? '7s' : $anim === 'b' ? '8.5s' : $anim === 'buzz' ? '4.5s' : '6s'}
        ease-in-out infinite;
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

const GlowDot = styled.span<{ $motion: boolean; $delay: string }>`
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    ${({ theme }) => theme.colors.fireflyCore} 0%,
    ${({ theme }) => theme.colors.fireflyGlow} 45%,
    transparent 70%
  );
  ${({ $motion, $delay }) =>
    $motion &&
    css`
      animation: ${glow} 2.2s ease-in-out infinite;
      animation-delay: ${$delay};
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

function BeeSvg({ motion }: { motion: boolean }) {
  const { colors } = useTheme()
  return (
    <svg viewBox="0 0 28 20" width="100%" height="100%" aria-hidden="true">
      <WingPair $motion={motion}>
        <ellipse cx="10" cy="6" rx="5" ry="3.5" fill={colors.white} opacity="0.85" />
        <ellipse cx="18" cy="6" rx="5" ry="3.5" fill={colors.white} opacity="0.85" />
      </WingPair>
      <ellipse cx="14" cy="12" rx="8" ry="5.5" fill={colors.flowerYellow} />
      <rect x="8" y="9" width="2.2" height="6" rx="1" fill={colors.butterflyBody} />
      <rect x="12" y="9" width="2.2" height="6" rx="1" fill={colors.butterflyBody} />
      <rect x="16" y="9" width="2.2" height="6" rx="1" fill={colors.butterflyBody} />
      <circle cx="22" cy="11" r="2.4" fill={colors.butterflyBody} />
    </svg>
  )
}

function DayCritters({ motion }: { motion: boolean }) {
  const { colors } = useTheme()
  return (
    <>
      <Critter $x="8%" $y="18%" $anim="a" $motion={motion}>
        <ButterflySvg wing={colors.butterflyWing} motion={motion} />
      </Critter>
      <Critter $x="78%" $y="28%" $anim="b" $motion={motion}>
        <ButterflySvg wing={colors.butterflyWingAlt} motion={motion} />
      </Critter>
      <Critter
        $x="18%"
        $y="42%"
        $anim="buzz"
        $motion={motion}
        $size="clamp(1rem, 3.2vh, 1.55rem)"
      >
        <BeeSvg motion={motion} />
      </Critter>
      <Critter
        $x="68%"
        $y="48%"
        $anim="buzz"
        $motion={motion}
        $size="clamp(0.95rem, 3vh, 1.45rem)"
        style={motion ? { animationDelay: '-1.4s' } : undefined}
      >
        <BeeSvg motion={motion} />
      </Critter>
    </>
  )
}

const FIREFLIES = [
  { x: '12%', y: '22%', delay: '0s' },
  { x: '28%', y: '38%', delay: '0.4s' },
  { x: '48%', y: '18%', delay: '0.9s' },
  { x: '62%', y: '44%', delay: '0.2s' },
  { x: '78%', y: '26%', delay: '1.1s' },
  { x: '86%', y: '52%', delay: '0.6s' },
]

function NightCritters({ motion }: { motion: boolean }) {
  return (
    <>
      {FIREFLIES.map((f) => (
        <Critter
          key={`${f.x}-${f.y}`}
          $x={f.x}
          $y={f.y}
          $anim="fire"
          $motion={motion}
          $size="clamp(0.55rem, 1.8vh, 0.85rem)"
          style={motion ? { animationDelay: f.delay } : undefined}
        >
          <GlowDot $motion={motion} $delay={f.delay} />
        </Critter>
      ))}
    </>
  )
}

/** Day: butterflies + bees. Night: glowing fireflies. */
export function GardenCritters({ night = false }: GardenCrittersProps) {
  const reduced = usePrefersReducedMotion()
  const motion = !reduced

  return (
    <Layer aria-hidden="true" data-critters={night ? 'night' : 'day'}>
      {night ? <NightCritters motion={motion} /> : <DayCritters motion={motion} />}
    </Layer>
  )
}
