export type Mood = 'idle' | 'sad' | 'hype' | 'chill' | 'happy' | 'love' | 'sleepy' | 'angry' | 'anxious' | 'surprised'
export type BondTier = 'casual' | 'fan' | 'devoted' | 'legendary'
export type Rarity = 'common' | 'rare' | 'legendary'
export type CharacterVariant = 'kpop' | 'indie' | 'latenight' | 'hiphop'

export type WearableOverlay = 'sunglasses' | 'chain' | 'crown' | 'bow' | 'hat'

export interface Trinket {
  id: string
  name: string
  artistId: string
  description: string
  unlockCondition: string
  unlockThreshold: number
  currentProgress: number
  emoji: string
  locked: boolean
  rarity: Rarity
  earnedDate?: string
  wearableOverlay?: WearableOverlay
}

export interface Milestone {
  id: string
  artistId: string
  tier: 1 | 2 | 3 | 4
  tierLabel: BondTier
  label: string
  currentValue: number
  targetValue: number
  rewardTrinketId: string
}

export interface EvolutionEntry {
  id: string
  date: string
  label: string
  detail: string
  type: 'rank' | 'trinket' | 'identity' | 'milestone'
  icon: string
}

export interface Identity {
  id: string
  label: string
  characterVariant: CharacterVariant
  colorAccent: string
  glowClass: string
  stats: {
    streams: number
    topPercent: number
    artistsCovered: number
    weeksActive: number
  }
  unlockedTrinketIds: string[]
  milestoneIds: string[]
  evolutionLog: EvolutionEntry[]
  description: string
}

export interface Artist {
  id: string
  name: string
  genre: string
  userBondWeeks: number
  streamCount: number
  topPercent: number
  milestoneTierId: BondTier
  isSmallerArtist: boolean
  bio: string
  monthlyListeners: number
  imageUri?: string
  isVerified?: boolean
}

export type AudioBadge = 'SD' | 'DOLBY_ATMOS' | '360_REALITY_AUDIO'

export interface Song {
  id: string
  title: string
  artistId: string
  artistName: string
  album: string
  duration: string
  mood: Mood | 'happy' | 'chill'
  albumArtColor: string
  albumArtPath?: string
  audioBadge?: AudioBadge | null
  isExclusive?: boolean
}

export interface Playlist {
  id: string
  name: string
  songCount?: number
  totalDuration?: string
  coverArtPath?: string
  // Who made the playlist — drives the byline on the playlist page:
  //   'amazon' → "Curated by Amazon Music"; 'artist'/'user' → "By {curatorName}".
  curatorType?: 'amazon' | 'artist' | 'user'
  curatorName?: string
  // Legacy fields
  ownerId?: string
  ownerName?: string
  songIds?: string[]
  description?: string
}

export interface FanGroup {
  id: string
  name: string
  artistId?: string
  coverArtPath?: string
  memberCount: number
}

export interface Podcast {
  id: string
  title: string
  host: string
  description: string
  episodeCount: number
  coverColor: string
  coverArtPath?: string
  category: string
}

export interface Announcement {
  id: string
  type: 'tour' | 'release' | 'milestone'
  artistId: string
  headline: string
  body: string
  ctaLabel: string
  ctaRoute: string
  gradientFrom: string
  gradientTo: string
  dates?: string[]
}

// TRINKETS
export const trinkets: Trinket[] = [
  {
    id: 't1',
    name: 'ARMY Bomb',
    artistId: 'bts',
    description: 'The legendary light stick of the ARMY. Earned by reaching 1,000 BTS streams.',
    unlockCondition: '1,000 BTS streams',
    unlockThreshold: 1000,
    currentProgress: 1000,
    emoji: '\u{1F49C}',
    locked: false,
    rarity: 'rare',
    earnedDate: 'Mar 2024',
  },
  {
    id: 't2',
    name: 'Map of the Soul Badge',
    artistId: 'bts',
    description: 'A limited badge for listeners who explored the full Map of the Soul album.',
    unlockCondition: 'Stream all 7 MOTS songs',
    unlockThreshold: 7,
    currentProgress: 7,
    emoji: '\u{1F5FA}\uFE0F',
    locked: false,
    rarity: 'common',
    earnedDate: 'Jan 2024',
  },
  {
    id: 't3',
    name: 'World Tour Pin',
    artistId: 'bts',
    description: 'Exclusive pin for fans who listened during the World Tour announcement week.',
    unlockCondition: 'Listen during tour announcement',
    unlockThreshold: 1,
    currentProgress: 1,
    emoji: '\u{1F4CD}',
    locked: false,
    rarity: 'legendary',
    earnedDate: 'Jun 2024',
  },
  {
    id: 't4',
    name: 'Butter Crown',
    artistId: 'bts',
    description: 'A golden crown for reaching Top 1% of BTS listeners globally.',
    unlockCondition: 'Reach Top 1% BTS listeners',
    unlockThreshold: 1,
    currentProgress: 1,
    emoji: '\u{1F451}',
    locked: false,
    rarity: 'legendary',
    earnedDate: 'Apr 2024',
  },
  {
    id: 't5',
    name: 'Idol Stage Mic',
    artistId: 'bts',
    description: 'Stream 50 more BTS tracks to unlock this stage mic.',
    unlockCondition: '2,500 total BTS streams',
    unlockThreshold: 2500,
    currentProgress: 2100,
    emoji: '\u{1F3A4}',
    locked: true,
    rarity: 'rare',
  },
  {
    id: 't6',
    name: 'Petal Brooch',
    artistId: 'lorde',
    description: 'For the deep listeners. Earned by 500 Lorde streams.',
    unlockCondition: '500 Lorde streams',
    unlockThreshold: 500,
    currentProgress: 480,
    emoji: '\u{1F338}',
    locked: true,
    rarity: 'common',
  },
  {
    id: 't7',
    name: 'Solar Power Halo',
    artistId: 'lorde',
    description: 'A glowing halo for fans who followed Lorde through Solar Power era.',
    unlockCondition: 'Stream Solar Power album fully',
    unlockThreshold: 12,
    currentProgress: 12,
    emoji: '\u{1F31E}',
    locked: false,
    rarity: 'rare',
    earnedDate: 'Feb 2024',
  },
  {
    id: 't8',
    name: 'Midnight Cassette',
    artistId: 'tswift',
    description: 'For late-night listeners. Stream Taylor Swift after midnight 10 times.',
    unlockCondition: '10 late-night Taylor Swift sessions',
    unlockThreshold: 10,
    currentProgress: 10,
    emoji: '\u{1F4FC}',
    locked: false,
    rarity: 'common',
    earnedDate: 'Dec 2023',
  },
  {
    id: 'trinket-bieber-shades',
    name: 'Bieber Shades',
    artistId: 'justin-bieber',
    description: 'Iconic oversized shades, unlocked for being an early Justin Bieber listener',
    unlockCondition: 'First 500 listeners of "Baby" remix era',
    unlockThreshold: 500,
    currentProgress: 500,
    emoji: '\u{1F576}\uFE0F',
    locked: false,
    rarity: 'rare',
    earnedDate: 'Mar 2024',
    wearableOverlay: 'sunglasses',
  },
  {
    id: 'trinket-bruno-chain',
    name: '24K Chain',
    artistId: 'bruno-mars',
    description: 'Gold chain drip, unlocked after 50 hrs of Bruno Mars listening',
    unlockCondition: '50 hours of Bruno Mars',
    unlockThreshold: 50,
    currentProgress: 50,
    emoji: '\u26D3\uFE0F',
    locked: false,
    rarity: 'legendary',
    earnedDate: 'Jan 2024',
    wearableOverlay: 'chain',
  },
  {
    id: 'trinket-golden-crown',
    name: 'Golden Crown',
    artistId: 'bts',
    description: 'Royal BTS crown, for reaching Top 1% global BTS fans',
    unlockCondition: 'Top 1% BTS listener globally',
    unlockThreshold: 100,
    currentProgress: 100,
    emoji: '\u{1F451}',
    locked: false,
    rarity: 'legendary',
    earnedDate: 'Feb 2024',
    wearableOverlay: 'crown',
  },
  {
    id: 'trinket-star-bow',
    name: 'Star Bow',
    artistId: 'tswift',
    description: 'Sparkly hair bow, gifted to loyal Swifties in the first week of Eras',
    unlockCondition: 'Listened on Eras release day',
    unlockThreshold: 1,
    currentProgress: 1,
    emoji: '\u{1F380}',
    locked: false,
    rarity: 'rare',
    earnedDate: 'Apr 2024',
    wearableOverlay: 'bow',
  },
  {
    id: 'trinket-indie-hat',
    name: 'Indie Bucket Hat',
    artistId: 'lorde',
    description: 'Indie-kid bucket hat, unlocked after completing Solar Power listening party',
    unlockCondition: 'Solar Power full listen streak \u00d7 5',
    unlockThreshold: 5,
    currentProgress: 5,
    emoji: '\u{1FAA3}',
    locked: false,
    rarity: 'common',
    earnedDate: 'Jun 2024',
    wearableOverlay: 'hat',
  },
]

// MILESTONES
export const milestones: Milestone[] = [
  {
    id: 'm1',
    artistId: 'bts',
    tier: 4,
    tierLabel: 'legendary',
    label: 'Legendary ARMY',
    currentValue: 2100,
    targetValue: 2500,
    rewardTrinketId: 't5',
  },
  {
    id: 'm2',
    artistId: 'lorde',
    tier: 2,
    tierLabel: 'fan',
    label: 'Devoted Lorde Fan',
    currentValue: 480,
    targetValue: 500,
    rewardTrinketId: 't6',
  },
  {
    id: 'm3',
    artistId: 'tswift',
    tier: 3,
    tierLabel: 'devoted',
    label: 'Devoted Swiftie',
    currentValue: 890,
    targetValue: 1000,
    rewardTrinketId: 't8',
  },
]

// IDENTITIES
export const identities: Identity[] = [
  {
    id: 'kpop',
    label: 'K-pop Stan',
    characterVariant: 'kpop',
    colorAccent: '#7c3aed',
    glowClass: 'glow-purple',
    stats: {
      streams: 4205,
      topPercent: 1,
      artistsCovered: 6,
      weeksActive: 52,
    },
    unlockedTrinketIds: ['t1', 't2', 't3', 't4'],
    milestoneIds: ['m1'],
    description: 'Your most dedicated listening self. Top 1% of K-pop listeners for over a year.',
    evolutionLog: [
      {
        id: 'e1',
        date: 'Jun 2024',
        label: 'Reached Top 1% K-pop fans globally',
        detail: 'You streamed more K-pop than 99% of Amazon Music listeners this month.',
        type: 'rank',
        icon: '\u{1F3C6}',
      },
      {
        id: 'e2',
        date: 'May 2024',
        label: 'Unlocked World Tour Pin',
        detail: 'You were listening when BTS dropped the tour announcement. Exclusive item earned.',
        type: 'trinket',
        icon: '\u{1F4CD}',
      },
      {
        id: 'e3',
        date: 'Apr 2024',
        label: 'Unlocked Butter Crown',
        detail: 'Reached Top 1% BTS listeners - a legendary-tier achievement.',
        type: 'trinket',
        icon: '\u{1F451}',
      },
      {
        id: 'e4',
        date: 'Jan 2024',
        label: 'K-pop Stan identity activated',
        detail: 'Your K-pop listening crossed the threshold for a dedicated identity.',
        type: 'identity',
        icon: '\u2728',
      },
    ],
  },
  {
    id: 'indie',
    label: 'Indie Listener',
    characterVariant: 'indie',
    colorAccent: '#10b981',
    glowClass: 'glow-cyan',
    stats: {
      streams: 1840,
      topPercent: 8,
      artistsCovered: 12,
      weeksActive: 38,
    },
    unlockedTrinketIds: ['t7'],
    milestoneIds: ['m2'],
    description: 'Eclectic taste, wide reach. You cover more artists than most listeners in this genre.',
    evolutionLog: [
      {
        id: 'e5',
        date: 'May 2024',
        label: 'Covered 12 indie artists this year',
        detail: 'Your listening spans everything from Lorde to Phoebe Bridgers.',
        type: 'milestone',
        icon: '\u{1F3B5}',
      },
      {
        id: 'e6',
        date: 'Feb 2024',
        label: 'Unlocked Solar Power Halo',
        detail: 'Listened through the full Solar Power album.',
        type: 'trinket',
        icon: '\u{1F31E}',
      },
    ],
  },
  {
    id: 'latenight',
    label: 'Late Night Chill',
    characterVariant: 'latenight',
    colorAccent: '#6366f1',
    glowClass: 'glow-blue',
    stats: {
      streams: 920,
      topPercent: 15,
      artistsCovered: 5,
      weeksActive: 20,
    },
    unlockedTrinketIds: ['t8'],
    milestoneIds: ['m3'],
    description: 'Midnight sessions, atmospheric sounds. Your late-night listening is a ritual.',
    evolutionLog: [
      {
        id: 'e7',
        date: 'Dec 2023',
        label: 'Unlocked Midnight Cassette',
        detail: '10 late-night Taylor Swift sessions logged.',
        type: 'trinket',
        icon: '\u{1F4FC}',
      },
    ],
  },
  {
    id: 'hiphop',
    label: 'Hip-hop Head',
    characterVariant: 'hiphop',
    colorAccent: '#f59e0b',
    glowClass: 'glow-gold',
    stats: {
      streams: 610,
      topPercent: 22,
      artistsCovered: 8,
      weeksActive: 14,
    },
    unlockedTrinketIds: [],
    milestoneIds: [],
    description: 'Still growing. Your hip-hop listening is picking up - keep going.',
    evolutionLog: [
      {
        id: 'e8',
        date: 'Jun 2024',
        label: 'Hip-hop Head identity activated',
        detail: 'Your hip-hop streams crossed the threshold for a new identity.',
        type: 'identity',
        icon: '\u{1F3A4}',
      },
    ],
  },
]

