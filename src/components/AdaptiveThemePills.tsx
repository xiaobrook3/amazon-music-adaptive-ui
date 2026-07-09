import { ScrollView, View, StyleSheet } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { runOnJS, type SharedValue } from 'react-native-reanimated'
import { useAdaptiveUI, type AdaptiveTheme } from '../context/AdaptiveUIContext'
import { Text } from './AppText'
import { Ionicons } from '@expo/vector-icons'
import { EdgeFadeRow } from './EdgeFadeRow'
import { C } from '../theme'

const SUPERFAN_PURPLE = '#9B59B6'

function parseHueBase(hue: string): { r: number; g: number; b: number } {
  if (hue.startsWith('#')) {
    const hex = hue.replace('#', '')
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    }
  }
  const match = hue.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (match) {
    return { r: +match[1], g: +match[2], b: +match[3] }
  }
  return { r: 107, g: 63, b: 160 }
}

function tintFromHue(hue: string, alpha: number): string {
  const { r, g, b } = parseHueBase(hue)
  return `rgba(${r},${g},${b},${alpha})`
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return [h * 360, s, l]
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360
  let r: number, g: number, b: number
  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) }
}

/** Brightens very dark theme hues so pill borders, fills, and labels stay legible. */
function pillAccentFromHue(hue: string): string {
  const { r, g, b } = parseHueBase(hue)
  const [h, s, l] = rgbToHsl(r, g, b)
  const newL = Math.max(l, 0.58)
  const newS = Math.max(s, 0.38)
  const { r: nr, g: ng, b: nb } = hslToRgb(h, newS, newL)
  return `rgb(${nr},${ng},${nb})`
}

type Props = {
  onDragStart: (theme: AdaptiveTheme, x: number, y: number) => void
  onDragMove: (x: number, y: number) => void
  onDragDrop: (x: number, y: number, theme: AdaptiveTheme) => void
  onDragCancel: () => void
  dragX: SharedValue<number>
  dragY: SharedValue<number>
  heroHue?: string
}

function ThemePill({
  theme,
  isActive,
  onTap,
  onDragStart,
  onDragMove,
  onDragDrop,
  onDragCancel,
  dragX,
  dragY,
}: {
  theme: AdaptiveTheme
  isActive: boolean
  onTap: () => void
  onDragStart: (x: number, y: number) => void
  onDragMove: (x: number, y: number) => void
  onDragDrop: (x: number, y: number) => void
  onDragCancel: () => void
  dragX: SharedValue<number>
  dragY: SharedValue<number>
}) {
  const isSuperFan = theme.isSuperFanUnlock === true
  const pillAccent = pillAccentFromHue(theme.heroHue)
  const activeBorder = tintFromHue(pillAccent, 0.72)
  const activeGlow = tintFromHue(pillAccent, 0.32)

  // Single Pan gesture with long-press activation — avoids the gesture handoff
  // bug where LongPress fires, overlay mounts, but the overlay's new Pan gesture
  // can't capture the already-ongoing touch from the LongPress.
  const pan = Gesture.Pan()
    .activateAfterLongPress(320)
    .onStart(e => {
      dragX.value = e.absoluteX
      dragY.value = e.absoluteY
      runOnJS(onDragStart)(e.absoluteX, e.absoluteY)
    })
    .onUpdate(e => {
      dragX.value = e.absoluteX
      dragY.value = e.absoluteY
      runOnJS(onDragMove)(e.absoluteX, e.absoluteY)
    })
    .onEnd(e => {
      runOnJS(onDragDrop)(e.absoluteX, e.absoluteY)
    })
    .onFinalize((_e, success) => {
      if (!success) runOnJS(onDragCancel)()
    })

  const tap = Gesture.Tap().onEnd(() => {
    runOnJS(onTap)()
  })

  // Race: Tap wins for short presses; Pan wins once the long-press threshold passes.
  const composed = Gesture.Race(pan, tap)

  return (
    <GestureDetector gesture={composed}>
      <View
        style={[
          s.pill,
          !isSuperFan && !isActive && s.pillInactive,
          isActive && !isSuperFan && {
            borderColor: activeBorder,
            backgroundColor: activeGlow,
            shadowColor: pillAccent,
            shadowOpacity: 0.28,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 0 },
          },
          isActive && !isSuperFan && s.pillThemedActive,
          isSuperFan && s.pillSuperFan,
          isSuperFan && isActive && s.pillSuperFanActive,
        ]}
      >
        {isSuperFan && (
          <View style={s.superFanBadge}>
            <Ionicons name="star" size={8} color="#fff" />
          </View>
        )}
        <Ionicons
          name={isSuperFan ? 'star' : 'musical-notes'}
          size={13}
          color={
            isSuperFan
              ? (isActive ? SUPERFAN_PURPLE : 'rgba(255,255,255,0.72)')
              : (isActive ? pillAccent : 'rgba(255,255,255,0.68)')
          }
        />
        <Text
          style={[
            s.pillLabel,
            !isSuperFan && !isActive && s.pillLabelInactive,
            isActive && !isSuperFan && { color: pillAccent },
            isActive && isSuperFan && s.pillLabelSuperFan,
          ]}
        >
          {theme.label}
        </Text>
      </View>
    </GestureDetector>
  )
}

export default function AdaptiveThemePills({
  onDragStart,
  onDragMove,
  onDragDrop,
  onDragCancel,
  dragX,
  dragY,
  heroHue,
}: Props) {
  const { adaptiveEnabled, availableThemes, activeTheme, setActiveTheme } = useAdaptiveUI()

  if (!adaptiveEnabled || availableThemes.length === 0) return null

  return (
    <View style={s.wrap}>
      <EdgeFadeRow fadeColor={C.bg}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.row}
          nestedScrollEnabled
          style={s.pillScroll}
        >
          {availableThemes.map(theme => (
            <ThemePill
              key={theme.id}
              theme={theme}
              isActive={activeTheme?.id === theme.id}
              onTap={() => setActiveTheme(theme.id)}
              onDragStart={(x, y) => onDragStart(theme, x, y)}
              onDragMove={onDragMove}
              onDragDrop={(x, y) => onDragDrop(x, y, theme)}
              onDragCancel={onDragCancel}
              dragX={dragX}
              dragY={dragY}
            />
          ))}
        </ScrollView>
      </EdgeFadeRow>
    </View>
  )
}

const s = StyleSheet.create({
  wrap: {
    marginBottom: 8,
    paddingTop: 2,
    paddingBottom: 4,
    backgroundColor: C.bg,
    overflow: 'visible',
  },
  pillScroll: {
    marginTop: 2,
    overflow: 'visible',
  },
  row: {
    paddingLeft: 16,
    // extra trailing room so the last pill clears the right edge-fade
    paddingRight: 28,
    paddingBottom: 6,
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent',
    position: 'relative',
  },
  pillInactive: {
    borderColor: 'rgba(255,255,255,0.28)',
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  pillThemedActive: {
    borderWidth: 1,
  },
  pillSuperFan: {
    borderColor: SUPERFAN_PURPLE,
    backgroundColor: 'rgba(107, 63, 160, 0.22)',
    shadowColor: SUPERFAN_PURPLE,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  pillSuperFanActive: {
    borderColor: SUPERFAN_PURPLE,
    borderWidth: 1.5,
  },
  superFanBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: SUPERFAN_PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.92)',
  },
  pillLabelInactive: {
    color: 'rgba(255,255,255,0.78)',
  },
  pillLabelSuperFan: {
    color: SUPERFAN_PURPLE,
  },
})
