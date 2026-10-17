# Times of Day Analog Clock SPA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a one-page React SPA that teaches kids (5–10) to read and set an analog clock, with hybrid adaptive stages, 7 languages, Garden calm visuals, and GitHub Pages deploy.

**Architecture:** Pure game logic (time math, stages, adaptive scoring, prompt engine) lives in testable TypeScript modules. React renders a single `GameScreen`: progress strip, brand, prompt, SVG clock, answer controls. i18next handles UI + time phrases; Web Audio synthesizes soft SFX. Vite builds static assets for GitHub Pages.

**Tech Stack:** React 18, TypeScript, Vite, styled-components, i18next, i18next-browser-languagedetector, react-i18next, Vitest, React Testing Library, yarn, GitHub Actions → Pages.

## Global Constraints

- One page only — no React Router modes or multi-route flows.
- Session-only progress — no `localStorage` / accounts for stars or stage.
- Soft SFX only — no speech synthesis.
- Package manager: yarn (not npm).
- Styling: styled-components (not raw unstyled divs / CSS modules).
- Visual direction: Garden calm (soft green gradient, leafy green clock rim, coral hour hand, deep green minute hand, mint correct state).
- Brand: **Times of Day** must be a hero-level wordmark on the first viewport.
- Locales v1: `en`, `es`, `fr`, `it`, `de`, `pt`, `zh-CN`.
- Digits always available as time display fallback alongside localized phrases.
- Honor `prefers-reduced-motion` for unlock/correct flourishes.
- Spec: `docs/superpowers/specs/2026-10-17-analog-clock-spa-design.md`.

---

## File structure

```
package.json
vite.config.ts
tsconfig.json
tsconfig.app.json
tsconfig.node.json
index.html
.github/workflows/deploy.yml
public/favicon.svg
src/
  main.tsx
  App.tsx
  vite-env.d.ts
  styles/
    theme.ts
    GlobalStyle.ts
  clock/
    time.ts              # ClockTime type, formatting helpers, generation
    angles.ts            # minute/hour ↔ degrees, snap
  game/
    types.ts             # StageId, Prompt, AdaptiveState, SessionState
    stages.ts            # stage order, legal times, unlock thresholds
    adaptive.ts          # recent accuracy window, difficulty level
    progress.ts          # stars, unlock evaluation
    promptEngine.ts      # next prompt + distractors
  i18n/
    index.ts
    formatTime.ts        # locale phrases + digit fallback
    locales/
      en.json
      es.json
      fr.json
      it.json
      de.json
      pt.json
      zh-CN.json
  audio/
    sfx.ts
  components/
    ProgressStrip.tsx
    Brand.tsx
    PromptBanner.tsx
    ClockFace.tsx
    AnswerChoices.tsx
    SetCheckButton.tsx
    FeedbackFlash.tsx
    GameScreen.tsx
  hooks/
    useGameSession.ts
    usePrefersReducedMotion.ts
src/clock/time.test.ts
src/clock/angles.test.ts
src/game/stages.test.ts
src/game/adaptive.test.ts
src/game/progress.test.ts
src/game/promptEngine.test.ts
src/i18n/formatTime.test.ts
src/components/ClockFace.test.tsx
```

---

### Task 1: Scaffold Vite React TypeScript app

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/vite-env.d.ts`, `public/favicon.svg`
- Modify: `.gitignore` (ensure `node_modules/`, `dist/` already present)

**Interfaces:**
- Consumes: none
- Produces: runnable Vite app; `yarn test` runs Vitest; `yarn build` outputs `dist/`

- [ ] **Step 1: Scaffold with Vite**

```bash
cd /Users/stefanotabacco/projects/personal/times-of-day
yarn create vite . --template react-ts
```

If the directory is non-empty (docs already present), create in a temp folder and move app files into the repo root, or manually write the Vite template files. Prefer keeping `docs/` and `.gitignore` intact.

- [ ] **Step 2: Install runtime and test dependencies**

```bash
yarn add styled-components i18next react-i18next i18next-browser-languagedetector
yarn add -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/styled-components happy-dom
```

- [ ] **Step 3: Configure Vitest in `vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/times-of-day/',
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})
```

Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
```

