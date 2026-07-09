import { useState } from 'react'
import { ScrollView, View, TouchableOpacity, StyleSheet } from 'react-native'
import { AppImage as Image } from '../../src/components/AppImage'
import { Text } from '../../src/components/AppText'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { songs, playlists, fanGroups, podcasts, artists, user } from '../../src/data/mockData'
import { albumArtAssets, artistAssets, resolveArtistAvatar } from '../../src/data/assetMap'
import { usePlaybackState } from '../../src/hooks/usePlaybackState'
import { C, R, typeHeadline } from '../../src/theme'
import StickyLibraryHeader from '../../src/components/StickyLibraryHeader'
import { EdgeFadeRow } from '../../src/components/EdgeFadeRow'
import { useSavedSessions } from '../../src/context/SavedSessionsContext'
import { useLikedSongs } from '../../src/context/LikedSongsContext'

function relativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const diffH = Math.floor(diffMs / (1000 * 60 * 60))
  if (diffH < 1) return 'Just now'
  if (diffH < 24) return `${diffH}h ago`
  const diffD = Math.floor(diffH / 24)
  if (diffD === 1) return 'Yesterday'
  return `${diffD} days ago`
}

type FilterKey = 'Playlists' | 'Audiobooks' | 'Podcasts' | 'Songs' | 'Artists' | 'Album'
const FILTERS: FilterKey[] = ['Playlists', 'Audiobooks', 'Podcasts', 'Songs', 'Artists', 'Album']

const MY_LIKES = {
  id: 'my-likes',
  name: 'My Likes',
  songCount: 142,
  coverArtPath: songs[2]?.albumArtPath,
}

const RECENTLY_PLAYED = songs.slice(0, 8)

function PlayOverlay({ size = 30 }: { size?: number }) {
  return (
    <View style={[s.playOverlay, { width: size, height: size, borderRadius: size / 2 }]}>
      <Ionicons name="play" size={size * 0.45} color="#000" style={{ marginLeft: 1 }} />
    </View>
  )
}

