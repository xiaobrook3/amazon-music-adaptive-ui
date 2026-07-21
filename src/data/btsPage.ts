// BTS artist page data — mirrors the shape of taylorSwiftPage.ts so
// BTSArtistScreen can import it the same way TaylorSwiftArtistScreen imports
// its data. All art keys resolve through albumArtAssets / artistAssets in
// assetMap.ts.

export type BtsEraId =
  | 'proof'
  | 'be-dynamite'
  | 'map-of-the-soul'
  | 'love-yourself'
  | 'wings'
  | 'hyyh'
  | 'debut'

export interface BtsEra {
  id: BtsEraId
  season: string
  title: string
  badge: string
  description: string
  eraImageKey: string
  topTrack: { title: string; plays: number; artKey: string }
  playedThen: { title: string; artKey: string }[]
}

export const BTS_ERAS: BtsEra[] = [
  {
    id: 'proof',
    season: 'Summer 2022',
    title: 'Proof Era',
    badge: 'Top 1% listener',
    description: 'Nine years, one anthology.\nYou replayed the whole story front to back.',
    eraImageKey: 'bts-proof-door',
    topTrack: { title: 'Yet To Come', plays: 41, artKey: 'bts-proof-door' },
    playedThen: [
      { title: 'Yet To Come', artKey: 'bts-proof-door' },
      { title: 'Run BTS', artKey: 'bts-proof' },
      { title: 'For Youth', artKey: 'bts-proof' },
    ],
  },
  {
    id: 'be-dynamite',
    season: 'Fall 2020',
    title: 'BE Era',
    badge: 'Top 2% listener',
    description: 'A self-produced comfort album for a hard year,\nand a disco-pop No. 1 that never left your rotation.',
    eraImageKey: 'bts-be',
    topTrack: { title: 'Dynamite', plays: 38, artKey: 'bts-dynamite' },
    playedThen: [
      { title: 'Dynamite', artKey: 'bts-dynamite' },
      { title: 'Life Goes On', artKey: 'bts-be' },
      { title: 'Telepathy', artKey: 'bts-be' },
    ],
  },
  {
    id: 'map-of-the-soul',
    season: 'Spring 2019 – Spring 2020',
    title: 'Map of the Soul Era',
    badge: 'Top 3% listener',
    description: 'Persona, shadow, ego, a Jungian deep dive\nand your most-analyzed era of lyrics.',
    eraImageKey: 'bts-map-of-soul-7',
    topTrack: { title: 'Black Swan', plays: 29, artKey: 'bts-map-of-soul-7' },
    playedThen: [
      { title: 'ON', artKey: 'bts-map-of-soul-7' },
      { title: 'Black Swan', artKey: 'bts-map-of-soul-7' },
      { title: 'Who', artKey: 'bts-mots-journey' },
    ],
  },
  {
    id: 'love-yourself',
    season: 'Fall 2017 – Fall 2018',
    title: 'Love Yourself Era',
    badge: 'You found your era',
    description: 'DNA, Fake Love, IDOL, the global\nbreakout run that made you ARMY for good.',
    eraImageKey: 'bts-love-yourself',
    topTrack: { title: 'Fake Love', plays: 34, artKey: 'bts-love-yourself' },
    playedThen: [
      { title: 'DNA', artKey: 'bts-love-yourself' },
      { title: 'Fake Love', artKey: 'bts-love-yourself' },
      { title: 'IDOL', artKey: 'bts-love-yourself' },
    ],
  },
  {
    id: 'wings',
    season: 'Fall 2016',
    title: 'Wings Era',
    badge: 'OG ARMY',
    description: 'Darker, bolder, and built around seven solo\nstories, this is where the deep cuts started.',
    eraImageKey: 'bts-young-forever',
    topTrack: { title: 'Blood Sweat & Tears', plays: 22, artKey: 'bts-young-forever' },
    playedThen: [
      { title: 'Blood Sweat & Tears', artKey: 'bts-young-forever' },
      { title: 'Boy Meets Evil', artKey: 'bts-young-forever' },
      { title: 'Lie', artKey: 'bts-young-forever' },
    ],
  },
  {
    id: 'hyyh',
    season: 'Spring 2015 – Spring 2016',
    title: 'HYYH Era',
    badge: 'Top 5% listener',
    description: 'The Most Beautiful Moment in Life,\nyouth, freedom, and the songs that built the fandom.',
    eraImageKey: 'bts-young-forever',
    topTrack: { title: 'Young Forever', plays: 19, artKey: 'bts-young-forever' },
    playedThen: [
      { title: 'I Need U', artKey: 'bts-young-forever' },
      { title: 'Run', artKey: 'bts-young-forever' },
      { title: 'Young Forever', artKey: 'bts-young-forever' },
    ],
  },
  {
    id: 'debut',
    season: 'Summer 2013 – Winter 2014',
    title: 'You Found BTS',
    badge: 'Early listener',
    description: "Seven trainees from a small Seoul label.\nYou've been ARMY since the school trilogy.",
    eraImageKey: 'bts-alt',
    topTrack: { title: 'No More Dream', plays: 11, artKey: 'bts-alt' },
    playedThen: [
      { title: 'No More Dream', artKey: 'bts-alt' },
      { title: 'N.O', artKey: 'bts-alt' },
      { title: 'Boy In Luv', artKey: 'bts-alt' },
    ],
  },
]

