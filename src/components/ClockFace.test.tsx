import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { ClockFace, pointerEventToTime } from './ClockFace'
import { theme } from '../styles/theme'

const rect = {
  left: 0,
  top: 0,
  width: 200,
  height: 200,
  right: 200,
  bottom: 200,
  x: 0,
  y: 0,
  toJSON: () => ({}),
} as DOMRect

describe('pointerEventToTime', () => {
  it('drags minute hand to 6 -> :30', () => {
    const t = pointerEventToTime(100, 200, rect, 5, 'minute', { hours: 3, minutes: 0 })
    expect(t).toEqual({ hours: 3, minutes: 30 })
  })

  it('snaps minutes to step', () => {
    // angle ~ 93deg -> 15.5 min -> snaps to 15
    const t = pointerEventToTime(200, 95, rect, 5, 'minute', { hours: 3, minutes: 0 })
    expect(t).toEqual({ hours: 3, minutes: 15 })
  })

  it('advances hour when minute hand crosses 12 clockwise', () => {
    const t = pointerEventToTime(105, 0, rect, 5, 'minute', { hours: 3, minutes: 55 })
    expect(t).toEqual({ hours: 4, minutes: 0 })
  })

  it('rewinds hour when minute hand crosses 12 counter-clockwise', () => {
    const t = pointerEventToTime(70, 0, rect, 5, 'minute', { hours: 4, minutes: 0 })
    expect(t).toEqual({ hours: 3, minutes: 55 })
  })

  it('wraps 12 -> 1 across the top', () => {
    const t = pointerEventToTime(105, 0, rect, 5, 'minute', { hours: 12, minutes: 55 })
    expect(t).toEqual({ hours: 1, minutes: 0 })
  })

  // Pointer positions on the face (rect 200x200, center 100,100) by minute-hand angle.
  const at = (deg: number): [number, number] => {
    const r = (deg * Math.PI) / 180
    return [100 + 80 * Math.sin(r), 100 - 80 * Math.cos(r)]
  }

  it('carries hour forward across 12 with snap 30 (:30 -> :00)', () => {
    const [x, y] = at(350)
    expect(pointerEventToTime(x, y, rect, 30, 'minute', { hours: 3, minutes: 30 })).toEqual({ hours: 4, minutes: 0 })
  })

  it('carries hour forward across 12 with snap 15 (:45 -> :00)', () => {
    const [x, y] = at(5)
    expect(pointerEventToTime(x, y, rect, 15, 'minute', { hours: 3, minutes: 45 })).toEqual({ hours: 4, minutes: 0 })
  })

  it('carries hour forward across noon with snap 30 and 15', () => {
    const a = at(350)
    expect(pointerEventToTime(a[0], a[1], rect, 30, 'minute', { hours: 11, minutes: 30 })).toEqual({ hours: 12, minutes: 0 })
    const b = at(5)
    expect(pointerEventToTime(b[0], b[1], rect, 15, 'minute', { hours: 12, minutes: 45 })).toEqual({ hours: 1, minutes: 0 })
  })

  it('carries hour backward across 12 with snap 30 and 15', () => {
    const a = at(190)
    expect(pointerEventToTime(a[0], a[1], rect, 30, 'minute', { hours: 4, minutes: 0 })).toEqual({ hours: 3, minutes: 30 })
    const b = at(280)
    expect(pointerEventToTime(b[0], b[1], rect, 15, 'minute', { hours: 1, minutes: 0 })).toEqual({ hours: 12, minutes: 45 })
  })

  it('does not carry when moving within the hour (snap 30, :00 -> :30)', () => {
    const [x, y] = at(170)
    expect(pointerEventToTime(x, y, rect, 30, 'minute', { hours: 3, minutes: 0 })).toEqual({ hours: 3, minutes: 30 })
  })

  it('drags hour hand to 9 keeping minutes', () => {
    const t = pointerEventToTime(0, 100, rect, 5, 'hour', { hours: 3, minutes: 0 })
    expect(t).toEqual({ hours: 9, minutes: 0 })
  })

  it('hour drag accounts for minute offset', () => {
    // 3:30 hour hand sits at 105deg; pointing there keeps hour 3
    const rad = (105 * Math.PI) / 180
    const t = pointerEventToTime(
      100 + 50 * Math.sin(rad),
      100 - 50 * Math.cos(rad),
      rect,
      5,
      'hour',
      { hours: 6, minutes: 30 },
    )
    expect(t).toEqual({ hours: 3, minutes: 30 })
  })

  it('maps top to hour 12', () => {
    const t = pointerEventToTime(100, 0, rect, 5, 'hour', { hours: 3, minutes: 0 })
    expect(t).toEqual({ hours: 12, minutes: 0 })
  })
})

