import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import styled, { keyframes, useTheme } from 'styled-components'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

const BURST_MS = 720

const Layer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 2;
`

const fly = keyframes`
  0% {
    transform: translate(-50%, -50%) scale(0.3) rotate(0deg);
    opacity: 0;
  }
  18% {
    opacity: 1;
  }
  100% {
    transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(1) rotate(var(--spin));
    opacity: 0;
  }
`

const Petal = styled.span`
  position: absolute;
  left: 50%;
  top: 48%;
  width: 0.7rem;
  height: 1rem;
  border-radius: 60% 60% 55% 55%;
  background: var(--petal);
  animation: ${fly} ${BURST_MS}ms ease-out forwards;
`

const Spark = styled.span`
  position: absolute;
  left: 50%;
  top: 48%;
  width: 0.35rem;
  height: 0.35rem;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.star};
  animation: ${fly} ${BURST_MS}ms ease-out forwards;
`

type Props = {
  /** Bumps when a new celebration should play. */
  active: boolean
}

const PETALS = [
  { dx: '-4.5rem', dy: '-5.5rem', spin: '120deg', kind: 'petal' as const, i: 0 },
  { dx: '3.8rem', dy: '-5.2rem', spin: '-90deg', kind: 'petal' as const, i: 1 },
  { dx: '-5.2rem', dy: '-1.2rem', spin: '60deg', kind: 'petal' as const, i: 2 },
  { dx: '5rem', dy: '-0.5rem', spin: '-140deg', kind: 'petal' as const, i: 3 },
  { dx: '-3.2rem', dy: '3.8rem', spin: '200deg', kind: 'petal' as const, i: 4 },
  { dx: '2.8rem', dy: '4.2rem', spin: '-40deg', kind: 'petal' as const, i: 5 },
  { dx: '0.2rem', dy: '-6rem', spin: '30deg', kind: 'petal' as const, i: 6 },
  { dx: '-1.5rem', dy: '5.2rem', spin: '-170deg', kind: 'spark' as const, i: 7 },
  { dx: '4.5rem', dy: '2.2rem', spin: '80deg', kind: 'spark' as const, i: 8 },
  { dx: '-4.8rem', dy: '1.8rem', spin: '-20deg', kind: 'spark' as const, i: 9 },
  { dx: '1.2rem', dy: '-3.5rem', spin: '150deg', kind: 'petal' as const, i: 10 },
  { dx: '-0.5rem', dy: '2.8rem', spin: '-100deg', kind: 'spark' as const, i: 11 },
]

export function PetalBurst({ active }: Props) {
  const { colors } = useTheme()
  const reduced = usePrefersReducedMotion()
  const [token, setToken] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!active || reduced) {
      setVisible(false)
      return
    }
    setToken((n) => n + 1)
    setVisible(true)
    const id = window.setTimeout(() => setVisible(false), BURST_MS)
    return () => window.clearTimeout(id)
  }, [active, reduced])

  if (!visible || reduced) return null

  const petalColors = [colors.flowerPink, colors.flowerYellow, colors.flowerCoral, colors.mint]

  return (
    <Layer aria-hidden="true" key={token}>
      {PETALS.map((p) => {
        const style = {
          ['--dx' as string]: p.dx,
          ['--dy' as string]: p.dy,
          ['--spin' as string]: p.spin,
          ['--petal' as string]: petalColors[p.i % petalColors.length],
          animationDelay: `${(p.i % 4) * 20}ms`,
        } as CSSProperties
        return p.kind === 'spark' ? (
          <Spark key={p.i} style={style} />
        ) : (
          <Petal key={p.i} style={style} />
        )
      })}
    </Layer>
  )
}