// ARTISTS
export const artists: Artist[] = [
  {
    id: 'olivia-rodrigo',
    name: 'Olivia Rodrigo',
    genre: 'Pop',
    userBondWeeks: 52,
    streamCount: 1840,
    topPercent: 2,
    milestoneTierId: 'devoted',
    isSmallerArtist: false,
    bio: 'American singer-songwriter who broke through with raw, emotionally charged pop anthems.',
    monthlyListeners: 42000000,
    imageUri: 'olivia-rodrigo-hero',
    isVerified: true,
  },
  {
    id: 'bts',
    name: 'BTS',
    genre: 'K-pop',
    userBondWeeks: 364,
    streamCount: 2100,
    topPercent: 1,
    milestoneTierId: 'legendary',
    isSmallerArtist: false,
    bio: 'South Korean boy band formed in Seoul in 2013. Known for genre-blending music and dedicated global fanbase.',
    monthlyListeners: 27400000,
    imageUri: 'bts-proof-door',
    isVerified: true,
  },
  {
    id: 'lorde',
    name: 'Lorde',
    genre: 'Indie Pop',
    userBondWeeks: 364,
    streamCount: 480,
    topPercent: 8,
    milestoneTierId: 'fan',
    isSmallerArtist: false,
    bio: 'New Zealand singer-songwriter known for introspective lyrics and minimalist production.',
    monthlyListeners: 8100000,
    imageUri: 'lorde-melodrama',
  },
  {
    id: 'tswift',
    name: 'Taylor Swift',
    genre: 'Pop',
    userBondWeeks: 260,
    streamCount: 890,
    topPercent: 12,
    milestoneTierId: 'devoted',
    isSmallerArtist: false,
    bio: 'American singer-songwriter, one of the best-selling music artists of all time.',
    monthlyListeners: 82100000,
    imageUri: 'ts-showgirl',
  },
  {
    id: 'mitski',
    name: 'Mitski',
    genre: 'Indie Rock',
    userBondWeeks: 14,
    streamCount: 210,
    topPercent: 5,
    milestoneTierId: 'fan',
    isSmallerArtist: true,
    bio: 'Japanese-American indie rock artist known for raw, emotionally dense songwriting.',
    monthlyListeners: 6200000,
    imageUri: 'mitski-be-the-cowboy',
  },
  {
    id: 'justin-bieber',
    name: 'Justin Bieber',
    genre: 'Pop',
    userBondWeeks: 28,
    streamCount: 520,
    topPercent: 4,
    milestoneTierId: 'fan',
    isSmallerArtist: false,
    bio: 'Canadian pop icon who defined a generation of fan culture.',
    monthlyListeners: 68000000,
    imageUri: 'justin-bieber-believe',
  },
  {
    id: 'bruno-mars',
    name: 'Bruno Mars',
    genre: 'Pop / R&B',
    userBondWeeks: 35,
    streamCount: 780,
    topPercent: 3,
    milestoneTierId: 'devoted',
    isSmallerArtist: false,
    bio: 'Grammy-winning hitmaker known for electric performances and 24K magic.',
    monthlyListeners: 72000000,
    imageUri: 'bruno-mars-photo',
    isVerified: true,
  },
  {
    id: 'bana-zahiti',
    name: 'Bana Zahiti',
    genre: 'World',
    userBondWeeks: 6,
    streamCount: 84,
    topPercent: 18,
    milestoneTierId: 'casual',
    isSmallerArtist: true,
    bio: 'Rising artist blending Balkan rhythms with modern pop production.',
    monthlyListeners: 420000,
    imageUri: 'bana-zahiti',
  },
  // --- New artists ---
  {
    id: 'beatles',
    name: 'The Beatles',
    genre: 'Rock',
    userBondWeeks: 12,
    streamCount: 340,
    topPercent: 9,
    milestoneTierId: 'fan',
    isSmallerArtist: false,
    bio: 'Legendary British rock band who defined modern popular music across the 1960s.',
    monthlyListeners: 28500000,
    imageUri: 'beatles-abbey-road',
    isVerified: true,
  },
  {
    id: 'blink-182',
    name: 'Blink-182',
    genre: 'Pop Punk',
    userBondWeeks: 8,
    streamCount: 190,
    topPercent: 14,
    milestoneTierId: 'casual',
    isSmallerArtist: false,
    bio: 'Iconic pop-punk trio from Poway, California, known for irreverent humor and anthemic hooks.',
    monthlyListeners: 18200000,
    imageUri: 'blink-182-enema',
    isVerified: true,
  },
  {
    id: 'drake',
    name: 'Drake',
    genre: 'Hip-Hop / R&B',
    userBondWeeks: 20,
    streamCount: 580,
    topPercent: 5,
    milestoneTierId: 'fan',
    isSmallerArtist: false,
    bio: 'Toronto rapper and singer who reshaped mainstream hip-hop and pop with his emotional blend of bars and melody.',
    monthlyListeners: 71000000,
    imageUri: 'drake',
    isVerified: true,
  },
  {
    id: 'fka-twigs',
    name: 'FKA Twigs',
    genre: 'Alt R&B',
    userBondWeeks: 10,
    streamCount: 145,
    topPercent: 12,
    milestoneTierId: 'casual',
    isSmallerArtist: false,
    bio: 'British artist blending avant-garde R&B, dance, and visual art into a singular artistic vision.',
    monthlyListeners: 5100000,
    imageUri: 'fka-twigs-lp1',
    isVerified: true,
  },
  {
    id: 'metallica',
    name: 'Metallica',
    genre: 'Heavy Metal',
    userBondWeeks: 15,
    streamCount: 260,
    topPercent: 11,
    milestoneTierId: 'casual',
    isSmallerArtist: false,
    bio: 'San Francisco heavy metal giants whose relentless riffs and complex compositions defined thrash metal.',
    monthlyListeners: 22000000,
    imageUri: 'metallica-master',
    isVerified: true,
  },
  {
    id: 'madonna',
    name: 'Madonna',
    genre: 'Pop',
    userBondWeeks: 18,
    streamCount: 300,
    topPercent: 10,
    milestoneTierId: 'fan',
    isSmallerArtist: false,
    bio: 'The Queen of Pop, known for reinventing herself across decades while pushing cultural boundaries.',
    monthlyListeners: 17000000,
    imageUri: 'madonna-true-blue',
    isVerified: true,
  },
  {
    id: 'beyonce',
    name: 'Beyoncé',
    genre: 'R&B / Pop',
    userBondWeeks: 312,
    streamCount: 870,
    topPercent: 3,
    milestoneTierId: 'devoted',
    isSmallerArtist: false,
    bio: 'Global superstar who has redefined R&B, pop, and visual albums across her celebrated career.',
    monthlyListeners: 62000000,
    imageUri: 'beyonce',
    isVerified: true,
  },
  {
    id: 'nicki-minaj',
    name: 'Nicki Minaj',
    genre: 'Hip-Hop / Pop',
    userBondWeeks: 14,
    streamCount: 320,
    topPercent: 8,
    milestoneTierId: 'fan',
    isSmallerArtist: false,
    bio: 'Trinidad-born rapper who dominated the early 2010s hip-hop landscape with unmatched versatility.',
    monthlyListeners: 35000000,
    imageUri: 'nicki-pinkprint',
    isVerified: true,
  },
  {
    id: 'fleetwood-mac',
    name: 'Fleetwood Mac',
    genre: 'Classic Rock',
    userBondWeeks: 10,
    streamCount: 215,
    topPercent: 13,
    milestoneTierId: 'casual',
    isSmallerArtist: false,
    bio: 'British-American rock band behind some of the most enduring albums in rock history.',
    monthlyListeners: 25000000,
    imageUri: 'fleetwood-mac',
    isVerified: true,
  },
  {
    id: 'whitney-houston',
    name: 'Whitney Houston',
    genre: 'R&B / Soul',
    userBondWeeks: 9,
    streamCount: 180,
    topPercent: 15,
    milestoneTierId: 'casual',
    isSmallerArtist: false,
    bio: 'One of the greatest vocalists of all time, whose powerful voice and charisma made her a global icon.',
    monthlyListeners: 20000000,
    imageUri: 'whitney-self-titled',
    isVerified: true,
  },
  {
    id: 'funkadelic',
    name: 'Funkadelic',
    genre: 'Funk / Psychedelic Rock',
    userBondWeeks: 5,
    streamCount: 95,
    topPercent: 20,
    milestoneTierId: 'casual',
    isSmallerArtist: true,
    bio: "George Clinton's cosmic funk collective who fused psychedelic rock with deep groove and Afrocentric philosophy.",
    monthlyListeners: 3200000,
    imageUri: 'funkadelic-maggot-brain',
    isVerified: true,
  },
  {
    id: 'janet-jackson',
    name: 'Janet Jackson',
    genre: 'R&B / Pop',
    userBondWeeks: 12,
    streamCount: 230,
    topPercent: 12,
    milestoneTierId: 'casual',
    isSmallerArtist: false,
    bio: 'Pop and R&B icon who broke boundaries with her socially conscious albums and groundbreaking choreography.',
    monthlyListeners: 14000000,
    imageUri: 'janet-rhythm-nation',
    isVerified: true,
  },
  {
    id: 'lady-gaga',
    name: 'Lady Gaga',
    genre: 'Pop / Dance',
    userBondWeeks: 22,
    streamCount: 490,
    topPercent: 6,
    milestoneTierId: 'fan',
    isSmallerArtist: false,
    bio: 'Avant-garde pop provocateur whose theatrical artistry and monster ballads made her a cultural force.',
    monthlyListeners: 45000000,
    imageUri: 'lady-gaga',
    isVerified: true,
  },
  {
    id: 'pink-floyd',
    name: 'Pink Floyd',
    genre: 'Progressive Rock',
    userBondWeeks: 8,
    streamCount: 175,
    topPercent: 16,
    milestoneTierId: 'casual',
    isSmallerArtist: false,
    bio: 'British progressive rock band celebrated for their elaborate live shows and landmark concept albums.',
    monthlyListeners: 30000000,
    imageUri: 'pink-floyd-dark-side',
    isVerified: true,
  },
  {
    id: 'ariana-grande',
    name: 'Ariana Grande',
    genre: 'Pop / R&B',
    userBondWeeks: 25,
    streamCount: 620,
    topPercent: 4,
    milestoneTierId: 'fan',
    isSmallerArtist: false,
    bio: 'Florida-born pop powerhouse celebrated for her four-octave whistle register and emotional vulnerability.',
    monthlyListeners: 67000000,
    imageUri: 'ariana-grande',
    isVerified: true,
  },
  {
    id: 'asap-rocky',
    name: 'A$AP Rocky',
    genre: 'Hip-Hop',
    userBondWeeks: 11,
    streamCount: 200,
    topPercent: 13,
    milestoneTierId: 'casual',
    isSmallerArtist: false,
    bio: 'Harlem rapper and fashion icon known for blending cloud rap with experimentally lush production.',
    monthlyListeners: 19000000,
    imageUri: 'asap-long-live',
    isVerified: true,
  },
  {
    id: 'bad-bunny',
    name: 'Bad Bunny',
    genre: 'Latin Trap / Reggaeton',
    userBondWeeks: 260,
    streamCount: 410,
    topPercent: 7,
    milestoneTierId: 'fan',
    isSmallerArtist: false,
    bio: 'Puerto Rican superstar who turned Latin trap and reggaeton into a worldwide mainstream phenomenon.',
    monthlyListeners: 61000000,
    imageUri: 'bad-bunny',
    isVerified: true,
  },
  {
    id: 'billie-holiday',
    name: 'Billie Holiday',
    genre: 'Jazz / Blues',
    userBondWeeks: 4,
    streamCount: 70,
    topPercent: 22,
    milestoneTierId: 'casual',
    isSmallerArtist: false,
    bio: "Jazz and blues legend whose hauntingly intimate vocal phrasing set the template for generations of singers.",
    monthlyListeners: 5800000,
    imageUri: 'billie-holiday-satin',
    isVerified: true,
  },
  {
    id: 'cardi-b',
    name: 'Cardi B',
    genre: 'Hip-Hop',
    userBondWeeks: 16,
    streamCount: 350,
    topPercent: 8,
    milestoneTierId: 'fan',
    isSmallerArtist: false,
    bio: 'Bronx-born rapper whose unfiltered personality and chart-dominating debut shook the music industry.',
    monthlyListeners: 38000000,
    imageUri: 'cardi-invasion',
    isVerified: true,
  },
  {
    id: 'carole-king',
    name: 'Carole King',
    genre: 'Singer-Songwriter / Pop',
    userBondWeeks: 6,
    streamCount: 120,
    topPercent: 17,
    milestoneTierId: 'casual',
    isSmallerArtist: false,
    bio: 'Legendary singer-songwriter behind some of the most beloved pop songs of the 20th century.',
    monthlyListeners: 7500000,
    imageUri: 'carole-king-tapestry',
    isVerified: true,
  },
  {
    id: 'chance-the-rapper',
    name: 'Chance the Rapper',
    genre: 'Hip-Hop / Gospel',
    userBondWeeks: 9,
    streamCount: 165,
    topPercent: 15,
    milestoneTierId: 'casual',
    isSmallerArtist: false,
    bio: 'Chicago rapper who pioneered independent streaming-only releases and infused gospel joy into hip-hop.',
    monthlyListeners: 10000000,
    imageUri: 'chance-acid-rap',
    isVerified: true,
  },
  {
    id: 'elton-john',
    name: 'Elton John',
    genre: 'Pop / Rock',
    userBondWeeks: 10,
    streamCount: 220,
    topPercent: 12,
    milestoneTierId: 'casual',
    isSmallerArtist: false,
    bio: 'British piano-pop legend whose flamboyant style and melodic songwriting made him an enduring superstar.',
    monthlyListeners: 29000000,
    imageUri: 'elton-goodbye-yellow',
    isVerified: true,
  },
  {
    id: 'emmylou-harris',
    name: 'Emmylou Harris',
    genre: 'Country',
    userBondWeeks: 5,
    streamCount: 88,
    topPercent: 19,
    milestoneTierId: 'casual',
    isSmallerArtist: true,
    bio: 'Country music icon celebrated for her crystalline voice and genre-bridging collaborations.',
    monthlyListeners: 2800000,
    imageUri: 'emmylou-kentucky',
    isVerified: true,
  },
  {
    id: 'fela-kuti',
    name: 'Fela Kuti',
    genre: 'Afrobeat',
    userBondWeeks: 4,
    streamCount: 75,
    topPercent: 21,
    milestoneTierId: 'casual',
    isSmallerArtist: true,
    bio: 'Nigerian multi-instrumentalist and activist who invented Afrobeat and used music as political resistance.',
    monthlyListeners: 4200000,
    imageUri: 'fela-no-agreement',
    isVerified: true,
  },
  {
    id: 'gloria-estefan',
    name: 'Gloria Estefan',
    genre: 'Latin Pop',
    userBondWeeks: 5,
    streamCount: 98,
    topPercent: 18,
    milestoneTierId: 'casual',
    isSmallerArtist: false,
    bio: 'Cuban-American pop star who brought Latin rhythms into the global mainstream with Miami Sound Machine.',
    monthlyListeners: 6000000,
    imageUri: 'gloria-mi-tierra',
    isVerified: true,
  },
  {
    id: 'haruomi-hosono',
    name: 'Haruomi Hosono',
    genre: 'Electronic / Ambient',
    userBondWeeks: 3,
    streamCount: 60,
    topPercent: 25,
    milestoneTierId: 'casual',
    isSmallerArtist: true,
    bio: 'Japanese musician and producer who pioneered Yellow Magic Orchestra and ambient Japanese pop.',
    monthlyListeners: 1500000,
    imageUri: 'hosono-philharmony',
    isVerified: true,
  },
  {
    id: 'j-cole',
    name: 'J. Cole',
    genre: 'Hip-Hop',
    userBondWeeks: 19,
    streamCount: 430,
    topPercent: 6,
    milestoneTierId: 'fan',
    isSmallerArtist: false,
    bio: 'North Carolina rapper and producer known for thoughtful lyricism and going platinum with no features.',
    monthlyListeners: 32000000,
    imageUri: 'jcole-forest-hills',
    isVerified: true,
  },
  {
    id: 'japanese-breakfast',
    name: 'Japanese Breakfast',
    genre: 'Indie Pop',
    userBondWeeks: 7,
    streamCount: 130,
    topPercent: 16,
    milestoneTierId: 'casual',
    isSmallerArtist: true,
    bio: "Michelle Zauner's project known for blending grief, joy, and lush orchestral indie pop.",
    monthlyListeners: 3600000,
    imageUri: 'japanese-breakfast-jubilee',
    isVerified: true,
  },
  {
    id: 'jay-z',
    name: 'Jay-Z',
    genre: 'Hip-Hop',
    userBondWeeks: 17,
    streamCount: 390,
    topPercent: 7,
    milestoneTierId: 'fan',
    isSmallerArtist: false,
    bio: 'Brooklyn rap mogul whose business empire and lyricism made him one of hip-hop\'s greatest icons.',
    monthlyListeners: 33000000,
    imageUri: 'jayz-black-album',
    isVerified: true,
  },
  {
    id: 'kate-bush',
    name: 'Kate Bush',
    genre: 'Art Pop',
    userBondWeeks: 8,
    streamCount: 155,
    topPercent: 14,
    milestoneTierId: 'casual',
    isSmallerArtist: false,
    bio: 'British art-pop visionary who created deeply theatrical and idiosyncratic music unlike anyone else.',
    monthlyListeners: 14500000,
    imageUri: 'kate-bush-dreaming',
    isVerified: true,
  },
  {
    id: 'lana-del-rey',
    name: 'Lana Del Rey',
    genre: 'Dream Pop',
    userBondWeeks: 21,
    streamCount: 460,
    topPercent: 7,
    milestoneTierId: 'fan',
    isSmallerArtist: false,
    bio: 'Cinematic dream-pop auteur who romanticizes Americana with lush orchestration and melancholic vocals.',
    monthlyListeners: 28000000,
    imageUri: 'lana-norman-rockwell',
    isVerified: true,
  },
  {
    id: 'lil-kim',
    name: 'Lil Kim',
    genre: 'Hip-Hop',
    userBondWeeks: 7,
    streamCount: 125,
    topPercent: 17,
    milestoneTierId: 'casual',
    isSmallerArtist: false,
    bio: "Brooklyn's Queen Bee, who pioneered sexually explicit female rap and became a fashion icon.",
    monthlyListeners: 8000000,
    imageUri: 'lil-kim-hardcore',
    isVerified: true,
  },
  {
    id: 'lizzo',
    name: 'Lizzo',
    genre: 'Pop / R&B',
    userBondWeeks: 13,
    streamCount: 270,
    topPercent: 10,
    milestoneTierId: 'casual',
    isSmallerArtist: false,
    bio: 'Detroit-raised pop powerhouse championing self-love with flute solos, big voices, and bigger energy.',
    monthlyListeners: 22000000,
    imageUri: 'lizzo-cuz-i-love-you',
    isVerified: true,
  },
  {
    id: 'loretta-lynn',
    name: 'Loretta Lynn',
    genre: 'Country',
    userBondWeeks: 4,
    streamCount: 80,
    topPercent: 20,
    milestoneTierId: 'casual',
    isSmallerArtist: false,
    bio: 'Coal Miner\'s Daughter and country music royalty, known for sharp songwriting and fearless candor.',
    monthlyListeners: 4900000,
    imageUri: 'loretta-van-lear',
    isVerified: true,
  },
  {
    id: 'mary-j-blige',
    name: 'Mary J. Blige',
    genre: 'R&B / Soul',
    userBondWeeks: 10,
    streamCount: 195,
    topPercent: 14,
    milestoneTierId: 'casual',
    isSmallerArtist: false,
    bio: 'The Queen of Hip-Hop Soul, who fused raw emotion with hip-hop beats to define a generation of R&B.',
    monthlyListeners: 12000000,
    imageUri: 'mjb-my-life',
    isVerified: true,
  },
  {
    id: 'missy-elliott',
    name: 'Missy Elliott',
    genre: 'Hip-Hop / R&B',
    userBondWeeks: 11,
    streamCount: 210,
    topPercent: 13,
    milestoneTierId: 'casual',
    isSmallerArtist: false,
    bio: 'Pioneering rapper, singer, and producer who pushed hip-hop into new sonic and visual territory.',
    monthlyListeners: 11000000,
    imageUri: 'missy-under-construction',
    isVerified: true,
  },
  {
    id: 'outkast',
    name: 'Outkast',
    genre: 'Hip-Hop / Funk',
    userBondWeeks: 9,
    streamCount: 185,
    topPercent: 14,
    milestoneTierId: 'casual',
    isSmallerArtist: false,
    bio: "Atlanta hip-hop duo André 3000 and Big Boi, who expanded rap's sonic palette into something cosmic.",
    monthlyListeners: 16000000,
    imageUri: 'outkast-stankonia',
    isVerified: true,
  },
  {
    id: 'pistol-annies',
    name: 'Pistol Annies',
    genre: 'Country',
    userBondWeeks: 3,
    streamCount: 55,
    topPercent: 24,
    milestoneTierId: 'casual',
    isSmallerArtist: true,
    bio: 'Miranda Lambert-led trio delivering sharp-tongued country storytelling with fierce harmonies.',
    monthlyListeners: 1900000,
    imageUri: 'pistol-annies-interstate',
    isVerified: true,
  },
  {
    id: 'prince',
    name: 'Prince',
    genre: 'Funk / Pop / Rock',
    userBondWeeks: 12,
    streamCount: 250,
    topPercent: 11,
    milestoneTierId: 'casual',
    isSmallerArtist: false,
    bio: 'Minneapolis genius who collapsed genre walls and recorded thousands of songs across a legendary career.',
    monthlyListeners: 17500000,
    imageUri: 'prince-dirty-mind',
    isVerified: true,
  },
  {
    id: 'rihanna',
    name: 'Rihanna',
    genre: 'R&B / Pop',
    userBondWeeks: 28,
    streamCount: 750,
    topPercent: 4,
    milestoneTierId: 'devoted',
    isSmallerArtist: false,
    bio: 'Barbadian pop phenomenon whose eight studio albums each defined a new sonic era of contemporary music.',
    monthlyListeners: 55000000,
    imageUri: 'rihanna',
    isVerified: true,
  },
  {
    id: 'rm',
    name: 'RM',
    genre: 'K-pop / Hip-Hop',
    userBondWeeks: 15,
    streamCount: 310,
    topPercent: 9,
    milestoneTierId: 'fan',
    isSmallerArtist: false,
    bio: 'Leader and rapper of BTS, whose solo work explores identity, art, and Korean cultural pride.',
    monthlyListeners: 12500000,
    imageUri: 'rm-indigo',
    isVerified: true,
  },
  {
    id: 'roberta-flack',
    name: 'Roberta Flack',
    genre: 'Soul / R&B',
    userBondWeeks: 4,
    streamCount: 72,
    topPercent: 22,
    milestoneTierId: 'casual',
    isSmallerArtist: false,
    bio: 'R&B and soul vocalist whose tender interpretations became timeless classics of the genre.',
    monthlyListeners: 3400000,
    imageUri: 'roberta-flack-first-take',
    isVerified: true,
  },
  {
    id: 'rosalia',
    name: 'Rosalía',
    genre: 'Flamenco / Pop',
    userBondWeeks: 13,
    streamCount: 280,
    topPercent: 10,
    milestoneTierId: 'fan',
    isSmallerArtist: false,
    bio: 'Spanish artist fusing traditional flamenco with avant-garde pop production to stunning effect.',
    monthlyListeners: 14000000,
    imageUri: 'rosalia-el-mal-querer',
    isVerified: true,
  },
  {
    id: 'roxy-music',
    name: 'Roxy Music',
    genre: 'Glam Rock / Art Rock',
    userBondWeeks: 6,
    streamCount: 110,
    topPercent: 18,
    milestoneTierId: 'casual',
    isSmallerArtist: false,
    bio: "British art rock band led by Bryan Ferry, who married sophisticated pop with glam and avant-garde textures.",
    monthlyListeners: 7200000,
    imageUri: 'roxy-for-your-pleasure',
    isVerified: true,
  },
  {
    id: 'sza',
    name: 'SZA',
    genre: 'R&B / Soul',
    userBondWeeks: 24,
    streamCount: 550,
    topPercent: 5,
    milestoneTierId: 'fan',
    isSmallerArtist: false,
    bio: 'New Jersey R&B artist whose emotionally raw vocals and confessional songwriting resonated with millions.',
    monthlyListeners: 42000000,
    imageUri: 'sza',
    isVerified: true,
  },
  {
    id: 'tyler-the-creator',
    name: 'Tyler the Creator',
    genre: 'Hip-Hop / Neo-Soul',
    userBondWeeks: 17,
    streamCount: 380,
    topPercent: 7,
    milestoneTierId: 'fan',
    isSmallerArtist: false,
    bio: 'Los Angeles rapper and producer whose maximalist sonic world-building makes each album a unique universe.',
    monthlyListeners: 26000000,
    imageUri: 'tyler-igor',
    isVerified: true,
  },
  // --- New artists ---
  {
    id: 'charli-xcx',
    name: 'Charli XCX',
    genre: 'Pop / Hyperpop',
    userBondWeeks: 18,
    streamCount: 420,
    topPercent: 6,
    milestoneTierId: 'fan',
    isSmallerArtist: false,
    bio: 'British pop provocateur who redefined the zeitgeist with BRAT and her relentless forward-thinking productions.',
    monthlyListeners: 28000000,
    imageUri: 'charli-xcx-album',
    isVerified: true,
  },
  {
    id: 'harry-styles',
    name: 'Harry Styles',
    genre: 'Pop / Rock',
    userBondWeeks: 26,
    streamCount: 610,
    topPercent: 4,
    milestoneTierId: 'fan',
    isSmallerArtist: false,
    bio: 'British pop-rock artist whose genre-blending solo career launched him into the global superstar stratosphere.',
    monthlyListeners: 52000000,
    imageUri: 'harry-styles-kiss',
    isVerified: true,
  },
  {
    id: 'sabrina-carpenter',
    name: 'Sabrina Carpenter',
    genre: 'Pop',
    userBondWeeks: 20,
    streamCount: 530,
    topPercent: 5,
    milestoneTierId: 'fan',
    isSmallerArtist: false,
    bio: 'Florida-born singer-songwriter whose witty lyricism and vintage-pop sound made her a defining pop voice of the era.',
    monthlyListeners: 48000000,
    imageUri: 'sabrina-short-n-sweet',
    isVerified: true,
  },
  {
    id: 'sombr',
    name: 'Sombr',
    genre: 'Indie / Sad Pop',
    userBondWeeks: 8,
    streamCount: 145,
    topPercent: 14,
    milestoneTierId: 'casual',
    isSmallerArtist: true,
    bio: 'Emerging indie-pop duo crafting intimate sad-pop confessionals that resonate deeply with introspective listeners.',
    monthlyListeners: 3200000,
    imageUri: 'sombr',
    isVerified: false,
  },
  {
    id: 'noah-kahan',
    name: 'Noah Kahan',
    genre: 'Folk / Indie',
    userBondWeeks: 14,
    streamCount: 310,
    topPercent: 9,
    milestoneTierId: 'fan',
    isSmallerArtist: false,
    bio: 'Vermont folk-indie singer whose raw storytelling about home, grief, and growing up struck a universal chord.',
    monthlyListeners: 18000000,
    imageUri: 'noah-kahan-great-divide',
    isVerified: true,
  },
  {
    id: 'olivia-dean',
    name: 'Olivia Dean',
    genre: 'Soul / Pop',
    userBondWeeks: 10,
    streamCount: 195,
    topPercent: 12,
    milestoneTierId: 'casual',
    isSmallerArtist: true,
    bio: 'British soul-pop artist whose warm voice and emotionally honest songwriting earned her critical acclaim.',
    monthlyListeners: 5500000,
    imageUri: 'olivia-dean-messy',
    isVerified: true,
  },
  {
    id: 'dua-lipa',
    name: 'Dua Lipa',
    genre: 'Pop / Dance',
    userBondWeeks: 30,
    streamCount: 820,
    topPercent: 3,
    milestoneTierId: 'devoted',
    isSmallerArtist: false,
    bio: 'Kosovo-Albanian British pop powerhouse who fused disco-era production with modern pop songwriting to global acclaim.',
    monthlyListeners: 72000000,
    imageUri: 'dua-lipa',
    isVerified: true,
  },
  {
    id: 'billie-eilish',
    name: 'Billie Eilish',
    genre: 'Alt Pop',
    userBondWeeks: 32,
    streamCount: 900,
    topPercent: 2,
    milestoneTierId: 'devoted',
    isSmallerArtist: false,
    bio: 'Los Angeles artist who reshaped pop with whisper-quiet intimacy and subversive production from her bedroom studio.',
    monthlyListeners: 78000000,
    imageUri: 'billie-eilish',
    isVerified: true,
  },
  {
    id: 'doja-cat',
    name: 'Doja Cat',
    genre: 'Pop / Rap',
    userBondWeeks: 24,
    streamCount: 580,
    topPercent: 5,
    milestoneTierId: 'fan',
    isSmallerArtist: false,
    bio: 'Los Angeles rapper and singer who blends humor, artistry, and genre-hopping inventiveness into chart-dominating hits.',
    monthlyListeners: 55000000,
    imageUri: 'doja-cat',
    isVerified: true,
  },
  {
    id: 'katy-perry',
    name: 'Katy Perry',
    genre: 'Pop',
    userBondWeeks: 20,
    streamCount: 460,
    topPercent: 6,
    milestoneTierId: 'fan',
    isSmallerArtist: false,
    bio: 'California pop icon who delivered a string of landmark anthems and five consecutive Billboard Hot 100 number ones.',
    monthlyListeners: 44000000,
    imageUri: 'katy-perry',
    isVerified: true,
  },
  {
    id: 'the-weeknd',
    name: 'The Weeknd',
    genre: 'R&B / Pop',
    userBondWeeks: 35,
    streamCount: 950,
    topPercent: 1,
    milestoneTierId: 'legendary',
    isSmallerArtist: false,
    bio: "Toronto R&B visionary who transformed dark, nocturnal storytelling into the world's biggest pop phenomenon.",
    monthlyListeners: 111000000,
    imageUri: 'the-weeknd',
    isVerified: true,
  },
  {
    id: 'tate-mcrae',
    name: 'Tate McRae',
    genre: 'Pop',
    userBondWeeks: 16,
    streamCount: 360,
    topPercent: 8,
    milestoneTierId: 'fan',
    isSmallerArtist: false,
    bio: 'Canadian dancer-turned-pop star whose emotionally-charged breakup anthems captured Gen-Z heartbreak.',
    monthlyListeners: 30000000,
    imageUri: 'tate-mcrae',
    isVerified: true,
  },
  {
    id: 'zara-larsson',
    name: 'Zara Larsson',
    genre: 'Pop',
    userBondWeeks: 12,
    streamCount: 240,
    topPercent: 11,
    milestoneTierId: 'casual',
    isSmallerArtist: false,
    bio: 'Swedish pop powerhouse known for her bold voice and danceable anthems that took over global pop radio.',
    monthlyListeners: 20000000,
    imageUri: 'zara-larsson',
    isVerified: true,
  },
  {
    id: 'newjeans',
    name: 'NewJeans',
    genre: 'K-pop',
    userBondWeeks: 14,
    streamCount: 380,
    topPercent: 7,
    milestoneTierId: 'fan',
    isSmallerArtist: false,
    bio: 'Korean quintet who fused Y2K nostalgia with modern minimalism to become one of the most influential K-pop acts.',
    monthlyListeners: 18000000,
    imageUri: 'newjeans',
    isVerified: true,
  },
  {
    id: 'twice',
    name: 'TWICE',
    genre: 'K-pop',
    userBondWeeks: 22,
    streamCount: 490,
    topPercent: 6,
    milestoneTierId: 'fan',
    isSmallerArtist: false,
    bio: 'JYP Entertainment nine-piece who redefined the K-pop girl group sound with irresistible hooks and synchronized artistry.',
    monthlyListeners: 16000000,
    imageUri: 'twice',
    isVerified: true,
  },
  {
    id: 'blackpink',
    name: 'BLACKPINK',
    genre: 'K-pop',
    userBondWeeks: 28,
    streamCount: 700,
    topPercent: 3,
    milestoneTierId: 'devoted',
    isSmallerArtist: false,
    bio: 'YG Entertainment powerhouse quartet who broke streaming records and brought K-pop into the global mainstream.',
    monthlyListeners: 45000000,
    imageUri: 'blackpink',
    isVerified: true,
  },
  {
    id: 'jungkook',
    name: 'Jungkook',
    genre: 'K-pop / Pop',
    userBondWeeks: 20,
    streamCount: 510,
    topPercent: 5,
    milestoneTierId: 'fan',
    isSmallerArtist: false,
    bio: "BTS's golden maknae whose solo debut became a global phenomenon, charming listeners with his versatile artistry.",
    monthlyListeners: 30000000,
    imageUri: 'jungkook',
    isVerified: true,
  },
  {
    id: 'jennie',
    name: 'JENNIE',
    genre: 'K-pop',
    userBondWeeks: 15,
    streamCount: 360,
    topPercent: 8,
    milestoneTierId: 'fan',
    isSmallerArtist: false,
    bio: "BLACKPINK's multifaceted solo star known for her effortless cool, sharp rap, and elegant pop sensibility.",
    monthlyListeners: 22000000,
    imageUri: 'jennie',
    isVerified: true,
  },
  {
    id: 'lisa',
    name: 'Lisa',
    genre: 'K-pop',
    userBondWeeks: 18,
    streamCount: 430,
    topPercent: 6,
    milestoneTierId: 'fan',
    isSmallerArtist: false,
    bio: 'Thai-born BLACKPINK member whose extraordinary dance skill and magnetic stage presence made her a global icon.',
    monthlyListeners: 28000000,
    imageUri: 'lisa',
    isVerified: true,
  },
  {
    id: 'v-bts',
    name: 'V (BTS)',
    genre: 'K-pop',
    userBondWeeks: 19,
    streamCount: 470,
    topPercent: 5,
    milestoneTierId: 'fan',
    isSmallerArtist: false,
    bio: "BTS's baritone vocalist and visual whose soulful solo debut charmed listeners with cinematic, introspective pop.",
    monthlyListeners: 25000000,
    imageUri: 'v-bts',
    isVerified: true,
  },
  {
    id: 'j-hope',
    name: 'j-hope',
    genre: 'K-pop / Hip-Hop',
    userBondWeeks: 16,
    streamCount: 390,
    topPercent: 7,
    milestoneTierId: 'fan',
    isSmallerArtist: false,
    bio: "BTS's lead dancer and rapper whose solo work bridges the gap between K-pop polish and underground hip-hop energy.",
    monthlyListeners: 20000000,
    imageUri: 'j-hope',
    isVerified: true,
  },
  {
    id: 'rose',
    name: 'ROSE',
    genre: 'K-pop / Pop',
    userBondWeeks: 17,
    streamCount: 400,
    topPercent: 7,
    milestoneTierId: 'fan',
    isSmallerArtist: false,
    bio: "BLACKPINK's lead vocalist whose delicate yet powerful voice and introspective solo work resonated worldwide.",
    monthlyListeners: 24000000,
    imageUri: 'rose',
    isVerified: true,
  },
  {
    id: 'stray-kids',
    name: 'Stray Kids',
    genre: 'K-pop',
    userBondWeeks: 20,
    streamCount: 520,
    topPercent: 5,
    milestoneTierId: 'fan',
    isSmallerArtist: false,
    bio: 'Self-producing K-pop boy group pushing the boundaries of the genre with hard-hitting beats and bold conceptual artistry.',
    monthlyListeners: 22000000,
    imageUri: 'stray-kids',
    isVerified: true,
  },
  {
    id: 'exo',
    name: 'EXO',
    genre: 'K-pop',
    userBondWeeks: 18,
    streamCount: 410,
    topPercent: 7,
    milestoneTierId: 'fan',
    isSmallerArtist: false,
    bio: 'SM Entertainment supergroup whose polished performances and genre experimentation helped define a golden era of K-pop.',
    monthlyListeners: 15000000,
    imageUri: 'exo',
    isVerified: true,
  },
  {
    id: 'seventeen',
    name: 'SEVENTEEN',
    genre: 'K-pop',
    userBondWeeks: 22,
    streamCount: 550,
    topPercent: 5,
    milestoneTierId: 'fan',
    isSmallerArtist: false,
    bio: 'Self-producing thirteen-member group known for their intricate choreography, tight concepts, and devoted CARATs fanbase.',
    monthlyListeners: 20000000,
    imageUri: 'seventeen',
    isVerified: true,
  },
  {
    id: 'kpop-demon-hunters-cast',
    name: 'Kpop Demon Hunters',
    genre: 'K-pop / OST',
    userBondWeeks: 6,
    streamCount: 150,
    topPercent: 13,
    milestoneTierId: 'casual',
    isSmallerArtist: true,
    bio: "Cast performers from the hit animated series bringing K-pop energy to an original soundtrack full of bops.",
    monthlyListeners: 4000000,
    imageUri: 'kpop-demon-hunters',
    isVerified: false,
  },
  {
    id: 'sia',
    name: 'Sia',
    genre: 'Pop',
    userBondWeeks: 16,
    streamCount: 340,
    topPercent: 9,
    milestoneTierId: 'fan',
    isSmallerArtist: false,
    bio: 'Australian singer-songwriter known for her powerhouse vocals, emotional ballads, and iconic wig-clad mystique.',
    monthlyListeners: 48000000,
    imageUri: 'sia',
    isVerified: true,
  },
]

