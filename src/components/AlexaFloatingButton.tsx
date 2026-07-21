import { useEffect } from 'react'
import { Image, StyleSheet, Dimensions, View, Platform } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { logoAssets } from '../data/assetMap'
const ALEXA_ICON_TINT = '#25D1DA'

// Web: the app renders inside a fixed 402×(max 874) phone frame, so the default
// draggable position must derive from the frame, not the full browser window —
// otherwise the button lands off-frame and gets clipped invisible.
const SCREEN_W = Platform.OS === 'web' ? Math.min(Dimensions.get('window').width, 402) : Dimensions.get('window').width
const SCREEN_H = Platform.OS === 'web' ? Math.min(Dimensions.get('window').height, 874) : Dimensions.get('window').height
const BTN = 52
const TAB_BAR_EST = 130

let savedX: number | null = null
let savedY: number | null = null

function persistPosition(x: number, y: number) {
  savedX = x
  savedY = y
}

export default function AlexaFloatingButton() {
  const insets = useSafeAreaInsets()
  const defaultX = SCREEN_W - BTN - 16
  const defaultY = SCREEN_H - TAB_BAR_EST - insets.bottom - BTN - 8

  const translateX = useSharedValue(savedX ?? defaultX)
  const translateY = useSharedValue(savedY ?? defaultY)
  const startX = useSharedValue(0)
  const startY = useSharedValue(0)
  const minY = useSharedValue(insets.top + 8)
  const maxY = useSharedValue(SCREEN_H - TAB_BAR_EST - insets.bottom - BTN)

  useEffect(() => {
    if (savedX == null) {
      translateX.value = defaultX
      translateY.value = defaultY
    }
  }, [defaultX, defaultY, translateX, translateY])

  useEffect(() => {
    minY.value = insets.top + 8
    maxY.value = SCREEN_H - TAB_BAR_EST - insets.bottom - BTN
  }, [insets.top, insets.bottom, minY, maxY])

  const pan = Gesture.Pan()
    .minDistance(4)
    .onStart(() => {
      startX.value = translateX.value
      startY.value = translateY.value
    })
    .onUpdate(e => {
      const minX = 8
      const maxX = SCREEN_W - BTN - 8
      translateX.value = Math.min(maxX, Math.max(minX, startX.value + e.translationX))
      translateY.value = Math.min(maxY.value, Math.max(minY.value, startY.value + e.translationY))
    })
    .onEnd(() => {
      const snapRight = translateX.value > SCREEN_W / 2
      const targetX = snapRight ? SCREEN_W - BTN - 16 : 16
      translateX.value = withSpring(targetX, { damping: 18, stiffness: 180 })
      runOnJS(persistPosition)(targetX, translateY.value)
    })

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }))

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[s.btn, style]} accessibilityLabel="Alexa" accessibilityRole="none">
        <View style={s.btnInner}>
          <Image
            source={logoAssets.alexa}
            style={s.logo}
            resizeMode="contain"
            tintColor={ALEXA_ICON_TINT}
          />
        </View>
      </Animated.View>
    </GestureDetector>
  )
}

const s = StyleSheet.create({
  btn: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: BTN,
    height: BTN,
    borderRadius: BTN / 2,
    zIndex: 100,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  btnInner: {
    width: BTN,
    height: BTN,
    borderRadius: BTN / 2,
    backgroundColor: 'rgba(20,20,20,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  logo: {
    width: 28,
    height: 28,
  },
})
