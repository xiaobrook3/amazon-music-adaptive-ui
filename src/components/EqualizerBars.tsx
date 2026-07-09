import { useEffect, useRef } from 'react'
import { View, Animated, Easing, StyleSheet } from 'react-native'

/**
 * A tiny "now playing" equalizer — a few bars that bob up and down while audio
 * is playing and settle low when paused. Bars animate `scaleY` from a bottom
 * origin on the NATIVE driver, so this perpetual loop (it lives in the
 * always-mounted mini player) costs the JS thread nothing while scrolling.
 */
export default function EqualizerBars({
  playing,
  size = 16,
  barCount = 4,
  color = '#fff',
}: {
  playing: boolean
  size?: number
  barCount?: number
  color?: string
}) {
  const seeds = [0.5, 0.9, 0.45, 0.75]
  const bars = useRef(
    Array.from({ length: barCount }, (_, i) => new Animated.Value(seeds[i % seeds.length])),
  ).current

  useEffect(() => {
    if (!playing) {
      Animated.parallel(
        bars.map(b => Animated.timing(b, { toValue: 0.28, duration: 220, useNativeDriver: true })),
      ).start()
      return
    }
    // Different up/down durations per bar → they naturally desync into a wave.
    const loops = bars.map((b, i) => {
      const up = 330 + i * 70
      const down = 300 + (barCount - i) * 70
      return Animated.loop(
        Animated.sequence([
          Animated.timing(b, { toValue: 1, duration: up, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(b, { toValue: 0.3, duration: down, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      )
    })
    loops.forEach(l => l.start())
    return () => loops.forEach(l => l.stop())
  }, [playing, bars, barCount])

  const barW = Math.max(2, (size - (barCount - 1) * 2) / barCount)

  return (
    <View style={[st.row, { height: size }]}>
      {bars.map((b, i) => (
        <Animated.View
          key={i}
          style={{
            width: barW,
            marginHorizontal: 1,
            borderRadius: 1,
            backgroundColor: color,
            height: size,
            transformOrigin: 'bottom',
            transform: [
              { scaleY: b.interpolate({ inputRange: [0, 1], outputRange: [0.22, 1] }) },
            ],
          }}
        />
      ))}
    </View>
  )
}

const st = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end' },
})
