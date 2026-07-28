import { useMemo } from 'react'
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
  ImageBackground,
  Platform,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import Svg, { Path } from 'react-native-svg'
import { Text } from '../AppText'
import { AppImage as Image } from '../AppImage'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useLikedSongs } from '../../context/LikedSongsContext'
import { useAdaptiveMenu } from '../AdaptiveContextMenu'
import { songs } from '../../data/mockData'
import { albumArtAssets, hannahJourneyAssets } from '../../data/assetMap'
import type { DiscographyRelease, DiscographyTrack } from '../../data/oliviaRodrigoPage'
import { C, FONT_FAMILY_DISPLAY, FONT_FAMILY_EMBER } from '../../theme'

/** Figma SOUR tracklist (node 2576-45065) — titles verbatim. */
const SOUR_FIGMA_TRACKS = [
  'brutal [Explicit]',
  'traitor',
  'drivers license',
  '1 step forward, 3 steps back',
  'deja vu',
  'good 4 u',
  'enough for you',
  'happier [Explicit]',
  'jealousy,  jealousy',
  'favorite crime',
  'hope ur ok',
]

type Props = {
  release: DiscographyRelease
  artistName: string
  /** Catalog artist id — used to match tracks to playable songs. Defaults to
   *  Olivia (the original owner of this layout) so existing call sites keep
   *  working; every artist's albums in Hannah Journey now render this page. */
  artistId?: string
}

/** Sums `M:SS` track durations into a Figma-style "X MIN Y SEC" label; null if unavailable. */
function sumDurationLabel(tracks?: DiscographyTrack[]): string | null {
  if (!tracks || tracks.length === 0) return null
  let totalSeconds = 0
  for (const t of tracks) {
    const [min, sec] = t.duration.split(':').map(Number)
    if (!Number.isFinite(min) || !Number.isFinite(sec)) return null
    totalSeconds += min * 60 + sec
  }
  return `${Math.floor(totalSeconds / 60)} MIN ${totalSeconds % 60} SEC`
}

/** Dolby Atmos "double-D" mark — exact bezier paths from Figma master component
 * 1936:13537 ("type=atmos"), 13x9. The previous CSS approximation (two flat-inner-
 * edge pill halves) had the curve direction backwards; these paths have a straight
 * outer edge and a curved, pinched inner edge on each half. */
function AtmosMark() {
  return (
    <Svg width={13} height={9} viewBox="4 3.5 13 9">
      <Path
        d="M10 8C10 5.51472 7.98528 3.5 5.5 3.5H4V12.5H5.5C7.98528 12.5 10 10.4853 10 8Z"
        fill="#BCB9B8"
      />
      <Path
        d="M11 8C11 5.51472 13.0147 3.5 15.5 3.5H17V12.5H15.5C13.0147 12.5 11 10.4853 11 8Z"
        fill="#BCB9B8"
      />
    </Svg>
  )
}

function QualityBadge({ label, atmos }: { label: string; atmos?: boolean }) {
  return (
    <View style={s.badge}>
      {atmos ? <AtmosMark /> : null}
      <Text style={s.badgeText}>{label}</Text>
    </View>
  )
}

function PopularityBar() {
  return (
    <View style={s.popBar}>
      {Array.from({ length: 10 }, (_, i) => (
        <View
          key={i}
          style={[s.popSeg, { backgroundColor: i === 0 ? C.cyan : '#625E5C' }]}
        />
      ))}
    </View>
  )
}

/**
 * Hannah Journey album detail — Figma node 2576-45065 (SOUR reference layout).
 * The single album UI for every release opened while the active profile is
 * hannah-journey — SOUR/GUTS set the pattern, all other artists' albums
 * (Taylor, Sabrina, Ariana, Justin Bieber, …) now follow it.
 */
