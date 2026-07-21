// Shared small widgets used by the "Current session" header and "You and your
// favorites" cards on both the adaptive persona home and the casual home.
import { useRef, useEffect } from 'react'
import { View, TouchableOpacity, Animated, Easing, StyleSheet, ImageBackground, Platform, ScrollView } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '../AppText'
import { AppImage as Image } from '../AppImage'
import { EdgeFadeRow } from '../EdgeFadeRow'
import { albumArtAssets, logoAssets } from '../../data/assetMap'
import { SHOWS_YOU_WATCH } from '../../data/showsYouWatch'
import { C, typeHeadline, FONT_FAMILY_EMBER } from '../../theme'

const DAYS_IN_MONTH = 30
const HEATMAP_COLS = 15

// Deterministic (non-random) "listening level" day-dots — flavor visualization
// for the "You and your favorites" cards, seeded off the card's index so it's
// stable across re-renders instead of reshuffling every frame. One circular
// dot per day of the month, wrapped into two rows:
//   - today is the single teal dot (Amazon Music brand teal, not a generic blue)
//   - days before today are white, dimmer/brighter by how much you listened
//   - days after today haven't happened yet, so they sit barely-visible gray
// "Today" is nudged 3 days ahead of the real date so the card always has a
// decent stretch of past (white, engagement-graded) days to show off.
export function ListeningHeatmap({ seed }: { seed: number }) {
  const currentDay = Math.min(new Date().getDate() + 3, DAYS_IN_MONTH) // 1-indexed day of month
  const days = Array.from({ length: DAYS_IN_MONTH }, (_, day) => {
    const dayNumber = day + 1
    if (dayNumber === currentDay) return { backgroundColor: C.cyan, opacity: 1 }
    if (dayNumber > currentDay) return { backgroundColor: '#fff', opacity: 0.08 }
    const n = (seed * 31 + day * 13) % 10
    return { backgroundColor: '#fff', opacity: 0.22 + (n / 9) * 0.78 }
  })
  const rows = [days.slice(0, HEATMAP_COLS), days.slice(HEATMAP_COLS)]
  return (
    <View style={s.heatmapGrid}>
      {rows.map((row, r) => (
        <View key={r} style={s.heatmapRow}>
          {row.map((dotStyle, day) => (
            <View key={day} style={[s.heatmapDot, dotStyle]} />
          ))}
        </View>
      ))}
    </View>
  )
}

// Animated "now playing" equalizer bars — matches the Figma waveform icon next
// to the "Current session" title (a Lottie audio-wave asset there; a lightweight
// looping bar animation stands in for it here).
export function AudioWaveIcon({ color, height = 16 }: { color: string; height?: number }) {
  const bars = useRef([0, 1, 2, 3].map(() => new Animated.Value(0.35))).current
  useEffect(() => {
    const loops = bars.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: 380 + i * 70, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(v, { toValue: 0.3, duration: 380 + i * 70, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      ),
    )
    const timers = loops.map((loop, i) => setTimeout(() => loop.start(), i * 90))
    return () => {
      timers.forEach(clearTimeout)
      loops.forEach(loop => loop.stop())
    }
  }, [bars])
  return (
    <View style={[s.waveIcon, { height }]}>
      {bars.map((v, i) => (
        <Animated.View key={i} style={[s.waveBar, { backgroundColor: color, transform: [{ scaleY: v }] }]} />
      ))}
    </View>
  )
}

// "Playlists for every mood" rail card — a full-bleed blurred cover behind a
// smaller crisp cover ("picture in the middle"), same glossy background
// treatment as the Now Playing screen / playlist hero (BlurredArtBackground),
// scaled down for a rail card. The bottom-right list-outline badge is the
// same affordance pattern as the radio rail's badge, so a playlist card
// reads as clearly as a station card does.
const MOOD_CARD_RAIL_SIZE = 150

