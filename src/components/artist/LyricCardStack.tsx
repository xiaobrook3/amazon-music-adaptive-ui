import { useState, useCallback } from 'react'
import { View, StyleSheet } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, runOnJS } from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '../AppText'
import { AppImage as Image } from '../AppImage'
import { C, typeHeadline } from '../../theme'

// Front (centered) lyric card gradient — Figma slate-blue over black
const LYRIC_FRONT_GRADIENT = ['rgba(117,159,187,0.12)', 'rgba(117,159,187,0.6)'] as const
const SWIPE_THRESHOLD = 90
const FLY_OUT_DISTANCE = 520

export type LyricStackItem = {
  /** Optional stable id for callers that need to look up a specific item (era-pinned front cards). */
  id?: string
  song: string
  artKey: string
  lyric: string
  gradient: readonly string[]
}

export function LyricCardFace({
  item,
  front,
  resolveArt,
  useItemGradientForFront = false,
  frontHeartSize = 14,
  fansLabel = 'fans',
}: {
  item: LyricStackItem
  front: boolean
  resolveArt: (key: string) => any
  /** Opt-in: use item.gradient for the front card too, instead of the fixed slate-blue tint (default preserves prior behavior for other artist pages). */
  useItemGradientForFront?: boolean
  /** Heart icon size on the front card only (back cards always use 12). */
  frontHeartSize?: number
  /** "by 12k {fansLabel}" — front card only; back cards always say "fans". */
  fansLabel?: string
}) {
  const frontGradient = useItemGradientForFront ? (item.gradient as [string, string]) : LYRIC_FRONT_GRADIENT
  return (
    <>
      <LinearGradient colors={front ? frontGradient : (item.gradient as [string, string])} style={StyleSheet.absoluteFill} />
      <View style={s.lyricStackHeader}>
        <Image source={resolveArt(item.artKey)} style={s.lyricStackArt} />
        <Text style={s.lyricStackSong} numberOfLines={1}>{item.song}</Text>
      </View>
      <Text style={front ? s.lyricStackTextFront : s.lyricStackText}>{item.lyric}</Text>
      <View style={s.lyricStackFans}>
        <Ionicons name="heart" size={front ? frontHeartSize : 12} color={C.cyan} />
        <Text style={s.lyricStackFansText}>by 12k {front ? fansLabel : 'fans'}</Text>
      </View>
    </>
  )
}

/**
 * Swipeable "favorite lyrics" card stack — front card is draggable left/right;
 * releasing past the threshold flings it off and cycles to the next lyric,
 * with the two cards behind it re-filling the front/back positions. Same
 * visual language on Olivia's and Taylor's pages.
 */
export default function LyricCardStack({
  items,
  resolveArt,
  useItemGradientForFront = false,
  frontHeartSize = 14,
  fansLabel = 'fans',
  hideDots = false,
  frontCardSize,
  backCardSize,
  backCardRotationDeg = 11,
}: {
  items: LyricStackItem[]
  resolveArt: (key: string) => any
  useItemGradientForFront?: boolean
  frontHeartSize?: number
  fansLabel?: string
  /** Hide the swipe-affordance dots row under the stack (Figma has none). */
  hideDots?: boolean
  /** Override the front card's fixed 230x272 footprint. */
  frontCardSize?: { width: number; height: number }
  /** Override the back cards' fixed 172x236 footprint. */
  backCardSize?: { width: number; height: number }
  /** Override the back cards' +/-11deg tilt. */
  backCardRotationDeg?: number
}) {
  const [frontIdx, setFrontIdx] = useState(0)
  const translateX = useSharedValue(0)
  const rotateZ = useSharedValue(0)
  const scale = useSharedValue(1)
  const len = items.length

  const advance = useCallback((dir: 1 | -1) => {
    setFrontIdx(i => (i + dir + len) % len)
  }, [len])

  const settleBack = () => {
    'worklet'
    translateX.value = withSpring(0, { damping: 16, stiffness: 180 })
    rotateZ.value = withSpring(0, { damping: 16, stiffness: 180 })
  }

  const pan = Gesture.Pan()
    .onUpdate(e => {
      translateX.value = e.translationX
      rotateZ.value = e.translationX / 18
    })
    .onEnd(e => {
      if (Math.abs(e.translationX) > SWIPE_THRESHOLD && len > 1) {
        // The card should fly off in the SAME direction it was dragged (a
        // left swipe exits left), not reverse — that reversal was the "bad"
        // animation. The next card (the one already sitting in the back-right
        // slot for a left swipe, back-left for a right swipe) then springs
        // in from that slot into the centered front position, like a carousel.
        const swipedLeft = e.translationX < 0
        const exitX = swipedLeft ? -FLY_OUT_DISTANCE : FLY_OUT_DISTANCE
        const indexDir = swipedLeft ? 1 : -1
        const entranceX = swipedLeft ? 26 : -26
        const entranceRotate = swipedLeft ? 11 : -11
        translateX.value = withTiming(exitX, { duration: 200 }, finished => {
          if (finished) {
            translateX.value = entranceX
            rotateZ.value = entranceRotate
            scale.value = 0.88
            runOnJS(advance)(indexDir)
            translateX.value = withSpring(0, { damping: 16, stiffness: 180 })
            rotateZ.value = withSpring(0, { damping: 16, stiffness: 180 })
            scale.value = withSpring(1, { damping: 16, stiffness: 180 })
          }
        })
      } else {
        settleBack()
      }
    })

  const frontAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotate: `${rotateZ.value}deg` },
      { scale: scale.value },
    ],
  }))

  if (len === 0) return null

  const backLeft = items[(frontIdx + 2) % len]
  const backRight = items[(frontIdx + 1) % len]
  const front = items[frontIdx]

  const backSizeStyle = backCardSize ? { width: backCardSize.width, height: backCardSize.height } : null
  const frontSizeStyle = frontCardSize ? { width: frontCardSize.width, height: frontCardSize.height } : null
  const faceProps = { useItemGradientForFront, frontHeartSize, fansLabel }

  return (
    <View>
      <View style={s.lyricStack}>
        {len > 2 && (
          <View style={[s.lyricBackCard, s.lyricBackLeft, backSizeStyle, { transform: [{ rotate: `-${backCardRotationDeg}deg` }] }]}>
            <LyricCardFace item={backLeft} front={false} resolveArt={resolveArt} {...faceProps} />
          </View>
        )}
        {len > 1 && (
          <View style={[s.lyricBackCard, s.lyricBackRight, backSizeStyle, { transform: [{ rotate: `${backCardRotationDeg}deg` }] }]}>
            <LyricCardFace item={backRight} front={false} resolveArt={resolveArt} {...faceProps} />
          </View>
        )}
        <GestureDetector gesture={pan}>
          <Animated.View style={[s.lyricFrontCard, frontSizeStyle, frontAnimStyle]}>
            <LyricCardFace item={front} front resolveArt={resolveArt} {...faceProps} />
          </Animated.View>
        </GestureDetector>
      </View>
      {!hideDots && len > 1 && (
        <View style={s.lyricDotsRow}>
          {items.map((_, i) => (
            <View key={i} style={[s.lyricDot, i === frontIdx && s.lyricDotActive]} />
          ))}
        </View>
      )}
    </View>
  )
}

const s = StyleSheet.create({
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
  lyricDotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 8 },
  lyricDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.25)' },
  lyricDotActive: { backgroundColor: C.cyan, width: 16 },
})
