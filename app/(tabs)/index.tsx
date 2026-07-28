import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  ScrollView,
  View,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Animated,
  Dimensions,
  Platform,
} from 'react-native'
import { Text } from '../../src/components/AppText'
import { AppImage as Image } from '../../src/components/AppImage'
import { HRail } from '../../src/components/HRail'
import { EdgeFadeRow } from '../../src/components/EdgeFadeRow'
import { ShowsYouWatchRail, ListeningHeatmap } from '../../src/components/home/HomeSessionWidgets'
import { showYouWatchPlaylistIds } from '../../src/data/showsYouWatch'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { runOnJS, useSharedValue, type SharedValue } from 'react-native-reanimated'
import { usePlaybackState } from '../../src/hooks/usePlaybackState'
import { songs, artists, user, playlists, podcasts, songsForYouIds, continueListeningItems, heroPool, myMixPlaylistIds, popularInCitySongIds, homeFeaturedArtistIds, hannahFeaturedArtistIds, hiddenGemsArtistIds, frequentPlaySongIds, newForYouSongIds, recentlyPlayedIds, type Song } from '../../src/data/mockData'
import { albumArtAssets, artistAssets, oliviaAboutAssets, oliviaPageAssets, resolveArtistAvatar } from '../../src/data/assetMap'
import {
  filterSongsForTheme,
  filterContinueListening,
  uniqueAlbumsFromSongs,
  getFeaturedArtists,
  getHiddenGemArtists,
} from '../../src/data/themeFilters'
import { C, R, typeHeadline } from '../../src/theme'
import StickyHomeHeader, { useStickyHomeHeaderHeight, useStickyHomeScroll } from '../../src/components/StickyHomeHeader'
import { useAdaptiveUI, type AdaptiveTheme, isOliviaSuperFanTheme } from '../../src/context/AdaptiveUIContext'
import {
  OLIVIA_TOP_TRACK,
  OLIVIA_EXCLUSIVE_TRACK,
  OLIVIA_PODCASTS,
  OLIVIA_NEWS,
  OLIVIA_MERCH,
} from '../../src/data/oliviaSuperFanContent'
import { KPOP_BORAHAE_PLAYLIST } from '../../src/data/kpopContent'
import { LOVE_ISLAND_VILLA_PLAYLIST, LOVE_ISLAND_CAST_PLAYLIST } from '../../src/data/loveIslandContent'
import AdaptiveThemePills from '../../src/components/AdaptiveThemePills'
import AdaptivePersonaHome from '../../src/components/home/AdaptivePersonaHome'
import CasualHome from '../../src/components/home/CasualHome'
import { useProfiles } from '../../src/context/ProfilesContext'
import { useHannahJourney } from '../../src/context/HannahJourneyContext'
import HannahJourneyLanding from '../../src/components/hannah-journey/HannahJourneyLanding'
import CustomProfileLanding from '../../src/components/home/CustomProfileLanding'
import AdaptiveDragOverlay, { type DragPayload } from '../../src/components/AdaptiveDragOverlay'
import { useAdaptiveMenu } from '../../src/components/AdaptiveContextMenu'

// "Endless scroll" filler content — deliberately generic (not theme-filtered),
// so the feed keeps producing new rails from the wider catalog the further you
// scroll, the same way a real streaming home never really "runs out."
const RADIO_STATIONS = [
  { id: 'radio-bad-bunny', name: 'Bad Bunny Radio',    artKey: 'bad-bunny-verano',      songId: 's-bb1' },
  { id: 'radio-sza',       name: 'SZA Radio',           artKey: 'sza-sos',               songId: 's-sza1' },
  { id: 'radio-weeknd',    name: 'The Weeknd Radio',    artKey: 'the-weeknd',            songId: 's-weeknd1' },
  { id: 'radio-dua',       name: 'Dua Lipa Radio',      artKey: 'dua-lipa',              songId: 's-dua1' },
  { id: 'radio-rihanna',   name: 'Rihanna Radio',       artKey: 'rihanna-anti',          songId: 's-rihanna1' },
  { id: 'radio-doja',      name: 'Doja Cat Radio',      artKey: 'doja-cat',              songId: 's-doja1' },
  { id: 'radio-beyonce',   name: 'Beyoncé Radio',       artKey: 'beyonce-lemonade',      songId: 's-beyonce5' },
  { id: 'radio-ariana',    name: 'Ariana Grande Radio', artKey: 'ariana-sweetener',      songId: 's-ariana1' },
]

// A handful of artists with enough catalog depth to headline their own
// "Deep dive" rail — one is picked at random per visit.
const DEEP_DIVE_ARTIST_POOL = ['lorde', 'mitski', 'beyonce', 'ariana-grande', 'sabrina-carpenter', 'rihanna', 'sza', 'dua-lipa', 'the-weeknd', 'doja-cat']

const SUMMER_SESSION_PLAYLIST_IDS = ['pl-summer-turned-pretty', 'pl-love-island', 'pl-love-island-cast', 'pl5']

// Hannah keeps the baseline layout, but two of her adaptive-home sections
// carry over as-is: "You and your favorites" (artist insight cards) and a
// pair of fixed Deep Dive rails (Rihanna + Taylor Swift) instead of the
// baseline's single random pick.
// Deliberate per-artist tags — same new/engaged/superfan vocabulary as the
// artist-page tier system (src/hooks/useArtistTier.ts) — instead of a
// generic cycling label.
const HANNAH_FAVORITE_ARTISTS: { artistId: string; tag: string; caption: string }[] = [
  { artistId: 'tswift',            tag: 'Superfan',    caption: 'Your #1 artist, every era.' },
  { artistId: 'olivia-rodrigo',    tag: 'New Listener', caption: 'Just getting started.' },
  { artistId: 'sabrina-carpenter', tag: 'Engaged',      caption: 'In steady rotation.' },
  { artistId: 'tate-mcrae',        tag: 'New Listener', caption: 'Fresh into the mix.' },
]

const HERO_POOL = heroPool

const SONGS_PER_PAGE = 3
const BASE_SONGS_FOR_YOU = songsForYouIds
  .map(id => songs.find(s => s.id === id))
  .filter((s): s is typeof songs[0] => s != null)

const BASE_CONTINUE_LISTENING = continueListeningItems

const BASE_POPULAR_IN_CITY = popularInCitySongIds
  .map(id => songs.find(s => s.id === id))
  .filter((s): s is typeof songs[0] => s != null)

const BASE_FREQUENT_PLAYS = frequentPlaySongIds
  .map(id => songs.find(s => s.id === id))
  .filter((s): s is typeof songs[0] => s != null)

const MY_MIXES = myMixPlaylistIds
  .map(id => playlists.find(p => p.id === id))
  .filter((p): p is typeof playlists[0] => p != null)

type HeroBounds = { x: number; y: number; width: number; height: number }

function pickRandomHero() {
  const primary = HERO_POOL[Math.floor(Math.random() * HERO_POOL.length)]
  const others = HERO_POOL.filter(h => h.artistId !== primary.artistId)
    .sort(() => Math.random() - 0.5)
    .slice(0, 2)
  const subtitle = others.length >= 2
    ? `Starting with ${primary.name}, ${others[0].name}, and ${others[1].name}`
    : `Starting with ${primary.name}`
  return { ...primary, subtitle }
}

function resolveBannerArt(bannerKey: string) {
  return albumArtAssets[bannerKey] ?? artistAssets[bannerKey] ?? oliviaAboutAssets[bannerKey] ?? null
}

function parseHueBase(hue: string): { r: number; g: number; b: number } {
  if (hue.startsWith('#')) {
    const hex = hue.replace('#', '')
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    }
  }
  const match = hue.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (match) {
    return { r: +match[1], g: +match[2], b: +match[3] }
  }
  return { r: 38, g: 22, b: 32 }
}

function tintFromHue(hue: string, alpha: number): string {
  const { r, g, b } = parseHueBase(hue)
  return `rgba(${r},${g},${b},${alpha})`
}

function gradientIntensityForTheme(theme: AdaptiveTheme | null): number {
  if (!theme) return 1
  if (theme.id === 'jazz' || theme.id === 'chill' || theme.id === 'rnb-soul') return 0.78
  if (theme.id === 'kpop' || theme.id === 'pop' || theme.id === 'latin') return 1.1
  return 1
}

