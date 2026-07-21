import type { AdaptiveTheme } from '../context/AdaptiveUIContext'
import { artists, type Artist, type Song } from './mockData'

export type ContinueListeningItem = {
  id: string
  title: string
  artKey: string
  songId?: string
  /** Set for podcast entries — tapping opens the show instead of playing a song. */
  podcastId?: string
}

function artistForSong(song: Song): Artist | undefined {
  return artists.find(a => a.id === song.artistId)
}

export function artistMatchesGenre(artist: Artist, genreTokens: string[]): boolean {
  const genre = artist.genre.toLowerCase()
  return genreTokens.some(token => genre.includes(token.toLowerCase()))
}

export function songMatchesTheme(song: Song, theme: AdaptiveTheme | null): boolean {
  if (!theme) return true
  const artist = artistForSong(song)
  if (!artist) return false

  const checks: boolean[] = []
  if (theme.filterArtistIds?.length) {
    checks.push(theme.filterArtistIds.includes(song.artistId))
  }
  if (theme.filterMoods?.length) {
    checks.push(theme.filterMoods.includes(song.mood))
  }
  if (theme.filterGenres?.length) {
    checks.push(artistMatchesGenre(artist, theme.filterGenres))
  }
  if (theme.filterGenre) {
    checks.push(artist.genre === theme.filterGenre)
  }
  if (checks.length === 0) return true
  return checks.some(Boolean)
}

export function artistMatchesTheme(artist: Artist, theme: AdaptiveTheme | null): boolean {
  if (!theme) return true

  const checks: boolean[] = []
  if (theme.filterArtistIds?.length) {
    checks.push(theme.filterArtistIds.includes(artist.id))
  }
  if (theme.filterGenres?.length) {
    checks.push(artistMatchesGenre(artist, theme.filterGenres))
  }
  if (theme.filterGenre) {
    checks.push(artist.genre === theme.filterGenre)
  }
  if (checks.length === 0) return true
  return checks.some(Boolean)
}

export function filterSongsForTheme(songsList: Song[], theme: AdaptiveTheme | null): Song[] {
  if (!theme) return songsList
  return songsList.filter(s => songMatchesTheme(s, theme))
}

/** Broader discovery filter for superfan personas who still want a fandom hero
 *  but mixed recommendations everywhere else (e.g. Hannah). */
export function getDiscoveryTheme(
  theme: AdaptiveTheme | null,
  diverseRecommendations?: boolean,
): AdaptiveTheme | null {
  if (!theme || !diverseRecommendations) return theme
  return {
    ...theme,
    filterArtistIds: undefined,
    filterGenres: ['Pop', 'Indie Pop', 'Pop Punk', 'Singer-Songwriter', 'R&B / Pop', 'Pop / R&B', 'R&B / Soul', 'Pop / Dance'],
    featuredArtistIds: [
      'tswift', 'olivia-rodrigo', 'sabrina-carpenter', 'tate-mcrae',
      'lorde', 'billie-eilish', 'ariana-grande', 'sza', 'dua-lipa', 'the-weeknd',
    ],
    sectionLabels: {
      ...theme.sectionLabels,
      songsForYou: 'Songs for You',
      frequentPlays: 'On repeat this month',
      popularInCity: 'Popular in your city',
      myMixes: 'Mixes made for you',
    },
  }
}

export function filterContinueListening(
  items: ContinueListeningItem[],
  theme: AdaptiveTheme | null,
  allSongs: Song[],
): ContinueListeningItem[] {
  if (!theme) return items
  return items.filter(item => {
    // Podcasts stay eligible in every theme so they can surface in Jump back in.
    if (item.podcastId) return true
    const song = allSongs.find(s => s.id === item.songId)
    return song ? songMatchesTheme(song, theme) : false
  })
}

export function uniqueAlbumsFromSongs(songsList: Song[], limit = 8): Song[] {
  return Array.from(
    songsList.reduce((map, song) => {
      if (!map.has(song.album)) map.set(song.album, song)
      return map
    }, new Map<string, Song>()).values(),
  ).slice(0, limit)
}

export function getFeaturedArtists(
  theme: AdaptiveTheme | null,
  featuredIds: string[],
  limit = 16,
): Artist[] {
  const byId = new Map(artists.map(a => [a.id, a]))

  if (theme?.featuredArtistIds?.length) {
    const themed = theme.featuredArtistIds
      .map(id => byId.get(id))
      .filter((a): a is Artist => a != null)
    if (themed.length >= limit) return themed.slice(0, limit)
    const themedSet = new Set(themed.map(a => a.id))
    const fill = featuredIds
      .filter(id => !themedSet.has(id))
      .map(id => byId.get(id))
      .filter((a): a is Artist => a != null && artistMatchesTheme(a, theme))
    return [...themed, ...fill].slice(0, limit)
  }

  if (theme) {
    const themed = artists
      .filter(a => artistMatchesTheme(a, theme))
      .sort((a, b) => b.streamCount - a.streamCount)
    if (themed.length >= limit) return themed.slice(0, limit)
    const themedSet = new Set(themed.map(a => a.id))
    const fill = featuredIds
      .filter(id => !themedSet.has(id))
      .map(id => byId.get(id))
      .filter((a): a is Artist => a != null)
    return [...themed, ...fill].slice(0, limit)
  }

  return featuredIds
    .map(id => byId.get(id))
    .filter((a): a is Artist => a != null)
    .slice(0, limit)
}

export function getHiddenGemArtists(ids: string[]): Artist[] {
  const byId = new Map(artists.map(a => [a.id, a]))
  return ids.map(id => byId.get(id)).filter((a): a is Artist => a != null)
}
