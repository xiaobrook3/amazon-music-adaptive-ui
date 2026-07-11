import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { ScrollView, View, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import { AppImage as Image } from '../../src/components/AppImage'
import { Text } from '../../src/components/AppText'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { songs, artists, playlists, podcasts, fanGroups } from '../../src/data/mockData'
import { albumArtAssets, resolveArtistAvatar } from '../../src/data/assetMap'
import { usePlaybackState } from '../../src/hooks/usePlaybackState'
import { useAdaptiveUI } from '../../src/context/AdaptiveUIContext'
import { useAdaptiveMenu } from '../../src/components/AdaptiveContextMenu'
import { C, R, typeHeadline } from '../../src/theme'
import StickyFindHeader, {
  useFindFixedHeaderHeight,
} from '../../src/components/StickyFindHeader'
import { EdgeFadeRow } from '../../src/components/EdgeFadeRow'

const FIND_PILLS = [
  'Fan Groups',
  'Create with AI',
  'Playlists',
  'Audiobooks',
  'Podcasts',
  'Songs',
  'Artists',
  'Album',
] as const

type CategoryCard = {
  label: string
  gradient: readonly [string, string]
  icon: keyof typeof Ionicons.glyphMap
}

const BROWSE_ALL: CategoryCard[] = [
  { label: 'Pop',          gradient: ['#1a3a5c', '#0C1B22'], icon: 'musical-notes' },
  { label: 'Hip-Hop',      gradient: ['#3a1a5c', '#0C1B22'], icon: 'mic' },
  { label: 'Rock',         gradient: ['#5c2a1a', '#0C1B22'], icon: 'flame' },
  { label: 'R&B',          gradient: ['#1a5c3a', '#0C1B22'], icon: 'heart' },
  { label: 'Country',      gradient: ['#5c5c1a', '#0C1B22'], icon: 'trail-sign' },
  { label: 'Jazz',         gradient: ['#1a5c5c', '#0C1B22'], icon: 'wine' },
  { label: 'New Releases', gradient: ['#2a4a6c', '#0C1B22'], icon: 'sparkles' },
  { label: 'Charts',       gradient: ['#4a2a6c', '#0C1B22'], icon: 'stats-chart' },
]

const MUSIC_BY_GENRE: CategoryCard[] = [
  { label: 'K-Pop',    gradient: ['#4a1a6c', '#0C1B22'], icon: 'star' },
  { label: 'Indie',    gradient: ['#1a4a4a', '#0C1B22'], icon: 'leaf' },
  { label: 'Electronic', gradient: ['#3a3a1a', '#0C1B22'], icon: 'pulse' },
  { label: 'Classical', gradient: ['#2a2a5c', '#0C1B22'], icon: 'musical-note' },
  { label: 'Latin',    gradient: ['#5c3a1a', '#0C1B22'], icon: 'sunny' },
  { label: 'Soul',     gradient: ['#1a3a3a', '#0C1B22'], icon: 'heart-half' },
]

const LISTEN_YOUR_WAY: CategoryCard[] = [
  { label: 'Workout',       gradient: ['#5c1a2a', '#0C1B22'], icon: 'barbell' },
  { label: 'Focus',         gradient: ['#1a3a5c', '#0C1B22'], icon: 'bulb' },
  { label: 'Relax',         gradient: ['#1a4a3a', '#0C1B22'], icon: 'cafe' },
  { label: 'Commute',       gradient: ['#3a2a5c', '#0C1B22'], icon: 'bus' },
  { label: 'Party',         gradient: ['#5c4a1a', '#0C1B22'], icon: 'sparkles' },
  { label: 'Sleep',         gradient: ['#1a2a4a', '#0C1B22'], icon: 'moon' },
]

const FROM_AUDIBLE: CategoryCard[] = [
  { label: 'Bestsellers',   gradient: ['#3a1a1a', '#0C1B22'], icon: 'trophy' },
  { label: 'New Releases',  gradient: ['#2a3a1a', '#0C1B22'], icon: 'sparkles' },
  { label: 'Sci-Fi',        gradient: ['#1a2a5c', '#0C1B22'], icon: 'rocket' },
  { label: 'Self-Help',     gradient: ['#4a3a1a', '#0C1B22'], icon: 'bulb' },
  { label: 'Biographies',   gradient: ['#3a2a2a', '#0C1B22'], icon: 'person' },
  { label: 'Mystery',       gradient: ['#1a1a4a', '#0C1B22'], icon: 'search' },
]

const FROM_PODCAST: CategoryCard[] = [
  { label: 'True Crime',    gradient: ['#4a1a1a', '#0C1B22'], icon: 'finger-print' },
  { label: 'Comedy',        gradient: ['#5c3a1a', '#0C1B22'], icon: 'happy' },
  { label: 'News',          gradient: ['#1a3a5c', '#0C1B22'], icon: 'newspaper' },
  { label: 'Music Talk',    gradient: ['#3a1a5c', '#0C1B22'], icon: 'mic' },
  { label: 'Sports',        gradient: ['#1a4a2a', '#0C1B22'], icon: 'football' },
  { label: 'Education',     gradient: ['#2a4a4a', '#0C1B22'], icon: 'school' },
]

const SEARCH_HISTORY = [
  'BTS',
  'Taylor Swift',
  'Lorde',
  'Dynamite',
  'Cruel Summer',
  'Green Light',
  'Black Swan',
  'Mitski',
  'Spring Day',
]

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

function CategoryGrid({ items, onPressItem }: { items: CategoryCard[]; onPressItem: (label: string) => void }) {
  return (
    <View style={s.categoryGrid}>
      {items.map(cat => (
        <TouchableOpacity
          key={cat.label}
          style={s.categoryCardWrapper}
          activeOpacity={0.85}
          onPress={() => onPressItem(cat.label)}
        >
          <LinearGradient
            colors={cat.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.categoryCard}
          >
            <Text style={s.categoryLabel}>{cat.label}</Text>
            <Ionicons name={cat.icon} size={34} color="rgba(255,255,255,0.9)" style={s.categoryIcon} />
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </View>
  )
}

function BrowseSection({ title, items, onPressItem }: { title: string; items: CategoryCard[]; onPressItem: (label: string) => void }) {
  return (
    <View style={s.browseSection}>
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>{title}</Text>
      </View>
      <CategoryGrid items={items} onPressItem={onPressItem} />
    </View>
  )
}

// "From podcast" card labels → real podcast catalog categories.
const PODCAST_LABEL_TO_CATEGORY: Record<string, string> = {
  'True Crime': 'True Crime',
  'Comedy': 'Comedy',
  'News': 'News',
  'Music Talk': 'Music',
  'Sports': 'Sports',
  'Education': 'Society & Culture',
}

export default function FindScreen() {
  const router = useRouter()
  const { playSongAt } = usePlaybackState()
  const { showConfirmation } = useAdaptiveUI()
  const { open: openAdaptiveMenu } = useAdaptiveMenu()
  const fixedHeaderHeight = useFindFixedHeaderHeight()

  const [focused, setFocused] = useState(false)
  const [query, setQuery] = useState('')
  const [activePill, setActivePill] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [refreshSeed, setRefreshSeed] = useState(0)
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const browseAll = useMemo(() => shuffle(BROWSE_ALL), [refreshSeed])
  const musicByGenre = useMemo(() => shuffle(MUSIC_BY_GENRE), [refreshSeed])
  const listenYourWay = useMemo(() => shuffle(LISTEN_YOUR_WAY), [refreshSeed])
  const fromAudible = useMemo(() => shuffle(FROM_AUDIBLE), [refreshSeed])
  const fromPodcast = useMemo(() => shuffle(FROM_PODCAST), [refreshSeed])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    refreshTimer.current = setTimeout(() => {
      setRefreshSeed(n => n + 1)
      setActivePill(null)
      setRefreshing(false)
    }, 900)
  }, [])

  // Don't fire setState on an unmounted screen if the user navigates mid-refresh.
  useEffect(() => () => { if (refreshTimer.current) clearTimeout(refreshTimer.current) }, [])

  const showBrowse = !focused && !query.trim()
  const showHistory = focused && !query.trim()
  const showResults = query.trim().length > 0

  const q = query.toLowerCase()
  const results = showResults
    ? songs.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.artistName.toLowerCase().includes(q)
      )
    : []
  // Search covers the whole catalog, not just songs — pills narrow by type.
  const artistResults = showResults ? artists.filter(a => a.name.toLowerCase().includes(q)).slice(0, 6) : []
  const playlistResults = showResults ? playlists.filter(pl => pl.name.toLowerCase().includes(q)).slice(0, 6) : []
  const podcastResults = showResults
    ? podcasts.filter(pod => pod.title.toLowerCase().includes(q) || pod.host.toLowerCase().includes(q)).slice(0, 6)
    : []
  const fanGroupResults = showResults ? fanGroups.filter(fg => fg.name.toLowerCase().includes(q)) : []

  const typeFilter = activePill
  const showSection = (section: string) =>
    !typeFilter || typeFilter === section || typeFilter === 'Create with AI'

  const openSong = (songId: string) => {
    playSongAt(songId)
    router.push('/now-playing')
  }

  const handlePill = (pill: string) => {
    // "Create with AI" is a shortcut into Maestro, not a filter.
    if (pill === 'Create with AI') {
      router.push('/(tabs)/maestro' as any)
      return
    }
    setActivePill(activePill === pill ? null : pill)
  }

  const handleCategory = (section: 'genre' | 'podcast' | 'audible') => (label: string) => {
    if (section === 'audible') {
      showConfirmation('Audiobooks open in the Audible app')
      return
    }
    if (section === 'podcast') {
      const cat = PODCAST_LABEL_TO_CATEGORY[label] ?? label
      router.push(`/podcast-category/${encodeURIComponent(cat)}` as any)
      return
    }
    router.push(`/genre/${encodeURIComponent(label)}` as any)
  }

  return (
    <View style={s.screen}>
      <StickyFindHeader
        focused={focused}
        query={query}
        onChangeText={setQuery}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onClear={() => setQuery('')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.scrollContent, { paddingTop: fixedHeaderHeight }]}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.cyan}
            colors={[C.cyan]}
            progressViewOffset={fixedHeaderHeight}
          />
        }
      >
        <EdgeFadeRow>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.pillRow}
            style={s.pillScroll}
          >
            {FIND_PILLS.map(pill => (
              <TouchableOpacity
                key={pill}
                onPress={() => handlePill(pill)}
                style={[s.filterPill, activePill === pill && s.filterPillActive]}
                activeOpacity={0.8}
              >
                <Text style={[s.filterLabel, activePill === pill && s.filterLabelActive]}>{pill}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </EdgeFadeRow>

        {showHistory && (
          <>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Search history</Text>
            </View>
            <View style={s.historyList}>
              {SEARCH_HISTORY.map(item => (
                <TouchableOpacity
                  key={item}
                  style={s.historyRow}
                  onPress={() => setQuery(item)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="time-outline" size={20} color={C.textMuted} />
                  <Text style={s.historyText} numberOfLines={1}>{item}</Text>
                  <TouchableOpacity
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    onPress={() => setQuery(item)}
                  >
                    <Ionicons name="arrow-up-outline" size={18} color={C.textMuted} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {showBrowse && (
          <>
            <BrowseSection title="Browse all" items={browseAll} onPressItem={handleCategory('genre')} />
            <BrowseSection title="Music by genre" items={musicByGenre} onPressItem={handleCategory('genre')} />
            <BrowseSection title="Listen your way" items={listenYourWay} onPressItem={handleCategory('genre')} />
            <BrowseSection title="From Audible" items={fromAudible} onPressItem={handleCategory('audible')} />
            <BrowseSection title="From podcast" items={fromPodcast} onPressItem={handleCategory('podcast')} />
          </>
        )}

        {showResults && (
          <>
            {showSection('Artists') && artistResults.length > 0 && (
              <>
                <View style={s.sectionHeader}>
                  <Text style={s.sectionTitle}>Artists</Text>
                </View>
                <View style={s.resultsList}>
                  {artistResults.map(artist => {
                    const avatar = resolveArtistAvatar(artist.id, artist.imageUri)
                    return (
                      <TouchableOpacity
                        key={artist.id}
                        style={s.resultRow}
                        onPress={() => router.push(`/artist/${artist.id}` as any)}
                        activeOpacity={0.8}
                      >
                        {avatar ? (
                          <Image source={avatar} style={[s.resultArt, s.resultArtRound]} resizeMode="cover" />
                        ) : (
                          <View style={[s.resultArt, s.resultArtRound, { backgroundColor: C.elevated }]} />
                        )}
                        <View style={s.resultMeta}>
                          <Text style={s.resultTitle} numberOfLines={1}>{artist.name}</Text>
                          <Text style={s.resultArtist} numberOfLines={1}>Artist · {artist.genre}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={C.textMuted} />
                      </TouchableOpacity>
                    )
                  })}
                </View>
              </>
            )}

            {showSection('Songs') && results.length > 0 && (
              <>
                <View style={s.sectionHeader}>
                  <Text style={s.sectionTitle}>Songs</Text>
                </View>
                <View style={s.resultsList}>
                  {results.map(song => {
                    const art = song.albumArtPath ? albumArtAssets[song.albumArtPath] : null
                    return (
                      <TouchableOpacity
                        key={song.id}
                        style={s.resultRow}
                        onPress={() => openSong(song.id)}
                        activeOpacity={0.8}
                      >
                        {art ? (
                          <Image source={art} style={s.resultArt} resizeMode="cover" />
                        ) : (
                          <View style={[s.resultArt, { backgroundColor: song.albumArtColor }]} />
                        )}
                        <View style={s.resultMeta}>
                          <Text style={s.resultTitle} numberOfLines={1}>{song.title}</Text>
                          <Text style={s.resultArtist} numberOfLines={1}>{song.artistName}</Text>
                        </View>
                        <TouchableOpacity
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          onPress={() => openAdaptiveMenu({ kind: 'song', song })}
                        >
                          <Ionicons name="ellipsis-horizontal" size={18} color={C.textMuted} />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              </>
            )}

            {showSection('Playlists') && playlistResults.length > 0 && (
              <>
                <View style={s.sectionHeader}>
                  <Text style={s.sectionTitle}>Playlists</Text>
                </View>
                <View style={s.resultsList}>
                  {playlistResults.map(pl => {
                    const art = pl.coverArtPath ? albumArtAssets[pl.coverArtPath] : null
                    return (
                      <TouchableOpacity
                        key={pl.id}
                        style={s.resultRow}
                        onPress={() => router.push(`/playlist/${pl.id}` as any)}
                        activeOpacity={0.8}
                      >
                        {art ? (
                          <Image source={art} style={s.resultArt} resizeMode="cover" />
                        ) : (
                          <View style={[s.resultArt, { backgroundColor: C.elevated }]} />
                        )}
                        <View style={s.resultMeta}>
                          <Text style={s.resultTitle} numberOfLines={1}>{pl.name}</Text>
                          <Text style={s.resultArtist} numberOfLines={1}>Playlist · {pl.songIds?.length ?? pl.songCount} songs</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={C.textMuted} />
                      </TouchableOpacity>
                    )
                  })}
                </View>
              </>
            )}

            {showSection('Podcasts') && podcastResults.length > 0 && (
              <>
                <View style={s.sectionHeader}>
                  <Text style={s.sectionTitle}>Podcasts</Text>
                </View>
                <View style={s.resultsList}>
                  {podcastResults.map(pod => {
                    const art = pod.coverArtPath ? albumArtAssets[pod.coverArtPath] : null
                    return (
                      <TouchableOpacity
                        key={pod.id}
                        style={s.resultRow}
                        onPress={() => router.push(`/podcast-show/${pod.id}` as any)}
                        activeOpacity={0.8}
                      >
                        {art ? (
                          <Image source={art} style={s.resultArt} resizeMode="cover" />
                        ) : (
                          <View style={[s.resultArt, { backgroundColor: pod.coverColor }]} />
                        )}
                        <View style={s.resultMeta}>
                          <Text style={s.resultTitle} numberOfLines={1}>{pod.title}</Text>
                          <Text style={s.resultArtist} numberOfLines={1}>Podcast · {pod.host}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={C.textMuted} />
                      </TouchableOpacity>
                    )
                  })}
                </View>
              </>
            )}

            {showSection('Fan Groups') && fanGroupResults.length > 0 && (
              <>
                <View style={s.sectionHeader}>
                  <Text style={s.sectionTitle}>Fan Groups</Text>
                </View>
                <View style={s.resultsList}>
                  {fanGroupResults.map(fg => (
                    <TouchableOpacity
                      key={fg.id}
                      style={s.resultRow}
                      onPress={() => fg.artistId && router.push(`/artist/${fg.artistId}` as any)}
                      activeOpacity={0.8}
                    >
                      <View style={[s.resultArt, s.resultArtRound, { backgroundColor: C.elevated, alignItems: 'center', justifyContent: 'center' }]}>
                        <Ionicons name="people" size={20} color={C.cyan} />
                      </View>
                      <View style={s.resultMeta}>
                        <Text style={s.resultTitle} numberOfLines={1}>{fg.name}</Text>
                        <Text style={s.resultArtist} numberOfLines={1}>{fg.memberCount.toLocaleString()} members</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={C.textMuted} />
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {typeFilter === 'Audiobooks' && (
              <Text style={[s.emptyResults, { paddingHorizontal: 16 }]}>
                Audiobooks live in the Audible app.
              </Text>
            )}

            {results.length === 0 && artistResults.length === 0 && playlistResults.length === 0 &&
              podcastResults.length === 0 && fanGroupResults.length === 0 && (
              <Text style={[s.emptyResults, { paddingHorizontal: 16 }]}>No results for "{query}"</Text>
            )}
          </>
        )}
      </ScrollView>
    </View>
  )
}

const s = StyleSheet.create({
  screen:        { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingBottom: 24 },
  pillScroll:    { marginBottom: 24 },
  pillRow:       { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: R.full,
    backgroundColor: C.surface,
  },
  filterPillActive: { backgroundColor: '#2a3a3e' },
  filterLabel:    { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.65)' },
  filterLabelActive: { color: '#ffffff', fontWeight: '700' },
  sectionHeader: { paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle:  { ...typeHeadline(20), color: C.textPrimary },
  browseSection: { marginBottom: 28 },
  categoryGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 16 },
  categoryCardWrapper: { width: '47.5%' },
  categoryCard:        { height: 72, borderRadius: R.md, justifyContent: 'flex-end', padding: 12, overflow: 'hidden' },
  categoryLabel: { fontSize: 15, fontWeight: '700', color: C.textPrimary, maxWidth: '72%' },
  categoryIcon:  { position: 'absolute', right: 10, top: 10 },
  historyList:   { paddingHorizontal: 16, gap: 2 },
  historyRow:    { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  historyText:   { flex: 1, fontSize: 15, fontWeight: '500', color: C.textPrimary },
  resultsList:   { paddingHorizontal: 16, gap: 2, marginBottom: 16 },
  resultRow:     { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  resultArt:     { width: 48, height: 48, borderRadius: R.sm, overflow: 'hidden' },
  resultArtRound:{ borderRadius: 24 },
  resultMeta:    { flex: 1, marginLeft: 12 },
  resultTitle:   { fontSize: 15, fontWeight: '600', color: C.textPrimary },
  resultArtist:  { fontSize: 13, color: C.textSecondary, marginTop: 2 },
  emptyResults:  { fontSize: 14, color: C.textMuted, paddingVertical: 16 },
})
