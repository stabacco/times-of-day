import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { SfxName } from './sfx'

describe('playSfx', () => {
  const mockResume = vi.fn().mockResolvedValue(undefined)
  const mockCreateOscillator = vi.fn()
  const mockCreateGain = vi.fn()

  let playSfx: (name: SfxName, muted: boolean) => void

  beforeEach(async () => {
    vi.resetModules()
    mockResume.mockClear()
    mockCreateOscillator.mockClear()
    mockCreateGain.mockClear()

    mockCreateGain.mockImplementation(() => ({
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    }))

    mockCreateOscillator.mockImplementation(() => ({
      type: 'sine',
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    }))

    class MockAudioContext {
      currentTime = 0
      destination = {}
      resume = mockResume
      createOscillator = mockCreateOscillator
      createGain = mockCreateGain
    }

    vi.stubGlobal('AudioContext', MockAudioContext)
    ;(globalThis as { webkitAudioContext?: typeof MockAudioContext }).webkitAudioContext =
      MockAudioContext

    const mod = await import('./sfx')
    playSfx = mod.playSfx
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    Reflect.deleteProperty(globalThis, 'webkitAudioContext')
  })

  it('does nothing when muted', () => {
    playSfx('correct', true)
    playSfx('wrong', true)
    playSfx('unlock', true)

    expect(mockResume).not.toHaveBeenCalled()
    expect(mockCreateOscillator).not.toHaveBeenCalled()
  })

  it('does nothing when AudioContext is unavailable', async () => {
    vi.unstubAllGlobals()
    Reflect.deleteProperty(globalThis, 'webkitAudioContext')
    Reflect.deleteProperty(window, 'AudioContext')
    vi.resetModules()
    const mod = await import('./sfx')
    mod.playSfx('correct', false)

    expect(mockResume).not.toHaveBeenCalled()
    expect(mockCreateOscillator).not.toHaveBeenCalled()
  })

  it('resumes context and creates oscillators when unmuted', () => {
    playSfx('correct', false)

    expect(mockResume).toHaveBeenCalled()
    expect(mockCreateOscillator).toHaveBeenCalled()
    expect(mockCreateGain).toHaveBeenCalled()
  })

  it('uses more oscillators for unlock arpeggio than for correct blip', () => {
    playSfx('correct', false)
    const correctOsc = mockCreateOscillator.mock.calls.length

    mockCreateOscillator.mockClear()
    mockCreateGain.mockClear()
    mockResume.mockClear()

    playSfx('unlock', false)
    expect(mockCreateOscillator.mock.calls.length).toBeGreaterThan(correctOsc)
  })

  it('plays wrong sfx with oscillators when unmuted', () => {
    playSfx('wrong', false)
    expect(mockResume).toHaveBeenCalled()
    expect(mockCreateOscillator).toHaveBeenCalled()
  })
})
