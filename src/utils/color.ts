/** Append an 0–1 alpha channel to a 6-digit hex color. */
export function hexWithAlpha(hex: string, alpha: number): string {
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, '0')
  return `${hex}${a}`
}

export function parseDurationSeconds(duration: string): number {
  const parts = duration.split(':').map(Number)
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  return 200
}

export function formatClock(secs: number): string {
  const s = Math.max(0, Math.round(secs))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
