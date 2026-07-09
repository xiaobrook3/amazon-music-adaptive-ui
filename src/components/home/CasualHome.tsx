import { useMemo, useState } from 'react'
import { View, ScrollView, TouchableOpacity, StyleSheet, Animated } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '../AppText'
import { AppImage as Image } from '../AppImage'
import { EdgeFadeRow } from '../EdgeFadeRow'
import { HRail } from '../HRail'
import StickyHomeHeader, { useStickyHomeHeaderHeight, useStickyHomeScroll } from '../StickyHomeHeader'
import { useProfiles } from '../../context/ProfilesContext'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import {
  songs,
  playlists,
  podcasts,
  continueListeningItems,
  continueListeningKind,
  songsForYouIds,
  popularInCitySongIds,
  recentlyPlayedIds,
  myMixPlaylistIds,
  homeFeaturedArtistIds,
  type Song,
} from '../../data/mockData'
import { albumArtAssets, artistAssets, oliviaAboutAssets, resolveArtistAvatar, logoAssets } from '../../data/assetMap'
import { uniqueAlbumsFromSongs, getFeaturedArtists } from '../../data/themeFilters'
import { C, R, typeHeadline } from '../../theme'

const QUICK_GAP = 10
const DOMAIN_LABELS = ['Music', 'Podcast', 'Audible'] as const

// Generic editorial playlists — text-on-gradient cards, no artwork needed.
// `genre` names the /genre/[id] browse destination each card opens.
const RELATED_PLAYLISTS = [
  { name: 'Todays Hits',          genre: 'Charts',  colors: ['#B03A2E', '#B06A1E'] as const },
  { name: 'Feel-Good Pop',        genre: 'Pop',     colors: ['#6D3BC4', '#C43B7A'] as const },
  { name: 'Deep Focus',           genre: 'Focus',   colors: ['#1E3E33', '#204048'] as const },
  { name: 'Chill Vibes',          genre: 'Relax',   colors: ['#2E4A6E', '#3A6E7A'] as const },
  { name: 'Workout Energy',       genre: 'Workout', colors: ['#B03A2E', '#5A3BC4'] as const },
  { name: 'Acoustic Mornings',    genre: 'Commute', colors: ['#5A4020', '#2E8A5E'] as const },
  { name: 'Late Night Lo-Fi',     genre: 'Relax',   colors: ['#4A3468', '#2E4A6E'] as const },
  { name: 'All-Time Throwbacks',  genre: 'Party',   colors: ['#B06A1E', '#B03A6E'] as const },
]

function resolve(ids: string[]): Song[] {
  return ids.map(id => songs.find(s => s.id === id)).filter((s): s is Song => s != null)
}

const RECENTLY_PLAYED = resolve(recentlyPlayedIds)
const MADE_FOR_YOU = resolve(songsForYouIds)
const TRENDING = resolve(popularInCitySongIds)
const MY_MIXES = myMixPlaylistIds.map(id => playlists.find(p => p.id === id)).filter((p): p is typeof playlists[0] => p != null)

function resolveBannerArt(key: string) {
  return albumArtAssets[key] ?? artistAssets[key] ?? oliviaAboutAssets[key] ?? null
}

function greetingForHour(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Good morning'
  if (hour >= 12 && hour < 17) return 'Good afternoon'
  if (hour >= 17 && hour < 21) return 'Good evening'
  return 'Good evening'
}

function PlayBadge({ size = 28 }: { size?: number }) {
  return (
    <View style={[s.playBadge, { width: size, height: size, borderRadius: size / 2 }]}>
      <Ionicons name="play" size={size * 0.46} color="#fff" style={{ marginLeft: 1 }} />
    </View>
  )
}

