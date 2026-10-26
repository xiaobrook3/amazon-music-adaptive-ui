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
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Rect } from 'react-native-svg'
import { useRouter } from 'expo-router'
import { safeGoBack } from '../utils/navigation'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { songs } from '../data/mockData'
import { albumArtAssets, artistAssets, hannahJourneyAssets } from '../data/assetMap'

// Same real Taylor hero-card background used on Insights (app/insights.tsx
// SUPERFAN_HERO_CARDS 'taylor' entry) — reused here rather than a new asset.
const heroBgTaylor = require('../../assets/hannah-journey/insights-superfan-hero-bg-taylor.png')
import { useProfiles } from '../context/ProfilesContext'
import { useHannahJourney } from '../context/HannahJourneyContext'
import {
  TAYLOR_ERAS,
  TAYLOR_FAVORITE_LYRICS,
  TAYLOR_JOURNEY_STATS,
  TAYLOR_ERA_PLAYLISTS,
  type TaylorEraId,
} from '../data/taylorSwiftPage'
import {
  TAYLOR_SUPERFAN_MERCH,
  TAYLOR_NEWS,
  TAYLOR_EXCLUSIVE_TRACK,
  TAYLOR_SUPERFAN_STATS,
} from '../data/taylorSuperFanContent'
import { getArtistAbout } from '../data/artistAbout'
import { usePlaybackState } from '../hooks/usePlaybackState'
import { useAdaptiveUI } from '../context/AdaptiveUIContext'
import { useAdaptiveMenu } from '../components/AdaptiveContextMenu'
import { C, typeHeadline, FONT_FAMILY_EMBER, FONT_FAMILY_DISPLAY } from '../theme'
import ArtistAboutTab from '../components/artist/ArtistAboutTab'
import TaylorMusicTab from '../components/artist/TaylorMusicTab'
import { ArtistEventsCard, ArtistMerchGrid } from '../components/artist/ArtistCommerce'
import LyricCardStack from '../components/artist/LyricCardStack'
import SuperfanGoldGlow from '../components/SuperfanGoldGlow'

const SCREEN_W = Platform.OS === 'web' ? Math.min(Dimensions.get('window').width, 402) : Dimensions.get('window').width
/** You & Taylor sits right beside Music for every persona. */
const TABS = ['Music', 'You & Taylor', 'Events', 'Merch', 'About'] as const
const ERA_CARD_W = 120
const ERA_CARD_H = 122
const ERA_RAIL_GAP = 12
const HJ_ERA_CARD_H = 166
const MERCH_CARD_W = (SCREEN_W - 44) / 2

// Resolve art key to image source — album art first, then artist assets
function resolveArt(key?: string) {
  if (!key) return albumArtAssets['tswift-1'] ?? artistAssets['tswift'] ?? null
  return albumArtAssets[key] ?? artistAssets[key] ?? albumArtAssets['tswift-1'] ?? null
}

