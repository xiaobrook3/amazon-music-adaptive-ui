import { useMemo, useState } from 'react'
import { View, ScrollView, TouchableOpacity, StyleSheet, Animated, Dimensions, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { Text } from '../AppText'
import { AppImage as Image } from '../AppImage'
import { EdgeFadeRow } from '../EdgeFadeRow'
import { HRail } from '../HRail'
import StickyHomeHeader, { useStickyHomeHeaderHeight, useStickyHomeScroll } from '../StickyHomeHeader'
import { PlaylistMoodCard, ShowsYouWatchRail, MixCard } from './HomeSessionWidgets'
import { useProfiles } from '../../context/ProfilesContext'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import {
  songs,
  artists as allArtists,
  playlists,
  podcasts,
  continueListeningItems,
  continueListeningKind,
  songsForYouIds,
  popularInCitySongIds,
  recentlyPlayedIds,
  myMixPlaylistIds,
  homeFeaturedArtistIds,
  newForYouSongIds,
  type Song,
} from '../../data/mockData'
import { albumArtAssets, artistAssets, oliviaAboutAssets, resolveArtistAvatar } from '../../data/assetMap'
import { uniqueAlbumsFromSongs, getFeaturedArtists } from '../../data/themeFilters'
import { showYouWatchPlaylistIds } from '../../data/showsYouWatch'
import { C, R, typeHeadline } from '../../theme'

// KSM is new — her default scroll already covers music, so a second "Music"
// domain drill-down would just duplicate it. Only Podcast/Audible get one.
const DOMAIN_LABELS = ['Podcast', 'Audible'] as const

const SCREEN_W = Platform.OS === 'web' ? Math.min(Dimensions.get('window').width, 402) : Dimensions.get('window').width
// "Songs for You" — same horizontally-paged, 3-rows-per-page pattern as the
// baseline (Derbc Studios) home.
const SONGS_PER_PAGE = 3
const SONG_PAGE_PEEK = Math.round(SCREEN_W * 0.32)
const SONG_PAGE_WIDTH = SCREEN_W - SONG_PAGE_PEEK

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

// Editorial playlist rail cards, each tagged with a representative real cover
// so the rail shows real art instead of flat color. `genre` names the
// /genre/[id] browse destination each card opens — always real content.
const RELATED_PLAYLISTS = [
  { name: 'Todays Hits',          genre: 'Charts',  artKey: 'beyonce-lemonade' },
  { name: 'Feel-Good Pop',        genre: 'Pop',     artKey: 'charli-xcx-album' },
  { name: 'Deep Focus',           genre: 'Focus',   artKey: 'fka-twigs-lp1' },
  { name: 'Chill Vibes',          genre: 'Relax',   artKey: 'lorde-melodrama' },
  { name: 'Workout Energy',       genre: 'Workout', artKey: 'lizzo-cuz-i-love-you' },
  { name: 'Acoustic Mornings',    genre: 'Commute', artKey: 'noah-kahan-great-divide' },
  { name: 'Late Night Lo-Fi',     genre: 'Relax',   artKey: 'kate-bush-dreaming' },
  { name: 'All-Time Throwbacks',  genre: 'Party',   artKey: 'madonna-true-blue' },
]

function resolve(ids: string[]): Song[] {
  return ids.map(id => songs.find(s => s.id === id)).filter((s): s is Song => s != null)
}

const RECENTLY_PLAYED = resolve(recentlyPlayedIds)
const MADE_FOR_YOU = resolve(songsForYouIds)
const TRENDING = resolve(popularInCitySongIds)
const MY_MIXES = myMixPlaylistIds.map(id => playlists.find(p => p.id === id)).filter((p): p is typeof playlists[0] => p != null)

// "Endless scroll" filler content, after My Mixes — deliberately generic (not
// theme-filtered), so the feed keeps producing new rails from the wider
// catalog the further you scroll. Same pool as the baseline home.
const NEW_RELEASES = resolve(newForYouSongIds)
const RADIO_STATIONS = [
  { id: 'radio-bad-bunny', name: 'Bad Bunny Radio',    artKey: 'bad-bunny-verano',      songId: 's-bb1' },
  { id: 'radio-sza',       name: 'SZA Radio',           artKey: 'sza-sos',               songId: 's-sza1' },
  { id: 'radio-weeknd',    name: 'The Weeknd Radio',    artKey: 'the-weeknd',            songId: 's-weeknd1' },
  { id: 'radio-dua',       name: 'Dua Lipa Radio',      artKey: 'dua-lipa',              songId: 's-dua1' },
  { id: 'radio-rihanna',   name: 'Rihanna Radio',       artKey: 'rihanna-anti',          songId: 's-rihanna1' },
  { id: 'radio-doja',      name: 'Doja Cat Radio',      artKey: 'doja-cat',              songId: 's-doja1' },
  { id: 'radio-beyonce',   name: 'Beyoncé Radio',       artKey: 'beyonce-lemonade',      songId: 's-beyonce5' },
  { id: 'radio-ariana',    name: 'Ariana Grande Radio', artKey: 'ariana-sweetener',      songId: 's-ariana1' },
]
const DEEP_DIVE_ARTIST_POOL = ['lorde', 'mitski', 'beyonce', 'ariana-grande', 'sabrina-carpenter', 'rihanna', 'sza', 'dua-lipa', 'the-weeknd', 'doja-cat']
const SUMMER_SESSION_PLAYLIST_IDS = ['pl-summer-turned-pretty', 'pl-love-island', 'pl-love-island-cast', 'pl5']
const SPECIAL_AUDIO_SONGS = songs.filter(s => s.audioBadge && s.audioBadge !== 'SD').slice(0, 14)
const TRUE_CRIME_PODCASTS = podcasts.filter(p => p.category === 'True Crime')
const PODCASTS_FOR_YOU_FILLER = podcasts.slice(0, 10)
const OLIVIA_FEATURED_FILLER = songs.filter(s => s.artistId === 'olivia-rodrigo').slice(0, 10)
const SUMMER_SESSION_PLAYLISTS = SUMMER_SESSION_PLAYLIST_IDS.map(id => playlists.find(p => p.id === id)).filter((p): p is typeof playlists[0] => p != null)
const MORE_PLAYLISTS_FOR_YOU = playlists.filter(
  p => !new Set([...myMixPlaylistIds, ...showYouWatchPlaylistIds, ...SUMMER_SESSION_PLAYLIST_IDS]).has(p.id),
)

function resolveBannerArt(key: string) {
  return albumArtAssets[key] ?? artistAssets[key] ?? oliviaAboutAssets[key] ?? null
}

function PlayBadge({ size = 28 }: { size?: number }) {
  return (
    <View style={[s.playBadge, { width: size, height: size, borderRadius: size / 2 }]}>
      <Ionicons name="play" size={size * 0.46} color="#fff" style={{ marginLeft: 1 }} />
    </View>
  )
}

export default function CasualHome() {
  const router = useRouter()
  const { playSongAt } = usePlaybackState()
  const { activeProfile } = useProfiles()
  const { scrollY, onScroll } = useStickyHomeScroll()
  const stickyHeaderHeight = useStickyHomeHeaderHeight()

  // Top-bar domain drill-down — Podcast / Audible pills → pick one → that
  // domain's browse (no personalized "For You" cut, no Music pill for KSM).
  const [domain, setDomain] = useState<number | null>(null)

  const jumpBackIn = continueListeningItems.slice(0, 4)
  const albums = useMemo(() => uniqueAlbumsFromSongs(songs, 10), [])
  const artists = useMemo(() => getFeaturedArtists(null, homeFeaturedArtistIds, 16), [])

  const songsForYouPages = useMemo(() => chunk(MADE_FOR_YOU.slice(0, 9), SONGS_PER_PAGE), [])
  const songsForYouSnapOffsets = useMemo(() => songsForYouPages.map((_, i) => i * SONG_PAGE_WIDTH), [songsForYouPages])

  const deepDiveArtist = useMemo(() => {
    const id = DEEP_DIVE_ARTIST_POOL[Math.floor(Math.random() * DEEP_DIVE_ARTIST_POOL.length)]
    return allArtists.find(a => a.id === id) ?? allArtists[0]
  }, [])
  const deepDiveSongs = useMemo(() => songs.filter(s => s.artistId === deepDiveArtist.id), [deepDiveArtist])

  const openSong = (id: string) => {
    playSongAt(id)
    router.push('/now-playing')
  }

  // "Albums you might like" cards are one representative song standing in
  // for its whole album — tapping one should open that album's page (with
  // its real tracklist), not immediately start playing the stand-in song.
  const openAlbum = (song: Song) => {
    router.push(`/album/song-album-${song.id}` as any)
  }

  // `onItemPress` defaults to playing the song — the right behavior for every
  // rail here except "Albums you might like" below, which stands in one song
  // per album and needs to open that album's page instead (see openAlbum).
  const coverRail = (title: string, list: Song[], sub?: string, onItemPress: (song: Song) => void = song => openSong(song.id)) => (
    <View style={s.block}>
      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>{title}</Text>
        {sub ? <Text style={s.sectionSub}>{sub}</Text> : null}
      </View>
      <EdgeFadeRow>
        <HRail
          data={list}
          keyExtractor={(song: Song) => song.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.rail}
          nestedScrollEnabled
          renderItem={({ item: song }: { item: Song }) => {
            const art = song.albumArtPath ? albumArtAssets[song.albumArtPath] : null
            return (
              <TouchableOpacity style={s.coverCard} activeOpacity={0.85} onPress={() => onItemPress(song)}>
                <View style={s.coverArtWrap}>
                  {art ? (
                    <Image source={art} style={s.coverArt} resizeMode="cover" />
                  ) : (
                    <View style={[s.coverArt, { backgroundColor: song.albumArtColor }]}>
                      <Ionicons name="musical-note" size={26} color="rgba(255,255,255,0.15)" />
                    </View>
                  )}
                  <View style={s.artBorderOverlay} pointerEvents="none" />
                </View>
                <Text style={s.coverTitle} numberOfLines={1}>{song.title}</Text>
                <Text style={s.coverSub} numberOfLines={1}>{song.artistName}</Text>
              </TouchableOpacity>
            )
          }}
        />
      </EdgeFadeRow>
    </View>
  )

  // ── Resume group — same big "Continue Listening" card pattern as the
  // baseline (Derbc Studios) home, not small truncated row cards. ───────────
  const jumpBackInBlock = jumpBackIn.length > 0 && (
    <View style={s.block}>
      <View style={s.sectionHead}><Text style={s.sectionTitle}>Jump back in</Text></View>
      <EdgeFadeRow>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
          {jumpBackIn.map(item => {
            const art = item.artKey ? resolveBannerArt(item.artKey) : null
            const kind = continueListeningKind(item.id)
            return (
              <TouchableOpacity
                key={item.id}
                style={s.continueCard}
                activeOpacity={0.85}
                onPress={() =>
                  item.podcastId
                    ? router.push(`/podcast-show/${item.podcastId}` as any)
                    : item.songId && openSong(item.songId)
                }
              >
                <View style={s.continueArtWrap}>
                  {art ? (
                    <Image source={art} style={s.continueArt} resizeMode="cover" />
                  ) : (
                    <View style={[s.continueArt, { backgroundColor: C.surface }]} />
                  )}
                  <View style={s.continuePlayPos}><PlayBadge size={30} /></View>
                </View>
                <Text style={s.continueTitle} numberOfLines={2}>{item.title}</Text>
                <View style={s.quickKindRow}>
                  <Ionicons name={kind.icon as any} size={10} color={C.textMuted} />
                  <Text style={s.quickKind}>{kind.label}</Text>
                </View>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </EdgeFadeRow>
    </View>
  )

  const myMixesBlock = (
    <View style={s.block}>
      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>My Mixes</Text>
        <Text style={s.sectionSub}>Updated at 6:00 AM</Text>
      </View>
      <EdgeFadeRow>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
          {MY_MIXES.map(mix => (
            <MixCard
              key={mix.id}
              name={mix.name}
              artKey={mix.coverArtPath}
              onPress={() => router.push(`/playlist/${mix.id}` as any)}
            />
          ))}
        </ScrollView>
      </EdgeFadeRow>
    </View>
  )

  // ── Endless-scroll filler, after My Mixes — the deeper you scroll, the more
  // the wider catalog surfaces. Deliberately generic / not theme-tailored.
  // "Recently played" is skipped here since it's already the default home's
  // own top section for KSM (same data source — RECENTLY_PLAYED above).
  const endlessScrollBlock = (
    <>
      {NEW_RELEASES.length > 0 && coverRail('New Releases For You', NEW_RELEASES)}
      {deepDiveSongs.length > 0 && coverRail(`Deep Dive: ${deepDiveArtist.name}`, deepDiveSongs, 'More from an artist you follow')}
      {SPECIAL_AUDIO_SONGS.length > 0 && coverRail('Special Audio Albums', SPECIAL_AUDIO_SONGS, 'Dolby Atmos & 360 Reality Audio')}

      <View style={s.block}>
        <View style={s.sectionHead}>
          <Text style={s.sectionTitle}>Stations For You</Text>
          <Text style={s.sectionSub}>Hot picks, playing now</Text>
        </View>
        <EdgeFadeRow>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
            {RADIO_STATIONS.map(st => {
              const art = albumArtAssets[st.artKey] ?? null
              return (
                <TouchableOpacity key={st.id} style={s.coverCard} activeOpacity={0.85} onPress={() => openSong(st.songId)}>
                  <View style={s.coverArtWrap}>
                    {art ? (
                      <Image source={art} style={s.coverArt} resizeMode="cover" />
                    ) : (
                      <View style={[s.coverArt, { backgroundColor: C.surface }]} />
                    )}
                    <View style={s.artBorderOverlay} pointerEvents="none" />
                    <View style={s.coverPlayPos}>
                      <View style={[s.playBadge, { width: 28, height: 28, borderRadius: 14 }]}>
                        <MaterialIcons name="sensors" size={16} color="#fff" />
                      </View>
                    </View>
                  </View>
                  <Text style={s.coverTitle} numberOfLines={1}>{st.name}</Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </EdgeFadeRow>
      </View>

      {SUMMER_SESSION_PLAYLISTS.length > 0 && (
        <View style={s.block}>
          <View style={s.sectionHead}><Text style={s.sectionTitle}>Summer Sessions</Text></View>
          <EdgeFadeRow>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
              {SUMMER_SESSION_PLAYLISTS.map(pl => (
                <PlaylistMoodCard
                  key={pl.id}
                  name={pl.name}
                  artKey={pl.coverArtPath ?? ''}
                  onPress={() => router.push(`/playlist/${pl.id}` as any)}
                />
              ))}
            </ScrollView>
          </EdgeFadeRow>
        </View>
      )}

      {OLIVIA_FEATURED_FILLER.length > 0 && coverRail('Featured This Week', OLIVIA_FEATURED_FILLER, 'Because you listen to Olivia Rodrigo')}

      {TRUE_CRIME_PODCASTS.length > 0 && (
        <View style={s.block}>
          <View style={s.sectionHead}><Text style={s.sectionTitle}>True Crime Picks</Text></View>
          <EdgeFadeRow>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
              {TRUE_CRIME_PODCASTS.map(pod => {
                const art = pod.coverArtPath ? resolveBannerArt(pod.coverArtPath) : null
                return (
                  <TouchableOpacity key={pod.id} style={s.podCard} activeOpacity={0.85} onPress={() => router.push(`/podcast-show/${pod.id}` as any)}>
                    {art ? (
                      <Image source={art} style={s.podArt} resizeMode="cover" />
                    ) : (
                      <View style={[s.podArt, { backgroundColor: C.surface }]}>
                        <Ionicons name="mic" size={28} color="rgba(255,255,255,0.2)" />
                      </View>
                    )}
                    <Text style={s.coverTitle} numberOfLines={2}>{pod.title}</Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </EdgeFadeRow>
        </View>
      )}

      <View style={s.block}>
        <View style={s.sectionHead}><Text style={s.sectionTitle}>Podcasts For You</Text></View>
        <EdgeFadeRow>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
            {PODCASTS_FOR_YOU_FILLER.map(pod => {
              const art = pod.coverArtPath ? resolveBannerArt(pod.coverArtPath) : null
              return (
                <TouchableOpacity key={pod.id} style={s.podCard} activeOpacity={0.85} onPress={() => router.push(`/podcast-show/${pod.id}` as any)}>
                  {art ? (
                    <Image source={art} style={s.podArt} resizeMode="cover" />
                  ) : (
                    <View style={[s.podArt, { backgroundColor: C.surface }]}>
                      <Ionicons name="mic" size={28} color="rgba(255,255,255,0.2)" />
                    </View>
                  )}
                  <Text style={s.coverTitle} numberOfLines={2}>{pod.title}</Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </EdgeFadeRow>
      </View>

      {MORE_PLAYLISTS_FOR_YOU.length > 0 && (
        <View style={s.block}>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>Playlists You Might Like</Text>
            <Text style={s.sectionSub}>Fresh picks, updated every Sunday</Text>
          </View>
          <EdgeFadeRow>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
              {MORE_PLAYLISTS_FOR_YOU.map(pl => (
                <PlaylistMoodCard
                  key={pl.id}
                  name={pl.name}
                  artKey={pl.coverArtPath ?? ''}
                  onPress={() => router.push(`/playlist/${pl.id}` as any)}
                />
              ))}
            </ScrollView>
          </EdgeFadeRow>
        </View>
      )}
    </>
  )

  const podcastRail = (title: string, sub?: string) => (
    <View style={s.block}>
      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>{title}</Text>
        {sub ? <Text style={s.sectionSub}>{sub}</Text> : null}
      </View>
      <EdgeFadeRow>
        <HRail
          data={podcasts}
          keyExtractor={pod => pod.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.rail}
          nestedScrollEnabled
          renderItem={({ item: pod }) => {
            const art = pod.coverArtPath ? resolveBannerArt(pod.coverArtPath) : null
            return (
              <TouchableOpacity style={s.podCard} activeOpacity={0.85} onPress={() => router.push(`/podcast-show/${pod.id}` as any)}>
                {art ? (
                  <Image source={art} style={s.podArt} resizeMode="cover" />
                ) : (
                  <View style={[s.podArt, { backgroundColor: C.surface }]}>
                    <Ionicons name="mic" size={28} color="rgba(255,255,255,0.2)" />
                  </View>
                )}
                <Text style={s.coverTitle} numberOfLines={2}>{pod.title}</Text>
              </TouchableOpacity>
            )
          }}
        />
      </EdgeFadeRow>
    </View>
  )

  // ── For You group ─────────────────────────────────────────────────────────
  const popularArtistsBlock = (
    <View style={s.block}>
      <View style={s.sectionHead}><Text style={s.sectionTitle}>Popular artists</Text></View>
      <EdgeFadeRow>
        <HRail
          data={artists}
          keyExtractor={artist => artist.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.rail}
          nestedScrollEnabled
          renderItem={({ item: artist }) => {
            const art = resolveArtistAvatar(artist.id, artist.imageUri)
            return (
              <TouchableOpacity style={s.artistCard} activeOpacity={0.85} onPress={() => router.push(`/artist/${artist.id}` as any)}>
                {art ? (
                  <Image source={art} style={s.artistAvatar} resizeMode="cover" />
                ) : (
                  <View style={[s.artistAvatar, { backgroundColor: C.surface }]}>
                    <Ionicons name="person" size={34} color="rgba(255,255,255,0.2)" />
                  </View>
                )}
                <Text style={s.artistName} numberOfLines={1}>{artist.name}</Text>
              </TouchableOpacity>
            )
          }}
        />
      </EdgeFadeRow>
    </View>
  )

  const playlistsBlock = (
    <View style={s.block}>
      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>Playlists for every mood</Text>
        <Text style={s.sectionSub}>Ready-made mixes for whatever you're doing</Text>
      </View>
      <EdgeFadeRow>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} nestedScrollEnabled>
          {RELATED_PLAYLISTS.map(pl => (
            <PlaylistMoodCard
              key={pl.name}
              name={pl.name}
              artKey={pl.artKey}
              onPress={() => router.push(`/genre/${encodeURIComponent(pl.genre)}` as any)}
            />
          ))}
        </ScrollView>
      </EdgeFadeRow>
    </View>
  )

  // ── NEW — Current session / New in session / Songs for You / You and your
  // favorites (Figma "landing/new" — the casual variant has no unlocked
  // superfan content, so it skips straight from the session header to the
  // artist rail, unlike the persona home's featured-favorite bento). ──────────
  const sessionBlock = (
    <>
      <View style={s.sessionWrap}>
        <View style={s.sessionCard}>
          <LinearGradient
            colors={['#000', '#000', 'rgba(37,209,218,0.16)', 'rgba(0,0,0,0.9)', '#000']}
            locations={[0, 0.14, 0.42, 0.75, 1]}
            style={StyleSheet.absoluteFill}
          />

          {artists.length > 0 && (
            <View style={s.newInSessionBlock}>
              <Text style={s.newInSessionHeading}>Start a new session</Text>
              <EdgeFadeRow>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.newInSessionRail} nestedScrollEnabled>
                  {artists.slice(0, 8).map(artist => {
                    const art = resolveArtistAvatar(artist.id, artist.imageUri)
                    return (
                      <TouchableOpacity key={artist.id} style={s.newInSessionCard} activeOpacity={0.85} onPress={() => router.push(`/artist/${artist.id}` as any)}>
                        {art ? (
                          <Image source={art} style={StyleSheet.absoluteFill} resizeMode="cover" />
                        ) : (
                          <View style={[StyleSheet.absoluteFill, { backgroundColor: C.surface }]} />
                        )}
                        <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.72)']} style={StyleSheet.absoluteFill} />
                        <Text style={s.newInSessionName} numberOfLines={1}>{artist.name}</Text>
                      </TouchableOpacity>
                    )
                  })}
                </ScrollView>
              </EdgeFadeRow>
            </View>
          )}
        </View>
      </View>

      {songsForYouPages.length > 0 && (
        <View style={s.block}>
          <View style={s.sectionHead}><Text style={s.sectionTitle}>Songs for You</Text></View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="normal"
            snapToOffsets={songsForYouSnapOffsets}
            snapToAlignment="start"
            nestedScrollEnabled
            contentContainerStyle={[s.songsScrollContent, { paddingRight: SONG_PAGE_PEEK }]}
          >
            {songsForYouPages.map((page, pageIdx) => (
              <View key={`sfy-page-${pageIdx}`} style={[s.songsPage, { width: SONG_PAGE_WIDTH }]}>
                {page.map(song => {
                  const art = song.albumArtPath ? albumArtAssets[song.albumArtPath] : null
                  return (
                    <TouchableOpacity key={song.id} style={s.gridSongRow} activeOpacity={0.8} onPress={() => openSong(song.id)}>
                      {art ? (
                        <Image source={art} style={s.gridSongArt} resizeMode="cover" />
                      ) : (
                        <View style={[s.gridSongArt, { backgroundColor: song.albumArtColor }]} />
                      )}
                      <View style={s.gridSongInfo}>
                        <View style={s.songTitleRow}>
                          <Text style={[s.gridSongTitle, s.songTitleFlex]} numberOfLines={1}>{song.title}</Text>
                          {song.isExclusive && <Text style={s.exclusiveBadgeText}>EXCLUSIVE</Text>}
                        </View>
                        <Text style={s.gridSongArtist} numberOfLines={1}>{song.artistName}</Text>
                      </View>
                    </TouchableOpacity>
                  )
                })}
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* "You and your favorites" intentionally omitted here — KSM is a brand-new
          listener with no built-up history yet; showing established "favorites"
          would contradict that. It reappears once she's engaged enough to earn it. */}
    </>
  )

  return (
    <View style={s.screen}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28 }}
        style={{ backgroundColor: 'transparent' }}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <View style={{ height: stickyHeaderHeight + 22 }} />

        {domain === null ? (
          <>
            {sessionBlock}
            {jumpBackInBlock}
            <ShowsYouWatchRail />
            {coverRail('Recently played', RECENTLY_PLAYED)}
            {coverRail('Made for you', MADE_FOR_YOU, 'Fresh picks to explore')}
            {popularArtistsBlock}
            {coverRail('Trending now', TRENDING)}
            {coverRail('Albums you might like', albums, undefined, openAlbum)}
            {playlistsBlock}
            {podcastRail('Podcasts for you')}
            {myMixesBlock}
            {endlessScrollBlock}
          </>
        ) : (
          <>
            {podcastRail(domain === 1 ? 'Audiobooks & spoken word' : 'Podcasts for you')}
            {podcastRail('Popular shows')}
            {podcastRail('New & trending')}
          </>
        )}
      </Animated.ScrollView>

      <StickyHomeHeader
        firstName={activeProfile.name.split(' ')[0]}
        activePill={domain}
        onPillChange={setDomain}
        scrollY={scrollY}
        domainNav={{
          domains: DOMAIN_LABELS,
          domain,
          onSelectDomain: (i: number) => setDomain(i),
          onBack: () => setDomain(null),
        }}
      />
    </View>
  )
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },

  // NEW — New in session (Figma "landing/new")
  sessionWrap: { marginBottom: 34 },
  sessionCard: { overflow: 'hidden', paddingTop: 20, paddingBottom: 18, paddingHorizontal: 16 },
  newInSessionBlock: { marginTop: 4 },
  newInSessionHeading: { ...typeHeadline(18), color: '#fff', marginBottom: 12 },
  newInSessionRail: { gap: 10 },
  newInSessionCard: { width: 140, height: 244, borderRadius: 12, overflow: 'hidden', justifyContent: 'flex-end', padding: 12 },
  newInSessionName: { fontSize: 16, fontWeight: '700', color: '#fff' },

  // NEW — Songs for You vertical list
  songsScrollContent: { paddingLeft: 16 },
  songsPage: { paddingRight: 14, gap: 22 },
  gridSongRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  gridSongArt: { width: 56, height: 56, borderRadius: 6 },
  gridSongInfo: { flex: 1, marginRight: 8 },
  gridSongTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
  gridSongArtist: { fontSize: 13, color: C.textSecondary, marginTop: 3 },
  songTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  songTitleFlex: { flex: 1 },
  exclusiveBadgeText: { fontSize: 10, fontWeight: '700', color: C.cyan, letterSpacing: 0.5, flexShrink: 0 },

  // NEW — You and your favorites (listening-insight cards)
  favoritesHeadRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 14 },
  seeMoreText: { fontSize: 13, fontWeight: '700', color: C.textMuted },
  insightCard: { width: 190, height: 190, borderRadius: 16, overflow: 'hidden', padding: 12, justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(255,255,255,0.24)' },
  insightHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  insightAvatarWrap: { width: 32, height: 32, borderRadius: 16, overflow: 'hidden' },
  insightAvatar: { width: 32, height: 32 },
  insightTag: { fontSize: 11, fontWeight: '700', color: '#fff' },
  insightName: { fontSize: 14, fontWeight: '700', color: '#fff', marginTop: 2 },
  insightBody: { gap: 4 },
  insightMonth: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.75)', letterSpacing: 0.4 },
  insightCaption: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 4 },

  tabRow: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 22, gap: 8 },
  tabPill: {
    paddingVertical: 8,
    paddingHorizontal: 22,
    borderRadius: R.full,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  tabPillActive: { backgroundColor: C.cyan },
  tabLabel: { fontSize: 14, fontWeight: '600', color: C.textPrimary },
  tabLabelActive: { color: '#000000' },

  block: { marginBottom: 42 },
  sectionHead: { paddingHorizontal: 16, marginBottom: 14 },
  sectionTitle: { ...typeHeadline(20), color: '#fff' },
  sectionSub: { fontSize: 13, color: C.textSecondary, marginTop: 2 },
  rail: { paddingHorizontal: 16, gap: 16 },

  // Jump back in — big "Continue Listening" cards, matching the baseline home
  continueCard: { width: 150 },
  continueArtWrap: { position: 'relative', marginBottom: 8 },
  continueArt: { width: 150, height: 150, borderRadius: 8, overflow: 'hidden' },
  continuePlayPos: { position: 'absolute', bottom: 8, left: 8 },
  continueTitle: { fontSize: 15, fontWeight: '600', color: '#fff', lineHeight: 19 },
  quickKindRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  quickKind: { fontSize: 10, color: C.textMuted, fontWeight: '600', letterSpacing: 0.3 },

  coverCard: { width: 150 },
  coverArtWrap: { width: 150, height: 150, borderRadius: 8, overflow: 'hidden', position: 'relative' },
  coverArt: { width: 150, height: 150, alignItems: 'center', justifyContent: 'center' },
  coverPlayPos: { position: 'absolute', right: 8, bottom: 8 },
  artBorderOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 0.75,
    borderColor: 'rgba(255,255,255,0.24)',
    borderRadius: 8,
  },
  coverTitle: { fontSize: 14, fontWeight: '600', color: '#fff', marginTop: 8 },
  coverSub: { fontSize: 12, color: C.textSecondary, marginTop: 2 },

  artistCard: { width: 132, alignItems: 'center' },
  artistAvatar: { width: 132, height: 132, borderRadius: 66, alignItems: 'center', justifyContent: 'center' },
  artistName: { fontSize: 13, fontWeight: '600', color: '#fff', marginTop: 8, textAlign: 'center' },

  podCard: { width: 156 },
  podArt: { width: 156, height: 156, borderRadius: 10, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: C.surface },

  playBadge: { backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' },
})
