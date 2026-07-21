import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { artists, songs, type Artist, type Playlist, type Song } from '../data/mockData'

export type AdaptiveTheme = {
  id: string
  label: string
  isSuperFanUnlock?: boolean
  heroTitle: string
  heroSubtitle: string
  heroEyebrow: string
  heroArtistId: string
  heroBannerKey?: string
  heroHue: string
  // Overrides the "Your featured favorite" section heading above the hero
  // card. Artist/genre themes stay on that default — the card is genuinely
  // introducing a favorite artist. Mood/time-of-day themes (morning, late
  // night, chill…) aren't about a "favorite" at all, so they get a heading
  // that matches the vibe instead.
  heroSectionLabel?: string
  sectionLabels: {
    songsForYou: string
    continueListening: string
    podcastsForYou: string
    albumsForYou: string
    frequentPlays: string
    popularInCity: string
    myMixes: string
    radioStations?: string
  }
  filterArtistIds?: string[]
  filterGenre?: string
  filterGenres?: string[]
  filterMoods?: string[]
  featuredArtistIds?: string[]
}

const DEFAULT_SECTION_LABELS: AdaptiveTheme['sectionLabels'] = {
  songsForYou: 'Songs for You',
  continueListening: 'Continue Listening',
  podcastsForYou: 'Podcasts you may like',
  albumsForYou: 'Albums for you',
  frequentPlays: 'Frequent plays',
  popularInCity: 'Popular in your city',
  myMixes: 'My Mixes',
}