// SONGS
export const songs: Song[] = [
  { id: 's1',  title: 'Black Swan',              artistId: 'bts',    artistName: 'BTS',          album: 'Map of the Soul: 7',       duration: '3:18', mood: 'hype',  albumArtColor: '#1a0a2e', albumArtPath: 'bts-map-of-soul-7', audioBadge: 'DOLBY_ATMOS' },
  { id: 's2',  title: 'Dynamite',                artistId: 'bts',    artistName: 'BTS',          album: 'Dynamite',                 duration: '3:19', mood: 'hype',  albumArtColor: '#2a1a05', albumArtPath: 'bts-dynamite', audioBadge: 'DOLBY_ATMOS' },
  { id: 's3',  title: 'Boy With Luv',            artistId: 'bts',    artistName: 'BTS',          album: 'Map of the Soul: Persona', duration: '3:49', mood: 'hype',  albumArtColor: '#0f1f3a', albumArtPath: 'bts-love-yourself', audioBadge: '360_REALITY_AUDIO' },
  { id: 's4',  title: 'Spring Day',              artistId: 'bts',    artistName: 'BTS',          album: 'You Never Walk Alone',     duration: '5:18', mood: 'sad',   albumArtColor: '#0a1a2a', albumArtPath: 'bts-young-forever' },
  { id: 's5',  title: 'Euphoria',                artistId: 'bts',    artistName: 'BTS',          album: 'Love Yourself: Answer',    duration: '3:58', mood: 'happy', albumArtColor: '#0f1f3a', albumArtPath: 'bts-love-yourself', audioBadge: '360_REALITY_AUDIO' },
  { id: 's6',  title: 'Yellow Flicker Beat',     artistId: 'lorde',  artistName: 'Lorde',        album: 'Yellow Flicker Beat',      duration: '3:54', mood: 'chill', albumArtColor: '#1a1a05', albumArtPath: 'lorde-yellow-flicker' },
  { id: 's7',  title: 'Green Light',             artistId: 'lorde',  artistName: 'Lorde',        album: 'Melodrama',                duration: '3:53', mood: 'hype',  albumArtColor: '#0a1a0a', albumArtPath: 'lorde-melodrama', audioBadge: '360_REALITY_AUDIO' },
  { id: 's8',  title: 'Royals',                  artistId: 'lorde',  artistName: 'Lorde',        album: 'Pure Heroine',             duration: '3:10', mood: 'chill', albumArtColor: '#0f0f0f', albumArtPath: 'lorde-pure-heroine', audioBadge: 'SD' },
  { id: 's9',  title: 'Iceman',                  artistId: 'mitski', artistName: 'Mitski',       album: 'Puberty 2',                duration: '2:32', mood: 'sad',   albumArtColor: '#0a0a1a', albumArtPath: 'mitski-puberty-2', audioBadge: 'SD' },
  { id: 's10', title: 'Look What You Made Me Do', artistId: 'tswift', artistName: 'Taylor Swift', album: 'Reputation',             duration: '3:31', mood: 'hype',  albumArtColor: '#0a0a14', albumArtPath: 'ts-reputation', audioBadge: 'DOLBY_ATMOS' },
  { id: 's11', title: 'Cruel Summer',            artistId: 'tswift', artistName: 'Taylor Swift', album: 'Lover',                    duration: '2:58', mood: 'hype',  albumArtColor: '#1a0a0a', albumArtPath: 'ts-lover' },
  { id: 's12', title: 'Be the Cowboy',           artistId: 'mitski', artistName: 'Mitski',       album: 'Be the Cowboy',            duration: '2:04', mood: 'sad',   albumArtColor: '#14080a', albumArtPath: 'mitski-be-the-cowboy', audioBadge: 'SD' },
  // BTS
  { id: 's13', title: 'Young Forever',           artistId: 'bts',    artistName: 'BTS',          album: 'Young Forever',            duration: '4:30', mood: 'sad',   albumArtColor: '#1a1a2e', albumArtPath: 'bts-young-forever' },
  { id: 's14', title: 'BE (Intro)',               artistId: 'bts',    artistName: 'BTS',          album: 'BE',                       duration: '3:42', mood: 'chill', albumArtColor: '#2d1b4e', albumArtPath: 'bts-be' },
  { id: 's15', title: 'Arirang',                 artistId: 'bts',    artistName: 'BTS',          album: 'Proof',                    duration: '3:15', mood: 'sad',   albumArtColor: '#1c3a5e', albumArtPath: 'bts-arirang' },
  // Taylor Swift
  { id: 's16', title: 'Showtime',                artistId: 'tswift', artistName: 'Taylor Swift', album: 'The Eras Tour',            duration: '4:10', mood: 'hype',  albumArtColor: '#4a0e8f', albumArtPath: 'ts-showgirl', audioBadge: '360_REALITY_AUDIO' },
  { id: 's17', title: 'The Tortured Poet',       artistId: 'tswift', artistName: 'Taylor Swift', album: 'The Tortured Poets Dept.', duration: '5:02', mood: 'sad',   albumArtColor: '#2c2c2c', albumArtPath: 'ts-tortured-poets' },
  { id: 's18', title: 'Polaroid Memories',       artistId: 'tswift', artistName: 'Taylor Swift', album: '1989',                     duration: '3:55', mood: 'happy', albumArtColor: '#b4c5e4', albumArtPath: 'ts-1989-polaroid' },
  // Mitski
  { id: 's19', title: 'Two Slow Dancers',        artistId: 'mitski', artistName: 'Mitski',       album: 'Be the Cowboy',            duration: '4:19', mood: 'sad',   albumArtColor: '#1a0a0a', albumArtPath: 'mitski-be-the-cowboy' },
  { id: 's20', title: 'Burial',                  artistId: 'mitski', artistName: 'Mitski',       album: 'Bury Me at Makeout Creek', duration: '3:30', mood: 'sad',   albumArtColor: '#2a1a0a', albumArtPath: 'mitski-be-the-cowboy' },
  { id: 's21', title: 'Your Best American Girl', artistId: 'mitski', artistName: 'Mitski',       album: 'Puberty 2',                duration: '4:00', mood: 'hype',  albumArtColor: '#0a1a2a', albumArtPath: 'mitski-puberty-2' },
  // Others
  { id: 's22', title: '24K Magic',               artistId: 'bruno-mars',    artistName: 'Bruno Mars',    album: '24K Magic', duration: '3:46', mood: 'hype',  albumArtColor: '#8B0000', albumArtPath: 'bruno-mars-24k-magic' },
  { id: 's23', title: 'Believe',                 artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'Believe',   duration: '4:01', mood: 'happy', albumArtColor: '#1a3a5c', albumArtPath: 'justin-bieber-believe' },
  { id: 's24', title: 'Yellow Flicker Beat',     artistId: 'lorde',  artistName: 'Lorde',        album: 'Yellow Flicker Beat',      duration: '3:57', mood: 'chill', albumArtColor: '#2d4a1e', albumArtPath: 'lorde-yellow-flicker' },
  // Justin Bieber
  { id: 's-jb1', title: 'Baby',                  artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'My World 2.0',    duration: '3:34', mood: 'happy', albumArtColor: '#1a3a5c', albumArtPath: 'justin-bieber-my-world-2' },
  { id: 's-jb2', title: 'Love Yourself',         artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'Purpose',          duration: '3:52', mood: 'chill', albumArtColor: '#0d1f3c', albumArtPath: 'justin-bieber-purpose', audioBadge: 'SD' },
  { id: 's-jb3', title: 'Sorry',                 artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'Purpose',          duration: '3:20', mood: 'hype',  albumArtColor: '#1a3a5c', albumArtPath: 'justin-bieber-purpose' },
  // Bruno Mars
  { id: 's-bm1', title: '24K Magic',             artistId: 'bruno-mars',    artistName: 'Bruno Mars',    album: '24K Magic',        duration: '3:46', mood: 'hype',  albumArtColor: '#8B0000', albumArtPath: 'bruno-mars-24k-magic', audioBadge: 'DOLBY_ATMOS' },
  { id: 's-bm2', title: 'Uptown Funk',           artistId: 'bruno-mars',    artistName: 'Bruno Mars',    album: 'Uptown Special',   duration: '4:30', mood: 'hype',  albumArtColor: '#4a0000', albumArtPath: 'bruno-mars-24k-magic' },
  { id: 's-bm3', title: 'Just the Way You Are',  artistId: 'bruno-mars',    artistName: 'Bruno Mars',    album: 'Doo-Wops & Hooligans', duration: '3:40', mood: 'happy', albumArtColor: '#3a1a00', albumArtPath: 'bruno-mars-doo-wops' },
  // Taylor Swift — 1989 standard cover
  { id: 's-ts1989', title: 'Blank Space',         artistId: 'tswift', artistName: 'Taylor Swift', album: '1989',                     duration: '3:51', mood: 'hype',  albumArtColor: '#c8d8e8', albumArtPath: 'ts-1989', audioBadge: 'SD' },
  // BTS — unused promo art
  { id: 's-bts-come', title: 'Come Over',          artistId: 'bts',    artistName: 'BTS',          album: 'Proof',                    duration: '3:28', mood: 'chill', albumArtColor: '#2a1a3a', albumArtPath: 'bts-come-over' },
  { id: 's-bts-door', title: 'Yet To Come',        artistId: 'bts',    artistName: 'BTS',          album: 'Proof',                    duration: '3:14', mood: 'happy', albumArtColor: '#1a2a4a', albumArtPath: 'bts-proof-door', audioBadge: 'DOLBY_ATMOS', isExclusive: true },
  // Bana Zahiti
  { id: 's-bz1', title: 'Dukat',                  artistId: 'bana-zahiti', artistName: 'Bana Zahiti', album: 'Dukat',                duration: '3:22', mood: 'hype',  albumArtColor: '#3a2818', albumArtPath: 'bana-zahiti' },
  // Olivia Rodrigo
  { id: 's-or1', title: 'Drivers License',        artistId: 'olivia-rodrigo', artistName: 'Olivia Rodrigo', album: 'SOUR',              duration: '4:02', mood: 'sad',   albumArtColor: '#b8c4d8', albumArtPath: 'olivia-rodrigo-sour', audioBadge: 'DOLBY_ATMOS' },
  { id: 's-or2', title: 'good 4 u',               artistId: 'olivia-rodrigo', artistName: 'Olivia Rodrigo', album: 'SOUR',              duration: '2:58', mood: 'angry', albumArtColor: '#c8d0e0', albumArtPath: 'olivia-rodrigo-sour' },
  { id: 's-or3', title: 'deja vu',                artistId: 'olivia-rodrigo', artistName: 'Olivia Rodrigo', album: 'SOUR',              duration: '3:35', mood: 'sad',   albumArtColor: '#a8b8cc', albumArtPath: 'olivia-rodrigo-sour', audioBadge: '360_REALITY_AUDIO' },
  { id: 's-or4', title: 'vampire',                artistId: 'olivia-rodrigo', artistName: 'Olivia Rodrigo', album: 'GUTS',              duration: '3:40', mood: 'sad',   albumArtColor: '#2a1a28', albumArtPath: 'olivia-rodrigo-guts' },
  { id: 's-or5', title: 'get him back!',          artistId: 'olivia-rodrigo', artistName: 'Olivia Rodrigo', album: 'GUTS',              duration: '3:30', mood: 'hype',  albumArtColor: '#3a2030', albumArtPath: 'olivia-rodrigo-guts' },
  { id: 's-or6', title: 'making the bed',         artistId: 'olivia-rodrigo', artistName: 'Olivia Rodrigo', album: 'GUTS',              duration: '3:04', mood: 'sad',   albumArtColor: '#1a1020', albumArtPath: 'olivia-rodrigo-making-the-bed' },
  // --- The Beatles ---
  { id: 's-beatles1', title: 'Come Together',                   artistId: 'beatles',          artistName: 'The Beatles',        album: 'Abbey Road',                        duration: '4:18', mood: 'chill',  albumArtColor: '#2a3a2a', albumArtPath: 'beatles-abbey-road' },
  { id: 's-beatles2', title: 'Lucy in the Sky with Diamonds',   artistId: 'beatles',          artistName: 'The Beatles',        album: "Sgt. Pepper's Lonely Hearts Club Band", duration: '3:28', mood: 'happy', albumArtColor: '#2e1a4a', albumArtPath: 'beatles-sgt-peppers' },
  // --- Blink-182 ---
  { id: 's-blink1',   title: 'All the Small Things',            artistId: 'blink-182',        artistName: 'Blink-182',          album: 'Enema of the State',                duration: '2:49', mood: 'hype',   albumArtColor: '#1a2a1a', albumArtPath: 'blink-182-enema' },
  // --- Drake ---
  { id: 's-drake1',   title: 'Know Yourself',                   artistId: 'drake',            artistName: 'Drake',              album: "If You're Reading This It's Too Late", duration: '3:55', mood: 'hype',  albumArtColor: '#0a0a0a', albumArtPath: 'drake-if-youre-reading' },
  // --- FKA Twigs ---
  { id: 's-fka1',     title: 'Two Weeks',                       artistId: 'fka-twigs',        artistName: 'FKA Twigs',          album: 'LP1',                               duration: '4:08', mood: 'love',   albumArtColor: '#1a0a1a', albumArtPath: 'fka-twigs-lp1' },
  // --- Metallica ---
  { id: 's-metallica1', title: 'Master of Puppets',             artistId: 'metallica',        artistName: 'Metallica',          album: 'Master of Puppets',                 duration: '8:35', mood: 'hype',   albumArtColor: '#0a0a1a', albumArtPath: 'metallica-master' },
  // --- Madonna ---
  { id: 's-madonna1', title: "Papa Don't Preach",               artistId: 'madonna',          artistName: 'Madonna',            album: 'True Blue',                         duration: '4:27', mood: 'sad',    albumArtColor: '#1a2a4a', albumArtPath: 'madonna-true-blue' },
  // --- Beyoncé ---
  { id: 's-beyonce1', title: 'Drunk in Love',                   artistId: 'beyonce',          artistName: 'Beyoncé',            album: 'Beyoncé',                           duration: '5:16', mood: 'love',   albumArtColor: '#0a0a0a', albumArtPath: 'beyonce-self-titled' },
  { id: 's-beyonce2', title: 'Hold Up',                         artistId: 'beyonce',          artistName: 'Beyoncé',            album: 'Lemonade',                          duration: '3:41', mood: 'angry',  albumArtColor: '#3a2800', albumArtPath: 'beyonce-lemonade' },
  { id: 's-beyonce3', title: 'Partition',                       artistId: 'beyonce',          artistName: 'Beyoncé',            album: 'Beyoncé',                           duration: '5:19', mood: 'hype',   albumArtColor: '#0a0a0a', albumArtPath: 'beyonce-self-titled' },
  { id: 's-beyonce4', title: 'XO',                              artistId: 'beyonce',          artistName: 'Beyoncé',            album: 'Beyoncé',                           duration: '3:35', mood: 'love',   albumArtColor: '#0a0a0a', albumArtPath: 'beyonce-self-titled' },
  { id: 's-beyonce5', title: 'Formation',                       artistId: 'beyonce',          artistName: 'Beyoncé',            album: 'Lemonade',                          duration: '3:26', mood: 'hype',   albumArtColor: '#3a2800', albumArtPath: 'beyonce-lemonade' },
  { id: 's-beyonce6', title: 'Sorry',                           artistId: 'beyonce',          artistName: 'Beyoncé',            album: 'Lemonade',                          duration: '3:52', mood: 'angry',  albumArtColor: '#3a2800', albumArtPath: 'beyonce-lemonade' },
  // --- Beyoncé: 4 (2011) ---
  { id: 's-beyonce-4-01', title: 'Love On Top',                 artistId: 'beyonce',          artistName: 'Beyoncé',            album: '4',                                  duration: '4:27', mood: 'love',   albumArtColor: '#4a1a10', albumArtPath: 'beyonce-4' },
  { id: 's-beyonce-4-02', title: 'Countdown',                   artistId: 'beyonce',          artistName: 'Beyoncé',            album: '4',                                  duration: '3:45', mood: 'hype',   albumArtColor: '#4a1a10', albumArtPath: 'beyonce-4' },
  { id: 's-beyonce-4-03', title: 'Party',                       artistId: 'beyonce',          artistName: 'Beyoncé',            album: '4',                                  duration: '4:12', mood: 'happy',  albumArtColor: '#4a1a10', albumArtPath: 'beyonce-4' },
  { id: 's-beyonce-4-04', title: 'Best Thing I Never Had',      artistId: 'beyonce',          artistName: 'Beyoncé',            album: '4',                                  duration: '4:07', mood: 'sad',    albumArtColor: '#4a1a10', albumArtPath: 'beyonce-4' },
  { id: 's-beyonce-4-05', title: '1+1',                         artistId: 'beyonce',          artistName: 'Beyoncé',            album: '4',                                  duration: '4:26', mood: 'love',   albumArtColor: '#4a1a10', albumArtPath: 'beyonce-4' },
  { id: 's-beyonce-4-06', title: 'Run the World (Girls)',       artistId: 'beyonce',          artistName: 'Beyoncé',            album: '4',                                  duration: '3:56', mood: 'hype',   albumArtColor: '#4a1a10', albumArtPath: 'beyonce-4', audioBadge: 'DOLBY_ATMOS' },
  // --- Beyoncé: RENAISSANCE (2022) ---
  { id: 's-beyonce-ren-01', title: 'BREAK MY SOUL',             artistId: 'beyonce',          artistName: 'Beyoncé',            album: 'RENAISSANCE',                       duration: '4:38', mood: 'hype',   albumArtColor: '#7a5a10', albumArtPath: 'beyonce-renaissance', audioBadge: 'DOLBY_ATMOS' },
  { id: 's-beyonce-ren-02', title: 'CUFF IT',                   artistId: 'beyonce',          artistName: 'Beyoncé',            album: 'RENAISSANCE',                       duration: '3:45', mood: 'happy',  albumArtColor: '#7a5a10', albumArtPath: 'beyonce-renaissance' },
  { id: 's-beyonce-ren-03', title: 'ALIEN SUPERSTAR',           artistId: 'beyonce',          artistName: 'Beyoncé',            album: 'RENAISSANCE',                       duration: '4:35', mood: 'hype',   albumArtColor: '#7a5a10', albumArtPath: 'beyonce-renaissance' },
  { id: 's-beyonce-ren-04', title: 'CHURCH GIRL',               artistId: 'beyonce',          artistName: 'Beyoncé',            album: 'RENAISSANCE',                       duration: '4:06', mood: 'happy',  albumArtColor: '#7a5a10', albumArtPath: 'beyonce-renaissance' },
  { id: 's-beyonce-ren-05', title: "AMERICA HAS A PROBLEM",     artistId: 'beyonce',          artistName: 'Beyoncé',            album: 'RENAISSANCE',                       duration: '3:09', mood: 'hype',   albumArtColor: '#7a5a10', albumArtPath: 'beyonce-renaissance' },
  { id: 's-beyonce-ren-06', title: "VIRGO'S GROOVE",            artistId: 'beyonce',          artistName: 'Beyoncé',            album: 'RENAISSANCE',                       duration: '6:18', mood: 'love',   albumArtColor: '#7a5a10', albumArtPath: 'beyonce-renaissance' },
  // --- Beyoncé: COWBOY CARTER (2024) ---
  { id: 's-beyonce-cc-01', title: "TEXAS HOLD 'EM",             artistId: 'beyonce',          artistName: 'Beyoncé',            album: 'COWBOY CARTER',                     duration: '3:53', mood: 'happy',  albumArtColor: '#8a6a30', albumArtPath: 'beyonce-cowboy-carter', audioBadge: 'DOLBY_ATMOS' },
  { id: 's-beyonce-cc-02', title: '16 CARRIAGES',                artistId: 'beyonce',          artistName: 'Beyoncé',            album: 'COWBOY CARTER',                     duration: '4:20', mood: 'sad',    albumArtColor: '#8a6a30', albumArtPath: 'beyonce-cowboy-carter' },
  { id: 's-beyonce-cc-03', title: 'II MOST WANTED',              artistId: 'beyonce',          artistName: 'Beyoncé',            album: 'COWBOY CARTER',                     duration: '3:44', mood: 'love',   albumArtColor: '#8a6a30', albumArtPath: 'beyonce-cowboy-carter' },
  { id: 's-beyonce-cc-04', title: 'BODYGUARD',                   artistId: 'beyonce',          artistName: 'Beyoncé',            album: 'COWBOY CARTER',                     duration: '3:18', mood: 'happy',  albumArtColor: '#8a6a30', albumArtPath: 'beyonce-cowboy-carter' },
  { id: 's-beyonce-cc-05', title: 'JOLENE',                      artistId: 'beyonce',          artistName: 'Beyoncé',            album: 'COWBOY CARTER',                     duration: '3:16', mood: 'angry',  albumArtColor: '#8a6a30', albumArtPath: 'beyonce-cowboy-carter' },
  { id: 's-beyonce-cc-06', title: 'AMEN',                        artistId: 'beyonce',          artistName: 'Beyoncé',            album: 'COWBOY CARTER',                     duration: '3:24', mood: 'chill',  albumArtColor: '#8a6a30', albumArtPath: 'beyonce-cowboy-carter' },
  // --- Nicki Minaj ---
  { id: 's-nicki1',   title: 'Anaconda',                        artistId: 'nicki-minaj',      artistName: 'Nicki Minaj',        album: 'The Pinkprint',                     duration: '4:04', mood: 'hype',   albumArtColor: '#2a0a1a', albumArtPath: 'nicki-pinkprint' },
  // --- Fleetwood Mac ---
  { id: 's-fleet1',   title: 'Go Your Own Way',                 artistId: 'fleetwood-mac',   artistName: 'Fleetwood Mac',      album: 'Rumours',                           duration: '3:38', mood: 'hype',   albumArtColor: '#3a2a1a', albumArtPath: 'fleetwood-rumours' },
  // --- Whitney Houston ---
  { id: 's-whitney1', title: 'Greatest Love of All',            artistId: 'whitney-houston', artistName: 'Whitney Houston',    album: 'Whitney Houston',                   duration: '4:51', mood: 'happy',  albumArtColor: '#1a0a2a', albumArtPath: 'whitney-self-titled' },
  // --- Funkadelic ---
  { id: 's-funk1',    title: 'Maggot Brain',                    artistId: 'funkadelic',       artistName: 'Funkadelic',         album: 'Maggot Brain',                      duration: '9:57', mood: 'sad',    albumArtColor: '#0a1a0a', albumArtPath: 'funkadelic-maggot-brain' },
  // --- Janet Jackson ---
  { id: 's-janet1',   title: 'Rhythm Nation',                   artistId: 'janet-jackson',   artistName: 'Janet Jackson',      album: 'Rhythm Nation 1814',                duration: '5:22', mood: 'hype',   albumArtColor: '#0a0a0a', albumArtPath: 'janet-rhythm-nation' },
  // --- Lady Gaga ---
  { id: 's-gaga1',    title: 'Bad Romance',                     artistId: 'lady-gaga',       artistName: 'Lady Gaga',          album: 'The Fame Monster',                  duration: '4:55', mood: 'hype',   albumArtColor: '#1a0a0a', albumArtPath: 'gaga-fame-monster' },
  { id: 's-gaga2',    title: 'Telephone',                       artistId: 'lady-gaga',       artistName: 'Lady Gaga',          album: 'The Fame Monster',                  duration: '3:41', mood: 'hype',   albumArtColor: '#1a0a0a', albumArtPath: 'gaga-fame-monster' },
  { id: 's-gaga3',    title: 'Alejandro',                       artistId: 'lady-gaga',       artistName: 'Lady Gaga',          album: 'The Fame Monster',                  duration: '4:34', mood: 'hype',   albumArtColor: '#1a0a0a', albumArtPath: 'gaga-fame-monster' },
  { id: 's-gaga4',    title: 'Monster',                         artistId: 'lady-gaga',       artistName: 'Lady Gaga',          album: 'The Fame Monster',                  duration: '4:10', mood: 'hype',   albumArtColor: '#1a0a0a', albumArtPath: 'gaga-fame-monster' },
  { id: 's-gaga5',    title: 'Speechless',                      artistId: 'lady-gaga',       artistName: 'Lady Gaga',          album: 'The Fame Monster',                  duration: '4:30', mood: 'sad',    albumArtColor: '#1a0a0a', albumArtPath: 'gaga-fame-monster' },
  // --- Pink Floyd ---
  { id: 's-pf1',      title: 'Money',                           artistId: 'pink-floyd',      artistName: 'Pink Floyd',         album: 'The Dark Side of the Moon',         duration: '6:30', mood: 'chill',  albumArtColor: '#0a0a14', albumArtPath: 'pink-floyd-dark-side' },
  // --- Ariana Grande ---
  { id: 's-ariana1',  title: 'God is a Woman',                  artistId: 'ariana-grande',   artistName: 'Ariana Grande',      album: 'Sweetener',                         duration: '3:17', mood: 'hype',   albumArtColor: '#2a1a3a', albumArtPath: 'ariana-sweetener' },
  // --- A$AP Rocky ---
  { id: 's-asap1',    title: 'Goldie',                          artistId: 'asap-rocky',      artistName: 'A$AP Rocky',         album: 'Long.Live.A$AP',                    duration: '3:59', mood: 'hype',   albumArtColor: '#1a1a1a', albumArtPath: 'asap-long-live' },
  // --- Bad Bunny ---
  { id: 's-bb1',      title: 'Me Porto Bonito',                 artistId: 'bad-bunny',       artistName: 'Bad Bunny',          album: 'Un Verano Sin Ti',                  duration: '2:59', mood: 'hype',   albumArtColor: '#1a2a1a', albumArtPath: 'bad-bunny-verano' },
  { id: 's-bb2',      title: 'Tití Me Preguntó',                artistId: 'bad-bunny',       artistName: 'Bad Bunny',          album: 'Un Verano Sin Ti',                  duration: '4:03', mood: 'hype',   albumArtColor: '#1a2a1a', albumArtPath: 'bad-bunny-verano' },
  { id: 's-bb3',      title: 'Moscow Mule',                     artistId: 'bad-bunny',       artistName: 'Bad Bunny',          album: 'Un Verano Sin Ti',                  duration: '4:06', mood: 'chill',  albumArtColor: '#1a2a1a', albumArtPath: 'bad-bunny-verano' },
  { id: 's-bb4',      title: 'Ojitos Lindos',                   artistId: 'bad-bunny',       artistName: 'Bad Bunny',          album: 'Un Verano Sin Ti',                  duration: '4:18', mood: 'love',   albumArtColor: '#1a2a1a', albumArtPath: 'bad-bunny-verano' },
  { id: 's-bb5',      title: 'Efecto',                          artistId: 'bad-bunny',       artistName: 'Bad Bunny',          album: 'Un Verano Sin Ti',                  duration: '3:34', mood: 'hype',   albumArtColor: '#1a2a1a', albumArtPath: 'bad-bunny-verano' },
  // --- Billie Holiday ---
  { id: 's-billie1',  title: "I'm a Fool to Want You",          artistId: 'billie-holiday',  artistName: 'Billie Holiday',     album: 'Lady in Satin',                     duration: '3:33', mood: 'sad',    albumArtColor: '#2a1a0a', albumArtPath: 'billie-holiday-satin' },
  // --- Cardi B ---
  { id: 's-cardi1',   title: 'Bodak Yellow',                    artistId: 'cardi-b',         artistName: 'Cardi B',            album: 'Invasion of Privacy',               duration: '3:44', mood: 'hype',   albumArtColor: '#1a0a0a', albumArtPath: 'cardi-invasion' },
  // --- Carole King ---
  { id: 's-carole1',  title: 'I Feel the Earth Move',           artistId: 'carole-king',     artistName: 'Carole King',        album: 'Tapestry',                          duration: '2:58', mood: 'happy',  albumArtColor: '#2a1a0a', albumArtPath: 'carole-king-tapestry' },
  // --- Chance the Rapper ---
  { id: 's-chance1',  title: 'Cocoa Butter Kisses',             artistId: 'chance-the-rapper', artistName: 'Chance the Rapper', album: 'Acid Rap',                        duration: '3:40', mood: 'chill',  albumArtColor: '#0a1a2a', albumArtPath: 'chance-acid-rap' },
  // --- Elton John ---
  { id: 's-elton1',   title: 'Goodbye Yellow Brick Road',       artistId: 'elton-john',      artistName: 'Elton John',         album: 'Goodbye Yellow Brick Road',         duration: '3:14', mood: 'sad',    albumArtColor: '#2a1a08', albumArtPath: 'elton-goodbye-yellow' },
  // --- Emmylou Harris ---
  { id: 's-emmylou1', title: 'Blue Kentucky Girl',              artistId: 'emmylou-harris',  artistName: 'Emmylou Harris',     album: 'Blue Kentucky Girl',                duration: '2:42', mood: 'chill',  albumArtColor: '#0a1a2a', albumArtPath: 'emmylou-kentucky' },
  // --- Fela Kuti ---
  { id: 's-fela1',    title: 'No Agreement',                    artistId: 'fela-kuti',       artistName: 'Fela Kuti',          album: 'No Agreement',                      duration: '14:00', mood: 'hype',  albumArtColor: '#1a0a08', albumArtPath: 'fela-no-agreement' },
  // --- Gloria Estefan ---
  { id: 's-gloria1',  title: 'Mi Tierra',                       artistId: 'gloria-estefan',  artistName: 'Gloria Estefan',     album: 'Mi Tierra',                         duration: '4:22', mood: 'happy',  albumArtColor: '#2a0a08', albumArtPath: 'gloria-mi-tierra' },
  // --- Haruomi Hosono ---
  { id: 's-hosono1',  title: 'Sports Men',                      artistId: 'haruomi-hosono',  artistName: 'Haruomi Hosono',     album: 'Philharmony',                       duration: '3:48', mood: 'chill',  albumArtColor: '#0a1a2a', albumArtPath: 'hosono-philharmony' },
  // --- J. Cole ---
  { id: 's-jcole1',   title: 'No Role Modelz',                  artistId: 'j-cole',          artistName: 'J. Cole',            album: '2014 Forest Hills Drive',           duration: '4:54', mood: 'hype',   albumArtColor: '#1a0808', albumArtPath: 'jcole-forest-hills' },
  // --- Japanese Breakfast ---
  { id: 's-jpbreak1', title: 'Paprika',                         artistId: 'japanese-breakfast', artistName: 'Japanese Breakfast', album: 'Jubilee',                       duration: '5:01', mood: 'happy',  albumArtColor: '#0a1a2a', albumArtPath: 'japanese-breakfast-jubilee' },
  // --- Jay-Z ---
  { id: 's-jayz1',    title: '99 Problems',                     artistId: 'jay-z',           artistName: 'Jay-Z',              album: 'The Black Album',                   duration: '3:44', mood: 'hype',   albumArtColor: '#0a0a0a', albumArtPath: 'jayz-black-album' },
  // --- Kate Bush ---
  { id: 's-kate1',    title: 'Sat in Your Lap',                 artistId: 'kate-bush',       artistName: 'Kate Bush',          album: 'The Dreaming',                      duration: '3:01', mood: 'hype',   albumArtColor: '#1a0a1a', albumArtPath: 'kate-bush-dreaming' },
  // --- Lana Del Rey ---
  { id: 's-lana1',    title: 'Venice Bitch',                    artistId: 'lana-del-rey',    artistName: 'Lana Del Rey',       album: 'Norman Fucking Rockwell!',          duration: '9:37', mood: 'chill',  albumArtColor: '#2a180a', albumArtPath: 'lana-norman-rockwell' },
  { id: 's-lana2',    title: 'Mariners Apartment Complex',      artistId: 'lana-del-rey',    artistName: 'Lana Del Rey',       album: 'Norman Fucking Rockwell!',          duration: '4:05', mood: 'chill',  albumArtColor: '#2a180a', albumArtPath: 'lana-norman-rockwell' },
  { id: 's-lana3',    title: 'The Greatest',                    artistId: 'lana-del-rey',    artistName: 'Lana Del Rey',       album: 'Norman Fucking Rockwell!',          duration: '4:20', mood: 'sad',    albumArtColor: '#2a180a', albumArtPath: 'lana-norman-rockwell' },
  { id: 's-lana4',    title: 'Cinnamon Girl',                   artistId: 'lana-del-rey',    artistName: 'Lana Del Rey',       album: 'Norman Fucking Rockwell!',          duration: '4:07', mood: 'sad',    albumArtColor: '#2a180a', albumArtPath: 'lana-norman-rockwell' },
  { id: 's-lana5',    title: 'Doin\' Time',                     artistId: 'lana-del-rey',    artistName: 'Lana Del Rey',       album: 'Norman Fucking Rockwell!',          duration: '3:22', mood: 'chill',  albumArtColor: '#2a180a', albumArtPath: 'lana-norman-rockwell' },
  // --- Lil Kim ---
  { id: 's-lilkim1',  title: 'Crush on You',                    artistId: 'lil-kim',         artistName: 'Lil Kim',            album: 'Hard Core',                         duration: '4:08', mood: 'hype',   albumArtColor: '#1a0a1a', albumArtPath: 'lil-kim-hardcore' },
  // --- Lizzo ---
  { id: 's-lizzo1',   title: 'Truth Hurts',                     artistId: 'lizzo',           artistName: 'Lizzo',              album: 'Cuz I Love You',                    duration: '2:53', mood: 'hype',   albumArtColor: '#2a0a18', albumArtPath: 'lizzo-cuz-i-love-you' },
  // --- Loretta Lynn ---
  { id: 's-loretta1', title: 'Portland Oregon',                 artistId: 'loretta-lynn',    artistName: 'Loretta Lynn',       album: 'Van Lear Rose',                     duration: '3:27', mood: 'chill',  albumArtColor: '#1a0a0a', albumArtPath: 'loretta-van-lear' },
  // --- Mary J. Blige ---
  { id: 's-mjb1',     title: 'Be Happy',                        artistId: 'mary-j-blige',    artistName: 'Mary J. Blige',      album: 'My Life',                           duration: '5:16', mood: 'sad',    albumArtColor: '#0a0a1a', albumArtPath: 'mjb-my-life' },
  // --- Missy Elliott ---
  { id: 's-missy1',   title: 'Work It',                         artistId: 'missy-elliott',   artistName: 'Missy Elliott',      album: 'Under Construction',                duration: '5:07', mood: 'hype',   albumArtColor: '#1a0a08', albumArtPath: 'missy-under-construction' },
  // --- Outkast ---
  { id: 's-outkast1', title: 'B.O.B.',                          artistId: 'outkast',         artistName: 'Outkast',            album: 'Stankonia',                         duration: '3:29', mood: 'hype',   albumArtColor: '#0a1a08', albumArtPath: 'outkast-stankonia' },
  // --- Pistol Annies ---
  { id: 's-pistol1',  title: 'Got My Name Changed Back',        artistId: 'pistol-annies',   artistName: 'Pistol Annies',      album: 'Interstate Gospel',                 duration: '3:14', mood: 'happy',  albumArtColor: '#1a0a08', albumArtPath: 'pistol-annies-interstate' },
  // --- Prince ---
  { id: 's-prince1',  title: 'Dirty Mind',                      artistId: 'prince',          artistName: 'Prince',             album: 'Dirty Mind',                        duration: '3:30', mood: 'hype',   albumArtColor: '#0a0a1a', albumArtPath: 'prince-dirty-mind' },
  // --- Rihanna ---
  { id: 's-rihanna1', title: 'Kiss It Better',                  artistId: 'rihanna',         artistName: 'Rihanna',            album: 'ANTI',                              duration: '4:23', mood: 'love',   albumArtColor: '#0f0f0f', albumArtPath: 'rihanna-anti' },
  { id: 's-rihanna2', title: 'Work',                            artistId: 'rihanna',         artistName: 'Rihanna',            album: 'ANTI',                              duration: '3:39', mood: 'hype',   albumArtColor: '#0f0f0f', albumArtPath: 'rihanna-anti' },
  { id: 's-rihanna3', title: 'Needed Me',                       artistId: 'rihanna',         artistName: 'Rihanna',            album: 'ANTI',                              duration: '3:11', mood: 'chill',  albumArtColor: '#0f0f0f', albumArtPath: 'rihanna-anti' },
  { id: 's-rihanna4', title: 'Love on the Brain',               artistId: 'rihanna',         artistName: 'Rihanna',            album: 'ANTI',                              duration: '3:44', mood: 'love',   albumArtColor: '#0f0f0f', albumArtPath: 'rihanna-anti' },
  { id: 's-rihanna5', title: 'Desperado',                       artistId: 'rihanna',         artistName: 'Rihanna',            album: 'ANTI',                              duration: '3:06', mood: 'chill',  albumArtColor: '#0f0f0f', albumArtPath: 'rihanna-anti' },
  // --- Rihanna: Good Girl Gone Bad (2007) ---
  { id: 's-rihanna-ggb-01', title: 'Umbrella',                  artistId: 'rihanna',         artistName: 'Rihanna',            album: 'Good Girl Gone Bad',                duration: '4:35', mood: 'hype',   albumArtColor: '#2a2a3a', albumArtPath: 'rihanna-good-girl-gone-bad', audioBadge: 'DOLBY_ATMOS' },
  { id: 's-rihanna-ggb-02', title: 'Shut Up and Drive',         artistId: 'rihanna',         artistName: 'Rihanna',            album: 'Good Girl Gone Bad',                duration: '3:34', mood: 'hype',   albumArtColor: '#2a2a3a', albumArtPath: 'rihanna-good-girl-gone-bad' },
  { id: 's-rihanna-ggb-03', title: 'Hate That I Love You',      artistId: 'rihanna',         artistName: 'Rihanna',            album: 'Good Girl Gone Bad',                duration: '4:00', mood: 'love',   albumArtColor: '#2a2a3a', albumArtPath: 'rihanna-good-girl-gone-bad' },
  { id: 's-rihanna-ggb-04', title: "Don't Stop the Music",      artistId: 'rihanna',         artistName: 'Rihanna',            album: 'Good Girl Gone Bad',                duration: '4:31', mood: 'happy',  albumArtColor: '#2a2a3a', albumArtPath: 'rihanna-good-girl-gone-bad' },
  { id: 's-rihanna-ggb-05', title: 'Disturbia',                 artistId: 'rihanna',         artistName: 'Rihanna',            album: 'Good Girl Gone Bad',                duration: '3:52', mood: 'hype',   albumArtColor: '#2a2a3a', albumArtPath: 'rihanna-good-girl-gone-bad' },
  // --- Rihanna: Loud (2010) ---
  { id: 's-rihanna-loud-01', title: 'Only Girl (In the World)', artistId: 'rihanna',         artistName: 'Rihanna',            album: 'Loud',                              duration: '3:56', mood: 'happy',  albumArtColor: '#7a1030', albumArtPath: 'rihanna-loud', audioBadge: 'DOLBY_ATMOS' },
  { id: 's-rihanna-loud-02', title: 'S&M',                      artistId: 'rihanna',         artistName: 'Rihanna',            album: 'Loud',                              duration: '3:35', mood: 'hype',   albumArtColor: '#7a1030', albumArtPath: 'rihanna-loud' },
  { id: 's-rihanna-loud-03', title: "What's My Name?",          artistId: 'rihanna',         artistName: 'Rihanna',            album: 'Loud',                              duration: '4:19', mood: 'love',   albumArtColor: '#7a1030', albumArtPath: 'rihanna-loud' },
  { id: 's-rihanna-loud-04', title: 'California King Bed',      artistId: 'rihanna',         artistName: 'Rihanna',            album: 'Loud',                              duration: '4:41', mood: 'sad',    albumArtColor: '#7a1030', albumArtPath: 'rihanna-loud' },
  { id: 's-rihanna-loud-05', title: 'Man Down',                 artistId: 'rihanna',         artistName: 'Rihanna',            album: 'Loud',                              duration: '4:33', mood: 'chill',  albumArtColor: '#7a1030', albumArtPath: 'rihanna-loud' },
  // --- Rihanna: Lift Me Up (single, 2022) ---
  { id: 's-rihanna-liftmeup', title: 'Lift Me Up',              artistId: 'rihanna',         artistName: 'Rihanna',            album: 'Lift Me Up',                        duration: '3:11', mood: 'sad',    albumArtColor: '#1a1408', albumArtPath: 'rihanna-lift-me-up' },
  // --- RM ---
  { id: 's-rm1',      title: 'Wild Flower',                     artistId: 'rm',              artistName: 'RM',                 album: 'Indigo',                            duration: '3:34', mood: 'sad',    albumArtColor: '#0a1a2a', albumArtPath: 'rm-indigo' },
  // --- Roberta Flack ---
  { id: 's-roberta1', title: 'The First Time Ever I Saw Your Face', artistId: 'roberta-flack', artistName: 'Roberta Flack',  album: 'First Take',                        duration: '4:17', mood: 'love',   albumArtColor: '#1a0a08', albumArtPath: 'roberta-flack-first-take' },
  // --- Rosalía ---
  { id: 's-rosalia1', title: 'Malamente',                       artistId: 'rosalia',         artistName: 'Rosalía',            album: 'El Mal Querer',                     duration: '3:22', mood: 'sad',    albumArtColor: '#0a0a18', albumArtPath: 'rosalia-el-mal-querer' },
  { id: 's-rosalia2', title: 'SAOKO',                           artistId: 'rosalia',         artistName: 'Rosalía',            album: 'MOTOMAMI',                          duration: '2:17', mood: 'hype',   albumArtColor: '#0a0a18', albumArtPath: 'rosalia-el-mal-querer' },
  { id: 's-rosalia3', title: 'DESPECHÁ',                        artistId: 'rosalia',         artistName: 'Rosalía',            album: 'MOTOMAMI +',                        duration: '2:37', mood: 'happy',  albumArtColor: '#0a0a18', albumArtPath: 'rosalia-el-mal-querer' },
  { id: 's-rosalia4', title: 'DI MI NOMBRE',                    artistId: 'rosalia',         artistName: 'Rosalía',            album: 'El Mal Querer',                     duration: '3:03', mood: 'love',   albumArtColor: '#0a0a18', albumArtPath: 'rosalia-el-mal-querer' },
  { id: 's-rosalia5', title: 'PIENSO EN TU MIRÁ',               artistId: 'rosalia',         artistName: 'Rosalía',            album: 'El Mal Querer',                     duration: '3:13', mood: 'sad',    albumArtColor: '#0a0a18', albumArtPath: 'rosalia-el-mal-querer' },
  // --- Roxy Music ---
  { id: 's-roxy1',    title: 'Do the Strand',                   artistId: 'roxy-music',      artistName: 'Roxy Music',         album: 'For Your Pleasure',                 duration: '4:05', mood: 'hype',   albumArtColor: '#1a0a18', albumArtPath: 'roxy-for-your-pleasure' },
  // --- SZA ---
  { id: 's-sza1',     title: 'Kill Bill',                       artistId: 'sza',             artistName: 'SZA',                album: 'SOS',                               duration: '2:33', mood: 'angry',  albumArtColor: '#1a0808', albumArtPath: 'sza-sos' },
  // --- Tyler the Creator ---
  { id: 's-tyler1',   title: 'EARFQUAKE',                       artistId: 'tyler-the-creator', artistName: 'Tyler the Creator', album: 'IGOR',                            duration: '3:10', mood: 'love',   albumArtColor: '#0a0a0a', albumArtPath: 'tyler-igor' },
  // --- BTS MOTS Journey ---
  { id: 's-bts-journey1', title: 'Who',                         artistId: 'bts',             artistName: 'BTS',                album: 'Map of the Soul: 7 – The Journey', duration: '3:26', mood: 'chill',  albumArtColor: '#1a1a2e', albumArtPath: 'bts-mots-journey' },
  // --- Charli XCX ---
  { id: 's-charli1',      title: '360',                         artistId: 'charli-xcx',      artistName: 'Charli XCX',         album: 'BRAT',                              duration: '2:53', mood: 'hype',   albumArtColor: '#2a1a3a', albumArtPath: 'charli-xcx-album' },
  // --- Harry Styles ---
  { id: 's-harry1',       title: 'Kiss Me (Til It Bleeds)',     artistId: 'harry-styles',    artistName: 'Harry Styles',       album: 'Kiss Me',                           duration: '3:47', mood: 'love',   albumArtColor: '#1a0a0a', albumArtPath: 'harry-styles-kiss' },
  // --- Harry Styles: Fine Line (2019) ---
  { id: 's-harry-fl-01',  title: 'Watermelon Sugar',             artistId: 'harry-styles',    artistName: 'Harry Styles',       album: 'Fine Line',                         duration: '2:54', mood: 'happy',  albumArtColor: '#a03050', albumArtPath: 'harry-styles-fine-line', audioBadge: 'DOLBY_ATMOS' },
  { id: 's-harry-fl-02',  title: 'Adore You',                    artistId: 'harry-styles',    artistName: 'Harry Styles',       album: 'Fine Line',                         duration: '3:27', mood: 'love',   albumArtColor: '#a03050', albumArtPath: 'harry-styles-fine-line' },
  { id: 's-harry-fl-03',  title: 'Golden',                       artistId: 'harry-styles',    artistName: 'Harry Styles',       album: 'Fine Line',                         duration: '3:28', mood: 'happy',  albumArtColor: '#a03050', albumArtPath: 'harry-styles-fine-line' },
  { id: 's-harry-fl-04',  title: 'Falling',                      artistId: 'harry-styles',    artistName: 'Harry Styles',       album: 'Fine Line',                         duration: '4:00', mood: 'sad',    albumArtColor: '#a03050', albumArtPath: 'harry-styles-fine-line' },
  { id: 's-harry-fl-05',  title: 'Lights Up',                    artistId: 'harry-styles',    artistName: 'Harry Styles',       album: 'Fine Line',                         duration: '2:57', mood: 'chill',  albumArtColor: '#a03050', albumArtPath: 'harry-styles-fine-line' },
  // --- Harry Styles: Harry Styles (2017) ---
  { id: 's-harry-hs-01',  title: 'Sign of the Times',             artistId: 'harry-styles',    artistName: 'Harry Styles',       album: 'Harry Styles',                      duration: '5:41', mood: 'sad',    albumArtColor: '#2a3a4a', albumArtPath: 'harry-styles-self-titled', audioBadge: 'DOLBY_ATMOS' },
  { id: 's-harry-hs-02',  title: 'Sweet Creature',                artistId: 'harry-styles',    artistName: 'Harry Styles',       album: 'Harry Styles',                      duration: '3:41', mood: 'love',   albumArtColor: '#2a3a4a', albumArtPath: 'harry-styles-self-titled' },
  { id: 's-harry-hs-03',  title: 'Kiwi',                          artistId: 'harry-styles',    artistName: 'Harry Styles',       album: 'Harry Styles',                      duration: '3:08', mood: 'hype',   albumArtColor: '#2a3a4a', albumArtPath: 'harry-styles-self-titled' },
  { id: 's-harry-hs-04',  title: 'Two Ghosts',                    artistId: 'harry-styles',    artistName: 'Harry Styles',       album: 'Harry Styles',                      duration: '4:22', mood: 'sad',    albumArtColor: '#2a3a4a', albumArtPath: 'harry-styles-self-titled' },
  { id: 's-harry-hs-05',  title: 'Carolina',                      artistId: 'harry-styles',    artistName: 'Harry Styles',       album: 'Harry Styles',                      duration: '3:52', mood: 'happy',  albumArtColor: '#2a3a4a', albumArtPath: 'harry-styles-self-titled' },
  // --- Harry Styles: Harry's House (2022) ---
  { id: 's-harry-hh-01',  title: 'As It Was',                     artistId: 'harry-styles',    artistName: 'Harry Styles',       album: "Harry's House",                     duration: '2:47', mood: 'happy',  albumArtColor: '#5a8a90', albumArtPath: 'harry-styles-harrys-house', audioBadge: 'DOLBY_ATMOS' },
  { id: 's-harry-hh-02',  title: 'Late Night Talking',             artistId: 'harry-styles',    artistName: 'Harry Styles',       album: "Harry's House",                     duration: '2:57', mood: 'happy',  albumArtColor: '#5a8a90', albumArtPath: 'harry-styles-harrys-house' },
  { id: 's-harry-hh-03',  title: 'Music For a Sushi Restaurant',   artistId: 'harry-styles',    artistName: 'Harry Styles',       album: "Harry's House",                     duration: '3:16', mood: 'hype',   albumArtColor: '#5a8a90', albumArtPath: 'harry-styles-harrys-house' },
  { id: 's-harry-hh-04',  title: 'Matilda',                        artistId: 'harry-styles',    artistName: 'Harry Styles',       album: "Harry's House",                     duration: '4:03', mood: 'sad',    albumArtColor: '#5a8a90', albumArtPath: 'harry-styles-harrys-house' },
  { id: 's-harry-hh-05',  title: 'Grapejuice',                     artistId: 'harry-styles',    artistName: 'Harry Styles',       album: "Harry's House",                     duration: '3:20', mood: 'love',   albumArtColor: '#5a8a90', albumArtPath: 'harry-styles-harrys-house' },
  // --- Sabrina Carpenter ---
  { id: 's-sabrina1',     title: 'Espresso',                    artistId: 'sabrina-carpenter', artistName: 'Sabrina Carpenter', album: 'Short n\' Sweet',                 duration: '2:55', mood: 'hype',   albumArtColor: '#2a1a0a', albumArtPath: 'sabrina-espresso', audioBadge: 'DOLBY_ATMOS' },
  { id: 's-sabrina2',     title: 'Please Please Please',        artistId: 'sabrina-carpenter', artistName: 'Sabrina Carpenter', album: 'Short n\' Sweet',                 duration: '3:06', mood: 'happy',  albumArtColor: '#2a0a0a', albumArtPath: 'sabrina-short-n-sweet' },
  // --- Sombr ---
  { id: 's-sombr1',       title: 'I Barely Know Her',           artistId: 'sombr',           artistName: 'Sombr',              album: 'I Barely Know Her',                 duration: '3:14', mood: 'sad',    albumArtColor: '#1a1a2a', albumArtPath: 'sombr-barely-know-her' },
  // --- Noah Kahan ---
  { id: 's-noah1',        title: 'Stick Season',                artistId: 'noah-kahan',      artistName: 'Noah Kahan',         album: 'Stick Season',                      duration: '3:28', mood: 'sad',    albumArtColor: '#2a1a0a', albumArtPath: 'noah-kahan-great-divide' },
  // --- Olivia Dean ---
  { id: 's-olivia-dean1', title: 'Messy',                       artistId: 'olivia-dean',     artistName: 'Olivia Dean',        album: 'Messy',                             duration: '3:08', mood: 'sad',    albumArtColor: '#2a0a1a', albumArtPath: 'olivia-dean-messy' },
  { id: 's-olivia-dean2', title: 'The Art of Loving',           artistId: 'olivia-dean',     artistName: 'Olivia Dean',        album: 'The Art of Loving',                 duration: '3:34', mood: 'love',   albumArtColor: '#1a0a1a', albumArtPath: 'olivia-dean-art-of-loving' },
  // --- Dua Lipa ---
  { id: 's-dua1',         title: 'Levitating',                  artistId: 'dua-lipa',        artistName: 'Dua Lipa',           album: 'Future Nostalgia',                  duration: '3:24', mood: 'hype',   albumArtColor: '#0a1a2a', albumArtPath: 'dua-lipa', audioBadge: 'DOLBY_ATMOS' },
  { id: 's-dua2',         title: "Don't Start Now",             artistId: 'dua-lipa',        artistName: 'Dua Lipa',           album: 'Future Nostalgia',                  duration: '3:27', mood: 'hype',   albumArtColor: '#0a1a3a', albumArtPath: 'dua-lipa' },
  // --- Billie Eilish ---
  { id: 's-billie-e1',    title: 'birds of a feather',          artistId: 'billie-eilish',   artistName: 'Billie Eilish',      album: 'HIT ME HARD AND SOFT',              duration: '3:30', mood: 'chill',  albumArtColor: '#0a1a0a', albumArtPath: 'billie-eilish-hit-me-hard-and-soft', audioBadge: 'DOLBY_ATMOS' },
  // --- Billie Eilish: Happier Than Ever (2021) ---
  { id: 's-billie-hte-01', title: 'Happier Than Ever',          artistId: 'billie-eilish',   artistName: 'Billie Eilish',      album: 'Happier Than Ever',                 duration: '4:58', mood: 'sad',    albumArtColor: '#3a2a20', albumArtPath: 'billie-eilish-happier-than-ever' },
  { id: 's-billie-hte-02', title: 'Therefore I Am',             artistId: 'billie-eilish',   artistName: 'Billie Eilish',      album: 'Happier Than Ever',                 duration: '2:54', mood: 'hype',   albumArtColor: '#3a2a20', albumArtPath: 'billie-eilish-happier-than-ever' },
  { id: 's-billie-hte-03', title: 'my future',                  artistId: 'billie-eilish',   artistName: 'Billie Eilish',      album: 'Happier Than Ever',                 duration: '3:11', mood: 'chill',  albumArtColor: '#3a2a20', albumArtPath: 'billie-eilish-happier-than-ever' },
  { id: 's-billie-hte-04', title: 'Your Power',                 artistId: 'billie-eilish',   artistName: 'Billie Eilish',      album: 'Happier Than Ever',                 duration: '4:06', mood: 'sad',    albumArtColor: '#3a2a20', albumArtPath: 'billie-eilish-happier-than-ever' },
  { id: 's-billie-hte-05', title: 'NDA',                        artistId: 'billie-eilish',   artistName: 'Billie Eilish',      album: 'Happier Than Ever',                 duration: '3:36', mood: 'chill',  albumArtColor: '#3a2a20', albumArtPath: 'billie-eilish-happier-than-ever' },
  // --- Billie Eilish: WHEN WE ALL FALL ASLEEP, WHERE DO WE GO? (2019) ---
  { id: 's-billie-wwafa-01', title: 'bad guy',                  artistId: 'billie-eilish',   artistName: 'Billie Eilish',      album: 'WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?', duration: '3:14', mood: 'hype', albumArtColor: '#0a2a20', albumArtPath: 'billie-eilish-when-we-all-fall-asleep', audioBadge: 'DOLBY_ATMOS' },
  { id: 's-billie-wwafa-02', title: 'bury a friend',            artistId: 'billie-eilish',   artistName: 'Billie Eilish',      album: 'WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?', duration: '3:13', mood: 'angry', albumArtColor: '#0a2a20', albumArtPath: 'billie-eilish-when-we-all-fall-asleep' },
  { id: 's-billie-wwafa-03', title: 'all the good girls go to hell', artistId: 'billie-eilish', artistName: 'Billie Eilish',    album: 'WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?', duration: '2:52', mood: 'hype', albumArtColor: '#0a2a20', albumArtPath: 'billie-eilish-when-we-all-fall-asleep' },
  { id: 's-billie-wwafa-04', title: 'wish you were gay',        artistId: 'billie-eilish',   artistName: 'Billie Eilish',      album: 'WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?', duration: '3:42', mood: 'sad',  albumArtColor: '#0a2a20', albumArtPath: 'billie-eilish-when-we-all-fall-asleep' },
  { id: 's-billie-wwafa-05', title: "when the party's over",    artistId: 'billie-eilish',   artistName: 'Billie Eilish',      album: 'WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?', duration: '3:16', mood: 'sad',  albumArtColor: '#0a2a20', albumArtPath: 'billie-eilish-when-we-all-fall-asleep' },
  // --- Billie Eilish: dont smile at me (2017) ---
  { id: 's-billie-dsam-01', title: 'ocean eyes',                artistId: 'billie-eilish',   artistName: 'Billie Eilish',      album: 'dont smile at me',                  duration: '3:20', mood: 'chill',  albumArtColor: '#1a1a2a', albumArtPath: 'billie-eilish-dont-smile-at-me' },
  { id: 's-billie-dsam-02', title: 'copycat',                   artistId: 'billie-eilish',   artistName: 'Billie Eilish',      album: 'dont smile at me',                  duration: '3:11', mood: 'angry',  albumArtColor: '#1a1a2a', albumArtPath: 'billie-eilish-dont-smile-at-me' },
  { id: 's-billie-dsam-03', title: 'idontwannabeyouanymore',    artistId: 'billie-eilish',   artistName: 'Billie Eilish',      album: 'dont smile at me',                  duration: '3:33', mood: 'sad',    albumArtColor: '#1a1a2a', albumArtPath: 'billie-eilish-dont-smile-at-me' },
  { id: 's-billie-dsam-04', title: 'bellyache',                 artistId: 'billie-eilish',   artistName: 'Billie Eilish',      album: 'dont smile at me',                  duration: '3:24', mood: 'hype',   albumArtColor: '#1a1a2a', albumArtPath: 'billie-eilish-dont-smile-at-me' },
  // --- Doja Cat ---
  { id: 's-doja1',        title: 'Paint the Town Red',          artistId: 'doja-cat',        artistName: 'Doja Cat',           album: 'Scarlet',                           duration: '4:11', mood: 'hype',   albumArtColor: '#2a0808', albumArtPath: 'doja-cat' },
  { id: 's-doja2',        title: 'Agora Hills',                 artistId: 'doja-cat',        artistName: 'Doja Cat',           album: 'Scarlet',                           duration: '4:23', mood: 'love',   albumArtColor: '#2a0808', albumArtPath: 'doja-cat' },
  { id: 's-doja3',        title: 'Demons',                      artistId: 'doja-cat',        artistName: 'Doja Cat',           album: 'Scarlet',                           duration: '2:31', mood: 'hype',   albumArtColor: '#2a0808', albumArtPath: 'doja-cat' },
  { id: 's-doja4',        title: 'Attention',                   artistId: 'doja-cat',        artistName: 'Doja Cat',           album: 'Scarlet',                           duration: '3:20', mood: 'hype',   albumArtColor: '#2a0808', albumArtPath: 'doja-cat' },
  { id: 's-doja5',        title: 'Balut',                       artistId: 'doja-cat',        artistName: 'Doja Cat',           album: 'Scarlet',                           duration: '3:47', mood: 'chill',  albumArtColor: '#2a0808', albumArtPath: 'doja-cat' },
  // --- Katy Perry ---
  { id: 's-katy1',        title: 'Roar',                        artistId: 'katy-perry',      artistName: 'Katy Perry',         album: 'Prism',                             duration: '3:43', mood: 'hype',   albumArtColor: '#2a1a08', albumArtPath: 'katy-perry' },
  // --- The Weeknd ---
  { id: 's-weeknd1',      title: 'Blinding Lights',             artistId: 'the-weeknd',      artistName: 'The Weeknd',         album: 'After Hours',                       duration: '3:20', mood: 'hype',   albumArtColor: '#1a0808', albumArtPath: 'the-weeknd', audioBadge: 'DOLBY_ATMOS' },
  // --- Tate McRae ---
  { id: 's-tate1',        title: 'greedy',                      artistId: 'tate-mcrae',      artistName: 'Tate McRae',         album: 'think later',                       duration: '2:11', mood: 'hype',   albumArtColor: '#1a0a1a', albumArtPath: 'tate-mcrae' },
  { id: 's-tate2',        title: 'exes',                        artistId: 'tate-mcrae',      artistName: 'Tate McRae',         album: 'think later',                       duration: '2:36', mood: 'hype',   albumArtColor: '#1a0a1a', albumArtPath: 'tate-mcrae' },
  { id: 's-tate3',        title: 'run for the hills',           artistId: 'tate-mcrae',      artistName: 'Tate McRae',         album: 'think later',                       duration: '2:47', mood: 'chill',  albumArtColor: '#1a0a1a', albumArtPath: 'tate-mcrae' },
  { id: 's-tate4',        title: 'calgary',                     artistId: 'tate-mcrae',      artistName: 'Tate McRae',         album: 'think later',                       duration: '2:59', mood: 'sad',    albumArtColor: '#1a0a1a', albumArtPath: 'tate-mcrae' },
  { id: 's-tate5',        title: 'grave',                       artistId: 'tate-mcrae',      artistName: 'Tate McRae',         album: 'think later',                       duration: '2:44', mood: 'sad',    albumArtColor: '#1a0a1a', albumArtPath: 'tate-mcrae' },
  // --- Zara Larsson ---
  { id: 's-zara1',        title: 'Lush Life',                   artistId: 'zara-larsson',    artistName: 'Zara Larsson',       album: 'So Good',                           duration: '3:31', mood: 'happy',  albumArtColor: '#0a2a1a', albumArtPath: 'zara-larsson-so-good' },
  // --- NewJeans ---
  { id: 's-nj1',          title: 'Hype Boy',                    artistId: 'newjeans',        artistName: 'NewJeans',           album: 'NewJeans',                          duration: '3:01', mood: 'hype',   albumArtColor: '#1a1a2a', albumArtPath: 'newjeans' },
  { id: 's-nj2',          title: 'OMG',                         artistId: 'newjeans',        artistName: 'NewJeans',           album: 'OMG',                               duration: '3:31', mood: 'happy',  albumArtColor: '#0a1a2a', albumArtPath: 'newjeans' },
  // --- TWICE ---
  { id: 's-twice1',       title: 'FANCY',                       artistId: 'twice',           artistName: 'TWICE',              album: 'FANCY YOU',                         duration: '3:38', mood: 'hype',   albumArtColor: '#2a0a1a', albumArtPath: 'twice' },
  { id: 's-twice2',       title: 'What is Love?',               artistId: 'twice',           artistName: 'TWICE',              album: 'What is Love?',                     duration: '3:38', mood: 'happy',  albumArtColor: '#2a0a18', albumArtPath: 'twice' },
  // --- BLACKPINK ---
  { id: 's-bp1',          title: 'How You Like That',           artistId: 'blackpink',       artistName: 'BLACKPINK',          album: 'THE ALBUM',                         duration: '3:01', mood: 'hype',   albumArtColor: '#1a0a0a', albumArtPath: 'blackpink-the-album', audioBadge: 'DOLBY_ATMOS' },
  { id: 's-bp2',          title: 'Pink Venom',                  artistId: 'blackpink',       artistName: 'BLACKPINK',          album: 'BORN PINK',                         duration: '3:05', mood: 'hype',   albumArtColor: '#2a0a1a', albumArtPath: 'blackpink' },
  // --- Jungkook ---
  { id: 's-jk1',          title: 'Seven',                       artistId: 'jungkook',        artistName: 'Jungkook',           album: 'Golden',                            duration: '2:57', mood: 'happy',  albumArtColor: '#1a0a1a', albumArtPath: 'jungkook', audioBadge: 'DOLBY_ATMOS' },
  { id: 's-jk2',          title: 'Standing Next to You',        artistId: 'jungkook',        artistName: 'Jungkook',           album: 'Golden',                            duration: '4:06', mood: 'hype',   albumArtColor: '#1a1a1a', albumArtPath: 'jungkook' },
  // --- JENNIE ---
  { id: 's-jennie1',      title: 'Solo',                        artistId: 'jennie',          artistName: 'JENNIE',             album: 'Solo',                              duration: '3:20', mood: 'hype',   albumArtColor: '#1a0a0a', albumArtPath: 'jennie' },
  { id: 's-jennie2',      title: 'You & Me',                    artistId: 'jennie',          artistName: 'JENNIE',             album: 'You & Me',                          duration: '3:31', mood: 'love',   albumArtColor: '#2a0a1a', albumArtPath: 'jennie' },
  // --- Lisa ---
  { id: 's-lisa1',        title: 'LALISA',                      artistId: 'lisa',            artistName: 'Lisa',               album: 'LALISA',                            duration: '3:28', mood: 'hype',   albumArtColor: '#1a0a2a', albumArtPath: 'lisa' },
  { id: 's-lisa2',        title: 'Money',                       artistId: 'lisa',            artistName: 'Lisa',               album: 'LALISA',                            duration: '2:38', mood: 'hype',   albumArtColor: '#0a0a1a', albumArtPath: 'lisa' },
  // --- V (BTS) ---
  { id: 's-v1',           title: 'Slow Dancing',                artistId: 'v-bts',           artistName: 'V (BTS)',            album: 'Layover',                           duration: '3:50', mood: 'love',   albumArtColor: '#1a0a1a', albumArtPath: 'v-bts' },
  { id: 's-v2',           title: 'FRI(END)S',                   artistId: 'v-bts',           artistName: 'V (BTS)',            album: 'Layover',                           duration: '3:10', mood: 'sad',    albumArtColor: '#1a1a2a', albumArtPath: 'v-bts' },
  // --- j-hope ---
  { id: 's-jhope1',       title: 'On the Street',               artistId: 'j-hope',          artistName: 'j-hope',             album: 'Jack in the Box',                   duration: '3:27', mood: 'happy',  albumArtColor: '#0a1a08', albumArtPath: 'j-hope' },
  { id: 's-jhope2',       title: 'MORE',                        artistId: 'j-hope',          artistName: 'j-hope',             album: 'Jack in the Box',                   duration: '2:30', mood: 'hype',   albumArtColor: '#1a0808', albumArtPath: 'j-hope' },
  // --- ROSE ---
  { id: 's-rose1',        title: 'On The Ground',               artistId: 'rose',            artistName: 'ROSE',               album: 'R',                                 duration: '3:13', mood: 'sad',    albumArtColor: '#2a1a1a', albumArtPath: 'rose' },
  { id: 's-rose2',        title: 'APT.',                        artistId: 'rose',            artistName: 'ROSE',               album: 'rosie',                             duration: '2:54', mood: 'hype',   albumArtColor: '#2a0a0a', albumArtPath: 'rose-apt', audioBadge: 'DOLBY_ATMOS' },
  // --- Stray Kids ---
  { id: 's-skz1',         title: 'S-Class',                     artistId: 'stray-kids',      artistName: 'Stray Kids',         album: '5-STAR',                            duration: '3:10', mood: 'hype',   albumArtColor: '#0a0a1a', albumArtPath: 'stray-kids' },
  { id: 's-skz2',         title: 'MIROH',                       artistId: 'stray-kids',      artistName: 'Stray Kids',         album: 'Clé 1: MIROH',                      duration: '3:42', mood: 'hype',   albumArtColor: '#1a0a0a', albumArtPath: 'stray-kids' },
  // --- EXO ---
  { id: 's-exo1',         title: 'Ko Ko Bop',                   artistId: 'exo',             artistName: 'EXO',                album: 'The War',                           duration: '3:47', mood: 'hype',   albumArtColor: '#1a1a0a', albumArtPath: 'exo' },
  { id: 's-exo2',         title: 'Power',                       artistId: 'exo',             artistName: 'EXO',                album: 'The War',                           duration: '3:42', mood: 'hype',   albumArtColor: '#0a1a1a', albumArtPath: 'exo' },
  // --- SEVENTEEN ---
  { id: 's-svt1',         title: 'Super',                       artistId: 'seventeen',       artistName: 'SEVENTEEN',          album: 'SPILL THE FEELS',                   duration: '3:25', mood: 'hype',   albumArtColor: '#0a1a2a', albumArtPath: 'seventeen' },
  { id: 's-svt2',         title: 'MAESTRO',                     artistId: 'seventeen',       artistName: 'SEVENTEEN',          album: 'SPILL THE FEELS',                   duration: '3:34', mood: 'hype',   albumArtColor: '#1a0a2a', albumArtPath: 'seventeen' },
  // --- Kpop Demon Hunters ---
  { id: 's-kdh1',         title: "Hunter's Mark",               artistId: 'kpop-demon-hunters-cast', artistName: 'Kpop Demon Hunters', album: 'Kpop Demon Hunters OST',   duration: '3:15', mood: 'hype',   albumArtColor: '#1a0a0a', albumArtPath: 'kpop-demon-hunters-ost' },
  // --- Lorde (new) ---
  { id: 's-lorde2',       title: 'Virgin',                      artistId: 'lorde',           artistName: 'Lorde',              album: 'Virgin',                            duration: '3:40', mood: 'chill',  albumArtColor: '#1a1a0a', albumArtPath: 'lorde-virgin' },
  // --- Olivia Rodrigo (new) ---
  { id: 's-or-new1',      title: 'Pretty Sad',                  artistId: 'olivia-rodrigo',  artistName: 'Olivia Rodrigo',     album: 'You Seem Pretty Sad',               duration: '3:22', mood: 'sad',    albumArtColor: '#2a1a2a', albumArtPath: 'olivia-rodrigo-pretty-sad-album' },
  // --- Olivia Rodrigo — "You Seem Pretty Sad" (2026) additional tracklist ---
  { id: 's-or-ps2',       title: 'worst case scenario',         artistId: 'olivia-rodrigo',  artistName: 'Olivia Rodrigo',     album: 'You Seem Pretty Sad',               duration: '3:05', mood: 'angry',  albumArtColor: '#331f30', albumArtPath: 'olivia-rodrigo-pretty-sad' },
  { id: 's-or-ps3',       title: 'backseat crying',             artistId: 'olivia-rodrigo',  artistName: 'Olivia Rodrigo',     album: 'You Seem Pretty Sad',               duration: '2:48', mood: 'sad',    albumArtColor: '#2f1b2c', albumArtPath: 'olivia-rodrigo-pretty-sad' },
  { id: 's-or-ps4',       title: 'everyone but me',             artistId: 'olivia-rodrigo',  artistName: 'Olivia Rodrigo',     album: 'You Seem Pretty Sad',               duration: '3:31', mood: 'sad',    albumArtColor: '#3a2436', albumArtPath: 'olivia-rodrigo-pretty-sad' },
  { id: 's-or-ps5',       title: '23 and a mess',                artistId: 'olivia-rodrigo',  artistName: 'Olivia Rodrigo',     album: 'You Seem Pretty Sad',               duration: '3:12', mood: 'chill',  albumArtColor: '#28151f', albumArtPath: 'olivia-rodrigo-pretty-sad' },
  { id: 's-or-ps6',       title: 'slow motion heartbreak',      artistId: 'olivia-rodrigo',  artistName: 'Olivia Rodrigo',     album: 'You Seem Pretty Sad',               duration: '4:01', mood: 'sad',    albumArtColor: '#3c2438', albumArtPath: 'olivia-rodrigo-pretty-sad' },
  // --- Ariana Grande (new) ---
  { id: 's-ariana2',      title: 'Into You',                    artistId: 'ariana-grande',   artistName: 'Ariana Grande',      album: 'Dangerous Woman',                   duration: '4:02', mood: 'love',   albumArtColor: '#2a0a1a', albumArtPath: 'ariana-dangerous-woman', audioBadge: 'DOLBY_ATMOS' },
  // --- Olivia Rodrigo (additional album art) ---
  { id: 's-or7',          title: "can't catch me now",          artistId: 'olivia-rodrigo',  artistName: 'Olivia Rodrigo',     album: 'GUTS',                              duration: '3:42', mood: 'happy',  albumArtColor: '#2a1828', albumArtPath: 'olivia-rodrigo-cant-catch-me', audioBadge: 'DOLBY_ATMOS' },
  { id: 's-or8',          title: 'you seem pretty sad for a girl so in love', artistId: 'olivia-rodrigo', artistName: 'Olivia Rodrigo', album: 'You Seem Pretty Sad', duration: '3:18', mood: 'love',   albumArtColor: '#3a2038', albumArtPath: 'olivia-rodrigo-pretty-sad' },
  { id: 's-or9',          title: 'logical',                     artistId: 'olivia-rodrigo',  artistName: 'Olivia Rodrigo',     album: 'GUTS',                              duration: '3:44', mood: 'sad',    albumArtColor: '#1a1428', albumArtPath: 'olivia-rodrigo-guts' },
  { id: 's-or10',         title: 'bad idea right?',             artistId: 'olivia-rodrigo',  artistName: 'Olivia Rodrigo',     album: 'GUTS',                              duration: '3:29', mood: 'hype',   albumArtColor: '#281828', albumArtPath: 'olivia-rodrigo-guts', audioBadge: '360_REALITY_AUDIO' },
  { id: 's-or11',         title: 'lacy',                        artistId: 'olivia-rodrigo',  artistName: 'Olivia Rodrigo',     album: 'GUTS',                              duration: '2:57', mood: 'angry',  albumArtColor: '#2a1a30', albumArtPath: 'olivia-rodrigo-guts' },
  // --- Olivia Rodrigo — SOUR full tracklist ---
  { id: 's-or-sour-01',  title: 'brutal',                      artistId: 'olivia-rodrigo',  artistName: 'Olivia Rodrigo',     album: 'SOUR',                              duration: '2:54', mood: 'angry',  albumArtColor: '#7B70A8', albumArtPath: 'olivia-rodrigo-sour' },
  { id: 's-or-sour-02',  title: 'traitor',                     artistId: 'olivia-rodrigo',  artistName: 'Olivia Rodrigo',     album: 'SOUR',                              duration: '3:49', mood: 'sad',    albumArtColor: '#8888B8', albumArtPath: 'olivia-rodrigo-sour' },
  { id: 's-or-sour-03',  title: '1 step forward, 3 steps back', artistId: 'olivia-rodrigo', artistName: 'Olivia Rodrigo',    album: 'SOUR',                              duration: '2:28', mood: 'sad',    albumArtColor: '#7878A8', albumArtPath: 'olivia-rodrigo-sour' },
  { id: 's-or-sour-04',  title: 'enough for you',              artistId: 'olivia-rodrigo',  artistName: 'Olivia Rodrigo',     album: 'SOUR',                              duration: '2:37', mood: 'sad',    albumArtColor: '#8080B0', albumArtPath: 'olivia-rodrigo-sour' },
  { id: 's-or-sour-05',  title: 'happier',                     artistId: 'olivia-rodrigo',  artistName: 'Olivia Rodrigo',     album: 'SOUR',                              duration: '3:38', mood: 'sad',    albumArtColor: '#8A8ABF', albumArtPath: 'olivia-rodrigo-sour' },
  { id: 's-or-sour-06',  title: 'favorite crime',              artistId: 'olivia-rodrigo',  artistName: 'Olivia Rodrigo',     album: 'SOUR',                              duration: '2:32', mood: 'love',   albumArtColor: '#9090C0', albumArtPath: 'olivia-rodrigo-sour' },
  { id: 's-or-sour-07',  title: 'hope ur ok',                  artistId: 'olivia-rodrigo',  artistName: 'Olivia Rodrigo',     album: 'SOUR',                              duration: '3:27', mood: 'chill',  albumArtColor: '#8080B8', albumArtPath: 'olivia-rodrigo-sour' },
  // --- Olivia Rodrigo — GUTS full tracklist ---
  { id: 's-or-guts-01',  title: 'the grudge',                  artistId: 'olivia-rodrigo',  artistName: 'Olivia Rodrigo',     album: 'GUTS',                              duration: '4:03', mood: 'angry',  albumArtColor: '#2E4A5A', albumArtPath: 'olivia-rodrigo-guts' },
  { id: 's-or-guts-02',  title: 'ballad of a homeschooled girl', artistId: 'olivia-rodrigo', artistName: 'Olivia Rodrigo',   album: 'GUTS',                              duration: '3:20', mood: 'hype',   albumArtColor: '#4A3A2E', albumArtPath: 'olivia-rodrigo-guts' },
  { id: 's-or-guts-03',  title: 'all-american bitch',          artistId: 'olivia-rodrigo',  artistName: 'Olivia Rodrigo',     album: 'GUTS',                              duration: '2:13', mood: 'hype',   albumArtColor: '#5A3A28', albumArtPath: 'olivia-rodrigo-guts' },
  { id: 's-or-guts-04',  title: "pretty isn't pretty",         artistId: 'olivia-rodrigo',  artistName: 'Olivia Rodrigo',     album: 'GUTS',                              duration: '2:44', mood: 'sad',    albumArtColor: '#4A4A6A', albumArtPath: 'olivia-rodrigo-guts' },
  { id: 's-or-guts-05',  title: 'teenage dream',               artistId: 'olivia-rodrigo',  artistName: 'Olivia Rodrigo',     album: 'GUTS',                              duration: '3:52', mood: 'sad',    albumArtColor: '#3A5070', albumArtPath: 'olivia-rodrigo-guts' },
  { id: 's-or-guts-06',  title: 'love is embarrassing',        artistId: 'olivia-rodrigo',  artistName: 'Olivia Rodrigo',     album: 'GUTS',                              duration: '3:09', mood: 'hype',   albumArtColor: '#6A3A4A', albumArtPath: 'olivia-rodrigo-guts' },
  // --- Drake (additional) ---
  { id: 's-drake2',       title: 'Iceman',                      artistId: 'drake',           artistName: 'Drake',              album: 'Iceman',                            duration: '3:12', mood: 'hype',   albumArtColor: '#0a1420', albumArtPath: 'drake-iceman' },
  // --- Drake: Scorpion (2018) ---
  { id: 's-drake-scorp-01', title: "God's Plan",                artistId: 'drake',           artistName: 'Drake',              album: 'Scorpion',                          duration: '3:19', mood: 'hype',   albumArtColor: '#101010', albumArtPath: 'drake-scorpion', audioBadge: 'DOLBY_ATMOS' },
  { id: 's-drake-scorp-02', title: 'In My Feelings',            artistId: 'drake',           artistName: 'Drake',              album: 'Scorpion',                          duration: '3:37', mood: 'happy',  albumArtColor: '#101010', albumArtPath: 'drake-scorpion' },
  { id: 's-drake-scorp-03', title: 'Nonstop',                   artistId: 'drake',           artistName: 'Drake',              album: 'Scorpion',                          duration: '4:14', mood: 'hype',   albumArtColor: '#101010', albumArtPath: 'drake-scorpion' },
  { id: 's-drake-scorp-04', title: 'Nice for What',             artistId: 'drake',           artistName: 'Drake',              album: 'Scorpion',                          duration: '3:33', mood: 'hype',   albumArtColor: '#101010', albumArtPath: 'drake-scorpion' },
  // --- Drake: Take Care (2011) ---
  { id: 's-drake-tc-01', title: 'Marvins Room',                  artistId: 'drake',           artistName: 'Drake',              album: 'Take Care',                         duration: '4:52', mood: 'sad',    albumArtColor: '#1a1a2a', albumArtPath: 'drake-take-care' },
  { id: 's-drake-tc-02', title: 'Take Care',                     artistId: 'drake',           artistName: 'Drake',              album: 'Take Care',                         duration: '4:44', mood: 'love',   albumArtColor: '#1a1a2a', albumArtPath: 'drake-take-care' },
  { id: 's-drake-tc-03', title: 'Headlines',                     artistId: 'drake',           artistName: 'Drake',              album: 'Take Care',                         duration: '3:53', mood: 'hype',   albumArtColor: '#1a1a2a', albumArtPath: 'drake-take-care' },
  { id: 's-drake-tc-04', title: 'The Motto',                     artistId: 'drake',           artistName: 'Drake',              album: 'Take Care',                         duration: '4:32', mood: 'hype',   albumArtColor: '#1a1a2a', albumArtPath: 'drake-take-care' },
  // --- Drake: Nothing Was The Same (2013) ---
  { id: 's-drake-nwts-01', title: 'Started From the Bottom',     artistId: 'drake',           artistName: 'Drake',              album: 'Nothing Was The Same',              duration: '3:03', mood: 'hype',   albumArtColor: '#2a3a4a', albumArtPath: 'drake-nothing-was-the-same', audioBadge: 'DOLBY_ATMOS' },
  { id: 's-drake-nwts-02', title: "Hold On, We're Going Home",   artistId: 'drake',           artistName: 'Drake',              album: 'Nothing Was The Same',              duration: '3:50', mood: 'love',   albumArtColor: '#2a3a4a', albumArtPath: 'drake-nothing-was-the-same' },
  { id: 's-drake-nwts-03', title: 'Worst Behavior',              artistId: 'drake',           artistName: 'Drake',              album: 'Nothing Was The Same',              duration: '5:07', mood: 'angry',  albumArtColor: '#2a3a4a', albumArtPath: 'drake-nothing-was-the-same' },
  { id: 's-drake-nwts-04', title: 'Pound Cake',                  artistId: 'drake',           artistName: 'Drake',              album: 'Nothing Was The Same',              duration: '6:52', mood: 'chill',  albumArtColor: '#2a3a4a', albumArtPath: 'drake-nothing-was-the-same' },
  // --- BTS (Arirang album art) ---
  { id: 's-bts-arirang2', title: 'Arirang (Live)',              artistId: 'bts',             artistName: 'BTS',                album: 'Arirang',                           duration: '4:08', mood: 'sad',    albumArtColor: '#1a2848', albumArtPath: 'bts-arirang-album', audioBadge: 'DOLBY_ATMOS' },
  // --- Sabrina Carpenter (additional) ---
  { id: 's-sabrina3',     title: "Man's Best Friend",           artistId: 'sabrina-carpenter', artistName: 'Sabrina Carpenter', album: "Man's Best Friend",               duration: '3:08', mood: 'happy',  albumArtColor: '#2a1808', albumArtPath: 'sabrina-mans-best-friend' },
  // --- Taylor Swift (additional) ---
  { id: 's-ts-showgirl',  title: 'The Life of a Showgirl',      artistId: 'tswift',          artistName: 'Taylor Swift',       album: 'The Life of a Showgirl',            duration: '3:52', mood: 'hype',   albumArtColor: '#4a1080', albumArtPath: 'ts-showgirl-life', audioBadge: 'DOLBY_ATMOS' },
  // --- Sia ---
  { id: 's-sia1',         title: 'Chandelier',                  artistId: 'sia',             artistName: 'Sia',                album: '1000 Forms of Fear',                duration: '3:36', mood: 'sad',    albumArtColor: '#1a1a2a', albumArtPath: 'sia', audioBadge: 'DOLBY_ATMOS' },
  { id: 's-sia2',         title: 'Elastic Heart',               artistId: 'sia',             artistName: 'Sia',                album: '1000 Forms of Fear',                duration: '4:17', mood: 'hype',   albumArtColor: '#2a1a2a', albumArtPath: 'sia' },

  // ── Expanded catalog ─────────────────────────────────────────────────────────
  //    Real track names added for single-song artists so their journey pages,
  //    playlists, and shuffle feel full. Each reuses the artist's existing album
  //    art (same album), so covers stay accurate.
  { id: 's-ariana5',  title: 'no tears left to cry',            artistId: 'ariana-grande',   artistName: 'Ariana Grande',      album: 'Sweetener',                 duration: '3:26', mood: 'sad',   albumArtColor: '#2a1a3a', albumArtPath: 'ariana-sweetener' },
  { id: 's-ariana3',  title: 'breathin',                        artistId: 'ariana-grande',   artistName: 'Ariana Grande',      album: 'Sweetener',                 duration: '3:18', mood: 'hype',  albumArtColor: '#2a1a3a', albumArtPath: 'ariana-sweetener' },
  { id: 's-ariana4',  title: 'R.E.M',                           artistId: 'ariana-grande',   artistName: 'Ariana Grande',      album: 'Sweetener',                 duration: '3:31', mood: 'chill', albumArtColor: '#2a1a3a', albumArtPath: 'ariana-sweetener' },
  { id: 's-ariana6',  title: 'hate that i made you love me',    artistId: 'ariana-grande',   artistName: 'Ariana Grande',      album: 'Sweetener',                 duration: '3:22', mood: 'sad',   albumArtColor: '#2a1a3a', albumArtPath: 'ariana-sweetener' },
  { id: 's-janet2',   title: 'Miss You Much',                   artistId: 'janet-jackson',   artistName: 'Janet Jackson',      album: 'Rhythm Nation 1814',        duration: '4:12', mood: 'hype',  albumArtColor: '#0a0a0a', albumArtPath: 'janet-rhythm-nation' },
  { id: 's-janet3',   title: 'Escapade',                        artistId: 'janet-jackson',   artistName: 'Janet Jackson',      album: 'Rhythm Nation 1814',        duration: '4:44', mood: 'happy', albumArtColor: '#0a0a0a', albumArtPath: 'janet-rhythm-nation' },
  { id: 's-janet4',   title: 'Love Will Never Do (Without You)', artistId: 'janet-jackson',  artistName: 'Janet Jackson',      album: 'Rhythm Nation 1814',        duration: '5:49', mood: 'love',  albumArtColor: '#0a0a0a', albumArtPath: 'janet-rhythm-nation' },
  { id: 's-pf2',      title: 'Time',                            artistId: 'pink-floyd',      artistName: 'Pink Floyd',         album: 'The Dark Side of the Moon', duration: '6:53', mood: 'chill', albumArtColor: '#0a0a14', albumArtPath: 'pink-floyd-dark-side' },
  { id: 's-pf3',      title: 'Breathe (In the Air)',            artistId: 'pink-floyd',      artistName: 'Pink Floyd',         album: 'The Dark Side of the Moon', duration: '2:43', mood: 'chill', albumArtColor: '#0a0a14', albumArtPath: 'pink-floyd-dark-side' },
  { id: 's-pf4',      title: 'The Great Gig in the Sky',        artistId: 'pink-floyd',      artistName: 'Pink Floyd',         album: 'The Dark Side of the Moon', duration: '4:15', mood: 'sad',   albumArtColor: '#0a0a14', albumArtPath: 'pink-floyd-dark-side' },
  { id: 's-cardi2',   title: 'I Like It',                       artistId: 'cardi-b',         artistName: 'Cardi B',            album: 'Invasion of Privacy',       duration: '4:13', mood: 'hype',  albumArtColor: '#1a0a0a', albumArtPath: 'cardi-invasion' },
  { id: 's-cardi3',   title: 'Be Careful',                      artistId: 'cardi-b',         artistName: 'Cardi B',            album: 'Invasion of Privacy',       duration: '3:31', mood: 'sad',   albumArtColor: '#1a0a0a', albumArtPath: 'cardi-invasion' },
  { id: 's-cardi4',   title: 'Bartier Cardi',                   artistId: 'cardi-b',         artistName: 'Cardi B',            album: 'Invasion of Privacy',       duration: '3:16', mood: 'hype',  albumArtColor: '#1a0a0a', albumArtPath: 'cardi-invasion' },
  { id: 's-carole2',  title: "It's Too Late",                   artistId: 'carole-king',     artistName: 'Carole King',        album: 'Tapestry',                  duration: '3:53', mood: 'sad',   albumArtColor: '#2a1a0a', albumArtPath: 'carole-king-tapestry' },
  { id: 's-carole3',  title: 'So Far Away',                     artistId: 'carole-king',     artistName: 'Carole King',        album: 'Tapestry',                  duration: '3:55', mood: 'chill', albumArtColor: '#2a1a0a', albumArtPath: 'carole-king-tapestry' },
  { id: 's-carole4',  title: "You've Got a Friend",             artistId: 'carole-king',     artistName: 'Carole King',        album: 'Tapestry',                  duration: '5:09', mood: 'love',  albumArtColor: '#2a1a0a', albumArtPath: 'carole-king-tapestry' },
  { id: 's-chance2',  title: 'Juice',                           artistId: 'chance-the-rapper', artistName: 'Chance the Rapper', album: 'Acid Rap',                 duration: '3:09', mood: 'hype',  albumArtColor: '#0a1a2a', albumArtPath: 'chance-acid-rap' },
  { id: 's-chance3',  title: 'Favorite Song',                   artistId: 'chance-the-rapper', artistName: 'Chance the Rapper', album: 'Acid Rap',                 duration: '3:20', mood: 'happy', albumArtColor: '#0a1a2a', albumArtPath: 'chance-acid-rap' },
  { id: 's-chance4',  title: 'Acid Rain',                       artistId: 'chance-the-rapper', artistName: 'Chance the Rapper', album: 'Acid Rap',                 duration: '4:00', mood: 'sad',   albumArtColor: '#0a1a2a', albumArtPath: 'chance-acid-rap' },
  { id: 's-elton2',   title: 'Bennie and the Jets',             artistId: 'elton-john',      artistName: 'Elton John',         album: 'Goodbye Yellow Brick Road', duration: '5:23', mood: 'hype',  albumArtColor: '#2a1a08', albumArtPath: 'elton-goodbye-yellow' },
  { id: 's-elton3',   title: 'Candle in the Wind',              artistId: 'elton-john',      artistName: 'Elton John',         album: 'Goodbye Yellow Brick Road', duration: '3:50', mood: 'sad',   albumArtColor: '#2a1a08', albumArtPath: 'elton-goodbye-yellow' },
  { id: 's-elton4',   title: "Saturday Night's Alright for Fighting", artistId: 'elton-john', artistName: 'Elton John',        album: 'Goodbye Yellow Brick Road', duration: '4:57', mood: 'hype',  albumArtColor: '#2a1a08', albumArtPath: 'elton-goodbye-yellow' },
  { id: 's-jcole2',   title: 'Wet Dreamz',                      artistId: 'j-cole',          artistName: 'J. Cole',            album: '2014 Forest Hills Drive',   duration: '3:57', mood: 'chill', albumArtColor: '#1a0808', albumArtPath: 'jcole-forest-hills' },
  { id: 's-jcole3',   title: 'Apparently',                      artistId: 'j-cole',          artistName: 'J. Cole',            album: '2014 Forest Hills Drive',   duration: '4:00', mood: 'sad',   albumArtColor: '#1a0808', albumArtPath: 'jcole-forest-hills' },
  { id: 's-jcole4',   title: 'Fire Squad',                      artistId: 'j-cole',          artistName: 'J. Cole',            album: '2014 Forest Hills Drive',   duration: '4:34', mood: 'hype',  albumArtColor: '#1a0808', albumArtPath: 'jcole-forest-hills' },
  { id: 's-jayz2',    title: 'Dirt Off Your Shoulder',          artistId: 'jay-z',           artistName: 'Jay-Z',              album: 'The Black Album',           duration: '4:04', mood: 'hype',  albumArtColor: '#0a0a0a', albumArtPath: 'jayz-black-album' },
  { id: 's-jayz3',    title: 'Encore',                          artistId: 'jay-z',           artistName: 'Jay-Z',              album: 'The Black Album',           duration: '4:11', mood: 'hype',  albumArtColor: '#0a0a0a', albumArtPath: 'jayz-black-album' },
  { id: 's-jayz4',    title: 'December 4th',                    artistId: 'jay-z',           artistName: 'Jay-Z',              album: 'The Black Album',           duration: '4:34', mood: 'chill', albumArtColor: '#0a0a0a', albumArtPath: 'jayz-black-album' },
  { id: 's-katy2',    title: 'Dark Horse',                      artistId: 'katy-perry',      artistName: 'Katy Perry',         album: 'Prism',                     duration: '3:35', mood: 'hype',  albumArtColor: '#2a1a08', albumArtPath: 'katy-perry' },
  { id: 's-katy3',    title: 'Unconditionally',                 artistId: 'katy-perry',      artistName: 'Katy Perry',         album: 'Prism',                     duration: '3:48', mood: 'love',  albumArtColor: '#2a1a08', albumArtPath: 'katy-perry' },
  { id: 's-katy4',    title: 'Birthday',                        artistId: 'katy-perry',      artistName: 'Katy Perry',         album: 'Prism',                     duration: '3:35', mood: 'happy', albumArtColor: '#2a1a08', albumArtPath: 'katy-perry' },
  { id: 's-lizzo2',   title: 'Tempo',                           artistId: 'lizzo',           artistName: 'Lizzo',              album: 'Cuz I Love You',            duration: '3:00', mood: 'hype',  albumArtColor: '#2a0a18', albumArtPath: 'lizzo-cuz-i-love-you' },
  { id: 's-lizzo3',   title: 'Cuz I Love You',                  artistId: 'lizzo',           artistName: 'Lizzo',              album: 'Cuz I Love You',            duration: '3:53', mood: 'love',  albumArtColor: '#2a0a18', albumArtPath: 'lizzo-cuz-i-love-you' },
  { id: 's-lizzo4',   title: 'Like a Girl',                     artistId: 'lizzo',           artistName: 'Lizzo',              album: 'Cuz I Love You',            duration: '3:16', mood: 'hype',  albumArtColor: '#2a0a18', albumArtPath: 'lizzo-cuz-i-love-you' },
  { id: 's-outkast2', title: 'Ms. Jackson',                     artistId: 'outkast',         artistName: 'Outkast',            album: 'Stankonia',                 duration: '4:30', mood: 'sad',   albumArtColor: '#0a1a08', albumArtPath: 'outkast-stankonia' },
  { id: 's-outkast3', title: 'So Fresh, So Clean',              artistId: 'outkast',         artistName: 'Outkast',            album: 'Stankonia',                 duration: '4:00', mood: 'hype',  albumArtColor: '#0a1a08', albumArtPath: 'outkast-stankonia' },
  { id: 's-outkast4', title: 'Gasoline Dreams',                 artistId: 'outkast',         artistName: 'Outkast',            album: 'Stankonia',                 duration: '3:34', mood: 'hype',  albumArtColor: '#0a1a08', albumArtPath: 'outkast-stankonia' },
  { id: 's-mjb2',     title: 'My Life',                         artistId: 'mary-j-blige',    artistName: 'Mary J. Blige',      album: 'My Life',                   duration: '5:00', mood: 'sad',   albumArtColor: '#0a0a1a', albumArtPath: 'mjb-my-life' },
  { id: 's-mjb3',     title: "I'm Goin' Down",                  artistId: 'mary-j-blige',    artistName: 'Mary J. Blige',      album: 'My Life',                   duration: '4:03', mood: 'sad',   albumArtColor: '#0a0a1a', albumArtPath: 'mjb-my-life' },
  { id: 's-mjb4',     title: 'You Bring Me Joy',                artistId: 'mary-j-blige',    artistName: 'Mary J. Blige',      album: 'My Life',                   duration: '5:23', mood: 'love',  albumArtColor: '#0a0a1a', albumArtPath: 'mjb-my-life' },
  { id: 's-tyler2',   title: 'I THINK',                         artistId: 'tyler-the-creator', artistName: 'Tyler the Creator', album: 'IGOR',                    duration: '3:49', mood: 'hype',  albumArtColor: '#0a0a0a', albumArtPath: 'tyler-igor' },
  { id: 's-tyler3',   title: 'RUNNING OUT OF TIME',             artistId: 'tyler-the-creator', artistName: 'Tyler the Creator', album: 'IGOR',                    duration: '3:26', mood: 'sad',   albumArtColor: '#0a0a0a', albumArtPath: 'tyler-igor' },
  { id: 's-tyler4',   title: 'EARFQUAKE (Reprise)',             artistId: 'tyler-the-creator', artistName: 'Tyler the Creator', album: 'IGOR',                    duration: '3:10', mood: 'love',  albumArtColor: '#0a0a0a', albumArtPath: 'tyler-igor' },
  { id: 's-whitney2', title: 'How Will I Know',                 artistId: 'whitney-houston', artistName: 'Whitney Houston',    album: 'Whitney Houston',           duration: '4:37', mood: 'happy', albumArtColor: '#1a0a2a', albumArtPath: 'whitney-self-titled' },
  { id: 's-whitney3', title: 'Saving All My Love for You',      artistId: 'whitney-houston', artistName: 'Whitney Houston',    album: 'Whitney Houston',           duration: '3:57', mood: 'love',  albumArtColor: '#1a0a2a', albumArtPath: 'whitney-self-titled' },
  { id: 's-whitney4', title: 'You Give Good Love',              artistId: 'whitney-houston', artistName: 'Whitney Houston',    album: 'Whitney Houston',           duration: '4:36', mood: 'love',  albumArtColor: '#1a0a2a', albumArtPath: 'whitney-self-titled' },
  { id: 's-madonna2', title: 'La Isla Bonita',                  artistId: 'madonna',         artistName: 'Madonna',            album: 'True Blue',                 duration: '4:02', mood: 'happy', albumArtColor: '#1a2a4a', albumArtPath: 'madonna-true-blue' },
  { id: 's-madonna3', title: 'Open Your Heart',                 artistId: 'madonna',         artistName: 'Madonna',            album: 'True Blue',                 duration: '4:13', mood: 'hype',  albumArtColor: '#1a2a4a', albumArtPath: 'madonna-true-blue' },
  { id: 's-madonna4', title: 'True Blue',                       artistId: 'madonna',         artistName: 'Madonna',            album: 'True Blue',                 duration: '4:18', mood: 'love',  albumArtColor: '#1a2a4a', albumArtPath: 'madonna-true-blue' },
  { id: 's-fleet2',   title: 'Dreams',                          artistId: 'fleetwood-mac',   artistName: 'Fleetwood Mac',      album: 'Rumours',                   duration: '4:14', mood: 'chill', albumArtColor: '#3a2a1a', albumArtPath: 'fleetwood-rumours' },
  { id: 's-fleet3',   title: 'The Chain',                       artistId: 'fleetwood-mac',   artistName: 'Fleetwood Mac',      album: 'Rumours',                   duration: '4:28', mood: 'hype',  albumArtColor: '#3a2a1a', albumArtPath: 'fleetwood-rumours' },
  { id: 's-fleet4',   title: "Don't Stop",                      artistId: 'fleetwood-mac',   artistName: 'Fleetwood Mac',      album: 'Rumours',                   duration: '3:11', mood: 'happy', albumArtColor: '#3a2a1a', albumArtPath: 'fleetwood-rumours' },
  { id: 's-nicki2',   title: 'Feeling Myself',                  artistId: 'nicki-minaj',     artistName: 'Nicki Minaj',        album: 'The Pinkprint',             duration: '3:47', mood: 'hype',  albumArtColor: '#2a0a1a', albumArtPath: 'nicki-pinkprint' },
  { id: 's-nicki3',   title: 'The Night Is Still Young',        artistId: 'nicki-minaj',     artistName: 'Nicki Minaj',        album: 'The Pinkprint',             duration: '3:47', mood: 'hype',  albumArtColor: '#2a0a1a', albumArtPath: 'nicki-pinkprint' },
  { id: 's-nicki4',   title: 'Truffle Butter',                  artistId: 'nicki-minaj',     artistName: 'Nicki Minaj',        album: 'The Pinkprint',             duration: '3:50', mood: 'hype',  albumArtColor: '#2a0a1a', albumArtPath: 'nicki-pinkprint' },
  { id: 's-metallica2', title: 'Battery',                       artistId: 'metallica',       artistName: 'Metallica',          album: 'Master of Puppets',         duration: '5:12', mood: 'hype',  albumArtColor: '#0a0a1a', albumArtPath: 'metallica-master' },
  { id: 's-metallica3', title: 'Welcome Home (Sanitarium)',     artistId: 'metallica',       artistName: 'Metallica',          album: 'Master of Puppets',         duration: '6:27', mood: 'hype',  albumArtColor: '#0a0a1a', albumArtPath: 'metallica-master' },
  { id: 's-metallica4', title: 'Disposable Heroes',             artistId: 'metallica',       artistName: 'Metallica',          album: 'Master of Puppets',         duration: '8:17', mood: 'hype',  albumArtColor: '#0a0a1a', albumArtPath: 'metallica-master' },
  { id: 's-beatles3', title: 'Here Comes the Sun',              artistId: 'beatles',         artistName: 'The Beatles',        album: 'Abbey Road',                duration: '3:05', mood: 'happy', albumArtColor: '#2a3a2a', albumArtPath: 'beatles-abbey-road' },
  { id: 's-beatles4', title: 'Something',                       artistId: 'beatles',         artistName: 'The Beatles',        album: 'Abbey Road',                duration: '3:03', mood: 'love',  albumArtColor: '#2a3a2a', albumArtPath: 'beatles-abbey-road' },
  { id: 's-sza2',     title: 'Snooze',                          artistId: 'sza',             artistName: 'SZA',                album: 'SOS',                       duration: '3:22', mood: 'love',  albumArtColor: '#1a0808', albumArtPath: 'sza-sos' },
  { id: 's-sza3',     title: 'Good Days',                       artistId: 'sza',             artistName: 'SZA',                album: 'SOS',                       duration: '4:39', mood: 'chill', albumArtColor: '#1a0808', albumArtPath: 'sza-sos' },
  { id: 's-sza4',     title: 'Nobody Gets Me',                  artistId: 'sza',             artistName: 'SZA',                album: 'SOS',                       duration: '3:01', mood: 'sad',   albumArtColor: '#1a0808', albumArtPath: 'sza-sos' },
  { id: 's-weeknd2',  title: 'Save Your Tears',                 artistId: 'the-weeknd',      artistName: 'The Weeknd',         album: 'After Hours',               duration: '3:35', mood: 'sad',   albumArtColor: '#1a0808', albumArtPath: 'the-weeknd' },
  { id: 's-weeknd3',  title: 'In Your Eyes',                    artistId: 'the-weeknd',      artistName: 'The Weeknd',         album: 'After Hours',               duration: '3:57', mood: 'hype',  albumArtColor: '#1a0808', albumArtPath: 'the-weeknd' },
  { id: 's-weeknd4',  title: 'Heartless',                       artistId: 'the-weeknd',      artistName: 'The Weeknd',         album: 'After Hours',               duration: '3:18', mood: 'hype',  albumArtColor: '#1a0808', albumArtPath: 'the-weeknd' },
  { id: 's-fka2',     title: 'Pendulum',                        artistId: 'fka-twigs',       artistName: 'FKA Twigs',          album: 'LP1',                       duration: '4:57', mood: 'sad',   albumArtColor: '#1a0a1a', albumArtPath: 'fka-twigs-lp1' },
  { id: 's-fka3',     title: 'Video Girl',                      artistId: 'fka-twigs',       artistName: 'FKA Twigs',          album: 'LP1',                       duration: '3:56', mood: 'chill', albumArtColor: '#1a0a1a', albumArtPath: 'fka-twigs-lp1' },
  { id: 's-fka4',     title: 'Lights On',                       artistId: 'fka-twigs',       artistName: 'FKA Twigs',          album: 'LP1',                       duration: '3:37', mood: 'love',  albumArtColor: '#1a0a1a', albumArtPath: 'fka-twigs-lp1' },
  { id: 's-blink2',   title: "What's My Age Again?",            artistId: 'blink-182',       artistName: 'Blink-182',          album: 'Enema of the State',        duration: '2:28', mood: 'hype',  albumArtColor: '#1a2a1a', albumArtPath: 'blink-182-enema' },
  { id: 's-blink3',   title: "Adam's Song",                     artistId: 'blink-182',       artistName: 'Blink-182',          album: 'Enema of the State',        duration: '4:08', mood: 'sad',   albumArtColor: '#1a2a1a', albumArtPath: 'blink-182-enema' },
  { id: 's-blink4',   title: 'Going Away to College',           artistId: 'blink-182',       artistName: 'Blink-182',          album: 'Enema of the State',        duration: '2:58', mood: 'hype',  albumArtColor: '#1a2a1a', albumArtPath: 'blink-182-enema' },
  { id: 's-asap2',    title: 'Wild for the Night',              artistId: 'asap-rocky',      artistName: 'A$AP Rocky',         album: 'Long.Live.A$AP',            duration: '3:59', mood: 'hype',  albumArtColor: '#1a1a1a', albumArtPath: 'asap-long-live' },
  { id: 's-asap3',    title: 'Fashion Killa',                   artistId: 'asap-rocky',      artistName: 'A$AP Rocky',         album: 'Long.Live.A$AP',            duration: '4:04', mood: 'chill', albumArtColor: '#1a1a1a', albumArtPath: 'asap-long-live' },
  { id: 's-asap4',    title: 'Long Live A$AP',                  artistId: 'asap-rocky',      artistName: 'A$AP Rocky',         album: 'Long.Live.A$AP',            duration: '4:52', mood: 'hype',  albumArtColor: '#1a1a1a', albumArtPath: 'asap-long-live' },
  { id: 's-billie2',  title: "You've Changed",                  artistId: 'billie-holiday',  artistName: 'Billie Holiday',     album: 'Lady in Satin',             duration: '4:12', mood: 'sad',   albumArtColor: '#2a1a0a', albumArtPath: 'billie-holiday-satin' },
  { id: 's-billie3',  title: 'For All We Know',                 artistId: 'billie-holiday',  artistName: 'Billie Holiday',     album: 'Lady in Satin',             duration: '2:56', mood: 'sad',   albumArtColor: '#2a1a0a', albumArtPath: 'billie-holiday-satin' },
  { id: 's-zara2',    title: 'Never Forget You',                artistId: 'zara-larsson',    artistName: 'Zara Larsson',       album: 'So Good',                   duration: '3:32', mood: 'love',  albumArtColor: '#0a2a1a', albumArtPath: 'zara-larsson-so-good' },
  { id: 's-zara3',    title: "Ain't My Fault",                  artistId: 'zara-larsson',    artistName: 'Zara Larsson',       album: 'So Good',                   duration: '3:31', mood: 'hype',  albumArtColor: '#0a2a1a', albumArtPath: 'zara-larsson-so-good' },
  { id: 's-noah2',    title: 'Dial Drunk',                      artistId: 'noah-kahan',      artistName: 'Noah Kahan',         album: 'Stick Season',              duration: '3:16', mood: 'sad',   albumArtColor: '#2a1a0a', albumArtPath: 'noah-kahan-great-divide' },
  { id: 's-noah3',    title: 'Northern Attitude',               artistId: 'noah-kahan',      artistName: 'Noah Kahan',         album: 'Stick Season',              duration: '3:15', mood: 'chill', albumArtColor: '#2a1a0a', albumArtPath: 'noah-kahan-great-divide' },
  { id: 's-sia3',     title: 'Big Girls Cry',                   artistId: 'sia',             artistName: 'Sia',                album: '1000 Forms of Fear',        duration: '3:23', mood: 'sad',   albumArtColor: '#1a1a2a', albumArtPath: 'sia' },

  // ── Taylor Swift — Full Discography ──────────────────────────────────────────

  // --- Taylor Swift (debut, 2006) ---
  { id: 's-ts-debut-01', title: 'Tim McGraw',                    artistId: 'tswift', artistName: 'Taylor Swift', album: 'Taylor Swift',      duration: '3:52', mood: 'chill',   albumArtColor: '#c8a060', albumArtPath: 'tswift-1' },
  { id: 's-ts-debut-02', title: 'Teardrops on My Guitar',        artistId: 'tswift', artistName: 'Taylor Swift', album: 'Taylor Swift',      duration: '3:33', mood: 'sad',     albumArtColor: '#c8a060', albumArtPath: 'tswift-1' },
  { id: 's-ts-debut-03', title: 'Our Song',                      artistId: 'tswift', artistName: 'Taylor Swift', album: 'Taylor Swift',      duration: '3:22', mood: 'happy',   albumArtColor: '#c8a060', albumArtPath: 'tswift-1' },
  { id: 's-ts-debut-04', title: 'Picture to Burn',               artistId: 'tswift', artistName: 'Taylor Swift', album: 'Taylor Swift',      duration: '3:22', mood: 'hype',    albumArtColor: '#c8a060', albumArtPath: 'tswift-1' },
  { id: 's-ts-debut-05', title: "Should've Said No",             artistId: 'tswift', artistName: 'Taylor Swift', album: 'Taylor Swift',      duration: '3:50', mood: 'angry',   albumArtColor: '#c8a060', albumArtPath: 'tswift-1' },
  { id: 's-ts-debut-06', title: 'The Outside',                   artistId: 'tswift', artistName: 'Taylor Swift', album: 'Taylor Swift',      duration: '3:38', mood: 'sad',     albumArtColor: '#c8a060', albumArtPath: 'tswift-1' },

  // --- Fearless (2008) ---
  { id: 's-ts-fearless-01', title: 'Love Story',                 artistId: 'tswift', artistName: 'Taylor Swift', album: 'Fearless',          duration: '3:55', mood: 'love',    albumArtColor: '#d4a843', albumArtPath: 'tswift-1', audioBadge: 'DOLBY_ATMOS' },
  { id: 's-ts-fearless-02', title: 'You Belong With Me',         artistId: 'tswift', artistName: 'Taylor Swift', album: 'Fearless',          duration: '3:51', mood: 'happy',   albumArtColor: '#d4a843', albumArtPath: 'tswift-1' },
  { id: 's-ts-fearless-03', title: 'Fearless',                   artistId: 'tswift', artistName: 'Taylor Swift', album: 'Fearless',          duration: '4:01', mood: 'happy',   albumArtColor: '#d4a843', albumArtPath: 'tswift-1' },
  { id: 's-ts-fearless-04', title: 'White Horse',                artistId: 'tswift', artistName: 'Taylor Swift', album: 'Fearless',          duration: '3:54', mood: 'sad',     albumArtColor: '#d4a843', albumArtPath: 'tswift-1' },
  { id: 's-ts-fearless-05', title: "You're Not Sorry",           artistId: 'tswift', artistName: 'Taylor Swift', album: 'Fearless',          duration: '4:03', mood: 'sad',     albumArtColor: '#d4a843', albumArtPath: 'tswift-1' },
  { id: 's-ts-fearless-06', title: 'Change',                     artistId: 'tswift', artistName: 'Taylor Swift', album: 'Fearless',          duration: '4:32', mood: 'hype',    albumArtColor: '#d4a843', albumArtPath: 'tswift-1' },
  { id: 's-ts-fearless-07', title: 'The Best Day',               artistId: 'tswift', artistName: 'Taylor Swift', album: 'Fearless',          duration: '4:05', mood: 'happy',   albumArtColor: '#d4a843', albumArtPath: 'tswift-1' },

  // --- Speak Now (2010) ---
  { id: 's-ts-speaknow-01', title: 'Speak Now',                  artistId: 'tswift', artistName: 'Taylor Swift', album: 'Speak Now',         duration: '4:00', mood: 'hype',    albumArtColor: '#7a3090', albumArtPath: 'tswift-1' },
  { id: 's-ts-speaknow-02', title: 'Mean',                       artistId: 'tswift', artistName: 'Taylor Swift', album: 'Speak Now',         duration: '3:58', mood: 'angry',   albumArtColor: '#7a3090', albumArtPath: 'tswift-1' },
  { id: 's-ts-speaknow-03', title: 'Back to December',           artistId: 'tswift', artistName: 'Taylor Swift', album: 'Speak Now',         duration: '4:35', mood: 'sad',     albumArtColor: '#7a3090', albumArtPath: 'tswift-1' },
  { id: 's-ts-speaknow-04', title: 'Enchanted',                  artistId: 'tswift', artistName: 'Taylor Swift', album: 'Speak Now',         duration: '5:52', mood: 'love',    albumArtColor: '#7a3090', albumArtPath: 'tswift-1' },
  { id: 's-ts-speaknow-05', title: 'Long Live',                  artistId: 'tswift', artistName: 'Taylor Swift', album: 'Speak Now',         duration: '5:17', mood: 'hype',    albumArtColor: '#7a3090', albumArtPath: 'tswift-1' },
  { id: 's-ts-speaknow-06', title: 'Dear John',                  artistId: 'tswift', artistName: 'Taylor Swift', album: 'Speak Now',         duration: '6:44', mood: 'angry',   albumArtColor: '#7a3090', albumArtPath: 'tswift-1' },
  { id: 's-ts-speaknow-07', title: 'Last Kiss',                  artistId: 'tswift', artistName: 'Taylor Swift', album: 'Speak Now',         duration: '6:07', mood: 'sad',     albumArtColor: '#7a3090', albumArtPath: 'tswift-1' },

  // --- Red (2012) ---
  { id: 's-ts-red-01', title: 'We Are Never Ever Getting Back Together', artistId: 'tswift', artistName: 'Taylor Swift', album: 'Red', duration: '3:13', mood: 'hype',  albumArtColor: '#8b1a1a', albumArtPath: 'ts-red', audioBadge: 'DOLBY_ATMOS' },
  { id: 's-ts-red-02', title: 'I Knew You Were Trouble',         artistId: 'tswift', artistName: 'Taylor Swift', album: 'Red',               duration: '3:39', mood: 'angry',   albumArtColor: '#8b1a1a', albumArtPath: 'ts-red' },
  { id: 's-ts-red-03', title: 'All Too Well',                    artistId: 'tswift', artistName: 'Taylor Swift', album: 'Red',               duration: '5:29', mood: 'sad',     albumArtColor: '#8b1a1a', albumArtPath: 'ts-red', audioBadge: 'DOLBY_ATMOS' },
  { id: 's-ts-red-04', title: '22',                              artistId: 'tswift', artistName: 'Taylor Swift', album: 'Red',               duration: '3:52', mood: 'happy',   albumArtColor: '#8b1a1a', albumArtPath: 'ts-red' },
  { id: 's-ts-red-05', title: 'Red',                             artistId: 'tswift', artistName: 'Taylor Swift', album: 'Red',               duration: '3:40', mood: 'hype',    albumArtColor: '#8b1a1a', albumArtPath: 'ts-red' },
  { id: 's-ts-red-06', title: 'Everything Has Changed',          artistId: 'tswift', artistName: 'Taylor Swift', album: 'Red',               duration: '4:05', mood: 'love',    albumArtColor: '#8b1a1a', albumArtPath: 'ts-red' },
  { id: 's-ts-red-07', title: 'Treacherous',                     artistId: 'tswift', artistName: 'Taylor Swift', album: 'Red',               duration: '4:01', mood: 'love',    albumArtColor: '#8b1a1a', albumArtPath: 'ts-red' },
  { id: 's-ts-red-08', title: 'Holy Ground',                     artistId: 'tswift', artistName: 'Taylor Swift', album: 'Red',               duration: '3:23', mood: 'hype',    albumArtColor: '#8b1a1a', albumArtPath: 'ts-red' },
  { id: 's-ts-red-09', title: 'State of Grace',                  artistId: 'tswift', artistName: 'Taylor Swift', album: 'Red',               duration: '4:55', mood: 'hype',    albumArtColor: '#8b1a1a', albumArtPath: 'ts-red' },

  // --- 1989 (additional, 2014) ---
  { id: 's-ts1989-02', title: 'Shake It Off',                    artistId: 'tswift', artistName: 'Taylor Swift', album: '1989',              duration: '3:39', mood: 'hype',    albumArtColor: '#b4c5e4', albumArtPath: 'ts-1989', audioBadge: 'DOLBY_ATMOS' },
  { id: 's-ts1989-03', title: 'Style',                           artistId: 'tswift', artistName: 'Taylor Swift', album: '1989',              duration: '3:51', mood: 'love',    albumArtColor: '#b4c5e4', albumArtPath: 'ts-1989' },
  { id: 's-ts1989-04', title: 'Bad Blood',                       artistId: 'tswift', artistName: 'Taylor Swift', album: '1989',              duration: '3:31', mood: 'hype',    albumArtColor: '#b4c5e4', albumArtPath: 'ts-1989' },
  { id: 's-ts1989-05', title: 'Wildest Dreams',                  artistId: 'tswift', artistName: 'Taylor Swift', album: '1989',              duration: '3:40', mood: 'love',    albumArtColor: '#b4c5e4', albumArtPath: 'ts-1989' },
  { id: 's-ts1989-06', title: 'Out of the Woods',                artistId: 'tswift', artistName: 'Taylor Swift', album: '1989',              duration: '3:55', mood: 'sad',     albumArtColor: '#b4c5e4', albumArtPath: 'ts-1989' },
  { id: 's-ts1989-07', title: 'New Romantics',                   artistId: 'tswift', artistName: 'Taylor Swift', album: '1989',              duration: '3:50', mood: 'happy',   albumArtColor: '#b4c5e4', albumArtPath: 'ts-1989' },
  { id: 's-ts1989-08', title: 'Clean',                           artistId: 'tswift', artistName: 'Taylor Swift', album: '1989',              duration: '4:31', mood: 'chill',   albumArtColor: '#b4c5e4', albumArtPath: 'ts-1989' },

  // --- reputation (additional, 2017) ---
  { id: 's-ts-rep-02', title: 'Delicate',                        artistId: 'tswift', artistName: 'Taylor Swift', album: 'Reputation',        duration: '3:52', mood: 'love',    albumArtColor: '#0a0a14', albumArtPath: 'ts-reputation' },
  { id: 's-ts-rep-03', title: 'Getaway Car',                     artistId: 'tswift', artistName: 'Taylor Swift', album: 'Reputation',        duration: '3:13', mood: 'hype',    albumArtColor: '#0a0a14', albumArtPath: 'ts-reputation', audioBadge: 'DOLBY_ATMOS' },
  { id: 's-ts-rep-04', title: 'Gorgeous',                        artistId: 'tswift', artistName: 'Taylor Swift', album: 'Reputation',        duration: '3:29', mood: 'happy',   albumArtColor: '#0a0a14', albumArtPath: 'ts-reputation' },
  { id: 's-ts-rep-05', title: '...Ready for It?',                artistId: 'tswift', artistName: 'Taylor Swift', album: 'Reputation',        duration: '3:28', mood: 'hype',    albumArtColor: '#0a0a14', albumArtPath: 'ts-reputation' },
  { id: 's-ts-rep-06', title: "Don't Blame Me",                  artistId: 'tswift', artistName: 'Taylor Swift', album: 'Reputation',        duration: '3:56', mood: 'hype',    albumArtColor: '#0a0a14', albumArtPath: 'ts-reputation' },
  { id: 's-ts-rep-07', title: 'Call It What You Want',           artistId: 'tswift', artistName: 'Taylor Swift', album: 'Reputation',        duration: '3:23', mood: 'love',    albumArtColor: '#0a0a14', albumArtPath: 'ts-reputation' },
  { id: 's-ts-rep-08', title: 'New Year\'s Day',                 artistId: 'tswift', artistName: 'Taylor Swift', album: 'Reputation',        duration: '3:55', mood: 'chill',   albumArtColor: '#0a0a14', albumArtPath: 'ts-reputation' },

  // --- Lover (additional, 2019) ---
  { id: 's-ts-lover-02', title: 'Lover',                         artistId: 'tswift', artistName: 'Taylor Swift', album: 'Lover',             duration: '3:41', mood: 'love',    albumArtColor: '#e8b4c0', albumArtPath: 'ts-lover', audioBadge: 'DOLBY_ATMOS' },
  { id: 's-ts-lover-03', title: 'You Need to Calm Down',         artistId: 'tswift', artistName: 'Taylor Swift', album: 'Lover',             duration: '2:51', mood: 'hype',    albumArtColor: '#e8b4c0', albumArtPath: 'ts-lover' },
  { id: 's-ts-lover-04', title: 'ME!',                           artistId: 'tswift', artistName: 'Taylor Swift', album: 'Lover',             duration: '3:13', mood: 'happy',   albumArtColor: '#e8b4c0', albumArtPath: 'ts-lover' },
  { id: 's-ts-lover-05', title: 'Paper Rings',                   artistId: 'tswift', artistName: 'Taylor Swift', album: 'Lover',             duration: '3:42', mood: 'hype',    albumArtColor: '#e8b4c0', albumArtPath: 'ts-lover' },
  { id: 's-ts-lover-06', title: 'The Archer',                    artistId: 'tswift', artistName: 'Taylor Swift', album: 'Lover',             duration: '3:31', mood: 'sad',     albumArtColor: '#e8b4c0', albumArtPath: 'ts-lover' },
  { id: 's-ts-lover-07', title: 'Cornelia Street',               artistId: 'tswift', artistName: 'Taylor Swift', album: 'Lover',             duration: '4:44', mood: 'sad',     albumArtColor: '#e8b4c0', albumArtPath: 'ts-lover' },
  { id: 's-ts-lover-08', title: 'Death By a Thousand Cuts',      artistId: 'tswift', artistName: 'Taylor Swift', album: 'Lover',             duration: '4:04', mood: 'sad',     albumArtColor: '#e8b4c0', albumArtPath: 'ts-lover' },
  { id: 's-ts-lover-09', title: 'London Boy',                    artistId: 'tswift', artistName: 'Taylor Swift', album: 'Lover',             duration: '3:10', mood: 'hype',    albumArtColor: '#e8b4c0', albumArtPath: 'ts-lover' },

  // --- folklore (2020) ---
  { id: 's-ts-folk-01', title: 'cardigan',                       artistId: 'tswift', artistName: 'Taylor Swift', album: 'folklore',          duration: '3:59', mood: 'chill',   albumArtColor: '#3a3a3a', audioBadge: 'DOLBY_ATMOS' },
  { id: 's-ts-folk-02', title: 'exile',                          artistId: 'tswift', artistName: 'Taylor Swift', album: 'folklore',          duration: '4:45', mood: 'sad',     albumArtColor: '#3a3a3a' },
  { id: 's-ts-folk-03', title: 'august',                         artistId: 'tswift', artistName: 'Taylor Swift', album: 'folklore',          duration: '4:21', mood: 'sad',     albumArtColor: '#3a3a3a' },
  { id: 's-ts-folk-04', title: 'seven',                          artistId: 'tswift', artistName: 'Taylor Swift', album: 'folklore',          duration: '2:55', mood: 'chill',   albumArtColor: '#3a3a3a' },
  { id: 's-ts-folk-05', title: 'peace',                          artistId: 'tswift', artistName: 'Taylor Swift', album: 'folklore',          duration: '3:54', mood: 'love',    albumArtColor: '#3a3a3a' },
  { id: 's-ts-folk-06', title: 'betty',                          artistId: 'tswift', artistName: 'Taylor Swift', album: 'folklore',          duration: '4:54', mood: 'love',    albumArtColor: '#3a3a3a' },
  { id: 's-ts-folk-07', title: 'the 1',                          artistId: 'tswift', artistName: 'Taylor Swift', album: 'folklore',          duration: '3:31', mood: 'sad',     albumArtColor: '#3a3a3a' },
  { id: 's-ts-folk-08', title: 'illicit affairs',                artistId: 'tswift', artistName: 'Taylor Swift', album: 'folklore',          duration: '3:09', mood: 'sad',     albumArtColor: '#3a3a3a' },
  { id: 's-ts-folk-09', title: 'this is me trying',             artistId: 'tswift', artistName: 'Taylor Swift', album: 'folklore',          duration: '3:13', mood: 'sad',     albumArtColor: '#3a3a3a' },
  { id: 's-ts-folk-10', title: 'epiphany',                       artistId: 'tswift', artistName: 'Taylor Swift', album: 'folklore',          duration: '5:04', mood: 'sad',     albumArtColor: '#3a3a3a' },

  // --- evermore (2020) ---
  { id: 's-ts-ever-01', title: 'willow',                         artistId: 'tswift', artistName: 'Taylor Swift', album: 'evermore',          duration: '3:34', mood: 'love',    albumArtColor: '#6b4a1a', audioBadge: 'DOLBY_ATMOS' },
  { id: 's-ts-ever-02', title: 'champagne problems',             artistId: 'tswift', artistName: 'Taylor Swift', album: 'evermore',          duration: '4:04', mood: 'sad',     albumArtColor: '#6b4a1a' },
  { id: 's-ts-ever-03', title: 'ivy',                            artistId: 'tswift', artistName: 'Taylor Swift', album: 'evermore',          duration: '4:29', mood: 'love',    albumArtColor: '#6b4a1a' },
  { id: 's-ts-ever-04', title: 'tolerate it',                    artistId: 'tswift', artistName: 'Taylor Swift', album: 'evermore',          duration: '4:05', mood: 'sad',     albumArtColor: '#6b4a1a' },
  { id: 's-ts-ever-05', title: 'long story short',               artistId: 'tswift', artistName: 'Taylor Swift', album: 'evermore',          duration: '3:49', mood: 'happy',   albumArtColor: '#6b4a1a' },
  { id: 's-ts-ever-06', title: 'marjorie',                       artistId: 'tswift', artistName: 'Taylor Swift', album: 'evermore',          duration: '4:18', mood: 'sad',     albumArtColor: '#6b4a1a' },
  { id: 's-ts-ever-07', title: 'no body no crime',               artistId: 'tswift', artistName: 'Taylor Swift', album: 'evermore',          duration: '3:36', mood: 'hype',    albumArtColor: '#6b4a1a' },
  { id: 's-ts-ever-08', title: 'cowboy like me',                 artistId: 'tswift', artistName: 'Taylor Swift', album: 'evermore',          duration: '5:17', mood: 'love',    albumArtColor: '#6b4a1a' },
  { id: 's-ts-ever-09', title: "'tis the damn season",           artistId: 'tswift', artistName: 'Taylor Swift', album: 'evermore',          duration: '3:47', mood: 'sad',     albumArtColor: '#6b4a1a' },
  { id: 's-ts-ever-10', title: 'happiness',                      artistId: 'tswift', artistName: 'Taylor Swift', album: 'evermore',          duration: '5:17', mood: 'sad',     albumArtColor: '#6b4a1a' },

  // --- Midnights (2022) ---
  { id: 's-ts-mid-01', title: 'Anti-Hero',                       artistId: 'tswift', artistName: 'Taylor Swift', album: 'Midnights',         duration: '3:20', mood: 'sad',     albumArtColor: '#0a0a2e', audioBadge: 'DOLBY_ATMOS' },
  { id: 's-ts-mid-02', title: 'Lavender Haze',                   artistId: 'tswift', artistName: 'Taylor Swift', album: 'Midnights',         duration: '3:22', mood: 'love',    albumArtColor: '#0a0a2e' },
  { id: 's-ts-mid-03', title: 'Midnight Rain',                   artistId: 'tswift', artistName: 'Taylor Swift', album: 'Midnights',         duration: '2:54', mood: 'sad',     albumArtColor: '#0a0a2e' },
  { id: 's-ts-mid-04', title: 'Snow on the Beach',               artistId: 'tswift', artistName: 'Taylor Swift', album: 'Midnights',         duration: '4:16', mood: 'love',    albumArtColor: '#0a0a2e' },
  { id: 's-ts-mid-05', title: 'Bejeweled',                       artistId: 'tswift', artistName: 'Taylor Swift', album: 'Midnights',         duration: '3:13', mood: 'hype',    albumArtColor: '#0a0a2e' },
  { id: 's-ts-mid-06', title: 'Question...?',                    artistId: 'tswift', artistName: 'Taylor Swift', album: 'Midnights',         duration: '3:06', mood: 'hype',    albumArtColor: '#0a0a2e' },
  { id: 's-ts-mid-07', title: 'Maroon',                          artistId: 'tswift', artistName: 'Taylor Swift', album: 'Midnights',         duration: '3:38', mood: 'sad',     albumArtColor: '#0a0a2e' },
  { id: 's-ts-mid-08', title: 'Karma',                           artistId: 'tswift', artistName: 'Taylor Swift', album: 'Midnights',         duration: '3:25', mood: 'hype',    albumArtColor: '#0a0a2e' },
  { id: 's-ts-mid-09', title: "You're on Your Own, Kid",         artistId: 'tswift', artistName: 'Taylor Swift', album: 'Midnights',         duration: '3:32', mood: 'sad',     albumArtColor: '#0a0a2e' },
  { id: 's-ts-mid-10', title: 'Vigilante Shit',                  artistId: 'tswift', artistName: 'Taylor Swift', album: 'Midnights',         duration: '2:44', mood: 'hype',    albumArtColor: '#0a0a2e' },
  { id: 's-ts-mid-11', title: 'Mastermind',                      artistId: 'tswift', artistName: 'Taylor Swift', album: 'Midnights',         duration: '3:11', mood: 'hype',    albumArtColor: '#0a0a2e' },

  // --- The Tortured Poets Department (additional, 2024) ---
  { id: 's-ts-ttpd-02', title: 'Fortnight',                      artistId: 'tswift', artistName: 'Taylor Swift', album: 'The Tortured Poets Dept.', duration: '3:48', mood: 'sad',  albumArtColor: '#2c2c2c', albumArtPath: 'ts-tortured-poets', audioBadge: 'DOLBY_ATMOS' },
  { id: 's-ts-ttpd-03', title: 'My Boy Only Breaks His Favorite Toys', artistId: 'tswift', artistName: 'Taylor Swift', album: 'The Tortured Poets Dept.', duration: '3:26', mood: 'sad', albumArtColor: '#2c2c2c', albumArtPath: 'ts-tortured-poets' },
  { id: 's-ts-ttpd-04', title: 'Down Bad',                       artistId: 'tswift', artistName: 'Taylor Swift', album: 'The Tortured Poets Dept.', duration: '4:11', mood: 'sad',  albumArtColor: '#2c2c2c', albumArtPath: 'ts-tortured-poets' },
  { id: 's-ts-ttpd-05', title: 'So Long, London',                artistId: 'tswift', artistName: 'Taylor Swift', album: 'The Tortured Poets Dept.', duration: '4:09', mood: 'sad',  albumArtColor: '#2c2c2c', albumArtPath: 'ts-tortured-poets' },
  { id: 's-ts-ttpd-06', title: 'The Smallest Man Who Ever Lived', artistId: 'tswift', artistName: 'Taylor Swift', album: 'The Tortured Poets Dept.', duration: '3:17', mood: 'angry', albumArtColor: '#2c2c2c', albumArtPath: 'ts-tortured-poets' },
  { id: 's-ts-ttpd-07', title: 'loml',                           artistId: 'tswift', artistName: 'Taylor Swift', album: 'The Tortured Poets Dept.', duration: '4:17', mood: 'sad',  albumArtColor: '#2c2c2c', albumArtPath: 'ts-tortured-poets' },
  { id: 's-ts-ttpd-08', title: 'The Alchemy',                    artistId: 'tswift', artistName: 'Taylor Swift', album: 'The Tortured Poets Dept.', duration: '3:18', mood: 'hype', albumArtColor: '#2c2c2c', albumArtPath: 'ts-tortured-poets' },

  // --- The Life of a Showgirl (additional, 2025) ---
  { id: 's-ts-showgirl-01', title: 'The Fate of Ophelia',        artistId: 'tswift', artistName: 'Taylor Swift', album: 'The Life of a Showgirl', duration: '3:37', mood: 'hype',  albumArtColor: '#4a1080', albumArtPath: 'ts-showgirl-life', audioBadge: 'DOLBY_ATMOS' },
  { id: 's-ts-showgirl-02', title: 'Opening Night',              artistId: 'tswift', artistName: 'Taylor Swift', album: 'The Life of a Showgirl', duration: '3:44', mood: 'hype',  albumArtColor: '#4a1080', albumArtPath: 'ts-showgirl-life' },
  { id: 's-ts-showgirl-03', title: 'Curtain Call',               artistId: 'tswift', artistName: 'Taylor Swift', album: 'The Life of a Showgirl', duration: '4:02', mood: 'sad',   albumArtColor: '#4a1080', albumArtPath: 'ts-showgirl-life' },
  { id: 's-ts-showgirl-04', title: 'Standing Ovation',           artistId: 'tswift', artistName: 'Taylor Swift', album: 'The Life of a Showgirl', duration: '3:31', mood: 'hype',  albumArtColor: '#4a1080', albumArtPath: 'ts-showgirl-life', audioBadge: 'DOLBY_ATMOS' },

  // ── Justin Bieber — Full Discography ─────────────────────────────────────────

  // --- My World (EP, 2009) ---
  { id: 's-jb-mw1-01', title: 'One Time',                        artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'My World',          duration: '3:34', mood: 'happy', albumArtColor: '#1a3a5c', albumArtPath: 'justin-bieber-my-worlds' },
  { id: 's-jb-mw1-02', title: 'One Less Lonely Girl',            artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'My World',          duration: '3:45', mood: 'love',  albumArtColor: '#1a3a5c', albumArtPath: 'justin-bieber-my-worlds' },
  { id: 's-jb-mw1-03', title: 'Love Me',                         artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'My World',          duration: '3:41', mood: 'happy', albumArtColor: '#1a3a5c', albumArtPath: 'justin-bieber-my-worlds' },
  { id: 's-jb-mw1-04', title: 'Favorite Girl',                   artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'My World',          duration: '3:38', mood: 'happy', albumArtColor: '#1a3a5c', albumArtPath: 'justin-bieber-my-worlds' },

  // --- My World 2.0 (additional, 2010) ---
  { id: 's-jb-mw2-02', title: 'Somebody to Love',                artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'My World 2.0',      duration: '4:20', mood: 'hype',  albumArtColor: '#1a3a5c', albumArtPath: 'justin-bieber-my-world-2' },
  { id: 's-jb-mw2-03', title: 'U Smile',                         artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'My World 2.0',      duration: '3:38', mood: 'love',  albumArtColor: '#1a3a5c', albumArtPath: 'justin-bieber-my-world-2' },
  { id: 's-jb-mw2-04', title: 'Never Let You Go',                artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'My World 2.0',      duration: '3:39', mood: 'love',  albumArtColor: '#1a3a5c', albumArtPath: 'justin-bieber-my-world-2' },
  { id: 's-jb-mw2-05', title: 'Runaway Love',                    artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'My World 2.0',      duration: '3:47', mood: 'love',  albumArtColor: '#1a3a5c', albumArtPath: 'justin-bieber-my-world-2' },

  // --- Under the Mistletoe (2011) ---
  { id: 's-jb-mistletoe-01', title: 'Mistletoe',                 artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'Under the Mistletoe', duration: '3:26', mood: 'happy', albumArtColor: '#1a4a1a', albumArtPath: 'justin-bieber-my-worlds' },
  { id: 's-jb-mistletoe-02', title: 'All I Want for Christmas Is You', artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'Under the Mistletoe', duration: '3:44', mood: 'happy', albumArtColor: '#1a4a1a', albumArtPath: 'justin-bieber-my-worlds' },
  { id: 's-jb-mistletoe-03', title: 'Santa Claus Is Comin\' to Town', artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'Under the Mistletoe', duration: '3:18', mood: 'happy', albumArtColor: '#1a4a1a', albumArtPath: 'justin-bieber-my-worlds' },

  // --- Believe (additional, 2012) ---
  { id: 's-jb-believe-02', title: 'As Long as You Love Me',      artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'Believe',           duration: '3:30', mood: 'hype',  albumArtColor: '#1a3a5c', albumArtPath: 'justin-bieber-believe', audioBadge: 'DOLBY_ATMOS' },
  { id: 's-jb-believe-03', title: 'Boyfriend',                   artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'Believe',           duration: '3:39', mood: 'hype',  albumArtColor: '#1a3a5c', albumArtPath: 'justin-bieber-believe' },
  { id: 's-jb-believe-04', title: 'Right Here',                  artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'Believe',           duration: '4:41', mood: 'love',  albumArtColor: '#1a3a5c', albumArtPath: 'justin-bieber-believe' },
  { id: 's-jb-believe-05', title: 'Take You',                    artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'Believe',           duration: '3:32', mood: 'happy', albumArtColor: '#1a3a5c', albumArtPath: 'justin-bieber-believe' },
  { id: 's-jb-believe-06', title: 'Fall',                        artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'Believe',           duration: '3:42', mood: 'love',  albumArtColor: '#1a3a5c', albumArtPath: 'justin-bieber-believe' },
  { id: 's-jb-believe-07', title: 'Beauty and a Beat',           artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'Believe',           duration: '3:26', mood: 'hype',  albumArtColor: '#1a3a5c', albumArtPath: 'justin-bieber-believe' },

  // --- Purpose (additional, 2015) ---
  { id: 's-jb-purpose-04', title: 'What Do You Mean?',           artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'Purpose',           duration: '3:26', mood: 'hype',  albumArtColor: '#0d1f3c', albumArtPath: 'justin-bieber-purpose', audioBadge: 'DOLBY_ATMOS' },
  { id: 's-jb-purpose-05', title: 'Company',                     artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'Purpose',           duration: '3:12', mood: 'chill', albumArtColor: '#0d1f3c', albumArtPath: 'justin-bieber-purpose' },
  { id: 's-jb-purpose-06', title: 'Mark My Words',               artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'Purpose',           duration: '3:15', mood: 'love',  albumArtColor: '#0d1f3c', albumArtPath: 'justin-bieber-purpose' },
  { id: 's-jb-purpose-07', title: "I'll Show You",               artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'Purpose',           duration: '3:35', mood: 'hype',  albumArtColor: '#0d1f3c', albumArtPath: 'justin-bieber-purpose' },
  { id: 's-jb-purpose-08', title: 'Where Are Ü Now',             artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'Purpose',           duration: '3:58', mood: 'chill', albumArtColor: '#0d1f3c', albumArtPath: 'justin-bieber-purpose' },
  { id: 's-jb-purpose-09', title: 'Life Is Worth Living',        artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'Purpose',           duration: '4:07', mood: 'happy', albumArtColor: '#0d1f3c', albumArtPath: 'justin-bieber-purpose' },

  // --- Changes (2020) ---
  { id: 's-jb-changes-01', title: 'Yummy',                       artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'Changes',           duration: '3:35', mood: 'love',  albumArtColor: '#3a2010', albumArtPath: 'justin-bieber-changes' },
  { id: 's-jb-changes-02', title: 'Intentions',                  artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'Changes',           duration: '3:25', mood: 'happy', albumArtColor: '#3a2010', albumArtPath: 'justin-bieber-changes', audioBadge: 'DOLBY_ATMOS' },
  { id: 's-jb-changes-03', title: 'Come Around Me',              artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'Changes',           duration: '3:32', mood: 'love',  albumArtColor: '#3a2010', albumArtPath: 'justin-bieber-changes' },
  { id: 's-jb-changes-04', title: 'Available',                   artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'Changes',           duration: '3:41', mood: 'chill', albumArtColor: '#3a2010', albumArtPath: 'justin-bieber-changes' },
  { id: 's-jb-changes-05', title: 'Get Me',                      artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'Changes',           duration: '3:45', mood: 'love',  albumArtColor: '#3a2010', albumArtPath: 'justin-bieber-changes' },
  { id: 's-jb-changes-06', title: 'Forever',                     artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'Changes',           duration: '3:25', mood: 'love',  albumArtColor: '#3a2010', albumArtPath: 'justin-bieber-changes' },

  // --- Justice (2021) ---
  { id: 's-jb-justice-01', title: 'Peaches',                     artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'Justice',           duration: '3:18', mood: 'chill', albumArtColor: '#0a1a2e', audioBadge: 'DOLBY_ATMOS' },
  { id: 's-jb-justice-02', title: 'Anyone',                      artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'Justice',           duration: '3:40', mood: 'love',  albumArtColor: '#0a1a2e' },
  { id: 's-jb-justice-03', title: 'Holy',                        artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'Justice',           duration: '3:29', mood: 'love',  albumArtColor: '#0a1a2e' },
  { id: 's-jb-justice-04', title: 'Lonely',                      artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'Justice',           duration: '2:34', mood: 'sad',   albumArtColor: '#0a1a2e' },
  { id: 's-jb-justice-05', title: 'Ghost',                       artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'Justice',           duration: '2:33', mood: 'sad',   albumArtColor: '#0a1a2e' },
  { id: 's-jb-justice-06', title: 'Off My Face',                 artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'Justice',           duration: '3:56', mood: 'love',  albumArtColor: '#0a1a2e' },
  { id: 's-jb-justice-07', title: 'Die for You',                 artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'Justice',           duration: '3:00', mood: 'love',  albumArtColor: '#0a1a2e' },
  { id: 's-jb-justice-08', title: 'Hold On',                     artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'Justice',           duration: '3:25', mood: 'sad',   albumArtColor: '#0a1a2e' },

  // --- Justin Bieber: SWAG (2025) ---
  { id: 's-jb-swag-01', title: 'DAISIES',                        artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'SWAG',              duration: '2:57', mood: 'love',  albumArtColor: '#6a6a5a', albumArtPath: 'justin-bieber-swag', audioBadge: 'DOLBY_ATMOS' },
  { id: 's-jb-swag-02', title: 'YUKON',                          artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'SWAG',              duration: '2:31', mood: 'chill', albumArtColor: '#6a6a5a', albumArtPath: 'justin-bieber-swag' },
  { id: 's-jb-swag-03', title: 'GO BABY',                        artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'SWAG',              duration: '2:44', mood: 'love',  albumArtColor: '#6a6a5a', albumArtPath: 'justin-bieber-swag' },
  { id: 's-jb-swag-04', title: 'ALL I CAN TAKE',                 artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'SWAG',              duration: '3:02', mood: 'hype',  albumArtColor: '#6a6a5a', albumArtPath: 'justin-bieber-swag' },
  { id: 's-jb-swag-05', title: 'WALKING AWAY',                   artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'SWAG',              duration: '3:29', mood: 'sad',   albumArtColor: '#6a6a5a', albumArtPath: 'justin-bieber-swag' },

  // --- Justin Bieber: SWAG LIVE FROM COACHELLA (Weekend I) (2025) ---
  { id: 's-jb-swaglive-01', title: 'DAISIES (Live)',             artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'SWAG LIVE FROM COACHELLA (Weekend I)', duration: '3:14', mood: 'hype', albumArtColor: '#3a3020', albumArtPath: 'justin-bieber-swag-live' },
  { id: 's-jb-swaglive-02', title: 'GO BABY (Live)',             artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'SWAG LIVE FROM COACHELLA (Weekend I)', duration: '3:01', mood: 'hype', albumArtColor: '#3a3020', albumArtPath: 'justin-bieber-swag-live' },
  { id: 's-jb-swaglive-03', title: 'YUKON (Live)',               artistId: 'justin-bieber', artistName: 'Justin Bieber', album: 'SWAG LIVE FROM COACHELLA (Weekend I)', duration: '2:48', mood: 'chill', albumArtColor: '#3a3020', albumArtPath: 'justin-bieber-swag-live' },

  // --- Bruno Mars: An Evening With Silk Sonic (2021) ---
  { id: 's-bm-silk-01', title: 'Leave the Door Open',            artistId: 'bruno-mars',    artistName: 'Bruno Mars',    album: 'An Evening With Silk Sonic', duration: '4:02', mood: 'love',  albumArtColor: '#7a2010', albumArtPath: 'bruno-mars-silk-sonic', audioBadge: 'DOLBY_ATMOS' },
  { id: 's-bm-silk-02', title: 'Smokin Out the Window',          artistId: 'bruno-mars',    artistName: 'Bruno Mars',    album: 'An Evening With Silk Sonic', duration: '3:17', mood: 'sad',   albumArtColor: '#7a2010', albumArtPath: 'bruno-mars-silk-sonic' },
  { id: 's-bm-silk-03', title: 'Skate',                          artistId: 'bruno-mars',    artistName: 'Bruno Mars',    album: 'An Evening With Silk Sonic', duration: '3:14', mood: 'happy', albumArtColor: '#7a2010', albumArtPath: 'bruno-mars-silk-sonic' },
  { id: 's-bm-silk-04', title: '777',                            artistId: 'bruno-mars',    artistName: 'Bruno Mars',    album: 'An Evening With Silk Sonic', duration: '2:53', mood: 'hype',  albumArtColor: '#7a2010', albumArtPath: 'bruno-mars-silk-sonic' },

  // --- Bruno Mars: The Romantic (2025) ---
  { id: 's-bm-rom-01', title: 'The Romantic',                    artistId: 'bruno-mars',    artistName: 'Bruno Mars',    album: 'The Romantic',      duration: '3:36', mood: 'love',  albumArtColor: '#4a1020', albumArtPath: 'bruno-mars-the-romantic' },
  { id: 's-bm-rom-02', title: 'Slow Dance',                      artistId: 'bruno-mars',    artistName: 'Bruno Mars',    album: 'The Romantic',      duration: '3:52', mood: 'love',  albumArtColor: '#4a1020', albumArtPath: 'bruno-mars-the-romantic' },
  { id: 's-bm-rom-03', title: 'Say You Will',                    artistId: 'bruno-mars',    artistName: 'Bruno Mars',    album: 'The Romantic',      duration: '3:21', mood: 'chill', albumArtColor: '#4a1020', albumArtPath: 'bruno-mars-the-romantic' },

  // --- JENNIE: Ruby (2025) ---
  { id: 's-jennie-ruby-01', title: 'like JENNIE',                artistId: 'jennie',        artistName: 'JENNIE',        album: 'Ruby',              duration: '2:26', mood: 'hype',  albumArtColor: '#7a1030', albumArtPath: 'jennie-ruby', audioBadge: 'DOLBY_ATMOS' },
  { id: 's-jennie-ruby-02', title: 'Mantra',                     artistId: 'jennie',        artistName: 'JENNIE',        album: 'Ruby',              duration: '2:41', mood: 'hype',  albumArtColor: '#7a1030', albumArtPath: 'jennie-ruby' },
  { id: 's-jennie-ruby-03', title: 'ExtraL',                     artistId: 'jennie',        artistName: 'JENNIE',        album: 'Ruby',              duration: '2:58', mood: 'hype',  albumArtColor: '#7a1030', albumArtPath: 'jennie-ruby' },
  { id: 's-jennie-ruby-04', title: 'Handlebars',                 artistId: 'jennie',        artistName: 'JENNIE',        album: 'Ruby',              duration: '2:33', mood: 'chill', albumArtColor: '#7a1030', albumArtPath: 'jennie-ruby' },
  { id: 's-jennie-ruby-05', title: 'Seoul City',                 artistId: 'jennie',        artistName: 'JENNIE',        album: 'Ruby',              duration: '2:47', mood: 'happy', albumArtColor: '#7a1030', albumArtPath: 'jennie-ruby' },

  // --- JENNIE: Dracula (JENNIE Remix) — Tame Impala & JENNIE (single, 2025) ---
  { id: 's-jennie-dracula', title: 'Dracula (JENNIE Remix)',     artistId: 'jennie',        artistName: 'Tame Impala & JENNIE', album: 'Dracula (JENNIE Remix)', duration: '3:44', mood: 'chill', albumArtColor: '#2a1030', albumArtPath: 'jennie-dracula-remix' },

  // --- Zara Larsson: Midnight Sun (single, 2025) ---
  { id: 's-zara-midnight-sun', title: 'Midnight Sun',            artistId: 'zara-larsson',  artistName: 'Zara Larsson',  album: 'Midnight Sun',      duration: '3:03', mood: 'happy', albumArtColor: '#8a4a10', albumArtPath: 'zara-larsson-midnight-sun' },

  // --- Ariana Grande: My Everything (2014) ---
  { id: 's-ariana-me-01', title: 'Problem',                      artistId: 'ariana-grande', artistName: 'Ariana Grande', album: 'My Everything',     duration: '3:14', mood: 'hype',  albumArtColor: '#4a4a5a', albumArtPath: 'ariana-my-everything', audioBadge: 'DOLBY_ATMOS' },
  { id: 's-ariana-me-02', title: 'Break Free',                   artistId: 'ariana-grande', artistName: 'Ariana Grande', album: 'My Everything',     duration: '3:34', mood: 'hype',  albumArtColor: '#4a4a5a', albumArtPath: 'ariana-my-everything' },
  { id: 's-ariana-me-03', title: 'Love Me Harder',               artistId: 'ariana-grande', artistName: 'Ariana Grande', album: 'My Everything',     duration: '3:56', mood: 'love',  albumArtColor: '#4a4a5a', albumArtPath: 'ariana-my-everything' },
  { id: 's-ariana-me-04', title: 'One Last Time',                artistId: 'ariana-grande', artistName: 'Ariana Grande', album: 'My Everything',     duration: '3:17', mood: 'sad',   albumArtColor: '#4a4a5a', albumArtPath: 'ariana-my-everything' },

  // --- Ariana Grande: eternal sunshine (slightly deluxe) (2024) ---
  { id: 's-ariana-es-01', title: 'we can’t be friends (wait for your love)', artistId: 'ariana-grande', artistName: 'Ariana Grande', album: 'eternal sunshine', duration: '3:48', mood: 'sad', albumArtColor: '#5a6a7a', albumArtPath: 'ariana-eternal-sunshine', audioBadge: 'DOLBY_ATMOS' },
  { id: 's-ariana-es-02', title: 'yes, and?',                    artistId: 'ariana-grande', artistName: 'Ariana Grande', album: 'eternal sunshine',  duration: '3:34', mood: 'hype',  albumArtColor: '#5a6a7a', albumArtPath: 'ariana-eternal-sunshine' },
  { id: 's-ariana-es-03', title: 'the boy is mine',              artistId: 'ariana-grande', artistName: 'Ariana Grande', album: 'eternal sunshine',  duration: '3:01', mood: 'love',  albumArtColor: '#5a6a7a', albumArtPath: 'ariana-eternal-sunshine' },
  { id: 's-ariana-es-04', title: 'supernatural',                 artistId: 'ariana-grande', artistName: 'Ariana Grande', album: 'eternal sunshine',  duration: '2:59', mood: 'love',  albumArtColor: '#5a6a7a', albumArtPath: 'ariana-eternal-sunshine' },
  { id: 's-ariana-es-05', title: 'bye',                          artistId: 'ariana-grande', artistName: 'Ariana Grande', album: 'eternal sunshine',  duration: '3:07', mood: 'happy', albumArtColor: '#5a6a7a', albumArtPath: 'ariana-eternal-sunshine' },

  // --- sombr: in another life (2025) ---
  { id: 's-sombr-ial-01', title: 'back to friends',              artistId: 'sombr',         artistName: 'Sombr',         album: 'in another life',   duration: '3:19', mood: 'sad',   albumArtColor: '#2a2030', albumArtPath: 'sombr-in-another-life', audioBadge: 'DOLBY_ATMOS' },
  { id: 's-sombr-ial-02', title: 'undressed',                    artistId: 'sombr',         artistName: 'Sombr',         album: 'in another life',   duration: '3:02', mood: 'love',  albumArtColor: '#2a2030', albumArtPath: 'sombr-in-another-life' },
  { id: 's-sombr-ial-03', title: '12 to 12',                     artistId: 'sombr',         artistName: 'Sombr',         album: 'in another life',   duration: '3:26', mood: 'chill', albumArtColor: '#2a2030', albumArtPath: 'sombr-in-another-life' },
  { id: 's-sombr-ial-04', title: 'in another life',              artistId: 'sombr',         artistName: 'Sombr',         album: 'in another life',   duration: '3:51', mood: 'sad',   albumArtColor: '#2a2030', albumArtPath: 'sombr-in-another-life' },

  // --- Sabrina Carpenter: emails i can't send (2022) ---
  { id: 's-sabrina-eics-01', title: 'Nonsense',                  artistId: 'sabrina-carpenter', artistName: 'Sabrina Carpenter', album: "emails i can't send", duration: '2:43', mood: 'happy', albumArtColor: '#6a4a5a', albumArtPath: 'sabrina-emails-i-cant-send', audioBadge: 'DOLBY_ATMOS' },
  { id: 's-sabrina-eics-02', title: 'because i liked a boy',     artistId: 'sabrina-carpenter', artistName: 'Sabrina Carpenter', album: "emails i can't send", duration: '2:52', mood: 'sad',   albumArtColor: '#6a4a5a', albumArtPath: 'sabrina-emails-i-cant-send' },
  { id: 's-sabrina-eics-03', title: 'Feather',                   artistId: 'sabrina-carpenter', artistName: 'Sabrina Carpenter', album: "emails i can't send", duration: '3:06', mood: 'happy', albumArtColor: '#6a4a5a', albumArtPath: 'sabrina-emails-i-cant-send' },
  { id: 's-sabrina-eics-04', title: "emails i can't send",       artistId: 'sabrina-carpenter', artistName: 'Sabrina Carpenter', album: "emails i can't send", duration: '3:22', mood: 'sad',   albumArtColor: '#6a4a5a', albumArtPath: 'sabrina-emails-i-cant-send' },
  { id: 's-sabrina-eics-05', title: 'Vicious',                   artistId: 'sabrina-carpenter', artistName: 'Sabrina Carpenter', album: "emails i can't send", duration: '2:58', mood: 'angry', albumArtColor: '#6a4a5a', albumArtPath: 'sabrina-emails-i-cant-send' },

  // --- Olivia Rodrigo: GUTS (spilled) — the deluxe reissue's bonus tracks ---
  { id: 's-or-spilled-01', title: 'obsessed',                    artistId: 'olivia-rodrigo', artistName: 'Olivia Rodrigo', album: 'GUTS (spilled)',   duration: '2:47', mood: 'angry', albumArtColor: '#5a2a7a', albumArtPath: 'olivia-rodrigo-guts-spilled', audioBadge: 'DOLBY_ATMOS' },
  { id: 's-or-spilled-02', title: 'girl i’ve always been',       artistId: 'olivia-rodrigo', artistName: 'Olivia Rodrigo', album: 'GUTS (spilled)',   duration: '2:34', mood: 'happy', albumArtColor: '#5a2a7a', albumArtPath: 'olivia-rodrigo-guts-spilled' },
  { id: 's-or-spilled-03', title: 'scared of my guitar',         artistId: 'olivia-rodrigo', artistName: 'Olivia Rodrigo', album: 'GUTS (spilled)',   duration: '3:22', mood: 'sad',   albumArtColor: '#5a2a7a', albumArtPath: 'olivia-rodrigo-guts-spilled' },
  { id: 's-or-spilled-04', title: 'stranger',                    artistId: 'olivia-rodrigo', artistName: 'Olivia Rodrigo', album: 'GUTS (spilled)',   duration: '3:05', mood: 'sad',   albumArtColor: '#5a2a7a', albumArtPath: 'olivia-rodrigo-guts-spilled' },
  { id: 's-or-spilled-05', title: 'so american',                 artistId: 'olivia-rodrigo', artistName: 'Olivia Rodrigo', album: 'GUTS (spilled)',   duration: '2:29', mood: 'love',  albumArtColor: '#5a2a7a', albumArtPath: 'olivia-rodrigo-guts-spilled' },
]

