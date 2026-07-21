import { useMemo } from 'react'
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { Text } from '../AppText'
import { AppImage as Image } from '../AppImage'
import { EdgeFadeRow } from '../EdgeFadeRow'
import { songs as allSongs, artists, type Song } from '../../data/mockData'
import { albumArtAssets, resolveArtistAvatar } from '../../data/assetMap'
import { getHannahJourneyGenericArtist } from '../../data/hannahJourneyGenericArtists'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useLikedSongs } from '../../context/LikedSongsContext'
import { useAdaptiveMenu } from '../AdaptiveContextMenu'
import { useArtistEngagement } from '../../context/ArtistEngagementContext'
import { C, typeHeadline } from '../../theme'

// Same visual system as OliviaMusicTab's Hannah-Journey-superfan branch (Figma
// 2462-14102) — styling values copied verbatim (paddings/radii/sizes/fonts) so
// this reads as the same design language, just without Olivia's superfan-only
// perks that don't apply to an artist with no scripted journey (no "Since Your
// Last Visit" updates, no "Your Favorites" segmented control — there's no real
// per-song recency data for these artists — no playlists/podcasts/videos, since
// none of those exist in the catalog for them). Top Track / Top Songs / Top
// Albums / Related Stations / Fans Also Like use only real catalog content.
const GREY = '#a6a6a6'

function resolveArt(key?: string) {
  return (key ? albumArtAssets[key] : null) ?? null
}

function byArtist(artistId: string): Song[] {
  return allSongs.filter(sg => sg.artistId === artistId)
}

function fmtStreams(n: number): string {
  return Math.max(0, Math.round(n)).toLocaleString('en-US')
}

function RowIcons({ song }: { song: Song }) {
  const { isLiked, toggleLike } = useLikedSongs()
  const { open } = useAdaptiveMenu()
  const liked = isLiked(song.id)
  return (
    <View style={s.rowIcons}>
      <TouchableOpacity onPress={() => toggleLike(song.id)} hitSlop={8}>
        <Ionicons name={liked ? 'heart' : 'heart-outline'} size={22} color={liked ? C.cyan : '#fff'} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => open({ kind: 'song', song })} hitSlop={8}>
        <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  )
}

function SectionHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <View style={s.head}>
      <View style={{ flex: 1 }}>
        <Text style={s.title}>{title}</Text>
        {sub ? <Text style={s.sub}>{sub}</Text> : null}
      </View>
    </View>
  )
}

/** Loose genre-token match so "Fans also like" stays real artists with a genuine
 * taste overlap (e.g. "Indie Pop" ~ "Pop / R&B" both contain "pop") rather than
 * an arbitrary hand-picked list. Falls back to the catalog's biggest artists by
 * monthly listeners if the genre match comes up short, so the rail is never empty. */
function fansAlsoLike(artistId: string, genre: string, count = 3) {
  const tokens = new Set(genre.toLowerCase().split(/[\s/&,]+/).filter(Boolean))
  const scored = artists
    .filter(a => a.id !== artistId)
    .map(a => {
      const otherTokens = a.genre.toLowerCase().split(/[\s/&,]+/).filter(Boolean)
      const overlap = otherTokens.filter(t => tokens.has(t)).length
      return { artist: a, overlap }
    })
    .sort((a, b) => b.overlap - a.overlap || b.artist.monthlyListeners - a.artist.monthlyListeners)
  return scored.slice(0, count).map(s => s.artist)
}

