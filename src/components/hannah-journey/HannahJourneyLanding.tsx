import { useEffect, useCallback, useMemo, useRef } from 'react'
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Text as SvgText } from 'react-native-svg'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '../AppText'
import { AppImage as Image } from '../AppImage'
import SuperfanHeartBadge from '../SuperfanHeartBadge'
import StickyHomeHeader, { useStickyHomeScroll } from '../StickyHomeHeader'
import EdgeFadeRow from '../EdgeFadeRow'
import { ListeningHeatmap } from '../home/HomeSessionWidgets'
import SuperfanRevealPopup from './SuperfanRevealPopup'
import { useHannahJourney, type HannahJourneyStage } from '../../context/HannahJourneyContext'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import {
  albumArtAssets,
  artistAssets,
  hannahJourneyAssets,
  oliviaPageAssets,
  resolveArtistAvatar,
} from '../../data/assetMap'
import { songs, artists } from '../../data/mockData'
import { C, FONT_FAMILY_DISPLAY, FONT_FAMILY_EMBER } from '../../theme'

const HERO_NL = require('../../../assets/hannah-journey/landing-newlistener-hero.jpeg')
const HERO_ENGAGED = require('../../../assets/hannah-journey/landing-engaged-asset-01.jpeg')
const HERO_SUPERFAN = require('../../../assets/hannah-journey/landing-superfan-hero.png')

const SCREEN_W = Platform.OS === 'web' ? Math.min(Dimensions.get('window').width, 402) : Dimensions.get('window').width

type SongRow = { title: string; artist: string; plays: string; artKey: string; songId?: string; artistId?: string }
type ContinueItem = { title: string; meta: string; artKey: string; href?: string; songId?: string }
type FavoriteCard = {
  artistId: string
  name: string
  tag: string
  caption: string
  seed: number
  showHeart?: boolean
}
type FanGroup = {
  eyebrow: string
  eyebrowGradient?: boolean
  title: string
  members: string
  accentMembers?: string
  quote: string
  comments: string
  artKey: string
  cta?: 'join' | 'arrow'
  /** Real fanGroups[].id (src/data/mockData.ts) — tapping the card opens /fan-group/[groupId]. */
  groupId: string
}
type TopArtist = { artistId: string; name: string; heart?: boolean }
// Olivia's own "Albums for you" entries navigate to the album page (albumId).
// Other artists' entries don't have a dedicated album page in this app, so
// they navigate to that artist's own page instead — same destination as the
// "Your Top Artists" rail above, and the closest equivalent to "open this
// artist's music" for an album we don't have a standalone page for.
type AlbumCard = { title: string; artist: string; artKey: string; albumId?: string; artistId?: string }

type StageLanding = {
  heroArt: number
  heroSub: string
  songs: SongRow[]
  continueListening: ContinueItem[]
  favorites: FavoriteCard[]
  fanGroups: FanGroup[]
  topArtists: TopArtist[]
  albums: AlbumCard[]
}