export const PREDEFINED_THEMES: AdaptiveTheme[] = [
  {
    id: 'kpop',
    label: 'K-pop',
    heroTitle: 'Your K-pop obsession',
    heroSubtitle: 'Starting with BTS, TWICE, and BLACKPINK, are you a 1st Gen loyalist or a 4th Gen stan?',
    heroEyebrow: 'FOR STANS',
    heroArtistId: 'bts',
    heroBannerKey: 'bts-proof-door',
    heroHue: '#7B2D8E',
    filterArtistIds: ['bts', 'twice', 'blackpink', 'newjeans', 'stray-kids', 'jungkook', 'jennie', 'lisa', 'v-bts', 'j-hope', 'rose', 'seventeen', 'exo', 'rm'],
    featuredArtistIds: ['bts', 'blackpink', 'jungkook', 'newjeans', 'stray-kids', 'twice', 'jennie', 'lisa', 'seventeen', 'rose', 'olivia-rodrigo'],
    sectionLabels: {
      songsForYou: 'Tracks for your K-pop heart',
      continueListening: '[Re]visit the Eras',
      podcastsForYou: 'Podcasts for the ARMY & beyond',
      albumsForYou: '1st Gen to 4th Gen, your era awaits',
      frequentPlays: 'On repeat like a comeback',
      popularInCity: 'Trending with the stans near you',
      myMixes: 'Your stan-curated mixes',
    },
  },
  {
    id: 'taylor-swift',
    label: 'Taylor Swift',
    heroTitle: 'Your daily Taylor Swift dosage',
    heroSubtitle: 'From 1989 to The Tortured Poets Department, all eras, zero skips',
    heroEyebrow: 'YOUR ERA',
    heroArtistId: 'tswift',
    heroBannerKey: 'ts-showgirl',
    heroHue: '#C9A0DC',
    filterArtistIds: ['tswift'],
    featuredArtistIds: ['tswift', 'olivia-rodrigo', 'sabrina-carpenter', 'tate-mcrae'],
    sectionLabels: {
      songsForYou: 'Tracks from every era',
      continueListening: 'Resume your Swiftie session',
      podcastsForYou: 'Podcasts for Swifties',
      albumsForYou: 'Era-defining albums for you',
      frequentPlays: 'Your most-streamed eras',
      popularInCity: 'Swifties in your city',
      myMixes: 'Taylor-coded mixes',
    },
  },
  {
    id: 'jazz',
    label: 'Jazz',
    heroTitle: 'Your jazzy afternoon',
    heroSubtitle: 'Billie Holiday standards and smooth afternoon vibes, pour something warm',
    heroEyebrow: 'SMOOTH HOUR',
    heroArtistId: 'billie-holiday',
    heroBannerKey: 'billie-holiday-satin',
    heroHue: '#8B6914',
    filterGenres: ['Jazz', 'Blues'],
    filterArtistIds: ['billie-holiday', 'roberta-flack'],
    featuredArtistIds: ['billie-holiday', 'roberta-flack', 'prince', 'kate-bush'],
    sectionLabels: {
      songsForYou: 'Velvet tracks for slow afternoons',
      continueListening: 'Where you left the set',
      podcastsForYou: 'Jazz talk & deep cuts',
      albumsForYou: 'Timeless jazz albums',
      frequentPlays: 'Your go-to standards',
      popularInCity: 'Jazz lovers near you',
      myMixes: 'Late-night jazz blends',
    },
  },
  {
    id: 'bruno-mars',
    label: 'Bruno Mars',
    heroTitle: 'Your funk fix',
    heroSubtitle: '24K Magic energy, groovy, glamorous, and completely irresistible',
    heroEyebrow: '24K MODE',
    heroArtistId: 'bruno-mars',
    heroBannerKey: 'bruno-mars-24k-magic',
    heroHue: '#D4AF37',
    filterArtistIds: ['bruno-mars'],
    featuredArtistIds: ['bruno-mars', 'dua-lipa', 'the-weeknd', 'doja-cat'],
    sectionLabels: {
      songsForYou: 'Funk-pop bangers for you',
      continueListening: 'Keep the groove going',
      podcastsForYou: 'Pop & funk deep dives',
      albumsForYou: 'Bruno-era essentials',
      frequentPlays: 'Your most-played funk',
      popularInCity: 'Grooving in your city',
      myMixes: '24K-coded mixes',
    },
  },
  {
    id: 'justin-bieber',
    label: 'Justin Bieber',
    heroTitle: 'Belieber mode activated',
    heroSubtitle: 'Purpose-era hits and new drops, you never outgrew this',
    heroEyebrow: 'FOR BELIEBERS',
    heroArtistId: 'justin-bieber',
    heroBannerKey: 'justin-bieber-believe',
    heroHue: '#6B5B95',
    filterArtistIds: ['justin-bieber'],
    featuredArtistIds: ['justin-bieber', 'ariana-grande', 'katy-perry', 'harry-styles'],
    sectionLabels: {
      songsForYou: 'Belieber-approved tracks',
      continueListening: 'Back to your JB session',
      podcastsForYou: 'Pop culture for Beliebers',
      albumsForYou: 'Justin albums you know by heart',
      frequentPlays: 'On repeat since My World',
      popularInCity: 'Beliebers in your city',
      myMixes: 'Belieber mood mixes',
    },
  },
  {
    id: 'olivia-rodrigo-superfan',
    label: 'Olivia Rodrigo',
    isSuperFanUnlock: true,
    heroTitle: 'Your Olivia era',
    heroEyebrow: 'TOP 1% FAN',
    heroSubtitle: 'The songs that wrecked you, from Sour to GUTS and everything in between',
    heroArtistId: 'olivia-rodrigo',
    heroBannerKey: 'olivia-rodrigo-hero',
    heroHue: '#6B3FA0',
    filterArtistIds: ['olivia-rodrigo'],
    // Taylor and BTS lead the "featured" rail too — they're the other two
    // artists with a fully built-out superfan page, so they're always worth
    // surfacing regardless of whose profile you're on.
    featuredArtistIds: ['olivia-rodrigo', 'tswift', 'bts', 'olivia-dean', 'sabrina-carpenter', 'tate-mcrae'],
    sectionLabels: {
      songsForYou: 'Tracks that know you too well',
      continueListening: 'Pick up where the heartbreak left off',
      podcastsForYou: 'Deep dives on her eras',
      albumsForYou: 'SOUR & GUTS on rotation',
      frequentPlays: 'Your Olivia obsession',
      popularInCity: 'Livies near you',
      myMixes: 'Olivia-coded mood mixes',
    },
  },
  {
    id: 'taylor-swift-superfan',
    label: 'Taylor Swift',
    isSuperFanUnlock: true,
    heroTitle: 'Your Taylor era',
    heroEyebrow: 'TOP 1% FAN',
    heroSubtitle: 'From Debut to The Life of a Showgirl, every era, zero skips',
    heroArtistId: 'tswift',
    heroBannerKey: 'ts-showgirl',
    heroHue: '#C9A0DC',
    filterArtistIds: ['tswift'],
    featuredArtistIds: ['tswift', 'olivia-rodrigo', 'sabrina-carpenter', 'tate-mcrae'],
    sectionLabels: {
      songsForYou: 'Tracks from every era',
      continueListening: 'Resume your Swiftie session',
      podcastsForYou: 'Podcasts for Swifties',
      albumsForYou: 'Era-defining albums for you',
      frequentPlays: 'Your most-streamed eras',
      popularInCity: 'Swifties near you',
      myMixes: 'Taylor-coded mixes',
    },
  },
  {
    id: 'bts-superfan',
    label: 'BTS',
    isSuperFanUnlock: true,
    heroTitle: 'Your BTS era',
    heroEyebrow: 'TOP 1% FAN',
    heroSubtitle: 'From Proof to the vault, every comeback, on repeat',
    heroArtistId: 'bts',
    heroBannerKey: 'bts-proof-door',
    heroHue: '#7B2D8E',
    filterArtistIds: ['bts', 'jungkook', 'v-bts', 'j-hope', 'rm'],
    featuredArtistIds: ['bts', 'jungkook', 'blackpink', 'newjeans', 'stray-kids', 'twice'],
    sectionLabels: {
      songsForYou: 'Tracks for your ARMY heart',
      continueListening: '[Re]visit the eras',
      podcastsForYou: 'Podcasts for the ARMY',
      albumsForYou: 'Proof to Love Yourself, on rotation',
      frequentPlays: 'On repeat like a comeback',
      popularInCity: 'ARMY near you',
      myMixes: 'ARMY-curated mixes',
    },
  },
  {
    id: 'pop',
    label: 'Pop',
    heroTitle: 'Your pop pulse',
    heroSubtitle: 'Chart-toppers and radio gold, main character energy only',
    heroEyebrow: 'MAIN CHARACTER',
    heroArtistId: 'ariana-grande',
    heroBannerKey: 'ariana-grande',
    heroHue: '#FF6B6B',
    filterGenres: ['Pop'],
    featuredArtistIds: ['ariana-grande', 'olivia-rodrigo', 'dua-lipa', 'sabrina-carpenter', 'katy-perry', 'charli-xcx', 'tate-mcrae', 'sia'],
    sectionLabels: {
      songsForYou: 'Pop hits picked for you',
      continueListening: 'Resume your pop binge',
      podcastsForYou: 'Pop culture pods you\'ll love',
      albumsForYou: 'Pop albums on rotation',
      frequentPlays: 'Your pop heavy rotation',
      popularInCity: 'Pop trending near you',
      myMixes: 'Your pop personality mixes',
    },
  },
  {
    id: 'throwback',
    label: 'Throwback',
    heroTitle: 'Throwback Thursday vibes',
    heroSubtitle: 'Beatles, Fleetwood Mac, and 2000s nostalgia, every day feels like flashback',
    heroEyebrow: 'FLASHBACK',
    heroSectionLabel: 'Your throwback mix',
    heroArtistId: 'beatles',
    heroBannerKey: 'beatles-abbey-road',
    heroHue: '#C4956A',
    filterArtistIds: ['beatles', 'fleetwood-mac', 'madonna', 'janet-jackson', 'elton-john', 'carole-king', 'whitney-houston'],
    featuredArtistIds: ['beatles', 'fleetwood-mac', 'madonna', 'janet-jackson', 'elton-john', 'prince', 'carole-king'],
    sectionLabels: {
      songsForYou: 'Classic cuts for nostalgia',
      continueListening: 'Pick up the throwback',
      podcastsForYou: 'Retro music deep dives',
      albumsForYou: 'Timeless albums for you',
      frequentPlays: 'Old favorites on repeat',
      popularInCity: 'Throwbacks trending locally',
      myMixes: 'Nostalgia blends',
    },
  },
  {
    id: 'chill',
    label: 'Chill',
    heroTitle: 'Your chill zone',
    heroSubtitle: 'Lo-fi moods and mellow acoustics, no skips, just soft landing',
    heroEyebrow: 'LO-FI HOUR',
    heroSectionLabel: 'Your chill mix',
    heroArtistId: 'lorde',
    heroBannerKey: 'lorde-melodrama',
    heroHue: '#7EB8DA',
    filterMoods: ['chill', 'sad'],
    filterArtistIds: ['lorde', 'mitski', 'billie-eilish', 'sza', 'fka-twigs', 'lana-del-rey', 'noah-kahan', 'sombr'],
    featuredArtistIds: ['lorde', 'mitski', 'billie-eilish', 'sza', 'lana-del-rey', 'noah-kahan', 'sombr', 'olivia-dean'],
    sectionLabels: {
      songsForYou: 'Soft tracks to unwind',
      continueListening: 'Ease back in',
      podcastsForYou: 'Calm listens for winding down',
      albumsForYou: 'Mellow albums for you',
      frequentPlays: 'Your comfort rotation',
      popularInCity: 'Chill vibes near you',
      myMixes: 'Wind-down mixes',
    },
  },
  {
    id: 'hip-hop',
    label: 'Hip-Hop',
    heroTitle: 'Bars on bars',
    heroSubtitle: 'Drake, J. Cole, and the hip-hop rotation that never leaves your headphones',
    heroEyebrow: 'HEAD NOD',
    heroArtistId: 'drake',
    heroBannerKey: 'drake-if-youre-reading',
    heroHue: '#1A1A2E',
    filterGenres: ['Hip-Hop'],
    featuredArtistIds: ['drake', 'j-cole', 'jay-z', 'cardi-b', 'nicki-minaj', 'tyler-the-creator', 'asap-rocky', 'missy-elliott', 'chance-the-rapper', 'outkast', 'olivia-rodrigo'],
    sectionLabels: {
      songsForYou: 'Hip-hop cuts for you',
      continueListening: 'Back in the pocket',
      podcastsForYou: 'Rap culture pods',
      albumsForYou: 'Essential hip-hop albums',
      frequentPlays: 'Your rap rotation',
      popularInCity: 'Hip-hop trending near you',
      myMixes: 'Boom-bap & trap blends',
    },
  },
  {
    id: 'rnb-soul',
    label: 'R&B & Soul',
    heroTitle: 'Velvet hour',
    heroSubtitle: 'SZA, Beyoncé, and the slow-burn R&B that hits different after midnight',
    heroEyebrow: 'LATE NIGHT',
    heroArtistId: 'sza',
    heroBannerKey: 'sza-sos',
    heroHue: '#4A2848',
    filterGenres: ['R&B', 'Soul'],
    featuredArtistIds: ['sza', 'beyonce', 'rihanna', 'whitney-houston', 'mary-j-blige', 'fka-twigs', 'roberta-flack', 'the-weeknd'],
    sectionLabels: {
      songsForYou: 'R&B tracks picked for you',
      continueListening: 'Ease back into the groove',
      podcastsForYou: 'Soul & R&B deep dives',
      albumsForYou: 'Albums for slow nights',
      frequentPlays: 'Your soul rotation',
      popularInCity: 'R&B trending locally',
      myMixes: 'Velvet mood blends',
    },
  },
  {
    id: 'latin',
    label: 'Latin',
    heroTitle: 'Fuego latino',
    heroSubtitle: 'Bad Bunny, Rosalía, and the reggaeton pulse keeping your city moving',
    heroEyebrow: 'CALOR',
    heroArtistId: 'bad-bunny',
    heroBannerKey: 'bad-bunny',
    heroHue: '#C45C2A',
    filterGenres: ['Latin'],
    filterArtistIds: ['bad-bunny', 'rosalia', 'gloria-estefan'],
    featuredArtistIds: ['bad-bunny', 'rosalia', 'gloria-estefan', 'olivia-rodrigo'],
    sectionLabels: {
      songsForYou: 'Latin tracks for you',
      continueListening: 'Sigue la fiesta',
      podcastsForYou: 'Latin music pods',
      albumsForYou: 'Latin albums on rotation',
      frequentPlays: 'Your Latin heavy rotation',
      popularInCity: 'Latin heat near you',
      myMixes: 'Reggaeton & más blends',
    },
  },
  {
    id: 'love-island',
    label: 'Love Island',
    heroTitle: 'For the Villa',
    heroSubtitle: 'Islanders on repeat, your Villa soundtrack',
    heroEyebrow: 'VILLA SEASON',
    heroArtistId: 'dua-lipa',
    heroBannerKey: 'love-island-banner',
    heroHue: '#D4A843',
    filterMoods: ['love', 'hype', 'happy'],
    filterGenres: ['Pop', 'R&B', 'Dance'],
    featuredArtistIds: ['dua-lipa', 'zara-larsson', 'rihanna', 'beyonce', 'doja-cat', 'lizzo', 'ariana-grande', 'katy-perry'],
    sectionLabels: {
      songsForYou: 'Songs for the Islanders',
      continueListening: 'Back in the Villa',
      podcastsForYou: 'Casa Amor debrief pods',
      albumsForYou: 'Albums for grafting season',
      frequentPlays: 'A New Bombshell Has Entered the Villa',
      popularInCity: 'Mamacita, trending near you',
      myMixes: 'Coupling up your mixes',
    },
  },
  {
    id: 'rock',
    label: 'Rock',
    heroTitle: 'Turn it up',
    heroSubtitle: 'Metallica, Pink Floyd, and the riffs that never go out of style',
    heroEyebrow: 'LOUD',
    heroArtistId: 'metallica',
    heroBannerKey: 'metallica-master',
    heroHue: '#2A2A3A',
    filterGenres: ['Rock', 'Metal', 'Punk'],
    featuredArtistIds: ['metallica', 'beatles', 'pink-floyd', 'blink-182', 'fleetwood-mac', 'funkadelic', 'roxy-music'],
    sectionLabels: {
      songsForYou: 'Rock cuts for you',
      continueListening: 'Back to the riff',
      podcastsForYou: 'Rock history pods',
      albumsForYou: 'Classic rock albums',
      frequentPlays: 'Your rock rotation',
      popularInCity: 'Rock trending near you',
      myMixes: 'Guitar-driven blends',
    },
  },
  {
    id: 'late-night',
    label: 'Late Night',
    heroTitle: 'The city never sleeps',
    heroSubtitle: 'Midnight drives, city lights, and the playlist that knows what 2am feels like',
    heroEyebrow: '2AM DRIVE',
    heroSectionLabel: 'Your late night mix',
    heroArtistId: 'the-weeknd',
    heroBannerKey: 'late-night-city',
    heroHue: '#0D0D1A',
    filterMoods: ['chill', 'sad', 'love'],
    filterArtistIds: ['the-weeknd', 'sza', 'lana-del-rey', 'billie-eilish', 'drake', 'fka-twigs', 'rihanna'],
    featuredArtistIds: ['the-weeknd', 'sza', 'lana-del-rey', 'billie-eilish', 'drake', 'fka-twigs', 'rihanna', 'dua-lipa'],
    sectionLabels: {
      songsForYou: 'Songs for the late hours',
      continueListening: 'Still up? Keep going',
      podcastsForYou: 'Late night talk & stories',
      albumsForYou: 'Albums for after midnight',
      frequentPlays: 'What you always come back to at night',
      popularInCity: 'What the city is playing right now',
      myMixes: 'Your midnight mixes',
    },
  },
  {
    id: 'heartbreak',
    label: 'In My Feels',
    heroTitle: 'Let it out',
    heroSubtitle: 'The songs that get it, no explanations needed, just press play',
    heroEyebrow: 'IN YOUR FEELS',
    heroSectionLabel: 'Your feels mix',
    heroArtistId: 'olivia-rodrigo',
    heroBannerKey: 'heartbreak-mood',
    heroHue: '#2A1A2E',
    filterMoods: ['sad', 'angry', 'love'],
    filterArtistIds: ['olivia-rodrigo', 'sza', 'billie-eilish', 'lorde', 'mitski', 'lana-del-rey', 'noah-kahan', 'sombr', 'tate-mcrae'],
    featuredArtistIds: ['olivia-rodrigo', 'sza', 'lorde', 'mitski', 'billie-eilish', 'lana-del-rey', 'noah-kahan', 'tate-mcrae'],
    sectionLabels: {
      songsForYou: 'Songs that already know',
      continueListening: 'You left off right in the feelings',
      podcastsForYou: 'For when you need to hear it out loud',
      albumsForYou: 'Albums that sit with you',
      frequentPlays: 'The ones you keep coming back to',
      popularInCity: "You're not the only one feeling this",
      myMixes: 'Your feels mixes',
    },
  },
  {
    id: 'dance',
    label: 'Dance & Upbeat',
    heroTitle: 'Turn it up',
    heroSubtitle: 'Floor-filling energy, from pre-game to peak hour, this one doesn\'t stop',
    heroEyebrow: 'PEAK HOUR',
    heroSectionLabel: 'Your dance floor mix',
    heroArtistId: 'dua-lipa',
    heroBannerKey: 'dance-upbeat',
    heroHue: '#1A0A3A',
    filterMoods: ['hype', 'happy'],
    filterGenres: ['Pop', 'Dance', 'R&B', 'Latin'],
    filterArtistIds: ['dua-lipa', 'beyonce', 'rihanna', 'bad-bunny', 'doja-cat', 'charli-xcx', 'lizzo', 'janet-jackson', 'missy-elliott', 'lady-gaga', 'katy-perry', 'ariana-grande', 'zara-larsson', 'sabrina-carpenter'],
    featuredArtistIds: ['dua-lipa', 'beyonce', 'rihanna', 'bad-bunny', 'doja-cat', 'charli-xcx', 'lizzo', 'janet-jackson', 'missy-elliott', 'lady-gaga'],
    sectionLabels: {
      songsForYou: 'Floor-fillers for you',
      continueListening: 'Keep the energy going',
      podcastsForYou: 'Music & culture pods',
      albumsForYou: 'Albums built to move',
      frequentPlays: 'Your go-to bangers',
      popularInCity: 'What\'s moving your city right now',
      myMixes: 'Your dance floor mixes',
    },
  },
  {
    id: 'morning-energy',
    label: 'Morning Energy',
    heroTitle: 'Start strong',
    heroSubtitle: 'The playlist that makes getting up feel like a main character moment',
    heroEyebrow: 'GOOD MORNING',
    heroSectionLabel: 'Your morning mix',
    heroArtistId: 'lizzo',
    heroBannerKey: 'morning-energy',
    heroHue: '#E8871A',
    filterMoods: ['hype', 'happy'],
    filterArtistIds: ['lizzo', 'beyonce', 'dua-lipa', 'sabrina-carpenter', 'doja-cat', 'charli-xcx', 'katy-perry', 'ariana-grande', 'bad-bunny'],
    featuredArtistIds: ['lizzo', 'beyonce', 'dua-lipa', 'sabrina-carpenter', 'doja-cat', 'charli-xcx', 'katy-perry', 'ariana-grande'],
    sectionLabels: {
      songsForYou: 'Your morning power tracks',
      continueListening: "Pick back up, the energy's still here",
      podcastsForYou: 'Morning motivation pods',
      albumsForYou: 'Albums that hit different in the morning',
      frequentPlays: 'Your go-to wake-up rotation',
      popularInCity: 'What your city woke up to',
      myMixes: 'Rise & shine mixes',
    },
  },
]