// Image-accurate hue for each banner key — used for gradients so the
// color bloom matches the actual cover art, not the theme's brand color.
const BANNER_IMAGE_HUES: Record<string, string> = {
  // Taylor Swift
  'ts-showgirl':             '#2A4C14',  // Eras Tour green sparkly jumpsuit
  'ts-1989':                 '#3A6080',  // 1989, steel blue sky
  'ts-reputation':           '#141414',  // reputation, near-black
  'ts-tortured-poets':       '#706858',  // parchment / grey-beige
  'ts-showgirl-life':        '#2A4C14',
  // BTS / K-pop
  'bts-proof-door':          '#3A1870',  // BTS Proof, rich indigo
  'bts-map-of-soul-7':       '#402810',  // warm earthy brown
  'bts-dynamite':            '#1A50A0',  // bright saturated blue
  // Jazz
  'billie-holiday-satin':    '#1A2448',  // Lady in Satin, midnight blue
  // Bruno Mars
  'bruno-mars-24k-magic':    '#7A4A08',  // 24K Magic, warm rich gold
  // Justin Bieber
  'justin-bieber-believe':   '#1A2870',  // Believe, deep royal blue
  // Olivia Rodrigo — keeps the signature purple the user preferred
  'olivia-rodrigo-hero':     '#7B2D8E',
  'olivia-rodrigo-sour':     '#5A2480',  // SOUR
  'olivia-rodrigo-guts':     '#142818',  // GUTS, dark forest green
  'beatles-abbey-road':      '#2C3010',  // Abbey Road, olive/warm green
  'beatles-sgt-peppers':     '#7A1414',  // Sgt Pepper, deep red
  'lorde-melodrama':         '#162C20',  // Melodrama, teal/dark green
  'mitski-be-the-cowboy':    '#501420',  // Be the Cowboy, deep crimson
  'sia':                     '#1E1C3C',  // Sia, slate blue-purple
  'drake-iceman':            '#0A1018',  // very dark navy
  'bana-zahiti':             '#542C14',  // warm amber-brown
  'charli-xcx-album':        '#4C1470',  // Brat, vivid violet
  'kpop-demon-hunters-ost':  '#2C0C48',  // dark purple
  'nicki-pinkprint':         '#900E3C',  // The Pinkprint, deep magenta
  'beyonce-lemonade':        '#8C5A08',  // Lemonade, warm golden
  'beyonce-self-titled':     '#3C2808',  // Beyoncé, warm brown-gold
  'pink-floyd-dark-side':    '#120820',  // Dark Side, dark purple/black
  'rihanna-anti':            '#180808',  // ANTI, near-black red
  'sza-sos':                 '#0C1A28',  // SOS, dark navy
  'sabrina-short-n-sweet':   '#781E38',  // Short n Sweet, deep pink
  'rm-indigo':               '#142040',  // Indigo, indigo blue
  'tyler-igor':              '#302050',  // IGOR, purple-blue
  'fleetwood-rumours':       '#5C3010',  // Rumours, warm amber
  'ariana-sweetener':        '#A8205C',  // Sweetener, pink
  'bad-bunny-verano':        '#183060',  // Un Verano, deep blue
  'cardi-invasion':          '#380C2C',  // Invasion of Privacy, dark purple-red
  'carole-king-tapestry':    '#4A2C10',  // Tapestry, warm brown
  'lizzo-cuz-i-love-you':   '#8C2840',  // Cuz I Love You, vivid pink-red
  'missy-under-construction':'#0C1030',  // Under Construction, dark blue
  'outkast-stankonia':       '#5C0808',  // Stankonia, deep red
  'drake-if-youre-reading':  '#0A0A1A',  // If You're Reading This, deep navy
  'japanese-breakfast-jubilee':'#163428', // Jubilee, teal green
  // Missing keys used by themes — added so every theme has an accurate bloom color
  'metallica-master':          '#7A4A0A',  // Master of Puppets, warm sandy amber
  'late-night-city':           '#101028',  // city at night, deep midnight blue
  'heartbreak-mood':           '#2A1530',  // moody heartbreak, deep purple
  'dance-upbeat':              '#1A0840',  // dance energy, vibrant dark purple-blue
  'morning-energy':            '#9A4808',  // sunrise, warm amber-orange
  'ariana-grande':             '#7A1A38',  // 7 rings / thank u next, deep rose
  'bad-bunny':                 '#143060',  // Un Verano Sin Ti, ocean blue
}

function chunk<T>(arr: T[], size: number): T[][] {
  const pages: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    pages.push(arr.slice(i, i + size))
  }
  return pages
}

function PlayOverlay({ size = 28 }: { size?: number }) {
  return (
    <View style={[s.playOverlay, { width: size, height: size, borderRadius: size / 2 }]}>
      <Ionicons name="play" size={size * 0.45} color="#fff" style={{ marginLeft: 1 }} />
    </View>
  )
}


function DraggableAlbumCard({
  album,
  adaptiveEnabled,
  onOpen,
  onDragStart,
  onDragMove,
  onDragDrop,
  onDragCancel,
  dragX,
  dragY,
}: {
  album: Song
  adaptiveEnabled: boolean
  onOpen: () => void
  onDragStart: (song: Song, x: number, y: number) => void
  onDragMove: (x: number, y: number) => void
  onDragDrop: (x: number, y: number, song: Song) => void
  onDragCancel: () => void
  dragX: SharedValue<number>
  dragY: SharedValue<number>
}) {
  const art = album.albumArtPath ? albumArtAssets[album.albumArtPath] : null

  // Single Pan gesture with long-press activation — same pattern as AlexaFloatingButton.
  // This avoids the gesture-handoff bug where a separately-mounted overlay's Pan gesture
  // cannot capture the already-ongoing touch from a LongPress in a different component.
  const pan = Gesture.Pan()
    .activateAfterLongPress(350)
    .enabled(adaptiveEnabled)
    .onStart(e => {
      dragX.value = e.absoluteX
      dragY.value = e.absoluteY
      runOnJS(onDragStart)(album, e.absoluteX, e.absoluteY)
    })
    .onUpdate(e => {
      dragX.value = e.absoluteX
      dragY.value = e.absoluteY
      runOnJS(onDragMove)(e.absoluteX, e.absoluteY)
    })
    .onEnd(e => {
      runOnJS(onDragDrop)(e.absoluteX, e.absoluteY, album)
    })
    .onFinalize((_e, success) => {
      if (!success) runOnJS(onDragCancel)()
    })

  const tap = Gesture.Tap().onEnd(() => {
    runOnJS(onOpen)()
  })

  const gesture = adaptiveEnabled ? Gesture.Race(pan, tap) : Gesture.Tap().onEnd(() => runOnJS(onOpen)())

  const card = (
    <View style={s.albumCard}>
      <View style={s.albumArtWrap}>
        {art ? (
          <Image source={art} style={s.albumArt} resizeMode="cover" />
        ) : (
          <View style={[s.albumArt, { backgroundColor: album.albumArtColor }]}>
            <Ionicons name="musical-note" size={28} color="rgba(255,255,255,0.15)" />
          </View>
        )}
      </View>
      <Text style={s.albumTitle} numberOfLines={2}>{album.album}</Text>
      <Text style={s.albumArtist} numberOfLines={1}>{album.artistName}</Text>
    </View>
  )

  if (!adaptiveEnabled) {
    return (
      <TouchableOpacity onPress={onOpen} activeOpacity={0.85}>
        {card}
      </TouchableOpacity>
    )
  }

  return <GestureDetector gesture={gesture}>{card}</GestureDetector>
}

