import { View, ScrollView, StyleSheet } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '../../src/components/AppText'
import { LyricCardFace, type LyricStackItem } from '../../src/components/artist/LyricCardStack'
import { albumArtAssets, oliviaPageAssets, artistAssets } from '../../src/data/assetMap'
import { OLIVIA_FAVORITE_LYRICS } from '../../src/data/oliviaRodrigoPage'
import { TAYLOR_FAVORITE_LYRICS } from '../../src/data/taylorSwiftPage'
import { BTS_FAVORITE_LYRICS } from '../../src/data/btsPage'
import { C, typeHeadline } from '../../src/theme'

// Same registry pattern as the discography page — add a new artist here once
// their lyric set exists.
const ARTIST_LYRICS: Record<string, { name: string; items: LyricStackItem[]; resolveArt: (key: string) => any }> = {
  'olivia-rodrigo': {
    name: 'Olivia Rodrigo',
    items: OLIVIA_FAVORITE_LYRICS,
    resolveArt: (key: string) => albumArtAssets[key] ?? oliviaPageAssets.profile,
  },
  tswift: {
    name: 'Taylor Swift',
    items: TAYLOR_FAVORITE_LYRICS,
    resolveArt: (key: string) => albumArtAssets[key] ?? artistAssets['tswift'],
  },
  bts: {
    name: 'BTS',
    items: BTS_FAVORITE_LYRICS,
    resolveArt: (key: string) => albumArtAssets[key] ?? artistAssets['bts'],
  },
}

export default function ArtistLyricsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const artistData = ARTIST_LYRICS[id ?? ''] ?? ARTIST_LYRICS['olivia-rodrigo']

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerSub} numberOfLines={1}>{artistData.name}</Text>
          <Text style={s.headerTitle}>Favorite Lyrics</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[s.grid, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {artistData.items.map((item, i) => (
          <View key={item.song + i} style={s.card}>
            <LyricCardFace item={item} front resolveArt={artistData.resolveArt} />
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerSub: { fontSize: 12, color: '#a6a6a6', letterSpacing: 0.4 },
  headerTitle: { ...typeHeadline(22), color: '#fff', marginTop: 2 },
  grid: { paddingHorizontal: 16, paddingTop: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  card: {
    width: '48%',
    aspectRatio: 0.85,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: '#000',
    overflow: 'hidden',
    padding: 14,
    justifyContent: 'space-between',
  },
})
