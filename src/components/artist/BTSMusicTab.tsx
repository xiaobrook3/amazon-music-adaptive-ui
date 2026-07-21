import { useState, useMemo } from 'react'
import { View, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { Text } from '../AppText'
import { AppImage as Image } from '../AppImage'
import { EdgeFadeRow } from '../EdgeFadeRow'
import { songs as allSongs, artists, type Song } from '../../data/mockData'
import { albumArtAssets, artistAssets } from '../../data/assetMap'
import {
  BTS_TOP_ALBUMS,
  BTS_RELATED_PLAYLISTS,
  BTS_DISCOGRAPHY,
  type BtsDiscographyRelease,
} from '../../data/btsPage'
import { BTS_PODCASTS } from '../../data/btsSuperFanContent'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useLikedSongs } from '../../context/LikedSongsContext'
import { useAdaptiveUI } from '../../context/AdaptiveUIContext'
import { useHannahJourney } from '../../context/HannahJourneyContext'
import { C, typeHeadline } from '../../theme'

const SCREEN_W = Platform.OS === 'web' ? Math.min(Dimensions.get('window').width, 402) : Dimensions.get('window').width
const GREY = '#a6a6a6'
const POP_SONGS_PER_PAGE = 3
const POP_PAGE_PEEK = Math.round(SCREEN_W * 0.3)
const POP_PAGE_WIDTH = SCREEN_W - POP_PAGE_PEEK
const DISCOGRAPHY_PREVIEW_COUNT = 5
// Same tilt sequence as Olivia's / Taylor's "Since Your Last Visit" overlapping fan of cards.
const UPDATE_TILTS = ['0deg', '4.5deg', '-7deg', '3.28deg']

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

function resolveArt(key?: string) {
  if (!key) return albumArtAssets['bts-proof-door'] ?? artistAssets['bts'] ?? null
  return albumArtAssets[key] ?? artistAssets[key] ?? albumArtAssets['bts-proof-door'] ?? null
}

const STREAMS = [128_456_789, 94_345_678, 71_234_567, 52_987_654, 41_456_789, 30_234_567, 26_765_432, 18_543_210, 13_321_098, 8_876_543]

