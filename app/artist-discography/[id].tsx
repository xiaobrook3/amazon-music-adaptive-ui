import { useState, useMemo } from 'react'
import { View, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '../../src/components/AppText'
import { AppImage as Image } from '../../src/components/AppImage'
import { albumArtAssets, oliviaPageAssets } from '../../src/data/assetMap'
import {
  OLIVIA_DISCOGRAPHY,
  type DiscographyRelease,
  type DiscographyType,
} from '../../src/data/oliviaRodrigoPage'
import { C, typeHeadline } from '../../src/theme'

type FilterTab = 'all' | 'albums' | 'singles' | 'eps'

const GREY = '#a6a6a6'

function resolveArt(key?: string) {
  return (key ? albumArtAssets[key] : null) ?? oliviaPageAssets.profile
}

function typeLabel(type: DiscographyType): string {
  switch (type) {
    case 'album':   return 'Album'
    case 'deluxe':  return 'Deluxe'
    case 'single':  return 'Single'
    case 'ep':      return 'EP'
  }
}

function releaseMatchesFilter(r: DiscographyRelease, filter: FilterTab): boolean {
  if (filter === 'all') return true
  if (filter === 'albums') return r.type === 'album' || r.type === 'deluxe'
  if (filter === 'singles') return r.type === 'single'
  if (filter === 'eps') return r.type === 'ep'
  return true
}

// ── sub-components ────────────────────────────────────────────────────────────

function AlbumCard({ release }: { release: DiscographyRelease }) {
  const [expanded, setExpanded] = useState(false)
  const trackCount = release.tracks?.length ?? 0

  return (
    <View style={s.albumCard}>
      <TouchableOpacity
        style={s.albumRow}
        activeOpacity={0.85}
        onPress={() => release.tracks && setExpanded(v => !v)}
      >
        <Image source={resolveArt(release.artKey)} style={s.albumArt} resizeMode="cover" />
        <View style={{ flex: 1 }}>
          <Text style={s.albumTitle} numberOfLines={1}>{release.title}</Text>
          <Text style={s.albumMeta}>{typeLabel(release.type)} • {trackCount} tracks</Text>
        </View>
        {release.tracks ? (
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={GREY}
          />
        ) : null}
      </TouchableOpacity>

      {expanded && release.tracks && (
        <View style={s.trackList}>
          {release.tracks.map((t, i) => (
            <View key={t.title + i} style={s.trackRow}>
              <Text style={s.trackNum}>{i + 1}</Text>
              <Text style={s.trackTitle} numberOfLines={1}>{t.title}</Text>
              <Text style={s.trackDur}>{t.duration}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

function SingleRow({ release }: { release: DiscographyRelease }) {
  return (
    <View style={s.singleRow}>
      <Image source={resolveArt(release.artKey)} style={s.singleArt} resizeMode="cover" />
      <View style={{ flex: 1 }}>
        <Text style={s.singleTitle} numberOfLines={1}>{release.title}</Text>
        <Text style={s.singleMeta}>{typeLabel(release.type)}</Text>
      </View>
    </View>
  )
}

// ── screen ────────────────────────────────────────────────────────────────────

export default function ArtistDiscographyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')

  const filtered = useMemo(
    () => OLIVIA_DISCOGRAPHY.filter(r => releaseMatchesFilter(r, activeFilter)),
    [activeFilter],
  )

  // Group by year for the "All" timeline view
  const byYear = useMemo<Map<number, DiscographyRelease[]>>(() => {
    const map = new Map<number, DiscographyRelease[]>()
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

  const artistName = id === 'olivia-rodrigo' ? 'Olivia Rodrigo' : id ?? 'Artist'

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
                      <AlbumCard key={r.id} release={r} />
                    ) : (
                      <SingleRow key={r.id} release={r} />
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
              <AlbumCard key={r.id} release={r} />
            ))}
          </View>
        ) : activeFilter === 'eps' ? (
          // EPs — expandable cards when tracks available
          <View style={s.albumsSection}>
            {filtered.map(r =>
              r.tracks ? (
                <AlbumCard key={r.id} release={r} />
              ) : (
                <SingleRow key={r.id} release={r} />
              ),
            )}
          </View>
        ) : (
          // Singles flat list
          <View style={s.singlesSection}>
            {filtered.map(r => (
              <SingleRow key={r.id} release={r} />
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
  trackList: {
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 2,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    gap: 12,
  },
  trackNum: {
    width: 20,
    fontSize: 13,
    color: GREY,
    textAlign: 'center',
  },
  trackTitle: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
  },
  trackDur: {
    fontSize: 13,
    color: GREY,
    minWidth: 36,
    textAlign: 'right',
  },

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
