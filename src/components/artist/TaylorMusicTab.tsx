import { useState, useMemo } from 'react'
import { View, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { Text } from '../AppText'
import { AppImage as Image } from '../AppImage'
import { EdgeFadeRow } from '../EdgeFadeRow'
import { songs as allSongs, artists, playlists, type Song } from '../../data/mockData'
import { albumArtAssets, artistAssets } from '../../data/assetMap'
import {
  TAYLOR_TOP_ALBUMS,
  TAYLOR_RELATED_PLAYLISTS,
  TAYLOR_DISCOGRAPHY,
} from '../../data/taylorSwiftPage'
import { TAYLOR_PODCASTS } from '../../data/taylorSuperFanContent'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useLikedSongs } from '../../context/LikedSongsContext'
import { useAdaptiveUI } from '../../context/AdaptiveUIContext'
import { useHannahJourney } from '../../context/HannahJourneyContext'
import { C, typeHeadline, FONT_FAMILY_DISPLAY, FONT_FAMILY_EMBER } from '../../theme'
import DiscographySection from './DiscographySection'

const SCREEN_W = Dimensions.get('window').width
const GREY = '#a6a6a6'
const POP_SONGS_PER_PAGE = 3
const POP_PAGE_PEEK = Math.round(SCREEN_W * 0.3)
const POP_PAGE_WIDTH = SCREEN_W - POP_PAGE_PEEK
// Same tilt sequence as Olivia's "Since Your Last Visit" overlapping fan of cards.
const UPDATE_TILTS = ['0deg', '4.5deg', '-7deg', '3.28deg']

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

// Hannah Journey "Your Favorites" ranked rows — same 3-song, gradient-per-row
// treatment as Olivia's Hannah Journey superfan Music tab (`yourFavoritesRows`
// in OliviaMusicTab.tsx), populated with real Taylor songs from mockData.
const HJ_FAVORITE_IDS = ['s-ts-mid-01', 's-ts-folk-01', 's-ts-ttpd-02']
const HJ_FAVORITE_GRADIENTS: readonly [string, string][] = [
  ['#779fad', '#3c494e'],
  ['#7f75d5', '#423d6f'],
  ['#779fad', '#3c494e'],
]
const HJ_FAVORITE_PLAYS = [242, 200, 186]
// "All Time" / "Forgotten" tabs of the same segmented control — Olivia's
// reference branch swaps in genuinely different rows per tab (not just a
// relabeled pill), so these mirror that with real, distinct Taylor songs.
// "Recent" reuses HJ_FAVORITE_IDS/HJ_FAVORITE_PLAYS above — those were
// already the Figma-spec'd Recent-tab numbers (242/200/186), just not wired
// into the tab yet.
const HJ_ALLTIME_IDS = ['s-ts-fearless-01', 's-ts1989', 's-ts1989-02'] // Love Story, Blank Space, Shake It Off
const HJ_ALLTIME_PLAYS = [847, 611, 493]
const HJ_FORGOTTEN_IDS = ['s-ts-red-09', 's-ts-lover-09', 's-ts-folk-08'] // State of Grace, London Boy, illicit affairs
const HJ_FORGOTTEN_PLAYS = [34, 27, 19]

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

