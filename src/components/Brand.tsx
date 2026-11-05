import styled from 'styled-components'
import { useTranslation } from 'react-i18next'

const Wordmark = styled.h1`
  margin: 0;
  flex: 0 0 auto;
  font-family: ${({ theme }) => theme.fonts.display};
  font-weight: 700;
  font-size: clamp(1.5rem, 4.5vh, 2.75rem);
  line-height: 1.05;
  letter-spacing: 0.01em;
  text-align: center;
  color: ${({ theme }) => theme.colors.ink};
  text-shadow: 0 2px 0 ${({ theme }) => theme.colors.mint};

  @media (max-height: 560px) {
    font-size: clamp(1.25rem, 3.5vh, 1.75rem);
    text-shadow: none;
  }
`

export function Brand() {
  const { t } = useTranslation()
  return <Wordmark>{t('brand')}</Wordmark>
}