export const BTS_JOURNEY_STATS = {
  minutesListened: 2940,
  longestStreakDays: 88,
  amongFriendsRank: '#1',
}

export const BTS_FAVORITE_LYRICS = [
  {
    song: 'Dynamite',
    artKey: 'bts-dynamite',
    lyric: "Cause I, I, I'm in the stars tonight\nSo watch me bring the fire and set the night alight",
    gradient: ['rgba(255,181,43,0.12)', 'rgba(200,120,10,0.6)'] as [string, string],
  },
  {
    song: 'Spring Day',
    artKey: 'bts-young-forever',
    lyric: 'The morning will come again\nNo darkness, no season lasts forever',
    gradient: ['rgba(58,90,140,0.14)', 'rgba(20,35,70,0.65)'] as [string, string],
  },
  {
    song: 'Boy With Luv',
    artKey: 'bts-love-yourself',
    lyric: "Before you, my whole world was black and white\nBut you brought all the colors in",
    gradient: ['rgba(123,45,142,0.14)', 'rgba(70,20,90,0.62)'] as [string, string],
  },
  {
    song: 'Black Swan',
    artKey: 'bts-map-of-soul-7',
    lyric: "When the heartbeat of my own music sounds louder\nthan my own heartbeat, that's the day I'll accept my death as an artist",
    gradient: ['rgba(20,10,40,0.18)', 'rgba(10,5,25,0.7)'] as [string, string],
  },
  {
    song: 'Yet To Come',
    artKey: 'bts-proof-door',
    lyric: "The best moment is yet to come\nToday, right now, is the youngest we'll ever be",
    gradient: ['rgba(74,26,114,0.14)', 'rgba(40,15,65,0.65)'] as [string, string],
  },
  {
    song: 'Young Forever',
    artKey: 'bts-young-forever',
    lyric: "Even if I stumble and fall, imma keep on runnin'\nDon't ever stop, forever we are young",
    gradient: ['rgba(58,90,140,0.14)', 'rgba(20,35,70,0.6)'] as [string, string],
  },
]

export const BTS_ERA_PLAYLISTS = [
  { title: 'ARMY Essentials', artKey: 'bts-proof-door' },
  { title: 'Bangtan Bunker', artKey: 'bts-be' },
  { title: 'Map of the Soul Rotation', artKey: 'bts-map-of-soul-7' },
]

// ── Top Albums rail ───────────────────────────────────────────────────────────

