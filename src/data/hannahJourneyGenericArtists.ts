import { artists, type Artist } from './mockData'

/**
 * Hannah Journey's own content (Landing rails in HannahJourneyLanding.tsx,
 * plus the hardcoded "Fans also like" rail inside OliviaMusicTab's three
 * Hannah-Journey-gated branches) links to a handful of artists beyond her
 * three bespoke reference pages (Olivia Rodrigo, Taylor Swift, BTS). This is
 * every one of those ids, confirmed by grepping every hannah-journey/* file
 * plus OliviaMusicTab.tsx for artistId/`/artist/` references:
 *
 *  - 'ariana-grande'      — Landing "Your Top Artists" (all 3 stages) + "Albums for you"
 *                           (new-listener: "Petal") + fan group card + Landing songs rail
 *  - 'justin-bieber'      — Landing "Your Top Artists" (all 3 stages) + "Albums for you"
 *                           (new-listener: "My World 2.0")
 *  - 'sabrina-carpenter'  — Landing "Your Top Artists" (all 3 stages) + "Albums for you"
 *                           (superfan: "Emails I Can't Send") + Landing songs rail
 *  - 'lorde'              — Landing "Your Top Artists" (all 3 stages)
 *  - 'tate-mcrae'         — Landing "Your Top Artists" (all 3 stages) + OliviaMusicTab's
 *                           HJ "Fans also like" rail (shown as "Bella Kay")
 *  - 'noah-kahan'         — OliviaMusicTab's HJ "Fans also like" rail (all 3 branches)
 *
 * (sabrina-carpenter and tate-mcrae also appear a second way, in that same
 * "Fans also like" rail, under placeholder display names "Grace Abrams" /
 * "Bella Kay" — the id navigated to is still their real one.)
 *
 * olivia-rodrigo / tswift / bts are excluded — they keep their existing
 * hand-tuned screens (app/artist/[id].tsx already special-cases them).
 */
export const HANNAH_JOURNEY_GENERIC_ARTIST_IDS = [
  'ariana-grande',
  'justin-bieber',
  'sabrina-carpenter',
  'lorde',
  'tate-mcrae',
  'noah-kahan',
] as const

export type HannahJourneyGenericArtistId = (typeof HANNAH_JOURNEY_GENERIC_ARTIST_IDS)[number]

export type HannahJourneyGenericArtistConfig = {
  id: string
  name: string
  /** Artist.imageUri — resolved via resolveArtistAvatar(id, imageUri) for both the hero photo and avatar. */
  imageUri?: string
  bio: string
  genre: string
  monthlyListeners: number
  /** e.g. "67M Monthly Listeners" — real Artist.monthlyListeners, just formatted. */
  listenerLabel: string
}

function formatListeners(n: number): string {
  if (n >= 1_000_000) {
    const millions = Math.round(n / 100_000) / 10
    return `${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)}M Monthly Listeners`
  }
  if (n >= 1_000) {
    const thousands = Math.round(n / 100) / 10
    return `${thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1)}K Monthly Listeners`
  }
  return `${n} Monthly Listeners`
}

function toConfig(artist: Artist): HannahJourneyGenericArtistConfig {
  return {
    id: artist.id,
    name: artist.name,
    imageUri: artist.imageUri,
    bio: artist.bio,
    genre: artist.genre,
    monthlyListeners: artist.monthlyListeners,
    listenerLabel: formatListeners(artist.monthlyListeners),
  }
}

/** Built from the real `artists` catalog (src/data/mockData.ts) — no invented bios/stats. */
export const HANNAH_JOURNEY_GENERIC_ARTISTS: Record<string, HannahJourneyGenericArtistConfig> = (() => {
  const out: Record<string, HannahJourneyGenericArtistConfig> = {}
  for (const id of HANNAH_JOURNEY_GENERIC_ARTIST_IDS) {
    const artist = artists.find(a => a.id === id)
    if (artist) out[id] = toConfig(artist)
  }
  return out
})()

export function isHannahJourneyGenericArtist(id: string | undefined | null): boolean {
  return !!id && id in HANNAH_JOURNEY_GENERIC_ARTISTS
}

export function getHannahJourneyGenericArtist(id: string): HannahJourneyGenericArtistConfig | null {
  return HANNAH_JOURNEY_GENERIC_ARTISTS[id] ?? null
}
