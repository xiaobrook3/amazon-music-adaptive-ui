// Taylor Swift artist page data — mirrors the shape of oliviaRodrigoPage.ts
// so TaylorSwiftArtistScreen can import it the same way the Olivia screen
// imports its data. All art keys resolve through albumArtAssets in assetMap.ts.

export type TaylorEraId =
  | 'showgirl'
  | 'ttpd'
  | 'midnights'
  | 'folklore'
  | 'lover'
  | 'reputation'
  | 'debut'

export interface TaylorEra {
  id: TaylorEraId
  season: string
  title: string
  badge: string
  description: string
  eraImageKey: string
  topTrack: { title: string; plays: number; artKey: string }
  playedThen: { title: string; artKey: string }[]
}

export const TAYLOR_ERAS: TaylorEra[] = [
  {
    id: 'showgirl',
    season: 'Spring 2026',
    title: 'Showgirl Era',
    badge: 'Top 1% listener',
    description: 'You were first in line for the spectacle.\nEncore after encore after encore.',
    eraImageKey: 'ts-showgirl-life',
    topTrack: { title: 'The Life of a Showgirl', plays: 14, artKey: 'ts-showgirl-life' },
    playedThen: [
      { title: 'The Life of a Showgirl', artKey: 'ts-showgirl-life' },
      { title: 'Standing Ovation', artKey: 'ts-showgirl-life' },
      { title: 'Opening Night', artKey: 'ts-showgirl-life' },
    ],
  },
  {
    id: 'ttpd',
    season: 'Spring 2024',
    title: 'Tortured Poets Era',
    badge: 'Top 2% listener',
    description: 'You needed every word of this one.\nThe poet at the typewriter keys.',
    eraImageKey: 'ts-tortured-poets',
    topTrack: { title: 'Fortnight', plays: 22, artKey: 'ts-tortured-poets' },
    playedThen: [
      { title: 'Fortnight', artKey: 'ts-tortured-poets' },
      { title: 'So Long, London', artKey: 'ts-tortured-poets' },
      { title: 'Down Bad', artKey: 'ts-tortured-poets' },
    ],
  },
  {
    id: 'midnights',
    season: 'Fall 2022',
    title: 'Midnights Era',
    badge: 'Top 3% listener',
    description: 'You stayed up past midnight and\nmade every sleepless hour count.',
    eraImageKey: 'ts-1989-polaroid',
    topTrack: { title: 'Anti-Hero', plays: 31, artKey: 'ts-1989-polaroid' },
    playedThen: [
      { title: 'Anti-Hero', artKey: 'ts-1989-polaroid' },
      { title: 'Lavender Haze', artKey: 'ts-1989-polaroid' },
      { title: 'Bejeweled', artKey: 'ts-1989-polaroid' },
    ],
  },
  {
    id: 'folklore',
    season: 'Summer 2020',
    title: 'Folklore Era',
    badge: 'Top 5% listener',
    description: 'Indie and introspective — you were in\nthe woods, in the cabin, in the feeling.',
    eraImageKey: 'ts-1989-polaroid',
    topTrack: { title: 'cardigan', plays: 28, artKey: 'ts-1989-polaroid' },
    playedThen: [
      { title: 'cardigan', artKey: 'ts-1989-polaroid' },
      { title: 'august', artKey: 'ts-1989-polaroid' },
      { title: 'exile', artKey: 'ts-1989-polaroid' },
    ],
  },
  {
    id: 'lover',
    season: 'Fall 2019',
    title: 'Lover Era',
    badge: 'You found your era',
    description: 'Pastel pop and heart-on-sleeve anthems.\nCruel Summer on repeat all season.',
    eraImageKey: 'ts-lover',
    topTrack: { title: 'Cruel Summer', plays: 34, artKey: 'ts-lover' },
    playedThen: [
      { title: 'Cruel Summer', artKey: 'ts-lover' },
      { title: 'Lover', artKey: 'ts-lover' },
      { title: 'The Archer', artKey: 'ts-lover' },
    ],
  },
  {
    id: 'reputation',
    season: 'Winter 2017',
    title: 'Reputation Era',
    badge: 'OG Swiftie',
    description: 'Dark, bold, and unapologetic.\nYou were in the snake pit from day one.',
    eraImageKey: 'ts-reputation',
    topTrack: { title: 'Look What You Made Me Do', plays: 18, artKey: 'ts-reputation' },
    playedThen: [
      { title: 'Look What You Made Me Do', artKey: 'ts-reputation' },
      { title: 'Delicate', artKey: 'ts-reputation' },
      { title: 'Getaway Car', artKey: 'ts-reputation' },
    ],
  },
  {
    id: 'debut',
    season: 'Spring 2015',
    title: 'You Found Taylor',
    badge: 'Early listener',
    description: "The song that started it all.\nYou've been there since the beginning.",
    eraImageKey: 'ts-1989',
    topTrack: { title: 'Blank Space', plays: 12, artKey: 'ts-1989' },
    playedThen: [
      { title: 'Blank Space', artKey: 'ts-1989' },
      { title: 'Shake It Off', artKey: 'ts-1989' },
      { title: 'Style', artKey: 'ts-1989' },
    ],
  },
]

