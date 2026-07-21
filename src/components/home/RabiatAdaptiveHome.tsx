import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  RefreshControl,
  Platform,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '../AppText'
import { AppImage as Image } from '../AppImage'
import { EdgeFadeRow } from '../EdgeFadeRow'
import { HRail } from '../HRail'
import EqualizerBars from '../EqualizerBars'
import { PlaylistMoodCard } from './HomeSessionWidgets'
import StickyHomeHeader, { useStickyHomeHeaderHeight, useStickyHomeScroll } from '../StickyHomeHeader'
import { useProfiles } from '../../context/ProfilesContext'
import { useAdaptiveUI } from '../../context/AdaptiveUIContext'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import {
  songs,
  playlists,
  continueListeningItems,
  continueListeningKind,
  frequentPlaySongIds,
  songsForYouIds,
  popularInCitySongIds,
  myMixPlaylistIds,
  type Song,
} from '../../data/mockData'
import { filterContinueListening } from '../../data/themeFilters'
import { albumArtAssets, artistAssets, resolveArtistAvatar, logoAssets } from '../../data/assetMap'
import { C, R, typeHeadline } from '../../theme'

/**
 * RABIAT'S HOME — the true Adaptive UI surface.
 *
 * Unlike the persona homes (same layout, different content), this page adapts
 * its STRUCTURE from signals, silently, in the app's existing design language:
 *
 *  · TEMPORAL    an album drop leads the page while the moment is live, then
 *                decays to a small row and never takes over again.
 *  · ENGAGEMENT  active tapping keeps the full dense feed; passive playback
 *                collapses the page to a calm, one-decision layout. The
 *                standard segmented pill (For you / Wind down) reflects the
 *                inference and doubles as the explicit override.
 *  · ARBITRATION Rabiat follows two artists. A live drop decides which world
 *                leads; otherwise pull-to-refresh rotates them, and the world
 *                pills let her choose outright.
 *  · CONFIDENCE  expressed through placement and framing, not labels: sure
 *                bets lead ("On repeat"), medium picks follow, and low-
 *                confidence discovery ("Something different") only appears
 *                when she's actively exploring.
 *
 * Scoped strictly to the `rabiat` profile.
 */

const SCREEN_W = Platform.OS === 'web' ? Math.min(Dimensions.get('window').width, 402) : Dimensions.get('window').width
const QUICK_GAP = 10
const QUICK_W = (SCREEN_W - 32 - QUICK_GAP) / 2
const TOGGLE_H = 38
const TOGGLE_PAD = 4
const TOGGLE_SEG_W = (SCREEN_W - 32 - TOGGLE_PAD * 2) / 2

// ── Session memory (module-level so tab switches don't reset the moment) ────
type WorldId = 'bad-bunny' | 'rosalia'
const rabiatSession = {
  startedAt: 0,
  interactions: [] as number[],
  overrode: false,
  overrideMode: 'in' as 'in' | 'back',
  dropStage: 'live' as 'live' | 'compact',
  world: 'bad-bunny' as WorldId,
}

// The temporal event: a Bad Bunny album drop, live right now.
const DROP = {
  artistId: 'bad-bunny' as WorldId,
  artistName: 'Bad Bunny',
  albumTitle: 'DeBÍ TiRAR MáS FOToS',
  artKey: 'bad-bunny-verano',
  leadSongId: 's-bb2',
  listeners: '18.4k',
  liveWindowMs: 6 * 60 * 1000,
}

const WORLDS: Record<WorldId, {
  name: string
  hue: string
  tierLine: string
  sinceLine: string
  pulseLine: string
  featureEyebrow: string
  featureTitle: string
  bannerKey: string
}> = {
  'bad-bunny': {
    name: 'Bad Bunny',
    hue: '#C45C2A',
    tierLine: 'Top 2% of Bad Bunny fans on Amazon Music',
    sinceLine: 'Three years and 412 hours together',
    pulseLine: '2.1k fans like you are playing "Efecto" right now',
    featureEyebrow: 'EL CONEJO MALO',
    featureTitle: 'Your Bad Bunny world',
    bannerKey: 'bad-bunny',
  },
  rosalia: {
    name: 'Rosalía',
    hue: '#B03A6E',
    tierLine: 'Top 5% of Rosalía fans, and climbing',
    sinceLine: 'Eight months and 96 hours together',
    pulseLine: '1.3k motomamis are playing "SAOKO" right now',
    featureEyebrow: 'MOTOMAMI',
    featureTitle: 'Your Rosalía world',
    bannerKey: 'rosalia-el-mal-querer',
  },
}

