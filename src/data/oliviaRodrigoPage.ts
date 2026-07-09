export type OliviaEraId = 'love' | 'sour' | 'petty' | 'newbie'

export interface OliviaEra {
  id: OliviaEraId
  season: string
  title: string
  badge: string
  description: string
  eraImageKey: string
  topTrack: { title: string; plays: number; artKey: string }
  playedThen: { title: string; artKey: string }[]
}

export const OLIVIA_ERAS: OliviaEra[] = [
  {
    id: 'love',
    season: 'Spring 2026',
    title: 'Girl So In Love Era',
    badge: 'Top 1% listener',
    description: 'Late-night playlists and heart-on-sleeve ballads filled your queue.',
    eraImageKey: 'olivia-era-love',
    topTrack: { title: 'vampire', plays: 18, artKey: 'olivia-rodrigo-guts' },
    playedThen: [
      { title: 'vampire', artKey: 'olivia-rodrigo-guts' },
      { title: 'get him back!', artKey: 'olivia-rodrigo-guts' },
      { title: 'bad idea right?', artKey: 'olivia-rodrigo-guts' },
    ],
  },
  {
    id: 'sour',
    season: 'Spring 2024',
    title: 'Sour Girl Era',
    badge: 'Top 2% listener',
    description: 'You listened to a lot of angry songs back then,\nmostly played after midnight.',
    eraImageKey: 'olivia-era-sour',
    topTrack: { title: 'Drivers License', plays: 24, artKey: 'olivia-rodrigo-sour' },
    playedThen: [
      { title: 'good 4 u', artKey: 'olivia-rodrigo-sour' },
      { title: 'deja vu', artKey: 'olivia-rodrigo-sour' },
      { title: 'traitor', artKey: 'olivia-rodrigo-sour' },
    ],
  },
  {
    id: 'petty',
    season: 'Spring 2022',
    title: 'Petty Era',
    badge: 'Top 5% listener',
    description: 'Petty anthems on repeat — you knew every bridge by heart.',
    eraImageKey: 'olivia-era-petty',
    topTrack: { title: 'good 4 u', plays: 31, artKey: 'olivia-rodrigo-sour' },
    playedThen: [
      { title: 'brutal', artKey: 'olivia-rodrigo-sour' },
      { title: 'jealousy, jealousy', artKey: 'olivia-rodrigo-sour' },
      { title: 'favorite crime', artKey: 'olivia-rodrigo-sour' },
    ],
  },
  {
    id: 'newbie',
    season: 'Spring 2021',
    title: 'Newbie Livie',
    badge: 'You found Olivia',
    description: 'The first time you heard her voice, everything clicked.',
    eraImageKey: 'olivia-era-love',
    topTrack: { title: 'Drivers License', plays: 12, artKey: 'olivia-rodrigo-sour' },
    playedThen: [
      { title: 'Drivers License', artKey: 'olivia-rodrigo-sour' },
      { title: '1 step forward, 3 steps back', artKey: 'olivia-rodrigo-sour' },
      { title: 'enough for you', artKey: 'olivia-rodrigo-sour' },
    ],
  },
]

export const OLIVIA_JOURNEY_STATS = {
  minutesListened: 1840,
  longestStreakDays: 47,
  amongFriendsRank: '#1',
}

export const OLIVIA_FAVORITE_LYRICS = [
  {
    song: 'Deja Vu',
    artKey: 'olivia-rodrigo-sour',
    lyric: "Played you the song she's singing now when she's with you",
    gradient: ['rgba(133,127,197,0.12)', 'rgba(133,127,197,0.6)'],
  },
  {
    song: 'making the bed',
    artKey: 'olivia-rodrigo-making-the-bed',
    lyric: "But it's me who's been making the bed",
    gradient: ['rgba(133,127,197,0.12)', 'rgba(74,68,119,0.6)'],
  },
  {
    song: "Can't Catch Me Now",
    artKey: 'olivia-rodrigo-cant-catch-me',
    lyric: "But I'm in the trees, I'm in the breeze\nMy footsteps on the ground",
    gradient: ['rgba(104,37,18,0.12)', 'rgba(104,37,18,0.6)'],
  },
  {
    song: 'Drivers License',
    artKey: 'olivia-rodrigo-sour',
    lyric: 'Cause you said forever, now I drive alone past your street',
    gradient: ['rgba(133,127,197,0.12)', 'rgba(133,127,197,0.6)'],
  },
]

export const OLIVIA_ERA_PLAYLISTS = [
  { title: 'A girl in love', artKey: 'olivia-rodrigo-girl-in-love' },
  { title: 'you seem pretty sad', artKey: 'olivia-rodrigo-pretty-sad' },
]

