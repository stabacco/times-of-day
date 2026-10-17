import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from 'styled-components'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { i18n, initI18n } from '../i18n'
import { theme } from '../styles/theme'
import { GameScreen } from './GameScreen'

vi.mock('../audio/sfx', () => ({ playSfx: vi.fn() }))

describe('GameScreen', () => {
  beforeAll(async () => {
    await initI18n()
  })

  it('renders strip, brand, clock and an input; language change keeps the session', async () => {
    render(
      <ThemeProvider theme={theme}>
        <GameScreen />
      </ThemeProvider>,
    )
    expect(screen.getByRole('heading', { name: /times of day/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /\d+:\d\d/ })).toBeInTheDocument()

    const stars = screen.getByRole('img', { name: /stars/i })
    expect(stars).toHaveTextContent('0')

    const user = userEvent.setup()
    const choices = screen.queryAllByRole('button', { name: /^\d+:\d\d$/ })
    if (choices.length > 0) {
      await user.click(choices[0])
    } else {
      await user.click(screen.getByRole('button', { name: /check/i }))
    }
    expect(screen.getByRole('status')).not.toBeEmptyDOMElement()

    await act(() => i18n.changeLanguage('zh-CN'))
    expect(screen.getByRole('status')).not.toBeEmptyDOMElement()
    await act(() => i18n.changeLanguage('en'))
  })
})