// PLAYLISTS
export const playlists: Playlist[] = [
  {
    id: 'pl1',
    name: 'Late Night Drive',
    songCount: 16,
    totalDuration: '1h 1m',
    coverArtPath: 'lorde-melodrama',
    curatorType: 'user',
    curatorName: 'Rabiat',
    songIds: ['s-weeknd1', 's-lana1', 's-sza3', 's-rihanna3', 's-fka3', 's-lorde2', 's-lana2', 's-billie-e1', 's-weeknd2', 's-asap3', 's-lana4', 's-noah3', 's8', 's-jayz4', 's-pf2', 's-fka4'],
  },
  {
    id: 'pl2',
    name: 'ARMY Essentials',
    songCount: 18,
    totalDuration: '58m',
    coverArtPath: 'bts-proof-door',
    curatorType: 'amazon',
    songIds: ['s1', 's2', 's3', 's4', 's5', 's13', 's14', 's15', 's-bts-come', 's-bts-door', 's-bts-journey1', 's-bts-arirang2', 's-jk1', 's-jk2', 's-v1', 's-jhope1', 's-rm1', 's-jhope2'],
  },
  {
    id: 'pl3',
    name: 'Olivia After Midnight',
    songCount: 16,
    totalDuration: '1h 4m',
    coverArtPath: 'olivia-rodrigo-sour',
    curatorType: 'user',
    curatorName: 'Celine',
    songIds: ['s-or6', 's-or1', 's-olivia-dean1', 's-olivia-dean2', 's17', 's-tate4', 's-sombr1', 's-noah1', 's-lana3', 's-sza4', 's-gaga5', 's-ariana4', 's-carole3', 's-elton3', 's-whitney3', 's-mjb4'],
  },
  {
    id: 'pl4',
    name: 'Indie Feels',
    songCount: 15,
    totalDuration: '48m',
    coverArtPath: 'mitski-be-the-cowboy',
    curatorType: 'user',
    curatorName: 'Brooke',
    songIds: ['s9', 's12', 's19', 's20', 's21', 's6', 's7', 's8', 's-jpbreak1', 's-sombr1', 's-noah1', 's-noah2', 's-noah3', 's-lorde2', 's-olivia-dean1'],
  },
  {
    id: 'pl5',
    name: 'Main Character Energy',
    songCount: 20,
    totalDuration: '1h 12m',
    coverArtPath: 'olivia-rodrigo-guts',
    curatorType: 'amazon',
    songIds: ['s10', 's11', 's16', 's-ts1989', 's-gaga1', 's-charli1', 's-dua1', 's-sabrina1', 's-doja1', 's-tate1', 's-katy2', 's-lizzo1', 's-beyonce5', 's-ariana1', 's-nicki2', 's-rihanna2', 's-bp1', 's-or5', 's-jennie1', 's-lisa1'],
  },
  {
    id: 'pl6',
    name: 'Hype Session',
    songCount: 12,
    totalDuration: '42m',
    coverArtPath: 'bts-proof',
    curatorType: 'user',
    curatorName: 'Dave',
    songIds: ['s-drake1', 's-jcole4', 's-jayz2', 's-jayz3', 's-cardi1', 's-nicki1', 's-missy1', 's-outkast1', 's-outkast3', 's-asap1', 's-asap2', 's-tyler2'],
  },
  {
    id: 'pl7',
    name: 'World Discoveries',
    songCount: 14,
    totalDuration: '52m',
    coverArtPath: 'bana-zahiti',
    curatorType: 'amazon',
    songIds: ['s-bz1', 's-fela1', 's-hosono1', 's-rosalia1', 's-gloria1', 's-bb4', 's-emmylou1', 's-loretta1', 's-kate1', 's-roxy1', 's-jpbreak1', 's15', 's-carole1', 's-pistol1'],
  },
  {
    id: 'pl8',
    name: '1989 Essentials',
    songCount: 7,
    totalDuration: '27m',
    coverArtPath: 'ts-1989',
    curatorType: 'artist',
    curatorName: 'Taylor Swift',
    songIds: ['s-ts1989', 's18', 's11', 's10', 's16', 's17', 's-ts-showgirl'],
  },
  {
    id: 'pl9',
    name: 'BTS Come Over',
    songCount: 10,
    totalDuration: '38m',
    coverArtPath: 'bts-come-over',
    curatorType: 'artist',
    curatorName: 'BTS',
    songIds: ['s-bts-come', 's14', 's4', 's13', 's5', 's-v1', 's-rm1', 's-jk1', 's-bts-journey1', 's15'],
  },
  {
    id: 'pl-love-island',
    name: 'Love Island Official',
    description: 'The Official Amazon Music Love Island playlist, Is He Really Who He Says He Is?',
    songCount: 22,
    totalDuration: '1h 18m',
    coverArtPath: 'love-island-cast',
    curatorType: 'amazon',
    songIds: ['s-dua1', 's-zara1', 's-doja1', 's-rihanna2', 's-sabrina1', 's-sabrina2', 's-beyonce1', 's-beyonce3', 's-charli1', 's-ariana2', 's-katy4', 's-lizzo3', 's-tate1', 's-jennie2', 's-zara2', 's-rihanna1', 's-doja2', 's-bp1', 's-bb4', 's-fka4', 's-whitney2', 's-madonna2'],
  },
  {
    id: 'pl-love-island-cast',
    name: 'Meet the Islanders',
    description: 'Cast-curated tracks from this season, coupling up with the perfect song',
    songCount: 18,
    totalDuration: '1h 05m',
    coverArtPath: 'love-island-cast',
    curatorType: 'user',
    curatorName: 'Erica',
    songIds: ['s-zara1', 's-dua1', 's-doja4', 's-tate2', 's-sabrina2', 's-rihanna4', 's-beyonce4', 's-katy3', 's-jennie2', 's-ariana2', 's-madonna4', 's-whitney3', 's-zara2', 's-fka1', 's-tyler1', 's-harry1', 's-v1', 's-olivia-dean2'],
  },
  {
    id: 'pl-borahae-hours',
    name: 'Borahae Hours',
    description: 'Your daily BTS & K-pop essentials, 보라해 (I purple you)',
    songCount: 20,
    totalDuration: '1h 10m',
    coverArtPath: 'bts-proof-door',
    curatorType: 'amazon',
    songIds: ['s1', 's2', 's3', 's4', 's5', 's13', 's14', 's15', 's-bts-come', 's-bts-door', 's-bts-journey1', 's-rm1', 's-jk1', 's-jk2', 's-v1', 's-v2', 's-jhope1', 's-jhope2', 's-bts-arirang2', 's-bp1'],
  },
  {
    id: 'pl-kpop-1stgen',
    name: '1st Gen K-pop Essentials',
    description: 'Where it all began, H.O.T., BoA, SHINHWA and the pioneers who built the wave',
    songCount: 8,
    totalDuration: '29m',
    coverArtPath: 'bts-proof-door',
    curatorType: 'amazon',
    songIds: ['s-exo1', 's-exo2', 's-twice1', 's-twice2', 's1', 's3', 's4', 's5'],
  },
  {
    id: 'pl-kpop-2ndgen',
    name: '2nd Gen Legends',
    description: 'The global explosion, SHINee, 2NE1, BIGBANG, Girls\' Generation',
    songCount: 10,
    totalDuration: '35m',
    coverArtPath: 'blackpink',
    curatorType: 'amazon',
    songIds: ['s-bp1', 's-bp2', 's-jennie1', 's-jennie2', 's-lisa1', 's-lisa2', 's-rose1', 's-rose2', 's2', 's13'],
  },
  {
    id: 'pl-kpop-3rdgen',
    name: '3rd Gen Royalty',
    description: 'BTS, TWICE, EXO, BLACKPINK, the generation that took over the world',
    songCount: 14,
    totalDuration: '50m',
    coverArtPath: 'bts-proof',
    curatorType: 'amazon',
    songIds: ['s1', 's2', 's3', 's5', 's-jk1', 's-jk2', 's-v1', 's-jhope2', 's-rm1', 's-bp1', 's-twice1', 's-exo1', 's14', 's-bts-door'],
  },
  {
    id: 'pl-kpop-4thgen',
    name: '4th Gen Rising',
    description: 'Stray Kids, ATEEZ, NewJeans, SEVENTEEN, the new wave is here',
    songCount: 10,
    totalDuration: '36m',
    coverArtPath: 'newjeans',
    curatorType: 'amazon',
    songIds: ['s-skz1', 's-skz2', 's-nj1', 's-nj2', 's-svt1', 's-svt2', 's-jk2', 's-rose2', 's-lisa1', 's-jennie2'],
  },
  {
    id: 'pl-summer-turned-pretty',
    name: 'The Summer I Turned Pretty, Official Playlist',
    description: 'Songs from and inspired by the series, Belly\'s summer, scored',
    songCount: 14,
    totalDuration: '52m',
    coverArtPath: 'summer-i-turned-pretty',
    curatorType: 'amazon',
    songIds: ['s11', 's18', 's-ts1989', 's-tate3', 's-olivia-dean2', 's-harry1', 's-billie-e1', 's-lana2', 's-zara2', 's-sabrina2', 's-noah3', 's17', 's-ariana4', 's-katy3'],
  },
  {
    id: 'pl-heated-rivalry',
    name: 'Rivals & Heartbreakers',
    description: 'Music from Heated Rivalry, tension, petty anthems, and everything in between',
    songCount: 12,
    totalDuration: '42m',
    coverArtPath: 'olivia-rodrigo-sour',
    curatorType: 'amazon',
    songIds: ['s-weeknd4', 's-fka1', 's-sza1', 's-beyonce6', 's-rihanna3', 's-tate2', 's-or11', 's-gaga4', 's-doja3', 's-tyler3', 's-asap4', 's-jennie1'],
  },
  {
    id: 'pl-livies',
    name: 'For the Livies',
    description: 'The essential Olivia Rodrigo playlist, every era, every emotion',
    songCount: 12,
    totalDuration: '46m',
    coverArtPath: 'olivia-rodrigo-guts',
    curatorType: 'amazon',
    songIds: ['s-or4', 's-or2', 's-or1', 's-or10', 's-or11', 's-or5', 's-or3', 's-or8', 's-or9', 's-or6', 's-or7', 's-or-new1'],
  },
  {
    id: 'pl10',
    name: "Taylor's Version: The Eras",
    description: 'Every era, one playlist, from Tim McGraw to The Life of a Showgirl',
    songCount: 16,
    totalDuration: '1h 3m',
    coverArtPath: 'ts-lover',
    curatorType: 'artist',
    curatorName: 'Taylor Swift',
    songIds: ['s-ts-debut-01', 's-ts-fearless-01', 's-ts-fearless-02', 's-ts-speaknow-04', 's-ts-red-03', 's-ts-red-04', 's-ts1989', 's-ts1989-02', 's-ts1989-03', 's-ts-rep-03', 's-ts-lover-02', 's-ts-folk-01', 's-ts-ever-01', 's-ts-mid-01', 's-ts-ttpd-02', 's-ts-showgirl'],
  },
  {
    id: 'pl11',
    name: 'cardigan & candlelight',
    description: 'folklore and evermore, back to back, cottagecore heartbreak',
    songCount: 16,
    totalDuration: '1h 5m',
    coverArtPath: 'ts-reputation',
    curatorType: 'user',
    curatorName: 'Josie',
    songIds: ['s-ts-folk-01', 's-ts-folk-02', 's-ts-folk-03', 's-ts-folk-04', 's-ts-folk-05', 's-ts-folk-06', 's-ts-folk-07', 's-ts-folk-08', 's-ts-folk-09', 's-ts-folk-10', 's-ts-ever-01', 's-ts-ever-02', 's-ts-ever-03', 's-ts-ever-04', 's-ts-ever-07', 's-ts-ever-08'],
  },
  {
    id: 'pl12',
    name: 'Bieber Fever Forever',
    description: 'From My World to Justice, the Biebs, start to now',
    songCount: 16,
    totalDuration: '57m',
    coverArtPath: 'justin-bieber-believe',
    curatorType: 'artist',
    curatorName: 'Justin Bieber',
    songIds: ['s-jb1', 's-jb3', 's-jb-mw1-01', 's-jb-mw1-03', 's-jb-mw2-02', 's-jb-mistletoe-02', 's-jb-believe-02', 's-jb-believe-03', 's-jb-believe-07', 's-jb-purpose-04', 's-jb-purpose-08', 's-jb-changes-01', 's-jb-changes-02', 's-jb-justice-01', 's-jb-justice-03', 's-jb-justice-07'],
  },
  {
    id: 'pl13',
    name: 'Heartbreak Hotel',
    description: 'For the nights you replay every text',
    songCount: 16,
    totalDuration: '1h 1m',
    coverArtPath: 'billie-holiday-satin',
    curatorType: 'user',
    curatorName: 'Maya',
    songIds: ['s-billie1', 's-billie2', 's-billie3', 's-mjb1', 's-mjb2', 's-mjb3', 's-elton1', 's-elton3', 's-carole2', 's-tate4', 's-tate5', 's-noah2', 's-jcole3', 's-cardi3', 's-weeknd2', 's-fka2'],
  },
  {
    id: 'pl14',
    name: 'Old School Icons',
    description: 'The Beatles, Fleetwood Mac, Whitney, Madonna, and the legends who started it all',
    songCount: 16,
    totalDuration: '1h 6m',
    coverArtPath: 'fleetwood-rumours',
    curatorType: 'amazon',
    songIds: ['s-beatles1', 's-beatles3', 's-beatles4', 's-fleet1', 's-fleet2', 's-fleet4', 's-whitney1', 's-whitney4', 's-madonna1', 's-madonna3', 's-elton2', 's-elton4', 's-carole1', 's-carole4', 's-prince1', 's-roberta1'],
  },
  {
    id: 'pl15',
    name: 'Rap Royalty',
    description: 'Jay-Z, J. Cole, Outkast, Cardi B, and the voices that run the game',
    songCount: 16,
    totalDuration: '1h 4m',
    coverArtPath: 'jayz-black-album',
    curatorType: 'amazon',
    songIds: ['s-jayz1', 's-jayz4', 's-jcole1', 's-jcole2', 's-outkast2', 's-outkast4', 's-cardi2', 's-cardi4', 's-chance1', 's-chance4', 's-missy1', 's-lilkim1', 's-nicki3', 's-nicki4', 's-drake2', 's-asap2'],
  },

  // ── Superfan-theme "Essentials" / "Best of" home rail cards ──────────────
  // Real curated playlists behind AdaptivePersonaHome's fandom-tailored
  // "{fandom} Essentials" / "Best of {fandom}" cards, so tapping one always
  // lands on an actual playlist instead of falling through to Explore Music.
  {
    id: 'pl-olivia-essentials',
    name: 'Olivia Rodrigo Essentials',
    songCount: 10,
    totalDuration: '34m',
    coverArtPath: 'olivia-rodrigo-sour',
    curatorType: 'amazon',
    songIds: ['s-or1', 's-or2', 's-or3', 's-or4', 's-or5', 's-or-sour-01', 's-or-sour-05', 's-or-guts-03', 's-or-guts-06', 's-or11'],
  },
  {
    id: 'pl-taylor-essentials',
    name: 'Taylor Swift Essentials',
    songCount: 10,
    totalDuration: '36m',
    coverArtPath: 'ts-1989',
    curatorType: 'amazon',
    songIds: ['s-ts1989-02', 's-ts-fearless-02', 's11', 's-ts-mid-01', 's10', 's-ts1989', 's-ts-lover-02', 's-ts-fearless-01', 's-ts-folk-01', 's-ts-red-04'],
  },
  {
    id: 'pl-taylor-bestof',
    name: 'Best of Taylor Swift',
    songCount: 10,
    totalDuration: '38m',
    coverArtPath: 'ts-tortured-poets',
    curatorType: 'amazon',
    songIds: ['s-ts-red-03', 's-ts-ever-02', 's-ts-folk-03', 's-ts-folk-06', 's-ts-ever-03', 's-ts-folk-02', 's-ts-speaknow-04', 's-ts-speaknow-06', 's-ts-ever-06', 's-ts-mid-10'],
  },
  {
    id: 'pl-bts-bestof',
    name: 'Best of BTS',
    songCount: 10,
    totalDuration: '35m',
    coverArtPath: 'bts-young-forever',
    curatorType: 'amazon',
    songIds: ['s4', 's5', 's1', 's13', 's15', 's-bts-journey1', 's-bts-arirang2', 's14', 's3', 's-bts-come'],
  },

  // ── Hannah Journey superfan — "Playlists Similar to this Era" (You & Olivia) ──
  // Backs the era-scoped playlist rail in HannahJourneyYouAndOlivia.tsx's
  // ERA_PLAYLISTS map, so every card there taps through to a real, populated
  // /playlist/[id] page instead of doing nothing.
  {
    id: 'pl-hj-girl-in-love',
    name: 'A girl in love',
    songCount: 7,
    totalDuration: '25m',
    coverArtPath: 'olivia-rodrigo-girl-in-love',
    curatorType: 'amazon',
    songIds: ['s-or8', 's-or6', 's-or-sour-06', 's-or-sour-07', 's-or9', 's-or-guts-06', 's-or7'],
  },
  {
    id: 'pl-hj-pretty-sad',
    name: 'you seem pretty sad',
    songCount: 6,
    totalDuration: '20m',
    coverArtPath: 'olivia-rodrigo-pretty-sad',
    curatorType: 'amazon',
    songIds: ['s-or8', 's-or-new1', 's-or-guts-04', 's-or-sour-05', 's-or3', 's-or-guts-01'],
  },
  {
    id: 'pl-hj-pop-girl-hits',
    name: 'Pop girl hits',
    songCount: 6,
    totalDuration: '19m',
    coverArtPath: 'olivia-rodrigo-girl-in-love',
    curatorType: 'amazon',
    songIds: ['s-or2', 's-or10', 's-or-guts-03', 's-or5', 's-or-sour-01', 's-or-guts-02'],
  },
  {
    id: 'pl-hj-spring-tunes',
    name: 'Spring tunes',
    songCount: 5,
    totalDuration: '17m',
    coverArtPath: 'olivia-rodrigo-pretty-sad',
    curatorType: 'amazon',
    songIds: ['s-or-sour-06', 's-or6', 's-or-guts-05', 's-or11', 's-or-sour-07'],
  },
  {
    id: 'pl-hj-accidentally-in-love',
    name: 'Accidentally in love',
    songCount: 5,
    totalDuration: '17m',
    coverArtPath: 'olivia-rodrigo-deja-vu-mirror',
    curatorType: 'amazon',
    songIds: ['s-or3', 's-or7', 's-or-guts-06', 's-or8', 's-or-sour-04'],
  },
  {
    id: 'pl-hj-obsessed',
    name: 'Obsessed',
    songCount: 5,
    totalDuration: '16m',
    coverArtPath: 'olivia-rodrigo-guts',
    curatorType: 'amazon',
    songIds: ['s-or10', 's-or5', 's-or9', 's-or-guts-01', 's-or2'],
  },
  {
    id: 'pl-hj-on-dnd',
    name: 'On dnd',
    songCount: 5,
    totalDuration: '17m',
    coverArtPath: 'olivia-rodrigo-sour',
    curatorType: 'amazon',
    songIds: ['s-or1', 's-or3', 's-or-sour-02', 's-or-sour-05', 's-or-guts-04'],
  },
  {
    id: 'pl-hj-love-your-guts',
    name: 'I love your guts',
    songCount: 6,
    totalDuration: '20m',
    coverArtPath: 'olivia-rodrigo-guts-sticker',
    curatorType: 'amazon',
    songIds: ['s-or4', 's-or-guts-02', 's-or-guts-03', 's-or-guts-05', 's-or-guts-06', 's-or11'],
  },
  {
    id: 'pl-hj-summer-time',
    name: 'summer time',
    songCount: 5,
    totalDuration: '17m',
    coverArtPath: 'olivia-rodrigo-sour',
    curatorType: 'amazon',
    songIds: ['s-or2', 's-or-guts-03', 's-or9', 's-or7', 's-or-sour-07'],
  },
  {
    id: 'pl-hj-feel-good',
    name: 'feel good playlist',
    songCount: 4,
    totalDuration: '14m',
    coverArtPath: 'olivia-rodrigo-girl-in-love',
    curatorType: 'amazon',
    songIds: ['s-or10', 's-or5', 's-or-guts-05', 's-or8'],
  },

  // Amazon Music curated editorial playlists
  {
    id: 'pl-rediscover-2000s',
    name: 'REDISCOVER: The 2000s',
    songCount: 12,
    totalDuration: '46m',
    coverArtPath: 'rediscover-2000s-cover',
    curatorType: 'amazon',
    songIds: ['s-outkast1', 's-outkast2', 's-outkast3', 's-outkast4', 's-jayz1', 's-jayz2', 's-jayz3', 's-jayz4', 's-mjb1', 's-mjb2', 's-missy1', 's-lilkim1'],
  },
  {
    id: 'pl-viral-hits',
    name: 'Viral Hits',
    songCount: 10,
    totalDuration: '34m',
    coverArtPath: 'viral-hits-cover',
    curatorType: 'amazon',
    songIds: ['s-sombr1', 's-charli1', 's-doja1', 's-sabrina1', 's-sabrina2', 's-tate1', 's-rose2', 's-zara1', 's-bp1', 's-or-guts-01'],
  },
]

