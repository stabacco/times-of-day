import { useState } from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { Brand } from './components/Brand'
import { ProgressStrip } from './components/ProgressStrip'
import { SUPPORTED_LNGS } from './i18n'

const LANGUAGE_LABELS: Record<(typeof SUPPORTED_LNGS)[number], string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  it: 'Italiano',
  de: 'Deutsch',
  pt: 'Português',
  'zh-CN': '简体中文',
}

const LANGUAGES = SUPPORTED_LNGS.map((code) => ({
  code,
  label: LANGUAGE_LABELS[code],
}))

const Shell = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  min-height: 100vh;
  padding: 1.5rem 1rem 3rem;
`

const Placeholder = styled.section`
  width: 100%;
  max-width: 720px;
  padding: 3rem 1rem;
  text-align: center;
  border-radius: ${({ theme }) => theme.radii.button};
  background: ${({ theme }) => theme.colors.white};
  border: 2px dashed ${({ theme }) => theme.colors.mint};
  color: ${({ theme }) => theme.colors.inkMuted};
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 1.25rem;
`

function resolveLng(lng: string | undefined): string {
  if (!lng) return 'en'
  const exact = SUPPORTED_LNGS.find((c) => c === lng)
  if (exact) return exact
  const base = lng.split('-')[0]
  return SUPPORTED_LNGS.find((c) => c === base) ?? 'en'
}

function App() {
  const { t, i18n } = useTranslation()
  const [muted, setMuted] = useState(false)

  return (
    <Shell>
      <ProgressStrip
        stageLabel={t('stages.hours')}
        stars={0}
        muted={muted}
        onToggleMute={() => setMuted((m) => !m)}
        languages={LANGUAGES}
        currentLng={resolveLng(i18n.resolvedLanguage ?? i18n.language)}
        onChangeLng={(code) => void i18n.changeLanguage(code)}
      />
      <Brand />
      <Placeholder>{t('prompt.read')}</Placeholder>
    </Shell>
  )
}

export default App
