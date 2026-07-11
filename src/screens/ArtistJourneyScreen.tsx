import { useMemo, useState, useEffect } from 'react'
import {
  ScrollView,
  View,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { Text } from '../components/AppText'
import { AppImage as Image } from '../components/AppImage'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { artists, songs } from '../data/mockData'
import { albumArtAssets, resolveArtistAvatar } from '../data/assetMap'
import { buildArtistPage, listenerStateFor, type ArtistLyric } from '../data/artistPages'
import { getArtistAbout } from '../data/artistAbout'
import { usePlaybackState } from '../hooks/usePlaybackState'
import { useAdaptiveUI } from '../context/AdaptiveUIContext'
import { useAdaptiveMenu } from '../components/AdaptiveContextMenu'
import { useProfiles } from '../context/ProfilesContext'
import ArtistAboutTab from '../components/artist/ArtistAboutTab'
import { ArtistEventsCard, ArtistMerchGrid, FanPostCard, type MerchItem } from '../components/artist/ArtistCommerce'
import { C, typeHeadline } from '../theme'


// RN-web sizes an ImageBackground's inner image from the asset's intrinsic
// dimensions when the style has no explicit width/height (native stretches
// it). Force full-bleed so web and Expo Go render identically.
const COVER_IMG = { width: '100%', height: '100%' } as const

const MUSIC_STREAMS = [89_234_567, 45_678_901, 23_456_789, 12_345_678, 9_876_543, 4_567_890]
function fmtStreams(n: number) { return n.toLocaleString('en-US') }

const ERA_CARD_W = 120
const ERA_CARD_H = 122

const LYRIC_FRONT_GRADIENT = ['rgba(37,209,218,0.12)', 'rgba(37,209,218,0.55)'] as const

function ExplicitBadge() {
  return (
    <View style={s.explicitBadge}>
      <Text style={s.explicitText}>E</Text>
    </View>
  )
}

function LyricStackCard({
  item,
  variant,
  containerStyle,
  resolveArt,
}: {
  item: ArtistLyric
  variant: 'front' | 'back'
  containerStyle: any
  resolveArt: (key: string) => any
}) {
  const front = variant === 'front'
  return (
    <View style={containerStyle}>
      <LinearGradient
        colors={front ? LYRIC_FRONT_GRADIENT : item.gradient}
        style={StyleSheet.absoluteFill}
      />
      <View style={s.lyricStackHeader}>
        <Image source={resolveArt(item.artKey)} style={s.lyricStackArt} />
        <Text style={s.lyricStackSong} numberOfLines={1}>{item.song}</Text>
      </View>
      <Text style={front ? s.lyricStackTextFront : s.lyricStackText}>{item.lyric}</Text>
      <View style={s.lyricStackFans}>
        <Ionicons name="heart" size={front ? 14 : 12} color={C.cyan} />
        <Text style={s.lyricStackFansText}>by 12k fans</Text>
      </View>
    </View>
  )
}

// Deep-link tab values (?tab=you|about|events|merch) — same contract the
// HTML embeds honored, now handled natively.
const DEEP_TABS: Record<string, string> = {
  about: 'About',
  events: 'Events',
  merch: 'Merch',
}

export default function ArtistJourneyScreen({ id, initialTab }: { id: string; initialTab?: string }) {
  const router = useRouter()

  // Deep-linked or reloaded pages have no history entry — a bare router.back()
  // silently no-ops and the back chevron reads as broken. Land on Home instead.
  const goBack = () => {
    if (router.canGoBack()) router.back()
    else router.replace('/')
  }
  const insets = useSafeAreaInsets()
  const { playSongAt } = usePlaybackState()
  const { showConfirmation } = useAdaptiveUI()
  const { open: openAdaptiveMenu } = useAdaptiveMenu()
  const { activeProfile } = useProfiles()

  const artist = useMemo(() => artists.find(a => a.id === id) ?? artists[0], [id])
  const page = useMemo(() => buildArtistPage(artist.id), [artist.id])

  // Durable listener state — the four discrete steps the adaptive prototypes
  // staged (cold/casual/regular/superfan), derived from the listener's bond
  // with this artist. Gates how much of the page has been earned: the page
  // starts standard and grows, it never guesses.
  const state = useMemo(() => listenerStateFor(artist.id), [artist.id])
  const converged = state === 'regular' || state === 'superfan'
  const artistSongs = useMemo(() => songs.filter(sg => sg.artistId === artist.id), [artist.id])
  const about = useMemo(() => getArtistAbout(artist.id), [artist.id])
  const merchItems = useMemo<MerchItem[]>(
    () => page.merch.map(mi => ({ title: mi.name, subtitle: mi.type, price: mi.price, artKey: mi.artKey })),
    [page.merch],
  )

  // Artists of the same genre — shown in "Fans also like" on the Music tab.
  const relatedArtists = useMemo(
    () => artists.filter(a => a.id !== artist.id && a.genre === artist.genre).slice(0, 8),
    [artist],
  )

  const TABS = useMemo(
    () => ['Music', 'Events', 'Merch', 'About', `You & ${page.firstName}`] as const,
    [page.firstName],
  )
  const journeyTab = `You & ${page.firstName}`

  const [tab, setTab] = useState<string>(() =>
    initialTab === 'you' ? journeyTab : DEEP_TABS[initialTab ?? ''] ?? 'Music',
  )
  const [selectedIdx, setSelectedIdx] = useState(0)
  // Following mirrors the earned relationship; new listeners start unfollowed.
  const [following, setFollowing] = useState(converged)
  // Popular community scope — Everyone's chart vs what super fans replay.
  const [popScope, setPopScope] = useState<'everyone' | 'superfans'>('everyone')

  // If the route instance is ever reused with a different artist (replace/
  // setParams instead of push), reseed the per-artist state — otherwise the
  // previous artist's follow state, era index, and tab label leak through.
  useEffect(() => {
    setFollowing(converged)
    setSelectedIdx(0)
    setPopScope('everyone')
    setTab(initialTab === 'you' ? journeyTab : DEEP_TABS[initialTab ?? ''] ?? 'Music')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artist.id])

  // Popular rows: dedupe by title; the super-fan scope reads the community's
  // replay chart (a deterministic alternate ordering of the same catalog).
  const popularRows = useMemo(() => {
    const seen = new Set<string>()
    const rows = artistSongs.filter(sg => {
      if (seen.has(sg.title)) return false
      seen.add(sg.title)
      return true
    }).slice(0, 6)
    if (popScope === 'superfans' && rows.length > 1) return [...rows.slice(1), rows[0]]
    return rows
  }, [artistSongs, popScope])

  const avatar = resolveArtistAvatar(artist.id, artist.imageUri)
  const resolveArt = (key: string) => albumArtAssets[key] ?? avatar
  const heroSource = avatar ?? (page.eras[0] ? resolveArt(page.eras[0].eraImageKey) : null)

  const selectedEra = page.eras[selectedIdx] ?? page.eras[0]
  const hasJourney = page.eras.length > 0

  // Timeline progress — fills to the selected era's position and slides as the
  // listener taps forward/backward through their journey.
  const timelineFillPct = page.eras.length > 1
    ? ((selectedIdx + 1) / page.eras.length) * 100
    : 100
  const fillProgress = useSharedValue(timelineFillPct)
  useEffect(() => {
    fillProgress.value = withTiming(timelineFillPct, {
      duration: 340,
      easing: Easing.out(Easing.cubic),
    })
  }, [timelineFillPct, fillProgress])
  const timelineFillStyle = useAnimatedStyle(() => ({
    width: `${fillProgress.value}%`,
  }))

  const playByTitle = (title?: string) => {
    const match = title
      ? artistSongs.find(sg => sg.title.toLowerCase() === title.toLowerCase())
      : artistSongs[0]
    if (match) {
      playSongAt(match.id)
      router.push('/now-playing')
    }
  }

  // Shuffle starts a random track without leaving the page — the mini player
  // and a toast confirm it, like the real app.
  const shufflePlay = () => {
    if (artistSongs.length === 0) return
    const pick = artistSongs[Math.floor(Math.random() * artistSongs.length)]
    playSongAt(pick.id)
    showConfirmation(`Shuffling ${artist.name}`)
  }

  // Same bottom-sheet menu as long-press everywhere else (replaces the old OS alert).
  const showArtistMenu = () => {
    openAdaptiveMenu({ kind: 'artist', artistId: artist.id, name: artist.name, imageUri: artist.imageUri })
  }

  return (
    <View style={s.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Hero */}
        <View style={s.heroWrap}>
          {heroSource ? (
            <ImageBackground source={heroSource} style={s.heroBg} imageStyle={COVER_IMG} resizeMode="cover">
              <HeroOverlay
                insets={insets}
                page={page}
                avatar={avatar}
                activeProfile={activeProfile}
                following={following}
                showProof={converged}
                onBack={goBack}
                onToggleFollow={() => setFollowing(f => !f)}
                onPlay={() => playByTitle()}
                onShuffle={shufflePlay}
                onMenu={showArtistMenu}
              />
            </ImageBackground>
          ) : (
            <View style={[s.heroBg, { backgroundColor: C.surface }]}>
              <HeroOverlay
                insets={insets}
                page={page}
                avatar={avatar}
                activeProfile={activeProfile}
                following={following}
                showProof={converged}
                onBack={goBack}
                onToggleFollow={() => setFollowing(f => !f)}
                onPlay={() => playByTitle()}
                onShuffle={shufflePlay}
                onMenu={showArtistMenu}
              />
            </View>
          )}
        </View>

        {/* Tabs */}
        <View style={s.tabBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabRow}>
            {TABS.map(t => (
              <TouchableOpacity key={t} onPress={() => setTab(t)} style={s.tabItem}>
                <Text style={[s.tabText, tab === t && s.tabTextActive]}>{t}</Text>
                {tab === t && <View style={s.tabUnderline} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {tab === journeyTab ? (
          !(converged && hasJourney) ? (
            <View style={s.content}>
              {/* The journey exists only once there is a journey — until then
                  the tab is honest about what will appear here */}
              <View style={s.block}>
                <View style={s.coldHint}>
                  <Text style={s.coldHintLead}>
                    No history between you two yet. Listen for a few weeks and this tab becomes{' '}
                    <Text style={s.histBold}>your timeline</Text> with {page.firstName} — eras, first
                    plays, and the numbers behind them.
                  </Text>
                  <View style={s.coldChipRow}>
                    {['Era timeline', 'First play', 'Minutes & streaks'].map(cLabel => (
                      <View key={cLabel} style={s.coldChip}>
                        <Text style={s.coldChipText}>{cLabel}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={s.coldHintNote}>
                    Nothing is stored until it&apos;s earned; the standard page holds until then.
                  </Text>
                </View>
              </View>
            </View>
          ) : (
          <View style={s.content}>
            {/* Exclusive — a milestone unlock, so it only exists at full depth */}
            {page.exclusive && state === 'superfan' && (
              <View style={s.block}>
                <Text style={s.sectionTitle}>Exclusive For You</Text>
                <View style={s.exclusiveCard}>
                  <ImageBackground
                    source={resolveArt(page.exclusive.artKey)}
                    style={s.exclusiveImg}
                    imageStyle={[COVER_IMG, s.exclusiveImgRadius]}
                    resizeMode="cover"
                  >
                    <LinearGradient
                      colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.95)']}
                      locations={[0.5, 1]}
                      style={StyleSheet.absoluteFill}
                    />
                    <View style={s.exclusiveImgCaption}>
                      <Text style={s.exclusiveImgTitle} numberOfLines={2}>
                        {page.exclusive.title}
                      </Text>
                      <Text style={s.exclusiveImgDate}>{page.exclusive.date}</Text>
                    </View>
                  </ImageBackground>
                  <View style={s.exclusiveText}>
                    <Text style={s.exclusiveTag}>{page.exclusive.tag}</Text>
                    <Text style={s.exclusiveMilestone}>{page.exclusive.milestone}</Text>
                    <Text style={s.exclusiveBody}>{page.exclusive.body}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Journey eras — only when there's a real timeline (2+ eras) */}
            {page.eras.length > 1 && (
              <>
                <View style={s.block}>
                  <View style={s.sectionHeaderRow}>
                    <Text style={s.sectionTitle}>Your Journey with {page.firstName}</Text>
                    <TouchableOpacity onPress={() => setSelectedIdx(0)} hitSlop={8}>
                      <Text style={s.sectionLink}>Back to Now</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={s.eraRail}
                  >
                    {page.eras.map((era, i) => {
                      const selected = i === selectedIdx
                      return (
                        <TouchableOpacity
                          key={era.id}
                          activeOpacity={0.9}
                          onPress={() => setSelectedIdx(i)}
                          style={[s.eraCard, selected && s.eraCardSelected]}
                        >
                          <ImageBackground
                            source={resolveArt(era.eraImageKey)}
                            style={StyleSheet.absoluteFill}
                            imageStyle={[COVER_IMG, { borderRadius: 8 }]}
                            resizeMode="cover"
                          >
                            <LinearGradient
                              colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.75)']}
                              style={StyleSheet.absoluteFill}
                            />
                          </ImageBackground>
                          <View style={s.eraCardFooter}>
                            <Text style={s.eraSeason}>{era.season}</Text>
                            <Text style={s.eraTitle} numberOfLines={1}>{era.title}</Text>
                            <Text style={s.eraBadge}>{era.badge}</Text>
                          </View>
                        </TouchableOpacity>
                      )
                    })}
                  </ScrollView>

                  <View style={s.timelineTrack}>
                    <Animated.View style={[s.timelineFill, timelineFillStyle]}>
                      <View style={s.timelineThumb} />
                    </Animated.View>
                  </View>
                </View>

                {selectedEra && (
                  <View style={s.eraDetail}>
                    <Text style={s.eraDetailSeason}>{selectedEra.season.toUpperCase()}</Text>
                    <Text style={s.eraDetailTitle}>{selectedEra.title}</Text>
                    <Text style={s.eraDetailDesc}>{selectedEra.description}</Text>
                  </View>
                )}
              </>
            )}

            {/* Time together */}
            {selectedEra && (
              <View style={s.block}>
                <Text style={s.sectionTitle}>Time You Spent Together</Text>
                <ImageBackground
                  source={resolveArt(selectedEra.eraImageKey)}
                  style={s.statsCard}
                  imageStyle={[COVER_IMG, { borderRadius: 12 }]}
                  resizeMode="cover"
                >
                  <View style={s.statsOverlay} />
                  <View style={s.statsTop}>
                    <Image source={resolveArt(selectedEra.topTrack.artKey)} style={s.statsArt} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.statsEyebrow}>You played this on repeat</Text>
                      <Text style={s.statsTrack} numberOfLines={1}>{selectedEra.topTrack.title}</Text>
                      <Text style={s.statsPlays}>{selectedEra.topTrack.plays} plays</Text>
                    </View>
                  </View>
                  <View style={s.statsGrid}>
                    <View style={s.statCell}>
                      <Text style={s.statLabel}>Minutes Listened</Text>
                      <Text style={s.statValue}>{page.stats.minutesListened}</Text>
                    </View>
                    <View style={s.statCell}>
                      <Text style={s.statLabel}>Days of Longest streak</Text>
                      <Text style={s.statValue}>{page.stats.longestStreakDays}</Text>
                    </View>
                    <View style={s.statCell}>
                      <Text style={s.statLabel}>Among Friends</Text>
                      <Text style={s.statValue}>{page.stats.amongFriendsRank}</Text>
                    </View>
                  </View>
                </ImageBackground>
              </View>
            )}

            {/* What you played back then */}
            {selectedEra && selectedEra.playedThen.length > 0 && (
              <View style={s.block}>
                <View style={s.sectionHeaderRow}>
                  <Text style={s.sectionTitle}>What you played back then</Text>
                </View>
                <LinearGradient
                  colors={['rgba(80,76,118,0.48)', 'rgba(0,0,0,0.95)']}
                  style={s.playedCard}
                >
                  {selectedEra.playedThen.map(track => (
                    <TouchableOpacity
                      key={track.title}
                      style={s.trackRow}
                      onPress={() => playByTitle(track.title)}
                      activeOpacity={0.8}
                    >
                      <Image source={resolveArt(track.artKey)} style={s.trackArt} />
                      <View style={{ flex: 1 }}>
                        <View style={s.trackTitleRow}>
                          <Text style={s.trackTitle} numberOfLines={1}>{track.title}</Text>
                          <ExplicitBadge />
                        </View>
                        <Text style={s.trackArtist}>{page.name}</Text>
                      </View>
                      <Ionicons name="heart" size={22} color={C.cyan} />
                      <Ionicons name="ellipsis-horizontal" size={20} color="#888" />
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity style={s.playMixBtn} onPress={() => playByTitle()} activeOpacity={0.85}>
                    <Text style={s.playMixText}>Play Your Mix</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            )}

            {/* Favorite lyrics — only for artists with curated lyrics */}
            {page.lyrics.length > 0 && (
              <View style={s.block}>
                <View style={s.sectionHeaderRow}>
                  <Text style={s.sectionTitle}>Your Favorite Lyrics</Text>
                </View>
                <View style={s.lyricStack}>
                  {page.lyrics[1] && (
                    <LyricStackCard
                      item={page.lyrics[1]}
                      variant="back"
                      containerStyle={[s.lyricBackCard, s.lyricBackLeft]}
                      resolveArt={resolveArt}
                    />
                  )}
                  {page.lyrics[2] && (
                    <LyricStackCard
                      item={page.lyrics[2]}
                      variant="back"
                      containerStyle={[s.lyricBackCard, s.lyricBackRight]}
                      resolveArt={resolveArt}
                    />
                  )}
                  <LyricStackCard
                    item={page.lyrics[0]}
                    variant="front"
                    containerStyle={s.lyricFrontCard}
                    resolveArt={resolveArt}
                  />
                </View>
              </View>
            )}

            {/* Playlists */}
            {page.playlists.length > 0 && (
              <View style={s.block}>
                <View style={s.sectionHeaderRow}>
                  <Text style={s.sectionTitle}>Playlists Similar to this Era</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.playlistRail}>
                  {page.playlists.map(pl => (
                    <View key={pl.title} style={s.playlistCard}>
                      <Image source={resolveArt(pl.artKey)} style={s.playlistArt} />
                      <Text style={s.playlistTitle} numberOfLines={2}>{pl.title}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Where it started */}
            {page.firstPlay && (
              <View style={s.block}>
                <Text style={s.sectionTitle}>Where it started</Text>
                <ImageBackground
                  source={resolveArt(page.firstPlay.artKey)}
                  style={s.firstPlayCard}
                  imageStyle={[COVER_IMG, { borderRadius: 12 }]}
                  resizeMode="cover"
                >
                  <LinearGradient
                    colors={['rgba(0,0,0,0.92)', 'rgba(0,0,0,0.35)']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <Image source={resolveArt(page.firstPlay.artKey)} style={s.firstPlayArt} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.firstPlayEyebrow}>YOUR FIRST EVER PLAY</Text>
                    <Text style={s.firstPlayTitle} numberOfLines={1}>{page.firstPlay.title}</Text>
                    <Text style={s.firstPlayDate}>{page.firstPlay.date}</Text>
                  </View>
                </ImageBackground>
              </View>
            )}

          </View>
          )
        ) : tab === 'About' ? (
          about ? (
            <ArtistAboutTab
              data={about}
              artistName={page.name}
              sinceYear={Number(page.sinceLabel.replace(/\D/g, '')) || undefined}
              hubImage={avatar}
            />
          ) : (
          <View style={s.content}>
            <View style={s.block}>
              <Text style={s.sectionTitle}>About</Text>
              <View style={s.aboutCard}>
                <Text style={s.aboutText}>{page.bio}</Text>
              </View>
              <View style={s.aboutChips}>
                <View style={s.aboutChip}>
                  <Text style={s.aboutChipLabel}>Genre</Text>
                  <Text style={s.aboutChipValue}>{page.genre}</Text>
                </View>
                <View style={s.aboutChip}>
                  <Text style={s.aboutChipLabel}>Followers</Text>
                  <Text style={s.aboutChipValue}>{page.followersLabel.replace(' Followers', '')}</Text>
                </View>
                <View style={s.aboutChip}>
                  <Text style={s.aboutChipLabel}>You</Text>
                  <Text style={s.aboutChipValue}>{page.listenerBadge.replace(' listener', '')}</Text>
                </View>
              </View>
            </View>
          </View>
          )
        ) : tab === 'Music' ? (
          <View style={s.content}>
            {/* Session context — a short-term signal; appears once there's any history */}
            {state !== 'cold' && artistSongs.length > 0 && (
              <View style={s.block}>
                <View style={s.ctxCard}>
                  <Ionicons name="pulse" size={16} color="#F0CB80" />
                  <Text style={s.ctxText} numberOfLines={2}>
                    Back in <Text style={s.ctxBold}>{artistSongs[0].album}</Text> this session.
                  </Text>
                  <TouchableOpacity style={s.ctxBtn} activeOpacity={0.8} onPress={() => playByTitle()}>
                    <Text style={s.ctxBtnText}>Keep going</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Popular — the standard chart for new listeners; once the
                relationship is real, your top songs lead (a format change,
                not a different catalog) */}
            <View style={s.block}>
              <View style={s.sectionHeaderRow}>
                <Text style={s.sectionTitle}>Popular</Text>
                {state === 'superfan' && (
                  <View style={s.scopeRow}>
                    {(['everyone', 'superfans'] as const).map(sc => (
                      <TouchableOpacity
                        key={sc}
                        style={[s.scopePill, popScope === sc && s.scopePillActive]}
                        activeOpacity={0.8}
                        onPress={() => setPopScope(sc)}
                      >
                        <Text style={[s.scopeText, popScope === sc && s.scopeTextActive]}>
                          {sc === 'everyone' ? 'Everyone' : 'Super fans'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              <Text style={s.popSub}>
                {popScope === 'superfans'
                  ? 'What super fans replay the most.'
                  : state === 'cold'
                    ? 'Most-streamed, same order for everyone.'
                    : state === 'casual'
                      ? 'Most-streamed. Your plays get marked, and that\u2019s it.'
                      : 'Your top songs lead. The full catalog is one tap away.'}
              </Text>
              {artistSongs.length > 0 ? (
                <>
                  {popularRows.map((sg, idx) => {
                    const ranked = converged && idx < 3
                    const row = (
                      <>
                        {ranked ? (
                          <Text style={s.rankIdx}>{idx + 1}</Text>
                        ) : (
                          <Text style={s.popIdx}>{idx + 1}</Text>
                        )}
                        <Image source={resolveArt(sg.albumArtPath ?? '')} style={s.popArt} />
                        <View style={{ flex: 1 }}>
                          <Text style={s.popTitle} numberOfLines={1}>{sg.title}</Text>
                          <Text style={ranked ? s.rankMeta : s.popMeta} numberOfLines={1}>
                            {fmtStreams(MUSIC_STREAMS[idx] ?? 100_000)}
                            {state !== 'cold' && idx === 0 && popScope === 'everyone' ? (
                              <Text style={s.youPlay}>  ·  You play this most</Text>
                            ) : null}
                          </Text>
                        </View>
                        <TouchableOpacity hitSlop={8} onPress={() => openAdaptiveMenu({ kind: 'song', song: sg })}>
                          <Ionicons name="ellipsis-horizontal" size={18} color={ranked ? '#dfe6ee' : '#888'} />
                        </TouchableOpacity>
                      </>
                    )
                    return ranked ? (
                      <TouchableOpacity key={sg.id} activeOpacity={0.85} onPress={() => playByTitle(sg.title)}>
                        <LinearGradient
                          colors={idx < 2 ? ['#5b7681', '#333e44'] : ['#5f56a0', '#39355c']}
                          start={{ x: 0, y: 0.5 }}
                          end={{ x: 1, y: 0.5 }}
                          style={s.rankRow}
                        >
                          {row}
                        </LinearGradient>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity key={sg.id} style={s.popRow} activeOpacity={0.8} onPress={() => playByTitle(sg.title)}>
                        {row}
                      </TouchableOpacity>
                    )
                  })}
                  <TouchableOpacity
                    style={s.discLink}
                    activeOpacity={0.7}
                    onPress={() => showConfirmation(`Full ${artist.name} catalog coming soon`)}
                  >
                    <Text style={s.discLinkText}>Explore discography</Text>
                    <Ionicons name="chevron-forward" size={14} color={C.cyan} />
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={s.emptyTabText}>No tracks yet.</Text>
              )}
            </View>

            {/* Your history — the durable record; appears once it exists */}
            {converged && (
              <View style={s.block}>
                <Text style={s.sectionTitle}>You & {page.firstName}</Text>
                <TouchableOpacity activeOpacity={0.88} onPress={() => setTab(journeyTab)}>
                  <ImageBackground
                    source={avatar ?? undefined}
                    style={s.histCard}
                    imageStyle={[COVER_IMG, { borderRadius: 12 }]}
                    resizeMode="cover"
                  >
                    <LinearGradient
                      colors={['rgba(0,0,0,0.25)', 'rgba(0,0,0,0.88)']}
                      style={StyleSheet.absoluteFill}
                    />
                    <View style={s.histPill}>
                      <Text style={s.histPillText}>{page.sinceLabel}</Text>
                    </View>
                    <View style={s.histBody}>
                      <Text style={s.histEyebrow}>
                        {state === 'superfan' ? page.listenerBadge.toUpperCase() : 'YOUR JOURNEY'}
                      </Text>
                      <Text style={s.histTitle}>Your journey so far</Text>
                      {page.firstPlay && (
                        <Text style={s.histMeta}>
                          It started with <Text style={s.histBold}>{page.firstPlay.title}</Text> in {page.firstPlay.date}.
                        </Text>
                      )}
                      <View style={s.histGo}>
                        <Text style={s.histGoText}>Open your journey</Text>
                        <Ionicons name="chevron-forward" size={13} color="#fff" />
                      </View>
                    </View>
                  </ImageBackground>
                </TouchableOpacity>
              </View>
            )}

            {/* Top Albums */}
            {page.eras.length > 0 && (
              <View style={s.block}>
                <Text style={s.sectionTitle}>Top Albums</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.albumRail}>
                  {page.eras.map((era, i) => (
                    <TouchableOpacity key={era.id} style={s.albumCard} activeOpacity={0.85} onPress={() => playByTitle(era.topTrack.title)}>
                      <Image source={resolveArt(era.eraImageKey)} style={s.albumArt} resizeMode="cover" />
                      <Text style={s.albumTitle} numberOfLines={1}>{i + 1}. {era.title}</Text>
                      <Text style={s.albumMeta} numberOfLines={1}>Album · {era.season}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Fans also like */}
            {relatedArtists.length > 0 && (
              <View style={s.block}>
                <Text style={s.sectionTitle}>Fans also like</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.fanRail}>
                  {relatedArtists.map(a => {
                    const av = resolveArtistAvatar(a.id, a.imageUri)
                    return (
                      <TouchableOpacity key={a.id} style={s.fanCard} activeOpacity={0.85} onPress={() => router.push(`/artist/${a.id}` as any)}>
                        {av ? (
                          <Image source={av} style={s.fanAvatar} resizeMode="cover" />
                        ) : (
                          <View style={[s.fanAvatar, s.fanAvatarFallback]}>
                            <Ionicons name="person" size={32} color="rgba(255,255,255,0.25)" />
                          </View>
                        )}
                        <Text style={s.fanName} numberOfLines={1}>{a.name}</Text>
                      </TouchableOpacity>
                    )
                  })}
                </ScrollView>
              </View>
            )}
          </View>
        ) : tab === 'Events' ? (
          <View style={s.content}>
            <View style={s.block}>
              <Text style={s.sectionTitle}>Events & shows</Text>
              {about?.events && about.events.length > 0 ? (
                <ArtistEventsCard events={about.events} />
              ) : (
                <View style={s.emptyTab}>
                  <Text style={s.emptyTabText}>No upcoming shows near you.</Text>
                </View>
              )}
            </View>
            {/* v3.1 IA: the fandom gathers around the live moments */}
            {about?.fanPost && (
              <View style={s.block}>
                <Text style={s.sectionTitle}>Popular posts from fan groups</Text>
                <FanPostCard post={about.fanPost} resolveArt={resolveArt} />
              </View>
            )}
          </View>
        ) : tab === 'Merch' ? (
          <View style={s.content}>
            <View style={s.block}>
              <View style={s.sectionHeaderRow}>
                <Text style={s.sectionTitle}>Official Store</Text>

              </View>
              {merchItems.length > 0 ? (
                <ArtistMerchGrid items={merchItems} resolveArt={resolveArt} />
              ) : (
                <View style={s.emptyTab}>
                  <Text style={s.emptyTabText}>No merch yet.</Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View style={s.emptyTab}>
            <Text style={s.emptyTabText}>{tab} coming soon</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

function HeroOverlay({
  insets,
  page,
  avatar,
  activeProfile,
  following,
  showProof,
  onBack,
  onToggleFollow,
  onPlay,
  onShuffle,
  onMenu,
}: {
  insets: { top: number }
  page: ReturnType<typeof buildArtistPage>
  avatar: any
  activeProfile: { initial: string; color: string }
  following: boolean
  showProof: boolean
  onBack: () => void
  onToggleFollow: () => void
  onPlay: () => void
  onShuffle: () => void
  onMenu: () => void
}) {
  return (
    <>
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.13)', 'rgba(0,0,0,0.85)', '#000']}
        locations={[0.35, 0.5, 0.82, 1]}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.45)', 'rgba(0,0,0,0)']}
        style={s.heroTopGradient}
      />

      <View style={[s.heroTopNav, { paddingTop: insets.top + 4 }]}>
        <TouchableOpacity onPress={onBack} style={s.iconBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={s.iconBtn} hitSlop={8} onPress={onMenu}>
          <Ionicons name="options-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* The relationship proof cluster is earned — new listeners see the
          standard hero until there's a "since" worth showing */}
      {showProof && (
        <View style={s.profileCluster}>
          {avatar && <Image source={avatar} style={s.artistAvatar} resizeMode="cover" />}
          <View style={s.userBubbleWrap}>
            <View style={s.sinceBubble}>
              <Ionicons name="heart" size={14} color="#fff" />
              <Text style={s.sinceText}>{page.sinceLabel}</Text>
            </View>
            <View style={[s.userAvatar, { backgroundColor: activeProfile.color }]}>
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>{activeProfile.initial}</Text>
            </View>
          </View>
        </View>
      )}

      <View style={s.heroMeta}>
        <Text style={s.heroName} numberOfLines={2}>{page.name}</Text>
        <Text style={s.heroFollowers}>{page.followersLabel}</Text>
      </View>

      <View style={s.controlPanel}>
        <View style={s.controlLeft}>
          <TouchableOpacity onPress={onToggleFollow} style={s.followBtn}>
            <Ionicons name="heart" size={16} color={following ? C.cyan : '#fff'} />
            <Text style={s.followBtnText}>{following ? 'Following' : 'Follow'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.roundIconBtn} onPress={onShuffle} hitSlop={8}>
            <Ionicons name="shuffle" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={s.roundIconBtn} onPress={onMenu} hitSlop={8}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={s.playBtn} onPress={onPlay} activeOpacity={0.85}>
          <Ionicons name="play" size={26} color="#000" style={{ marginLeft: 3 }} />
        </TouchableOpacity>
      </View>
    </>
  )
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  heroWrap: { height: 406, backgroundColor: '#000' },
  heroBg: { flex: 1, justifyContent: 'flex-end' },
  heroTopNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  heroTopGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 100 },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  profileCluster: { position: 'absolute', left: 16, top: 168, width: 200, height: 76 },
  artistAvatar: {
    width: 71,
    height: 71,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  userBubbleWrap: { position: 'absolute', left: 49, top: 11 },
  sinceBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#495054',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginLeft: 34,
  },
  sinceText: { color: '#fff', fontSize: 11 },
  userAvatar: {
    position: 'absolute',
    left: 0,
    top: 26,
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  heroMeta: { paddingHorizontal: 16, paddingBottom: 8, marginTop: 108 },
  heroName: { ...typeHeadline(33), color: '#fff', letterSpacing: -0.5 },
  heroFollowers: { fontSize: 15, color: '#acb3b4', marginTop: 2 },
  controlPanel: {
    backgroundColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  controlLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#4c4c4c',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  followBtnText: { color: '#fff', fontSize: 14 },
  roundIconBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  playBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: C.cyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: { backgroundColor: '#000', borderBottomWidth: 1, borderBottomColor: C.border },
  tabRow: { paddingHorizontal: 8 },
  tabItem: { paddingHorizontal: 10, paddingVertical: 10, position: 'relative' },
  tabText: { fontSize: 12, color: '#fff', fontWeight: '400' },
  tabTextActive: { fontWeight: '700' },
  tabUnderline: { position: 'absolute', bottom: 0, left: 8, right: 8, height: 2, backgroundColor: C.cyan },
  content: { paddingHorizontal: 16, paddingTop: 12, gap: 24 },
  block: { gap: 12 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { ...typeHeadline(20), color: '#fff' },

  merchRail: { gap: 12, paddingRight: 16 },
  merchCard: { width: 132 },
  merchArtWrap: { position: 'relative', marginBottom: 8 },
  merchArt: { width: 132, height: 132, borderRadius: 10, backgroundColor: C.surface },
  merchTypeChip: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.72)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  merchTypeText: { fontSize: 9, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },
  merchName: { fontSize: 13, fontWeight: '600', color: '#fff', lineHeight: 17, marginBottom: 6 },
  merchPriceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  merchPrice: { fontSize: 14, fontWeight: '700', color: C.cyan },
  merchBuyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.cyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLink: { fontSize: 14, color: '#757575', fontWeight: '700' },
  eraRail: { gap: 12, paddingVertical: 4 },
  eraCard: { width: ERA_CARD_W, height: ERA_CARD_H, borderRadius: 8, overflow: 'hidden', justifyContent: 'flex-end' },
  eraCardSelected: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    shadowColor: '#7f77d7',
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  eraCardFooter: { backgroundColor: 'rgba(30,30,30,0.56)', paddingHorizontal: 12, paddingVertical: 8, gap: 2 },
  eraSeason: { fontSize: 8, color: '#a6a6a6' },
  eraTitle: { fontSize: 12, color: '#fff', fontWeight: '700' },
  eraBadge: { fontSize: 8, color: '#fff', fontWeight: '700' },
  timelineTrack: { height: 4, borderRadius: 2, backgroundColor: '#333' },
  timelineFill: { height: '100%', backgroundColor: C.cyan, borderRadius: 2 },
  timelineThumb: {
    position: 'absolute',
    right: -3,
    top: -1,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    shadowColor: C.cyan,
    shadowOpacity: 0.7,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  eraDetail: { gap: 4 },
  eraDetailSeason: { fontSize: 12, color: C.cyan, fontWeight: '700' },
  eraDetailTitle: { ...typeHeadline(28), color: '#fff' },
  eraDetailDesc: { fontSize: 12, color: '#a6a6a6', lineHeight: 18 },
  statsCard: { borderRadius: 12, overflow: 'hidden', padding: 12, minHeight: 180 },
  statsOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 12 },
  statsTop: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  statsArt: { width: 63, height: 63, borderRadius: 4, borderWidth: 0.75, borderColor: 'rgba(255,255,255,0.24)' },
  statsEyebrow: { fontSize: 12, color: C.cyan, fontWeight: '700' },
  statsTrack: { fontSize: 16, color: '#fff', fontWeight: '700' },
  statsPlays: { fontSize: 12, color: '#fff' },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  statCell: { flex: 1, paddingTop: 8, paddingHorizontal: 4 },
  statLabel: { fontSize: 12, color: '#fff' },
  statValue: { fontSize: 28, color: '#fff', fontWeight: '700', marginTop: 2 },
  playedCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#7b75bb',
    paddingHorizontal: 8,
    paddingVertical: 12,
    gap: 12,
  },
  trackRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  trackArt: { width: 63, height: 63, borderRadius: 4 },
  trackTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  trackTitle: { fontSize: 16, color: '#fff', fontWeight: '700', flexShrink: 1 },
  trackArtist: { fontSize: 12, color: '#a6a6a6', marginTop: 2 },
  explicitBadge: { width: 16, height: 16, borderRadius: 3, backgroundColor: '#a6a6a6', alignItems: 'center', justifyContent: 'center' },
  explicitText: { fontSize: 9, color: '#000', fontWeight: '700' },
  playMixBtn: {
    borderWidth: 1,
    borderColor: '#a6a6a6',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 32,
    paddingVertical: 8,
    alignItems: 'center',
  },
  playMixText: { color: '#fff', fontSize: 12 },
  exclusiveCard: { flexDirection: 'row', alignItems: 'center', gap: 24, borderRadius: 12, backgroundColor: C.cyan, overflow: 'hidden' },
  exclusiveImg: { width: 150, height: 172, justifyContent: 'flex-end' },
  exclusiveImgRadius: { borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
  exclusiveImgCaption: { padding: 12 },
  exclusiveImgTitle: { ...typeHeadline(16), color: '#fff' },
  exclusiveImgDate: { fontSize: 12, color: '#fff', marginTop: 2 },
  exclusiveText: { flex: 1, gap: 10, paddingRight: 16 },
  exclusiveTag: { fontSize: 10, fontWeight: '800', letterSpacing: 1, color: 'rgba(0,0,0,0.55)' },
  exclusiveMilestone: { fontSize: 12, color: '#000', lineHeight: 14 },
  exclusiveBody: { ...typeHeadline(16), color: '#000', lineHeight: 20 },
  lyricStack: { height: 300, width: '100%', alignItems: 'center' },
  lyricBackCard: {
    position: 'absolute',
    top: 26,
    width: 172,
    height: 236,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: '#000',
    overflow: 'hidden',
    padding: 14,
    justifyContent: 'space-between',
  },
  lyricBackLeft: { left: 0, transform: [{ rotate: '-11deg' }], zIndex: 1 },
  lyricBackRight: { right: 0, transform: [{ rotate: '11deg' }], zIndex: 2 },
  lyricFrontCard: {
    position: 'absolute',
    top: 6,
    width: 230,
    height: 272,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: '#000',
    overflow: 'hidden',
    padding: 18,
    justifyContent: 'space-between',
    zIndex: 3,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  lyricStackHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  lyricStackArt: { width: 28, height: 28, borderRadius: 4, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.24)' },
  lyricStackSong: { ...typeHeadline(15), color: '#a6a6a6', flexShrink: 1 },
  lyricStackText: { ...typeHeadline(14), color: '#fff', lineHeight: 18 },
  lyricStackTextFront: { ...typeHeadline(19), color: '#fff', lineHeight: 24 },
  lyricStackFans: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  lyricStackFansText: { fontSize: 11, color: '#fff' },
  playlistRail: { gap: 12 },
  playlistCard: { width: 173 },
  playlistArt: { width: 173, height: 173, borderRadius: 8, marginBottom: 5 },
  playlistTitle: { fontSize: 16, color: '#fff', fontWeight: '700' },
  firstPlayCard: { height: 105, borderRadius: 12, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', padding: 10, gap: 10 },
  firstPlayArt: { width: 81, height: 81, borderRadius: 4 },
  firstPlayEyebrow: { fontSize: 12, color: C.cyan, fontWeight: '700' },
  firstPlayTitle: { fontSize: 16, color: '#fff', fontWeight: '700' },
  firstPlayDate: { fontSize: 12, color: '#a6a6a6', marginTop: 2 },
  aboutCard: { backgroundColor: C.surface, borderRadius: 12, padding: 14 },
  aboutText: { fontSize: 14, color: '#c9c9c9', lineHeight: 21 },
  aboutChips: { flexDirection: 'row', gap: 10 },
  aboutChip: { flex: 1, backgroundColor: C.surface, borderRadius: 10, padding: 12, gap: 4 },
  aboutChipLabel: { fontSize: 11, color: '#8a8a8a' },
  aboutChipValue: { fontSize: 14, color: '#fff', fontWeight: '700' },
  popRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  popIdx: { width: 18, fontSize: 13, color: '#8a8a8a', textAlign: 'center' },
  popArt: { width: 48, height: 48, borderRadius: 4 },
  popTitle: { fontSize: 15, color: '#fff', fontWeight: '600' },
  popMeta: { fontSize: 12, color: '#8a8a8a', marginTop: 2 },
  popSub: { fontSize: 12, color: '#8a8a8a', marginTop: -4, marginBottom: 10, lineHeight: 17 },
  youPlay: { color: C.cyan, fontWeight: '700', fontSize: 12 },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  rankIdx: {
    width: 24,
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  rankMeta: { fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  scopeRow: {
    flexDirection: 'row',
    gap: 3,
    backgroundColor: '#0a0f14',
    borderWidth: 1,
    borderColor: '#242C35',
    borderRadius: 16,
    padding: 3,
  },
  scopePill: { paddingHorizontal: 11, paddingVertical: 5, borderRadius: 12 },
  scopePillActive: { backgroundColor: 'rgba(0,213,221,0.16)' },
  scopeText: { fontSize: 11, fontWeight: '700', color: '#8A93A0' },
  scopeTextActive: { color: C.cyan },
  ctxCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 13,
    borderRadius: 12,
    backgroundColor: 'rgba(232,184,96,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(232,184,96,0.26)',
  },
  ctxText: { flex: 1, fontSize: 13, lineHeight: 18, color: '#C2C9D1' },
  ctxBold: { color: '#F0CB80', fontWeight: '700' },
  ctxBtn: {
    borderWidth: 1,
    borderColor: 'rgba(232,184,96,0.4)',
    borderRadius: 14,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  ctxBtnText: { fontSize: 11.5, fontWeight: '700', color: '#F0CB80' },
  histCard: { minHeight: 168, borderRadius: 12, overflow: 'hidden', justifyContent: 'flex-end' },
  histPill: {
    position: 'absolute',
    top: 11,
    right: 11,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  histPillText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  histBody: { padding: 14, gap: 3 },
  histEyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, color: C.cyan },
  histTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  histMeta: { fontSize: 12, lineHeight: 17, color: 'rgba(255,255,255,0.78)' },
  histBold: { color: '#fff', fontWeight: '700' },
  histGo: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 9 },
  histGoText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  coldHint: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(37,209,218,0.32)',
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  coldHintLead: { fontSize: 13, lineHeight: 19, color: '#C2C9D1' },
  coldChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  coldChip: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: '#242C35',
  },
  coldChipText: { fontSize: 11.5, fontWeight: '700', color: '#8A93A0' },
  coldHintNote: { fontSize: 11, lineHeight: 16, color: '#8A93A0' },
  popDur: { fontSize: 12, color: '#8a8a8a' },
  emptyTab: { alignItems: 'center', paddingTop: 48, paddingBottom: 80 },
  emptyTabText: { color: '#555', fontSize: 14, textAlign: 'center' },

  discLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 12 },
  discLinkText: { fontSize: 13, color: C.cyan },

  albumRail: { gap: 14, paddingRight: 16 },
  albumCard: { width: 140 },
  albumArt: { width: 140, height: 140, borderRadius: 8, backgroundColor: C.surface, borderWidth: 0.75, borderColor: 'rgba(255,255,255,0.15)' },
  albumTitle: { ...typeHeadline(14), color: '#fff', marginTop: 7 },
  albumMeta: { fontSize: 12, color: '#888', marginTop: 2 },

  fanRail: { gap: 14, paddingRight: 16 },
  fanCard: { alignItems: 'center', gap: 7, width: 100 },
  fanAvatar: { width: 100, height: 100, borderRadius: 50 },
  fanAvatarFallback: { backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  fanName: { ...typeHeadline(13), color: '#fff', textAlign: 'center' },
})