// FAN GROUPS
export const fanGroups: FanGroup[] = [
  { id: 'fg1', name: 'BTS ARMY', artistId: 'bts', coverArtPath: 'bts-alt', memberCount: 12400 },
  { id: 'fg2', name: 'Swifties', artistId: 'tswift', memberCount: 8900 },
  { id: 'fg3', name: 'BLINK', artistId: 'blackpink', memberCount: 6200 },
  { id: 'fg4', name: 'Lorde fans', artistId: 'lorde', memberCount: 2100 },
  { id: 'fg5', name: 'Dukat Listeners', artistId: 'bana-zahiti', coverArtPath: 'bana-zahiti', memberCount: 840 },
  // Hannah Journey fan-group cards (additive) — give "Olivia rodrigo fans!!!",
  // "Swiftyyyyysss", and "arianators" real, populated /fan-group/[id] pages
  // instead of doing nothing on tap. 'olivia-rodrigo' is safe as an artistId
  // here because OliviaRodrigoArtistScreen is a bespoke screen that doesn't
  // call findFanGroupForArtist. 'arianators' deliberately omits artistId so
  // it can't be picked up by findFanGroupForArtist('ariana-grande') and alter
  // Ariana's generic About tab (ArtistJourneyScreen) for every other persona —
  // it still resolves cover art via coverArtPath. 'tswift' is safe to reuse
  // as an artistId since fg2 (above) is still the first array match.
  { id: 'fg-hj-olivia', name: 'Olivia rodrigo fans!!!', artistId: 'olivia-rodrigo', memberCount: 213 },
  { id: 'fg-hj-swifties', name: 'Swiftyyyyysss', artistId: 'tswift', memberCount: 550 },
  { id: 'fg-hj-arianators', name: 'arianators', coverArtPath: 'ariana-grande', memberCount: 213 },
]

