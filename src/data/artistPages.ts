import { artists, songs, type Artist, type Song } from './mockData'
import { albumArtAssets } from './assetMap'

// The Olivia Rodrigo screen (src/screens/OliviaRodrigoArtistScreen.tsx) is the
// hand-tuned reference design. This module produces the same page shape for ANY
// other artist by deriving tailored data from mockData + assetMap. Where an
// artist has thin data (a single song, no curated lyrics), the corresponding
// sections come back empty/null and the screen simply doesn't render them —
// so smaller artists get a lighter page instead of empty scaffolding.

const BASE_YEAR = 2026

export interface JourneyTrack {
  title: string
  artKey: string
}

export interface ArtistEra {
  id: string
  season: string
  title: string
  badge: string
  description: string
  eraImageKey: string
  topTrack: { title: string; plays: number; artKey: string }
  playedThen: JourneyTrack[]
}

export interface ArtistLyric {
  song: string
  artKey: string
  lyric: string
  gradient: [string, string]
}

export interface ArtistExclusive {
  tag: string
  title: string
  date: string
  milestone: string
  body: string
  artKey: string
}

export interface ArtistMerchItem {
  name: string
  type: 'Vinyl' | 'CD' | 'Tee' | 'Hoodie' | 'Poster'
  price: string
  artKey: string
}

export interface ArtistPageData {
  id: string
  name: string
  firstName: string
  genre: string
  bio: string
  followersLabel: string
  sinceLabel: string
  listenerBadge: string
  exclusive: ArtistExclusive | null
  eras: ArtistEra[]
  stats: { minutesListened: string; longestStreakDays: number; amongFriendsRank: string }
  lyrics: ArtistLyric[]
  merch: ArtistMerchItem[]
  playlists: { title: string; artKey: string }[]
  firstPlay: { title: string; date: string; artKey: string } | null
}

// ── Curated merch for a handful of major artists. Product images reuse the
//    artist's own album art (we don't have real product photos), which reads
//    fine as a "capsule" drop. Artists not listed here show no merch section.
const ARTIST_MERCH: Record<string, ArtistMerchItem[]> = {
  bts: [
    { name: 'Proof Collector Vinyl', type: 'Vinyl', price: '$42', artKey: 'bts-proof-door' },
    { name: 'Tour Logo Tee',         type: 'Tee',   price: '$35', artKey: 'bts-proof-door' },
    { name: 'Dynamite Signed CD',    type: 'CD',    price: '$28', artKey: 'bts-dynamite' },
  ],
  tswift: [
    { name: 'Reputation Vinyl',      type: 'Vinyl',  price: '$45', artKey: 'ts-reputation' },
    { name: 'folklore Vinyl',         type: 'Vinyl',  price: '$42', artKey: 'ts-1989-polaroid' },
    { name: '1989 (Taylor\'s Version) CD', type: 'CD', price: '$22', artKey: 'ts-1989' },
    { name: 'Eras Tour Tee',         type: 'Tee',    price: '$40', artKey: 'ts-showgirl' },
    { name: 'TTPD Signed LP',        type: 'Vinyl',  price: '$55', artKey: 'ts-tortured-poets' },
    { name: 'Showgirl Poster Set',   type: 'Poster', price: '$18', artKey: 'ts-showgirl-life' },
    { name: 'Lover Era Hoodie',      type: 'Hoodie', price: '$68', artKey: 'ts-lover' },
  ],
  'justin-bieber': [
    { name: 'Purpose Vinyl',         type: 'Vinyl',  price: '$38', artKey: 'justin-bieber-believe' },
    { name: 'Justice Tour Tee',      type: 'Tee',    price: '$35', artKey: 'justin-bieber-believe' },
    { name: 'Believe Signed CD',     type: 'CD',     price: '$28', artKey: 'justin-bieber-believe' },
    { name: 'Bieber Logo Hoodie',    type: 'Hoodie', price: '$65', artKey: 'justin-bieber-my-worlds' },
  ],
  'bad-bunny': [
    { name: 'Un Verano Vinyl',       type: 'Vinyl', price: '$38', artKey: 'bad-bunny-verano' },
    { name: 'Summer Tour Tee',       type: 'Tee',   price: '$34', artKey: 'bad-bunny-verano' },
    { name: 'Verano Deluxe CD',      type: 'CD',    price: '$22', artKey: 'bad-bunny-verano' },
  ],
  sza: [
    { name: 'SOS Ocean Vinyl',       type: 'Vinyl', price: '$40', artKey: 'sza-sos' },
    { name: 'SOS Era Tee',           type: 'Tee',   price: '$33', artKey: 'sza-sos' },
  ],
  'the-weeknd': [
    { name: 'After Hours Vinyl',     type: 'Vinyl', price: '$42', artKey: 'the-weeknd' },
    { name: 'XO Logo Hoodie',        type: 'Hoodie',price: '$65', artKey: 'the-weeknd' },
    { name: 'After Hours CD',        type: 'CD',    price: '$20', artKey: 'the-weeknd' },
  ],
  'dua-lipa': [
    { name: 'Future Nostalgia Vinyl',type: 'Vinyl', price: '$39', artKey: 'dua-lipa' },
    { name: 'Radical Optimism Tee',  type: 'Tee',   price: '$32', artKey: 'dua-lipa' },
  ],
}

