import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { useGameSession } from '../hooks/useGameSession'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { normalizeTime } from '../clock/time'
import { SUPPORTED_LNGS } from '../i18n'
import { AnswerChoices } from './AnswerChoices'
import { Brand } from './Brand'
import { ClockFace } from './ClockFace'
import { DayPeriodCue } from './DayPeriodCue'
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
  align-items: stretch;
  gap: 0.45rem;
  width: 100%;
  max-width: 480px;
  height: 100vh;
  height: 100dvh;
  max-height: 100vh;
  max-height: 100dvh;
  margin: 0 auto;
  padding: 0.45rem 0.75rem calc(0.45rem + env(safe-area-inset-bottom, 0px));
  overflow: hidden;

  @media (max-height: 560px) {
    gap: 0.3rem;
    padding: 0.3rem 0.5rem calc(0.3rem + env(safe-area-inset-bottom, 0px));
  }
`

const PromptRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex: 0 0 auto;
  width: 100%;
  min-height: 0;
`

const ClockSlot = styled.div`
  flex: 1 1 0;
  min-height: 0;
  min-width: 0;
  display: grid;
  place-items: center;
  width: 100%;
`

const Controls = styled.div`
  display: flex;
  justify-content: center;
  flex: 0 0 auto;
  width: 100%;
  min-height: 0;
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
    selectStage,
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
        stage={session.stage}
        starsInStage={session.starsInStage}
        muted={session.muted}
        bloom={feedback?.kind === 'unlock' && !reducedMotion}
        onToggleMute={toggleMute}
        onSelectStage={selectStage}
        languages={LANGUAGES}
        currentLng={resolveLng(i18n.resolvedLanguage ?? i18n.language)}
        onChangeLng={(code) => void i18n.changeLanguage(code)}
      />
      <Brand />
      <PromptRow>
        <DayPeriodCue
          period={prompt.period}
          time={prompt.target}
          labelStyle={prompt.labelStyle}
        />
        <PromptBanner prompt={prompt} />
      </PromptRow>
      <ClockSlot>
        <ClockFace
          time={clockTime}
          interactive={isSet && !locked}
          snapStep={prompt.snapStep}
          hintHour={prompt.showHint ? normalizeTime(prompt.target).hours : null}
          animateHands={!reducedMotion}
          ariaLabel={!isSet && !locked ? t('a11y.clock') : undefined}
          onChange={setDraftTime}
        />
      </ClockSlot>
      <Controls>
        {isSet ? (
          <SetCheckButton disabled={locked} onCheck={checkSet} />
        ) : (
          <AnswerChoices
            options={prompt.options ?? []}
            target={prompt.target}
            chosen={lastChoice}
            disabled={locked}
            labelStyle={prompt.labelStyle}
            period={prompt.period}
            onSelect={selectOption}
          />
        )}
      </Controls>
      <FeedbackFlash feedback={feedback} onDismiss={dismissFeedbackAndContinue} />
    </Shell>
  )
}
