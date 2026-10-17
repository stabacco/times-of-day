import { useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import styled, { css, useTheme } from 'styled-components'
import { angleToHours, hoursToAngle, minutesToAngle } from '../clock/angles'
import { normalizeTime, timeToDigits } from '../clock/time'
import type { ClockTime } from '../clock/time'

export type ClockFaceProps = {
  time: ClockTime
  interactive: boolean
  snapStep: number
  /** Hour numeral (1–12) to emphasise; independent of the hand positions. */
  hintHour?: number | null
  animateHands?: boolean
  /** Overrides the accessible name (defaults to the digital time). */
  ariaLabel?: string
  onChange?: (time: ClockTime) => void
}

type Hand = 'hour' | 'minute'

const VIEW = 200
const C = VIEW / 2
const FACE_R = 92
const HOUR_LEN = 50
const MINUTE_LEN = 75

/** Angle in degrees, clockwise from 12 o'clock, in [0, 360). */
function pointerAngle(clientX: number, clientY: number, rect: DOMRect): number {
  const dx = clientX - (rect.left + rect.width / 2)
  const dy = clientY - (rect.top + rect.height / 2)
  const deg = (Math.atan2(dx, -dy) * 180) / Math.PI
  return ((deg % 360) + 360) % 360
}

/** Shortest signed rotation in degrees, in (-180, 180]; exact opposite ties go clockwise. */
function signedDelta(deg: number): number {
  const d = ((deg % 360) + 360) % 360
  return d > 180 ? d - 360 : d
}

export function pointerEventToTime(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  snapStep: number,
  dragging: 'hour' | 'minute',
  current: ClockTime,
): ClockTime {
  const angle = pointerAngle(clientX, clientY, rect)
  if (dragging === 'hour') {
    return normalizeTime({
      hours: angleToHours(angle, current.minutes),
      minutes: current.minutes,
    })
  }
  // Signed shortest delta (degrees) from the previous hand position to the pointer.
  const prevAngle = minutesToAngle(current.minutes)
  const deltaDeg = signedDelta(angle - prevAngle)
  // Unwrapped minutes may fall outside [0, 60): that signals a carry across 12.
  const unwrapped = current.minutes + deltaDeg / 6
  const step = snapStep > 0 ? snapStep : 1
  const snapped = Math.round(unwrapped / step) * step
  const carry = Math.floor(snapped / 60)
  const minutes = ((snapped % 60) + 60) % 60
  return normalizeTime({ hours: current.hours + carry, minutes })
}

/** Shortest-path rotation: keeps an unwrapped angle so CSS transitions never spin the long way. */
function useContinuousAngle(target: number): number {
  const ref = useRef(target)
  const delta = signedDelta(target - ref.current)
  ref.current = ref.current + delta
  return ref.current
}

function angularDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360
  return d > 180 ? 360 - d : d
}

/** Choose which hand a press should grab: minute-priority except near the short hour hand. */
function pickHand(clientX: number, clientY: number, rect: DOMRect, time: ClockTime): Hand {
  const angle = pointerAngle(clientX, clientY, rect)
  const scale = VIEW / rect.width
  const dist =
    Math.hypot(
      clientX - (rect.left + rect.width / 2),
      clientY - (rect.top + rect.height / 2),
    ) * scale
  const dm = angularDistance(angle, minutesToAngle(time.minutes))
  const dh = angularDistance(angle, hoursToAngle(time.hours, time.minutes))
  if (dist > HOUR_LEN + 8) return 'minute'
  // Minute-priority bias: hour only wins if clearly closer.
  return dh + 10 < dm ? 'hour' : 'minute'
}

const Wrapper = styled.div`
  width: 100%;
  min-width: min(70vw, 320px);
  max-width: 420px;
  margin: 0 auto;
  aspect-ratio: 1;
`

const Svg = styled.svg<{ $interactive: boolean }>`
  display: block;
  width: 100%;
  height: 100%;
  touch-action: ${({ $interactive }) => ($interactive ? 'none' : 'auto')};
  cursor: ${({ $interactive }) => ($interactive ? 'grab' : 'default')};
  user-select: none;
  -webkit-user-select: none;
`

const HandGroup = styled.g<{ $animate: boolean }>`
  transform-origin: ${C}px ${C}px;
  ${({ $animate }) =>
    $animate &&
    css`
      transition: transform 0.6s ease-in-out;
      @media (prefers-reduced-motion: reduce) {
        transition: none;
      }
    `}
`

