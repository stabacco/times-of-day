import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { formatTimePhrase } from '../i18n/formatTime'
import type { Prompt } from '../game/types'

const Banner = styled.p`
  margin: 0;
  max-width: 720px;
  text-align: center;
  font-family: ${({ theme }) => theme.fonts.display};
  font-weight: 600;
  font-size: clamp(1.4rem, 5vw, 2.1rem);
  line-height: 1.25;
  color: ${({ theme }) => theme.colors.ink};
`

export function PromptBanner({ prompt }: { prompt: Prompt }) {
  const { t, i18n } = useTranslation()
  const text =
    prompt.kind === 'read'
      ? t('prompt.read')
      : t('prompt.set', { time: formatTimePhrase(prompt.target, i18n.language) })
  return <Banner aria-live="polite">{text}</Banner>
}
