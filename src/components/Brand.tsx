import styled from 'styled-components'
import { useTranslation } from 'react-i18next'

const Wordmark = styled.h1<{ $night: boolean }>`
  margin: 0;
  flex: 0 0 auto;
  /* One-line band so locale wordmarks can't shove the dial. */
  height: clamp(1.7rem, 5vh, 2.9rem);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${({ theme }) => theme.fonts.display};
  font-weight: 700;
  font-size: clamp(1.5rem, 4.5vh, 2.75rem);
  line-height: 1;
  letter-spacing: 0.01em;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
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
