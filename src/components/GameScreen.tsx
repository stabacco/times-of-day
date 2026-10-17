import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { useGameSession } from '../hooks/useGameSession'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { normalizeTime } from '../clock/time'
import { stageLabelKey } from '../game/stages'
import { SUPPORTED_LNGS } from '../i18n'
import { AnswerChoices } from './AnswerChoices'
import { Brand } from './Brand'
import { ClockFace } from './ClockFace'
import { FeedbackFlash } from './FeedbackFlash'
import { ProgressStrip } from './ProgressStrip'
import { PromptBanner } from './PromptBanner'
import { SetCheckButton } from './SetCheckButton'

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
  gap: 1.25rem;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  padding: 1rem 1rem 2.5rem;
`

const Controls = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`

function resolveLng(lng: string | undefined): string {
  if (!lng) return 'en'
  const exact = SUPPORTED_LNGS.find((c) => c === lng)
  if (exact) return exact
  const base = lng.split('-')[0]
  return SUPPORTED_LNGS.find((c) => c === base) ?? 'en'
}

export function GameScreen() {
  const { t, i18n } = useTranslation()
  const reducedMotion = usePrefersReducedMotion()
  const {
    session,
    prompt,
    draftTime,
    feedback,
    lastChoice,
    setDraftTime,
    selectOption,
    checkSet,
    toggleMute,
    dismissFeedbackAndContinue,
  } = useGameSession()

  const isSet = prompt.kind === 'set'
  const locked = feedback !== null
  // Read mode shows the target on the clock; set mode shows the player's hands,
  // revealing the answer once feedback appears.
  const clockTime = isSet && !locked ? draftTime : prompt.target

  return (
    <Shell>
      <ProgressStrip
        stageLabel={t(stageLabelKey(session.stage))}
        stars={session.totalStars}
        muted={session.muted}
        bloom={feedback?.kind === 'unlock' && !reducedMotion}
        onToggleMute={toggleMute}
        languages={LANGUAGES}
        currentLng={resolveLng(i18n.resolvedLanguage ?? i18n.language)}
        onChangeLng={(code) => void i18n.changeLanguage(code)}
      />
      <Brand />
      <PromptBanner prompt={prompt} />
      <ClockFace
        time={clockTime}
        interactive={isSet && !locked}
        snapStep={prompt.snapStep}
        hintHour={prompt.showHint ? normalizeTime(prompt.target).hours : null}
        animateHands={!reducedMotion}
        ariaLabel={!isSet && !locked ? t('a11y.clock') : undefined}
        onChange={setDraftTime}
      />
      <Controls>
        {isSet ? (
          <SetCheckButton disabled={locked} onCheck={checkSet} />
        ) : (
          <AnswerChoices
            options={prompt.options ?? []}
            target={prompt.target}
            chosen={lastChoice}
            disabled={locked}
            onSelect={selectOption}
          />
        )}
      </Controls>
      <FeedbackFlash feedback={feedback} onDismiss={dismissFeedbackAndContinue} />
    </Shell>
  )
}
