import { useMemo } from 'react'
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from '../../src/components/AppText'
import { AppImage as Image } from '../../src/components/AppImage'
import { EdgeFadeRow } from '../../src/components/EdgeFadeRow'
import { podcasts, type Podcast } from '../../src/data/mockData'
import { albumArtAssets } from '../../src/data/assetMap'
import { C, typeHeadline } from '../../src/theme'

// Amazon-style witty subheads per category (fallback covers the rest).
const TAGLINES: Record<string, string> = {
  Sports: "You miss 100% of the pods you don't listen to.",
  Comedy: 'Laugh lines, on tap.',
  Music: 'Liner notes for your ears.',
  News: 'Caught up before your coffee cools.',
  Charts: "What's climbing this week.",
  'True Crime': 'Just one more episode. Promise.',
  Business: 'Big ideas for the commute.',
  'Society & Culture': 'The conversations everyone’s having.',
}

function PodTile({ pod, onPress }: { pod: Podcast; onPress: () => void }) {
  const art = pod.coverArtPath ? albumArtAssets[pod.coverArtPath] : null
  return (
    <TouchableOpacity style={s.tile} activeOpacity={0.85} onPress={onPress}>
      {art ? (
        <Image source={art} style={s.tileArt} resizeMode="cover" />
      ) : (
        <View style={[s.tileArt, { backgroundColor: pod.coverColor }]}>
          <Ionicons name="mic" size={30} color="rgba(255,255,255,0.22)" />
        </View>
      )}
      <Text style={s.tileTitle} numberOfLines={2}>{pod.title}</Text>
      <Text style={s.tileHost} numberOfLines={1}>{pod.host}</Text>
    </TouchableOpacity>
  )
}

export default function PodcastCategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const category = decodeURIComponent(id ?? 'Podcasts')

  // Build a healthy pool: shows in this category first, topped up with others so
  // the editorial rails never look empty in the prototype.
  const pool = useMemo(() => {
    const inCat = podcasts.filter(p => p.category === category)
    const rest = podcasts.filter(p => p.category !== category)
    const seen = new Set<string>()
    return [...inCat, ...rest].filter(p => (seen.has(p.id) ? false : seen.add(p.id))).slice(0, 12)
  }, [category])

  const rails: { title: string; sub?: string; list: Podcast[] }[] = [
    { title: 'Ad-free', list: pool.slice(0, 8) },
    { title: `Top ${category} Podcasts`, list: pool },
    { title: `Best ${category} Podcasts`, list: [...pool].reverse() },
  ]

  const open = (pid: string) => router.push(`/podcast-show/${pid}` as any)

  return (
    <View style={s.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={[s.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={8}>
            <Ionicons name="chevron-back" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={s.title}>{category} Podcasts</Text>
          <Text style={s.tagline}>{TAGLINES[category] ?? 'The best shows, hand-picked for you.'}</Text>
        </View>

        {rails.map(rail => (
          <View key={rail.title} style={s.section}>
            <View style={s.sectionHead}>
              <Text style={s.sectionTitle}>{rail.title}</Text>
              <Text style={s.seeMore}>SEE MORE</Text>
            </View>
            <EdgeFadeRow>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
                {rail.list.map(pod => (
                  <PodTile key={`${rail.title}-${pod.id}`} pod={pod} onPress={() => open(pod.id)} />
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
  tileHost: { fontSize: 12, color: C.textSecondary, marginTop: 2 },
})
