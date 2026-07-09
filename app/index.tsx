import { useEffect, useRef } from 'react'
import { View, Image, StyleSheet, Animated } from 'react-native'
import { useRouter } from 'expo-router'
import { logoAssets } from '../src/data/assetMap'
import { C } from '../src/theme'

export default function LandingScreen() {
  const router = useRouter()
  const opacity = useRef(new Animated.Value(0)).current
  const scale = useRef(new Animated.Value(0.92)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 8, tension: 60, useNativeDriver: true }),
    ]).start()

    const leave = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 350, useNativeDriver: true }).start(() => {
        router.replace('/(tabs)')
      })
    }, 1800)

    return () => clearTimeout(leave)
  }, [opacity, scale, router])

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <Image
          source={logoAssets.amazonMusicHorizontal}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  logo: {
    width: 260,
    height: 52,
  },
})