Add scripts to `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 4: Verify scaffold**

```bash
yarn test
yarn build
```

Expected: tests exit 0 (zero tests OK or placeholder); build writes `dist/`.

- [ ] **Step 5: Commit**

```bash
git add package.json yarn.lock vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json index.html src public
git commit -m "chore: scaffold Vite React TypeScript app with Vitest"
```

---

### Task 2: Clock time model and angles

**Files:**
- Create: `src/clock/time.ts`, `src/clock/angles.ts`, `src/clock/time.test.ts`, `src/clock/angles.test.ts`
- Test: `src/clock/time.test.ts`, `src/clock/angles.test.ts`

**Interfaces:**
- Consumes: none
- Produces:
  - `export type ClockTime = { hours: number; minutes: number }` // hours 1–12, minutes 0–59
  - `export function normalizeTime(t: ClockTime): ClockTime`
  - `export function timeEquals(a: ClockTime, b: ClockTime): boolean`
  - `export function timeToDigits(t: ClockTime): string` // `"3:00"`, `"3:05"`
  - `export function minutesToAngle(minutes: number): number` // 0–360, 0 at 12
  - `export function hoursToAngle(hours: number, minutes: number): number`
  - `export function angleToMinutes(angle: number, snap: number): number`
  - `export function angleToHours(angle: number, minutes: number): number`
  - `export function snapMinutes(minutes: number, step: number): number`

- [ ] **Step 1: Write failing tests**

```ts
// src/clock/time.test.ts
import { describe, it, expect } from 'vitest'
import { normalizeTime, timeEquals, timeToDigits } from './time'

describe('normalizeTime', () => {
  it('wraps hours into 1–12', () => {
    expect(normalizeTime({ hours: 0, minutes: 0 })).toEqual({ hours: 12, minutes: 0 })
    expect(normalizeTime({ hours: 13, minutes: 0 })).toEqual({ hours: 1, minutes: 0 })
  })
  it('wraps minutes into 0–59 and rolls hours', () => {
    expect(normalizeTime({ hours: 1, minutes: 60 })).toEqual({ hours: 2, minutes: 0 })
  })
})

describe('timeToDigits', () => {
  it('pads minutes', () => {
    expect(timeToDigits({ hours: 3, minutes: 5 })).toBe('3:05')
    expect(timeToDigits({ hours: 12, minutes: 0 })).toBe('12:00')
  })
})

describe('timeEquals', () => {
  it('compares normalized values', () => {
    expect(timeEquals({ hours: 12, minutes: 0 }, { hours: 0, minutes: 0 })).toBe(true)
  })
})
```

```ts
// src/clock/angles.test.ts
import { describe, it, expect } from 'vitest'
import { minutesToAngle, hoursToAngle, angleToMinutes, snapMinutes } from './angles'

describe('minutesToAngle', () => {
  it('maps 0 → 0 and 30 → 180', () => {
    expect(minutesToAngle(0)).toBe(0)
    expect(minutesToAngle(30)).toBe(180)
  })
})

describe('hoursToAngle', () => {
  it('includes minute contribution', () => {
    expect(hoursToAngle(3, 0)).toBe(90)
    expect(hoursToAngle(3, 30)).toBe(105)
  })
})

describe('snapMinutes', () => {
  it('snaps to step', () => {
    expect(snapMinutes(7, 5)).toBe(5)
    expect(snapMinutes(8, 5)).toBe(10)
  })
})

