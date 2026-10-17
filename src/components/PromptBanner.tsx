import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { timeToDigits } from '../clock/time'
import { formatTimePhrase } from '../i18n/formatTime'
import type { Prompt } from '../game/types'

const Banner = styled.div`
  margin: 0;
  max-width: 720px;
  text-align: center;
  font-family: ${({ theme }) => theme.fonts.display};
  font-weight: 600;
  font-size: clamp(1.4rem, 5vw, 2.1rem);
  line-height: 1.25;
  color: ${({ theme }) => theme.colors.ink};
`

const Line = styled.p`
  margin: 0;
`

const Secondary = styled.p`
  margin: 0.25rem 0 0;
  font-size: 0.6em;
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
  // Set prompts always lead with digits; the written phrase is secondary.
  const digits = timeToDigits(prompt.target)
  const phrase = formatTimePhrase(prompt.target, i18n.language)
  return (
    <Banner aria-live="polite">
      <Line>{t('prompt.set', { time: digits })}</Line>
      {phrase !== digits && <Secondary>{phrase}</Secondary>}
    </Banner>
  )
}
