import { useMemo, useState, useEffect } from 'react'
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
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { songs } from '../data/mockData'
import { albumArtAssets, artistAssets } from '../data/assetMap'
import { useProfiles } from '../context/ProfilesContext'
import {
  BTS_ERAS,
  BTS_FAVORITE_LYRICS,
  type BtsEraId,
} from '../data/btsPage'
import {
  BTS_SUPERFAN_MERCH,
  BTS_NEWS,
  BTS_TOP_TRACK,
  BTS_EXCLUSIVE_TRACK,
  BTS_SUPERFAN_STATS,
} from '../data/btsSuperFanContent'
import { getArtistAbout } from '../data/artistAbout'
import { usePlaybackState } from '../hooks/usePlaybackState'
import { useHannahJourney } from '../context/HannahJourneyContext'
import { useAdaptiveUI } from '../context/AdaptiveUIContext'
import { useAdaptiveMenu } from '../components/AdaptiveContextMenu'
import { C, typeHeadline } from '../theme'
import ArtistAboutTab from '../components/artist/ArtistAboutTab'
import BTSMusicTab from '../components/artist/BTSMusicTab'
import { ArtistEventsCard, ArtistMerchGrid } from '../components/artist/ArtistCommerce'
import LyricCardStack from '../components/artist/LyricCardStack'
import SuperfanGoldGlow from '../components/SuperfanGoldGlow'

const SCREEN_W = Platform.OS === 'web' ? Math.min(Dimensions.get('window').width, 402) : Dimensions.get('window').width
/** You & BTS sits right beside Music for every persona. */
const TABS = ['Music', 'You & BTS', 'Events', 'Merch', 'About'] as const
const ERA_CARD_W = 120
const ERA_CARD_H = 122
const MERCH_CARD_W = (SCREEN_W - 44) / 2

// Resolve art key to image source — album art first, then artist assets
function resolveArt(key?: string) {
  if (!key) return albumArtAssets['bts-proof-door'] ?? artistAssets['bts'] ?? null
  return albumArtAssets[key] ?? artistAssets[key] ?? albumArtAssets['bts-proof-door'] ?? null
}

