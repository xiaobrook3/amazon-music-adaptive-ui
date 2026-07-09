import { useState, useMemo, type ReactNode } from 'react'
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
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { usePlaybackState } from '../src/hooks/usePlaybackState'
import { useLikedSongs } from '../src/context/LikedSongsContext'
import { useSavedSessions, type SavedSession } from '../src/context/SavedSessionsContext'
import {
  songs,
  artists,
  playlists,
  podcasts,
  continueListeningItems,
  heroPool,
  popularInCitySongIds,
  songsForYouIds,
  myMixPlaylistIds,
  homeFeaturedArtistIds,
  newForYouSongIds,
  newFromArtistSongIds,
  identityFavoriteArtistId,
  recentlyPlayedIds,
  resumePodcastIds,
  unfinishedPlaylistByIdentity,
  user,
  type Song,
  type Artist,
  type Playlist,
  type Podcast,
} from '../src/data/mockData'
import { albumArtAssets, artistAssets, resolveArtistAvatar } from '../src/data/assetMap'
import { getFeaturedArtists } from '../src/data/themeFilters'
import { useAdaptiveMenu } from '../src/components/AdaptiveContextMenu'
import { C, R, typeHeadline } from '../src/theme'

// ── Shared data constants (mirrors home screen) ────────────────────────────────

const SONGS_FOR_YOU: Song[] = songsForYouIds
  .map(id => songs.find(s => s.id === id))
  .filter((s): s is Song => s != null)

const CONTINUE_LISTENING = continueListeningItems

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

const RECENTLY_PLAYED: Song[] = recentlyPlayedIds
  .map(id => songs.find(s => s.id === id))
  .filter((s): s is Song => s != null)

const RESUME_PODCASTS: Podcast[] = resumePodcastIds
  .map(id => podcasts.find(p => p.id === id))
  .filter((p): p is Podcast => p != null)

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

type InnerTab = 'resume' | 'discover'

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

function getGreeting(firstName: string): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return `Good Morning, ${firstName}`
  if (hour >= 12 && hour < 17) return `Good Afternoon, ${firstName}`
  if (hour >= 17 && hour < 21) return `Good Evening, ${firstName}`
  return `Winding Down, ${firstName}`
}

const OLIVIA_ARTIST_ID = 'olivia-rodrigo'
const OLIVIA_LOYAL_FAN_PURPLE = '#6B3FA0'

function isOliviaRodrigoSession(session: SavedSession): boolean {
  return session.songs.some(song => song.artistId === OLIVIA_ARTIST_ID)
}

// ── Small shared components ────────────────────────────────────────────────────

function PlayOverlay({ size = 28 }: { size?: number }) {
  return (
    <View style={[p.playOverlay, { width: size, height: size, borderRadius: size / 2 }]}>
      <Ionicons name="play" size={size * 0.45} color="#fff" style={{ marginLeft: 1 }} />
    </View>
  )
}

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

function ArtistCircle({ artist, onPress }: { artist: Artist; onPress: () => void }) {
  const art = resolveArtistAvatar(artist.id, artist.imageUri)
  const { open: openAdaptiveMenu } = useAdaptiveMenu()
  return (
    <TouchableOpacity
      style={p.artistCircle}
      activeOpacity={0.85}
      onPress={onPress}
      onLongPress={() =>
        openAdaptiveMenu({ kind: 'artist', artistId: artist.id, name: artist.name, imageUri: artist.imageUri })
      }
      delayLongPress={400}
    >
      {art ? (
        <Image source={art} style={p.artistAvatar} resizeMode="cover" />
      ) : (
        <View style={[p.artistAvatar, { backgroundColor: C.surface }]}>
          <Ionicons name="person" size={38} color="rgba(255,255,255,0.2)" />
        </View>
      )}
      <Text style={p.artistName} numberOfLines={1}>{artist.name}</Text>
      <Text style={p.artistGenre} numberOfLines={1}>{artist.genre}</Text>
    </TouchableOpacity>
  )
}

function PodcastCard({ podcast, onPress }: { podcast: Podcast; onPress: () => void }) {
  const art = podcast.coverArtPath ? albumArtAssets[podcast.coverArtPath] : null
  return (
    <TouchableOpacity style={p.continueCard} onPress={onPress} activeOpacity={0.85}>
      <View style={p.continueArtWrap}>
        {art ? (
          <Image source={art} style={p.continueArt} resizeMode="cover" />
        ) : (
          <View style={[p.continueArt, { backgroundColor: podcast.coverColor }]}>
            <Ionicons name="mic" size={28} color="rgba(255,255,255,0.25)" />
          </View>
        )}
        <View style={p.continuePlayPos}>
          <PlayOverlay size={30} />
        </View>
      </View>
      <Text style={p.continueTitle} numberOfLines={2}>{podcast.title}</Text>
      <Text style={p.podcastHost} numberOfLines={1}>{podcast.host}</Text>
    </TouchableOpacity>
  )
}

