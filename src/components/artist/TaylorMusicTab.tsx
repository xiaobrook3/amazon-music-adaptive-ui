import { useState, useMemo } from 'react'
import { View, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '../AppText'
import { AppImage as Image } from '../AppImage'
import { EdgeFadeRow } from '../EdgeFadeRow'
import { songs as allSongs, artists, playlists, type Song } from '../../data/mockData'
import { albumArtAssets, artistAssets } from '../../data/assetMap'
import {
  TAYLOR_TOP_ALBUMS,
  TAYLOR_RELATED_PLAYLISTS,
  TAYLOR_DISCOGRAPHY,
  type TaylorDiscographyRelease,
} from '../../data/taylorSwiftPage'
import { TAYLOR_PODCASTS } from '../../data/taylorSuperFanContent'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useLikedSongs } from '../../context/LikedSongsContext'
import { C } from '../../theme'

const SCREEN_W = Dimensions.get('window').width
const GREY = '#a6a6a6'
const POP_SONGS_PER_PAGE = 3
const POP_PAGE_PEEK = Math.round(SCREEN_W * 0.3)
const POP_PAGE_WIDTH = SCREEN_W - POP_PAGE_PEEK

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

function resolveArt(key?: string) {
  if (!key) return albumArtAssets['tswift-1'] ?? artistAssets['tswift'] ?? null
  return albumArtAssets[key] ?? artistAssets[key] ?? albumArtAssets['tswift-1'] ?? null
}

const STREAMS = [142_456_789, 98_345_678, 76_234_567, 54_987_654, 43_456_789, 32_234_567, 28_765_432, 19_543_210, 14_321_098, 9_876_543]
const PLAYS = [34, 31, 28, 22, 18, 14]

function fmtStreams(n: number): string {
  return n.toLocaleString('en-US')
}

function byIds(ids: string[]): Song[] {
  return ids.map(id => allSongs.find(sg => sg.id === id)).filter((sg): sg is Song => sg != null)
}

