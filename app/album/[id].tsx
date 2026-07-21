import { useMemo } from 'react'
import { ScrollView, View, TouchableOpacity, StyleSheet, Share } from 'react-native'
import { AppImage } from '../../src/components/AppImage'
import { Text } from '../../src/components/AppText'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { songs, artists } from '../../src/data/mockData'
import { usePlaybackState } from '../../src/hooks/usePlaybackState'
import { useAdaptiveMenu } from '../../src/components/AdaptiveContextMenu'
import { useLikedSongs } from '../../src/context/LikedSongsContext'
import { useHannahJourney } from '../../src/context/HannahJourneyContext'
import HannahJourneyAlbumPage from '../../src/components/hannah-journey/HannahJourneyAlbumPage'
import { albumArtAssets, oliviaPageAssets, artistAssets } from '../../src/data/assetMap'
import { OLIVIA_DISCOGRAPHY, type DiscographyRelease } from '../../src/data/oliviaRodrigoPage'
import { TAYLOR_DISCOGRAPHY } from '../../src/data/taylorSwiftPage'
import { BTS_DISCOGRAPHY } from '../../src/data/btsPage'

// Sabrina Carpenter doesn't have a dedicated discography data file (she's a
// Hannah-Journey secondary artist, not a bespoke-page artist), but her
// "Albums for you" card on the landing page needs a real release to open —
// falling back to her artist page instead of an album view was the bug.
// Tracklists come from the catalog via the album-title match in trackDefs.
const SABRINA_DISCOGRAPHY: DiscographyRelease[] = [
  { id: 'sabrina-mans-best-friend-2025', title: "Man's Best Friend", year: 2025, type: 'album', artKey: 'sabrina-mans-best-friend' },
  { id: 'sabrina-emails-2022', title: "emails i can't send", year: 2022, type: 'album', artKey: 'sabrina-emails-i-cant-send' },
  { id: 'sabrina-short-n-sweet-2024', title: "Short n' Sweet", year: 2024, type: 'album', artKey: 'sabrina-short-n-sweet' },
]
import { C, R, typeHeadline } from '../../src/theme'
import GlassCircleButton from '../../src/components/GlassCircleButton'
import BlurredArtBackground from '../../src/components/BlurredArtBackground'

// Music-tab rails sometimes use OR-prefixed ids; map to discography ids.
const ALBUM_ID_ALIASES: Record<string, string> = {
  'or-album-sour': 'sour-2021',
  'or-album-guts': 'guts-2023',
  'or-album-guts-spilled': 'guts-spilled-2024',
  'or-album-pretty': 'pretty-sad-2026',
}

// "Albums for you"-style home rails (index.tsx, CasualHome.tsx,
// AdaptivePersonaHome.tsx, RabiatAdaptiveHome.tsx) surface an arbitrary
// catalog album — any artist, not just the four bespoke-page ones below — by
// picking one representative song per unique album title. Those cards route
// here with a synthetic id in this shape so this screen can rebuild a real
// release (with real tracks) on the fly instead of falling through to the
// "Release not found" state or, worse, being wired to just play a song
// directly (that was the previous "tapping an Albums rail plays instead of
// navigating" bug).
const GENERIC_ALBUM_PREFIX = 'song-album-'

// Every artist with a Discography section, so a release id from any of them
// resolves here — ids are prefixed per artist (ts-…, bts-…, unprefixed for
// Olivia) so a flat search never collides.
const ARTIST_RELEASES = [
  { artistId: 'olivia-rodrigo',    artistName: 'Olivia Rodrigo',    releases: OLIVIA_DISCOGRAPHY,  fallbackArt: oliviaPageAssets.profile },
  { artistId: 'tswift',            artistName: 'Taylor Swift',      releases: TAYLOR_DISCOGRAPHY,  fallbackArt: artistAssets['tswift'] },
  { artistId: 'bts',               artistName: 'BTS',               releases: BTS_DISCOGRAPHY,     fallbackArt: artistAssets['bts'] },
  { artistId: 'sabrina-carpenter', artistName: 'Sabrina Carpenter', releases: SABRINA_DISCOGRAPHY, fallbackArt: artistAssets['sabrina-carpenter'] },
]

function typeLabel(type: string): string {
  switch (type) {
    case 'album':  return 'Album'
    case 'deluxe': return 'Deluxe'
    case 'single': return 'Single'
    case 'ep':     return 'EP'
    case 'live':   return 'Live'
    default:       return type
  }
}