// ── Curated lyrics for the few artists deep enough to warrant them.
//    Anything not in here shows no lyrics section (kept intentionally shallow).
const ARTIST_LYRICS: Record<string, ArtistLyric[]> = {
  tswift: [
    {
      song: 'Cruel Summer',
      artKey: 'ts-lover',
      lyric: "I love you, ain't that the worst thing you ever heard?",
      gradient: ['rgba(37,209,218,0.12)', 'rgba(37,209,218,0.55)'],
    },
    {
      song: 'All Too Well',
      artKey: 'tswift-1',
      lyric: "You keep my old scarf from that very first week / 'cause it reminds you of innocence",
      gradient: ['rgba(139,26,26,0.12)', 'rgba(100,20,20,0.6)'],
    },
    {
      song: 'cardigan',
      artKey: 'ts-1989-polaroid',
      lyric: "And when I felt like I was an old cardigan / under someone's bed",
      gradient: ['rgba(58,58,58,0.2)', 'rgba(20,20,20,0.65)'],
    },
    {
      song: 'champagne problems',
      artKey: 'ts-1989-polaroid',
      lyric: "You had a speech, you're speechless / Love slipped beyond your reaches",
      gradient: ['rgba(107,74,26,0.2)', 'rgba(70,45,10,0.6)'],
    },
    {
      song: 'Anti-Hero',
      artKey: 'ts-tortured-poets',
      lyric: "It's me, hi, I'm the problem, it's me",
      gradient: ['rgba(10,10,46,0.2)', 'rgba(5,5,30,0.7)'],
    },
    {
      song: 'Blank Space',
      artKey: 'ts-1989',
      lyric: "Got a long list of ex-lovers, they'll tell you I'm insane",
      gradient: ['rgba(180,197,228,0.12)', 'rgba(90,110,150,0.6)'],
    },
    {
      song: 'Look What You Made Me Do',
      artKey: 'ts-reputation',
      lyric: "I don't trust nobody and nobody trusts me",
      gradient: ['rgba(40,40,50,0.2)', 'rgba(10,10,20,0.7)'],
    },
    {
      song: 'Fortnight',
      artKey: 'ts-tortured-poets',
      lyric: "I was supposed to be sent away / but they forgot to come and get me",
      gradient: ['rgba(44,44,44,0.2)', 'rgba(20,20,20,0.7)'],
    },
  ],
  'justin-bieber': [
    {
      song: 'Love Yourself',
      artKey: 'justin-bieber-believe',
      lyric: "My mama don't like you and she likes everyone",
      gradient: ['rgba(13,31,60,0.2)', 'rgba(5,15,40,0.65)'],
    },
    {
      song: 'Peaches',
      artKey: 'justin-bieber-believe',
      lyric: 'the track that turns any drive into a warm summer cruise',
      gradient: ['rgba(10,26,46,0.2)', 'rgba(5,15,35,0.6)'],
    },
    {
      song: 'Ghost',
      artKey: 'justin-bieber-believe',
      lyric: "Young and in love with you / now I just gotta get through",
      gradient: ['rgba(10,26,46,0.18)', 'rgba(5,15,35,0.62)'],
    },
  ],
  bts: [
    {
      song: 'Spring Day',
      artKey: 'bts-young-forever',
      lyric: 'I miss you\nWhen I say that I miss you more',
      gradient: ['rgba(28,58,94,0.15)', 'rgba(28,58,94,0.6)'],
    },
    {
      song: 'Dynamite',
      artKey: 'bts-dynamite',
      lyric: "'Cause I, I, I'm in the stars tonight",
      gradient: ['rgba(42,26,5,0.2)', 'rgba(120,80,20,0.6)'],
    },
    {
      song: 'Boy With Luv',
      artKey: 'bts-love-yourself',
      lyric: 'Oh my, my, my\nOh my, my, my',
      gradient: ['rgba(15,31,58,0.15)', 'rgba(15,31,58,0.65)'],
    },
  ],
  lorde: [
    {
      song: 'Royals',
      artKey: 'lorde-pure-heroine',
      lyric: "And we'll never be royals\nIt don't run in our blood",
      gradient: ['rgba(20,20,20,0.2)', 'rgba(10,10,10,0.7)'],
    },
    {
      song: 'Green Light',
      artKey: 'lorde-melodrama',
      lyric: "I'm waiting for it, that green light, I want it",
      gradient: ['rgba(10,26,10,0.2)', 'rgba(20,60,30,0.6)'],
    },
  ],
  // Original fan-caption text (not song lyrics) — evocative mood notes fans
  // tag on a track, so the "moments" section stays populated without lyrics.
  'bad-bunny': [
    {
      song: 'Me Porto Bonito',
      artKey: 'bad-bunny-verano',
      lyric: 'an endless island summer, windows down, everyone singing at once',
      gradient: ['rgba(26,42,26,0.15)', 'rgba(40,90,50,0.6)'],
    },
    {
      song: 'Ojitos Lindos',
      artKey: 'bad-bunny-verano',
      lyric: 'the slow one you save for the drive home',
      gradient: ['rgba(20,34,20,0.18)', 'rgba(30,70,40,0.6)'],
    },
  ],
  rihanna: [
    {
      song: 'Work',
      artKey: 'rihanna-anti',
      lyric: 'the track that turns any room into a 2am dancefloor',
      gradient: ['rgba(20,20,20,0.2)', 'rgba(60,60,70,0.6)'],
    },
    {
      song: 'Love on the Brain',
      artKey: 'rihanna-anti',
      lyric: 'heartbreak with a whole horn section behind it',
      gradient: ['rgba(24,16,16,0.2)', 'rgba(80,40,50,0.6)'],
    },
  ],
  'doja-cat': [
    {
      song: 'Paint the Town Red',
      artKey: 'doja-cat',
      lyric: 'glossy, unbothered, and three steps ahead of everyone',
      gradient: ['rgba(42,8,8,0.2)', 'rgba(140,30,30,0.6)'],
    },
    {
      song: 'Agora Hills',
      artKey: 'doja-cat',
      lyric: 'the soft-launch anthem for anyone a little too in love',
      gradient: ['rgba(34,10,14,0.2)', 'rgba(110,30,50,0.6)'],
    },
  ],
  'lana-del-rey': [
    {
      song: 'The Greatest',
      artKey: 'lana-norman-rockwell',
      lyric: 'golden-hour nostalgia that moves in slow motion',
      gradient: ['rgba(42,24,10,0.2)', 'rgba(120,80,40,0.6)'],
    },
    {
      song: 'Mariners Apartment Complex',
      artKey: 'lana-norman-rockwell',
      lyric: 'the calm, steady one for when everything else is loud',
      gradient: ['rgba(34,22,12,0.2)', 'rgba(90,64,36,0.6)'],
    },
  ],
  'lady-gaga': [
    {
      song: 'Bad Romance',
      artKey: 'gaga-fame-monster',
      lyric: 'couture chaos — the anthem for owning the whole room',
      gradient: ['rgba(26,10,10,0.2)', 'rgba(90,20,30,0.6)'],
    },
    {
      song: 'Telephone',
      artKey: 'gaga-fame-monster',
      lyric: 'the getaway song for ignoring everyone on the dancefloor',
      gradient: ['rgba(22,10,14,0.2)', 'rgba(80,24,40,0.6)'],
    },
  ],
  'tate-mcrae': [
    {
      song: 'greedy',
      artKey: 'tate-mcrae',
      lyric: 'main-character confidence you can actually dance to',
      gradient: ['rgba(26,10,26,0.15)', 'rgba(80,30,90,0.6)'],
    },
    {
      song: 'exes',
      artKey: 'tate-mcrae',
      lyric: 'a petty little victory lap, and it slaps',
      gradient: ['rgba(22,10,22,0.18)', 'rgba(70,28,80,0.6)'],
    },
  ],
}

