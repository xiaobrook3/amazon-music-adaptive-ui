import { useMemo } from 'react'
import { ScrollView, View, TouchableOpacity, StyleSheet } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from '../../src/components/AppText'
import { AppImage as Image } from '../../src/components/AppImage'
import { EdgeFadeRow } from '../../src/components/EdgeFadeRow'
import {
  songs,
  artists,
  newForYouSongIds,
  popularInCitySongIds,
  type Song,
  type Mood,
} from '../../src/data/mockData'
import { artistMatchesGenre } from '../../src/data/themeFilters'
import { albumArtAssets, resolveArtistAvatar } from '../../src/data/assetMap'
import { usePlaybackState } from '../../src/hooks/usePlaybackState'
import { C, R, typeHeadline } from '../../src/theme'

/**
 * Browse destination for the Find screen's category cards ("Pop", "Workout",
 * "Charts", …). One screen serves genres, moods/activities, and the two
 * editorial lists — resolved from the route id.
 */

const GENRE_TOKENS: Record<string, string[]> = {
  'pop': ['Pop'],
  'hip-hop': ['Hip-Hop', 'Rap'],
  'rock': ['Rock', 'Metal', 'Punk'],
  'r&b': ['R&B', 'Soul'],
  'country': ['Country', 'Folk'],
  'jazz': ['Jazz', 'Blues'],
  'k-pop': ['K-pop'],
  'indie': ['Indie', 'Dream Pop', 'Art Pop'],
  'electronic': ['Electronic', 'Dance', 'Hyperpop'],
  'classical': ['Classical', 'Ambient'],
  'latin': ['Latin', 'Flamenco', 'Reggaeton'],
  'soul': ['Soul', 'Funk', 'Gospel'],
}

const MOOD_MAP: Record<string, Mood[]> = {
  'workout': ['hype'],
  'party': ['hype', 'happy'],
  'focus': ['chill'],
  'relax': ['chill', 'sleepy'],
  'commute': ['chill', 'happy'],
  'sleep': ['sleepy', 'chill', 'sad'],
}

const TAGLINES: Record<string, string> = {
  'pop': 'Chart-toppers and radio gold.',
  'hip-hop': 'Bars, beats, and heavy rotation.',
  'rock': 'Riffs that never go out of style.',
  'k-pop': 'From 1st Gen pioneers to 4th Gen stans.',
  'jazz': 'Standards and smooth late hours.',
  'latin': 'El calor que mueve tu ciudad.',
  'workout': 'Energy for every rep.',
  'focus': 'Lock in. No skips.',
  'sleep': 'Soft landings only.',
  'charts': "What's climbing this week.",
  'new releases': 'Fresh drops, first listens.',
}

const HUES: Record<string, string> = {
  'pop': '#1a3a5c', 'hip-hop': '#3a1a5c', 'rock': '#5c2a1a', 'r&b': '#1a5c3a',
  'country': '#5c5c1a', 'jazz': '#1a5c5c', 'k-pop': '#4a1a6c', 'indie': '#1a4a4a',
  'electronic': '#3a3a1a', 'classical': '#2a2a5c', 'latin': '#5c3a1a', 'soul': '#1a3a3a',
  'workout': '#5c1a2a', 'focus': '#1a3a5c', 'relax': '#1a4a3a', 'commute': '#3a2a5c',
  'party': '#5c4a1a', 'sleep': '#1a2a4a', 'new releases': '#2a4a6c', 'charts': '#4a2a6c',
}

function resolveSongs(key: string): Song[] {
  if (key === 'new releases') {
    return newForYouSongIds.map(id => songs.find(s => s.id === id)).filter((s): s is Song => s != null)
  }
  if (key === 'charts') {
    return popularInCitySongIds.map(id => songs.find(s => s.id === id)).filter((s): s is Song => s != null)
  }
  const genreTokens = GENRE_TOKENS[key]
  if (genreTokens) {
    const matching = new Set(artists.filter(a => artistMatchesGenre(a, genreTokens)).map(a => a.id))
    return songs.filter(s => matching.has(s.artistId))
  }
  const moods = MOOD_MAP[key]
  if (moods) return songs.filter(s => moods.includes(s.mood))
  return []
}

