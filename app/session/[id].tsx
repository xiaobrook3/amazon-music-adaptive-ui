import { ScrollView, View, TouchableOpacity, StyleSheet } from 'react-native'
import { AppImage as Image } from '../../src/components/AppImage'
import { Text } from '../../src/components/AppText'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useSavedSessions } from '../../src/context/SavedSessionsContext'
import { usePlaybackState } from '../../src/hooks/usePlaybackState'
import { albumArtAssets } from '../../src/data/assetMap'
import type { Song } from '../../src/data/mockData'
import { C, R, typeHeadline, typeSubhead } from '../../src/theme'

const OLIVIA_ARTIST_ID = 'olivia-rodrigo'
const LOYAL_FAN_PURPLE = '#6B3FA0'

// Immersive backdrop gradients — mirror the Saved Session cards on the Music screen
const SESSION_GRADIENT = ['#0A3030', '#0E4040', '#1B5E5E', C.bg] as const
const LOYAL_FAN_GRADIENT = ['#1E1030', '#2D1A48', '#4A2D78', C.bg] as const

function SessionMosaic({ sessionSongs, size = 100 }: { sessionSongs: Song[]; size?: number }) {
  const mosaicSongs = sessionSongs.slice(0, 4)
  const cellSize = size / 2

  if (mosaicSongs.length === 0) {
    return (
      <View style={[s.mosaic, { width: size, height: size, backgroundColor: C.elevated }]}>
        <Ionicons name="bookmark" size={size * 0.32} color={C.cyan} />
      </View>
    )
  }

  return (
    <View style={[s.mosaic, { width: size, height: size }]}>
      {mosaicSongs.map((song, i) => {
        const art = song.albumArtPath ? albumArtAssets[song.albumArtPath] : null
        return (
          <View key={`${song.id}-${i}`} style={[s.mosaicCell, { width: cellSize, height: cellSize }]}>
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
            style={[s.mosaicCell, { width: cellSize, height: cellSize, backgroundColor: C.elevated }]}
          />
        ))}
    </View>
  )
}

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { sessions, playSavedSession } = useSavedSessions()
  const { playSongAt } = usePlaybackState()

  const session = sessions.find(item => item.id === id)

  if (!session) {
    return (
      <SafeAreaView style={s.screen} edges={['top']}>
        <View style={s.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="chevron-back" size={22} color={C.textPrimary} />
          </TouchableOpacity>
          <Text style={s.topTitle}>Saved Session</Text>
          <View style={s.backBtn} />
        </View>
        <View style={s.emptyState}>
          <Ionicons name="bookmark-outline" size={40} color={C.textMuted} />
          <Text style={s.emptyText}>Session not found</Text>
        </View>
      </SafeAreaView>
    )
  }

  const isLoyalFan = session.songs.some(song => song.artistId === OLIVIA_ARTIST_ID)
  const accent = isLoyalFan ? '#C4A8E8' : C.cyan
  const savedDate = session.savedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const description =
    session.description ?? 'A vibe you saved when everything was hitting just right'

  const openSong = (songId: string) => {
    playSongAt(songId)
    router.push('/now-playing')
  }

  const handlePlayAll = () => {
    playSavedSession(session, playSongAt)
    router.push('/now-playing')
  }

  const handleShuffle = () => {
    if (session.songs.length === 0) return
    const random = session.songs[Math.floor(Math.random() * session.songs.length)]
    openSong(random.id)
  }

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={s.topTitle}>Saved Session</Text>
        <View style={s.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        {/* ── HERO ── */}
        <LinearGradient
          colors={isLoyalFan ? LOYAL_FAN_GRADIENT : SESSION_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={s.hero}
        >
          <View style={[s.heroArtShadow, { shadowColor: isLoyalFan ? LOYAL_FAN_PURPLE : '#000' }]}>
            <SessionMosaic sessionSongs={session.songs} size={156} />
          </View>

          <Text style={[s.eyebrow, { color: accent }]}>
            {isLoyalFan ? 'LOYAL FAN SESSION' : 'SAVED SESSION'}
          </Text>
          <Text style={s.title}>{session.label}</Text>
          <Text style={s.description}>{description}</Text>
          <Text style={s.meta}>
            {session.songs.length} songs · saved {savedDate}
          </Text>

          <View style={s.actionRow}>
            <TouchableOpacity
              style={[s.playBtn, { backgroundColor: accent }]}
              onPress={handlePlayAll}
              activeOpacity={0.85}
            >
              <Ionicons name="play" size={17} color={C.bg} />
              <Text style={s.playTxt}>Play</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.shuffleBtn} onPress={handleShuffle} activeOpacity={0.8}>
              <Ionicons name="shuffle" size={18} color={C.textSecondary} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* ── TRACKS ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Tracks</Text>
          {session.songs.map((song, i) => {
            const art = song.albumArtPath ? albumArtAssets[song.albumArtPath] : null
            return (
              <TouchableOpacity
                key={song.id}
                onPress={() => openSong(song.id)}
                style={s.songRow}
                activeOpacity={0.75}
              >
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
                <Text style={s.songDur}>{song.duration}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontSize: 16, fontWeight: '700', color: C.textPrimary },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { fontSize: 15, color: C.textSecondary },

  hero: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 28,
    marginBottom: 8,
  },
  heroArtShadow: {
    borderRadius: 20,
    shadowOpacity: 0.5,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
    marginBottom: 20,
  },
  mosaic: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mosaicCell: { overflow: 'hidden' },

  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 8 },
  title: { ...typeHeadline(26), color: C.textPrimary, textAlign: 'center' },
  description: {
    fontSize: 14,
    color: C.textSecondary,
    marginTop: 10,
    lineHeight: 20,
    textAlign: 'center',
  },
  meta: { fontSize: 12, color: C.textMuted, marginTop: 10 },

  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 20 },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 28,
    paddingVertical: 11,
    borderRadius: R.full,
  },
  playTxt: { ...typeSubhead(15), color: C.bg },
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

  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { ...typeHeadline(18), color: C.textPrimary, marginBottom: 12 },
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
  songDur: { fontSize: 12, color: C.textMuted, marginLeft: 8 },
})