function renderFace(props: Partial<React.ComponentProps<typeof ClockFace>> = {}) {
  const onChange = vi.fn()
  const utils = render(
    <ThemeProvider theme={theme}>
      <ClockFace
        time={{ hours: 3, minutes: 0 }}
        interactive={false}
        snapStep={5}
        onChange={onChange}
        {...props}
      />
    </ThemeProvider>,
  )
  return { onChange, ...utils }
}

describe('ClockFace', () => {
  it('renders accessible img with digital time label', () => {
    renderFace()
    expect(screen.getByRole('img', { name: '3:00' })).toBeInTheDocument()
  })

  it('renders numerals 1-12 and 12 ticks', () => {
    const { container } = renderFace()
    for (let n = 1; n <= 12; n++) {
      expect(screen.getByText(String(n))).toBeInTheDocument()
    }
    expect(container.querySelectorAll('[data-tick]')).toHaveLength(12)
  })

  it('renders hour and minute hands with theme colors', () => {
    const { container } = renderFace()
    expect(container.querySelector('[data-hand="hour"]')).toHaveAttribute('stroke', theme.colors.hourHand)
    expect(container.querySelector('[data-hand="minute"]')).toHaveAttribute('stroke', theme.colors.minuteHand)
  })

  it('rotates hands per angle helpers', () => {
    const { container } = renderFace({ time: { hours: 3, minutes: 30 } })
    const hour = container.querySelector('[data-hand-group="hour"]') as HTMLElement
    const minute = container.querySelector('[data-hand-group="minute"]') as HTMLElement
    expect(hour.style.transform).toBe('rotate(105deg)')
    expect(minute.style.transform).toBe('rotate(180deg)')
  })

  it('does not call onChange when not interactive', () => {
    const { onChange } = renderFace({ interactive: false })
    const svg = screen.getByRole('img')
    svg.getBoundingClientRect = () => rect
    fireEvent.pointerDown(svg, { clientX: 100, clientY: 200, pointerId: 1 })
    fireEvent.pointerMove(svg, { clientX: 100, clientY: 200, pointerId: 1 })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('drag on minute hand calls onChange toward 3:30 when interactive', () => {
    const { onChange } = renderFace({ interactive: true })
    const svg = screen.getByRole('img')
    svg.getBoundingClientRect = () => rect
    // minute hand at 3:00 points to 12 (top); grab near its tip
    fireEvent.pointerDown(svg, { clientX: 100, clientY: 20, pointerId: 1 })
    fireEvent.pointerMove(svg, { clientX: 100, clientY: 200, pointerId: 1 })
    fireEvent.pointerUp(svg, { clientX: 100, clientY: 200, pointerId: 1 })
    expect(onChange).toHaveBeenLastCalledWith({ hours: 3, minutes: 30 })
  })

  it('grabbing near the short hour hand drags the hour', () => {
    const { onChange } = renderFace({ interactive: true })
    const svg = screen.getByRole('img')
    svg.getBoundingClientRect = () => rect
    // hour hand at 3:00 points right (90deg), short; grab at ~35 units from center
    fireEvent.pointerDown(svg, { clientX: 135, clientY: 100, pointerId: 1 })
    fireEvent.pointerMove(svg, { clientX: 0, clientY: 100, pointerId: 1 })
    expect(onChange).toHaveBeenLastCalledWith({ hours: 9, minutes: 0 })
  })

  it('disables hand transition while dragging', () => {
    const { container } = renderFace({ interactive: true, animateHands: true })
    const svg = screen.getByRole('img')
    svg.getBoundingClientRect = () => rect
    const group = () => container.querySelector('[data-hand-group="minute"]') as HTMLElement
    expect(getComputedStyle(group()).transition).toContain('transform')
    fireEvent.pointerDown(svg, { clientX: 100, clientY: 20, pointerId: 1 })
    expect(getComputedStyle(group()).transition).not.toContain('transform')
    fireEvent.pointerUp(svg, { clientX: 100, clientY: 20, pointerId: 1 })
    expect(getComputedStyle(group()).transition).toContain('transform')
  })

  it('stops dragging after pointer up', () => {
    const { onChange } = renderFace({ interactive: true })
    const svg = screen.getByRole('img')
    svg.getBoundingClientRect = () => rect
    fireEvent.pointerDown(svg, { clientX: 100, clientY: 20, pointerId: 1 })
    fireEvent.pointerUp(svg, { clientX: 100, clientY: 20, pointerId: 1 })
    onChange.mockClear()
    fireEvent.pointerMove(svg, { clientX: 100, clientY: 200, pointerId: 1 })
    expect(onChange).not.toHaveBeenCalled()
  })
})
