import { useState } from 'react'
import { ScrollView, View, TouchableOpacity, StyleSheet, Share } from 'react-native'
import { AppImage } from '../../src/components/AppImage'
import { Text } from '../../src/components/AppText'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { playlists, songs, type Song } from '../../src/data/mockData'
import { usePlaybackState } from '../../src/hooks/usePlaybackState'
import { useAdaptiveMenu } from '../../src/components/AdaptiveContextMenu'
import { useAdaptiveUI } from '../../src/context/AdaptiveUIContext'
import { useLikedSongs } from '../../src/context/LikedSongsContext'
import { albumArtAssets } from '../../src/data/assetMap'
import { C, R, typeHeadline } from '../../src/theme'
import GlassCircleButton from '../../src/components/GlassCircleButton'
import BlurredArtBackground from '../../src/components/BlurredArtBackground'
import { EdgeFadeRow } from '../../src/components/EdgeFadeRow'
import { shareText } from '../../src/utils/share'

const SUGGESTION_COUNT = 8
const RELATED_PLAYLIST_COUNT = 10

// Built once from the static catalog — avoids an O(playlists x songs) re-scan
// on every render when scoring "You might also like" playlist relevance below.
const songArtistById = new Map(songs.map(sg => [sg.id, sg.artistId]))