function fmtStreams(n: number): string {
  return n.toLocaleString('en-US')
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

function RowIcons({ song, light }: { song: Song; light?: boolean }) {
  const { likedSongIds, toggleLike } = useLikedSongs()
  const liked = likedSongIds.has(song.id)
  return (
    <View style={s.rowIcons}>
      <TouchableOpacity onPress={() => toggleLike(song.id)} hitSlop={8}>
        <Ionicons name={liked ? 'heart' : 'heart-outline'} size={20} color={liked ? (light ? '#fff' : C.cyan) : '#fff'} />
      </TouchableOpacity>
      <TouchableOpacity hitSlop={8}>
        <Ionicons name="ellipsis-horizontal" size={18} color={GREY} />
      </TouchableOpacity>
    </View>
  )
}

function darkenHex(hex: string, factor: number): string {
  const h = hex.replace('#', '')
  const r = Math.round(parseInt(h.slice(0, 2), 16) * factor)
  const g = Math.round(parseInt(h.slice(2, 4), 16) * factor)
  const b = Math.round(parseInt(h.slice(4, 6), 16) * factor)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
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

function DiscographySection({
  releases,
  onExploreAll,
}: {
  releases: BtsDiscographyRelease[]
  onExploreAll: () => void
}) {
  const router = useRouter()
  const sorted = [...releases].sort((a, b) => b.year - a.year)
  const visible = sorted.slice(0, DISCOGRAPHY_PREVIEW_COUNT)

  return (
    <View style={s.discography}>
      {visible.map(rel => (
        <TouchableOpacity
          key={rel.id}
          style={s.discRow}
          onPress={() => router.push(`/album/${rel.id}` as any)}
          activeOpacity={0.8}
        >
          <Image source={resolveArt(rel.artKey)} style={s.discArt} />
          <View style={s.discMeta}>
            <Text style={s.discBadgeText}>{rel.type.toUpperCase()}</Text>
            <Text style={s.discTitle} numberOfLines={2}>{rel.title}</Text>
            <Text style={s.discYear}>{rel.year}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={GREY} />
        </TouchableOpacity>
      ))}

      {sorted.length > DISCOGRAPHY_PREVIEW_COUNT && (
        <TouchableOpacity style={s.exploreDiscographyBtn} onPress={onExploreAll} activeOpacity={0.8}>
          <Text style={s.exploreDiscographyText}>Explore Full Discography</Text>
          <Ionicons name="chevron-forward" size={14} color={C.cyan} />
        </TouchableOpacity>
      )}
    </View>
  )
}

export default function BTSMusicTab({ onPlay }: { onPlay: (songId?: string) => void }) {
  const router = useRouter()
  const { showConfirmation } = useAdaptiveUI()
  // Hannah's Journey has no scripted BTS discography arc (only Olivia does) —
  // per Olivia's own Hannah-Journey superfan Music tab (the canonical design
  // for what an artist page should look like on her journey), there is no
  // standalone "Discography" section and no "Explore Full Discography" CTA.
  // Every other persona (e.g. Erica, BTS's real superfan) keeps both, unchanged.
  const { isHannahJourney } = useHannahJourney()
  const [favToggle, setFavToggle] = useState<'top' | 'hidden'>('top')

  const btsSongs = useMemo(
    () => allSongs.filter(sg => sg.artistId === 'bts'),
    [],
  )

  // Popular songs, ranked by position in btsSongs array (order = editorial rank)
  const popularSongs = useMemo(() => btsSongs.slice(0, 10), [btsSongs])
  const popPages = useMemo(() => chunk(popularSongs.slice(0, 9), POP_SONGS_PER_PAGE), [popularSongs])
  const popularSnapOffsets = useMemo(() => popPages.map((_, i) => i * POP_PAGE_WIDTH), [popPages])

  // Favorites — Top (your most-played) vs Forgotten (deep cuts past the
  // Popular rail) — same "Your Favorites" pattern as Olivia's superfan page:
  // 3 rows, no rank numbers, capped by a "Play Your Mix" button.
  const favSongs = useMemo(
    () => (favToggle === 'top' ? btsSongs.slice(0, 3) : btsSongs.slice(6, 9)),
    [btsSongs, favToggle],
  )

  // "Since your last visit" — same overlapping tilted-card news fan as Olivia's/Taylor's tab
  const updates = [
    { t: 'Proof', sub: 'Anthology album out now', k: 'bts-proof', onPress: () => onPlay() },
    { t: 'World Tour 2026', sub: 'New tour dates just announced', k: 'bts-proof-door', onPress: () => showConfirmation('Tour dates are on the Events tab') },
    { t: 'HYBE', sub: 'New brand partner', k: 'bts-be', onPress: () => showConfirmation('Opens the partner shop') },
    { t: 'Yet To Come in Busan', sub: 'Concert film returns to theaters', k: 'bts-map-of-soul-7', onPress: () => showConfirmation('Opens in Prime Video') },
  ]

  // Related artists
  const relatedArtists = useMemo(() => {
    const ids = ['blackpink', 'twice', 'newjeans', 'stray-kids', 'jungkook']
    return ids
      .map(id => artists.find(a => a.id === id))
      .filter(Boolean) as typeof artists
  }, [])

  return (
    <View style={s.root}>
      {/* ── New album banner — same design as Olivia's/Taylor's tab ───────── */}
      <View style={s.pad}>
        <TouchableOpacity style={s.newAlbumCard} activeOpacity={0.88} onPress={() => onPlay()}>
          <Image source={resolveArt('bts-proof-door')} style={StyleSheet.absoluteFill} resizeMode="cover" blurRadius={12} />
          <View style={s.newAlbumScrim} />
          <View style={s.newAlbumRow}>
            <Image source={resolveArt('bts-proof-door')} style={s.newAlbumCover} resizeMode="cover" />
            <View style={{ flex: 1 }}>
              <Text style={s.newAlbumEyebrow}>NEW ALBUM</Text>
              <Text style={s.newAlbumTitle} numberOfLines={2}>Proof</Text>
              <Text style={s.newAlbumSub} numberOfLines={1}>BTS's anthology album, out now</Text>
            </View>
          </View>
          <TouchableOpacity hitSlop={8} onPress={() => showConfirmation('Opens the album page')} style={s.newAlbumMore}>
            <Ionicons name="ellipsis-horizontal" size={16} color="#fff" />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      {/* ── Since your last visit — overlapping tilted-card fan, same design as Olivia's/Taylor's tab ── */}
      <View style={s.section}>
        <SectionHead title="Since Your Last Visit" sub="Catching you up on BTS" />
        <EdgeFadeRow>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.updateRail} nestedScrollEnabled>
            {updates.map((u, i) => (
              <View
                key={u.t}
                style={{ marginRight: i < updates.length - 1 ? -32 : 0, zIndex: i + 1 }}
              >
                <TouchableOpacity
                  style={[s.updateCard, { transform: [{ rotate: UPDATE_TILTS[i % UPDATE_TILTS.length] }] }]}
                  activeOpacity={0.88}
                  onPress={u.onPress}
                >
                  <Image source={resolveArt(u.k)} style={StyleSheet.absoluteFill} resizeMode="cover" />
                  <LinearGradient colors={['rgba(0,0,0,0)', '#020202']} locations={[0.3, 1]} style={StyleSheet.absoluteFill} />
                  <View style={s.artBorderOverlay} pointerEvents="none" />
                  <Ionicons name="ellipsis-horizontal" size={16} color="#fff" style={s.updateMore} />
                  <View style={s.updateFooter}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.updateTitle} numberOfLines={1}>{u.t}</Text>
                      <Text style={s.updateSub} numberOfLines={1}>{u.sub}</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={18} color="#fff" />
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </EdgeFadeRow>
      </View>

      {/* ── Top Songs — same paged 3-per-page snap layout as Olivia's tab ── */}
      <View style={[s.section, s.popularSection]}>
        <SectionHead title="Top Songs" seeMore={false} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="normal"
          snapToOffsets={popularSnapOffsets}
          snapToAlignment="start"
          contentContainerStyle={[s.popScrollContent, { paddingRight: POP_PAGE_PEEK }]}
        >
          {popPages.map((page, pi) => (
            <View key={pi} style={[s.popPage, { width: POP_PAGE_WIDTH }]}>
              {page.map((sg, i) => {
                const globalIdx = pi * POP_SONGS_PER_PAGE + i
                return (
                  <TouchableOpacity key={sg.id} style={s.popRow} activeOpacity={0.8} onPress={() => onPlay(sg.id)}>
                    <Image source={resolveArt(sg.albumArtPath)} style={s.popThumb} resizeMode="cover" />
                    <View style={{ flex: 1 }}>
                      <Text style={s.popTitle} numberOfLines={1}>{globalIdx + 1}. {sg.title}</Text>
                      <Text style={s.popMeta} numberOfLines={1}>BTS • {fmtStreams(STREAMS[globalIdx] ?? 100000)}</Text>
                    </View>
                    <RowIcons song={sg} />
                  </TouchableOpacity>
                )
              })}
            </View>
          ))}
        </ScrollView>
        {!isHannahJourney && (
          <TouchableOpacity
            style={[s.discographyLink, s.pad]}
            activeOpacity={0.7}
            onPress={() => router.push('/artist-discography/bts' as any)}
          >
            <Text style={s.discographyLinkText}>Explore full discography</Text>
            <Ionicons name="chevron-forward" size={14} color={C.cyan} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Your Favorites — same gradient-card rows as Olivia's superfan tab:
          3 rows, no rank numbers, capped by a "Play Your Mix" button ────── */}
      <View style={s.section}>
        <View style={s.pad}><Text style={s.headTitle}>Your Favorites</Text></View>
        <View style={[s.toggleRow, s.pad, { marginTop: 12 }]}>
          {(['top', 'hidden'] as const).map(opt => (
            <TouchableOpacity
              key={opt}
              style={[s.toggleBtn, favToggle === opt && s.toggleBtnActive]}
              onPress={() => setFavToggle(opt)}
            >
              <Text style={[s.toggleBtnText, favToggle === opt && s.toggleBtnTextActive]} numberOfLines={1}>
                {opt === 'top' ? 'Top Favorites' : 'Forgotten Favorites'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[s.pad, { marginTop: 12, gap: 12 }]}>
          {favSongs.map((sg, i) => {
            const plays = [34, 31, 28][i] ?? 12
            return (
              <TouchableOpacity key={sg.id} activeOpacity={0.85} onPress={() => onPlay(sg.id)}>
                <View style={s.favRow}>
                  <LinearGradient
                    colors={[sg.albumArtColor, darkenHex(sg.albumArtColor, 0.35)]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <LinearGradient
                    colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.35)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <Image source={resolveArt(sg.albumArtPath)} style={s.favCover} resizeMode="cover" />
                  <View style={{ flex: 1 }}>
                    <Text style={s.favTitle} numberOfLines={1}>{sg.title}</Text>
                    <Text style={s.favPlays}>{plays} plays</Text>
                  </View>
                  <RowIcons song={sg} light />
                </View>
              </TouchableOpacity>
            )
          })}
        </View>

        <View style={s.pad}>
          <TouchableOpacity
            style={s.mixBtnOutline}
            activeOpacity={0.85}
            onPress={() => favSongs[0] && onPlay(favSongs[0].id)}
          >
            <Text style={s.mixBtnOutlineText}>Play Your Mix</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Albums ───────────────────────────────────────────────────────── */}
      <View style={s.section}>
        <SectionHead title="Top Albums" />
        <EdgeFadeRow>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }} nestedScrollEnabled>
          {BTS_TOP_ALBUMS.map(a => (
            <AlbumCard
              key={a.id}
              title={a.title}
              subtitle={a.subtitle}
              artKey={a.artKey}
              onPress={() => router.push(`/album/${a.id}` as any)}
            />
          ))}
          </ScrollView>
        </EdgeFadeRow>
      </View>

      {/* ── Discography — no equivalent on Olivia's Hannah-Journey superfan
          Music tab (verified: that branch has no standalone "Discography"
          section or "Explore Full Discography" CTA), so it's hidden for
          Hannah's Journey. Every other persona keeps it unchanged. ───────── */}
      {!isHannahJourney && (
        <View style={s.section}>
          <SectionHead title="Discography" seeMore={false} />
          <DiscographySection
            releases={BTS_DISCOGRAPHY}
            onExploreAll={() => router.push('/artist-discography/bts' as any)}
          />
        </View>
      )}

      {/* ── Related Playlists ───────────────────────────────────────────── */}
      <View style={s.section}>
        <SectionHead title="Related Playlists" seeMore={false} />
        <EdgeFadeRow>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }} nestedScrollEnabled>
          {BTS_RELATED_PLAYLISTS.map(pl => (
            <TouchableOpacity key={pl.id} style={s.albumCard} activeOpacity={0.85} onPress={() => router.push(`/playlist/${pl.id}` as any)}>
              <Image source={resolveArt(pl.artKey)} style={s.albumArt} />
              <Text style={s.albumTitle} numberOfLines={1}>{pl.name}</Text>
              <Text style={s.albumSub} numberOfLines={1}>Playlist • {pl.sub}</Text>
            </TouchableOpacity>
          ))}
          </ScrollView>
        </EdgeFadeRow>
      </View>

      {/* ── Podcasts about BTS — horizontal rail of portrait cards, same as
          Olivia's tab (no row list, no divider lines) ────────────────────── */}
      <View style={s.section}>
        <SectionHead title="Podcasts About BTS" seeMore={false} />
        <EdgeFadeRow>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
            {BTS_PODCASTS.map(pod => (
              <TouchableOpacity
                key={pod.id}
                style={s.discCard}
                activeOpacity={0.85}
                onPress={() => router.push(`/podcast-show/${pod.id}` as any)}
              >
                <View>
                  <View style={[s.discArtCard, { backgroundColor: pod.coverColor }]}>
                    <Image source={resolveArt(pod.coverArtPath)} style={StyleSheet.absoluteFill} resizeMode="cover" />
                  </View>
                  <View style={s.micBadge}>
                    <Ionicons name="mic-outline" size={26} color="#fff" />
                  </View>
                </View>
                <Text style={s.discCardTitle} numberOfLines={1}>{pod.title}</Text>
                <Text style={s.discCardMeta} numberOfLines={1}>{pod.host}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </EdgeFadeRow>
      </View>

      {/* ── Related Radio Stations — same portrait-card rail as Olivia's tab ── */}
      <View style={s.section}>
        <SectionHead title="Related Radio Stations" seeMore={false} />
        <EdgeFadeRow>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
            {BTS_TOP_ALBUMS.map(al => (
              <TouchableOpacity key={al.id} style={s.discCard} activeOpacity={0.85} onPress={() => onPlay()}>
                <View>
                  <Image source={resolveArt(al.artKey)} style={s.discArtCard} resizeMode="cover" />
                  <View style={s.radioBadge}>
                    <MaterialIcons name="sensors" size={26} color="#fff" />
                  </View>
                </View>
                <Text style={s.discCardTitle} numberOfLines={1}>{al.title} Radio</Text>
                <Text style={s.discCardMeta} numberOfLines={1}>Station • BTS</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </EdgeFadeRow>
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
  pad: { paddingHorizontal: 16 },

  // New album banner — same design as Olivia's/Taylor's tab
  newAlbumCard: { borderRadius: 4, overflow: 'hidden', padding: 12, flexDirection: 'row', alignItems: 'center' },
  newAlbumScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  newAlbumRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14 },
  newAlbumCover: { width: 81, height: 81, borderRadius: 4, borderWidth: 0.75, borderColor: 'rgba(255,255,255,0.24)' },
  newAlbumEyebrow: { fontSize: 12, fontWeight: '700', color: C.cyan },
  newAlbumTitle: { ...typeHeadline(16), color: '#fff', marginTop: 2 },
  newAlbumSub: { fontSize: 12, color: '#fff', marginTop: 3 },
  newAlbumMore: { marginLeft: 8, alignSelf: 'flex-start' },

  // Sections
  section: { marginTop: 28, paddingHorizontal: 16 },
  popularSection: { marginTop: 36, marginBottom: 6 },
  head: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 },
  headTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  headSub: { fontSize: 12, color: GREY, marginTop: 2 },
  seeMore: { fontSize: 12, color: C.cyan },

  // Since your last visit — same overlapping tilted-card fan as Olivia's/Taylor's tab
  updateRail: { paddingHorizontal: 16, paddingVertical: 22 },
  updateCard: { width: 205, height: 175, borderRadius: 16, overflow: 'hidden', justifyContent: 'flex-end' },
  updateMore: { position: 'absolute', top: 8, right: 10 },
  updateFooter: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 },
  updateTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  updateSub: { fontSize: 12, color: GREY, marginTop: 2 },
  artBorderOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 0.75,
    borderColor: 'rgba(255,255,255,0.24)',
    borderRadius: 16,
  },

  // Toggle
  toggleRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  toggleBtn: { flex: 1, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#333', alignItems: 'center' },
  toggleBtnActive: { backgroundColor: C.cyan, borderColor: C.cyan },
  toggleBtnText: { fontSize: 12, color: GREY, textAlign: 'center' },
  toggleBtnTextActive: { color: '#000', fontWeight: '700' },

  // Row icons (heart + menu) — ported from Olivia's RowIcons
  rowIcons: { flexDirection: 'row', alignItems: 'center', gap: 14 },

  // Albums
  albumCard: { width: CARD_W, marginRight: 12 },
  albumArt: { width: CARD_W, height: CARD_W, borderRadius: 6 },
  albumTitle: { fontSize: 12, color: '#fff', fontWeight: '600', marginTop: 6 },
  albumSub: { fontSize: 11, color: GREY, marginTop: 2 },

  // Top Songs — paginated rows, ported from Olivia's popRow/popScrollContent/popPage
  popScrollContent: { paddingLeft: 16 },
  popPage: { paddingRight: 20 },
  popRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  popThumb: { width: 56, height: 56, borderRadius: 6, borderWidth: 0.75, borderColor: 'rgba(255,255,255,0.24)' },
  popTitle: { ...typeHeadline(16), color: '#fff', flexShrink: 1 },
  popMeta: { fontSize: 12, color: GREY, marginTop: 3 },

  discographyLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 12 },
  discographyLinkText: { fontSize: 13, color: C.cyan },

  // Your Favorites — gradient card rows, ported from Olivia's favRow
  favRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, overflow: 'hidden' },
  favCover: { width: 63, height: 63, borderRadius: 4, borderWidth: 0.75, borderColor: 'rgba(255,255,255,0.24)' },
  favTitle: { ...typeHeadline(16), color: '#fff' },
  favPlays: { fontSize: 12, color: '#fff', marginTop: 2 },
  mixBtnOutline: { borderWidth: 1, borderColor: '#fff', borderRadius: 32, paddingVertical: 10, alignItems: 'center' },
  mixBtnOutlineText: { ...typeHeadline(14), color: '#fff' },

  // Discovery-style rail cards — Podcasts, Related Radio Stations
  rail: { gap: 14, paddingRight: 16 },
  discCard: { width: 173 },
  discArtCard: { width: 173, height: 173, borderRadius: 8, borderWidth: 0.75, borderColor: 'rgba(255,255,255,0.24)' },
  discCardTitle: { ...typeHeadline(16), color: '#fff', marginTop: 6 },
  discCardMeta: { fontSize: 14, color: GREY, marginTop: 1 },
  micBadge: {
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

  // Discography
  discography: { gap: 0 },
  discRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#222' },
  discArt: { width: DISC_ART, height: DISC_ART, borderRadius: 4 },
  discMeta: { flex: 1 },
  discBadgeText: { fontSize: 10, color: C.cyan, fontWeight: '800', letterSpacing: 0.5, marginBottom: 3 },
  discTitle: { fontSize: 13, color: '#fff', fontWeight: '600' },
  exploreDiscographyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14 },
  exploreDiscographyText: { fontSize: 13, fontWeight: '700', color: C.cyan },
  discYear: { fontSize: 11, color: GREY, marginTop: 3 },

  // Related artists
  relArtistCard: { width: CARD_W, marginRight: 12, alignItems: 'center' },
  relArtistArt: { width: CARD_W, height: CARD_W, borderRadius: CARD_W / 2 },
  relArtistName: { fontSize: 12, color: '#fff', textAlign: 'center', marginTop: 6 },
})