const MOOD_PHRASE: Record<string, string> = {
  sad: 'late-night ballads filled your queue.',
  hype: 'high-energy anthems on repeat.',
  happy: 'feel-good tracks all season long.',
  chill: 'easy, mellow listening after dark.',
  angry: 'angsty anthems, mostly after midnight.',
  love: 'romantic, heart-on-sleeve songs.',
}

function firstNameOf(name: string): string {
  const parts = name.split(' ')
  if (parts.length > 1 && !['the', 'a'].includes(parts[0].toLowerCase())) return parts[0]
  return name
}

function followersLabel(monthlyListeners: number): string {
  if (monthlyListeners >= 1_000_000) {
    const m = monthlyListeners / 1_000_000
    return `${m >= 10 ? Math.round(m) : m.toFixed(1)}M+ Followers`
  }
  return `${Math.round(monthlyListeners / 1000)}K Followers`
}

function dominantMood(tracks: Song[]): string {
  const counts: Record<string, number> = {}
  let best = tracks[0]?.mood ?? 'chill'
  for (const t of tracks) {
    counts[t.mood] = (counts[t.mood] ?? 0) + 1
    if (counts[t.mood] > (counts[best] ?? 0)) best = t.mood
  }
  return best as string
}

/** Group an artist's songs into "eras" — one per distinct album, in listed order. */
function buildEras(artist: Artist, artistSongs: Song[], badge: string): ArtistEra[] {
  const byAlbum = new Map<string, Song[]>()
  for (const s of artistSongs) {
    if (!byAlbum.has(s.album)) byAlbum.set(s.album, [])
    byAlbum.get(s.album)!.push(s)
  }
  const albums = [...byAlbum.entries()].slice(0, 6)

  return albums.map(([album, tracks], i) => {
    const artKey = tracks[0].albumArtPath ?? artist.imageUri ?? ''
    const mood = dominantMood(tracks)
    const phrase = MOOD_PHRASE[mood] ?? 'defined your listening that season.'
    return {
      id: `${artist.id}-era-${i}`,
      season: i === 0 ? 'This year' : `${BASE_YEAR - i}`,
      title: album,
      badge,
      description: `Your ${album} era — ${phrase}`,
      eraImageKey: artKey,
      topTrack: { title: tracks[0].title, plays: Math.max(8, 38 - i * 7), artKey },
      playedThen: tracks.slice(0, 3).map(t => ({
        title: t.title,
        artKey: t.albumArtPath ?? artKey,
      })),
    }
  })
}