function pickRandomTheme(themes: AdaptiveTheme[]): AdaptiveTheme {
  return themes[Math.floor(Math.random() * themes.length)]
}

/** Returns a theme that matches the current time of day — no artist-specific themes. */
function pickTimeAppropriateTheme(themes: AdaptiveTheme[]): AdaptiveTheme | null {
  const hour = new Date().getHours()

  // Preferred theme IDs ordered by priority for each time window.
  let preferred: string[]
  if (hour >= 5 && hour < 11) {
    preferred = ['morning-energy', 'pop', 'dance']
  } else if (hour >= 11 && hour < 17) {
    preferred = ['chill', 'jazz', 'pop', 'throwback']
  } else if (hour >= 17 && hour < 21) {
    preferred = ['dance', 'latin', 'pop', 'rnb-soul']
  } else {
    // 9 pm → 5 am
    preferred = ['late-night', 'rnb-soul', 'chill', 'heartbreak']
  }

  // Filter out artist-specific / superfan themes (those with isSuperFanUnlock).
  const general = themes.filter(t => !t.isSuperFanUnlock)

  for (const id of preferred) {
    const match = general.find(t => t.id === id)
    if (match) return match
  }

  return general[0] ?? themes[0] ?? null
}

function buildDynamicSectionLabels(artistName: string): AdaptiveTheme['sectionLabels'] {
  return {
    songsForYou: `${artistName} tracks for you`,
    continueListening: `Back to ${artistName}`,
    podcastsForYou: `Pods for ${artistName} fans`,
    albumsForYou: `${artistName} albums picked for you`,
    frequentPlays: `Your ${artistName} rotation`,
    popularInCity: `${artistName} trending near you`,
    myMixes: `${artistName}-coded mixes`,
  }
}