export default function HomeScreen() {
  const router = useRouter()
  const { playSongAt } = usePlaybackState()
  const {
    adaptiveEnabled,
    activeTheme,
    setActiveTheme,
    addThemeFromAlbum,
    getSectionLabel,
    showConfirmation,
  } = useAdaptiveUI()
  const { open: openAdaptiveMenu } = useAdaptiveMenu()
  const { activeProfile } = useProfiles()

  // Hannah (v5) sits on the baseline layout AND baseline (unfiltered) content —
  // no theme-branded hero, no Taylor-only filtering on the generic rails. Only
  // her explicitly-kept extras (You and your favorites, the two Deep Dive
  // rails) stay fandom-flavored; everything else reads exactly like Derbc
  // Studios' catalog-wide baseline.
  // Hannah Journey gets dedicated Figma landings (switched by stage).
  // Original Hannah (v5) still uses this baseline layout.
  const { isHannahJourney } = useHannahJourney()
  const isHannah = activeProfile.id === 'hannah'
  const themeForFiltering = adaptiveEnabled && !isHannah ? activeTheme : null
  // getSectionLabel reads the global activeTheme, which stays set to Taylor
  // Swift for Hannah (it still drives her artist page etc.) — so section
  // titles on her home need their own override straight to the plain baseline
  // fallback, same idea as themeForFiltering above.
  const sectionLabel = (key: Parameters<typeof getSectionLabel>[0], fallback: string) =>
    isHannah ? fallback : getSectionLabel(key, fallback)

  const firstName = activeProfile.name.split(' ')[0]
  const handlePillChange = useCallback((idx: number) => {
    if (idx === 0) router.push('/music')
    else if (idx === 1) router.push('/podcast')
    else if (idx === 2) router.push(`/audible-category/${encodeURIComponent('Bestsellers')}` as any)
  }, [router, showConfirmation])

  const defaultHero = useMemo(() => pickRandomHero(), [])
  const heroDisplay = useMemo(() => {
    if (themeForFiltering) {
      // Use the image's actual dominant color for gradients, not the theme brand color.
      // Fall back to the theme brand color only when no image hue is available.
      const imageHue = BANNER_IMAGE_HUES[themeForFiltering.heroBannerKey ?? ''] ?? themeForFiltering.heroHue
      return {
        eyebrow: themeForFiltering.heroEyebrow,
        title: themeForFiltering.heroTitle,
        subtitle: themeForFiltering.heroSubtitle,
        artistId: themeForFiltering.heroArtistId,
        bannerKey: themeForFiltering.heroBannerKey,
        hue: imageHue,
      }
    }
    return {
      eyebrow: 'STATION',
      title: 'My Soundtrack',
      subtitle: defaultHero.subtitle,
      artistId: defaultHero.artistId,
      bannerKey: defaultHero.bannerKey,
      hue: defaultHero.hue,
    }
  }, [themeForFiltering, defaultHero])

  const heroArt = (heroDisplay.bannerKey ? resolveBannerArt(heroDisplay.bannerKey) : null)
    ?? artistAssets[heroDisplay.artistId]
    ?? artistAssets.bts

  const songsForYou = useMemo(
    () => (themeForFiltering ? filterSongsForTheme(BASE_SONGS_FOR_YOU, themeForFiltering) : BASE_SONGS_FOR_YOU),
    [themeForFiltering],
  )
  const songPages = useMemo(() => chunk(songsForYou, SONGS_PER_PAGE), [songsForYou])

  const continueListening = useMemo(
    () => (themeForFiltering ? filterContinueListening(BASE_CONTINUE_LISTENING, themeForFiltering, songs) : BASE_CONTINUE_LISTENING),
    [themeForFiltering],
  )

  const albumsForYou = useMemo(() => {
    const pool = themeForFiltering ? filterSongsForTheme(songs, themeForFiltering) : songs
    return uniqueAlbumsFromSongs(pool, 8)
  }, [themeForFiltering])

  const featuredArtists = useMemo(
    () => getFeaturedArtists(themeForFiltering, isHannah ? hannahFeaturedArtistIds : homeFeaturedArtistIds, 16),
    [themeForFiltering, isHannah],
  )

  // "You and your favorites" — kept from Hannah's adaptive home, with
  // deliberate per-artist tags instead of a generic cycling label.
  const favoriteInsights = useMemo(
    () =>
      HANNAH_FAVORITE_ARTISTS.map(({ artistId, tag, caption }, i) => {
        const artist = artists.find(a => a.id === artistId)
        return artist ? { artist, tag, caption, seed: i } : null
      }).filter((item): item is { artist: (typeof artists)[number]; tag: string; caption: string; seed: number } => item != null),
    [],
  )

  const hiddenGems = useMemo(() => getHiddenGemArtists(hiddenGemsArtistIds), [])

  const frequentPlays = useMemo(
    () => (themeForFiltering ? filterSongsForTheme(BASE_FREQUENT_PLAYS, themeForFiltering) : BASE_FREQUENT_PLAYS),
    [themeForFiltering],
  )

  // Fixed Deep Dive rails for Hannah (Rihanna + Taylor Swift), kept from her
  // adaptive home instead of the baseline's single random-artist pick.
  const deepDiveRihannaSongs = useMemo(() => songs.filter(song => song.artistId === 'rihanna'), [])
  const deepDiveTaylorSongs = useMemo(() => songs.filter(song => song.artistId === 'tswift'), [])

  const popularInCity = useMemo(
    () => (themeForFiltering ? filterSongsForTheme(BASE_POPULAR_IN_CITY, themeForFiltering) : BASE_POPULAR_IN_CITY),
    [themeForFiltering],
  )

  // ── "Endless scroll" filler sections — generic, catalog-wide, not theme-filtered ──
  const newReleases = useMemo(
    () => newForYouSongIds.map(id => songs.find(s => s.id === id)).filter((s): s is Song => s != null),
    [],
  )
  const recentlyPlayed = useMemo(
    () => recentlyPlayedIds.map(id => songs.find(s => s.id === id)).filter((s): s is Song => s != null),
    [],
  )
  const deepDiveArtist = useMemo(() => {
    const id = DEEP_DIVE_ARTIST_POOL[Math.floor(Math.random() * DEEP_DIVE_ARTIST_POOL.length)]
    return artists.find(a => a.id === id) ?? artists[0]
  }, [])
  const deepDiveSongs = useMemo(
    () => songs.filter(s => s.artistId === deepDiveArtist.id),
    [deepDiveArtist],
  )
  const specialAudioSongs = useMemo(
    () => songs.filter(s => s.audioBadge && s.audioBadge !== 'SD').slice(0, 14),
    [],
  )
  const summerSessionPlaylists = useMemo(
    () => SUMMER_SESSION_PLAYLIST_IDS.map(id => playlists.find(p => p.id === id)).filter((p): p is typeof playlists[0] => p != null),
    [],
  )
  const morePlaylistsForYou = useMemo(() => {
    const used = new Set([
      ...myMixPlaylistIds,
      ...showYouWatchPlaylistIds,
      ...SUMMER_SESSION_PLAYLIST_IDS,
    ])
    return playlists.filter(p => !used.has(p.id))
  }, [])
  const trueCrimePodcasts = useMemo(() => podcasts.filter(p => p.category === 'True Crime'), [])
  const podcastsForYou = useMemo(() => podcasts.slice(0, 10), [])
  const oliviaFeatured = useMemo(() => songs.filter(s => s.artistId === 'olivia-rodrigo').slice(0, 10), [])

  const stickyHeaderHeight = useStickyHomeHeaderHeight()
  const { scrollY, onScroll } = useStickyHomeScroll()

  // On web the app renders inside a 402px phone frame — pager pages and the
  // Love Island card must be sized against the frame, not the browser window.
  const screenWidth = Platform.OS === 'web'
    ? Math.min(Dimensions.get('window').width, 402)
    : Dimensions.get('window').width
  const songPagePeek = Math.round(screenWidth * 0.32)
  const songPageWidth = screenWidth - songPagePeek
  const songSnapOffsets = useMemo(
    () => songPages.map((_, i) => i * songPageWidth),
    [songPages, songPageWidth],
  )
  const loveIslandCardWidth = screenWidth - 48

  const heroFirstSong = songs.find(s => s.artistId === heroDisplay.artistId) ?? songs[0]

  const heroRef = useRef<View>(null)
  const heroBounds = useRef<HeroBounds>({ x: 0, y: 0, width: 0, height: 0 })
  const [heroDropHover, setHeroDropHover] = useState(false)
  const [dragState, setDragState] = useState<{ payload: DragPayload } | null>(null)

  // Shared values written on the UI thread by the gesture in ThemePill / DraggableAlbumCard.
  // The overlay reads these via useAnimatedStyle — 60fps smooth, no setState needed for position.
  const dragX = useSharedValue(0)
  const dragY = useSharedValue(0)

  const measureHero = useCallback(() => {
    heroRef.current?.measureInWindow((x, y, width, height) => {
      heroBounds.current = { x, y, width, height }
    })
  }, [])

  const pointInHero = useCallback((x: number, y: number) => {
    const b = heroBounds.current
    return x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height
  }, [])

  const handleThemeDragStart = useCallback((theme: AdaptiveTheme, x: number, y: number) => {
    measureHero()
    dragX.value = x
    dragY.value = y
    setDragState({ payload: { kind: 'theme', theme } })
  }, [dragX, dragY, measureHero])

  const handleThemeDragMove = useCallback((x: number, y: number) => {
    // Position is already updated on the UI thread — only check hover here.
    setHeroDropHover(pointInHero(x, y))
  }, [pointInHero])

  const handleThemeDragDrop = useCallback((x: number, y: number, theme: AdaptiveTheme) => {
    if (pointInHero(x, y)) setActiveTheme(theme.id)
    setDragState(null)
    setHeroDropHover(false)
  }, [pointInHero, setActiveTheme])

  const handleAlbumDragStart = useCallback((song: Song, x: number, y: number) => {
    measureHero()
    dragX.value = x
    dragY.value = y
    setDragState({ payload: { kind: 'album', song } })
  }, [dragX, dragY, measureHero])

  const handleAlbumDragMove = useCallback((x: number, y: number) => {
    setHeroDropHover(pointInHero(x, y))
  }, [pointInHero])

  const handleAlbumDragDrop = useCallback((x: number, y: number, song: Song) => {
    if (pointInHero(x, y)) addThemeFromAlbum(song)
    setDragState(null)
    setHeroDropHover(false)
  }, [addThemeFromAlbum, pointInHero])

  const cancelDrag = useCallback(() => {
    setDragState(null)
    setHeroDropHover(false)
  }, [])

  const openSong = (songId: string) => {
    playSongAt(songId)
    router.push('/now-playing')
  }

  const hue = heroDisplay.hue
  const gradientIntensity = adaptiveEnabled ? gradientIntensityForTheme(activeTheme) : 1

  // Adaptive: start at C.bg (exactly matching heroInnerGradient's solid end),
  // hold it until just past the hero bottom, then bloom into the theme colour.
  // Both sides of the hero boundary are the same value → the line disappears.
  // Non-adaptive: simple dark neutral fade, no colour cast.
  const scrollBgColors = adaptiveEnabled
    ? [
        C.bg,
        C.bg,
        tintFromHue(hue, 0.52 * gradientIntensity),
        tintFromHue(hue, 0.32 * gradientIntensity),
        tintFromHue(hue, 0.10 * gradientIntensity),
        'transparent',
      ]
    : [
        tintFromHue(hue, 0.22),
        tintFromHue(hue, 0.10),
        'rgba(12,10,10,0.55)',
        'rgba(10,10,10,0.85)',
        C.bg,
        C.bg,
      ]

  // Inner gradient over the SHARP hero image:
  //   • dark at top for status-bar legibility
  //   • fully transparent in the middle so the image is razor-sharp
  //   • ends at C.bg in adaptive mode so there is a seamless, invisible join
  //     between the hero bottom and the hue-gradient screen background beneath
  const heroInnerGradient = adaptiveEnabled
    ? [
        'rgba(0,0,0,0.32)',
        'rgba(0,0,0,0.14)',
        'transparent',
        tintFromHue(hue, 0.04),
        tintFromHue(hue, 0.10),
        tintFromHue(hue, 0.18),
        'rgba(10,10,10,0.52)',
        'rgba(10,10,10,0.82)',
        C.bg,
      ]
    : [
        'rgba(0,0,0,0.28)',
        'rgba(0,0,0,0.10)',
        'transparent',
        tintFromHue(hue, 0.04),
        tintFromHue(hue, 0.12),
        tintFromHue(hue, 0.24),
        'rgba(10,10,10,0.52)',
        'rgba(10,10,10,0.82)',
        'rgba(10,10,10,0.95)',
        C.bg,
      ]

  // Adaptive: hold C.bg from 0→0.40 (covers the hero area), then bloom 0.40→0.56,
  // fade back to transparent by the bottom of the page.
  // Non-adaptive: quick dark fade, no colour cast.
  const scrollGradientLocations = adaptiveEnabled
    ? [0, 0.40, 0.56, 0.70, 0.85, 1] as const
    : [0, 0.15, 0.30, 0.48, 0.65, 1] as const

  const heroGradientLocations = adaptiveEnabled
    ? [0, 0.06, 0.22, 0.38, 0.52, 0.65, 0.76, 0.89, 1] as const
    : [0, 0.06, 0.22, 0.36, 0.50, 0.63, 0.74, 0.87, 0.95, 1] as const

  const isOliviaSuperFan = adaptiveEnabled && isOliviaSuperFanTheme(activeTheme)
  const isKpopTheme = adaptiveEnabled && activeTheme?.id === 'kpop'
  const isLoveIslandTheme = adaptiveEnabled && activeTheme?.id === 'love-island'
  const oliviaTopSong = songs.find(s => s.id === OLIVIA_TOP_TRACK.songId)
  const oliviaPodcastList = isOliviaSuperFan ? OLIVIA_PODCASTS : podcasts

  // Hannah Journey: dedicated stage landings (Figma 2715-20026 / 20236 / 20447).
  if (isHannahJourney) {
    return <HannahJourneyLanding />
  }

  // "Create your own" profiles on the Latest version get the current design —
  // the same visual system as the Hannah Journey landing, tailored to the
  // artists picked at creation and fully populated with the classic home's
  // discovery rails. Older prototype versions (1–3) keep their original
  // layouts below for comparison. Hannah Journey's own landing is untouched.
  if (activeProfile.id === 'custom' && (activeProfile.prototypeVersion ?? 4) === 4) {
    return <CustomProfileLanding />
  }

  // Adaptive personas get the redesigned JTBD landing page; the casual persona
  // (KSM) gets the generic Amazon-teal variant; the baseline (Derbc Studios,
  // Adaptive UI off) keeps the original home below unchanged. Rabiat (engaged
  // listener, Latin) now shares the same persona-home interface as Celine
  // instead of her old bespoke demo layout. Hannah moved back to the baseline
  // layout too (v5) — no featured-artist hero, no session rail — but keeps
  // "You and your favorites" and fixed Rihanna/Taylor Swift Deep Dive rails,
  // spliced into the baseline below.
  if (adaptiveEnabled && !isHannah) {
    return activeProfile.casual ? <CasualHome /> : <AdaptivePersonaHome />
  }

  return (
    <View style={s.screen}>
      <LinearGradient
        colors={scrollBgColors as [string, string, ...string[]]}
        locations={[...scrollGradientLocations]}
        style={s.scrollBgGradient}
        pointerEvents="none"
      />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        style={{ backgroundColor: 'transparent' }}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <View
          ref={heroRef}
          style={[s.heroWrap, !adaptiveEnabled && s.heroWrapDefault, heroDropHover && s.heroWrapHover]}
          onLayout={measureHero}
        >
          <ImageBackground
            source={heroArt}
            style={s.heroBg}
            resizeMode="cover"
            alt=""
          >
            <LinearGradient
              colors={heroInnerGradient as [string, string, ...string[]]}
              locations={[...heroGradientLocations]}
              style={StyleSheet.absoluteFill}
            />

            <View style={s.heroInner}>
              <LinearGradient
                colors={['rgba(0,0,0,0.22)', 'transparent']}
                style={[s.statusBarFade, { height: stickyHeaderHeight }]}
                pointerEvents="none"
              />

              <View style={s.heroContent}>
                <View style={{ flex: 1 }}>
                  <Text style={s.heroEyebrow}>{heroDisplay.eyebrow}</Text>
                  <Text style={s.heroTitle}>{heroDisplay.title}</Text>
                  <Text style={s.heroSub} numberOfLines={2}>
                    {heroDisplay.subtitle}
                  </Text>
                </View>
                <TouchableOpacity
                  style={s.heroPlayBtn}
                  onPress={() => openSong(heroFirstSong.id)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="play" size={22} color="#000" style={{ marginLeft: 2 }} />
                </TouchableOpacity>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* Adaptive theme selector intentionally not shown at the top — the
            adaptive UI auto-loads a context/time-appropriate theme
            (pickTimeAppropriateTheme). AdaptiveThemePills remains available to
            drop in lower on the page as a "more genres" browser if wanted. */}

        {isKpopTheme && (
          <TouchableOpacity
            style={s.borahaeCard}
            activeOpacity={0.85}
            onPress={() => router.push(`/playlist/${KPOP_BORAHAE_PLAYLIST.playlistId}` as any)}
          >
            <LinearGradient
              colors={[...KPOP_BORAHAE_PLAYLIST.accentColors]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.borahaeGradient}
            >
              <View style={s.borahaeContent}>
                <View style={{ flex: 1 }}>
                  <Text style={s.borahaeEyebrow}>{KPOP_BORAHAE_PLAYLIST.eyebrow}</Text>
                  <Text style={s.borahaeTitle}>{KPOP_BORAHAE_PLAYLIST.title}</Text>
                  <Text style={s.borahaeSub}>{KPOP_BORAHAE_PLAYLIST.subtitle}</Text>
                  <Text style={s.borahaeMeta}>{KPOP_BORAHAE_PLAYLIST.meta}</Text>
                </View>
                <TouchableOpacity
                  style={s.borahaePlayBtn}
                  onPress={() => openSong(KPOP_BORAHAE_PLAYLIST.songId)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="play" size={20} color="#fff" style={{ marginLeft: 2 }} />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {isOliviaSuperFan && (
          <View style={s.oliviaTopBanner}>
            <Ionicons name="star" size={18} color={C.cyan} />
            <Text style={s.oliviaTopBannerText}>
              You're in the <Text style={s.oliviaTopBannerBold}>top 1%</Text> of Olivia Rodrigo fans on Amazon Music
            </Text>
          </View>
        )}

        {isOliviaSuperFan && oliviaTopSong && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Your #1 Olivia track</Text>
            <TouchableOpacity
              style={s.oliviaFavRow}
              onPress={() => openSong(oliviaTopSong.id)}
              activeOpacity={0.85}
            >
              <View style={s.oliviaFavArtWrap}>
                {resolveBannerArt(OLIVIA_TOP_TRACK.artKey) ? (
                  <Image source={resolveBannerArt(OLIVIA_TOP_TRACK.artKey)!} style={s.oliviaFavArt} resizeMode="cover" />
                ) : (
                  <View style={[s.oliviaFavArt, { backgroundColor: oliviaTopSong.albumArtColor }]}>
                    <Ionicons name="musical-note" size={22} color="rgba(255,255,255,0.2)" />
                  </View>
                )}
                <View style={s.oliviaFavPlayPos}>
                  <PlayOverlay size={28} />
                </View>
              </View>
              <View style={s.oliviaFavInfo}>
                <Text style={s.oliviaFavTitle} numberOfLines={1}>{OLIVIA_TOP_TRACK.title}</Text>
                <Text style={s.oliviaFavSub}>You've played this {OLIVIA_TOP_TRACK.playCount} times</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View style={s.section}>
          <Text style={s.sectionTitle}>{sectionLabel('songsForYou', 'Songs for You')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="normal"
            snapToOffsets={songSnapOffsets}
            snapToAlignment="start"
            disableIntervalMomentum={false}
            nestedScrollEnabled
            contentContainerStyle={[s.songsScrollContent, { paddingRight: songPagePeek }]}
          >
            {songPages.map((page, pageIdx) => (
              <View key={`page-${pageIdx}`} style={[s.songsPage, { width: songPageWidth }]}>
                {page.map(song => {
                  const art = song.albumArtPath ? albumArtAssets[song.albumArtPath] : null
                  return (
                    <TouchableOpacity
                      key={song.id}
                      style={s.songRow}
                      onPress={() => openSong(song.id)}
                      onLongPress={() => openAdaptiveMenu({ kind: 'song', song })}
                      delayLongPress={400}
                      activeOpacity={0.75}
                    >
                      {art ? (
                        <Image source={art} style={s.songRowArt} resizeMode="cover" />
                      ) : (
                        <View style={[s.songRowArt, { backgroundColor: song.albumArtColor }]}>
                          <Ionicons name="musical-note" size={18} color="rgba(255,255,255,0.2)" />
                        </View>
                      )}
                      <View style={s.songRowInfo}>
                        <View style={s.songTitleRow}>
                          <Text style={[s.songRowTitle, s.songTitleFlex]} numberOfLines={1}>{song.title}</Text>
                          {song.isExclusive && (
                            <Text style={s.exclusiveBadgeText}>EXCLUSIVE</Text>
                          )}
                        </View>
                        <Text style={s.songRowArtist} numberOfLines={1}>{song.artistName}</Text>
                      </View>
                    </TouchableOpacity>
                  )
                })}
              </View>
            ))}
          </ScrollView>
        </View>

        {isLoveIslandTheme && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            nestedScrollEnabled
            contentContainerStyle={s.hRailContent}
            style={s.loveIslandRail}
          >
            <TouchableOpacity
              style={[s.villaCard, { width: loveIslandCardWidth }]}
              activeOpacity={0.85}
              onPress={() => router.push(`/playlist/${LOVE_ISLAND_VILLA_PLAYLIST.playlistId}` as any)}
            >
              <LinearGradient
                colors={[...LOVE_ISLAND_VILLA_PLAYLIST.accentColors]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.villaGradient}
              >
                <View style={s.villaContent}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.villaEyebrow}>{LOVE_ISLAND_VILLA_PLAYLIST.eyebrow}</Text>
                    <Text style={s.villaTitle}>{LOVE_ISLAND_VILLA_PLAYLIST.title}</Text>
                    <Text style={s.villaSub}>{LOVE_ISLAND_VILLA_PLAYLIST.subtitle}</Text>
                    <Text style={s.villaMeta}>{LOVE_ISLAND_VILLA_PLAYLIST.meta}</Text>
                  </View>
                  <TouchableOpacity
                    style={s.villaPlayBtn}
                    onPress={() => openSong(LOVE_ISLAND_VILLA_PLAYLIST.songId)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="play" size={20} color="#5C3800" style={{ marginLeft: 2 }} />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.islandCastCard, { width: loveIslandCardWidth }]}
              activeOpacity={0.85}
              onPress={() => router.push(`/playlist/${LOVE_ISLAND_CAST_PLAYLIST.playlistId}` as any)}
            >
              <Image
                source={albumArtAssets[LOVE_ISLAND_CAST_PLAYLIST.artKey]}
                style={s.islandCastImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.92)']}
                locations={[0.35, 0.65, 1]}
                style={s.islandCastGradient}
                pointerEvents="none"
              />
              <View style={s.islandCastTextWrap}>
                <Text style={s.islandCastEyebrow}>{LOVE_ISLAND_CAST_PLAYLIST.eyebrow}</Text>
                <Text style={s.islandCastTitle}>{LOVE_ISLAND_CAST_PLAYLIST.title}</Text>
                <Text style={s.islandCastSub}>{LOVE_ISLAND_CAST_PLAYLIST.subtitle}</Text>
                <Text style={s.islandCastMeta}>{LOVE_ISLAND_CAST_PLAYLIST.meta}</Text>
              </View>
              <TouchableOpacity
                style={s.islandCastPlayBtn}
                onPress={() => openSong(LOVE_ISLAND_CAST_PLAYLIST.songId)}
                activeOpacity={0.85}
              >
                <Ionicons name="play" size={20} color="#fff" style={{ marginLeft: 2 }} />
              </TouchableOpacity>
            </TouchableOpacity>
          </ScrollView>
        )}

        <View style={s.section}>
          <Text style={s.sectionTitle}>{sectionLabel('continueListening', 'Continue Listening')}</Text>
          <EdgeFadeRow>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              nestedScrollEnabled
              contentContainerStyle={s.hRailContent}
            >
              {continueListening.map(item => {
                const art = item.artKey ? resolveBannerArt(item.artKey) : null
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={s.continueCard}
                    onPress={() =>
                      item.podcastId
                        ? router.push(`/podcast-show/${item.podcastId}` as any)
                        : item.songId && openSong(item.songId)
                    }
                    activeOpacity={0.85}
                  >
                    <View style={s.continueArtWrap}>
                      {art ? (
                        <Image source={art} style={s.continueArt} resizeMode="cover" />
                      ) : (
                        <View style={[s.continueArt, { backgroundColor: C.surface }]}>
                          <Ionicons name="musical-note" size={28} color="rgba(255,255,255,0.15)" />
                        </View>
                      )}
                      <View style={s.continuePlayPos}>
                        <PlayOverlay size={30} />
                      </View>
                    </View>
                    <Text style={s.continueTitle} numberOfLines={2}>{item.title}</Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </EdgeFadeRow>
        </View>

        {isHannah && favoriteInsights.length > 0 && (
          <View style={s.section}>
            <View style={s.favoritesHeadRow}>
              <Text style={s.favoritesTitle}>You and your favorites</Text>
              <TouchableOpacity onPress={() => router.push('/music')} activeOpacity={0.7}>
                <Text style={s.seeMoreText}>SEE MORE</Text>
              </TouchableOpacity>
            </View>
            <EdgeFadeRow>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hRailContent} nestedScrollEnabled>
                {favoriteInsights.map(item => {
                  const art = resolveArtistAvatar(item.artist.id, item.artist.imageUri)
                  return (
                    <TouchableOpacity
                      key={item.artist.id}
                      style={s.insightCard}
                      activeOpacity={0.85}
                      onPress={() => router.push(`/artist/${item.artist.id}` as any)}
                    >
                      {art ? (
                        <Image source={art} style={StyleSheet.absoluteFill} resizeMode="cover" />
                      ) : (
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: C.surface }]} />
                      )}
                      <LinearGradient
                        colors={['rgba(0,0,0,0.55)', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0.6)']}
                        locations={[0, 0.5, 1]}
                        style={StyleSheet.absoluteFill}
                      />
                      <View style={s.insightHead}>
                        <View style={s.insightAvatarWrap}>
                          {art ? <Image source={art} style={s.insightAvatar} resizeMode="cover" /> : <View style={[s.insightAvatar, { backgroundColor: C.surface }]} />}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={s.insightTag}>{item.tag}</Text>
                          <Text style={s.insightName} numberOfLines={1}>{item.artist.name}</Text>
                        </View>
                      </View>
                      <View style={s.insightBody}>
                        <Text style={s.insightMonth}>THIS MONTH</Text>
                        <Text style={s.insightCaption} numberOfLines={2}>{item.caption}</Text>
                        <ListeningHeatmap seed={item.seed} />
                      </View>
                    </TouchableOpacity>
                  )
                })}
              </ScrollView>
            </EdgeFadeRow>
          </View>
        )}

        {isOliviaSuperFan && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Olivia Rodrigo news</Text>
            <TouchableOpacity style={s.oliviaNewsCard} activeOpacity={0.85}>
              <View style={s.oliviaNewsAccent} />
              <View style={s.oliviaNewsBody}>
                <Text style={s.oliviaNewsHeadline}>{OLIVIA_NEWS.headline}</Text>
                <Text style={s.oliviaNewsSub} numberOfLines={2}>{OLIVIA_NEWS.body}</Text>
                <Text style={s.oliviaNewsDate}>{OLIVIA_NEWS.date}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={C.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

        <View style={s.section}>
          <Text style={s.sectionTitle}>
            {isOliviaSuperFan ? 'Podcasts about Olivia' : sectionLabel('podcastsForYou', 'Podcasts you may like')}
          </Text>
          <EdgeFadeRow>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              nestedScrollEnabled
              contentContainerStyle={s.hRailContent}
            >
              {oliviaPodcastList.map(pod => {
                const art = pod.coverArtPath ? resolveBannerArt(pod.coverArtPath) : null
                const coverColor = 'coverColor' in pod ? pod.coverColor : C.surface
                const host = 'host' in pod ? pod.host : ''
                return (
                  <TouchableOpacity
                    key={pod.id}
                    style={s.podcastCard}
                    activeOpacity={0.85}
                    onPress={() => router.push(`/podcast-show/${pod.id}` as any)}
                  >
                    <View style={s.podcastArtWrap}>
                      {art ? (
                        <Image source={art} style={s.podcastArt} resizeMode="cover" />
                      ) : (
                        <View style={[s.podcastArt, { backgroundColor: coverColor }]}>
                          <Ionicons name="mic" size={32} color="rgba(255,255,255,0.2)" />
                        </View>
                      )}
                      <View style={s.podcastMicBadge}>
                        <Ionicons name="mic-outline" size={13} color="#fff" />
                      </View>
                    </View>
                    <Text style={s.podcastTitle} numberOfLines={2}>{pod.title}</Text>
                    <Text style={s.podcastHost} numberOfLines={1}>{host}</Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </EdgeFadeRow>
        </View>

        {isOliviaSuperFan && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Unlocked for top fans</Text>
            <TouchableOpacity
              style={s.oliviaExclusiveRow}
              onPress={() => openSong('s-or4')}
              activeOpacity={0.85}
            >
              <View style={s.oliviaExclusiveArtWrap}>
                {resolveBannerArt(OLIVIA_EXCLUSIVE_TRACK.artKey) ? (
                  <Image source={resolveBannerArt(OLIVIA_EXCLUSIVE_TRACK.artKey)!} style={s.oliviaExclusiveArt} resizeMode="cover" />
                ) : (
                  <View style={[s.oliviaExclusiveArt, { backgroundColor: '#3a2030' }]}>
                    <Ionicons name="musical-note" size={22} color="rgba(255,255,255,0.2)" />
                  </View>
                )}
                <View style={s.oliviaExclusiveBadge}>
                  <Ionicons name="lock-open" size={12} color="#fff" />
                </View>
              </View>
              <View style={s.oliviaExclusiveInfo}>
                <Text style={s.oliviaExclusiveTitle} numberOfLines={1}>{OLIVIA_EXCLUSIVE_TRACK.title}</Text>
                <Text style={s.oliviaExclusiveSub} numberOfLines={2}>{OLIVIA_EXCLUSIVE_TRACK.subtitle}</Text>
              </View>
              <PlayOverlay size={32} />
            </TouchableOpacity>
          </View>
        )}

        <View style={s.section}>
          <Text style={s.sectionTitle}>{sectionLabel('albumsForYou', 'Albums for you')}</Text>
          <EdgeFadeRow>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hRailContent}>
              {albumsForYou.map(album => (
                <DraggableAlbumCard
                  key={album.id}
                  album={album}
                  adaptiveEnabled={adaptiveEnabled}
                  onOpen={() => router.push(`/album/song-album-${album.id}` as any)}
                  onDragStart={handleAlbumDragStart}
                  onDragMove={handleAlbumDragMove}
                  onDragDrop={handleAlbumDragDrop}
                  onDragCancel={cancelDrag}
                  dragX={dragX}
                  dragY={dragY}
                />
              ))}
            </ScrollView>
          </EdgeFadeRow>
        </View>

        <ShowsYouWatchRail />

        <View style={s.section}>
          <Text style={s.sectionTitle}>{sectionLabel('frequentPlays', 'Your Top Artists')}</Text>
          <EdgeFadeRow>
            <HRail
              data={featuredArtists}
              keyExtractor={(artist) => artist.id}
              contentContainerStyle={s.artistRailContent}
              renderItem={({ item: artist }) => {
                const art = resolveArtistAvatar(artist.id, artist.imageUri)
                return (
                  <TouchableOpacity
                    style={s.artistCircle}
                    activeOpacity={0.85}
                    onPress={() => router.push(`/artist/${artist.id}` as any)}
                    onLongPress={() =>
                      openAdaptiveMenu({
                        kind: 'artist',
                        artistId: artist.id,
                        name: artist.name,
                        imageUri: artist.imageUri,
                      })
                    }
                    delayLongPress={400}
                  >
                    {art ? (
                      <Image source={art} style={s.artistAvatar} resizeMode="cover" />
                    ) : (
                      <View style={[s.artistAvatar, { backgroundColor: C.surface }]}>
                        <Ionicons name="person" size={40} color="rgba(255,255,255,0.2)" />
                      </View>
                    )}
                    <Text style={s.artistName} numberOfLines={1}>{artist.name}</Text>
                  </TouchableOpacity>
                )
              }}
            />
          </EdgeFadeRow>
          <Text style={s.popularTracksTitle}>Popular Tracks</Text>
          <EdgeFadeRow>
            <HRail
              data={frequentPlays}
              keyExtractor={(song) => song.id}
              contentContainerStyle={s.hRailContent}
              renderItem={({ item: song }) => {
                const art = song.albumArtPath ? albumArtAssets[song.albumArtPath] : null
                return (
                  <TouchableOpacity
                    style={s.continueCard}
                    onPress={() => openSong(song.id)}
                    onLongPress={() => openAdaptiveMenu({ kind: 'song', song })}
                    delayLongPress={400}
                    activeOpacity={0.85}
                  >
                    <View style={s.continueArtWrap}>
                      {art ? (
                        <Image source={art} style={s.continueArt} resizeMode="cover" />
                      ) : (
                        <View style={[s.continueArt, { backgroundColor: song.albumArtColor }]}>
                          <Ionicons name="musical-note" size={28} color="rgba(255,255,255,0.15)" />
                        </View>
                      )}
                    </View>
                    <View style={s.songTitleRow}>
                      <Text style={[s.continueTitle, s.songTitleFlex]} numberOfLines={2}>{song.title}</Text>
                      {song.isExclusive && (
                        <Text style={s.exclusiveBadgeText}>EXCLUSIVE</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                )
              }}
            />
          </EdgeFadeRow>
        </View>

        {(!adaptiveEnabled || isHannah || activeTheme?.id === 'chill' || activeTheme?.id === 'jazz') && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Rising & global sounds</Text>
            <Text style={s.frequentSubLabel}>Artists you might not know yet</Text>
            <EdgeFadeRow>
              <HRail
                data={hiddenGems}
                keyExtractor={(artist) => artist.id}
                contentContainerStyle={s.artistRailContent}
                renderItem={({ item: artist }) => {
                  const art = resolveArtistAvatar(artist.id, artist.imageUri)
                  return (
                    <TouchableOpacity
                      style={s.artistCircle}
                      activeOpacity={0.85}
                      onPress={() => router.push(`/artist/${artist.id}` as any)}
                      onLongPress={() =>
                        openAdaptiveMenu({
                          kind: 'artist',
                          artistId: artist.id,
                          name: artist.name,
                          imageUri: artist.imageUri,
                        })
                      }
                      delayLongPress={400}
                    >
                      {art ? (
                        <Image source={art} style={s.artistAvatar} resizeMode="cover" />
                      ) : (
                        <View style={[s.artistAvatar, { backgroundColor: C.surface }]}>
                          <Ionicons name="person" size={40} color="rgba(255,255,255,0.2)" />
                        </View>
                      )}
                      <Text style={s.artistName} numberOfLines={1}>{artist.name}</Text>
                    </TouchableOpacity>
                  )
                }}
              />
            </EdgeFadeRow>
          </View>
        )}

        <View style={s.section}>
          <Text style={s.sectionTitle}>{sectionLabel('popularInCity', 'Popular in your city')}</Text>
          <EdgeFadeRow>
            <HRail
              data={popularInCity}
              keyExtractor={(song) => song.id}
              contentContainerStyle={s.hRailContent}
              renderItem={({ item: song }) => {
                const art = song.albumArtPath ? albumArtAssets[song.albumArtPath] : null
                return (
                  <TouchableOpacity
                    style={s.albumCard}
                    onPress={() => openSong(song.id)}
                    activeOpacity={0.85}
                  >
                    <View style={s.albumArtWrap}>
                      {art ? (
                        <Image source={art} style={s.albumArt} resizeMode="cover" />
                      ) : (
                        <View style={[s.albumArt, { backgroundColor: song.albumArtColor }]}>
                          <Ionicons name="musical-note" size={28} color="rgba(255,255,255,0.15)" />
                        </View>
                      )}
                    </View>
                    <View style={s.songTitleRow}>
                      <Text style={[s.albumTitle, s.songTitleFlex]} numberOfLines={1}>{song.title}</Text>
                      {song.isExclusive && (
                        <Text style={s.exclusiveBadgeText}>EXCLUSIVE</Text>
                      )}
                    </View>
                    <Text style={s.albumArtist} numberOfLines={1}>{song.artistName}</Text>
                  </TouchableOpacity>
                )
              }}
            />
          </EdgeFadeRow>
        </View>

        {isOliviaSuperFan && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Your Olivia collection</Text>
            <EdgeFadeRow>
              <HRail
                data={OLIVIA_MERCH}
                keyExtractor={(item) => item.id}
                contentContainerStyle={s.hRailContent}
                renderItem={({ item }) => {
                  const art = resolveBannerArt(item.artKey)
                  return (
                    <TouchableOpacity style={s.oliviaMerchCard} activeOpacity={0.85}>
                      {art ? (
                        <Image source={art} style={s.oliviaMerchArt} resizeMode="cover" />
                      ) : (
                        <View style={[s.oliviaMerchArt, { backgroundColor: C.surface }]}>
                          <Ionicons name="shirt-outline" size={28} color="rgba(255,255,255,0.2)" />
                        </View>
                      )}
                      <Text style={s.oliviaMerchLabel} numberOfLines={2}>{item.label}</Text>
                    </TouchableOpacity>
                  )
                }}
              />
            </EdgeFadeRow>
          </View>
        )}

        <View style={s.section}>
          <View style={s.sectionHeaderRow}>
            <Text style={s.sectionTitleInline}>{sectionLabel('myMixes', 'My Mixes')}</Text>
          </View>
          <Text style={s.sectionSubtitle}>Updated at 6:00 AM</Text>
          <EdgeFadeRow>
            <HRail
              data={MY_MIXES}
              keyExtractor={(mix) => mix.id}
              contentContainerStyle={s.hRailContent}
              renderItem={({ item: mix }) => {
                const art = mix.coverArtPath ? albumArtAssets[mix.coverArtPath] : null
                return (
                  <TouchableOpacity
                    style={s.continueCard}
                    activeOpacity={0.85}
                    onPress={() => router.push(`/playlist/${mix.id}` as any)}
                    onLongPress={() => openAdaptiveMenu({ kind: 'playlist', playlist: mix })}
                    delayLongPress={400}
                  >
                    <View style={s.continueArtWrap}>
                      {art ? (
                        <Image source={art} style={s.continueArt} resizeMode="cover" />
                      ) : (
                        <View style={[s.continueArt, { backgroundColor: C.surface }]}>
                          <Ionicons name="musical-notes" size={28} color="rgba(255,255,255,0.15)" />
                        </View>
                      )}
                      <View style={s.continuePlayPos}>
                        <PlayOverlay size={30} />
                      </View>
                    </View>
                    <Text style={s.continueTitle} numberOfLines={2}>{mix.name}</Text>
                  </TouchableOpacity>
                )
              }}
            />
          </EdgeFadeRow>
        </View>

        {/* ── Endless-scroll filler — the deeper you scroll, the more the wider
            catalog surfaces. Deliberately generic / not theme-tailored. ── */}

        {newReleases.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>New Releases For You</Text>
            <EdgeFadeRow>
              <HRail
                data={newReleases}
                keyExtractor={(song) => song.id}
                contentContainerStyle={s.hRailContent}
                renderItem={({ item: song }) => {
                  const art = song.albumArtPath ? albumArtAssets[song.albumArtPath] : null
                  return (
                    <TouchableOpacity
                      style={s.continueCard}
                      onPress={() => openSong(song.id)}
                      onLongPress={() => openAdaptiveMenu({ kind: 'song', song })}
                      delayLongPress={400}
                      activeOpacity={0.85}
                    >
                      <View style={s.continueArtWrap}>
                        {art ? (
                          <Image source={art} style={s.continueArt} resizeMode="cover" />
                        ) : (
                          <View style={[s.continueArt, { backgroundColor: song.albumArtColor }]}>
                            <Ionicons name="musical-note" size={28} color="rgba(255,255,255,0.15)" />
                          </View>
                        )}
                      </View>
                      <Text style={s.continueTitle} numberOfLines={2}>{song.title}</Text>
                    </TouchableOpacity>
                  )
                }}
              />
            </EdgeFadeRow>
          </View>
        )}

        {recentlyPlayed.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Recently Played</Text>
            <EdgeFadeRow>
              <HRail
                data={recentlyPlayed}
                keyExtractor={(song) => song.id}
                contentContainerStyle={s.hRailContent}
                renderItem={({ item: song }) => {
                  const art = song.albumArtPath ? albumArtAssets[song.albumArtPath] : null
                  return (
                    <TouchableOpacity
                      style={s.continueCard}
                      onPress={() => openSong(song.id)}
                      onLongPress={() => openAdaptiveMenu({ kind: 'song', song })}
                      delayLongPress={400}
                      activeOpacity={0.85}
                    >
                      <View style={s.continueArtWrap}>
                        {art ? (
                          <Image source={art} style={s.continueArt} resizeMode="cover" />
                        ) : (
                          <View style={[s.continueArt, { backgroundColor: song.albumArtColor }]}>
                            <Ionicons name="musical-note" size={28} color="rgba(255,255,255,0.15)" />
                          </View>
                        )}
                      </View>
                      <Text style={s.continueTitle} numberOfLines={2}>{song.title}</Text>
                    </TouchableOpacity>
                  )
                }}
              />
            </EdgeFadeRow>
          </View>
        )}

        {isHannah ? (
          <>
            {[
              { title: 'Deep Dive: Rihanna', list: deepDiveRihannaSongs },
              { title: 'Deep Dive: Taylor Swift', list: deepDiveTaylorSongs },
            ].map(({ title, list }) =>
              list.length > 0 && (
                <View style={s.section} key={title}>
                  <Text style={s.sectionTitle}>{title}</Text>
                  <Text style={s.frequentSubLabel}>More from an artist you follow</Text>
                  <EdgeFadeRow>
                    <HRail
                      data={list}
                      keyExtractor={(song) => song.id}
                      contentContainerStyle={s.hRailContent}
                      renderItem={({ item: song }) => {
                        const art = song.albumArtPath ? albumArtAssets[song.albumArtPath] : null
                        return (
                          <TouchableOpacity
                            style={s.continueCard}
                            onPress={() => openSong(song.id)}
                            onLongPress={() => openAdaptiveMenu({ kind: 'song', song })}
                            delayLongPress={400}
                            activeOpacity={0.85}
                          >
                            <View style={s.continueArtWrap}>
                              {art ? (
                                <Image source={art} style={s.continueArt} resizeMode="cover" />
                              ) : (
                                <View style={[s.continueArt, { backgroundColor: song.albumArtColor }]}>
                                  <Ionicons name="musical-note" size={28} color="rgba(255,255,255,0.15)" />
                                </View>
                              )}
                            </View>
                            <Text style={s.continueTitle} numberOfLines={2}>{song.title}</Text>
                          </TouchableOpacity>
                        )
                      }}
                    />
                  </EdgeFadeRow>
                </View>
              ),
            )}
          </>
        ) : (
          deepDiveSongs.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Deep Dive: {deepDiveArtist.name}</Text>
              <Text style={s.frequentSubLabel}>More from an artist you follow</Text>
              <EdgeFadeRow>
                <HRail
                  data={deepDiveSongs}
                  keyExtractor={(song) => song.id}
                  contentContainerStyle={s.hRailContent}
                  renderItem={({ item: song }) => {
                    const art = song.albumArtPath ? albumArtAssets[song.albumArtPath] : null
                    return (
                      <TouchableOpacity
                        style={s.continueCard}
                        onPress={() => openSong(song.id)}
                        onLongPress={() => openAdaptiveMenu({ kind: 'song', song })}
                        delayLongPress={400}
                        activeOpacity={0.85}
                      >
                        <View style={s.continueArtWrap}>
                          {art ? (
                            <Image source={art} style={s.continueArt} resizeMode="cover" />
                          ) : (
                            <View style={[s.continueArt, { backgroundColor: song.albumArtColor }]}>
                              <Ionicons name="musical-note" size={28} color="rgba(255,255,255,0.15)" />
                            </View>
                          )}
                        </View>
                        <Text style={s.continueTitle} numberOfLines={2}>{song.title}</Text>
                      </TouchableOpacity>
                    )
                  }}
                />
              </EdgeFadeRow>
            </View>
          )
        )}

        {specialAudioSongs.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Special Audio Albums</Text>
            <Text style={s.frequentSubLabel}>Dolby Atmos & 360 Reality Audio</Text>
            <EdgeFadeRow>
              <HRail
                data={specialAudioSongs}
                keyExtractor={(song) => song.id}
                contentContainerStyle={s.hRailContent}
                renderItem={({ item: song }) => {
                  const art = song.albumArtPath ? albumArtAssets[song.albumArtPath] : null
                  return (
                    <TouchableOpacity
                      style={s.continueCard}
                      onPress={() => openSong(song.id)}
                      onLongPress={() => openAdaptiveMenu({ kind: 'song', song })}
                      delayLongPress={400}
                      activeOpacity={0.85}
                    >
                      <View style={s.continueArtWrap}>
                        {art ? (
                          <Image source={art} style={s.continueArt} resizeMode="cover" />
                        ) : (
                          <View style={[s.continueArt, { backgroundColor: song.albumArtColor }]}>
                            <Ionicons name="musical-note" size={28} color="rgba(255,255,255,0.15)" />
                          </View>
                        )}
                      </View>
                      <View style={s.songTitleRow}>
                        <Text style={[s.continueTitle, s.songTitleFlex]} numberOfLines={2}>{song.title}</Text>
                        <Text style={s.exclusiveBadgeText}>{song.audioBadge === '360_REALITY_AUDIO' ? '360 AUDIO' : 'ATMOS'}</Text>
                      </View>
                    </TouchableOpacity>
                  )
                }}
              />
            </EdgeFadeRow>
          </View>
        )}

        <View style={s.section}>
          <Text style={s.sectionTitle}>Stations For You</Text>
          <Text style={s.frequentSubLabel}>Hot picks, playing now</Text>
          <EdgeFadeRow>
            <HRail
              data={RADIO_STATIONS}
              keyExtractor={(station) => station.id}
              contentContainerStyle={s.hRailContent}
              renderItem={({ item: station }) => {
                const art = albumArtAssets[station.artKey] ?? null
                return (
                  <TouchableOpacity
                    style={s.continueCard}
                    onPress={() => openSong(station.songId)}
                    activeOpacity={0.85}
                  >
                    <View style={s.continueArtWrap}>
                      {art ? (
                        <Image source={art} style={s.continueArt} resizeMode="cover" />
                      ) : (
                        <View style={[s.continueArt, { backgroundColor: C.surface }]} />
                      )}
                      <View style={s.radioIconBadge}>
                        <Ionicons name="radio-outline" size={16} color="#fff" />
                      </View>
                    </View>
                    <Text style={s.continueTitle} numberOfLines={2}>{station.name}</Text>
                  </TouchableOpacity>
                )
              }}
            />
          </EdgeFadeRow>
        </View>

        {summerSessionPlaylists.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Summer Sessions</Text>
            <EdgeFadeRow>
              <HRail
                data={summerSessionPlaylists}
                keyExtractor={(pl) => pl.id}
                contentContainerStyle={s.hRailContent}
                renderItem={({ item: pl }) => {
                  const art = pl.coverArtPath ? albumArtAssets[pl.coverArtPath] : null
                  return (
                    <TouchableOpacity
                      style={s.continueCard}
                      activeOpacity={0.85}
                      onPress={() => router.push(`/playlist/${pl.id}` as any)}
                      onLongPress={() => openAdaptiveMenu({ kind: 'playlist', playlist: pl })}
                      delayLongPress={400}
                    >
                      <View style={s.continueArtWrap}>
                        {art ? (
                          <Image source={art} style={s.continueArt} resizeMode="cover" />
                        ) : (
                          <View style={[s.continueArt, { backgroundColor: C.surface }]}>
                            <Ionicons name="musical-notes" size={28} color="rgba(255,255,255,0.15)" />
                          </View>
                        )}
                        <View style={s.continuePlayPos}>
                          <PlayOverlay size={30} />
                        </View>
                      </View>
                      <Text style={s.continueTitle} numberOfLines={2}>{pl.name}</Text>
                    </TouchableOpacity>
                  )
                }}
              />
            </EdgeFadeRow>
          </View>
        )}

        {oliviaFeatured.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Featured This Week</Text>
            <Text style={s.frequentSubLabel}>Because you listen to Olivia Rodrigo</Text>
            <EdgeFadeRow>
              <HRail
                data={oliviaFeatured}
                keyExtractor={(song) => song.id}
                contentContainerStyle={s.hRailContent}
                renderItem={({ item: song }) => {
                  const art = song.albumArtPath ? albumArtAssets[song.albumArtPath] : null
                  return (
                    <TouchableOpacity
                      style={s.continueCard}
                      onPress={() => openSong(song.id)}
                      onLongPress={() => openAdaptiveMenu({ kind: 'song', song })}
                      delayLongPress={400}
                      activeOpacity={0.85}
                    >
                      <View style={s.continueArtWrap}>
                        {art ? (
                          <Image source={art} style={s.continueArt} resizeMode="cover" />
                        ) : (
                          <View style={[s.continueArt, { backgroundColor: song.albumArtColor }]}>
                            <Ionicons name="musical-note" size={28} color="rgba(255,255,255,0.15)" />
                          </View>
                        )}
                      </View>
                      <Text style={s.continueTitle} numberOfLines={2}>{song.title}</Text>
                    </TouchableOpacity>
                  )
                }}
              />
            </EdgeFadeRow>
          </View>
        )}

        {trueCrimePodcasts.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>True Crime Picks</Text>
            <EdgeFadeRow>
              <HRail
                data={trueCrimePodcasts}
                keyExtractor={(pod) => pod.id}
                contentContainerStyle={s.hRailContent}
                renderItem={({ item: pod }) => {
                  const art = pod.coverArtPath ? albumArtAssets[pod.coverArtPath] : null
                  return (
                    <TouchableOpacity
                      style={s.continueCard}
                      activeOpacity={0.85}
                      onPress={() => router.push(`/podcast-show/${pod.id}` as any)}
                    >
                      <View style={s.continueArtWrap}>
                        {art ? (
                          <Image source={art} style={s.continueArt} resizeMode="cover" />
                        ) : (
                          <View style={[s.continueArt, { backgroundColor: pod.coverColor }]}>
                            <Ionicons name="mic-outline" size={28} color="rgba(255,255,255,0.2)" />
                          </View>
                        )}
                        <View style={s.podcastMicBadge}>
                          <Ionicons name="mic-outline" size={13} color="#fff" />
                        </View>
                      </View>
                      <Text style={s.continueTitle} numberOfLines={2}>{pod.title}</Text>
                    </TouchableOpacity>
                  )
                }}
              />
            </EdgeFadeRow>
          </View>
        )}

        <View style={s.section}>
          <Text style={s.sectionTitle}>Podcasts For You</Text>
          <EdgeFadeRow>
            <HRail
              data={podcastsForYou}
              keyExtractor={(pod) => pod.id}
              contentContainerStyle={s.hRailContent}
              renderItem={({ item: pod }) => {
                const art = pod.coverArtPath ? albumArtAssets[pod.coverArtPath] : null
                return (
                  <TouchableOpacity
                    style={s.continueCard}
                    activeOpacity={0.85}
                    onPress={() => router.push(`/podcast-show/${pod.id}` as any)}
                  >
                    <View style={s.continueArtWrap}>
                      {art ? (
                        <Image source={art} style={s.continueArt} resizeMode="cover" />
                      ) : (
                        <View style={[s.continueArt, { backgroundColor: pod.coverColor }]}>
                          <Ionicons name="mic-outline" size={28} color="rgba(255,255,255,0.2)" />
                        </View>
                      )}
                      <View style={s.podcastMicBadge}>
                        <Ionicons name="mic-outline" size={13} color="#fff" />
                      </View>
                    </View>
                    <Text style={s.continueTitle} numberOfLines={2}>{pod.title}</Text>
                  </TouchableOpacity>
                )
              }}
            />
          </EdgeFadeRow>
        </View>

        {morePlaylistsForYou.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeaderRow}>
              <Text style={s.sectionTitleInline}>Playlists You Might Like</Text>
            </View>
            <Text style={s.sectionSubtitle}>Fresh picks, updated every Sunday</Text>
            <EdgeFadeRow>
              <HRail
                data={morePlaylistsForYou}
                keyExtractor={(pl) => pl.id}
                contentContainerStyle={s.hRailContent}
                renderItem={({ item: pl }) => {
                  const art = pl.coverArtPath ? albumArtAssets[pl.coverArtPath] : null
                  return (
                    <TouchableOpacity
                      style={s.continueCard}
                      activeOpacity={0.85}
                      onPress={() => router.push(`/playlist/${pl.id}` as any)}
                      onLongPress={() => openAdaptiveMenu({ kind: 'playlist', playlist: pl })}
                      delayLongPress={400}
                    >
                      <View style={s.continueArtWrap}>
                        {art ? (
                          <Image source={art} style={s.continueArt} resizeMode="cover" />
                        ) : (
                          <View style={[s.continueArt, { backgroundColor: C.surface }]}>
                            <Ionicons name="musical-notes" size={28} color="rgba(255,255,255,0.15)" />
                          </View>
                        )}
                        <View style={s.continuePlayPos}>
                          <PlayOverlay size={30} />
                        </View>
                      </View>
                      <Text style={s.continueTitle} numberOfLines={2}>{pl.name}</Text>
                    </TouchableOpacity>
                  )
                }}
              />
            </EdgeFadeRow>
          </View>
        )}
      </Animated.ScrollView>

      <StickyHomeHeader
        firstName={firstName}
        activePill={null}
        onPillChange={handlePillChange}
        scrollY={scrollY}
      />

      {dragState && (
        <AdaptiveDragOverlay
          payload={dragState.payload}
          dragX={dragX}
          dragY={dragY}
        />
      )}

    </View>
  )
}

