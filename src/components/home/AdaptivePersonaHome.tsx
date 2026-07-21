import { useState, useMemo, useRef, useEffect } from 'react'
import { View, ScrollView, TouchableOpacity, StyleSheet, Animated, Dimensions, ImageBackground, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { Text } from '../AppText'
import { AppImage as Image } from '../AppImage'
import { EdgeFadeRow } from '../EdgeFadeRow'
import { HRail } from '../HRail'
import StickyHomeHeader, { useStickyHomeHeaderHeight, useStickyHomeScroll } from '../StickyHomeHeader'
import AdaptiveThemePills from '../AdaptiveThemePills'
import { ListeningHeatmap, PlaylistMoodCard, ShowsYouWatchRail, MixCard } from './HomeSessionWidgets'
import { useSharedValue } from 'react-native-reanimated'
import { useProfiles } from '../../context/ProfilesContext'
import { useAdaptiveUI } from '../../context/AdaptiveUIContext'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import {
  songs,
  artists,
  podcasts,
  playlists,
  continueListeningItems,
  continueListeningKind,
  songsForYouIds,
  frequentPlaySongIds,
  popularInCitySongIds,
  myMixPlaylistIds,
  homeFeaturedArtistIds,
  hiddenGemsArtistIds,
  newForYouSongIds,
  recentlyPlayedIds,
  hannahSongsForYouIds,
  hannahFeaturedArtistIds,
  hannahFrequentPlaySongIds,
  type Song,
} from '../../data/mockData'
import { albumArtAssets, artistAssets, oliviaAboutAssets, resolveArtistAvatar } from '../../data/assetMap'
import {
  filterSongsForTheme,
  filterContinueListening,
  uniqueAlbumsFromSongs,
  getFeaturedArtists,
  getHiddenGemArtists,
  getDiscoveryTheme,
} from '../../data/themeFilters'
import { getSuperFanContent } from '../../data/superFanContent'
import { KPOP_BORAHAE_PLAYLIST } from '../../data/kpopContent'
import { LOVE_ISLAND_VILLA_PLAYLIST, LOVE_ISLAND_CAST_PLAYLIST } from '../../data/loveIslandContent'
import { artistShowTitle, artistShowEpisodeCount } from '../../data/podcastEpisodes'
import { audiobooks, AUDIBLE_CATEGORIES, formatAudiobookDuration } from '../../data/audibleBooks'
import { showYouWatchPlaylistIds } from '../../data/showsYouWatch'
import { tintFromHue } from '../../utils/color'
import { C, R, typeHeadline } from '../../theme'
import ShareFanCard from './ShareFanCard'
import SuperfanGoldGlow, { SUPERFAN_GOLD } from '../SuperfanGoldGlow'
import * as Sharing from 'expo-sharing'
import { captureRef } from 'react-native-view-shot'

const SCREEN_W = Platform.OS === 'web' ? Math.min(Dimensions.get('window').width, 402) : Dimensions.get('window').width
// Love Island Villa/Cast cards page at near-full width (same as the baseline home).
const LI_CARD_W = SCREEN_W - 48

// "Songs for You" — same horizontally-paged, 3-rows-per-page pattern as the
// baseline (Derbc Studios) home, not a single flat vertical list.
const SONGS_PER_PAGE = 3
const SONG_PAGE_PEEK = Math.round(SCREEN_W * 0.32)
const SONG_PAGE_WIDTH = SCREEN_W - SONG_PAGE_PEEK

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

// Secondary focus toggle (persona-gated): a two-option segmented pill that
// slides an accent indicator left/right — the active domain vs a narrowed
// "Following" cut of it.
const DOMAIN_LABELS = ['Music', 'Podcast', 'Audible'] as const

// Muted two-tone gradient covers for podcast shows (soft colour blobs, not neon).
const POD_GRADIENTS = [
  ['#4A3468', '#6B3556'],  // violet → plum
  ['#284A56', '#2E4668'],  // teal → slate blue
  ['#5A4020', '#5A2E28'],  // bronze → rust
  ['#28503E', '#2A4C54'],  // forest → teal
  ['#3A3068', '#28485A'],  // indigo → teal
  ['#582E48', '#5A4020'],  // plum → bronze
  ['#2C4468', '#3A3068'],  // blue → indigo
] as const

// Editorial playlist rail cards. Real curated `playlistId` wins when present
// (lands on an actual playlist); otherwise `genre` opens the matching browse
// page. Every card always resolves to real content — never Explore Music.
type RelatedPlaylistCard = {
  name: string
  artKey: string
  genre?: string
  playlistId?: string
}

// Generic editorial cards, tagged with a representative real cover so the
// rail always shows art instead of flat color. `genre` names the /genre/[id]
// browse destination each card opens.
const RELATED_PLAYLISTS: RelatedPlaylistCard[] = [
  { name: 'Relaxing Piano',       genre: 'Relax',    artKey: 'carole-king-tapestry' },
  { name: 'Classical for Sleep',  genre: 'Sleep',    artKey: 'roberta-flack-first-take' },
  { name: 'All-Time Hits',        genre: 'Charts',   artKey: 'madonna-true-blue' },
  { name: 'Deep Focus',           genre: 'Focus',    artKey: 'fka-twigs-lp1' },
  { name: 'Feel-Good Throwbacks', genre: 'Party',    artKey: 'whitney-self-titled' },
  { name: 'Rainy Day Jazz',       genre: 'Jazz',     artKey: 'billie-holiday-satin' },
  { name: 'Top 100 Global',       genre: 'Charts',   artKey: 'beyonce-lemonade' },
  { name: 'Late Night Lo-Fi',     genre: 'Relax',    artKey: 'lorde-melodrama' },
  { name: 'Acoustic Mornings',    genre: 'Commute',  artKey: 'noah-kahan-great-divide' },
  { name: 'Workout Energy',       genre: 'Workout',  artKey: 'lizzo-cuz-i-love-you' },
]

// Real curated playlists behind the fandom-tailored "{f} Essentials" /
// "Best of {f}" cards below, keyed by the active theme's label.
const THEME_PLAYLISTS: Record<string, { essentials: string; bestOf: string; artKey: string }> = {
  'Olivia Rodrigo': { essentials: 'pl-olivia-essentials', bestOf: 'pl3',              artKey: 'olivia-rodrigo-sour' },
  'Taylor Swift':   { essentials: 'pl-taylor-essentials', bestOf: 'pl-taylor-bestof', artKey: 'ts-1989' },
  'BTS':            { essentials: 'pl2',                  bestOf: 'pl-bts-bestof',    artKey: 'bts-proof-door' },
}

// Full Amazon-style podcast taxonomy for the "Top Podcasts by Category" browse.
const PODCAST_CATEGORIES = [
  'Sports', 'TV & Film', 'Comedy', 'Music', 'True Crime', 'News',
  'Society & Culture', 'Kids & Family', 'Business', 'Arts', 'Fiction',
  'Religion & Spirituality', 'Science', 'Health & Fitness', 'History',
  'Leisure', 'Education', 'Technology', 'Government', 'Charts',
] as const
const TOGGLE_H = 38
const TOGGLE_PAD = 4
const TOGGLE_SEG_W = (SCREEN_W - 32 - TOGGLE_PAD * 2) / 2

const BASE_RISING = popularInCitySongIds.map(id => songs.find(s => s.id === id)).filter((s): s is Song => s != null)
const MY_MIXES = myMixPlaylistIds.map(id => playlists.find(p => p.id === id)).filter((p): p is typeof playlists[0] => p != null)

// "Endless scroll" filler content, after My Mixes — deliberately generic (not
// theme-filtered), so the feed keeps producing new rails from the wider
// catalog the further you scroll. Same pool as the baseline home.
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
const DEEP_DIVE_ARTIST_POOL = ['lorde', 'mitski', 'beyonce', 'ariana-grande', 'sabrina-carpenter', 'rihanna', 'sza', 'dua-lipa', 'the-weeknd', 'doja-cat']
const SUMMER_SESSION_PLAYLIST_IDS = ['pl-summer-turned-pretty', 'pl-love-island', 'pl-love-island-cast', 'pl5']

function resolveBannerArt(key: string) {
  return albumArtAssets[key] ?? artistAssets[key] ?? oliviaAboutAssets[key] ?? null
}

function slotForHour(hour: number): string {
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 21) return 'evening'
  return 'late-night'
}