export const BTS_TOP_ALBUMS = [
  { id: 'bts-proof-2022',        title: 'Proof',                                   subtitle: 'Anthology • 2022',       artKey: 'bts-proof' },
  { id: 'bts-be-2020',           title: 'BE',                                      subtitle: 'Album • 2020',           artKey: 'bts-be' },
  { id: 'bts-mots7-2020',        title: 'Map of the Soul: 7',                      subtitle: 'Album • 2020',           artKey: 'bts-map-of-soul-7' },
  { id: 'bts-mots7-journey-2020', title: 'Map of the Soul: 7 ~The Journey~',       subtitle: 'Japanese Album • 2020',  artKey: 'bts-mots-journey' },
  { id: 'bts-mots-persona-2019', title: 'Map of the Soul: Persona',                subtitle: 'EP • 2019',              artKey: 'bts-map-of-soul-7' },
  { id: 'bts-lya-2018',          title: 'Love Yourself: Answer',                   subtitle: 'Album • 2018',           artKey: 'bts-love-yourself' },
  { id: 'bts-lyt-2018',          title: 'Love Yourself: Tear',                     subtitle: 'Album • 2018',           artKey: 'bts-love-yourself' },
  { id: 'bts-lyh-2017',          title: 'Love Yourself: Her',                      subtitle: 'EP • 2017',              artKey: 'bts-love-yourself' },
  { id: 'bts-wings-2016',        title: 'Wings',                                   subtitle: 'Album • 2016',           artKey: 'bts-young-forever' },
  { id: 'bts-youngforever-2016', title: 'Young Forever',                           subtitle: 'Repackage • 2016',       artKey: 'bts-young-forever' },
  { id: 'bts-hyyh1-2015',        title: 'The Most Beautiful Moment in Life, Pt.1', subtitle: 'EP • 2015',              artKey: 'bts-young-forever' },
  { id: 'bts-darkwild-2014',     title: 'Dark & Wild',                             subtitle: 'Album • 2014',           artKey: 'bts-alt' },
  { id: 'bts-2cool4skool-2013',  title: '2 Cool 4 Skool',                          subtitle: 'EP • 2013',              artKey: 'bts-alt' },
]

export const BTS_RELATED_PLAYLISTS = [
  { id: 'pl-army-essentials',  name: 'ARMY Essentials',           sub: 'Amazon Music', artKey: 'bts-proof-door' },
  { id: 'pl-bangtan-bunker',   name: 'Bangtan Bunker',            sub: 'ARMY',          artKey: 'bts-be' },
  { id: 'pl-kpop-dance',       name: 'K-Pop Dance Party',         sub: 'Amazon Music', artKey: 'bts-dynamite' },
  { id: 'pl-late-night-bts',   name: 'Late Night with BTS',       sub: 'Amazon Music', artKey: 'bts-young-forever' },
  { id: 'pl-mots-rotation',    name: 'Map of the Soul Rotation',  sub: 'Amazon Music', artKey: 'bts-map-of-soul-7' },
]

// ── Discography ───────────────────────────────────────────────────────────────

export interface BtsDiscographyTrack {
  title: string
  duration: string
}

export type BtsDiscographyType = 'album' | 'deluxe' | 'single' | 'ep' | 'live'

export interface BtsDiscographyRelease {
  id: string
  title: string
  year: number
  type: BtsDiscographyType
  artKey: string
  tracks?: BtsDiscographyTrack[]
}

