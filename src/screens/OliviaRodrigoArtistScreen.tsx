import { useMemo, useState, useEffect } from 'react'
import {
  ScrollView,
  View,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Dimensions,
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
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { songs } from '../data/mockData'
import { albumArtAssets, oliviaPageAssets, oliviaAboutAssets } from '../data/assetMap'
import { useProfiles } from '../context/ProfilesContext'
import {
  OLIVIA_ERAS,
  OLIVIA_ERA_PLAYLISTS,
  OLIVIA_FAVORITE_LYRICS,
  OLIVIA_JOURNEY_STATS,
  type OliviaEraId,
} from '../data/oliviaRodrigoPage'
import { OLIVIA_ABOUT_MERCH, OLIVIA_ABOUT_EVENTS, OLIVIA_PAST_EVENTS, OLIVIA_FAN_POSTS } from '../data/oliviaRodrigoAbout'
import { usePlaybackState } from '../hooks/usePlaybackState'
import { useAdaptiveUI } from '../context/AdaptiveUIContext'
import { useAdaptiveMenu } from '../components/AdaptiveContextMenu'
import { C, typeHeadline } from '../theme'
import OliviaAboutTab from '../components/artist/OliviaAboutTab'
import OliviaMusicTab from '../components/artist/OliviaMusicTab'
import { ArtistEventsCard, ArtistMerchGrid, PastArtistEventsCard, FanPostsCarousel, FanCommunityCard } from '../components/artist/ArtistCommerce'
import JourneyTimeline from '../components/artist/JourneyTimeline'
import { EdgeFadeRow } from '../components/EdgeFadeRow'


// RN-web sizes an ImageBackground's inner image from the asset's intrinsic
// dimensions when the style has no explicit width/height (native stretches
// it). Force full-bleed so web and Expo Go render identically.
const COVER_IMG = { width: '100%', height: '100%' } as const

const TABS = ['Music', 'Events', 'Merch', 'About', 'You & Olivia'] as const
const ERA_CARD_W = 120
const ERA_CARD_H = 122
const MERCH_CARD_W = (Dimensions.get('window').width - 44) / 2

const ERA_IMAGES: Record<string, number> = {
  'olivia-era-love': oliviaPageAssets.eraLove,
  'olivia-era-sour': oliviaPageAssets.eraSour,
  'olivia-era-petty': oliviaPageAssets.eraPetty,
}

function resolveArt(key: string) {
  return albumArtAssets[key] ?? ERA_IMAGES[key] ?? oliviaPageAssets.profile
}

function ExplicitBadge() {
  return (
    <View style={s.explicitBadge}>
      <Text style={s.explicitText}>E</Text>
    </View>
  )
}

// Front (centered) lyric card gradient — Figma slate-blue over black
const LYRIC_FRONT_GRADIENT = ['rgba(117,159,187,0.12)', 'rgba(117,159,187,0.6)'] as const

type LyricItem = (typeof OLIVIA_FAVORITE_LYRICS)[number]

function LyricStackCard({
  item,
  variant,
  containerStyle,
}: {
  item: LyricItem
  variant: 'front' | 'back'
  containerStyle: any
}) {
  const front = variant === 'front'
  return (
    <View style={containerStyle}>
      <LinearGradient
        colors={front ? ((item.gradient as [string, string]) ?? LYRIC_FRONT_GRADIENT) : (item.gradient as [string, string])}
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

// Deep-link tab values (?tab=you|about|events|merch), same contract the home
// screen's Olivia cards use.
const DEEP_TABS: Record<string, (typeof TABS)[number]> = {
  you: 'You & Olivia',
  about: 'About',
  events: 'Events',
  merch: 'Merch',
}

export default function OliviaRodrigoArtistScreen({ initialTab }: { initialTab?: string } = {}) {
  const router = useRouter()

  // Deep-linked or reloaded pages have no history entry — a bare router.back()
  // silently no-ops and the back chevron reads as broken. Land on Home instead.
  const goBack = () => {
    if (router.canGoBack()) router.back()
    else router.replace('/')
  }
  const insets = useSafeAreaInsets()
  const { playSongAt } = usePlaybackState()
  const { showConfirmation } = useAdaptiveUI()
  const { activeProfile } = useProfiles()
  const { open: openAdaptiveMenu } = useAdaptiveMenu()
  const [tab, setTab] = useState<(typeof TABS)[number]>(() => DEEP_TABS[initialTab ?? ''] ?? 'Music')
  const [selectedEraId, setSelectedEraId] = useState<OliviaEraId>('sour')
  const [following, setFollowing] = useState(true)

  const selectedEra = useMemo(
    () => OLIVIA_ERAS.find(e => e.id === selectedEraId) ?? OLIVIA_ERAS[1],
    [selectedEraId],
  )

  const selectedEraIndex = OLIVIA_ERAS.findIndex(e => e.id === selectedEraId)

  const firstSong = songs.find(s => s.artistId === 'olivia-rodrigo')

  // Olivia's catalog, for the Music tab. Display-only — not wired to playback.
  const oliviaSongs = useMemo(
    () => songs.filter(sg => sg.artistId === 'olivia-rodrigo'),
    [],
  )

  const oliviaAlbums = useMemo(() => {
    const seen = new Map<string, { album: string; artKey: string; count: number }>()
    for (const sg of oliviaSongs) {
      const found = seen.get(sg.album)
      if (found) found.count += 1
      else seen.set(sg.album, { album: sg.album, artKey: sg.albumArtPath ?? '', count: 1 })
    }
    return Array.from(seen.values())
  }, [oliviaSongs])

  const playOlivia = (title?: string) => {
    const match = title
      ? songs.find(s => s.artistId === 'olivia-rodrigo' && s.title.toLowerCase() === title.toLowerCase())
      : firstSong
    if (match) {
      playSongAt(match.id)
      router.push('/now-playing')
    }
  }

  // Shuffle stays on the page — the mini player and a toast confirm playback.
  const shuffleOlivia = () => {
    if (oliviaSongs.length === 0) return
    const pick = oliviaSongs[Math.floor(Math.random() * oliviaSongs.length)]
    playSongAt(pick.id)
    showConfirmation('Shuffling Olivia Rodrigo')
  }

  // Same bottom-sheet menu as long-press everywhere else.
  const showOliviaMenu = () => {
    openAdaptiveMenu({ kind: 'artist', artistId: 'olivia-rodrigo', name: 'Olivia Rodrigo', imageUri: 'olivia-rodrigo-hero' })
  }

  return (
    <View style={s.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Hero */}
        <View style={s.heroWrap}>
          <ImageBackground source={oliviaPageAssets.hero} style={s.heroBg} imageStyle={COVER_IMG} resizeMode="cover">
            {/* Fade the hero photo down through its ambient slate-blue and into the
                page black, so the follow/play controls below sit on a gradient
                rather than a flat black band. */}
            <LinearGradient
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.12)', 'rgba(22,38,49,0.7)', 'rgba(13,22,29,0.95)', '#000']}
              locations={[0.3, 0.48, 0.72, 0.9, 1]}
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.45)', 'rgba(0,0,0,0)']}
              style={s.heroTopGradient}
            />

            <View style={[s.heroTopNav, { paddingTop: insets.top + 4 }]}>
              <TouchableOpacity onPress={goBack} style={s.iconBtn} hitSlop={8}>
                <Ionicons name="chevron-back" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={s.iconBtn} hitSlop={8} onPress={showOliviaMenu}>
                <Ionicons name="options-outline" size={22} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={s.profileCluster}>
              <Image source={oliviaPageAssets.profile} style={s.artistAvatar} resizeMode="cover" />
              <View style={s.userBubbleWrap}>
                <View style={[s.userAvatar, { backgroundColor: activeProfile.color }]}>
                  <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>
                    {activeProfile.initial}
                  </Text>
                </View>
                {!activeProfile.casual && (
                  <View style={s.sinceBubble}>
                    <Ionicons name="heart" size={14} color="#fff" />
                    <Text style={s.sinceText}>Since Mar 2020</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={s.heroMeta}>
              <Text style={s.heroName}>Olivia Rodrigo</Text>
              <Text style={s.heroFollowers}>4M+ Followers</Text>
            </View>

            <View style={s.controlPanel}>
              <View style={s.controlLeft}>
                <TouchableOpacity
                  onPress={() => setFollowing(!following)}
                  style={[s.followBtn, following && s.followingBtn]}
                >
                  <Ionicons name="heart" size={16} color={following ? C.cyan : '#fff'} />
                  <Text style={s.followBtnText}>{following ? 'Following' : 'Follow'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.roundIconBtn} onPress={shuffleOlivia} hitSlop={8}>
                  <Ionicons name="shuffle" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={s.roundIconBtn} onPress={showOliviaMenu} hitSlop={8}>
                  <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={s.playBtn} onPress={() => playOlivia()} activeOpacity={0.85}>
                <Ionicons name="play" size={26} color="#000" style={{ marginLeft: 3 }} />
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>

        {/* Tabs */}
        <View style={s.tabBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabRow}>
            {TABS.map(t => (
              <TouchableOpacity key={t} onPress={() => setTab(t)} style={s.tabItem}>
                <Text style={[s.tabText, tab === t && s.tabTextActive]}>{t}</Text>
                {tab === t && <View style={s.tabUnderline} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {tab === 'You & Olivia' ? (
          <View style={s.content}>
            {/* Exclusive */}
            <View style={s.block}>
              <Text style={s.sectionTitle}>Exclusive For You</Text>
              <View style={s.exclusiveCard}>
                <ImageBackground
                  source={resolveArt('olivia-rodrigo-exclusive')}
                  style={s.exclusiveImg}
                  imageStyle={[COVER_IMG, s.exclusiveImgRadius]}
                  resizeMode="cover"
                >
                  <LinearGradient
                    colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.95)']}
                    locations={[0.5, 1]}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={s.exclusiveImgCaption}>
                    <Text style={s.exclusiveImgTitle} numberOfLines={1}>
                      Checking in with Olivia Rodrigo
                    </Text>
                    <Text style={s.exclusiveImgDate}>14 Mar 2020</Text>
                  </View>
                </ImageBackground>
                <View style={s.exclusiveText}>
                  <Text style={s.exclusiveMilestone}>50th listen{'\n'}milestone unlocked</Text>
                  <Text style={s.exclusiveBody}>
                    Exclusive podcast interview with Olivia about her new album
                  </Text>
                </View>
              </View>
            </View>

            {/* Journey eras */}
            <View style={s.block}>
              <View style={s.sectionHeaderRow}>
                <Text style={s.sectionTitle}>Your Journey with Olivia</Text>
                <TouchableOpacity onPress={() => setSelectedEraId(OLIVIA_ERAS[0].id)} hitSlop={8}>
                  <Text style={s.sectionLink}>Back to Now</Text>
                </TouchableOpacity>
              </View>

              <EdgeFadeRow fadeColor="#000000">
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.eraRail}
                >
                  {OLIVIA_ERAS.map(era => {
                    const selected = era.id === selectedEraId
                    return (
                      <TouchableOpacity
                        key={era.id}
                        activeOpacity={0.9}
                        onPress={() => setSelectedEraId(era.id)}
                        style={[s.eraCard, selected && s.eraCardSelected]}
                      >
                        <ImageBackground
                          source={resolveArt(era.eraImageKey)}
                          style={StyleSheet.absoluteFill}
                          imageStyle={[COVER_IMG, { borderRadius: 8 }]}
                          resizeMode="cover"
                        >
                          <LinearGradient
                            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.75)']}
                            style={StyleSheet.absoluteFill}
                          />
                        </ImageBackground>
                        <View style={s.eraCardFooter}>
                          <Text style={s.eraSeason}>{era.season}</Text>
                          <Text style={s.eraTitle}>{era.title}</Text>
                          <Text style={s.eraBadge}>{era.badge}</Text>
                        </View>
                      </TouchableOpacity>
                    )
                  })}
                </ScrollView>
              </EdgeFadeRow>

              <JourneyTimeline
                count={OLIVIA_ERAS.length}
                activeIndex={selectedEraIndex}
                onSelect={i => setSelectedEraId(OLIVIA_ERAS[i].id)}
              />
            </View>

            <View style={s.eraDetail}>
              <Text style={s.eraDetailSeason}>{selectedEra.season.toUpperCase()}</Text>
              <Text style={s.eraDetailTitle}>{selectedEra.title}</Text>
              <Text style={s.eraDetailDesc}>{selectedEra.description}</Text>
            </View>

            {/* Time together */}
            <View style={s.block}>
              <Text style={s.sectionTitle}>Time You Spent Together</Text>
              <ImageBackground
                source={resolveArt(selectedEra.eraImageKey)}
                style={s.statsCard}
                imageStyle={[COVER_IMG, { borderRadius: 12 }]}
                resizeMode="cover"
              >
                <View style={s.statsOverlay} />
                <View style={s.statsTop}>
                  <Image source={resolveArt(selectedEra.topTrack.artKey)} style={s.statsArt} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.statsEyebrow}>You played this on repeat</Text>
                    <Text style={s.statsTrack}>{selectedEra.topTrack.title}</Text>
                    <Text style={s.statsPlays}>{selectedEra.topTrack.plays} plays</Text>
                  </View>
                </View>
                <View style={s.statsGrid}>
                  <View style={s.statCell}>
                    <Text style={s.statLabel}>Minutes Listened</Text>
                    <Text style={s.statValue}>{OLIVIA_JOURNEY_STATS.minutesListened}</Text>
                  </View>
                  <View style={s.statCell}>
                    <Text style={s.statLabel}>Days of Longest streak</Text>
                    <Text style={s.statValue}>{OLIVIA_JOURNEY_STATS.longestStreakDays}</Text>
                  </View>
                  <View style={s.statCell}>
                    <Text style={s.statLabel}>Among Friends</Text>
                    <Text style={s.statValue}>{OLIVIA_JOURNEY_STATS.amongFriendsRank}</Text>
                  </View>
                </View>
              </ImageBackground>
            </View>

            {/* What you played */}
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
                    onPress={() => playOlivia(track.title)}
                    activeOpacity={0.8}
                  >
                    <Image source={resolveArt(track.artKey)} style={s.trackArt} />
                    <View style={{ flex: 1 }}>
                      <View style={s.trackTitleRow}>
                        <Text style={s.trackTitle} numberOfLines={1}>{track.title}</Text>
                        <ExplicitBadge />
                      </View>
                      <Text style={s.trackArtist}>Olivia Rodrigo</Text>
                    </View>
                    <Ionicons name="heart" size={22} color={C.cyan} />
                    <Ionicons name="ellipsis-horizontal" size={20} color="#888" />
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={s.playMixBtn} onPress={() => playOlivia()} activeOpacity={0.85}>
                  <Text style={s.playMixText}>Play Your Mix</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>

            {/* Lyrics */}
            <View style={s.block}>
              <View style={s.sectionHeaderRow}>
                <Text style={s.sectionTitle}>Your Favorite Lyrics</Text>
                <Text style={s.sectionLink}>SEE MORE</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={242}
                decelerationRate="fast"
                contentContainerStyle={s.lyricRail}
              >
                {OLIVIA_FAVORITE_LYRICS.map(item => (
                  <LyricStackCard
                    key={item.song}
                    item={item}
                    variant="front"
                    containerStyle={s.lyricRailCard}
                  />
                ))}
              </ScrollView>
            </View>

            {/* Playlists */}
            <View style={s.block}>
              <View style={s.sectionHeaderRow}>
                <Text style={s.sectionTitle}>Playlists Similar to this Era</Text>
                <Text style={s.sectionLink}>SEE MORE</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.playlistRail}>
                {OLIVIA_ERA_PLAYLISTS.map(pl => (
                  <View key={pl.title} style={s.playlistCard}>
                    <Image source={resolveArt(pl.artKey)} style={s.playlistArt} />
                    <Text style={s.playlistTitle} numberOfLines={2}>{pl.title}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Where it started */}
            <View style={s.block}>
              <Text style={s.sectionTitle}>Where it started</Text>
              <ImageBackground
                source={oliviaPageAssets.eraSour}
                style={s.firstPlayCard}
                imageStyle={[COVER_IMG, { borderRadius: 12 }]}
                resizeMode="cover"
              >
                <LinearGradient
                  colors={['rgba(0,0,0,0.92)', 'rgba(0,0,0,0.35)']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={StyleSheet.absoluteFill}
                />
                <Image source={resolveArt('olivia-rodrigo-sour')} style={s.firstPlayArt} />
                <View style={{ flex: 1 }}>
                  <Text style={s.firstPlayEyebrow}>YOUR FIRST EVER PLAY</Text>
                  <Text style={s.firstPlayTitle}>Drivers License</Text>
                  <Text style={s.firstPlayDate}>13 March 2019</Text>
                </View>
              </ImageBackground>
            </View>
          </View>
        ) : tab === 'About' ? (
          <OliviaAboutTab />
        ) : tab === 'Music' ? (
          <OliviaMusicTab />
        ) : tab === 'Merch' ? (
          <View style={s.content}>
            <View style={s.block}>
              <View style={s.sectionHeaderRow}>
                <Text style={s.sectionTitle}>Official Store</Text>
              </View>
              <ArtistMerchGrid
                items={OLIVIA_ABOUT_MERCH.map(item => ({
                  title: item.title,
                  price: item.price,
                  artKey: item.artKey,
                }))}
                resolveArt={key => oliviaAboutAssets[key] ?? resolveArt(key)}
              />
            </View>
          </View>
        ) : tab === 'Events' ? (
          <View style={s.content}>
            <View style={s.block}>
              <Text style={s.sectionTitle}>Events & shows</Text>
              <ArtistEventsCard events={OLIVIA_ABOUT_EVENTS} />
            </View>
            <View style={s.block}>
              <Text style={s.sectionTitle}>Past Events</Text>
              <PastArtistEventsCard events={OLIVIA_PAST_EVENTS} />
            </View>
            {/* v3.1 IA: the fandom gathers around the live moments */}
            <View style={s.block}>
              <Text style={s.sectionTitle}>Popular posts from fan groups</Text>
              <FanPostsCarousel
                posts={OLIVIA_FAN_POSTS}
                resolveArt={key => oliviaAboutAssets[key] ?? resolveArt(key)}
              />
              <FanCommunityCard
                name="Livies"
                members="12,480"
                note="A fan space, not a public feed — your posts stay among Livies."
              />
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

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  heroWrap: { height: 406, backgroundColor: '#000' },
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
  heroTopGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  profileCluster: {
    position: 'absolute',
    left: 16,
    top: 168,
    width: 200,
    height: 76,
  },
  artistAvatar: {
    width: 71,
    height: 71,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  userBubbleWrap: { position: 'absolute', left: 49, top: 14, alignItems: 'flex-start' },
  sinceBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(240,180,185,0.30)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginLeft: 34,
    borderWidth: 1,
    borderColor: 'rgba(240,160,170,0.55)',
  },
  sinceText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  userAvatar: {
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  heroMeta: { paddingHorizontal: 16, paddingBottom: 8, marginTop: 108 },
  heroName: { ...typeHeadline(33), color: '#fff', letterSpacing: -0.5 },
  heroFollowers: { fontSize: 15, color: '#acb3b4', marginTop: 2 },
  controlPanel: {
    // No solid fill — the hero overlay gradient shows through so the controls
    // sit on the ambient slate→black fade instead of a flat black band.
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
  followingBtn: {},
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
  tabText: { fontSize: 12, color: '#fff', fontWeight: '400' },
  tabTextActive: { fontWeight: '700' },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 8,
    right: 8,
    height: 2,
    backgroundColor: C.cyan,
  },
  content: { paddingHorizontal: 16, paddingTop: 12, gap: 24 },
  block: { gap: 12 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { ...typeHeadline(20), color: '#fff' },
  sectionLink: { fontSize: 14, color: '#757575', fontWeight: '700' },
  eraRail: { gap: 12, paddingVertical: 4 },
  musicAlbumRail: { gap: 12, paddingVertical: 4 },
  musicAlbumCard: { width: 140 },
  musicAlbumArt: { width: 140, height: 140, borderRadius: 8, backgroundColor: C.surface },
  musicAlbumTitle: { fontSize: 14, color: '#fff', fontWeight: '600', marginTop: 8 },
  musicAlbumMeta: { fontSize: 12, color: '#888', marginTop: 2 },
  musicRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  musicIdx: { width: 22, textAlign: 'center', fontSize: 14, color: '#888', fontWeight: '600' },
  musicArt: { width: 48, height: 48, borderRadius: 6, backgroundColor: C.surface },
  musicRowInfo: { flex: 1 },
  musicTitle: { fontSize: 15, color: '#fff', fontWeight: '500' },
  musicMeta: { fontSize: 13, color: '#888', marginTop: 2 },
  musicDur: { fontSize: 13, color: '#888', marginLeft: 8 },
  eraCard: {
    width: ERA_CARD_W,
    height: ERA_CARD_H,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  eraCardSelected: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    shadowColor: '#7f77d7',
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  eraCardFooter: {
    backgroundColor: 'rgba(30,30,30,0.56)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 2,
  },
  eraSeason: { fontSize: 8, color: '#a6a6a6' },
  eraTitle: { fontSize: 12, color: '#fff', fontWeight: '700' },
  eraBadge: { fontSize: 8, color: '#fff', fontWeight: '700' },
  timelineTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#333',
  },
  timelineFill: {
    height: '100%',
    backgroundColor: C.cyan,
    borderRadius: 2,
  },
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
  statsCard: {
    borderRadius: 12,
    overflow: 'hidden',
    padding: 12,
    minHeight: 180,
  },
  statsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
  },
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
  explicitBadge: {
    width: 16,
    height: 16,
    borderRadius: 3,
    backgroundColor: '#a6a6a6',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  exclusiveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    borderRadius: 12,
    backgroundColor: C.cyan,
    overflow: 'hidden',
  },
  exclusiveImg: {
    width: 150,
    height: 172,
    justifyContent: 'flex-end',
  },
  exclusiveImgRadius: { borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
  exclusiveImgCaption: { padding: 12 },
  exclusiveImgTitle: { ...typeHeadline(16), color: '#fff' },
  exclusiveImgDate: { fontSize: 12, color: '#fff', marginTop: 2 },
  exclusiveText: { flex: 1, gap: 12, paddingRight: 16 },
  exclusiveMilestone: { fontSize: 12, color: '#000', lineHeight: 14 },
  exclusiveBody: { ...typeHeadline(16), color: '#000', lineHeight: 20 },
  lyricRail: { gap: 12, paddingVertical: 6 },
  lyricRailCard: {
    width: 230,
    height: 272,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: '#000',
    overflow: 'hidden',
    padding: 18,
    justifyContent: 'space-between',
  },
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
  lyricStackArt: {
    width: 28,
    height: 28,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  lyricStackSong: { ...typeHeadline(15), color: '#a6a6a6', flexShrink: 1 },
  lyricStackText: { ...typeHeadline(14), color: '#fff', lineHeight: 18 },
  lyricStackTextFront: { ...typeHeadline(19), color: '#fff', lineHeight: 24 },
  lyricStackFans: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  lyricStackFansText: { fontSize: 11, color: '#fff' },
  playlistRail: { gap: 12 },
  playlistCard: { width: 173 },
  playlistArt: { width: 173, height: 173, borderRadius: 8, marginBottom: 5 },
  playlistTitle: { fontSize: 16, color: '#fff', fontWeight: '700' },
  firstPlayCard: {
    height: 105,
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 10,
  },
  firstPlayArt: { width: 81, height: 81, borderRadius: 4 },
  firstPlayEyebrow: { fontSize: 12, color: C.cyan, fontWeight: '700' },
  firstPlayTitle: { fontSize: 16, color: '#fff', fontWeight: '700' },
  firstPlayDate: { fontSize: 12, color: '#a6a6a6', marginTop: 2 },
  emptyTab: { alignItems: 'center', paddingTop: 48, paddingBottom: 80 },
  emptyTabText: { color: '#555', fontSize: 14 },
  merchGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  merchGridCard: { width: MERCH_CARD_W, gap: 8 },
  merchGridArt: { width: '100%', height: MERCH_CARD_W, borderRadius: 12, backgroundColor: '#161616' },
  merchGridTitle: { fontSize: 14, color: '#fff', fontWeight: '700', lineHeight: 18, minHeight: 36 },
  merchGridBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  merchGridPrice: { fontSize: 14, color: C.cyan, fontWeight: '700' },
  merchBuyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.cyan,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  merchBuyText: { fontSize: 12, color: '#06222a', fontWeight: '700' },
})
