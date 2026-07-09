import { songs, artists, user, type Song } from './mockData'

// ── Prompt suggestions ───────────────────────────────────────────────────────
// Three horizontally-scrollable rows of superfan-flavored prompts. Row 1 is
// fandom/artist-led, row 2 is mood/vibe, row 3 is assistant-style asks — the mix
// a devoted listener would actually reach for when creating with Maestro.

export const MAESTRO_PROMPT_ROWS: string[][] = [
  [
    'Best of BLACKPINK',
    'BTS B-side deep cuts',
    'Taylor Swift bridges only',
    'Underrated Rihanna tracks',
    'Beyoncé power hour',
    'Olivia Rodrigo rage playlist',
    'SZA after midnight',
    'Bad Bunny summer heat',
    'The Weeknd night drive',
    'K-pop stan starter pack',
  ],
  [
    'Sad girl autumn',
    'Main character energy',
    'Villain era anthems',
    'Crying in the club',
    'Feel-good throwbacks',
    'Lo-fi study focus',
    'Hype gym rap',
    'Coffee shop indie',
    'Y2K pop princess',
    '2000s R&B slow jams',
  ],
  [
    'Tell me about Olivia and me',
    'What have I been listening to?',
    'Make me a morning run playlist',
    'A playlist for my current mood',
    'Tell me about my top artist',
    'What are my listening stats?',
    'Songs like my most played',
    'Build a road trip mix',
    'Something for deep focus',
    'A wind-down bedtime mix',
    'Discover my next obsession',
    'Recap my year in music',
  ],
]

export const MAESTRO_DISCLAIMER =
  'Make Maestro your AI-powered playlist creator. Like any new technology, it might be a bit bumpy — it may have incorrect information or knowledge gaps on newly released music. Maestro currently supports English only.'

// ── Mock generation ──────────────────────────────────────────────────────────

export interface MaestroResult {
  name: string
  description: string
  songs: Song[]
}

