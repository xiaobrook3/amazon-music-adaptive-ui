import { fanGroups, artists, type FanGroup } from './mockData'
import { albumArtAssets, artistAssets } from './assetMap'

export interface FanGroupPost {
  id: string
  handle: string
  time: string
  body: string
  artKey?: string
  likes: string
  comments: string
  /** Emoji shown on the reaction pill; falls back to a rotating default set
   *  (see REACTION_EMOJI in the fan-group screen) when omitted. */
  reactionEmoji?: string
}

const POSTS: Record<string, FanGroupPost[]> = {
  fg1: [
    {
      id: 'p1',
      handle: '@armyforlife',
      time: '3 days ago',
      body: 'Six years in and every comeback still feels like the first. This is the group that got me through everything.',
      artKey: 'bts-young-forever',
      likes: '3.4k',
      comments: '212',
    },
    {
      id: 'p2',
      handle: '@mikrokosmos',
      time: '1 week ago',
      body: 'Just rewatched the Map of the Soul tour film. The energy in those stadiums is unmatched.',
      artKey: 'bts-map-of-soul-7',
      likes: '1.8k',
      comments: '94',
    },
    {
      id: 'p3',
      handle: '@purpleocean',
      time: '2 weeks ago',
      body: 'Who else has Proof on repeat? The anthology tracks hit different when you know the whole journey.',
      artKey: 'bts-proof',
      likes: '2.1k',
      comments: '156',
    },
  ],
  fg2: [
    {
      id: 'p1',
      handle: '@swiftie_since_08',
      time: '1 day ago',
      body: 'The vault tracks on 1989 TV changed my life. Taylor really said "here, take the whole diary."',
      artKey: 'ts-1989',
      likes: '4.2k',
      comments: '318',
    },
    {
      id: 'p2',
      handle: '@midnightsowl',
      time: '4 days ago',
      body: 'Eras Tour setlist ranking thread — go! Mine starts with Getaway Car and ends in tears.',
      artKey: 'ts-showgirl',
      likes: '2.9k',
      comments: '445',
    },
    {
      id: 'p3',
      handle: '@folklore_forever',
      time: '1 week ago',
      body: 'Cardigan on a rainy Sunday is still the most perfect song ever written. No notes.',
      artKey: 'ts-tortured-poets',
      likes: '1.5k',
      comments: '87',
    },
  ],
  fg3: [
    {
      id: 'p1',
      handle: '@blink4ever',
      time: '2 days ago',
      body: 'Pink Venom at midnight release party was insane. BLINKs really know how to show up.',
      artKey: 'blackpink',
      likes: '2.7k',
      comments: '201',
    },
    {
      id: 'p2',
      handle: '@jennie_bias',
      time: '5 days ago',
      body: 'Made a BORN PINK workout playlist — drop your track order below!',
      likes: '980',
      comments: '63',
    },
  ],
  fg4: [
    {
      id: 'p1',
      handle: '@melodrama_mood',
      time: '3 days ago',
      body: 'Melodrama is the album that made me feel less alone in my twenties. Lorde gets it.',
      artKey: 'lorde-melodrama',
      likes: '890',
      comments: '52',
    },
    {
      id: 'p2',
      handle: '@pure_heroine',
      time: '1 week ago',
      body: 'Ribs on vinyl hits different. The crackle between verses is chef\'s kiss.',
      artKey: 'lorde-pure-heroine',
      likes: '640',
      comments: '41',
    },
  ],
  fg5: [
    {
      id: 'p1',
      handle: '@dukat_daily',
      time: '2 days ago',
      body: 'Found Dukat through a late-night recommendation and now it\'s on every road trip playlist.',
      artKey: 'bana-zahiti',
      likes: '124',
      comments: '18',
    },
    {
      id: 'p2',
      handle: '@small_artist_hype',
      time: '6 days ago',
      body: 'This group exists to boost artists who deserve a bigger stage. Share your discoveries!',
      likes: '76',
      comments: '12',
    },
  ],
  // Hannah Journey fan-group cards (additive) — posts for the three groups
  // added to `fanGroups` in mockData.ts above.
  'fg-hj-olivia': [
    {
      id: 'p1',
      handle: '@livielover',
      time: '2 days ago',
      body: "Whats your fav song from her new album",
      artKey: 'olivia-rodrigo-guts',
      likes: '612',
      comments: '48',
      reactionEmoji: '🤘',
    },
    {
      id: 'p2',
      handle: '@sourpatch',
      time: '5 days ago',
      body: 'vampire live was actually unreal, the scream at the bridge gave me chills',
      artKey: 'olivia-rodrigo-sour',
      likes: '390',
      comments: '22',
      reactionEmoji: '❤️',
    },
  ],
  'fg-hj-swifties': [
    {
      id: 'p1',
      handle: '@midnightsowl',
      time: '1 day ago',
      body: 'If you had to tattoo a taylor swift song, what lyric would you pick',
      artKey: 'ts-1989',
      likes: '1.1k',
      comments: '431',
    },
    {
      id: 'p2',
      handle: '@erastourvault',
      time: '4 days ago',
      body: 'The Life of a Showgirl on repeat all week, no notes.',
      artKey: 'ts-showgirl-life',
      likes: '780',
      comments: '96',
    },
  ],
  'fg-hj-arianators': [
    {
      id: 'p1',
      handle: '@thankunext4ever',
      time: '3 days ago',
      body: 'What song did the tour make you appreciate more after seeing it live?',
      artKey: 'ariana-sweetener',
      likes: '540',
      comments: '38',
    },
    {
      id: 'p2',
      handle: '@sweetener_szn',
      time: '1 week ago',
      body: 'no tears left to cry still goes off in every setlist, that whistle note lives rent free',
      artKey: 'ariana-sweetener',
      likes: '410',
      comments: '29',
    },
  ],
}

export function findFanGroup(id: string): FanGroup | undefined {
  return fanGroups.find(g => g.id === id)
}

export function resolveFanGroupArtistId(group: FanGroup): string | null {
  return group.artistId ?? (group.name.includes('BTS') ? 'bts' : null)
}

export function resolveFanGroupArt(group: FanGroup) {
  if (group.coverArtPath) return albumArtAssets[group.coverArtPath] ?? null
  const artistId = resolveFanGroupArtistId(group)
  return artistId ? artistAssets[artistId] ?? null : null
}

export function getFanGroupArtistName(group: FanGroup): string | null {
  const artistId = resolveFanGroupArtistId(group)
  if (!artistId) return null
  return artists.find(a => a.id === artistId)?.name ?? null
}

export function formatMemberCount(count: number): string {
  if (count >= 1000) {
    const k = count / 1000
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k members`
  }
  return `${count.toLocaleString()} members`
}

export function findFanGroupForArtist(artistId: string): FanGroup | undefined {
  return fanGroups.find(g => g.artistId === artistId)
    ?? (artistId === 'bts' ? fanGroups.find(g => g.id === 'fg1') : undefined)
}

export function getFanGroupPosts(groupId: string): FanGroupPost[] {
  return POSTS[groupId] ?? []
}

export function resolvePostArt(key?: string) {
  if (!key) return null
  return albumArtAssets[key] ?? artistAssets[key] ?? null
}