function SectionHead({ title, sub, seeMore = true, onSeeMore }: { title: string; sub?: string; seeMore?: boolean; onSeeMore?: () => void }) {
  return (
    <View style={s.head}>
      <View style={{ flex: 1 }}>
        <Text style={s.headTitle}>{title}</Text>
        {sub ? <Text style={s.headSub}>{sub}</Text> : null}
      </View>
      {seeMore && (
        <TouchableOpacity onPress={onSeeMore} hitSlop={8}>
          <Text style={s.seeMore}>See more</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

function SongRow({ song, rank, onPlay }: { song: Song; rank?: number; onPlay: () => void }) {
  const { likedSongIds, toggleLike } = useLikedSongs()
  const liked = likedSongIds.has(song.id)
  return (
    <TouchableOpacity style={s.songRow} onPress={onPlay} activeOpacity={0.7}>
      {rank != null && <Text style={s.rank}>{rank}</Text>}
      <Image source={resolveArt(song.albumArtPath)} style={s.songThumb} />
      <View style={s.songMeta}>
        <Text style={s.songTitle} numberOfLines={1}>{song.title}</Text>
        <Text style={s.songSub} numberOfLines={1}>
          {rank != null ? `${fmtStreams(STREAMS[rank - 1] ?? 1_000_000)}` : song.album}
        </Text>
      </View>
      <TouchableOpacity onPress={() => toggleLike(song.id)} hitSlop={8} style={s.heartBtn}>
        <Ionicons name={liked ? 'heart' : 'heart-outline'} size={18} color={liked ? C.cyan : GREY} />
      </TouchableOpacity>
      <TouchableOpacity hitSlop={8}>
        <Ionicons name="ellipsis-horizontal" size={18} color={GREY} />
      </TouchableOpacity>
    </TouchableOpacity>
  )
}

function AlbumCard({ title, subtitle, artKey, onPress }: { title: string; subtitle: string; artKey: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={s.albumCard} onPress={onPress} activeOpacity={0.8}>
      <Image source={resolveArt(artKey)} style={s.albumArt} />
      <Text style={s.albumTitle} numberOfLines={2}>{title}</Text>
      <Text style={s.albumSub} numberOfLines={1}>{subtitle}</Text>
    </TouchableOpacity>
  )
}

function DiscographySection({ releases }: { releases: TaylorDiscographyRelease[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const sorted = [...releases].sort((a, b) => b.year - a.year)

  const BADGE_COLORS: Record<string, string> = {
    album: '#1a3a5c',
    deluxe: '#3a1a5c',
    single: '#1a3a2a',
    ep: '#3a2a1a',
    live: '#3a1a2a',
  }

  return (
    <View style={s.discography}>
      {sorted.map(rel => (
        <View key={rel.id}>
          <TouchableOpacity
            style={s.discRow}
            onPress={() => setExpanded(expanded === rel.id ? null : rel.id)}
            activeOpacity={0.8}
          >
            <Image source={resolveArt(rel.artKey)} style={s.discArt} />
            <View style={s.discMeta}>
              <Text style={s.discTitle} numberOfLines={2}>{rel.title}</Text>
              <View style={s.discBadgeRow}>
                <View style={[s.discBadge, { backgroundColor: BADGE_COLORS[rel.type] ?? '#1a1a2a' }]}>
                  <Text style={s.discBadgeText}>{rel.type.toUpperCase()}</Text>
                </View>
                <Text style={s.discYear}>{rel.year}</Text>
              </View>
            </View>
            <Ionicons
              name={expanded === rel.id ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={GREY}
            />
          </TouchableOpacity>

          {expanded === rel.id && rel.tracks && (
            <View style={s.trackList}>
              {rel.tracks.map((t, i) => (
                <TouchableOpacity key={i} style={s.trackRow} activeOpacity={0.7}>
                  <Text style={s.trackNum}>{i + 1}</Text>
                  <Text style={s.trackTitle} numberOfLines={1}>{t.title}</Text>
                  <Text style={s.trackDur}>{t.duration}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      ))}
    </View>
  )
}

export default function TaylorMusicTab({ onPlay }: { onPlay: (songId?: string) => void }) {
  const router = useRouter()
  const [showAllPop, setShowAllPop] = useState(false)
  const [favToggle, setFavToggle] = useState<'top' | 'all'>('top')

  const taylorSongs = useMemo(
    () => allSongs.filter(sg => sg.artistId === 'tswift'),
    [],
  )

  // Popular songs, ranked by position in taylorSongs array (order = editorial rank)
  const popularSongs = useMemo(() => taylorSongs.slice(0, showAllPop ? 20 : 10), [taylorSongs, showAllPop])
  const popPages = useMemo(() => chunk(popularSongs.slice(0, 9), POP_SONGS_PER_PAGE), [popularSongs])

  // Favorites — top 6 vs all
  const favSongs = useMemo(
    () => (favToggle === 'top' ? taylorSongs.slice(0, 6) : taylorSongs.slice(0, 15)),
    [taylorSongs, favToggle],
  )

  // New album banner songs (The Life of a Showgirl)
  const showgirlSongs = useMemo(
    () => taylorSongs.filter(sg => sg.album === 'The Life of a Showgirl').slice(0, 4),
    [taylorSongs],
  )

  // "Since your last visit" — folklore / evermore era songs
  const sinceVisitSongs = useMemo(
    () => taylorSongs.filter(sg => sg.album === 'folklore' || sg.album === 'evermore').slice(0, 5),
    [taylorSongs],
  )

  // Related artists
  const relatedArtists = useMemo(() => {
    const ids = ['olivia-rodrigo', 'sabrina-carpenter', 'lorde', 'katy-perry', 'ariana-grande']
    return ids
      .map(id => artists.find(a => a.id === id))
      .filter(Boolean) as typeof artists
  }, [])

  return (
    <View style={s.root}>
      {/* ── New album banner ────────────────────────────────────────────── */}
      <View style={s.newAlbumBanner}>
        <Image source={resolveArt('ts-showgirl-life')} style={s.newAlbumArt} />
        <LinearGradient
          colors={['rgba(74,16,128,0)', 'rgba(74,16,128,0.92)']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={s.newAlbumInfo}>
          <Text style={s.newAlbumTag}>NEW ALBUM</Text>
          <Text style={s.newAlbumTitle} numberOfLines={2}>The Life of a Showgirl</Text>
          <TouchableOpacity style={s.newAlbumBtn} onPress={() => onPlay()}>
            <Ionicons name="play" size={14} color="#000" />
            <Text style={s.newAlbumBtnText}>Play</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Since your last visit ───────────────────────────────────────── */}
      {sinceVisitSongs.length > 0 && (
        <View style={s.section}>
          <SectionHead title="Since Your Last Visit" sub="folklore · evermore era" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.sinceScroll}
            contentContainerStyle={s.sinceRow}>
            {sinceVisitSongs.map((sg, i) => (
              <TouchableOpacity
                key={sg.id}
                style={[s.sinceCard, { transform: [{ rotate: `${i % 2 === 0 ? '4.5' : '-5'}deg` }] }]}
                onPress={() => onPlay(sg.id)}
                activeOpacity={0.8}
              >
                <Image source={resolveArt(sg.albumArtPath)} style={s.sinceArt} />
                <Text style={s.sinceTitle} numberOfLines={2}>{sg.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* ── Your Favorites ──────────────────────────────────────────────── */}
      <View style={s.section}>
        <SectionHead title="Your Favorites" seeMore={false} />
        <View style={s.toggleRow}>
          {(['top', 'all'] as const).map(opt => (
            <TouchableOpacity
              key={opt}
              style={[s.toggleBtn, favToggle === opt && s.toggleBtnActive]}
              onPress={() => setFavToggle(opt)}
            >
              <Text style={[s.toggleBtnText, favToggle === opt && s.toggleBtnTextActive]}>
                {opt === 'top' ? 'Top Picks' : 'All Time'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {favSongs.map((sg, i) => (
          <SongRow key={sg.id} song={sg} rank={i + 1} onPlay={() => onPlay(sg.id)} />
        ))}
      </View>

      {/* ── Top Albums ──────────────────────────────────────────────────── */}
      <View style={s.section}>
        <SectionHead title="Albums" />
        <EdgeFadeRow>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }} nestedScrollEnabled>
          {TAYLOR_TOP_ALBUMS.map(a => (
            <AlbumCard key={a.id} title={a.title} subtitle={a.subtitle} artKey={a.artKey} />
          ))}
          </ScrollView>
        </EdgeFadeRow>
      </View>

      {/* ── Popular (paged) ─────────────────────────────────────────────── */}
      <View style={s.section}>
        <SectionHead
          title="Popular"
          sub="Streams this month"
          onSeeMore={() => setShowAllPop(v => !v)}
        />
        <ScrollView
          horizontal
          pagingEnabled
          snapToInterval={POP_PAGE_WIDTH}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: POP_PAGE_PEEK }}
        >
          {popPages.map((page, pi) => (
            <View key={pi} style={[s.popPage, { width: POP_PAGE_WIDTH }]}>
              {page.map((sg, i) => (
                <SongRow key={sg.id} song={sg} rank={pi * POP_SONGS_PER_PAGE + i + 1} onPlay={() => onPlay(sg.id)} />
              ))}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* ── Discography ─────────────────────────────────────────────────── */}
      <View style={s.section}>
        <SectionHead title="Discography" seeMore={false} />
        <DiscographySection releases={TAYLOR_DISCOGRAPHY} />
      </View>

      {/* ── Related Playlists ───────────────────────────────────────────── */}
      <View style={s.section}>
        <SectionHead title="Related Playlists" />
        <EdgeFadeRow>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }} nestedScrollEnabled>
          {TAYLOR_RELATED_PLAYLISTS.map(pl => (
            <TouchableOpacity key={pl.id} style={s.playlistCard} activeOpacity={0.8}>
              <Image source={resolveArt(pl.artKey)} style={s.playlistArt} />
              <Text style={s.playlistName} numberOfLines={2}>{pl.name}</Text>
              <Text style={s.playlistSub} numberOfLines={1}>{pl.sub}</Text>
            </TouchableOpacity>
          ))}
          </ScrollView>
        </EdgeFadeRow>
      </View>

      {/* ── Podcasts about Taylor ───────────────────────────────────────── */}
      <View style={s.section}>
        <SectionHead title="Podcasts About Taylor" />
        {TAYLOR_PODCASTS.map(pod => (
          <TouchableOpacity key={pod.id} style={s.podRow} activeOpacity={0.8}>
            <View style={[s.podThumb, { backgroundColor: pod.coverColor }]}>
              <Image source={resolveArt(pod.coverArtPath)} style={StyleSheet.absoluteFill} />
            </View>
            <View style={s.podMeta}>
              <Text style={s.podTitle} numberOfLines={2}>{pod.title}</Text>
              <Text style={s.podHost} numberOfLines={1}>{pod.host}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={GREY} />
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Related Artists ─────────────────────────────────────────────── */}
      <View style={s.section}>
        <SectionHead title="Fans Also Like" />
        <EdgeFadeRow>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }} nestedScrollEnabled>
          {relatedArtists.map(a => (
            <TouchableOpacity
              key={a.id}
              style={s.relArtistCard}
              onPress={() => router.push(`/artist/${a.id}`)}
              activeOpacity={0.8}
            >
              <Image source={resolveArt(a.imageUri ?? a.id)} style={s.relArtistArt} />
              <Text style={s.relArtistName} numberOfLines={2}>{a.name}</Text>
            </TouchableOpacity>
          ))}
          </ScrollView>
        </EdgeFadeRow>
      </View>
    </View>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const CARD_W = 120
const DISC_ART = 52

const s = StyleSheet.create({
  root: { flex: 1 },

  // New album banner
  newAlbumBanner: { height: 130, marginHorizontal: 16, marginBottom: 8, borderRadius: 12, overflow: 'hidden', flexDirection: 'row', alignItems: 'center' },
  newAlbumArt: { width: '100%', height: '100%', position: 'absolute' },
  newAlbumInfo: { flex: 1, padding: 14, justifyContent: 'center', alignItems: 'flex-end' },
  newAlbumTag: { fontSize: 10, fontWeight: '700', color: C.cyan, letterSpacing: 1, marginBottom: 2 },
  newAlbumTitle: { fontSize: 15, fontWeight: '800', color: '#fff', textAlign: 'right', marginBottom: 8 },
  newAlbumBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  newAlbumBtnText: { fontSize: 13, fontWeight: '700', color: '#000' },

  // Sections
  section: { marginTop: 28, paddingHorizontal: 16 },
  head: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 },
  headTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  headSub: { fontSize: 12, color: GREY, marginTop: 2 },
  seeMore: { fontSize: 12, color: C.cyan },

  // Since your last visit
  sinceScroll: { overflow: 'visible' },
  sinceRow: { gap: 12, paddingVertical: 10 },
  sinceCard: { width: 90, alignItems: 'center' },
  sinceArt: { width: 82, height: 82, borderRadius: 8 },
  sinceTitle: { fontSize: 11, color: '#ccc', textAlign: 'center', marginTop: 6 },

  // Toggle
  toggleRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  toggleBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#333' },
  toggleBtnActive: { backgroundColor: C.cyan, borderColor: C.cyan },
  toggleBtnText: { fontSize: 13, color: GREY },
  toggleBtnTextActive: { color: '#000', fontWeight: '700' },

  // Song rows
  songRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  rank: { width: 18, fontSize: 13, color: GREY, textAlign: 'right' },
  songThumb: { width: 44, height: 44, borderRadius: 4 },
  songMeta: { flex: 1 },
  songTitle: { fontSize: 14, color: '#fff', fontWeight: '500' },
  songSub: { fontSize: 12, color: GREY, marginTop: 2 },
  heartBtn: { marginRight: 4 },

  // Albums
  albumCard: { width: CARD_W, marginRight: 12 },
  albumArt: { width: CARD_W, height: CARD_W, borderRadius: 6 },
  albumTitle: { fontSize: 12, color: '#fff', fontWeight: '600', marginTop: 6 },
  albumSub: { fontSize: 11, color: GREY, marginTop: 2 },

  // Popular pages
  popPage: { paddingRight: 12 },

  // Discography
  discography: { gap: 0 },
  discRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#222' },
  discArt: { width: DISC_ART, height: DISC_ART, borderRadius: 4 },
  discMeta: { flex: 1 },
  discTitle: { fontSize: 13, color: '#fff', fontWeight: '600' },
  discBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  discBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  discBadgeText: { fontSize: 9, color: '#aaa', fontWeight: '700', letterSpacing: 0.5 },
  discYear: { fontSize: 11, color: GREY },
  trackList: { backgroundColor: '#0e0e0e', paddingHorizontal: 12, paddingVertical: 4 },
  trackRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  trackNum: { width: 20, fontSize: 12, color: '#555', textAlign: 'right' },
  trackTitle: { flex: 1, fontSize: 13, color: '#ccc' },
  trackDur: { fontSize: 12, color: GREY },

  // Playlists
  playlistCard: { width: CARD_W, marginRight: 12 },
  playlistArt: { width: CARD_W, height: CARD_W, borderRadius: 6 },
  playlistName: { fontSize: 12, color: '#fff', fontWeight: '600', marginTop: 6 },
  playlistSub: { fontSize: 11, color: GREY, marginTop: 2 },

  // Podcasts
  podRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#1a1a1a' },
  podThumb: { width: 52, height: 52, borderRadius: 8, overflow: 'hidden' },
  podMeta: { flex: 1 },
  podTitle: { fontSize: 14, color: '#fff', fontWeight: '500' },
  podHost: { fontSize: 12, color: GREY, marginTop: 2 },

  // Related artists
  relArtistCard: { width: CARD_W, marginRight: 12, alignItems: 'center' },
  relArtistArt: { width: CARD_W, height: CARD_W, borderRadius: CARD_W / 2 },
  relArtistName: { fontSize: 12, color: '#fff', textAlign: 'center', marginTop: 6 },
})