export default function AlbumReleaseScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>()
  const id = (rawId && ALBUM_ID_ALIASES[rawId]) || rawId
  const router = useRouter()
  const { playSongAt } = usePlaybackState()
  const { open: openAdaptiveMenu } = useAdaptiveMenu()
  const { isLiked, toggleLike } = useLikedSongs()
  const { isHannahJourney } = useHannahJourney()

  const found = useMemo(() => {
    for (const artist of ARTIST_RELEASES) {
      const release = artist.releases.find(r => r.id === id)
      if (release) return { release, artist }
    }

    // Generic fallback: a `song-album-<songId>` id from one of the "Albums
    // for you" home rails. Rebuild the release from mockData directly — every
    // song sharing that anchor song's (artistId, album) pair becomes a track,
    // so any artist in the catalog gets a real, playable album page without
    // needing a bespoke discography entry (same spirit as the Sabrina
    // Carpenter fallback above, generalized to the whole catalog).
    if (id?.startsWith(GENERIC_ALBUM_PREFIX)) {
      const anchor = songs.find(sg => sg.id === id.slice(GENERIC_ALBUM_PREFIX.length))
      if (anchor) {
        const albumSongs = songs.filter(sg => sg.artistId === anchor.artistId && sg.album === anchor.album)
        const artistRecord = artists.find(a => a.id === anchor.artistId)
        const release: DiscographyRelease = {
          id,
          title: anchor.album,
          year: 0, // unknown for generic catalog albums — hidden in the byline below
          type: 'album',
          artKey: anchor.albumArtPath ?? '',
          tracks: albumSongs.map(sg => ({ title: sg.title, duration: sg.duration })),
        }
        return {
          release,
          artist: {
            artistId: anchor.artistId,
            artistName: artistRecord?.name ?? anchor.artistName,
            releases: [release],
            fallbackArt: (anchor.albumArtPath && albumArtAssets[anchor.albumArtPath]) || artistAssets[anchor.artistId] || null,
          },
        }
      }
    }

    return null
  }, [id])

  // Tracks come from the release's own tracklist. A release WITHOUT one first
  // tries the catalog: every song whose album title matches the release title
  // (normalized) becomes a track — so bespoke rail entries like Taylor's
  // "Lover" populate with their real catalog songs instead of rendering as an
  // empty one-track stand-in. A single with no catalog album still stands in
  // as its own one-track "album" — same idea, smaller scale.
  const trackDefs = useMemo(() => {
    if (!found) return []
    if (found.release.tracks?.length) return found.release.tracks
    const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9]/g, '')
    const wanted = norm(found.release.title)
    const catalogTracks = songs.filter(
      sg => sg.artistId === found.artist.artistId && (norm(sg.album) === wanted || norm(sg.album).startsWith(wanted)),
    )
    if (catalogTracks.length) return catalogTracks.map(sg => ({ title: sg.title, duration: sg.duration }))
    return [{ title: found.release.title, duration: '' }]
  }, [found])

  // Match each listed track against the real catalog by (artist, title) so it
  // can actually play — deep cuts outside the mock catalog still show in the
  // tracklist (matching what the old expandable row used to display) but read
  // as unavailable rather than silently disappearing.
  const resolvedTracks = useMemo(
    () =>
      trackDefs.map(t => {
        const match = songs.find(sg => sg.artistId === found?.artist.artistId && sg.title.toLowerCase() === t.title.toLowerCase())
        return { title: t.title, duration: match?.duration ?? t.duration, song: match ?? null }
      }),
    [trackDefs, found],
  )

  if (!found) {
    return (
      <SafeAreaView style={[s.container, { alignItems: 'center', justifyContent: 'center' }]} edges={['top']}>
        <Text style={{ color: C.textSecondary }}>Release not found</Text>
      </SafeAreaView>
    )
  }

  const { release, artist } = found
  const coverArt = albumArtAssets[release.artKey] ?? artist.fallbackArt
  const playableTracks = resolvedTracks.filter(t => t.song)

  const play = (songId: string) => {
    playSongAt(songId)
    router.push('/now-playing')
  }

  const handleShuffle = () => {
    if (playableTracks.length === 0) return
    const random = playableTracks[Math.floor(Math.random() * playableTracks.length)]
    play(random.song!.id)
  }

  const handleShare = () => {
    Share.share({ message: `Listen to "${release.title}" on Amazon Music` }).catch(() => {})
  }

  if (isHannahJourney && artist.artistId === 'olivia-rodrigo') {
    return (
      <HannahJourneyAlbumPage
        release={release as DiscographyRelease}
        artistName={artist.artistName}
      />
    )
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <BlurredArtBackground art={coverArt} fallbackColor={C.cyan} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        {/* ── HERO ── */}
        <View style={s.hero}>
          <View style={s.topBar}>
            <TouchableOpacity onPress={() => router.back()} style={s.navBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="chevron-back" size={22} color={C.textPrimary} />
            </TouchableOpacity>
            <View style={s.navBtn} />
          </View>

          <View style={s.coverBlock}>
            <View style={s.coverShadow}>
              <AppImage source={coverArt} style={s.cover} resizeMode="cover" />
            </View>
          </View>

          <Text style={s.releaseMeta}>
            {typeLabel(release.type).toUpperCase()} · {resolvedTracks.length} {resolvedTracks.length === 1 ? 'song' : 'songs'}
          </Text>

          <View style={s.titleRow}>
            <View style={s.titleCol}>
              <Text style={s.releaseName} numberOfLines={2}>{release.title}</Text>
              <Text style={s.releaseBy} numberOfLines={1}>{artist.artistName}{release.year ? ` · ${release.year}` : ''}</Text>
            </View>

            <View style={s.controlsGroup}>
              <GlassCircleButton size={38} accessibilityLabel="Share" onPress={handleShare}>
                <Ionicons name="share-social-outline" size={17} color="#fff" />
              </GlassCircleButton>
              {playableTracks.length > 1 && (
                <GlassCircleButton size={38} accessibilityLabel="Shuffle" onPress={handleShuffle}>
                  <Ionicons name="shuffle" size={18} color="#fff" />
                </GlassCircleButton>
              )}
              <TouchableOpacity
                style={[s.playBtn, playableTracks.length === 0 && s.playBtnDisabled]}
                accessibilityLabel="Play"
                activeOpacity={0.85}
                disabled={playableTracks.length === 0}
                onPress={() => playableTracks[0] && play(playableTracks[0].song!.id)}
              >
                <Ionicons name="play" size={20} color="#fff" style={{ marginLeft: 2 }} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── TRACKS ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Tracks</Text>
          {resolvedTracks.map((t, i) => {
            const song = t.song
            const liked = song ? isLiked(song.id) : false
            const art = song?.albumArtPath ? albumArtAssets[song.albumArtPath] : coverArt
            return (
              <TouchableOpacity
                key={`${t.title}-${i}`}
                onPress={() => song && play(song.id)}
                style={s.songRow}
                activeOpacity={song ? 0.75 : 1}
                disabled={!song}
              >
                <Text style={s.trackNum}>{i + 1}</Text>
                {art ? (
                  <AppImage source={art} style={s.songArt} resizeMode="cover" />
                ) : (
                  <View style={[s.songArt, { backgroundColor: C.elevated }]} />
                )}
                <View style={s.songInfo}>
                  <Text style={[s.songTitle, !song && s.songTitleDim]} numberOfLines={1}>{t.title}</Text>
                  <Text style={s.songArtist} numberOfLines={1}>{song ? artist.artistName : 'Not available'}</Text>
                </View>
                {song ? (
                  <View style={s.songRowIcons}>
                    <Text style={s.trackDur}>{t.duration}</Text>
                    <TouchableOpacity
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessibilityLabel={liked ? 'Unlike' : 'Like'}
                      onPress={() => toggleLike(song.id)}
                    >
                      <Ionicons name={liked ? 'heart' : 'heart-outline'} size={20} color={liked ? C.cyan : C.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      onPress={() => openAdaptiveMenu({ kind: 'song', song })}
                    >
                      <Ionicons name="ellipsis-horizontal" size={17} color={C.textMuted} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={s.trackDur}>{t.duration}</Text>
                )}
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
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

  releaseMeta: { fontSize: 12, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: 18, letterSpacing: 0.4 },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 12,
  },
  titleCol: { flex: 1 },
  releaseName: { ...typeHeadline(24), color: C.textPrimary },
  releaseBy: { fontSize: 13, color: C.pink, fontWeight: '600', marginTop: 6 },

  controlsGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  playBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: C.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtnDisabled: { opacity: 0.4 },

  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { ...typeHeadline(18), color: C.textPrimary, marginBottom: 4 },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 10,
    gap: 12,
  },
  trackNum: { width: 18, fontSize: 13, color: C.textMuted, textAlign: 'center' },
  songArt: { width: 52, height: 52, borderRadius: R.sm, overflow: 'hidden' },
  songInfo: { flex: 1 },
  songTitle: { fontSize: 16, fontWeight: '700', color: C.textPrimary },
  songTitleDim: { color: C.textMuted },
  songArtist: { fontSize: 13, color: C.textSecondary, marginTop: 3 },
  songRowIcons: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  trackDur: { fontSize: 12, color: C.textMuted },
})