const STAGE_DATA: Record<HannahJourneyStage, StageLanding> = {
  'new-listener': {
    heroArt: HERO_NL,
    heroSub: 'Starting with Taylor Swift, Ariana Grande, and Sabrina Carpenter',
    songs: [
      { title: 'The Fate of Ophelia', artist: 'Taylor Swift', plays: '531,982,153', artKey: 'ts-showgirl-life', songId: 's-ts-showgirl-01', artistId: 'tswift' },
      { title: 'Blank Space', artist: 'Taylor Swift', plays: '1,488,123,456', artKey: 'ts-1989', songId: 's-ts1989', artistId: 'tswift' },
      { title: 'drivers license', artist: 'Olivia Rodrigo', plays: '1,340,229,004', artKey: 'olivia-rodrigo-sour', songId: 's-or1', artistId: 'olivia-rodrigo' },
      { title: 'hate that i made you love me', artist: 'Ariana Grande', plays: '123,456,789', artKey: 'ariana-grande', artistId: 'ariana-grande' },
      { title: 'Cruel Summer', artist: 'Taylor Swift', plays: '1,204,553,671', artKey: 'ts-lover', songId: 's11', artistId: 'tswift' },
      { title: 'Look What You Made Me Do', artist: 'Taylor Swift', plays: '987,340,221', artKey: 'ts-reputation', songId: 's10', artistId: 'tswift' },
      { title: 'God is a Woman', artist: 'Ariana Grande', plays: '456,112,890', artKey: 'ariana-sweetener', songId: 's-ariana1', artistId: 'ariana-grande' },
      { title: 'no tears left to cry', artist: 'Ariana Grande', plays: '812,004,556', artKey: 'ariana-sweetener', songId: 's-ariana5', artistId: 'ariana-grande' },
      { title: 'Espresso', artist: 'Sabrina Carpenter', plays: '703,221,410', artKey: 'sabrina-espresso', songId: 's-sabrina1', artistId: 'sabrina-carpenter' },
      { title: 'Please Please Please', artist: 'Sabrina Carpenter', plays: '389,776,004', artKey: 'sabrina-short-n-sweet', songId: 's-sabrina2', artistId: 'sabrina-carpenter' },
    ],
    continueListening: [
      { title: 'The Life of a Showgirl', meta: 'Album • Taylor Swift', artKey: 'ts-showgirl-life', href: '/album/ts-showgirl-2025' },
      { title: 'The ARMY Diaries', meta: 'Podcast • BTS ARMY', artKey: 'bts', href: '/podcast-show/pod1' },
      { title: 'Dukat', meta: 'Album • Bana Zahiti', artKey: 'bana-zahiti', href: '/album/song-album-s-bz1' },
      { title: 'The Olivia Podcast', meta: 'Episode • Livies Club', artKey: 'olivia-rodrigo-sour', href: '/artist/olivia-rodrigo' },
    ],
    favorites: [
      { artistId: 'tswift', name: 'Taylor Swift', tag: 'SUPERFAN', caption: 'Your morning starter.\n3 days running.', seed: 1, showHeart: true },
      { artistId: 'sza', name: 'SZA', tag: 'NEW CRUSH', caption: 'Three songs, on repeat.', seed: 3 },
      { artistId: 'olivia-rodrigo', name: 'Olivia Rodrigo', tag: 'IN ROTATION', caption: 'Just getting started.', seed: 2 },
      { artistId: 'bts', name: 'BTS', tag: 'IN ROTATION', caption: 'You came back this week.', seed: 4 },
    ],
    fanGroups: [
      {
        eyebrow: 'Calling All Swifties',
        eyebrowGradient: true,
        title: 'Swiftyyyyysss',
        members: '550 members • ',
        accentMembers: '230 superfans',
        quote: 'If you had to tattoo a taylor swift song, what lyric would',
        comments: '431',
        artKey: 'tswift',
        cta: 'arrow',
        groupId: 'fg-hj-swifties',
      },
      {
        eyebrow: 'Your New Obsession',
        title: 'arianators',
        members: '213 members • ',
        accentMembers: '64 active',
        quote: 'What song did the tour make you appreciate more after seeing it live?',
        comments: '38',
        artKey: 'ariana-grande',
        cta: 'arrow',
        groupId: 'fg-hj-arianators',
      },
    ],
    topArtists: [
      { artistId: 'tswift', name: 'Taylor Swift', heart: true },
      { artistId: 'sabrina-carpenter', name: 'Sabrina Carpenter' },
      { artistId: 'tate-mcrae', name: 'Tate McRae' },
      { artistId: 'justin-bieber', name: 'Justin Bieber' },
      { artistId: 'lorde', name: 'Lorde' },
    ],
    albums: [
      { title: 'eternal sunshine', artist: 'Ariana Grande', artKey: 'ariana-eternal-sunshine', albumId: 'ariana-eternal-sunshine-2024' },
      { title: 'My World 2.0', artist: 'Justin Bieber', artKey: 'justin-bieber-my-world-2', albumId: 'jb-my-world-2-2010' },
      { title: '1989', artist: 'Taylor Swift', artKey: 'ts-1989', albumId: 'ts-1989-2014' },
      { title: "Short n' Sweet", artist: 'Sabrina Carpenter', artKey: 'sabrina-short-n-sweet', albumId: 'sabrina-short-n-sweet-2024' },
      { title: 'The Life of a Showgirl', artist: 'Taylor Swift', artKey: 'ts-showgirl-life', albumId: 'ts-showgirl-2025' },
      { title: 'Sweetener', artist: 'Ariana Grande', artKey: 'ariana-sweetener', albumId: 'ariana-sweetener-2018' },
    ],
  },
  engaged: {
    heroArt: HERO_ENGAGED,
    heroSub: 'Starting with Taylor Swift, Olivia Rodrigo, and Justin Bieber',
    songs: [
      { title: 'Wildest Dreams', artist: 'Taylor Swift', plays: '142,123,456', artKey: 'ts-1989', artistId: 'tswift' },
      { title: 'get him back!', artist: 'Olivia Rodrigo', plays: '241,246,222', artKey: 'olivia-rodrigo-guts', songId: 's-or5', artistId: 'olivia-rodrigo' },
      { title: 'vampire', artist: 'Olivia Rodrigo', plays: '894,162,517', artKey: 'olivia-rodrigo-guts', songId: 's-or4', artistId: 'olivia-rodrigo' },
      { title: 'cardigan', artist: 'Taylor Swift', plays: '612,882,190', artKey: 'tswift', songId: 's-ts-folk-01', artistId: 'tswift' },
      { title: 'Cruel Summer', artist: 'Taylor Swift', plays: '1,204,553,671', artKey: 'ts-lover', songId: 's11', artistId: 'tswift' },
      { title: 'drivers license', artist: 'Olivia Rodrigo', plays: '1,340,229,004', artKey: 'olivia-rodrigo-sour', songId: 's-or1', artistId: 'olivia-rodrigo' },
      { title: 'good 4 u', artist: 'Olivia Rodrigo', plays: '1,102,447,663', artKey: 'olivia-rodrigo-sour', songId: 's-or2', artistId: 'olivia-rodrigo' },
      { title: 'making the bed', artist: 'Olivia Rodrigo', plays: '213,556,780', artKey: 'olivia-rodrigo-making-the-bed', songId: 's-or6', artistId: 'olivia-rodrigo' },
      { title: 'lacy', artist: 'Olivia Rodrigo', plays: '298,114,022', artKey: 'olivia-rodrigo-guts', songId: 's-or11', artistId: 'olivia-rodrigo' },
    ],
    continueListening: [
      { title: 'The ARMY Diaries', meta: 'Podcast • BTS ARMY', artKey: 'bts', href: '/podcast-show/pod1' },
      { title: 'SOUR', meta: 'Album • Olivia Rodrigo', artKey: 'olivia-rodrigo-sour', href: '/album/sour-2021' },
      { title: 'The Life of a Showgirl', meta: 'Album • Taylor Swift', artKey: 'ts-showgirl-life', href: '/album/ts-showgirl-2025' },
      { title: 'The Olivia Podcast', meta: 'Episode • Livies Club', artKey: 'olivia-rodrigo-sour', href: '/artist/olivia-rodrigo' },
      { title: 'Dukat', meta: 'Album • Bana Zahiti', artKey: 'bana-zahiti', href: '/album/song-album-s-bz1' },
    ],
    favorites: [
      { artistId: 'tswift', name: 'Taylor Swift', tag: 'SUPERFAN', caption: 'Your morning starter.\nA week running.', seed: 1, showHeart: true },
      { artistId: 'olivia-rodrigo', name: 'Olivia Rodrigo', tag: 'NEW CRUSH', caption: 'Eight songs on repeat every evening.', seed: 5 },
      { artistId: 'sza', name: 'SZA', tag: 'NEW CRUSH', caption: 'Seven songs, on repeat.', seed: 3 },
      { artistId: 'bts', name: 'BTS', tag: 'IN ROTATION', caption: 'You came back this week.', seed: 4 },
    ],
    fanGroups: [
      {
        eyebrow: 'Based On Your Recent Listen',
        title: 'Olivia rodrigo fans!!!',
        members: '213 members',
        quote: 'Whats your fav song from her new album',
        comments: '48',
        artKey: 'olivia-rodrigo',
        cta: 'join',
        groupId: 'fg-hj-olivia',
      },
      {
        eyebrow: 'Calling All Swifties',
        eyebrowGradient: true,
        title: 'Swiftyyyyysss',
        members: '550 members • ',
        accentMembers: '230 superfans',
        quote: 'If you had to tattoo a taylor swift song, what lyric would',
        comments: '431',
        artKey: 'tswift',
        cta: 'arrow',
        groupId: 'fg-hj-swifties',
      },
      {
        eyebrow: 'Your New Obsession',
        title: 'arianators',
        members: '213 members • ',
        accentMembers: '64 active',
        quote: 'What song did the tour make you appreciate more after seeing it live?',
        comments: '38',
        artKey: 'ariana-grande',
        cta: 'arrow',
        groupId: 'fg-hj-arianators',
      },
    ],
    topArtists: [
      { artistId: 'tswift', name: 'Taylor Swift', heart: true },
      { artistId: 'sabrina-carpenter', name: 'Sabrina Carpenter' },
      { artistId: 'olivia-rodrigo', name: 'Olivia Rodrigo' },
      { artistId: 'justin-bieber', name: 'Justin Bieber' },
      { artistId: 'lorde', name: 'Lorde' },
    ],
    albums: [
      { title: 'you seem pretty sad for a girl so in love', artist: 'Olivia Rodrigo', artKey: 'olivia-rodrigo-pretty-sad', albumId: 'or-album-pretty' },
      { title: '1989', artist: 'Taylor Swift', artKey: 'ts-1989', albumId: 'ts-1989-2014' },
      { title: 'SOUR', artist: 'Olivia Rodrigo', artKey: 'olivia-rodrigo-sour', albumId: 'sour-2021' },
      { title: 'The Life of a Showgirl', artist: 'Taylor Swift', artKey: 'ts-showgirl-life', albumId: 'ts-showgirl-2025' },
      { title: 'Purpose', artist: 'Justin Bieber', artKey: 'justin-bieber-purpose', albumId: 'jb-purpose-2015' },
      { title: "Short n' Sweet", artist: 'Sabrina Carpenter', artKey: 'sabrina-short-n-sweet', albumId: 'sabrina-short-n-sweet-2024' },
    ],
  },
  superfan: {
    heroArt: HERO_SUPERFAN,
    heroSub: 'Starting with Olivia Rodrigo, Taylor Swift, and Ariana Grande',
    songs: [
      { title: 'all-american bitch', artist: 'Olivia Rodrigo', plays: '335,532,305', artKey: 'olivia-rodrigo-guts', songId: 's-or-guts-03', artistId: 'olivia-rodrigo' },
      { title: 'brutal', artist: 'Olivia Rodrigo', plays: '283,230,082', artKey: 'olivia-rodrigo-sour', songId: 's-or-sour-01', artistId: 'olivia-rodrigo' },
      { title: 'cardigan', artist: 'Taylor Swift', plays: '912,182,190', artKey: 'tswift', songId: 's-ts-folk-01', artistId: 'tswift' },
      { title: '1 step forward, 3 steps back', artist: 'Olivia Rodrigo', plays: '198,447,213', artKey: 'olivia-rodrigo-sour', songId: 's-or-sour-03', artistId: 'olivia-rodrigo' },
      { title: 'the grudge', artist: 'Olivia Rodrigo', plays: '176,902,558', artKey: 'olivia-rodrigo-guts', songId: 's-or-guts-01', artistId: 'olivia-rodrigo' },
      { title: 'teenage dream', artist: 'Olivia Rodrigo', plays: '221,335,904', artKey: 'olivia-rodrigo-guts', songId: 's-or-guts-05', artistId: 'olivia-rodrigo' },
      { title: 'Look What You Made Me Do', artist: 'Taylor Swift', plays: '987,340,221', artKey: 'ts-reputation', songId: 's10', artistId: 'tswift' },
      { title: 'God is a Woman', artist: 'Ariana Grande', plays: '456,112,890', artKey: 'ariana-sweetener', songId: 's-ariana1', artistId: 'ariana-grande' },
      { title: 'Into You', artist: 'Ariana Grande', plays: '512,663,047', artKey: 'ariana-dangerous-woman', songId: 's-ariana2', artistId: 'ariana-grande' },
    ],
    continueListening: [
      { title: 'SOUR', meta: 'Album • Olivia Rodrigo', artKey: 'olivia-rodrigo-sour', href: '/album/sour-2021' },
      { title: 'GUTS', meta: 'Album • Olivia Rodrigo', artKey: 'olivia-rodrigo-guts', href: '/album/guts-2023' },
      { title: 'Lover', meta: 'Album • Taylor Swift', artKey: 'ts-lover', href: '/album/ts-lover-2019' },
      { title: 'The Olivia Podcast', meta: 'Episode • Livies Club', artKey: 'olivia-rodrigo-sour', href: '/artist/olivia-rodrigo' },
    ],
    favorites: [
      { artistId: 'olivia-rodrigo', name: 'Olivia Rodrigo', tag: 'SUPERFAN', caption: 'Your evening ritual.\n2 weeks strong.', seed: 7, showHeart: true },
      { artistId: 'tswift', name: 'Taylor Swift', tag: 'SUPERFAN', caption: 'Your morning starter.\nA weekly staple.', seed: 1, showHeart: true },
      { artistId: 'sza', name: 'SZA', tag: 'NEW CRUSH', caption: 'On repeat across two albums.', seed: 3 },
      { artistId: 'bts', name: 'BTS', tag: 'NEW CRUSH', caption: 'Seven songs each week.', seed: 4 },
    ],
    fanGroups: [
      {
        eyebrow: 'Calling All Livies',
        eyebrowGradient: true,
        title: 'Olivia rodrigo fans!!!',
        members: '213 members • ',
        accentMembers: '55 superfans',
        quote: 'Whats your fav song from her new album',
        comments: '48',
        artKey: 'olivia-rodrigo',
        cta: 'arrow',
        groupId: 'fg-hj-olivia',
      },
      {
        eyebrow: 'Calling All Swifties',
        eyebrowGradient: true,
        title: 'Swiftyyyyysss',
        members: '550 members • ',
        accentMembers: '230 superfans',
        quote: 'If you had to tattoo a taylor swift song, what lyric would',
        comments: '431',
        artKey: 'tswift',
        cta: 'arrow',
        groupId: 'fg-hj-swifties',
      },
      {
        eyebrow: 'Your New Obsession',
        title: 'arianators',
        members: '213 members • ',
        accentMembers: '64 active',
        quote: 'What song did the tour make you appreciate more after seeing it live?',
        comments: '38',
        artKey: 'ariana-grande',
        cta: 'arrow',
        groupId: 'fg-hj-arianators',
      },
    ],
    topArtists: [
      { artistId: 'olivia-rodrigo', name: 'Olivia Rodrigo', heart: true },
      { artistId: 'tswift', name: 'Taylor Swift', heart: true },
      { artistId: 'justin-bieber', name: 'Justin Bieber' },
      { artistId: 'sabrina-carpenter', name: 'Sabrina Carpenter' },
      { artistId: 'lorde', name: 'Lorde' },
    ],
    albums: [
      { title: 'GUTS (spilled)', artist: 'Olivia Rodrigo', artKey: 'olivia-rodrigo-exclusive', albumId: 'or-album-guts-spilled' },
      { title: "emails i can't send", artist: 'Sabrina Carpenter', artKey: 'sabrina-emails-i-cant-send', albumId: 'sabrina-emails-2022' },
      { title: 'you seem pretty sad for a girl so in love', artist: 'Olivia Rodrigo', artKey: 'olivia-rodrigo-pretty-sad', albumId: 'or-album-pretty' },
      { title: 'SOUR', artist: 'Olivia Rodrigo', artKey: 'olivia-rodrigo-sour', albumId: 'sour-2021' },
      { title: 'The Tortured Poets Department', artist: 'Taylor Swift', artKey: 'ts-tortured-poets', albumId: 'ts-ttpd-2024' },
      { title: 'eternal sunshine', artist: 'Ariana Grande', artKey: 'ariana-eternal-sunshine', albumId: 'ariana-eternal-sunshine-2024' },
    ],
  },
}

