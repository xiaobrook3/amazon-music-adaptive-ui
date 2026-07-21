import { useRef, useState } from 'react'
import { Modal, View, TouchableOpacity, StyleSheet, Pressable, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import * as Sharing from 'expo-sharing'
import { captureRef } from 'react-native-view-shot'
import { MaterialIcons } from '@expo/vector-icons'
import { Text } from '../AppText'
import { AppImage as Image } from '../AppImage'
import { useHannahJourney } from '../../context/HannahJourneyContext'
import { useProfiles } from '../../context/ProfilesContext'
import { useAdaptiveUI } from '../../context/AdaptiveUIContext'
import { FONT_FAMILY_DISPLAY, FONT_FAMILY_EMBER, C } from '../../theme'
import { hannahJourneyAssets } from '../../data/assetMap'

const CARD_W = 340
const CARD_H = 528
const GLASS_H = 489

const heroImg = require('../../../assets/hannah-journey/superfan-reveal-popup-asset-01.png')
const amLogo = require('../../../assets/hannah-journey/superfan-reveal-popup-logo.png')
const shareGlyph = require('../../../assets/hannah-journey/superfan-reveal-popup-share.png')
// superfan-reveal-popup-history/-repeat/-library-music.png are mislabeled — their contents
// are raw SVG markup, not decodable raster images, so RN's Image can't render them (blank
// icon at runtime). Use the spec's sanctioned MaterialIcons fallback instead (section 8).
type StatIconName = 'history' | 'repeat' | 'library-music'

/**
 * Mid-scroll Top 3% reveal overlay — Hannah Journey only.
 * Spec: design_iterations/final_prototype_draft/specs/superfan-reveal-popup.spec.md
 */
export default function SuperfanRevealPopup() {
  const router = useRouter()
  const cardRef = useRef<View>(null)
  const [sharing, setSharing] = useState(false)
  const { activeProfile } = useProfiles()
  const { showConfirmation } = useAdaptiveUI()
  const { isHannahJourney, revealVisible, dismissReveal, completeRevealToSuperfan } = useHannahJourney()

  const handleOpen = () => {
    completeRevealToSuperfan()
    router.push({ pathname: '/artist/[id]', params: { id: 'olivia-rodrigo', tab: 'you' } } as any)
  }

  const handleShare = async () => {
    if (!cardRef.current || sharing) return
    setSharing(true)
    try {
      // Wait a tick so the share button unmounts before capture (cleaner shared image).
      await new Promise<void>(resolve => setTimeout(resolve, 64))
      const uri = await captureRef(cardRef, { format: 'png', quality: 1, result: 'tmpfile' })
      const canShare = await Sharing.isAvailableAsync()
      if (!canShare) {
        showConfirmation('Sharing is not available on this device')
        return
      }
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share your Top 3% card',
      })
    } catch {
      showConfirmation('Could not share your card — try again')
    } finally {
      setSharing(false)
    }
  }

  if (!isHannahJourney) return null

  const scale = Math.min(1, (Dimensions.get('window').width - 32) / CARD_W)
  const handle = `@${activeProfile.name.replace(/\s+/g, '').toLowerCase()}`
  const initial = activeProfile.initial

  return (
    <Modal visible={revealVisible} transparent animationType="fade" onRequestClose={dismissReveal}>
      <Pressable style={s.scrim} onPress={dismissReveal}>
        <Pressable style={[s.cardScale, { transform: [{ scale }] }]} onPress={() => {}}>
          <View ref={cardRef} style={s.card} collapsable={false}>
            {/* Figma "superfan card / Property 1=full" (node 2604:17729, 340x528)
                exports this fill as `linear-gradient(82.24deg, #DE909C 2.7313%,
                #A6A0C7 57.408%, #6DAFF1 110.15%)` — a shallower angle than the
                compact/insighthub variants because CSS's box-relative angle
                shifts with aspect ratio even for the same underlying gradient
                handle. Start/end below are the CSS gradient-line endpoints for
                a 340x528 box at 82.24deg, extended past the box edge so
                location 1.0 lands at the stop's true 110.15% mark. */}
            <LinearGradient
              colors={['#DE909C', '#A6A0C7', '#6DAFF1']}
              locations={[0.0248, 0.5212, 1]}
              start={{ x: -0.0948, y: 0.5522 }}
              end={{ x: 1.2155, y: 0.4372 }}
              style={s.gradientSheet}
            >
              <View style={s.footerRow}>
                <View style={s.footerLeft}>
                  <View style={s.avatar}>
                    <Text style={s.avatarLetter}>{initial}</Text>
                  </View>
                  <Text style={s.handle}>{handle}</Text>
                </View>
                <Image source={amLogo} style={s.logo} resizeMode="contain" />
              </View>
            </LinearGradient>

            <View style={s.glassWrap}>
              {/* Approximate frosted glass: gradient peek + dark tint (expo-blur not installed) */}
              <LinearGradient
                colors={['rgba(222,144,156,0.22)', 'rgba(166,160,199,0.18)', 'rgba(109,175,241,0.22)']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={s.glassTint} />
              <View style={s.glassContent}>
                <View style={s.hero}>
                  <Image source={heroImg} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
                  <LinearGradient
                    colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.32)']}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={s.heroTop}>
                    <Image source={hannahJourneyAssets.superfanIcon} style={s.heartSparkle} resizeMode="contain" />
                    <Text style={s.sinceDate}>Since July 2026</Text>
                  </View>
                  <View style={s.heroStats}>
                    <View style={s.heroTextCol}>
                      <Text style={s.headline}>Top 3% Listener</Text>
                      <Text style={s.subline}>of Olivia’s listeners</Text>
                    </View>
                    {!sharing && (
                      <TouchableOpacity style={s.shareBtn} onPress={handleShare} activeOpacity={0.8}>
                        <Image source={shareGlyph} style={s.shareGlyph} resizeMode="contain" tintColor="#fff" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                <View style={s.statsList}>
                  <StatRow
                    icon="history"
                    title="First play, March 2019"
                    subtitle="Olivia had 41k listeners"
                  />
                  <StatRow
                    icon="repeat"
                    title="47 of the last 52 weeks"
                    subtitle="You played her songs 3,240 times"
                  />
                  <StatRow
                    icon="library-music"
                    title="You played 38 of her 54 songs"
                    subtitle="You explored more than her top hits"
                  />
                </View>

                <View style={s.ctaWrap}>
                  <TouchableOpacity style={s.cta} onPress={handleOpen} activeOpacity={0.85}>
                    <Text style={s.ctaText}>Open You & Olivia</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

function StatRow({
  icon,
  title,
  subtitle,
}: {
  icon: StatIconName
  title: string
  subtitle: string
}) {
  return (
    <View style={s.statRow}>
      <MaterialIcons name={icon} size={24} color="#fff" />
      <View style={s.statTexts}>
        <Text style={s.statTitle}>{title}</Text>
        <Text style={s.statSub}>{subtitle}</Text>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardScale: {
    width: CARD_W,
    height: CARD_H,
  },
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
  avatarLetter: {
    fontFamily: FONT_FAMILY_DISPLAY.bold,
    fontSize: 11,
    color: C.cyan,
  },
  handle: {
    fontFamily: FONT_FAMILY_DISPLAY.regular,
    fontSize: 14,
    lineHeight: 21,
    color: '#fff',
  },
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
  glassTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30,30,30,0.6)',
  },
  glassContent: {
    flex: 1,
    padding: 8,
    gap: 21,
  },
  hero: {
    width: 324,
    height: 216,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heartSparkle: { width: 26.7, height: 24.5 },
  sinceDate: {
    fontFamily: FONT_FAMILY_EMBER.regular,
    fontSize: 12,
    color: '#fff',
  },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  heroTextCol: { width: 184 },
  headline: {
    fontFamily: FONT_FAMILY_DISPLAY.bold,
    fontSize: 28,
    color: '#fff',
  },
  subline: {
    fontFamily: FONT_FAMILY_EMBER.regular,
    fontSize: 16,
    color: '#fff',
  },
  shareBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareGlyph: { width: 12.5, height: 16 },
  statsList: {
    paddingHorizontal: 12,
    gap: 22,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  statTexts: { gap: 4, flex: 1 },
  statTitle: {
    fontFamily: FONT_FAMILY_DISPLAY.bold,
    fontSize: 16,
    color: '#fff',
  },
  statSub: {
    fontFamily: FONT_FAMILY_EMBER.medium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  ctaWrap: {
    alignItems: 'center',
    paddingTop: 8,
  },
  cta: {
    width: 301,
    borderRadius: 8,
    backgroundColor: '#9988D4',
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontFamily: FONT_FAMILY_DISPLAY.bold,
    fontSize: 18,
    color: '#fff',
  },
})