const s = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: C.bg },

  scrollBgGradient: { ...StyleSheet.absoluteFillObject, zIndex: 0 },

  heroWrap:         { marginBottom: 0 },
  heroWrapDefault:  { marginBottom: 0 },

  heroWrapHover: {
    borderWidth: 2,
    borderColor: C.cyan,
    shadowColor: C.cyan,
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  heroBg:       { width: '100%', height: 430 },
  heroInner:    { flex: 1, justifyContent: 'flex-end' },
  statusBarFade:{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 },

  heroContent:  { flexDirection: 'row', alignItems: 'flex-end', gap: 16, paddingHorizontal: 16, paddingBottom: 22 },
  heroEyebrow:  { fontSize: 10, fontWeight: '700', color: C.cyan, letterSpacing: 2, marginTop: 8, marginBottom: 12 },
  heroTitle:    { ...typeHeadline(36), color: '#fff' },
  heroSub:      { fontSize: 13, color: 'rgba(255,255,255,0.72)', marginTop: 6, lineHeight: 18 },
  heroPlayBtn:  { width: 56, height: 56, borderRadius: 28, backgroundColor: C.cyan, alignItems: 'center', justifyContent: 'center', shadowColor: C.cyan, shadowOpacity: 0.5, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },

  hjOliviaCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: C.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hjOliviaArt: { width: 56, height: 56, borderRadius: 28 },
  hjOliviaEyebrow: { fontSize: 11, fontWeight: '700', color: C.cyan, letterSpacing: 0.3, marginBottom: 2 },
  hjOliviaTitle: { ...typeHeadline(18), color: '#fff' },
  hjOliviaSub: { fontSize: 13, color: C.textSecondary, marginTop: 2 },
  hjBelongRow: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hjBelongText: { fontSize: 13, color: C.textSecondary },

  section:      { marginBottom: 28 },
  sectionTitle: { ...typeHeadline(23), color: C.textPrimary, marginBottom: 14, paddingHorizontal: 16 },
  sectionHeaderRow: { paddingHorizontal: 16 },
  sectionTitleInline: { ...typeHeadline(23), color: C.textPrimary },
  sectionSubtitle: { fontSize: 13, color: C.textSecondary, paddingHorizontal: 16, marginTop: 0, marginBottom: 14 },

  frequentSubLabel: { fontSize: 13, color: C.textSecondary, paddingHorizontal: 16, marginTop: -8, marginBottom: 12 },
  popularTracksTitle: { ...typeHeadline(18), color: C.textPrimary, paddingHorizontal: 16, marginTop: 24, marginBottom: 14 },

  // "You and your favorites" (Hannah, kept from her adaptive home)
  favoritesHeadRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 14 },
  favoritesTitle: { ...typeHeadline(23), color: C.textPrimary },
  seeMoreText: { fontSize: 13, fontWeight: '700', color: C.textMuted },
  insightCard: { width: 190, height: 190, borderRadius: 16, overflow: 'hidden', padding: 12, justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(255,255,255,0.24)' },
  insightHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  insightAvatarWrap: { width: 32, height: 32, borderRadius: 16, overflow: 'hidden' },
  insightAvatar: { width: 32, height: 32 },
  insightTag: { fontSize: 11, fontWeight: '700', color: '#fff' },
  insightName: { fontSize: 14, fontWeight: '700', color: '#fff', marginTop: 2 },
  insightBody: { gap: 4 },
  insightMonth: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.75)', letterSpacing: 0.4 },
  insightCaption: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 4 },

  songsScrollContent: { paddingLeft: 8 },
  songsPage:    { paddingRight: 8 },
  songRow:      { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  songRowArt:   { width: 56, height: 56, borderRadius: R.sm, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  songRowInfo:  { flex: 1, marginLeft: 10 },
  songRowTitle: { fontSize: 17, fontWeight: '600', color: C.textPrimary, marginBottom: 2 },
  songRowArtist:{ fontSize: 15, color: C.textSecondary },
  songTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  songTitleFlex:{ flex: 1 },
  // Amazon-style accent label (brand cyan, Ember bold) — replaces the old purple pill
  exclusiveBadgeText: { fontSize: 10, fontWeight: '700', color: C.cyan, letterSpacing: 0.5, flexShrink: 0 },

  hRailContent: { paddingHorizontal: 16, gap: 12 },

  continueCard: { width: 150 },
  continueArtWrap: { position: 'relative', marginBottom: 8 },
  continueArt:  { width: 150, height: 150, borderRadius: R.sm, overflow: 'hidden' },
  continuePlayPos: { position: 'absolute', bottom: 8, left: 8 },
  continueTitle: { fontSize: 15, fontWeight: '600', color: C.textPrimary, lineHeight: 19 },

  playOverlay: {
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  podcastCard:  { width: 200 },
  podcastArtWrap: { position: 'relative', marginBottom: 8 },
  podcastArt:   { width: 200, height: 120, borderRadius: R.sm, overflow: 'hidden' },
  podcastTitle: { fontSize: 14, fontWeight: '600', color: C.textPrimary, marginBottom: 2 },
  podcastHost:  { fontSize: 12, color: C.textSecondary },
  // Black-circle mic badge — same bottom-right treatment as the radio
  // stations' badge, so podcast cards read as clearly as station cards do.
  podcastMicBadge: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Same black-circle treatment, bottom-left (matching the radio icon's
  // existing position) so it actually pops against the album art.
  radioIconBadge: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  albumCard:    { width: 140 },
  albumArtWrap: { position: 'relative', marginBottom: 8 },
  albumArt:     { width: 140, height: 140, borderRadius: R.sm, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  albumPlayPos: { position: 'absolute', bottom: 8, left: 8 },
  albumTitle:   { fontSize: 14, fontWeight: '600', color: C.textPrimary, marginBottom: 2 },
  albumArtist:  { fontSize: 12, color: C.textSecondary },

  artistRailContent: { paddingHorizontal: 16, gap: 16 },
  artistCircle:   { width: 148, alignItems: 'center' },
  artistAvatar:   { width: 140, height: 140, borderRadius: 70, overflow: 'hidden', marginBottom: 8, alignItems: 'center', justifyContent: 'center' },
  artistName:     { fontSize: 13, fontWeight: '600', color: C.textPrimary, textAlign: 'center' },

  oliviaTopBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: R.sm,
    backgroundColor: 'rgba(107, 63, 160, 0.28)',
    borderWidth: 1,
    borderColor: 'rgba(155, 89, 182, 0.45)',
  },
  oliviaTopBannerText: { flex: 1, fontSize: 13, color: C.textPrimary, lineHeight: 18 },
  oliviaTopBannerBold: { fontWeight: '700', color: C.cyan },

  oliviaFavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 12,
    borderRadius: R.sm,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(155, 89, 182, 0.25)',
  },
  oliviaFavArtWrap: { position: 'relative' },
  oliviaFavArt: { width: 64, height: 64, borderRadius: R.sm, overflow: 'hidden' },
  oliviaFavPlayPos: { position: 'absolute', bottom: 4, left: 4 },
  oliviaFavInfo: { flex: 1, marginLeft: 12 },
  oliviaFavTitle: { fontSize: 17, fontWeight: '600', color: C.textPrimary, marginBottom: 4 },
  oliviaFavSub: { fontSize: 13, color: C.textSecondary },

  oliviaNewsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 14,
    borderRadius: R.sm,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(37, 209, 218, 0.2)',
  },
  oliviaNewsAccent: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 2,
    backgroundColor: C.cyan,
    marginRight: 12,
  },
  oliviaNewsBody: { flex: 1 },
  oliviaNewsHeadline: { fontSize: 15, fontWeight: '600', color: C.textPrimary, marginBottom: 4 },
  oliviaNewsSub: { fontSize: 13, color: C.textSecondary, lineHeight: 18, marginBottom: 6 },
  oliviaNewsDate: { fontSize: 11, color: C.textMuted },

  oliviaExclusiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 12,
    borderRadius: R.sm,
    backgroundColor: 'rgba(107, 63, 160, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(155, 89, 182, 0.5)',
    gap: 12,
  },
  oliviaExclusiveArtWrap: { position: 'relative' },
  oliviaExclusiveArt: { width: 56, height: 56, borderRadius: R.sm, overflow: 'hidden' },
  oliviaExclusiveBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#9B59B6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  oliviaExclusiveInfo: { flex: 1 },
  oliviaExclusiveTitle: { fontSize: 15, fontWeight: '600', color: C.textPrimary, marginBottom: 2 },
  oliviaExclusiveSub: { fontSize: 12, color: C.cyan, lineHeight: 16 },

  oliviaMerchCard: { width: 130 },
  oliviaMerchArt: { width: 130, height: 130, borderRadius: R.sm, overflow: 'hidden', marginBottom: 8 },
  oliviaMerchLabel: { fontSize: 13, fontWeight: '600', color: C.textPrimary, lineHeight: 17 },

  loveIslandRail: { marginBottom: 28 },
  villaCard:      { borderRadius: 16, overflow: 'hidden' },
  villaGradient:  { borderRadius: 16 },
  villaContent:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 20, paddingHorizontal: 18, gap: 14 },
  villaEyebrow:   { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.72)', letterSpacing: 1.8, marginBottom: 6 },
  villaTitle:     { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -0.5, marginBottom: 4 },
  villaSub:       { fontSize: 14, color: 'rgba(255,255,255,0.88)', marginBottom: 6 },
  villaMeta:      { fontSize: 12, color: 'rgba(255,255,255,0.60)' },
  villaPlayBtn:   {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  islandCastCard:     { borderRadius: 16, overflow: 'hidden', height: 200 },
  islandCastImage:    { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  islandCastGradient: { ...StyleSheet.absoluteFillObject },
  islandCastTextWrap: { position: 'absolute', bottom: 0, left: 0, right: 56, padding: 18 },
  islandCastEyebrow:  { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.72)', letterSpacing: 1.8, marginBottom: 6 },
  islandCastTitle:    { fontSize: 24, fontWeight: '800', color: '#fff', letterSpacing: -0.5, marginBottom: 4 },
  islandCastSub:      { fontSize: 13, color: 'rgba(255,255,255,0.88)', marginBottom: 4 },
  islandCastMeta:     { fontSize: 12, color: 'rgba(255,255,255,0.60)' },
  islandCastPlayBtn:  {
    position: 'absolute',
    right: 16,
    bottom: 18,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(0,0,0,0.42)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  borahaeCard:    { marginHorizontal: 16, marginBottom: 28, borderRadius: 16, overflow: 'hidden' },
  borahaeGradient:{ borderRadius: 16 },
  borahaeContent: { flexDirection: 'row', alignItems: 'center', paddingVertical: 20, paddingHorizontal: 18, gap: 14 },
  borahaeEyebrow: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.68)', letterSpacing: 1.8, marginBottom: 6 },
  borahaeTitle:   { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -0.5, marginBottom: 4 },
  borahaeSub:     { fontSize: 14, color: 'rgba(255,255,255,0.84)', marginBottom: 6 },
  borahaeMeta:    { fontSize: 12, color: 'rgba(255,255,255,0.56)' },
  borahaePlayBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.38)',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