function PlayBadge({ size = 30 }: { size?: number }) {
  return (
    <View style={[s.playBadge, { width: size, height: size, borderRadius: size / 2 }]}>
      <Ionicons name="play" size={size * 0.46} color="#fff" style={{ marginLeft: 1 }} />
    </View>
  )
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <View style={s.sectionHead}>
      <Text style={s.sectionTitle}>{title}</Text>
      {sub ? <Text style={s.sectionSub}>{sub}</Text> : null}
    </View>
  )
}

function FocusToggle({
  options,
  value,
  onChange,
  accent,
}: {
  options: readonly [string, string]
  value: number
  onChange: (i: number) => void
  accent: string
}) {
  const anim = useRef(new Animated.Value(value)).current
  useEffect(() => {
    Animated.spring(anim, {
      toValue: value,
      useNativeDriver: true,
      damping: 18,
      stiffness: 220,
      mass: 0.7,
    }).start()
  }, [value, anim])
  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, TOGGLE_SEG_W] })
  return (
    <View style={s.toggleTrack}>
      <Animated.View
        style={[s.toggleIndicator, { backgroundColor: accent, transform: [{ translateX }] }]}
        pointerEvents="none"
      />
      {options.map((opt, i) => (
        <TouchableOpacity
          key={opt}
          style={s.toggleSeg}
          activeOpacity={0.85}
          onPress={() => onChange(i)}
          accessibilityRole="button"
          accessibilityState={{ selected: value === i }}
        >
          <Text style={[s.toggleLabel, value === i && s.toggleLabelActive]}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const FAVORITE_TAGS = ['Superfan', 'In rotation', 'New crush'] as const
const FAVORITE_CAPTIONS = ['Your go-to lately.', 'You keep coming back.', 'Fresh into the rotation.']

export default function AdaptivePersonaHome() {
  const router = useRouter()
  const { playSongAt } = usePlaybackState()
  const { activeProfile } = useProfiles()
  const { activeTheme, getSectionLabel, showConfirmation } = useAdaptiveUI()
  const { scrollY, onScroll } = useStickyHomeScroll()
  const stickyHeaderHeight = useStickyHomeHeaderHeight()

  // Top-bar domain drill-down. null = nothing selected (regular home + all three
  // pills). Pick a domain and the header collapses to [← | domain name].
  // 1 = Podcasts-forward, 2 = Audible/spoken-forward.
  const [domain, setDomain] = useState<number | null>(null)
  const podcastDomain = domain === 1
  const audibleDomain = domain === 2
  const spokenDomain = podcastDomain || audibleDomain

  // Brooke, Rabiat, Celine & the custom profile get the dynamic domain
  // drill-down (back arrow + picked domain, no personalized "For You" cut).
  const hasDomainNav =
    activeTheme?.id !== 'olivia-rodrigo-superfan' &&
    (activeProfile.id === 'rabiat' ||
     activeProfile.id === 'brooke' ||
     activeProfile.id === 'celine' ||
     activeProfile.id === 'custom')

  // Rabiat is Prototype V2 — the "different adaptive UI" build where the vibe
  // pills sit at the very top of the page (an explicit, up-front way to
  // reshape the whole home) instead of mid-scroll like the other personas.
  const pillsAtTop = activeProfile.id === 'rabiat'

  const hour = new Date().getHours()
  const slot = slotForHour(hour)
  const fandomLabel = activeTheme?.label ?? 'your music'
  const diverseHome = !!activeProfile.diverseRecommendations
  const discoveryTheme = useMemo(
    () => getDiscoveryTheme(activeTheme, diverseHome),
    [activeTheme, diverseHome],
  )
  const recTheme = discoveryTheme ?? activeTheme
  const recSectionLabel = (key: keyof NonNullable<typeof recTheme>['sectionLabels'], fallback: string) =>
    recTheme?.sectionLabels[key] ?? getSectionLabel(key, fallback)

  const superfan = getSuperFanContent(activeTheme?.id)
  // Real curated content (Olivia/Taylor/BTS) OR a custom profile built at
  // prototype V3/V4 (see Profile.forceSuperfan) both earn the superfan hero
  // treatment — the latter has no curated `superfan` object, so every
  // consumer below already falls back gracefully when it's undefined.
  const isSuperfan = !!superfan || !!activeProfile.forceSuperfan
  const isKpop = activeTheme?.id === 'kpop'
  const isLoveIsland = activeTheme?.id === 'love-island'

  const openSong = (id: string) => {
    playSongAt(id)
    router.push('/now-playing')
  }

  // "Albums in your rotation" cards are one representative song standing in
  // for its whole album — tapping one should open that album's page (with
  // its real tracklist), not immediately start playing the stand-in song.
  const openAlbum = (song: Song) => {
    router.push(`/album/song-album-${song.id}` as any)
  }

  // Long-pressing the "TOP 1% FAN" badge captures an off-screen shareable
  // card (branded, colored from the active theme's hue) and hands it to the
  // native share sheet — a personalized flex card the listener can post
  // outside the app.
  const shareCardRef = useRef<View>(null)
  const handleShareFanCard = async () => {
    try {
      const uri = await captureRef(shareCardRef, { format: 'png', quality: 0.92 })
      const canShare = await Sharing.isAvailableAsync()
      if (!canShare) {
        showConfirmation('Sharing is not available on this device')
        return
      }
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share your fan card' })
    } catch {
      showConfirmation('Could not create your fan card — try again')
    }
  }

  const jumpBackIn = useMemo(
    () => filterContinueListening(continueListeningItems, recTheme, songs).slice(0, 4),
    [recTheme],
  )
  const songsForYouSource = useMemo(() => {
    const pool = diverseHome ? hannahSongsForYouIds : songsForYouIds
    return pool.map(id => songs.find(s => s.id === id)).filter((s): s is Song => s != null)
  }, [diverseHome])
  const songsForYou = useMemo(() => filterSongsForTheme(songsForYouSource, recTheme), [songsForYouSource, recTheme])
  const albumsForYou = useMemo(() => uniqueAlbumsFromSongs(filterSongsForTheme(songs, recTheme), 10), [recTheme])
  const radioStationsForYou = useMemo(
    () =>
      albumsForYou.slice(0, 8).map(song => ({
        id: `radio-${song.id}`,
        name: `${song.album} Radio`,
        artKey: song.albumArtPath ?? '',
        artColor: song.albumArtColor,
        songId: song.id,
        artistName: song.artistName,
      })),
    [albumsForYou],
  )
  const featuredArtistPool = diverseHome ? hannahFeaturedArtistIds : homeFeaturedArtistIds
  const featuredArtists = useMemo(() => getFeaturedArtists(recTheme, featuredArtistPool, 16), [recTheme, featuredArtistPool])
  const frequentPlaySource = useMemo(() => {
    const pool = diverseHome ? hannahFrequentPlaySongIds : frequentPlaySongIds
    return pool.map(id => songs.find(s => s.id === id)).filter((s): s is Song => s != null)
  }, [diverseHome])
  const onRepeat = useMemo(() => filterSongsForTheme(frequentPlaySource, recTheme), [frequentPlaySource, recTheme])
  const rising = useMemo(() => filterSongsForTheme(BASE_RISING, recTheme), [recTheme])
  const hiddenGems = useMemo(() => getHiddenGemArtists(hiddenGemsArtistIds), [])

  // ── "Endless scroll" filler, after My Mixes — generic, catalog-wide, not theme-filtered ──
  const newReleases = useMemo(
    () => newForYouSongIds.map(id => songs.find(s => s.id === id)).filter((s): s is Song => s != null),
    [],
  )
  const recentlyPlayedFiller = useMemo(
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
      KPOP_BORAHAE_PLAYLIST.playlistId,
      LOVE_ISLAND_VILLA_PLAYLIST.playlistId,
      LOVE_ISLAND_CAST_PLAYLIST.playlistId,
      ...SUMMER_SESSION_PLAYLIST_IDS,
    ])
    return playlists.filter(p => !used.has(p.id))
  }, [])
  const trueCrimePodcasts = useMemo(() => podcasts.filter(p => p.category === 'True Crime'), [])
  const podcastsForYouFiller = useMemo(() => podcasts.slice(0, 10), [])
  const oliviaFeaturedFiller = useMemo(() => songs.filter(s => s.artistId === 'olivia-rodrigo').slice(0, 10), [])

  // Two-column "Songs for You" grid (Figma landing redesign).
  const songsForYouPages = useMemo(() => chunk(songsForYou.slice(0, 9), SONGS_PER_PAGE), [songsForYou])
  const songsForYouSnapOffsets = useMemo(() => songsForYouPages.map((_, i) => i * SONG_PAGE_WIDTH), [songsForYouPages])

  // "You and your favorites" listening-insight cards (Figma landing redesign).
  const favoriteInsights = useMemo(
    () =>
      featuredArtists.slice(0, 6).map((artist, i) => ({
        artist,
        tag: FAVORITE_TAGS[i % FAVORITE_TAGS.length],
        caption: FAVORITE_CAPTIONS[i % FAVORITE_CAPTIONS.length],
        seed: i,
      })),
    [featuredArtists],
  )

  // Fandom-adaptive pool of podcast shows — only a few real podcasts exist in the
  // mock data, so we top up with artist-led shows (real avatars as covers) biased
  // to the active persona's taste, giving the podcast domain enough to scroll.
  const podcastShows = useMemo(() => {
    const artistShows = getFeaturedArtists(recTheme, featuredArtistPool, 14).map((a, i) => ({
      id: `podshow-${a.id}`,
      // Title/count hash off the artist id (shared with findPodcast) so the
      // tile and the show page it opens always agree.
      title: artistShowTitle(a.id, a.name),
      sub: `${a.genre} · ${artistShowEpisodeCount(a.id)} episodes`,
      colors: POD_GRADIENTS[i % POD_GRADIENTS.length],
      // Every 3rd artist show gets a real photo backdrop; the rest are colour blobs.
      art: (i % 3 === 0 ? resolveArtistAvatar(a.id, a.imageUri) : null) as any,
    }))
    const realShows = podcasts.map((p, i) => ({
      id: p.id,
      title: p.title,
      sub: `${p.host} · ${p.episodeCount} episodes`,
      colors: POD_GRADIENTS[(i + 3) % POD_GRADIENTS.length],
      art: (p.coverArtPath ? resolveBannerArt(p.coverArtPath) : null) as any,
    }))
    return [...realShows, ...artistShows]
  }, [recTheme, featuredArtistPool])

  const bookCards = useMemo(
    () =>
      audiobooks.map((b, i) => ({
        id: b.id,
        title: b.title,
        sub: `${b.author} · ${formatAudiobookDuration(b)}`,
        colors: POD_GRADIENTS[(i + 2) % POD_GRADIENTS.length],
        art: (b.coverArtPath ? resolveBannerArt(b.coverArtPath) : null) as any,
      })),
    [],
  )

  const openExclusivePodcast = () => {
    const id = activeTheme?.heroArtistId
      ? `podshow-${activeTheme.heroArtistId}`
      : (podcastShows[0]?.id ?? podcasts[0].id)
    router.push(`/podcast-show/${id}` as any)
  }

  // Editorial playlists — a few tailored to the active persona's fandom, then the
  // generic ones. Baseline / no-theme keeps the generic list only.
  const relatedPlaylists = useMemo((): RelatedPlaylistCard[] => {
    if (!activeTheme) return RELATED_PLAYLISTS
    const f = activeTheme.label
    // Genre-style themes (K-pop, Jazz, Latin…) can deep-link their tailored
    // cards into the genre browse. Known superfan artist themes (Olivia,
    // Taylor, BTS) get real curated playlists instead. Anything else (a
    // custom "Build Your Own" fandom, a dynamic song/artist theme) falls
    // back to the Top 100 Global browse — never Explore Music.
    const genreThemes = ['K-pop', 'Jazz', 'Pop', 'Latin', 'Rock', 'Hip-Hop']
    const themeGenre = genreThemes.includes(f) ? f : undefined
    const themePlaylists = THEME_PLAYLISTS[f]
    const tailored: RelatedPlaylistCard[] = themePlaylists
      ? [
          { name: `${f} Essentials`, playlistId: themePlaylists.essentials, artKey: themePlaylists.artKey },
          { name: `Best of ${f}`,    playlistId: themePlaylists.bestOf,     artKey: themePlaylists.artKey },
        ]
      : [
          { name: `${f} Essentials`, genre: themeGenre ?? 'Charts', artKey: 'beyonce-lemonade' },
          { name: `Best of ${f}`,    genre: themeGenre ?? 'Charts', artKey: 'beyonce-lemonade' },
        ]
    tailored.push({ name: `${f} for Focus`, genre: 'Focus', artKey: 'fka-twigs-lp1' })
    return [...tailored, ...RELATED_PLAYLISTS]
  }, [activeTheme])

  const hue = activeTheme?.heroHue ?? '#26161f'
  const accent = activeProfile.color

  // Shared values the theme-pill tray writes on drag; the persona home has no
  // drop target, so the drag handlers are no-ops — tapping a pill still switches
  // the active theme (the component calls setActiveTheme internally).
  const pillDragX = useSharedValue(0)
  const pillDragY = useSharedValue(0)
  const noop = () => {}

  // ---- reusable rails -------------------------------------------------------
  // `onItemPress` defaults to playing the song — the right behavior for every
  // rail here except "Albums in your rotation" below, which stands in one
  // song per album and needs to open that album's page instead (see openAlbum).
  const coverRail = (title: string, list: Song[], sub?: string, onItemPress: (song: Song) => void = song => openSong(song.id)) => (
    <View style={s.block}>
      <SectionHeader title={title} sub={sub} />
      <EdgeFadeRow>
        <HRail
          data={list}
          keyExtractor={(song: Song) => song.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.rail}
          nestedScrollEnabled
          renderItem={({ item: song }: { item: Song }) => {
            const art = song.albumArtPath ? albumArtAssets[song.albumArtPath] : null
            return (
              <TouchableOpacity style={s.coverCard} activeOpacity={0.85} onPress={() => onItemPress(song)}>
                <View style={s.coverArtWrap}>
                  {art ? (
                    <Image source={art} style={s.coverArt} resizeMode="cover" />
                  ) : (
                    <View style={[s.coverArt, { backgroundColor: song.albumArtColor }]}>
                      <Ionicons name="musical-note" size={26} color="rgba(255,255,255,0.15)" />
                    </View>
                  )}
                  <View style={s.artBorderOverlay} pointerEvents="none" />
                </View>
                <Text style={s.coverTitle} numberOfLines={1}>{song.title}</Text>
                <Text style={s.coverSub} numberOfLines={1}>{song.artistName}</Text>
              </TouchableOpacity>
            )
          }}
        />
      </EdgeFadeRow>
    </View>
  )

  const podcastsRail = (
    <View style={s.block} key="podcasts">
      <SectionHeader title={isSuperfan ? `Podcasts in the ${fandomLabel} world` : 'Podcasts for you'} />
      <EdgeFadeRow>
        <HRail
          data={podcasts}
          keyExtractor={pod => pod.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.rail}
          nestedScrollEnabled
          renderItem={({ item: pod }) => {
            const art = pod.coverArtPath ? resolveBannerArt(pod.coverArtPath) : null
            return (
              <TouchableOpacity style={s.podCard} activeOpacity={0.85} onPress={() => router.push(`/podcast-show/${pod.id}` as any)}>
                {art ? (
                  <Image source={art} style={s.podArt} resizeMode="cover" />
                ) : (
                  <View style={[s.podArt, { backgroundColor: C.surface }]}>
                    <Ionicons name="mic" size={28} color="rgba(255,255,255,0.2)" />
                  </View>
                )}
                <Text style={s.coverTitle} numberOfLines={2}>{pod.title}</Text>
              </TouchableOpacity>
            )
          }}
        />
      </EdgeFadeRow>
    </View>
  )

  // Podcast-show tile rail — gradient "colour blob" covers (no photos).
  const podcastShowRail = (title: string, sub: string, list: typeof podcastShows) => (
    <View style={s.block}>
      <SectionHeader title={title} sub={sub} />
      <EdgeFadeRow>
        <HRail
          data={list}
          keyExtractor={show => show.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.rail}
          nestedScrollEnabled
          renderItem={({ item: show }) => (
            <TouchableOpacity style={s.podCard} activeOpacity={0.85} onPress={() => router.push(`/podcast-show/${show.id}` as any)}>
              <View style={s.podArt}>
                {show.art ? (
                  <>
                    <Image source={show.art} style={StyleSheet.absoluteFill} resizeMode="cover" />
                    <LinearGradient
                      colors={['rgba(0,0,0,0.25)', 'rgba(0,0,0,0.5)']}
                      style={StyleSheet.absoluteFill}
                    />
                  </>
                ) : (
                  <LinearGradient colors={show.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
                )}
                {/* Podcast marker — bottom-right badge, over gradient or photo */}
                <View style={s.micBadge}>
                  <Ionicons name="mic-outline" size={13} color="#fff" />
                </View>
              </View>
              <Text style={s.coverTitle} numberOfLines={2}>{show.title}</Text>
              <Text style={s.coverSub} numberOfLines={1}>{show.sub}</Text>
            </TouchableOpacity>
          )}
        />
      </EdgeFadeRow>
    </View>
  )

  // A full, scrollable podcast domain — like the music feed, with adaptive titles.
  const podcastFeed = (
    <>
      {podcastShowRail('Jump back into podcasts', 'Pick up where you left off', podcastShows.slice(0, 8))}
      {podcastShowRail(
        isSuperfan ? `Podcasts in your ${fandomLabel} world` : `Podcasts for your ${slot}`,
        'Handpicked shows for a superfan',
        podcastShows.slice(2, 12),
      )}
      {podcastShowRail('New episodes this week', 'Fresh drops from shows you follow', [...podcastShows].reverse().slice(0, 10))}
      {podcastShowRail(`Trending in ${fandomLabel}`, 'What every fan is playing right now', podcastShows.slice(3, 13))}
      {podcastShowRail(`Because you love ${fandomLabel}`, 'More talk, deep dives & interviews', podcastShows.slice(5, 15))}
    </>
  )

  const bookShowRail = (title: string, sub: string, list: typeof bookCards) => (
    <View style={s.block}>
      <SectionHeader title={title} sub={sub} />
      <EdgeFadeRow>
        <HRail
          data={list}
          keyExtractor={book => book.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.rail}
          nestedScrollEnabled
          renderItem={({ item: book }) => (
            <TouchableOpacity style={s.podCard} activeOpacity={0.85} onPress={() => router.push(`/audible-book/${book.id}` as any)}>
              <View style={s.podArt}>
                {book.art ? (
                  <>
                    <Image source={book.art} style={StyleSheet.absoluteFill} resizeMode="cover" />
                    <LinearGradient
                      colors={['rgba(0,0,0,0.25)', 'rgba(0,0,0,0.5)']}
                      style={StyleSheet.absoluteFill}
                    />
                  </>
                ) : (
                  <LinearGradient colors={book.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
                )}
                <View style={s.micBadge}>
                  <Ionicons name="book-outline" size={13} color="#fff" />
                </View>
              </View>
              <Text style={s.coverTitle} numberOfLines={2}>{book.title}</Text>
              <Text style={s.coverSub} numberOfLines={1}>{book.sub}</Text>
            </TouchableOpacity>
          )}
        />
      </EdgeFadeRow>
    </View>
  )

  const audibleFeed = (
    <>
      {bookShowRail('Jump back into audiobooks', 'Pick up where you left off', bookCards.slice(0, 8))}
      {bookShowRail('Audiobooks for you', 'Handpicked titles based on your taste', bookCards.slice(2, 12))}
      {bookShowRail('New releases this week', 'Fresh narrations just added', [...bookCards].reverse().slice(0, 10))}
      {bookShowRail('Bestsellers', 'The books everyone is listening to', bookCards.slice(3, 13))}
      {bookShowRail('Because you love great stories', 'More books you might enjoy', bookCards.slice(5, 15))}
    </>
  )

  // Generic editorial playlists — bold Ember name on a gradient card + AM logo.
  const relatedRail = (
    <View style={s.block}>
      <SectionHeader title="Playlists for every mood" sub="Ready-made mixes for whatever you're doing" />
      <EdgeFadeRow>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
          {relatedPlaylists.map((pl, idx) => (
            <PlaylistMoodCard
              key={`${pl.name}-${idx}`}
              name={pl.name}
              artKey={pl.artKey}
              onPress={() =>
                pl.playlistId
                  ? router.push(`/playlist/${pl.playlistId}` as any)
                  : router.push(`/genre/${encodeURIComponent(pl.genre ?? 'Charts')}` as any)
              }
            />
          ))}
        </ScrollView>
      </EdgeFadeRow>
    </View>
  )

  // "Top Podcasts by Category" — a wrapping pill grid; each pill opens a
  // category detail page (Amazon "Explore Podcasts" pattern).
  const podcastCategories = PODCAST_CATEGORIES
  const categoryGrid = (
    <View style={s.block} key="pod-categories">
      <SectionHeader title="Top Podcasts by Category" />
      <View style={s.catGrid}>
        {podcastCategories.map(cat => (
          <TouchableOpacity
            key={cat}
            style={s.catPill}
            activeOpacity={0.8}
            onPress={() => router.push(`/podcast-category/${encodeURIComponent(cat)}` as any)}
          >
            <Text style={s.catPillText}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )

  const audibleCategoryGrid = (
    <View style={s.block} key="audible-categories">
      <SectionHeader title="Browse audiobooks by category" />
      <View style={s.catGrid}>
        {AUDIBLE_CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={s.catPill}
            activeOpacity={0.8}
            onPress={() => router.push(`/audible-category/${encodeURIComponent(cat)}` as any)}
          >
            <Text style={s.catPillText}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )

  return (
    <View style={s.screen}>
      {/* Off-screen — mounted only so handleShareFanCard can capture it */}
      <View style={s.shareCardOffscreen} pointerEvents="none">
        <ShareFanCard
          ref={shareCardRef}
          artistName={activeTheme?.label ?? fandomLabel}
          fanLabel={activeTheme?.heroEyebrow ?? 'TOP 1% FAN'}
          hue={hue}
          heroArt={activeTheme?.heroBannerKey ? resolveBannerArt(activeTheme.heroBannerKey) : null}
        />
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28 }}
        style={{ backgroundColor: 'transparent' }}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <View style={{ height: stickyHeaderHeight + 22 }} />

        {/* Full-bleed adaptive hero — image + headline swap with the active
            theme, restoring the "hero that changes with you" read the old
            standalone Rabiat home had before it moved onto this shared
            persona-home layout. The fandom name inside the subtitle is
            picked out in the adaptive accent color ("blue words") so the
            copy visibly reacts to the theme, not just the artwork.
            Scoped to Rabiat only — every other persona on this shared
            component (Celine, custom v1–v3 profiles) keeps its existing
            layout untouched. */}
        {activeProfile.id === 'rabiat' && activeTheme && (
          <TouchableOpacity
            style={s.adaptiveHeroWrap}
            activeOpacity={0.92}
            onPress={() => activeTheme.heroArtistId && router.push(`/artist/${activeTheme.heroArtistId}` as any)}
          >
            <ImageBackground
              source={
                (activeTheme.heroBannerKey ? resolveBannerArt(activeTheme.heroBannerKey) : null) ??
                artistAssets[activeTheme.heroArtistId ?? '']
              }
              style={s.adaptiveHeroBg}
              resizeMode="cover"
            >
              <LinearGradient
                colors={['rgba(0,0,0,0.15)', 'transparent', tintFromHue(hue, 0.35), 'rgba(10,10,10,0.94)']}
                locations={[0, 0.35, 0.7, 1]}
                style={StyleSheet.absoluteFill}
              />
              <View style={s.adaptiveHeroContent}>
                <Text style={s.adaptiveHeroEyebrow}>{activeTheme.heroEyebrow}</Text>
                <Text style={s.adaptiveHeroTitle}>{activeTheme.heroTitle}</Text>
                <Text style={s.adaptiveHeroSub} numberOfLines={2}>
                  {activeTheme.heroSubtitle.split(new RegExp(`(${activeTheme.label})`, 'i')).map((chunkText, i) =>
                    chunkText.toLowerCase() === activeTheme.label.toLowerCase() ? (
                      <Text key={i} style={s.adaptiveHeroSubAccent}>{chunkText}</Text>
                    ) : (
                      chunkText
                    ),
                  )}
                </Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        )}

        {/* Prototype V2 (Rabiat): the vibe pills lead the page, not mid-scroll. */}
        {pillsAtTop && !spokenDomain && (
          <View style={s.block}>
            <SectionHeader title="Switch your vibe" sub="Tap a theme to reshape your home" />
            <AdaptiveThemePills
              onDragStart={noop}
              onDragMove={noop}
              onDragDrop={noop}
              onDragCancel={noop}
              dragX={pillDragX}
              dragY={pillDragY}
              heroHue={hue}
            />
          </View>
        )}

        {/* Podcast domain: podcasts rise to the top; the category browse moves to
            the very bottom (rendered after My Mixes). */}
        {podcastDomain && podcastFeed}
        {audibleDomain && audibleFeed}

        {/* Sections 3–8 (music discovery) — hidden entirely in podcast/audible domain */}
        {!spokenDomain && (
        <>
        {/* NEW — Featured favorite carousel + new-in-session artist rail, on a
            dark tinted gradient (Figma landing redesign). The old "Current
            session / Playing from" header + waveform icon was dropped, the
            mini player at the bottom of the screen already owns "what's
            playing right now" with a real (not decorative) equalizer, so
            duplicating that up here just fought it for attention. */}
        <View style={s.sessionWrap}>
          <View style={s.sessionCard}>
            <LinearGradient
              colors={['#000', '#000', tintFromHue(hue, 0.16), 'rgba(0,0,0,0.9)', '#000']}
              locations={[0, 0.14, 0.42, 0.75, 1]}
              style={StyleSheet.absoluteFill}
            />

            <>
                <View style={s.favoriteBlock}>
                  <Text style={s.favoriteHeading}>{activeTheme?.heroSectionLabel ?? 'Your featured favorite'}</Text>
                  <View style={s.favoriteRow}>
                    <TouchableOpacity
                      style={s.favoriteHero}
                      activeOpacity={0.88}
                      onPress={() => activeTheme?.heroArtistId && router.push(`/artist/${activeTheme.heroArtistId}` as any)}
                    >
                      {(() => {
                        const art = activeTheme?.heroBannerKey ? resolveBannerArt(activeTheme.heroBannerKey) : null
                        return art ? (
                          <Image source={art} style={StyleSheet.absoluteFill} resizeMode="cover" />
                        ) : (
                          <View style={[StyleSheet.absoluteFill, { backgroundColor: tintFromHue(hue, 0.9) }]} />
                        )
                      })()}
                      {(isSuperfan || isKpop) && (
                        <LinearGradient
                          colors={['rgba(37,209,218,0.16)', 'rgba(240,199,68,0.10)']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={StyleSheet.absoluteFill}
                        />
                      )}
                      <LinearGradient colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.78)']} style={StyleSheet.absoluteFill} />
                      {(isSuperfan || isKpop) && <SuperfanGoldGlow />}
                      {(isSuperfan || isKpop) && (
                        <TouchableOpacity
                          style={s.favoriteBadge}
                          activeOpacity={0.75}
                          onLongPress={handleShareFanCard}
                          delayLongPress={400}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Ionicons name="star" size={11} color={SUPERFAN_GOLD} />
                          <Text style={s.favoriteBadgeText} numberOfLines={1}>{activeTheme?.heroEyebrow ?? 'TOP 1% FAN'}</Text>
                        </TouchableOpacity>
                      )}
                      <View style={s.favoriteHeroText}>
                        <Text style={s.favoriteEyebrow}>{isSuperfan ? 'Top 1% listener' : (activeTheme?.heroEyebrow ?? 'FOR YOU')}</Text>
                        <Text style={s.favoriteName} numberOfLines={2}>{activeTheme?.heroTitle ?? fandomLabel}</Text>
                      </View>
                    </TouchableOpacity>

                    <View style={s.favoriteSideCol}>
                      <TouchableOpacity
                        style={s.unlockCard}
                        activeOpacity={0.85}
                        onPress={openExclusivePodcast}
                      >
                        <Text style={s.unlockEyebrow}>WHAT YOU UNLOCKED</Text>
                        <Text style={s.unlockTitle} numberOfLines={2}>Exclusive for you</Text>
                        <Ionicons name="arrow-forward" size={16} color="#fff" style={{ alignSelf: 'flex-end' }} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={s.newsCard}
                        activeOpacity={0.85}
                        onPress={() => activeTheme?.heroArtistId && router.push(`/artist/${activeTheme.heroArtistId}` as any)}
                      >
                        <View style={s.newsAccentBar} />
                        <View style={s.newsBody}>
                          <Text style={s.newsHeadline} numberOfLines={2}>{superfan?.news.headline ?? `More from ${fandomLabel}`}</Text>
                          <View style={s.newsPill}>
                            <Text style={s.newsPillText}>See more</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {featuredArtists.length > 0 && (
                  <View style={s.newInSessionBlock}>
                    <Text style={s.newInSessionHeading}>New in this session</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.newInSessionRail} nestedScrollEnabled>
                      {featuredArtists.slice(0, 8).map(artist => {
                        const art = resolveArtistAvatar(artist.id, artist.imageUri)
                        return (
                          <TouchableOpacity key={artist.id} style={s.newInSessionCard} activeOpacity={0.85} onPress={() => router.push(`/artist/${artist.id}` as any)}>
                            {art ? (
                              <Image source={art} style={StyleSheet.absoluteFill} resizeMode="cover" />
                            ) : (
                              <View style={[StyleSheet.absoluteFill, { backgroundColor: C.surface }]} />
                            )}
                            <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.72)']} style={StyleSheet.absoluteFill} />
                            <Text style={s.newInSessionName} numberOfLines={1}>{artist.name}</Text>
                          </TouchableOpacity>
                        )
                      })}
                    </ScrollView>
                  </View>
                )}

                {/* K-pop loyalty extra: Borahae daily playlist */}
                {isKpop && (
                  <TouchableOpacity
                    style={s.rowCard}
                    activeOpacity={0.85}
                    onPress={() => router.push(`/playlist/${KPOP_BORAHAE_PLAYLIST.playlistId}` as any)}
                  >
                    <Image source={resolveBannerArt(KPOP_BORAHAE_PLAYLIST.artKey) ?? artistAssets.bts} style={s.rowArt} resizeMode="cover" />
                    <View style={{ flex: 1 }}>
                      <Text style={s.rowEyebrow}>{KPOP_BORAHAE_PLAYLIST.eyebrow}</Text>
                      <Text style={s.rowTitle} numberOfLines={1}>{KPOP_BORAHAE_PLAYLIST.title}</Text>
                      <Text style={s.rowSub} numberOfLines={1}>{KPOP_BORAHAE_PLAYLIST.meta}</Text>
                    </View>
                    <PlayBadge size={30} />
                  </TouchableOpacity>
                )}
              </>
          </View>
        </View>

        {/* Jump back in — same big-card "Continue Listening" pattern as the
            baseline (Derbc Studios) home, not the small truncated row cards.
            Sits right after the hero cards, before discovery rails. */}
        {jumpBackIn.length > 0 && (
          <View style={s.block}>
            <SectionHeader title="Jump back in" />
            <EdgeFadeRow>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
                {jumpBackIn.map(item => {
                  const art = item.artKey ? resolveBannerArt(item.artKey) : null
                  const kind = continueListeningKind(item.id)
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={s.continueCard}
                      activeOpacity={0.85}
                      onPress={() =>
                        item.podcastId
                          ? router.push(`/podcast-show/${item.podcastId}` as any)
                          : item.songId && openSong(item.songId)
                      }
                    >
                      <View style={s.continueArtWrap}>
                        {art ? (
                          <Image source={art} style={s.continueArt} resizeMode="cover" />
                        ) : (
                          <View style={[s.continueArt, { backgroundColor: C.surface }]} />
                        )}
                        <View style={s.artBorderOverlay} pointerEvents="none" />
                        <View style={s.continuePlayPos}><PlayBadge size={30} /></View>
                      </View>
                      <Text style={s.continueTitle} numberOfLines={2}>{item.title}</Text>
                      <View style={s.quickKindRow}>
                        <Ionicons name={kind.icon as any} size={10} color={C.textMuted} />
                        <Text style={s.quickKind}>{kind.label}</Text>
                      </View>
                    </TouchableOpacity>
                  )
                })}
              </ScrollView>
            </EdgeFadeRow>
          </View>
        )}

        <ShowsYouWatchRail />

        {/* NEW — Songs for You: horizontally-paged, 3 rows per page, same as
            the baseline (Derbc Studios) home's signature song stack. */}
        {songsForYouPages.length > 0 && (
          <View style={s.block}>
            <SectionHeader title={recSectionLabel('songsForYou', 'Songs for You')} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              decelerationRate="normal"
              snapToOffsets={songsForYouSnapOffsets}
              snapToAlignment="start"
              nestedScrollEnabled
              contentContainerStyle={[s.songsScrollContent, { paddingRight: SONG_PAGE_PEEK }]}
            >
              {songsForYouPages.map((page, pageIdx) => (
                <View key={`sfy-page-${pageIdx}`} style={[s.songsPage, { width: SONG_PAGE_WIDTH }]}>
                  {page.map(song => {
                    const art = song.albumArtPath ? albumArtAssets[song.albumArtPath] : null
                    return (
                      <TouchableOpacity key={song.id} style={s.gridSongRow} activeOpacity={0.8} onPress={() => openSong(song.id)}>
                        {art ? (
                          <Image source={art} style={s.gridSongArt} resizeMode="cover" />
                        ) : (
                          <View style={[s.gridSongArt, { backgroundColor: song.albumArtColor }]} />
                        )}
                        <View style={s.gridSongInfo}>
                          <View style={s.songTitleRow}>
                            <Text style={[s.gridSongTitle, s.songTitleFlex]} numberOfLines={1}>{song.title}</Text>
                            {song.isExclusive && <Text style={s.exclusiveBadgeText}>EXCLUSIVE</Text>}
                          </View>
                          <Text style={s.gridSongArtist} numberOfLines={1}>{song.artistName}</Text>
                        </View>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* NEW — You and your favorites (listening-insight cards with a
            deterministic "listening level" heatmap, Figma landing redesign) */}
        {favoriteInsights.length > 0 && (
          <View style={s.block}>
            <View style={s.favoritesHeadRow}>
              <Text style={s.fandomTitle}>You and your favorites</Text>
              <TouchableOpacity onPress={() => router.push('/music')} activeOpacity={0.7}>
                <Text style={s.seeMoreText}>SEE MORE</Text>
              </TouchableOpacity>
            </View>
            <EdgeFadeRow>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
                {favoriteInsights.map(item => {
                  const art = resolveArtistAvatar(item.artist.id, item.artist.imageUri)
                  return (
                    <TouchableOpacity key={item.artist.id} style={s.insightCard} activeOpacity={0.85} onPress={() => router.push(`/artist/${item.artist.id}` as any)}>
                      {art ? (
                        <Image source={art} style={StyleSheet.absoluteFill} resizeMode="cover" />
                      ) : (
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: C.surface }]} />
                      )}
                      <LinearGradient colors={['rgba(0,0,0,0.55)', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0.6)']} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />
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

        {/* On-repeat tracks for this fandom */}
        {onRepeat.length > 0 && (
          <View style={s.block}>
            <SectionHeader title={diverseHome ? 'On repeat this month' : `On repeat in your ${fandomLabel} world`} />
            <EdgeFadeRow fadeColor={C.surface}>
              {/* merchRail has no side padding (it's normally nested in an
                  already-padded panel), add the standard 16px inset here since
                  this rail sits directly in the page, like every other section. */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[s.merchRail, { paddingHorizontal: 16 }]} nestedScrollEnabled>
                {onRepeat.slice(0, 12).map(song => {
                  const art = song.albumArtPath ? albumArtAssets[song.albumArtPath] : null
                  return (
                    <TouchableOpacity key={song.id} style={s.miniCard} activeOpacity={0.85} onPress={() => openSong(song.id)}>
                      <View style={s.miniArtWrap}>
                        {art ? (
                          <Image source={art} style={s.miniArt} resizeMode="cover" />
                        ) : (
                          <View style={[s.miniArt, { backgroundColor: song.albumArtColor }]} />
                        )}
                        <View style={s.artBorderOverlay} pointerEvents="none" />
                      </View>
                      <Text style={s.miniTitle} numberOfLines={1}>{song.title}</Text>
                    </TouchableOpacity>
                  )
                })}
              </ScrollView>
            </EdgeFadeRow>
          </View>
        )}

        {/* Love Island world: the Villa + Cast cards (same design as the
            official-playlist treatment), shown only for the Love Island theme */}
        {isLoveIsland && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            nestedScrollEnabled
            contentContainerStyle={s.liRailContent}
            style={s.liRail}
          >
            <TouchableOpacity
              style={[s.villaCard, { width: LI_CARD_W }]}
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
              style={[s.islandCastCard, { width: LI_CARD_W }]}
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

        {/* 5 — More from your world (fandom-adjacent discovery) */}
        <View style={s.block}>
          <SectionHeader title={diverseHome ? 'Artists you might love' : `More like ${fandomLabel}`} />
          <EdgeFadeRow>
            <HRail
              data={featuredArtists}
              keyExtractor={artist => artist.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.rail}
              nestedScrollEnabled
              renderItem={({ item: artist }) => {
                const art = resolveArtistAvatar(artist.id, artist.imageUri)
                return (
                  <TouchableOpacity style={s.artistCard} activeOpacity={0.85} onPress={() => router.push(`/artist/${artist.id}` as any)}>
                    {art ? (
                      <Image source={art} style={s.artistAvatar} resizeMode="cover" />
                    ) : (
                      <View style={[s.artistAvatar, { backgroundColor: C.surface }]}>
                        <Ionicons name="person" size={34} color="rgba(255,255,255,0.2)" />
                      </View>
                    )}
                    <Text style={s.artistName} numberOfLines={1}>{artist.name}</Text>
                  </TouchableOpacity>
                )
              }}
            />
          </EdgeFadeRow>
        </View>

        {coverRail('Albums in your rotation', albumsForYou, 'Your most-played albums this month', openAlbum)}

        {/* Radio Stations — album-art cards with a radio badge, style-matched to the
            Related Radio Stations section on the artist music tab. */}
        {radioStationsForYou.length > 0 && (
          <View style={s.block}>
            <SectionHeader title={getSectionLabel('radioStations', 'Radio stations')} />
            <EdgeFadeRow>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
                {radioStationsForYou.map(st => {
                  const art = st.artKey ? albumArtAssets[st.artKey] : null
                  return (
                    <TouchableOpacity
                      key={st.id}
                      style={s.radioCard}
                      activeOpacity={0.85}
                      onPress={() => openSong(st.songId)}
                    >
                      <View style={s.radioArtWrap}>
                        {art ? (
                          <Image source={art} style={s.radioArt} resizeMode="cover" />
                        ) : (
                          <View style={[s.radioArt, { backgroundColor: st.artColor }]}>
                            <Ionicons name="musical-note" size={26} color="rgba(255,255,255,0.15)" />
                          </View>
                        )}
                        <View style={s.radioBadge}>
                          <MaterialIcons name="sensors" size={22} color="#fff" />
                        </View>
                      </View>
                      <Text style={s.radioTitle} numberOfLines={1}>{st.name}</Text>
                      <Text style={s.radioMeta} numberOfLines={1}>Station · {st.artistName}</Text>
                    </TouchableOpacity>
                  )
                })}
              </ScrollView>
            </EdgeFadeRow>
          </View>
        )}

        {relatedRail}

        {/* Theme switcher — tap a pill to re-skin the whole home on the fly.
            Rabiat (Prototype V2) already has this at the top of the page. */}
        {!pillsAtTop && (
          <View style={s.block}>
            <SectionHeader title="Switch your vibe" sub="Tap a theme to reshape your home" />
            <AdaptiveThemePills
              onDragStart={noop}
              onDragMove={noop}
              onDragDrop={noop}
              onDragCancel={noop}
              dragX={pillDragX}
              dragY={pillDragY}
              heroHue={hue}
            />
          </View>
        )}

        {/* 6 — Recognition-led discovery: broad picks + rising artists */}
        {coverRail('Popular in your city', rising)}

        <View style={s.block}>
          <SectionHeader title="Artists on the rise" sub="Fresh finds near your taste" />
          <EdgeFadeRow>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
              {hiddenGems.map(artist => {
                const art = resolveArtistAvatar(artist.id, artist.imageUri)
                return (
                  <TouchableOpacity key={artist.id} style={s.artistCard} activeOpacity={0.85} onPress={() => router.push(`/artist/${artist.id}` as any)}>
                    {art ? (
                      <Image source={art} style={s.artistAvatar} resizeMode="cover" />
                    ) : (
                      <View style={[s.artistAvatar, { backgroundColor: C.surface }]}>
                        <Ionicons name="person" size={34} color="rgba(255,255,255,0.2)" />
                      </View>
                    )}
                    <Text style={s.artistName} numberOfLines={1}>{artist.name}</Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </EdgeFadeRow>
        </View>

        {/* 7 — Podcasts (unless already surfaced by the domain filter) */}
        {!spokenDomain && podcastsRail}

        {/* 8 — My Mixes (curated) */}
        <View style={s.block}>
          <SectionHeader title={recSectionLabel('myMixes', 'My Mixes')} sub="Updated at 6:00 AM" />
          <EdgeFadeRow>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
              {MY_MIXES.map(mix => (
                <MixCard
                  key={mix.id}
                  name={mix.name}
                  artKey={mix.coverArtPath}
                  onPress={() => router.push(`/playlist/${mix.id}` as any)}
                />
              ))}
            </ScrollView>
          </EdgeFadeRow>
        </View>

        {/* ── Endless-scroll filler — the deeper you scroll, the more the wider
            catalog surfaces. Deliberately generic / not theme-tailored. ── */}

        {newReleases.length > 0 && coverRail('New Releases For You', newReleases)}
        {recentlyPlayedFiller.length > 0 && coverRail('Recently Played', recentlyPlayedFiller)}
        {deepDiveSongs.length > 0 && coverRail(`Deep Dive: ${deepDiveArtist.name}`, deepDiveSongs, 'More from an artist you follow')}
        {specialAudioSongs.length > 0 && coverRail('Special Audio Albums', specialAudioSongs, 'Dolby Atmos & 360 Reality Audio')}

        <View style={s.block}>
          <SectionHeader title="Stations For You" sub="Hot picks, playing now" />
          <EdgeFadeRow>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
              {RADIO_STATIONS.map(st => {
                const art = albumArtAssets[st.artKey] ?? null
                return (
                  <TouchableOpacity key={st.id} style={s.radioCard} activeOpacity={0.85} onPress={() => openSong(st.songId)}>
                    <View style={s.radioArtWrap}>
                      {art ? (
                        <Image source={art} style={s.radioArt} resizeMode="cover" />
                      ) : (
                        <View style={[s.radioArt, { backgroundColor: C.surface }]} />
                      )}
                      <View style={s.radioBadge}>
                        <MaterialIcons name="sensors" size={22} color="#fff" />
                      </View>
                    </View>
                    <Text style={s.radioTitle} numberOfLines={1}>{st.name}</Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </EdgeFadeRow>
        </View>

        {summerSessionPlaylists.length > 0 && (
          <View style={s.block}>
            <SectionHeader title="Summer Sessions" />
            <EdgeFadeRow>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
                {summerSessionPlaylists.map(pl => (
                  <PlaylistMoodCard
                    key={pl.id}
                    name={pl.name}
                    artKey={pl.coverArtPath ?? ''}
                    onPress={() => router.push(`/playlist/${pl.id}` as any)}
                  />
                ))}
              </ScrollView>
            </EdgeFadeRow>
          </View>
        )}

        {oliviaFeaturedFiller.length > 0 && coverRail('Featured This Week', oliviaFeaturedFiller, 'Because you listen to Olivia Rodrigo')}

        {trueCrimePodcasts.length > 0 && (
          <View style={s.block}>
            <SectionHeader title="True Crime Picks" />
            <EdgeFadeRow>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
                {trueCrimePodcasts.map(pod => {
                  const art = pod.coverArtPath ? resolveBannerArt(pod.coverArtPath) : null
                  return (
                    <TouchableOpacity key={pod.id} style={s.podCard} activeOpacity={0.85} onPress={() => router.push(`/podcast-show/${pod.id}` as any)}>
                      {art ? (
                        <Image source={art} style={s.podArt} resizeMode="cover" />
                      ) : (
                        <View style={[s.podArt, { backgroundColor: C.surface }]}>
                          <Ionicons name="mic" size={28} color="rgba(255,255,255,0.2)" />
                        </View>
                      )}
                      <Text style={s.coverTitle} numberOfLines={2}>{pod.title}</Text>
                    </TouchableOpacity>
                  )
                })}
              </ScrollView>
            </EdgeFadeRow>
          </View>
        )}

        <View style={s.block}>
          <SectionHeader title="Podcasts For You" />
          <EdgeFadeRow>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
              {podcastsForYouFiller.map(pod => {
                const art = pod.coverArtPath ? resolveBannerArt(pod.coverArtPath) : null
                return (
                  <TouchableOpacity key={pod.id} style={s.podCard} activeOpacity={0.85} onPress={() => router.push(`/podcast-show/${pod.id}` as any)}>
                    {art ? (
                      <Image source={art} style={s.podArt} resizeMode="cover" />
                    ) : (
                      <View style={[s.podArt, { backgroundColor: C.surface }]}>
                        <Ionicons name="mic" size={28} color="rgba(255,255,255,0.2)" />
                      </View>
                    )}
                    <Text style={s.coverTitle} numberOfLines={2}>{pod.title}</Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </EdgeFadeRow>
        </View>

        {morePlaylistsForYou.length > 0 && (
          <View style={s.block}>
            <SectionHeader title="Playlists You Might Like" sub="Fresh picks, updated every Sunday" />
            <EdgeFadeRow>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
                {morePlaylistsForYou.map(pl => (
                  <PlaylistMoodCard
                    key={pl.id}
                    name={pl.name}
                    artKey={pl.coverArtPath ?? ''}
                    onPress={() => router.push(`/playlist/${pl.id}` as any)}
                  />
                ))}
              </ScrollView>
            </EdgeFadeRow>
          </View>
        )}
        </>
        )}

        {/* Podcast domain: the "Top Podcasts by Category" browse lives at the very bottom */}
        {podcastDomain && categoryGrid}
        {audibleDomain && audibleCategoryGrid}
      </Animated.ScrollView>

      <StickyHomeHeader
        firstName={activeProfile.name.split(' ')[0]}
        activePill={domain}
        onPillChange={setDomain}
        scrollY={scrollY}
        domainNav={
          hasDomainNav
            ? {
                domains: DOMAIN_LABELS,
                domain,
                onSelectDomain: (i: number) => setDomain(i),
                onBack: () => setDomain(null),
              }
            : undefined
        }
      />
    </View>
  )
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  shareCardOffscreen: { position: 'absolute', top: -9999, left: -9999 },

  // Full-bleed adaptive hero
  adaptiveHeroWrap: { marginBottom: 18 },
  adaptiveHeroBg: { width: '100%', height: 280, justifyContent: 'flex-end' },
  adaptiveHeroContent: { paddingHorizontal: 16, paddingBottom: 20 },
  adaptiveHeroEyebrow: { fontSize: 12, fontWeight: '800', letterSpacing: 1.2, color: 'rgba(255,255,255,0.75)' },
  adaptiveHeroTitle: { ...typeHeadline(30), color: '#fff', marginTop: 4 },
  adaptiveHeroSub: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 6, lineHeight: 19 },
  adaptiveHeroSubAccent: { color: C.blue, fontWeight: '700' },

  // Secondary focus toggle
  toggleTrack: {
    marginHorizontal: 16,
    marginBottom: 18,
    height: TOGGLE_H,
    borderRadius: TOGGLE_H / 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    flexDirection: 'row',
    padding: TOGGLE_PAD,
    position: 'relative',
  },
  toggleIndicator: {
    position: 'absolute',
    left: TOGGLE_PAD,
    top: TOGGLE_PAD,
    width: TOGGLE_SEG_W,
    height: TOGGLE_H - TOGGLE_PAD * 2,
    borderRadius: (TOGGLE_H - TOGGLE_PAD * 2) / 2,
  },
  toggleSeg: { flex: 1, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  toggleLabel: { fontSize: 14, fontWeight: '700', color: C.textSecondary },
  toggleLabelActive: { color: '#0a0a0a' },

  block: { marginBottom: 42 },
  sectionHead: { paddingHorizontal: 16, marginBottom: 14 },
  sectionTitle: { ...typeHeadline(20), color: '#fff' },
  sectionSub: { fontSize: 13, color: C.textSecondary, marginTop: 2 },
  rail: { paddingHorizontal: 16, gap: 16 },

  // Jump back in — big "Continue Listening" cards, matching the baseline home
  continueCard: { width: 150 },
  continueArtWrap: { position: 'relative', marginBottom: 8 },
  continueArt: { width: 150, height: 150, borderRadius: 8, overflow: 'hidden' },
  continuePlayPos: { position: 'absolute', bottom: 8, left: 8 },
  continueTitle: { fontSize: 15, fontWeight: '600', color: '#fff', lineHeight: 19 },
  quickKindRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  quickKind: { fontSize: 10, color: C.textMuted, fontWeight: '600', letterSpacing: 0.3 },

  // Cover rails
  coverCard: { width: 150 },
  coverArtWrap: { width: 150, height: 150, borderRadius: 8, overflow: 'hidden', position: 'relative' },
  coverArt: { width: 150, height: 150, alignItems: 'center', justifyContent: 'center' },
  coverPlayPos: { position: 'absolute', right: 8, bottom: 8 },
  artBorderOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 0.75,
    borderColor: 'rgba(255,255,255,0.24)',
    borderRadius: 8,
  },
  coverTitle: { fontSize: 14, fontWeight: '600', color: '#fff', marginTop: 8 },
  coverSub: { fontSize: 12, color: C.textSecondary, marginTop: 2 },

  fandomTitle: { ...typeHeadline(19), color: '#fff' },

  // NEW — Featured favorite / New in session (Figma landing redesign)
  sessionWrap: { marginBottom: 34 },
  sessionCard: { overflow: 'hidden', paddingTop: 20, paddingBottom: 18, paddingHorizontal: 16 },

  favoriteBlock: { marginBottom: 20 },
  favoriteHeading: { ...typeHeadline(18), color: '#fff', marginBottom: 12 },
  favoriteRow: { flexDirection: 'row', gap: 10 },
  favoriteHero: { flex: 1.7, height: 220, borderRadius: 14, overflow: 'hidden', justifyContent: 'flex-end', padding: 14 },
  favoriteBadge: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, maxWidth: '70%' },
  favoriteBadgeText: { fontSize: 10, fontWeight: '700', color: SUPERFAN_GOLD, letterSpacing: 0.4 },
  favoriteHeroText: {},
  favoriteEyebrow: { fontSize: 12, fontWeight: '700', color: '#fff' },
  favoriteName: { ...typeHeadline(26), color: '#fff', marginTop: 2 },
  favoriteSideCol: { flex: 1, gap: 10 },
  unlockCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 14, padding: 12, justifyContent: 'space-between' },
  unlockEyebrow: { fontSize: 10, fontWeight: '700', color: C.cyan, letterSpacing: 0.5 },
  unlockTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginTop: 4 },
  newsCard: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', borderRadius: 14, overflow: 'hidden', flexDirection: 'row' },
  newsAccentBar: { width: 3, backgroundColor: C.cyan },
  newsBody: { flex: 1, padding: 10, justifyContent: 'space-between' },
  newsHeadline: { fontSize: 12, fontWeight: '700', color: '#fff', lineHeight: 16 },
  newsPill: { alignSelf: 'flex-start', borderWidth: 1, borderColor: '#fff', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 5, marginTop: 6 },
  newsPillText: { fontSize: 11, fontWeight: '600', color: '#fff' },

  newInSessionBlock: { marginTop: 4 },
  newInSessionHeading: { ...typeHeadline(18), color: '#fff', marginBottom: 12 },
  newInSessionRail: { gap: 10 },
  newInSessionCard: { width: 104, height: 104, borderRadius: 12, overflow: 'hidden', justifyContent: 'flex-end', padding: 10 },
  newInSessionName: { fontSize: 13, fontWeight: '700', color: '#fff' },

  // NEW — Songs for You two-column grid
  songsScrollContent: { paddingLeft: 16 },
  songsPage: { paddingRight: 14, gap: 22 },
  gridSongRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  gridSongArt: { width: 56, height: 56, borderRadius: 6 },
  gridSongInfo: { flex: 1, marginRight: 8 },
  gridSongTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
  gridSongArtist: { fontSize: 13, color: C.textSecondary, marginTop: 3 },
  songTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  songTitleFlex: { flex: 1 },
  exclusiveBadgeText: { fontSize: 10, fontWeight: '700', color: C.cyan, letterSpacing: 0.5, flexShrink: 0 },

  // NEW — You and your favorites (listening-insight cards)
  favoritesHeadRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 14 },
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

  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
    backgroundColor: C.elevated,
    borderRadius: 10,
    padding: 8,
  },
  rowArt: { width: 52, height: 52, borderRadius: 6 },
  rowEyebrow: { fontSize: 10, fontWeight: '700', color: C.cyan, letterSpacing: 0.6 },
  rowTitle: { fontSize: 14, fontWeight: '600', color: '#fff', marginTop: 1 },
  rowSub: { fontSize: 12, color: C.textSecondary, marginTop: 1 },

  merchRail: { gap: 12, paddingTop: 12 },
  merchCard: { width: 120 },
  merchArt: { width: 120, height: 120, borderRadius: 8, backgroundColor: C.elevated },
  merchLabel: { fontSize: 12, color: '#fff', marginTop: 6 },

  // Love Island Villa/Cast cards — same design language as the baseline home's rail.
  liRail:        { marginBottom: 28 },
  liRailContent: { paddingHorizontal: 16, gap: 12 },
  villaCard:     { borderRadius: 16, overflow: 'hidden' },
  villaGradient: { borderRadius: 16 },
  villaContent:  { flexDirection: 'row', alignItems: 'center', paddingVertical: 20, paddingHorizontal: 18, gap: 14 },
  villaEyebrow:  { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.72)', letterSpacing: 1.8, marginBottom: 6 },
  villaTitle:    { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -0.5, marginBottom: 4 },
  villaSub:      { fontSize: 14, color: 'rgba(255,255,255,0.88)', marginBottom: 6 },
  villaMeta:     { fontSize: 12, color: 'rgba(255,255,255,0.60)' },
  villaPlayBtn:  {
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

  miniCard: { width: 112 },
  miniArtWrap: { width: 112, height: 112, borderRadius: 8 },
  miniArt: { width: 112, height: 112, borderRadius: 8, backgroundColor: C.elevated },
  miniTitle: { fontSize: 12, fontWeight: '600', color: '#fff', marginTop: 6 },

  // Podcasts
  podCard: { width: 156 },
  podArt: { width: 156, height: 156, borderRadius: 10, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: C.surface },

  // Top Podcasts by Category — wrapping pill grid
  catGrid: { paddingHorizontal: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catPill: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  catPillText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  // Radio stations
  radioCard: { width: 156 },
  radioArtWrap: { width: 156, height: 156, borderRadius: 8, overflow: 'hidden', position: 'relative' },
  radioArt: { width: 156, height: 156, alignItems: 'center', justifyContent: 'center' },
  radioBadge: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBadge: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(0,0,0,0.80)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioTitle: { fontSize: 14, fontWeight: '600', color: '#fff', marginTop: 8 },
  radioMeta: { fontSize: 12, color: C.textSecondary, marginTop: 2 },

  // Artists
  artistCard: { width: 132, alignItems: 'center' },
  artistAvatar: { width: 132, height: 132, borderRadius: 66, alignItems: 'center', justifyContent: 'center' },
  artistName: { fontSize: 13, fontWeight: '600', color: '#fff', marginTop: 8, textAlign: 'center' },

  playBadge: { backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' },
})
