import { View, StyleSheet, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native'
import { AppImage as Image } from './AppImage'

const DIRECTIONS: [number, number][] = [
  [-1, -1], [0, -1], [1, -1],
  [-1, 0],            [1, 0],
  [-1, 1],  [0, 1],   [1, 1],
]

function buildRingOffsets(width: number): [number, number][] {
  const offsets: [number, number][] = []
  for (let r = 1; r <= width; r++) {
    for (const [dx, dy] of DIRECTIONS) offsets.push([dx * r, dy * r])
  }
  return offsets
}

/**
 * Superfan heart icon with a dark outline so it reads clearly over busy
 * photo backgrounds. Image has no native stroke support, so this fakes one
 * two ways: a solid dark backing plate behind the icon (so nothing inside
 * the icon's own silhouette — e.g. the gap between the heart and sparkle
 * glyphs — is ever see-through), plus rings of dark-tinted icon copies
 * offset outward by 1..outlineWidth px to thicken the traced edge.
 */
export default function SuperfanHeartBadge({
  source,
  style,
  size = 32,
  outlineColor = 'rgba(0,0,0,0.9)',
  outlineWidth = 2,
}: {
  source: ImageSourcePropType
  style?: StyleProp<ViewStyle>
  size?: number
  outlineColor?: string
  outlineWidth?: number
}) {
  const backingSize = size + outlineWidth * 2
  const offsets = buildRingOffsets(outlineWidth)

  return (
    <View style={[{ width: size, height: size }, style]} pointerEvents="none">
      <View
        style={{
          position: 'absolute',
          left: (size - backingSize) / 2,
          top: (size - backingSize) / 2,
          width: backingSize,
          height: backingSize,
          borderRadius: backingSize / 2,
          backgroundColor: outlineColor,
        }}
      />
      {offsets.map(([dx, dy], i) => (
        <Image
          key={i}
          source={source}
          resizeMode="contain"
          tintColor={outlineColor}
          style={[
            StyleSheet.absoluteFill,
            { transform: [{ translateX: dx }, { translateY: dy }] },
          ]}
        />
      ))}
      <Image source={source} resizeMode="contain" style={StyleSheet.absoluteFill} />
    </View>
  )
}
