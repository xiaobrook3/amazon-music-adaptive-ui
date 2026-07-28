import { View, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useState, useEffect } from 'react'
import { Text } from '../AppText'
import { AppImage as Image } from '../AppImage'
import LyricCardStack, { type LyricStackItem } from '../artist/LyricCardStack'
import {
  HANNAH_JOURNEY_ERAS,
  useHannahJourney,
  type HannahJourneyEraId,
} from '../../context/HannahJourneyContext'
import { OLIVIA_FAVORITE_LYRICS, OLIVIA_FAVORITE_LYRICS_HANNAH_JOURNEY_EXTRA } from '../../data/oliviaRodrigoPage'
import { albumArtAssets, hannahJourneyAssets, oliviaPageAssets } from '../../data/assetMap'
import { FONT_FAMILY_DISPLAY, FONT_FAMILY_EMBER, C } from '../../theme'
import { songs as allSongs } from '../../data/mockData'
import { useLikedSongs } from '../../context/LikedSongsContext'
import { useAdaptiveMenu } from '../AdaptiveContextMenu'

const ERA_CARD_W = 120
const ERA_CARD_H = 166
const ERA_RAIL_GAP = 12

const SCREEN_W = Dimensions.get('window').width

/** Figma era carousel card backgrounds (per-era asset sets). */
const ERA_CAROUSEL_ART: Record<HannahJourneyEraId, number> = {
  'girl-in-love': require('../../../assets/hannah-journey/you-and-olivia-superfan-girl-in-love-asset-05.png'),
  sour: require('../../../assets/hannah-journey/you-and-olivia-superfan-sour-asset-10.png'),
  pretty: require('../../../assets/hannah-journey/you-and-olivia-superfan-pretty-asset-01.png'),
  newbie: require('../../../assets/hannah-journey/you-and-olivia-superfan-girl-in-love-asset-12.jpeg'),
}

/** Era header title differs from the carousel card title only for girl-in-love (lowercase "in"). */
const ERA_HEADER_TITLE: Record<HannahJourneyEraId, string> = {
  'girl-in-love': 'Girl So in Love Era',
  sour: 'Sour Girl Era',
  pretty: 'Petty Era',
  newbie: 'Newbie Livie',
}

/** "What You Played Back Then" song-list card border + tint (era accent color). */
const ERA_SONG_LIST_STYLE: Record<HannahJourneyEraId, { border: string; colors: [string, string]; locations: [number, number] }> = {
  sour: { border: '#7B75BB', colors: ['rgba(80,76,118,0.48)', '#000'], locations: [0, 0.5346] },
  'girl-in-love': { border: '#759FBB', colors: ['rgba(117,159,187,0.32)', 'rgba(117,159,187,0)'], locations: [0, 0.719] },
  pretty: { border: '#759FBB', colors: ['rgba(117,159,187,0.32)', 'rgba(117,159,187,0)'], locations: [0, 0.7186] },
  newbie: { border: '#759FBB', colors: ['rgba(117,159,187,0.32)', 'rgba(117,159,187,0)'], locations: [0, 0.7186] },
}

/** Front/focused "Your Favorite Lyrics" card — pinned per era, flanked by Can't Catch Me Now + Drivers License. */
const CANT_CATCH_ME_NOW = OLIVIA_FAVORITE_LYRICS.find(i => i.id === 'cant-catch-me-now')!
const DRIVERS_LICENSE = OLIVIA_FAVORITE_LYRICS.find(i => i.id === 'drivers-license')!
const ERA_LYRIC_FRONT: Record<HannahJourneyEraId, LyricStackItem> = {
  sour: OLIVIA_FAVORITE_LYRICS.find(i => i.id === 'deja-vu')!,
  'girl-in-love': OLIVIA_FAVORITE_LYRICS_HANNAH_JOURNEY_EXTRA.maggotsForBrain,
  pretty: OLIVIA_FAVORITE_LYRICS_HANNAH_JOURNEY_EXTRA.vampireBigMistakes,
  newbie: OLIVIA_FAVORITE_LYRICS_HANNAH_JOURNEY_EXTRA.vampireSorryForThem,
}
/** "by 12k {label}" on the front lyric card — Figma says "superfans" only for the sour state. */
const ERA_LYRIC_FANS_LABEL: Record<HannahJourneyEraId, string> = {
  sour: 'superfans',
  'girl-in-love': 'fans',
  pretty: 'fans',
  newbie: 'fans',
}

/** Engaged card bg — Olivia with stickers (Figma imgFirstPlayV2). */
const highlightCardBg = require('../../../assets/hannah-journey/you-and-olivia-engaged-asset-03.png')
const superfanHeroPhoto = require('../../../assets/hannah-journey/you-and-olivia-superfan-sour-asset-08.png')
const shareGlyph = require('../../../assets/hannah-journey/superfan-reveal-popup-share.png')