export const OLIVIA_TOP_ALBUMS = [
  { id: 'or-album-guts',        title: 'GUTS',                      subtitle: 'Album • 2023',        artKey: 'olivia-rodrigo-guts' },
  { id: 'or-album-sour',        title: 'SOUR',                      subtitle: 'Album • 2021',        artKey: 'olivia-rodrigo-sour' },
  { id: 'or-album-guts-spilled',title: 'GUTS (spilled)',            subtitle: 'Deluxe • 2024',       artKey: 'olivia-rodrigo-exclusive' },
  { id: 'or-album-hg',          title: 'The Hunger Games: TBOSAS',  subtitle: 'Soundtrack • 2023',   artKey: 'olivia-rodrigo-cant-catch-me' },
  { id: 'or-album-hsmtmts',     title: 'HSMTMTS Soundtrack',       subtitle: 'Soundtrack • 2020',   artKey: 'olivia-rodrigo-sour' },
  { id: 'or-album-secret',      title: 'GUTS: The Secret Tracks',  subtitle: 'EP • 2023',           artKey: 'olivia-rodrigo-guts' },
  { id: 'or-album-bestof',      title: 'Best of Olivia Rodrigo',   subtitle: 'Compilation',         artKey: 'olivia-rodrigo-exclusive' },
]

export const OLIVIA_RELATED_PLAYLISTS = [
  { id: 'pl-acoustic-alt',  name: 'Acoustic Alternative',  sub: 'Amazon Music',  artKey: 'olivia-rodrigo-sour' },
  { id: 'pl-sad-girl',      name: 'Sad Girl Autumn',        sub: 'Amazon Music',  artKey: 'olivia-rodrigo-guts' },
  { id: 'pl-women-of-pop',  name: 'Women of Pop',           sub: 'Amazon Music',  artKey: 'olivia-rodrigo-exclusive' },
  { id: 'pl-heartbreak',    name: 'Heartbreak Anthems',     sub: 'Amazon Music',  artKey: 'olivia-rodrigo-sour' },
  { id: 'pl-bedroom-pop',   name: 'Bedroom Pop',            sub: 'Amazon Music',  artKey: 'olivia-rodrigo-guts' },
]

// ── Discography ───────────────────────────────────────────────────────────────

export interface DiscographyTrack {
  title: string
  duration: string
}

export type DiscographyType = 'album' | 'deluxe' | 'single' | 'ep'

export interface DiscographyRelease {
  id: string
  title: string
  year: number
  type: DiscographyType
  artKey: string
  tracks?: DiscographyTrack[]
}