export const TAYLOR_JOURNEY_STATS = {
  minutesListened: 3180,
  longestStreakDays: 94,
  amongFriendsRank: '#1',
}

export const TAYLOR_FAVORITE_LYRICS = [
  {
    song: 'All Too Well',
    artKey: 'tswift-1',
    lyric: "You keep my old scarf from that very first week\n'cause it reminds you of innocence",
    gradient: ['rgba(139,26,26,0.12)', 'rgba(100,20,20,0.6)'] as [string, string],
  },
  {
    song: 'Cruel Summer',
    artKey: 'ts-lover',
    lyric: "I love you, ain't that the worst thing you ever heard?",
    gradient: ['rgba(37,209,218,0.10)', 'rgba(37,209,218,0.52)'] as [string, string],
  },
  {
    song: 'cardigan',
    artKey: 'ts-1989-polaroid',
    lyric: "And when I felt like I was an old cardigan\nunder someone's bed",
    gradient: ['rgba(58,58,58,0.18)', 'rgba(20,20,20,0.65)'] as [string, string],
  },
  {
    song: 'Anti-Hero',
    artKey: 'ts-tortured-poets',
    lyric: "It's me, hi\nI'm the problem, it's me",
    gradient: ['rgba(10,10,46,0.18)', 'rgba(5,5,30,0.7)'] as [string, string],
  },
]

export const TAYLOR_ERA_PLAYLISTS = [
  { title: 'Swiftie Essentials', artKey: 'ts-showgirl' },
  { title: 'The Folklore Cabin', artKey: 'ts-1989-polaroid' },
  { title: 'Midnight Rotation', artKey: 'ts-tortured-poets' },
]

// ── Top Albums rail ───────────────────────────────────────────────────────────

export const TAYLOR_TOP_ALBUMS = [
  { id: 'ts-showgirl-2025',    title: 'The Life of a Showgirl',             subtitle: 'Album • 2025',           artKey: 'ts-showgirl-life' },
  { id: 'ts-ttpd-2024',        title: 'The Tortured Poets Department',       subtitle: 'Album • 2024',           artKey: 'ts-tortured-poets' },
  { id: 'ts-midnights-2022',   title: 'Midnights',                          subtitle: 'Album • 2022',           artKey: 'ts-1989-polaroid' },
  { id: 'ts-evermore-2020',    title: 'evermore',                           subtitle: 'Album • 2020',           artKey: 'ts-1989-polaroid' },
  { id: 'ts-folklore-2020',    title: 'folklore',                           subtitle: 'Album • 2020',           artKey: 'ts-1989-polaroid' },
  { id: 'ts-lover-2019',       title: 'Lover',                              subtitle: 'Album • 2019',           artKey: 'ts-lover' },
  { id: 'ts-rep-2017',         title: 'reputation',                         subtitle: 'Album • 2017',           artKey: 'ts-reputation' },
  { id: 'ts-1989-2014',        title: '1989',                               subtitle: 'Album • 2014',           artKey: 'ts-1989' },
  { id: 'ts-1989tv-2023',      title: "1989 (Taylor's Version)",            subtitle: "Taylor's Version • 2023", artKey: 'ts-1989' },
  { id: 'ts-red-tv-2021',      title: "Red (Taylor's Version)",             subtitle: "Taylor's Version • 2021", artKey: 'tswift-1' },
  { id: 'ts-fearless-tv-2021', title: "Fearless (Taylor's Version)",        subtitle: "Taylor's Version • 2021", artKey: 'tswift-1' },
  { id: 'ts-eras-tour',        title: 'The Eras Tour',                      subtitle: 'Concert Film • 2023',    artKey: 'ts-showgirl' },
]

