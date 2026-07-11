import { useEffect, useState } from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { C } from '../../theme'

/**
 * The journey timeline under the era rail — time reads RIGHT TO LEFT, per the
 * Figma reference (nodes 123:4279 / 123:4877): "now" sits at the left edge
 * behind a dotted stub (the era still being written), the oldest era sits at
 * the far right, and the filled line runs from the right end up to the active
 * era's dot — history accumulates behind you. Dots are tappable and mirror
 * the era cards above.
 */

const STUB_W = 48 // the dotted "still being written" future, left of now
const EDGE = 8

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
  const span = Math.max(0, w - STUB_W - EDGE * 2)
  const xFor = (i: number) => STUB_W + EDGE + (count > 1 ? (i / (count - 1)) * span : 0)

  const fill = useSharedValue(0)
  useEffect(() => {
    if (w > 0) {
      fill.value = withTiming(Math.max(0, w - xFor(activeIndex)), {
        duration: 340,
        easing: Easing.out(Easing.cubic),
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, w, count])
  const fillStyle = useAnimatedStyle(() => ({ width: fill.value }))

  if (count < 2) return null

  return (
    <View style={t.wrap} onLayout={e => setW(e.nativeEvent.layout.width)}>
      {/* the future — dotted, off the "now" edge */}
      <View style={t.dashStub} />
      {/* the base line back through time */}
      <View style={[t.baseLine, { left: STUB_W + EDGE, right: EDGE }]} />
      {/* history: filled from the right end to the active era */}
      <Animated.View style={[t.fillClip, fillStyle]}>
        <LinearGradient
          colors={['rgba(37,209,218,0.9)', 'rgba(37,209,218,0.3)']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
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
  baseLine: {
    position: 'absolute',
    top: 11.5,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  fillClip: {
    position: 'absolute',
    right: EDGE,
    top: 11,
    height: 2,
    borderRadius: 1,
    overflow: 'hidden',
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
