import { useMemo, useState, useEffect, useRef } from 'react'
import {
  ScrollView,
  View,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Dimensions,
  Platform,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { Text } from '../components/AppText'
import { AppImage as Image } from '../components/AppImage'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { safeGoBack } from '../utils/navigation'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { artists, songs, type Song } from '../data/mockData'
import { albumArtAssets, resolveArtistAvatar } from '../data/assetMap'
import { buildArtistPage, type ArtistLyric } from '../data/artistPages'
import { getArtistAbout } from '../data/artistAbout'
import { usePlaybackState } from '../hooks/usePlaybackState'
import { useAdaptiveUI } from '../context/AdaptiveUIContext'
import { useAdaptiveMenu } from '../components/AdaptiveContextMenu'
import { useProfiles } from '../context/ProfilesContext'
import { useLikedSongs } from '../context/LikedSongsContext'
import { filterJourneyTab, useYouAndArtistUnlock } from '../hooks/useYouAndArtistUnlock'
import UnlockDot from '../components/artist/UnlockDot'
import UnlockTraceBorder from '../components/artist/UnlockTraceBorder'
import ArtistAboutTab from '../components/artist/ArtistAboutTab'
import LyricCardStack from '../components/artist/LyricCardStack'
import { ArtistEventsCard, type MerchItem } from '../components/artist/ArtistCommerce'
import { artistShowTitle, artistShowEpisodeCount } from '../data/podcastEpisodes'
import { C, typeHeadline } from '../theme'

const MUSIC_STREAMS = [89_234_567, 45_678_901, 23_456_789, 12_345_678, 9_876_543, 4_567_890]
function fmtStreams(n: number) { return n.toLocaleString('en-US') }

// Top Songs pagination — same "Songs for You" 3-per-page snap pattern used on
// Olivia's New-listener Music tab, ported here so every generic artist page
// matches it.
const SCREEN_W = Platform.OS === 'web' ? Math.min(Dimensions.get('window').width, 402) : Dimensions.get('window').width
const POP_SONGS_PER_PAGE = 3
const POP_PAGE_PEEK = Math.round(SCREEN_W * 0.3)
const POP_PAGE_WIDTH = SCREEN_W - POP_PAGE_PEEK

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

const ERA_CARD_W = 120
const ERA_CARD_H = 122

const LYRIC_FRONT_GRADIENT = ['rgba(37,209,218,0.12)', 'rgba(37,209,218,0.55)'] as const

function ExplicitBadge() {
  return (
    <View style={s.explicitBadge}>
      <Text style={s.explicitText}>E</Text>
    </View>
  )
}

// Heart + menu — same RowIcons pattern used on Olivia's/Taylor's/BTS's Top
// Songs rows, so liking a track works consistently across every artist page.
function RowIcons({ song, light }: { song: Song; light?: boolean }) {
  const { likedSongIds, toggleLike } = useLikedSongs()
  const liked = likedSongIds.has(song.id)
  const { open } = useAdaptiveMenu()
  return (
    <View style={s.rowIcons}>
      <TouchableOpacity onPress={() => toggleLike(song.id)} hitSlop={8}>
        <Ionicons name={liked ? 'heart' : 'heart-outline'} size={20} color={liked ? (light ? '#fff' : C.cyan) : '#fff'} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => open({ kind: 'song', song })} hitSlop={8}>
        <Ionicons name="ellipsis-horizontal" size={18} color="#888" />
      </TouchableOpacity>
    </View>
  )
}

function LyricStackCard({
  item,
  variant,
  containerStyle,
  resolveArt,
}: {
  item: ArtistLyric
  variant: 'front' | 'back'
  containerStyle: any
  resolveArt: (key: string) => any
}) {
  const front = variant === 'front'
  return (
    <View style={containerStyle}>
      <LinearGradient
        colors={front ? LYRIC_FRONT_GRADIENT : item.gradient}
        style={StyleSheet.absoluteFill}
      />
      <View style={s.lyricStackHeader}>
        <Image source={resolveArt(item.artKey)} style={s.lyricStackArt} />
        <Text style={s.lyricStackSong} numberOfLines={1}>{item.song}</Text>
      </View>
      <Text style={front ? s.lyricStackTextFront : s.lyricStackText}>{item.lyric}</Text>
      <View style={s.lyricStackFans}>
        <Ionicons name="heart" size={front ? 14 : 12} color={C.cyan} />
        <Text style={s.lyricStackFansText}>by 12k fans</Text>
      </View>
    </View>
  )
}