function buildPlaylists(artist: Artist, eras: ArtistEra[]): { title: string; artKey: string }[] {
  if (eras.length === 0) return []
  const out: { title: string; artKey: string }[] = [
    { title: `${firstNameOf(artist.name)} Radio`, artKey: eras[0].eraImageKey },
  ]
  if (eras[1]) out.push({ title: `More like ${eras[1].title}`, artKey: eras[1].eraImageKey })
  out.push({ title: `${artist.genre} Essentials`, artKey: eras[eras.length - 1].eraImageKey })
  return out
}

// ── Exclusive "unlocks" come in several flavors, not just interviews: merch
//    early-access, a personal rewind about you & the artist, behind-the-scenes,
//    vault demos, tour films, a thank-you note. Each artist is assigned one
//    deterministically (stable hash of their id) so the mix feels authored and
//    doesn't shuffle between renders.
interface ExclusiveContext {
  artist: Artist
  firstName: string
  topAlbum: ArtistEra
  sinceYear: number
  bondYears: number
  topPercent: number
}

const EXCLUSIVE_KINDS: ((c: ExclusiveContext) => Omit<ArtistExclusive, 'artKey'>)[] = [
  ({ artist, firstName, topAlbum, sinceYear }) => ({
    tag: 'EXCLUSIVE INTERVIEW',
    title: `Checking in with ${artist.name}`,
    date: `Est. ${sinceYear}`,
    milestone: '50th listen\nmilestone unlocked',
    body: `An exclusive interview with ${firstName} about ${topAlbum.title}.`,
  }),
  ({ topAlbum, sinceYear }) => ({
    tag: 'EARLY MERCH ACCESS',
    title: `${topAlbum.title} capsule`,
    date: `Drops ${sinceYear + 1}`,
    milestone: 'Superfan\nperk unlocked',
    body: `Shop the ${topAlbum.title} collection 24 hours before it opens to everyone.`,
  }),
  ({ firstName, topPercent, sinceYear }) => ({
    tag: 'YOUR REWIND',
    title: `You & ${firstName}, by the numbers`,
    date: `Since ${sinceYear}`,
    milestone: 'Your rewind\nis ready',
    body: `You're in the top ${topPercent}% of ${firstName} listeners — see your story.`,
  }),
  ({ firstName, topAlbum }) => ({
    tag: 'BEHIND THE SCENES',
    title: `Inside ${topAlbum.title}`,
    date: 'New this week',
    milestone: 'Backstage pass\nunlocked',
    body: `Go behind the scenes on how ${firstName} made ${topAlbum.title}.`,
  }),
  ({ firstName, topAlbum }) => ({
    tag: 'FROM THE VAULT',
    title: `${firstName}'s vault`,
    date: 'Members only',
    milestone: 'Vault access\nunlocked',
    body: `Hear an unreleased demo from the ${topAlbum.title} sessions.`,
  }),
  ({ firstName }) => ({
    tag: 'TOUR FILM',
    title: `${firstName}: Live`,
    date: 'Streaming now',
    milestone: 'Front-row\nseat unlocked',
    body: `Watch ${firstName}'s tour film — unlocked because you never miss a drop.`,
  }),
  ({ firstName, bondYears }) => ({
    tag: 'A NOTE FOR YOU',
    title: `A note from ${firstName}`,
    date: `${bondYears}+ yrs together`,
    milestone: 'Loyalty\nreward unlocked',
    body: `${firstName} wrote a thank-you to longtime listeners like you.`,
  }),
]

