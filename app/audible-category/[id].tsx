import { useMemo } from 'react'
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from '../../src/components/AppText'
import { AppImage as Image } from '../../src/components/AppImage'
import { EdgeFadeRow } from '../../src/components/EdgeFadeRow'
import { getBooksByCategory, formatAudiobookDuration, type Audiobook } from '../../src/data/audibleBooks'
import { albumArtAssets } from '../../src/data/assetMap'
import { C, typeHeadline } from '../../src/theme'

const TAGLINES: Record<string, string> = {
  Bestsellers: 'The books everyone is listening to right now.',
  'New Releases': 'Fresh narrations, just added to Audible.',
  'Sci-Fi': 'Galaxies, futures, and worlds beyond.',
  'Self-Help': 'Grow, reflect, and level up.',
  Biographies: 'Real lives, vividly told.',
  Mystery: 'Twists you will not see coming.',
}

function BookTile({ book, onPress }: { book: Audiobook; onPress: () => void }) {
  const art = book.coverArtPath ? albumArtAssets[book.coverArtPath] : null
  return (
    <TouchableOpacity style={s.tile} activeOpacity={0.85} onPress={onPress}>
      {art ? (
        <Image source={art} style={s.tileArt} resizeMode="cover" />
      ) : (
        <View style={[s.tileArt, { backgroundColor: book.coverColor }]}>
          <Ionicons name="book" size={30} color="rgba(255,255,255,0.22)" />
        </View>
      )}
      <Text style={s.tileTitle} numberOfLines={2}>{book.title}</Text>
      <Text style={s.tileAuthor} numberOfLines={1}>{book.author}</Text>
      <Text style={s.tileDuration} numberOfLines={1}>{formatAudiobookDuration(book)}</Text>
    </TouchableOpacity>
  )
}

export default function AudibleCategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const category = decodeURIComponent(id ?? 'Bestsellers')

  const pool = useMemo(() => getBooksByCategory(category), [category])

  const rails: { title: string; list: Audiobook[] }[] = [
    { title: 'Included with membership', list: pool.slice(0, 8) },
    { title: `Top ${category} audiobooks`, list: pool },
    { title: `Best ${category} picks`, list: [...pool].reverse() },
  ]

  const open = (bookId: string) => router.push(`/audible-book/${bookId}` as any)

  return (
    <View style={s.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={[s.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={8}>
            <Ionicons name="chevron-back" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={s.title}>{category}</Text>
          <Text style={s.tagline}>{TAGLINES[category] ?? 'Audiobooks hand-picked for you.'}</Text>
        </View>

        {rails.map(rail => (
          <View key={rail.title} style={s.section}>
            <View style={s.sectionHead}>
              <Text style={s.sectionTitle}>{rail.title}</Text>
              <Text style={s.seeMore}>SEE MORE</Text>
            </View>
            <EdgeFadeRow>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
                {rail.list.map(book => (
                  <BookTile key={`${rail.title}-${book.id}`} book={book} onPress={() => open(book.id)} />
                ))}
              </ScrollView>
            </EdgeFadeRow>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 16, paddingBottom: 20 },
  backBtn: { width: 36, height: 36, alignItems: 'flex-start', justifyContent: 'center', marginLeft: -6, marginBottom: 6 },
  title: { ...typeHeadline(32), color: '#fff' },
  tagline: { fontSize: 15, color: C.textSecondary, marginTop: 6 },

  section: { marginBottom: 24 },
  sectionHead: { paddingHorizontal: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { ...typeHeadline(20), color: '#fff' },
  seeMore: { fontSize: 13, fontWeight: '700', color: C.textMuted },
  rail: { paddingHorizontal: 16, gap: 12 },

  tile: { width: 156 },
  tileArt: { width: 156, height: 156, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tileTitle: { fontSize: 14, fontWeight: '600', color: '#fff', marginTop: 8 },
  tileAuthor: { fontSize: 12, color: C.textSecondary, marginTop: 2 },
  tileDuration: { fontSize: 11, color: C.textMuted, marginTop: 2 },
})