export default function ArtistJourneyScreen({ id }: { id: string }) {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { playSongAt } = usePlaybackState()
  const { showConfirmation } = useAdaptiveUI()
  const { open: openAdaptiveMenu } = useAdaptiveMenu()
  const { activeProfile } = useProfiles()
  const { likedSongIds } = useLikedSongs()
  const tabScrollRef = useRef<ScrollView>(null)
  // Reset the page scroll position on every tab switch — otherwise arriving
  // on a shorter tab from a taller one leaves the ScrollView at its old
  // offset, reading as a dead black gap at the bottom instead of clamping.
  const pageScrollRef = useRef<ScrollView>(null)

  const artist = useMemo(() => artists.find(a => a.id === id) ?? artists[0], [id])
  const page = useMemo(() => buildArtistPage(artist.id), [artist.id])
  const artistSongs = useMemo(() => songs.filter(sg => sg.artistId === artist.id), [artist.id])
  const about = useMemo(() => getArtistAbout(artist.id), [artist.id])
  const merchItems = useMemo<MerchItem[]>(
    () => page.merch.map(mi => ({ title: mi.name, subtitle: mi.type, price: mi.price, artKey: mi.artKey })),
    [page.merch],
  )

  // Artists of the same genre — shown in "Fans also like" on the Music tab.
  const relatedArtists = useMemo(
    () => artists.filter(a => a.id !== artist.id && a.genre === artist.genre).slice(0, 8),
    [artist],
  )

  // New-listener Music tab (ported from Olivia's isCasual layout, applied
  // generically) — New Album banner, paginated Top Songs, Top Albums, a
  // catalog-deeper "More from" rail, Fan Favorites, Related Artists,
  // Playlists featuring the artist, Podcasts about them, Related Radio
  // Stations. All derived from data this screen already computes.
  const newAlbumSong = useMemo(
    () => artistSongs.find(sg => sg.album === page.eras[0]?.title) ?? artistSongs[0],
    [artistSongs, page.eras],
  )
  // Not every artist's latest release is a full album — when the release
  // only groups one track, call it what it is instead of "NEW ALBUM".
  const newAlbumEyebrow = useMemo(() => {
    if (!newAlbumSong) return 'NEW ALBUM'
    const trackCount = artistSongs.filter(sg => sg.album === newAlbumSong.album).length
    return trackCount > 1 ? 'NEW ALBUM' : 'NEW SINGLE'
  }, [artistSongs, newAlbumSong])
  // Artists with no songs at all still often have an upcoming show — same
  // banner design, sourced from Events instead of a track.
  const tourEvent = about?.events?.[0]
  const popularPages = useMemo(() => chunk(artistSongs.slice(0, 6), POP_SONGS_PER_PAGE), [artistSongs])
  const popularSnapOffsets = useMemo(() => popularPages.map((_, i) => i * POP_PAGE_WIDTH), [popularPages])
  const moreFromArtist = useMemo(() => artistSongs.slice(6, 14), [artistSongs])
  const fanFavSongs = useMemo(() => [...artistSongs].reverse().slice(0, 6), [artistSongs])
  const stations = useMemo(
    () => page.eras.slice(0, 4).map(era => ({ name: `${era.title} Radio`, artKey: era.eraImageKey, trackTitle: era.topTrack.title })),
    [page.eras],
  )
  const podcastShows = useMemo(() => {
    const showArtists = [artist, ...relatedArtists.slice(0, 3)]
    return showArtists.map(a => ({
      id: `podshow-${a.id}`,
      title: artistShowTitle(a.id, a.name),
      episodeCount: artistShowEpisodeCount(a.id),
      art: resolveArtistAvatar(a.id, a.imageUri),
    }))
  }, [artist, relatedArtists])

  // No separate Merch tab — the About tab's Merch section already covers it.
  // You & Artist sits right beside Music for every persona.
  const TABS = useMemo(
    () => ['Music', `You & ${page.firstName}`, 'Events', 'About'] as const,
    [page.firstName],
  )
  const journeyTab = `You & ${page.firstName}`
  // Every persona (not just the dedicated casual persona, KSM) is a genuine
  // new listener on a generic artist page until they've actually followed,
  // played, and liked that specific artist — no persona has a "home theme"
  // here the way Olivia/Taylor/BTS work, so this gates on the real
  // per-artist ratchet in ArtistEngagementContext. The one exception: a
  // "Create your own" profile is a declared superfan of the artists picked
  // at creation, so those pages open pre-unlocked (createCustomProfile also
  // pre-earns the ratchet flags — this flag makes the intent explicit and
  // keeps the page unlocked even after a ratchet reset).
  const gateYouAndArtist = !activeProfile.superfanArtistIds?.includes(artist.id)
  const artistSongIds = useMemo(() => artistSongs.map(sg => sg.id), [artistSongs])
  const {
    isUnlocked,
    showUnlockDot,
    markFollowed,
    markPlayed,
    dismissUnlockDot,
    hasEverFollowed,
  } = useYouAndArtistUnlock(artist.id, {
    gateTab: gateYouAndArtist,
    showDot: gateYouAndArtist,
    artistSongIds,
    likedSongIds,
  })
  const visibleTabs = useMemo(
    () => filterJourneyTab(TABS, journeyTab, isUnlocked),
    [TABS, journeyTab, isUnlocked],
  )

  const [tab, setTab] = useState<string>('Music')
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [following, setFollowing] = useState(!gateYouAndArtist)

  useEffect(() => {
    setFollowing(!gateYouAndArtist || hasEverFollowed())
  }, [activeProfile.id, gateYouAndArtist, hasEverFollowed])

  useEffect(() => {
    if (!isUnlocked && tab === journeyTab) setTab('Music')
  }, [isUnlocked, tab, journeyTab])

  // Guarded by a ref rather than a "was locked, now unlocked" transition
  // check, so the trace still fires the first time she SEES the unlocked
  // tab even if the unlock happened off-screen — not just on a live
  // transition while this screen is mounted.
  const [showUnlockTrace, setShowUnlockTrace] = useState(false)
  const hasFiredUnlockTraceRef = useRef(false)
  useEffect(() => {
    if (isUnlocked && showUnlockDot && !hasFiredUnlockTraceRef.current) {
      hasFiredUnlockTraceRef.current = true
      // You & Artist sits right after Music now, so scroll to the start to reveal it.
      requestAnimationFrame(() => tabScrollRef.current?.scrollTo({ x: 0, animated: true }))
      setShowUnlockTrace(true)
    }
  }, [isUnlocked, showUnlockDot])

  const toggleFollow = () => {
    // Side effects out of the setState updater: React 19 runs updaters during
    // render, so the engagement mark fired here is dropped on web.
    if (!following) markFollowed()
    setFollowing(v => !v)
  }

  const avatar = resolveArtistAvatar(artist.id, artist.imageUri)
  const resolveArt = (key: string) => albumArtAssets[key] ?? avatar
  const heroSource = avatar ?? (page.eras[0] ? resolveArt(page.eras[0].eraImageKey) : null)

  const selectedEra = page.eras[selectedIdx] ?? page.eras[0]
  const hasJourney = page.eras.length > 0

  // Timeline progress — fills to the selected era's position and slides as the
  // listener taps forward/backward through their journey.
  const timelineFillPct = page.eras.length > 1
    ? ((selectedIdx + 1) / page.eras.length) * 100
    : 100
  const fillProgress = useSharedValue(timelineFillPct)
  useEffect(() => {
    fillProgress.value = withTiming(timelineFillPct, {
      duration: 340,
      easing: Easing.out(Easing.cubic),
    })
  }, [timelineFillPct, fillProgress])
  const timelineFillStyle = useAnimatedStyle(() => ({
    width: `${fillProgress.value}%`,
  }))

  const playByTitle = (title?: string) => {
    const match = title
      ? artistSongs.find(sg => sg.title.toLowerCase() === title.toLowerCase())
      : artistSongs[0]
    if (match) {
      playSongAt(match.id)
      markPlayed()
      router.push('/now-playing')
    }
  }

  // Playlist cards aren't real playlists (no playlistId to route to) — play
  // the track from the era they were built from, same "tap to play" behavior
  // songs and albums already have instead of a no-op tap.
  const playByArtKey = (artKey: string) => {
    const era = page.eras.find(e => e.eraImageKey === artKey)
    playByTitle(era?.topTrack.title)
  }

  // Shuffle starts a random track without leaving the page — the mini player
  // and a toast confirm it, like the real app.
  const shufflePlay = () => {
    if (artistSongs.length === 0) return
    const pick = artistSongs[Math.floor(Math.random() * artistSongs.length)]
    playSongAt(pick.id)
    markPlayed()
    showConfirmation(`Shuffling ${artist.name}`)
  }

  // Same bottom-sheet menu as long-press everywhere else (replaces the old OS alert).
  const showArtistMenu = () => {
    openAdaptiveMenu({ kind: 'artist', artistId: artist.id, name: artist.name, imageUri: artist.imageUri })
  }

  return (
    <View style={s.screen}>
      <ScrollView
        ref={pageScrollRef}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        {/* Hero */}
        <View style={s.heroWrap}>
          {heroSource ? (
            <ImageBackground
              source={heroSource}
              style={s.heroBg}
              resizeMode="cover"
              alt=""
              // Web: RNW doesn't apply the inner img's absolute-fill inset, so force
              // it inline or the natural-size image spills under the page content.
              imageStyle={Platform.OS === 'web' ? ({ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' } as any) : undefined}
            >
              <HeroOverlay
                insets={insets}
                page={page}
                avatar={avatar}
                activeProfile={activeProfile}
                following={following}
                showSinceBubble={isUnlocked}
                onBack={() => safeGoBack(router)}
                onToggleFollow={toggleFollow}
                onPlay={() => playByTitle()}
                onShuffle={shufflePlay}
                onMenu={showArtistMenu}
              />
            </ImageBackground>
          ) : (
            <View style={[s.heroBg, { backgroundColor: C.surface }]}>
              <HeroOverlay
                insets={insets}
                page={page}
                avatar={avatar}
                activeProfile={activeProfile}
                following={following}
                showSinceBubble={isUnlocked}
                onBack={() => safeGoBack(router)}
                onToggleFollow={toggleFollow}
                onPlay={() => playByTitle()}
                onShuffle={shufflePlay}
                onMenu={showArtistMenu}
              />
            </View>
          )}
        </View>

        {/* Tabs */}
        <View style={s.tabBar}>
          <ScrollView
            ref={tabScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.tabRow}
          >
            {visibleTabs.map(t => (
              <TouchableOpacity
                key={t}
                onPress={() => {
                  setTab(t)
                  pageScrollRef.current?.scrollTo({ y: 0, animated: false })
                  if (t === journeyTab) dismissUnlockDot()
                }}
                style={s.tabItem}
              >
                {t === journeyTab && showUnlockTrace && (
                  <UnlockTraceBorder onComplete={() => setShowUnlockTrace(false)} />
                )}
                <View style={s.tabLabelRow}>
                  {t === journeyTab && showUnlockDot && <UnlockDot />}
                  <Text style={[s.tabText, tab === t && s.tabTextActive]}>{t}</Text>
                </View>
                {tab === t && <View style={s.tabUnderline} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {tab === journeyTab ? (
          <View style={s.content}>
            {/* Exclusive */}
            {page.exclusive && (
              <View style={s.block}>
                <Text style={s.sectionTitle}>Exclusive For You</Text>
                <View style={s.exclusiveCard}>
                  <ImageBackground
                    source={resolveArt(page.exclusive.artKey)}
                    style={s.exclusiveImg}
                    imageStyle={s.exclusiveImgRadius}
                    resizeMode="cover"
                    alt=""
                  >
                    <LinearGradient
                      colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.95)']}
                      locations={[0.5, 1]}
                      style={StyleSheet.absoluteFill}
                    />
                    <View style={s.exclusiveImgCaption}>
                      <Text style={s.exclusiveImgTitle} numberOfLines={2}>
                        {page.exclusive.title}
                      </Text>
                      <Text style={s.exclusiveImgDate}>{page.exclusive.date}</Text>
                    </View>
                  </ImageBackground>
                  <View style={s.exclusiveText}>
                    <Text style={s.exclusiveTag}>{page.exclusive.tag}</Text>
                    <Text style={s.exclusiveMilestone}>{page.exclusive.milestone}</Text>
                    <Text style={s.exclusiveBody}>{page.exclusive.body}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Journey eras — only when there's a real timeline (2+ eras) */}
            {page.eras.length > 1 && (
              <>
                <View style={s.block}>
                  <View style={s.sectionHeaderRow}>
                    <Text style={s.sectionTitle}>Your Journey with {page.firstName}</Text>
                    <Text style={s.sectionLink}>Back to Now</Text>
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={s.eraRail}
                  >
                    {page.eras.map((era, i) => {
                      const selected = i === selectedIdx
                      return (
                        <TouchableOpacity
                          key={era.id}
                          activeOpacity={0.9}
                          onPress={() => setSelectedIdx(i)}
                          style={[s.eraCard, selected && s.eraCardSelected]}
                        >
                          <ImageBackground
                            source={resolveArt(era.eraImageKey)}
                            style={StyleSheet.absoluteFill}
                            imageStyle={{ borderRadius: 8 }}
                            resizeMode="cover"
                            alt=""
                          >
                            <LinearGradient
                              colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.75)']}
                              style={StyleSheet.absoluteFill}
                            />
                          </ImageBackground>
                          <View style={s.eraCardFooter}>
                            <Text style={s.eraSeason}>{era.season}</Text>
                            <Text style={s.eraTitle} numberOfLines={1}>{era.title}</Text>
                            <Text style={s.eraBadge}>{era.badge}</Text>
                          </View>
                        </TouchableOpacity>
                      )
                    })}
                  </ScrollView>

                  <View style={s.timelineTrack}>
                    <Animated.View style={[s.timelineFill, timelineFillStyle]}>
                      <View style={s.timelineThumb} />
                    </Animated.View>
                  </View>
                </View>

                {selectedEra && (
                  <View style={s.eraDetail}>
                    <Text style={s.eraDetailSeason}>{selectedEra.season.toUpperCase()}</Text>
                    <Text style={s.eraDetailTitle}>{selectedEra.title}</Text>
                    <Text style={s.eraDetailDesc}>{selectedEra.description}</Text>
                  </View>
                )}
              </>
            )}

            {/* Time together */}
            {hasJourney && selectedEra && (
              <View style={s.block}>
                <Text style={s.sectionTitle}>Time You Spent Together</Text>
                <ImageBackground
                  source={resolveArt(selectedEra.eraImageKey)}
                  style={s.statsCard}
                  imageStyle={{ borderRadius: 12 }}
                  resizeMode="cover"
                  alt=""
                >
                  <View style={s.statsOverlay} />
                  <View style={s.statsTop}>
                    <Image source={resolveArt(selectedEra.topTrack.artKey)} style={s.statsArt} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.statsEyebrow}>You played this on repeat</Text>
                      <Text style={s.statsTrack} numberOfLines={1}>{selectedEra.topTrack.title}</Text>
                      <Text style={s.statsPlays}>{selectedEra.topTrack.plays} plays</Text>
                    </View>
                  </View>
                  <View style={s.statsGrid}>
                    <View style={s.statCell}>
                      <Text style={s.statLabel}>Minutes Listened</Text>
                      <Text style={s.statValue}>{page.stats.minutesListened}</Text>
                    </View>
                    <View style={s.statCell}>
                      <Text style={s.statLabel}>Days of Longest streak</Text>
                      <Text style={s.statValue}>{page.stats.longestStreakDays}</Text>
                    </View>
                    <View style={s.statCell}>
                      <Text style={s.statLabel}>Among Friends</Text>
                      <Text style={s.statValue}>{page.stats.amongFriendsRank}</Text>
                    </View>
                  </View>
                </ImageBackground>
              </View>
            )}

            {/* What you played back then */}
            {selectedEra && selectedEra.playedThen.length > 0 && (
              <View style={s.block}>
                <View style={s.sectionHeaderRow}>
                  <Text style={s.sectionTitle}>What you played back then</Text>
                  <Text style={s.sectionLink}>SEE MORE</Text>
                </View>
                <LinearGradient
                  colors={['rgba(80,76,118,0.48)', 'rgba(0,0,0,0.95)']}
                  style={s.playedCard}
                >
                  {selectedEra.playedThen.map(track => (
                    <TouchableOpacity
                      key={track.title}
                      style={s.trackRow}
                      onPress={() => playByTitle(track.title)}
                      activeOpacity={0.8}
                    >
                      <Image source={resolveArt(track.artKey)} style={s.trackArt} />
                      <View style={{ flex: 1 }}>
                        <View style={s.trackTitleRow}>
                          <Text style={s.trackTitle} numberOfLines={1}>{track.title}</Text>
                          <ExplicitBadge />
                        </View>
                        <Text style={s.trackArtist}>{page.name}</Text>
                      </View>
                      <Ionicons name="heart" size={22} color={C.cyan} />
                      <Ionicons name="ellipsis-horizontal" size={20} color="#888" />
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity style={s.playMixBtn} onPress={() => playByTitle()} activeOpacity={0.85}>
                    <Text style={s.playMixText}>Play Your Mix</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            )}

            {/* Favorite lyrics — only for artists with curated lyrics */}
            {page.lyrics.length > 0 && (
              <View style={s.block}>
                <View style={s.sectionHeaderRow}>
                  <Text style={s.sectionTitle}>Your Favorite Lyrics</Text>
                  <Text style={s.sectionLink}>SEE MORE</Text>
                </View>
                <LyricCardStack items={page.lyrics} resolveArt={resolveArt} />
              </View>
            )}

            {/* Playlists */}
            {page.playlists.length > 0 && (
              <View style={s.block}>
                <View style={s.sectionHeaderRow}>
                  <Text style={s.sectionTitle}>Playlists Similar to this Era</Text>
                  <Text style={s.sectionLink}>SEE MORE</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.playlistRail}>
                  {page.playlists.map(pl => (
                    <TouchableOpacity key={pl.title} style={s.discCard} activeOpacity={0.85} onPress={() => playByArtKey(pl.artKey)}>
                      <Image source={resolveArt(pl.artKey)} style={s.discArt} resizeMode="cover" />
                      <Text style={s.discTitle} numberOfLines={1}>{pl.title}</Text>
                      <Text style={s.discMeta} numberOfLines={1}>Playlist • Amazon Music</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Where it started */}
            {page.firstPlay && (
              <View style={s.block}>
                <Text style={s.sectionTitle}>Where it started</Text>
                <ImageBackground
                  source={resolveArt(page.firstPlay.artKey)}
                  style={s.firstPlayCard}
                  imageStyle={{ borderRadius: 12 }}
                  resizeMode="cover"
                  alt=""
                >
                  <LinearGradient
                    colors={['rgba(0,0,0,0.92)', 'rgba(0,0,0,0.35)']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <Image source={resolveArt(page.firstPlay.artKey)} style={s.firstPlayArt} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.firstPlayEyebrow}>YOUR FIRST EVER PLAY</Text>
                    <Text style={s.firstPlayTitle} numberOfLines={1}>{page.firstPlay.title}</Text>
                    <Text style={s.firstPlayDate}>{page.firstPlay.date}</Text>
                  </View>
                </ImageBackground>
              </View>
            )}

            {/* Fallback for very thin artists: at least offer their tracks */}
            {!hasJourney && (
              <View style={s.emptyTab}>
                <Text style={s.emptyTabText}>We're still building your story with {page.firstName}.</Text>
              </View>
            )}
          </View>
        ) : tab === 'About' ? (
          about ? (
            <ArtistAboutTab
              data={about}
              artistName={page.name}
              artistId={artist.id}
              sinceYear={Number(page.sinceLabel.replace(/\D/g, '')) || undefined}
              merch={merchItems}
            />
          ) : (
          <View style={s.content}>
            <View style={s.block}>
              <Text style={s.sectionTitle}>About</Text>
              <View style={s.aboutCard}>
                <Text style={s.aboutText}>{page.bio}</Text>
              </View>
              <View style={s.aboutChips}>
                <View style={s.aboutChip}>
                  <Text style={s.aboutChipLabel}>Genre</Text>
                  <Text style={s.aboutChipValue}>{page.genre}</Text>
                </View>
                <View style={s.aboutChip}>
                  <Text style={s.aboutChipLabel}>Followers</Text>
                  <Text style={s.aboutChipValue}>{page.followersLabel.replace(' Followers', '')}</Text>
                </View>
                <View style={s.aboutChip}>
                  <Text style={s.aboutChipLabel}>You</Text>
                  <Text style={s.aboutChipValue}>{page.listenerBadge.replace(' listener', '')}</Text>
                </View>
              </View>
            </View>
          </View>
          )
        ) : tab === 'Music' ? (
          <View style={s.content}>

            {/* New Album feature banner */}
            {newAlbumSong ? (
              <View style={s.block}>
                <TouchableOpacity style={s.newAlbumCard} activeOpacity={0.88} onPress={() => playByTitle(newAlbumSong.title)}>
                  <Image source={resolveArt(newAlbumSong.albumArtPath ?? '')} style={StyleSheet.absoluteFill} resizeMode="cover" blurRadius={12} />
                  <View style={s.newAlbumScrim} />
                  <View style={s.newAlbumRow}>
                    <Image source={resolveArt(newAlbumSong.albumArtPath ?? '')} style={s.newAlbumCover} resizeMode="cover" />
                    <View style={{ flex: 1 }}>
                      <Text style={s.newAlbumEyebrow}>{newAlbumEyebrow}</Text>
                      <Text style={s.newAlbumCardTitle} numberOfLines={2}>{newAlbumSong.album}</Text>
                      <Text style={s.newAlbumSub} numberOfLines={1}>{artist.name}'s latest</Text>
                    </View>
                  </View>
                  <TouchableOpacity hitSlop={8} onPress={() => openAdaptiveMenu({ kind: 'song', song: newAlbumSong })} style={s.newAlbumMore}>
                    <Ionicons name="ellipsis-horizontal" size={16} color="#fff" />
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>
            ) : tourEvent ? (
              // No song data at all — same banner design, sourced from her
              // next show instead of a track.
              <View style={s.block}>
                <TouchableOpacity style={s.newAlbumCard} activeOpacity={0.88} onPress={() => setTab('Events')}>
                  <Image source={avatar} style={StyleSheet.absoluteFill} resizeMode="cover" blurRadius={12} />
                  <View style={s.newAlbumScrim} />
                  <View style={s.newAlbumRow}>
                    <Image source={avatar} style={s.newAlbumCover} resizeMode="cover" />
                    <View style={{ flex: 1 }}>
                      <Text style={s.newAlbumEyebrow}>TOUR ANNOUNCEMENT</Text>
                      <Text style={s.newAlbumCardTitle} numberOfLines={2}>{tourEvent.title}</Text>
                      <Text style={s.newAlbumSub} numberOfLines={1}>{tourEvent.venue}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Top Songs — paginated 3-per-page snap scroll, same as Olivia's */}
            <View style={s.block}>
              <Text style={s.sectionTitle}>Top Songs</Text>
              {popularPages.length > 0 ? (
                <>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    decelerationRate="normal"
                    snapToOffsets={popularSnapOffsets}
                    snapToAlignment="start"
                    nestedScrollEnabled
                    contentContainerStyle={[s.popScrollContent, { paddingRight: POP_PAGE_PEEK }]}
                  >
                    {popularPages.map((page_, pageIdx) => (
                      <View key={`pop-page-${pageIdx}`} style={[s.popPage, { width: POP_PAGE_WIDTH }]}>
                        {page_.map((sg, i) => {
                          const globalIdx = pageIdx * POP_SONGS_PER_PAGE + i
                          return (
                            <TouchableOpacity key={sg.id} style={s.popRow} activeOpacity={0.8} onPress={() => playByTitle(sg.title)}>
                              <Image source={resolveArt(sg.albumArtPath ?? '')} style={s.popArt} />
                              <View style={{ flex: 1 }}>
                                <Text style={s.popTitle} numberOfLines={1}>{globalIdx + 1}. {sg.title}</Text>
                                <Text style={s.popMeta} numberOfLines={1}>{artist.name} • {fmtStreams(MUSIC_STREAMS[globalIdx] ?? 100_000)}</Text>
                              </View>
                              <RowIcons song={sg} />
                            </TouchableOpacity>
                          )
                        })}
                      </View>
                    ))}
                  </ScrollView>
                  <TouchableOpacity
                    style={s.discLink}
                    activeOpacity={0.7}
                    onPress={() => showConfirmation(`Full ${artist.name} catalog coming soon`)}
                  >
                    <Text style={s.discLinkText}>Explore discography</Text>
                    <Ionicons name="chevron-forward" size={14} color={C.cyan} />
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={s.emptyTabText}>No tracks yet.</Text>
              )}
            </View>

            {/* Top Albums */}
            {page.eras.length > 0 && (
              <View style={s.block}>
                <Text style={s.sectionTitle}>Top Albums</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.albumRail}>
                  {page.eras.map((era, i) => (
                    <TouchableOpacity key={era.id} style={s.albumCard} activeOpacity={0.85} onPress={() => playByTitle(era.topTrack.title)}>
                      <Image source={resolveArt(era.eraImageKey)} style={s.albumArt} resizeMode="cover" />
                      <Text style={s.albumTitle} numberOfLines={1}>{i + 1}. {era.title}</Text>
                      <Text style={s.albumMeta} numberOfLines={1}>Album · {era.season}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* More from [Artist] — "Because you like…" equivalent, drawn from
                deeper catalog since a new listener has no taste history yet */}
            {moreFromArtist.length > 0 && (
              <View style={s.block}>
                <Text style={s.sectionTitle}>More from {artist.name}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.discRail}>
                  {moreFromArtist.map(sg => (
                    <TouchableOpacity key={sg.id} style={s.discCard} activeOpacity={0.85} onPress={() => playByTitle(sg.title)}>
                      <Image source={resolveArt(sg.albumArtPath ?? '')} style={s.discArt} resizeMode="cover" />
                      <Text style={s.discTitle} numberOfLines={1}>{sg.title}</Text>
                      <Text style={s.discMeta} numberOfLines={1}>{sg.album}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Fan Favorites */}
            {fanFavSongs.length > 0 && (
              <View style={s.block}>
                <Text style={s.sectionTitle}>Fan Favorites</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.discRail}>
                  {fanFavSongs.map(sg => (
                    <TouchableOpacity key={sg.id} style={s.discCard} activeOpacity={0.85} onPress={() => playByTitle(sg.title)}>
                      <Image source={resolveArt(sg.albumArtPath ?? '')} style={s.discArt} resizeMode="cover" />
                      <Text style={s.discTitle} numberOfLines={1}>{sg.title}</Text>
                      <Text style={s.discMeta} numberOfLines={1}>{sg.album}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Related Artists — generic framing (not "Fans also love") since
                that personalized framing hasn't been earned for a new listener */}
            {relatedArtists.length > 0 && (
              <View style={s.block}>
                <Text style={s.sectionTitle}>Related Artists</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.fanRail}>
                  {relatedArtists.map(a => {
                    const av = resolveArtistAvatar(a.id, a.imageUri)
                    return (
                      <TouchableOpacity key={a.id} style={s.fanCard} activeOpacity={0.85} onPress={() => router.push(`/artist/${a.id}` as any)}>
                        {av ? (
                          <Image source={av} style={s.fanAvatar} resizeMode="cover" />
                        ) : (
                          <View style={[s.fanAvatar, s.fanAvatarFallback]}>
                            <Ionicons name="person" size={32} color="rgba(255,255,255,0.25)" />
                          </View>
                        )}
                        <Text style={s.fanName} numberOfLines={1}>{a.name}</Text>
                      </TouchableOpacity>
                    )
                  })}
                </ScrollView>
              </View>
            )}

            {/* Playlists featuring [Artist] — editorial only, no "your" playlists yet */}
            {page.playlists.length > 0 && (
              <View style={s.block}>
                <Text style={s.sectionTitle}>Playlists featuring {artist.name}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.discRail}>
                  {page.playlists.map(pl => (
                    <TouchableOpacity key={pl.title} style={s.discCard} activeOpacity={0.85} onPress={() => playByArtKey(pl.artKey)}>
                      <Image source={resolveArt(pl.artKey)} style={s.discArt} resizeMode="cover" />
                      <Text style={s.discTitle} numberOfLines={1}>{pl.title}</Text>
                      <Text style={s.discMeta} numberOfLines={1}>Playlist • Amazon Music</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Podcasts about [Artist] */}
            <View style={s.block}>
              <Text style={s.sectionTitle}>Podcasts about {artist.name}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.discRail}>
                {podcastShows.map(show => (
                  <TouchableOpacity key={show.id} style={s.discCard} activeOpacity={0.85} onPress={() => router.push(`/podcast-show/${show.id}` as any)}>
                    <View>
                      {show.art ? (
                        <Image source={show.art} style={s.discArt} resizeMode="cover" />
                      ) : (
                        <View style={[s.discArt, { backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center' }]}>
                          <Ionicons name="mic-outline" size={26} color="rgba(255,255,255,0.25)" />
                        </View>
                      )}
                      <View style={s.micBadge}>
                        <Ionicons name="mic-outline" size={26} color="#fff" />
                      </View>
                    </View>
                    <Text style={s.discTitle} numberOfLines={1}>{show.title}</Text>
                    <Text style={s.discMeta} numberOfLines={1}>{show.episodeCount} episodes</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Related Radio Stations */}
            {stations.length > 0 && (
              <View style={s.block}>
                <Text style={s.sectionTitle}>Related Radio Stations</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.discRail}>
                  {stations.map(st => (
                    <TouchableOpacity key={st.name} style={s.discCard} activeOpacity={0.85} onPress={() => playByTitle(st.trackTitle)}>
                      <View>
                        <Image source={resolveArt(st.artKey)} style={s.discArt} resizeMode="cover" />
                        <View style={s.radioBadge}>
                          <MaterialIcons name="sensors" size={26} color="#fff" />
                        </View>
                      </View>
                      <Text style={s.discTitle} numberOfLines={1}>{st.name}</Text>
                      <Text style={s.discMeta} numberOfLines={1}>Station • {artist.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        ) : tab === 'Events' ? (
          <View style={s.content}>
            <View style={s.block}>
              <Text style={s.sectionTitle}>Events & shows</Text>
              {about?.events && about.events.length > 0 ? (
                <ArtistEventsCard events={about.events} />
              ) : (
                <View style={s.emptyTab}>
                  <Text style={s.emptyTabText}>No upcoming shows near you.</Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View style={s.emptyTab}>
            <Text style={s.emptyTabText}>{tab} coming soon</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

function HeroOverlay({
  insets,
  page,
  avatar,
  activeProfile,
  following,
  showSinceBubble,
  onBack,
  onToggleFollow,
  onPlay,
  onShuffle,
  onMenu,
}: {
  insets: { top: number }
  page: ReturnType<typeof buildArtistPage>
  avatar: any
  activeProfile: { initial: string; color: string; image?: any }
  following: boolean
  showSinceBubble: boolean
  onBack: () => void
  onToggleFollow: () => void
  onPlay: () => void
  onShuffle: () => void
  onMenu: () => void
}) {
  return (
    <>
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.13)', 'rgba(0,0,0,0.85)', '#000']}
        locations={[0.35, 0.5, 0.82, 1]}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.45)', 'rgba(0,0,0,0)']}
        style={s.heroTopGradient}
      />

      <View style={[s.heroTopNav, { paddingTop: insets.top + 4 }]}>
        <TouchableOpacity onPress={onBack} style={s.iconBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={s.iconBtn} hitSlop={8} onPress={onMenu}>
          <Ionicons name="options-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={s.profileCluster}>
        {avatar && <Image source={avatar} style={s.artistAvatar} resizeMode="cover" />}
        {showSinceBubble && (
          <View style={s.userBubbleWrap}>
            <View style={s.sinceBubble}>
              <Ionicons name="heart" size={14} color="#fff" />
              <Text style={s.sinceText}>{page.sinceLabel}</Text>
            </View>
            <View style={[s.userAvatar, !activeProfile.image && { backgroundColor: activeProfile.color }]}>
              {activeProfile.image ? (
                <Image source={activeProfile.image} style={s.userAvatarImg} resizeMode="cover" />
              ) : (
                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>{activeProfile.initial}</Text>
              )}
            </View>
          </View>
        )}
      </View>

      <View style={s.heroMeta}>
        <Text style={s.heroName} numberOfLines={2}>{page.name}</Text>
        <Text style={s.heroFollowers}>{page.followersLabel}</Text>
      </View>

      <View style={s.controlPanel}>
        <View style={s.controlLeft}>
          <TouchableOpacity onPress={onToggleFollow} style={s.followBtn}>
            <Ionicons name="heart" size={16} color={following ? C.cyan : '#fff'} />
            <Text style={s.followBtnText}>{following ? 'Following' : 'Follow'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.roundIconBtn} onPress={onShuffle} hitSlop={8}>
            <Ionicons name="shuffle" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={s.roundIconBtn} onPress={onMenu} hitSlop={8}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={s.playBtn} onPress={onPlay} activeOpacity={0.85}>
          <Ionicons name="play" size={26} color="#000" style={{ marginLeft: 3 }} />
        </TouchableOpacity>
      </View>
    </>
  )
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  heroWrap: { height: 406, backgroundColor: '#000', overflow: 'hidden' },
  heroBg: { flex: 1, justifyContent: 'flex-end' },
  heroTopNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  heroTopGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 100 },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  profileCluster: { position: 'absolute', left: 16, top: 168, width: 200, height: 76 },
  artistAvatar: {
    width: 71,
    height: 71,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  userBubbleWrap: { position: 'absolute', left: 49, top: 11 },
  sinceBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#495054',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginLeft: 34,
  },
  sinceText: { color: '#fff', fontSize: 11 },
  userAvatar: {
    position: 'absolute',
    left: 0,
    top: 26,
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000',
    overflow: 'hidden',
  },
  userAvatarImg: { width: '100%', height: '100%' },
  heroMeta: { paddingHorizontal: 16, paddingBottom: 8, marginTop: 108 },
  heroName: { ...typeHeadline(33), color: '#fff', letterSpacing: -0.5 },
  heroFollowers: { fontSize: 15, color: '#acb3b4', marginTop: 2 },
  controlPanel: {
    backgroundColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  controlLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#4c4c4c',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  followBtnText: { color: '#fff', fontSize: 14 },
  roundIconBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  playBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: C.cyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: { backgroundColor: '#000', borderBottomWidth: 1, borderBottomColor: C.border },
  tabRow: { paddingHorizontal: 8 },
  tabItem: { paddingHorizontal: 10, paddingVertical: 10, position: 'relative' },
  tabLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  tabText: { fontSize: 12, color: '#fff', fontWeight: '400' },
  tabTextActive: { fontWeight: '700' },
  tabUnderline: { position: 'absolute', bottom: 0, left: 8, right: 8, height: 2, backgroundColor: C.cyan },
  content: { paddingHorizontal: 16, paddingTop: 12, gap: 24 },
  block: { gap: 12 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { ...typeHeadline(20), color: '#fff' },

  sectionLink: { fontSize: 14, color: '#757575', fontWeight: '700' },
  eraRail: { gap: 12, paddingVertical: 4 },
  eraCard: { width: ERA_CARD_W, height: ERA_CARD_H, borderRadius: 8, overflow: 'hidden', justifyContent: 'flex-end' },
  eraCardSelected: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    shadowColor: '#7f77d7',
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  eraCardFooter: { backgroundColor: 'rgba(30,30,30,0.56)', paddingHorizontal: 12, paddingVertical: 8, gap: 2 },
  eraSeason: { fontSize: 8, color: '#a6a6a6' },
  eraTitle: { fontSize: 12, color: '#fff', fontWeight: '700' },
  eraBadge: { fontSize: 8, color: '#fff', fontWeight: '700' },
  timelineTrack: { height: 4, borderRadius: 2, backgroundColor: '#333' },
  timelineFill: { height: '100%', backgroundColor: C.cyan, borderRadius: 2 },
  timelineThumb: {
    position: 'absolute',
    right: -3,
    top: -1,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    shadowColor: C.cyan,
    shadowOpacity: 0.7,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  eraDetail: { gap: 4 },
  eraDetailSeason: { fontSize: 12, color: C.cyan, fontWeight: '700' },
  eraDetailTitle: { ...typeHeadline(28), color: '#fff' },
  eraDetailDesc: { fontSize: 12, color: '#a6a6a6', lineHeight: 18 },
  statsCard: { borderRadius: 12, overflow: 'hidden', padding: 12, minHeight: 180 },
  statsOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 12 },
  statsTop: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  statsArt: { width: 63, height: 63, borderRadius: 4, borderWidth: 0.75, borderColor: 'rgba(255,255,255,0.24)' },
  statsEyebrow: { fontSize: 12, color: C.cyan, fontWeight: '700' },
  statsTrack: { fontSize: 16, color: '#fff', fontWeight: '700' },
  statsPlays: { fontSize: 12, color: '#fff' },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  statCell: { flex: 1, paddingTop: 8, paddingHorizontal: 4 },
  statLabel: { fontSize: 12, color: '#fff' },
  statValue: { fontSize: 28, color: '#fff', fontWeight: '700', marginTop: 2 },
  playedCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#7b75bb',
    paddingHorizontal: 8,
    paddingVertical: 12,
    gap: 12,
  },
  trackRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  trackArt: { width: 63, height: 63, borderRadius: 4 },
  trackTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  trackTitle: { fontSize: 16, color: '#fff', fontWeight: '700', flexShrink: 1 },
  trackArtist: { fontSize: 12, color: '#a6a6a6', marginTop: 2 },
  explicitBadge: { width: 16, height: 16, borderRadius: 3, backgroundColor: '#a6a6a6', alignItems: 'center', justifyContent: 'center' },
  explicitText: { fontSize: 9, color: '#000', fontWeight: '700' },
  playMixBtn: {
    borderWidth: 1,
    borderColor: '#a6a6a6',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 32,
    paddingVertical: 8,
    alignItems: 'center',
  },
  playMixText: { color: '#fff', fontSize: 12 },
  exclusiveCard: { flexDirection: 'row', alignItems: 'center', gap: 24, borderRadius: 12, backgroundColor: C.cyan, overflow: 'hidden' },
  exclusiveImg: { width: 150, height: 172, justifyContent: 'flex-end' },
  exclusiveImgRadius: { borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
  exclusiveImgCaption: { padding: 12 },
  exclusiveImgTitle: { ...typeHeadline(16), color: '#fff' },
  exclusiveImgDate: { fontSize: 12, color: '#fff', marginTop: 2 },
  exclusiveText: { flex: 1, gap: 10, paddingRight: 16 },
  exclusiveTag: { fontSize: 10, fontWeight: '800', letterSpacing: 1, color: 'rgba(0,0,0,0.55)' },
  exclusiveMilestone: { fontSize: 12, color: '#000', lineHeight: 14 },
  exclusiveBody: { ...typeHeadline(16), color: '#000', lineHeight: 20 },
  lyricStack: { height: 300, width: '100%', alignItems: 'center' },
  lyricBackCard: {
    position: 'absolute',
    top: 26,
    width: 172,
    height: 236,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: '#000',
    overflow: 'hidden',
    padding: 14,
    justifyContent: 'space-between',
  },
  lyricBackLeft: { left: 0, transform: [{ rotate: '-11deg' }], zIndex: 1 },
  lyricBackRight: { right: 0, transform: [{ rotate: '11deg' }], zIndex: 2 },
  lyricFrontCard: {
    position: 'absolute',
    top: 6,
    width: 230,
    height: 272,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: '#000',
    overflow: 'hidden',
    padding: 18,
    justifyContent: 'space-between',
    zIndex: 3,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  lyricStackHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  lyricStackArt: { width: 28, height: 28, borderRadius: 4, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.24)' },
  lyricStackSong: { ...typeHeadline(15), color: '#a6a6a6', flexShrink: 1 },
  lyricStackText: { ...typeHeadline(14), color: '#fff', lineHeight: 18 },
  lyricStackTextFront: { ...typeHeadline(19), color: '#fff', lineHeight: 24 },
  lyricStackFans: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  lyricStackFansText: { fontSize: 11, color: '#fff' },
  playlistRail: { gap: 12 },
  firstPlayCard: { height: 105, borderRadius: 12, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', padding: 10, gap: 10 },
  firstPlayArt: { width: 81, height: 81, borderRadius: 4 },
  firstPlayEyebrow: { fontSize: 12, color: C.cyan, fontWeight: '700' },
  firstPlayTitle: { fontSize: 16, color: '#fff', fontWeight: '700' },
  firstPlayDate: { fontSize: 12, color: '#a6a6a6', marginTop: 2 },
  aboutCard: { backgroundColor: C.surface, borderRadius: 12, padding: 14 },
  aboutText: { fontSize: 14, color: '#c9c9c9', lineHeight: 21 },
  aboutChips: { flexDirection: 'row', gap: 10 },
  aboutChip: { flex: 1, backgroundColor: C.surface, borderRadius: 10, padding: 12, gap: 4 },
  aboutChipLabel: { fontSize: 11, color: '#8a8a8a' },
  aboutChipValue: { fontSize: 14, color: '#fff', fontWeight: '700' },
  popRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  popArt: { width: 56, height: 56, borderRadius: 6, borderWidth: 0.75, borderColor: 'rgba(255,255,255,0.24)' },
  popTitle: { ...typeHeadline(16), color: '#fff', flexShrink: 1 },
  popMeta: { fontSize: 12, color: '#8a8a8a', marginTop: 3 },
  popDur: { fontSize: 12, color: '#8a8a8a' },
  emptyTab: { alignItems: 'center', paddingTop: 48, paddingBottom: 80 },
  emptyTabText: { color: '#555', fontSize: 14, textAlign: 'center' },

  discLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 12 },
  discLinkText: { fontSize: 13, color: C.cyan },

  albumRail: { gap: 14, paddingRight: 16 },
  albumCard: { width: 140 },
  albumArt: { width: 140, height: 140, borderRadius: 8, backgroundColor: C.surface, borderWidth: 0.75, borderColor: 'rgba(255,255,255,0.15)' },
  albumTitle: { ...typeHeadline(14), color: '#fff', marginTop: 7 },
  albumMeta: { fontSize: 12, color: '#888', marginTop: 2 },

  fanRail: { gap: 14, paddingRight: 16 },
  fanCard: { alignItems: 'center', gap: 7, width: 100 },
  fanAvatar: { width: 100, height: 100, borderRadius: 50 },
  fanAvatarFallback: { backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  fanName: { ...typeHeadline(13), color: '#fff', textAlign: 'center' },

  // New Album feature banner — ported from Olivia's New-listener Music tab
  newAlbumCard: { borderRadius: 4, overflow: 'hidden', padding: 12, flexDirection: 'row', alignItems: 'center' },
  newAlbumScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  newAlbumRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14 },
  newAlbumCover: { width: 81, height: 81, borderRadius: 4, borderWidth: 0.75, borderColor: 'rgba(255,255,255,0.24)' },
  newAlbumEyebrow: { fontSize: 12, fontWeight: '700', color: C.cyan },
  newAlbumCardTitle: { ...typeHeadline(16), color: '#fff', marginTop: 2 },
  newAlbumSub: { fontSize: 12, color: '#fff', marginTop: 3 },
  newAlbumMore: { marginLeft: 8, alignSelf: 'flex-start' },

  // Top Songs pagination
  popScrollContent: { paddingLeft: 16 },
  popPage: { paddingRight: 20 },
  rowIcons: { flexDirection: 'row', alignItems: 'center', gap: 14 },

  // Discovery-style rail cards (More from Artist, Fan Favorites, Podcasts, Radio)
  discRail: { paddingHorizontal: 16, gap: 14 },
  discCard: { width: 173 },
  discArt: { width: 173, height: 173, borderRadius: 8, borderWidth: 0.75, borderColor: 'rgba(255,255,255,0.24)' },
  discTitle: { ...typeHeadline(16), color: '#fff', marginTop: 6 },
  discMeta: { fontSize: 14, color: '#a6a6a6', marginTop: 1 },
  radioBadge: {
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
})