export default function HannahJourneyGenericArtistMusicTab({ artistId }: { artistId: string }) {
  const router = useRouter()
  const { playSongAt } = usePlaybackState()
  const { open: openMenu } = useAdaptiveMenu()
  const { markPlayed } = useArtistEngagement()

  const config = getHannahJourneyGenericArtist(artistId)
  const songs = useMemo(() => byArtist(artistId), [artistId])

  const play = (id: string) => {
    playSongAt(id)
    markPlayed(artistId)
    router.push('/now-playing' as any)
  }

  const albums = useMemo(() => {
    const seen = new Map<string, { album: string; artKey: string; firstSongId: string }>()
    for (const sg of songs) {
      if (!seen.has(sg.album)) seen.set(sg.album, { album: sg.album, artKey: sg.albumArtPath ?? '', firstSongId: sg.id })
    }
    return Array.from(seen.values())
  }, [songs])

  const stations = useMemo(
    () => albums.slice(0, 4).map(al => ({ name: `${al.album} Radio`, artKey: al.artKey, songId: al.firstSongId })),
    [albums],
  )

  const fans = useMemo(
    () => (config ? fansAlsoLike(artistId, config.genre) : []),
    [artistId, config],
  )

  if (!config || songs.length === 0) {
    return (
      <View style={s.emptyWrap}>
        <Text style={s.emptyText}>Music coming soon</Text>
      </View>
    )
  }

  const topSong = songs[0]
  // Deterministic-ish display numbers (no real per-song analytics for these
  // artists) — scaled off the artist's real monthlyListeners so bigger artists
  // show bigger numbers, same "stable without real analytics" approach
  // OliviaMusicTab's own STREAMS array already uses.
  const topSongs = songs.slice(0, 3)
  const streamsFor = (i: number) => config.monthlyListeners * (1.4 - i * 0.22)

  return (
    <View style={s.wrap}>
      {/* Top Track feature banner — same shape as Olivia's "New Album" card, adapted */}
      <View style={s.pad}>
        <TouchableOpacity style={s.featureCard} activeOpacity={0.88} onPress={() => play(topSong.id)}>
          <Image source={resolveArt(topSong.albumArtPath)} style={StyleSheet.absoluteFill} resizeMode="cover" blurRadius={12} />
          <View style={s.featureScrim} />
          <View style={s.featureRow}>
            <Image source={resolveArt(topSong.albumArtPath)} style={s.featureCover} resizeMode="cover" />
            <View style={{ flex: 1 }}>
              <Text style={s.featureEyebrow}>TOP TRACK</Text>
              <Text style={s.featureTitle} numberOfLines={1}>{topSong.title}</Text>
              <Text style={s.featureSub} numberOfLines={1}>Fan favorite on Amazon Music</Text>
            </View>
          </View>
          <TouchableOpacity hitSlop={8} onPress={() => openMenu({ kind: 'song', song: topSong })} style={s.featureMore}>
            <Ionicons name="ellipsis-horizontal" size={16} color="#fff" />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      {/* Top Songs */}
      <View style={s.section}>
        <SectionHead title="Top Songs" />
        <View style={s.pad}>
          {topSongs.map((sg, i) => (
            <TouchableOpacity key={sg.id} style={s.popRow} activeOpacity={0.8} onPress={() => play(sg.id)}>
              <Image source={resolveArt(sg.albumArtPath)} style={s.popCover} resizeMode="cover" />
              <View style={{ flex: 1 }}>
                <Text style={s.popTitle} numberOfLines={1}>{sg.title}</Text>
                <Text style={s.popMeta} numberOfLines={1}>{config.name} • {fmtStreams(streamsFor(i))}</Text>
              </View>
              <RowIcons song={sg} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Top Albums */}
      {albums.length > 0 && (
        <View style={s.section}>
          <SectionHead title="Top Albums" sub="Streaming now on Amazon Music" />
          <EdgeFadeRow>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
              {albums.map(al => (
                <TouchableOpacity key={al.album} style={s.discCard} activeOpacity={0.85} onPress={() => play(al.firstSongId)}>
                  <Image source={resolveArt(al.artKey)} style={s.discArt} resizeMode="cover" />
                  <Text style={s.discTitle} numberOfLines={1}>{al.album}</Text>
                  <Text style={s.discMeta} numberOfLines={1}>Album • {config.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </EdgeFadeRow>
        </View>
      )}

      {/* Related Stations */}
      {stations.length > 0 && (
        <View style={s.section}>
          <SectionHead title="Related Stations" />
          <EdgeFadeRow>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
              {stations.map(st => (
                <TouchableOpacity key={st.name} style={s.discCard} activeOpacity={0.85} onPress={() => play(st.songId)}>
                  <View>
                    <Image source={resolveArt(st.artKey)} style={s.discArt} resizeMode="cover" />
                    <View style={s.radioBadge}>
                      <MaterialIcons name="sensors" size={22} color="#fff" />
                    </View>
                  </View>
                  <Text style={s.discTitle} numberOfLines={1}>{st.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </EdgeFadeRow>
        </View>
      )}

      {/* Fans Also Like */}
      {fans.length > 0 && (
        <View style={[s.section, { marginBottom: 8 }]}>
          <SectionHead title="Fans also like" />
          <EdgeFadeRow>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
              {fans.map(a => {
                const avatar = resolveArtistAvatar(a.id, a.imageUri)
                return (
                  <TouchableOpacity key={a.id} style={s.fanCard} activeOpacity={0.85} onPress={() => router.push(`/artist/${a.id}` as any)}>
                    {avatar ? (
                      <Image source={avatar} style={s.fanAvatar} resizeMode="cover" />
                    ) : (
                      <View style={[s.fanAvatar, s.fanAvatarFallback]}>
                        <Ionicons name="person" size={40} color="rgba(255,255,255,0.25)" />
                      </View>
                    )}
                    <Text style={s.fanName} numberOfLines={1}>{a.name}</Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </EdgeFadeRow>
        </View>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  wrap: { gap: 32, paddingTop: 20 },
  pad: { paddingHorizontal: 16 },
  section: { gap: 12 },

  head: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, gap: 12 },
  title: { ...typeHeadline(20), color: '#fff' },
  sub: { fontSize: 12, color: GREY, marginTop: 3 },

  rail: { paddingHorizontal: 16, gap: 14 },

  rowIcons: { flexDirection: 'row', alignItems: 'center', gap: 12 },

  featureCard: { borderRadius: 8, overflow: 'hidden', padding: 12, flexDirection: 'row', alignItems: 'center' },
  featureScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  featureRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14 },
  featureCover: { width: 81, height: 81, borderRadius: 4, borderWidth: 0.75, borderColor: 'rgba(255,255,255,0.24)' },
  featureEyebrow: { fontSize: 12, fontWeight: '700', color: C.cyan },
  featureTitle: { ...typeHeadline(16), color: '#fff', marginTop: 2 },
  featureSub: { fontSize: 12, color: '#fff', marginTop: 3 },
  featureMore: { marginLeft: 8, alignSelf: 'flex-start' },

  popRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  popCover: { width: 63, height: 63, borderRadius: 4, borderWidth: 0.75, borderColor: 'rgba(255,255,255,0.24)' },
  popTitle: { ...typeHeadline(16), color: '#fff', flexShrink: 1 },
  popMeta: { fontSize: 12, color: GREY, marginTop: 3 },

  fanCard: { alignItems: 'center', gap: 6, width: 150 },
  fanAvatar: { width: 150, height: 150, borderRadius: 75 },
  fanAvatarFallback: { backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  fanName: { ...typeHeadline(16), color: '#fff' },

  discCard: { width: 173 },
  discArt: { width: 173, height: 173, borderRadius: 8, borderWidth: 0.75, borderColor: 'rgba(255,255,255,0.24)' },
  discTitle: { ...typeHeadline(16), color: '#fff', marginTop: 6 },
  discMeta: { fontSize: 14, color: GREY, marginTop: 1 },
  radioBadge: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(0,0,0,0.80)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyWrap: { alignItems: 'center', paddingTop: 48, paddingBottom: 80 },
  emptyText: { color: '#555', fontSize: 14 },
})
