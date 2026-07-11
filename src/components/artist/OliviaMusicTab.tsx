import { useState, useMemo } from 'react'
import { View, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  type SharedValue,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '../AppText'
import { AppImage as Image } from '../AppImage'
import { EdgeFadeRow } from '../EdgeFadeRow'
import { songs as allSongs, artists, playlists, type Song } from '../../data/mockData'
import { OLIVIA_ABOUT_VIDEOS } from '../../data/oliviaRodrigoAbout'
import { OLIVIA_TOP_ALBUMS } from '../../data/oliviaRodrigoPage'
import { OLIVIA_PODCASTS } from '../../data/oliviaSuperFanContent'
import { albumArtAssets, oliviaPageAssets, oliviaAboutAssets, resolveArtistAvatar, logoAssets } from '../../data/assetMap'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useLikedSongs } from '../../context/LikedSongsContext'
import { useAdaptiveUI, isOliviaSuperFanTheme } from '../../context/AdaptiveUIContext'
import { useAdaptiveMenu } from '../AdaptiveContextMenu'
import { useProfiles } from '../../context/ProfilesContext'
import { C, typeHeadline } from '../../theme'

// Music tab layout per Figma node 939:5699 (artist_profile/music):
// new-album banner → Since Your Last Visit (tilted cards) → Your Favorites
// (toggle + ranked rows) → Hidden Gems → Top Albums → Popular (expandable)
// → Music Videos → Discography → playlist rails → Related Playlists
// → Podcasts about Olivia → Related Artists.

const SCREEN_W = Dimensions.get('window').width
const GREY = '#a6a6a6'

// Popular section — paged horizontal scroll (Amazon "Songs for you" pattern)
const POP_SONGS_PER_PAGE = 3
const POP_PAGE_PEEK = Math.round(SCREEN_W * 0.3)
const POP_PAGE_WIDTH = SCREEN_W - POP_PAGE_PEEK

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

function resolveArt(key?: string) {
  return (key ? albumArtAssets[key] ?? oliviaAboutAssets[key] : null) ?? oliviaPageAssets.profile
}

// Deterministic-ish "stats" so the display stays stable without real analytics.
const STREAMS = [123456789, 12345678, 1234567, 987654, 456789, 234567, 198765, 176543, 154321, 132100]
const PLAYS = [24, 21, 18, 15, 12, 9]
const ALBUM_YEARS: Record<string, string> = {
  'You Seem Pretty Sad': '2026',
  GUTS: '2023',
  SOUR: '2021',
}
// Figma: the update cards sit at slight, alternating angles.
const UPDATE_TILTS = [0, 4.5, -7, 3.28]
const UPDATE_STEP = 205 - 32 // card width minus the overlap

type SinceUpdate = { t: string; sub: string; k: string; onPress: () => void }

/* The tilted cards now swing with the scroll: each card's rotation eases
 * from its resting tilt as it travels through the viewport, settling back
 * when the rail comes to rest — fluid, not decorative. */
function SinceUpdateCard({
  u, i, isLast, scrollX, resolveArt,
}: {
  u: SinceUpdate; i: number; isLast: boolean; scrollX: SharedValue<number>; resolveArt: (k: string) => any
}) {
  const motion = useAnimatedStyle(() => {
    const center = i * UPDATE_STEP
    const delta = interpolate(scrollX.value, [center - 320, center, center + 320], [7, 0, -7], Extrapolation.CLAMP)
    return {
      transform: [
        { rotate: `${UPDATE_TILTS[i % UPDATE_TILTS.length] + delta}deg` },
        { translateY: Math.abs(delta) * 1.3 },
      ],
    }
  })
  return (
    <View style={{ marginRight: isLast ? 0 : -32, zIndex: i + 1 }}>
      <Animated.View style={motion}>
        <TouchableOpacity style={s.updateCard} activeOpacity={0.88} onPress={u.onPress}>
          <Image source={resolveArt(u.k)} style={StyleSheet.absoluteFill} resizeMode="cover" />
          <LinearGradient colors={['rgba(0,0,0,0)', '#020202']} locations={[0.3, 1]} style={StyleSheet.absoluteFill} />
          <View style={[s.artBorderOverlay, { borderRadius: 16 }]} pointerEvents="none" />
          <Ionicons name="ellipsis-horizontal" size={16} color="#fff" style={s.updateMore} />
          <View style={s.updateFooter}>
            <View style={{ flex: 1 }}>
              <Text style={s.updateTitle} numberOfLines={1}>{u.t}</Text>
              <Text style={s.updateSub} numberOfLines={1}>{u.sub}</Text>
            </View>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  )
}

function SinceUpdateRail({ updates, resolveArt }: { updates: SinceUpdate[]; resolveArt: (k: string) => any }) {
  const scrollX = useSharedValue(0)
  const onScroll = useAnimatedScrollHandler(e => { scrollX.value = e.contentOffset.x })
  return (
    <EdgeFadeRow>
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.updateRail}
        nestedScrollEnabled
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {updates.map((u, i) => (
          <SinceUpdateCard
            key={u.t}
            u={u}
            i={i}
            isLast={i === updates.length - 1}
            scrollX={scrollX}
            resolveArt={resolveArt}
          />
        ))}
      </Animated.ScrollView>
    </EdgeFadeRow>
  )
}


function fmtStreams(n: number): string {
  return n.toLocaleString('en-US')
}

function byIds(ids: string[]): Song[] {
  return ids.map(id => allSongs.find(sg => sg.id === id)).filter((sg): sg is Song => sg != null)
}

