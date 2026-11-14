import styled, { useTheme } from 'styled-components'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

export type GardenBackdropProps = {
  /** Evening / midnight garden — matches the moon period cue. */
  night?: boolean
}

const Layer = styled.div<{ $night: boolean; $motion: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  background: ${({ theme, $night }) =>
    $night
      ? `linear-gradient(
          180deg,
          ${theme.colors.nightSkyTop} 0%,
          ${theme.colors.nightSkyBottom} 48%,
          ${theme.colors.nightMeadow} 100%
        )`
      : `linear-gradient(
          180deg,
          ${theme.colors.skyTop} 0%,
          ${theme.colors.bgTop} 42%,
          ${theme.colors.skyBottom} 72%,
          ${theme.colors.bgBottom} 100%
        )`};
  transition: ${({ $motion }) => ($motion ? 'background 1s ease' : 'none')};

  .sun {
    transition: ${({ $motion }) =>
      $motion ? 'transform 1s ease, opacity 0.85s ease' : 'none'};
    transform: translateY(${({ $night }) => ($night ? '140px' : '0')});
    opacity: ${({ $night }) => ($night ? 0 : 1)};
  }

  .moon {
    transition: ${({ $motion }) =>
      $motion ? 'transform 1s ease, opacity 0.85s ease' : 'none'};
    transform: translateY(${({ $night }) => ($night ? '0' : '130px')});
    opacity: ${({ $night }) => ($night ? 1 : 0)};
  }

  .clouds {
    transition: ${({ $motion }) => ($motion ? 'opacity 0.85s ease' : 'none')};
    opacity: ${({ $night }) => ($night ? 0 : 0.6)};
  }

  .stars {
    transition: ${({ $motion }) => ($motion ? 'opacity 0.85s ease' : 'none')};
    opacity: ${({ $night }) => ($night ? 1 : 0)};
  }
`

const SkyArt = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 55%;
  display: block;
  overflow: visible;
`

const Hills = styled.svg`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: min(48vh, 380px);
  display: block;
`

function Flower({
  cx,
  cy,
  petal,
  scale = 1,
}: {
  cx: number
  cy: number
  petal: string
  scale?: number
}) {
  const theme = useTheme()
  const r = 5 * scale
  const stem = 14 * scale
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <line
        x1={0}
        y1={0}
        x2={0}
        y2={stem}
        stroke={theme.colors.leaf}
        strokeWidth={2 * scale}
        strokeLinecap="round"
      />
      {[0, 72, 144, 216, 288].map((deg) => {
        const rad = ((deg - 90) * Math.PI) / 180
        return (
          <circle
            key={deg}
            cx={Math.cos(rad) * r * 0.85}
            cy={Math.sin(rad) * r * 0.85}
            r={r * 0.55}
            fill={petal}
          />
        )
      })}
      <circle cx={0} cy={0} r={r * 0.45} fill={theme.colors.flowerCenter} />
    </g>
  )
}

const STARS: { cx: number; cy: number; r: number }[] = [
  { cx: 40, cy: 36, r: 1.6 },
  { cx: 90, cy: 22, r: 1.2 },
  { cx: 140, cy: 48, r: 1.8 },
  { cx: 185, cy: 18, r: 1.3 },
  { cx: 230, cy: 40, r: 1.5 },
  { cx: 280, cy: 28, r: 1.1 },
  { cx: 320, cy: 55, r: 1.4 },
  { cx: 360, cy: 20, r: 1.7 },
  { cx: 60, cy: 70, r: 1.1 },
  { cx: 250, cy: 70, r: 1.2 },
]

export function GardenBackdrop({ night = false }: GardenBackdropProps) {
  const { colors } = useTheme()
  const reduced = usePrefersReducedMotion()
  const motion = !reduced

  const hillFar = night ? colors.nightHillFar : colors.hillFar
  const hillNear = night ? colors.nightHillNear : colors.hillNear
  const meadow = night ? colors.nightMeadow : colors.meadow

  return (
    <Layer
      aria-hidden="true"
      data-scene={night ? 'night' : 'day'}
      $night={night}
      $motion={motion}
    >
      <SkyArt viewBox="0 0 400 220" preserveAspectRatio="xMidYMin slice">
        <g className="sun">
          <circle cx="330" cy="55" r="48" fill={colors.flowerYellow} opacity="0.5" />
          <circle cx="330" cy="55" r="28" fill={colors.flowerCenter} opacity="0.9" />
        </g>

        <g className="moon">
          <circle cx="70" cy="50" r="36" fill={colors.moonGlow} opacity="0.35" />
          <circle cx="70" cy="50" r="22" fill={colors.moon} />
          <circle cx="78" cy="44" r="18" fill={colors.nightSkyTop} />
        </g>

        <g className="clouds" fill={colors.white}>
          <ellipse cx="70" cy="70" rx="36" ry="16" />
          <ellipse cx="95" cy="64" rx="22" ry="14" />
          <ellipse cx="48" cy="68" rx="18" ry="12" />
          <ellipse cx="200" cy="95" rx="40" ry="15" />
          <ellipse cx="225" cy="88" rx="24" ry="13" />
        </g>

        <g className="stars" fill={colors.starBright}>
          {STARS.map((s) => (
            <circle key={`${s.cx}-${s.cy}`} cx={s.cx} cy={s.cy} r={s.r} />
          ))}
        </g>
      </SkyArt>

      <Hills viewBox="0 0 400 220" preserveAspectRatio="none">
        <path
          d="M0 70 C60 30 120 50 180 40 C260 25 300 55 400 30 L400 220 L0 220 Z"
          fill={hillFar}
        />
        <path
          d="M0 110 C80 70 140 100 220 85 C300 70 340 110 400 90 L400 220 L0 220 Z"
          fill={hillNear}
        />
        <path
          d="M0 155 C100 125 180 165 260 140 C330 120 370 160 400 145 L400 220 L0 220 Z"
          fill={meadow}
        />
        <Flower cx={36} cy={155} petal={colors.flowerPink} scale={1.1} />
        <Flower cx={78} cy={168} petal={colors.flowerYellow} scale={0.85} />
        <Flower cx={130} cy={158} petal={colors.flowerCoral} scale={1} />
        <Flower cx={190} cy={172} petal={colors.flowerPink} scale={0.75} />
        <Flower cx={250} cy={160} petal={colors.flowerYellow} scale={1.05} />
        <Flower cx={310} cy={170} petal={colors.flowerCoral} scale={0.9} />
        <Flower cx={360} cy={155} petal={colors.flowerPink} scale={1} />
      </Hills>
    </Layer>
  )
}
