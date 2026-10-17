import { render, screen } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { act } from 'react'
import { beforeAll, describe, expect, it } from 'vitest'
import { i18n, initI18n } from '../i18n'
import { theme } from '../styles/theme'
import { PromptBanner } from './PromptBanner'

describe('PromptBanner', () => {
  beforeAll(async () => {
    await initI18n()
  })

  it.each(['en', 'es', 'fr', 'it', 'de', 'pt', 'zh-CN'])(
    'set prompt always includes digits (%s)',
    async (lng) => {
      await act(() => i18n.changeLanguage(lng))
      render(
        <ThemeProvider theme={theme}>
          <PromptBanner
            prompt={{
              kind: 'set',
              target: { hours: 4, minutes: 23 },
              snapStep: 1,
              labelStyle: 'digits',
            }}
          />
        </ThemeProvider>,
      )
      expect(screen.getByText(/4:23/)).toBeInTheDocument()
      await act(() => i18n.changeLanguage('en'))
    },
  )

  it('set prompt can lead with a spoken phrase and still show digits', async () => {
    await act(() => i18n.changeLanguage('en'))
    render(
      <ThemeProvider theme={theme}>
        <PromptBanner
          prompt={{
            kind: 'set',
            target: { hours: 5, minutes: 15 },
            snapStep: 15,
            labelStyle: 'phrase',
          }}
        />
      </ThemeProvider>,
    )
    expect(screen.getByText(/a quarter past 5/i)).toBeInTheDocument()
    expect(screen.getByText('5:15')).toBeInTheDocument()
  })

  it('syncs document lang on language change', async () => {
    await act(() => i18n.changeLanguage('fr'))
    expect(document.documentElement.lang).toBe('fr')
    await act(() => i18n.changeLanguage('en'))
  })
})
