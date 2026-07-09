import { TouchableOpacity, View, Image, StyleSheet, ImageSourcePropType } from 'react-native'
import { ReactNode } from 'react'

type Props = {
  onPress?: () => void
  icon?: ImageSourcePropType
  iconSize?: number
  size?: number
  children?: ReactNode
  accessibilityLabel?: string
}

export default function GlassCircleButton({
  onPress,
  icon,
  iconSize = 20,
  size = 44,
  children,
  accessibilityLabel,
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[s.btn, { width: size, height: size, borderRadius: size / 2 }]}
    >
      {icon ? (
        <Image source={icon} style={{ width: iconSize, height: iconSize }} resizeMode="contain" />
      ) : (
        children
      )}
    </TouchableOpacity>
  )
}

export function GlassPlayButton({
  size = 70,
  isPlaying,
  onPress,
}: {
  size?: number
  isPlaying: boolean
  onPress: () => void
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
      style={[s.playOuter, { width: size, height: size, borderRadius: size / 2 }]}
    >
      {isPlaying ? (
        <View style={[s.pauseBars, { gap: size * 0.1 }]}>
          <View style={[s.pauseBar, { width: Math.max(3, size * 0.065), height: size * 0.36 }]} />
          <View style={[s.pauseBar, { width: Math.max(3, size * 0.065), height: size * 0.36 }]} />
        </View>
      ) : (
        <View style={[s.playTriangle, { borderLeftWidth: size * 0.22, borderTopWidth: size * 0.14, borderBottomWidth: size * 0.14 }]} />
      )}
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  btn: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playOuter: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseBars: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  pauseBar: {
    borderRadius: 2,
    backgroundColor: '#fff',
  },
  playTriangle: {
    width: 0,
    height: 0,
    marginLeft: 4,
    borderStyle: 'solid',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#fff',
  },
})