function darkenHex(hex: string, factor: number): string {
  const h = hex.replace('#', '')
  const r = Math.round(parseInt(h.slice(0, 2), 16) * factor)
  const g = Math.round(parseInt(h.slice(2, 4), 16) * factor)
  const b = Math.round(parseInt(h.slice(4, 6), 16) * factor)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// ── shared bits ──────────────────────────────────────────────────────────────
function SectionHead({ title, sub, subCyan, seeMore = true, onSeeMore }: { title: string; sub?: string; subCyan?: boolean; seeMore?: boolean; onSeeMore?: () => void }) {
  return (
    <View style={s.head}>
      <View style={{ flex: 1 }}>
        <Text style={s.title}>{title}</Text>
        {sub ? <Text style={[s.sub, subCyan && { color: C.cyan }]}>{sub}</Text> : null}
      </View>
      {seeMore ? (
        <TouchableOpacity onPress={onSeeMore} activeOpacity={0.7} disabled={!onSeeMore}>
          <Text style={s.seeMore}>SEE MORE</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  )
}

function ExplicitTag() {
  return (
    <View style={s.eTag}>
      <Text style={s.eTagText}>E</Text>
    </View>
  )
}

function RowIcons({ song, light }: { song: Song; light?: boolean }) {
  const { isLiked, toggleLike } = useLikedSongs()
  const { open } = useAdaptiveMenu()
  const liked = isLiked(song.id)
  return (
    <View style={s.rowIcons}>
      <TouchableOpacity onPress={() => toggleLike(song.id)} hitSlop={8}>
        <Ionicons
          name={liked ? 'heart' : 'heart-outline'}
          size={22}
          color={liked ? (light ? '#fff' : C.cyan) : '#fff'}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => open({ kind: 'song', song })} hitSlop={8}>
        <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  )
}

export default function OliviaMusicTab() {
  const router = useRouter()
  const { playSongAt } = usePlaybackState()
  const { showConfirmation, activeTheme } = useAdaptiveUI()
  const isSuperFan = isOliviaSuperFanTheme(activeTheme)
  const { open: openMenu } = useAdaptiveMenu()
  const { activeProfile } = useProfiles()
  const isCasual = !!activeProfile.casual
  const [favTab, setFavTab] = useState(0) // 0 = recent, 1 = all-time

  const songs = useMemo(() => allSongs.filter(sg => sg.artistId === 'olivia-rodrigo'), [])

  const play = (id: string) => {
    playSongAt(id)
    router.push('/now-playing' as any)
  }

  const albums = useMemo(() => {
    const seen = new Map<string, { album: string; artKey: string; firstSongId: string }>()
    for (const sg of songs) {
      if (!seen.has(sg.album)) seen.set(sg.album, { album: sg.album, artKey: sg.albumArtPath ?? '', firstSongId: sg.id })
    }
    return Array.from(seen.values())
  }, [songs])

  // Pop-adjacent artists her fans actually overlap with.
  const fans = useMemo(
    () =>
      ['sabrina-carpenter', 'tate-mcrae', 'noah-kahan', 'olivia-dean', 'sombr', 'lorde']
        .map(id => artists.find(a => a.id === id))
        .filter((a): a is (typeof artists)[0] => a != null),
    [],
  )

  // Playlists that genuinely contain her tracks — hers vs editorial.
  const oliviaPlaylists = useMemo(() => {
    const withOlivia = playlists.filter(pl => pl.songIds?.some(id => id.startsWith('s-or')))
    return {
      yours: withOlivia.filter(pl => pl.curatorType === 'user'),
      featuring: withOlivia.filter(pl => pl.curatorType !== 'user'),
    }
  }, [])

  const newAlbumSong = songs.find(sg => sg.id === 's-or8') ?? songs[0]
  const recentFavs = byIds(['s-or8', 's-or-new1', 's-or10'])
  const allTimeFavs = byIds(['s-or1', 's-or2', 's-or4'])
  const forgottenFavs = byIds(['s-or3', 's-or5', 's-or7'])
  const FORGOTTEN_PLAYS = [21, 18, 24]
  const favorites = (favTab === 0 ? recentFavs : favTab === 1 ? allTimeFavs : forgottenFavs).slice(0, 3)
  const popular = byIds(['s-or1', 's-or2', 's-or4', 's-or-sour-02', 's-or3', 's-or-sour-01'])
  const popularPages = chunk(popular, POP_SONGS_PER_PAGE)
  const popularSnapOffsets = popularPages.map((_, i) => i * POP_PAGE_WIDTH)
  const hidden = byIds(['s-or-sour-04', 's-or-guts-02', 's-or-guts-05'])

  const updates = [
    { t: 'the cure', sub: 'New music video', k: 'olivia-rodrigo-guts', onPress: () => play(newAlbumSong.id) },
    { t: 'The Tonight Show', sub: 'Olivia reveals new details', k: 'olivia-rodrigo-hero', onPress: () => showConfirmation('Opens in Prime Video') },
    { t: 'Glossier.', sub: 'First-ever brand partner', k: 'olivia-rodrigo-sour', onPress: () => showConfirmation('Opens the Glossier collab shop') },
    { t: 'GUTS Tour', sub: '12 new cities added', k: 'olivia-rodrigo-guts', onPress: () => showConfirmation('Tour dates are on the Events tab') },
  ]

  const stations = albums.slice(0, 4).map(al => ({
    name: `${al.album} Radio`,
    artKey: al.artKey,
    songId: al.firstSongId,
  }))

  // Casual-listener recommendations: other Olivia songs the user hasn't focused on yet.
  // Drawn from her deeper catalog so it reads as "based on what you've already liked of hers."
  const recommended = useMemo(
    () => allSongs.filter(sg => sg.artistId === 'olivia-rodrigo').slice(0, 8),
    [],
  )

  // Casual "Fan Favorites" — iconic songs that every Olivia fan knows, shown as a card rail.
  const fanFavs = byIds(['s-or1', 's-or2', 's-or4', 's-or8', 's-or10', 's-or11'])

  const playVideo = (title: string) => {
    const related = songs.find(sg => title.toLowerCase().includes(sg.title.toLowerCase()))
    if (related) play(related.id)
    else showConfirmation('Full videos come with the real app')
  }

  // ── Casual-listener (KSM) layout ────────────────────────────────────────────
  if (isCasual) {
    return (
      <View style={s.wrap}>

        {/* 1. New Album feature banner */}
        <View style={s.pad}>
          <TouchableOpacity style={s.newAlbumCard} activeOpacity={0.88} onPress={() => play(newAlbumSong.id)}>
            <Image source={resolveArt(newAlbumSong.albumArtPath)} style={StyleSheet.absoluteFill} resizeMode="cover" blurRadius={12} />
            <View style={s.newAlbumScrim} />
            <View style={s.newAlbumRow}>
              <Image source={resolveArt(newAlbumSong.albumArtPath)} style={s.newAlbumCover} resizeMode="cover" />
              <View style={{ flex: 1 }}>
                <Text style={s.newAlbumEyebrow}>NEW ALBUM</Text>
                <Text style={s.newAlbumTitle} numberOfLines={2}>{newAlbumSong.album}</Text>
                <Text style={s.newAlbumSub} numberOfLines={1}>Olivia's back with her new album</Text>
              </View>
            </View>
            <TouchableOpacity hitSlop={8} onPress={() => openMenu({ kind: 'song', song: newAlbumSong })} style={s.newAlbumMore}>
              <Ionicons name="ellipsis-horizontal" size={16} color="#fff" />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* 3. Top Albums */}
        <View style={s.section}>
          <SectionHead title="Top Albums" seeMore={false} />
          <EdgeFadeRow>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
              {OLIVIA_TOP_ALBUMS.map((al, i) => (
                <TouchableOpacity key={al.id} style={s.discCard} activeOpacity={0.85} onPress={() => router.push(`/album/${al.id}` as any)}>
                  <Image source={resolveArt(al.artKey)} style={s.discArt} resizeMode="cover" />
                  <Text style={s.discTitle} numberOfLines={1}>{i + 1}. {al.title}</Text>
                  <Text style={s.discMeta} numberOfLines={1}>{al.subtitle}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </EdgeFadeRow>
        </View>

        {/* 4. Popular */}
        <View style={s.section}>
          <SectionHead title="Popular" seeMore={false} />
          <EdgeFadeRow>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              decelerationRate="normal"
              snapToOffsets={popularSnapOffsets}
              snapToAlignment="start"
              nestedScrollEnabled
              contentContainerStyle={[s.popScrollContent, { paddingRight: POP_PAGE_PEEK }]}
            >
              {popularPages.map((page, pageIdx) => (
                <View key={`pop-page-${pageIdx}`} style={[s.popPage, { width: POP_PAGE_WIDTH }]}>
                  {page.map((sg, i) => {
                    const globalIdx = pageIdx * POP_SONGS_PER_PAGE + i
                    return (
                      <TouchableOpacity key={sg.id} style={s.popRow} activeOpacity={0.8} onPress={() => play(sg.id)}>
                        <Image source={resolveArt(sg.albumArtPath)} style={s.popThumb} resizeMode="cover" />
                        <View style={{ flex: 1 }}>
                          <View style={s.popTitleRow}>
                            <Text style={s.popTitle} numberOfLines={1}>{globalIdx + 1}. {sg.title}</Text>
                            {globalIdx === 0 ? <ExplicitTag /> : null}
                          </View>
                          <Text style={s.popMeta} numberOfLines={1}>Olivia Rodrigo • {fmtStreams(STREAMS[globalIdx] ?? 100000)}</Text>
                        </View>
                        <RowIcons song={sg} />
                      </TouchableOpacity>
                    )
                  })}
                </View>
              ))}
            </ScrollView>
          </EdgeFadeRow>
          <TouchableOpacity
            style={[s.discographyLink, s.pad]}
            activeOpacity={0.7}
            onPress={() => router.push('/artist-discography/olivia-rodrigo' as any)}
          >
            <Text style={s.discographyLinkText}>Explore full discography</Text>
            <Ionicons name="chevron-forward" size={14} color={C.cyan} />
          </TouchableOpacity>
        </View>

        {/* 5. Based on what you liked — Olivia songs recommended from her catalog */}
        <View style={s.section}>
          <SectionHead
            title="Based on what you liked"
            sub="Recommendations based on other songs you liked"
            onSeeMore={() => showConfirmation('Opens your full recommendations')}
          />
          <EdgeFadeRow>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
              {recommended.map(sg => (
                <TouchableOpacity key={sg.id} style={s.discCard} activeOpacity={0.85} onPress={() => play(sg.id)}>
                  <Image source={resolveArt(sg.albumArtPath)} style={s.discArt} resizeMode="cover" />
                  <Text style={s.discTitle} numberOfLines={1}>{sg.title}</Text>
                  <Text style={s.discMeta} numberOfLines={1}>{sg.album}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </EdgeFadeRow>
        </View>

        {/* 6. Fan Favorites */}
        <View style={s.section}>
          <SectionHead title="Fan Favorites" sub="Songs fans can't stop playing" />
          <EdgeFadeRow>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
              {fanFavs.map(sg => (
                <TouchableOpacity key={sg.id} style={s.discCard} activeOpacity={0.85} onPress={() => play(sg.id)}>
                  <Image source={resolveArt(sg.albumArtPath)} style={s.discArt} resizeMode="cover" />
                  <Text style={s.discTitle} numberOfLines={1}>{sg.title}</Text>
                  <Text style={s.discMeta} numberOfLines={1}>{sg.album}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </EdgeFadeRow>
        </View>

        {/* 6. Related Artists */}
        <View style={s.section}>
          <SectionHead title="Related Artists" />
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

        {/* 7. Playlists featuring Olivia (editorial only — no "your" playlists for casual users) */}
        {oliviaPlaylists.featuring.length > 0 && (
          <View style={s.section}>
            <SectionHead title="Playlists featuring Olivia" />
            <EdgeFadeRow>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
                {oliviaPlaylists.featuring.map(pl => (
                  <TouchableOpacity key={pl.id} style={s.discCard} activeOpacity={0.85} onPress={() => router.push(`/playlist/${pl.id}` as any)}>
                    <Image source={resolveArt(pl.coverArtPath)} style={s.discArt} resizeMode="cover" />
                    <Text style={s.discTitle} numberOfLines={1}>{pl.name}</Text>
                    <Text style={s.discMeta} numberOfLines={1}>Playlist • {pl.songIds?.length ?? pl.songCount} songs</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </EdgeFadeRow>
          </View>
        )}

        {/* 8. Podcasts about Olivia Rodrigo */}
        <View style={s.section}>
          <SectionHead title="Podcasts about Olivia Rodrigo" seeMore={false} />
          <EdgeFadeRow>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
              {OLIVIA_PODCASTS.map(pod => (
                <TouchableOpacity key={pod.id} style={s.discCard} activeOpacity={0.85} onPress={() => router.push(`/podcast-show/${pod.id}` as any)}>
                  <View>
                    <Image source={resolveArt(pod.coverArtPath)} style={s.discArt} resizeMode="cover" />
                    <View style={s.micBadge}>
                      <Ionicons name="mic-outline" size={26} color="#fff" />
                    </View>
                  </View>
                  <Text style={s.discTitle} numberOfLines={1}>{pod.title}</Text>
                  <Text style={s.discMeta} numberOfLines={1}>{pod.host}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </EdgeFadeRow>
        </View>

        {/* 9. Related Radio Stations */}
        <View style={s.section}>
          <SectionHead title="Related Radio Stations" />
          <EdgeFadeRow>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
              {stations.map(st => (
                <TouchableOpacity key={st.name} style={s.discCard} activeOpacity={0.85} onPress={() => play(st.songId)}>
                  <View>
                    <Image source={resolveArt(st.artKey)} style={s.discArt} resizeMode="cover" />
                    <View style={s.radioBadge}>
                      <Ionicons name="radio-outline" size={26} color="#fff" />
                    </View>
                  </View>
                  <Text style={s.discTitle} numberOfLines={1}>{st.name}</Text>
                  <Text style={s.discMeta} numberOfLines={1}>Station • Olivia Rodrigo</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </EdgeFadeRow>
        </View>

        {/* 10. All Releases — no listening-history framing; SEE MORE → discography */}
        <View style={[s.section, { marginBottom: 8 }]}>
          <SectionHead title="All Releases" onSeeMore={() => router.push('/artist-discography/olivia-rodrigo' as any)} />
          <EdgeFadeRow>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
              {albums.map(al => (
                <TouchableOpacity key={al.album} style={s.discCard} activeOpacity={0.85} onPress={() => play(al.firstSongId)}>
                  <Image source={resolveArt(al.artKey)} style={s.discArt} resizeMode="cover" />
                  <Text style={s.discTitle} numberOfLines={1}>{al.album}</Text>
                  <Text style={s.discMeta} numberOfLines={1}>Album • {ALBUM_YEARS[al.album] ?? '2024'}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </EdgeFadeRow>
        </View>

      </View>
    )
  }
  // ── End casual layout ────────────────────────────────────────────────────────

  // ── Superfan (olivia-rodrigo-superfan theme) layout ──────────────────────────
  if (isSuperFan) {
  return (
    <View style={s.wrap}>
      {/* 1. New Album feature banner */}
      <View style={s.pad}>
        <TouchableOpacity style={s.newAlbumCard} activeOpacity={0.88} onPress={() => play(newAlbumSong.id)}>
          <Image source={resolveArt(newAlbumSong.albumArtPath)} style={StyleSheet.absoluteFill} resizeMode="cover" blurRadius={12} />
          <View style={s.newAlbumScrim} />
          <View style={s.newAlbumRow}>
            <Image source={resolveArt(newAlbumSong.albumArtPath)} style={s.newAlbumCover} resizeMode="cover" />
            <View style={{ flex: 1 }}>
              <Text style={s.newAlbumEyebrow}>NEW ALBUM</Text>
              <Text style={s.newAlbumTitle} numberOfLines={2}>{newAlbumSong.album}</Text>
              <Text style={s.newAlbumSub} numberOfLines={1}>Olivia's back with her new album</Text>
            </View>
          </View>
          <TouchableOpacity hitSlop={8} onPress={() => openMenu({ kind: 'song', song: newAlbumSong })} style={s.newAlbumMore}>
            <Ionicons name="ellipsis-horizontal" size={16} color="#fff" />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      {/* 2. Since Your Last Visit — cards sit at slight angles, per the design */}
      <View style={s.section}>
        <SectionHead title="Since Your Last Visit" sub="Catching you up on Olivia Rodrigo" />
        <SinceUpdateRail updates={updates} resolveArt={resolveArt} />
      </View>

      {/* 4. Your Favorites */}
      <View style={s.section}>
        <View style={s.pad}><Text style={s.title}>Your Favorites</Text></View>
        <View style={[s.pad, { marginTop: 12 }]}>
          <View style={s.favTabs}>
            {(['Recent Favorites', 'All Time Favorites', 'Forgotten Favorites'] as const).map((t, i) => (
              <TouchableOpacity
                key={t}
                style={[s.favTab, favTab === i && s.favTabActive]}
                activeOpacity={0.85}
                onPress={() => setFavTab(i)}
              >
                <Text style={[s.favTabText, favTab === i && s.favTabTextActive]} numberOfLines={1} adjustsFontSizeToFit>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {favTab === 2 ? (
          <View style={[s.pad, { marginTop: 12 }]}>
            <View style={s.forgottenCardWrap}>
              {favorites.map((sg, i) => (
                <TouchableOpacity key={sg.id} activeOpacity={0.85} onPress={() => play(sg.id)}>
                  <View style={s.favRow}>
                    <Image source={resolveArt(sg.albumArtPath)} style={StyleSheet.absoluteFill} resizeMode="cover" blurRadius={12} />
                    <LinearGradient colors={['rgba(0,0,0,0.10)', 'rgba(0,0,0,0.42)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
                    <Text style={s.favRank}>{i + 1}</Text>
                    <Image source={resolveArt(sg.albumArtPath)} style={s.favCover} resizeMode="cover" />
                    <View style={{ flex: 1 }}>
                      <Text style={s.favTitle} numberOfLines={1}>{sg.title}</Text>
                      <Text style={s.favPlays}>{FORGOTTEN_PLAYS[i]} plays</Text>
                    </View>
                    <RowIcons song={sg} light />
                  </View>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={s.mixBtnOutline}
                activeOpacity={0.85}
                onPress={() => favorites[0] && play(favorites[0].id)}
              >
                <Text style={s.mixBtnOutlineText}>Play Your Mix</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={[s.pad, { marginTop: 12, gap: 12 }]}>
            {favorites.map((sg, i) => (
              <TouchableOpacity key={sg.id} activeOpacity={0.85} onPress={() => play(sg.id)}>
                <View style={s.favRow}>
                  <Image source={resolveArt(sg.albumArtPath)} style={StyleSheet.absoluteFill} resizeMode="cover" blurRadius={18} />
                  <LinearGradient colors={['rgba(0,0,0,0.25)', 'rgba(0,0,0,0.60)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
                  <Text style={s.favRank}>{i + 1}</Text>
                  <Image source={resolveArt(sg.albumArtPath)} style={s.favCover} resizeMode="cover" />
                  <View style={{ flex: 1 }}>
                    <Text style={s.favTitle} numberOfLines={1}>{sg.title}</Text>
                    <Text style={s.favPlays}>{PLAYS[i]} plays</Text>
                  </View>
                  <RowIcons song={sg} light />
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={s.mixBtnOutline}
              activeOpacity={0.85}
              onPress={() => favorites[0] && play(favorites[0].id)}
            >
              <Text style={s.mixBtnOutlineText}>Play Your Mix</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Your playlists with Olivia */}
      {oliviaPlaylists.yours.length > 0 && (
        <View style={s.section}>
          <SectionHead title="Your playlists with Olivia" />
          <EdgeFadeRow>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
              {oliviaPlaylists.yours.map(pl => (
                <TouchableOpacity key={pl.id} style={s.discCard} activeOpacity={0.85} onPress={() => router.push(`/playlist/${pl.id}` as any)}>
                  <Image source={resolveArt(pl.coverArtPath)} style={s.discArt} resizeMode="cover" />
                  <Text style={s.discTitle} numberOfLines={1}>{pl.name}</Text>
                  <Text style={s.discMeta} numberOfLines={1}>Playlist • {pl.songIds?.length ?? pl.songCount} songs</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </EdgeFadeRow>
        </View>
      )}

      {/* Playlist featuring Olivia */}
      {oliviaPlaylists.featuring.length > 0 && (
        <View style={s.section}>
          <SectionHead title="Playlist featuring Olivia" />
          <EdgeFadeRow>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
              {oliviaPlaylists.featuring.map(pl => (
                <TouchableOpacity key={pl.id} style={s.discCard} activeOpacity={0.85} onPress={() => router.push(`/playlist/${pl.id}` as any)}>
                  <Image source={resolveArt(pl.coverArtPath)} style={s.discArt} resizeMode="cover" />
                  <Text style={s.discTitle} numberOfLines={1}>{pl.name}</Text>
                  <Text style={s.discMeta} numberOfLines={1}>Playlist • {pl.songIds?.length ?? pl.songCount} songs</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </EdgeFadeRow>
        </View>
      )}

      {/* 5. Hidden Gems */}
      <View style={s.section}>
        <SectionHead title="Hidden Gems" sub={`Found ${hidden.length} hidden gems for you`} subCyan />
        <View style={s.pad}>
          {hidden.map(sg => (
            <TouchableOpacity key={sg.id} style={s.popRow} activeOpacity={0.8} onPress={() => play(sg.id)}>
              <Image source={resolveArt(sg.albumArtPath)} style={s.popCover} resizeMode="cover" />
              <View style={{ flex: 1 }}>
                <Text style={s.popTitle} numberOfLines={1}>{sg.title}</Text>
                <Text style={s.popMeta} numberOfLines={1}>Olivia Rodrigo</Text>
              </View>
              <RowIcons song={sg} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 6. Top Albums */}
      <View style={s.section}>
        <SectionHead title="Top Albums" sub="Most streamed worldwide on Amazon Music" seeMore={false} />
        <EdgeFadeRow>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
            {OLIVIA_TOP_ALBUMS.map((al, i) => (
              <TouchableOpacity key={al.id} style={s.discCard} activeOpacity={0.85} onPress={() => router.push(`/album/${al.id}` as any)}>
                <Image source={resolveArt(al.artKey)} style={s.discArt} resizeMode="cover" />
                <Text style={s.discTitle} numberOfLines={1}>{i + 1}. {al.title}</Text>
                <Text style={s.discMeta} numberOfLines={1}>{al.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </EdgeFadeRow>
      </View>

      {/* 7. Popular — paged horizontal scroll, 3 rows per page */}
      <View style={s.section}>
        <SectionHead title="Popular" seeMore={false} />
        <EdgeFadeRow>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="normal"
            snapToOffsets={popularSnapOffsets}
            snapToAlignment="start"
            nestedScrollEnabled
            contentContainerStyle={[s.popScrollContent, { paddingRight: POP_PAGE_PEEK }]}
          >
            {popularPages.map((page, pageIdx) => (
              <View key={`pop-page-${pageIdx}`} style={[s.popPage, { width: POP_PAGE_WIDTH }]}>
                {page.map((sg, i) => {
                  const globalIdx = pageIdx * POP_SONGS_PER_PAGE + i
                  return (
                    <TouchableOpacity key={sg.id} style={s.popRow} activeOpacity={0.8} onPress={() => play(sg.id)}>
                      <Image source={resolveArt(sg.albumArtPath)} style={s.popThumb} resizeMode="cover" />
                      <View style={{ flex: 1 }}>
                        <View style={s.popTitleRow}>
                          <Text style={s.popTitle} numberOfLines={1}>{globalIdx + 1}. {sg.title}</Text>
                          {globalIdx === 0 ? <ExplicitTag /> : null}
                        </View>
                        <Text style={s.popMeta} numberOfLines={1}>Olivia Rodrigo • {fmtStreams(STREAMS[globalIdx] ?? 100000)}</Text>
                      </View>
                      <RowIcons song={sg} />
                    </TouchableOpacity>
                  )
                })}
              </View>
            ))}
          </ScrollView>
        </EdgeFadeRow>
        <TouchableOpacity
          style={[s.discographyLink, s.pad]}
          activeOpacity={0.7}
          onPress={() => router.push('/artist-discography/olivia-rodrigo' as any)}
        >
          <Text style={s.discographyLinkText}>Explore full discography</Text>
          <Ionicons name="chevron-forward" size={14} color={C.cyan} />
        </TouchableOpacity>
      </View>

      {/* 8. Olivia Music Videos */}
      <View style={s.section}>
        <SectionHead title="Olivia Music Videos" />
        <EdgeFadeRow>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
            {OLIVIA_ABOUT_VIDEOS.map(v => (
              <TouchableOpacity key={v.id} style={s.videoCard} activeOpacity={0.85} onPress={() => playVideo(v.title)}>
                <View style={s.videoThumbWrap}>
                  <Image source={resolveArt(v.artKey)} style={s.videoThumb} resizeMode="cover" />
                  <View style={[s.artBorderOverlay, { borderRadius: 11 }]} pointerEvents="none" />
                  <View style={s.videoPlayCircle}>
                    <Ionicons name="play" size={14} color="#fff" style={{ marginLeft: 2 }} />
                  </View>
                  <View style={s.videoDurPill}>
                    <Text style={s.videoDurText}>{v.duration}</Text>
                  </View>
                </View>
                <Text style={s.videoTitle} numberOfLines={2}>{v.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </EdgeFadeRow>
      </View>

      {/* 9. Discography */}
      <View style={s.section}>
        <SectionHead title="All Releases" sub="Based on your listening history" seeMore={false} />
        <EdgeFadeRow>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
            {albums.map(al => (
              <TouchableOpacity key={al.album} style={s.discCard} activeOpacity={0.85} onPress={() => play(al.firstSongId)}>
                <Image source={resolveArt(al.artKey)} style={s.discArt} resizeMode="cover" />
                <Text style={s.discTitle} numberOfLines={1}>{al.album}</Text>
                <Text style={s.discMeta} numberOfLines={1}>Album • {ALBUM_YEARS[al.album] ?? '2024'}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </EdgeFadeRow>
      </View>

      {/* Related Radio Stations */}
      <View style={s.section}>
        <SectionHead title="Related Radio Stations" />
        <EdgeFadeRow>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
            {stations.map(st => (
              <TouchableOpacity key={st.name} style={s.discCard} activeOpacity={0.85} onPress={() => play(st.songId)}>
                <View>
                  <Image source={resolveArt(st.artKey)} style={s.discArt} resizeMode="cover" />
                  <View style={s.radioBadge}>
                    <Ionicons name="radio-outline" size={26} color="#fff" />
                  </View>
                </View>
                <Text style={s.discTitle} numberOfLines={1}>{st.name}</Text>
                <Text style={s.discMeta} numberOfLines={1}>Station • Olivia Rodrigo</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </EdgeFadeRow>
      </View>

      {/* 10. Podcasts about Olivia Rodrigo */}
      <View style={s.section}>
        <SectionHead title="Podcasts about Olivia Rodrigo" seeMore={false} />
        <EdgeFadeRow>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
            {OLIVIA_PODCASTS.map(pod => (
              <TouchableOpacity key={pod.id} style={s.discCard} activeOpacity={0.85} onPress={() => router.push(`/podcast-show/${pod.id}` as any)}>
                <View>
                  <Image source={resolveArt(pod.coverArtPath)} style={s.discArt} resizeMode="cover" />
                  <View style={s.micBadge}>
                    <Ionicons name="mic-outline" size={26} color="#fff" />
                  </View>
                </View>
                <Text style={s.discTitle} numberOfLines={1}>{pod.title}</Text>
                <Text style={s.discMeta} numberOfLines={1}>{pod.host}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </EdgeFadeRow>
      </View>

      {/* 11. Fans also love */}
      <View style={[s.section, { marginBottom: 8 }]}>
        <SectionHead title="Fans also love" />
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
    </View>
  )
  }
  // ── End superfan layout ───────────────────────────────────────────────────────

  // ── Regular (non-superfan, non-casual) layout ─────────────────────────────────
  return (
    <View style={s.wrap}>
      {/* 1. New Album feature banner */}
      <View style={s.pad}>
        <TouchableOpacity style={s.newAlbumCard} activeOpacity={0.88} onPress={() => play(newAlbumSong.id)}>
          <Image source={resolveArt(newAlbumSong.albumArtPath)} style={StyleSheet.absoluteFill} resizeMode="cover" blurRadius={12} />
          <View style={s.newAlbumScrim} />
          <View style={s.newAlbumRow}>
            <Image source={resolveArt(newAlbumSong.albumArtPath)} style={s.newAlbumCover} resizeMode="cover" />
            <View style={{ flex: 1 }}>
              <Text style={s.newAlbumEyebrow}>NEW ALBUM</Text>
              <Text style={s.newAlbumTitle} numberOfLines={2}>{newAlbumSong.album}</Text>
              <Text style={s.newAlbumSub} numberOfLines={1}>Olivia's back with her new album</Text>
            </View>
          </View>
          <TouchableOpacity hitSlop={8} onPress={() => openMenu({ kind: 'song', song: newAlbumSong })} style={s.newAlbumMore}>
            <Ionicons name="ellipsis-horizontal" size={16} color="#fff" />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      {/* 2. Since Your Last Visit */}
      <View style={s.section}>
        <SectionHead title="Since Your Last Visit" sub="Catching you up on Olivia Rodrigo" />
        <SinceUpdateRail updates={updates} resolveArt={resolveArt} />
      </View>

      {/* 3. All Releases */}
      <View style={s.section}>
        <SectionHead title="All Releases" sub="Based on your listening history" seeMore={false} />
        <EdgeFadeRow>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
            {albums.map(al => (
              <TouchableOpacity key={al.album} style={s.discCard} activeOpacity={0.85} onPress={() => play(al.firstSongId)}>
                <Image source={resolveArt(al.artKey)} style={s.discArt} resizeMode="cover" />
                <Text style={s.discTitle} numberOfLines={1}>{al.album}</Text>
                <Text style={s.discMeta} numberOfLines={1}>Album • {ALBUM_YEARS[al.album] ?? '2024'}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </EdgeFadeRow>
      </View>

      {/* 4. Popular */}
      <View style={s.section}>
        <SectionHead title="Popular" seeMore={false} />
        <EdgeFadeRow>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="normal"
            snapToOffsets={popularSnapOffsets}
            snapToAlignment="start"
            nestedScrollEnabled
            contentContainerStyle={[s.popScrollContent, { paddingRight: POP_PAGE_PEEK }]}
          >
            {popularPages.map((page, pageIdx) => (
              <View key={`pop-page-${pageIdx}`} style={[s.popPage, { width: POP_PAGE_WIDTH }]}>
                {page.map((sg, i) => {
                  const globalIdx = pageIdx * POP_SONGS_PER_PAGE + i
                  return (
                    <TouchableOpacity key={sg.id} style={s.popRow} activeOpacity={0.8} onPress={() => play(sg.id)}>
                      <Image source={resolveArt(sg.albumArtPath)} style={s.popThumb} resizeMode="cover" />
                      <View style={{ flex: 1 }}>
                        <View style={s.popTitleRow}>
                          <Text style={s.popTitle} numberOfLines={1}>{globalIdx + 1}. {sg.title}</Text>
                          {globalIdx === 0 ? <ExplicitTag /> : null}
                        </View>
                        <Text style={s.popMeta} numberOfLines={1}>Olivia Rodrigo • {fmtStreams(STREAMS[globalIdx] ?? 100000)}</Text>
                      </View>
                      <RowIcons song={sg} />
                    </TouchableOpacity>
                  )
                })}
              </View>
            ))}
          </ScrollView>
        </EdgeFadeRow>
        <TouchableOpacity
          style={[s.discographyLink, s.pad]}
          activeOpacity={0.7}
          onPress={() => router.push('/artist-discography/olivia-rodrigo' as any)}
        >
          <Text style={s.discographyLinkText}>Explore full discography</Text>
          <Ionicons name="chevron-forward" size={14} color={C.cyan} />
        </TouchableOpacity>
      </View>

      {/* 5. Based on what you like */}
      <View style={s.section}>
        <SectionHead title="Based on what you like" sub="Picked from your Olivia listening history" subCyan />
        <View style={s.pad}>
          {hidden.map(sg => (
            <TouchableOpacity key={sg.id} style={s.popRow} activeOpacity={0.8} onPress={() => play(sg.id)}>
              <Image source={resolveArt(sg.albumArtPath)} style={s.popCover} resizeMode="cover" />
              <View style={{ flex: 1 }}>
                <Text style={s.popTitle} numberOfLines={1}>{sg.title}</Text>
                <Text style={s.popMeta} numberOfLines={1}>Olivia Rodrigo</Text>
              </View>
              <RowIcons song={sg} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 6. Fan Favorites */}
      <View style={s.section}>
        <View style={s.pad}><Text style={s.title}>Fan Favorites</Text></View>
        <View style={[s.pad, { marginTop: 12 }]}>
          <View style={s.favTabs}>
            {(['Recent Favorites', 'All Time Favorites', 'Forgotten Favorites'] as const).map((t, i) => (
              <TouchableOpacity
                key={t}
                style={[s.favTab, favTab === i && s.favTabActive]}
                activeOpacity={0.85}
                onPress={() => setFavTab(i)}
              >
                <Text style={[s.favTabText, favTab === i && s.favTabTextActive]} numberOfLines={1} adjustsFontSizeToFit>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {favTab === 2 ? (
          <View style={[s.pad, { marginTop: 12 }]}>
            <View style={s.forgottenCardWrap}>
              {favorites.map((sg, i) => (
                <TouchableOpacity key={sg.id} activeOpacity={0.85} onPress={() => play(sg.id)}>
                  <View style={s.favRow}>
                    <Image source={resolveArt(sg.albumArtPath)} style={StyleSheet.absoluteFill} resizeMode="cover" blurRadius={12} />
                    <LinearGradient colors={['rgba(0,0,0,0.10)', 'rgba(0,0,0,0.42)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
                    <Text style={s.favRank}>{i + 1}</Text>
                    <Image source={resolveArt(sg.albumArtPath)} style={s.favCover} resizeMode="cover" />
                    <View style={{ flex: 1 }}>
                      <Text style={s.favTitle} numberOfLines={1}>{sg.title}</Text>
                      <Text style={s.favPlays}>{FORGOTTEN_PLAYS[i]} plays</Text>
                    </View>
                    <RowIcons song={sg} light />
                  </View>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={s.mixBtnOutline}
                activeOpacity={0.85}
                onPress={() => favorites[0] && play(favorites[0].id)}
              >
                <Text style={s.mixBtnOutlineText}>Play Your Mix</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={[s.pad, { marginTop: 12, gap: 12 }]}>
            {favorites.map((sg, i) => (
              <TouchableOpacity key={sg.id} activeOpacity={0.85} onPress={() => play(sg.id)}>
                <View style={s.favRow}>
                  <Image source={resolveArt(sg.albumArtPath)} style={StyleSheet.absoluteFill} resizeMode="cover" blurRadius={18} />
                  <LinearGradient colors={['rgba(0,0,0,0.25)', 'rgba(0,0,0,0.60)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
                  <Text style={s.favRank}>{i + 1}</Text>
                  <Image source={resolveArt(sg.albumArtPath)} style={s.favCover} resizeMode="cover" />
                  <View style={{ flex: 1 }}>
                    <Text style={s.favTitle} numberOfLines={1}>{sg.title}</Text>
                    <Text style={s.favPlays}>{PLAYS[i]} plays</Text>
                  </View>
                  <RowIcons song={sg} light />
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={s.mixBtnOutline}
              activeOpacity={0.85}
              onPress={() => favorites[0] && play(favorites[0].id)}
            >
              <Text style={s.mixBtnOutlineText}>Play Your Mix</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 7. Olivia Music Videos */}
      <View style={s.section}>
        <SectionHead title="Olivia Music Videos" />
        <EdgeFadeRow>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
            {OLIVIA_ABOUT_VIDEOS.map(v => (
              <TouchableOpacity key={v.id} style={s.videoCard} activeOpacity={0.85} onPress={() => playVideo(v.title)}>
                <View style={s.videoThumbWrap}>
                  <Image source={resolveArt(v.artKey)} style={s.videoThumb} resizeMode="cover" />
                  <View style={[s.artBorderOverlay, { borderRadius: 11 }]} pointerEvents="none" />
                  <View style={s.videoPlayCircle}>
                    <Ionicons name="play" size={14} color="#fff" style={{ marginLeft: 2 }} />
                  </View>
                  <View style={s.videoDurPill}>
                    <Text style={s.videoDurText}>{v.duration}</Text>
                  </View>
                </View>
                <Text style={s.videoTitle} numberOfLines={2}>{v.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </EdgeFadeRow>
      </View>

      {/* 8. Related Radio Stations */}
      <View style={s.section}>
        <SectionHead title="Related Radio Stations" sub="Olivia Rodrigo stations" />
        <EdgeFadeRow>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
            {stations.map(st => (
              <TouchableOpacity key={st.name} style={s.discCard} activeOpacity={0.85} onPress={() => play(st.songId)}>
                <View>
                  <Image source={resolveArt(st.artKey)} style={s.discArt} resizeMode="cover" />
                  <View style={s.radioBadge}>
                    <Ionicons name="radio-outline" size={26} color="#fff" />
                  </View>
                </View>
                <Text style={s.discTitle} numberOfLines={1}>{st.name}</Text>
                <Text style={s.discMeta} numberOfLines={1}>Station • Olivia Rodrigo</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </EdgeFadeRow>
      </View>

      {/* Your playlists with Olivia */}
      {oliviaPlaylists.yours.length > 0 && (
        <View style={s.section}>
          <SectionHead title="Your playlists with Olivia" />
          <EdgeFadeRow>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
              {oliviaPlaylists.yours.map(pl => (
                <TouchableOpacity key={pl.id} style={s.discCard} activeOpacity={0.85} onPress={() => router.push(`/playlist/${pl.id}` as any)}>
                  <Image source={resolveArt(pl.coverArtPath)} style={s.discArt} resizeMode="cover" />
                  <Text style={s.discTitle} numberOfLines={1}>{pl.name}</Text>
                  <Text style={s.discMeta} numberOfLines={1}>Playlist • {pl.songIds?.length ?? pl.songCount} songs</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </EdgeFadeRow>
        </View>
      )}

      {/* Playlist featuring Olivia */}
      {oliviaPlaylists.featuring.length > 0 && (
        <View style={s.section}>
          <SectionHead title="Playlist featuring Olivia" />
          <EdgeFadeRow>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
              {oliviaPlaylists.featuring.map(pl => (
                <TouchableOpacity key={pl.id} style={s.discCard} activeOpacity={0.85} onPress={() => router.push(`/playlist/${pl.id}` as any)}>
                  <Image source={resolveArt(pl.coverArtPath)} style={s.discArt} resizeMode="cover" />
                  <Text style={s.discTitle} numberOfLines={1}>{pl.name}</Text>
                  <Text style={s.discMeta} numberOfLines={1}>Playlist • {pl.songIds?.length ?? pl.songCount} songs</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </EdgeFadeRow>
        </View>
      )}

      {/* Top Albums */}
      <View style={s.section}>
        <SectionHead title="Top Albums" sub="Most streamed worldwide on Amazon Music" seeMore={false} />
        <EdgeFadeRow>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
            {OLIVIA_TOP_ALBUMS.map((al, i) => (
              <TouchableOpacity key={al.id} style={s.discCard} activeOpacity={0.85} onPress={() => router.push(`/album/${al.id}` as any)}>
                <Image source={resolveArt(al.artKey)} style={s.discArt} resizeMode="cover" />
                <Text style={s.discTitle} numberOfLines={1}>{i + 1}. {al.title}</Text>
                <Text style={s.discMeta} numberOfLines={1}>{al.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </EdgeFadeRow>
      </View>

      {/* Podcasts about Olivia Rodrigo */}
      <View style={[s.section, { marginBottom: 8 }]}>
        <SectionHead title="Podcasts about Olivia Rodrigo" seeMore={false} />
        <EdgeFadeRow>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
            {OLIVIA_PODCASTS.map(pod => (
              <TouchableOpacity key={pod.id} style={s.discCard} activeOpacity={0.85} onPress={() => router.push(`/podcast-show/${pod.id}` as any)}>
                <View>
                  <Image source={resolveArt(pod.coverArtPath)} style={s.discArt} resizeMode="cover" />
                  <View style={s.micBadge}>
                    <Ionicons name="mic-outline" size={26} color="#fff" />
                  </View>
                </View>
                <Text style={s.discTitle} numberOfLines={1}>{pod.title}</Text>
                <Text style={s.discMeta} numberOfLines={1}>{pod.host}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </EdgeFadeRow>
      </View>
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
  seeMore: { fontSize: 14, fontWeight: '700', color: GREY, marginTop: 2 },

  rail: { paddingHorizontal: 16, gap: 14 },
  updateRail: { paddingHorizontal: 16, paddingVertical: 22 },

  rowIcons: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  eTag: { backgroundColor: GREY, borderRadius: 3, width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  eTagText: { fontSize: 9, fontWeight: '700', color: '#000' },

  // New album banner
  newAlbumCard: { borderRadius: 4, overflow: 'hidden', padding: 12, flexDirection: 'row', alignItems: 'center' },
  newAlbumScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  newAlbumRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14 },
  newAlbumCover: { width: 81, height: 81, borderRadius: 4, borderWidth: 0.75, borderColor: 'rgba(255,255,255,0.24)' },
  newAlbumEyebrow: { fontSize: 12, fontWeight: '700', color: C.cyan },
  newAlbumTitle: { ...typeHeadline(16), color: '#fff', marginTop: 2 },
  newAlbumSub: { fontSize: 12, color: '#fff', marginTop: 3 },
  newAlbumMore: { marginLeft: 8, alignSelf: 'flex-start' },

  // Since your last visit (tilted cards)
  updateCard: { width: 205, height: 175, borderRadius: 16, overflow: 'hidden', justifyContent: 'flex-end' },
  updateMore: { position: 'absolute', top: 8, right: 10 },
  updateFooter: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 },
  updateTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  updateSub: { fontSize: 12, color: GREY, marginTop: 2 },

  // Your favorites toggle — stretches to fill the padded container
  favTabs: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 100, padding: 2, height: 39, alignSelf: 'stretch' },
  favTab: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 100, paddingHorizontal: 4 },
  favTabActive: { backgroundColor: C.cyan },
  favTabText: { fontSize: 12, color: '#fff' },
  favTabTextActive: { color: '#000', fontWeight: '600' },

  favRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, overflow: 'hidden' },
  favRank: { ...typeHeadline(32), color: '#fff', width: 20, textAlign: 'center' },
  favCover: { width: 63, height: 63, borderRadius: 4, borderWidth: 0.75, borderColor: 'rgba(255,255,255,0.24)' },
  favTitle: { ...typeHeadline(16), color: '#fff' },
  favPlays: { fontSize: 12, color: '#fff', marginTop: 2 },

  mixBtnOutline: { borderWidth: 1, borderColor: '#fff', borderRadius: 32, paddingVertical: 10, alignItems: 'center' },
  mixBtnOutlineText: { ...typeHeadline(14), color: '#fff' },

  // Forgotten Favorites card — per Figma node 915:9521
  forgottenCardWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 12,
    gap: 12,
  },
  forgottenRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 8 },
  forgottenPlays: { fontSize: 12, color: C.cyan, marginTop: 2 },
  mixBtnForgotten: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
    borderColor: GREY,
    borderRadius: 32,
    paddingVertical: 10,
    alignItems: 'center',
    overflow: 'hidden',
  },
  mixBtnForgottenText: { fontSize: 12, color: '#fff' },

  // Popular paged scroll
  popScrollContent: { paddingLeft: 16 },
  popPage: { paddingRight: 20 },

  // Popular / hidden rows
  popRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  popThumb: { width: 56, height: 56, borderRadius: 6, borderWidth: 0.75, borderColor: 'rgba(255,255,255,0.24)' },
  popCover: { width: 63, height: 63, borderRadius: 4, borderWidth: 0.75, borderColor: 'rgba(255,255,255,0.24)' },
  popTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  popTitle: { ...typeHeadline(16), color: '#fff', flexShrink: 1 },
  popMeta: { fontSize: 12, color: GREY, marginTop: 3 },

  // Discography link below Popular
  discographyLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 12 },
  discographyLinkText: { fontSize: 13, color: C.cyan },

  // Related Artists (formerly fans also like)
  fanCard: { alignItems: 'center', gap: 6, width: 150 },
  fanAvatar: { width: 150, height: 150, borderRadius: 75 },
  fanAvatarFallback: { backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  fanName: { ...typeHeadline(16), color: '#fff' },

  // Discography / playlist / station / album / podcast cards
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

  artBorderOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 0.75,
    borderColor: 'rgba(255,255,255,0.24)',
    borderRadius: 8,
  },

  // Amazon-curated playlist banner cards (side-by-side, half-width each)
  curatedRow: { flexDirection: 'row', gap: 10 },
  curatedCard: {
    flex: 1,
    height: 186,
    borderRadius: 14,
    overflow: 'hidden',
    padding: 12,
    justifyContent: 'flex-end',
  },
  curatedLogo: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 5,
  },
  curatedEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
    marginBottom: 4,
  },
  curatedTitle: { ...typeHeadline(20), color: '#fff', lineHeight: 24 },
  curatedPlayBtn: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Music videos (same video-card shape as the About tab)
  videoCard: { width: 169 },
  videoThumbWrap: { width: 169, height: 98, borderRadius: 11, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  videoThumb: { ...StyleSheet.absoluteFillObject },
  videoPlayCircle: {
    width: 34,
    height: 34,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.34)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoDurPill: {
    position: 'absolute',
    left: 10,
    bottom: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  videoDurText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  videoTitle: { fontSize: 13, fontWeight: '700', color: '#fff', marginTop: 9, lineHeight: 17 },
})
