import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, type ViewStyle } from 'react-native'

export const SUPERFAN_GOLD = '#f0c744'

type SuperfanGoldGlowProps = {
  borderRadius?: number
  borderWidth?: number
  style?: ViewStyle
}

/** Slow-breathing gold border for earned superfan status cards. */
export default function SuperfanGoldGlow({
  borderRadius = 14,
  borderWidth = 2,
  style,
}: SuperfanGoldGlowProps) {
  const pulse = useRef(new Animated.Value(0)).current
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1600, useNativeDriver: true }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [pulse])
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.32, 0.62] })
  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFillObject,
        { borderRadius, borderWidth, borderColor: SUPERFAN_GOLD, opacity },
        style,
      ]}
      pointerEvents="none"
    />
  )
}
