/** Append an 0–1 alpha channel to a 6-digit hex color. */
export function hexWithAlpha(hex: string, alpha: number): string {
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, '0')
  return `${hex}${a}`
}

/**
 * Builds an rgba() tint at the given alpha from a theme's `heroHue`, which is
 * either a hex string ('#7B2D8E') or an rgba() string ('rgba(52, 28, 14, 0.8)')
 * depending on the theme. Falls back to a neutral plum if neither parses.
 */
export function tintFromHue(hue: string, alpha: number): string {
  if (hue.startsWith('#')) {
    const h = hue.replace('#', '')
    return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${alpha})`
  }
  const m = hue.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (m) return `rgba(${m[1]},${m[2]},${m[3]},${alpha})`
  return `rgba(38,22,32,${alpha})`
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
