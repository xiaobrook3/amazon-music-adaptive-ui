import { forwardRef } from 'react'
import { View, StyleSheet, type ImageSourcePropType } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Text } from './AppText'
import { AppImage as Image } from './AppImage'

export const FAN_CARD_MAIN_MAX = 30
export const FAN_CARD_SUB_MAX = 50
export const FAN_CARD_DEFAULT_MAIN = 'SUPER FAN'
export const FAN_CARD_DEFAULT_SUB = 'Amazon Music'

const CARD_W = 320
const CARD_H = 440

// Fixed, vibrant multi-stop palette instead of true per-pixel color
// extraction from the photo (would need a native image-analysis library) —
// still reads as "flavorful/rainbow," and the photo itself carries the real
// color since it's the full-bleed background.
const RAINBOW_GRADIENT = ['#FF5C8A', '#B24BF3', '#4B7BF5', '#28D4C4', '#F5C518'] as const

export type SuperFanCardProps = {
  /** The user's own camera/library photo, OR a bundled artist image
   *  (require()'d from assetMap) — either works as an Image source. */
  imageSource: ImageSourcePropType | null
  /** Auto-stamped at capture time, e.g. "MARCH 2026" — not user-typed. */
  dateLabel: string
  mainText?: string
  subText?: string
}

/**
 * Off-screen, capturable "make your own Super Fan card" — a photo-booth-style
 * party card. Ref must land on a plain View so react-native-view-shot can
 * capture it (see AdaptivePersonaHome.tsx's handleShareFanCard for the same
 * capture+share pattern this reuses).
 */
const SuperFanCard = forwardRef<View, SuperFanCardProps>(function SuperFanCard(
  { imageSource, dateLabel, mainText, subText },
  ref,
) {
  const main = mainText?.trim() || FAN_CARD_DEFAULT_MAIN
  const sub = subText?.trim() || FAN_CARD_DEFAULT_SUB

  return (
    <View ref={ref} collapsable={false} style={s.card}>
      {imageSource ? (
        <Image source={imageSource} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#1a1a1a' }]} />
      )}

      {/* Rainbow frame */}
      <LinearGradient
        colors={RAINBOW_GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.rainbowFrame}
      />
      <View style={s.photoInset}>
        {imageSource ? (
          <Image source={imageSource} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
            <Ionicons name="camera" size={32} color="rgba(255,255,255,0.4)" />
          </View>
        )}
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.88)']}
          locations={[0, 0.55, 1]}
          style={StyleSheet.absoluteFill}
        />

        <View style={s.top}>
          <View style={s.badge}>
            <Ionicons name="star" size={12} color="#1a1a1a" />
            <Text style={s.badgeText} numberOfLines={1}>SUPER FAN</Text>
          </View>
          <Text style={s.date}>{dateLabel}</Text>
        </View>

        <View style={s.bottom}>
          <Text style={s.mainText} numberOfLines={2}>{main}</Text>
          <Text style={s.subText} numberOfLines={2}>{sub}</Text>
          <Text style={s.brand}>amazon music</Text>
          <Text style={s.studioCredit}>Derbc Studios</Text>
        </View>
      </View>
    </View>
  )
})

export default SuperFanCard

const s = StyleSheet.create({
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  rainbowFrame: { ...StyleSheet.absoluteFillObject },
  photoInset: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: 6,
    bottom: 6,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#111',
  },
  top: {
    position: 'absolute',
    top: 18,
    left: 18,
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  badgeText: { fontSize: 11, fontWeight: '800', color: '#1a1a1a', letterSpacing: 0.5 },
  date: { fontSize: 12, fontWeight: '700', color: '#fff', letterSpacing: 0.5, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 },
  bottom: { position: 'absolute', left: 18, right: 18, bottom: 18 },
  mainText: { fontSize: 30, fontWeight: '800', color: '#fff', lineHeight: 34 },
  subText: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 6 },
  brand: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.75)', marginTop: 14, textTransform: 'uppercase', letterSpacing: 1.5 },
  studioCredit: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.45)', marginTop: 2, letterSpacing: 0.8 },
})