export const TAYLOR_RELATED_PLAYLISTS = [
  { id: 'pl-swiftie',        name: 'Swiftie Essentials',      sub: 'Amazon Music',  artKey: 'ts-lover' },
  { id: 'pl-taylors-bridge', name: "Taylor's Bridge Club",    sub: 'Swifties',      artKey: 'ts-reputation' },
  { id: 'pl-sad-girl',       name: 'Sad Girl Autumn',         sub: 'Amazon Music',  artKey: 'ts-1989-polaroid' },
  { id: 'pl-country-pop',    name: 'Country Pop Classics',    sub: 'Amazon Music',  artKey: 'tswift-1' },
  { id: 'pl-midnight',       name: 'Midnight Feelings',       sub: 'Amazon Music',  artKey: 'ts-tortured-poets' },
]

// ── Discography ───────────────────────────────────────────────────────────────

export interface TaylorDiscographyTrack {
  title: string
  duration: string
}

export type TaylorDiscographyType = 'album' | 'deluxe' | 'single' | 'ep' | 'live'

export interface TaylorDiscographyRelease {
  id: string
  title: string
  year: number
  type: TaylorDiscographyType
  artKey: string
  tracks?: TaylorDiscographyTrack[]
}

export const TAYLOR_DISCOGRAPHY: TaylorDiscographyRelease[] = [

  // ── 2006 ─────────────────────────────────────────────────────────────────
  {
    id: 'ts-debut-2006',
    title: 'Taylor Swift',
    year: 2006,
    type: 'album',
    artKey: 'tswift-1',
    tracks: [
      { title: 'Tim McGraw', duration: '3:52' },
      { title: 'Picture to Burn', duration: '3:23' },
      { title: 'Teardrops on My Guitar', duration: '3:33' },
      { title: 'A Place in This World', duration: '3:22' },
      { title: 'Cold as You', duration: '4:01' },
      { title: 'The Outside', duration: '3:36' },
      { title: 'Tied Together with a Smile', duration: '4:24' },
      { title: "Stay Beautiful", duration: '3:58' },
      { title: "Should've Said No", duration: '3:50' },
      { title: 'Mary\'s Song (Oh My My My)', duration: '3:34' },
      { title: 'Our Song', duration: '3:22' },
    ],
  },

  // ── 2008 ─────────────────────────────────────────────────────────────────
  {
    id: 'ts-fearless-2008',
    title: 'Fearless',
    year: 2008,
    type: 'album',
    artKey: 'tswift-1',
    tracks: [
      { title: 'Fearless', duration: '4:01' },
      { title: 'Fifteen', duration: '4:54' },
      { title: 'Love Story', duration: '3:55' },
      { title: 'Hey Stephen', duration: '4:13' },
      { title: 'White Horse', duration: '3:54' },
      { title: 'You Belong With Me', duration: '3:51' },
      { title: 'Breathe', duration: '4:24' },
      { title: 'Tell Me Why', duration: '3:20' },
      { title: "You're Not Sorry", duration: '4:03' },
      { title: 'The Way I Loved You', duration: '4:03' },
      { title: 'Forever & Always', duration: '3:46' },
      { title: 'The Best Day', duration: '4:05' },
      { title: 'Change', duration: '4:32' },
    ],
  },

  // ── 2010 ─────────────────────────────────────────────────────────────────
  {
    id: 'ts-speaknow-2010',
    title: 'Speak Now',
    year: 2010,
    type: 'album',
    artKey: 'tswift-1',
    tracks: [
      { title: 'Mine', duration: '3:51' },
      { title: 'Sparks Fly', duration: '4:19' },
      { title: 'Back to December', duration: '4:35' },
      { title: 'Speak Now', duration: '4:00' },
      { title: 'Dear John', duration: '6:44' },
      { title: 'Mean', duration: '3:58' },
      { title: 'The Story of Us', duration: '4:26' },
      { title: 'Never Grow Up', duration: '4:52' },
      { title: 'Enchanted', duration: '5:52' },
      { title: 'Better Than Revenge', duration: '3:37' },
      { title: 'Innocent', duration: '5:06' },
      { title: 'Haunted', duration: '4:03' },
      { title: 'Last Kiss', duration: '6:07' },
      { title: 'Long Live', duration: '5:17' },
    ],
  },

  // ── 2012 ─────────────────────────────────────────────────────────────────
  {
    id: 'ts-red-2012',
    title: 'Red',
    year: 2012,
    type: 'album',
    artKey: 'tswift-1',
    tracks: [
      { title: 'State of Grace', duration: '4:55' },
      { title: 'Red', duration: '3:40' },
      { title: 'Treacherous', duration: '4:01' },
      { title: 'I Knew You Were Trouble', duration: '3:39' },
      { title: 'All Too Well', duration: '5:29' },
      { title: '22', duration: '3:52' },
      { title: 'I Almost Do', duration: '4:05' },
      { title: 'We Are Never Ever Getting Back Together', duration: '3:13' },
      { title: 'Stay Stay Stay', duration: '3:14' },
      { title: 'The Last Time', duration: '5:13' },
      { title: 'Holy Ground', duration: '3:23' },
      { title: 'Sad Beautiful Tragic', duration: '4:22' },
      { title: 'The Lucky One', duration: '4:59' },
      { title: 'Everything Has Changed', duration: '4:05' },
      { title: 'Starlight', duration: '3:40' },
      { title: 'Begin Again', duration: '3:58' },
    ],
  },

  // ── 2014 ─────────────────────────────────────────────────────────────────
  {
    id: 'ts-1989-2014',
    title: '1989',
    year: 2014,
    type: 'album',
    artKey: 'ts-1989',
    tracks: [
      { title: 'Welcome to New York', duration: '3:32' },
      { title: 'Blank Space', duration: '3:51' },
      { title: 'Style', duration: '3:51' },
      { title: 'Out of the Woods', duration: '3:55' },
      { title: 'All You Had to Do Was Stay', duration: '3:14' },
      { title: 'Shake It Off', duration: '3:39' },
      { title: 'I Wish You Would', duration: '3:27' },
      { title: 'Bad Blood', duration: '3:31' },
      { title: 'Wildest Dreams', duration: '3:40' },
      { title: 'How You Get the Girl', duration: '4:08' },
      { title: 'This Love', duration: '4:10' },
      { title: 'Clean', duration: '4:31' },
      { title: 'New Romantics', duration: '3:50' },
    ],
  },

  // ── 2017 ─────────────────────────────────────────────────────────────────
  {
    id: 'ts-reputation-2017',
    title: 'reputation',
    year: 2017,
    type: 'album',
    artKey: 'ts-reputation',
    tracks: [
      { title: '...Ready for It?', duration: '3:28' },
      { title: 'End Game', duration: '4:04' },
      { title: 'I Did Something Bad', duration: '3:58' },
      { title: "Don't Blame Me", duration: '3:56' },
      { title: 'Delicate', duration: '3:52' },
      { title: 'Look What You Made Me Do', duration: '3:31' },
      { title: 'So It Goes...', duration: '3:34' },
      { title: 'Gorgeous', duration: '3:29' },
      { title: 'Getaway Car', duration: '3:13' },
      { title: 'King of My Heart', duration: '3:34' },
      { title: 'Dancing with Our Hands Tied', duration: '3:31' },
      { title: 'Dress', duration: '3:50' },
      { title: 'This Is Why We Can\'t Have Nice Things', duration: '3:27' },
      { title: 'Call It What You Want', duration: '3:23' },
      { title: "New Year's Day", duration: '3:55' },
    ],
  },

  // ── 2019 ─────────────────────────────────────────────────────────────────
  {
    id: 'ts-lover-2019',
    title: 'Lover',
    year: 2019,
    type: 'album',
    artKey: 'ts-lover',
    tracks: [
      { title: 'I Forgot That You Existed', duration: '2:54' },
      { title: 'Cruel Summer', duration: '2:58' },
      { title: 'Lover', duration: '3:41' },
      { title: 'The Man', duration: '3:10' },
      { title: 'The Archer', duration: '3:31' },
      { title: 'I Think He Knows', duration: '2:53' },
      { title: 'Miss Americana & the Heartbreak Prince', duration: '3:54' },
      { title: 'Paper Rings', duration: '3:42' },
      { title: 'Cornelia Street', duration: '4:44' },
      { title: 'Death By a Thousand Cuts', duration: '4:04' },
      { title: 'London Boy', duration: '3:10' },
      { title: "'Soon You\'ll Get Better'", duration: '3:23' },
      { title: 'False God', duration: '3:19' },
      { title: 'You Need to Calm Down', duration: '2:51' },
      { title: 'Afterglow', duration: '3:43' },
      { title: 'ME!', duration: '3:13' },
      { title: 'It\'s Nice to Have a Friend', duration: '2:30' },
      { title: 'Daylight', duration: '4:53' },
    ],
  },

  // ── 2020 ─────────────────────────────────────────────────────────────────
  {
    id: 'ts-folklore-2020',
    title: 'folklore',
    year: 2020,
    type: 'album',
    artKey: 'ts-1989-polaroid',
    tracks: [
      { title: 'the 1', duration: '3:31' },
      { title: 'cardigan', duration: '3:59' },
      { title: 'the last great american dynasty', duration: '4:01' },
      { title: 'exile', duration: '4:45' },
      { title: 'my tears ricochet', duration: '4:15' },
      { title: 'mirrorball', duration: '3:28' },
      { title: 'seven', duration: '2:55' },
      { title: 'august', duration: '4:21' },
      { title: 'this is me trying', duration: '3:13' },
      { title: 'illicit affairs', duration: '3:09' },
      { title: 'invisible string', duration: '4:12' },
      { title: 'mad woman', duration: '3:57' },
      { title: 'epiphany', duration: '5:04' },
      { title: 'betty', duration: '4:54' },
      { title: 'peace', duration: '3:54' },
      { title: 'hoax', duration: '3:40' },
    ],
  },
  {
    id: 'ts-evermore-2020',
    title: 'evermore',
    year: 2020,
    type: 'album',
    artKey: 'ts-1989-polaroid',
    tracks: [
      { title: 'willow', duration: '3:34' },
      { title: 'champagne problems', duration: '4:04' },
      { title: 'gold rush', duration: '3:04' },
      { title: "'tis the damn season", duration: '3:47' },
      { title: 'tolerate it', duration: '4:05' },
      { title: "no body no crime", duration: '3:36' },
      { title: 'happiness', duration: '5:17' },
      { title: 'dorothea', duration: '3:28' },
      { title: 'coney island', duration: '4:26' },
      { title: 'ivy', duration: '4:29' },
      { title: 'cowboy like me', duration: '5:17' },
      { title: 'long story short', duration: '3:49' },
      { title: 'marjorie', duration: '4:18' },
      { title: 'closure', duration: '3:02' },
      { title: 'evermore', duration: '5:04' },
    ],
  },

  // ── 2021 ─────────────────────────────────────────────────────────────────
  {
    id: 'ts-fearless-tv-2021',
    title: "Fearless (Taylor's Version)",
    year: 2021,
    type: 'album',
    artKey: 'tswift-1',
    tracks: [
      { title: 'Fearless (Taylor\'s Version)', duration: '4:00' },
      { title: 'Fifteen (Taylor\'s Version)', duration: '4:54' },
      { title: 'Love Story (Taylor\'s Version)', duration: '3:55' },
      { title: 'Hey Stephen (Taylor\'s Version)', duration: '4:14' },
      { title: 'White Horse (Taylor\'s Version)', duration: '3:54' },
      { title: 'You Belong With Me (Taylor\'s Version)', duration: '3:52' },
      { title: "You're Not Sorry (Taylor's Version)", duration: '4:05' },
      { title: 'The Story of Us (From the Vault)', duration: '4:25' },
      { title: 'Mr. Perfectly Fine (From the Vault)', duration: '4:08' },
    ],
  },
  {
    id: 'ts-red-tv-2021',
    title: "Red (Taylor's Version)",
    year: 2021,
    type: 'album',
    artKey: 'tswift-1',
    tracks: [
      { title: 'State of Grace (Taylor\'s Version)', duration: '4:55' },
      { title: 'Red (Taylor\'s Version)', duration: '3:39' },
      { title: 'Treacherous (Taylor\'s Version)', duration: '4:00' },
      { title: 'I Knew You Were Trouble (Taylor\'s Version)', duration: '3:37' },
      { title: 'All Too Well (10 Minute Version) (Taylor\'s Version)', duration: '10:13' },
      { title: '22 (Taylor\'s Version)', duration: '3:52' },
      { title: 'We Are Never Ever Getting Back Together (Taylor\'s Version)', duration: '3:13' },
      { title: 'Everything Has Changed (Taylor\'s Version)', duration: '4:05' },
    ],
  },

  // ── 2022 ─────────────────────────────────────────────────────────────────
  {
    id: 'ts-midnights-2022',
    title: 'Midnights',
    year: 2022,
    type: 'album',
    artKey: 'ts-1989-polaroid',
    tracks: [
      { title: 'Lavender Haze', duration: '3:22' },
      { title: 'Maroon', duration: '3:38' },
      { title: 'Anti-Hero', duration: '3:20' },
      { title: 'Snow on the Beach', duration: '4:16' },
      { title: 'Midnight Rain', duration: '2:54' },
      { title: 'Question...?', duration: '3:06' },
      { title: 'Vigilante Shit', duration: '2:44' },
      { title: 'Bejeweled', duration: '3:13' },
      { title: 'Labyrinth', duration: '4:08' },
      { title: 'Karma', duration: '3:25' },
      { title: "Sweet Nothing", duration: '3:08' },
      { title: 'Mastermind', duration: '3:11' },
    ],
  },

  // ── 2023 ─────────────────────────────────────────────────────────────────
  {
    id: 'ts-1989-tv-2023',
    title: "1989 (Taylor's Version)",
    year: 2023,
    type: 'album',
    artKey: 'ts-1989',
    tracks: [
      { title: "Welcome to New York (Taylor's Version)", duration: '3:32' },
      { title: "Blank Space (Taylor's Version)", duration: '3:51' },
      { title: "Style (Taylor's Version)", duration: '3:51' },
      { title: "Shake It Off (Taylor's Version)", duration: '3:39' },
      { title: "Bad Blood (Taylor's Version)", duration: '3:31' },
      { title: "Wildest Dreams (Taylor's Version)", duration: '3:40' },
      { title: "New Romantics (Taylor's Version)", duration: '3:50' },
      { title: "Say Don't Go (From the Vault)", duration: '3:16' },
      { title: "Now That We Don't Talk (From the Vault)", duration: '2:46' },
      { title: "Suburban Legends (From the Vault)", duration: '3:18' },
      { title: "Is It Over Now? (From the Vault)", duration: '3:50' },
    ],
  },
  {
    id: 'ts-eras-tour-2023',
    title: 'The Eras Tour (Taylor\'s Version)',
    year: 2023,
    type: 'live',
    artKey: 'ts-showgirl',
    tracks: [
      { title: 'Miss Americana & the Heartbreak Prince (Live)', duration: '4:01' },
      { title: 'Cruel Summer (Live)', duration: '3:14' },
      { title: 'The Man (Live)', duration: '3:15' },
      { title: 'You Belong With Me (Live)', duration: '3:52' },
      { title: 'Love Story (Live)', duration: '3:57' },
      { title: 'cardigan (Live)', duration: '4:04' },
      { title: 'Anti-Hero (Live)', duration: '3:27' },
      { title: 'Karma (Live)', duration: '3:28' },
      { title: 'Look What You Made Me Do (Live)', duration: '3:34' },
      { title: 'Shake It Off (Live)', duration: '3:42' },
    ],
  },

  // ── 2024 ─────────────────────────────────────────────────────────────────
  {
    id: 'ts-ttpd-2024',
    title: 'The Tortured Poets Department',
    year: 2024,
    type: 'album',
    artKey: 'ts-tortured-poets',
    tracks: [
      { title: 'Fortnight', duration: '3:48' },
      { title: 'The Tortured Poets Department', duration: '5:02' },
      { title: 'My Boy Only Breaks His Favorite Toys', duration: '3:26' },
      { title: 'Down Bad', duration: '4:11' },
      { title: 'So Long, London', duration: '4:09' },
      { title: 'But Daddy I Love Him', duration: '5:02' },
      { title: 'Fresh Out the Slammer', duration: '3:02' },
      { title: 'Florida!!!', duration: '3:45' },
      { title: 'Guilty as Sin?', duration: '4:46' },
      { title: 'Who\'s Afraid of Little Old Me?', duration: '4:07' },
      { title: 'I Can Fix Him (No Really I Can)', duration: '3:13' },
      { title: 'loml', duration: '4:17' },
      { title: 'I Can Do It With a Broken Heart', duration: '3:14' },
      { title: 'The Smallest Man Who Ever Lived', duration: '3:17' },
      { title: 'The Alchemy', duration: '3:18' },
      { title: 'Clara Bow', duration: '4:02' },
    ],
  },
  {
    id: 'ts-ttpd-anthology-2024',
    title: 'The Tortured Poets Department: The Anthology',
    year: 2024,
    type: 'deluxe',
    artKey: 'ts-tortured-poets',
    tracks: [
      { title: 'The Black Dog', duration: '4:22' },
      { title: 'imgonnagetyouback', duration: '3:03' },
      { title: 'The Albatross', duration: '3:53' },
      { title: 'Chloe or Sam or Sophia or Marcus', duration: '4:47' },
      { title: 'How Did It End?', duration: '4:11' },
      { title: 'So High School', duration: '3:49' },
      { title: "I Hate It Here", duration: '3:32' },
      { title: "thanK you aIMee", duration: '3:31' },
      { title: 'The Manuscript', duration: '5:10' },
    ],
  },

  // ── 2025 ─────────────────────────────────────────────────────────────────
  {
    id: 'ts-showgirl-2025',
    title: 'The Life of a Showgirl',
    year: 2025,
    type: 'album',
    artKey: 'ts-showgirl-life',
    tracks: [
      { title: 'The Life of a Showgirl', duration: '3:52' },
      { title: 'Opening Night', duration: '3:44' },
      { title: 'Standing Ovation', duration: '3:31' },
      { title: 'Curtain Call', duration: '4:02' },
      { title: 'Encore', duration: '3:18' },
      { title: 'Spotlight', duration: '3:55' },
      { title: 'Stage Fright', duration: '4:11' },
      { title: 'The Critics', duration: '3:28' },
      { title: 'Intermission', duration: '2:47' },
      { title: 'Bow', duration: '5:03' },
    ],
  },
]