// PODCASTS
export const podcasts: Podcast[] = [
  {
    id: 'pod1',
    title: 'The ARMY Diaries',
    host: 'K-Pop Weekly',
    description: 'Deep dives into BTS music, history, and fan culture',
    episodeCount: 142,
    coverColor: '#1a1a3e',
    coverArtPath: 'bts-proof-door',
    category: 'Music',
  },
  {
    id: 'pod2',
    title: 'Sad Girl Hours',
    host: 'Studio Night Owl',
    description: 'Late night indie music conversations and artist interviews',
    episodeCount: 88,
    coverColor: '#2d1b4e',
    coverArtPath: 'lorde-melodrama',
    category: 'Music',
  },
  {
    id: 'pod3',
    title: 'Chart Watch',
    host: 'Amazon Music Editorial',
    description: 'Weekly breakdown of charts, new releases, and trending artists',
    episodeCount: 210,
    coverColor: '#0a2a1a',
    coverArtPath: 'bana-zahiti',
    category: 'Charts',
  },
  {
    id: 'pod4',
    title: 'Folklore & Tales',
    host: 'Swifties Network',
    description: 'Taylor Swift era-by-era analysis and fan theories',
    episodeCount: 64,
    coverColor: '#3a2a1a',
    coverArtPath: 'ts-showgirl',
    category: 'Music',
  },
  {
    id: 'pod5',
    title: 'Dolby Sessions',
    host: 'Amazon Music Studios',
    description: 'Intimate spatial-audio performances and artist conversations',
    episodeCount: 37,
    coverColor: '#0e2233',
    coverArtPath: 'late-night-city',
    category: 'Music',
  },
  {
    id: 'pod-tc1',
    title: 'Cold Case Radio',
    host: 'Marisa Vance',
    description: 'Unsolved cases reopened with fresh eyes and new evidence',
    episodeCount: 124,
    coverColor: '#1a0f14',
    coverArtPath: 'heartbreak-mood',
    category: 'True Crime',
  },
  {
    id: 'pod-tc2',
    title: 'The Alibi Files',
    host: 'True Story Media',
    description: 'Every episode, one airtight alibi falls apart',
    episodeCount: 58,
    coverColor: '#141019',
    category: 'True Crime',
  },
  {
    id: 'pod-c1',
    title: 'Two Mics In',
    host: 'Jade & Marcus',
    description: 'Comedians riff on the week, unscripted and unhinged',
    episodeCount: 210,
    coverColor: '#3a2a10',
    coverArtPath: 'morning-energy',
    category: 'Comedy',
  },
  {
    id: 'pod-c2',
    title: 'Laugh Track',
    host: 'AM Originals',
    description: 'Stand-up clips and the stories behind the sets',
    episodeCount: 88,
    coverColor: '#33240e',
    category: 'Comedy',
  },
  {
    id: 'pod-n1',
    title: 'The Morning Brief',
    host: 'AM News Desk',
    description: "The day's five biggest stories in fifteen minutes",
    episodeCount: 480,
    coverColor: '#0f2030',
    category: 'News',
  },
  {
    id: 'pod-n2',
    title: 'Signal & Noise',
    host: 'Priya Raman',
    description: 'What mattered this week, and what was just noise',
    episodeCount: 132,
    coverColor: '#122636',
    category: 'News',
  },
  {
    id: 'pod-sc1',
    title: 'Group Chat Energy',
    host: 'Culture Collective',
    description: 'Internet culture, decoded weekly',
    episodeCount: 76,
    coverColor: '#241a2e',
    category: 'Society & Culture',
  },
  {
    id: 'pod-sc2',
    title: 'Third Culture',
    host: 'Nadia Osei',
    description: 'Stories from between worlds, identity, family, and belonging',
    episodeCount: 41,
    coverColor: '#1c2418',
    category: 'Society & Culture',
  },
  {
    id: 'pod-sp1',
    title: 'The Overtime Room',
    host: 'AM Sports Desk',
    description: "Daily takes on the games everyone's talking about",
    episodeCount: 96,
    coverColor: '#12303e',
    category: 'Sports',
  },
  {
    id: 'pod-sp2',
    title: 'Full Press',
    host: 'Coach K & Dre',
    description: 'Basketball culture on and off the court',
    episodeCount: 67,
    coverColor: '#301a12',
    category: 'Sports',
  },
  {
    id: 'pod-tv1',
    title: 'The Villa Debrief',
    host: 'Reality Recap Network',
    description: 'Love Island episode-by-episode breakdowns and cast tea',
    episodeCount: 52,
    coverColor: '#3a2a10',
    coverArtPath: 'love-island-banner',
    category: 'TV & Film',
  },
  {
    id: 'pod-tv2',
    title: 'Season Finale',
    host: 'Ash & Colby',
    description: 'What to stream next, argued passionately',
    episodeCount: 143,
    coverColor: '#202a3a',
    category: 'TV & Film',
  },
  {
    id: 'pod-b1',
    title: 'The Pitch Deck',
    host: 'Forward Media',
    description: 'Founders tell the story behind the company',
    episodeCount: 89,
    coverColor: '#1a2a24',
    category: 'Business',
  },
  {
    id: 'pod-sci1',
    title: 'Ten Percent Curious',
    host: 'Dr. Lena Park',
    description: 'Big science questions in small doses',
    episodeCount: 64,
    coverColor: '#102a2e',
    category: 'Science',
  },
  {
    id: 'pod-h1',
    title: 'Rest Day',
    host: 'Maya Flores',
    description: 'Training, recovery, and the mind-muscle connection',
    episodeCount: 71,
    coverColor: '#242e18',
    category: 'Health & Fitness',
  },
  {
    id: 'pod-hi1',
    title: 'Echoes',
    host: 'The Archive Project',
    description: "History's turning points, retold from the inside",
    episodeCount: 102,
    coverColor: '#2a2014',
    category: 'History',
  },
]