describe('angleToMinutes', () => {
  it('converts and snaps', () => {
    expect(angleToMinutes(180, 5)).toBe(30)
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
yarn test src/clock/time.test.ts src/clock/angles.test.ts
```

Expected: FAIL — modules not found / exports missing.

- [ ] **Step 3: Implement**

```ts
// src/clock/time.ts
export type ClockTime = { hours: number; minutes: number }

export function normalizeTime(t: ClockTime): ClockTime {
  let total = ((t.hours % 12) + 12) % 12 * 60 + t.minutes
  // treat 12 as 0 for arithmetic, then map 0 → 12 for display hours
  total = ((total % (12 * 60)) + 12 * 60) % (12 * 60)
  const hours24 = Math.floor(total / 60) // 0–11
  const minutes = total % 60
  return { hours: hours24 === 0 ? 12 : hours24, minutes }
}

export function timeEquals(a: ClockTime, b: ClockTime): boolean {
  const na = normalizeTime(a)
  const nb = normalizeTime(b)
  return na.hours === nb.hours && na.minutes === nb.minutes
}

export function timeToDigits(t: ClockTime): string {
  const n = normalizeTime(t)
  return `${n.hours}:${String(n.minutes).padStart(2, '0')}`
}
```

```ts
// src/clock/angles.ts
export function minutesToAngle(minutes: number): number {
  return ((minutes % 60) / 60) * 360
}

export function hoursToAngle(hours: number, minutes: number): number {
  const h = hours % 12
  return (h / 12) * 360 + (minutes / 60) * 30
}

export function snapMinutes(minutes: number, step: number): number {
  if (step <= 0) return ((minutes % 60) + 60) % 60
  const snapped = Math.round(minutes / step) * step
  return ((snapped % 60) + 60) % 60
}

export function angleToMinutes(angle: number, snap: number): number {
  const normalized = ((angle % 360) + 360) % 360
  const raw = (normalized / 360) * 60
  return snapMinutes(raw, snap)
}

export function angleToHours(angle: number, minutes: number): number {
  const normalized = ((angle % 360) + 360) % 360
  // remove minute contribution roughly: each hour is 30°, minutes add up to 30°
  const adjusted = normalized - (minutes / 60) * 30
  const h = Math.round((((adjusted % 360) + 360) % 360) / 30) % 12
  return h === 0 ? 12 : h
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
yarn test src/clock/time.test.ts src/clock/angles.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/clock
git commit -m "feat: add clock time model and hand angle helpers"
```

---

### Task 3: Stages and legal times

**Files:**
- Create: `src/game/types.ts`, `src/game/stages.ts`, `src/game/stages.test.ts`
- Test: `src/game/stages.test.ts`

**Interfaces:**
- Consumes: `ClockTime` from `src/clock/time.ts`
- Produces:
  - `export type StageId = 'hours' | 'half' | 'quarter' | 'five' | 'any'`
  - `export const STAGE_ORDER: StageId[]`
  - `export function stageIndex(id: StageId): number`
  - `export function nextStage(id: StageId): StageId | null`
  - `export function minuteStepForStage(id: StageId): number` // 60, 30, 15, 5, 1
  - `export function isLegalTime(stage: StageId, t: ClockTime): boolean`
  - `export function randomLegalTime(stage: StageId, rng?: () => number): ClockTime`
  - `export const STARS_TO_UNLOCK = 8`
  - `export const ACCURACY_FLOOR = 0.7`
  - `export function stageLabelKey(id: StageId): string` // i18n key `stages.hours` etc.

- [ ] **Step 1: Write failing tests**

```ts
import { describe, it, expect } from 'vitest'
import {
  STAGE_ORDER,
  nextStage,
  minuteStepForStage,
  isLegalTime,
  randomLegalTime,
} from './stages'

describe('stages', () => {
  it('orders five stages', () => {
    expect(STAGE_ORDER).toEqual(['hours', 'half', 'quarter', 'five', 'any'])
  })

  it('nextStage advances then ends', () => {
    expect(nextStage('hours')).toBe('half')
    expect(nextStage('any')).toBeNull()
  })

  it('minute steps match pedagogy', () => {
    expect(minuteStepForStage('hours')).toBe(60)
    expect(minuteStepForStage('half')).toBe(30)
    expect(minuteStepForStage('quarter')).toBe(15)
    expect(minuteStepForStage('five')).toBe(5)
    expect(minuteStepForStage('any')).toBe(1)
  })

  it('legal times for hours are :00 only', () => {
    expect(isLegalTime('hours', { hours: 3, minutes: 0 })).toBe(true)
    expect(isLegalTime('hours', { hours: 3, minutes: 30 })).toBe(false)
  })

  it('randomLegalTime respects stage', () => {
    for (let i = 0; i < 40; i++) {
      const t = randomLegalTime('quarter', () => 0.42)
      expect(isLegalTime('quarter', t)).toBe(true)
    }
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
yarn test src/game/stages.test.ts
```

- [ ] **Step 3: Implement `types.ts` and `stages.ts`**

```ts
// src/game/types.ts
import type { ClockTime } from '../clock/time'

export type StageId = 'hours' | 'half' | 'quarter' | 'five' | 'any'
export type PromptKind = 'read' | 'set'
export type Difficulty = 0 | 1 | 2 // easy, mid, hard within stage

export type Prompt = {
  kind: PromptKind
  target: ClockTime
  options?: ClockTime[] // read mode choices; one equals target
  showHint?: boolean
  snapStep: number
}

export type AdaptiveState = {
  recent: boolean[] // true = correct; max length 10
  difficulty: Difficulty
}

export type SessionState = {
  stage: StageId
  starsInStage: number
  totalStars: number
  adaptive: AdaptiveState
  muted: boolean
  lastPromptKind: PromptKind | null
}
```

```ts
// src/game/stages.ts
import type { ClockTime } from '../clock/time'
import { normalizeTime } from '../clock/time'
import type { StageId } from './types'

export const STAGE_ORDER: StageId[] = ['hours', 'half', 'quarter', 'five', 'any']
export const STARS_TO_UNLOCK = 8
export const ACCURACY_FLOOR = 0.7

export function stageIndex(id: StageId): number {
  return STAGE_ORDER.indexOf(id)
}

export function nextStage(id: StageId): StageId | null {
  const i = stageIndex(id)
  return i < 0 || i >= STAGE_ORDER.length - 1 ? null : STAGE_ORDER[i + 1]
}

export function minuteStepForStage(id: StageId): number {
  switch (id) {
    case 'hours':
      return 60
    case 'half':
      return 30
    case 'quarter':
      return 15
    case 'five':
      return 5
    case 'any':
      return 1
  }
}

export function isLegalTime(stage: StageId, t: ClockTime): boolean {
  const n = normalizeTime(t)
  const step = minuteStepForStage(stage)
  if (step === 60) return n.minutes === 0
  return n.minutes % step === 0
}

export function randomLegalTime(stage: StageId, rng: () => number = Math.random): ClockTime {
  const hours = 1 + Math.floor(rng() * 12)
  const step = minuteStepForStage(stage)
  if (step === 60) return normalizeTime({ hours, minutes: 0 })
  const slots = 60 / step
  const minutes = Math.floor(rng() * slots) * step
  return normalizeTime({ hours, minutes })
}

export function stageLabelKey(id: StageId): string {
  return `stages.${id}`
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
yarn test src/game/stages.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/game/types.ts src/game/stages.ts src/game/stages.test.ts
git commit -m "feat: add learning stages and legal time generation"
```

---

### Task 4: Adaptive difficulty and progress unlock

**Files:**
- Create: `src/game/adaptive.ts`, `src/game/progress.ts`, `src/game/adaptive.test.ts`, `src/game/progress.test.ts`
- Test: those `*.test.ts` files

**Interfaces:**
- Consumes: `AdaptiveState`, `SessionState`, `Difficulty` from `types.ts`; `STARS_TO_UNLOCK`, `ACCURACY_FLOOR`, `nextStage` from `stages.ts`
- Produces:
  - `export function initialAdaptive(): AdaptiveState`
  - `export function recordAnswer(state: AdaptiveState, correct: boolean): AdaptiveState`
  - `export function recentAccuracy(state: AdaptiveState): number`
  - `export function initialSession(): SessionState`
  - `export type AnswerResult = { session: SessionState; unlocked: boolean; advancedTo: StageId | null }`
  - `export function applyAnswer(session: SessionState, correct: boolean): AnswerResult`

**Rules (lock these in tests):**
- Keep last 10 answers in `recent`.
- If recent length ≥ 5 and accuracy ≥ 0.85 → difficulty = 2; elif accuracy ≤ 0.55 → difficulty = 0; else difficulty = 1.
- On correct: `starsInStage++`, `totalStars++`.
- Unlock when `starsInStage >= STARS_TO_UNLOCK` AND `recentAccuracy >= ACCURACY_FLOOR` (if fewer than 5 answers, treat accuracy as 1.0 for unlock check only when stars met — actually: require `recent.length >= 5` OR `starsInStage >= STARS_TO_UNLOCK + 2` as grace). Simpler locked rule: unlock when `starsInStage >= STARS_TO_UNLOCK` and (`recent.length < 5` OR `recentAccuracy >= ACCURACY_FLOOR`).
- On unlock: set stage to `nextStage`, reset `starsInStage` to 0, reset adaptive to `initialAdaptive()`, set `unlocked: true`.
- Wrong answers never decrease stage.

- [ ] **Step 1: Write failing tests** covering recordAnswer difficulty bands, unlock advance, no demotion on wrong.

- [ ] **Step 2: Run — expect FAIL**

```bash
yarn test src/game/adaptive.test.ts src/game/progress.test.ts
```

- [ ] **Step 3: Implement `adaptive.ts` and `progress.ts`** per interfaces and rules above.

- [ ] **Step 4: Run — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/game/adaptive.ts src/game/progress.ts src/game/adaptive.test.ts src/game/progress.test.ts
git commit -m "feat: add adaptive difficulty and stage unlock progress"
```

---

### Task 5: Prompt engine

**Files:**
- Create: `src/game/promptEngine.ts`, `src/game/promptEngine.test.ts`
- Test: `src/game/promptEngine.test.ts`

**Interfaces:**
- Consumes: `SessionState`, `Prompt`, `Difficulty`; `randomLegalTime`, `minuteStepForStage`, `isLegalTime`
- Produces:
  - `export function choosePromptKind(last: PromptKind | null, rng?: () => number): PromptKind` // ~50/50 but avoid 4 identical in a row by flipping if last three match (session tracks only last — simpler: 50/50 with `rng`, if `last` set and `rng() < 0.35` force opposite for variety)
  - `export function buildDistractors(target: ClockTime, stage: StageId, difficulty: Difficulty, count: number, rng?: () => number): ClockTime[]`
  - `export function nextPrompt(session: SessionState, rng?: () => number): Prompt`

**Distractor rules:**
- Same stage-legal times, never equal to target.
- Difficulty 0: distractors differ by ≥ 2 hours or large minute gaps.
- Difficulty 2: closer neighbors (adjacent legal slots).
- Read prompts: `options` length 3 (easy) or 4 (mid/hard), shuffled, includes target.
- Set prompts: no options; `snapStep = minuteStepForStage(stage)` (for `any`, snap 1); `showHint` true when difficulty === 0.

- [ ] **Step 1: Write failing tests** — kind variety, options contain target, distractors legal and unique, hint on easy set.

- [ ] **Step 2: Run — expect FAIL**

```bash
yarn test src/game/promptEngine.test.ts
```

- [ ] **Step 3: Implement `promptEngine.ts`**

- [ ] **Step 4: Run — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/game/promptEngine.ts src/game/promptEngine.test.ts
git commit -m "feat: add prompt engine for read and set challenges"
```

---

### Task 6: i18n and time phrases

**Files:**
- Create: `src/i18n/index.ts`, `src/i18n/formatTime.ts`, `src/i18n/formatTime.test.ts`, `src/i18n/locales/{en,es,fr,it,de,pt,zh-CN}.json`
- Test: `src/i18n/formatTime.test.ts`

**Interfaces:**
- Consumes: `ClockTime`, `timeToDigits`
- Produces:
  - `export function initI18n(): Promise<void>` (or sync init)
  - `export function formatTimePhrase(t: ClockTime, locale: string): string`
  - Locale JSON keys at minimum:

```json
{
  "brand": "Times of Day",
  "prompt": {
    "read": "What time is it?",
    "set": "Set the clock to {{time}}"
  },
  "actions": {
    "check": "Check",
    "mute": "Mute",
    "unmute": "Unmute"
  },
  "feedback": {
    "correct": "Great job!",
    "wrong": "Nice try — it's {{time}}"
  },
  "stages": {
    "hours": "Hours",
    "half": "Half hours",
    "quarter": "Quarter hours",
    "five": "Five minutes",
    "any": "Any minute"
  },
  "unlock": "New stage: {{stage}}"
}
```

**Phrase rules for `formatTimePhrase`:**
- Always implement digit path via `timeToDigits`.
- For `en`: o'clock / half past / quarter past / quarter to / `N minutes past` / `N minutes to` as appropriate; fall back to digits for awkward cases.
- For other locales: provide natural templates in code or JSON for o'clock, half, quarter; otherwise return digits. Chinese: e.g. `三点` / `三点半` / `三点十五分` patterns for common cases; else digits.
- UI uses phrase in prompts; choice buttons show **digits** (clearer for kids) with optional secondary phrase only if space — v1: digits on buttons.

- [ ] **Step 1: Write failing tests** for `en` o'clock/half/quarter and `zh-CN` hour/half; digit fallback.

- [ ] **Step 2: Run — expect FAIL**

```bash
yarn test src/i18n/formatTime.test.ts
```

- [ ] **Step 3: Implement locale files + `formatTime.ts` + `initI18n` with LanguageDetector and supportedLngs list.**

```ts
// supportedLngs: ['en','es','fr','it','de','pt','zh-CN']
// fallbackLng: 'en'
// detection: ['navigator', 'htmlTag']
```

- [ ] **Step 4: Run — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/i18n
git commit -m "feat: add i18n with seven locales and time phrases"
```

---

### Task 7: Theme, global styles, brand shell

**Files:**
- Create: `src/styles/theme.ts`, `src/styles/GlobalStyle.ts`, `src/components/Brand.tsx`, `src/components/ProgressStrip.tsx`
- Modify: `src/main.tsx`, `src/App.tsx`

**Interfaces:**
- Consumes: i18n `t()`, session fields for display
- Produces: `ThemeProvider` wrapping app; CSS variables / theme tokens:

```ts
export const theme = {
  colors: {
    bgTop: '#e8f5e4',
    bgBottom: '#dcefd4',
    ink: '#1e3d28',
    inkMuted: '#2d5a3d',
    clockRim: '#5a9e6f',
    clockFace: '#ffffff',
    hourHand: '#e07a3a',
    minuteHand: '#2d5a3d',
    mint: '#b8e0c0',
    white: '#ffffff',
    star: '#e6c35c',
  },
  fonts: {
    display: '"Fredoka", "Nunito", "Noto Sans SC", system-ui, sans-serif',
    body: '"Nunito", "Noto Sans SC", system-ui, sans-serif',
  },
  radii: { button: '12px', pill: '999px' },
}
```

Load Google fonts in `index.html`: Fredoka, Nunito, Noto Sans SC.

`ProgressStrip` props: `{ stageLabel: string; stars: number; muted: boolean; onToggleMute: () => void; languages: { code: string; label: string }[]; currentLng: string; onChangeLng: (code: string) => void }`

`Brand`: renders `t('brand')` as large wordmark.

- [ ] **Step 1: Implement theme + GlobalStyle + Brand + ProgressStrip (styled-components).**

- [ ] **Step 2: Wire `main.tsx` with `ThemeProvider`, `GlobalStyle`, `Suspense`/`I18nextProvider` as needed; App renders Brand + placeholder.**

- [ ] **Step 3: Manual check**

```bash
yarn dev
```

Expected: green gradient page, **Times of Day** prominent, strip controls visible.

- [ ] **Step 4: Commit**

```bash
git add src/styles src/components/Brand.tsx src/components/ProgressStrip.tsx src/main.tsx src/App.tsx index.html
git commit -m "feat: add Garden calm theme, brand, and progress strip"
```

---

### Task 8: SVG ClockFace (read display + set drag)

**Files:**
- Create: `src/components/ClockFace.tsx`, `src/components/ClockFace.test.tsx`
- Test: `src/components/ClockFace.test.tsx`

**Interfaces:**
- Consumes: `ClockTime`, angle helpers, theme colors
- Produces:

```ts
type ClockFaceProps = {
  time: ClockTime
  interactive: boolean
  snapStep: number
  showHourHint?: boolean
  animateHands?: boolean
  onChange?: (time: ClockTime) => void
}
```

Behavior:
- SVG 12 ticks / numerals 12,1,…11.
- Hour hand coral, minute hand deep green, center cap.
- `interactive`: pointer/touch drag on hands (or whole face: nearest hand or minute-priority when angle near minute).
- While dragging, call `onChange` with snapped time.
- `animateHands`: CSS transition on transform unless reduced motion.
- Accessible: `role="img"` + `aria-label` with digit time.

- [ ] **Step 1: Write test** — render at 3:00; with `userEvent` / fireEvent drag simulation calling `onChange` toward 3:30 when interactive (can unit-test a pure `pointerAngleToTime` helper exported for testing if drag is brittle).

Export helper:

```ts
export function pointerEventToTime(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  snapStep: number,
  dragging: 'hour' | 'minute',
  current: ClockTime,
): ClockTime
```

- [ ] **Step 2: Run — expect FAIL**

```bash
yarn test src/components/ClockFace.test.tsx
```

- [ ] **Step 3: Implement `ClockFace.tsx`**

- [ ] **Step 4: Run — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/components/ClockFace.tsx src/components/ClockFace.test.tsx
git commit -m "feat: add interactive SVG analog clock face"
```

---

### Task 9: Soft SFX module

**Files:**
- Create: `src/audio/sfx.ts`, `src/audio/sfx.test.ts`
- Test: `src/audio/sfx.test.ts` (mock `AudioContext`)

**Interfaces:**
- Produces:
  - `export type SfxName = 'correct' | 'wrong' | 'unlock'`
  - `export function playSfx(name: SfxName, muted: boolean): void`
  - Uses Web Audio oscillators/envelopes (no binary assets required): short pleasant blip, soft thud, short arpeggio for unlock.
  - No-op when `muted` or when `window` / AudioContext unavailable.

- [ ] **Step 1: Write test** — muted does not call `resume`/`createOscillator`; unmuted path invokes mocked context.

- [ ] **Step 2: Implement `sfx.ts`**

- [ ] **Step 3: Run tests PASS**

- [ ] **Step 4: Commit**

```bash
git add src/audio
git commit -m "feat: add soft Web Audio sound effects with mute"
```

---

### Task 10: Game session hook and GameScreen

**Files:**
- Create: `src/hooks/useGameSession.ts`, `src/hooks/usePrefersReducedMotion.ts`, `src/components/PromptBanner.tsx`, `src/components/AnswerChoices.tsx`, `src/components/SetCheckButton.tsx`, `src/components/FeedbackFlash.tsx`, `src/components/GameScreen.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: all game modules, ClockFace, sfx, i18n
- Produces:

```ts
// useGameSession
export function useGameSession(): {
  session: SessionState
  prompt: Prompt
  draftTime: ClockTime // for set mode
  setDraftTime: (t: ClockTime) => void
  feedback: null | { kind: 'correct' | 'wrong' | 'unlock'; message: string }
  selectOption: (t: ClockTime) => void
  checkSet: () => void
  toggleMute: () => void
  dismissFeedbackAndContinue: () => void
}
```

Flow:
1. Init session + first prompt.
2. Read: `selectOption` → compare → `applyAnswer` → play SFX → show feedback 900ms → if unlock, show unlock message → `nextPrompt`.
3. Set: user drags `draftTime` (initialized to a random offset from target so they must move hands); `checkSet` uses `timeEquals` after snap.
4. Language changes via `i18n.changeLanguage` in ProgressStrip — do not reset session.

`GameScreen` composes: ProgressStrip, Brand, PromptBanner, ClockFace, AnswerChoices or SetCheckButton, FeedbackFlash.

Tolerance for set: exact equality after snap to `prompt.snapStep`.

- [ ] **Step 1: Implement hook + components with styled-components; wire App to `<GameScreen />` only.**

- [ ] **Step 2: Manual playtest**

```bash
yarn dev
```

Verify: read + set both work; stars increment; after 8 correct with ok accuracy, stage advances; mute silences; language switch updates copy including `zh-CN`.

- [ ] **Step 3: Commit**

```bash
git add src/hooks src/components src/App.tsx
git commit -m "feat: wire one-page game session for read and set loop"
```

---

### Task 11: Polish motion, mobile layout, README

**Files:**
- Modify: `src/components/FeedbackFlash.tsx`, `src/components/GameScreen.tsx`, `src/styles/GlobalStyle.ts`
- Create: `README.md`

**Requirements:**
- Correct: brief star pop animation (CSS); skip if reduced motion.
- Unlock: short scale/opacity “bloom” on stage label; skip if reduced motion.
- Layout: max-width ~480px centered; clock ≥ min(70vw, 320px); choice buttons min-height 48px; works at 360px width.
- README: what it is, `yarn dev`, `yarn test`, `yarn build`, GitHub Pages URL pattern, languages list.

- [ ] **Step 1: Implement polish + README**

- [ ] **Step 2: Run full test suite + build**

```bash
yarn test
yarn build
```

Expected: all green; `dist/` contains assets with `/times-of-day/` base.

- [ ] **Step 3: Commit**

```bash
git add src README.md
git commit -m "feat: polish motion, mobile layout, and project README"
```

---

### Task 12: GitHub Pages deploy workflow

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `README.md` (Pages enablement note)

**Workflow:**

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: yarn
      - run: yarn install --frozen-lockfile
      - run: yarn test
      - run: yarn build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 1: Add workflow file**

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/deploy.yml README.md
git commit -m "ci: deploy static build to GitHub Pages"
```

- [ ] **Step 3: After push (human or agent with permission):** enable Pages → Source: GitHub Actions in repo settings. Confirm site loads at `https://<user>.github.io/times-of-day/`.

---

## Spec coverage self-review

| Spec requirement | Task |
|------------------|------|
| One-page SPA, continuous read/set loop | 10 |
| Hybrid stages + adaptive within stage | 3, 4, 5 |
| Session-only progress | 4, 10 (no persistence) |
| Auto-detect + picker; 7 locales incl. zh-CN | 6, 7, 10 |
| Soft SFX + mute; no speech | 9, 10 |
| Garden calm visuals + Times of Day brand | 7, 11 |
| SVG clock drag/set + snap | 2, 8 |
| Reduced motion | 10, 11 |
| Unit tests time/stages/adaptive | 2–5 |
| Clock angle tests | 2, 8 |
| GitHub Pages deploy | 1 (`base`), 12 |
| Digits fallback + phrases | 6 |

## Placeholder / consistency check

- No TBD/TODO left in tasks.
- Types aligned: `ClockTime`, `StageId`, `Prompt`, `SessionState`, `Difficulty` defined in Task 3 and reused through Task 10.
- Unlock constants `STARS_TO_UNLOCK = 8`, `ACCURACY_FLOOR = 0.7` match design band (~8–10).
- Vite `base: '/times-of-day/'` matches repo name; if remote repo name differs, update `base` and README in Task 1/12.
