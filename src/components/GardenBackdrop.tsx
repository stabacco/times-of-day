import styled, { useTheme } from 'styled-components'

const Layer = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
`

const SkyArt = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 42%;
  display: block;
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

export function GardenBackdrop() {
  const { colors } = useTheme()

  return (
    <Layer aria-hidden="true">
      <SkyArt viewBox="0 0 400 200" preserveAspectRatio="xMidYMin slice">
        <circle cx="330" cy="55" r="48" fill={colors.flowerYellow} opacity="0.5" />
        <circle cx="330" cy="55" r="28" fill={colors.flowerCenter} opacity="0.9" />
        <g fill={colors.white} opacity="0.6">
          <ellipse cx="70" cy="70" rx="36" ry="16" />
          <ellipse cx="95" cy="64" rx="22" ry="14" />
          <ellipse cx="48" cy="68" rx="18" ry="12" />
          <ellipse cx="200" cy="95" rx="40" ry="15" />
          <ellipse cx="225" cy="88" rx="24" ry="13" />
        </g>
      </SkyArt>

      <Hills viewBox="0 0 400 220" preserveAspectRatio="none">
        <path
          d="M0 70 C60 30 120 50 180 40 C260 25 300 55 400 30 L400 220 L0 220 Z"
          fill={colors.hillFar}
        />
        <path
          d="M0 110 C80 70 140 100 220 85 C300 70 340 110 400 90 L400 220 L0 220 Z"
          fill={colors.hillNear}
        />
        <path
          d="M0 155 C100 125 180 165 260 140 C330 120 370 160 400 145 L400 220 L0 220 Z"
          fill={colors.meadow}
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