// Returns null (never another named artist's photo) when nothing resolves —
// every call site below renders a neutral placeholder box in that case
// instead of silently borrowing someone else's identity (e.g. Conan Gray,
// who has no dedicated asset, used to fall through to Taylor Swift's photo).
function resolveArt(key: string) {
  return (
    albumArtAssets[key] ??
    artistAssets[key] ??
    (key === 'olivia-rodrigo' ? oliviaPageAssets.profile : null) ??
    // Sabrina Carpenter has no dedicated artist portrait in artistAssets — her
    // own catalog entry (mockData.ts) points at this album cover as her avatar.
    (key === 'sabrina-carpenter' ? albumArtAssets['sabrina-short-n-sweet'] : null) ??
    null
  )
}

const SONGS_PER_PAGE = 3
function chunk<T>(arr: T[], size: number): T[][] {
  const pages: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    pages.push(arr.slice(i, i + size))
  }
  return pages
}

/** Only artists with a real catalog entry get a working artist-page link — an
 * id with no `artists` row (e.g. Conan Gray, who has no photo, songs, or bio
 * anywhere in mockData.ts) would otherwise silently mis-route through
 * ArtistJourneyScreen's `artists.find(...) ?? artists[0]` fallback to
 * whichever artist happens to be first in the catalog. */
