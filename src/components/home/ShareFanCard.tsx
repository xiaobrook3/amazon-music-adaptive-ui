import { forwardRef } from 'react'
import { View, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '../AppText'
import { AppImage as Image } from '../AppImage'
import { tintFromHue } from '../../utils/color'

const GOLD = '#f0c744'
const CARD_W = 320
const CARD_H = 420

export type ShareFanCardProps = {
  artistName: string
  fanLabel: string
  /** Theme hue (hex or rgba string) — keeps the card's color adaptive per
   *  persona instead of hardcoded to one brand color. */
  hue: string
  heroArt: number | { uri: string } | null
}

/**
 * Off-screen, capturable "Top Fan" share card — rendered invisibly in the
 * tree and grabbed via react-native-view-shot when the TOP 1% FAN badge is
 * long-pressed. `ref` must land on a plain View (not a custom component) so
 * captureRef can measure it.
 */
const ShareFanCard = forwardRef<View, ShareFanCardProps>(function ShareFanCard(
  { artistName, fanLabel, hue, heroArt },
  ref,
) {
  return (
    <View ref={ref} collapsable={false} style={s.card}>
      {heroArt ? (
        <Image source={heroArt} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: tintFromHue(hue, 0.9) }]} />
      )}
      <LinearGradient
        colors={[tintFromHue(hue, 0.05), tintFromHue(hue, 0.55), 'rgba(0,0,0,0.94)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={s.top}>
        <View style={s.badge}>
          <Ionicons name="star" size={13} color={GOLD} />
          <Text style={s.badgeText} numberOfLines={1}>{fanLabel}</Text>
        </View>
      </View>

      <View style={s.bottom}>
        <Text style={s.artistName} numberOfLines={2}>{artistName}</Text>
        <Text style={s.brand}>amazon music</Text>
        <Text style={s.studioCredit}>Derbc Studios</Text>
      </View>
    </View>
  )
})

export default ShareFanCard

const s = StyleSheet.create({
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  top: { position: 'absolute', top: 24, left: 24 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: { fontSize: 12, fontWeight: '800', color: GOLD, letterSpacing: 0.5 },
  bottom: { position: 'absolute', left: 24, right: 24, bottom: 24 },
  artistName: { fontSize: 28, fontWeight: '800', color: '#fff' },
  brand: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.85)', marginTop: 10, textTransform: 'uppercase', letterSpacing: 1.5 },
  studioCredit: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.5)', marginTop: 2, letterSpacing: 0.8 },
})