// ANNOUNCEMENTS
export const announcements: Announcement[] = [
  {
    id: 'a1',
    type: 'tour',
    artistId: 'bts',
    headline: 'BTS is going on a World Tour',
    body: '3 tickets available near you - Jun-Sep 2025',
    ctaLabel: 'See your fan status',
    ctaRoute: '/artist/bts',
    gradientFrom: '#1a0a2e',
    gradientTo: '#0a0a0a',
    dates: [
      'Jun 14 · Los Angeles, CA · SoFi Stadium',
      'Jun 21 · New York, NY · MetLife Stadium',
      'Jul 05 · Chicago, IL · Wrigley Field',
      'Jul 19 · London, UK · Wembley Stadium',
    ],
  },
  {
    id: 'ann-olivia-1',
    type: 'release',
    artistId: 'olivia-rodrigo',
    headline: 'Olivia Rodrigo just dropped a new single',
    body: '"you seem pretty sad for a girl so in love" is out now, first listen for top fans',
    ctaLabel: 'Play it first',
    ctaRoute: '/artist/olivia-rodrigo',
    gradientFrom: '#2a1a2e',
    gradientTo: '#0a0a0a',
  },
]

// HOME SCREEN — curated art-forward picks
export const songsForYouIds = [
  's16', 's-bz1', 's-ts1989', 's-bm1', 's-jb1',
  's-bts-come', 's-bts-door', 's17', 's-jb2', 's10', 's7', 's20',
  // Wave 1 additions
  's-sza1', 's-beyonce2', 's-tyler1', 's-rihanna1', 's-lana1',
  's-drake1', 's-gaga1', 's-ariana1', 's-bb1', 's-lizzo1',
  's-jcole1', 's-jayz1', 's-outkast1', 's-rm1', 's-rosalia1',
  // Wave 2 additions
  's-sabrina1', 's-sabrina2', 's-charli1', 's-billie-e1', 's-doja1',
  's-weeknd1', 's-nj1', 's-twice1', 's-bp1', 's-jk1',
  's-lorde2', 's-or-new1', 's-ariana2', 's-v1', 's-rose2',
  's-svt1', 's-skz1', 's-dua1', 's-tate1', 's-sombr1',
  // Wave 3 additions
  's-or7', 's-or8', 's-or10', 's-drake2', 's-ts-showgirl',
  's-sabrina3', 's-sia1', 's-bts-arirang2', 's-or11', 's-sia2',
  // Wave 4 — genre diversity (jazz, rock, world, country)
  's-billie1', 's-fela1', 's-metallica1', 's-emmylou1', 's-gloria1',
  's-kate1', 's-carole1', 's-hosono1', 's-blink1', 's-beatles2',
  's-whitney1', 's-pf1', 's-jpbreak1', 's-roberta1', 's-loretta1',
]