function hashString(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

/** Curated lyric snippet for a specific track, or null — the player's Lyrics
 *  sheet shows an honest "not available" state for tracks without one. */
export function lyricForSong(artistId: string, songTitle: string): ArtistLyric | null {
  const lyrics = ARTIST_LYRICS[artistId]
  if (!lyrics?.length) return null
  return lyrics.find(l => l.song.toLowerCase() === songTitle.toLowerCase()) ?? null
}

/** The durable listener state the client opens an artist profile in.
 * Mirrors mockData's bond tiers; the moderator stepper on the profile page
 * can still scrub all four states. Also used by scripts/generate-artist-registry.mjs
 * so the embedded page and the client agree on the default. */
export type ListenerState = 'cold' | 'casual' | 'regular' | 'superfan'
export function listenerStateFor(artistId: string): ListenerState {
  const a = artists.find(x => x.id === artistId)
  if (!a) return 'cold'
  if (a.milestoneTierId === 'devoted' || a.milestoneTierId === 'legendary' || a.topPercent <= 2) return 'superfan'
  if (a.milestoneTierId === 'fan') return 'regular'
  if (a.userBondWeeks >= 4) return 'casual'
  return 'cold'
}

export function buildArtistPage(artistId: string): ArtistPageData {
  const artist = artists.find(a => a.id === artistId) ?? artists[0]
  const artistSongs = songs.filter(s => s.artistId === artist.id)

  const firstName = firstNameOf(artist.name)
  const listenerBadge = artist.topPercent <= 1 ? 'Top 1% listener' : `Top ${artist.topPercent}% listener`
  const bondYears = Math.max(1, Math.round(artist.userBondWeeks / 52))
  const sinceYear = BASE_YEAR - bondYears

  const eras = buildEras(artist, artistSongs, listenerBadge)
  const topAlbum = eras[0]
  const oldestEra = eras[eras.length - 1]

  const exclusive: ArtistExclusive | null = topAlbum
    ? {
        ...EXCLUSIVE_KINDS[hashString(artist.id) % EXCLUSIVE_KINDS.length]({
          artist,
          firstName,
          topAlbum,
          sinceYear,
          bondYears,
          topPercent: Math.max(1, artist.topPercent),
        }),
        artKey: topAlbum.eraImageKey,
      }
    : null

  const firstPlay = oldestEra
    ? {
        title: oldestEra.topTrack.title,
        date: `${sinceYear}`,
        artKey: oldestEra.eraImageKey,
      }
    : null

  return {
    id: artist.id,
    name: artist.name,
    firstName,
    genre: artist.genre,
    bio: artist.bio,
    followersLabel: followersLabel(artist.monthlyListeners),
    sinceLabel: `Since ${sinceYear}`,
    listenerBadge,
    exclusive,
    eras,
    stats: {
      minutesListened: artist.streamCount.toLocaleString(),
      // Cap so multi-year fans don't show an implausible year-long "streak".
      longestStreakDays: Math.min(96, Math.max(3, Math.round(artist.userBondWeeks * 0.9))),
      amongFriendsRank: artist.topPercent <= 3 ? '#1' : artist.topPercent <= 10 ? '#2' : '#3',
    },
    lyrics: ARTIST_LYRICS[artist.id] ?? [],
    merch: ARTIST_MERCH[artist.id] ?? [],
    playlists: buildPlaylists(artist, eras),
    firstPlay,
  }
}

/** Resolve an album-art key to a bundled source, falling back to a provided avatar. */
export function resolvePageArt(key: string, fallback: any = null) {
  return albumArtAssets[key] ?? fallback
}
