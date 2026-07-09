// Richer "About" tab content, in the spirit of the Olivia reference page
// (src/components/artist/OliviaAboutTab.tsx) but intentionally lighter — a
// story card, a key-releases rail, a couple of interview videos, and one fan
// post. Only a handful of artists get this; everyone else falls back to the
// simple bio + chips in ArtistJourneyScreen. All imagery reuses existing album
// art / artist photos (see assetMap), so there are no new assets to add.

export interface AboutRelease {
  title: string
  subtitle: string
  artKey: string
}

export interface AboutVideo {
  id: string
  title: string
  duration: string
  artKey: string
}

export interface AboutFanPost {
  group: string
  handle: string
  time: string
  body: string
  artKey: string
  likes: string
  comments: string
}

export interface AboutInfluence {
  /** Display name. */
  name: string
  /** Avatar key — an artistId (artistAssets) or album-art key (albumArtAssets). */
  artKey: string
}

export interface AboutEvent {
  month: string
  day: string
  title: string
  venue: string
  time: string
}

export interface ArtistAboutData {
  bannerText?: string
  eraLabel: string
  storyArtKey: string
  storyBody: string
  releasesTitle?: string
  releases?: AboutRelease[]
  videos?: AboutVideo[]
  fanPost?: AboutFanPost
  /** Suggested prompts shown under the "Ask Alexa" bar. */
  askChips?: string[]
  influencedBy?: AboutInfluence[]
  inspires?: AboutInfluence[]
  events?: AboutEvent[]
}