// Editorial mood playlists, same gradient-card treatment as the persona home.
const MOOD_PLAYLISTS = [
  { name: 'Fuego Total',         genre: 'Party',   colors: ['#B03A2E', '#B06A1E'] as const },
  { name: 'Suave y Lento',       genre: 'Relax',   colors: ['#2E4A6E', '#3A6E7A'] as const },
  { name: 'Reggaeton Workout',   genre: 'Workout', colors: ['#B03A2E', '#5A3BC4'] as const },
  { name: 'Deep Focus',          genre: 'Focus',   colors: ['#1E3E33', '#204048'] as const },
  { name: 'Late Night Latin',    genre: 'Relax',   colors: ['#4A3468', '#2E4A6E'] as const },
  { name: 'Top 100 Global',      genre: 'Charts',  colors: ['#2C4468', '#5A3BC4'] as const },
]

const LATIN_ARTIST_IDS = ['bad-bunny', 'rosalia', 'gloria-estefan', 'dua-lipa', 'doja-cat', 'beyonce', 'rihanna', 'lizzo', 'olivia-rodrigo']

function slotForHour(hour: number): string {
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 21) return 'evening'
  return 'late night'
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

/** Same segmented pill as the persona home's focus toggle. */
function ModeToggle({
  value,
  onChange,
  accent,
}: {
  value: number
  onChange: (i: number) => void
  accent: string
}) {
  const anim = useRef(new Animated.Value(value)).current
  useEffect(() => {
    Animated.spring(anim, { toValue: value, useNativeDriver: true, damping: 18, stiffness: 220, mass: 0.7 }).start()
  }, [value, anim])
  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, TOGGLE_SEG_W] })
  return (
    <View style={s.toggleTrack}>
      <Animated.View style={[s.toggleIndicator, { backgroundColor: accent, transform: [{ translateX }] }]} pointerEvents="none" />
      {(['For you', 'Wind down'] as const).map((opt, i) => (
        <TouchableOpacity key={opt} style={s.toggleSeg} activeOpacity={0.8} onPress={() => onChange(i)}>
          <Text style={[s.toggleLabel, value === i && s.toggleLabelActive]}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

function tint(hue: string, alpha: number): string {
  const h = hue.replace('#', '')
  return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${alpha})`
}

export default function RabiatAdaptiveHome() {
  const router = useRouter()
  const { activeProfile } = useProfiles()
  const { activeTheme, getSectionLabel, showConfirmation } = useAdaptiveUI()
  const { playSongAt, isPlaying, currentSongIdx } = usePlaybackState()
  const { scrollY, onScroll } = useStickyHomeScroll()
  const stickyHeaderHeight = useStickyHomeHeaderHeight()

  if (!rabiatSession.startedAt) rabiatSession.startedAt = Date.now()

  const [, forceRender] = useState(0)
  const rerender = () => forceRender(n => n + 1)
  const [refreshing, setRefreshing] = useState(false)

  // Quietly re-evaluate now and then so the drop decays and the page settles
  // into wind-down on its own when she stops touching it.
  useEffect(() => {
    const t = setInterval(rerender, 40_000)
    return () => clearInterval(t)
  }, [])

  // ── Implicit signal: recent touches decide the layout ─────────────────────
  // Wind-down only kicks in after a few minutes of pure listening with no
  // touches; a fresh visit always opens on the full page.
  const now = Date.now()
  const recentTaps = rabiatSession.interactions.filter(ts => now - ts < 120_000).length
  const sessionAge = now - rabiatSession.startedAt
  const inferredBack = isPlaying && recentTaps === 0 && sessionAge > 180_000
  const leanedBack = rabiatSession.overrode ? rabiatSession.overrideMode === 'back' : inferredBack

  // Every meaningful touch feeds the signal.
  const act = useCallback(<A extends unknown[]>(fn: (...a: A) => void) => (...a: A) => {
    rabiatSession.interactions.push(Date.now())
    fn(...a)
  }, [])

  const setMode = (i: number) => {
    rabiatSession.overrode = true
    rabiatSession.overrideMode = i === 1 ? 'back' : 'in'
    rerender()
  }

  // ── Temporal: the drop leads while live, then steps back for good ─────────
  if (rabiatSession.dropStage === 'live' && now - rabiatSession.startedAt > DROP.liveWindowMs) {
    rabiatSession.dropStage = 'compact'
  }
  const dropStage = rabiatSession.dropStage

  const engageDrop = act(() => {
    playSongAt(DROP.leadSongId)
    rabiatSession.dropStage = 'compact'
    router.push('/now-playing')
  })
  const dismissDrop = act(() => {
    rabiatSession.dropStage = 'compact'
    rerender()
  })

  // ── Arbitration: a live drop decides; otherwise rotation + her choice ─────
  const world = dropStage === 'live' ? DROP.artistId : rabiatSession.world
  const W = WORLDS[world]

  const switchWorld = act((target: WorldId) => {
    rabiatSession.world = target
    rerender()
  })

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    setTimeout(() => {
      rabiatSession.world = rabiatSession.world === 'bad-bunny' ? 'rosalia' : 'bad-bunny'
      setRefreshing(false)
    }, 700)
  }, [])

  // ── Content pools ──────────────────────────────────────────────────────────
  const worldSongs = useMemo(() => songs.filter(sg => sg.artistId === world), [world])
  const latinSongs = useMemo(
    () => songs.filter(sg => ['bad-bunny', 'rosalia', 'gloria-estefan'].includes(sg.artistId)),
    [],
  )
  const onRepeat = useMemo(() => {
    const freq = new Set(frequentPlaySongIds)
    return latinSongs.filter(sg => freq.has(sg.id)).concat(worldSongs.filter(sg => !freq.has(sg.id))).slice(0, 10)
  }, [latinSongs, worldSongs])
  const madeForYou = useMemo(() => {
    const pool = new Set([...songsForYouIds, ...popularInCitySongIds])
    const latin = latinSongs.filter(sg => pool.has(sg.id))
    const filler = latinSongs.filter(sg => !pool.has(sg.id))
    return [...latin, ...filler].slice(0, 12)
  }, [latinSongs])
  // Low-confidence discovery, framed as discovery, shown only when she's exploring.
  const somethingDifferent = useMemo(() => {
    const ids = ['s-fela1', 's-madonna2', 's-doja2', 's-rihanna2', 's-charli1', 's-fka1', 's-zara1', 's-janet4']
    return ids.map(id => songs.find(sg => sg.id === id)).filter((sg): sg is Song => sg != null)
  }, [])
  const latinPopular = useMemo(() => {
    const latin = new Set(['bad-bunny', 'rosalia', 'gloria-estefan'])
    return popularInCitySongIds
      .map(id => songs.find(sg => sg.id === id))
      .filter((sg): sg is Song => sg != null && latin.has(sg.artistId))
  }, [])
  const albumsForYou = useMemo(() => {
    const seen = new Map<string, Song>()
    for (const sg of latinSongs) if (!seen.has(sg.album)) seen.set(sg.album, sg)
    return Array.from(seen.values()).slice(0, 8)
  }, [latinSongs])
  const latinArtists = useMemo(
    () => LATIN_ARTIST_IDS.map(id => songs.find(sg => sg.artistId === id)).filter((sg): sg is Song => sg != null),
    [],
  )
  // Her mixes, not the generic set: her own playlist first, then Latin-leaning picks.
  const myMixes = useMemo(() => {
    const ids = ['pl1', 'pl7', 'pl-love-island', 'pl5', 'pl3', ...myMixPlaylistIds]
    const seen = new Set<string>()
    return ids
      .map(id => playlists.find(p => p.id === id))
      .filter((p): p is typeof playlists[0] => p != null && !seen.has(p.id) && !!seen.add(p.id))
      .slice(0, 6)
  }, [])
  const jumpBackIn = useMemo(() => {
    const themed = filterContinueListening(continueListeningItems, activeTheme, songs)
    // Top up with her world's tracks so the grid always fills its four slots.
    const fill = worldSongs.slice(0, 4).map(sg => ({
      id: `cl-w-${sg.id}`,
      title: sg.title,
      artKey: sg.albumArtPath ?? '',
      songId: sg.id,
      podcastId: undefined as string | undefined,
    }))
    const seen = new Set<string>()
    return [...themed, ...fill].filter(it => (seen.has(it.title) ? false : seen.add(it.title))).slice(0, 4)
  }, [activeTheme, worldSongs])

  const nowSong = songs[currentSongIdx] ?? songs[0]
  const hour = new Date().getHours()
  const slot = slotForHour(hour)

  const openSong = act((id: string) => {
    playSongAt(id)
    router.push('/now-playing')
  })

  // "Latin albums on rotation" cards are one representative song standing in
  // for its whole album — tapping one should open that album's page (with
  // its real tracklist), not immediately start playing the stand-in song.
  const openAlbum = act((song: Song) => {
    router.push(`/album/song-album-${song.id}` as any)
  })

  const handlePillChange = useCallback((idx: number) => {
    if (idx === 0) router.push('/music')
    else if (idx === 1) router.push('/podcast')
    else if (idx === 2) showConfirmation('Audiobooks open in the Audible app')
  }, [router, showConfirmation])

  // Scroll-reactive wash, tinted to the leading world.
  const washTranslate = scrollY.interpolate({ inputRange: [0, 360], outputRange: [0, -54], extrapolate: 'clamp' })
  const washOpacity = scrollY.interpolate({ inputRange: [0, 220, 440], outputRange: [1, 0.55, 0], extrapolate: 'clamp' })

  // ── Reusable cover rail (persona-home card design) ────────────────────────
  // `onItemPress` defaults to playing the song — the right behavior for every
  // rail here except "Latin albums on rotation" below, which stands in one
  // song per album and needs to open that album's page instead (see openAlbum).
  const coverRail = (title: string, list: Song[], sub?: string, onItemPress: (sg: Song) => void = sg => openSong(sg.id)) => (
    <View style={s.block}>
      <SectionHeader title={title} sub={sub} />
      <EdgeFadeRow>
        <HRail
          data={list}
          keyExtractor={(sg: Song) => sg.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.rail}
          nestedScrollEnabled
          renderItem={({ item: sg }: { item: Song }) => {
            const art = sg.albumArtPath ? albumArtAssets[sg.albumArtPath] : null
            return (
              <TouchableOpacity style={s.coverCard} activeOpacity={0.85} onPress={() => onItemPress(sg)}>
                <View style={s.coverArtWrap}>
                  {art ? (
                    <Image source={art} style={s.coverArt} resizeMode="cover" />
                  ) : (
                    <View style={[s.coverArt, { backgroundColor: sg.albumArtColor }]}>
                      <Ionicons name="musical-note" size={26} color="rgba(255,255,255,0.15)" />
                    </View>
                  )}
                </View>
                <Text style={s.coverTitle} numberOfLines={1}>{sg.title}</Text>
                <Text style={s.coverSub} numberOfLines={1}>{sg.artistName}</Text>
              </TouchableOpacity>
            )
          }}
        />
      </EdgeFadeRow>
    </View>
  )

  return (
    <View style={s.screen}>
      <Animated.View
        style={[s.bgWash, { opacity: washOpacity, transform: [{ translateY: washTranslate }] }]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={[tint(W.hue, 0.4), tint(W.hue, 0.22), tint(W.hue, 0.1), tint(W.hue, 0.03), 'transparent']}
          locations={[0, 0.25, 0.48, 0.75, 1]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28 }}
        style={{ backgroundColor: 'transparent' }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.cyan}
            colors={[C.cyan]}
            progressViewOffset={stickyHeaderHeight}
          />
        }
      >
        <View style={{ height: stickyHeaderHeight + 22 }} />

        {/* 1 — Greeting */}
        <View style={s.greetWrap}>
          <View style={s.greetRow}>
            <Text style={s.greetHello}>Good {slot},</Text>
            <Ionicons name="sparkles" size={14} color={C.gold} style={{ marginLeft: 6 }} />
          </View>
          <Text style={s.greetName}>{activeProfile.name}</Text>
          <Text style={s.greetSub}>Your Latin {slot} rotation</Text>
        </View>

        {/* 2 — Mode pill: reflects what the page sensed, and takes her override */}
        <ModeToggle value={leanedBack ? 1 : 0} onChange={setMode} accent={activeProfile.color} />

        {/* 3 — The drop: leads while the moment is live, then a quiet row */}
        {dropStage === 'live' ? (
          <View style={s.dropWrap}>
            <View style={s.dropCard}>
              <Image source={albumArtAssets[DROP.artKey]} style={s.dropImage} resizeMode="cover" />
              <LinearGradient
                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.92)']}
                locations={[0.35, 0.65, 1]}
                style={s.dropGradient}
                pointerEvents="none"
              />
              <TouchableOpacity style={s.dropDismiss} onPress={dismissDrop} hitSlop={10}>
                <Ionicons name="close" size={15} color="rgba(255,255,255,0.85)" />
              </TouchableOpacity>
              <View style={s.dropTextWrap}>
                <Text style={s.dropEyebrow}>NEW ALBUM · OUT NOW</Text>
                <Text style={s.dropTitle}>{DROP.albumTitle}</Text>
                <Text style={s.dropSub}>{DROP.artistName} · Dropped today</Text>
                <View style={s.dropMetaRow}>
                  <EqualizerBars playing size={12} color={C.cyan} />
                  <Text style={s.dropMeta}>{DROP.listeners} fans listening now</Text>
                </View>
              </View>
              <TouchableOpacity style={s.dropPlayBtn} onPress={engageDrop} activeOpacity={0.85}>
                <Ionicons name="play" size={20} color="#fff" style={{ marginLeft: 2 }} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={s.blockTight}>
            <TouchableOpacity style={s.rowCard} activeOpacity={0.85} onPress={engageDrop}>
              <Image source={albumArtAssets[DROP.artKey]} style={s.rowArt} resizeMode="cover" />
              <View style={{ flex: 1 }}>
                <Text style={s.rowEyebrow}>NEW ALBUM</Text>
                <Text style={s.rowTitle} numberOfLines={1}>{DROP.albumTitle}</Text>
                <Text style={s.rowSub} numberOfLines={1}>{DROP.artistName} · Continue your first listen</Text>
              </View>
              <PlayBadge size={30} />
            </TouchableOpacity>
          </View>
        )}

        {/* 4 — Wind-down: one decision. Otherwise: fast return grid. */}
        {leanedBack ? (
          <View style={s.block}>
            <SectionHeader title="Keep it going" sub="Settle in, this mixes itself" />
            <TouchableOpacity
              style={s.flowCard}
              activeOpacity={0.9}
              onPress={act(() => router.push('/now-playing'))}
            >
              {nowSong.albumArtPath && albumArtAssets[nowSong.albumArtPath] ? (
                <Image source={albumArtAssets[nowSong.albumArtPath]} style={StyleSheet.absoluteFill} resizeMode="cover" />
              ) : (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: nowSong.albumArtColor }]} />
              )}
              <LinearGradient colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.82)']} style={StyleSheet.absoluteFill} />
              <View style={s.featureText}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <EqualizerBars playing={isPlaying} size={13} color={C.cyan} />
                  <Text style={s.featureEyebrow}>NOW PLAYING</Text>
                </View>
                <Text style={s.featureTitle} numberOfLines={1}>{nowSong.title}</Text>
                <Text style={s.flowSub} numberOfLines={1}>{nowSong.artistName} · then more {W.name}</Text>
              </View>
              <View style={s.featurePlay}><PlayBadge size={40} /></View>
            </TouchableOpacity>
          </View>
        ) : (
          jumpBackIn.length > 0 && (
            <View style={s.block}>
              <SectionHeader title="Jump back in" />
              <View style={s.quickGrid}>
                {jumpBackIn.map(item => {
                  const art = item.artKey ? (albumArtAssets[item.artKey] ?? artistAssets[item.artKey]) : null
                  const kind = continueListeningKind(item.id)
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={s.quickCard}
                      activeOpacity={0.85}
                      onPress={act(() =>
                        item.podcastId
                          ? router.push(`/podcast-show/${item.podcastId}` as any)
                          : item.songId && openSong(item.songId),
                      )}
                    >
                      {art ? (
                        <Image source={art} style={s.quickArt} resizeMode="cover" />
                      ) : (
                        <View style={[s.quickArt, { backgroundColor: C.surface }]} />
                      )}
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
          )
        )}

        {/* 5 — Your world (kept), with the world pills for her two fandoms */}
        <View style={[s.block, s.fandomShadow]}>
          <View style={[s.fandomInner, { borderColor: tint(W.hue, 0.5) }]}>
            <LinearGradient
              colors={[tint(W.hue, 0.42), tint(W.hue, 0.18), C.elevated]}
              locations={[0, 0.5, 1]}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
            <View style={s.fandomHead}>
              <Ionicons name="heart" size={14} color={C.gold} />
              <Text style={s.fandomTitle}>Your {W.name} world</Text>
            </View>

            <View style={s.worldPillRow}>
              {(['bad-bunny', 'rosalia'] as WorldId[]).map(wid => {
                const activeW = wid === world
                return (
                  <TouchableOpacity
                    key={wid}
                    style={[s.worldPill, activeW && s.worldPillActive]}
                    activeOpacity={0.8}
                    onPress={() => switchWorld(wid)}
                  >
                    <Text style={[s.worldPillText, activeW && s.worldPillTextActive]}>{WORLDS[wid].name}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>

            <View style={s.fanTier}>
              <Ionicons name="star" size={11} color={C.gold} />
              <Text style={[s.fanTierText, { color: C.gold }]}>{W.tierLine}</Text>
            </View>
            <Text style={s.sinceLine}>{W.sinceLine}</Text>

            <TouchableOpacity
              style={s.featureCard}
              activeOpacity={0.88}
              onPress={act(() => router.push(`/artist/${world}` as any))}
            >
              {(() => {
                const art = albumArtAssets[W.bannerKey] ?? artistAssets[world]
                return art ? (
                  <Image source={art} style={StyleSheet.absoluteFill} resizeMode="cover" />
                ) : (
                  <View style={[StyleSheet.absoluteFill, { backgroundColor: tint(W.hue, 0.9) }]} />
                )
              })()}
              <LinearGradient colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.78)']} style={StyleSheet.absoluteFill} />
              <View style={s.featureText}>
                <Text style={s.featureEyebrow}>{W.featureEyebrow}</Text>
                <Text style={s.featureTitle} numberOfLines={2}>{W.featureTitle}</Text>
              </View>
              <View style={s.featurePlay}><PlayBadge size={40} /></View>
            </TouchableOpacity>

            <View style={s.pulseRow}>
              <EqualizerBars playing size={12} color={C.gold} />
              <Text style={s.pulseText}>{W.pulseLine}</Text>
            </View>

            <EdgeFadeRow fadeColor={C.elevated}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.miniRail} nestedScrollEnabled>
                {worldSongs.slice(0, 10).map(sg => {
                  const art = sg.albumArtPath ? albumArtAssets[sg.albumArtPath] : null
                  return (
                    <TouchableOpacity key={sg.id} style={s.miniCard} activeOpacity={0.85} onPress={() => openSong(sg.id)}>
                      {art ? (
                        <Image source={art} style={s.miniArt} resizeMode="cover" />
                      ) : (
                        <View style={[s.miniArt, { backgroundColor: sg.albumArtColor }]} />
                      )}
                      <Text style={s.miniTitle} numberOfLines={1}>{sg.title}</Text>
                    </TouchableOpacity>
                  )
                })}
              </ScrollView>
            </EdgeFadeRow>
          </View>
        </View>

        {/* 6 — Sure bets lead */}
        {coverRail(getSectionLabel('frequentPlays', 'Your Latin heavy rotation'), onRepeat)}

        {/* 7 — Picks for the moment */}
        {coverRail(getSectionLabel('songsForYou', 'Latin tracks for you'), madeForYou)}

        {/* 8 — Discovery appears only when she's actively exploring */}
        {!leanedBack && coverRail('Something different', somethingDifferent, 'A few steps outside your usual')}

        {/* 9 — Albums */}
        {coverRail(getSectionLabel('albumsForYou', 'Latin albums on rotation'), albumsForYou, undefined, openAlbum)}

        {/* 10 — Mood playlists (gradient cards, genre destinations) */}
        {(
          <View style={s.block}>
            <SectionHeader title="Playlists for every mood" sub="Ready-made mixes for whatever you're doing" />
            <EdgeFadeRow>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
                {MOOD_PLAYLISTS.map(pl => (
                  <TouchableOpacity
                    key={pl.name}
                    style={s.coverCard}
                    activeOpacity={0.85}
                    onPress={act(() => router.push(`/genre/${encodeURIComponent(pl.genre)}` as any))}
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
        )}

        {/* 11 — Popular near her, softened during wind-down */}
        {latinPopular.length > 0 &&
          coverRail(
            getSectionLabel('popularInCity', 'Latin heat near you'),
            leanedBack ? latinPopular.filter(sg => sg.mood !== 'hype') : latinPopular,
          )}

        {/* 12 — Artists */}
        {(
          <View style={s.block}>
            <SectionHeader title="More Latin for you" />
            <EdgeFadeRow>
              <HRail
                data={latinArtists}
                keyExtractor={sg => sg.artistId}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.rail}
                nestedScrollEnabled
                renderItem={({ item: sg }) => {
                  const art = resolveArtistAvatar(sg.artistId, sg.albumArtPath)
                  return (
                    <TouchableOpacity
                      style={s.artistCard}
                      activeOpacity={0.85}
                      onPress={act(() => router.push(`/artist/${sg.artistId}` as any))}
                    >
                      {art ? (
                        <Image source={art} style={s.artistAvatar} resizeMode="cover" />
                      ) : (
                        <View style={[s.artistAvatar, { backgroundColor: C.surface }]}>
                          <Ionicons name="person" size={34} color="rgba(255,255,255,0.2)" />
                        </View>
                      )}
                      <Text style={s.artistName} numberOfLines={1}>{sg.artistName}</Text>
                    </TouchableOpacity>
                  )
                }}
              />
            </EdgeFadeRow>
          </View>
        )}

        {/* 13 — My Mixes */}
        <View style={s.block}>
          <SectionHeader title={getSectionLabel('myMixes', 'My Mixes')} />
          <EdgeFadeRow>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
              {myMixes.map(mix => (
                <PlaylistMoodCard
                  key={mix.id}
                  name={mix.name}
                  artKey={mix.coverArtPath ?? ''}
                  onPress={act(() => router.push(`/playlist/${mix.id}` as any))}
                />
              ))}
            </ScrollView>
          </EdgeFadeRow>
        </View>
      </Animated.ScrollView>

      <StickyHomeHeader
        firstName={activeProfile.name}
        activePill={null}
        onPillChange={handlePillChange}
        scrollY={scrollY}
      />
    </View>
  )
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  bgWash: { position: 'absolute', top: 0, left: 0, right: 0, height: 560 },

  greetWrap: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 26 },
  greetRow: { flexDirection: 'row', alignItems: 'center' },
  greetHello: { fontSize: 15, color: C.textSecondary, fontWeight: '600' },
  greetName: { ...typeHeadline(30), color: '#fff', marginTop: 2 },
  greetSub: { fontSize: 14, color: C.textSecondary, marginTop: 4 },

  // Segmented mode pill (same as the persona home's focus toggle)
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

  // Drop card (same shape as the show cards: 16-radius image card, circle play)
  dropWrap: { paddingHorizontal: 16, marginBottom: 30 },
  dropCard: { borderRadius: 16, overflow: 'hidden', height: 200 },
  dropImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  dropGradient: { ...StyleSheet.absoluteFillObject },
  dropDismiss: {
    position: 'absolute', top: 10, right: 10, zIndex: 2,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center',
  },
  dropTextWrap: { position: 'absolute', bottom: 0, left: 0, right: 56, padding: 18 },
  dropEyebrow: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.72)', letterSpacing: 1.8, marginBottom: 6 },
  dropTitle: { fontSize: 24, fontWeight: '800', color: '#fff', letterSpacing: -0.5, marginBottom: 4 },
  dropSub: { fontSize: 13, color: 'rgba(255,255,255,0.88)', marginBottom: 6 },
  dropMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  dropMeta: { fontSize: 12, color: 'rgba(255,255,255,0.60)' },
  dropPlayBtn: {
    position: 'absolute', right: 16, bottom: 18,
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: 'rgba(0,0,0,0.42)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.72)',
    alignItems: 'center', justifyContent: 'center',
  },

  blockTight: { paddingHorizontal: 16, marginBottom: 26 },
  block: { marginBottom: 34 },
  sectionHead: { paddingHorizontal: 16, marginBottom: 14 },
  sectionTitle: { ...typeHeadline(20), color: '#fff' },
  sectionSub: { fontSize: 13, color: C.textSecondary, marginTop: 2 },
  rail: { paddingHorizontal: 16, gap: 16 },

  rowCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.elevated, borderRadius: 10, padding: 8,
  },
  rowArt: { width: 52, height: 52, borderRadius: 6 },
  rowEyebrow: { fontSize: 10, fontWeight: '700', color: C.cyan, letterSpacing: 0.6 },
  rowTitle: { fontSize: 14, fontWeight: '600', color: '#fff', marginTop: 1 },
  rowSub: { fontSize: 12, color: C.textSecondary, marginTop: 1 },

  // Wind-down flow card (feature-card shape)
  flowCard: { marginHorizontal: 16, height: 168, borderRadius: 12, overflow: 'hidden', justifyContent: 'flex-end' },
  flowSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 3 },

  // Jump back in (persona-home quick grid)
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
  quickArt: { width: 64, height: 64 },
  quickText: { flex: 1, marginLeft: 10, marginRight: 6 },
  quickTitle: { fontSize: 13, fontWeight: '600', color: '#fff' },
  quickKindRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  quickKind: { fontSize: 10, color: C.textMuted, fontWeight: '600', letterSpacing: 0.3 },

  // Your World panel
  fandomShadow: {
    marginHorizontal: 12, borderRadius: 20, backgroundColor: C.elevated,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  fandomInner: { borderRadius: 20, borderWidth: 1.5, overflow: 'hidden', padding: 16 },
  fandomHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  fandomTitle: { ...typeHeadline(19), color: '#fff' },
  // World pills (same pill design as the Find/Library filter pills)
  worldPillRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  worldPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: R.full,
    backgroundColor: C.surface,
  },
  worldPillActive: { backgroundColor: '#2a3a3e' },
  worldPillText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.65)' },
  worldPillTextActive: { color: '#ffffff', fontWeight: '700' },
  fanTier: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  fanTierText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.2 },
  sinceLine: { fontSize: 11.5, color: C.textSecondary, marginBottom: 12 },
  featureCard: { height: 168, borderRadius: 12, overflow: 'hidden', justifyContent: 'flex-end' },
  featureText: { padding: 14 },
  featureEyebrow: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.85)', letterSpacing: 1 },
  featureTitle: { ...typeHeadline(24), color: '#fff', marginTop: 4 },
  featurePlay: { position: 'absolute', right: 12, bottom: 12 },
  pulseRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  pulseText: { fontSize: 12, fontWeight: '600', color: C.textSecondary },
  miniRail: { gap: 12, paddingTop: 12 },
  miniCard: { width: 96 },
  miniArt: { width: 96, height: 96, borderRadius: 8 },
  miniTitle: { fontSize: 11.5, color: '#fff', marginTop: 5 },

  // Cover rails (persona-home card design)
  coverCard: { width: 150 },
  coverArtWrap: { width: 150, height: 150, borderRadius: 8, overflow: 'hidden', position: 'relative' },
  coverArt: { width: 150, height: 150, alignItems: 'center', justifyContent: 'center' },
  coverPlayPos: { position: 'absolute', right: 8, bottom: 8 },
  coverTitle: { fontSize: 14, fontWeight: '600', color: '#fff', marginTop: 8 },
  coverSub: { fontSize: 12, color: C.textSecondary, marginTop: 2 },
  relatedArt: { width: 150, height: 150, borderRadius: 12, overflow: 'hidden', padding: 12, justifyContent: 'flex-end' },
  relatedName: { ...typeHeadline(20), color: '#fff' },
  relatedLogo: { position: 'absolute', top: 10, right: 10, width: 26, height: 26, borderRadius: 6 },

  // Artists
  artistCard: { width: 120, alignItems: 'center' },
  artistAvatar: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  artistName: { fontSize: 13, fontWeight: '600', color: '#fff', marginTop: 8, textAlign: 'center' },

  playBadge: { backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' },
})
