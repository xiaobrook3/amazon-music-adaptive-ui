import { useRef, useState } from 'react'
import { Modal, View, TouchableOpacity, StyleSheet, Pressable, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import * as Sharing from 'expo-sharing'
import { captureRef } from 'react-native-view-shot'
import { MaterialIcons, Ionicons } from '@expo/vector-icons'
import { Text } from './AppText'
import { AppImage as Image } from './AppImage'
import { useProfiles } from '../context/ProfilesContext'
import { useAdaptiveUI } from '../context/AdaptiveUIContext'
import { FONT_FAMILY_DISPLAY, FONT_FAMILY_EMBER, C } from '../theme'
import { hannahJourneyAssets } from '../data/assetMap'

const CARD_W = 340
const CARD_H = 528
const GLASS_H = 489

const amLogo = require('../../assets/hannah-journey/superfan-reveal-popup-logo.png')

export type SuperfanCardStatIcon = 'history' | 'repeat' | 'library-music'

export type SuperfanCardStat = {
  icon: SuperfanCardStatIcon
  title: string
  subtitle: string
}

export type SuperfanCardModalData = {
  bg: number
  gradientColors: [string, string] | [string, string, string]
  since: string
  headline: string
  /** Full-length subline — the expanded card has room for the complete copy. */
  subline: string
  shareMessage: string
  stats: SuperfanCardStat[]
}

/**
 * The expanded "superfan card / Property 1=full" (Figma node 2604:17729,
 * 340x528) shown when a compact superfan card is tapped.
 *
 * This is the presentational twin of `hannah-journey/SuperfanRevealPopup` —
 * same card spec, but driven entirely by props and dismissible, so any surface
 * (Insights, artist pages) can expand its own card without inheriting the
 * journey reveal's stage-advancing CTA and Olivia-only copy.
 */
export default function SuperfanCardModal({
  card,
  visible,
  onClose,
}: {
  card: SuperfanCardModalData | null
  visible: boolean
  onClose: () => void
}) {
  const cardRef = useRef<View>(null)
  const [sharing, setSharing] = useState(false)
  const { activeProfile } = useProfiles()
  const { showConfirmation } = useAdaptiveUI()

  const handleShare = async () => {
    if (!cardRef.current || sharing || !card) return
    setSharing(true)
    try {
      // Let the share button unmount before capture so it isn't in the image.
      await new Promise<void>(resolve => setTimeout(resolve, 64))
      const uri = await captureRef(cardRef, { format: 'png', quality: 1, result: 'tmpfile' })
      if (!(await Sharing.isAvailableAsync())) {
        showConfirmation('Sharing is not available on this device')
        return
      }
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share your superfan card' })
    } catch {
      showConfirmation('Could not share your card — try again')
    } finally {
      setSharing(false)
    }
  }

  if (!card) return null

  const scale = Math.min(1, (Dimensions.get('window').width - 32) / CARD_W)
  const handle = `@${activeProfile.name.replace(/\s+/g, '').toLowerCase()}`

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.scrim} onPress={onClose}>
        {/* Inner press swallows taps so only the scrim dismisses. */}
        <Pressable style={[s.cardScale, { transform: [{ scale }] }]} onPress={() => {}}>
          <View ref={cardRef} style={s.card} collapsable={false}>
            {/* Gradient plate — start/end are the CSS gradient-line endpoints
                for a 340x528 box at 82.24deg, extended past the box edge so
                location 1.0 lands at the stop's true 110.15% mark. */}
            <LinearGradient
              colors={card.gradientColors}
              locations={card.gradientColors.length === 3 ? [0.0248, 0.5212, 1] : undefined}
              start={{ x: -0.0948, y: 0.5522 }}
              end={{ x: 1.2155, y: 0.4372 }}
              style={s.gradientSheet}
            >
              <View style={s.footerRow}>
                <View style={s.footerLeft}>
                  <View style={s.avatar}>
                    <Text style={s.avatarLetter}>{activeProfile.initial}</Text>
                  </View>
                  <Text style={s.handle}>{handle}</Text>
                </View>
                <Image source={amLogo} style={s.logo} resizeMode="contain" />
              </View>
            </LinearGradient>

            <View style={s.glassWrap}>
              <LinearGradient
                colors={['rgba(222,144,156,0.22)', 'rgba(166,160,199,0.18)', 'rgba(109,175,241,0.22)']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={s.glassTint} />
              <View style={s.glassContent}>
                <View style={s.hero}>
                  <Image source={card.bg} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
                  <LinearGradient
                    colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.32)']}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={s.heroTop}>
                    <Image
                      source={hannahJourneyAssets.superfanIcon}
                      style={s.heartSparkle}
                      resizeMode="contain"
                    />
                    <Text style={s.sinceDate}>{card.since}</Text>
                  </View>
                  <View style={s.heroStats}>
                    <View style={s.heroTextCol}>
                      <Text style={s.headline}>{card.headline}</Text>
                      <Text style={s.subline}>{card.subline}</Text>
                    </View>
                    {!sharing && (
                      <TouchableOpacity
                        style={s.shareBtn}
                        onPress={handleShare}
                        activeOpacity={0.8}
                        accessibilityLabel="Share card"
                      >
                        <Ionicons name="share-outline" size={15} color="#fff" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                <View style={s.statsList}>
                  {card.stats.map(stat => (
                    <View key={stat.title} style={s.statRow}>
                      <MaterialIcons name={stat.icon} size={24} color="#fff" />
                      <View style={s.statTexts}>
                        <Text style={s.statTitle}>{stat.title}</Text>
                        <Text style={s.statSub}>{stat.subtitle}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                {!sharing && (
                  <View style={s.ctaWrap}>
                    <TouchableOpacity style={s.cta} onPress={onClose} activeOpacity={0.85}>
                      <Text style={s.ctaText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const s = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardScale: { width: CARD_W, height: CARD_H },
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  gradientSheet: {
    ...StyleSheet.absoluteFillObject,
    paddingTop: 12,
    paddingBottom: 6,
    paddingHorizontal: 14,
    justifyContent: 'flex-end',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 312,
  },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { fontFamily: FONT_FAMILY_DISPLAY.bold, fontSize: 11, color: C.cyan },
  handle: { fontFamily: FONT_FAMILY_DISPLAY.regular, fontSize: 14, lineHeight: 21, color: '#fff' },
  logo: { width: 75, height: 16, marginTop: 5 },
  glassWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CARD_W,
    height: GLASS_H,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  glassTint: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(30,30,30,0.6)' },
  glassContent: { flex: 1, padding: 8, gap: 21 },
  hero: {
    width: 324,
    height: 216,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heartSparkle: { width: 26.7, height: 24.5 },
  sinceDate: { fontFamily: FONT_FAMILY_EMBER.regular, fontSize: 12, color: '#fff' },
  heroStats: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  heroTextCol: { width: 184 },
  headline: { fontFamily: FONT_FAMILY_DISPLAY.bold, fontSize: 28, color: '#fff' },
  subline: { fontFamily: FONT_FAMILY_EMBER.regular, fontSize: 16, color: '#fff' },
  shareBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsList: { paddingHorizontal: 12, gap: 22 },
  statRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  statTexts: { gap: 4, flex: 1 },
  statTitle: { fontFamily: FONT_FAMILY_DISPLAY.bold, fontSize: 16, color: '#fff' },
  statSub: { fontFamily: FONT_FAMILY_EMBER.medium, fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  ctaWrap: { alignItems: 'center', paddingTop: 8 },
  cta: {
    width: 301,
    borderRadius: 8,
    backgroundColor: '#9988D4',
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { fontFamily: FONT_FAMILY_DISPLAY.bold, fontSize: 18, color: '#fff' },
})
