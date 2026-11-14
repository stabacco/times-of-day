import { render } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { describe, expect, it } from 'vitest'
import { theme } from '../styles/theme'
import { GardenBackdrop } from './GardenBackdrop'

describe('GardenBackdrop', () => {
  it('renders a decorative layer', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <GardenBackdrop />
      </ThemeProvider>,
    )
    const layer = container.firstElementChild
    expect(layer).toHaveAttribute('aria-hidden', 'true')
    expect(container.querySelector('svg')).toBeTruthy()
  })
})
