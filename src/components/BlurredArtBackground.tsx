import { View, StyleSheet, ImageBackground, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { albumArtAssets } from '../data/assetMap'
import { hexWithAlpha } from '../utils/color'
import { PLAYER_GRADIENT } from '../theme'

/** Full-bleed blurred cover art + tint gradient, filling the nearest positioned parent. */
export default function BlurredArtBackground({
  art,
  fallbackColor,
}: {
  art: (typeof albumArtAssets)[string] | null
  fallbackColor: string
}) {
  const gradientColors = art
    ? [
        hexWithAlpha(fallbackColor, 0.52),
        hexWithAlpha(fallbackColor, 0.32),
        hexWithAlpha(fallbackColor, 0.14),
        'rgba(10,10,10,0.55)',
      ]
    : [...PLAYER_GRADIENT]

  return (
    <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
      {art ? (
        <ImageBackground
          source={art}
          style={StyleSheet.absoluteFill}
          // react-native-web's blurRadius rendering leaves a hard vignette at
          // the edges — use an explicit CSS filter + overscale on web instead.
          imageStyle={
            Platform.OS === 'web'
              ? ({ filter: 'blur(48px)', transform: [{ scale: 1.3 }] } as any)
              : undefined
          }
          resizeMode="cover"
          blurRadius={Platform.OS === 'web' ? undefined : Platform.OS === 'ios' ? 56 : 32}
          alt=""
        >
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.12)' }]} />
        </ImageBackground>
      ) : null}
      <LinearGradient
        colors={gradientColors as [string, string, ...string[]]}
        locations={art ? [0, 0.28, 0.58, 1] : undefined}
        style={StyleSheet.absoluteFill}
      />
    </View>
  )
}