export default function CasualHome() {
  const router = useRouter()
  const { playSongAt } = usePlaybackState()
  const { activeProfile } = useProfiles()
  const { scrollY, onScroll } = useStickyHomeScroll()
  const stickyHeaderHeight = useStickyHomeHeaderHeight()

  // Top-bar domain drill-down — same pattern as the Brooke/Rabiat persona homes.
  // Music / Podcast / Audible pills → pick one → [Domain | For You] toggle.
  const [domain, setDomain] = useState<number | null>(null)
  const [focus, setFocus] = useState(0)
  const podcastFirst = domain === 1 || domain === 2
  const forYou = domain !== null && focus === 1

  const greeting = greetingForHour(new Date().getHours())
  const greetSub = forYou
    ? 'New & recent, picked for you.'
    : domain === null
      ? "Let's find something to play."
      : domain === 0
        ? 'Browse music.'
        : domain === 2
          ? 'Browse audiobooks.'
          : 'Browse podcasts.'

  const jumpBackIn = continueListeningItems.slice(0, 4)
  const albums = useMemo(() => uniqueAlbumsFromSongs(songs, 10), [])
  const artists = useMemo(() => getFeaturedArtists(null, homeFeaturedArtistIds, 16), [])

  const openSong = (id: string) => {
    playSongAt(id)
    router.push('/now-playing')
  }

  const coverRail = (title: string, list: Song[], sub?: string) => (
    <View style={s.block}>
      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>{title}</Text>
        {sub ? <Text style={s.sectionSub}>{sub}</Text> : null}
      </View>
      <EdgeFadeRow>
        <HRail
          data={list}
          keyExtractor={(song: Song) => song.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.rail}
          nestedScrollEnabled
          renderItem={({ item: song }: { item: Song }) => {
            const art = song.albumArtPath ? albumArtAssets[song.albumArtPath] : null
            return (
              <TouchableOpacity style={s.coverCard} activeOpacity={0.85} onPress={() => openSong(song.id)}>
                <View style={s.coverArtWrap}>
                  {art ? (
                    <Image source={art} style={s.coverArt} resizeMode="cover" />
                  ) : (
                    <View style={[s.coverArt, { backgroundColor: song.albumArtColor }]}>
                      <Ionicons name="musical-note" size={26} color="rgba(255,255,255,0.15)" />
                    </View>
                  )}
                  <View style={s.artBorderOverlay} pointerEvents="none" />
                </View>
                <Text style={s.coverTitle} numberOfLines={1}>{song.title}</Text>
                <Text style={s.coverSub} numberOfLines={1}>{song.artistName}</Text>
              </TouchableOpacity>
            )
          }}
        />
      </EdgeFadeRow>
    </View>
  )

  // ── Resume group ──────────────────────────────────────────────────────────
  const jumpBackInBlock = jumpBackIn.length > 0 && (
    <View style={s.block}>
      <View style={s.sectionHead}><Text style={s.sectionTitle}>Jump back in</Text></View>
      <View style={s.quickGrid}>
        {jumpBackIn.map(item => {
          const art = item.artKey ? resolveBannerArt(item.artKey) : null
          const kind = continueListeningKind(item.id)
          return (
            <TouchableOpacity
              key={item.id}
              style={s.quickCard}
              activeOpacity={0.85}
              onPress={() =>
                item.podcastId
                  ? router.push(`/podcast-show/${item.podcastId}` as any)
                  : item.songId && openSong(item.songId)
              }
            >
              {art ? (
                <Image source={art} style={s.quickArt} resizeMode="cover" />
              ) : (
                <View style={[s.quickArt, { backgroundColor: C.surface }]} />
              )}
              <View style={s.quickText}>
                <Text style={s.quickTitle} numberOfLines={1}>{item.title}</Text>
                <View style={s.quickKindRow}>
                  <Ionicons name={kind.icon as any} size={10} color={C.textMuted} />
                  <Text style={s.quickKind}>{kind.label}</Text>
                </View>
              </View>
              <PlayBadge size={26} />
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )

  const myMixesBlock = (
    <View style={s.block}>
      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>My Mixes</Text>
        <Text style={s.sectionSub}>Updated at 6:00 AM</Text>
      </View>
      <EdgeFadeRow>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
          {MY_MIXES.map(mix => {
            const art = mix.coverArtPath ? albumArtAssets[mix.coverArtPath] : null
            return (
              <TouchableOpacity key={mix.id} style={s.coverCard} activeOpacity={0.85} onPress={() => router.push(`/playlist/${mix.id}` as any)}>
                <View style={s.coverArtWrap}>
                  {art ? (
                    <Image source={art} style={s.coverArt} resizeMode="cover" />
                  ) : (
                    <View style={[s.coverArt, { backgroundColor: C.surface }]}>
                      <Ionicons name="musical-notes" size={26} color="rgba(255,255,255,0.15)" />
                    </View>
                  )}
                  <View style={s.artBorderOverlay} pointerEvents="none" />
                  <View style={s.coverPlayPos}><PlayBadge size={28} /></View>
                </View>
                <Text style={s.coverTitle} numberOfLines={1}>{mix.name}</Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </EdgeFadeRow>
    </View>
  )

  const podcastRail = (title: string, sub?: string) => (
    <View style={s.block}>
      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>{title}</Text>
        {sub ? <Text style={s.sectionSub}>{sub}</Text> : null}
      </View>
      <EdgeFadeRow>
        <HRail
          data={podcasts}
          keyExtractor={pod => pod.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.rail}
          nestedScrollEnabled
          renderItem={({ item: pod }) => {
            const art = pod.coverArtPath ? resolveBannerArt(pod.coverArtPath) : null
            return (
              <TouchableOpacity style={s.podCard} activeOpacity={0.85} onPress={() => router.push(`/podcast-show/${pod.id}` as any)}>
                {art ? (
                  <Image source={art} style={s.podArt} resizeMode="cover" />
                ) : (
                  <View style={[s.podArt, { backgroundColor: C.surface }]}>
                    <Ionicons name="mic" size={28} color="rgba(255,255,255,0.2)" />
                  </View>
                )}
                <Text style={s.coverTitle} numberOfLines={2}>{pod.title}</Text>
              </TouchableOpacity>
            )
          }}
        />
      </EdgeFadeRow>
    </View>
  )

  // ── For You group ─────────────────────────────────────────────────────────
  const popularArtistsBlock = (
    <View style={s.block}>
      <View style={s.sectionHead}><Text style={s.sectionTitle}>Popular artists</Text></View>
      <EdgeFadeRow>
        <HRail
          data={artists}
          keyExtractor={artist => artist.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.rail}
          nestedScrollEnabled
          renderItem={({ item: artist }) => {
            const art = resolveArtistAvatar(artist.id, artist.imageUri)
            return (
              <TouchableOpacity style={s.artistCard} activeOpacity={0.85} onPress={() => router.push(`/artist/${artist.id}` as any)}>
                {art ? (
                  <Image source={art} style={s.artistAvatar} resizeMode="cover" />
                ) : (
                  <View style={[s.artistAvatar, { backgroundColor: C.surface }]}>
                    <Ionicons name="person" size={34} color="rgba(255,255,255,0.2)" />
                  </View>
                )}
                <Text style={s.artistName} numberOfLines={1}>{artist.name}</Text>
              </TouchableOpacity>
            )
          }}
        />
      </EdgeFadeRow>
    </View>
  )

  const playlistsBlock = (
    <View style={s.block}>
      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>Playlists for every mood</Text>
        <Text style={s.sectionSub}>Ready-made mixes for whatever you're doing</Text>
      </View>
      <EdgeFadeRow>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
          {RELATED_PLAYLISTS.map(pl => (
            <TouchableOpacity
              key={pl.name}
              style={s.coverCard}
              activeOpacity={0.85}
              onPress={() => router.push(`/genre/${encodeURIComponent(pl.genre)}` as any)}
            >
              <View style={s.relatedArt}>
                <LinearGradient colors={pl.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
                <Image source={logoAssets.amIcon} style={s.relatedLogo} resizeMode="contain" />
                <Text style={s.relatedName} numberOfLines={3}>{pl.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </EdgeFadeRow>
    </View>
  )

  return (
    <View style={s.screen}>
      {/* Subtle Amazon-teal wash — no persona hue for the casual home. */}
      <View style={s.bgWash} pointerEvents="none">
        <LinearGradient
          colors={['rgba(37,209,218,0.10)', 'rgba(37,209,218,0.03)', 'transparent']}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28 }}
        style={{ backgroundColor: 'transparent' }}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <View style={{ height: stickyHeaderHeight + 22 }} />

        {/* Generic greeting — no name, no "your rotation" framing. */}
        <View style={s.greetWrap}>
          <Text style={s.greetHello}>{greeting}</Text>
          <Text style={s.greetSub}>{greetSub}</Text>
        </View>

        {domain === null ? (
          <>
            {jumpBackInBlock}
            {coverRail('Recently played', RECENTLY_PLAYED)}
            {coverRail('Made for you', MADE_FOR_YOU, 'Fresh picks to explore')}
            {popularArtistsBlock}
            {coverRail('Trending now', TRENDING)}
            {coverRail('Albums you might like', albums)}
            {playlistsBlock}
            {podcastRail('Podcasts for you')}
            {myMixesBlock}
          </>
        ) : podcastFirst ? (
          forYou ? (
            <>
              {podcastRail('Podcasts picked for you', 'Based on what you listen to')}
              {podcastRail('New episodes for you')}
            </>
          ) : (
            <>
              {podcastRail(domain === 2 ? 'Audiobooks & spoken word' : 'Podcasts for you')}
              {podcastRail('Popular shows')}
              {podcastRail('New & trending')}
            </>
          )
        ) : forYou ? (
          <>
            {coverRail('New & recent, for you', MADE_FOR_YOU)}
            {coverRail('Recently played', RECENTLY_PLAYED)}
            {coverRail('Albums you might like', albums)}
          </>
        ) : (
          <>
            {jumpBackInBlock}
            {coverRail('Made for you', MADE_FOR_YOU, 'Fresh picks to explore')}
            {coverRail('Trending now', TRENDING)}
            {popularArtistsBlock}
            {coverRail('Albums you might like', albums)}
            {playlistsBlock}
            {myMixesBlock}
          </>
        )}
      </Animated.ScrollView>

      <StickyHomeHeader
        firstName={activeProfile.name.split(' ')[0]}
        activePill={domain}
        onPillChange={setDomain}
        scrollY={scrollY}
        domainNav={{
          domains: DOMAIN_LABELS,
          domain,
          focus,
          subLabel: 'For You',
          onSelectDomain: (i: number) => { setDomain(i); setFocus(0) },
          onBack: () => { setDomain(null); setFocus(0) },
          onFocus: setFocus,
        }}
      />
    </View>
  )
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  bgWash: { position: 'absolute', top: 0, left: 0, right: 0, height: 420 },

  greetWrap: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 16 },
  greetHello: { ...typeHeadline(30), color: '#fff' },
  greetSub: { fontSize: 14, color: C.textSecondary, marginTop: 6 },

  tabRow: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 22, gap: 8 },
  tabPill: {
    paddingVertical: 8,
    paddingHorizontal: 22,
    borderRadius: R.full,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  tabPillActive: { backgroundColor: C.cyan },
  tabLabel: { fontSize: 14, fontWeight: '600', color: C.textPrimary },
  tabLabelActive: { color: '#000000' },

  block: { marginBottom: 34 },
  sectionHead: { paddingHorizontal: 16, marginBottom: 14 },
  sectionTitle: { ...typeHeadline(20), color: '#fff' },
  sectionSub: { fontSize: 13, color: C.textSecondary, marginTop: 2 },
  rail: { paddingHorizontal: 16, gap: 16 },

  quickGrid: { paddingHorizontal: 16, flexDirection: 'row', flexWrap: 'wrap', gap: QUICK_GAP },
  quickCard: {
    width: '47.8%',
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    overflow: 'hidden',
    paddingRight: 8,
    flexGrow: 1,
  },
  quickArt: { width: 64, height: 64 },
  quickText: { flex: 1, marginLeft: 10, marginRight: 6 },
  quickTitle: { fontSize: 13, fontWeight: '600', color: '#fff' },
  quickKindRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  quickKind: { fontSize: 10, color: C.textMuted, fontWeight: '600', letterSpacing: 0.3 },

  coverCard: { width: 150 },
  coverArtWrap: { width: 150, height: 150, borderRadius: 8, overflow: 'hidden', position: 'relative' },
  coverArt: { width: 150, height: 150, alignItems: 'center', justifyContent: 'center' },
  coverPlayPos: { position: 'absolute', right: 8, bottom: 8 },
  artBorderOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 0.75,
    borderColor: 'rgba(255,255,255,0.24)',
    borderRadius: 8,
  },
  coverTitle: { fontSize: 14, fontWeight: '600', color: '#fff', marginTop: 8 },
  coverSub: { fontSize: 12, color: C.textSecondary, marginTop: 2 },

  relatedArt: { width: 150, height: 150, borderRadius: 12, overflow: 'hidden', padding: 12, justifyContent: 'flex-end' },
  relatedName: { ...typeHeadline(20), color: '#fff' },
  relatedLogo: { position: 'absolute', top: 10, right: 10, width: 26, height: 26, borderRadius: 6 },

  artistCard: { width: 120, alignItems: 'center' },
  artistAvatar: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center' },
  artistName: { fontSize: 13, fontWeight: '600', color: '#fff', marginTop: 8, textAlign: 'center' },

  podCard: { width: 156 },
  podArt: { width: 156, height: 156, borderRadius: 10, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: C.surface },

  playBadge: { backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' },
})