export default function SharedPlaylistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { playSongAt } = usePlaybackState()
  const { open: openAdaptiveMenu } = useAdaptiveMenu()
  const { showConfirmation } = useAdaptiveUI()
  const { isLiked, toggleLike } = useLikedSongs()
  const [addedSongs, setAddedSongs] = useState<Song[]>([])

  const playlist = playlists.find(p => p.id === id) ?? playlists[0]
  // Curated track list when the playlist defines one; legacy catalog slice otherwise.
  // (`songCount ?? 0` guards against a future playlist that defines neither —
  // slice(0, undefined) would otherwise silently return the entire catalog.)
  const playlistSongs = playlist.songIds
    ? playlist.songIds
        .map(sid => songs.find(sg => sg.id === sid))
        .filter((sg): sg is typeof songs[0] => sg != null)
    : songs.slice(0, playlist.songCount ?? 0)

  const displayedSongs = [...playlistSongs, ...addedSongs]
  const displayedIds = new Set(displayedSongs.map(sg => sg.id))
  const playlistArtistIds = new Set(playlistSongs.map(sg => sg.artistId))
  const bySameArtist = songs.filter(sg => !displayedIds.has(sg.id) && playlistArtistIds.has(sg.artistId))
  const others = songs.filter(sg => !displayedIds.has(sg.id) && !playlistArtistIds.has(sg.artistId))
  const suggestedSongs = [...bySameArtist, ...others].slice(0, SUGGESTION_COUNT)

  // "You might also like" playlist rail — ranked by how many of THIS playlist's
  // artists show up in each candidate, so era-mates / same-fandom playlists float
  // to the top; ties fall back to catalog order so the rail is never empty.
  const relatedPlaylists = playlists
    .filter(p => p.id !== playlist.id)
    .map(p => {
      const overlap = (p.songIds ?? []).reduce((count, sid) => {
        const artistId = songArtistById.get(sid)
        return artistId && playlistArtistIds.has(artistId) ? count + 1 : count
      }, 0)
      return { playlist: p, overlap }
    })
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, RELATED_PLAYLIST_COUNT)
    .map(entry => entry.playlist)

  const handleShare = () => {
    void shareText(`Listen to "${playlist.name}" on Amazon Music`)
  }

  const handleAddSuggestion = (song: Song) => {
    setAddedSongs(prev => [...prev, song])
    showConfirmation(`Added "${song.title}" to ${playlist.name}`)
  }

  const coverArt = playlist.coverArtPath ? albumArtAssets[playlist.coverArtPath] : null
  const tint = playlistSongs[0]?.albumArtColor ?? C.cyan

  // Attribution byline: Amazon-curated, artist-made, or a user's playlist.
  const byline =
    playlist.curatorType === 'amazon'
      ? 'Curated by Amazon Music'
      : playlist.curatorName
        ? `By ${playlist.curatorName}`
        : null

  const play = (songId: string) => {
    playSongAt(songId)
    router.push('/now-playing')
  }

  const handleShuffle = () => {
    if (displayedSongs.length === 0) return
    const random = displayedSongs[Math.floor(Math.random() * displayedSongs.length)]
    play(random.id)
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      {/* Fixed full-screen backdrop — stays put as the page scrolls, so the
          glossy art wash reads behind the tracklist and suggestions too,
          not just behind the hero. */}
      <BlurredArtBackground art={coverArt} fallbackColor={tint} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        {/* ── HERO ── */}
        <View style={s.hero}>
          <View style={s.topBar}>
            <TouchableOpacity onPress={() => router.back()} style={s.navBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="chevron-back" size={22} color={C.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={s.navBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Playlist options"
              onPress={() => openAdaptiveMenu({ kind: 'playlist', playlist })}
            >
              <Ionicons name="ellipsis-horizontal" size={22} color={C.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={s.coverBlock}>
            <View style={s.coverShadow}>
              {coverArt ? (
                <AppImage source={coverArt} style={s.cover} resizeMode="cover" />
              ) : (
                <View style={[s.cover, { backgroundColor: C.elevated, alignItems: 'center', justifyContent: 'center' }]}>
                  <Ionicons name="musical-notes" size={48} color="rgba(255,255,255,0.2)" />
                </View>
              )}
            </View>
          </View>

          <Text style={s.playlistMeta}>
            {displayedSongs.length} song{displayedSongs.length === 1 ? '' : 's'}
            {playlist.totalDuration ? ` · ${playlist.totalDuration}` : ''}
          </Text>

          <View style={s.titleRow}>
            <View style={s.titleCol}>
              <Text style={s.playlistName} numberOfLines={2}>{playlist.name}</Text>
              {byline && <Text style={s.playlistBy} numberOfLines={1}>{byline}</Text>}
            </View>

            <View style={s.controlsGroup}>
              <GlassCircleButton size={38} accessibilityLabel="Share" onPress={handleShare}>
                <Ionicons name="share-social-outline" size={17} color="#fff" />
              </GlassCircleButton>
              <GlassCircleButton size={38} accessibilityLabel="Shuffle" onPress={handleShuffle}>
                <Ionicons name="shuffle" size={18} color="#fff" />
              </GlassCircleButton>
              <TouchableOpacity
                style={s.playBtn}
                accessibilityLabel="Play playlist"
                activeOpacity={0.85}
                onPress={() => displayedSongs[0] && play(displayedSongs[0].id)}
              >
                <Ionicons name="play" size={20} color="#fff" style={{ marginLeft: 2 }} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── TRACKS ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Tracks</Text>
          {displayedSongs.map(song => {
            const art = song.albumArtPath ? albumArtAssets[song.albumArtPath] : null
            const liked = isLiked(song.id)
            return (
              <TouchableOpacity key={song.id} onPress={() => play(song.id)} style={s.songRow} activeOpacity={0.75}>
                {art ? (
                  <AppImage source={art} style={s.songArt} resizeMode="cover" />
                ) : (
                  <View style={[s.songArt, { backgroundColor: song.albumArtColor }]} />
                )}
                <View style={s.songInfo}>
                  <Text style={s.songTitle} numberOfLines={1}>{song.title}</Text>
                  <Text style={s.songArtist} numberOfLines={1}>{song.artistName}</Text>
                </View>
                <View style={s.songRowIcons}>
                  <TouchableOpacity
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel={liked ? 'Unlike' : 'Like'}
                    onPress={() => toggleLike(song.id)}
                  >
                    <Ionicons name={liked ? 'heart' : 'heart-outline'} size={22} color={liked ? C.cyan : C.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    onPress={() => openAdaptiveMenu({ kind: 'song', song })}
                  >
                    <Ionicons name="ellipsis-horizontal" size={18} color={C.textMuted} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* ── SUGGESTIONS: individual tracks to add to THIS playlist ── */}
        {suggestedSongs.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Add more tracks</Text>
            <Text style={s.sectionSub}>More songs to round out this playlist</Text>
            {suggestedSongs.map(song => {
              const art = song.albumArtPath ? albumArtAssets[song.albumArtPath] : null
              return (
                <View key={song.id} style={s.songRow}>
                  {art ? (
                    <AppImage source={art} style={s.songArt} resizeMode="cover" />
                  ) : (
                    <View style={[s.songArt, { backgroundColor: song.albumArtColor }]} />
                  )}
                  <View style={s.songInfo}>
                    <Text style={s.songTitle} numberOfLines={1}>{song.title}</Text>
                    <Text style={s.songArtist} numberOfLines={1}>{song.artistName}</Text>
                  </View>
                  <TouchableOpacity
                    style={s.addBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel={`Add ${song.title} to playlist`}
                    onPress={() => handleAddSuggestion(song)}
                  >
                    <Ionicons name="add" size={18} color={C.cyan} />
                  </TouchableOpacity>
                </View>
              )
            })}
          </View>
        )}

        {/* ── YOU MIGHT ALSO LIKE: related playlists (other artists / similar era-fandom) ── */}
        {relatedPlaylists.length > 0 && (
          <View style={[s.section, { marginBottom: 8 }]}>
            <Text style={s.sectionTitle}>You might also like</Text>
            <Text style={s.sectionSub}>More playlists to explore</Text>
            <EdgeFadeRow fadeColor={C.bg}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.relatedRow} nestedScrollEnabled>
                {relatedPlaylists.map(pl => {
                  const art = pl.coverArtPath ? albumArtAssets[pl.coverArtPath] : null
                  const caption = pl.curatorType === 'amazon'
                    ? 'Playlist · Amazon Music'
                    : pl.curatorName
                      ? `Playlist · ${pl.curatorName}`
                      : 'Playlist'
                  return (
                    <TouchableOpacity
                      key={pl.id}
                      style={s.relatedCard}
                      activeOpacity={0.85}
                      onPress={() => router.push(`/playlist/${pl.id}` as any)}
                    >
                      {art ? (
                        <AppImage source={art} style={s.relatedArt} resizeMode="cover" />
                      ) : (
                        <View style={[s.relatedArt, { backgroundColor: C.elevated, alignItems: 'center', justifyContent: 'center' }]}>
                          <Ionicons name="musical-notes" size={28} color="rgba(255,255,255,0.2)" />
                        </View>
                      )}
                      <Text style={s.relatedTitle} numberOfLines={1}>{pl.name}</Text>
                      <Text style={s.relatedMeta} numberOfLines={1}>{caption}</Text>
                    </TouchableOpacity>
                  )
                })}
              </ScrollView>
            </EdgeFadeRow>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  hero: {
    paddingBottom: 28,
    marginBottom: 8,
    overflow: 'hidden',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  navBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  coverBlock: { alignItems: 'center', marginTop: 8, marginBottom: 24 },
  coverShadow: {
    borderRadius: R.md,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  cover: { width: 200, height: 200, borderRadius: R.md, overflow: 'hidden' },

  playlistMeta: { fontSize: 12, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: 18 },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 12,
  },
  titleCol: { flex: 1 },
  playlistName: { ...typeHeadline(24), color: C.textPrimary },
  playlistBy: { fontSize: 13, color: C.pink, fontWeight: '600', marginTop: 6 },

  controlsGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  playBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: C.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },

  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { ...typeHeadline(18), color: C.textPrimary, marginBottom: 4 },
  sectionSub: { fontSize: 12, color: C.textMuted, marginBottom: 12 },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 10,
  },
  songArt: { width: 58, height: 58, borderRadius: R.sm, overflow: 'hidden' },
  songInfo: { flex: 1, marginLeft: 14 },
  songTitle: { fontSize: 17, fontWeight: '700', color: C.textPrimary },
  songArtist: { fontSize: 14, color: C.textSecondary, marginTop: 4 },
  songRowIcons: { flexDirection: 'row', alignItems: 'center', gap: 16, marginLeft: 8 },
  addBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(37,209,218,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // No horizontal padding here — the parent `section` View already insets 16px,
  // so this stays flush with the section title above it (avoids double-padding).
  relatedRow: { gap: 14 },
  relatedCard: { width: 140 },
  relatedArt: {
    width: 140,
    height: 140,
    borderRadius: R.sm,
    borderWidth: 0.75,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  relatedTitle: { fontSize: 15, fontWeight: '700', color: C.textPrimary, marginTop: 8 },
  relatedMeta: { fontSize: 12, color: C.textMuted, marginTop: 2 },
})