/**
 * Era content background — true radial gradient (react-native-svg), matching the
 * Figma inspector reading for the era-content container fill: type "Radial",
 * stop @ 18% = era color (opacity 100%), stop @ 100% = #000000 (opacity 100%).
 * Per-era inner-stop color, cross-checked against each era's extracted Figma
 * spec (`design_iterations/final_prototype_draft/specs/you-and-olivia-superfan-*.spec.md`,
 * section 5 "Era detail content block"): the spec's multi-stop gradient lists
 * are just linearly-interpolated samples of this same 2-stop 18%→100% ramp
 * (e.g. pretty's 38.2% stop `#252361` = lerp(#312E81, #000, (38.2-18)/(100-18))),
 * confirming these are the authoritative inner colors, not the 5-stop
 * approximation this file used before react-native-svg was available.
 */
const ERA_CONTENT_GLOW_COLOR: Record<HannahJourneyEraId, string> = {
  sour: '#7B75BB',
  'girl-in-love': '#759FBB',
  pretty: '#312E81', // Figma inspector ground truth (screenshot), matches spec.md exactly
  newbie: '#312E81', // Figma node 3080:41834 uses the same radial stops as pretty
}

/** Figma glow origin (~x117, y141) inside the 402pt-wide design frame — scaled by device width. */
const FIGMA_FRAME_W = 402
const GLOW_ORIGIN_X = 117
const GLOW_ORIGIN_Y = 141

const ERA_PLAYED: Record<HannahJourneyEraId, { id: string; title: string; explicit?: boolean }[]> = {
  'girl-in-love': [
    { id: 's-or8', title: 'honeybee', explicit: true },
    { id: 's-or-new1', title: 'so american', explicit: true },
    { id: 's-or10', title: 'maggots for brain', explicit: true },
  ],
  sour: [
    { id: 's-or-sour-02', title: 'traitor', explicit: true },
    { id: 's-or4', title: 'vampire', explicit: true },
    { id: 's-or3', title: 'deja vu', explicit: true },
  ],
  pretty: [
    { id: 's-or-sour-01', title: 'brutal', explicit: true },
    { id: 's-or4', title: 'vampire', explicit: true },
    { id: 's-or5', title: 'get him back!', explicit: true },
  ],
  newbie: [
    { id: 's-or-sour-02', title: 'traitor', explicit: true },
    { id: 's-or-sour-05', title: 'happier', explicit: true },
    { id: 's-or2', title: 'good 4 u', explicit: true },
  ],
}

// `id` resolves to a real entry in src/data/mockData.ts's `playlists` array so
// every "Playlists Similar to this Era" card lands on a populated /playlist/[id]
// page instead of doing nothing on tap. Two eras share the "A girl in love"
// title (different card art) and both intentionally point at the same
// playlist id — same title, same destination.
const ERA_PLAYLISTS: Record<HannahJourneyEraId, { title: string; artKey: string; id: string }[]> = {
  'girl-in-love': [
    { title: 'Pop girl hits', artKey: 'olivia-rodrigo-girl-in-love', id: 'pl-hj-pop-girl-hits' },
    { title: 'Spring tunes', artKey: 'olivia-rodrigo-pretty-sad', id: 'pl-hj-spring-tunes' },
    { title: 'Accidentally in love', artKey: 'olivia-rodrigo-deja-vu-mirror', id: 'pl-hj-accidentally-in-love' },
  ],
  sour: [
    { title: 'A girl in love', artKey: 'olivia-rodrigo-girl-in-love', id: 'pl-hj-girl-in-love' },
    { title: 'you seem pretty sad', artKey: 'olivia-rodrigo-pretty-sad', id: 'pl-hj-pretty-sad' },
    { title: 'A girl in love', artKey: 'olivia-rodrigo-petty-bw', id: 'pl-hj-girl-in-love' },
  ],
  pretty: [
    { title: 'Obsessed', artKey: 'olivia-rodrigo-guts', id: 'pl-hj-obsessed' },
    { title: 'On dnd', artKey: 'olivia-rodrigo-sour', id: 'pl-hj-on-dnd' },
    { title: 'I love your guts', artKey: 'olivia-rodrigo-guts-sticker', id: 'pl-hj-love-your-guts' },
  ],
  newbie: [
    { title: 'summer time', artKey: 'olivia-rodrigo-sour', id: 'pl-hj-summer-time' },
    { title: 'feel good playlist', artKey: 'olivia-rodrigo-girl-in-love', id: 'pl-hj-feel-good' },
  ],
}

