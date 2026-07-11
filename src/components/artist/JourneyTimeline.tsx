import { useEffect, useState } from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useReducedMotion,
  Easing,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { C } from '../../theme'

/**
 * The journey timeline under the era rail — time reads RIGHT TO LEFT, per the
 * Figma reference (nodes 123:4279 / 123:4877): "now" sits at the left edge
 * behind a dotted stub (the era still being written), the oldest era sits at
 * the far right.
 *
 * The filled line is the WHOLE history — it never moves when an era is
 * selected (selection lives in the era cards' highlight/dim contrast and the
 * active dot). Instead the line breathes: a glow travels continuously from
 * the oldest era toward "now", right to left, the history flowing into the
 * present. Paused under reduced motion.
 */

const STUB_W = 48 // the dotted "still being written" future, left of now
const EDGE = 8
const GLOW_W = 90

export default function JourneyTimeline({
  count,
  activeIndex,
  onSelect,
}: {
  count: number
  activeIndex: number
  onSelect: (index: number) => void
}) {
  const [w, setW] = useState(0)
  const reduce = useReducedMotion()
  const span = Math.max(0, w - STUB_W - EDGE * 2)
  const xFor = (i: number) => STUB_W + EDGE + (count > 1 ? (i / (count - 1)) * span : 0)

  // Full history: from the right end back to the "now" dot. Static.
  const fillW = Math.max(0, w - xFor(0) - EDGE)

  // The traveling glow — sweeps the fill right → left, forever.
  const sweep = useSharedValue(1)
  useEffect(() => {
    if (reduce || fillW <= 0) return
    sweep.value = 1
    sweep.value = withRepeat(
      withTiming(0, { duration: 2600, easing: Easing.inOut(Easing.quad) }),
      -1,
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, fillW])
  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sweep.value * fillW - GLOW_W / 2 }],
    opacity: 0.4 + 0.6 * Math.sin(Math.PI * sweep.value),
  }))

  if (count < 2) return null

  return (
    <View style={t.wrap} onLayout={e => setW(e.nativeEvent.layout.width)}>
      {/* the future — dotted, off the "now" edge */}
      <View style={t.dashStub} />
      {/* the whole history, always lit end to end */}
      {fillW > 0 && (
        <View style={[t.fillClip, { left: xFor(0), width: fillW }]}>
          <LinearGradient
            colors={['rgba(37,209,218,0.75)', 'rgba(37,209,218,0.25)']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
          <Animated.View style={[t.glow, glowStyle]}>
            <LinearGradient
              colors={['rgba(126,231,236,0)', 'rgba(200,250,252,0.95)', 'rgba(126,231,236,0)']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>
      )}
      {w > 0 &&
        Array.from({ length: count }).map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => onSelect(i)}
            hitSlop={{ top: 12, bottom: 12, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityState={{ selected: i === activeIndex }}
            accessibilityLabel={`Era ${i + 1} of ${count}`}
            style={[t.dotHit, { left: xFor(i) - 12 }]}
          >
            <View style={[t.dot, i === activeIndex && t.dotActive]} />
          </TouchableOpacity>
        ))}
    </View>
  )
}

const t = StyleSheet.create({
  wrap: { height: 24, justifyContent: 'center', marginTop: 12 },
  dashStub: {
    position: 'absolute',
    left: 0,
    width: STUB_W,
    top: 11,
    borderTopWidth: 1.6,
    borderStyle: 'dotted',
    borderColor: 'rgba(37,209,218,0.6)',
  },
  fillClip: {
    position: 'absolute',
    top: 11,
    height: 2,
    borderRadius: 1,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: GLOW_W,
  },
  dotHit: {
    position: 'absolute',
    top: 0,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#7b8590',
    backgroundColor: '#0a0a0a',
  },
  dotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 0,
    backgroundColor: C.cyan,
    shadowColor: C.cyan,
    shadowOpacity: 0.55,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
})