export default function TaylorSwiftArtistScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { playSongAt } = usePlaybackState()
  const { showConfirmation, activeTheme } = useAdaptiveUI()
  const { activeProfile } = useProfiles()
  const { open: openAdaptiveMenu } = useAdaptiveMenu()
  // Only a persona actually themed as a Taylor superfan (Hannah, Brooke) gets
  // the "connected to Taylor" signals (Since bubble + own avatar next to her
  // photo) — everyone else is a genuine new listener here and shouldn't see
  // a false connection, even though the rest of the page stays full-superfan.
  // "Create your own" profiles that picked Taylor count too — they're a
  // declared superfan of her, so they earn the same connection signals.
  const isTaylorFan =
    activeTheme?.id === 'taylor-swift-superfan' ||
    !!activeProfile.superfanArtistIds?.includes('tswift')
  // Hannah Journey is a Taylor Swift superfan from the very start (no
  // new→engaged→superfan arc like Olivia's) — gates the Figma Hannah Journey
  // hero/tab treatment on top of the generic isTaylorFan superfan content
  // Brooke and the original `hannah` persona already see.
  const { isHannahJourney } = useHannahJourney()

  const [tab, setTab] = useState<(typeof TABS)[number]>('Music')
  // Reset the page scroll position on every tab switch — otherwise arriving
  // on a shorter tab from a taller one leaves the ScrollView at its old
  // offset, reading as a dead black gap at the bottom instead of clamping.
  const pageScrollRef = useRef<ScrollView>(null)
  const [selectedEraId, setSelectedEraId] = useState<TaylorEraId>('lover')
  const [following, setFollowing] = useState(true)
  // Gradient border ring size for the Hannah Journey "Super Fan" pill — same
  // onLayout-measured-SVG-stroke technique as Olivia's superFanBtn, so the
  // pill's pink→lavender→blue gradient border matches hers exactly instead of
  // a plain solid cyan border.
  const [superFanBtnSize, setSuperFanBtnSize] = useState({ width: 0, height: 0 })

  const selectedEra = useMemo(
    () => TAYLOR_ERAS.find(e => e.id === selectedEraId) ?? TAYLOR_ERAS[4],
    [selectedEraId],
  )

  // Timeline progress — fills toward the selected era position
  const selectedEraIndex = TAYLOR_ERAS.findIndex(e => e.id === selectedEraId)
  const timelineFillPct = ((selectedEraIndex + 1) / TAYLOR_ERAS.length) * 100
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

  const tswiftSongs = useMemo(
    () => songs.filter(sg => sg.artistId === 'tswift'),
    [],
  )
  const firstSong = tswiftSongs[0]

  const playTaylor = (songId?: string) => {
    const match = songId
      ? songs.find(s => s.id === songId)
      : firstSong
    if (match) {
      playSongAt(match.id)
      router.push('/now-playing')
    }
  }

  const shuffleTaylor = () => {
    if (tswiftSongs.length === 0) return
    const pick = tswiftSongs[Math.floor(Math.random() * tswiftSongs.length)]
    playSongAt(pick.id)
    showConfirmation('Shuffling Taylor Swift')
  }

  const showMenu = () => {
    openAdaptiveMenu({ kind: 'artist', artistId: 'tswift', name: 'Taylor Swift', imageUri: 'ts-showgirl' })
  }

  const aboutData = getArtistAbout('tswift')

  // Events and merch (reuse from ArtistCommerce pattern)
  const events = aboutData?.events ?? []
  const merch = [
    { title: "reputation Vinyl",          subtitle: "Taylor's Version", price: '$45', artKey: 'ts-reputation' },
    { title: "folklore LP",               subtitle: 'Limited Edition', price: '$42', artKey: 'ts-1989-polaroid' },
    { title: "Eras Tour Tee",             subtitle: 'Official Merch', price: '$40', artKey: 'ts-showgirl' },
    { title: "TTPD Signed Anthology",     subtitle: 'Signed by Taylor', price: '$55', artKey: 'ts-tortured-poets' },
    { title: "Lover Era Hoodie",          subtitle: 'Limited Run', price: '$68', artKey: 'ts-lover' },
    { title: "1989 (TV) Signed CD",       subtitle: "Taylor's Version", price: '$28', artKey: 'ts-1989' },
  ]

  return (
    <View style={s.screen}>
      <ScrollView
        ref={pageScrollRef}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <View style={s.heroWrap}>
          <ImageBackground
            source={artistAssets['tswift-1']}
            style={s.heroBg}
            resizeMode="cover"
            alt=""
            // Web: RNW doesn't apply the inner img's absolute-fill inset, so force
            // it inline or the natural-size image spills under the page content.
            imageStyle={Platform.OS === 'web' ? ({ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' } as any) : undefined}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.1)', 'rgba(30,60,25,0.7)', 'rgba(10,26,8,0.96)', '#000']}
              locations={[0.3, 0.48, 0.72, 0.9, 1]}
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0)']}
              style={s.heroTopGradient}
            />

            <View style={[s.heroTopNav, { paddingTop: insets.top + 4 }]}>
              <TouchableOpacity onPress={() => safeGoBack(router)} style={s.iconBtn} hitSlop={8}>
                <Ionicons name="chevron-back" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={s.iconBtn} hitSlop={8} onPress={showMenu}>
                {isHannahJourney ? (
                  // Same corrected solid-funnel glyph as Olivia's Hannah Journey hero
                  // (hannahJourneyAssets.filterIcon) — not the Ionicons outline stand-in.
                  <Image source={hannahJourneyAssets.filterIcon} style={s.filterIconHJ} resizeMode="contain" />
                ) : (
                  <Ionicons name="options-outline" size={22} color="#fff" />
                )}
              </TouchableOpacity>
            </View>

            <View style={s.profileCluster}>
              <Image source={albumArtAssets['tswift-1']} style={s.artistAvatar} resizeMode="cover" />
              {(isHannahJourney || isTaylorFan) && (
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
                  {/* Non-HJ since-pill, unchanged: stacked under the avatar via this
                      wrap's flex layout. Hannah Journey gets the standalone
                      absolutely-positioned bubble below instead (Figma node
                      2740-29136), matching Olivia's hero exactly. */}
                  {!isHannahJourney && (
                    <View style={s.sinceBubble}>
                      <Ionicons name="heart" size={14} color="#fff" />
                      <Text style={s.sinceText}>Since {TAYLOR_SUPERFAN_STATS.firstListenYear}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
            {/* Hannah Journey "following bubble" — positioned independently of
                profileCluster/userBubbleWrap (Taylor's hero uses an older flex-row
                layout for those, left untouched for other personas) at the same
                Figma-absolute hero coordinates Olivia's uses: left 109/top 187.
                Solid pink fill, no border, plus a 2-circle speech-bubble tail
                pointing at the user avatar. */}
            {isHannahJourney && (
              <View style={s.followingBubbleHJWrap}>
                <View style={s.followingBubbleTailBig} />
                <View style={s.followingBubbleTailSmall} />
                <View style={[s.sinceBubble, s.sinceBubbleHJ, { backgroundColor: '#DE909C' }]}>
                  <Image
                    source={hannahJourneyAssets.sinceBubbleHeart}
                    style={s.sinceBubbleIconHJ}
                    resizeMode="contain"
                  />
                  <Text style={[s.sinceText, s.sinceTextHJ]}>Since {TAYLOR_SUPERFAN_STATS.firstListenYear}</Text>
                </View>
              </View>
            )}

            <View style={s.heroMeta}>
              <Text style={s.heroName}>Taylor Swift</Text>
              {/* Figma hero (node 2576-38587): follower count is 14px — mirrors the
                  same HJ-gated correction made on Olivia's hero. */}
              <Text style={[s.heroFollowers, isHannahJourney && s.heroFollowersHJ]}>82M+ Followers</Text>
            </View>

            <View style={s.controlPanel}>
              <View style={s.controlLeft}>
                {isHannahJourney ? (
                  // Figma Hannah Journey "Super Fan" pill — matches Olivia's superFanBtn
                  // treatment exactly (plain cyan border, no fill) and is non-interactive:
                  // Hannah is always a Taylor superfan, so there's no Follow/Following toggle.
                  <TouchableOpacity
                    style={[s.followBtn, s.superFanBtn]}
                    activeOpacity={1}
                    onLayout={e => {
                      const { width, height } = e.nativeEvent.layout
                      setSuperFanBtnSize({ width, height })
                    }}
                  >
                    {/* Gradient border ring: SVG stroke (not a filled plate) so the
                        button's transparent fill is untouched — matches Olivia's
                        superFanBtn treatment exactly (pink → lavender → blue). */}
                    {superFanBtnSize.width > 0 && superFanBtnSize.height > 0 && (
                      <Svg
                        style={StyleSheet.absoluteFill}
                        width={superFanBtnSize.width}
                        height={superFanBtnSize.height}
                        pointerEvents="none"
                      >
                        <Defs>
                          <SvgLinearGradient
                            id="taylorSuperFanBorderGrad"
                            x1="0"
                            y1="0.6063"
                            x2="1"
                            y2="0.3937"
                          >
                            <Stop offset="0.0273" stopColor="#DE909C" />
                            <Stop offset="0.5741" stopColor="#A6A0C7" />
                            <Stop offset="1" stopColor="#6DAFF1" />
                          </SvgLinearGradient>
                        </Defs>
                        <Rect
                          x={1}
                          y={1}
                          width={Math.max(superFanBtnSize.width - 2, 0)}
                          height={Math.max(superFanBtnSize.height - 2, 0)}
                          rx={19}
                          ry={19}
                          fill="none"
                          stroke="url(#taylorSuperFanBorderGrad)"
                          strokeWidth={2}
                        />
                      </Svg>
                    )}
                    <Image
                      source={hannahJourneyAssets.superfanFollowHeart}
                      style={s.superFanHeartIcon}
                      resizeMode="contain"
                    />
                    <Text style={[s.followBtnText, s.followBtnTextEmber]}>Super Fan</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => setFollowing(!following)}
                    style={[s.followBtn, following && s.followingBtn]}
                  >
                    <Ionicons name="heart" size={16} color={following ? C.cyan : '#fff'} />
                    <Text style={s.followBtnText}>{following ? 'Following' : 'Follow'}</Text>
                  </TouchableOpacity>
                )}
                {/* Figma HJ order: Super Fan/Follow + more | shuffle + play */}
                {!isHannahJourney && (
                  <TouchableOpacity style={s.roundIconBtn} onPress={shuffleTaylor} hitSlop={8}>
                    <Ionicons name="shuffle" size={20} color="#fff" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={s.roundIconBtn} onPress={showMenu} hitSlop={8} accessibilityRole="button" accessibilityLabel="More options">
                  <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
              <View style={isHannahJourney ? s.controlRight : undefined}>
                {isHannahJourney && (
                  <TouchableOpacity style={s.roundIconBtn} onPress={shuffleTaylor} hitSlop={8}>
                    <Ionicons name="shuffle" size={20} color="#fff" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={s.playBtn} onPress={() => playTaylor()} activeOpacity={0.85}>
                  <Ionicons name="play" size={26} color="#000" style={{ marginLeft: 3 }} />
                </TouchableOpacity>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* ── Tab bar (sticky) ────────────────────────────────────────────── */}
        <View style={s.tabBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[s.tabRow, isHannahJourney && s.tabRowHJ]}>
            {TABS.map(t => (
              <TouchableOpacity
                key={t}
                onPress={() => {
                  setTab(t)
                  pageScrollRef.current?.scrollTo({ y: 0, animated: false })
                }}
                style={s.tabItem}
                accessibilityRole="button"
                accessibilityState={{ selected: tab === t }}
              >
                <Text style={[s.tabText, tab === t && s.tabTextActive, isHannahJourney && s.tabTextHJ]}>{t}</Text>
                {tab === t && <View style={s.tabUnderline} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Tab content ─────────────────────────────────────────────────── */}

        {tab === 'Music' && (
          <TaylorMusicTab onPlay={playTaylor} />
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
          <ArtistAboutTab data={aboutData} artistName="Taylor Swift" artistId="tswift" />
        )}

        {tab === 'You & Taylor' && (
          <View style={s.content}>

            {/* ── Superfan hero card — Hannah Journey only ─────────────────
                Matches Olivia's HannahJourneyYouAndOlivia.tsx glass hero
                exactly (same pink→lavender→blue gradient, same copy shape)
                instead of the gold "SUPERFAN" badge banner every other
                persona sees below. */}
            {isHannahJourney && (
              <View style={s.hjHeroOuter}>
                {/* Real Taylor hero card — same gold→blue gradient, background
                    photo, and copy already established for her on the Insights
                    "Superfan highlights" row (app/insights.tsx SUPERFAN_HERO_CARDS
                    'taylor' entry), not Olivia's pink/lavender/blue palette. */}
                <LinearGradient
                  colors={['#fae6bf', '#008ef3']}
                  style={s.hjHeroPlate}
                />
                <View style={s.hjHeroGlass}>
                  <ImageBackground source={heroBgTaylor} style={s.hjHeroInner} imageStyle={{ borderRadius: 16 }} resizeMode="cover" alt="">
                    <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.32)']} style={StyleSheet.absoluteFill} />
                    <View style={s.hjHeroTop}>
                      <View style={s.hjHeroBadgeRow}>
                        <Image source={hannahJourneyAssets.superfanIcon} style={s.hjHeroBadgeIcon} resizeMode="contain" />
                        <Text style={s.hjHeroBadgeText}>Superfan</Text>
                      </View>
                      <Text style={s.hjHeroSince}>Since March 2023</Text>
                    </View>
                    <View style={s.hjHeroBottom}>
                      <View>
                        <Text style={s.hjHeroHeadline}>Top 1% Listener</Text>
                        <Text style={s.hjHeroSub}>among 4M+ listeners</Text>
                      </View>
                      <TouchableOpacity style={s.hjHeroShare} activeOpacity={0.8}>
                        <Ionicons name="share-outline" size={14} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </ImageBackground>
                </View>
              </View>
            )}

            {/* ── Superfan badge — every other persona ─────────────────── */}
            {!isHannahJourney && (
              <View style={s.superfanBanner}>
                <LinearGradient
                  colors={['#1e4a20', '#0a1c0a']}
                  style={StyleSheet.absoluteFill}
                />
                <View style={s.superfanBadge}>
                  <Ionicons name="star" size={16} color="#f0c744" />
                  <Text style={s.superfanBadgeText}>SUPERFAN</Text>
                </View>
                <Text style={s.superfanPercent}>{TAYLOR_SUPERFAN_STATS.topPercentLabel}</Text>
                <Text style={s.superfanDesc}>
                  You're one of the most dedicated Swifties on Amazon Music
                </Text>
                <View style={s.superfanStatsRow}>
                  <View style={s.superfanStat}>
                    <Text style={s.superfanStatNum}>{TAYLOR_SUPERFAN_STATS.totalPlays.toLocaleString()}</Text>
                    <Text style={s.superfanStatLabel}>Total Streams</Text>
                  </View>
                  <View style={s.superfanStatDivider} />
                  <View style={s.superfanStat}>
                    <Text style={s.superfanStatNum}>{TAYLOR_SUPERFAN_STATS.streakDays}</Text>
                    <Text style={s.superfanStatLabel}>Day Streak</Text>
                  </View>
                  <View style={s.superfanStatDivider} />
                  <View style={s.superfanStat}>
                    <Text style={s.superfanStatNum}>{TAYLOR_SUPERFAN_STATS.erasBadgeLabel}</Text>
                    <Text style={s.superfanStatLabel}>Eras Badge</Text>
                  </View>
                </View>
                <SuperfanGoldGlow borderRadius={16} />
              </View>
            )}

            {/* Exclusive For You — not on Olivia's HJ-superfan page, every other persona only.
                Web build only: the case study this export is embedded in says tiers change recognition and order, not access, so the gated section does not ship there. Native is unchanged. */}
            {Platform.OS !== 'web' && !isHannahJourney && (
              <View style={s.block}>
                <Text style={s.sectionTitle}>Exclusive For You</Text>
                <TouchableOpacity style={s.exclusiveCard} onPress={() => playTaylor(TAYLOR_EXCLUSIVE_TRACK.songId)} activeOpacity={0.85}>
                  <ImageBackground
                    source={resolveArt(TAYLOR_EXCLUSIVE_TRACK.artKey)}
                    style={s.exclusiveImg}
                    imageStyle={s.exclusiveImgRadius}
                    resizeMode="cover"
                    alt=""
                  >
                    <LinearGradient
                      colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.94)']}
                      locations={[0.45, 1]}
                      style={StyleSheet.absoluteFill}
                    />
                    <View style={s.exclusiveImgCaption}>
                      <Text style={s.exclusiveImgTitle} numberOfLines={2}>
                        {TAYLOR_EXCLUSIVE_TRACK.title}
                      </Text>
                      <Text style={s.exclusiveImgSub}>{TAYLOR_EXCLUSIVE_TRACK.subtitle}</Text>
                    </View>
                  </ImageBackground>
                </TouchableOpacity>
              </View>
            )}

            {/* "Your #1 Most Played" was removed here — that claim now lives
                only in the All Time Favorite section on the You & Artist tab. */}

            {/* ── Your Eras — Hannah Journey gets Olivia's card+dot-timeline
                carousel (same component shape as HannahJourneyYouAndOlivia.tsx's
                "Your Journey with Olivia", just Taylor's 7 real eras instead of
                4); every other persona keeps the original progress-bar rail. ── */}
            {isHannahJourney ? (
              <View style={s.block}>
                <Text style={s.sectionTitle}>Your Eras</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hjEraRailScroll}>
                  <View>
                    <View style={s.hjEraRail}>
                      {TAYLOR_ERAS.map((era, i) => {
                        const selected = era.id === selectedEraId
                        // Card 0 (showgirl, the newest/"current" era) always carries
                        // the glow, mirroring Olivia's girl-in-love treatment.
                        const glow = i === 0 || selected
                        return (
                          <TouchableOpacity
                            key={era.id}
                            activeOpacity={0.85}
                            onPress={() => setSelectedEraId(era.id)}
                            style={[s.hjEraCard, glow && s.hjEraCardGlow, selected && s.hjEraCardSelectedBorder]}
                          >
                            <Image source={resolveArt(era.eraImageKey)} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
                            {!selected && <View style={s.hjEraCardDim} />}
                            <LinearGradient
                              colors={['rgba(102,102,102,0)', 'rgba(0,0,0,0.6)']}
                              style={StyleSheet.absoluteFill}
                            />
                            {i === 0 && (
                              <Image source={hannahJourneyAssets.superfanIcon} style={s.hjEraCardCrest} resizeMode="contain" />
                            )}
                            <View style={s.hjEraCaption}>
                              <Text style={s.hjEraSeason} numberOfLines={1}>{era.season}</Text>
                              <Text style={s.hjEraTitle} numberOfLines={1} ellipsizeMode="tail">{era.title}</Text>
                              <Text style={s.hjEraBadge}>{era.badge}</Text>
                            </View>
                          </TouchableOpacity>
                        )
                      })}
                    </View>
                    <View style={s.hjEraTimeline}>
                      <View style={s.hjEraTimelineLead} />
                      <View
                        style={[
                          s.hjEraTimelineSolid,
                          { width: (TAYLOR_ERAS.length - 1) * (ERA_CARD_W + ERA_RAIL_GAP) },
                        ]}
                      />
                      <View style={s.hjEraTimelineRow}>
                        {TAYLOR_ERAS.map(era => (
                          <View key={era.id} style={s.hjEraTimelineCell}>
                            <View style={[s.hjEraTimelineDot, era.id === selectedEraId && s.hjEraTimelineDotActive]} />
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                </ScrollView>
              </View>
            ) : (
              <View style={s.block}>
                <Text style={s.sectionTitle}>Your Eras</Text>
                <Text style={s.sectionSub}>A journey through your Taylor Swift story</Text>

                {/* Timeline rail */}
                <View style={s.eraTimeline}>
                  <View style={s.timelineTrack}>
                    <Animated.View style={[s.timelineFill, timelineFillStyle]} />
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}
                    contentContainerStyle={s.eraScroll}>
                    {TAYLOR_ERAS.map(era => {
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
              </View>
            )}

            {/* Selected era detail */}
            {selectedEra && (
              <View style={s.block}>
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
                      <TouchableOpacity onPress={() => playTaylor()} hitSlop={8}>
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
              </View>
            )}

            {/* ── Time You Spent Together — journey stats grid, Hannah Journey only ── */}
            {isHannahJourney && (
              <View style={s.block}>
                <Text style={s.sectionTitle}>Time You Spent Together</Text>
                <View style={s.statsRow}>
                  <View style={s.statCard}>
                    <Text style={s.statNum}>{TAYLOR_JOURNEY_STATS.minutesListened.toLocaleString()}</Text>
                    <Text style={s.statLabel}>Minutes Listened</Text>
                  </View>
                  <View style={s.statCard}>
                    <Text style={s.statNum}>{TAYLOR_JOURNEY_STATS.longestStreakDays}</Text>
                    <Text style={s.statLabel}>Day Streak</Text>
                  </View>
                  <View style={s.statCard}>
                    <Text style={s.statNum}>{TAYLOR_JOURNEY_STATS.amongFriendsRank}</Text>
                    <Text style={s.statLabel}>Among Friends</Text>
                  </View>
                </View>
              </View>
            )}

            {/* ── Favorite Lyrics ──────────────────────────────────────── */}
            <View style={s.block}>
              <View style={s.lyricHeadRow}>
                <Text style={s.sectionTitle}>Your Favorite Lyrics</Text>
                <TouchableOpacity onPress={() => router.push('/artist-lyrics/tswift' as any)}>
                  <Text style={s.lyricSeeMore}>SEE MORE</Text>
                </TouchableOpacity>
              </View>
              <LyricCardStack items={TAYLOR_FAVORITE_LYRICS} resolveArt={resolveArt} />
            </View>

            {/* ── Playlists — Hannah Journey only ─────────────────────── */}
            {isHannahJourney && (
              <View style={s.block}>
                <Text style={s.sectionTitle}>Playlists Similar to this Era</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.playlistRail}>
                  {TAYLOR_ERA_PLAYLISTS.map(pl => (
                    <TouchableOpacity key={pl.title} style={s.playlistCard} activeOpacity={0.85} onPress={() => playTaylor()}>
                      <Image source={resolveArt(pl.artKey)} style={s.playlistArt} resizeMode="cover" />
                      <Text style={s.playlistTitle} numberOfLines={1}>{pl.title}</Text>
                      <Text style={s.playlistMeta} numberOfLines={1}>Playlist • Amazon Music</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* ── Where it started — first-ever-play banner, Hannah Journey only ── */}
            {isHannahJourney && (
              <View style={s.block}>
                <Text style={s.sectionTitle}>Where it started</Text>
                <TouchableOpacity style={s.topTrackCard} activeOpacity={0.85} onPress={() => playTaylor('s-ts1989')}>
                  <Image source={resolveArt('ts-1989')} style={s.topTrackArt} />
                  <View style={s.topTrackMeta}>
                    <Text style={s.firstPlayEyebrow}>YOUR FIRST EVER PLAY</Text>
                    <Text style={s.topTrackTitle}>Blank Space</Text>
                    <Text style={s.topTrackSub}>Since {TAYLOR_SUPERFAN_STATS.firstListenYear}</Text>
                  </View>
                  <Ionicons name="play-circle" size={40} color={C.cyan} />
                </TouchableOpacity>
              </View>
            )}

            {/* ── News ─────────────────────────────────────────────────── */}
            {/* Latest News / Superfan Picks — not on Olivia's HJ-superfan page, every other persona only */}
            {!isHannahJourney && (
              <>
                <View style={s.block}>
                  <Text style={s.sectionTitle}>Latest News</Text>
                  <View style={s.newsCard}>
                    <LinearGradient
                      colors={['#0a1c0a', '#1e4a20']}
                      style={StyleSheet.absoluteFill}
                    />
                    <View style={s.newsDot} />
                    <Text style={s.newsHeadline}>{TAYLOR_NEWS.headline}</Text>
                    <Text style={s.newsBody}>{TAYLOR_NEWS.body}</Text>
                    <Text style={s.newsDate}>{TAYLOR_NEWS.date}</Text>
                  </View>
                </View>

                <View style={s.block}>
                  <Text style={s.sectionTitle}>Superfan Picks</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}
                    contentContainerStyle={s.superfanMerchRow}>
                    {TAYLOR_SUPERFAN_MERCH.map(item => (
                      <TouchableOpacity key={item.id} style={s.superfanMerchCard} activeOpacity={0.8}>
                        <Image source={resolveArt(item.artKey)} style={s.superfanMerchArt} />
                        <Text style={s.superfanMerchLabel} numberOfLines={2}>{item.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </>
            )}

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

  // ── Hannah Journey–only hero + tab additions ──────────────────────────────
  filterIconHJ: { width: 24, height: 24 },
  // Figma Hannah Journey "since" pill: pink fill, no border — matches Olivia's
  // sinceBubbleHJ padding/gap exactly (5/5/3).
  sinceBubbleHJ: { borderWidth: 0, paddingHorizontal: 5, paddingVertical: 5, gap: 3, backgroundColor: '#DE909C' },
  // Matches Olivia's sinceBubbleIcon size exactly (18x18, not 16x16).
  sinceBubbleIconHJ: { width: 18, height: 18 },
  sinceTextHJ: { fontFamily: FONT_FAMILY_DISPLAY.regular, fontSize: 12, fontWeight: '400' },
  // Figma node 2740-29136 hero-absolute coordinates (left 109/top 187) — the
  // bubble itself sits at this wrap's origin; the tail dots are offset
  // relative to it (Figma coords minus this wrap's own 109/187 origin).
  followingBubbleHJWrap: { position: 'absolute', left: 109, top: 187 },
  followingBubbleTailBig: {
    position: 'absolute',
    left: 7.76,
    top: 22.08,
    width: 10.94,
    height: 10.94,
    borderRadius: 5.47,
    backgroundColor: '#DE909C',
  },
  followingBubbleTailSmall: {
    position: 'absolute',
    left: 4.18,
    top: 33.03,
    width: 4.97,
    height: 4.97,
    borderRadius: 2.49,
    backgroundColor: '#DE909C',
  },
  // "You & Taylor" Hannah-Journey hero card — same shape/gradient as Olivia's
  // superfanHeroOuter/Plate/Glass/Inner in HannahJourneyYouAndOlivia.tsx.
  hjHeroOuter: { borderRadius: 24, overflow: 'hidden', minHeight: 252, backgroundColor: '#000' },
  hjHeroPlate: { ...StyleSheet.absoluteFillObject, borderRadius: 24 },
  hjHeroGlass: { margin: 0, padding: 8, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: 'rgba(30,30,30,0.6)' },
  hjHeroInner: { height: 216, borderRadius: 16, overflow: 'hidden', paddingHorizontal: 16, paddingVertical: 14, justifyContent: 'space-between' },
  hjHeroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hjHeroBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hjHeroBadgeIcon: { width: 27, height: 24 },
  hjHeroBadgeText: { fontFamily: FONT_FAMILY_EMBER.bold, fontSize: 16, color: '#fff' },
  hjHeroSince: { fontFamily: FONT_FAMILY_EMBER.regular, fontSize: 12, color: '#fff' },
  hjHeroBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  hjHeroHeadline: { fontFamily: FONT_FAMILY_DISPLAY.bold, fontSize: 28, color: '#fff' },
  hjHeroSub: { fontFamily: FONT_FAMILY_EMBER.regular, fontSize: 16, color: '#fff' },
  hjHeroShare: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  // Hannah-Journey era carousel — same card/timeline shape as
  // HannahJourneyYouAndOlivia.tsx's "Your Journey with Olivia".
  hjEraRailScroll: { paddingLeft: 0 },
  hjEraRail: { flexDirection: 'row', gap: ERA_RAIL_GAP, paddingVertical: 4 },
  hjEraCard: { width: ERA_CARD_W, height: HJ_ERA_CARD_H, borderRadius: 8, overflow: 'hidden', justifyContent: 'flex-end' },
  hjEraCardDim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)' },
  hjEraCardGlow: {
    shadowColor: 'rgba(127,119,215,0.45)',
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  hjEraCardSelectedBorder: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' },
  hjEraCardCrest: { position: 'absolute', top: 8, left: 8, width: 32, height: 32 },
  hjEraCaption: { backgroundColor: 'rgba(30,30,30,0.56)', paddingHorizontal: 12, paddingVertical: 8, gap: 4 },
  hjEraSeason: { fontFamily: FONT_FAMILY_EMBER.regular, fontSize: 12, color: '#a6a6a6' },
  hjEraTitle: { fontFamily: FONT_FAMILY_EMBER.bold, fontSize: 16, color: '#fff' },
  hjEraBadge: { fontFamily: FONT_FAMILY_EMBER.regular, fontSize: 12, color: '#fff' },
  hjEraTimeline: { position: 'relative', height: 16, marginTop: 10 },
  hjEraTimelineLead: {
    position: 'absolute',
    left: 0,
    top: 8,
    width: ERA_CARD_W / 2 - 8,
    height: 0,
    borderTopWidth: 1,
    borderStyle: 'dotted',
    borderColor: 'rgba(255,255,255,0.5)',
  },
  hjEraTimelineSolid: {
    position: 'absolute',
    left: ERA_CARD_W / 2,
    top: 8,
    height: 0,
    borderTopWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(255,255,255,0.5)',
  },
  // gap must match hjEraRail's gap above — same fix as HannahJourneyYouAndOlivia.tsx's
  // eraTimelineRow: without it, dots pack edge-to-edge while their cards above
  // are spaced with the gap, so every dot past the first drifts left of its card.
  hjEraTimelineRow: { flexDirection: 'row', alignItems: 'center', height: 16, gap: ERA_RAIL_GAP },
  hjEraTimelineCell: { width: ERA_CARD_W, alignItems: 'center' },
  hjEraTimelineDot: { width: 8, height: 8, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.85)' },
  hjEraTimelineDotActive: { width: 12, height: 12, borderRadius: 6, borderWidth: 0, backgroundColor: '#fff' },
  // Figma "Super Fan" pill — matches Olivia's superFanBtn exactly: transparent
  // border reserved here (the visible pink→lavender→blue gradient stroke is
  // painted by the SVG overlay in the JSX above), asymmetric pl-18/pr-16.
  superFanBtn: { borderWidth: 2, borderColor: 'transparent', backgroundColor: 'transparent', paddingLeft: 18, paddingRight: 16 },
  superFanHeartIcon: { width: 18, height: 18 },
  followBtnTextEmber: { fontFamily: FONT_FAMILY_EMBER.regular },
  controlRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  // Figma hero (node 2576-38587): follower count text is 14px.
  heroFollowersHJ: { fontSize: 14 },
  tabTextHJ: { fontFamily: FONT_FAMILY_EMBER.regular, fontSize: 12, fontWeight: '400' },
  // Figma tab rail (node 447-1828): container is px-16 with an explicit 15px
  // gap between items (additive to each item's own px-12 here) plus extra
  // pb-12 beyond each item's own bottom padding — mirrors Olivia's tabRowHJ.
  tabRowHJ: { paddingHorizontal: 16, gap: 15, paddingBottom: 12 },
  playlistRail: { gap: 12, paddingVertical: 4 },
  playlistCard: { width: 130 },
  playlistArt: { width: 130, height: 130, borderRadius: 10 },
  playlistTitle: { fontSize: 13, color: '#fff', fontWeight: '700', marginTop: 6 },
  playlistMeta: { fontSize: 11, color: GREY, marginTop: 2 },
  firstPlayEyebrow: { fontSize: 11, fontWeight: '700', color: C.cyan, letterSpacing: 0.5, marginBottom: 2 },
})