const ABOUT: Record<string, ArtistAboutData> = {
  bts: {
    bannerText: "Deeper because you've followed since 2019 — new fans see a shorter version.",
    eraLabel: 'THE ERA · 2013 – NOW',
    storyArtKey: 'bts-group',
    storyBody:
      'From a small Seoul label to sold-out stadiums on every continent, BTS turned genre-blending pop and a fiercely devoted ARMY into a global movement — here is how seven members rewrote what a group could be.',
    releasesTitle: 'Albums that defined the era',
    releases: [
      { title: 'Map of the Soul: 7', subtitle: '2020', artKey: 'bts-map-of-soul-7' },
      { title: 'BE', subtitle: '2020', artKey: 'bts-be' },
      { title: 'Proof', subtitle: '2022', artKey: 'bts-proof' },
      { title: 'Love Yourself: Answer', subtitle: '2018', artKey: 'bts-love-yourself' },
    ],
    videos: [
      { id: 'v1', title: 'Inside the making of Proof', duration: '9:24', artKey: 'bts-proof-door' },
      { id: 'v2', title: 'BTS on Dynamite, in their words', duration: '5:03', artKey: 'bts-dynamite' },
    ],
    fanPost: {
      group: 'Borahae Hours',
      handle: '@armyforlife',
      time: '3 days ago',
      body: 'Six years in and every comeback still feels like the first. This is the group that got me through everything.',
      artKey: 'bts-young-forever',
      likes: '3.4k',
      comments: '212',
    },
    events: [
      { month: 'OCT', day: '11', title: 'BTS World Tour', venue: 'Olympic Stadium · Seoul', time: 'Sat, Oct 11 · 6:30 PM' },
    ],
  },

  tswift: {
    bannerText: "Deeper because you've listened for years — new fans see a shorter version.",
    eraLabel: 'THE ERA · 2006 – NOW',
    storyArtKey: 'ts-1989-polaroid',
    storyBody:
      'From a Nashville country debut to genre-hopping pop dominance and the record-shattering re-recordings, Taylor turned diary-entry songwriting into the defining catalogue of a generation — eleven studio albums, four genre pivots, and a decade of Eras that made her the best-selling artist of the 21st century.',
    releasesTitle: 'Albums that defined the era',
    releases: [
      { title: 'Taylor Swift', subtitle: '2006', artKey: 'tswift-1' },
      { title: 'Fearless', subtitle: '2008', artKey: 'tswift-1' },
      { title: 'Speak Now', subtitle: '2010', artKey: 'tswift-1' },
      { title: 'Red', subtitle: '2012', artKey: 'tswift-1' },
      { title: '1989', subtitle: '2014', artKey: 'ts-1989' },
      { title: 'reputation', subtitle: '2017', artKey: 'ts-reputation' },
      { title: 'Lover', subtitle: '2019', artKey: 'ts-lover' },
      { title: 'folklore', subtitle: '2020', artKey: 'ts-1989-polaroid' },
      { title: 'evermore', subtitle: '2020', artKey: 'ts-1989-polaroid' },
      { title: 'Midnights', subtitle: '2022', artKey: 'ts-tortured-poets' },
      { title: 'The Tortured Poets Department', subtitle: '2024', artKey: 'ts-tortured-poets' },
      { title: 'The Life of a Showgirl', subtitle: '2025', artKey: 'ts-showgirl' },
    ],
    videos: [
      { id: 'v1', title: 'The making of 1989', duration: '6:47', artKey: 'ts-1989' },
      { id: 'v2', title: 'Taylor on the re-recordings', duration: '7:12', artKey: 'ts-reputation' },
      { id: 'v3', title: 'folklore: the long pond studio sessions', duration: '8:05', artKey: 'ts-1989-polaroid' },
      { id: 'v4', title: 'Midnights, deconstructed', duration: '6:22', artKey: 'ts-tortured-poets' },
    ],
    fanPost: {
      group: 'Swifties Only',
      handle: '@alltoowell13',
      time: '1 day ago',
      body: 'Ranking the eras is impossible but I tried anyway. The bridge on All Too Well still makes me cry every single time and folklore hit different at 2am.',
      artKey: 'ts-lover',
      likes: '5.1k',
      comments: '437',
    },
    askChips: ['What is the best era to start with?', 'What makes folklore special?', 'All Too Well 10 min version?'],
    influencedBy: [
      { name: 'Carole King', artKey: 'carole-king-tapestry' },
      { name: 'Joni Mitchell', artKey: 'ts-1989-polaroid' },
      { name: 'Fleetwood Mac', artKey: 'fleetwood-rumours' },
    ],
    inspires: [
      { name: 'Olivia Rodrigo', artKey: 'olivia-rodrigo' },
      { name: 'Sabrina Carpenter', artKey: 'sabrina-short-n-sweet' },
      { name: 'Gracie Abrams', artKey: 'ts-tortured-poets' },
    ],
    events: [
      { month: 'AUG', day: '22', title: 'The Eras Tour', venue: 'SoFi Stadium · Los Angeles', time: 'Fri, Aug 22 · 7:00 PM' },
      { month: 'AUG', day: '24', title: 'The Eras Tour', venue: 'SoFi Stadium · Los Angeles', time: 'Sun, Aug 24 · 7:00 PM' },
      { month: 'SEP', day: '06', title: 'The Eras Tour', venue: 'MetLife Stadium · New Jersey', time: 'Sat, Sep 6 · 7:30 PM' },
    ],
  },

  lorde: {
    bannerText: "Deeper because you've followed since Pure Heroine — new fans see a shorter version.",
    eraLabel: 'THE ERA · 2013 – NOW',
    storyArtKey: 'lorde-melodrama',
    storyBody:
      'From a teenage debut that made minimalism sound enormous to the widescreen heartbreak of Melodrama and the sunlit reset that followed, Lorde built a decade of pop on her own quiet, uncompromising terms.',
    releasesTitle: 'Albums that defined the era',
    releases: [
      { title: 'Pure Heroine', subtitle: '2013', artKey: 'lorde-pure-heroine' },
      { title: 'Melodrama', subtitle: '2017', artKey: 'lorde-melodrama' },
      { title: 'Virgin', subtitle: '2025', artKey: 'lorde-virgin' },
    ],
    videos: [
      { id: 'v1', title: 'Lorde on writing Melodrama', duration: '5:38', artKey: 'lorde-melodrama' },
      { id: 'v2', title: 'Green Light, deconstructed', duration: '4:09', artKey: 'lorde-yellow-flicker' },
    ],
    fanPost: {
      group: 'Melodrama Nation',
      handle: '@royalsx',
      time: '4 days ago',
      body: 'No one builds a bridge like she does. Ten years later and Pure Heroine still sounds like the future.',
      artKey: 'lorde-pure-heroine',
      likes: '2.2k',
      comments: '118',
    },
    askChips: ['What defines Melodrama?', 'Best deep cut?', 'Who has she inspired?'],
    influencedBy: [
      { name: 'Kate Bush', artKey: 'kate-bush' },
      { name: 'David Bowie', artKey: 'roxy-music' },
    ],
    inspires: [
      { name: 'Olivia Rodrigo', artKey: 'olivia-rodrigo' },
      { name: 'Billie Eilish', artKey: 'billie-eilish' },
    ],
  },

  beyonce: {
    bannerText: "Deeper because you've streamed her for years — new fans see a shorter version.",
    eraLabel: 'THE ERA · 2003 – NOW',
    storyArtKey: 'beyonce-lemonade',
    storyBody:
      'From Destiny\'s Child breakout to a solo run that reinvented the visual album and turned every release into a cultural event, Beyoncé built a body of work — Lemonade, Renaissance, and beyond — that keeps redefining what a pop icon can be.',
    askChips: ['What makes Lemonade so loved?', 'Best era to start with?', 'Who has she inspired?'],
    influencedBy: [
      { name: 'Whitney Houston', artKey: 'whitney-houston' },
      { name: 'Janet Jackson', artKey: 'janet-jackson' },
      { name: 'Prince', artKey: 'prince' },
    ],
    inspires: [
      { name: 'SZA', artKey: 'sza' },
      { name: 'Rihanna', artKey: 'rihanna' },
      { name: 'Doja Cat', artKey: 'doja-cat' },
    ],
    fanPost: {
      group: 'The BeyHive',
      handle: '@lemonade4life',
      time: '2 days ago',
      body: 'Every album is a whole world. Lemonade still feels like the moment everything changed.',
      artKey: 'beyonce-self-titled',
      likes: '6.8k',
      comments: '521',
    },
    events: [
      { month: 'JUL', day: '19', title: 'Renaissance World Tour', venue: 'MetLife Stadium · New Jersey', time: 'Sat, Jul 19 · 8:00 PM' },
    ],
  },

  'bad-bunny': {
    eraLabel: 'THE ERA · 2016 – NOW',
    storyArtKey: 'bad-bunny-verano',
    storyBody:
      'Bad Bunny took reggaeton and Latin trap from the clubs of Puerto Rico to the top of global charts without ever switching to English — Un Verano Sin Ti made a whole summer feel like one endless beach playlist.',
    askChips: ['Why is Un Verano so big?', 'Best track to start with?', 'What genre is this?'],
    influencedBy: [{ name: 'Daddy Yankee', artKey: 'bad-bunny-verano' }],
    inspires: [{ name: 'Rosalía', artKey: 'rosalia' }],
    fanPost: {
      group: 'Conejo Malo Club',
      handle: '@veranosinti',
      time: '5 days ago',
      body: 'Put this album on and it is instantly summer, no matter what month it is.',
      artKey: 'bad-bunny-verano',
      likes: '4.1k',
      comments: '287',
    },
  },

  sza: {
    eraLabel: 'THE ERA · 2017 – NOW',
    storyArtKey: 'sza-sos',
    storyBody:
      'SZA turned diaristic, genre-blurring R&B into some of the most quietly influential music of the decade — Ctrl and SOS made vulnerability sound effortless and made her the voice a whole generation reaches for after midnight.',
    askChips: ['What makes SOS special?', 'Best late-night track?', 'Who inspired her sound?'],
    influencedBy: [
      { name: 'Lauryn Hill', artKey: 'sza-sos' },
      { name: 'Beyoncé', artKey: 'beyonce' },
    ],
    inspires: [{ name: 'Tate McRae', artKey: 'tate-mcrae' }],
    fanPost: {
      group: 'CTRL Room',
      handle: '@snoozeon',
      time: '1 day ago',
      body: 'Nobody writes a feeling like she does. "Snooze" has not left my rotation in months.',
      artKey: 'sza-sos',
      likes: '3.9k',
      comments: '244',
    },
  },

  'justin-bieber': {
    bannerText: "Deeper because you've been a Belieber — new fans see a shorter version.",
    eraLabel: 'THE ERA · 2009 – NOW',
    storyArtKey: 'justin-bieber-believe',
    storyBody:
      'Discovered on YouTube at 13, signed by Usher, and turned into a global phenomenon before he finished high school — Justin Bieber grew up in public, broke streaming records, found faith, and built a catalog that spans bubblegum pop, R&B, and gospel across seven albums.',
    releasesTitle: 'Albums that defined the era',
    releases: [
      { title: 'My World', subtitle: '2009', artKey: 'justin-bieber-my-worlds' },
      { title: 'My World 2.0', subtitle: '2010', artKey: 'justin-bieber-my-worlds' },
      { title: 'Believe', subtitle: '2012', artKey: 'justin-bieber-believe' },
      { title: 'Purpose', subtitle: '2015', artKey: 'justin-bieber-believe' },
      { title: 'Changes', subtitle: '2020', artKey: 'justin-bieber-believe' },
      { title: 'Justice', subtitle: '2021', artKey: 'justin-bieber-believe' },
    ],
    videos: [
      { id: 'v1', title: 'Justin on Purpose, faith & growing up', duration: '8:14', artKey: 'justin-bieber-believe' },
      { id: 'v2', title: 'Never Say Never: the film revisited', duration: '5:30', artKey: 'justin-bieber-my-worlds' },
    ],
    fanPost: {
      group: 'Beliebers',
      handle: '@bieberforever',
      time: '2 days ago',
      body: "Baby was THE song of 2010 and Peaches is the vibe of 2021. He just keeps reinventing himself and it works every single time.",
      artKey: 'justin-bieber-believe',
      likes: '4.2k',
      comments: '318',
    },
    askChips: ['What is Purpose about?', 'Best Bieber deep cut?', 'How did it all start?'],
    influencedBy: [
      { name: 'Usher', artKey: 'justin-bieber-believe' },
      { name: 'Michael Jackson', artKey: 'the-weeknd' },
    ],
    inspires: [
      { name: 'Shawn Mendes', artKey: 'justin-bieber-my-worlds' },
      { name: 'Conan Gray', artKey: 'justin-bieber-my-worlds' },
    ],
    events: [
      { month: 'OCT', day: '14', title: 'Justice World Tour', venue: 'Madison Square Garden · New York', time: 'Tue, Oct 14 · 7:30 PM' },
    ],
  },

  'the-weeknd': {
    eraLabel: 'THE ERA · 2011 – NOW',
    storyArtKey: 'the-weeknd',
    storyBody:
      'From the shadowy mixtapes that reinvented alt-R&B to the neon synth-pop of After Hours and Dawn FM, The Weeknd turned late-night melancholy into stadium-sized pop without ever losing the darkness at its center.',
    askChips: ['Why is After Hours iconic?', 'Best song to start with?', 'What is the Dawn FM story?'],
    influencedBy: [{ name: 'Michael Jackson', artKey: 'the-weeknd' }],
    inspires: [{ name: 'Dua Lipa', artKey: 'dua-lipa' }],
    fanPost: {
      group: 'XO Til We Overdose',
      handle: '@afterhours',
      time: '3 days ago',
      body: 'The whole After Hours run still feels like driving through a city at 3am. Perfect record.',
      artKey: 'the-weeknd',
      likes: '5.5k',
      comments: '398',
    },
  },

  'dua-lipa': {
    eraLabel: 'THE ERA · 2017 – NOW',
    storyArtKey: 'dua-lipa',
    storyBody:
      'Dua Lipa made disco cool again — Future Nostalgia arrived exactly when the world needed a dancefloor, turning tight, retro-leaning pop into one of the defining sounds of the era.',
    askChips: ['Why did Future Nostalgia hit?', 'Best song to dance to?', 'Who inspired her?'],
    influencedBy: [{ name: 'Madonna', artKey: 'madonna' }],
    inspires: [{ name: 'Zara Larsson', artKey: 'zara-larsson' }],
    fanPost: {
      group: 'Future Nostalgia',
      handle: '@levitating',
      time: '4 days ago',
      body: 'This album single-handedly got me through lockdown. Still an instant serotonin boost.',
      artKey: 'dua-lipa',
      likes: '3.2k',
      comments: '176',
    },
  },

  rihanna: {
    eraLabel: 'THE ERA · 2005 – NOW',
    storyArtKey: 'rihanna-anti',
    storyBody:
      'Across eight albums Rihanna moved from radio hit-maker to genre-fluid icon, and ANTI — patient, moody, and completely her own — proved she could walk away from the pop formula and still own the whole conversation.',
    askChips: ['Why is ANTI so beloved?', 'Best deep cut?', 'Who has she inspired?'],
    influencedBy: [{ name: 'Beyoncé', artKey: 'beyonce' }],
    inspires: [{ name: 'Doja Cat', artKey: 'doja-cat' }],
    fanPost: {
      group: 'Rihanna Navy',
      handle: '@workwork',
      time: '6 days ago',
      body: 'ANTI is the one that gets better every year. We do not deserve a re-run, we deserve R9.',
      artKey: 'rihanna-anti',
      likes: '7.2k',
      comments: '612',
    },
  },
}

/** Artists that have a hand-authored, richer About tab. */
export const ARTISTS_WITH_ABOUT = Object.keys(ABOUT)

export function getArtistAbout(artistId: string): ArtistAboutData | null {
  return ABOUT[artistId] ?? null
}