export const homeFeaturedArtistIds = [
  'olivia-rodrigo', 'bts', 'drake', 'beyonce', 'tswift', 'the-weeknd',
  'bad-bunny', 'ariana-grande', 'blackpink', 'billie-eilish', 'sza',
  'lady-gaga', 'rihanna', 'metallica', 'rosalia', 'fela-kuti',
  'lorde', 'bruno-mars', 'fleetwood-mac', 'jennie',
]

export const hiddenGemsArtistIds = [
  'bana-zahiti', 'sombr', 'japanese-breakfast', 'fela-kuti', 'haruomi-hosono',
  'emmylou-harris', 'mitski', 'olivia-dean', 'noah-kahan', 'kpop-demon-hunters-cast',
]

export const frequentPlaySongIds = [
  's-or1', 's2', 's-sza1', 's-beyonce2', 's-drake1', 's-bb1',
  's-bp1', 's-weeknd1', 's-billie-e1', 's-ts1989', 's-bm1', 's-or4',
  // Latin & jazz so those themes' "on repeat" rails aren't empty
  's-bb2', 's-rosalia1', 's-gloria1', 's-billie1', 's-roberta1',
]

// Hannah — Taylor superfan hero, but home rails mix eras with wider taste.
export const hannahSongsForYouIds = [
  's-ts-showgirl', 's-ts1989', 's16',
  's-or1', 's-sabrina1', 's-tate1', 's-lorde2', 's-billie-e1',
  's-ariana1', 's-sza1', 's-dua1', 's-weeknd1', 's-or-new1',
  's-sabrina2', 's-beyonce2', 's-rihanna1', 's-doja1', 's-carole1',
]

export const hannahFeaturedArtistIds = [
  'tswift', 'olivia-rodrigo', 'sabrina-carpenter', 'tate-mcrae',
  'lorde', 'billie-eilish', 'ariana-grande', 'sza', 'dua-lipa', 'the-weeknd',
]

export const hannahFrequentPlaySongIds = [
  's-ts-showgirl', 's-ts1989', 's-or1', 's-sabrina1', 's-lorde2',
  's-billie-e1', 's-sza1', 's-ariana1', 's-dua1', 's-tate1',
]

// Music tab — personalized Discover & Resume
export const newForYouSongIds = [
  's-or7', 's-or10', 's-bts-arirang2', 's-lorde2', 's-ts-showgirl',
  's-sabrina3', 's-drake2', 's-or-new1', 's-rose2', 's-sia1',
]

export const newFromArtistSongIds: Record<string, string[]> = {
  'bts': ['s-bts-arirang2', 's-bts-door', 's-bts-journey1', 's-jk1', 's-v1', 's-jhope1', 's1', 's2'],
  'olivia-rodrigo': ['s-or7', 's-or10', 's-or-new1', 's-or8', 's-or11', 's-or4', 's-or5', 's-or1'],
  'tswift': ['s-ts-showgirl', 's-ts-ttpd-02', 's-ts-mid-01', 's-ts-folk-01', 's-ts-ever-01', 's-ts-rep-03', 's-ts1989-02', 's-ts-lover-02', 's16', 's17', 's-ts1989', 's10', 's11', 's18'],
  'justin-bieber': ['s-jb-justice-01', 's-jb-justice-05', 's-jb-purpose-04', 's-jb-changes-02', 's-jb1', 's-jb2', 's-jb3', 's-jb-believe-03', 's-jb-believe-02'],
  'drake': ['s-drake2', 's-drake1'],
  'lorde': ['s-lorde2', 's7', 's6', 's8'],
  'the-weeknd': ['s-weeknd1'],
  'billie-eilish': ['s-billie-e1'],
}

export const identityFavoriteArtistId: Record<string, string> = {
  kpop: 'bts',
  indie: 'lorde',
  latenight: 'tswift',
  hiphop: 'drake',
}

export const recentlyPlayedIds = [
  's-or1', 's2', 's-bp1', 's-weeknd1', 's-or4', 's-billie-e1', 's-sza1', 's-bts-door',
]

export const resumePodcastIds = ['pod1', 'pod4', 'pod2']

export const unfinishedPlaylistByIdentity: Record<string, string> = {
  kpop: 'pl-borahae-hours',
  indie: 'pl4',
  latenight: 'pl3',
  hiphop: 'pl6',
}

export const continueListeningItems = [
  { id: 'cl-al-showgirl', title: 'The Eras Tour', artKey: 'ts-showgirl', songId: 's16' },
  { id: 'cl-pod1', title: 'The ARMY Diaries', artKey: 'bts-proof-door', podcastId: 'pod1' },
  { id: 'cl-al-bz', title: 'Dukat', artKey: 'bana-zahiti', songId: 's-bz1' },
  { id: 'cl-pod2', title: 'Sad Girl Hours', artKey: 'lorde-melodrama', podcastId: 'pod2' },
  { id: 'cl-al-1989', title: '1989', artKey: 'ts-1989', songId: 's-ts1989' },
  { id: 'cl-al-come', title: 'Come Over', artKey: 'bts-come-over', songId: 's-bts-come' },
  { id: 'cl-pl2', title: 'ARMY Essentials', artKey: 'bts-proof-door', songId: 's-bts-door' },
  { id: 'cl-pl7', title: 'World Discoveries', artKey: 'bana-zahiti', songId: 's-bz1' },
  { id: 'cl-pl3', title: 'Olivia After Midnight', artKey: 'olivia-rodrigo-sour', songId: 's-or1' },
  { id: 'cl-al-bts-alt', title: 'BTS Highlights', artKey: 'bts-alt', songId: 's1' },
  // Wave 1 additions
  { id: 'cl-al-sos', title: 'SOS', artKey: 'sza-sos', songId: 's-sza1' },
  { id: 'cl-al-lemonade', title: 'Lemonade', artKey: 'beyonce-lemonade', songId: 's-beyonce2' },
  { id: 'cl-al-igor', title: 'IGOR', artKey: 'tyler-igor', songId: 's-tyler1' },
  { id: 'cl-al-anti', title: 'ANTI', artKey: 'rihanna-anti', songId: 's-rihanna1' },
  { id: 'cl-al-norman', title: 'Norman Fucking Rockwell!', artKey: 'lana-norman-rockwell', songId: 's-lana1' },
  { id: 'cl-al-rumours', title: 'Rumours', artKey: 'fleetwood-rumours', songId: 's-fleet1' },
  { id: 'cl-al-stankonia', title: 'Stankonia', artKey: 'outkast-stankonia', songId: 's-outkast1' },
  // Wave 2 additions
  { id: 'cl-al-espresso', title: 'Short n\' Sweet', artKey: 'sabrina-short-n-sweet', songId: 's-sabrina1' },
  { id: 'cl-al-brat', title: 'BRAT', artKey: 'charli-xcx-album', songId: 's-charli1' },
  { id: 'cl-al-virgin', title: 'Virgin', artKey: 'lorde-virgin', songId: 's-lorde2' },
  { id: 'cl-al-messy', title: 'Messy', artKey: 'olivia-dean-messy', songId: 's-olivia-dean1' },
  { id: 'cl-al-dangerous', title: 'Dangerous Woman', artKey: 'ariana-dangerous-woman', songId: 's-ariana2' },
  { id: 'cl-al-blinding', title: 'After Hours', artKey: 'the-weeknd', songId: 's-weeknd1' },
  { id: 'cl-al-birds', title: 'HIT ME HARD AND SOFT', artKey: 'billie-eilish-hit-me-hard-and-soft', songId: 's-billie-e1' },
  { id: 'cl-al-bp', title: 'BORN PINK', artKey: 'blackpink-the-album', songId: 's-bp1' },
  { id: 'cl-al-golden', title: 'Golden', artKey: 'jungkook', songId: 's-jk1' },
  { id: 'cl-al-kdhost', title: 'Demon Hunters OST', artKey: 'kpop-demon-hunters-ost', songId: 's-kdh1' },
  // Wave 3 additions
  { id: 'cl-al-guts-catch', title: 'GUTS', artKey: 'olivia-rodrigo-cant-catch-me', songId: 's-or7' },
  { id: 'cl-al-drake-ice', title: 'Iceman', artKey: 'drake-iceman', songId: 's-drake2' },
  { id: 'cl-al-showgirl-life', title: 'The Life of a Showgirl', artKey: 'ts-showgirl-life', songId: 's-ts-showgirl' },
  { id: 'cl-al-sabrina-mbf', title: "Man's Best Friend", artKey: 'sabrina-mans-best-friend', songId: 's-sabrina3' },
  { id: 'cl-al-arirang', title: 'Arirang', artKey: 'bts-arirang-album', songId: 's-bts-arirang2' },
  { id: 'cl-al-sia', title: '1000 Forms of Fear', artKey: 'sia', songId: 's-sia1' },
  { id: 'cl-al-or-exclusive', title: 'GUTS (Exclusive)', artKey: 'olivia-rodrigo-exclusive', songId: 's-or10' },
  // K-pop Borahae Hours
  { id: 'cl-pl-borahae', title: 'Borahae Hours', artKey: 'bts-proof-door', songId: 's-bts-door' },
]

// The kind of thing a "continue listening" entry is, inferred from its id prefix
// (cl-al- albums, cl-pl- playlists, cl-pod- podcasts, cl-st- stations). Used to
// label each "Jump back in" card so albums/playlists/podcasts read distinctly.
export function continueListeningKind(id: string): { label: string; icon: string } {
  if (id.startsWith('cl-pod')) return { label: 'Podcast', icon: 'mic' }
  if (id.startsWith('cl-st'))  return { label: 'Station', icon: 'radio' }
  if (id.startsWith('cl-pl'))  return { label: 'Playlist', icon: 'list' }
  if (id.startsWith('cl-al'))  return { label: 'Album', icon: 'disc' }
  return { label: 'Song', icon: 'musical-note' }
}

export const heroPool = [
  { artistId: 'tswift',         name: 'Taylor Swift',   hue: 'rgba(52, 28, 14, 0.80)', bannerKey: 'ts-showgirl' },
  { artistId: 'bts',            name: 'BTS',            hue: 'rgba(28, 22, 38, 0.80)', bannerKey: 'bts-proof-door' },
  { artistId: 'olivia-rodrigo', name: 'Olivia Rodrigo', hue: 'rgba(38, 22, 32, 0.80)', bannerKey: 'olivia-rodrigo-hero' },
  { artistId: 'beyonce',        name: 'Beyoncé',        hue: 'rgba(32, 18, 12, 0.80)', bannerKey: 'beyonce' },
  { artistId: 'the-weeknd',     name: 'The Weeknd',     hue: 'rgba(18, 12, 22, 0.80)', bannerKey: 'the-weeknd' },
  { artistId: 'bad-bunny',      name: 'Bad Bunny',      hue: 'rgba(42, 22, 12, 0.80)', bannerKey: 'bad-bunny' },
  { artistId: 'blackpink',      name: 'BLACKPINK',      hue: 'rgba(32, 12, 28, 0.80)', bannerKey: 'blackpink' },
  { artistId: 'billie-eilish',  name: 'Billie Eilish',  hue: 'rgba(22, 28, 32, 0.80)', bannerKey: 'billie-eilish' },
  { artistId: 'sza',            name: 'SZA',            hue: 'rgba(28, 18, 32, 0.80)', bannerKey: 'sza' },
  { artistId: 'ariana-grande',  name: 'Ariana Grande',  hue: 'rgba(32, 22, 38, 0.80)', bannerKey: 'ariana-grande' },
  { artistId: 'drake',          name: 'Drake',          hue: 'rgba(12, 12, 18, 0.80)', bannerKey: 'drake-iceman' },
  { artistId: 'lorde',          name: 'Lorde',          hue: 'rgba(18, 32, 28, 0.80)', bannerKey: 'lorde-melodrama' },
  { artistId: 'bruno-mars',     name: 'Bruno Mars',     hue: 'rgba(42, 28, 12, 0.80)', bannerKey: 'bruno-mars-24k-magic' },
  { artistId: 'metallica',      name: 'Metallica',      hue: 'rgba(18, 18, 28, 0.80)', bannerKey: 'metallica-master' },
  { artistId: 'rosalia',        name: 'Rosalía',        hue: 'rgba(38, 18, 22, 0.80)', bannerKey: 'rosalia-el-mal-querer' },
  { artistId: 'bana-zahiti',    name: 'Bana Zahiti',    hue: 'rgba(48, 32, 18, 0.80)', bannerKey: 'bana-zahiti' },
] as const

export const myMixPlaylistIds = ['pl7', 'pl3', 'pl8', 'pl9', 'pl2']

export const popularInCitySongIds = [
  's-ts1989', 's-bz1', 's-bts-come', 's16', 's-bm2', 's-jb3', 's17', 's-bts-door',
  // Wave 1 additions
  's-cardi1', 's-missy1', 's-nicki1', 's-beyonce1', 's-pf1',
  's-fleet1', 's-beatles1', 's-janet1', 's-prince1', 's-jpbreak1',
  // Wave 2 additions
  's-charli1', 's-sabrina1', 's-weeknd1', 's-doja1', 's-nj1',
  's-twice1', 's-bp1', 's-jk1', 's-svt1', 's-skz1',
  's-rose2', 's-jennie1', 's-lisa1', 's-dua1', 's-tate1',
  // Wave 3 additions
  's-or7', 's-or10', 's-drake2', 's-ts-showgirl', 's-sabrina3',
  's-sia1', 's-bts-arirang2', 's-or8', 's-sia2', 's-or11',
  // Latin heat for the latin theme's "popular in your city" rail
  's-bb2', 's-bb5', 's-rosalia1', 's-gloria1',
]

// USER
export const user = {
  id: 'u1',
  name: 'Derbc Studios',
  handle: '@derbc',
  activeIdentityId: 'kpop',
  totalStreams: 7575,
  memberSince: 'October 2021',
}

// CURRENTLY PLAYING
export const nowPlaying = {
  songId: 's1',
  progress: 78,
  isPlaying: true,
}
