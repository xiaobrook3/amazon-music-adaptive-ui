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
import { Text } from '../components/AppText'
import { AppImage as Image } from '../components/AppImage'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Rect } from 'react-native-svg'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { safeGoBack } from '../utils/navigation'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { songs } from '../data/mockData'
import { albumArtAssets, hannahJourneyAssets, oliviaPageAssets, oliviaAboutAssets } from '../data/assetMap'
import { useProfiles } from '../context/ProfilesContext'
import { useHannahJourney } from '../context/HannahJourneyContext'
import HannahJourneyYouAndOlivia from '../components/hannah-journey/HannahJourneyYouAndOlivia'
import {
  OLIVIA_ERAS,
  OLIVIA_ERA_PLAYLISTS,
  OLIVIA_FAVORITE_LYRICS,
  OLIVIA_JOURNEY_STATS,
  OLIVIA_JOURNEY_STATS_ENGAGED,
  type OliviaEraId,
} from '../data/oliviaRodrigoPage'
import { OLIVIA_ABOUT_MERCH, OLIVIA_ABOUT_EVENTS, OLIVIA_PAST_EVENTS } from '../data/oliviaRodrigoAbout'
import {
  OLIVIA_NEWS,
  OLIVIA_MERCH,
  OLIVIA_SUPERFAN_STATS,
} from '../data/oliviaSuperFanContent'
import {
  getExclusiveOffersForArtist,
  resolveOfferArt,
  iconForOfferKind,
} from '../data/exclusiveOffers'
import { usePlaybackState } from '../hooks/usePlaybackState'
import { useAdaptiveUI } from '../context/AdaptiveUIContext'
import { useAdaptiveMenu } from '../components/AdaptiveContextMenu'
import { useLikedSongs } from '../context/LikedSongsContext'
import { filterJourneyTab, useYouAndArtistUnlock } from '../hooks/useYouAndArtistUnlock'
import UnlockDot from '../components/artist/UnlockDot'
import UnlockTraceBorder from '../components/artist/UnlockTraceBorder'
import { useArtistEngagement } from '../context/ArtistEngagementContext'
import { C, typeHeadline, FONT_FAMILY_DISPLAY, FONT_FAMILY_EMBER } from '../theme'
import OliviaAboutTab from '../components/artist/OliviaAboutTab'
import OliviaMusicTab from '../components/artist/OliviaMusicTab'
import { ArtistEventsCard, ArtistMerchGrid, PastArtistEventsCard } from '../components/artist/ArtistCommerce'
import LyricCardStack from '../components/artist/LyricCardStack'
import SuperfanGoldGlow from '../components/SuperfanGoldGlow'
import { EdgeFadeRow } from '../components/EdgeFadeRow'

const OLIVIA_ID = 'olivia-rodrigo'

/** You & Olivia sits right beside Music for every persona. */
const TABS = ['Music', 'You & Olivia', 'Events', 'Merch', 'About'] as const
const ERA_CARD_W = 120
const ERA_CARD_H_TALL = 166
const ERA_CARD_H_SHORT = 122
const MERCH_CARD_W = ((Platform.OS === 'web' ? Math.min(Dimensions.get('window').width, 402) : Dimensions.get('window').width) - 44) / 2

// How many of her songs get pre-liked per listener tier, so "You & Olivia"
// reads as a real relationship at a glance: a brand-new listener starts with
// zero — nothing to preview yet — an engaged listener has a solid handful,
// and a superfan has liked more than half her catalog (27 songs total).
const LIKE_TARGET_ENGAGED = 10
const LIKE_TARGET_SUPERFAN = 16

// A "new to Olivia" listener (Hannah) starts casual and becomes a FULL Olivia
// superfan once she has followed and liked this many of Olivia's songs — at
// which point both the "You & Olivia" tab and the Music tab upgrade themselves.
const OLIVIA_SUPERFAN_UNLOCK_LIKES = 10

const ERA_IMAGES: Record<string, number> = {
  'olivia-era-love': oliviaPageAssets.eraLove,
  'olivia-era-sour': oliviaPageAssets.eraSour,
  'olivia-era-petty': oliviaPageAssets.eraPetty,
}

function resolveArt(key: string) {
  return albumArtAssets[key] ?? oliviaAboutAssets[key] ?? ERA_IMAGES[key] ?? oliviaPageAssets.profile
}

function ExplicitBadge() {
  return (
    <View style={s.explicitBadge}>
      <Text style={s.explicitText}>E</Text>
    </View>
  )
}

export default function OliviaRodrigoArtistScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ tab?: string }>()
  const insets = useSafeAreaInsets()
  const { playSongAt } = usePlaybackState()
  const { showConfirmation } = useAdaptiveUI()
  const { activeProfile } = useProfiles()
  const {
    isHannahJourney,
    stage: hannahJourneyStage,
    becomeEngaged,
  } = useHannahJourney()
  const { open: openAdaptiveMenu } = useAdaptiveMenu()
  const { likedSongIds, addLike } = useLikedSongs()
  const { hasEverFollowed: hasEverFollowedArtist } = useArtistEngagement()
  const tabScrollRef = useRef<ScrollView>(null)
  // Switching tabs while scrolled down previously left the page ScrollView at
  // its old offset — if the new tab's content is shorter (e.g. arriving on
  // Music from a taller tab), that read as a dead black gap at the bottom
  // instead of clamping to the new content. Reset to top on every tab switch.
  const pageScrollRef = useRef<ScrollView>(null)
  const [selectedEraId, setSelectedEraId] = useState<OliviaEraId>('sour')

  // Three tiers on the "You & Olivia" tab:
  //  - casual (KSM): tab starts LOCKED — hidden until she's followed, played,
  //    and liked something of Olivia's. Once unlocked, still only journey
  //    stats + liked songs, none of the superfan-only perks.
  //  - engaged (Rabiat): tab always available, journey + played-back-then +
  //    similar-era playlists, but not the exclusive/lyrics superfan perks.
  //  - superfan (everyone else, e.g. Celine): everything.
  // Live count of Olivia songs this listener has liked, derived from the real
  // Liked Songs set so the tiering re-evaluates every time she taps a heart.
  const likedOliviaCount = useMemo(
    () => songs.filter(sg => sg.artistId === OLIVIA_ID && likedSongIds.has(sg.id)).length,
    [likedSongIds],
  )
  // Hannah ("new to Olivia") ratchets casual → superfan once she has followed
  // and liked enough of Olivia's songs. `startsCasual` folds her in with the
  // casual (KSM) tier for the locked-tab + New-Album flow until she gets there.
  // Hannah Journey uses a dedicated stage machine — do NOT reuse newToOlivia.
  const oliviaSuperfanReached =
    !isHannahJourney &&
    !!activeProfile.newToOlivia &&
    hasEverFollowedArtist(OLIVIA_ID) &&
    likedOliviaCount >= OLIVIA_SUPERFAN_UNLOCK_LIKES
  const startsCasual = isHannahJourney
    ? hannahJourneyStage === 'new-listener'
    : !!activeProfile.casual || !!activeProfile.newToOlivia
  const isCasualListener = isHannahJourney
    ? hannahJourneyStage === 'new-listener'
    : startsCasual && !oliviaSuperfanReached
  const isEngagedListener = isHannahJourney
    ? hannahJourneyStage === 'engaged'
    : !!activeProfile.engaged
  const isJourneySuperfan = isHannahJourney && hannahJourneyStage === 'superfan'
  const [following, setFollowing] = useState(!startsCasual)
  // Super Fan button: the app's established superfan gradient (pink → lavender →
  // blue, same as the You & Olivia superfan card / reveal pop-up) painted as a
  // BORDER ONLY, via an SVG stroke rather than expo-linear-gradient. The button's
  // fill stays fully transparent (unchanged) so the hero backdrop shows through
  // the middle — a filled-plate + inset-View gradient trick would leak gradient
  // color into that transparent center instead of just ringing it, so an
  // `fill="none"` SVG rect stroke is used to keep the center genuinely see-through.
  // Sized to the button's actual rendered box via onLayout since the button is
  // intrinsically (not fixed) sized.
  const [superFanBtnSize, setSuperFanBtnSize] = useState({ width: 0, height: 0 })

  const oliviaSongIds = useMemo(
    () => songs.filter(sg => sg.artistId === OLIVIA_ID).map(sg => sg.id),
    [],
  )
  const {
    isUnlocked,
    showUnlockDot,
    markFollowed,
    markPlayed,
    dismissUnlockDot,
    hasEverFollowed,
    hasSeenUnlock,
  } = useYouAndArtistUnlock(OLIVIA_ID, {
    gateTab: isCasualListener && !isHannahJourney,
    showDot: isCasualListener && !isHannahJourney,
    artistSongIds: oliviaSongIds,
    likedSongIds,
  })
  // Hannah Journey: Follow alone unlocks You & Olivia (stage → engaged).
  const journeyTabUnlocked = isHannahJourney
    ? hannahJourneyStage !== 'new-listener'
    : isUnlocked
  // Reuse the same unlock-dot / trace pattern as casual personas; HJ unlocks on Follow only.
  const showTabUnlockDot = isHannahJourney
    ? journeyTabUnlocked && !hasSeenUnlock()
    : showUnlockDot
  const visibleTabs = useMemo(
    () => filterJourneyTab(TABS, 'You & Olivia', journeyTabUnlocked),
    [journeyTabUnlocked],
  )
  const [tab, setTab] = useState<(typeof TABS)[number]>('Music')
  const [showUnlockTrace, setShowUnlockTrace] = useState(false)
  const hasFiredUnlockTraceRef = useRef(false)

  // Deep-link from superfan reveal CTA → You & Olivia tab.
  useEffect(() => {
    if (params.tab === 'you' && journeyTabUnlocked) {
      setTab('You & Olivia')
    }
  }, [params.tab, journeyTabUnlocked])

  // Re-sync follow button when switching personas (e.g. KSM reset clears engagement
  // but the screen may stay mounted with a stale "Following" label).
  useEffect(() => {
    if (isHannahJourney) {
      setFollowing(hannahJourneyStage !== 'new-listener' || hasEverFollowed())
    } else {
      setFollowing(!startsCasual || hasEverFollowed())
    }
  }, [activeProfile.id, startsCasual, hasEverFollowed, isHannahJourney, hannahJourneyStage])

  // After Restart Journey, force Music tab so the new-listener layout re-renders.
  useEffect(() => {
    if (isHannahJourney && hannahJourneyStage === 'new-listener') {
      setTab('Music')
      hasFiredUnlockTraceRef.current = false
    }
  }, [isHannahJourney, hannahJourneyStage])

  // Scroll the tab rail so the newly unlocked journey tab + dot are visible,
  // and play the one-time trace-border animation for the exact unlock
  // moment. Guarded by a ref rather than a "was locked, now unlocked"
  // transition check, so it still fires the first time she SEES the
  // unlocked tab even if the unlock happened off-screen (e.g. she followed
  // or liked a song from somewhere other than this page) — not just when
  // the transition happens live while this screen is mounted.
  useEffect(() => {
    const shouldFire = isHannahJourney
      ? journeyTabUnlocked && showTabUnlockDot
      : isUnlocked && showUnlockDot
    if (shouldFire && !hasFiredUnlockTraceRef.current) {
      hasFiredUnlockTraceRef.current = true
      // You & Olivia sits right after Music now, so scroll to the start to reveal it.
      requestAnimationFrame(() => tabScrollRef.current?.scrollTo({ x: 0, animated: true }))
      setShowUnlockTrace(true)
      if (isHannahJourney) {
        showConfirmation('You & Olivia unlocked')
      }
    }
  }, [
    isHannahJourney,
    journeyTabUnlocked,
    showTabUnlockDot,
    isUnlocked,
    showUnlockDot,
    showConfirmation,
  ])

  const toggleFollow = () => {
    // Side effects out of the setState updater: React 19 runs updaters during
    // render, so cross-context setState (becomeEngaged) fired here is dropped on web.
    if (!following) {
      markFollowed()
      if (isHannahJourney) {
        // Stay on Music — tab unlock UX (toast + rail scroll + dot + trace) handles discovery.
        becomeEngaged()
      }
    }
    setFollowing(v => !v)
  }

  const selectedEra = useMemo(
    () => OLIVIA_ERAS.find(e => e.id === selectedEraId) ?? OLIVIA_ERAS[1],
    [selectedEraId],
  )

  // The "now" era is always first in the array (most recent); the founding
  // "how you found her" era is always last (oldest) and gets a shorter card.
  const nowEraId = OLIVIA_ERAS[0].id
  const oldestEraId = OLIVIA_ERAS[OLIVIA_ERAS.length - 1].id

  // Engaged listeners are still building the relationship — modest numbers,
  // not a superfan's big ones. Hannah Journey Engaged uses Figma numbers (1204 / 47 / #4)
  // inside HannahJourneyYouAndOlivia — these remain for non-journey personas.
  const journeyStats = isEngagedListener ? OLIVIA_JOURNEY_STATS_ENGAGED : OLIVIA_JOURNEY_STATS

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

  const exclusiveOffers = useMemo(() => getExclusiveOffersForArtist(OLIVIA_ID), [])

  const playOlivia = (title?: string) => {
    const match = title
      ? songs.find(s => s.artistId === 'olivia-rodrigo' && s.title.toLowerCase() === title.toLowerCase())
      : firstSong
    if (match) {
      playSongAt(match.id)
      markPlayed()
      router.push('/now-playing')
    }
  }

  // For the superfan-only cards below, whose display titles are curated
  // ("vampire (Early Studio Demo)") and don't literally match a catalog
  // title — play straight from the known song id instead of title-matching.
  const playOliviaById = (songId: string) => {
    playSongAt(songId)
    markPlayed()
    router.push('/now-playing')
  }

  // Pre-like a tier-appropriate slice of her catalog so "You & Olivia" reads
  // as a real relationship immediately, not an empty state: a brand-new
  // listener (casual — KSM, and Hannah before she's unlocked) starts at
  // zero — nothing to preview, hearts on Popular stay empty until tapped —
  // engaged sits in the middle, and a superfan has liked more than half her
  // songs. oliviaSongs is already in "most iconic first" catalog order
  // (drivers license, good 4 u, vampire...), so slicing it gives a sensible
  // priority without hardcoding a list. addLike is idempotent/one-way, so
  // re-running this on persona switches only ever tops liked count up
  // toward the new tier's target, never removes any.
  useEffect(() => {
    const target = isCasualListener
      ? 0
      : isEngagedListener
        ? LIKE_TARGET_ENGAGED
        : LIKE_TARGET_SUPERFAN
    const currentCount = oliviaSongs.filter(sg => likedSongIds.has(sg.id)).length
    if (currentCount < target) {
      oliviaSongs.slice(0, target).forEach(sg => addLike(sg.id))
    }
    // Hannah Journey also reseeds when stage advances (Follow → engaged, reveal → superfan).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProfile.id, isHannahJourney ? hannahJourneyStage : null])

  // Shuffle stays on the page — the mini player and a toast confirm playback.
  const shuffleOlivia = () => {
    if (oliviaSongs.length === 0) return
    const pick = oliviaSongs[Math.floor(Math.random() * oliviaSongs.length)]
    playSongAt(pick.id)
    markPlayed()
    showConfirmation('Shuffling Olivia Rodrigo')
  }

  // Same bottom-sheet menu as long-press everywhere else.
  const showOliviaMenu = () => {
    openAdaptiveMenu({ kind: 'artist', artistId: 'olivia-rodrigo', name: 'Olivia Rodrigo', imageUri: 'olivia-rodrigo-hero' })
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
          <ImageBackground
            source={oliviaPageAssets.hero}
            style={s.heroBg}
            resizeMode="cover"
            alt=""
            // Web: RNW doesn't apply the inner img's absolute-fill inset, so force
            // it inline or the natural-size image spills under the page content.
            imageStyle={Platform.OS === 'web' ? ({ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' } as any) : undefined}
          >
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
              <TouchableOpacity onPress={() => safeGoBack(router)} style={s.iconBtn} hitSlop={8}>
                <Ionicons name="chevron-back" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={s.iconBtn} hitSlop={8} onPress={showOliviaMenu}>
                {isHannahJourney ? (
                  // Figma node 2740-29136: a solid filled funnel glyph (not an
                  // outline style), 24x24, white — corrects the earlier Ionicons
                  // "funnel-outline" stand-in, which used an unfilled/stroked shape
                  // the design doesn't actually specify.
                  <Image source={hannahJourneyAssets.filterIcon} style={s.filterIconHJ} resizeMode="contain" />
                ) : (
                  <Ionicons name="options-outline" size={22} color="#fff" />
                )}
              </TouchableOpacity>
            </View>

            <View style={s.profileCluster}>
              <Image source={oliviaPageAssets.profile} style={s.artistAvatar} resizeMode="cover" />
              {!isCasualListener && (
                <>
                  <View style={[s.userBubbleWrap, isHannahJourney && s.userBubbleWrapHJ]}>
                    <View style={[s.userAvatar, !activeProfile.image && { backgroundColor: activeProfile.color }]}>
                      {activeProfile.image ? (
                        <Image source={activeProfile.image} style={s.userAvatarImg} resizeMode="cover" />
                      ) : (
                        <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>
                          {activeProfile.initial}
                        </Text>
                      )}
                    </View>
                    {/* Original (pre-Hannah-Journey) since-pill, unchanged: stacked under the
                        avatar for every other persona at engaged/superfan tier. */}
                    {!isHannahJourney && (
                      <View style={[s.sinceBubble, { marginLeft: 34 }]}>
                        <Ionicons name="heart" size={14} color="#fff" />
                        <Text style={s.sinceText}>Since Mar 2020</Text>
                      </View>
                    )}
                  </View>
                  {/* HJ engaged Figma: dual avatars only. Superfan: since pill.
                      Positioned independently of the user avatar (Figma: left 109/top 187 in the
                      hero, i.e. left 93/top 19 relative to this 16,168 profile cluster) rather than
                      stacked under it. Figma node 2740-29136 "following bubble": solid fill with
                      no border, plus a 2-circle speech-bubble tail pointing at the user avatar. */}
                  {isJourneySuperfan && (
                    <>
                      <View style={s.sinceBubbleTailBig} />
                      <View style={s.sinceBubbleTailSmall} />
                      <View style={[s.sinceBubble, s.sinceBubblePos, s.sinceBubbleHJ, { backgroundColor: '#DE909C' }]}>
                        <Image
                          source={hannahJourneyAssets.sinceBubbleHeart}
                          style={s.sinceBubbleIcon}
                          resizeMode="contain"
                        />
                        <Text style={[s.sinceText, s.sinceTextHJ]}>Since Mar 2021</Text>
                      </View>
                    </>
                  )}
                </>
              )}
            </View>

            <View style={s.heroMeta}>
              <Text style={s.heroName}>Olivia Rodrigo</Text>
              {/* Figma hero: follower count is 14px (shared style below is 15px, tuned
                  for other personas) — HJ-gated override only. */}
              <Text style={[s.heroFollowers, isHannahJourney && s.heroFollowersHJ]}>4M+ Followers</Text>
            </View>

            <View style={s.controlPanel}>
              <View style={s.controlLeft}>
                <TouchableOpacity
                  onPress={isJourneySuperfan ? undefined : toggleFollow}
                  onLayout={
                    isJourneySuperfan
                      ? e => {
                          const { width, height } = e.nativeEvent.layout
                          setSuperFanBtnSize({ width, height })
                        }
                      : undefined
                  }
                  style={[
                    s.followBtn,
                    isJourneySuperfan
                      ? s.superFanBtn
                      : following
                        ? s.followingBtn
                        : null,
                    // Figma nodes 2740-29136/54-1049/2740-29563: follow button uses
                    // asymmetric pl-18/pr-16 padding across ALL three tiers, not just
                    // Super Fan (which already had its own copy of this).
                    isHannahJourney && s.followBtnPaddingHJ,
                  ]}
                  activeOpacity={isJourneySuperfan ? 1 : 0.7}
                >
                  {isJourneySuperfan ? (
                    <>
                      {/* Border ring: SVG stroke (not a filled plate) so the button's
                          transparent fill is untouched — solid blue, not the earlier
                          pink-to-blue gradient. */}
                      {superFanBtnSize.width > 0 && superFanBtnSize.height > 0 && (
                        <Svg
                          style={StyleSheet.absoluteFill}
                          width={superFanBtnSize.width}
                          height={superFanBtnSize.height}
                          pointerEvents="none"
                        >
                          <Rect
                            x={1}
                            y={1}
                            width={Math.max(superFanBtnSize.width - 2, 0)}
                            height={Math.max(superFanBtnSize.height - 2, 0)}
                            rx={23}
                            ry={23}
                            fill="none"
                            stroke={C.blue}
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
                    </>
                  ) : (
                    <>
                      {/* Figma: "Follow" (not-yet-following) heart is an OUTLINE glyph;
                          "Following" is filled — only the fill differed by state, size
                          18x18 for both. Gated to HJ so other personas keep their
                          existing always-filled 16px heart. */}
                      <Ionicons
                        name={isHannahJourney && !following ? 'heart-outline' : 'heart'}
                        size={isHannahJourney ? 18 : 16}
                        color={following ? C.cyan : '#fff'}
                      />
                      <Text
                        style={[
                          s.followBtnText,
                          // Figma: "Follow"/"Super Fan" labels use Amazon Ember Regular,
                          // but "Following" uses Ember Modern Display Regular.
                          isHannahJourney &&
                            (following ? s.followBtnTextDisplayHJ : s.followBtnTextEmber),
                        ]}
                      >
                        {following ? 'Following' : 'Follow'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
                {/* Figma HJ order: Follow/Super Fan + more | shuffle + play */}
                {isHannahJourney ? (
                  <>
                    <TouchableOpacity style={s.roundIconBtn} onPress={showOliviaMenu} hitSlop={8} accessibilityRole="button" accessibilityLabel="More options">
                      <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    {!isJourneySuperfan && (
                      <TouchableOpacity style={s.roundIconBtn} onPress={shuffleOlivia} hitSlop={8}>
                        <Ionicons name="shuffle" size={20} color="#fff" />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity style={s.roundIconBtn} onPress={showOliviaMenu} hitSlop={8} accessibilityRole="button" accessibilityLabel="More options">
                      <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
                    </TouchableOpacity>
                    {isJourneySuperfan && (
                      <TouchableOpacity style={s.roundIconBtn} hitSlop={8}>
                        <Ionicons name="share-outline" size={20} color="#fff" />
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
              <View style={isHannahJourney ? s.controlRight : undefined}>
                {isHannahJourney && (
                  <TouchableOpacity style={s.roundIconBtn} onPress={shuffleOlivia} hitSlop={8}>
                    <Ionicons name="shuffle" size={20} color="#fff" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={s.playBtn} onPress={() => playOlivia()} activeOpacity={0.85}>
                  <Ionicons name="play" size={26} color="#000" style={{ marginLeft: 3 }} />
                </TouchableOpacity>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* Tabs */}
        <View style={s.tabBar}>
          <ScrollView
            ref={tabScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[s.tabRow, isHannahJourney && s.tabRowHJ]}
          >
            {visibleTabs.map(t => (
              <TouchableOpacity
                key={t}
                onPress={() => {
                  setTab(t)
                  pageScrollRef.current?.scrollTo({ y: 0, animated: false })
                  if (t === 'You & Olivia') dismissUnlockDot()
                }}
                style={s.tabItem}
                accessibilityRole="button"
                accessibilityState={{ selected: tab === t }}
              >
                {t === 'You & Olivia' && showUnlockTrace && (
                  <UnlockTraceBorder onComplete={() => setShowUnlockTrace(false)} />
                )}
                <View style={s.tabLabelRow}>
                  {t === 'You & Olivia' && showTabUnlockDot && <UnlockDot />}
                  <Text style={[s.tabText, tab === t && s.tabTextActive, isHannahJourney && s.tabTextHJ]}>{t}</Text>
                </View>
                {tab === t && <View style={s.tabUnderline} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {tab === 'You & Olivia' ? (
          isHannahJourney ? (
            <HannahJourneyYouAndOlivia onPlayTrack={title => playOlivia(title)} />
          ) : (
          <View style={s.journeyWrap}>
            <Image
              source={resolveArt(selectedEra.eraImageKey)}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
              blurRadius={30}
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)', '#000']}
              locations={[0, 0.55, 1]}
              style={StyleSheet.absoluteFill}
            />
            <View style={s.content}>
            {/* Superfan stats banner — mirrors Taylor's "Top 1%" treatment */}
            {!isCasualListener && !isEngagedListener && (
              <View style={s.superfanBanner}>
                <LinearGradient colors={['#3a1830', '#1a0018']} style={StyleSheet.absoluteFill} />
                <View style={s.superfanBadge}>
                  <Ionicons name="star" size={16} color="#f0c744" />
                  <Text style={s.superfanBadgeText}>SUPERFAN</Text>
                </View>
                <Text style={s.superfanPercent}>{OLIVIA_SUPERFAN_STATS.topPercentLabel}</Text>
                <Text style={s.superfanDesc}>You're one of the most dedicated Livies on Amazon Music</Text>
                <View style={s.superfanStatsRow}>
                  <View style={s.superfanStat}>
                    <Text style={s.superfanStatNum}>{OLIVIA_SUPERFAN_STATS.totalPlays.toLocaleString()}</Text>
                    <Text style={s.superfanStatLabel}>Total Streams</Text>
                  </View>
                  <View style={s.superfanStatDivider} />
                  <View style={s.superfanStat}>
                    <Text style={s.superfanStatNum}>{OLIVIA_SUPERFAN_STATS.streakDays}</Text>
                    <Text style={s.superfanStatLabel}>Day Streak</Text>
                  </View>
                  <View style={s.superfanStatDivider} />
                  <View style={s.superfanStat}>
                    <Text style={s.superfanStatNum}>{OLIVIA_SUPERFAN_STATS.erasBadgeLabel}</Text>
                    <Text style={s.superfanStatLabel}>Eras Badge</Text>
                </View>
              </View>
              <SuperfanGoldGlow borderRadius={16} />
            </View>
            )}

            {/* Exclusive For You: superfan perks — merch discounts, presales, tour tickets.
                Web build only: the case study this export is embedded in says tiers change recognition and order, not access, so the gated section does not ship there. Native is unchanged. */}
            {Platform.OS !== 'web' && !isCasualListener && !isEngagedListener && exclusiveOffers.length > 0 && (
              <View style={s.block}>
                <Text style={s.sectionTitle}>Exclusive For You</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.perkRail}
                >
                  {exclusiveOffers.map(offer => {
                    const art = resolveOfferArt(offer.heroArtKey)
                    const inner = (
                      <>
                        <LinearGradient
                          colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.92)']}
                          locations={[0.35, 1]}
                          style={StyleSheet.absoluteFill}
                        />
                        <View style={s.perkTopRow}>
                          <View style={s.perkIconWrap}>
                            <Ionicons name={iconForOfferKind(offer.kind) as any} size={14} color={C.cyan} />
                          </View>
                          <View style={s.perkBadge}>
                            <Text style={s.perkBadgeText}>{offer.badge}</Text>
                          </View>
                        </View>
                        <View style={s.perkCaption}>
                          <Text style={s.perkEyebrow}>{offer.unlockReason.toUpperCase()}</Text>
                          <Text style={s.perkTitle} numberOfLines={2}>{offer.title}</Text>
                          <Text style={s.perkSub} numberOfLines={1}>{offer.subtitle}</Text>
                        </View>
                      </>
                    )
                    return (
                      <TouchableOpacity
                        key={offer.id}
                        style={s.perkCard}
                        activeOpacity={0.85}
                        onPress={() => router.push(`/exclusive-offer/${offer.id}` as any)}
                      >
                        {art ? (
                          <ImageBackground
                            source={art}
                            style={s.perkImg}
                            imageStyle={s.perkImgRadius}
                            resizeMode="cover"
                            alt=""
                          >
                            {inner}
                          </ImageBackground>
                        ) : (
                          <View style={[s.perkImg, { backgroundColor: offer.heroHue }]}>
                            {inner}
                          </View>
                        )}
                      </TouchableOpacity>
                    )
                  })}
                </ScrollView>
              </View>
            )}

            {/* Your Liked Olivia Songs — single entry card; SEE ALL opens full list.
                Hidden entirely until she's liked at least one song — nothing to
                preview yet, so no empty-state prompt either. */}
            {likedOliviaCount > 0 && (
              <View style={s.block}>
                <View style={s.sectionHeaderRow}>
                  <Text style={s.sectionTitle}>Your Liked Olivia Songs</Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => router.push('/artist-liked/olivia-rodrigo' as any)}
                  >
                    <Text style={s.sectionLink}>SEE ALL</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => router.push('/artist-liked/olivia-rodrigo' as any)}
                  style={s.likedPreviewCard}
                >
                  <View style={s.likedPreviewRow}>
                    <View style={s.likedIconWrap}>
                      {isJourneySuperfan ? (
                        <Image
                          source={hannahJourneyAssets.superfanIcon}
                          style={s.likedSuperfanIcon}
                          resizeMode="contain"
                        />
                      ) : (
                        <Ionicons name="heart" size={24} color={C.cyanDim} />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.likedPreviewEyebrow}>YOUR LIKED OLIVIA SONGS</Text>
                      <Text style={s.likedPreviewTitle}>
                        {likedOliviaCount} {likedOliviaCount === 1 ? 'song' : 'songs'} liked
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#888" />
                  </View>
                </TouchableOpacity>
              </View>
            )}


            {/* "Your #1 Most Played" was removed — the All Time Favorite
                section on You & Olivia now carries that claim, so it isn't
                repeated on the artist page. */}

            {/* Journey eras — per Figma node 1433:19433 */}
            <View style={s.block}>
              <View style={s.sectionHeaderRow}>
                <Text style={s.sectionTitle}>Your Journey with Olivia</Text>
                <Text style={s.sectionLink}>Back to Now</Text>
              </View>

              <EdgeFadeRow fadeColor="#000000">
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.eraRail}
                >
                  {OLIVIA_ERAS.map(era => {
                    const selected = era.id === selectedEraId
                    const isNow = era.id === nowEraId
                    const isOldest = era.id === oldestEraId
                    // An engaged listener hasn't caught up to the present
                    // yet — she's still working through the catalog, so the
                    // "now" era stays locked/unlockable until she's a
                    // superfan. Superfans and the tab's own gate (casual
                    // never reaches this tab) see every era.
                    const isLocked = isEngagedListener && isNow
                    const cardHeight = isOldest ? ERA_CARD_H_SHORT : ERA_CARD_H_TALL
                    return (
                      <TouchableOpacity
                        key={era.id}
                        activeOpacity={isLocked ? 1 : 0.9}
                        onPress={() => {
                          if (isLocked) {
                            showConfirmation('Keep listening to unlock this era')
                            return
                          }
                          setSelectedEraId(era.id)
                        }}
                        style={[
                          s.eraCard,
                          { height: cardHeight },
                          (isNow || selected) && !isLocked && s.eraCardGlow,
                          selected && !isLocked && s.eraCardSelectedBorder,
                        ]}
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
                          {isLocked && <View style={s.eraLockedOverlay} />}
                        </ImageBackground>
                        {isLocked && (
                          <View style={s.eraLockBadge}>
                            <Ionicons name="lock-closed" size={16} color="rgba(255,255,255,0.85)" />
                          </View>
                        )}
                        <View style={s.eraCardFooter}>
                          <Text style={[s.eraSeason, isLocked && s.eraTextLocked]}>
                            {era.season}{isNow && !isLocked ? ' • Now' : ''}
                          </Text>
                          <Text style={[s.eraTitle, isLocked && s.eraTextLocked]} numberOfLines={1}>
                            {isLocked ? 'Locked' : era.title}
                          </Text>
                          {!isLocked && <Text style={s.eraPercentile}>{era.badge}</Text>}
                        </View>
                      </TouchableOpacity>
                    )
                  })}
                </ScrollView>
              </EdgeFadeRow>

              <View style={s.journeyStepper}>
                {OLIVIA_ERAS.map(era => {
                  const selected = era.id === selectedEraId
                  const isLocked = isEngagedListener && era.id === nowEraId
                  return (
                    <View
                      key={era.id}
                      style={[
                        s.journeyStepperDot,
                        selected && s.journeyStepperDotSelected,
                        isLocked && s.journeyStepperDotLocked,
                      ]}
                    />
                  )
                })}
              </View>
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
                imageStyle={{ borderRadius: 12 }}
                resizeMode="cover"
                alt=""
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
                    <Text style={s.statValue}>{journeyStats.minutesListened}</Text>
                  </View>
                  <View style={s.statCell}>
                    <Text style={s.statLabel}>Days of Longest streak</Text>
                    <Text style={s.statValue}>{journeyStats.longestStreakDays}</Text>
                  </View>
                  <View style={s.statCell}>
                    <Text style={s.statLabel}>Among Friends</Text>
                    <Text style={s.statValue}>{journeyStats.amongFriendsRank}</Text>
                  </View>
                </View>
              </ImageBackground>
            </View>

            {/* What you played — superfan-tier only */}
            {!isCasualListener && (
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
                      {isJourneySuperfan ? (
                        <Image
                          source={hannahJourneyAssets.superfanIcon}
                          style={s.trackSuperfanIcon}
                          resizeMode="contain"
                        />
                      ) : (
                        <Ionicons name="heart" size={22} color={C.cyan} />
                      )}
                      <Ionicons name="ellipsis-horizontal" size={20} color="#888" />
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity style={s.playMixBtn} onPress={() => playOlivia()} activeOpacity={0.85}>
                    <Text style={s.playMixText}>Play Your Mix</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            )}

            {/* Lyrics — superfan-tier only */}
            {!isCasualListener && !isEngagedListener && (
              <View style={s.block}>
                <View style={s.sectionHeaderRow}>
                  <Text style={s.sectionTitle}>Your Favorite Lyrics</Text>
                  <TouchableOpacity onPress={() => router.push('/artist-lyrics/olivia-rodrigo' as any)}>
                    <Text style={s.sectionLink}>SEE MORE</Text>
                  </TouchableOpacity>
                </View>
                <LyricCardStack items={OLIVIA_FAVORITE_LYRICS} resolveArt={resolveArt} />
              </View>
            )}

            {/* Playlists — superfan-tier only */}
            {!isCasualListener && (
              <View style={s.block}>
                <View style={s.sectionHeaderRow}>
                  <Text style={s.sectionTitle}>Playlists Similar to this Era</Text>
                  <Text style={s.sectionLink}>SEE MORE</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.playlistRail}>
                  {OLIVIA_ERA_PLAYLISTS.map(pl => (
                    <TouchableOpacity key={pl.title} style={s.discCard} activeOpacity={0.85} onPress={() => playOlivia()}>
                      <Image source={resolveArt(pl.artKey)} style={s.discArt} resizeMode="cover" />
                      <Text style={s.discTitle} numberOfLines={1}>{pl.title}</Text>
                      <Text style={s.discMeta} numberOfLines={1}>Playlist • Amazon Music</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Latest News — superfan-tier only */}
            {!isCasualListener && !isEngagedListener && (
              <View style={s.block}>
                <Text style={s.sectionTitle}>Latest News</Text>
                <View style={s.newsCard}>
                  <LinearGradient colors={['#170014', '#3a1030']} style={StyleSheet.absoluteFill} />
                  <View style={s.newsDot} />
                  <Text style={s.newsHeadline}>{OLIVIA_NEWS.headline}</Text>
                  <Text style={s.newsBody}>{OLIVIA_NEWS.body}</Text>
                  <Text style={s.newsDate}>{OLIVIA_NEWS.date}</Text>
                </View>
              </View>
            )}

            {/* Superfan Picks — superfan-tier only */}
            {!isCasualListener && !isEngagedListener && (
              <View style={s.block}>
                <Text style={s.sectionTitle}>Superfan Picks</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.superfanMerchRow}>
                  {OLIVIA_MERCH.map(item => (
                    <TouchableOpacity key={item.id} style={s.superfanMerchCard} activeOpacity={0.8}>
                      <Image source={resolveArt(item.artKey)} style={s.superfanMerchArt} />
                      <Text style={s.superfanMerchLabel} numberOfLines={2}>{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            </View>
          </View>
          )
        ) : tab === 'About' ? (
          <OliviaAboutTab />
        ) : tab === 'Music' ? (
          <OliviaMusicTab />
        ) : tab === 'Merch' ? (
          <View style={s.content}>
            <View style={s.block}>
              <View style={s.sectionHeaderRow}>
                <Text style={s.sectionTitle}>Official Store</Text>
                <Text style={s.sectionLink}>SEE ALL</Text>
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
  heroTopGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  // Figma node 2740-29136 top-nav filter icon: 24x24 solid funnel glyph.
  filterIconHJ: { width: 24, height: 24 },
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
  // Hannah Journey Figma: user profile photo sits at +49x/+37y from the profile-cluster
  // origin — other personas keep their existing (top:14) tuning above, untouched.
  userBubbleWrapHJ: { top: 37 },
  sinceBubblePos: { position: 'absolute', left: 93, top: 19 },
  sinceBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(240,180,185,0.30)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(240,160,170,0.55)',
  },
  sinceText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  // Figma node 2740-29136 "following bubble": no border, tighter padding/gap than
  // the shared (non-HJ) since-pill above.
  sinceBubbleHJ: {
    borderWidth: 0,
    paddingHorizontal: 5,
    paddingVertical: 5,
    gap: 3,
  },
  // Figma type panel: Ember Modern Display Regular, 12px (not the shared pill's
  // 11px/600 Ember Modern Text default).
  sinceTextHJ: { fontFamily: FONT_FAMILY_DISPLAY.regular, fontSize: 12, fontWeight: '400' },
  // 2-circle speech-bubble tail under the pill, pointing toward the user avatar —
  // positions are Figma frame-relative coords minus the profileCluster origin (16,168).
  sinceBubbleTailBig: {
    position: 'absolute',
    left: 100.76,
    top: 41.08,
    width: 10.94,
    height: 10.94,
    borderRadius: 5.47,
    backgroundColor: '#DE909C',
  },
  sinceBubbleTailSmall: {
    position: 'absolute',
    left: 97.18,
    top: 52.03,
    width: 4.97,
    height: 4.97,
    borderRadius: 2.49,
    backgroundColor: '#DE909C',
  },
  userAvatar: {
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
  // Figma hero (node 2576-38587): follower count text is 14px.
  heroFollowersHJ: { fontSize: 14 },
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
  controlRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
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
  followingBtn: {
    borderColor: '#4c4c4c',
    backgroundColor: 'transparent',
  },
  superFanBtn: {
    // Solid cyan border replaced by the app's superfan gradient (pink → lavender →
    // blue), painted by an SVG stroke overlay (see onLayout/Svg in JSX above) so the
    // transparent fill is preserved. borderColor stays transparent (not "none") so
    // borderWidth still reserves the same 2px box the gradient stroke is drawn into —
    // keeping the button's overall size identical to the old solid-border version.
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    // Figma nodes 2740-29136 / 2740-29566: pl-18 pr-16 (asymmetric).
    paddingLeft: 18,
    paddingRight: 16,
  },
  // Figma follow button (all 3 tiers): pl-18/pr-16, overriding the shared
  // symmetric paddingHorizontal:16 above. superFanBtn already carries its own
  // identical values, so applying this alongside it too is a harmless no-op.
  followBtnPaddingHJ: { paddingLeft: 18, paddingRight: 16 },
  // Figma "Following" (engaged tier) label: Ember Modern Display Regular —
  // distinct from "Follow"/"Super Fan", which use Amazon Ember Regular
  // (followBtnTextEmber below).
  followBtnTextDisplayHJ: { fontFamily: FONT_FAMILY_DISPLAY.regular },
  superFanHeartIcon: { width: 18, height: 18 },
  sinceBubbleIcon: { width: 18, height: 18 },
  likedSuperfanIcon: { width: 24, height: 22 },
  trackSuperfanIcon: { width: 22, height: 20 },
  followBtnText: { color: '#fff', fontSize: 14 },
  // Figma "Super Fan" button label: Amazon Ember Regular (not the shared Text
  // wrapper's default Ember Modern Text family).
  followBtnTextEmber: { fontFamily: FONT_FAMILY_EMBER.regular },
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
  // Figma tab rail (node 447-1828): container is px-16 with an explicit 15px
  // gap between tab items (each item's own px-10 in tabItem is additive to
  // this, not a replacement) plus extra pb-12 beyond each item's own bottom
  // padding. HJ-gated so other personas' tab rail spacing is untouched.
  tabRowHJ: { paddingHorizontal: 16, gap: 15, paddingBottom: 12 },
  tabItem: { paddingHorizontal: 10, paddingVertical: 10, position: 'relative' },
  tabLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  tabText: { fontSize: 12, color: '#fff', fontWeight: '400' },
  tabTextActive: { fontWeight: '700' },
  // Figma type panel (Hannah Journey artist tab rail): Amazon Ember Regular, 12px,
  // for every tab label incl. the active one — active vs. inactive is carried by the
  // cyan underline only, not by weight/family. Scoped to isHannahJourney so this tab
  // rail's other personas (KSM, engaged, etc.) keep their original Ember Modern Text look.
  tabTextHJ: { fontFamily: FONT_FAMILY_EMBER.regular, fontSize: 12, fontWeight: '400' },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 8,
    right: 8,
    height: 2,
    backgroundColor: C.cyan,
  },
  journeyWrap: { position: 'relative', overflow: 'hidden', backgroundColor: '#000' },
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
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  eraCardGlow: {
    shadowColor: '#7f77d7',
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  eraCardSelectedBorder: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  eraCardFooter: {
    backgroundColor: 'rgba(30,30,30,0.56)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  eraSeason: { fontSize: 12, color: '#a6a6a6' },
  eraTitle: { fontSize: 16, color: '#fff', fontWeight: '700' },
  eraPercentile: { fontSize: 12, color: '#fff', textAlign: 'center' },
  eraTextLocked: { color: 'rgba(255,255,255,0.4)' },
  eraLockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  eraLockBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  journeyStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 16,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  journeyStepperDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  journeyStepperDotSelected: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: C.cyan,
    borderColor: C.cyan,
  },
  journeyStepperDotLocked: {
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'transparent',
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
  likedPreviewCard: {
    borderRadius: 12,
    backgroundColor: C.elevated,
    paddingHorizontal: 8,
    paddingVertical: 12,
    gap: 12,
  },
  trackRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  trackArt: { width: 63, height: 63, borderRadius: 4 },
  trackTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  trackTitle: { fontSize: 16, color: '#fff', fontWeight: '700', flexShrink: 1 },
  trackArtist: { fontSize: 12, color: '#a6a6a6', marginTop: 2 },
  likedPreviewRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  likedIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  likedPreviewEyebrow: { fontSize: 11, color: C.cyan, fontWeight: '700', letterSpacing: 0.6 },
  likedPreviewTitle: { fontSize: 15, color: '#fff', fontWeight: '600', marginTop: 2 },
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
  perkRail: { gap: 12, paddingVertical: 4 },
  perkCard: { width: 260, borderRadius: 14, overflow: 'hidden' },
  perkImg: { height: 180, justifyContent: 'space-between', padding: 12 },
  perkImgRadius: { borderRadius: 14 },
  perkTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  perkIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  perkBadge: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: C.cyan,
  },
  perkBadgeText: { fontSize: 9, fontWeight: '800', color: C.cyan, letterSpacing: 0.4 },
  perkCaption: { gap: 2 },
  perkEyebrow: { fontSize: 10, fontWeight: '700', color: C.cyan, letterSpacing: 0.5 },
  perkTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
  perkSub: { fontSize: 11, color: 'rgba(255,255,255,0.72)', marginTop: 2 },
  superfanBanner: { overflow: 'hidden', borderRadius: 16, padding: 20 },
  superfanBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  superfanBadgeText: { fontSize: 11, fontWeight: '800', color: '#f0c744', letterSpacing: 1.2 },
  superfanPercent: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  superfanDesc: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 16 },
  superfanStatsRow: { flexDirection: 'row', alignItems: 'center' },
  superfanStat: { flex: 1, alignItems: 'center' },
  superfanStatNum: { fontSize: 15, fontWeight: '700', color: '#fff' },
  superfanStatLabel: { fontSize: 11, color: '#a6a6a6', marginTop: 2 },
  superfanStatDivider: { width: StyleSheet.hairlineWidth, height: 32, backgroundColor: '#444' },
  newsCard: { borderRadius: 14, padding: 18, overflow: 'hidden' },
  newsDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.cyan, marginBottom: 10 },
  newsHeadline: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 6 },
  newsBody: { fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 20, marginBottom: 10 },
  newsDate: { fontSize: 11, color: '#a6a6a6' },
  superfanMerchRow: { gap: 12, paddingVertical: 4 },
  superfanMerchCard: { width: 130 },
  superfanMerchArt: { width: 130, height: 130, borderRadius: 10 },
  superfanMerchLabel: { fontSize: 12, color: '#ddd', marginTop: 6, lineHeight: 16 },
  playlistRail: { gap: 12 },
  discCard: { width: 173 },
  discArt: { width: 173, height: 173, borderRadius: 8, borderWidth: 0.75, borderColor: 'rgba(255,255,255,0.24)' },
  discTitle: { ...typeHeadline(16), color: '#fff', marginTop: 6 },
  discMeta: { fontSize: 14, color: '#a6a6a6', marginTop: 1 },
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