export default function GenreScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { playSongAt } = usePlaybackState()

  const label = decodeURIComponent(id ?? 'Music')
  const key = label.toLowerCase()
  const hue = HUES[key] ?? '#1a3a5c'

  const genreSongs = useMemo(() => resolveSongs(key), [key])
  const genreArtists = useMemo(() => {
    const seen = new Set<string>()
    return genreSongs
      .map(s => artists.find(a => a.id === s.artistId))
      .filter((a): a is typeof artists[0] => a != null && !seen.has(a.id) && !!seen.add(a.id))
      .slice(0, 12)
  }, [genreSongs])

  const play = (songId: string) => {
    playSongAt(songId)
    router.push('/now-playing')
  }

  return (
    <View style={s.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <LinearGradient
          colors={[hue, C.bg]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[s.header, { paddingTop: insets.top + 8 }]}
        >
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={8}>
            <Ionicons name="chevron-back" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={s.title}>{label}</Text>
          <Text style={s.tagline}>{TAGLINES[key] ?? 'Hand-picked for you.'}</Text>
          {genreSongs.length > 0 && (
            <View style={s.actionRow}>
              <TouchableOpacity style={s.playBtn} activeOpacity={0.85} onPress={() => play(genreSongs[0].id)}>
                <Ionicons name="play" size={17} color={C.bg} />
                <Text style={s.playTxt}>Play</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.shuffleBtn}
                activeOpacity={0.8}
                onPress={() => play(genreSongs[Math.floor(Math.random() * genreSongs.length)].id)}
              >
                <Ionicons name="shuffle" size={18} color={C.textSecondary} />
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>

        {genreArtists.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Artists</Text>
            <EdgeFadeRow>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
                {genreArtists.map(a => {
                  const avatar = resolveArtistAvatar(a.id, a.imageUri)
                  return (
                    <TouchableOpacity
                      key={a.id}
                      style={s.artistCard}
                      activeOpacity={0.85}
                      onPress={() => router.push(`/artist/${a.id}` as any)}
                    >
                      {avatar ? (
                        <Image source={avatar} style={s.artistAvatar} resizeMode="cover" />
                      ) : (
                        <View style={[s.artistAvatar, s.artistAvatarFallback]}>
                          <Ionicons name="person" size={28} color="rgba(255,255,255,0.3)" />
                        </View>
                      )}
                      <Text style={s.artistName} numberOfLines={1}>{a.name}</Text>
                    </TouchableOpacity>
                  )
                })}
              </ScrollView>
            </EdgeFadeRow>
          </View>
        )}

        <View style={s.section}>
          <Text style={s.sectionTitle}>Songs</Text>
          {genreSongs.length === 0 ? (
            <Text style={s.empty}>Nothing here yet, check back soon.</Text>
          ) : (
            genreSongs.slice(0, 25).map((song, i) => {
              const art = song.albumArtPath ? albumArtAssets[song.albumArtPath] : null
              return (
                <TouchableOpacity key={`${song.id}-${i}`} style={s.songRow} activeOpacity={0.75} onPress={() => play(song.id)}>
                  <Text style={s.songIdx}>{i + 1}</Text>
                  {art ? (
                    <Image source={art} style={s.songArt} resizeMode="cover" />
                  ) : (
                    <View style={[s.songArt, { backgroundColor: song.albumArtColor }]} />
                  )}
                  <View style={s.songInfo}>
                    <Text style={s.songTitle} numberOfLines={1}>{song.title}</Text>
                    <Text style={s.songArtist} numberOfLines={1}>{song.artistName}</Text>
                  </View>
                  <Text style={s.songDuration}>{song.duration}</Text>
                </TouchableOpacity>
              )
            })
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 16, paddingBottom: 24 },
  backBtn: { width: 36, height: 36, alignItems: 'flex-start', justifyContent: 'center', marginLeft: -6, marginBottom: 6 },
  title: { ...typeHeadline(32), color: '#fff' },
  tagline: { fontSize: 15, color: 'rgba(255,255,255,0.75)', marginTop: 6 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 18 },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 28,
    paddingVertical: 11,
    borderRadius: R.full,
    backgroundColor: C.cyan,
  },
  playTxt: { fontSize: 15, fontWeight: '700', color: C.bg },
  shuffleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },

  section: { marginTop: 20, paddingHorizontal: 16 },
  sectionTitle: { ...typeHeadline(20), color: '#fff', marginBottom: 12 },
  rail: { gap: 14 },
  artistCard: { width: 92, alignItems: 'center' },
  artistAvatar: { width: 84, height: 84, borderRadius: 42, overflow: 'hidden' },
  artistAvatarFallback: { backgroundColor: C.elevated, alignItems: 'center', justifyContent: 'center' },
  artistName: { fontSize: 12, color: C.textPrimary, marginTop: 8, textAlign: 'center' },

  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  songIdx: { width: 24, fontSize: 13, color: C.textMuted, textAlign: 'center' },
  songArt: { width: 42, height: 42, borderRadius: R.sm, overflow: 'hidden' },
  songInfo: { flex: 1, marginLeft: 12 },
  songTitle: { fontSize: 14, fontWeight: '600', color: C.textPrimary },
  songArtist: { fontSize: 12, color: C.textSecondary, marginTop: 2 },
  songDuration: { fontSize: 12, color: C.textMuted, fontVariant: ['tabular-nums'] },
  empty: { fontSize: 14, color: C.textMuted, paddingVertical: 16 },
})