function SessionMosaicThumb({
  sessionSongs,
  loyalFan = false,
}: {
  sessionSongs: Song[]
  loyalFan?: boolean
}) {
  const mosaicSongs = sessionSongs.slice(0, 4)
  const cellSize = 26

  if (mosaicSongs.length === 0) {
    return (
      <LinearGradient
        colors={
          loyalFan
            ? [OLIVIA_LOYAL_FAN_PURPLE + '55', '#3D2060' + 'CC']
            : [C.cyan + '55', C.cyanDim + '88']
        }
        style={[p.sessionThumb, loyalFan && p.sessionThumbLoyalFan]}
      >
        <Ionicons
          name="bookmark"
          size={20}
          color={loyalFan ? '#C4A8E8' : C.cyan}
        />
      </LinearGradient>
    )
  }

  return (
    <View style={[p.sessionThumbMosaic, loyalFan && p.sessionThumbLoyalFan]}>
      {mosaicSongs.map((song, i) => {
        const art = song.albumArtPath ? albumArtAssets[song.albumArtPath] : null
        return (
          <View key={`${song.id}-${i}`} style={[p.sessionMosaicCell, { width: cellSize, height: cellSize }]}>
            {art ? (
              <Image source={art} style={StyleSheet.absoluteFill} resizeMode="cover" />
            ) : (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: song.albumArtColor }]} />
            )}
          </View>
        )
      })}
      {mosaicSongs.length < 4 &&
        Array.from({ length: 4 - mosaicSongs.length }).map((_, i) => (
          <View
            key={`pad-${i}`}
            style={[p.sessionMosaicCell, { width: cellSize, height: cellSize, backgroundColor: C.elevated }]}
          />
        ))}
    </View>
  )
}

function SessionRow({ session, onPress }: { session: SavedSession; onPress: () => void }) {
  const dateStr = session.savedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const description =
    session.description ?? 'A vibe you saved when everything was hitting just right'
  const isLoyalFanUnlock = isOliviaRodrigoSession(session)

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      style={[p.sessionCard, isLoyalFanUnlock && p.sessionCardLoyalFan]}
    >
      <LinearGradient
        colors={
          isLoyalFanUnlock
            ? ['#1E1030', '#2D1A48', '#4A2D78', OLIVIA_LOYAL_FAN_PURPLE + 'CC']
            : ['#0A3030', '#0E4040', '#1B5E5E']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={p.sessionCardGradient}
      >
        <View style={p.sessionCardInner}>
          <SessionMosaicThumb sessionSongs={session.songs} loyalFan={isLoyalFanUnlock} />
          <View style={p.sessionRowBody}>
            <Text style={p.sessionRowTitle} numberOfLines={1}>{session.label}</Text>
            {isLoyalFanUnlock ? (
              <View style={p.sessionLoyalFanRow}>
                <Ionicons name="star" size={11} color="#C4A8E8" />
                <Text style={p.sessionLoyalFanLabel}>Unlocked for loyal fans</Text>
              </View>
            ) : null}
            <Text
              style={[p.sessionRowDesc, isLoyalFanUnlock && p.sessionRowDescLoyalFan]}
              numberOfLines={2}
            >
              {description}
            </Text>
            <Text style={[p.sessionRowMeta, isLoyalFanUnlock && p.sessionRowMetaLoyalFan]}>
              {session.songs.length} songs · saved {dateStr}
            </Text>
          </View>
          <View style={[p.sessionCardPlay, isLoyalFanUnlock && p.sessionCardPlayLoyalFan]}>
            <Ionicons
              name="play"
              size={16}
              color={isLoyalFanUnlock ? '#E8D4FF' : 'rgba(255,255,255,0.70)'}
            />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  )
}

function EmptyState({ icon, label, sub }: { icon: string; label: string; sub?: string }) {
  return (
    <View style={p.emptyState}>
      <Ionicons name={icon as any} size={36} color={C.textMuted} />
      <Text style={p.emptyStateText}>{label}</Text>
      {sub ? <Text style={p.emptyStateSub}>{sub}</Text> : null}
    </View>
  )
}

// ── Main screen ────────────────────────────────────────────────────────────────

