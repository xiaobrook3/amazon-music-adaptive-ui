import { useEffect } from 'react'
import { StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated'
import { C } from '../../theme'

const EDGE_DURATION = 220
const HOLD_DURATION = 150
const FADE_DURATION = 280

/**
 * One-time blue outline that traces clockwise around a newly-unlocked tab —
 * top, right, bottom, left — then holds briefly and fades out. Marks the
 * moment of unlock; the persistent UnlockDot takes over after this finishes.
 */
export default function UnlockTraceBorder({ onComplete }: { onComplete: () => void }) {
  const progress = useSharedValue(0)
  const opacity = useSharedValue(1)

  useEffect(() => {
    progress.value = withTiming(4, { duration: EDGE_DURATION * 4, easing: Easing.linear })
    opacity.value = withDelay(
      EDGE_DURATION * 4 + HOLD_DURATION,
      withTiming(0, { duration: FADE_DURATION }, finished => {
        if (finished) runOnJS(onComplete)()
      }),
    )
  }, [])

  const topStyle = useAnimatedStyle(() => ({
    width: `${Math.max(0, Math.min(1, progress.value)) * 100}%`,
  }))
  const rightStyle = useAnimatedStyle(() => ({
    height: `${Math.max(0, Math.min(1, progress.value - 1)) * 100}%`,
  }))
  const bottomStyle = useAnimatedStyle(() => ({
    width: `${Math.max(0, Math.min(1, progress.value - 2)) * 100}%`,
  }))
  const leftStyle = useAnimatedStyle(() => ({
    height: `${Math.max(0, Math.min(1, progress.value - 3)) * 100}%`,
  }))
  const containerStyle = useAnimatedStyle(() => ({ opacity: opacity.value }))

  return (
    <Animated.View style={[StyleSheet.absoluteFill, s.wrap, containerStyle]} pointerEvents="none">
      <Animated.View style={[s.edgeH, { top: 0, left: 0 }, topStyle]} />
      <Animated.View style={[s.edgeV, { top: 0, right: 0 }, rightStyle]} />
      <Animated.View style={[s.edgeH, { bottom: 0, right: 0 }, bottomStyle]} />
      <Animated.View style={[s.edgeV, { bottom: 0, left: 0 }, leftStyle]} />
    </Animated.View>
  )
}

const s = StyleSheet.create({
  wrap: { borderRadius: 8, overflow: 'hidden' },
  edgeH: { position: 'absolute', height: 1.5, backgroundColor: C.blue },
  edgeV: { position: 'absolute', width: 1.5, backgroundColor: C.blue },
})
