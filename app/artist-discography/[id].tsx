import { useState, useMemo } from 'react'
import { View, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '../../src/components/AppText'
import { AppImage as Image } from '../../src/components/AppImage'
import { albumArtAssets, oliviaPageAssets, artistAssets } from '../../src/data/assetMap'
import { OLIVIA_DISCOGRAPHY, type DiscographyRelease } from '../../src/data/oliviaRodrigoPage'
import { TAYLOR_DISCOGRAPHY, type TaylorDiscographyRelease } from '../../src/data/taylorSwiftPage'
import { BTS_DISCOGRAPHY, type BtsDiscographyRelease } from '../../src/data/btsPage'
import { C, typeHeadline } from '../../src/theme'

type FilterTab = 'all' | 'albums' | 'singles' | 'eps'
type AnyRelease = DiscographyRelease | TaylorDiscographyRelease | BtsDiscographyRelease

const GREY = '#a6a6a6'

// Discography data + art fallback + display name per artist — add a new entry
// here when a new artist gets a full "You & Artist" build-out.
const ARTIST_DISCOGRAPHIES: Record<string, { name: string; releases: AnyRelease[]; fallbackArt: any }> = {
  'olivia-rodrigo': { name: 'Olivia Rodrigo', releases: OLIVIA_DISCOGRAPHY, fallbackArt: oliviaPageAssets.profile },
  'tswift':         { name: 'Taylor Swift',   releases: TAYLOR_DISCOGRAPHY, fallbackArt: artistAssets['tswift'] },
  'bts':            { name: 'BTS',            releases: BTS_DISCOGRAPHY,    fallbackArt: artistAssets['bts'] },
}

function typeLabel(type: AnyRelease['type']): string {
  switch (type) {
    case 'album':   return 'Album'
    case 'deluxe':  return 'Deluxe'
    case 'single':  return 'Single'
    case 'ep':      return 'EP'
    case 'live':    return 'Live'
    default:        return type
  }
}

function releaseMatchesFilter(r: AnyRelease, filter: FilterTab): boolean {
  if (filter === 'all') return true
  if (filter === 'albums') return r.type === 'album' || r.type === 'deluxe'
  if (filter === 'singles') return r.type === 'single'
  if (filter === 'eps') return r.type === 'ep'
  return true
}

// ── sub-components ────────────────────────────────────────────────────────────

function resolveArt(key: string | undefined, fallback: any) {
  return (key ? albumArtAssets[key] : null) ?? fallback
}

function AlbumCard({ release, fallbackArt, router }: { release: AnyRelease; fallbackArt: any; router: ReturnType<typeof useRouter> }) {
  const trackCount = release.tracks?.length ?? 0

  return (
    <TouchableOpacity
      style={s.albumCard}
      activeOpacity={0.85}
      onPress={() => router.push(`/album/${release.id}` as any)}
    >
      <View style={s.albumRow}>
        <Image source={resolveArt(release.artKey, fallbackArt)} style={s.albumArt} resizeMode="cover" />
        <View style={{ flex: 1 }}>
          <Text style={s.albumTitle} numberOfLines={1}>{release.title}</Text>
          <Text style={s.albumMeta}>{typeLabel(release.type)} • {trackCount} tracks</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={GREY} />
      </View>
    </TouchableOpacity>
  )
}

function SingleRow({ release, fallbackArt, router }: { release: AnyRelease; fallbackArt: any; router: ReturnType<typeof useRouter> }) {
  return (
    <TouchableOpacity
      style={s.singleRow}
      activeOpacity={0.85}
      onPress={() => router.push(`/album/${release.id}` as any)}
    >
      <Image source={resolveArt(release.artKey, fallbackArt)} style={s.singleArt} resizeMode="cover" />
      <View style={{ flex: 1 }}>
        <Text style={s.singleTitle} numberOfLines={1}>{release.title}</Text>
        <Text style={s.singleMeta}>{typeLabel(release.type)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={GREY} />
    </TouchableOpacity>
  )
}

// ── screen ────────────────────────────────────────────────────────────────────

export default function ArtistDiscographyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')

  const artistData = ARTIST_DISCOGRAPHIES[id ?? ''] ?? ARTIST_DISCOGRAPHIES['olivia-rodrigo']
  const fallbackArt = artistData.fallbackArt

  const filtered = useMemo(
    () => artistData.releases.filter(r => releaseMatchesFilter(r, activeFilter)),
    [artistData, activeFilter],
  )

  // Group by year for the "All" timeline view
  const byYear = useMemo<Map<number, AnyRelease[]>>(() => {
    const map = new Map<number, AnyRelease[]>()
    for (const r of filtered) {
      const list = map.get(r.year) ?? []
      list.push(r)
      map.set(r.year, list)
    }
    return map
  }, [filtered])

  const years = useMemo(
    () => Array.from(byYear.keys()).sort((a, b) => b - a),
    [byYear],
  )

  const artistName = artistData.name

  const FILTER_TABS: { key: FilterTab; label: string }[] = [
    { key: 'all',     label: 'All' },
    { key: 'albums',  label: 'Albums' },
    { key: 'singles', label: 'Singles' },
    { key: 'eps',     label: 'EPs' },
  ]

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerSub} numberOfLines={1}>{artistName}</Text>
          <Text style={s.headerTitle}>Discography</Text>
        </View>
      </View>

      {/* Filter bar */}
      <View style={s.filterBar}>
        {FILTER_TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[s.filterTab, activeFilter === tab.key && s.filterTabActive]}
            activeOpacity={0.8}
            onPress={() => setActiveFilter(tab.key)}
          >
            <Text
              style={[
                s.filterTabText,
                activeFilter === tab.key && s.filterTabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[s.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {activeFilter === 'all' ? (
          // Timeline grouped by year
          years.map(year => {
            const releases = byYear.get(year) ?? []
            return (
              <View key={year} style={s.yearSection}>
                <View style={s.yearHeadRow}>
                  <View style={s.yearDot} />
                  <Text style={s.yearLabel}>{year}</Text>
                  <View style={s.yearLine} />
                </View>
                <View style={s.yearReleases}>
                  {releases.map(r =>
                    r.type === 'album' || r.type === 'deluxe' || (r.type === 'ep' && r.tracks) ? (
                      <AlbumCard key={r.id} release={r} fallbackArt={fallbackArt} router={router} />
                    ) : (
                      <SingleRow key={r.id} release={r} fallbackArt={fallbackArt} router={router} />
                    ),
                  )}
                </View>
              </View>
            )
          })
        ) : activeFilter === 'albums' ? (
          // Album cards only
          <View style={s.albumsSection}>
            {filtered.map(r => (
              <AlbumCard key={r.id} release={r} fallbackArt={fallbackArt} router={router} />
            ))}
          </View>
        ) : activeFilter === 'eps' ? (
          // EPs — expandable cards when tracks available
          <View style={s.albumsSection}>
            {filtered.map(r =>
              r.tracks ? (
                <AlbumCard key={r.id} release={r} fallbackArt={fallbackArt} router={router} />
              ) : (
                <SingleRow key={r.id} release={r} fallbackArt={fallbackArt} router={router} />
              ),
            )}
          </View>
        ) : (
          // Singles flat list
          <View style={s.singlesSection}>
            {filtered.map(r => (
              <SingleRow key={r.id} release={r} fallbackArt={fallbackArt} router={router} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSub: {
    fontSize: 12,
    color: GREY,
    letterSpacing: 0.4,
  },
  headerTitle: {
    ...typeHeadline(22),
    color: '#fff',
    marginTop: 2,
  },

  // Filter bar
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: 'transparent',
  },
  filterTabActive: {
    backgroundColor: C.cyan,
    borderColor: C.cyan,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: GREY,
  },
  filterTabTextActive: {
    color: '#000',
  },

  // Scroll content
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  // Timeline year section
  yearSection: {
    marginBottom: 28,
  },
  yearHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  yearDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: C.cyan,
  },
  yearLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: C.cyan,
    letterSpacing: 1,
  },
  yearLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.border,
  },
  yearReleases: {
    gap: 12,
  },

  // Albums section (non-timeline)
  albumsSection: {
    gap: 12,
  },
  singlesSection: {
    gap: 0,
  },

  // Album card
  albumCard: {
    backgroundColor: C.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  albumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 12,
  },
  albumArt: {
    width: 60,
    height: 60,
    borderRadius: 6,
    borderWidth: 0.75,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  albumTitle: {
    ...typeHeadline(16),
    color: '#fff',
  },
  albumMeta: {
    fontSize: 12,
    color: GREY,
    marginTop: 3,
  },

  // Track list inside album card
  // Single row
  singleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
  },
  singleArt: {
    width: 46,
    height: 46,
    borderRadius: 4,
    borderWidth: 0.75,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  singleTitle: {
    ...typeHeadline(15),
    color: '#fff',
  },
  singleMeta: {
    fontSize: 12,
    color: GREY,
    marginTop: 2,
  },
})