export default function LibraryScreen() {
  const router = useRouter()
  const { playSongAt } = usePlaybackState()
  const { sessions, playSavedSession, deleteSavedSession } = useSavedSessions()
  const { likedSongIds } = useLikedSongs()
  const [activeFilter, setActiveFilter] = useState<FilterKey>('Playlists')
  const firstName = user.name.split(' ')[0]
  const likedCount = likedSongIds.size

  // 'Playlists' is the default landing filter and keeps the full library view;
  // the other pills narrow the page to that content type.
  const showFull = activeFilter === 'Playlists'
  const likedSongs = songs.filter(sg => likedSongIds.has(sg.id))
  const libraryArtists = Array.from(
    new Set([...RECENTLY_PLAYED, ...likedSongs].map(sg => sg.artistId)),
  )
    .map(aid => artists.find(a => a.id === aid))
    .filter((a): a is typeof artists[0] => a != null)
    .slice(0, 12)
  const libraryPodcasts = podcasts.slice(0, 8)

  const openSong = (songId: string) => {
    playSongAt(songId)
    router.push('/now-playing')
  }

  // Fan groups without an artistId still deep-link somewhere sensible.
  const fanGroupArtistId = (group: (typeof fanGroups)[0]): string | null =>
    group.artistId ?? (group.name.includes('BTS') ? 'bts' : null)

  return (
    <View style={s.screen}>
      <StickyLibraryHeader firstName={firstName} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <EdgeFadeRow>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.filterRow}
            style={{ marginBottom: 24, marginTop: 4 }}
          >
            <TouchableOpacity
              style={s.searchPill}
              onPress={() => router.push('/(tabs)/search')}
              activeOpacity={0.8}
            >
              <Ionicons name="search" size={18} color={C.textPrimary} />
            </TouchableOpacity>

            {FILTERS.map(f => (
              <TouchableOpacity
                key={f}
                onPress={() => setActiveFilter(f)}
                style={[s.filterPill, activeFilter === f && s.filterPillActive]}
                activeOpacity={0.8}
              >
                <Text style={[s.filterLabel, activeFilter === f && s.filterLabelActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </EdgeFadeRow>

        {showFull && (
        <>
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Playlists</Text>
          {/* Maestro builds playlists from a prompt — it's the app's playlist creator */}
          <TouchableOpacity
            style={s.newPlaylistBtn}
            activeOpacity={0.85}
            onPress={() => router.push('/(tabs)/maestro' as any)}
          >
            <Ionicons name="add" size={14} color="#000000" />
            <Text style={s.newPlaylistText}>NEW PLAYLIST</Text>
          </TouchableOpacity>
        </View>

        <View style={s.playlistGrid}>
          <TouchableOpacity
            style={s.playlistGridCard}
            activeOpacity={0.8}
            onPress={() => router.push('/liked')}
          >
            <View style={s.playlistGridArt}>
              {likedCount === 0 && MY_LIKES.coverArtPath && albumArtAssets[MY_LIKES.coverArtPath] ? (
                <Image
                  source={albumArtAssets[MY_LIKES.coverArtPath]}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : (
                <View style={s.playlistGridArtFallback}>
                  <Ionicons name="heart" size={32} color={C.cyan} />
                </View>
              )}
            </View>
            <Text style={s.playlistGridName} numberOfLines={1}>Liked Songs</Text>
            <Text style={s.playlistGridSub}>
              {likedCount} {likedCount === 1 ? 'song' : 'songs'}
            </Text>
          </TouchableOpacity>

          {playlists.map(pl => {
            const art = pl.coverArtPath ? albumArtAssets[pl.coverArtPath] : null
            return (
              <TouchableOpacity
                key={pl.id}
                style={s.playlistGridCard}
                activeOpacity={0.8}
                onPress={() => router.push(`/playlist/${pl.id}` as any)}
              >
                <View style={s.playlistGridArt}>
                  {art ? (
                    <Image source={art} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  ) : (
                    <View style={s.playlistGridArtFallback}>
                      <Ionicons name="musical-notes" size={32} color={C.textMuted} />
                    </View>
                  )}
                </View>
                <Text style={s.playlistGridName} numberOfLines={1}>{pl.name}</Text>
                <Text style={s.playlistGridSub}>{pl.songIds?.length ?? pl.songCount} songs</Text>
              </TouchableOpacity>
            )
          })}
        </View>
        </>
        )}

        {activeFilter === 'Songs' && (
          <>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Songs</Text>
            </View>
            {likedSongs.length === 0 ? (
              <Text style={s.filterEmpty}>Songs you like will show up here — tap the heart anywhere in the app.</Text>
            ) : (
              <View style={{ paddingHorizontal: 16 }}>
                {likedSongs.map(song => {
                  const art = song.albumArtPath ? albumArtAssets[song.albumArtPath] : null
                  return (
                    <TouchableOpacity key={song.id} style={s.songRow} activeOpacity={0.75} onPress={() => openSong(song.id)}>
                      {art ? (
                        <Image source={art} style={s.songRowArt} resizeMode="cover" />
                      ) : (
                        <View style={[s.songRowArt, { backgroundColor: song.albumArtColor }]} />
                      )}
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={s.songRowTitle} numberOfLines={1}>{song.title}</Text>
                        <Text style={s.songRowArtist} numberOfLines={1}>{song.artistName}</Text>
                      </View>
                      <Ionicons name="heart" size={16} color={C.cyan} />
                    </TouchableOpacity>
                  )
                })}
              </View>
            )}
          </>
        )}

        {activeFilter === 'Artists' && (
          <>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Artists</Text>
            </View>
            <View style={s.playlistGrid}>
              {libraryArtists.map(a => {
                const avatar = resolveArtistAvatar(a.id, a.imageUri)
                return (
                  <TouchableOpacity
                    key={a.id}
                    style={s.playlistGridCard}
                    activeOpacity={0.8}
                    onPress={() => router.push(`/artist/${a.id}` as any)}
                  >
                    <View style={[s.playlistGridArt, { borderRadius: 999 }]}>
                      {avatar ? (
                        <Image source={avatar} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                      ) : (
                        <View style={s.playlistGridArtFallback}>
                          <Ionicons name="person" size={32} color={C.textMuted} />
                        </View>
                      )}
                    </View>
                    <Text style={[s.playlistGridName, { textAlign: 'center' }]} numberOfLines={1}>{a.name}</Text>
                    <Text style={[s.playlistGridSub, { textAlign: 'center' }]} numberOfLines={1}>{a.genre}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </>
        )}

        {activeFilter === 'Podcasts' && (
          <>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Podcasts</Text>
            </View>
            <View style={s.playlistGrid}>
              {libraryPodcasts.map(pod => {
                const art = pod.coverArtPath ? albumArtAssets[pod.coverArtPath] : null
                return (
                  <TouchableOpacity
                    key={pod.id}
                    style={s.playlistGridCard}
                    activeOpacity={0.8}
                    onPress={() => router.push(`/podcast-show/${pod.id}` as any)}
                  >
                    <View style={s.playlistGridArt}>
                      {art ? (
                        <Image source={art} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                      ) : (
                        <View style={[s.playlistGridArtFallback, { backgroundColor: pod.coverColor }]}>
                          <Ionicons name="mic" size={32} color="rgba(255,255,255,0.3)" />
                        </View>
                      )}
                    </View>
                    <Text style={s.playlistGridName} numberOfLines={1}>{pod.title}</Text>
                    <Text style={s.playlistGridSub} numberOfLines={1}>{pod.host}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </>
        )}

        {activeFilter === 'Audiobooks' && (
          <Text style={s.filterEmpty}>Your Audible library lives in the Audible app.</Text>
        )}

        {(showFull || activeFilter === 'Album') && (
        <>
        <View style={[s.sectionHeader, { marginTop: showFull ? 36 : 0 }]}>
          <Text style={s.sectionTitle}>Recently Played</Text>
        </View>
        <EdgeFadeRow>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.recentRail}
          >
            {RECENTLY_PLAYED.map(song => {
              const art = song.albumArtPath ? albumArtAssets[song.albumArtPath] : null
              return (
                <TouchableOpacity
                  key={song.id}
                  style={s.recentCard}
                  onPress={() => openSong(song.id)}
                  activeOpacity={0.85}
                >
                  <View style={s.recentArtWrap}>
                    {art ? (
                      <Image source={art} style={s.recentArt} resizeMode="cover" />
                    ) : (
                      <View style={[s.recentArt, { backgroundColor: song.albumArtColor }]}>
                        <Ionicons name="musical-note" size={28} color="rgba(255,255,255,0.15)" />
                      </View>
                    )}
                    <View style={s.recentPlayPos}>
                      <PlayOverlay />
                    </View>
                  </View>
                  <Text style={s.recentType}>ALBUM</Text>
                  <Text style={s.recentTitle} numberOfLines={1}>{song.album}</Text>
                  <Text style={s.recentArtist} numberOfLines={1}>{song.artistName}</Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </EdgeFadeRow>
        </>
        )}

        {showFull && sessions.length > 0 && (
          <>
            <View style={[s.sectionHeader, { marginTop: 28 }]}>
              <Text style={s.sectionTitle}>Sessions</Text>
            </View>
            <EdgeFadeRow>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.recentRail}
              >
                {sessions.map(session => {
                  const art = session.coverArtPath ? albumArtAssets[session.coverArtPath] : null
                  return (
                    <TouchableOpacity
                      key={session.id}
                      style={s.recentCard}
                      onPress={() => {
                        playSavedSession(session, playSongAt)
                        router.push('/now-playing')
                      }}
                      activeOpacity={0.85}
                    >
                      <View style={s.recentArtWrap}>
                        {art ? (
                          <Image source={art} style={s.recentArt} resizeMode="cover" />
                        ) : (
                          <View style={[s.recentArt, s.sessionArtFallback]}>
                            <Ionicons name="time-outline" size={32} color="rgba(255,255,255,0.2)" />
                          </View>
                        )}
                        <View style={s.recentPlayPos}>
                          <PlayOverlay />
                        </View>
                        <TouchableOpacity
                          style={s.sessionDeleteBtn}
                          onPress={() => deleteSavedSession(session.id)}
                          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                        >
                          <Text style={s.sessionDeleteX}>×</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={s.sessionLabel} numberOfLines={1}>{session.label}</Text>
                      {session.description ? (
                        <Text style={s.sessionDescription} numberOfLines={2}>{session.description}</Text>
                      ) : null}
                      <Text style={s.sessionTime}>{relativeTime(session.savedAt)}</Text>
                    </TouchableOpacity>
                  )
                })}
              </ScrollView>
            </EdgeFadeRow>
          </>
        )}

        {showFull && (
        <>
        <View style={[s.sectionHeader, { marginTop: 28 }]}>
          <Text style={s.sectionTitle}>Fan Groups</Text>
        </View>
        <EdgeFadeRow>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.fanGroupRail}
          >
            {fanGroups.map(group => {
              const art = group.artistId
                ? artistAssets[group.artistId]
                : group.coverArtPath
                  ? albumArtAssets[group.coverArtPath]
                  : null
              const targetArtist = fanGroupArtistId(group)
              return (
                <TouchableOpacity
                  key={group.id}
                  style={s.fanGroupCard}
                  activeOpacity={0.85}
                  onPress={() => targetArtist && router.push(`/artist/${targetArtist}` as any)}
                >
                  <View style={s.fanGroupArtWrap}>
                    {art ? (
                      <Image source={art} style={s.fanGroupArt} resizeMode="cover" />
                    ) : (
                      <View style={[s.fanGroupArt, s.fanGroupArtFallback]}>
                        <Ionicons name="people" size={28} color="rgba(255,255,255,0.2)" />
                      </View>
                    )}
                  </View>
                  <Text style={s.fanGroupName} numberOfLines={2}>{group.name}</Text>
                  <Text style={s.fanGroupMeta}>
                    {group.memberCount >= 1000
                      ? `${(group.memberCount / 1000).toFixed(1)}k members`
                      : `${group.memberCount} members`}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </EdgeFadeRow>
        </>
        )}
      </ScrollView>
    </View>
  )
}

const s = StyleSheet.create({
  screen:         { flex: 1, backgroundColor: C.bg },

  filterRow:      { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  searchPill: {
    width: 40,
    height: 36,
    borderRadius: R.full,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: R.full,
    backgroundColor: C.surface,
  },
  filterPillActive: { backgroundColor: '#2a3a3e' },
  filterLabel:    { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.65)' },
  filterLabelActive: { color: '#ffffff', fontWeight: '700' },

  sectionHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle:   { ...typeHeadline(20), color: C.textPrimary },
  newPlaylistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.cyan,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: R.full,
  },
  newPlaylistText: { fontSize: 11, fontWeight: '700', color: '#000000', letterSpacing: 0.5 },

  playlistGrid:       { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12, marginBottom: 12 },
  playlistGridCard:   { width: '47%', gap: 6 },
  playlistGridArt:    { width: '100%', aspectRatio: 1, borderRadius: R.sm, overflow: 'hidden', backgroundColor: C.surface },
  playlistGridArtFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  playlistGridName:   { fontSize: 14, fontWeight: '600', color: C.textPrimary },
  playlistGridSub:    { fontSize: 12, color: C.textSecondary },

  recentRail:     { paddingHorizontal: 16, gap: 14 },
  recentCard:     { width: 160 },
  recentArtWrap:  { position: 'relative', marginBottom: 8 },
  recentArt:      { width: 160, height: 160, borderRadius: R.sm, overflow: 'hidden' },
  recentPlayPos:  { position: 'absolute', bottom: 8, left: 8 },
  recentType:     { fontSize: 10, fontWeight: '700', color: C.cyan, letterSpacing: 1, marginBottom: 3 },
  recentTitle:    { fontSize: 14, fontWeight: '600', color: C.textPrimary, marginBottom: 2 },
  recentArtist:   { fontSize: 12, color: C.textSecondary },

  fanGroupRail:     { paddingHorizontal: 16, gap: 14 },
  fanGroupCard:     { width: 140 },
  fanGroupArtWrap:  { marginBottom: 8 },
  fanGroupArt:      { width: 140, height: 140, borderRadius: R.sm, overflow: 'hidden' },
  fanGroupArtFallback: { backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  fanGroupName:     { fontSize: 14, fontWeight: '600', color: C.textPrimary, marginBottom: 2 },
  fanGroupMeta:     { fontSize: 12, color: C.textSecondary },

  playOverlay: {
    backgroundColor: C.cyan,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sessionArtFallback:  { backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  sessionLabel:        { fontSize: 14, fontWeight: '600', color: C.textPrimary, marginBottom: 2 },
  sessionDescription:  { fontSize: 11, color: C.textSecondary, marginBottom: 2 },
  sessionTime:         { fontSize: 10, color: C.textMuted },
  sessionDeleteBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionDeleteX: { fontSize: 16, color: '#fff', lineHeight: 20, fontWeight: '700' },

  // Type-filter views (Songs pill)
  songRow:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  songRowArt:    { width: 44, height: 44, borderRadius: R.sm, overflow: 'hidden' },
  songRowTitle:  { fontSize: 14, fontWeight: '600', color: C.textPrimary },
  songRowArtist: { fontSize: 12, color: C.textSecondary, marginTop: 2 },
  filterEmpty:   { fontSize: 14, color: C.textMuted, paddingHorizontal: 16, paddingVertical: 12, lineHeight: 20 },
})