export default function HannahJourneyAlbumPage({ release, artistName, artistId = 'olivia-rodrigo' }: Props) {
  const router = useRouter()
  const { playSongAt } = usePlaybackState()
  const { isLiked, toggleLike } = useLikedSongs()
  const { open: openAdaptiveMenu } = useAdaptiveMenu()

  const coverArt = albumArtAssets[release.artKey] ?? albumArtAssets['olivia-rodrigo-sour']
  const isSour = release.id === 'sour-2021' || release.title.toUpperCase().includes('SOUR')

  const trackTitles = useMemo(() => {
    if (isSour) return SOUR_FIGMA_TRACKS
    if (release.tracks?.length) return release.tracks.map(t => t.title)
    // No authored tracklist — pull this album's songs from the catalog (same
    // fallback the non-journey album page uses), so releases like Sweetener
    // or Purpose list and play their real songs instead of one stand-in row.
    const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9]/g, '')
    const wanted = norm(release.title)
    const catalog = songs.filter(sg => {
      if (sg.artistId !== artistId) return false
      const a = norm(sg.album)
      return a === wanted || (wanted.length >= 4 && a.startsWith(wanted)) || (a.length >= 4 && wanted.startsWith(a))
    })
    return catalog.length ? catalog.map(sg => sg.title) : [release.title]
  }, [isSour, release, artistId])

  const resolvedTracks = useMemo(
    () =>
      trackTitles.map(title => {
        const clean = title
          .replace(/\s*\[Explicit\]\s*/i, '')
          .replace(/\s*\((?:feat|with)\.?[^)]*\)\s*/i, '')
          .replace(/\s+/g, ' ')
          .trim()
        const match = songs.find(
          sg =>
            sg.artistId === artistId &&
            sg.title.toLowerCase() === clean.toLowerCase(),
        )
        return { title, song: match ?? null }
      }),
    [trackTitles, artistId],
  )

  const playable = resolvedTracks.filter(t => t.song)
  const songCount = resolvedTracks.length
  const durationLabel = isSour ? '34 MIN 48 SEC' : sumDurationLabel(release.tracks)
  // Generic catalog-built releases carry year 0 (unknown) — drop the segment.
  const metaLine = isSour
    ? `${songCount} SONGS • 34 MIN 48 SEC • MAY 21, 2021`
    : [`${songCount} SONGS`, durationLabel, release.year ? String(release.year) : null]
        .filter(Boolean)
        .join(' • ')

  const displayTitle = isSour ? 'SOUR [Explicit]' : release.title
  const merchTitle = isSour ? 'Sour' : release.title
  const versionTitle = isSour ? 'SOUR [CLEAN]' : `${release.title} [CLEAN]`
  const versionSub = isSour ? 'May 21, 2021' : String(release.year)

  const play = (songId: string) => {
    playSongAt(songId)
    router.push('/now-playing')
  }

  const handleShuffle = () => {
    if (playable.length === 0) return
    const random = playable[Math.floor(Math.random() * playable.length)]
    play(random.song!.id)
  }

  const handleShare = () => {
    Share.share({ message: `Listen to "${release.title}" on Amazon Music` }).catch(() => {})
  }

  return (
    <View style={s.root}>
      <ImageBackground
        source={coverArt}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        blurRadius={Platform.OS === 'ios' ? 56 : 32}
        // react-native-web sometimes drops the atomic absolute-fill style on
        // ImageBackground's inner <img>, which then falls back to the source's
        // natural size and spills unblurred art past the scrim. Pin it inline.
        imageStyle={Platform.OS === 'web' ? ({ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' } as any) : undefined}
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,0.8)']}
        locations={[0, 0.6842, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={s.safe} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
          {/* Nav */}
          <View style={s.navRow}>
            <TouchableOpacity onPress={() => router.back()} hitSlop={10} style={s.navHit}>
              <Ionicons name="chevron-back" size={24} color="#FEFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={s.filterBtn} hitSlop={8}>
              {/* Same asset used for the now-corrected artist-page filter icon
                  (Figma node 2740-29136 / assetMap hannahJourneyAssets.filterIcon) —
                  reused here for consistency. Ionicons "funnel" has straight,
                  angular sides; the Figma glyph has a rounded oval rim. */}
              <Image source={hannahJourneyAssets.filterIcon} style={s.filterIconImg} resizeMode="contain" />
            </TouchableOpacity>
          </View>

          {/* Header */}
          <View style={s.headerBlock}>
            <View style={s.coverWrap}>
              <Image source={coverArt} style={s.cover} resizeMode="cover" />
            </View>
            <View style={s.titleStack}>
              <Text style={s.albumTitle} numberOfLines={1}>{displayTitle}</Text>
              <Text style={s.artistName}>{artistName}</Text>
              <Text style={s.metaLine}>{metaLine}</Text>
              <View style={s.badgeRow}>
                <QualityBadge label="UHD" />
                <QualityBadge label="ATMOS" atmos />
              </View>
            </View>
          </View>

          {/* Controls */}
          <View style={s.controls}>
            <View style={s.controlsLeft}>
              <TouchableOpacity hitSlop={8}>
                <Ionicons name="heart-outline" size={28} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity hitSlop={8}>
                {/* Ionicons "download" is a rounded-square tray icon — a different
                    concept from the Figma glyph (plain arrow + flat bar, no box).
                    Exact path from Figma node 2576:45097 "download button". */}
                <Svg width={28} height={28} viewBox="0 0 28 28">
                  <Path
                    d="M21 23C21.5523 23 22 23.4477 22 24C22 24.5523 21.5523 25 21 25H7C6.44772 25 6 24.5523 6 24C6 23.4477 6.44772 23 7 23H21ZM14.0723 3C14.6246 3 15.0723 3.44772 15.0723 4V10.5H19.1426C19.9391 10.5 20.4161 11.3859 19.9775 12.0508L14.9072 19.7354C14.512 20.3342 13.6326 20.3342 13.2373 19.7354L8.16699 12.0508C7.72843 11.3859 8.20546 10.5 9.00195 10.5H13.0723V4C13.0723 3.44772 13.52 3 14.0723 3Z"
                    fill="#fff"
                  />
                </Svg>
              </TouchableOpacity>
              <TouchableOpacity hitSlop={8} onPress={handleShare}>
                <Ionicons name="share-outline" size={28} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                hitSlop={8}
                onPress={() => {
                  // Anchor the menu on a real catalog song: first playable
                  // track, else anything by this artist, else skip quietly.
                  const anchor = playable[0]?.song ?? songs.find(sg => sg.artistId === artistId)
                  if (anchor) openAdaptiveMenu({ kind: 'song', song: anchor })
                }}
              >
                <Ionicons name="ellipsis-horizontal" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={s.controlsRight}>
              <TouchableOpacity
                hitSlop={8}
                onPress={handleShuffle}
                style={{ transform: [{ scaleY: -1 }] }}
              >
                <Ionicons name="shuffle" size={28} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={s.playBtn}
                activeOpacity={0.85}
                disabled={playable.length === 0}
                onPress={() => playable[0] && play(playable[0].song!.id)}
              >
                <View style={s.playTriangle} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Tracks */}
          <View style={s.trackList}>
            {resolvedTracks.map((t, i) => {
              const liked = t.song ? isLiked(t.song.id) : false
              return (
                <TouchableOpacity
                  key={`${t.title}-${i}`}
                  style={s.trackRow}
                  activeOpacity={t.song ? 0.75 : 1}
                  disabled={!t.song}
                  onPress={() => t.song && play(t.song.id)}
                >
                  <View style={s.trackLeft}>
                    <Text style={s.trackNum}>{i + 1}</Text>
                    <View style={s.trackText}>
                      <Text style={s.trackTitle} numberOfLines={1}>{t.title}</Text>
                      <View style={s.badgeRow}>
                        <QualityBadge label="UHD" />
                        <QualityBadge label="ATMOS" atmos />
                        <QualityBadge label="LYRICS" />
                      </View>
                      <PopularityBar />
                    </View>
                  </View>
                  <View style={s.trackRight}>
                    <TouchableOpacity
                      hitSlop={8}
                      disabled={!t.song}
                      onPress={() => t.song && toggleLike(t.song.id)}
                    >
                      <Ionicons
                        name={liked ? 'heart' : 'heart-outline'}
                        size={24}
                        color="#fff"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      hitSlop={8}
                      disabled={!t.song}
                      onPress={() => t.song && openAdaptiveMenu({ kind: 'song', song: t.song })}
                    >
                      <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>

          {/* Related Merch */}
          <View style={s.bottomSection}>
            <Text style={s.bottomSectionTitle}>Related Merch</Text>
            <View style={s.merchCard}>
              <Image source={coverArt} style={s.merchArt} resizeMode="cover" />
              <Text style={s.merchTitle} numberOfLines={1}>{merchTitle}</Text>
              <Text style={s.merchSub}>Audio CD $13.79</Text>
              <Text style={s.merchSub}>Other formats: Vinyl</Text>
            </View>
          </View>

          {/* Versions */}
          <View style={s.bottomSection}>
            <Text style={s.bottomSectionTitle}>Versions</Text>
            <View style={s.merchCard}>
              <Image source={coverArt} style={s.merchArt} resizeMode="cover" />
              <Text style={s.merchTitle} numberOfLines={1}>{versionTitle}</Text>
              <Text style={s.merchSub}>{versionSub}</Text>
              <View style={[s.badgeRow, { marginTop: 4 }]}>
                <QualityBadge label="UHD" />
                <QualityBadge label="ATMOS" atmos />
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000', overflow: 'hidden' },
  safe: { flex: 1 },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  navHit: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  filterBtn: {
    width: 33,
    height: 33,
    borderRadius: 16.5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIconImg: { width: 18, height: 18 },
  headerBlock: {
    alignItems: 'center',
    gap: 24,
    paddingTop: 32,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  coverWrap: {
    borderRadius: 4,
    borderWidth: 4.127,
    borderColor: 'rgba(255,255,255,0.24)',
    overflow: 'hidden',
  },
  cover: { width: 274, height: 274 },
  titleStack: { width: '100%', gap: 8, alignItems: 'flex-start' },
  albumTitle: {
    fontFamily: FONT_FAMILY_DISPLAY.bold,
    fontSize: 33,
    lineHeight: 33,
    color: '#fff',
  },
  artistName: {
    fontFamily: FONT_FAMILY_DISPLAY.regular,
    fontSize: 16,
    color: '#fff',
  },
  metaLine: {
    fontFamily: FONT_FAMILY_DISPLAY.regular,
    fontSize: 16,
    letterSpacing: 0.64,
    color: '#A6A6A6',
    textTransform: 'uppercase',
  },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: '#777173',
    borderRadius: 2,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  badgeText: {
    fontFamily: FONT_FAMILY_EMBER.regular,
    fontSize: 12,
    lineHeight: 14.4,
    color: '#A6A6A6',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 32,
    paddingRight: 24,
    paddingVertical: 24,
  },
  controlsLeft: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  controlsRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  playBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: C.cyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playTriangle: {
    width: 0,
    height: 0,
    marginLeft: 3,
    borderLeftWidth: 14,
    borderTopWidth: 9,
    borderBottomWidth: 9,
    borderLeftColor: '#0a0a0a',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  trackList: { paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 16,
  },
  trackLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  trackNum: {
    width: 12,
    fontFamily: FONT_FAMILY_DISPLAY.bold,
    fontSize: 12,
    color: '#A6A6A6',
    textTransform: 'uppercase',
  },
  trackText: { flex: 1, gap: 8, maxWidth: 199 },
  trackTitle: {
    fontFamily: FONT_FAMILY_EMBER.bold,
    fontSize: 16,
    color: '#fff',
  },
  trackRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  popBar: { flexDirection: 'row', alignItems: 'center', gap: 2, width: 41, height: 6 },
  popSeg: { width: 2.3, height: 6, borderRadius: 1.15 },
  bottomSection: { paddingTop: 24, gap: 12 },
  bottomSectionTitle: {
    fontFamily: FONT_FAMILY_DISPLAY.bold,
    fontSize: 20,
    lineHeight: 20,
    color: '#fff',
    paddingHorizontal: 16,
  },
  merchCard: { width: 173, paddingHorizontal: 16 },
  merchArt: {
    width: 173,
    height: 173,
    borderRadius: 8,
    borderWidth: 0.75,
    borderColor: 'rgba(255,255,255,0.24)',
    marginBottom: 5,
  },
  merchTitle: {
    fontFamily: FONT_FAMILY_EMBER.bold,
    fontSize: 16,
    color: '#fff',
  },
  merchSub: {
    fontFamily: FONT_FAMILY_EMBER.regular,
    fontSize: 16,
    color: '#A6A6A6',
  },
})