// Deterministic-ish shuffle seeded off the prompt so the same idea yields a
// stable mix within a session (no Date.now needed).
function shuffle<T>(list: T[]): T[] {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function genreOf(song: Song): string {
  return (artists.find(a => a.id === song.artistId)?.genre ?? '').toLowerCase()
}

// keyword → predicate for genre/mood-led prompts
const KEYWORD_FILTERS: { keys: string[]; match: (s: Song) => boolean }[] = [
  { keys: ['k-pop', 'kpop', 'stan'], match: s => genreOf(s).includes('k-pop') || genreOf(s).includes('pop') },
  { keys: ['rap', 'hip-hop', 'hip hop', 'gym', 'hype'], match: s => genreOf(s).includes('hip-hop') || s.mood === 'hype' },
  { keys: ['r&b', 'rnb', 'soul', 'slow jam'], match: s => genreOf(s).includes('r&b') || genreOf(s).includes('soul') },
  { keys: ['latin', 'reggaeton'], match: s => genreOf(s).includes('latin') },
  { keys: ['rock', 'metal', 'punk'], match: s => genreOf(s).includes('rock') || genreOf(s).includes('metal') },
  { keys: ['indie', 'coffee', 'alt'], match: s => genreOf(s).includes('indie') || genreOf(s).includes('alt') },
  { keys: ['sad', 'crying', 'breakup', 'feels', 'autumn'], match: s => s.mood === 'sad' },
  { keys: ['chill', 'lo-fi', 'lofi', 'study', 'focus', 'wind-down', 'bedtime', 'sleep'], match: s => s.mood === 'chill' },
  { keys: ['happy', 'feel-good', 'feel good', 'throwback', 'morning', 'run', 'workout'], match: s => s.mood === 'happy' || s.mood === 'hype' },
  { keys: ['love', 'romance', 'crush', 'date'], match: s => s.mood === 'love' },
]

function titleCase(str: string): string {
  return str.replace(/\b\w/g, c => c.toUpperCase())
}

export function generatePlaylist(rawPrompt: string): MaestroResult {
  const prompt = rawPrompt.trim()
  const lower = prompt.toLowerCase()

  // 1) Artist named in the prompt → that artist's catalog.
  let pool: Song[] = []
  let anchorArtist: string | null = null
  const artist = artists.find(
    a => lower.includes(a.name.toLowerCase()) || lower.includes(a.id.replace(/-/g, ' ')),
  )
  if (artist) {
    pool = songs.filter(s => s.artistId === artist.id)
    if (pool.length > 0) anchorArtist = artist.name
  }

  // 2) Genre / mood keywords.
  if (pool.length < 5) {
    const filter = KEYWORD_FILTERS.find(f => f.keys.some(k => lower.includes(k)))
    if (filter) pool = [...pool, ...songs.filter(filter.match)]
  }

  // 3) Fallback: a broad, varied pool.
  if (pool.length < 5) pool = shuffle(songs).slice(0, 60)

  // De-dupe and pick.
  const seen = new Set<string>()
  const unique = pool.filter(s => (seen.has(s.id) ? false : (seen.add(s.id), true)))
  let picked = shuffle(unique).slice(0, 10)
  if (picked.length < 6) {
    const extra = shuffle(songs.filter(s => !seen.has(s.id))).slice(0, 6 - picked.length)
    picked = [...picked, ...extra]
  }

  const name = titleCase(prompt.replace(/[?.!]+$/, ''))
  const description = anchorArtist
    ? `${anchorArtist}'s biggest moments and the tracks around them — a Maestro mix of ${picked.length} songs.`
    : `A Maestro mix of ${picked.length} tracks tuned to "${prompt}".`

  return { name, description, songs: picked }
}

// ── Q&A (Maestro can answer, not just build) ─────────────────────────────────

export interface MaestroAnswer {
  title: string
  body: string
  followUps: string[]
}

/** Playlist-building intents ("make/best of/…") stay playlists; everything that
 *  reads like a question is answered conversationally. */
export function isQuestion(prompt: string): boolean {
  const l = prompt.trim().toLowerCase()
  if (/^(make|build|create|give me|generate|best of|songs like|a playlist|explore|discover|community|something for)/.test(l)) {
    return false
  }
  if (l.endsWith('?')) return true
  return (
    /^(tell me|what|who|how|why|when|do i|am i|recap|about)\b/.test(l) ||
    l.includes('and me') ||
    l.includes('about me') ||
    l.includes('my listening') ||
    l.includes('been listening') ||
    l.includes('stats')
  )
}

const firstName = user.name.split(' ')[0]

export function answerQuestion(rawPrompt: string): MaestroAnswer {
  const lower = rawPrompt.toLowerCase()
  const artist = artists.find(a => lower.includes(a.name.toLowerCase()))

  // "tell me about <artist> and me"
  if (artist && (lower.includes('and me') || lower.includes('about me') || lower.includes('about'))) {
    const topSong = songs.find(s => s.artistId === artist.id)
    return {
      title: `You & ${artist.name}`,
      body:
        `You and ${artist.name} go way back. You're in the top 1% of their fans on Amazon Music` +
        (topSong ? `, and "${topSong.title}" is one of your most-replayed tracks` : '') +
        `. Lately you've been leaning back into their ${artist.genre} era — want me to build a mix around it?`,
      followUps: [`Make me the ultimate ${artist.name} mix`, `${artist.name} deep cuts`, 'Recap my year in music'],
    }
  }

  // listening stats / "what have I been listening to"
  if (lower.includes('stat') || lower.includes('listening') || lower.includes('listened')) {
    return {
      title: 'Your listening, lately',
      body:
        `Over the last month you've been in your feels — sad-pop and R&B lead your rotation, ` +
        `with a few late-night rap detours. You've streamed about ${user.totalStreams.toLocaleString()} tracks all-time. ` +
        `Your mornings skew upbeat and your nights wind down. Pop is edging ahead as your top genre.`,
      followUps: ['Who is my top artist?', 'A playlist for my current mood', 'Recap my year in music'],
    }
  }

  // top artist
  if (lower.includes('top artist') || lower.includes('my artist')) {
    return {
      title: 'Your top artist',
      body:
        `It's a tight race, but pop is winning your ears — Olivia Rodrigo and Taylor Swift keep climbing, ` +
        `and Olivia edges ahead this month. Want a mix built around her?`,
      followUps: ['Make me an Olivia Rodrigo playlist', 'Songs like my most played', 'What are my listening stats?'],
    }
  }

  // year recap
  if (lower.includes('recap') || lower.includes('year')) {
    return {
      title: 'Your year in music',
      body:
        `Pop and R&B defined your year, with Olivia Rodrigo as your #1 and "drivers license" your most-replayed. ` +
        `You had a heartbreak-pop spring and a hype-rap summer. ${firstName}, it was a whole era.`,
      followUps: ['Make me my year-in-review mix', 'Who is my top artist?', 'What are my listening stats?'],
    }
  }

  // default
  return {
    title: 'Ask me anything',
    body:
      `I can talk through your taste, your top artists, your listening stats, or your year in review — ` +
      `and turn any of it into a playlist. Ask me a question, or tell me a vibe and I'll build it.`,
    followUps: ['Tell me about my top artist', 'What are my listening stats?', 'A playlist for my current mood'],
  }
}
