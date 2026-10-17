export type SfxName = 'correct' | 'wrong' | 'unlock'

type AudioContextCtor = typeof AudioContext

let sharedContext: AudioContext | null = null

function getAudioContextCtor(): AudioContextCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as Window & { webkitAudioContext?: AudioContextCtor }
  return window.AudioContext ?? w.webkitAudioContext ?? null
}

function getContext(): AudioContext | null {
  const Ctor = getAudioContextCtor()
  if (!Ctor) return null
  if (!sharedContext) {
    try {
      sharedContext = new Ctor()
    } catch {
      return null
    }
  }
  return sharedContext
}

function playTone(
  ctx: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  volume = 0.12,
  wave: OscillatorType = 'sine',
): void {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = wave
  osc.frequency.setValueAtTime(frequency, startTime)
  gain.gain.setValueAtTime(0, startTime)
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(startTime)
  osc.stop(startTime + duration + 0.04)
}

function playCorrect(ctx: AudioContext): void {
  const t = ctx.currentTime
  playTone(ctx, 523.25, t, 0.14, 0.1)
}

function playWrong(ctx: AudioContext): void {
  const t = ctx.currentTime
  playTone(ctx, 110, t, 0.22, 0.14, 'triangle')
}

function playUnlock(ctx: AudioContext): void {
  const t = ctx.currentTime
  const notes = [523.25, 659.25, 783.99]
  notes.forEach((freq, i) => {
    playTone(ctx, freq, t + i * 0.09, 0.12, 0.09)
  })
}

export function playSfx(name: SfxName, muted: boolean): void {
  if (muted) return
  const ctx = getContext()
  if (!ctx) return
  void ctx.resume()

  switch (name) {
    case 'correct':
      playCorrect(ctx)
      break
    case 'wrong':
      playWrong(ctx)
      break
    case 'unlock':
      playUnlock(ctx)
      break
  }
}
