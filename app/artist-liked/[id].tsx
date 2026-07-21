import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '../../src/components/AppText'
import { AppImage as Image } from '../../src/components/AppImage'
import { songs as allSongs } from '../../src/data/mockData'
import { albumArtAssets, oliviaPageAssets, artistAssets } from '../../src/data/assetMap'
import { useLikedSongs } from '../../src/context/LikedSongsContext'
import { usePlaybackState } from '../../src/hooks/usePlaybackState'
import { C, typeHeadline } from '../../src/theme'

// Registry pattern shared with the lyrics/discography pages: add a superfan
// artist here and their "Your Liked … Songs" card can deep-link to this page.
const ARTIST_LIKED: Record<string, { name: string; short: string; artistId: string; fallbackArt: any }> = {
  'olivia-rodrigo': { name: 'Olivia Rodrigo', short: 'Olivia', artistId: 'olivia-rodrigo', fallbackArt: oliviaPageAssets.profile },
  tswift: { name: 'Taylor Swift', short: 'Taylor', artistId: 'tswift', fallbackArt: artistAssets['tswift'] },
  bts: { name: 'BTS', short: 'BTS', artistId: 'bts', fallbackArt: artistAssets['bts'] },
}

export default function ArtistLikedScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { likedSongIds } = useLikedSongs()
  const { playSongAt } = usePlaybackState()

  const meta = ARTIST_LIKED[id ?? ''] ?? ARTIST_LIKED['olivia-rodrigo']
  const likedSongs = allSongs.filter(sg => sg.artistId === meta.artistId && likedSongIds.has(sg.id))

  const artFor = (key?: string) => (key ? albumArtAssets[key] : null) ?? meta.fallbackArt
  const play = (songId: string) => {
    playSongAt(songId)
    router.push('/now-playing' as any)
  }

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>You liked {meta.short}&apos;s songs</Text>
          <Text style={s.headerSub}>
            {likedSongs.length} {likedSongs.length === 1 ? 'song' : 'songs'}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {likedSongs.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="heart-outline" size={44} color="rgba(255,255,255,0.25)" />
            <Text style={s.emptyText}>You haven&apos;t liked any {meta.short} songs yet</Text>
          </View>
        ) : (
          likedSongs.map(sg => (
            <TouchableOpacity key={sg.id} style={s.row} activeOpacity={0.8} onPress={() => play(sg.id)}>
              <Image source={artFor(sg.albumArtPath)} style={s.art} resizeMode="cover" />
              <View style={{ flex: 1 }}>
                <Text style={s.title} numberOfLines={1}>{sg.title}</Text>
                <Text style={s.sub} numberOfLines={1}>{meta.name}</Text>
              </View>
              <Ionicons name="heart" size={20} color={C.cyan} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, gap: 8 },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typeHeadline(22), color: '#fff' },
  headerSub: { fontSize: 13, color: '#a6a6a6', marginTop: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  art: { width: 52, height: 52, borderRadius: 8, backgroundColor: '#1a1a1a' },
  title: { fontSize: 15, fontWeight: '600', color: '#fff' },
  sub: { fontSize: 13, color: '#a6a6a6', marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40, gap: 14 },
  emptyText: { fontSize: 15, color: 'rgba(255,255,255,0.55)', textAlign: 'center', lineHeight: 21 },
})