/** TV-show soundtrack playlists — shared across baseline and persona homes. */
export function ShowsYouWatchRail({ title = 'Songs from Shows You Watch' }: { title?: string }) {
  const router = useRouter()
  return (
    <View style={s.showsBlock}>
      <Text style={s.showsSectionTitle}>{title}</Text>
      <EdgeFadeRow>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          nestedScrollEnabled
          contentContainerStyle={s.showsRail}
        >
          {SHOWS_YOU_WATCH.map(show => {
            const art = albumArtAssets[show.bannerKey] ?? null
            return (
              <TouchableOpacity
                key={show.id}
                style={s.showCard}
                activeOpacity={0.85}
                onPress={() => router.push(`/playlist/${show.playlistId}` as any)}
              >
                <View style={s.showImageWrap}>
                  {art ? (
                    <Image source={art} style={s.showImage} resizeMode="cover" />
                  ) : (
                    <View style={[s.showImage, { backgroundColor: show.accentColor }]} />
                  )}
                  <LinearGradient
                    colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.88)']}
                    style={s.showGradient}
                    pointerEvents="none"
                  />
                  <View style={s.showTextWrap}>
                    <Text style={s.showTitle} numberOfLines={2}>{show.title}</Text>
                    <Text style={s.showSubtitle} numberOfLines={1}>{show.subtitle}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </EdgeFadeRow>
    </View>
  )
}

export function PlaylistMoodCard({
  name,
  artKey,
  onPress,
  onLongPress,
  delayLongPress,
  width = MOOD_CARD_RAIL_SIZE,
}: {
  name: string
  artKey: string
  onPress: () => void
  onLongPress?: () => void
  delayLongPress?: number
  /** Card width — defaults to 150 for horizontal rails; pass a grid column width for 2-up layouts */
  width?: number
}) {
  const art = albumArtAssets[artKey] ?? null
  const innerSize = Math.round(width * (86 / MOOD_CARD_RAIL_SIZE))
  return (
    <TouchableOpacity
      style={[s.moodCard, { width }]}
      activeOpacity={0.85}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={onLongPress ? (delayLongPress ?? 400) : undefined}
    >
      <View style={[s.moodArtWrap, { width, height: width }]}>
        {art ? (
          <ImageBackground
            source={art}
            style={StyleSheet.absoluteFill}
            // Web: explicit CSS blur + overscale (react-native-web's blurRadius
            // leaves hard vignette edges); the wrap clips via overflow hidden.
            imageStyle={
              Platform.OS === 'web'
                ? ({ filter: 'blur(16px)', transform: [{ scale: 1.2 }] } as any)
                : undefined
            }
            resizeMode="cover"
            blurRadius={Platform.OS === 'web' ? undefined : Platform.OS === 'ios' ? 24 : 14}
          >
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.42)' }]} />
          </ImageBackground>
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: C.surface }]} />
        )}
        <View style={[s.moodArtInner, { width: innerSize, height: innerSize }]}>
          {art ? (
            <Image source={art} style={{ width: innerSize, height: innerSize }} resizeMode="cover" />
          ) : (
            <View style={[{ width: innerSize, height: innerSize, backgroundColor: C.elevated, alignItems: 'center', justifyContent: 'center' }]}>
              <Ionicons name="musical-notes" size={20} color="rgba(255,255,255,0.3)" />
            </View>
          )}
        </View>
        <View style={s.moodBadge}>
          <Ionicons name="list-outline" size={15} color="#fff" />
        </View>
      </View>
      <Text style={s.moodTitle} numberOfLines={1}>{name}</Text>
    </TouchableOpacity>
  )
}

const MIX_CARD_SIZE = 150

/**
 * "My Mixes" card — full-bleed artist/album photo with the mix name set
 * directly on the image (Amazon Ember, bold) and a small white Amazon Music
 * mark in the top-right corner. Distinct from PlaylistMoodCard's blurred-
 * background-behind-a-crisp-inset-cover look — a mix reads as a single named
 * "world" (like the old "Saturday Morning" / mood cards), not a browsable
 * category, so the photo fills the whole card.
 */
export function MixCard({
  name,
  artKey,
  onPress,
  width = MIX_CARD_SIZE,
}: {
  name: string
  artKey?: string
  onPress: () => void
  width?: number
}) {
  const art = artKey ? albumArtAssets[artKey] ?? null : null
  return (
    <TouchableOpacity style={[s.mixCard, { width, height: width }]} activeOpacity={0.85} onPress={onPress}>
      {art ? (
        <Image source={art} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: C.surface }]} />
      )}
      <LinearGradient
        colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.82)']}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <Image source={logoAssets.amIcon} style={s.mixLogo} resizeMode="contain" tintColor="#fff" />
      <Text style={s.mixName} numberOfLines={3}>{name}</Text>
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  heatmapGrid: { gap: 3 },
  heatmapRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  heatmapDot: { width: 6, height: 6, borderRadius: 3 },
  waveIcon: { flexDirection: 'row', alignItems: 'center', gap: 3, marginLeft: 8 },
  waveBar: { width: 3, height: '100%', borderRadius: 2 },

  moodCard: {},
  moodArtWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodArtInner: {
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  moodBadge: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodTitle: { fontSize: 14, fontWeight: '600', color: '#fff', marginTop: 8 },

  mixCard: {
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: 12,
  },
  mixLogo: { position: 'absolute', top: 10, right: 10, width: 22, height: 22 },
  // "Amazon Ember" specifically, not Ember Modern — matches the earlier
  // mood-card text style this design is bringing back with real photos.
  mixName: { fontFamily: FONT_FAMILY_EMBER.bold, fontSize: 19, color: '#fff', lineHeight: 22 },

  showsBlock: { marginBottom: 42 },
  showsSectionTitle: { ...typeHeadline(20), color: '#fff', marginBottom: 14, paddingHorizontal: 16 },
  showsRail: { paddingHorizontal: 16, gap: 12 },
  showCard: { width: 160 },
  showImageWrap: { position: 'relative', borderRadius: 12, overflow: 'hidden' },
  showImage: { width: 160, height: 220, borderRadius: 12 },
  showGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 90 },
  showTextWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10 },
  showTitle: { fontSize: 14, fontWeight: '700', color: '#fff', lineHeight: 18, marginBottom: 2 },
  showSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.72)' },
})
