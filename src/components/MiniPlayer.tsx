import { TouchableOpacity, View, StyleSheet } from 'react-native'
import { AppImage as Image } from './AppImage'
import { Text } from './AppText'
import EqualizerBars from './EqualizerBars'
import { useRouter } from 'expo-router'
import { usePlaybackState, usePlaybackProgress } from '../hooks/usePlaybackState'
import { useAdaptiveUI } from '../context/AdaptiveUIContext'
import { songs } from '../data/mockData'
import { albumArtAssets, playerIconAssets } from '../data/assetMap'
import { C } from '../theme'

type Props = { embedded?: boolean }

/** Isolated so the 300ms progress tick only re-renders this 2px bar,
 *  not the whole mini player (art, equalizer, buttons). */
function MiniProgressBar() {
  const { nowPlayingProgress } = usePlaybackProgress()
  return (
    <View style={s.progressTrack}>
      <View style={[s.progressFill, { width: `${nowPlayingProgress}%` as `${number}%` }]} />
    </View>
  )
}

export default function MiniPlayer({ embedded = false }: Props) {
  const router = useRouter()
  const { isPlaying, setIsPlaying, currentSongIdx } = usePlaybackState()
  const { showConfirmation } = useAdaptiveUI()
  const song = songs[currentSongIdx] ?? songs[0]
  const art = song.albumArtPath ? albumArtAssets[song.albumArtPath] : null

  return (
    <View style={[s.wrap, embedded && s.wrapEmbedded]}>
      <MiniProgressBar />

      <View style={s.content}>
        <TouchableOpacity
          onPress={() => router.push('/now-playing')}
          activeOpacity={0.85}
          style={s.songRow}
        >
          <View style={s.artWrap}>
            {art ? (
              <Image source={art} style={s.art} resizeMode="cover" />
            ) : (
              <View style={[s.art, { backgroundColor: song.albumArtColor }]} />
            )}
            {/* Now-playing equalizer overlay */}
            <View style={s.vizOverlay} pointerEvents="none">
              <EqualizerBars playing={isPlaying} size={15} color="#fff" />
            </View>
          </View>
          <View style={s.meta}>
            <Text style={s.title} numberOfLines={1}>{song.title}</Text>
            <Text style={s.artist} numberOfLines={1}>{song.artistName}</Text>
          </View>
        </TouchableOpacity>

        <View style={s.controls}>
          <TouchableOpacity
            style={s.iconBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Cast"
            onPress={() => showConfirmation('No Cast devices found nearby')}
          >
            <Image source={playerIconAssets.cast} style={s.icon24} resizeMode="contain" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsPlaying(!isPlaying)}
            style={s.iconBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
          >
            <Image
              source={isPlaying ? playerIconAssets.pause : playerIconAssets.play}
              style={isPlaying ? s.icon24 : s.iconPlay}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  wrap: {
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  wrapEmbedded: {
    marginHorizontal: 0,
    marginBottom: 0,
    borderRadius: 0,
  },
  progressTrack: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.18)',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffffff',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 62,
    paddingLeft: 12,
    paddingRight: 30,
    paddingVertical: 10,
  },
  songRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 12,
  },
  artWrap: {
    width: 43,
    height: 43,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  art: {
    width: 43,
    height: 43,
    borderRadius: 4,
    overflow: 'hidden',
  },
  vizOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.34)',
  },
  meta: {
    flex: 1,
    gap: 5,
  },
  title: {
    fontSize: 14,
    lineHeight: 14,
    color: C.textPrimary,
    letterSpacing: 0.98,
  },
  artist: {
    fontSize: 14,
    lineHeight: 14,
    color: '#a3a3a3',
    letterSpacing: 0.28,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 36,
  },
  iconBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon24: {
    width: 24,
    height: 24,
  },
  iconPlay: {
    width: 17,
    height: 21,
  },
})