export function createThemeFromSong(song: Pick<Song, 'artistId' | 'artistName' | 'albumArtPath' | 'albumArtColor'>): AdaptiveTheme {
  const artist = artists.find(a => a.id === song.artistId)
  const bannerKey = song.albumArtPath ?? artist?.imageUri
  const hue = song.albumArtColor ?? '#7B2D8E'

  return {
    id: `dynamic-${song.artistId}`,
    label: song.artistName,
    heroTitle: `Your ${song.artistName} moment`,
    heroSubtitle: `${song.artistName} on repeat, this one's for the real fans`,
    heroEyebrow: 'YOUR VIBE',
    heroArtistId: song.artistId,
    heroBannerKey: bannerKey,
    heroHue: hue,
    filterArtistIds: [song.artistId],
    sectionLabels: buildDynamicSectionLabels(song.artistName),
  }
}

export function createThemeFromArtist(artist: Pick<Artist, 'id' | 'name' | 'imageUri'>): AdaptiveTheme {
  // Reuse a curated theme's hue when we have one for this artist; else default.
  const matching = PREDEFINED_THEMES.find(t => t.heroArtistId === artist.id)
  const hue = matching?.heroHue ?? '#6B3FA0'

  return {
    id: `dynamic-${artist.id}`,
    label: artist.name,
    heroTitle: `Your ${artist.name} moment`,
    heroSubtitle: `${artist.name} on repeat, this one's for the real fans`,
    heroEyebrow: 'YOUR VIBE',
    heroArtistId: artist.id,
    heroBannerKey: artist.imageUri,
    heroHue: hue,
    filterArtistIds: [artist.id],
    sectionLabels: buildDynamicSectionLabels(artist.name),
  }
}