export default function MusicScreen() {
  const router = useRouter()
  const { open: openAdaptiveMenu } = useAdaptiveMenu()
  const insets = useSafeAreaInsets()
  const { playSongAt } = usePlaybackState()
  const { likedSongIds } = useLikedSongs()
  const { sessions: savedSessions } = useSavedSessions()
  const [activeInnerTab, setActiveInnerTab] = useState<InnerTab>('resume')

  const hero = useMemo(() => pickRandomHero(), [])
  const topArtists = useMemo(() => getFeaturedArtists(null, homeFeaturedArtistIds, 10), [])
  const favoriteArtist = useMemo(() => getFavoriteArtist(), [])
  const newFromArtistSongs = useMemo(
    () => resolveSongs(newFromArtistSongIds[favoriteArtist.id] ?? []).slice(0, 8),
    [favoriteArtist.id],
  )
  const unfinishedPlaylist = useMemo(() => {
    const playlistId = unfinishedPlaylistByIdentity[user.activeIdentityId] ?? 'pl2'
    return playlists.find(pl => pl.id === playlistId) ?? playlists[0]
  }, [])
  const usePersonalizedDiscoverTitle = useMemo(() => shouldUseFirstNameInDiscover(), [])
  const heroArt =
    (hero.bannerKey ? resolveBannerArt(hero.bannerKey) : null) ??
    artistAssets[hero.artistId as keyof typeof artistAssets] ??
    artistAssets.bts

  const openSong = (songId: string) => {
    playSongAt(songId)
    router.push('/now-playing')
  }

  const firstName = user.name.split(' ')[0]
  const likedSongs = songs.filter(s => likedSongIds.has(s.id))
  const likedAlbums: Song[] = Array.from(
    likedSongs.reduce((map, song) => {
      if (!map.has(song.album)) map.set(song.album, song)
      return map
    }, new Map<string, Song>()).values(),
  )

  // Songs for discovery sections (based on randomly picked hero)
  const becauseSongs = songs.filter(s => s.artistId === hero.artistId).slice(0, 8)
  const fansArtist = heroPool.find(h => h.artistId !== hero.artistId) ?? heroPool[1]
  const fansSongs = songs.filter(s => s.artistId === fansArtist.artistId).slice(0, 8)
  const heroFirstSong = songs.find(s => s.artistId === hero.artistId) ?? songs[0]

  // ── Resume tab ──────────────────────────────────────────────────────────────
  const resumeContent = (
    <>
      {/* Time-based greeting */}
      <View style={p.greetingWrap}>
        <Text style={p.greetingText}>{getGreeting(firstName)}</Text>
        <Text style={p.greetingSub}>Here's where you left off.</Text>
      </View>

      {/* Pick up where you left off */}
      <View style={p.section}>
        <Text style={p.sectionTitle}>Pick up where you left off</Text>
        <EdgeFadeRow>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
            contentContainerStyle={p.hRailContent}
          >
            {CONTINUE_LISTENING.map(item => {
            const art = item.artKey
              ? albumArtAssets[item.artKey] ??
                artistAssets[item.artKey as keyof typeof artistAssets] ??
                null
              : null
            return (
              <TouchableOpacity
                key={item.id}
                style={p.continueCard}
                onPress={() => item.songId && openSong(item.songId)}
                activeOpacity={0.85}
              >
                <View style={p.continueArtWrap}>
                  {art ? (
                    <Image source={art} style={p.continueArt} resizeMode="cover" />
                  ) : (
                    <View style={[p.continueArt, { backgroundColor: C.surface }]}>
                      <Ionicons name="musical-note" size={28} color="rgba(255,255,255,0.15)" />
                    </View>
                  )}
                  <View style={p.continuePlayPos}>
                    <PlayOverlay size={30} />
                  </View>
                </View>
                <Text style={p.continueTitle} numberOfLines={2}>{item.title}</Text>
              </TouchableOpacity>
            )
          })}
          </ScrollView>
        </EdgeFadeRow>
      </View>

      {/* Saved Sessions */}
      <View style={p.section}>
        <Text style={p.sectionTitle}>Saved Sessions</Text>
        {savedSessions.length === 0 ? (
          <EmptyState
            icon="bookmark-outline"
            label="No saved sessions yet"
            sub="Save a session from Now Playing to see it here."
          />
        ) : (
          <View style={p.sessionList}>
            {savedSessions.map(session => (
              <SessionRow
                key={session.id}
                session={session}
                onPress={() => router.push(`/session/${session.id}` as any)}
              />
            ))}
          </View>
        )}
      </View>

      {/* Recently played */}
      <SectionRow title="Recently played">
        {RECENTLY_PLAYED.map(song => (
          <AlbumCard
            key={`recent-${song.id}`}
            song={song}
            onPress={() => openSong(song.id)}
          />
        ))}
      </SectionRow>

      {/* Continue your mix */}
      {unfinishedPlaylist && (
        <View style={p.section}>
          <Text style={p.sectionTitle}>Continue your mix</Text>
          <Text style={p.sectionSubtitle}>
            Pick up {unfinishedPlaylist.name} where you stopped
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
            contentContainerStyle={p.hRailContent}
          >
            <TouchableOpacity
              style={p.continueCard}
              activeOpacity={0.85}
              onPress={() => router.push(`/playlist/${unfinishedPlaylist.id}` as any)}
              onLongPress={() => openAdaptiveMenu({ kind: 'playlist', playlist: unfinishedPlaylist })}
              delayLongPress={400}
            >
              <View style={p.continueArtWrap}>
                {unfinishedPlaylist.coverArtPath && albumArtAssets[unfinishedPlaylist.coverArtPath] ? (
                  <Image
                    source={albumArtAssets[unfinishedPlaylist.coverArtPath]}
                    style={p.continueArt}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[p.continueArt, { backgroundColor: C.surface }]}>
                    <Ionicons name="musical-notes" size={28} color="rgba(255,255,255,0.15)" />
                  </View>
                )}
                <View style={p.continuePlayPos}>
                  <PlayOverlay size={30} />
                </View>
              </View>
              <Text style={p.continueTitle} numberOfLines={2}>{unfinishedPlaylist.name}</Text>
              {unfinishedPlaylist.songCount ? (
                <Text style={p.podcastHost} numberOfLines={1}>
                  {unfinishedPlaylist.songCount} songs · in progress
                </Text>
              ) : null}
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Pick up a podcast */}
      <SectionRow title="Pick up a podcast">
        {RESUME_PODCASTS.map(pod => (
          <PodcastCard
            key={pod.id}
            podcast={pod}
            onPress={() => router.push(`/podcast-show/${pod.id}` as any)}
          />
        ))}
      </SectionRow>

      {/* Your Top Artists */}
      <SectionRow title="Your Top Artists" artistLayout>
        {topArtists.map(artist => (
          <ArtistCircle
            key={artist.id}
            artist={artist}
            onPress={() => router.push(`/artist/${artist.id}` as any)}
          />
        ))}
      </SectionRow>

      {/* My Songs */}
      <View style={p.section}>
        <TouchableOpacity
          style={p.sectionHeaderTappable}
          activeOpacity={0.7}
          onPress={() => router.push('/liked')}
        >
          <Text style={p.sectionTitleInline}>My Songs</Text>
          {likedSongs.length > 0 && (
            <View style={p.seeAllRow}>
              <Text style={p.seeAllText}>See all</Text>
              <Ionicons name="chevron-forward" size={14} color={C.textMuted} />
            </View>
          )}
        </TouchableOpacity>
        {likedSongs.length === 0 ? (
          <EmptyState
            icon="heart-outline"
            label="No liked songs yet"
            sub="Tap the ♥ on Now Playing to save songs here"
          />
        ) : (
          <EdgeFadeRow>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled
              contentContainerStyle={p.hRailContent}
            >
              {likedSongs.map(song => (
                <AlbumCard
                  key={song.id}
                  song={song}
                  onPress={() => openSong(song.id)}
                />
              ))}
            </ScrollView>
          </EdgeFadeRow>
        )}
      </View>

      {/* My Albums */}
      <View style={p.section}>
        <Text style={p.sectionTitle}>My Albums</Text>
        {likedAlbums.length === 0 ? (
          <EmptyState icon="disc-outline" label="Like songs to see albums here" />
        ) : (
          <EdgeFadeRow>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled
              contentContainerStyle={p.hRailContent}
            >
              {likedAlbums.map(album => (
                <AlbumCard
                  key={album.album}
                  song={album}
                  onPress={() => openSong(album.id)}
                />
              ))}
            </ScrollView>
          </EdgeFadeRow>
        )}
      </View>
    </>
  )

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
            {MY_MIXES.map(mix => {
            const art = mix.coverArtPath ? albumArtAssets[mix.coverArtPath] : null
            return (
              <TouchableOpacity
                key={mix.id}
                style={p.continueCard}
                activeOpacity={0.85}
                onPress={() => router.push(`/playlist/${mix.id}` as any)}
                onLongPress={() => openAdaptiveMenu({ kind: 'playlist', playlist: mix })}
                delayLongPress={400}
              >
                <View style={p.continueArtWrap}>
                  {art ? (
                    <Image source={art} style={p.continueArt} resizeMode="cover" />
                  ) : (
                    <View style={[p.continueArt, { backgroundColor: C.surface }]}>
                      <Ionicons name="musical-notes" size={28} color="rgba(255,255,255,0.15)" />
                    </View>
                  )}
                  <View style={p.continuePlayPos}>
                    <PlayOverlay size={30} />
                  </View>
                </View>
                <Text style={p.continueTitle} numberOfLines={2}>{mix.name}</Text>
              </TouchableOpacity>
            )
          })}
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

      {/* Inner tab pills — Resume first, Discover second */}
      <View style={p.innerTabRow}>
        {(['resume', 'discover'] as InnerTab[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[p.innerTab, activeInnerTab === tab && p.innerTabActive]}
            onPress={() => setActiveInnerTab(tab)}
            activeOpacity={0.8}
          >
            <Text style={[p.innerTabLabel, activeInnerTab === tab && p.innerTabLabelActive]}>
              {tab === 'discover' ? 'Discover' : 'Resume'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Scrollable content */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {activeInnerTab === 'resume' ? resumeContent : discoverContent}
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

  innerTabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  innerTab: {
    paddingVertical: 8,
    paddingHorizontal: 22,
    borderRadius: R.full,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  innerTabActive: { backgroundColor: C.cyan },
  innerTabLabel: { fontSize: 14, fontWeight: '600', color: C.textPrimary },
  innerTabLabelActive: { color: '#000000' },

  greetingWrap: { paddingHorizontal: 16, paddingTop: 28, paddingBottom: 20 },
  greetingText: { ...typeHeadline(28), color: C.textPrimary },
  greetingSub: { fontSize: 14, color: C.textSecondary, marginTop: 4 },

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
  sectionHeaderTappable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  seeAllRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAllText: { fontSize: 12, color: C.textMuted, fontWeight: '600' },
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
  artistCircle: { width: 108, alignItems: 'center' },
  artistAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: 'hidden',
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artistName: { fontSize: 12, fontWeight: '600', color: C.textPrimary, textAlign: 'center' },
  artistGenre: { fontSize: 11, color: C.textMuted, textAlign: 'center', marginTop: 1 },

  continueCard: { width: 150 },
  continueArtWrap: { position: 'relative', marginBottom: 8 },
  continueArt: {
    width: 150,
    height: 150,
    borderRadius: R.sm,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continuePlayPos: { position: 'absolute', bottom: 8, left: 8 },
  continueTitle: { fontSize: 14, fontWeight: '600', color: C.textPrimary, lineHeight: 18 },
  podcastHost: { fontSize: 12, color: C.textSecondary, marginTop: 2 },

  sessionList: { paddingHorizontal: 16, gap: 10 },

  sessionCard: { borderRadius: 18, overflow: 'hidden' },
  sessionCardLoyalFan: {
    borderWidth: 1,
    borderColor: 'rgba(107, 63, 160, 0.55)',
    shadowColor: OLIVIA_LOYAL_FAN_PURPLE,
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  sessionCardGradient: { borderRadius: 18 },
  sessionCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  sessionCardPlay: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionCardPlayLoyalFan: {
    backgroundColor: 'rgba(107, 63, 160, 0.38)',
    borderColor: 'rgba(196, 168, 232, 0.45)',
  },

  sessionThumb: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sessionThumbMosaic: {
    width: 52,
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    overflow: 'hidden',
  },
  sessionThumbLoyalFan: {
    borderWidth: 1,
    borderColor: 'rgba(107, 63, 160, 0.5)',
  },
  sessionMosaicCell: { overflow: 'hidden' },
  sessionRowBody: { flex: 1, gap: 3 },
  sessionRowTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
  sessionLoyalFanRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sessionLoyalFanLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#C4A8E8',
    letterSpacing: 0.2,
  },
  sessionRowDesc: { fontSize: 13, color: 'rgba(255,255,255,0.68)', lineHeight: 17 },
  sessionRowDescLoyalFan: { color: 'rgba(228, 212, 255, 0.78)' },
  sessionRowMeta: { fontSize: 11, color: 'rgba(255,255,255,0.42)', marginTop: 1 },
  sessionRowMetaLoyalFan: { color: 'rgba(196, 168, 232, 0.55)' },

  playOverlay: {
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyStateText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.textSecondary,
    textAlign: 'center',
  },
  emptyStateSub: {
    fontSize: 13,
    color: C.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
})
