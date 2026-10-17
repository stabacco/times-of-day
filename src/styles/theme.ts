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

export type AppTheme = typeof theme