export function createThemeFromPlaylist(playlist: Pick<Playlist, 'id' | 'name' | 'coverArtPath'>): AdaptiveTheme {
  // Anchor the theme to the artist whose album art is the playlist's cover, if any.
  const anchor = playlist.coverArtPath
    ? songs.find(s => s.albumArtPath === playlist.coverArtPath)
    : undefined
  const hue = anchor?.albumArtColor ?? '#3B6EA5'

  return {
    id: `dynamic-pl-${playlist.id}`,
    label: playlist.name,
    heroTitle: playlist.name,
    heroSubtitle: `Your ${playlist.name} rotation, dialed right in`,
    heroEyebrow: 'YOUR MIX',
    heroArtistId: anchor?.artistId ?? '',
    heroBannerKey: playlist.coverArtPath,
    heroHue: hue,
    filterArtistIds: anchor ? [anchor.artistId] : undefined,
    sectionLabels: buildDynamicSectionLabels(playlist.name),
  }
}

/** A "build your own" profile's picks — any mix of artists, genres, and moods. */
export type CustomThemeConfig = {
  name: string
  artistIds: string[]
  genres: string[]
  moods: string[]
}

export function createCustomTheme(config: CustomThemeConfig): AdaptiveTheme {
  const { artistIds, genres, moods } = config

  // Anchor the hero art + hue to the first selected artist, else the first song
  // that matches a selected genre/mood, else a neutral default.
  let anchor: Song | undefined
  if (artistIds.length) anchor = songs.find(s => s.artistId === artistIds[0])
  if (!anchor && (genres.length || moods.length)) {
    anchor = songs.find(s => {
      const artist = artists.find(a => a.id === s.artistId)
      const genreMatch = genres.length > 0 && artist ? genres.includes(artist.genre) : false
      const moodMatch = moods.length > 0 ? moods.includes(s.mood) : false
      return genreMatch || moodMatch
    })
  }
  const anchorArtistId = artistIds[0] ?? anchor?.artistId ?? ''
  const heroBannerKey = anchor?.albumArtPath ?? artists.find(a => a.id === anchorArtistId)?.imageUri
  const hue = anchor?.albumArtColor ?? '#7B2D8E'
  // Broaden beyond just the picked artists: fold in the genres those artists
  // belong to, so the home fills with same-genre artists & songs — "more like
  // what you listen to", not only the exact names you tapped.
  const pickedArtistGenres = artistIds
    .map(id => artists.find(a => a.id === id)?.genre)
    .filter((g): g is string => !!g)
  const allGenres = [...new Set([...genres, ...pickedArtistGenres])]

  // Content labels describe what they're a fan OF (artist / genre / mood) — never
  // the user's own name. The user's name lives in the greeting (activeProfile.name).
  const fandomName =
    artistIds.length
      ? artists.find(a => a.id === artistIds[0])?.name ?? 'your music'
      : genres.length
        ? genres[0]
        : moods.length
          ? moods[0]
          : 'your music'

  return {
    id: 'custom-user',
    label: fandomName,
    heroTitle: `Your ${fandomName} mix`,
    heroSubtitle: 'Built from the artists, genres and moods you picked',
    heroEyebrow: 'MADE FOR YOU',
    heroArtistId: anchorArtistId,
    heroBannerKey,
    heroHue: hue,
    filterArtistIds: artistIds.length ? artistIds : undefined,
    filterGenres: allGenres.length ? allGenres : undefined,
    filterMoods: moods.length ? moods : undefined,
    // featuredArtistIds intentionally unset: getFeaturedArtists then draws from
    // ALL artists matching the filters (picks + same-genre), not just the picks.
    sectionLabels: buildDynamicSectionLabels(fandomName),
  }
}

