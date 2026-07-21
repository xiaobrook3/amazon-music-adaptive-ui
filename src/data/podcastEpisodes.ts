import { artists, podcasts, type Podcast } from './mockData'

// Podcasts in the mock catalog are "shows" — no per-episode data. This module
// derives a stable latest-episode (title, length, drop date) for each show so the
// detail page and player agree, without needing Date.now in module scope.

function hash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

// Deliberately long titles so the player's marquee has something to scroll.
const EPISODE_TOPICS = [
  'The full story behind the biggest moments this week',
  'A deep dive into everything you might have missed',
  'Our longest conversation yet, completely unpacked',
  'Everything that happened this era, explained in detail',
  'The complete breakdown, from the very start to right now',
  'Unpacking the news, the drama, and what comes next',
]

const ABOUT_EXTRA =
  ' Each episode blends interviews, deep cuts, and honest conversation, settle in and listen all the way through.'

export interface PodcastEpisode {
  podcastId: string
  title: string
  host: string
  about: string
  durationSecs: number
  durationLabel: string
  episodeNumber: number
  daysAgo: number
}

function fmtDuration(secs: number): string {
  const h = Math.floor(secs / 3600)
  const m = Math.round((secs % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

// Artist-led shows ("podshow-<artistId>") are synthesized, not stored: the home
// screen tops up its podcast rails with shows derived from artists. Title and
// episode count hash off the artist id so the rail tile and this detail page
// always agree.
const ARTIST_SHOW_TITLES = [
  (name: string) => `The ${name} Deep Dive`,
  (name: string) => `Inside ${name}`,
  (name: string) => `${name}: Era by Era`,
  (name: string) => `Stan Radio · ${name}`,
]

export function artistShowTitle(artistId: string, name: string): string {
  return ARTIST_SHOW_TITLES[hash(artistId) % ARTIST_SHOW_TITLES.length](name)
}

export function artistShowEpisodeCount(artistId: string): number {
  return 18 + (hash(artistId) % 64)
}

export function findPodcast(id: string | undefined): Podcast {
  if (id?.startsWith('podshow-')) {
    const artistId = id.slice('podshow-'.length)
    const artist = artists.find(a => a.id === artistId)
    if (artist) {
      return {
        id,
        title: artistShowTitle(artist.id, artist.name),
        host: `${artist.name} Fan Network`,
        description: `Era deep-dives, interviews, and fan conversations, everything ${artist.name}`,
        episodeCount: artistShowEpisodeCount(artist.id),
        coverColor: '#1a1a2e',
        coverArtPath: artist.imageUri,
        category: 'Music',
      }
    }
  }
  return podcasts.find(p => p.id === id) ?? podcasts[0]
}

export function podcastEpisode(pod: Podcast): PodcastEpisode {
  const h = hash(pod.id)
  const durationSecs = (30 + (h % 46)) * 60 // 30–75 min
  const topic = EPISODE_TOPICS[h % EPISODE_TOPICS.length]
  return {
    podcastId: pod.id,
    title: `Ep. ${pod.episodeCount} · ${topic}`,
    host: pod.host,
    about: pod.description + ABOUT_EXTRA,
    durationSecs,
    durationLabel: fmtDuration(durationSecs),
    episodeNumber: pod.episodeCount,
    daysAgo: h % 18,
  }
}

/** "Aug 28" style drop label, computed at call time (runtime Date is fine here). */
export function droppedLabel(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
