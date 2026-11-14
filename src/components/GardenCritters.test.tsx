import { render } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { describe, expect, it } from 'vitest'
import { theme } from '../styles/theme'
import { GardenCritters } from './GardenCritters'

describe('GardenCritters', () => {
  it('shows day critters by default', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <GardenCritters />
      </ThemeProvider>,
    )
    expect(container.firstElementChild).toHaveAttribute('data-critters', 'day')
  })

  it('shows night fireflies when night', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <GardenCritters night />
      </ThemeProvider>,
    )
    expect(container.firstElementChild).toHaveAttribute('data-critters', 'night')
  })
})