function hasArtistPage(artistId: string): boolean {
  return artists.some(a => a.id === artistId)
}

function findSongId(row: SongRow): string | undefined {
  if (row.songId && songs.some(s => s.id === row.songId)) return row.songId
  if (row.artistId) {
    const match = songs.find(
      s => s.artistId === row.artistId && s.title.toLowerCase() === row.title.toLowerCase(),
    )
    if (match) return match.id
  }
  return row.songId
}

/**
 * Hannah Journey home — three Figma landings switched by journey stage.
 * Nodes: 2715-20026 (new), 2715-20236 (engaged), 2715-20447 (superfan).
 */
export default function HannahJourneyLanding() {
  const router = useRouter()
  const { stage, revealEligible, openReveal } = useHannahJourney()
  const { playSongAt } = usePlaybackState()
  const { scrollY, onScroll } = useStickyHomeScroll()
  const data = STAGE_DATA[stage]

  const handlePillChange = useCallback(
    (idx: number) => {
      if (idx === 0) router.push('/music')
      else if (idx === 1) router.push('/podcast')
      else if (idx === 2) router.push(`/audible-category/${encodeURIComponent('Bestsellers')}` as any)
    },
    [router],
  )

  // Engaged: delayed Top 3% reveal — deep scroll + 10s dwell.
  // Tracked via a plain ref updated straight off the onScroll event (below),
  // NOT scrollY.addListener() — Animated.Value's imperative listener API is
  // unreliable on web (react-native-web doesn't fire it consistently), which
  // silently meant this reveal never triggered in the browser even though
  // the exact same scroll+dwell worked fine natively.
  const latestScrollRef = useRef(0)
  useEffect(() => {
    if (!revealEligible) return
    const startedAt = Date.now()
    const SCROLL_THRESHOLD = 1100
    const MIN_DWELL_MS = 10000
    const timer = setInterval(() => {
      if (latestScrollRef.current >= SCROLL_THRESHOLD && Date.now() - startedAt >= MIN_DWELL_MS) {
        openReveal()
      }
    }, 500)
    return () => clearInterval(timer)
  }, [revealEligible, openReveal])

  const handleScroll = useCallback(
    (e: Parameters<typeof onScroll>[0]) => {
      onScroll(e)
      latestScrollRef.current = e.nativeEvent.contentOffset.y
    },
    [onScroll],
  )

  const heroFirstSong = useMemo(() => {
    const first = data.songs[0]
    const id = findSongId(first)
    return id ? songs.find(s => s.id === id) : songs.find(s => s.artistId === 'tswift')
  }, [data.songs])

  // "Songs For You" swipeable pagination — same page-chunking technique as
  // the classic home's Songs for You rail (app/(tabs)/index.tsx: SONGS_PER_PAGE
  // / chunk / songPages), sized to this section's own (narrower) card layout
  // instead of reusing the classic screen's peek fraction.
  const songPages = useMemo(() => chunk(data.songs, SONGS_PER_PAGE), [data.songs])
  const songPagePeek = Math.round(SCREEN_W * 0.18)
  const songPageWidth = SCREEN_W - songPagePeek
  const songSnapOffsets = useMemo(
    () => songPages.map((_, i) => i * songPageWidth),
    [songPages, songPageWidth],
  )

  const play = (songId?: string) => {
    if (!songId) return
    playSongAt(songId)
    router.push('/now-playing')
  }

  const openHref = (href?: string, songId?: string) => {
    if (href) {
      router.push(href as any)
      return
    }
    if (songId) play(songId)
  }

  return (
    <View style={s.screen}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        style={{ backgroundColor: C.bg }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Hero — My Soundtrack */}
        <View style={s.heroWrap}>
          <Image source={data.heroArt} style={StyleSheet.absoluteFill} resizeMode="cover" />
          <LinearGradient
            colors={[
              'rgba(0,0,0,0.25)',
              'rgba(0,0,0,0)',
              'rgba(0,0,0,0.6)',
              '#000',
            ]}
            locations={[0, 0.45, 0.78, 1]}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.72)', 'rgba(0,0,0,0)']}
            style={s.headerScrim}
            pointerEvents="none"
          />
          <View style={s.heroCopy}>
            <Text style={s.heroEyebrow}>STATION</Text>
            <Text style={s.heroTitle}>My Soundtrack</Text>
            <Text style={s.heroSub}>{data.heroSub}</Text>
          </View>
          <TouchableOpacity
            style={s.heroPlay}
            activeOpacity={0.85}
            onPress={() => heroFirstSong && play(heroFirstSong.id)}
          >
            <View style={s.heroPlayInner}>
              <Ionicons name="play" size={22} color="#000" style={{ marginLeft: 2 }} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Songs For You — paginated, swipe to reveal more (same page-chunking
            pattern as the classic home's Songs for You rail), one page of
            stacked rows at a time so the row design stays exactly as-is. */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Songs For You</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="normal"
            snapToOffsets={songSnapOffsets}
            snapToAlignment="start"
            nestedScrollEnabled
            contentContainerStyle={{ paddingRight: songPagePeek }}
          >
            {songPages.map((page, pageIdx) => (
              <View key={`songs-page-${pageIdx}`} style={{ width: songPageWidth }}>
                {page.map((row, i) => {
                  const songId = findSongId(row)
                  const art = resolveArt(row.artKey)
                  return (
                    <TouchableOpacity
                      key={`${row.title}-${pageIdx}-${i}`}
                      style={s.songRow}
                      activeOpacity={0.8}
                      onPress={() => play(songId)}
                    >
                      {art ? (
                        <Image source={art} style={s.songArt} resizeMode="cover" />
                      ) : (
                        <View style={[s.songArt, s.artPlaceholder]}>
                          <Ionicons name="musical-note" size={20} color="rgba(255,255,255,0.25)" />
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={s.songTitle} numberOfLines={1}>{row.title}</Text>
                        <Text style={s.songMeta} numberOfLines={1}>
                          {row.artist}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )
                })}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Continue Listening */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { paddingHorizontal: 16 }]}>Continue Listening</Text>
          <EdgeFadeRow>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.hRail}
              nestedScrollEnabled
            >
              {data.continueListening.map(item => {
                const art = resolveArt(item.artKey)
                return (
                  <TouchableOpacity
                    key={item.title}
                    style={s.continueCard}
                    activeOpacity={0.85}
                    onPress={() => openHref(item.href, item.songId)}
                  >
                    {art ? (
                      <Image source={art} style={s.continueArt} resizeMode="cover" />
                    ) : (
                      <View style={[s.continueArt, s.artPlaceholder]}>
                        <Ionicons name="musical-note" size={24} color="rgba(255,255,255,0.25)" />
                      </View>
                    )}
                    <Text style={s.continueTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={s.continueMeta} numberOfLines={1}>{item.meta}</Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </EdgeFadeRow>
        </View>

        {/* You and Your Favorites */}
        <View style={s.section}>
          <View style={s.sectionHeadRow}>
            <Text style={[s.sectionTitle, s.sectionTitleNoPad]}>You and Your Favorites</Text>
            <TouchableOpacity onPress={() => router.push('/music')} activeOpacity={0.7}>
              <Text style={s.seeMore}>SEE MORE</Text>
            </TouchableOpacity>
          </View>
          <EdgeFadeRow>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.hRail}
              nestedScrollEnabled
            >
              {data.favorites.map(card => {
                const art = resolveArtistAvatar(card.artistId) ?? resolveArt(card.artistId)
                return (
                  <TouchableOpacity
                    key={card.artistId + card.tag}
                    style={s.favCard}
                    activeOpacity={0.85}
                    onPress={() => router.push(`/artist/${card.artistId}` as any)}
                  >
                    {art ? (
                      <Image source={art} style={StyleSheet.absoluteFill} resizeMode="cover" />
                    ) : (
                      <View style={[StyleSheet.absoluteFill, { backgroundColor: C.surface }]} />
                    )}
                    <LinearGradient
                      colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.5)']}
                      locations={[0.19, 0.52, 0.81]}
                      style={StyleSheet.absoluteFill}
                    />
                    <View style={s.favTop}>
                      <View style={s.favIdentity}>
                        {art ? (
                          <Image source={art} style={s.favAvatar} resizeMode="cover" />
                        ) : (
                          <View style={[s.favAvatar, { backgroundColor: C.surface }]} />
                        )}
                        <View>
                          <View style={s.favTagRow}>
                            {card.showHeart || card.tag === 'SUPERFAN' ? (
                              <Image
                                source={hannahJourneyAssets.superfanIcon}
                                style={s.favSuperfanIcon}
                                resizeMode="contain"
                              />
                            ) : null}
                            <Text style={s.favTag}>{card.tag}</Text>
                          </View>
                          <Text style={s.favName} numberOfLines={1}>{card.name}</Text>
                        </View>
                      </View>
                      <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
                    </View>
                    <View style={s.favBottom}>
                      <Text style={s.favMonth}>THIS MONTH</Text>
                      <Text style={s.favCaption}>{card.caption}</Text>
                      <ListeningHeatmap seed={card.seed} />
                    </View>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </EdgeFadeRow>
        </View>

        {/* Fan Groups For You */}
        <View style={s.section}>
          <View style={s.sectionHeadRow}>
            <Text style={[s.sectionTitle, s.sectionTitleNoPad]}>Fan Groups For You</Text>
            <Text style={s.seeMore}>SEE MORE</Text>
          </View>
          <EdgeFadeRow>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.hRail}
              nestedScrollEnabled
            >
              {data.fanGroups.map(g => {
                const fanArt = resolveArt(g.artKey)
                const openGroup = () => router.push(`/fan-group/${g.groupId}` as any)
                return (
                <TouchableOpacity key={g.title + g.eyebrow} style={s.fanCard} activeOpacity={0.85} onPress={openGroup}>
                  <LinearGradient
                    colors={['#2a2438', '#1a1520', '#121018']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={s.fanTop}>
                    {fanArt ? (
                      <Image source={fanArt} style={s.fanArt} resizeMode="cover" />
                    ) : (
                      <View style={[s.fanArt, s.artPlaceholder]}>
                        <Ionicons name="people" size={22} color="rgba(255,255,255,0.25)" />
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      {g.eyebrowGradient ? (
                        // Figma node 2715:20201 — superfan eyebrow gradient text:
                        // linear-gradient(19.62deg, #DE909C 2.73%, #A6A0C7 57.41%, #6DAFF1 110.15%)
                        // Genuine multi-hue gradient fill on the glyphs themselves (via
                        // react-native-svg) rather than a gradient rect behind flat-white text.
                        <Svg height={16} width={220} style={s.fanEyebrowGrad}>
                          <Defs>
                            <SvgLinearGradient id={`fanEyebrowGradFill-${g.title}`} x1="33%" y1="97%" x2="67%" y2="3%">
                              <Stop offset="0.02" stopColor="#DE909C" />
                              <Stop offset="0.52" stopColor="#A6A0C7" />
                              <Stop offset="1" stopColor="#6DAFF1" />
                            </SvgLinearGradient>
                          </Defs>
                          <SvgText
                            x={0}
                            y={12}
                            fill={`url(#fanEyebrowGradFill-${g.title})`}
                            fontFamily={FONT_FAMILY_DISPLAY.bold}
                            fontSize={12}
                            letterSpacing={0.3}
                          >
                            {g.eyebrow.toUpperCase()}
                          </SvgText>
                        </Svg>
                      ) : (
                        <Text style={s.fanEyebrow}>{g.eyebrow}</Text>
                      )}
                      <Text style={s.fanTitle} numberOfLines={1}>{g.title}</Text>
                      <Text style={s.fanMembers}>
                        {g.members}
                        {g.accentMembers ? (
                          <Text style={{ color: g.accentMembers.includes('active') ? C.cyan : '#DE909C' }}>
                            {g.accentMembers}
                          </Text>
                        ) : null}
                      </Text>
                    </View>
                    {g.cta === 'join' ? (
                      <TouchableOpacity style={s.joinBtn} activeOpacity={0.85} onPress={openGroup}>
                        <Text style={s.joinText}>Join</Text>
                      </TouchableOpacity>
                    ) : (
                      <Ionicons name="chevron-forward" size={28} color="#fff" />
                    )}
                  </View>
                  <View style={s.fanDivider} />
                  <View style={s.fanQuoteRow}>
                    <Text style={s.fanQuote} numberOfLines={1}>{g.quote}</Text>
                    <Ionicons name="chatbubble-outline" size={14} color="#fff" />
                    <Text style={s.fanComments}>{g.comments}</Text>
                  </View>
                </TouchableOpacity>
                )
              })}
            </ScrollView>
          </EdgeFadeRow>
        </View>

        {/* Your Top Artists */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { paddingHorizontal: 16 }]}>Your Top Artists</Text>
          <EdgeFadeRow>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.hRail}
              nestedScrollEnabled
            >
              {data.topArtists.map(a => {
                const art = resolveArtistAvatar(a.artistId) ?? resolveArt(a.artistId)
                // Only artists with a real catalog entry get a working artist
                // page — otherwise ArtistJourneyScreen's own fallback
                // (artists.find(...) ?? artists[0]) would silently land on
                // whichever artist is first in the catalog (Olivia Rodrigo).
                const routable = hasArtistPage(a.artistId)
                return (
                  <TouchableOpacity
                    key={a.artistId}
                    style={s.topArtist}
                    activeOpacity={routable ? 0.85 : 1}
                    onPress={() => routable && router.push(`/artist/${a.artistId}` as any)}
                  >
                    <View style={s.topArtistAvatarWrap}>
                      {art ? (
                        <Image source={art} style={s.topArtistArt} resizeMode="cover" />
                      ) : (
                        <View style={[s.topArtistArt, s.artPlaceholder]}>
                          <Ionicons name="person" size={36} color="rgba(255,255,255,0.25)" />
                        </View>
                      )}
                      {/* Superfan heart sits on the artist photo itself (Figma
                          node 3052:31090/31091 "Artist List - Superfan"),
                          bottom-left corner — not beside the name. Dark
                          outline (faked via offset dark copies, since Image
                          has no native stroke) so it pops against any photo. */}
                      {a.heart ? (
                        <SuperfanHeartBadge
                          source={hannahJourneyAssets.superfanIcon}
                          style={s.topArtistSuperfanBadge}
                        />
                      ) : null}
                    </View>
                    <Text style={s.topArtistName} numberOfLines={1}>{a.name}</Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </EdgeFadeRow>
        </View>

        {/* Albums for you */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { paddingHorizontal: 16 }]}>Albums for you</Text>
          <EdgeFadeRow>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.hRail}
              nestedScrollEnabled
            >
              {data.albums.map(al => {
                const art = resolveArt(al.artKey)
                return (
                  <TouchableOpacity
                    key={al.title}
                    style={s.albumCard}
                    activeOpacity={0.85}
                    onPress={() => {
                      // Every card now carries a real albumId and opens the unified
                      // Hannah Journey album page (SOUR/GUTS layout) — the artist-page
                      // fallback only remains as a safety net for future entries.
                      if (al.albumId) router.push(`/album/${al.albumId}` as any)
                      else if (al.artistId) router.push(`/artist/${al.artistId}` as any)
                    }}
                  >
                    {art ? (
                      <Image source={art} style={s.albumArt} resizeMode="cover" />
                    ) : (
                      <View style={[s.albumArt, s.artPlaceholder]}>
                        <Ionicons name="musical-note" size={28} color="rgba(255,255,255,0.25)" />
                      </View>
                    )}
                    <Text style={s.albumTitle} numberOfLines={1}>{al.title}</Text>
                    <Text style={s.albumArtist} numberOfLines={1}>{al.artist}</Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </EdgeFadeRow>
        </View>
      </Animated.ScrollView>

      <StickyHomeHeader
        firstName="Hannah"
        activePill={null}
        onPillChange={handlePillChange}
        scrollY={scrollY}
      />

      <SuperfanRevealPopup />
    </View>
  )
}

const CARD_W = Math.min(212, SCREEN_W * 0.55)

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  // Neutral fallback for any art slot whose asset didn't resolve — never a
  // stand-in photo of another artist or of Hannah's own profile.
  artPlaceholder: { backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  heroWrap: {
    width: '100%',
    height: 398,
    overflow: 'hidden',
  },
  headerScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 124,
  },
  heroCopy: {
    // Bottom-anchored (not pushed down from the top by device safe-area
    // insets) so extra heroSub wrap lines grow upward into the hero's open
    // space instead of pushing the block past heroWrap's fixed height and
    // getting clipped by its `overflow: hidden`.
    position: 'absolute',
    left: 0,
    bottom: 12,
    paddingHorizontal: 16,
    gap: 12,
    width: '70%',
  },
  heroEyebrow: {
    fontFamily: FONT_FAMILY_DISPLAY.bold,
    fontSize: 12,
    color: C.cyan,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontFamily: FONT_FAMILY_DISPLAY.bold,
    fontSize: 34,
    color: '#fff',
    lineHeight: 34,
  },
  heroSub: {
    fontFamily: FONT_FAMILY_EMBER.regular,
    fontSize: 12,
    lineHeight: 14.4,
    color: 'rgba(255,255,255,0.72)',
  },
  heroPlay: {
    position: 'absolute',
    right: 16,
    bottom: 40,
    width: 50,
    height: 50,
  },
  heroPlayInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: C.cyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 24 read as cramped between the big card sections (Continue Listening →
  // Favorites → Fan Groups → Top Artists) — opened up per user feedback.
  section: { marginTop: 36 },
  sectionHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: FONT_FAMILY_DISPLAY.bold,
    fontSize: 20,
    color: '#fff',
    lineHeight: 20,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  // sectionHeadRow already applies paddingHorizontal:16 to the row itself —
  // used alongside sectionTitle there to cancel its own padding and avoid
  // double-indenting the title (it stacked to 32px vs. every other section's 16px).
  sectionTitleNoPad: {
    paddingHorizontal: 0,
    marginBottom: 0,
  },
  seeMore: {
    fontFamily: FONT_FAMILY_DISPLAY.bold,
    fontSize: 12,
    color: '#757575',
    textTransform: 'uppercase',
  },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 12,
  },
  songArt: {
    width: 63,
    height: 63,
    borderRadius: 4,
    borderWidth: 0.75,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  songTitle: {
    fontFamily: FONT_FAMILY_EMBER.bold,
    fontSize: 16,
    color: '#fff',
  },
  songMeta: {
    fontFamily: FONT_FAMILY_EMBER.regular,
    fontSize: 12,
    color: '#A6A6A6',
    marginTop: 4,
  },
  hRail: { paddingHorizontal: 16, gap: 16 },
  continueCard: { width: 173 },
  continueArt: {
    width: 173,
    height: 173,
    borderRadius: 8,
    borderWidth: 0.75,
    borderColor: 'rgba(255,255,255,0.24)',
    marginBottom: 5,
  },
  continueTitle: {
    fontFamily: FONT_FAMILY_EMBER.bold,
    fontSize: 16,
    color: '#fff',
  },
  continueMeta: {
    fontFamily: FONT_FAMILY_EMBER.regular,
    fontSize: 12,
    color: '#A6A6A6',
  },
  favCard: {
    width: CARD_W,
    height: CARD_W,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    overflow: 'hidden',
    padding: 12,
    justifyContent: 'space-between',
  },
  favTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  favIdentity: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  favAvatar: { width: 36, height: 36, borderRadius: 18 },
  favTagRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  favSuperfanIcon: { width: 15, height: 14 },
  favTag: {
    fontFamily: FONT_FAMILY_DISPLAY.bold,
    fontSize: 12,
    color: '#fff',
    textTransform: 'uppercase',
  },
  favName: {
    fontFamily: FONT_FAMILY_EMBER.bold,
    fontSize: 16,
    color: '#fff',
    marginTop: 2,
  },
  favBottom: { gap: 5 },
  favMonth: {
    fontFamily: FONT_FAMILY_DISPLAY.regular,
    fontSize: 12,
    color: '#fff',
    textTransform: 'uppercase',
  },
  favCaption: {
    fontFamily: FONT_FAMILY_DISPLAY.bold,
    fontSize: 18,
    color: '#fff',
    lineHeight: 20,
    marginBottom: 4,
  },
  fanCard: {
    width: 341,
    height: 122,
    borderRadius: 12,
    overflow: 'hidden',
    padding: 12,
  },
  fanTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  fanArt: {
    width: 64,
    height: 64,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  fanEyebrow: {
    fontFamily: FONT_FAMILY_DISPLAY.bold,
    fontSize: 12,
    color: '#A6A6A6',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  fanEyebrowGrad: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  fanTitle: {
    fontFamily: FONT_FAMILY_EMBER.bold,
    fontSize: 16,
    color: '#fff',
  },
  fanMembers: {
    fontFamily: FONT_FAMILY_EMBER.regular,
    fontSize: 12,
    color: '#fff',
    marginTop: 4,
  },
  joinBtn: {
    backgroundColor: 'rgba(145,174,185,0.4)',
    borderRadius: 24,
    height: 33,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinText: {
    fontFamily: FONT_FAMILY_DISPLAY.bold,
    fontSize: 14,
    color: '#fff',
  },
  fanDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginTop: 10,
    marginBottom: 8,
  },
  fanQuoteRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  fanQuote: {
    flex: 1,
    fontFamily: FONT_FAMILY_EMBER.regular,
    fontSize: 12,
    color: '#fff',
  },
  fanComments: {
    fontFamily: FONT_FAMILY_EMBER.regular,
    fontSize: 12,
    color: '#fff',
  },
  topArtist: { width: 120, alignItems: 'center', gap: 8 },
  topArtistAvatarWrap: { width: 120, height: 120 },
  topArtistArt: { width: 120, height: 120, borderRadius: 60 },
  // Figma node 3052:31090 "artist superfan heart": left:4 top:86 within the
  // 120x120 avatar, ~32x30 — overlaps the photo's bottom-left corner.
  topArtistSuperfanBadge: { position: 'absolute', left: 4, top: 86, width: 32, height: 30 },
  topArtistName: {
    fontFamily: FONT_FAMILY_EMBER.bold,
    fontSize: 16,
    color: '#fff',
    maxWidth: 100,
  },
  albumCard: { width: 173 },
  albumArt: {
    width: 173,
    height: 173,
    borderRadius: 8,
    borderWidth: 0.75,
    borderColor: 'rgba(255,255,255,0.24)',
    marginBottom: 5,
  },
  albumTitle: {
    fontFamily: FONT_FAMILY_EMBER.bold,
    fontSize: 16,
    color: '#fff',
  },
  albumArtist: {
    fontFamily: FONT_FAMILY_EMBER.regular,
    fontSize: 12,
    color: '#A6A6A6',
  },
})