export const OLIVIA_DISCOGRAPHY: DiscographyRelease[] = [

  // ── 2020 ─────────────────────────────────────────────────────────────────

  {
    id: 'hsmtmts-2020',
    title: 'High School Musical: The Musical: The Series — Soundtrack',
    year: 2020,
    type: 'ep',
    artKey: 'olivia-rodrigo-sour',
    tracks: [
      { title: 'All I Want', duration: '3:37' },
      { title: 'Just for a Moment', duration: '2:44' },
      { title: 'Even When/The Best Part', duration: '2:02' },
      { title: 'Out of the Old', duration: '2:38' },
      { title: 'Wondering', duration: '2:57' },
      { title: 'I Think I Kinda, You Know', duration: '2:39' },
      { title: 'The Rose Song', duration: '2:47' },
    ],
  },
  {
    id: 'all-i-want-2020',
    title: 'All I Want',
    year: 2020,
    type: 'single',
    artKey: 'olivia-rodrigo-sour',
  },

  // ── 2021 ─────────────────────────────────────────────────────────────────

  {
    id: 'drivers-license-2021',
    title: 'drivers license',
    year: 2021,
    type: 'single',
    artKey: 'olivia-rodrigo-sour',
  },
  {
    id: 'deja-vu-2021',
    title: 'deja vu',
    year: 2021,
    type: 'single',
    artKey: 'olivia-rodrigo-sour',
  },
  {
    id: 'good-4-u-2021',
    title: 'good 4 u',
    year: 2021,
    type: 'single',
    artKey: 'olivia-rodrigo-sour',
  },
  {
    id: 'brutal-2021',
    title: 'brutal',
    year: 2021,
    type: 'single',
    artKey: 'olivia-rodrigo-sour',
  },
  {
    id: 'happier-2021',
    title: 'happier',
    year: 2021,
    type: 'single',
    artKey: 'olivia-rodrigo-sour',
  },
  {
    id: 'sour-2021',
    title: 'SOUR',
    year: 2021,
    type: 'album',
    artKey: 'olivia-rodrigo-sour',
    tracks: [
      { title: 'brutal', duration: '2:22' },
      { title: 'traitor', duration: '3:49' },
      { title: 'drivers license', duration: '4:02' },
      { title: '1 step forward, 3 steps back', duration: '2:51' },
      { title: 'deja vu', duration: '3:35' },
      { title: 'good 4 u', duration: '2:58' },
      { title: 'enough for you', duration: '3:16' },
      { title: 'happier', duration: '3:11' },
      { title: 'favorite crime', duration: '2:32' },
      { title: 'hope ur ok', duration: '3:50' },
    ],
  },

  // ── 2023 ─────────────────────────────────────────────────────────────────

  {
    id: 'vampire-2023',
    title: 'vampire',
    year: 2023,
    type: 'single',
    artKey: 'olivia-rodrigo-guts',
  },
  {
    id: 'bad-idea-right-2023',
    title: 'bad idea right?',
    year: 2023,
    type: 'single',
    artKey: 'olivia-rodrigo-guts',
  },
  {
    id: 'get-him-back-2023',
    title: 'get him back!',
    year: 2023,
    type: 'single',
    artKey: 'olivia-rodrigo-guts',
  },
  {
    id: 'guts-2023',
    title: 'GUTS',
    year: 2023,
    type: 'album',
    artKey: 'olivia-rodrigo-guts',
    tracks: [
      { title: 'vampire', duration: '3:40' },
      { title: 'bad idea right?', duration: '3:29' },
      { title: 'get him back!', duration: '3:30' },
      { title: 'lacy', duration: '2:57' },
      { title: 'ballad of a homeschooled girl', duration: '2:46' },
      { title: 'making the bed', duration: '3:04' },
      { title: 'logical', duration: '3:44' },
      { title: 'get him back! (reprise)', duration: '1:08' },
      { title: 'the grudge', duration: '4:34' },
      { title: 'love is embarrassing', duration: '2:35' },
      { title: "pretty isn't pretty", duration: '2:42' },
      { title: 'teenage dream', duration: '3:22' },
      { title: 'page 278', duration: '2:00' },
    ],
  },
  {
    id: 'guts-secret-tracks-2023',
    title: 'GUTS: The Secret Tracks',
    year: 2023,
    type: 'ep',
    artKey: 'olivia-rodrigo-guts',
    tracks: [
      { title: 'so american', duration: '2:55' },
      { title: "pretty isn't pretty (acoustic)", duration: '2:38' },
      { title: 'all-american bitch (live)', duration: '3:10' },
    ],
  },
  {
    id: 'cant-catch-me-now-2023',
    title: "Can't Catch Me Now",
    year: 2023,
    type: 'single',
    artKey: 'olivia-rodrigo-cant-catch-me',
  },

  // ── 2024 ─────────────────────────────────────────────────────────────────

  {
    id: 'guts-spilled-2024',
    title: 'GUTS (spilled)',
    year: 2024,
    type: 'deluxe',
    artKey: 'olivia-rodrigo-exclusive',
    tracks: [
      { title: 'vampire', duration: '3:40' },
      { title: 'bad idea right?', duration: '3:29' },
      { title: 'get him back!', duration: '3:30' },
      { title: 'lacy', duration: '2:57' },
      { title: 'ballad of a homeschooled girl', duration: '2:46' },
      { title: 'making the bed', duration: '3:04' },
      { title: 'logical', duration: '3:44' },
      { title: 'get him back! (reprise)', duration: '1:08' },
      { title: 'the grudge', duration: '4:34' },
      { title: 'love is embarrassing', duration: '2:35' },
      { title: "pretty isn't pretty", duration: '2:42' },
      { title: 'teenage dream', duration: '3:22' },
      { title: 'page 278', duration: '2:00' },
      { title: 'scared of my guitar', duration: '3:16' },
      { title: 'stranger', duration: '3:47' },
      { title: 'girl next door', duration: '2:51' },
      { title: 'making the bed (demo)', duration: '3:12' },
      { title: 'obsessed', duration: '2:52' },
    ],
  },
  {
    id: 'obsessed-2024',
    title: 'obsessed',
    year: 2024,
    type: 'single',
    artKey: 'olivia-rodrigo-exclusive',
  },
  {
    id: 'so-american-2024',
    title: 'so american',
    year: 2024,
    type: 'single',
    artKey: 'olivia-rodrigo-exclusive',
  },
]