function RowIcons({ song, light, size = 20 }: { song: Song; light?: boolean; size?: number }) {
  const { likedSongIds, toggleLike } = useLikedSongs()
  const liked = likedSongIds.has(song.id)
  return (
    <View style={s.rowIcons}>
      <TouchableOpacity onPress={() => toggleLike(song.id)} hitSlop={8}>
        <Ionicons name={liked ? 'heart' : 'heart-outline'} size={size} color={liked ? (light ? '#fff' : C.cyan) : '#fff'} />
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

export default function TaylorMusicTab({ onPlay }: { onPlay: (songId?: string) => void }) {
  const router = useRouter()
  const { showConfirmation } = useAdaptiveUI()
  const { isHannahJourney } = useHannahJourney()
  const [favToggle, setFavToggle] = useState<'top' | 'hidden'>('top')
  // Hannah Journey's own "Your Favorites" — 3-way segmented control + ranked
  // gradient rows, matching Olivia's Hannah Journey superfan Music tab exactly
  // (the `isSuperFan && isHannahJourney` branch of OliviaMusicTab.tsx). Static
  // rows per segment, same as that reference implementation.
  const [hjFavTab, setHjFavTab] = useState(0)

  const taylorSongs = useMemo(
    () => allSongs.filter(sg => sg.artistId === 'tswift'),
    [],
  )

  // Popular songs, ranked by position in taylorSongs array (order = editorial rank)
  const popularSongs = useMemo(() => taylorSongs.slice(0, 10), [taylorSongs])
  const popPages = useMemo(() => chunk(popularSongs.slice(0, 9), POP_SONGS_PER_PAGE), [popularSongs])
  const popularSnapOffsets = useMemo(() => popPages.map((_, i) => i * POP_PAGE_WIDTH), [popPages])

  // Favorites — Top (your most-played) vs Forgotten (deep cuts past the
  // Popular rail) — same "Your Favorites" pattern as Olivia's superfan page:
  // 3 rows, no rank numbers, capped by a "Play Your Mix" button.
  const favSongs = useMemo(
    () => (favToggle === 'top' ? taylorSongs.slice(0, 3) : taylorSongs.slice(6, 9)),
    [taylorSongs, favToggle],
  )
  const hjFavoriteSongs = useMemo(
    () => HJ_FAVORITE_IDS.map(id => allSongs.find(sg => sg.id === id)).filter((sg): sg is Song => sg != null),
    [],
  )

  // New album banner songs (The Life of a Showgirl)
  const showgirlSongs = useMemo(
    () => taylorSongs.filter(sg => sg.album === 'The Life of a Showgirl').slice(0, 4),
    [taylorSongs],
  )

  // "Since your last visit" — same overlapping tilted-card news fan as Olivia's tab
  const updates = [
    { t: 'Fortnight', sub: 'New music video', k: 'ts-tortured-poets', onPress: () => onPlay() },
    { t: 'The Eras Tour', sub: 'Concert film returns to theaters', k: 'ts-showgirl', onPress: () => showConfirmation('Opens in Prime Video') },
    { t: 'Capital One', sub: 'New brand partner', k: 'ts-1989', onPress: () => showConfirmation('Opens the partner shop') },
    { t: 'Showgirl Tour', sub: '18 new cities added', k: 'ts-showgirl-life', onPress: () => showConfirmation('Tour dates are on the Events tab') },
  ]

  // Related artists
  const relatedArtists = useMemo(() => {
    const ids = ['olivia-rodrigo', 'sabrina-carpenter', 'lorde', 'katy-perry', 'ariana-grande']
    return ids
      .map(id => artists.find(a => a.id === id))
      .filter(Boolean) as typeof artists
  }, [])

  // ── Hannah Journey superfan Music tab — exact structural mirror of
  // OliviaMusicTab.tsx's `isSuperFan && isHannahJourney` branch: New Album →
  // Since Your Last Visit → Your Favorites (3-tab ranked rows) → Top Songs →
  // Top Albums → Your Playlists (if any) → Releases → Podcast → Related
  // Stations → Fans also like. Deliberately has NO "Discography" section and
  // NO "Explore full discography" link — those only exist in Olivia's
  // non-HJ/Celine branches further down her file, not in the HJ-superfan
  // branch this mirrors. Every song/album/podcast below is real Taylor
  // catalog data from mockData.ts / taylorSwiftPage.ts / taylorSuperFanContent.ts.
  if (isHannahJourney) {
    const hjNewAlbumSong = allSongs.find(sg => sg.id === 's-ts-showgirl') ?? taylorSongs[0]
    // Denser rails per Final Prototype feedback: more songs/albums per swipe,
    // and every release card opens its real album page (unified SOUR/GUTS
    // layout) instead of just playing a stand-in track.
    const hjTopSongRows = popularSongs.slice(0, 5).map((sg, i) => ({ song: sg, streams: STREAMS[i] ?? 100000 }))
    const hjTopAlbumsRail = TAYLOR_TOP_ALBUMS.slice(0, 8)
    const hjReleaseRail = [
      { title: 'The Life of a Showgirl', meta: 'Album • 2025', art: 'ts-showgirl-life', onPress: () => router.push('/album/ts-showgirl-2025' as any) },
      { title: 'The Tortured Poets Department', meta: 'Album • 2024', art: 'ts-tortured-poets', onPress: () => router.push('/album/ts-ttpd-2024' as any) },
      { title: 'Midnights', meta: 'Album • 2022', art: 'ts-1989-polaroid', onPress: () => router.push('/album/ts-midnights-2022' as any) },
      { title: 'Lover', meta: 'Album • 2019', art: 'ts-lover', onPress: () => router.push('/album/ts-lover-2019' as any) },
      { title: 'reputation', meta: 'Album • 2017', art: 'ts-reputation', onPress: () => router.push('/album/ts-reputation-2017' as any) },
      { title: '1989', meta: 'Album • 2014', art: 'ts-1989', onPress: () => router.push('/album/ts-1989-2014' as any) },
    ]
    const hjAllTimeFavorites = byIds(HJ_ALLTIME_IDS)
    const hjForgottenFavorites = byIds(HJ_FORGOTTEN_IDS)
    const hjFavoriteRows =
      hjFavTab === 0
        ? hjFavoriteSongs.map((sg, i) => ({ song: sg, plays: HJ_FAVORITE_PLAYS[i] ?? 12 }))
        : hjFavTab === 1
          ? hjAllTimeFavorites.map((sg, i) => ({ song: sg, plays: HJ_ALLTIME_PLAYS[i] ?? 12 }))
          : hjForgottenFavorites.map((sg, i) => ({ song: sg, plays: HJ_FORGOTTEN_PLAYS[i] ?? 12 }))
    // "Your Playlists with Taylor" — same rule as OliviaMusicTab.tsx's
    // `oliviaPlaylists.yours`: any user-curated playlist that actually
    // contains her songs (matched by real artistId membership, since Taylor's
    // song ids don't share a single prefix the way Olivia's 's-or*' ids do).
    const taylorSongIdSet = new Set(taylorSongs.map(sg => sg.id))
    const hjYourPlaylists = playlists.filter(
      pl => pl.curatorType === 'user' && pl.songIds?.some(id => taylorSongIdSet.has(id)),
    )

    return (
      <View style={[s.root, { gap: 32, paddingTop: 20 }]}>
        {/* New album banner — opens the real album page (unified HJ layout) */}
        <View style={s.pad}>
          <TouchableOpacity style={[s.newAlbumCard, { borderRadius: 8 }]} activeOpacity={0.88} onPress={() => router.push('/album/ts-showgirl-2025' as any)}>
            <Image source={resolveArt('ts-showgirl-life')} style={StyleSheet.absoluteFill} resizeMode="cover" blurRadius={12} />
            <View style={s.newAlbumScrim} />
            <View style={s.newAlbumRow}>
              <Image source={resolveArt('ts-showgirl-life')} style={s.newAlbumCover} resizeMode="cover" />
              <View style={{ flex: 1 }}>
                <Text style={s.newAlbumEyebrow}>NEW ALBUM</Text>
                <Text style={s.newAlbumTitle} numberOfLines={1}>The Life of a Showgirl</Text>
                <Text style={s.newAlbumSub} numberOfLines={1}>Taylor's back with her new album</Text>
              </View>
            </View>
            <TouchableOpacity hitSlop={8} onPress={() => onPlay(hjNewAlbumSong.id)} style={s.newAlbumMore}>
              <Ionicons name="play" size={16} color="#fff" />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Since Your Last Visit */}
        <View style={s.section}>
          <SectionHead title="Since Your Last Visit" sub="Catching you up on Taylor Swift" onSeeMore={() => showConfirmation('Opens full updates')} />
          <EdgeFadeRow>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.updateRail} nestedScrollEnabled>
              {updates.map((u, i) => (
                <View key={u.t} style={{ marginRight: i < updates.length - 1 ? -32 : 0, zIndex: i + 1 }}>
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

        {/* Your Favorites — 2-way segmented control (Top/Forgotten), matching
            Olivia's Hannah-Journey superfan pattern exactly. */}
        <View style={s.section}>
          <SectionHead title="Your Favorites" seeMore={false} />
          <View style={s.pad}>
            <View style={[s.hjFavSegTrack, { marginTop: 12 }]}>
              {(['Recent', 'All Time', 'Forgotten'] as const).map((t, i) => (
                <TouchableOpacity
                  key={t}
                  style={[s.hjFavSegItem, hjFavTab === i && s.hjFavSegItemActive]}
                  activeOpacity={0.8}
                  onPress={() => setHjFavTab(i)}
                >
                  <Text style={[s.hjFavSegText, hjFavTab === i && s.hjFavSegTextActive]} numberOfLines={1}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={[s.pad, { marginTop: 12, gap: 12 }]}>
            {hjFavoriteRows.map((row, i) => (
              <TouchableOpacity key={row.song.id} activeOpacity={0.85} onPress={() => onPlay(row.song.id)}>
                <View style={s.favRow}>
                  <LinearGradient
                    colors={HJ_FAVORITE_GRADIENTS[i] ?? HJ_FAVORITE_GRADIENTS[0]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={[s.favRank, { width: 18 }]}>{i + 1}</Text>
                  <Image source={resolveArt(row.song.albumArtPath)} style={s.favCover} resizeMode="cover" />
                  <View style={{ flex: 1 }}>
                    <Text style={s.hjFavTitle} numberOfLines={1}>{row.song.title}</Text>
                    <Text style={s.hjFavPlays}>Taylor Swift • <Text style={s.hjFavPlaysBold}>{row.plays} plays</Text></Text>
                  </View>
                  <RowIcons song={row.song} size={24} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
          <View style={s.pad}>
            <TouchableOpacity style={[s.mixBtnOutline, { paddingVertical: 8 }]} activeOpacity={0.85} onPress={() => showConfirmation('Opens your liked songs')}>
              <Text style={s.mixBtnOutlineText}>Your liked songs</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Top Songs — 5-row list, no legacy discography links */}
        <View style={s.section}>
          <SectionHead title="Top Songs" seeMore={false} />
          <View style={s.pad}>
            {hjTopSongRows.map(row => (
              <TouchableOpacity key={row.song.id} style={s.popRow} activeOpacity={0.8} onPress={() => onPlay(row.song.id)}>
                <Image source={resolveArt(row.song.albumArtPath)} style={s.hjPopCover} resizeMode="cover" />
                <View style={{ flex: 1 }}>
                  <Text style={s.popTitle} numberOfLines={1}>{row.song.title}</Text>
                  <Text style={s.popMeta} numberOfLines={1}>Taylor Swift • {fmtStreams(row.streams)}</Text>
                </View>
                <RowIcons song={row.song} size={24} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Top Albums */}
        <View style={s.section}>
          <SectionHead title="Top Albums" sub="Most streamed worldwide on Amazon Music" seeMore={false} />
          <EdgeFadeRow>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
              {hjTopAlbumsRail.map((al, i) => (
                <TouchableOpacity key={al.id} style={s.discCard} activeOpacity={0.85} onPress={() => router.push(`/album/${al.id}` as any)}>
                  <Image source={resolveArt(al.artKey)} style={s.discArt} resizeMode="cover" />
                  <Text style={s.discTitle} numberOfLines={1}>{i + 1}. {al.title}</Text>
                  <Text style={s.discMeta} numberOfLines={1}>{al.subtitle}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </EdgeFadeRow>
        </View>

        {/* Your Playlists with Taylor — only shown when one actually exists */}
        {hjYourPlaylists.length > 0 && (
          <View style={s.section}>
            <SectionHead title="Your Playlists with Taylor" seeMore={false} />
            <EdgeFadeRow>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
                {hjYourPlaylists.map(pl => (
                  <TouchableOpacity key={pl.id} style={s.discCard} activeOpacity={0.85} onPress={() => router.push(`/playlist/${pl.id}` as any)}>
                    <Image source={resolveArt(pl.coverArtPath)} style={s.discArt} resizeMode="cover" />
                    <Text style={s.discTitle} numberOfLines={1}>{pl.name}</Text>
                    <Text style={s.discMeta} numberOfLines={1}>Playlist • {pl.songCount} songs</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </EdgeFadeRow>
          </View>
        )}

        {/* Releases */}
        <View style={s.section}>
          <SectionHead title="Releases" seeMore={false} />
          <EdgeFadeRow>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
              {hjReleaseRail.map(item => (
                <TouchableOpacity key={item.title} style={s.discCard} activeOpacity={0.85} onPress={item.onPress}>
                  <Image source={resolveArt(item.art)} style={s.discArt} resizeMode="cover" />
                  <Text style={s.discTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={s.discMeta} numberOfLines={1}>{item.meta}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </EdgeFadeRow>
        </View>

        {/* Podcast About Taylor — no station/mic badge, matching Olivia's HJ
            "Podcast About Olivia" rail exactly (plain cover + title + meta). */}
        <View style={s.section}>
          <SectionHead title="Podcast About Taylor" seeMore={false} />
          <EdgeFadeRow>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
              {TAYLOR_PODCASTS.map(pod => (
                <TouchableOpacity
                  key={pod.id}
                  style={s.discCard}
                  activeOpacity={0.85}
                  onPress={() => router.push(`/podcast-show/${pod.id}` as any)}
                >
                  <Image source={resolveArt(pod.coverArtPath)} style={s.discArt} resizeMode="cover" />
                  <Text style={s.discTitle} numberOfLines={1}>{pod.title}</Text>
                  <Text style={s.discMeta} numberOfLines={1}>Podcast • {pod.host}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </EdgeFadeRow>
        </View>

        {/* Related Stations */}
        <View style={s.section}>
          <SectionHead title="Related Stations" seeMore={false} />
          <EdgeFadeRow>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
              {TAYLOR_TOP_ALBUMS.slice(0, 4).map(al => (
                <TouchableOpacity key={al.id} style={s.discCard} activeOpacity={0.85} onPress={() => onPlay()}>
                  <View>
                    <Image source={resolveArt(al.artKey)} style={s.discArt} resizeMode="cover" />
                    <View style={[s.radioBadge, { left: 10, right: undefined }]}>
                      <MaterialIcons name="sensors" size={22} color="#fff" />
                    </View>
                  </View>
                  <Text style={s.discTitle} numberOfLines={1}>{al.title} Radio</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </EdgeFadeRow>
        </View>

        {/* Fans also like */}
        <View style={[s.section, { marginBottom: 8 }]}>
          <SectionHead title="Fans also like" onSeeMore={() => showConfirmation('Opens related artists')} />
          <EdgeFadeRow>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
              {relatedArtists.slice(0, 5).map(a => (
                <TouchableOpacity key={a.id} style={s.relArtistCard} activeOpacity={0.85} onPress={() => router.push(`/artist/${a.id}`)}>
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

  return (
    <View style={s.root}>
      {/* ── New album banner — same design as Olivia's superfan tab ───────── */}
      <View style={s.pad}>
        <TouchableOpacity style={s.newAlbumCard} activeOpacity={0.88} onPress={() => onPlay()}>
          <Image source={resolveArt('ts-showgirl-life')} style={StyleSheet.absoluteFill} resizeMode="cover" blurRadius={12} />
          <View style={s.newAlbumScrim} />
          <View style={s.newAlbumRow}>
            <Image source={resolveArt('ts-showgirl-life')} style={s.newAlbumCover} resizeMode="cover" />
            <View style={{ flex: 1 }}>
              <Text style={s.newAlbumEyebrow}>NEW ALBUM</Text>
              <Text style={s.newAlbumTitle} numberOfLines={2}>The Life of a Showgirl</Text>
              <Text style={s.newAlbumSub} numberOfLines={1}>Taylor's back with her new album</Text>
            </View>
          </View>
          <TouchableOpacity hitSlop={8} onPress={() => showConfirmation('Opens the album page')} style={s.newAlbumMore}>
            <Ionicons name="ellipsis-horizontal" size={16} color="#fff" />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      {/* ── Since your last visit — overlapping tilted-card fan, same design as Olivia's tab ── */}
      <View style={s.section}>
        <SectionHead title="Since Your Last Visit" sub="Catching you up on Taylor Swift" />
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
                      <Text style={s.popMeta} numberOfLines={1}>Taylor Swift • {fmtStreams(STREAMS[globalIdx] ?? 100000)}</Text>
                    </View>
                    <RowIcons song={sg} size={isHannahJourney ? 24 : 20} />
                  </TouchableOpacity>
                )
              })}
            </View>
          ))}
        </ScrollView>
        <TouchableOpacity
          style={[s.discographyLink, s.pad]}
          activeOpacity={0.7}
          onPress={() => router.push('/artist-discography/tswift' as any)}
        >
          <Text style={s.discographyLinkText}>Explore full discography</Text>
          <Ionicons name="chevron-forward" size={14} color={C.cyan} />
        </TouchableOpacity>
      </View>

      {/* ── Your Favorites — same gradient-card rows as Olivia's superfan tab.
          Hannah Journey gets the 3-way segmented control + numbered ranked
          rows (matching OliviaMusicTab.tsx's `isSuperFan && isHannahJourney`
          "Your Favorites" exactly); everyone else keeps the existing 2-way
          Top/Forgotten toggle unchanged. ─────────────────────────────────── */}
      <View style={s.section}>
        <View style={s.pad}><Text style={s.headTitle}>Your Favorites</Text></View>
        {isHannahJourney ? (
          <>
            {/* Figma node 447:4111 "menu tab": a single rgba(255,255,255,0.2)
                track (not 3 separate outlined pills) with a cyan sliding
                highlight — matches OliviaMusicTab.tsx's s.favSegTrack exactly.
                s.pad wraps the track (rather than merging paddingHorizontal
                into the track's own style) so the track's own 2px inset isn't
                fought by the page gutter — same reasoning as Olivia's tab. */}
            <View style={s.pad}>
              <View style={[s.hjFavSegTrack, { marginTop: 12 }]}>
                {(['Recent', 'All Time', 'Forgotten'] as const).map((t, i) => (
                  <TouchableOpacity
                    key={t}
                    style={[s.hjFavSegItem, hjFavTab === i && s.hjFavSegItemActive]}
                    activeOpacity={0.8}
                    onPress={() => setHjFavTab(i)}
                  >
                    <Text style={[s.hjFavSegText, hjFavTab === i && s.hjFavSegTextActive]} numberOfLines={1}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={[s.pad, { marginTop: 12, gap: 12 }]}>
              {hjFavoriteSongs.map((sg, i) => (
                <TouchableOpacity key={sg.id} activeOpacity={0.85} onPress={() => onPlay(sg.id)}>
                  <View style={s.favRow}>
                    <LinearGradient
                      colors={HJ_FAVORITE_GRADIENTS[i] ?? HJ_FAVORITE_GRADIENTS[0]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFill}
                    />
                    <Text style={[s.favRank, { width: 18 }]}>{i + 1}</Text>
                    <Image source={resolveArt(sg.albumArtPath)} style={s.favCover} resizeMode="cover" />
                    <View style={{ flex: 1 }}>
                      {/* Figma: song title is Amazon Ember Bold (not Ember Modern Display) */}
                      <Text style={s.hjFavTitle} numberOfLines={1}>{sg.title}</Text>
                      {/* Figma: "Taylor Swift • " is Amazon Ember Regular; the play-count
                          span swaps to Ember Modern Display Bold. */}
                      <Text style={s.hjFavPlays}>Taylor Swift • <Text style={s.hjFavPlaysBold}>{HJ_FAVORITE_PLAYS[i] ?? 12} plays</Text></Text>
                    </View>
                    <RowIcons song={sg} light size={24} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            <View style={s.pad}>
              <TouchableOpacity
                style={s.mixBtnOutline}
                activeOpacity={0.85}
                onPress={() => hjFavoriteSongs[0] && onPlay(hjFavoriteSongs[0].id)}
              >
                <Text style={s.mixBtnOutlineText}>Play Your Mix</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
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
                const plays = PLAYS[i] ?? 12
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
          </>
        )}
      </View>

      {/* ── Albums ───────────────────────────────────────────────────────── */}
      <View style={s.section}>
        <SectionHead title="Top Albums" />
        <EdgeFadeRow>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }} nestedScrollEnabled>
          {TAYLOR_TOP_ALBUMS.map(a => (
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

      {/* ── Discography ─────────────────────────────────────────────────── */}
      <View style={s.section}>
        <SectionHead title="Discography" seeMore={false} />
        <DiscographySection
          releases={TAYLOR_DISCOGRAPHY}
          resolveArt={resolveArt}
          onExploreAll={() => router.push('/artist-discography/tswift' as any)}
        />
      </View>

      {/* ── Related Playlists ───────────────────────────────────────────── */}
      <View style={s.section}>
        <SectionHead title="Related Playlists" seeMore={false} />
        <EdgeFadeRow>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
          {TAYLOR_RELATED_PLAYLISTS.map(pl => (
            <TouchableOpacity key={pl.id} style={s.discCard} activeOpacity={0.85} onPress={() => router.push(`/playlist/${pl.id}` as any)}>
              <Image source={resolveArt(pl.artKey)} style={s.discArt} resizeMode="cover" />
              <Text style={s.discTitle} numberOfLines={1}>{pl.name}</Text>
              <Text style={s.discMeta} numberOfLines={1}>Playlist • {pl.sub}</Text>
            </TouchableOpacity>
          ))}
          </ScrollView>
        </EdgeFadeRow>
      </View>

      {/* ── Podcasts about Taylor — horizontal rail of portrait cards, same
          as Olivia's tab (no row list, no divider lines) ─────────────────── */}
      <View style={s.section}>
        <SectionHead title="Podcasts About Taylor" seeMore={false} />
        <EdgeFadeRow>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
            {TAYLOR_PODCASTS.map(pod => (
              <TouchableOpacity
                key={pod.id}
                style={s.discCard}
                activeOpacity={0.85}
                onPress={() => router.push(`/podcast-show/${pod.id}` as any)}
              >
                <View>
                  <View style={[s.discArt, { backgroundColor: pod.coverColor }]}>
                    <Image source={resolveArt(pod.coverArtPath)} style={StyleSheet.absoluteFill} resizeMode="cover" />
                  </View>
                  {/* Hannah Journey: no podcast-mic glyph — matches Olivia's Hannah
                      Journey "Podcast About Olivia" rail, which drops the mic badge
                      and reuses the same left-aligned station badge as Related
                      Radio Stations below ("the only icon we have is for stations").
                      Other personas keep the existing mic badge unchanged. */}
                  {isHannahJourney ? (
                    <View style={[s.radioBadge, { left: 10, right: undefined }]}>
                      <MaterialIcons name="sensors" size={22} color="#fff" />
                    </View>
                  ) : (
                    <View style={s.micBadge}>
                      <Ionicons name="mic-outline" size={26} color="#fff" />
                    </View>
                  )}
                </View>
                <Text style={s.discTitle} numberOfLines={1}>{pod.title}</Text>
                <Text style={s.discMeta} numberOfLines={1}>{pod.host}</Text>
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
            {TAYLOR_TOP_ALBUMS.map(al => (
              <TouchableOpacity key={al.id} style={s.discCard} activeOpacity={0.85} onPress={() => onPlay()}>
                <View>
                  <Image source={resolveArt(al.artKey)} style={s.discArt} resizeMode="cover" />
                  {/* Hannah Journey: station badge sits bottom-left (Figma 2576:40996),
                      matching Olivia's Hannah Journey Related Stations rail. Other
                      personas keep the existing bottom-right badge unchanged. */}
                  <View style={[s.radioBadge, isHannahJourney && { left: 10, right: undefined }]}>
                    <MaterialIcons name="sensors" size={isHannahJourney ? 22 : 26} color="#fff" />
                  </View>
                </View>
                <Text style={s.discTitle} numberOfLines={1}>{al.title} Radio</Text>
                <Text style={s.discMeta} numberOfLines={1}>Station • Taylor Swift</Text>
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

const s = StyleSheet.create({
  root: { flex: 1 },
  pad: { paddingHorizontal: 16 },

  // New album banner — same design as Olivia's superfan tab
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

  // Since your last visit — same overlapping tilted-card fan as Olivia's tab
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
  // Hannah Journey "Top Songs" row cover — 63x63, matching OliviaMusicTab.tsx's
  // popCover exactly (the non-HJ paginated carousel above keeps its own 56x56 popThumb).
  hjPopCover: { width: 63, height: 63, borderRadius: 4, borderWidth: 0.75, borderColor: 'rgba(255,255,255,0.24)' },
  popTitle: { ...typeHeadline(16), color: '#fff', flexShrink: 1 },
  popMeta: { fontSize: 12, color: GREY, marginTop: 3 },

  discographyLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 12 },
  discographyLinkText: { fontSize: 13, color: C.cyan },

  // Your Favorites — gradient card rows, ported from Olivia's favRow
  favRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, overflow: 'hidden' },
  favCover: { width: 63, height: 63, borderRadius: 4, borderWidth: 0.75, borderColor: 'rgba(255,255,255,0.24)' },
  favTitle: { ...typeHeadline(16), color: '#fff' },
  favPlays: { fontSize: 12, color: '#fff', marginTop: 2 },
  // Hannah Journey ranked "Your Favorites" row — numbered rank prefix, ported from
  // Olivia's favRank (Figma 464:4236: Ember Modern Display Bold, 32px — only used
  // by the Hannah Journey branch above, so safe to match the spec's size exactly).
  favRank: { fontFamily: FONT_FAMILY_DISPLAY.bold, fontSize: 32, lineHeight: 32 * 0.9, color: '#fff', width: 20, textAlign: 'center' },
  mixBtnOutline: { borderWidth: 1, borderColor: '#fff', borderRadius: 32, paddingVertical: 10, alignItems: 'center' },
  mixBtnOutlineText: { ...typeHeadline(14), color: '#fff' },

  // Hannah Journey "Your Favorites" segmented control (Recent/All Time/Forgotten)
  // — Figma 447:4111, ported verbatim from OliviaMusicTab.tsx's s.favSegTrack.
  hjFavSegTrack: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 100,
    padding: 2,
    height: 39,
  },
  hjFavSegItem: { flex: 1, borderRadius: 100, alignItems: 'center', justifyContent: 'center' },
  hjFavSegItemActive: { backgroundColor: C.cyan },
  hjFavSegText: { fontFamily: FONT_FAMILY_DISPLAY.regular, fontSize: 14, color: '#fff' },
  hjFavSegTextActive: { color: '#000' },

  // Hannah Journey "Your Favorites" row typeface corrections (Figma 464:4236),
  // ported from Olivia's hjFavTitle/hjFavPlays/hjFavPlaysBold — scoped to the
  // Hannah Journey branch only; s.favTitle/s.favPlays above stay untouched
  // since the non-Hannah-Journey Top/Forgotten rows reuse them as-is.
  hjFavTitle: { fontFamily: FONT_FAMILY_EMBER.bold, fontSize: 16, color: '#fff' },
  hjFavPlays: { fontFamily: FONT_FAMILY_EMBER.regular, fontSize: 12, color: '#fff', marginTop: 4 },
  hjFavPlaysBold: { fontFamily: FONT_FAMILY_DISPLAY.bold, fontSize: 12, color: '#fff' },

  // Discovery-style rail cards — Podcasts, Related Radio Stations
  rail: { gap: 14, paddingRight: 16 },
  discCard: { width: 173 },
  discArt: { width: 173, height: 173, borderRadius: 8, borderWidth: 0.75, borderColor: 'rgba(255,255,255,0.24)' },
  discTitle: { ...typeHeadline(16), color: '#fff', marginTop: 6 },
  discMeta: { fontSize: 14, color: GREY, marginTop: 1 },
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

  // Related artists
  relArtistCard: { width: CARD_W, marginRight: 12, alignItems: 'center' },
  relArtistArt: { width: CARD_W, height: CARD_W, borderRadius: CARD_W / 2 },
  relArtistName: { fontSize: 12, color: '#fff', textAlign: 'center', marginTop: 6 },
})
