# Times of Day

A calm, one-page game that teaches kids to read and set analog clocks. Players answer "What time is it?" by picking a digital time, or set the clock hands themselves. Stages unlock as they earn stars: hours, half hours, quarter hours, five minutes, then any minute. Sound effects are soft and can be muted, and motion respects `prefers-reduced-motion`.

## Commands

```bash
yarn install
yarn dev      # start the dev server
yarn test     # run the test suite (Vitest)
yarn build    # type-check and produce dist/
```

## Deployment (GitHub Pages)

The Vite `base` is `/times-of-day/`, so the built site is served from:

```
https://<user>.github.io/times-of-day/
```

Publish the contents of `dist/` to GitHub Pages.

## Languages

English (`en`), Spanish (`es`), French (`fr`), Italian (`it`), German (`de`), Portuguese (`pt`) and Simplified Chinese (`zh-CN`). The language is detected from the browser and can be switched from the selector at the top of the page.
