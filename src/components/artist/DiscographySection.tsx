import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '../AppText'
import { AppImage as Image } from '../AppImage'
import { C } from '../../theme'

const GREY = '#a6a6a6'
const DISC_ART = 52
const DEFAULT_PREVIEW_COUNT = 4

export interface DiscographyReleaseLike {
  id: string
  title: string
  year: number
  type: string
  artKey: string
  tracks?: { title: string; duration: string }[]
}

/** Vertical, line-free release list — shared by every artist's Discography section. */
export default function DiscographySection({
  releases,
  resolveArt,
  onExploreAll,
  previewCount = DEFAULT_PREVIEW_COUNT,
}: {
  releases: DiscographyReleaseLike[]
  resolveArt: (key?: string) => any
  onExploreAll: () => void
  previewCount?: number
}) {
  const router = useRouter()
  const sorted = [...releases].sort((a, b) => b.year - a.year)
  const visible = sorted.slice(0, previewCount)

  return (
    <View style={s.discography}>
      {visible.map(rel => (
        <TouchableOpacity
          key={rel.id}
          style={s.discRow}
          onPress={() => router.push(`/album/${rel.id}` as any)}
          activeOpacity={0.8}
        >
          <Image source={resolveArt(rel.artKey)} style={s.discArt} />
          <View style={s.discMeta}>
            <Text style={s.discBadgeText}>{rel.type.toUpperCase()}</Text>
            <Text style={s.discTitle} numberOfLines={2}>{rel.title}</Text>
            <Text style={s.discYear}>{rel.year}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={GREY} />
        </TouchableOpacity>
      ))}

      {sorted.length > previewCount && (
        <TouchableOpacity style={s.exploreBtn} onPress={onExploreAll} activeOpacity={0.8}>
          <Text style={s.exploreBtnText}>Explore Full Discography</Text>
          <Ionicons name="chevron-forward" size={14} color={C.cyan} />
        </TouchableOpacity>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  discography: { gap: 0 },
  // No borderBottom — releases are separated by breathing room, not lines.
  discRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  discArt: { width: DISC_ART, height: DISC_ART, borderRadius: 4 },
  discMeta: { flex: 1 },
  discBadgeText: { fontSize: 10, color: C.cyan, fontWeight: '800', letterSpacing: 0.5, marginBottom: 3 },
  discTitle: { fontSize: 13, color: '#fff', fontWeight: '600' },
  discYear: { fontSize: 11, color: GREY, marginTop: 3 },
  exploreBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14 },
  exploreBtnText: { fontSize: 13, fontWeight: '700', color: C.cyan },
})
