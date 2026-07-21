import { useCallback, useMemo } from 'react'
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Text as SvgText } from 'react-native-svg'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '../AppText'
import { AppImage as Image } from '../AppImage'
import StickyHomeHeader, { useStickyHomeScroll } from '../StickyHomeHeader'
import EdgeFadeRow from '../EdgeFadeRow'
import { ListeningHeatmap } from './HomeSessionWidgets'
import { useProfiles } from '../../context/ProfilesContext'
import { useAdaptiveUI } from '../../context/AdaptiveUIContext'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import {
  albumArtAssets,
  artistAssets,
  hannahJourneyAssets,
  oliviaPageAssets,
  resolveArtistAvatar,
} from '../../data/assetMap'
import {
  songs,
  artists,
  playlists,
  podcasts,
  fanGroups,
  myMixPlaylistIds,
  newForYouSongIds,
  recentlyPlayedIds,
  type Song,
  type Artist,
} from '../../data/mockData'
import { SHOWS_YOU_WATCH } from '../../data/showsYouWatch'
import { C, FONT_FAMILY_DISPLAY, FONT_FAMILY_EMBER } from '../../theme'

const SCREEN_W = Dimensions.get('window').width

// Same summer-session picks the classic baseline home surfaces.
const SUMMER_SESSION_PLAYLIST_IDS = ['pl-summer-turned-pretty', 'pl-love-island', 'pl-love-island-cast', 'pl5']

const SONGS_PER_PAGE = 3
function chunk<T>(arr: T[], size: number): T[][] {
  const pages: T[][] = []
  for (let i = 0; i < arr.length; i += size) pages.push(arr.slice(i, i + size))
  return pages
}

// Same neutral-fallback rule as HannahJourneyLanding: never borrow another
// artist's photo when an asset is missing.
function resolveArt(key?: string) {
  if (!key) return null
  return (
    albumArtAssets[key] ??
    artistAssets[key] ??
    (key === 'olivia-rodrigo' ? oliviaPageAssets.profile : null) ??
    (key === 'sabrina-carpenter' ? albumArtAssets['sabrina-short-n-sweet'] : null) ??
    null
  )
}

function artistArt(a: Artist) {
  return resolveArtistAvatar(a.id, a.imageUri) ?? resolveArt(a.id) ?? resolveArt(a.imageUri)
}

// De-dupe songs down to one representative per album, ordered as given.
function uniqueAlbums(pool: Song[], limit: number): Song[] {
  const seen = new Set<string>()
  const out: Song[] = []
  for (const sg of pool) {
    if (!sg.album || seen.has(sg.album)) continue
    seen.add(sg.album)
    out.push(sg)
    if (out.length >= limit) break
  }
  return out
}

const FAVORITE_CAPTIONS = [
  'Your daily ritual.\n2 weeks strong.',
  'Your morning starter.\nA weekly staple.',
  'On repeat every evening.',
]
const CRUSH_CAPTIONS = ['Three songs, on repeat.', 'You came back this week.']

/**
 * "Create your own" home — the current-design landing (same visual system as
 * the Hannah Journey Figma landings: My Soundtrack hero, Songs For You,
 * Continue Listening, You and Your Favorites, Fan Groups, Your Top Artists,
 * Albums for you) tailored to the artists picked at profile creation, then
 * kept deliberately dense with the classic home's discovery rails below.
 * Hannah Journey's own landing component is untouched — this is a separate
 * screen so her hi-fi flow can't regress.
 */