export const BTS_DISCOGRAPHY: BtsDiscographyRelease[] = [

  // ── 2013 ─────────────────────────────────────────────────────────────────
  {
    id: 'bts-2cool4skool-2013',
    title: '2 Cool 4 Skool',
    year: 2013,
    type: 'ep',
    artKey: 'bts-alt',
    tracks: [
      { title: 'Intro: 2 Cool 4 Skool', duration: '1:53' },
      { title: 'We Are Bulletproof Pt.2', duration: '3:41' },
      { title: 'Skit: Circle Room Talk', duration: '1:12' },
      { title: 'No More Dream', duration: '3:41' },
      { title: 'Interlude', duration: '1:36' },
      { title: 'Like', duration: '3:37' },
      { title: 'Outro: Circle Room Cypher', duration: '4:29' },
    ],
  },

  // ── 2014 ─────────────────────────────────────────────────────────────────
  {
    id: 'bts-darkwild-2014',
    title: 'Dark & Wild',
    year: 2014,
    type: 'album',
    artKey: 'bts-alt',
    tracks: [
      { title: 'Danger', duration: '3:23' },
      { title: 'War of Hormone', duration: '3:45' },
      { title: 'Hip Hop Phile', duration: '4:08' },
      { title: 'Let Me Know', duration: '3:56' },
      { title: 'Rain', duration: '4:07' },
      { title: 'Could You Turn Off Your Cell Phone', duration: '3:29' },
      { title: 'Blanket Kick', duration: '3:12' },
      { title: '24/7=Heaven', duration: '3:15' },
    ],
  },

  // ── 2015 ─────────────────────────────────────────────────────────────────
  {
    id: 'bts-hyyh1-2015',
    title: 'The Most Beautiful Moment in Life, Pt. 1',
    year: 2015,
    type: 'ep',
    artKey: 'bts-young-forever',
    tracks: [
      { title: 'Intro: The Most Beautiful Moment in Life', duration: '1:56' },
      { title: 'I Need U', duration: '3:41' },
      { title: 'Boyz with Fun', duration: '3:37' },
      { title: 'Dope', duration: '3:22' },
      { title: 'Converse High', duration: '3:35' },
      { title: 'Moving On', duration: '3:52' },
      { title: 'Outro: Love Is Not Over', duration: '3:52' },
    ],
  },

  // ── 2016 ─────────────────────────────────────────────────────────────────
  {
    id: 'bts-wings-2016',
    title: 'Wings',
    year: 2016,
    type: 'album',
    artKey: 'bts-young-forever',
    tracks: [
      { title: 'Intro: Boy Meets Evil', duration: '1:57' },
      { title: 'Blood Sweat & Tears', duration: '3:37' },
      { title: 'Begin', duration: '3:23' },
      { title: 'Lie', duration: '3:23' },
      { title: 'Stigma', duration: '3:20' },
      { title: 'First Love', duration: '4:11' },
      { title: 'Reflection', duration: '3:23' },
      { title: 'MAMA', duration: '3:37' },
      { title: 'Awake', duration: '3:59' },
      { title: '21st Century Girl', duration: '3:45' },
      { title: 'Am I Wrong', duration: '3:57' },
      { title: 'Interlude: Wings', duration: '2:07' },
    ],
  },
  {
    id: 'bts-youngforever-2016',
    title: 'Young Forever',
    year: 2016,
    type: 'deluxe',
    artKey: 'bts-young-forever',
    tracks: [
      { title: 'Fire', duration: '3:08' },
      { title: 'Save Me', duration: '3:22' },
      { title: 'Epilogue: Young Forever', duration: '4:45' },
      { title: 'Run', duration: '3:39' },
      { title: 'I Need U', duration: '3:41' },
      { title: 'Butterfly', duration: '3:57' },
    ],
  },

  // ── 2017 ─────────────────────────────────────────────────────────────────
  {
    id: 'bts-lyh-2017',
    title: 'Love Yourself: Her',
    year: 2017,
    type: 'ep',
    artKey: 'bts-love-yourself',
    tracks: [
      { title: 'Intro: Serendipity', duration: '1:57' },
      { title: 'DNA', duration: '3:43' },
      { title: 'Best of Me', duration: '3:47' },
      { title: 'Dimple', duration: '3:24' },
      { title: 'Pied Piper', duration: '3:39' },
      { title: 'MIC Drop', duration: '3:10' },
      { title: 'Go Go', duration: '3:22' },
      { title: 'Outro: Her', duration: '3:18' },
    ],
  },

  // ── 2018 ─────────────────────────────────────────────────────────────────
  {
    id: 'bts-lyt-2018',
    title: 'Love Yourself: Tear',
    year: 2018,
    type: 'album',
    artKey: 'bts-love-yourself',
    tracks: [
      { title: 'Intro: Singularity', duration: '3:38' },
      { title: 'Fake Love', duration: '4:03' },
      { title: 'The Truth Untold', duration: '3:59' },
      { title: '134340', duration: '3:47' },
      { title: 'Paradise', duration: '3:23' },
      { title: 'Love Maze', duration: '3:37' },
      { title: 'Magic Shop', duration: '3:54' },
      { title: 'Airplane Pt.2', duration: '3:37' },
      { title: 'So What', duration: '3:31' },
      { title: 'Outro: Tear', duration: '3:57' },
    ],
  },
  {
    id: 'bts-lya-2018',
    title: 'Love Yourself: Answer',
    year: 2018,
    type: 'deluxe',
    artKey: 'bts-love-yourself',
    tracks: [
      { title: 'Euphoria', duration: '3:58' },
      { title: 'Trivia: Just Dance', duration: '2:59' },
      { title: 'Serendipity (Full Length Edition)', duration: '4:03' },
      { title: 'DNA', duration: '3:43' },
      { title: 'Dimple', duration: '3:24' },
      { title: 'IDOL', duration: '3:39' },
      { title: 'Trivia: Love', duration: '3:15' },
      { title: 'Epiphany', duration: '3:53' },
      { title: "I'm Fine", duration: '3:52' },
      { title: 'IDOL (feat. Nicki Minaj)', duration: '3:39' },
    ],
  },

  // ── 2019 ─────────────────────────────────────────────────────────────────
  {
    id: 'bts-mots-persona-2019',
    title: 'Map of the Soul: Persona',
    year: 2019,
    type: 'ep',
    artKey: 'bts-map-of-soul-7',
    tracks: [
      { title: 'Intro: Persona', duration: '2:45' },
      { title: 'Boy With Luv (feat. Halsey)', duration: '3:49' },
      { title: 'Mikrokosmos', duration: '3:52' },
      { title: 'Make It Right', duration: '3:19' },
      { title: 'HOME', duration: '3:56' },
      { title: 'Jamais Vu', duration: '3:37' },
      { title: 'Dionysus', duration: '4:10' },
    ],
  },

  // ── 2020 ─────────────────────────────────────────────────────────────────
  {
    id: 'bts-mots7-2020',
    title: 'Map of the Soul: 7',
    year: 2020,
    type: 'album',
    artKey: 'bts-map-of-soul-7',
    tracks: [
      { title: 'Interlude: Shadow', duration: '2:36' },
      { title: 'Black Swan', duration: '3:35' },
      { title: 'Filter', duration: '3:13' },
      { title: 'My Time', duration: '3:33' },
      { title: 'Louder than Bombs', duration: '3:47' },
      { title: 'ON', duration: '4:06' },
      { title: 'UGH!', duration: '3:03' },
      { title: '00:00 (Zero O\'Clock)', duration: '3:49' },
      { title: 'Inner Child', duration: '3:52' },
      { title: 'Friends', duration: '3:28' },
      { title: 'Moon', duration: '3:24' },
      { title: 'Respect', duration: '3:16' },
      { title: 'We Are Bulletproof: The Eternal', duration: '3:52' },
      { title: 'Outro: Ego', duration: '4:22' },
      { title: 'ON (feat. Sia)', duration: '4:06' },
    ],
  },
  {
    id: 'bts-mots7-journey-2020',
    title: 'Map of the Soul: 7 ~The Journey~',
    year: 2020,
    type: 'album',
    artKey: 'bts-mots-journey',
    tracks: [
      { title: 'Line', duration: '3:07' },
      { title: 'Stay Gold', duration: '4:04' },
      { title: 'Your Eyes Tell', duration: '3:55' },
      { title: 'Who', duration: '3:26' },
      { title: 'Bird', duration: '3:41' },
      { title: 'Interlude: Set Me Free', duration: '3:36' },
    ],
  },
  {
    id: 'bts-dynamite-2020',
    title: 'Dynamite',
    year: 2020,
    type: 'single',
    artKey: 'bts-dynamite',
  },
  {
    id: 'bts-be-2020',
    title: 'BE',
    year: 2020,
    type: 'album',
    artKey: 'bts-be',
    tracks: [
      { title: 'Life Goes On', duration: '3:46' },
      { title: 'Fly To My Room', duration: '3:32' },
      { title: 'Blue & Grey', duration: '4:12' },
      { title: 'Telepathy', duration: '2:45' },
      { title: 'Dis-ease', duration: '3:26' },
      { title: 'Stay', duration: '3:22' },
      { title: 'Dynamite', duration: '3:19' },
    ],
  },

  // ── 2021 ─────────────────────────────────────────────────────────────────
  {
    id: 'bts-butter-2021',
    title: 'Butter',
    year: 2021,
    type: 'single',
    artKey: 'bts-dynamite',
  },

  // ── 2022 ─────────────────────────────────────────────────────────────────
  {
    id: 'bts-proof-2022',
    title: 'Proof',
    year: 2022,
    type: 'deluxe',
    artKey: 'bts-proof',
    tracks: [
      { title: 'Born Singer', duration: '3:52' },
      { title: 'No More Dream', duration: '3:41' },
      { title: 'I Need U', duration: '3:41' },
      { title: 'Epilogue: Young Forever', duration: '4:45' },
      { title: 'Blood Sweat & Tears', duration: '3:37' },
      { title: 'Spring Day', duration: '4:34' },
      { title: 'DNA', duration: '3:43' },
      { title: 'FAKE LOVE', duration: '4:03' },
      { title: 'IDOL', duration: '3:39' },
      { title: 'Boy With Luv (feat. Halsey)', duration: '3:49' },
      { title: 'ON', duration: '4:06' },
      { title: 'Black Swan', duration: '3:35' },
      { title: 'Dynamite', duration: '3:19' },
      { title: 'Butter', duration: '2:44' },
      { title: 'Yet To Come', duration: '3:14' },
      { title: 'Run BTS', duration: '3:11' },
      { title: 'For Youth', duration: '4:00' },
      { title: 'Moon', duration: '3:24' },
    ],
  },
]
