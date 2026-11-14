import styled from 'styled-components'
import { useTranslation } from 'react-i18next'

const Wordmark = styled.h1<{ $night: boolean }>`
  margin: 0;
  flex: 0 0 auto;
  font-family: ${({ theme }) => theme.fonts.display};
  font-weight: 700;
  font-size: clamp(1.5rem, 4.5vh, 2.75rem);
  line-height: 1.05;
  letter-spacing: 0.01em;
  text-align: center;
  color: ${({ theme, $night }) =>
    $night ? theme.colors.inkOnNight : theme.colors.ink};
  text-shadow: ${({ theme, $night }) =>
    $night
      ? '0 1px 3px rgba(8, 20, 36, 0.65), 0 0 16px rgba(8, 20, 36, 0.4)'
      : `0 2px 0 ${theme.colors.mint}`};

  @media (max-height: 560px) {
    font-size: clamp(1.25rem, 3.5vh, 1.75rem);
    text-shadow: ${({ $night }) =>
      $night ? '0 1px 2px rgba(8, 20, 36, 0.7)' : 'none'};
  }
`

export function Brand({ night = false }: { night?: boolean }) {
  const { t } = useTranslation()
  return <Wordmark $night={night}>{t('brand')}</Wordmark>
}