export default function CustomProfileLanding() {
  const router = useRouter()
  const { activeProfile } = useProfiles()
  const { activeTheme } = useAdaptiveUI()
  const { playSongAt } = usePlaybackState()
  const { scrollY, onScroll } = useStickyHomeScroll()

  const firstName = activeProfile.name.split(' ')[0]

  // ── Personalization pools ────────────────────────────────────────────────
  const chosenArtists = useMemo(() => {
    const ids = activeProfile.superfanArtistIds ?? []
    return ids
      .map(id => artists.find(a => a.id === id))
      .filter((a): a is Artist => a != null)
  }, [activeProfile.superfanArtistIds])

  // Same-genre neighbors — "more like what you picked", used to fill every
  // rail past the picks themselves. Falls back to the theme's filters (a
  // genres/moods-only profile picks no artists at all).
  const relatedArtists = useMemo(() => {
    const chosenIds = new Set(chosenArtists.map(a => a.id))
    const genres = new Set([
      ...chosenArtists.map(a => a.genre),
      ...(activeTheme?.filterGenres ?? []),
    ])
    const related = artists.filter(a => !chosenIds.has(a.id) && genres.has(a.genre))
    const rest = artists.filter(a => !chosenIds.has(a.id) && !genres.has(a.genre))
    return [...related, ...rest]
  }, [chosenArtists, activeTheme])

  const chosenSongs = useMemo(
    () => chosenArtists.flatMap(a => songs.filter(sg => sg.artistId === a.id)),
    [chosenArtists],
  )
  const relatedSongs = useMemo(
    () => relatedArtists.flatMap(a => songs.filter(sg => sg.artistId === a.id)),
    [relatedArtists],
  )

  // ── Hero ─────────────────────────────────────────────────────────────────
  const heroNames = useMemo(() => {
    const names = [...chosenArtists.map(a => a.name), ...relatedArtists.map(a => a.name)].slice(0, 3)
    if (names.length === 0) return activeTheme?.label ?? 'your picks'
    if (names.length === 1) return names[0]
    return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`
  }, [chosenArtists, relatedArtists, activeTheme])
  const heroArtist = chosenArtists[0] ?? relatedArtists[0]
  const heroArt =
    (heroArtist ? artistArt(heroArtist) : null) ??
    resolveArt(activeTheme?.heroBannerKey ?? undefined)

  // ── Songs For You — picks first, then same-genre discovery ──────────────
  const songsForYou = useMemo(() => {
    const perArtist = chosenArtists.map(a => songs.filter(sg => sg.artistId === a.id).slice(0, 3))
    const interleaved: Song[] = []
    for (let i = 0; i < 3; i++) for (const list of perArtist) if (list[i]) interleaved.push(list[i])
    const fill = relatedSongs.filter(sg => !interleaved.includes(sg))
    return [...interleaved, ...fill].slice(0, 12)
  }, [chosenArtists, relatedSongs])
  const songPages = useMemo(() => chunk(songsForYou, SONGS_PER_PAGE), [songsForYou])
  const songPagePeek = Math.round(SCREEN_W * 0.18)
  const songPageWidth = SCREEN_W - songPagePeek
  const songSnapOffsets = useMemo(
    () => songPages.map((_, i) => i * songPageWidth),
    [songPages, songPageWidth],
  )

  // ── Continue Listening — chosen albums + a podcast + a playlist ─────────
  const continueListening = useMemo(() => {
    const albumPicks = uniqueAlbums([...chosenSongs, ...relatedSongs], 2).map(sg => ({
      key: `cl-album-${sg.id}`,
      title: sg.album ?? sg.title,
      meta: `Album • ${sg.artistName}`,
      art: resolveArt(sg.albumArtPath),
      onPress: () => router.push(`/album/song-album-${sg.id}` as any),
    }))
    const pod = podcasts.find(p =>
      chosenArtists.some(a => p.title.toLowerCase().includes(a.name.split(' ')[0].toLowerCase())),
    ) ?? podcasts[2]
    const podCard = pod
      ? [{
          key: `cl-pod-${pod.id}`,
          title: pod.title,
          meta: `Podcast • ${pod.host}`,
          art: resolveArt(pod.coverArtPath),
          onPress: () => router.push('/podcast' as any),
        }]
      : []
    const pl = playlists.find(p => p.id === myMixPlaylistIds[0])
    const plCard = pl
      ? [{
          key: `cl-pl-${pl.id}`,
          title: pl.name,
          meta: `Playlist • ${pl.songCount} songs`,
          art: resolveArt(pl.coverArtPath),
          onPress: () => router.push(`/playlist/${pl.id}` as any),
        }]
      : []
    return [...albumPicks, ...podCard, ...plCard]
  }, [chosenSongs, relatedSongs, chosenArtists, router])

  // ── You and Your Favorites — picks are SUPERFAN, neighbors are crushes ──
  const favorites = useMemo(() => {
    const picks = chosenArtists.slice(0, 3).map((a, i) => ({
      artist: a,
      tag: 'SUPERFAN',
      showHeart: true,
      caption: FAVORITE_CAPTIONS[i % FAVORITE_CAPTIONS.length],
      seed: i + 1,
    }))
    const crushes = relatedArtists.slice(0, 4 - Math.min(picks.length, 3)).map((a, i) => ({
      artist: a,
      tag: i === 0 ? 'NEW CRUSH' : 'IN ROTATION',
      showHeart: false,
      caption: CRUSH_CAPTIONS[i % CRUSH_CAPTIONS.length],
      seed: picks.length + i + 2,
    }))
    return [...picks, ...crushes]
  }, [chosenArtists, relatedArtists])

  // ── Fan Groups — real /fan-group/[id] pages only, picks first ────────────
  const fanGroupCards = useMemo(() => {
    const cards: {
      group: (typeof fanGroups)[number]
      eyebrow: string
      gradient: boolean
      quote: string
      comments: string
    }[] = []
    for (const a of chosenArtists) {
      const g = fanGroups.find(fg => fg.artistId === a.id)
      if (g && !cards.some(cd => cd.group.id === g.id)) {
        cards.push({
          group: g,
          eyebrow: `Calling all ${a.name} fans`,
          gradient: true,
          quote: `What's the one ${a.name.split(' ')[0]} song you'd play for a first-timer?`,
          comments: `${(g.memberCount % 400) + 31}`,
        })
      }
    }
    for (const g of fanGroups) {
      if (cards.length >= 3) break
      if (cards.some(cd => cd.group.id === g.id)) continue
      cards.push({
        group: g,
        eyebrow: 'Fans like you are talking',
        gradient: false,
        quote: 'What album got you into them in the first place?',
        comments: `${(g.memberCount % 300) + 12}`,
      })
    }
    return cards.slice(0, 3)
  }, [chosenArtists])

  // ── Your Top Artists ─────────────────────────────────────────────────────
  const topArtists = useMemo(
    () => [
      ...chosenArtists.map(a => ({ artist: a, heart: true })),
      ...relatedArtists.slice(0, Math.max(0, 6 - chosenArtists.length)).map(a => ({ artist: a, heart: false })),
    ],
    [chosenArtists, relatedArtists],
  )

  // ── Albums for you ───────────────────────────────────────────────────────
  const albumsForYou = useMemo(
    () => uniqueAlbums([...chosenSongs, ...relatedSongs], 8),
    [chosenSongs, relatedSongs],
  )

  // ── Discovery rails (the classic home's density, current-design cards) ──
  const onRepeat = useMemo(() => chosenSongs.slice(0, 10), [chosenSongs])
  const playlistsYouMightLike = useMemo(() => {
    const used = new Set([...SUMMER_SESSION_PLAYLIST_IDS, ...SHOWS_YOU_WATCH.map(sh => sh.playlistId)])
    return playlists.filter(p => !used.has(p.id)).slice(0, 10)
  }, [])
  const featuredThisWeek = useMemo(
    () => newForYouSongIds.map(id => songs.find(sg => sg.id === id)).filter((sg): sg is Song => sg != null),
    [],
  )
  const popHits = useMemo(() => {
    const chosenIds = new Set(chosenArtists.map(a => a.id))
    const popArtistIds = new Set(artists.filter(a => a.genre === 'Pop').map(a => a.id))
    return songs.filter(sg => popArtistIds.has(sg.artistId) && !chosenIds.has(sg.artistId)).slice(0, 10)
  }, [chosenArtists])
  const summerSession = useMemo(
    () => SUMMER_SESSION_PLAYLIST_IDS.map(id => playlists.find(p => p.id === id)).filter((p): p is (typeof playlists)[number] => p != null),
    [],
  )
  const stationsForYou = useMemo(
    () => [...chosenArtists, ...relatedArtists].slice(0, 8),
    [chosenArtists, relatedArtists],
  )
  const specialAudio = useMemo(
    () => songs.filter(sg => sg.audioBadge && sg.audioBadge !== 'SD').slice(0, 10),
    [],
  )
  const podcastsForYou = useMemo(() => podcasts.filter(p => p.category !== 'True Crime').slice(0, 8), [])
  const trueCrime = useMemo(() => podcasts.filter(p => p.category === 'True Crime'), [])
  const recents = useMemo(
    () => recentlyPlayedIds.map(id => songs.find(sg => sg.id === id)).filter((sg): sg is Song => sg != null),
    [],
  )

  const play = useCallback(
    (songId?: string) => {
      if (!songId) return
      playSongAt(songId)
      router.push('/now-playing')
    },
    [playSongAt, router],
  )

  const playArtist = useCallback(
    (artistId: string) => {
      const first = songs.find(sg => sg.artistId === artistId)
      if (first) play(first.id)
    },
    [play],
  )

  const handlePillChange = useCallback(
    (idx: number) => {
      if (idx === 0) router.push('/music')
      else if (idx === 1) router.push('/podcast')
      else if (idx === 2) router.push(`/audible-category/${encodeURIComponent('Bestsellers')}` as any)
    },
    [router],
  )

  const heroFirstSong = songsForYou[0]

  // ── Small shared renderers (all in the landing's card language) ─────────
  const renderSquareCard = (
    key: string,
    art: any,
    title: string,
    meta: string,
    onPress: () => void,
    icon?: keyof typeof Ionicons.glyphMap,
  ) => (
    <TouchableOpacity key={key} style={s.continueCard} activeOpacity={0.85} onPress={onPress}>
      {art ? (
        <Image source={art} style={s.continueArt} resizeMode="cover" />
      ) : (
        <View style={[s.continueArt, s.artPlaceholder]}>
          <Ionicons name="musical-note" size={24} color="rgba(255,255,255,0.25)" />
        </View>
      )}
      {icon ? (
        <View style={s.cardIconBadge}>
          <Ionicons name={icon} size={14} color="#fff" />
        </View>
      ) : null}
      <Text style={s.continueTitle} numberOfLines={1}>{title}</Text>
      <Text style={s.continueMeta} numberOfLines={1}>{meta}</Text>
    </TouchableOpacity>
  )

  const renderSongRail = (title: string, list: Song[]) =>
    list.length === 0 ? null : (
      <View style={s.section}>
        <Text style={[s.sectionTitle, { paddingHorizontal: 16 }]}>{title}</Text>
        <EdgeFadeRow>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hRail} nestedScrollEnabled>
            {list.map(sg =>
              renderSquareCard(`${title}-${sg.id}`, resolveArt(sg.albumArtPath), sg.title, sg.artistName, () => play(sg.id)),
            )}
          </ScrollView>
        </EdgeFadeRow>
      </View>
    )

  const renderPlaylistRail = (title: string, list: typeof playlists) =>
    list.length === 0 ? null : (
      <View style={s.section}>
        <Text style={[s.sectionTitle, { paddingHorizontal: 16 }]}>{title}</Text>
        <EdgeFadeRow>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hRail} nestedScrollEnabled>
            {list.map(p =>
              renderSquareCard(
                `${title}-${p.id}`,
                resolveArt(p.coverArtPath),
                p.name,
                `Playlist • ${p.songCount} songs`,
                () => router.push(`/playlist/${p.id}` as any),
              ),
            )}
          </ScrollView>
        </EdgeFadeRow>
      </View>
    )

  const renderPodcastRail = (title: string, list: typeof podcasts) =>
    list.length === 0 ? null : (
      <View style={s.section}>
        <Text style={[s.sectionTitle, { paddingHorizontal: 16 }]}>{title}</Text>
        <EdgeFadeRow>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hRail} nestedScrollEnabled>
            {list.map(p =>
              renderSquareCard(
                `${title}-${p.id}`,
                resolveArt(p.coverArtPath),
                p.title,
                `Podcast • ${p.host}`,
                () => router.push('/podcast' as any),
                'mic',
              ),
            )}
          </ScrollView>
        </EdgeFadeRow>
      </View>
    )

  return (
    <View style={s.screen}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        style={{ backgroundColor: C.bg }}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {/* Hero — My Soundtrack */}
        <View style={s.heroWrap}>
          {heroArt ? (
            <Image source={heroArt} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: C.surface }]} />
          )}
          <LinearGradient
            colors={['rgba(0,0,0,0.25)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.6)', '#000']}
            locations={[0, 0.45, 0.78, 1]}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.72)', 'rgba(0,0,0,0)']}
            style={s.headerScrim}
            pointerEvents="none"
          />
          <View style={s.heroCopy}>
            <Text style={s.heroEyebrow}>STATION</Text>
            <Text style={s.heroTitle}>My Soundtrack</Text>
            <Text style={s.heroSub}>Starting with {heroNames}</Text>
          </View>
          <TouchableOpacity
            style={s.heroPlay}
            activeOpacity={0.85}
            onPress={() => heroFirstSong && play(heroFirstSong.id)}
          >
            <View style={s.heroPlayInner}>
              <Ionicons name="play" size={22} color="#000" style={{ marginLeft: 2 }} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Songs For You */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Songs For You</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="normal"
            snapToOffsets={songSnapOffsets}
            snapToAlignment="start"
            nestedScrollEnabled
            contentContainerStyle={{ paddingRight: songPagePeek }}
          >
            {songPages.map((page, pageIdx) => (
              <View key={`songs-page-${pageIdx}`} style={{ width: songPageWidth }}>
                {page.map(sg => {
                  const art = resolveArt(sg.albumArtPath)
                  return (
                    <TouchableOpacity key={sg.id} style={s.songRow} activeOpacity={0.8} onPress={() => play(sg.id)}>
                      {art ? (
                        <Image source={art} style={s.songArt} resizeMode="cover" />
                      ) : (
                        <View style={[s.songArt, s.artPlaceholder]}>
                          <Ionicons name="musical-note" size={20} color="rgba(255,255,255,0.25)" />
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={s.songTitle} numberOfLines={1}>{sg.title}</Text>
                        <Text style={s.songMeta} numberOfLines={1}>{sg.artistName}</Text>
                      </View>
                    </TouchableOpacity>
                  )
                })}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Continue Listening */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { paddingHorizontal: 16 }]}>Continue Listening</Text>
          <EdgeFadeRow>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hRail} nestedScrollEnabled>
              {continueListening.map(item => (
                <TouchableOpacity key={item.key} style={s.continueCard} activeOpacity={0.85} onPress={item.onPress}>
                  {item.art ? (
                    <Image source={item.art} style={s.continueArt} resizeMode="cover" />
                  ) : (
                    <View style={[s.continueArt, s.artPlaceholder]}>
                      <Ionicons name="musical-note" size={24} color="rgba(255,255,255,0.25)" />
                    </View>
                  )}
                  <Text style={s.continueTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={s.continueMeta} numberOfLines={1}>{item.meta}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </EdgeFadeRow>
        </View>

        {/* You and Your Favorites */}
        <View style={s.section}>
          <View style={s.sectionHeadRow}>
            <Text style={[s.sectionTitle, s.sectionTitleNoPad]}>You and Your Favorites</Text>
            <TouchableOpacity onPress={() => router.push('/music')} activeOpacity={0.7}>
              <Text style={s.seeMore}>SEE MORE</Text>
            </TouchableOpacity>
          </View>
          <EdgeFadeRow>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hRail} nestedScrollEnabled>
              {favorites.map(card => {
                const art = artistArt(card.artist)
                return (
                  <TouchableOpacity
                    key={card.artist.id}
                    style={s.favCard}
                    activeOpacity={0.85}
                    onPress={() => router.push(`/artist/${card.artist.id}` as any)}
                  >
                    {art ? (
                      <Image source={art} style={StyleSheet.absoluteFill} resizeMode="cover" />
                    ) : (
                      <View style={[StyleSheet.absoluteFill, { backgroundColor: C.surface }]} />
                    )}
                    <LinearGradient
                      colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.5)']}
                      locations={[0.19, 0.52, 0.81]}
                      style={StyleSheet.absoluteFill}
                    />
                    <View style={s.favTop}>
                      <View style={s.favIdentity}>
                        {art ? (
                          <Image source={art} style={s.favAvatar} resizeMode="cover" />
                        ) : (
                          <View style={[s.favAvatar, { backgroundColor: C.surface }]} />
                        )}
                        <View>
                          <View style={s.favTagRow}>
                            {card.showHeart ? (
                              <Image
                                source={hannahJourneyAssets.superfanIcon}
                                style={s.favSuperfanIcon}
                                resizeMode="contain"
                              />
                            ) : null}
                            <Text style={s.favTag}>{card.tag}</Text>
                          </View>
                          <Text style={s.favName} numberOfLines={1}>{card.artist.name}</Text>
                        </View>
                      </View>
                      <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
                    </View>
                    <View style={s.favBottom}>
                      <Text style={s.favMonth}>THIS MONTH</Text>
                      <Text style={s.favCaption}>{card.caption}</Text>
                      <ListeningHeatmap seed={card.seed} />
                    </View>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </EdgeFadeRow>
        </View>

        {/* Fan Groups For You */}
        <View style={s.section}>
          <View style={s.sectionHeadRow}>
            <Text style={[s.sectionTitle, s.sectionTitleNoPad]}>Fan Groups For You</Text>
            <Text style={s.seeMore}>SEE MORE</Text>
          </View>
          <EdgeFadeRow>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hRail} nestedScrollEnabled>
              {fanGroupCards.map(cd => {
                const fanArt = resolveArt(cd.group.coverArtPath ?? cd.group.artistId)
                const openGroup = () => router.push(`/fan-group/${cd.group.id}` as any)
                return (
                  <TouchableOpacity key={cd.group.id} style={s.fanCard} activeOpacity={0.85} onPress={openGroup}>
                    <LinearGradient
                      colors={['#2a2438', '#1a1520', '#121018']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                    <View style={s.fanTop}>
                      {fanArt ? (
                        <Image source={fanArt} style={s.fanArt} resizeMode="cover" />
                      ) : (
                        <View style={[s.fanArt, s.artPlaceholder]}>
                          <Ionicons name="people" size={22} color="rgba(255,255,255,0.25)" />
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        {cd.gradient ? (
                          <Svg height={16} width={220} style={s.fanEyebrowGrad}>
                            <Defs>
                              <SvgLinearGradient id={`fanEyebrowGradFill-${cd.group.id}`} x1="33%" y1="97%" x2="67%" y2="3%">
                                <Stop offset="0.02" stopColor="#DE909C" />
                                <Stop offset="0.52" stopColor="#A6A0C7" />
                                <Stop offset="1" stopColor="#6DAFF1" />
                              </SvgLinearGradient>
                            </Defs>
                            <SvgText
                              x={0}
                              y={12}
                              fill={`url(#fanEyebrowGradFill-${cd.group.id})`}
                              fontFamily={FONT_FAMILY_DISPLAY.bold}
                              fontSize={12}
                              letterSpacing={0.3}
                            >
                              {cd.eyebrow.toUpperCase()}
                            </SvgText>
                          </Svg>
                        ) : (
                          <Text style={s.fanEyebrow}>{cd.eyebrow}</Text>
                        )}
                        <Text style={s.fanTitle} numberOfLines={1}>{cd.group.name}</Text>
                        <Text style={s.fanMembers}>{cd.group.memberCount.toLocaleString()} members</Text>
                      </View>
                      {cd.gradient ? (
                        <Ionicons name="chevron-forward" size={28} color="#fff" />
                      ) : (
                        <TouchableOpacity style={s.joinBtn} activeOpacity={0.85} onPress={openGroup}>
                          <Text style={s.joinText}>Join</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <View style={s.fanDivider} />
                    <View style={s.fanQuoteRow}>
                      <Text style={s.fanQuote} numberOfLines={1}>{cd.quote}</Text>
                      <Ionicons name="chatbubble-outline" size={14} color="#fff" />
                      <Text style={s.fanComments}>{cd.comments}</Text>
                    </View>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </EdgeFadeRow>
        </View>

        {/* Your Top Artists */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { paddingHorizontal: 16 }]}>Your Top Artists</Text>
          <EdgeFadeRow>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hRail} nestedScrollEnabled>
              {topArtists.map(({ artist, heart }) => {
                const art = artistArt(artist)
                return (
                  <TouchableOpacity
                    key={artist.id}
                    style={s.topArtist}
                    activeOpacity={0.85}
                    onPress={() => router.push(`/artist/${artist.id}` as any)}
                  >
                    {art ? (
                      <Image source={art} style={s.topArtistArt} resizeMode="cover" />
                    ) : (
                      <View style={[s.topArtistArt, s.artPlaceholder]}>
                        <Ionicons name="person" size={36} color="rgba(255,255,255,0.25)" />
                      </View>
                    )}
                    <View style={s.topArtistLabel}>
                      {heart ? (
                        <Image
                          source={hannahJourneyAssets.superfanIcon}
                          style={s.topArtistSuperfanIcon}
                          resizeMode="contain"
                        />
                      ) : null}
                      <Text style={s.topArtistName} numberOfLines={1}>{artist.name}</Text>
                    </View>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </EdgeFadeRow>
        </View>

        {/* Albums for you */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { paddingHorizontal: 16 }]}>Albums for you</Text>
          <EdgeFadeRow>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hRail} nestedScrollEnabled>
              {albumsForYou.map(sg => {
                const art = resolveArt(sg.albumArtPath)
                return (
                  <TouchableOpacity
                    key={sg.id}
                    style={s.albumCard}
                    activeOpacity={0.85}
                    onPress={() => router.push(`/album/song-album-${sg.id}` as any)}
                  >
                    {art ? (
                      <Image source={art} style={s.albumArt} resizeMode="cover" />
                    ) : (
                      <View style={[s.albumArt, s.artPlaceholder]}>
                        <Ionicons name="musical-note" size={28} color="rgba(255,255,255,0.25)" />
                      </View>
                    )}
                    <Text style={s.albumTitle} numberOfLines={1}>{sg.album ?? sg.title}</Text>
                    <Text style={s.albumArtist} numberOfLines={1}>{sg.artistName}</Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </EdgeFadeRow>
        </View>

        {/* ── Discovery rails — classic home density, current-design cards ── */}
        {renderSongRail('On Repeat In Your World', onRepeat)}
        {renderPlaylistRail('Playlists You Might Like', playlistsYouMightLike)}

        {/* Songs From Shows You Watch */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { paddingHorizontal: 16 }]}>Songs From Shows You Watch</Text>
          <EdgeFadeRow>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hRail} nestedScrollEnabled>
              {SHOWS_YOU_WATCH.map(sh => {
                const pl = playlists.find(p => p.id === sh.playlistId)
                const art = resolveArt(sh.bannerKey) ?? resolveArt(pl?.coverArtPath)
                return renderSquareCard(
                  sh.id,
                  art,
                  sh.title,
                  sh.subtitle,
                  () => router.push(`/playlist/${sh.playlistId}` as any),
                )
              })}
            </ScrollView>
          </EdgeFadeRow>
        </View>

        {renderSongRail('Pop Hits Picked For You', popHits)}
        {renderSongRail('Featured This Week', featuredThisWeek)}
        {renderPlaylistRail('Summer Session', summerSession)}

        {/* Stations For You */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { paddingHorizontal: 16 }]}>Stations For You</Text>
          <EdgeFadeRow>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hRail} nestedScrollEnabled>
              {stationsForYou.map(a =>
                renderSquareCard(
                  `station-${a.id}`,
                  artistArt(a),
                  `${a.name} Radio`,
                  'Station • Amazon Music',
                  () => playArtist(a.id),
                  'radio',
                ),
              )}
            </ScrollView>
          </EdgeFadeRow>
        </View>

        {renderSongRail('Special Audio', specialAudio)}
        {renderPodcastRail('Podcasts For You', podcastsForYou)}
        {renderPodcastRail('True Crime Weekly', trueCrime)}
        {renderSongRail('Recently Played', recents)}
      </Animated.ScrollView>

      <StickyHomeHeader
        firstName={firstName}
        activePill={null}
        onPillChange={handlePillChange}
        scrollY={scrollY}
      />
    </View>
  )
}

const CARD_W = Math.min(212, SCREEN_W * 0.55)

// Visual system copied from HannahJourneyLanding so both screens read as the
// same current design — kept as a separate sheet so Hannah's file stays
// untouched.
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  artPlaceholder: { backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  heroWrap: {
    width: '100%',
    height: 398,
    overflow: 'hidden',
  },
  headerScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 124,
  },
  heroCopy: {
    position: 'absolute',
    left: 0,
    bottom: 12,
    paddingHorizontal: 16,
    gap: 12,
    width: '70%',
  },
  heroEyebrow: {
    fontFamily: FONT_FAMILY_DISPLAY.bold,
    fontSize: 12,
    color: C.cyan,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontFamily: FONT_FAMILY_DISPLAY.bold,
    fontSize: 34,
    color: '#fff',
    lineHeight: 34,
  },
  heroSub: {
    fontFamily: FONT_FAMILY_EMBER.regular,
    fontSize: 12,
    lineHeight: 14.4,
    color: 'rgba(255,255,255,0.72)',
  },
  heroPlay: {
    position: 'absolute',
    right: 16,
    bottom: 40,
    width: 50,
    height: 50,
  },
  heroPlayInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: C.cyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { marginTop: 24 },
  sectionHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: FONT_FAMILY_DISPLAY.bold,
    fontSize: 20,
    color: '#fff',
    lineHeight: 20,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitleNoPad: {
    paddingHorizontal: 0,
    marginBottom: 0,
  },
  seeMore: {
    fontFamily: FONT_FAMILY_DISPLAY.bold,
    fontSize: 12,
    color: '#757575',
    textTransform: 'uppercase',
  },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 12,
  },
  songArt: {
    width: 63,
    height: 63,
    borderRadius: 4,
    borderWidth: 0.75,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  songTitle: {
    fontFamily: FONT_FAMILY_EMBER.bold,
    fontSize: 16,
    color: '#fff',
  },
  songMeta: {
    fontFamily: FONT_FAMILY_EMBER.regular,
    fontSize: 12,
    color: '#A6A6A6',
    marginTop: 4,
  },
  hRail: { paddingHorizontal: 16, gap: 16 },
  continueCard: { width: 173 },
  continueArt: {
    width: 173,
    height: 173,
    borderRadius: 8,
    borderWidth: 0.75,
    borderColor: 'rgba(255,255,255,0.24)',
    marginBottom: 5,
  },
  continueTitle: {
    fontFamily: FONT_FAMILY_EMBER.bold,
    fontSize: 16,
    color: '#fff',
  },
  continueMeta: {
    fontFamily: FONT_FAMILY_EMBER.regular,
    fontSize: 12,
    color: '#A6A6A6',
  },
  cardIconBadge: {
    position: 'absolute',
    right: 8,
    bottom: 52,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favCard: {
    width: CARD_W,
    height: CARD_W,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    overflow: 'hidden',
    padding: 12,
    justifyContent: 'space-between',
  },
  favTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  favIdentity: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  favAvatar: { width: 36, height: 36, borderRadius: 18 },
  favTagRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  favSuperfanIcon: { width: 15, height: 14 },
  favTag: {
    fontFamily: FONT_FAMILY_DISPLAY.bold,
    fontSize: 12,
    color: '#fff',
    textTransform: 'uppercase',
  },
  favName: {
    fontFamily: FONT_FAMILY_EMBER.bold,
    fontSize: 16,
    color: '#fff',
    marginTop: 2,
  },
  favBottom: { gap: 5 },
  favMonth: {
    fontFamily: FONT_FAMILY_DISPLAY.regular,
    fontSize: 12,
    color: '#fff',
    textTransform: 'uppercase',
  },
  favCaption: {
    fontFamily: FONT_FAMILY_DISPLAY.bold,
    fontSize: 18,
    color: '#fff',
    lineHeight: 20,
    marginBottom: 4,
  },
  fanCard: {
    width: 341,
    height: 122,
    borderRadius: 12,
    overflow: 'hidden',
    padding: 12,
  },
  fanTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  fanArt: {
    width: 64,
    height: 64,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  fanEyebrow: {
    fontFamily: FONT_FAMILY_DISPLAY.bold,
    fontSize: 12,
    color: '#A6A6A6',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  fanEyebrowGrad: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  fanTitle: {
    fontFamily: FONT_FAMILY_EMBER.bold,
    fontSize: 16,
    color: '#fff',
  },
  fanMembers: {
    fontFamily: FONT_FAMILY_EMBER.regular,
    fontSize: 12,
    color: '#fff',
    marginTop: 4,
  },
  joinBtn: {
    backgroundColor: 'rgba(145,174,185,0.4)',
    borderRadius: 24,
    height: 33,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinText: {
    fontFamily: FONT_FAMILY_DISPLAY.bold,
    fontSize: 14,
    color: '#fff',
  },
  fanDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginTop: 10,
    marginBottom: 8,
  },
  fanQuoteRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  fanQuote: {
    flex: 1,
    fontFamily: FONT_FAMILY_EMBER.regular,
    fontSize: 12,
    color: '#fff',
  },
  fanComments: {
    fontFamily: FONT_FAMILY_EMBER.regular,
    fontSize: 12,
    color: '#fff',
  },
  topArtist: { width: 120, alignItems: 'center', gap: 8 },
  topArtistArt: { width: 120, height: 120, borderRadius: 60 },
  topArtistLabel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  topArtistSuperfanIcon: { width: 21, height: 19 },
  topArtistName: {
    fontFamily: FONT_FAMILY_EMBER.bold,
    fontSize: 16,
    color: '#fff',
    maxWidth: 100,
  },
  albumCard: { width: 173 },
  albumArt: {
    width: 173,
    height: 173,
    borderRadius: 8,
    borderWidth: 0.75,
    borderColor: 'rgba(255,255,255,0.24)',
    marginBottom: 5,
  },
  albumTitle: {
    fontFamily: FONT_FAMILY_EMBER.bold,
    fontSize: 16,
    color: '#fff',
  },
  albumArtist: {
    fontFamily: FONT_FAMILY_EMBER.regular,
    fontSize: 12,
    color: '#A6A6A6',
  },
})
