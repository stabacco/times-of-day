import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { formatTimeLabel, formatTimeSecondary } from '../i18n/formatTime'
import type { Prompt } from '../game/types'

const Banner = styled.div`
  margin: 0;
  flex: 1 1 auto;
  min-width: 0;
  max-width: 100%;
  text-align: center;
  font-family: ${({ theme }) => theme.fonts.display};
  font-weight: 600;
  font-size: clamp(1.05rem, 3.2vh, 1.75rem);
  line-height: 1.2;
  color: ${({ theme }) => theme.colors.ink};

  @media (max-height: 560px) {
    font-size: clamp(0.95rem, 2.8vh, 1.25rem);
  }
`

const Line = styled.p`
  margin: 0;
`

const Secondary = styled.p`
  margin: 0.15rem 0 0;
  font-size: 0.65em;
  font-weight: 500;
  opacity: 0.8;
`

export function PromptBanner({ prompt }: { prompt: Prompt }) {
  const { t, i18n } = useTranslation()
  if (prompt.kind === 'read') {
    return (
      <Banner aria-live="polite">
        <Line>{t('prompt.read')}</Line>
      </Banner>
    )
  }

  const locale = i18n.resolvedLanguage ?? i18n.language
  const opts = { style: prompt.labelStyle, period: prompt.period, locale }
  const primary = formatTimeLabel(prompt.target, opts)
  const secondary = formatTimeSecondary(prompt.target, opts)

  return (
    <Banner aria-live="polite">
      <Line>{t('prompt.set', { time: primary })}</Line>
      {secondary && <Secondary>{secondary}</Secondary>}
    </Banner>
  )
}