const Numeral = styled.text<{ $hint: boolean }>`
  font-family: ${({ theme }) => theme.fonts.display};
  font-weight: 600;
  font-size: 14px;
  text-anchor: middle;
  dominant-baseline: central;
  fill: ${({ theme, $hint }) => ($hint ? theme.colors.hourHand : theme.colors.ink)};
  ${({ $hint }) => $hint && 'font-size: 18px; font-weight: 700;'}
  pointer-events: none;
`

export function ClockFace({
  time,
  interactive,
  snapStep,
  hintHour = null,
  animateHands = false,
  ariaLabel,
  onChange,
}: ClockFaceProps) {
  const { colors } = useTheme()
  const svgRef = useRef<SVGSVGElement>(null)
  const [dragging, setDragging] = useState<Hand | null>(null)
  const draggingRef = useRef<Hand | null>(null)
  const timeRef = useRef(time)
  timeRef.current = time

  const n = normalizeTime(time)
  const hourAngle = hoursToAngle(n.hours, n.minutes)
  const minuteAngle = minutesToAngle(n.minutes)
  const hourRotation = useContinuousAngle(hourAngle)
  const minuteRotation = useContinuousAngle(minuteAngle)
  const animate = animateHands && !dragging

  const handlePointerDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (!interactive) return
    const rect = e.currentTarget.getBoundingClientRect()
    const hand = pickHand(e.clientX, e.clientY, rect, timeRef.current)
    draggingRef.current = hand
    setDragging(hand)
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId)
    } catch {
      // pointer may be synthetic; capture is best-effort
    }
  }

  const handlePointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    const hand = draggingRef.current
    if (!interactive || !hand) return
    const rect = e.currentTarget.getBoundingClientRect()
    const next = pointerEventToTime(e.clientX, e.clientY, rect, snapStep, hand, timeRef.current)
    timeRef.current = next
    onChange?.(next)
  }

  const endDrag = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (!draggingRef.current) return
    draggingRef.current = null
    setDragging(null)
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId)
    } catch {
      // ignore
    }
  }

  const ticks = Array.from({ length: 12 }, (_, i) => i)

  return (
    <Wrapper>
      <Svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        role="img"
        aria-label={ariaLabel ?? timeToDigits(time)}
        $interactive={interactive}
        data-dragging={dragging ?? undefined}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <circle cx={C} cy={C} r={FACE_R} fill={colors.clockFace} stroke={colors.clockRim} strokeWidth={6} />
        {ticks.map((i) => (
          <line
            key={i}
            data-tick
            x1={C}
            y1={C - FACE_R + 4}
            x2={C}
            y2={C - FACE_R + 12}
            stroke={colors.clockRim}
            strokeWidth={3}
            strokeLinecap="round"
            transform={`rotate(${i * 30} ${C} ${C})`}
          />
        ))}
        {ticks.map((i) => {
          const num = i === 0 ? 12 : i
          const rad = (i * 30 * Math.PI) / 180
          const r = FACE_R - 26
          return (
            <Numeral
              key={num}
              x={C + r * Math.sin(rad)}
              y={C - r * Math.cos(rad)}
              $hint={hintHour === num}
            >
              {num}
            </Numeral>
          )
        })}
        <HandGroup
          $animate={animate}
          data-hand-group="hour"
          style={{ transform: `rotate(${hourRotation}deg)` }}
        >
          <line
            data-hand="hour"
            x1={C}
            y1={C}
            x2={C}
            y2={C - HOUR_LEN}
            stroke={colors.hourHand}
            strokeWidth={8}
            strokeLinecap="round"
          />
        </HandGroup>
        <HandGroup
          $animate={animate}
          data-hand-group="minute"
          style={{ transform: `rotate(${minuteRotation}deg)` }}
        >
          <line
            data-hand="minute"
            x1={C}
            y1={C}
            x2={C}
            y2={C - MINUTE_LEN}
            stroke={colors.minuteHand}
            strokeWidth={5}
            strokeLinecap="round"
          />
        </HandGroup>
        <circle cx={C} cy={C} r={7} fill={colors.minuteHand} />
      </Svg>
    </Wrapper>
  )
}