export default function BTSArtistScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { playSongAt } = usePlaybackState()
  const { showConfirmation, activeTheme } = useAdaptiveUI()
  const { activeProfile } = useProfiles()
  // BTS is one of Hannah's Journey's "top artists" but doesn't have its own
  // scripted new/engaged/superfan arc (only Olivia does) — she sees a fixed
  // Engaged-tier "You & BTS" tab regardless of her Olivia stage, same way
  // Taylor Swift is a fixed Superfan for her. Every other persona (including
  // Erica, BTS's real superfan) keeps the existing full tab untouched.
  const { isHannahJourney } = useHannahJourney()
  const { open: openAdaptiveMenu } = useAdaptiveMenu()
  // Only a persona actually themed as a BTS superfan (Erica) gets the
  // "connected to BTS" signals (Since bubble + own avatar next to her
  // photo) — everyone else is a genuine new listener here and shouldn't see
  // a false connection, even though the rest of the page stays full-superfan.
  // "Create your own" profiles that picked BTS count too — they're a
  // declared superfan, so they earn the same connection signals.
  const isBTSFan =
    activeTheme?.id === 'bts-superfan' ||
    !!activeProfile.superfanArtistIds?.includes('bts')

  const [tab, setTab] = useState<(typeof TABS)[number]>('Music')
  const [selectedEraId, setSelectedEraId] = useState<BtsEraId>('love-yourself')
  const [following, setFollowing] = useState(true)

  const selectedEra = useMemo(
    () => BTS_ERAS.find(e => e.id === selectedEraId) ?? BTS_ERAS[3],
    [selectedEraId],
  )

  // Timeline progress — fills toward the selected era position
  const selectedEraIndex = BTS_ERAS.findIndex(e => e.id === selectedEraId)
  const timelineFillPct = ((selectedEraIndex + 1) / BTS_ERAS.length) * 100
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

  const btsSongs = useMemo(
    () => songs.filter(sg => sg.artistId === 'bts'),
    [],
  )
  const firstSong = btsSongs[0]

  const playBts = (songId?: string) => {
    const match = songId
      ? songs.find(s => s.id === songId)
      : firstSong
    if (match) {
      playSongAt(match.id)
      router.push('/now-playing')
    }
  }

  const shuffleBts = () => {
    if (btsSongs.length === 0) return
    const pick = btsSongs[Math.floor(Math.random() * btsSongs.length)]
    playSongAt(pick.id)
    showConfirmation('Shuffling BTS')
  }

  const showMenu = () => {
    openAdaptiveMenu({ kind: 'artist', artistId: 'bts', name: 'BTS', imageUri: 'bts-proof-door' })
  }

  const aboutData = getArtistAbout('bts')

  // Events and merch (reuse from ArtistCommerce pattern)
  const events = aboutData?.events ?? []
  const merch = [
    { title: 'Proof Anthology Box Set',    subtitle: 'Collector Edition', price: '$68', artKey: 'bts-proof' },
    { title: 'BE Vinyl LP',                subtitle: 'Limited Pressing',  price: '$45', artKey: 'bts-be' },
    { title: 'Army Bomb Lightstick Ver.4', subtitle: 'Official Merch',    price: '$52', artKey: 'bts-dynamite' },
    { title: 'Map of the Soul: 7 CD',      subtitle: 'Deluxe Edition',    price: '$32', artKey: 'bts-map-of-soul-7' },
    { title: 'Love Yourself Photobook',    subtitle: 'Answer Edition',    price: '$38', artKey: 'bts-love-yourself' },
    { title: 'Young Forever Tee',          subtitle: 'ARMY Exclusive',    price: '$30', artKey: 'bts-young-forever' },
  ]

  return (
    <View style={s.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <View style={s.heroWrap}>
          <ImageBackground
            source={artistAssets['bts-group']}
            style={s.heroBg}
            resizeMode="cover"
            // Web: RNW doesn't apply the inner img's absolute-fill inset, so force
            // it inline or the natural-size image spills under the page content.
            imageStyle={Platform.OS === 'web' ? ({ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' } as any) : undefined}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.1)', 'rgba(123,45,142,0.65)', 'rgba(58,24,112,0.94)', '#000']}
              locations={[0.3, 0.48, 0.72, 0.9, 1]}
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0)']}
              style={s.heroTopGradient}
            />

            <View style={[s.heroTopNav, { paddingTop: insets.top + 4 }]}>
              <TouchableOpacity onPress={() => router.back()} style={s.iconBtn} hitSlop={8}>
                <Ionicons name="chevron-back" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={s.iconBtn} hitSlop={8} onPress={showMenu}>
                <Ionicons name="options-outline" size={22} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={s.profileCluster}>
              <Image source={artistAssets['bts-alt']} style={s.artistAvatar} resizeMode="cover" />
              {isBTSFan && (
                <View style={s.userBubbleWrap}>
                  <View style={[s.userAvatar, !activeProfile.image && { backgroundColor: activeProfile.color }]}>
                    {activeProfile.image ? (
                      <Image source={activeProfile.image} style={s.userAvatarImg} resizeMode="cover" />
                    ) : (
                      <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>
                        {activeProfile.initial}
                      </Text>
                    )}
                  </View>
                  <View style={s.sinceBubble}>
                    <Ionicons name="heart" size={14} color="#fff" />
                    <Text style={s.sinceText}>Since {BTS_SUPERFAN_STATS.firstListenYear}</Text>
                  </View>
                </View>
              )}
            </View>

            <View style={s.heroMeta}>
              <Text style={s.heroName}>BTS</Text>
              <Text style={s.heroFollowers}>27M+ Followers</Text>
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
                <TouchableOpacity style={s.roundIconBtn} onPress={shuffleBts} hitSlop={8}>
                  <Ionicons name="shuffle" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={s.roundIconBtn} onPress={showMenu} hitSlop={8}>
                  <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={s.playBtn} onPress={() => playBts()} activeOpacity={0.85}>
                <Ionicons name="play" size={26} color="#000" style={{ marginLeft: 3 }} />
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>

        {/* ── Tab bar (sticky) ────────────────────────────────────────────── */}
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

        {/* ── Tab content ─────────────────────────────────────────────────── */}

        {tab === 'Music' && (
          <BTSMusicTab onPlay={playBts} />
        )}

        {tab === 'Events' && (
          <View style={s.content}>
            <ArtistEventsCard
              events={events.map(e => ({
                month: e.month,
                day: e.day,
                title: e.title,
                venue: e.venue,
                time: e.time,
              }))}
            />
          </View>
        )}

        {tab === 'Merch' && (
          <View style={s.content}>
            <View style={s.block}>
              <Text style={s.sectionTitle}>Official Merch</Text>
              <ArtistMerchGrid
                resolveArt={resolveArt}
                items={merch.map(m => ({
                  title: m.title,
                  subtitle: m.subtitle,
                  price: m.price,
                  artKey: m.artKey,
                }))}
              />
            </View>
          </View>
        )}

        {tab === 'About' && aboutData && (
          <ArtistAboutTab data={aboutData} artistName="BTS" artistId="bts" />
        )}

        {tab === 'You & BTS' && isHannahJourney && (
          <View style={s.content}>
            {/* Engaged-tier "You & BTS" — same shape as Ariana/Sabrina's
                Engaged template and Olivia's Hannah-Journey Engaged tab:
                a stat block, real favorite lyrics (BTS already has curated
                ones, unlike Ariana/Sabrina), and a "Where it started" card.
                No superfan banner/exclusive track/eras timeline/news/merch —
                those stay Erica-only below. */}
            <View style={s.block}>
              <Text style={s.sectionTitle}>Time You Spent Together</Text>
              <View style={s.statsRow}>
                <View style={s.statCard}>
                  <Text style={s.statNum}>410</Text>
                  <Text style={s.statLabel}>Minutes Listened</Text>
                </View>
                <View style={s.statCard}>
                  <Text style={s.statNum}>15</Text>
                  <Text style={s.statLabel}>Day Streak</Text>
                </View>
                <View style={s.statCard}>
                  <Text style={s.statNum}>#11</Text>
                  <Text style={s.statLabel}>Among Friends</Text>
                </View>
              </View>
            </View>

            <View style={s.block}>
              <Text style={s.sectionTitle}>Your Favorite Lyrics</Text>
              <LyricCardStack items={BTS_FAVORITE_LYRICS} resolveArt={resolveArt} />
            </View>

            <View style={s.block}>
              <Text style={s.sectionTitle}>Where It Started</Text>
              <View style={s.topTrackCard}>
                <Image source={resolveArt(BTS_TOP_TRACK.artKey)} style={s.topTrackArt} />
                <View style={s.topTrackMeta}>
                  <Text style={s.topTrackTitle}>{BTS_TOP_TRACK.title}</Text>
                  <Text style={s.topTrackSub}>BTS</Text>
                </View>
                <TouchableOpacity onPress={() => playBts(BTS_TOP_TRACK.songId)} style={s.topTrackPlay}>
                  <Ionicons name="play-circle" size={40} color={C.cyan} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {tab === 'You & BTS' && !isHannahJourney && (
          <View style={s.content}>

            {/* ── Superfan badge ────────────────────────────────────────── */}
            <View style={s.superfanBanner}>
              <LinearGradient
                colors={['#4a1a72', '#1c0a38']}
                style={StyleSheet.absoluteFill}
              />
              <View style={s.superfanBadge}>
                <Ionicons name="star" size={16} color="#f0c744" />
                <Text style={s.superfanBadgeText}>SUPERFAN</Text>
              </View>
              <Text style={s.superfanPercent}>{BTS_SUPERFAN_STATS.topPercentLabel}</Text>
              <Text style={s.superfanDesc}>
                You're one of the most dedicated ARMY on Amazon Music
              </Text>
              <View style={s.superfanStatsRow}>
                <View style={s.superfanStat}>
                  <Text style={s.superfanStatNum}>{BTS_SUPERFAN_STATS.totalPlays.toLocaleString()}</Text>
                  <Text style={s.superfanStatLabel}>Total Streams</Text>
                </View>
                <View style={s.superfanStatDivider} />
                <View style={s.superfanStat}>
                  <Text style={s.superfanStatNum}>{BTS_SUPERFAN_STATS.streakDays}</Text>
                  <Text style={s.superfanStatLabel}>Day Streak</Text>
                </View>
                <View style={s.superfanStatDivider} />
                <View style={s.superfanStat}>
                  <Text style={s.superfanStatNum}>{BTS_SUPERFAN_STATS.erasBadgeLabel}</Text>
                  <Text style={s.superfanStatLabel}>Eras Badge</Text>
                </View>
              </View>
              <SuperfanGoldGlow borderRadius={16} />
            </View>

            {/* ── Exclusive For You ─────────────────────────────────────── */}
            <View style={s.block}>
              <Text style={s.sectionTitle}>Exclusive For You</Text>
              <TouchableOpacity style={s.exclusiveCard} onPress={() => playBts(BTS_EXCLUSIVE_TRACK.songId)} activeOpacity={0.85}>
                <ImageBackground
                  source={resolveArt(BTS_EXCLUSIVE_TRACK.artKey)}
                  style={s.exclusiveImg}
                  imageStyle={s.exclusiveImgRadius}
                  resizeMode="cover"
                >
                  <LinearGradient
                    colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.94)']}
                    locations={[0.45, 1]}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={s.exclusiveImgCaption}>
                    <Text style={s.exclusiveImgTitle} numberOfLines={2}>
                      {BTS_EXCLUSIVE_TRACK.title}
                    </Text>
                    <Text style={s.exclusiveImgSub}>{BTS_EXCLUSIVE_TRACK.subtitle}</Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            </View>

            {/* ── Your top track ────────────────────────────────────────── */}
            <View style={s.block}>
              <Text style={s.sectionTitle}>Your #1 Most Played</Text>
              <View style={s.topTrackCard}>
                <Image source={resolveArt(BTS_TOP_TRACK.artKey)} style={s.topTrackArt} />
                <View style={s.topTrackMeta}>
                  <Text style={s.topTrackTitle}>{BTS_TOP_TRACK.title}</Text>
                  <Text style={s.topTrackSub}>BTS</Text>
                  <View style={s.topTrackCountRow}>
                    <Ionicons name="musical-note" size={13} color={C.cyan} />
                    <Text style={s.topTrackCount}>{BTS_TOP_TRACK.playCount} plays</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => playBts(BTS_TOP_TRACK.songId)} style={s.topTrackPlay}>
                  <Ionicons name="play-circle" size={40} color={C.cyan} />
                </TouchableOpacity>
              </View>
            </View>

            {/* ── Your Eras Timeline ────────────────────────────────────── */}
            <View style={s.block}>
              <Text style={s.sectionTitle}>Your Eras</Text>
              <Text style={s.sectionSub}>A journey through your BTS story</Text>

              {/* Timeline rail */}
              <View style={s.eraTimeline}>
                <View style={s.timelineTrack}>
                  <Animated.View style={[s.timelineFill, timelineFillStyle]} />
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.eraScroll}>
                  {BTS_ERAS.map(era => {
                    const active = era.id === selectedEraId
                    return (
                      <TouchableOpacity
                        key={era.id}
                        style={[s.eraCard, active && s.eraCardActive]}
                        onPress={() => setSelectedEraId(era.id)}
                        activeOpacity={0.8}
                      >
                        <Image source={resolveArt(era.eraImageKey)} style={s.eraCardImg} />
                        <LinearGradient
                          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.75)']}
                          style={StyleSheet.absoluteFill}
                        />
                        <Text style={s.eraCardSeason}>{era.season}</Text>
                        <Text style={s.eraCardTitle} numberOfLines={2}>{era.title}</Text>
                        {active && <View style={s.eraActiveDot} />}
                      </TouchableOpacity>
                    )
                  })}
                </ScrollView>
              </View>

              {/* Selected era detail */}
              {selectedEra && (
                <View style={s.eraDetail}>
                  <View style={s.eraDetailBadge}>
                    <Text style={s.eraDetailBadgeText}>{selectedEra.badge}</Text>
                  </View>
                  <Text style={s.eraDetailDesc}>{selectedEra.description}</Text>

                  <View style={s.eraTopTrack}>
                    <Text style={s.eraTopTrackLabel}>Top track that era</Text>
                    <View style={s.eraTopTrackRow}>
                      <Image source={resolveArt(selectedEra.topTrack.artKey)} style={s.eraTopTrackArt} />
                      <View style={s.eraTopTrackMeta}>
                        <Text style={s.eraTopTrackTitle}>{selectedEra.topTrack.title}</Text>
                        <Text style={s.eraTopTrackPlays}>Played {selectedEra.topTrack.plays}x</Text>
                      </View>
                      <TouchableOpacity onPress={() => playBts()} hitSlop={8}>
                        <Ionicons name="play-circle-outline" size={30} color={C.cyan} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={s.eraAlsoLabel}>Also played then</Text>
                  <View style={s.eraAlsoRow}>
                    {selectedEra.playedThen.map((t, i) => (
                      <View key={i} style={s.eraAlsoCard}>
                        <Image source={resolveArt(t.artKey)} style={s.eraAlsoArt} />
                        <Text style={s.eraAlsoTitle} numberOfLines={2}>{t.title}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* ── Favorite Lyrics ──────────────────────────────────────── */}
            <View style={s.block}>
              <View style={s.lyricHeadRow}>
                <Text style={s.sectionTitle}>Your Favorite Lyrics</Text>
                <TouchableOpacity onPress={() => router.push('/artist-lyrics/bts' as any)}>
                  <Text style={s.lyricSeeMore}>SEE MORE</Text>
                </TouchableOpacity>
              </View>
              <LyricCardStack items={BTS_FAVORITE_LYRICS} resolveArt={resolveArt} />
            </View>

            {/* ── News ─────────────────────────────────────────────────── */}
            <View style={s.block}>
              <Text style={s.sectionTitle}>Latest News</Text>
              <View style={s.newsCard}>
                <LinearGradient
                  colors={['#1c0a38', '#4a1a72']}
                  style={StyleSheet.absoluteFill}
                />
                <View style={s.newsDot} />
                <Text style={s.newsHeadline}>{BTS_NEWS.headline}</Text>
                <Text style={s.newsBody}>{BTS_NEWS.body}</Text>
                <Text style={s.newsDate}>{BTS_NEWS.date}</Text>
              </View>
            </View>

            {/* ── Superfan merch ───────────────────────────────────────── */}
            <View style={s.block}>
              <Text style={s.sectionTitle}>Superfan Picks</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.superfanMerchRow}>
                {BTS_SUPERFAN_MERCH.map(item => (
                  <TouchableOpacity key={item.id} style={s.superfanMerchCard} activeOpacity={0.8}>
                    <Image source={resolveArt(item.artKey)} style={s.superfanMerchArt} />
                    <Text style={s.superfanMerchLabel} numberOfLines={2}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

          </View>
        )}
      </ScrollView>
    </View>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const GREY = '#a6a6a6'

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },

  // Hero
  heroWrap: { height: 420, overflow: 'hidden' },
  heroBg: { flex: 1, justifyContent: 'flex-end' },
  heroTopGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 100 },
  heroTopNav: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  profileCluster: { position: 'absolute', left: 16, bottom: 148, flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  artistAvatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
  userBubbleWrap: { gap: 6, marginBottom: 4 },
  userAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  userAvatarImg: { width: '100%', height: '100%' },
  sinceBubble: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  sinceText: { fontSize: 11, color: '#fff' },
  heroMeta: { paddingHorizontal: 16, marginBottom: 12 },
  heroName: { fontSize: 28, fontWeight: '800', color: '#fff' },
  heroFollowers: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  controlPanel: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 20 },
  controlLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  followBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  followingBtn: { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: C.cyan },
  followBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  roundIconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  playBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },

  // Tab bar
  tabBar: { backgroundColor: '#000', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#222' },
  tabRow: { paddingHorizontal: 8, gap: 4 },
  tabItem: { paddingHorizontal: 12, paddingVertical: 12 },
  tabText: { fontSize: 14, color: GREY },
  tabTextActive: { color: '#fff', fontWeight: '700' },
  tabUnderline: { position: 'absolute', bottom: 0, left: 12, right: 12, height: 2, backgroundColor: C.cyan, borderRadius: 1 },

  // Shared content wrapper
  content: { paddingTop: 20, paddingHorizontal: 16 },
  block: { marginBottom: 28 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 4 },
  sectionSub: { fontSize: 13, color: GREY, marginBottom: 12 },

  // Superfan banner
  superfanBanner: { overflow: 'hidden', borderRadius: 16, padding: 20, marginBottom: 24 },
  superfanBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  superfanBadgeText: { fontSize: 11, fontWeight: '800', color: '#f0c744', letterSpacing: 1.2 },
  superfanPercent: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  superfanDesc: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 16 },
  superfanStatsRow: { flexDirection: 'row', alignItems: 'center' },
  superfanStat: { flex: 1, alignItems: 'center' },
  superfanStatNum: { fontSize: 15, fontWeight: '700', color: '#fff' },
  superfanStatLabel: { fontSize: 11, color: GREY, marginTop: 2 },
  superfanStatDivider: { width: StyleSheet.hairlineWidth, height: 32, backgroundColor: '#444' },

  // Exclusive card
  exclusiveCard: { borderRadius: 14, overflow: 'hidden' },
  exclusiveImg: { height: 180, justifyContent: 'flex-end' },
  exclusiveImgRadius: { borderRadius: 14 },
  exclusiveImgCaption: { padding: 14 },
  exclusiveImgTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
  exclusiveImgSub: { fontSize: 11, color: C.cyan, marginTop: 4 },

  // Top track
  topTrackCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#0e0e0e', borderRadius: 12, padding: 14 },
  topTrackArt: { width: 60, height: 60, borderRadius: 8 },
  topTrackMeta: { flex: 1 },
  topTrackTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
  topTrackSub: { fontSize: 12, color: GREY, marginTop: 2 },
  topTrackCountRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  topTrackCount: { fontSize: 12, color: C.cyan },
  topTrackPlay: {},

  // Era timeline
  eraTimeline: { marginBottom: 16 },
  timelineTrack: { height: 2, backgroundColor: '#222', borderRadius: 1, marginHorizontal: 4, marginBottom: 12 },
  timelineFill: { height: '100%', backgroundColor: C.cyan, borderRadius: 1 },
  eraScroll: { gap: 10, paddingBottom: 4 },
  eraCard: { width: ERA_CARD_W, height: ERA_CARD_H, borderRadius: 10, overflow: 'hidden', justifyContent: 'flex-end', padding: 8, borderWidth: 1, borderColor: 'transparent' },
  eraCardActive: { borderColor: C.cyan },
  eraCardImg: { ...StyleSheet.absoluteFillObject },
  eraCardSeason: { fontSize: 9, color: 'rgba(255,255,255,0.6)', fontWeight: '600', letterSpacing: 0.5 },
  eraCardTitle: { fontSize: 11, color: '#fff', fontWeight: '700', marginTop: 2 },
  eraActiveDot: { position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: 3.5, backgroundColor: C.cyan },
  eraDetail: { backgroundColor: '#0c0c0c', borderRadius: 14, padding: 16 },
  eraDetailBadge: { alignSelf: 'flex-start', marginBottom: 8 },
  eraDetailBadgeText: { fontSize: 12, color: C.cyan, fontWeight: '700' },
  eraDetailDesc: { fontSize: 13, color: '#ccc', lineHeight: 20, marginBottom: 16 },
  eraTopTrack: { marginBottom: 16 },
  eraTopTrackLabel: { fontSize: 11, color: GREY, marginBottom: 8 },
  eraTopTrackRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  eraTopTrackArt: { width: 44, height: 44, borderRadius: 6 },
  eraTopTrackMeta: { flex: 1 },
  eraTopTrackTitle: { fontSize: 13, color: '#fff', fontWeight: '600' },
  eraTopTrackPlays: { fontSize: 11, color: C.cyan, marginTop: 2 },
  eraAlsoLabel: { fontSize: 11, color: GREY, marginBottom: 10 },
  eraAlsoRow: { flexDirection: 'row', gap: 10 },
  eraAlsoCard: { flex: 1, alignItems: 'center' },
  eraAlsoArt: { width: '100%', aspectRatio: 1, borderRadius: 6 },
  eraAlsoTitle: { fontSize: 10, color: '#aaa', textAlign: 'center', marginTop: 4 },

  // Lyrics — card stack itself now lives in the shared <LyricCardStack />
  lyricHeadRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  lyricSeeMore: { fontSize: 12, color: C.cyan },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, backgroundColor: '#0e0e0e', borderRadius: 12, padding: 14, alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 10, color: GREY, textAlign: 'center', marginTop: 4 },

  // News
  newsCard: { borderRadius: 14, padding: 18, overflow: 'hidden' },
  newsDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.cyan, marginBottom: 10 },
  newsHeadline: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 6 },
  newsBody: { fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 20, marginBottom: 10 },
  newsDate: { fontSize: 11, color: GREY },

  // Superfan merch
  superfanMerchRow: { gap: 12, paddingVertical: 4 },
  superfanMerchCard: { width: 130 },
  superfanMerchArt: { width: 130, height: 130, borderRadius: 10 },
  superfanMerchLabel: { fontSize: 12, color: '#ddd', marginTop: 6, lineHeight: 16 },
})