/** A long-pressable thing the user can center the Adaptive UI around. */
export type AdaptiveTarget =
  | { kind: 'artist'; artistId: string; name: string; imageUri?: string }
  | { kind: 'song'; song: Pick<Song, 'id' | 'artistId' | 'artistName' | 'albumArtPath' | 'albumArtColor'> }
  | { kind: 'playlist'; playlist: Pick<Playlist, 'id' | 'name' | 'coverArtPath'> }

type AdaptiveUIContextValue = {
  adaptiveEnabled: boolean
  activeTheme: AdaptiveTheme | null
  availableThemes: AdaptiveTheme[]
  blockedArtistIds: string[]
  setAdaptiveEnabled: (enabled: boolean) => void
  setActiveTheme: (themeId: string | null) => void
  removeArtistFromAdaptive: (artistId: string) => void
  addThemeFromAlbum: (song: Pick<Song, 'artistId' | 'artistName' | 'albumArtPath' | 'albumArtColor'>) => void
  makeAdaptiveAbout: (target: AdaptiveTarget) => void
  /** Build & activate a theme from a "create your own profile" selection. Returns the theme. */
  applyCustomTheme: (config: CustomThemeConfig) => AdaptiveTheme
  getSectionLabel: (key: keyof AdaptiveTheme['sectionLabels'], fallback: string) => string
  confirmationMessage: string | null
  /** Show a transient toast confirmation from anywhere (rendered once in the root layout). */
  showConfirmation: (message: string) => void
  clearConfirmation: () => void
}

