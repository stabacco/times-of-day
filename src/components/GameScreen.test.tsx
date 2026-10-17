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
    // Read mode must not leak the answer via the accessible name; set mode shows the draft time.
    expect(
      screen.getByRole('img', { name: /^(Analog clock|\d+:\d\d)$/ }),
    ).toBeInTheDocument()

    expect(screen.getByRole('combobox', { name: /stage/i })).toBeInTheDocument()
    const progress = screen.getByRole('img', { name: /stars/i })
    expect(progress).toHaveTextContent('0/8')

    const user = userEvent.setup()
    const check = screen.queryByRole('button', { name: /check/i })
    if (check) {
      await user.click(check)
    } else {
      // Read choices may be digits ("3:00") or phrases ("a quarter past 5").
      const choices = screen
        .getAllByRole('button')
        .filter((b) => !/mute|unmute|sound|language/i.test(b.getAttribute('aria-label') ?? ''))
        .filter((b) => b.getAttribute('aria-pressed') === null)
      expect(choices.length).toBeGreaterThan(0)
      await user.click(choices[0])
    }
    expect(screen.getByRole('status')).not.toBeEmptyDOMElement()

    await act(() => i18n.changeLanguage('zh-CN'))
    expect(screen.getByRole('status')).not.toBeEmptyDOMElement()
    await act(() => i18n.changeLanguage('en'))
  })

  it('lets the player jump to another stage', async () => {
    render(
      <ThemeProvider theme={theme}>
        <GameScreen />
      </ThemeProvider>,
    )
    const user = userEvent.setup()
    const stage = screen.getByRole('combobox', { name: /stage/i })
    await user.selectOptions(stage, 'half')
    expect(stage).toHaveValue('half')
    expect(screen.getByRole('img', { name: /stars/i })).toHaveTextContent('0/8')
  })
})
