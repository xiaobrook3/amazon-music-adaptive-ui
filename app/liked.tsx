import { ScrollView, View, TouchableOpacity, StyleSheet } from 'react-native'
import { AppImage as Image } from '../src/components/AppImage'
import { Text } from '../src/components/AppText'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { songs, type Song } from '../src/data/mockData'
import { albumArtAssets } from '../src/data/assetMap'
import { useLikedSongs } from '../src/context/LikedSongsContext'
import { usePlaybackState } from '../src/hooks/usePlaybackState'
import { C, R, typeHeadline, typeSubhead } from '../src/theme'

function LikesMosaic({ likedSongs, size = 156 }: { likedSongs: Song[]; size?: number }) {
  const cells = likedSongs.slice(0, 4)
  const cellSize = size / 2

  if (cells.length === 0) {
    // Amazon Music's own Liked Songs cover — same branded art as the Library tile.
    return (
      <View style={[s.mosaic, { width: size, height: size }]}>
        <Image source={albumArtAssets['my-likes-cover']} style={{ width: size, height: size }} resizeMode="cover" />
      </View>
    )
  }

  return (
    <View style={[s.mosaic, { width: size, height: size }]}>
      {cells.map((song, i) => {
        const art = song.albumArtPath ? albumArtAssets[song.albumArtPath] : null
        return (
          <View key={`${song.id}-${i}`} style={[s.mosaicCell, { width: cellSize, height: cellSize }]}>
            {art ? (
              <Image source={art} style={StyleSheet.absoluteFill} resizeMode="cover" />
            ) : (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: song.albumArtColor }]} />
            )}
          </View>
        )
      })}
      {cells.length < 4 &&
        Array.from({ length: 4 - cells.length }).map((_, i) => (
          <View
            key={`pad-${i}`}
            style={[s.mosaicCell, { width: cellSize, height: cellSize, backgroundColor: C.elevated }]}
          />
        ))}
    </View>
  )
}

export default function LikedSongsScreen() {
  const router = useRouter()
  const { likedSongIds, toggleLike } = useLikedSongs()
  const { playSongAt } = usePlaybackState()

  // Preserve the catalog order so the list feels stable as songs are un-liked.
  const likedSongs = songs.filter(song => likedSongIds.has(song.id))

  const play = (songId: string) => {
    playSongAt(songId)
    router.push('/now-playing')
  }

  const handleShuffle = () => {
    if (likedSongs.length === 0) return
    const random = likedSongs[Math.floor(Math.random() * likedSongs.length)]
    play(random.id)
  }

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={s.topTitle}>Liked Songs</Text>
        <View style={s.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        {/* ── HERO ── */}
        <LinearGradient
          colors={[C.cyan + '3D', C.cyan + '14', C.bg]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={s.hero}
        >
          <View style={s.coverShadow}>
            <LikesMosaic likedSongs={likedSongs} size={156} />
          </View>

          <Text style={s.eyebrow}>YOUR LIBRARY</Text>
          <Text style={s.title}>Liked Songs</Text>
          <Text style={s.meta}>
            {likedSongs.length} {likedSongs.length === 1 ? 'song' : 'songs'}
          </Text>

          {likedSongs.length > 0 && (
            <View style={s.actionRow}>
              <TouchableOpacity style={s.playBtn} onPress={() => play(likedSongs[0].id)} activeOpacity={0.85}>
                <Ionicons name="play" size={17} color={C.bg} />
                <Text style={s.playTxt}>Play</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.shuffleBtn} onPress={handleShuffle} activeOpacity={0.8}>
                <Ionicons name="shuffle" size={18} color={C.textSecondary} />
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>

        {/* ── TRACKS ── */}
        {likedSongs.length === 0 ? (
          <View style={s.emptyState}>
            <Ionicons name="heart-outline" size={40} color={C.textMuted} />
            <Text style={s.emptyText}>No liked songs yet</Text>
            <Text style={s.emptySub}>Tap the ♥ on Now Playing to save songs here.</Text>
          </View>
        ) : (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Songs</Text>
            {likedSongs.map((song, i) => {
              const art = song.albumArtPath ? albumArtAssets[song.albumArtPath] : null
              return (
                <TouchableOpacity
                  key={song.id}
                  onPress={() => play(song.id)}
                  style={s.songRow}
                  activeOpacity={0.75}
                >
                  <Text style={s.songIdx}>{i + 1}</Text>
                  {art ? (
                    <Image source={art} style={s.songArt} resizeMode="cover" />
                  ) : (
                    <View style={[s.songArt, { backgroundColor: song.albumArtColor }]} />
                  )}
                  <View style={s.songInfo}>
                    <Text style={s.songTitle} numberOfLines={1}>{song.title}</Text>
                    <Text style={s.songArtist} numberOfLines={1}>{song.artistName}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => toggleLike(song.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="heart" size={19} color={C.cyan} />
                  </TouchableOpacity>
                </TouchableOpacity>
              )
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontSize: 16, fontWeight: '700', color: C.textPrimary },

  hero: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 28,
    marginBottom: 8,
  },
  coverShadow: {
    borderRadius: R.md,
    shadowColor: C.cyan,
    shadowOpacity: 0.4,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
    marginBottom: 20,
  },
  mosaic: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: R.md,
    overflow: 'hidden',
  },
  mosaicCell: { overflow: 'hidden' },

  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 2, color: C.cyan, marginBottom: 8 },
  title: { ...typeHeadline(26), color: C.textPrimary, textAlign: 'center' },
  meta: { fontSize: 12, color: C.textMuted, marginTop: 10 },

  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 20 },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 28,
    paddingVertical: 11,
    borderRadius: R.full,
    backgroundColor: C.cyan,
  },
  playTxt: { ...typeSubhead(15), color: C.bg },
  shuffleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },

  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { ...typeHeadline(18), color: C.textPrimary, marginBottom: 12 },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  songIdx: { width: 24, fontSize: 13, color: C.textMuted, textAlign: 'center' },
  songArt: { width: 42, height: 42, borderRadius: R.sm, overflow: 'hidden' },
  songInfo: { flex: 1, marginLeft: 12, marginRight: 8 },
  songTitle: { fontSize: 14, fontWeight: '600', color: C.textPrimary },
  songArtist: { fontSize: 12, color: C.textSecondary, marginTop: 2 },

  emptyState: { alignItems: 'center', paddingTop: 40, paddingHorizontal: 32, gap: 10 },
  emptyText: { fontSize: 16, fontWeight: '600', color: C.textSecondary },
  emptySub: { fontSize: 13, color: C.textMuted, textAlign: 'center', lineHeight: 18 },
})
