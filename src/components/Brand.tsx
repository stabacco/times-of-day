import styled from 'styled-components'
import { useTranslation } from 'react-i18next'

const Wordmark = styled.h1`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.display};
  font-weight: 700;
  font-size: clamp(2.75rem, 9vw, 5rem);
  line-height: 1.05;
  letter-spacing: 0.01em;
  text-align: center;
  color: ${({ theme }) => theme.colors.ink};
  text-shadow: 0 3px 0 ${({ theme }) => theme.colors.mint};
`

export function Brand() {
  const { t } = useTranslation()
  return <Wordmark>{t('brand')}</Wordmark>
}
