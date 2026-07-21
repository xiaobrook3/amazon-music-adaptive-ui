/**
 * "You & [Artist]" Engaged-tier content for Hannah Journey's secondary
 * artists — Ariana Grande and Sabrina Carpenter (Taylor Swift stays
 * Superfan via her own bespoke screen; BTS's engaged content lives inline
 * in BTSArtistScreen.tsx since it already has real favorite-lyrics data).
 *
 * Mirrors the structure of Olivia's Hannah-Journey Engaged "You & Olivia"
 * tab (src/components/hannah-journey/HannahJourneyYouAndOlivia.tsx): a
 * "Time You Spent Together" stat block, a favorites rail, and a "Where It
 * Started" card. That same Olivia component hardcodes its engaged-tier
 * stats (1204 min / 47 day streak / #4 among friends) rather than reading
 * per-relationship analytics that don't exist — same precedent followed
 * here, with different round numbers per artist so they don't read as
 * copy-pasted.
 *
 * Songs/art below all reference real catalog entries (src/data/mockData.ts)
 * — no invented songs. Neither artist has curated lyric-snippet data in
 * this codebase (unlike Olivia/BTS), so "Favorite Lyrics" is replaced with
 * a real "Your Top Songs" rail instead of fabricating quoted lyrics.
 */

export type EngagedArtistContent = {
  timeSpent: { minutesListened: number; streakDays: number; amongFriendsRank: string }
  topSongs: { songId: string; title: string; artKey: string }[]
  firstPlay: { songId: string; title: string; artKey: string; date: string }
}

export const HANNAH_JOURNEY_ENGAGED_ARTIST_CONTENT: Record<string, EngagedArtistContent> = {
  'ariana-grande': {
    timeSpent: { minutesListened: 340, streakDays: 12, amongFriendsRank: '#19' },
    topSongs: [
      { songId: 's-ariana5', title: 'no tears left to cry', artKey: 'ariana-sweetener' },
      { songId: 's-ariana1', title: 'God is a Woman', artKey: 'ariana-sweetener' },
      { songId: 's-ariana2', title: 'Into You', artKey: 'ariana-dangerous-woman' },
    ],
    firstPlay: { songId: 's-ariana2', title: 'Into You', artKey: 'ariana-dangerous-woman', date: '18 April 2025' },
  },
  'sabrina-carpenter': {
    timeSpent: { minutesListened: 265, streakDays: 9, amongFriendsRank: '#27' },
    topSongs: [
      { songId: 's-sabrina1', title: 'Espresso', artKey: 'sabrina-espresso' },
      { songId: 's-sabrina2', title: 'Please Please Please', artKey: 'sabrina-short-n-sweet' },
      { songId: 's-sabrina3', title: "Man's Best Friend", artKey: 'sabrina-mans-best-friend' },
    ],
    firstPlay: { songId: 's-sabrina1', title: 'Espresso', artKey: 'sabrina-espresso', date: '2 June 2025' },
  },
}

export function getEngagedArtistContent(artistId: string): EngagedArtistContent | null {
  return HANNAH_JOURNEY_ENGAGED_ARTIST_CONTENT[artistId] ?? null
}