const AdaptiveUIContext = createContext<AdaptiveUIContextValue | null>(null)

export function AdaptiveUIProvider({ children }: { children: ReactNode }) {
  const [adaptiveEnabled, setAdaptiveEnabledState] = useState(true)
  const [activeTheme, setActiveThemeState] = useState<AdaptiveTheme | null>(null)
  const [dynamicThemes, setDynamicThemes] = useState<AdaptiveTheme[]>([])
  const [blockedArtistIds, setBlockedArtistIds] = useState<string[]>([])
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null)

  const availableThemes = useMemo(() => {
    const blocked = new Set(blockedArtistIds)
    const predefined = PREDEFINED_THEMES.filter(t => {
      if (t.filterArtistIds?.every(id => blocked.has(id))) return false
      if (t.heroArtistId && blocked.has(t.heroArtistId)) return false
      return true
    })
    const dynamic = dynamicThemes.filter(t => !blocked.has(t.heroArtistId))
    return [...predefined, ...dynamic]
  }, [blockedArtistIds, dynamicThemes])

  const setAdaptiveEnabled = useCallback((enabled: boolean) => {
    setAdaptiveEnabledState(enabled)
    if (enabled) {
      setActiveThemeState(prev => {
        // Keep the current theme if it's still valid (user re-enabling).
        if (prev && !blockedArtistIds.includes(prev.heroArtistId)) return prev
        const themes = [...PREDEFINED_THEMES, ...dynamicThemes].filter(
          t => !blockedArtistIds.includes(t.heroArtistId),
        )
        // First enable: pick a theme that matches the time of day.
        return pickTimeAppropriateTheme(themes) ?? (themes.length > 0 ? pickRandomTheme(themes) : null)
      })
    } else {
      setActiveThemeState(null)
    }
  }, [blockedArtistIds, dynamicThemes])

  const setActiveTheme = useCallback((themeId: string | null) => {
    if (!themeId) {
      setActiveThemeState(null)
      return
    }
    const theme =
      PREDEFINED_THEMES.find(t => t.id === themeId) ??
      dynamicThemes.find(t => t.id === themeId) ??
      null
    if (theme && !blockedArtistIds.includes(theme.heroArtistId)) {
      setActiveThemeState(theme)
    }
  }, [blockedArtistIds, dynamicThemes])

  const removeArtistFromAdaptive = useCallback((artistId: string) => {
    setBlockedArtistIds(prev => (prev.includes(artistId) ? prev : [...prev, artistId]))
    setActiveThemeState(prev => (prev?.heroArtistId === artistId ? null : prev))
    const artist = artists.find(a => a.id === artistId)
    setConfirmationMessage(`${artist?.name ?? 'Artist'} removed from Adaptive UI`)
  }, [])

  const addThemeFromAlbum = useCallback((song: Pick<Song, 'artistId' | 'artistName' | 'albumArtPath' | 'albumArtColor'>) => {
    if (blockedArtistIds.includes(song.artistId)) return
    const theme = createThemeFromSong(song)
    setDynamicThemes(prev => {
      const without = prev.filter(t => t.id !== theme.id)
      return [...without, theme]
    })
    setActiveThemeState(theme)
  }, [blockedArtistIds])

  // Long-press entry point: build a theme from an artist / song / playlist, then
  // turn Adaptive UI on and center the home screen around it. Unblocks the target
  // artist if it had previously been removed — asking to center on it is consent.
  const makeAdaptiveAbout = useCallback((target: AdaptiveTarget) => {
    let theme: AdaptiveTheme
    let unblockId: string | null = null

    if (target.kind === 'artist') {
      unblockId = target.artistId
      theme =
        PREDEFINED_THEMES.find(t => t.heroArtistId === target.artistId) ??
        createThemeFromArtist({ id: target.artistId, name: target.name, imageUri: target.imageUri })
    } else if (target.kind === 'song') {
      unblockId = target.song.artistId
      theme = createThemeFromSong(target.song)
    } else {
      theme = createThemeFromPlaylist(target.playlist)
      unblockId = theme.heroArtistId || null
    }

    if (unblockId) {
      const id = unblockId
      setBlockedArtistIds(prev => prev.filter(bId => bId !== id))
    }
    if (theme.id.startsWith('dynamic-')) {
      setDynamicThemes(prev => [...prev.filter(t => t.id !== theme.id), theme])
    }
    setAdaptiveEnabledState(true)
    setActiveThemeState(theme)
    setConfirmationMessage(`Now adapting to ${theme.label}`)
  }, [])

  // "Create your own profile": build a theme from the user's picks, register it,
  // enable adaptive, and center the home on it immediately.
  const applyCustomTheme = useCallback((config: CustomThemeConfig): AdaptiveTheme => {
    const theme = createCustomTheme(config)
    setDynamicThemes(prev => [...prev.filter(t => t.id !== theme.id), theme])
    setAdaptiveEnabledState(true)
    setActiveThemeState(theme)
    return theme
  }, [])

  const getSectionLabel = useCallback(
    (key: keyof AdaptiveTheme['sectionLabels'], fallback: string) => {
      if (!adaptiveEnabled || !activeTheme) return fallback
      return activeTheme.sectionLabels[key] ?? fallback
    },
    [adaptiveEnabled, activeTheme],
  )

  const clearConfirmation = useCallback(() => setConfirmationMessage(null), [])
  const showConfirmation = useCallback((message: string) => setConfirmationMessage(message), [])

  const value = useMemo(
    () => ({
      adaptiveEnabled,
      activeTheme,
      availableThemes,
      blockedArtistIds,
      setAdaptiveEnabled,
      setActiveTheme,
      removeArtistFromAdaptive,
      addThemeFromAlbum,
      makeAdaptiveAbout,
      applyCustomTheme,
      getSectionLabel,
      confirmationMessage,
      showConfirmation,
      clearConfirmation,
    }),
    [
      adaptiveEnabled,
      activeTheme,
      availableThemes,
      blockedArtistIds,
      setAdaptiveEnabled,
      setActiveTheme,
      removeArtistFromAdaptive,
      addThemeFromAlbum,
      makeAdaptiveAbout,
      applyCustomTheme,
      getSectionLabel,
      confirmationMessage,
      showConfirmation,
      clearConfirmation,
    ],
  )

  return <AdaptiveUIContext.Provider value={value}>{children}</AdaptiveUIContext.Provider>
}

export function useAdaptiveUI(): AdaptiveUIContextValue {
  const ctx = useContext(AdaptiveUIContext)
  if (!ctx) throw new Error('useAdaptiveUI must be used within AdaptiveUIProvider')
  return ctx
}

export function isOliviaSuperFanTheme(theme: AdaptiveTheme | null): boolean {
  return theme?.id === 'olivia-rodrigo-superfan'
}

export { DEFAULT_SECTION_LABELS }