const ERA_PLAYED_SECTION: Record<HannahJourneyEraId, string> = {
  'girl-in-love': 'What you’ve been playing',
  sour: 'What You Played Back Then',
  pretty: 'What You Played Back Then',
  newbie: 'What You Played Back Then',
}

const ERA_FIRST_PLAY_DATE: Record<HannahJourneyEraId, string> = {
  'girl-in-love': '13 March 2019',
  sour: '13 March 2021',
  pretty: '13 March 2019',
  newbie: '13 March 2019',
}

// The "All Time Favorite" card is deliberately stage- and era-independent —
// it's her single most-played Olivia track across the whole relationship, so
// it stays the same while the era-scoped cards above it change.
const ALL_TIME_FAVORITE = {
  title: 'vampire',
  album: 'GUTS',
  artKey: 'olivia-rodrigo-guts',
  plays: 482,
} as const

function resolveArt(key: string) {
  return albumArtAssets[key] ?? oliviaPageAssets.profile
}

/**
 * Hannah Journey–only You & Olivia content.
 * Engaged: Time Together / Favorite Lyrics / All Time Favorite / Where it Started.
 * Superfan: Top 3% hero + era carousel + era-scoped sections (Figma Sour/Pretty/Girl in Love).
 */
export default function HannahJourneyYouAndOlivia({
  onPlayTrack,
}: {
  onPlayTrack?: (title: string) => void
}) {
  const router = useRouter()
  const { open: openMenu } = useAdaptiveMenu()
  const { toggleLike } = useLikedSongs()
  const { stage, selectedEraId, selectedEra, setSelectedEraId } = useHannahJourney()
  const isSuperfan = stage === 'superfan'
  const eraPlaylists = ERA_PLAYLISTS[selectedEraId]
  const seasonLabel = selectedEra.season.toUpperCase()
  const playedThen = ERA_PLAYED[selectedEraId]
  const songListStyle = ERA_SONG_LIST_STYLE[selectedEraId]
  const lyricItems = isSuperfan
    ? [ERA_LYRIC_FRONT[selectedEraId], CANT_CATCH_ME_NOW, DRIVERS_LICENSE]
    : OLIVIA_FAVORITE_LYRICS

  // Timeline's active dot — a single marker that slides between era
  // positions instead of each dot toggling size independently, so tapping a
  // different era visibly "drags" the dot across the connector line.
  const selectedEraIndex = HANNAH_JOURNEY_ERAS.findIndex(e => e.id === selectedEraId)
  const activeDotX = useSharedValue(
    Math.max(selectedEraIndex, 0) * (ERA_CARD_W + ERA_RAIL_GAP) + ERA_CARD_W / 2 - 6,
  )
  useEffect(() => {
    const targetX = Math.max(selectedEraIndex, 0) * (ERA_CARD_W + ERA_RAIL_GAP) + ERA_CARD_W / 2 - 6
    activeDotX.value = withTiming(targetX, { duration: 320, easing: Easing.out(Easing.cubic) })
  }, [selectedEraIndex, activeDotX])
  const activeDotStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: activeDotX.value }],
  }))

  // The era-content section's height is dynamic (era-scoped song lists/lyrics/
  // playlists), so the SVG radial gradient's pixel dimensions are measured via
  // onLayout rather than assumed — RN's SVG gradients need explicit px, unlike
  // CSS which can size against a fluid parent. Width defaults to the device
  // width (full-bleed) so the very first paint is already correct; height
  // defaults to a generous placeholder until the real layout lands.
  const [eraContentSize, setEraContentSize] = useState({ width: SCREEN_W, height: 900 })
  const glowScale = eraContentSize.width / FIGMA_FRAME_W
  const glowCx = GLOW_ORIGIN_X * glowScale
  const glowCy = GLOW_ORIGIN_Y * glowScale
  // Farthest-corner radius (mirrors CSS/Figma's default radial-gradient sizing)
  // so the 100%-offset stop lands exactly at the corner furthest from the glow
  // origin, with every other point inside the container at a lesser offset.
  const glowR = Math.max(
    Math.hypot(glowCx - 0, glowCy - 0),
    Math.hypot(glowCx - eraContentSize.width, glowCy - 0),
    Math.hypot(glowCx - 0, glowCy - eraContentSize.height),
    Math.hypot(glowCx - eraContentSize.width, glowCy - eraContentSize.height),
  )
  // Small decorative blob (not the full-bleed wash `glowR` above computes) —
  // a compact circle that fades out well before the container edge. Kept at
  // the Figma-derived 165: widening it to 195 pushed the falloff into the
  // timeline area, where the container clips it into a visible hard edge
  // instead of reading as a soft spread.
  const glowBlobR = 165 * glowScale

  if (stage === 'new-listener') {
    return (
      <View style={s.emptyWrap}>
        <Text style={s.emptyTitle}>Follow Olivia to unlock You & Olivia</Text>
        <Text style={s.emptySub}>Your personal journey starts once you follow.</Text>
      </View>
    )
  }

  const eraContent = (
    <>
      {isSuperfan && (
        <View style={s.block}>
          <Text style={s.eraSeasonLabel}>{seasonLabel}</Text>
          <Text style={s.eraHeroTitle}>{ERA_HEADER_TITLE[selectedEraId]}</Text>
          <Text style={s.eraDesc}>{selectedEra.description}</Text>
        </View>
      )}

      <View style={s.block}>
        <View style={s.rowBetween}>
          <Text style={s.sectionTitle}>Time You Spent Together</Text>
          <Image source={shareGlyph} style={s.shareGlyphSm} resizeMode="contain" />
        </View>
        <View style={s.statsCard}>
          <LinearGradient
            colors={['rgba(0,0,0,0)', '#000']}
            locations={[0.226, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={s.statCol}>
            <Text style={s.statLabel}>Minutes Listened</Text>
            <Text style={s.statNum}>
              {isSuperfan ? selectedEra.minutesListened : 1204}
            </Text>
          </View>
          <View style={s.statCol}>
            <Text style={s.statLabel}>Longest Streaks</Text>
            <View style={s.statNumRow}>
              <Text style={s.statNum}>{isSuperfan ? selectedEra.streakDays : 47}</Text>
              <Text style={s.statUnit}>Days</Text>
            </View>
          </View>
          <View style={s.statCol}>
            <Text style={s.statLabel}>Among Friends</Text>
            <Text style={s.statNum}>
              {isSuperfan ? selectedEra.friendsRank : '#4'}
            </Text>
          </View>
        </View>
      </View>

      {isSuperfan && (
        <View style={s.block}>
          <View style={s.rowBetween}>
            <Text style={s.sectionTitle}>{ERA_PLAYED_SECTION[selectedEraId]}</Text>
            <Text style={s.seeMore}>SEE MORE</Text>
          </View>
          {/* The "most played song" highlight card that used to sit here was
              removed — the All Time Favorite section further down now carries
              that claim, so the era block is just the track list. */}
          <View style={[s.songListCard, { borderColor: songListStyle.border }]}>
            <LinearGradient
              colors={songListStyle.colors}
              locations={songListStyle.locations}
              style={StyleSheet.absoluteFill}
            />
            {playedThen.map(row => {
              const song = allSongs.find(sg => sg.id === row.id)
              // Superfan-era songs render as already-loved (filled cyan heart) per
              // Figma, independent of the global liked-songs state.
              const liked = true
              return (
                <TouchableOpacity
                  key={row.id}
                  style={s.songRow}
                  activeOpacity={0.8}
                  onPress={() => onPlayTrack?.(row.title)}
                >
                  <Image
                    source={resolveArt(song?.albumArtPath ?? selectedEra.artKey)}
                    style={s.sfSongThumb}
                    resizeMode="cover"
                  />
                  <View style={{ flex: 1 }}>
                    <View style={s.songTitleRow}>
                      <Text style={s.songTitle} numberOfLines={1}>{row.title}</Text>
                      {row.explicit && (
                        <View style={s.eTag}><Text style={s.eTagText}>E</Text></View>
                      )}
                    </View>
                    <Text style={s.songMeta}>Olivia Rodrigo</Text>
                  </View>
                  <TouchableOpacity onPress={() => toggleLike(row.id)} hitSlop={8}>
                    <Ionicons name={liked ? 'heart' : 'heart-outline'} size={24} color={liked ? C.cyan : '#fff'} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => song && openMenu({ kind: 'song', song })}
                    hitSlop={8}
                  >
                    <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
                  </TouchableOpacity>
                </TouchableOpacity>
              )
            })}
            <TouchableOpacity
              style={s.mixBtn}
              activeOpacity={0.85}
              onPress={() => onPlayTrack?.(selectedEra.topTrackTitle)}
            >
              <Text style={s.mixBtnText}>Play Your Mix</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={s.block}>
        <View style={s.rowBetween}>
          <Text style={s.sectionTitle}>Your Favorite Lyrics</Text>
          <TouchableOpacity onPress={() => router.push('/artist-lyrics/olivia-rodrigo' as any)}>
            <Text style={s.seeMore}>SEE MORE</Text>
          </TouchableOpacity>
        </View>
        <View style={isSuperfan ? s.lyricStackBleed : undefined}>
          <LyricCardStack
            key={isSuperfan ? selectedEraId : 'engaged'}
            items={lyricItems}
            resolveArt={resolveArt}
            useItemGradientForFront={isSuperfan}
            frontHeartSize={isSuperfan ? 25 : undefined}
            fansLabel={isSuperfan ? ERA_LYRIC_FANS_LABEL[selectedEraId] : undefined}
            hideDots={isSuperfan}
            frontCardSize={isSuperfan ? { width: 240, height: 282 } : undefined}
            backCardSize={isSuperfan ? { width: 195, height: 249 } : undefined}
            backCardRotationDeg={isSuperfan ? 3 : undefined}
          />
        </View>
      </View>

      {isSuperfan && (
        <View style={s.block}>
          <Text style={s.sectionTitle}>Playlists Similar to this Era</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={s.bleedScroll}
            contentContainerStyle={s.playlistRail}
          >
            {eraPlaylists.map((pl, i) => (
              <TouchableOpacity
                key={`${pl.title}-${i}`}
                style={s.playlistCard}
                activeOpacity={0.85}
                onPress={() => router.push(`/playlist/${pl.id}` as any)}
              >
                <Image source={resolveArt(pl.artKey)} style={s.playlistArt} resizeMode="cover" />
                <Text style={s.playlistTitle} numberOfLines={1}>{pl.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* All Time Favorite — sits directly above "Where it started" on every
          You & Olivia view (engaged and every superfan era), per Figma node
          2976:27111. Unlike the era-scoped "played back then" card above, this
          one is all-time and so is fixed to the same track across stages. */}
      <View style={s.block}>
        <Text style={s.sectionTitle}>All Time Favorite</Text>
        <TouchableOpacity
          style={s.highlightCard}
          activeOpacity={0.85}
          onPress={() => onPlayTrack?.(ALL_TIME_FAVORITE.title)}
        >
          <Image
            source={highlightCardBg}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
          <Image source={resolveArt(ALL_TIME_FAVORITE.artKey)} style={s.highlightArt} />
          <View style={s.highlightMeta}>
            <Text style={s.highlightTag}>{ALL_TIME_FAVORITE.album}</Text>
            <Text style={s.highlightTitle} numberOfLines={1}>{ALL_TIME_FAVORITE.title}</Text>
            <Text style={s.highlightSub}>{ALL_TIME_FAVORITE.plays} Plays</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={s.block}>
        <Text style={s.sectionTitle}>Where it started</Text>
        <TouchableOpacity
          style={s.highlightCard}
          activeOpacity={0.85}
          onPress={() => onPlayTrack?.('Drivers License')}
        >
          {/* Same photo + purple gradient treatment for every stage/era —
              must render identically across all of them (Figma "first play
              v2": imgFirstPlayV2 photo, 40% black dim, then a left-to-right
              rgba(145,134,202,0.6)→transparent purple wash on top). */}
          <Image
            source={highlightCardBg}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />
          <LinearGradient
            colors={['rgba(145,134,202,0.6)', 'rgba(0,0,0,0)']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
          <Image source={resolveArt('olivia-rodrigo-sour')} style={s.highlightArt} />
          <View style={s.highlightMeta}>
            <Text style={[s.highlightTag, { color: C.cyan }]}>YOUR FIRST EVER PLAY</Text>
            <Text style={s.highlightTitle}>Drivers License</Text>
            <Text style={s.highlightSub}>
              {isSuperfan ? ERA_FIRST_PLAY_DATE[selectedEraId] : '13 March 2021'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </>
  )

  return (
    <View style={s.wrap}>
      <View style={s.content}>
        {isSuperfan && (
          <View style={s.superfanHeroOuter}>
            {/* Figma "superfan card / Property 1=compact" (node 2604:17841, 370x252)
                exports this fill as `linear-gradient(72.73deg, #DE909C 2.7313%,
                #A6A0C7 57.408%, #6DAFF1 110.15%)`. RN's LinearGradient start/end
                are box-relative fractions (not a true angle), so they're derived
                per the CSS gradient-line algorithm for a 370x252 box at 72.73deg,
                then extended past the box edge so location 1.0 lands at the
                stop's original 110.15% mark (matching Figma's soft, never-fully-
                reached blue) instead of clipping/reinterpolating the color. */}
            <LinearGradient
              colors={['#DE909C', '#A6A0C7', '#6DAFF1']}
              locations={[0.0248, 0.5212, 1]}
              start={{ x: -0.0525, y: 0.7521 }}
              end={{ x: 1.1646, y: 0.1967 }}
              style={s.superfanHeroPlate}
            />
            <TouchableOpacity
              style={s.superfanHeroGlass}
              activeOpacity={0.9}
              onPress={() => router.push('/insights' as any)}
            >
              <View style={s.superfanHeroInner}>
                <Image source={superfanHeroPhoto} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
                <LinearGradient
                  colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.32)']}
                  style={StyleSheet.absoluteFill}
                />
                <View style={s.sfTop}>
                  <View style={s.sfBadgeRow}>
                    <Image source={hannahJourneyAssets.superfanIcon} style={s.heartSparkleIcon} resizeMode="contain" />
                    <Text style={s.sfBadgeText}>Superfan</Text>
                  </View>
                  <Text style={s.sfSince}>Since July 2026</Text>
                </View>
                <View style={s.sfBottom}>
                  <View>
                    <Text style={s.sfHeadline}>Top 3% Listener</Text>
                    <Text style={s.sfSub}>among 4M+ listeners worldwide</Text>
                  </View>
                  <TouchableOpacity style={s.sfShare} activeOpacity={0.8}>
                    <Image source={shareGlyph} style={s.shareGlyph} resizeMode="contain" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {isSuperfan && (
          <View style={s.block}>
            <Text style={s.sectionTitle}>Your Journey with Olivia</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={s.bleedScroll}
              contentContainerStyle={s.eraRailScroll}
            >
              <View>
                <View style={s.eraRail}>
                  {HANNAH_JOURNEY_ERAS.map(era => {
                    const selected = era.id === selectedEraId
                    // Card 1 (girl-in-love, the "current" real-time era) always carries
                    // the purple glow; other cards only get it while selected.
                    const glow = era.id === 'girl-in-love' || selected
                    return (
                      <TouchableOpacity
                        key={era.id}
                        activeOpacity={0.85}
                        onPress={() => setSelectedEraId(era.id)}
                        style={[s.eraCard, glow && s.eraCardGlow, selected && s.eraCardSelectedBorder]}
                      >
                        <Image
                          source={ERA_CAROUSEL_ART[era.id]}
                          style={StyleSheet.absoluteFillObject}
                          resizeMode="cover"
                        />
                        {!selected && <View style={s.eraCardDim} />}
                        <LinearGradient
                          colors={['rgba(102,102,102,0)', 'rgba(0,0,0,0.6)']}
                          style={StyleSheet.absoluteFill}
                        />
                        {era.id === 'girl-in-love' && (
                          <Image
                            source={hannahJourneyAssets.superfanIcon}
                            style={s.eraCardCrest}
                            resizeMode="contain"
                          />
                        )}
                        <View style={s.eraCaption}>
                          <Text style={s.eraSeason} numberOfLines={1}>{era.season}</Text>
                          <Text style={s.eraTitle} numberOfLines={1} ellipsizeMode="tail">{era.title}</Text>
                          <Text style={s.eraBadge}>{era.badge}</Text>
                        </View>
                      </TouchableOpacity>
                    )
                  })}
                </View>
                <View style={s.eraTimeline}>
                  <View style={s.eraTimelineLead} />
                  <View
                    style={[
                      s.eraTimelineSolid,
                      { width: (HANNAH_JOURNEY_ERAS.length - 1) * (ERA_CARD_W + ERA_RAIL_GAP) },
                    ]}
                  />
                  <View style={s.eraTimelineRow}>
                    {HANNAH_JOURNEY_ERAS.map(era => (
                      <View key={era.id} style={s.eraTimelineCell}>
                        <View style={s.eraTimelineDot} />
                      </View>
                    ))}
                  </View>
                  {/* Single traveling marker — slides to whichever era is
                      selected instead of each dot toggling size on its own. */}
                  <Animated.View style={[s.eraTimelineDotActive, activeDotStyle]} />
                </View>
              </View>
            </ScrollView>
          </View>
        )}

        {isSuperfan ? (
          <View
            style={s.eraContentWrap}
            onLayout={e => {
              const { width, height } = e.nativeEvent.layout
              setEraContentSize(prev =>
                prev.width === width && prev.height === height ? prev : { width, height },
              )
            }}
          >
            {/* Small left-side gradient blob (not the full-bleed radial wash
                glowR was originally built for) — a soft circle of the era's
                accent color near where the era title sits, fading to nothing
                well inside the container. */}
            <Svg
              style={StyleSheet.absoluteFill}
              width={eraContentSize.width}
              height={eraContentSize.height}
              pointerEvents="none"
            >
              <Defs>
                <RadialGradient
                  id="eraGlowBlob"
                  cx={glowCx}
                  cy={glowCy}
                  r={glowBlobR}
                  gradientUnits="userSpaceOnUse"
                >
                  <Stop offset="0" stopColor={ERA_CONTENT_GLOW_COLOR[selectedEraId]} stopOpacity={1} />
                  <Stop offset="1" stopColor={ERA_CONTENT_GLOW_COLOR[selectedEraId]} stopOpacity={0} />
                </RadialGradient>
              </Defs>
              <Rect x={0} y={0} width={eraContentSize.width} height={eraContentSize.height} fill="url(#eraGlowBlob)" />
            </Svg>
            {eraContent}
          </View>
        ) : (
          eraContent
        )}
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  wrap: { position: 'relative', minHeight: 640, backgroundColor: '#000' },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40, gap: 24 },
  emptyWrap: { padding: 32, alignItems: 'center', gap: 8 },
  emptyTitle: {
    fontFamily: FONT_FAMILY_DISPLAY.bold,
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
  emptySub: {
    fontFamily: FONT_FAMILY_EMBER.regular,
    fontSize: 14,
    color: '#a6a6a6',
    textAlign: 'center',
  },
  eraContentWrap: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 24,
  },
  block: { gap: 12 },
  sectionTitle: {
    fontFamily: FONT_FAMILY_DISPLAY.bold,
    fontSize: 20,
    color: '#fff',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seeMore: {
    fontFamily: FONT_FAMILY_DISPLAY.bold,
    fontSize: 14,
    color: '#757575',
  },
  highlightCard: {
    height: 105,
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 10,
  },
  highlightArt: {
    width: 72,
    height: 72,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  highlightMeta: { flex: 1, gap: 2 },
  highlightTag: {
    fontFamily: FONT_FAMILY_DISPLAY.bold,
    fontSize: 12,
    color: '#fff',
    textTransform: 'uppercase',
  },
  highlightTitle: {
    fontFamily: FONT_FAMILY_EMBER.bold,
    fontSize: 16,
    color: '#fff',
  },
  highlightSub: {
    fontFamily: FONT_FAMILY_EMBER.regular,
    fontSize: 12,
    color: '#fff',
  },
  statsCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(0,0,0,0.7)',
    overflow: 'hidden',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCol: { flex: 1, paddingHorizontal: 4 },
  statLabel: {
    fontFamily: FONT_FAMILY_EMBER.regular,
    fontSize: 12,
    color: '#a6a6a6',
  },
  statNum: {
    fontFamily: FONT_FAMILY_DISPLAY.bold,
    fontSize: 32,
    color: '#fff',
  },
  statNumRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  statUnit: {
    fontFamily: FONT_FAMILY_DISPLAY.bold,
    fontSize: 12,
    color: '#fff',
    marginBottom: 6,
  },
  eraSeasonLabel: {
    fontFamily: FONT_FAMILY_DISPLAY.bold,
    fontSize: 12,
    color: C.cyan,
  },
  eraHeroTitle: {
    fontFamily: FONT_FAMILY_DISPLAY.bold,
    fontSize: 28,
    color: '#fff',
  },
  eraDesc: {
    fontFamily: FONT_FAMILY_EMBER.regular,
    fontSize: 12,
    lineHeight: 14.4,
    color: '#fff',
  },
  superfanHeroOuter: {
    borderRadius: 24,
    overflow: 'hidden',
    minHeight: 252,
    backgroundColor: '#000',
  },
  superfanHeroPlate: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
  },
  superfanHeroGlass: {
    margin: 0,
    padding: 8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: 'rgba(30,30,30,0.6)',
  },
  superfanHeroInner: {
    height: 216,
    borderRadius: 16,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'space-between',
  },
  sfTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sfBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heartSparkleIcon: { width: 27, height: 24 },
  sfBadgeText: {
    fontFamily: FONT_FAMILY_EMBER.bold,
    fontSize: 16,
    color: '#fff',
  },
  sfSince: {
    fontFamily: FONT_FAMILY_EMBER.regular,
    fontSize: 12,
    color: '#fff',
  },
  sfBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  sfHeadline: {
    fontFamily: FONT_FAMILY_DISPLAY.bold,
    fontSize: 28,
    color: '#fff',
  },
  sfSub: {
    fontFamily: FONT_FAMILY_EMBER.regular,
    fontSize: 16,
    color: '#fff',
  },
  sfShare: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareGlyph: { width: 12.5, height: 16 },
  shareGlyphSm: { width: 14, height: 18 },
  // Rails that bleed to the screen edge: the ScrollView itself cancels the
  // section's paddingHorizontal:16 (marginHorizontal -16); contentContainerStyle
  // restores the LEFT edge only, leaving the right edge open so the last card
  // can be clipped by the screen edge (Figma's scroll affordance).
  bleedScroll: { marginHorizontal: -16 },
  eraRailScroll: { paddingLeft: 16 },
  eraRail: { flexDirection: 'row', gap: 12, paddingVertical: 4 },
  eraCard: {
    width: ERA_CARD_W,
    height: ERA_CARD_H,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  eraCardDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  eraCardGlow: {
    shadowColor: 'rgba(127,119,215,0.45)',
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  eraCardSelectedBorder: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  /** 48px superfan crest — pinned to the girl-in-love (current era) card only. */
  eraCardCrest: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 32,
    height: 32,
  },
  // Figma nodes 3080:41166/40938/41606/41834 ("Your Journey with Olivia"
  // timeline, all 4 era states): a short DOTTED lead segment runs from the
  // left edge up to the "now" dot's fixed position (nothing traveled yet
  // beyond it), then ONE continuous SOLID line runs underneath every dot
  // from "now" through the oldest era — its start/end never moves, only the
  // dots' big/small state changes as selectedEraId changes. Both lines are
  // absolutely positioned behind eraTimelineRow so their length isn't at the
  // mercy of each cell's per-child layout (the earlier per-cell-border
  // connector was only ~12px wide inside a 120px cell with no flexDirection
  // set, so it rendered as a short stub stacked under the dot instead of
  // reaching the next one — the bug reported live on device).
  eraTimeline: { position: 'relative', height: 16, marginTop: 10 },
  eraTimelineLead: {
    position: 'absolute',
    left: 0,
    top: 8,
    width: ERA_CARD_W / 2 - 8,
    height: 0,
    borderTopWidth: 1,
    borderStyle: 'dotted',
    borderColor: 'rgba(255,255,255,0.5)',
  },
  eraTimelineSolid: {
    position: 'absolute',
    left: ERA_CARD_W / 2,
    top: 8,
    height: 0,
    borderTopWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(255,255,255,0.5)',
  },
  // gap must match eraRail's gap above — the traveling dot's translateX math
  // (index * (ERA_CARD_W + ERA_RAIL_GAP) + ...) assumes cells are spaced with
  // this same gap. Without it, cells pack edge-to-edge and every era past the
  // first drifts another ERA_RAIL_GAP px right of where the dot lands.
  eraTimelineRow: { flexDirection: 'row', alignItems: 'center', height: 16, gap: ERA_RAIL_GAP },
  eraTimelineCell: { width: ERA_CARD_W, alignItems: 'center' },
  eraTimelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.85)',
  },
  // Absolutely positioned — animated via translateX (activeDotStyle) instead
  // of being one of the flex row's per-cell children.
  eraTimelineDotActive: {
    position: 'absolute',
    left: 0,
    top: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 0,
    backgroundColor: '#fff',
  },
  eraCaption: {
    backgroundColor: 'rgba(30,30,30,0.56)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  eraSeason: {
    fontFamily: FONT_FAMILY_EMBER.regular,
    fontSize: 12,
    color: '#a6a6a6',
  },
  eraTitle: {
    fontFamily: FONT_FAMILY_EMBER.bold,
    fontSize: 16,
    color: '#fff',
  },
  eraBadge: {
    fontFamily: FONT_FAMILY_EMBER.regular,
    fontSize: 12,
    color: '#fff',
  },
  songListCard: {
    backgroundColor: '#000',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#7B75BB',
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 12,
    gap: 0,
  },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  songThumb: {
    width: 56,
    height: 56,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  sfSongThumb: {
    width: 63,
    height: 63,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  songTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  songTitle: {
    fontFamily: FONT_FAMILY_EMBER.bold,
    fontSize: 16,
    color: '#fff',
    flexShrink: 1,
  },
  songMeta: {
    fontFamily: FONT_FAMILY_EMBER.regular,
    fontSize: 12,
    color: '#a6a6a6',
    marginTop: 2,
  },
  eTag: {
    backgroundColor: '#a6a6a6',
    borderRadius: 3,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eTagText: { fontSize: 9, fontWeight: '700', color: '#000' },
  mixBtn: {
    borderWidth: 1,
    borderColor: '#a6a6a6',
    borderRadius: 32,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  mixBtnText: {
    fontFamily: FONT_FAMILY_EMBER.regular,
    fontSize: 12,
    color: '#fff',
  },
  playlistRail: { gap: 13, paddingLeft: 16 },
  playlistCard: { width: 173 },
  playlistArt: {
    width: 173,
    height: 173,
    borderRadius: 8,
    borderWidth: 0.75,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  playlistTitle: {
    fontFamily: FONT_FAMILY_EMBER.bold,
    fontSize: 16,
    color: '#fff',
    marginTop: 6,
  },
  lyricStackBleed: { marginHorizontal: -16 },
})
