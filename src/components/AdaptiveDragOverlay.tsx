import { View, StyleSheet } from 'react-native'
import { AppImage as Image } from './AppImage'
import { Text } from './AppText'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated'
import { C, R } from '../theme'
import { albumArtAssets } from '../data/assetMap'
import type { AdaptiveTheme } from '../context/AdaptiveUIContext'
import type { Song } from '../data/mockData'

export type DragPayload =
  | { kind: 'theme'; theme: AdaptiveTheme }
  | { kind: 'album'; song: Song }

type Props = {
  payload: DragPayload
  // Live position written by the gesture on the UI thread — no Pan gesture needed here.
  dragX: SharedValue<number>
  dragY: SharedValue<number>
}

export default function AdaptiveDragOverlay({ payload, dragX, dragY }: Props) {
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: dragX.value - 70 },
      { translateY: dragY.value - 24 },
    ],
  }))

  const label = payload.kind === 'theme' ? payload.theme.label : payload.song.album
  const art =
    payload.kind === 'album' && payload.song.albumArtPath
      ? albumArtAssets[payload.song.albumArtPath]
      : null

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View style={[s.floater, style]}>
        {art ? (
          <Image source={art} style={s.albumThumb} resizeMode="cover" />
        ) : (
          <Ionicons name="musical-notes" size={14} color={C.cyan} />
        )}
        <Text style={s.floaterLabel} numberOfLines={1}>{label}</Text>
      </Animated.View>
    </View>
  )
}

const s = StyleSheet.create({
  floater: {
    position: 'absolute',
    top: 0,
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(20, 20, 20, 0.88)',
    borderWidth: 1,
    borderColor: C.cyan,
    opacity: 0.92,
    maxWidth: 200,
    zIndex: 200,
  },
  albumThumb: {
    width: 28,
    height: 28,
    borderRadius: R.sm,
  },
  floaterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    flexShrink: 1,
  },
})
