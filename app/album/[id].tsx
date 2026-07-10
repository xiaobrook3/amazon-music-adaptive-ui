import { View, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { AppImage as Image } from '../../src/components/AppImage'
import { Text } from '../../src/components/AppText'
import { usePlaybackState } from '../../src/hooks/usePlaybackState'
import { songs } from '../../src/data/mockData'
import { albumArtAssets } from '../../src/data/assetMap'
import { OLIVIA_TOP_ALBUMS } from '../../src/data/oliviaRodrigoPage'
import { C } from '../../src/theme'

/**
 * Album route — the artist "Top Albums" rails push /album/<id> (e.g.
 * or-album-guts), which previously had no route and dead-ended on Unmatched
 * Route. Renders the album's tracks from the mock catalog; tapping a track
 * plays it and opens Now Playing (the house pattern).
 */

// Album id -> which catalog `album` strings belong to it.
const ALBUM_MATCH: Record<string, (album: string) => boolean> = {
  'or-album-guts':         a => a === 'GUTS',
  'or-album-sour':         a => a === 'SOUR',
  'or-album-guts-spilled': a => a.startsWith('GUTS'),
  'or-album-hg':           a => a.toLowerCase().includes('hunger'),
  'or-album-hsmtmts':      a => a.toLowerCase().includes('hsmtmts') || a.toLowerCase().includes('high school'),
  'or-album-secret':       a => a.startsWith('GUTS'),
  'or-album-bestof':       () => true,
}

export default function AlbumScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { playSongAt } = usePlaybackState()

  const meta = OLIVIA_TOP_ALBUMS.find(al => al.id === id)
  const match = ALBUM_MATCH[id ?? ''] ?? (() => true)
  const oliviaSongs = songs.filter(sg => sg.artistId === 'olivia-rodrigo')
  const tracks = oliviaSongs.filter(sg => match(sg.album))
  const list = tracks.length ? tracks : oliviaSongs
  const art = meta ? albumArtAssets[meta.artKey] : undefined

  const play = (songId: string) => {
    playSongAt(songId)
    router.push('/now-playing' as any)
  }

  return (
    <SafeAreaView style={s.screen} edges={['top', 'bottom']}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace('/' as any))} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={s.topLabel}>ALBUM</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        <View style={s.artWrap}>
          {art ? (
            <Image source={art} style={s.art} resizeMode="cover" />
          ) : (
            <View style={[s.art, { backgroundColor: '#1a1424', alignItems: 'center', justifyContent: 'center' }]}>
              <Ionicons name="musical-note" size={56} color="rgba(255,255,255,0.12)" />
            </View>
          )}
        </View>
        <Text style={s.title}>{meta?.title ?? 'Album'}</Text>
        <Text style={s.sub}>{meta?.subtitle ?? 'Olivia Rodrigo'} · Olivia Rodrigo</Text>
        <View style={s.list}>
          {list.map((sg, i) => (
            <TouchableOpacity key={sg.id} style={s.row} activeOpacity={0.7} onPress={() => play(sg.id)}>
              <Text style={s.rowN}>{i + 1}</Text>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={s.rowT} numberOfLines={1}>{sg.title}</Text>
                <Text style={s.rowM} numberOfLines={1}>{sg.artistName} · {sg.duration}</Text>
              </View>
              <Ionicons name="play" size={16} color={C.cyan} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  topLabel: { color: '#A6A6A6', fontSize: 11, letterSpacing: 1.2, fontWeight: '700' },
  body: { paddingBottom: 40, alignItems: 'center' },
  artWrap: { marginTop: 8, borderRadius: 10, overflow: 'hidden' },
  art: { width: 224, height: 224 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 16, textAlign: 'center', paddingHorizontal: 24 },
  sub: { color: '#A6A6A6', fontSize: 12.5, marginTop: 4, marginBottom: 14 },
  list: { alignSelf: 'stretch', paddingHorizontal: 20, gap: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 11, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.08)' },
  rowN: { color: '#5c6570', fontSize: 12, width: 18, textAlign: 'center', fontWeight: '700' },
  rowT: { color: '#fff', fontSize: 14.5, fontWeight: '600' },
  rowM: { color: '#8f99a5', fontSize: 11.5, marginTop: 2 },
})
