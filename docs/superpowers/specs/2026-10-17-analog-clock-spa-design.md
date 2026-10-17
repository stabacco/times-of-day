# Times of Day — Analog Clock Learning SPA

**Date:** 2026-10-17  
**Status:** Approved for planning  
**Deploy target:** GitHub Pages

## Goal

A single-page web app that teaches children (roughly ages 5–10) to read and set an analog clock. Engaging, adaptive within clear stages, multilingual, and static-hostable on GitHub Pages.

## Product summary

- **One page** — no mode hubs, routes, or multi-screen flows.
- **Continuous practice loop** that alternates **Read the clock** and **Set the clock** (~50/50, not rigidly alternating).
- **Hybrid difficulty:** named stages unlock in order; within a stage, prompts adapt toward ~70–80% recent success.
- **Session-only progress** — nothing persisted across visits (no accounts, no `localStorage` for progress).
- **Languages:** browser auto-detect + in-session picker. Soft SFX only (no speech); mute toggle.

## Architecture

**Stack**

| Piece | Choice |
|--------|--------|
| UI | React + TypeScript + Vite |
| Styling | styled-components |
| i18n | i18next + browser language detector |
| Clock | SVG analog face with draggable hands (set mode) |
| Audio | Short SFX (Web Audio or small assets), muteable |
| Package manager | yarn |
| Deploy | `yarn build` → static `dist/`; GitHub Action → GitHub Pages |

**Top-level modules**

- `Clock` — face, numerals, hand angles; drag + snap in set mode.
- `PromptEngine` — chooses prompt type, target time, distractors, and within-stage difficulty.
- `Progress` — stars this session, current stage, unlock check.
- `i18n` — UI strings + locale-aware time phrases; digit fallback always available.
- `sfx` — correct / wrong / unlock; respects mute and reduced-motion (no heavy animation).

**Data flow**

1. App boots → detect language → start at stage **Hours**, zero stars.
2. `PromptEngine` emits a prompt → UI renders clock + answer controls.
3. Learner answers → score → SFX/feedback → update adaptive state → maybe unlock stage → next prompt.

## Learning stages

Unlock in order (session only):

1. **Hours** — exact hours (`3:00`)
2. **Half hours** — `:00` and `:30`
3. **Quarter hours** — `:00`, `:15`, `:30`, `:45`
4. **Five minutes** — multiples of 5
5. **Any minute** — full fluency

**Unlock:** Earn enough stars in the current stage (target band: ~8–10 correct with recent accuracy above a floor). Short celebration + unlock SFX; advance stage. Misses do not demote stage; they only ease difficulty within the stage.

**Within-stage adaptation**

- Streaks → harder prompts (closer distractors; finer set-hand precision).
- Misses → easier prompts; optional short hint (e.g. highlight hour hand).
- Aim for ~70–80% success on a recent window of answers.

## Prompt types

**Read**

- Clock shows a time; learner picks 1 of 3–4 written options (digits and/or localized phrases).

**Set**

- Prompt shows a target time (digits and/or phrase); learner drags hour and minute hands; taps **Check**.
- Hands snap appropriately for the stage (coarser early; finer in later stages).

## Screen layout

Single composition (mobile and desktop):

1. Progress strip — stage name, session stars, mute, language control  
2. Brand — **Times of Day** as a clear wordmark (hero-level, not nav-only)  
3. Prompt — short instruction in the active language  
4. Clock — large centered analog face  
5. Answer area — choice buttons (read) or Check (set)

No secondary dashboards, cards-as-decoration, or multi-panel chrome.

## Visual design — Garden calm

- Soft green gradient background; white clock; leafy green rim.
- Coral hour hand; deep green minute hand.
- Rounded choice buttons; correct/selected state in soft mint.
- Friendly rounded sans (e.g. Fredoka or Nunito); must remain readable for Latin scripts and Simplified Chinese.
- Motion: ease hands into place on new read prompts; brief star pop on correct; short leaf/bloom on stage unlock; honor `prefers-reduced-motion`.
- Touch-first large targets.

## Internationalization

**v1 locales**

- English (`en`)
- Spanish (`es`)
- French (`fr`)
- Italian (`it`)
- German (`de`)
- Portuguese (`pt`)
- Simplified Chinese (`zh-CN`)

Auto-detect from browser; picker overrides for the session. All UI copy and time phrases in JSON message files. Prefer natural locale phrases where they matter (e.g. quarter/half past); digits always available so vocabulary is not a blocker. Traditional Chinese can be added later as another message file.

## Feedback & accessibility

- Correct → star + cheerful SFX + short affirmative copy  
- Wrong → gentle SFX, briefly show correct answer, continue  
- Unlock → stronger SFX + stage name reveal  
- Mute in progress strip  
- Keyboard not required; mouse/touch primary  
- Reduced motion: skip flourish animations, keep the learning loop

## Out of scope (v1)

- Accounts, cloud sync, or progress persistence  
- Speech synthesis / spoken prompts  
- Separate Learn / Practice / Challenge pages  
- Mini-game shells or narrative worlds  
- Parent/teacher dashboards  
- Offline PWA packaging beyond normal static hosting

## Testing (planning expectations)

- Unit tests for time generation, stage rules, and adaptive difficulty.
- Component tests for clock hand angle ↔ time mapping and set-mode snap.
- Manual pass on mobile widths and at least two locales (including `zh-CN`).

## Success criteria

- A child can practice read + set on one screen without navigation.
- Difficulty visibly progresses through the five stages in a single session.
- Language switch updates UI and time phrasing without reload.
- Production build deploys cleanly to GitHub Pages for this repo.
