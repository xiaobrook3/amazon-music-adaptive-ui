import { useMemo, type ReactNode } from 'react'
import {
  ScrollView,
  View,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from 'react-native'
import { Text } from '../src/components/AppText'
import { AppImage as Image } from '../src/components/AppImage'
import { EdgeFadeRow } from '../src/components/EdgeFadeRow'
import { PlaylistMoodCard } from '../src/components/home/HomeSessionWidgets'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { usePlaybackState } from '../src/hooks/usePlaybackState'
import { useProfiles } from '../src/context/ProfilesContext'
import {
  songs,
  artists,
  playlists,
  heroPool,
  popularInCitySongIds,
  songsForYouIds,
  myMixPlaylistIds,
  homeFeaturedArtistIds,
  newForYouSongIds,
  newFromArtistSongIds,
  identityFavoriteArtistId,
  user,
  type Song,
  type Artist,
  type Playlist,
} from '../src/data/mockData'
import { albumArtAssets, artistAssets, resolveArtistAvatar } from '../src/data/assetMap'
import { getFeaturedArtists } from '../src/data/themeFilters'
import { useAdaptiveMenu } from '../src/components/AdaptiveContextMenu'
import { C, R, typeHeadline } from '../src/theme'

// ── Shared data constants (mirrors home screen) ────────────────────────────────

const SONGS_FOR_YOU: Song[] = songsForYouIds
  .map(id => songs.find(s => s.id === id))
  .filter((s): s is Song => s != null)

const ALBUMS_FOR_YOU: Song[] = Array.from(
  songs.reduce((map, song) => {
    if (!map.has(song.album)) map.set(song.album, song)
    return map
  }, new Map<string, Song>()).values(),
).slice(0, 8)

const POPULAR_IN_CITY: Song[] = popularInCitySongIds
  .map(id => songs.find(s => s.id === id))
  .filter((s): s is Song => s != null)

const MY_MIXES: Playlist[] = myMixPlaylistIds
  .map(id => playlists.find(pl => pl.id === id))
  .filter((pl): pl is Playlist => pl != null)

const NEW_FOR_YOU: Song[] = newForYouSongIds
  .map(id => songs.find(s => s.id === id))
  .filter((s): s is Song => s != null)

function resolveSongs(ids: string[]): Song[] {
  return ids
    .map(id => songs.find(s => s.id === id))
    .filter((s): s is Song => s != null)
}

function getFavoriteArtist(): Artist {
  const identityId = identityFavoriteArtistId[user.activeIdentityId]
  if (identityId) {
    const fromIdentity = artists.find(a => a.id === identityId)
    if (fromIdentity) return fromIdentity
  }
  const topFeatured = homeFeaturedArtistIds
    .map(id => artists.find(a => a.id === id))
    .filter((a): a is Artist => a != null)
    .sort((a, b) => b.streamCount - a.streamCount)
  return topFeatured[0] ?? artists[0]
}

function shouldUseFirstNameInDiscover(): boolean {
  return new Date().getDate() % 5 === 0
}

function pickRandomHero() {
  const primary = heroPool[Math.floor(Math.random() * heroPool.length)]
  const others = heroPool
    .filter(h => h.artistId !== primary.artistId)
    .sort(() => Math.random() - 0.5)
    .slice(0, 2)
  const subtitle = `Starting with ${primary.name}, ${others[0].name}, and ${others[1].name}`
  return { ...primary, subtitle }
}

function resolveBannerArt(bannerKey: string) {
  return albumArtAssets[bannerKey] ?? artistAssets[bannerKey as keyof typeof artistAssets] ?? null
}

// ── Small shared components ────────────────────────────────────────────────────

function SectionRow({
  title,
  subtitle,
  children,
  artistLayout = false,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  artistLayout?: boolean
}) {
  return (
    <View style={p.section}>
      {title ? <Text style={p.sectionTitle}>{title}</Text> : null}
      {subtitle ? <Text style={p.sectionSubtitle}>{subtitle}</Text> : null}
      <EdgeFadeRow>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled
          contentContainerStyle={artistLayout ? p.artistRailContent : p.hRailContent}
        >
          {children}
        </ScrollView>
      </EdgeFadeRow>
    </View>
  )
}

function AlbumCard({ song, onPress }: { song: Song; onPress: () => void }) {
  const art = song.albumArtPath ? albumArtAssets[song.albumArtPath] : null
  const { open: openAdaptiveMenu } = useAdaptiveMenu()
  return (
    <TouchableOpacity
      style={p.albumCard}
      onPress={onPress}
      onLongPress={() => openAdaptiveMenu({ kind: 'song', song })}
      delayLongPress={400}
      activeOpacity={0.85}
    >
      <View style={p.albumArtWrap}>
        {art ? (
          <Image source={art} style={p.albumArt} resizeMode="cover" />
        ) : (
          <View style={[p.albumArt, { backgroundColor: song.albumArtColor }]}>
            <Ionicons name="musical-note" size={28} color="rgba(255,255,255,0.15)" />
          </View>
        )}
      </View>
      <Text style={p.albumTitle} numberOfLines={2}>{song.album}</Text>
      <Text style={p.albumArtistName} numberOfLines={1}>{song.artistName}</Text>
    </TouchableOpacity>
  )
}

// ── Main screen ────────────────────────────────────────────────────────────────

export default function MusicScreen() {
  const router = useRouter()
  const { open: openAdaptiveMenu } = useAdaptiveMenu()
  const insets = useSafeAreaInsets()
  const { playSongAt } = usePlaybackState()
  const { activeProfile } = useProfiles()

  const hero = useMemo(() => pickRandomHero(), [])
  const favoriteArtist = useMemo(() => getFavoriteArtist(), [])
  const newFromArtistSongs = useMemo(
    () => resolveSongs(newFromArtistSongIds[favoriteArtist.id] ?? []).slice(0, 8),
    [favoriteArtist.id],
  )
  const usePersonalizedDiscoverTitle = useMemo(() => shouldUseFirstNameInDiscover(), [])
  const heroArt =
    (hero.bannerKey ? resolveBannerArt(hero.bannerKey) : null) ??
    artistAssets[hero.artistId as keyof typeof artistAssets] ??
    artistAssets.bts

  const openSong = (songId: string) => {
    playSongAt(songId)
    router.push('/now-playing')
  }

  const firstName = activeProfile.name.split(' ')[0]

  // Songs for discovery sections (based on randomly picked hero)
  const becauseSongs = songs.filter(s => s.artistId === hero.artistId).slice(0, 8)
  const fansArtist = heroPool.find(h => h.artistId !== hero.artistId) ?? heroPool[1]
  const fansSongs = songs.filter(s => s.artistId === fansArtist.artistId).slice(0, 8)
  const heroFirstSong = songs.find(s => s.artistId === hero.artistId) ?? songs[0]

  // ── Discover tab ────────────────────────────────────────────────────────────
  const discoverContent = (
    <>
      {/* Hero station card — same style as home */}
      <View style={p.heroWrap}>
        <ImageBackground source={heroArt} style={p.heroBg} resizeMode="cover">
          <LinearGradient
            colors={[
              'rgba(0,0,0,0.18)',
              'rgba(0,0,0,0.10)',
              'transparent',
              'rgba(10,10,10,0.18)',
              'rgba(10,10,10,0.42)',
              'rgba(10,10,10,0.68)',
              C.bg,
            ]}
            locations={[0, 0.08, 0.32, 0.52, 0.72, 0.88, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={p.heroInner}>
            <View style={p.heroContent}>
              <View style={{ flex: 1 }}>
                <Text style={p.heroEyebrow}>STATION</Text>
                <Text style={p.heroTitle}>My Soundtrack</Text>
                <Text style={p.heroSub} numberOfLines={2}>{hero.subtitle}</Text>
              </View>
              <TouchableOpacity
                style={p.heroPlayBtn}
                onPress={() => openSong(heroFirstSong.id)}
                activeOpacity={0.85}
              >
                <Ionicons name="play" size={22} color="#000" style={{ marginLeft: 2 }} />
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* New for you — personalized, first name used sparingly */}
      <SectionRow
        title={usePersonalizedDiscoverTitle ? `New for ${firstName}` : 'New for you'}
        subtitle={
          usePersonalizedDiscoverTitle
            ? 'Fresh picks based on your taste'
            : `Because you've been playing ${favoriteArtist.name}`
        }
      >
        {NEW_FOR_YOU.map(song => (
          <AlbumCard
            key={`new-${song.id}`}
            song={song}
            onPress={() => openSong(song.id)}
          />
        ))}
      </SectionRow>

      {/* New from favorite artist */}
      {newFromArtistSongs.length > 0 && (
        <SectionRow title={`New from ${favoriteArtist.name}`}>
          {newFromArtistSongs.map(song => (
            <AlbumCard
              key={`artist-new-${song.id}`}
              song={song}
              onPress={() => openSong(song.id)}
            />
          ))}
        </SectionRow>
      )}

      {/* New This Week */}
      <SectionRow title="New This Week">
        {ALBUMS_FOR_YOU.map(album => (
          <AlbumCard
            key={album.album}
            song={album}
            onPress={() => openSong(album.id)}
          />
        ))}
      </SectionRow>

      {/* Fresh Finds */}
      <SectionRow title="Fresh Finds">
        {SONGS_FOR_YOU.map(song => (
          <AlbumCard
            key={song.id}
            song={song}
            onPress={() => openSong(song.id)}
          />
        ))}
      </SectionRow>

      {/* Because You Listen to [hero artist] */}
      {becauseSongs.length > 0 && (
        <SectionRow title={`Because You Listen to ${hero.name}`}>
          {becauseSongs.map(song => (
            <AlbumCard
              key={song.id}
              song={song}
              onPress={() => openSong(song.id)}
            />
          ))}
        </SectionRow>
      )}

      {/* Fans of [artist] Also Enjoy */}
      {fansSongs.length > 0 && (
        <SectionRow title={`Fans of ${fansArtist.name} Also Enjoy`}>
          {fansSongs.map(song => (
            <AlbumCard
              key={song.id}
              song={song}
              onPress={() => openSong(song.id)}
            />
          ))}
        </SectionRow>
      )}

      {/* Popular Near You */}
      <SectionRow title="Popular Near You">
        {POPULAR_IN_CITY.map(song => (
          <AlbumCard
            key={song.id}
            song={song}
            onPress={() => openSong(song.id)}
          />
        ))}
      </SectionRow>

      {/* My Mixes */}
      <View style={p.section}>
        <View style={p.sectionHeaderRow}>
          <Text style={p.sectionTitleInline}>My Mixes</Text>
        </View>
        <Text style={p.sectionSubtitle}>Updated at 6:00 AM</Text>
        <EdgeFadeRow>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
            contentContainerStyle={p.hRailContent}
          >
            {MY_MIXES.map(mix => (
              <PlaylistMoodCard
                key={mix.id}
                name={mix.name}
                artKey={mix.coverArtPath ?? ''}
                onPress={() => router.push(`/playlist/${mix.id}` as any)}
                onLongPress={() => openAdaptiveMenu({ kind: 'playlist', playlist: mix })}
                delayLongPress={400}
              />
            ))}
          </ScrollView>
        </EdgeFadeRow>
      </View>
    </>
  )

  return (
    <View style={p.screen}>
      <LinearGradient
        colors={['rgba(28,22,38,0.96)', 'rgba(18,14,12,0.80)', C.bg]}
        locations={[0, 0.28, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Fixed header */}
      <View style={[p.header, { paddingTop: insets.top + 6 }]}>
        <TouchableOpacity
          style={p.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={p.headerTitle}>Explore Music</Text>
        <View style={p.headerSpacer} />
      </View>

      {/* Scrollable content */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {discoverContent}
      </ScrollView>
    </View>
  )
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const p = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typeHeadline(20),
    color: C.textPrimary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerSpacer: { width: 40 },

  heroWrap: { marginBottom: 20 },
  heroBg: { width: '100%', height: 320 },
  heroInner: { flex: 1, justifyContent: 'flex-end' },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 16,
    paddingHorizontal: 16,
    paddingBottom: 22,
  },
  heroEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: C.cyan,
    letterSpacing: 2,
    marginTop: 8,
    marginBottom: 12,
  },
  heroTitle: { ...typeHeadline(38), color: '#fff' },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.72)', marginTop: 6, lineHeight: 18 },
  heroPlayBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.cyan,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.cyan,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },

  section: { marginBottom: 28 },
  sectionTitle: {
    ...typeHeadline(21),
    color: C.textPrimary,
    marginBottom: 14,
    paddingHorizontal: 16,
  },
  sectionHeaderRow: { paddingHorizontal: 16 },
  sectionTitleInline: { ...typeHeadline(21), color: C.textPrimary },
  sectionSubtitle: {
    fontSize: 13,
    color: C.textSecondary,
    paddingHorizontal: 16,
    marginTop: 0,
    marginBottom: 14,
  },

  hRailContent: { paddingHorizontal: 16, gap: 12 },

  albumCard: { width: 140 },
  albumArtWrap: { position: 'relative', marginBottom: 8 },
  albumArt: {
    width: 140,
    height: 140,
    borderRadius: R.sm,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  albumTitle: { fontSize: 14, fontWeight: '600', color: C.textPrimary, marginBottom: 2, lineHeight: 18 },
  albumArtistName: { fontSize: 12, color: C.textSecondary },

  artistRailContent: { paddingHorizontal: 16, gap: 16 },

})
