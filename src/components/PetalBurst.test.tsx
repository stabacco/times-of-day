import { act, render } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { theme } from '../styles/theme'
import { PetalBurst } from './PetalBurst'

describe('PetalBurst', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders petals when active', () => {
    vi.useFakeTimers()
    const { container, rerender } = render(
      <ThemeProvider theme={theme}>
        <PetalBurst active={false} />
      </ThemeProvider>,
    )
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull()

    rerender(
      <ThemeProvider theme={theme}>
        <PetalBurst active />
      </ThemeProvider>,
    )
    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy()

    act(() => {
      vi.advanceTimersByTime(800)
    })
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull()
  })
})
