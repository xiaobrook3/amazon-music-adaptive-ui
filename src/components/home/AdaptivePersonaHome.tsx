import { useState, useMemo, useRef, useEffect } from 'react'
import { View, ScrollView, TouchableOpacity, StyleSheet, Animated, Dimensions, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '../AppText'
import { AppImage as Image } from '../AppImage'
import { EdgeFadeRow } from '../EdgeFadeRow'
import { HRail } from '../HRail'
import StickyHomeHeader, { useStickyHomeHeaderHeight, useStickyHomeScroll } from '../StickyHomeHeader'
import AdaptiveThemePills from '../AdaptiveThemePills'
import { useSharedValue } from 'react-native-reanimated'
import { useProfiles } from '../../context/ProfilesContext'
import { useAdaptiveUI, isOliviaSuperFanTheme } from '../../context/AdaptiveUIContext'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import {
  songs,
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
  type Song,
} from '../../data/mockData'
import { albumArtAssets, artistAssets, oliviaAboutAssets, resolveArtistAvatar, logoAssets } from '../../data/assetMap'
import {
  filterSongsForTheme,
  filterContinueListening,
  uniqueAlbumsFromSongs,
  getFeaturedArtists,
  getHiddenGemArtists,
} from '../../data/themeFilters'
import {
  OLIVIA_TOP_TRACK,
  OLIVIA_EXCLUSIVE_TRACK,
  OLIVIA_NEWS,
  OLIVIA_MERCH,
} from '../../data/oliviaSuperFanContent'
import { KPOP_BORAHAE_PLAYLIST } from '../../data/kpopContent'
import { LOVE_ISLAND_VILLA_PLAYLIST, LOVE_ISLAND_CAST_PLAYLIST } from '../../data/loveIslandContent'
import { artistShowTitle, artistShowEpisodeCount } from '../../data/podcastEpisodes'
import { C, R, typeHeadline } from '../../theme'

const { width: SCREEN_W } = Dimensions.get('window')
const QUICK_GAP = 10
const QUICK_W = (SCREEN_W - 32 - QUICK_GAP) / 2
// Love Island Villa/Cast cards page at near-full width (same as the baseline home).
const LI_CARD_W = SCREEN_W - 48

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

// Generic editorial playlists — text-on-gradient cards (no artwork needed).
// `genre` names the /genre/[id] browse destination each card opens.
const RELATED_PLAYLISTS = [
  { name: 'Relaxing Piano',       genre: 'Relax',    colors: ['#2E4A6E', '#3A6E7A'] as const },
  { name: 'Classical for Sleep',  genre: 'Sleep',    colors: ['#33285E', '#2E4668'] as const },
  { name: 'All-Time Hits',        genre: 'Charts',   colors: ['#B03A2E', '#B06A1E'] as const },
  { name: 'Deep Focus',           genre: 'Focus',    colors: ['#1E3E33', '#204048'] as const },
  { name: 'Feel-Good Throwbacks', genre: 'Party',    colors: ['#B06A1E', '#B03A6E'] as const },
  { name: 'Rainy Day Jazz',       genre: 'Jazz',     colors: ['#3A3068', '#28485A'] as const },
  { name: 'Top 100 Global',       genre: 'Charts',   colors: ['#2C4468', '#5A3BC4'] as const },
  { name: 'Late Night Lo-Fi',     genre: 'Relax',    colors: ['#4A3468', '#2E4A6E'] as const },
  { name: 'Acoustic Mornings',    genre: 'Commute',  colors: ['#5A4020', '#2E8A5E'] as const },
  { name: 'Workout Energy',       genre: 'Workout',  colors: ['#B03A2E', '#5A3BC4'] as const },
]

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

// Amazon-signature "Songs for you" — 3 rows per page, swiped horizontally with
// the next page peeking in from the right.
const SONGS_PER_PAGE = 3
const SONG_PAGE_PEEK = Math.round(SCREEN_W * 0.3)
const SONG_PAGE_WIDTH = SCREEN_W - SONG_PAGE_PEEK

// Module-level so the artist-page coach mark shows once per app session,
// not once per Home re-mount.
let artistPageHintSeen = false

// "You and your favorites" — monthly listening-trend cards (Figma 114:6189).
// Each dots row is 19 slots: 0 = quiet, 1-9 = listening intensity, T = today (cyan).
const FAVORITE_TRENDS = [
  {
    artistId: 'olivia-rodrigo',
    name: 'Olivia Rodrigo',
    tier: 'Superfan',
    insight: 'Your morning starter. 3 days running.',
    dots: [
      '6700000000000000000',
      '9600078979937977777',
      '3799000000037979777',
    ],
  },
  {
    artistId: 'bts',
    name: 'BTS',
    tier: 'In rotation',
    insight: 'You came back this week.',
    dots: [
      '0000000000000000056',
      '4534667786767777777',
      '5677000004500007890',
    ],
  },
  {
    artistId: 'sza',
    name: 'SZA',
    tier: 'New crush',
    insight: 'Three songs, on repeat.',
    dots: [
      '0000000000000000000',
      '0000000789987789977',
      '0000000899987909780',
    ],
  },
].map(f => ({ ...f, dots: [f.dots[0], f.dots[1], f.dots[2].slice(0, 18) + 'T'] }))

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

const BASE_SONGS_FOR_YOU = songsForYouIds.map(id => songs.find(s => s.id === id)).filter((s): s is Song => s != null)
const BASE_FREQUENT_PLAYS = frequentPlaySongIds.map(id => songs.find(s => s.id === id)).filter((s): s is Song => s != null)
const BASE_RISING = popularInCitySongIds.map(id => songs.find(s => s.id === id)).filter((s): s is Song => s != null)
const MY_MIXES = myMixPlaylistIds.map(id => playlists.find(p => p.id === id)).filter((p): p is typeof playlists[0] => p != null)

function resolveBannerArt(key: string) {
  return albumArtAssets[key] ?? artistAssets[key] ?? oliviaAboutAssets[key] ?? null
}

function tintFromHue(hue: string, alpha: number): string {
  if (hue.startsWith('#')) {
    const h = hue.replace('#', '')
    return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${alpha})`
  }
  const m = hue.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (m) return `rgba(${m[1]},${m[2]},${m[3]},${alpha})`
  return `rgba(38,22,32,${alpha})`
}

function greetingForHour(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Good morning'
  if (hour >= 12 && hour < 17) return 'Good afternoon'
  if (hour >= 17 && hour < 21) return 'Good evening'
  return 'Late night'
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

export default function AdaptivePersonaHome() {
  const router = useRouter()
  const { playSongAt } = usePlaybackState()
  const { activeProfile } = useProfiles()
  const { activeTheme, getSectionLabel, showConfirmation } = useAdaptiveUI()
  const { scrollY, onScroll } = useStickyHomeScroll()
  const stickyHeaderHeight = useStickyHomeHeaderHeight()

  // Top-bar domain drill-down. null = nothing selected (regular home + all three
  // pills). Pick a domain and the header collapses to [← | domain | For You].
  // 1 = Podcasts-forward, 2 = Audible/spoken-forward.
  const [domain, setDomain] = useState<number | null>(null)
  const podcastFirst = domain === 1 || domain === 2

  // Brooke, Rabiat, Celine & the custom profile get the dynamic drill-down + a
  // tailored "For You" cut of the active domain (focus 0 = domain browse, 1 = For You).
  const hasFocusToggle =
    activeTheme?.id !== 'olivia-rodrigo-superfan' &&
    (activeProfile.id === 'rabiat' ||
     activeProfile.id === 'brooke' ||
     activeProfile.id === 'celine' ||
     activeProfile.id === 'custom')
  const [focus, setFocus] = useState(0)
  const followingFocus = hasFocusToggle && domain !== null && focus === 1
  // On the Music sub-tab, drop "Jump back in" so the "Your world" card leads.
  const musicFocus = hasFocusToggle && domain === 0 && focus === 0

  const hour = new Date().getHours()
  const greeting = greetingForHour(hour)
  const slot = slotForHour(hour)
  const fandomLabel = activeTheme?.label ?? 'your music'

  const isOlivia = isOliviaSuperFanTheme(activeTheme)
  const isKpop = activeTheme?.id === 'kpop'
  const isLoveIsland = activeTheme?.id === 'love-island'

  const openSong = (id: string) => {
    playSongAt(id)
    router.push('/now-playing')
  }

  // One-time coach mark on the artist-page entry card; stays dismissed for the
  // rest of the session once tapped away or once the page has been visited.
  const [showArtistHint, setShowArtistHint] = useState(!artistPageHintSeen)
  const dismissArtistHint = () => {
    artistPageHintSeen = true
    setShowArtistHint(false)
  }
  const openOliviaPage = (tab?: 'you' | 'events' | 'about' | 'merch') => {
    dismissArtistHint()
    router.push((tab ? `/artist/olivia-rodrigo?tab=${tab}` : '/artist/olivia-rodrigo') as any)
  }

  const jumpBackIn = useMemo(
    () => filterContinueListening(continueListeningItems, activeTheme, songs).slice(0, 4),
    [activeTheme],
  )
  const songsForYou = useMemo(() => filterSongsForTheme(BASE_SONGS_FOR_YOU, activeTheme), [activeTheme])
  const albumsForYou = useMemo(() => uniqueAlbumsFromSongs(filterSongsForTheme(songs, activeTheme), 10), [activeTheme])
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
  const featuredArtists = useMemo(() => getFeaturedArtists(activeTheme, homeFeaturedArtistIds, 16), [activeTheme])
  // "More like Olivia Rodrigo" suggests artists LIKE her — never Olivia herself;
  // her page gets its own entry card in the fandom world block instead.
  const moreLikeArtists = useMemo(
    () => (isOlivia ? featuredArtists.filter(a => a.id !== activeTheme?.heroArtistId) : featuredArtists),
    [featuredArtists, isOlivia, activeTheme],
  )
  const onRepeat = useMemo(() => filterSongsForTheme(BASE_FREQUENT_PLAYS, activeTheme), [activeTheme])
  const rising = useMemo(() => filterSongsForTheme(BASE_RISING, activeTheme), [activeTheme])
  const hiddenGems = useMemo(() => getHiddenGemArtists(hiddenGemsArtistIds), [])
  const songStack = useMemo(() => filterSongsForTheme(songs, activeTheme).slice(0, 15), [activeTheme])
  const songPages = useMemo(() => chunk(songStack, SONGS_PER_PAGE), [songStack])
  const songSnapOffsets = useMemo(() => songPages.map((_, i) => i * SONG_PAGE_WIDTH), [songPages])

  // Fandom-adaptive pool of podcast shows — only a few real podcasts exist in the
  // mock data, so we top up with artist-led shows (real avatars as covers) biased
  // to the active persona's taste, giving the podcast domain enough to scroll.
  const podcastShows = useMemo(() => {
    const artistShows = getFeaturedArtists(activeTheme, homeFeaturedArtistIds, 14).map((a, i) => ({
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
  }, [activeTheme])

  // Editorial playlists — a few tailored to the active persona's fandom, then the
  // generic ones. Baseline / no-theme keeps the generic list only.
  const relatedPlaylists = useMemo(() => {
    if (!activeTheme) return RELATED_PLAYLISTS
    const f = activeTheme.label
    // Genre-style themes (K-pop, Jazz, Latin…) can deep-link their tailored
    // cards into the genre browse; artist themes fall back to Explore Music.
    const genreThemes = ['K-pop', 'Jazz', 'Pop', 'Latin', 'Rock', 'Hip-Hop']
    const themeGenre = genreThemes.includes(f) ? f : undefined
    const tailored = [
      { name: `${f} Essentials`, genre: themeGenre, colors: ['#6D3BC4', '#C43B7A'] as const },
      { name: `Best of ${f}`,    genre: themeGenre, colors: ['#2E6E8A', '#3B5BC4'] as const },
      { name: `${f} for Focus`,  genre: 'Focus',    colors: ['#2E8A5E', '#2E7A8A'] as const },
    ]
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
  const coverRail = (title: string, list: Song[], sub?: string) => (
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
              <TouchableOpacity style={s.coverCard} activeOpacity={0.85} onPress={() => openSong(song.id)}>
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
      <SectionHeader title={isOlivia ? `Podcasts in the ${fandomLabel} world` : 'Podcasts for you'} />
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
                {/* Mic always centered — the podcast marker, over gradient or photo */}
                <View style={s.podMicCenter}>
                  <View style={s.micCircle}>
                    <Ionicons name="mic" size={26} color="rgba(255,255,255,0.92)" />
                  </View>
                </View>
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
        isOlivia ? `Podcasts in your ${fandomLabel} world` : `Podcasts for your ${slot}`,
        'Handpicked shows for a superfan',
        podcastShows.slice(2, 12),
      )}
      {podcastShowRail('New episodes this week', 'Fresh drops from shows you follow', [...podcastShows].reverse().slice(0, 10))}
      {podcastShowRail(`Trending in ${fandomLabel}`, 'What every fan is playing right now', podcastShows.slice(3, 13))}
      {podcastShowRail(`Because you love ${fandomLabel}`, 'More talk, deep dives & interviews', podcastShows.slice(5, 15))}
    </>
  )

  // Generic editorial playlists — bold Ember name on a gradient card + AM logo.
  const relatedRail = (
    <View style={s.block}>
      <SectionHeader title="Playlists for every mood" sub="Ready-made mixes for whatever you're doing" />
      <EdgeFadeRow>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
          {relatedPlaylists.map((pl, idx) => (
            <TouchableOpacity
              key={`${pl.name}-${idx}`}
              style={s.coverCard}
              activeOpacity={0.85}
              onPress={() =>
                pl.genre
                  ? router.push(`/genre/${encodeURIComponent(pl.genre)}` as any)
                  : router.push('/music')
              }
            >
              <View style={s.relatedArt}>
                <LinearGradient colors={pl.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
                <Image source={logoAssets.amIcon} style={s.relatedLogo} resizeMode="contain" />
                <Text style={s.relatedName} numberOfLines={3}>{pl.name}</Text>
              </View>
            </TouchableOpacity>
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

  return (
    <View style={s.screen}>
      {/* Top-of-page gradient wash — same static accent as Forgotten Favorites */}
      <View style={s.topGradientWash} pointerEvents="none">
        <LinearGradient
          colors={['rgba(80,76,118,0.48)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
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

        {/* 1 — Contextual greeting (recognition + situational) */}
        <View style={s.greetWrap}>
          <View style={s.greetRow}>
            <Text style={s.greetHello}>{greeting},</Text>
            <Ionicons name="sparkles" size={14} color={accent} style={{ marginLeft: 6 }} />
          </View>
          <Text style={s.greetName}>{activeProfile.name.split(' ')[0]}</Text>
        </View>

        {/* 2 — Jump back in (fast return) — music domain only; podcasts have their own.
            For Olivia superfan, Jump back in is repositioned after the featured-artists section. */}
        {!podcastFirst && !musicFocus && !isOlivia && jumpBackIn.length > 0 && (
          <View style={s.block}>
            <SectionHeader title="Jump back in" />
            <View style={s.quickGrid}>
              {jumpBackIn.map(item => {
                const art = item.artKey ? resolveBannerArt(item.artKey) : null
                const kind = continueListeningKind(item.id)
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={s.quickCard}
                    activeOpacity={0.85}
                    onPress={() =>
                      item.podcastId
                        ? router.push(`/podcast-show/${item.podcastId}` as any)
                        : item.songId && openSong(item.songId)
                    }
                  >
                    <View style={s.quickArtWrap}>
                      {art ? (
                        <Image source={art} style={s.quickArt} resizeMode="cover" />
                      ) : (
                        <View style={[s.quickArt, { backgroundColor: C.surface }]} />
                      )}
                      <View style={s.artBorderOverlay} pointerEvents="none" />
                    </View>
                    <View style={s.quickText}>
                      <Text style={s.quickTitle} numberOfLines={1}>{item.title}</Text>
                      <View style={s.quickKindRow}>
                        <Ionicons name={kind.icon as any} size={10} color={C.textMuted} />
                        <Text style={s.quickKind}>{kind.label}</Text>
                      </View>
                    </View>
                    <PlayBadge size={26} />
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>
        )}


        {/* Podcast domain: podcasts rise to the top; the category browse moves to
            the very bottom (rendered after My Mixes). */}
        {podcastFirst && podcastFeed}

        {/* Sections 3–8 (music discovery) — hidden entirely in the podcast domain */}
        {!podcastFirst && (
        <>
        {/* 3 — Your <fandom> world — music loyalty group */}
        <View style={[s.block, s.fandomShadow]}>
          <View style={[s.fandomInner, { borderColor: tintFromHue(accent, 0.42) }]}>
          {/* Top-right corner bloom — fades toward bottom-left */}
          <LinearGradient
            colors={[tintFromHue(hue, 0.55), tintFromHue(hue, 0.20), 'transparent']}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 0.6 }}
            locations={[0, 0.35, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <LinearGradient
            colors={[tintFromHue(accent, 0.20), 'transparent']}
            style={s.fandomGlowTop}
            pointerEvents="none"
          />
          <View style={s.fandomHead}>
            {!isOlivia && <Ionicons name="heart" size={14} color={accent} />}
            <Text style={s.fandomTitle}>{isOlivia ? 'Your featured favorite' : `Your ${fandomLabel} world`}</Text>
          </View>
          {isKpop && (
            <View style={s.fanTier}>
              <Ionicons name="star" size={11} color={C.cyan} />
              <Text style={[s.fanTierText, { color: C.cyan }]}>Top 1% of {fandomLabel} fans on Amazon Music</Text>
            </View>
          )}

          {/* One-time coach mark: the featured photo below is the front door to
              the adaptive artist profile */}
          {isOlivia && showArtistHint && (
            <>
              <View style={s.artistHint}>
                <Ionicons name="sparkles" size={12} color={C.cyan} />
                <Text style={s.artistHintText}>New — Olivia&apos;s page adapts to you. Tap her photo to open it.</Text>
                <TouchableOpacity
                  onPress={dismissArtistHint}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel="Dismiss hint"
                >
                  <Ionicons name="close" size={14} color={C.textMuted} />
                </TouchableOpacity>
              </View>
              <View style={s.artistHintCaret} />
            </>
          )}

          {isOlivia ? (
            <View style={s.ffRow}>
              {/* LEFT — featured favorite photo card (Figma 114:6101 "newest update");
                  the whole photo is the artist-page entry */}
              <TouchableOpacity
                style={s.ffCard}
                activeOpacity={0.88}
                onPress={() => openOliviaPage()}
                accessibilityLabel="Open Olivia Rodrigo's adaptive artist page"
              >
                {(() => {
                  const art = activeTheme?.heroBannerKey ? resolveBannerArt(activeTheme.heroBannerKey) : null
                  return art ? (
                    <Image source={art} style={StyleSheet.absoluteFill} resizeMode="cover" />
                  ) : (
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: tintFromHue(hue, 0.9) }]} />
                  )
                })()}
                <LinearGradient
                  colors={['rgba(102,102,102,0)', 'rgba(0,0,0,0.6)']}
                  locations={[0.59, 1]}
                  style={StyleSheet.absoluteFill}
                />
                {/* following bubble — heart pill with a thought-bubble tail */}
                <View style={s.ffBubbleWrap} pointerEvents="none">
                  <View style={s.ffBubble}>
                    <Ionicons name="heart" size={13} color="#fff" />
                    <Text style={s.ffBubbleText}>Since Mar 2020</Text>
                  </View>
                  <View style={s.ffBubbleDot1} />
                  <View style={s.ffBubbleDot2} />
                </View>
                {/* Top 1% listener → your journey (You & Olivia) */}
                <TouchableOpacity
                  onPress={() => openOliviaPage('you')}
                  activeOpacity={0.7}
                  hitSlop={{ top: 6, bottom: 2, left: 4, right: 12 }}
                  accessibilityLabel="Top 1% listener — see your journey with Olivia"
                >
                  <Text style={s.ffTier}>Top 1% listener</Text>
                </TouchableOpacity>
                <Text style={s.ffName} numberOfLines={1}>Olivia Rodrigo</Text>
              </TouchableOpacity>

              {/* RIGHT — what you unlocked (→ music) + tour news (→ events) */}
              <View style={s.ffCol}>
                <TouchableOpacity
                  style={[s.ffUnlock, Platform.OS === 'web' ? ({ backdropFilter: 'blur(4.4px)' } as any) : null]}
                  activeOpacity={0.8}
                  onPress={() => openOliviaPage()}
                  accessibilityLabel="What you unlocked — exclusive for you"
                >
                  <View style={{ flex: 1, justifyContent: 'center' }}>
                    <Text style={s.ffUnlockEyebrow}>WHAT YOU UNLOCKED</Text>
                    <Text style={s.ffUnlockTitle}>Exclusive for you</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#fff" style={{ alignSelf: 'flex-end' }} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.ffTour}
                  activeOpacity={0.8}
                  onPress={() => openOliviaPage('events')}
                  accessibilityLabel="Guts world tour announced — find tickets"
                >
                  <Text style={s.ffTourTitle}>Guts world tour announced</Text>
                  <View style={s.ffTourPill}>
                    <Text style={s.ffTourPillText}>Find tickets</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={s.featureCard} activeOpacity={0.88} onPress={() => openSong(onRepeat[0]?.id ?? songs[0].id)}>
              {(() => {
                const art = activeTheme?.heroBannerKey ? resolveBannerArt(activeTheme.heroBannerKey) : null
                return art ? (
                  <Image source={art} style={StyleSheet.absoluteFill} resizeMode="cover" />
                ) : (
                  <View style={[StyleSheet.absoluteFill, { backgroundColor: tintFromHue(hue, 0.9) }]} />
                )
              })()}
              <LinearGradient
                colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.78)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={s.featureText}>
                <Text style={s.featureEyebrow}>{activeTheme?.heroEyebrow ?? 'FOR YOU'}</Text>
                <Text style={s.featureTitle} numberOfLines={2}>{activeTheme?.heroTitle ?? fandomLabel}</Text>
              </View>
              <View style={s.featurePlay}><PlayBadge size={40} /></View>
            </TouchableOpacity>
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

          {/* On-repeat tracks for this fandom */}
          <EdgeFadeRow fadeColor={C.surface}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.merchRail} nestedScrollEnabled>
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
        </View>

        {/* Love Island world: the Villa + Cast cards (same design as the
            official-playlist treatment) — shown only for the Love Island theme */}
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

        {/* Jump back in — Olivia superfan only; between the fandom world block and the songsForYou rail */}
        {!podcastFirst && isOlivia && jumpBackIn.length > 0 && (
          <View style={s.block}>
            <SectionHeader title="Jump back in" />
            <View style={s.quickGrid}>
              {jumpBackIn.map(item => {
                const art = item.artKey ? resolveBannerArt(item.artKey) : null
                const kind = continueListeningKind(item.id)
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={s.quickCard}
                    activeOpacity={0.85}
                    onPress={() =>
                      item.podcastId
                        ? router.push(`/podcast-show/${item.podcastId}` as any)
                        : item.songId && openSong(item.songId)
                    }
                  >
                    <View style={s.quickArtWrap}>
                      {art ? (
                        <Image source={art} style={s.quickArt} resizeMode="cover" />
                      ) : (
                        <View style={[s.quickArt, { backgroundColor: C.surface }]} />
                      )}
                      <View style={s.artBorderOverlay} pointerEvents="none" />
                    </View>
                    <View style={s.quickText}>
                      <Text style={s.quickTitle} numberOfLines={1}>{item.title}</Text>
                      <View style={s.quickKindRow}>
                        <Ionicons name={kind.icon as any} size={10} color={C.textMuted} />
                        <Text style={s.quickKind}>{kind.label}</Text>
                      </View>
                    </View>
                    <PlayBadge size={26} />
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>
        )}

        {/* 4 — Made for you right now (situational picks) */}
        {coverRail(getSectionLabel('songsForYou', `Made for your ${slot}`), songsForYou)}

        {/* 5 — More from your world (fandom-adjacent discovery) */}
        <View style={s.block}>
          <SectionHeader title={followingFocus ? 'New from your artists' : `More like ${fandomLabel}`} />
          <EdgeFadeRow>
            <HRail
              data={followingFocus ? featuredArtists : moreLikeArtists}
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

        {coverRail('Albums in your rotation', albumsForYou, 'Your most-played albums this month')}

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
                      onPress={() => router.push(`/radio/${st.id}` as any)}
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
                          <Ionicons name="radio-outline" size={22} color="#fff" />
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

        {/* Amazon-signature swipeable song stack — 3 rows per page, brought in
            mid-feed to break up the cover rails with a denser list view. */}
        {songPages.length > 0 && (
          <View style={s.block}>
            <SectionHeader title="Songs for you" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              decelerationRate="normal"
              snapToOffsets={songSnapOffsets}
              snapToAlignment="start"
              nestedScrollEnabled
              contentContainerStyle={[s.songsScrollContent, { paddingRight: SONG_PAGE_PEEK }]}
            >
              {songPages.map((page, pageIdx) => (
                <View key={`spage-${pageIdx}`} style={[s.songsPage, { width: SONG_PAGE_WIDTH }]}>
                  {page.map(song => {
                    const art = song.albumArtPath ? albumArtAssets[song.albumArtPath] : null
                    return (
                      <TouchableOpacity key={song.id} style={s.songRow} activeOpacity={0.8} onPress={() => openSong(song.id)}>
                        {art ? (
                          <Image source={art} style={s.songRowArt} resizeMode="cover" />
                        ) : (
                          <View style={[s.songRowArt, { backgroundColor: song.albumArtColor }]}>
                            <Ionicons name="musical-note" size={18} color="rgba(255,255,255,0.2)" />
                          </View>
                        )}
                        <View style={s.songRowInfo}>
                          <Text style={s.songRowTitle} numberOfLines={1}>{song.title}</Text>
                          <Text style={s.songRowArtist} numberOfLines={1}>{song.artistName}</Text>
                        </View>
                        <PlayBadge size={28} />
                      </TouchableOpacity>
                    )
                  })}
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Theme switcher — tap a pill to re-skin the whole home on the fly. */}
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

        {/* 6 — Recognition-led discovery: broad picks + rising artists.
            Hidden under the "Following" focus, which stays close to home. */}
        {!followingFocus && coverRail('Popular in your city', rising)}

        {!followingFocus && (
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
        )}

        {/* 7 — Podcasts (unless already surfaced by the domain filter) */}
        {!podcastFirst && podcastsRail}

        {/* 8 — My Mixes (curated) */}
        <View style={s.block}>
          <SectionHeader title={getSectionLabel('myMixes', 'My Mixes')} sub="Updated at 6:00 AM" />
          <EdgeFadeRow>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
              {MY_MIXES.map(mix => {
                const art = mix.coverArtPath ? albumArtAssets[mix.coverArtPath] : null
                return (
                  <TouchableOpacity key={mix.id} style={s.coverCard} activeOpacity={0.85} onPress={() => router.push(`/playlist/${mix.id}` as any)}>
                    <View style={s.coverArtWrap}>
                      {art ? (
                        <Image source={art} style={s.coverArt} resizeMode="cover" />
                      ) : (
                        <View style={[s.coverArt, { backgroundColor: C.surface }]}>
                          <Ionicons name="musical-notes" size={26} color="rgba(255,255,255,0.15)" />
                        </View>
                      )}
                      <View style={s.artBorderOverlay} pointerEvents="none" />
                      <View style={s.coverPlayPos}><PlayBadge size={28} /></View>
                    </View>
                    <Text style={s.coverTitle} numberOfLines={1}>{mix.name}</Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </EdgeFadeRow>
        </View>

        {/* 9 — You and your favorites: monthly listening-trend cards (Figma 114:6189).
            Each dot is one listening slot this month; the cyan dot is today. */}
        <View style={s.block}>
          <View style={s.favHead}>
            <Text style={s.sectionTitle}>You and your favorites</Text>
            <Text style={s.favSeeMore}>SEE MORE</Text>
          </View>
          <EdgeFadeRow>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
              {FAVORITE_TRENDS.map(fav => {
                const art = resolveArtistAvatar(fav.artistId)
                return (
                  <TouchableOpacity
                    key={fav.artistId}
                    style={s.favCard}
                    activeOpacity={0.85}
                    onPress={() =>
                      fav.artistId === 'olivia-rodrigo'
                        ? openOliviaPage('you')
                        : router.push(`/artist/${fav.artistId}` as any)
                    }
                    accessibilityLabel={`${fav.tier} — ${fav.name}. ${fav.insight}`}
                  >
                    {art && <Image source={art} style={StyleSheet.absoluteFill} resizeMode="cover" />}
                    <LinearGradient
                      colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.5)']}
                      locations={[0.19, 0.52, 0.81]}
                      style={StyleSheet.absoluteFill}
                    />
                    <View style={s.favTopRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                        {art && <Image source={art} style={s.favAvatar} resizeMode="cover" />}
                        <View style={{ flex: 1 }}>
                          <Text style={s.favTier}>{fav.tier}</Text>
                          <Text style={s.favName} numberOfLines={1}>{fav.name}</Text>
                        </View>
                      </View>
                      <Ionicons name="ellipsis-horizontal" size={20} color="rgba(255,255,255,0.8)" />
                    </View>
                    <View>
                      <Text style={s.favMonth}>THIS MONTH</Text>
                      <Text style={s.favInsight}>{fav.insight}</Text>
                      <View style={s.favDots}>
                        {fav.dots.map((row, ri) => (
                          <View key={ri} style={s.favDotRow}>
                            {row.split('').map((ch, ci) => (
                              <View
                                key={ci}
                                style={[
                                  s.favDot,
                                  ch === 'T'
                                    ? { backgroundColor: C.cyan }
                                    : ch === '0'
                                      ? null
                                      : { backgroundColor: `rgba(255,255,255,${(0.1 + (Number(ch) / 9) * 0.75).toFixed(2)})` },
                                ]}
                              />
                            ))}
                          </View>
                        ))}
                      </View>
                    </View>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </EdgeFadeRow>
        </View>
        </>
        )}

        {/* Podcast domain: the "Top Podcasts by Category" browse lives at the very bottom */}
        {podcastFirst && categoryGrid}
      </Animated.ScrollView>

      <StickyHomeHeader
        firstName={activeProfile.name.split(' ')[0]}
        activePill={domain}
        onPillChange={setDomain}
        scrollY={scrollY}
        domainNav={
          hasFocusToggle
            ? {
                domains: DOMAIN_LABELS,
                domain,
                focus,
                subLabel: 'For You',
                onSelectDomain: (i: number) => { setDomain(i); setFocus(0) },
                onBack: () => { setDomain(null); setFocus(0) },
                onFocus: setFocus,
              }
            : undefined
        }
      />
    </View>
  )
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  topGradientWash: { position: 'absolute', top: 0, left: 0, right: 0, height: 340 },

  greetWrap: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 26 },
  greetRow: { flexDirection: 'row', alignItems: 'center' },
  greetHello: { fontSize: 15, color: C.textSecondary, fontWeight: '600' },
  greetName: { ...typeHeadline(30), color: '#fff', marginTop: 2 },
  greetSub: { fontSize: 14, color: C.textSecondary, marginTop: 4 },

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

  block: { marginBottom: 34 },
  sectionHead: { paddingHorizontal: 16, marginBottom: 14 },
  sectionTitle: { ...typeHeadline(20), color: '#fff' },
  sectionSub: { fontSize: 13, color: C.textSecondary, marginTop: 2 },
  rail: { paddingHorizontal: 16, gap: 16 },

  // Swipeable 3-up "Songs for you" stack (Amazon-signature paged list)
  songsScrollContent: { paddingLeft: 16 },
  songsPage: { paddingRight: 14 },
  songRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  songRowArt: { width: 54, height: 54, borderRadius: 6, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  songRowInfo: { flex: 1, marginLeft: 10, marginRight: 8 },
  songRowTitle: { fontSize: 15, fontWeight: '600', color: '#fff', marginBottom: 2 },
  songRowArtist: { fontSize: 13, color: C.textSecondary },

  // Jump back in
  quickGrid: { paddingHorizontal: 16, flexDirection: 'row', flexWrap: 'wrap', gap: QUICK_GAP },
  quickCard: {
    width: QUICK_W,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    overflow: 'hidden',
    paddingRight: 8,
  },
  quickArtWrap: { width: 64, height: 64 },
  quickArt: { width: 64, height: 64 },
  quickText: { flex: 1, marginLeft: 10, marginRight: 6 },
  quickTitle: { fontSize: 13, fontWeight: '600', color: '#fff' },
  quickKindRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  quickKind: { fontSize: 10, color: C.textMuted, fontWeight: '600', letterSpacing: 0.3 },

  // Cover rails
  coverCard: { width: 150 },
  relatedArt: { width: 150, height: 150, borderRadius: 12, overflow: 'hidden', padding: 12, justifyContent: 'flex-end' },
  relatedName: { ...typeHeadline(20), color: '#fff' },
  relatedLogo: { position: 'absolute', top: 10, right: 10, width: 26, height: 26, borderRadius: 6 },
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

  // Fandom world group
  fandomShadow: {
    marginHorizontal: 12,
    borderRadius: 20,
    backgroundColor: C.elevated,
    // Soft neutral depth only — the coloured glow now lives inside the panel.
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  fandomInner: {
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: 'hidden',
    padding: 16,
  },
  fandomGlowTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 60 },
  fandomGlowBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60 },
  fandomHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  fandomTitle: { ...typeHeadline(19), color: '#fff' },
  fanTier: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: -6, marginBottom: 12 },
  fanTierText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.2 },
  featureCard: { height: 168, borderRadius: 12, overflow: 'hidden', justifyContent: 'flex-end' },
  featureText: { padding: 14 },
  featureEyebrow: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.85)', letterSpacing: 1 },
  featureTitle: { ...typeHeadline(24), color: '#fff', marginTop: 4 },
  featurePlay: { position: 'absolute', right: 12, bottom: 12 },

  bentoRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 12,
  },
  bentoMedCard: {
    flex: 2,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  bentoColRight: {
    flex: 1,
    gap: 4,
  },
  // Card 1: full-bleed art — no padding, image fills the card
  bentoSmallArtBg: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  bentoSmallArtContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 7,
  },
  // Card 2: lock/exclusive — horizontal row with icon + text + chevron
  bentoSmallCard: {
    flex: 1,
    backgroundColor: C.elevated,
    borderRadius: 10,
    overflow: 'hidden',
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  // Card 3: accent bar + headline
  bentoSmallNewsCard: {
    flex: 1,
    backgroundColor: C.elevated,
    borderRadius: 10,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  bentoSmallAccentBar: {
    width: 3,
    alignSelf: 'stretch',
    backgroundColor: C.cyan,
  },
  bentoSmallNewsBody: {
    flex: 1,
    padding: 7,
    justifyContent: 'space-between',
  },
  bentoSmallNewsText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#fff',
    lineHeight: 15,
  },
  bentoSmallNewsChevron: {
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  // Shared eyebrow + label used across all 3 small cards
  bentoSmallEyebrow: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: C.cyan,
    letterSpacing: 0.6,
  },
  bentoSmallLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#fff',
    marginTop: 1,
  },

  // "Your featured favorite" module (Figma 114:6101) — photo card + right column
  ffRow: { flexDirection: 'row', gap: 12, alignItems: 'stretch' },
  ffCard: {
    flex: 1,
    height: 244,
    borderRadius: 12,
    overflow: 'hidden',
    padding: 12,
    justifyContent: 'flex-end',
  },
  ffBubbleWrap: { position: 'absolute', right: 6, top: 7, width: 110, height: 40 },
  ffBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 27,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: '#DE909C',
    alignSelf: 'flex-start',
  },
  ffBubbleText: { fontSize: 12, color: '#fff' },
  ffBubbleDot1: { position: 'absolute', left: 8, top: 22, width: 11, height: 11, borderRadius: 5.5, backgroundColor: '#DE909C' },
  ffBubbleDot2: { position: 'absolute', left: 4, top: 33, width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#DE909C' },
  ffTier: { fontSize: 16, fontWeight: '700', color: '#fff' },
  // Figma spec is 33px, but the flex-shrunk card gives the name ~187px of run —
  // 29px is the largest size that never ellipsizes "Olivia Rodrigo".
  ffName: { fontSize: 29, fontWeight: '700', color: '#fff', lineHeight: 32, marginTop: 2 },
  ffCol: { width: 120, gap: 12 },
  ffUnlock: {
    height: 139,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.22)',
    padding: 12,
  },
  ffUnlockEyebrow: { fontSize: 12, fontWeight: '700', color: C.cyan, letterSpacing: 0.3 },
  ffUnlockTitle: { fontSize: 20, fontWeight: '700', color: '#fff', lineHeight: 21, marginTop: 4 },
  ffTour: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
    gap: 12,
  },
  ffTourTitle: { fontSize: 14, fontWeight: '700', color: '#fff', lineHeight: 16 },
  ffTourPill: {
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  ffTourPillText: { fontSize: 14, color: '#fff', lineHeight: 14 },

  // "You and your favorites" trend cards
  favHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 2 },
  favSeeMore: { fontSize: 14, fontWeight: '700', color: '#757575' },
  favCard: {
    width: 212,
    height: 212,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    overflow: 'hidden',
    padding: 12,
    justifyContent: 'space-between',
  },
  favTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  favAvatar: { width: 36, height: 36, borderRadius: 18 },
  favTier: { fontSize: 12, fontWeight: '700', color: '#fff' },
  favName: { fontSize: 16, fontWeight: '700', color: '#fff', marginTop: 3 },
  favMonth: { fontSize: 12, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.3 },
  favInsight: { fontSize: 20, fontWeight: '700', color: '#fff', lineHeight: 21, marginTop: 5 },
  favDots: { marginTop: 8, gap: 2 },
  favDotRow: { flexDirection: 'row', gap: 2 },
  favDot: { width: 8, height: 8, borderRadius: 4 },

  artistHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(37,209,218,0.12)',
    borderColor: 'rgba(37,209,218,0.45)',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  artistHintText: { flex: 1, fontSize: 12, lineHeight: 16, color: '#CFF6F8' },
  artistHintCaret: {
    width: 0,
    height: 0,
    marginLeft: 22,
    marginBottom: 6,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(37,209,218,0.45)',
  },

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
  podMicCenter: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },

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
  micCircle: {
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
  artistCard: { width: 120, alignItems: 'center' },
  artistAvatar: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center' },
  artistName: { fontSize: 13, fontWeight: '600', color: '#fff', marginTop: 8, textAlign: 'center' },

  playBadge: { backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' },
})
