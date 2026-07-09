import { ScrollView, View, TouchableOpacity, StyleSheet, Image, Share } from 'react-native'
import { AppImage } from '../../src/components/AppImage'
import { Text } from '../../src/components/AppText'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { playlists, songs } from '../../src/data/mockData'
import { usePlaybackState } from '../../src/hooks/usePlaybackState'
import { useAdaptiveMenu } from '../../src/components/AdaptiveContextMenu'
import { albumArtAssets, playerIconAssets, logoAssets } from '../../src/data/assetMap'
import { hexWithAlpha } from '../../src/utils/color'
import { C, R, typeHeadline, typeSubhead } from '../../src/theme'

export default function SharedPlaylistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { playSongAt } = usePlaybackState()
  const { open: openAdaptiveMenu } = useAdaptiveMenu()

  const playlist = playlists.find(p => p.id === id) ?? playlists[0]
  // Curated track list when the playlist defines one; legacy catalog slice otherwise.
  const playlistSongs = playlist.songIds
    ? playlist.songIds
        .map(sid => songs.find(sg => sg.id === sid))
        .filter((sg): sg is typeof songs[0] => sg != null)
    : songs.slice(0, playlist.songCount)

  const handleShare = () => {
    Share.share({
      message: `Listen to "${playlist.name}" on Amazon Music`,
    }).catch(() => {})
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
    if (playlistSongs.length === 0) return
    const random = playlistSongs[Math.floor(Math.random() * playlistSongs.length)]
    play(random.id)
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      {/* Back */}
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={s.topTitle}>Playlist</Text>
        <TouchableOpacity style={s.backBtn} accessibilityLabel="Share" onPress={handleShare}>
          <Image source={playerIconAssets.share} style={s.shareIcon} resizeMode="contain" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        {/* ── HERO ── */}
        <LinearGradient
          colors={[hexWithAlpha(tint, 0.55), hexWithAlpha(tint, 0.20), C.bg]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={s.hero}
        >
          <View style={s.coverShadow}>
            {coverArt ? (
              <AppImage source={coverArt} style={s.cover} resizeMode="cover" />
            ) : (
              <View style={[s.cover, { backgroundColor: C.elevated, alignItems: 'center', justifyContent: 'center' }]}>
                <Ionicons name="musical-notes" size={44} color="rgba(255,255,255,0.2)" />
              </View>
            )}
          </View>

          <Text style={s.eyebrow}>PLAYLIST</Text>
          <Text style={s.playlistName}>{playlist.name}</Text>
          {byline && (
            <View style={s.bylineRow}>
              {playlist.curatorType === 'amazon' && (
                <Image source={logoAssets.amIcon} style={s.amIcon} resizeMode="contain" />
              )}
              <Text style={s.playlistBy}>{byline}</Text>
            </View>
          )}
          <Text style={s.playlistMeta}>
            {playlistSongs.length} songs · {playlist.totalDuration}
          </Text>

          <View style={s.actionRow}>
            <TouchableOpacity
              style={s.playBtn}
              onPress={() => playlistSongs[0] && play(playlistSongs[0].id)}
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
          {playlistSongs.map((song, i) => {
            const art = song.albumArtPath ? albumArtAssets[song.albumArtPath] : null
            return (
              <TouchableOpacity key={song.id} onPress={() => play(song.id)} style={s.songRow} activeOpacity={0.75}>
                <Text style={s.songIdx}>{i + 1}</Text>
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
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  onPress={() => openAdaptiveMenu({ kind: 'song', song })}
                >
                  <Ionicons name="ellipsis-horizontal" size={16} color={C.textMuted} />
                </TouchableOpacity>
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  shareIcon: { width: 20, height: 20, opacity: 0.67 },
  topTitle: { fontSize: 16, fontWeight: '700', color: C.textPrimary },

  hero: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 28,
    marginBottom: 8,
  },
  coverShadow: {
    borderRadius: R.md,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
    marginBottom: 20,
  },
  cover: { width: 156, height: 156, borderRadius: R.md, overflow: 'hidden' },

  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 2, color: C.cyan, marginBottom: 8 },
  playlistName: { ...typeHeadline(26), color: C.textPrimary, textAlign: 'center' },
  bylineRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  amIcon: { width: 16, height: 16 },
  playlistBy: { fontSize: 13, color: C.textSecondary, fontWeight: '600' },
  playlistMeta: { fontSize: 12, color: C.textMuted, marginTop: 8 },

  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 20 },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 28,
    paddingVertical: 11,
    borderRadius: R.full,
    backgroundColor: C.cyan,
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
})
