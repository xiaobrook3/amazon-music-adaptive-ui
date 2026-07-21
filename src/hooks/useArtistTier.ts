/**
 * The three listener tiers every artist page reasons about. See
 * ARTIST_PAGE_TIERS.txt at the repo root for the full module-by-module spec —
 * this file is the enforceable (typed) half of that definition.
 *
 *   'new'      — no relationship yet. Baseline artist page only: hero, Music
 *                tab, Merch, Events, About. No "You & Artist" tab, no
 *                "Since [date]" bubble, no relationship modules. Generic baseline for all artisit page 
 *   'engaged'  — "You & Artist" tab is unlocked. Relationship modules appear:
 *                the "Since [date]" bubble, liked-songs preview, journey
 *                eras, played-back-then, and
 *                era-similar playlists. No recognition modules yet.
 *   'superfan' — everything 'engaged' has, plus recognition: the superfan
 *                banner/badge (with SuperfanGoldGlow), exclusive offers,time-together stats, 
 *                favorite-lyrics carousel, #1 most played, latest news, and
 *                superfan picks.
 */
export type ArtistTier = 'new' | 'engaged' | 'superfan'

export function deriveArtistTier(flags: { isCasual: boolean; isEngaged: boolean }): ArtistTier {
  if (flags.isCasual) return 'new'
  if (flags.isEngaged) return 'engaged'
  return 'superfan'
}
