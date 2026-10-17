export function minutesToAngle(minutes: number): number {
  return ((minutes % 60) / 60) * 360
}

export function hoursToAngle(hours: number, minutes: number): number {
  const h = hours % 12
  return (h / 12) * 360 + (minutes / 60) * 30
}

export function snapMinutes(minutes: number, step: number): number {
  if (step <= 0) {
    const rounded = Math.round(minutes)
    return ((rounded % 60) + 60) % 60
  }
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
