import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react'
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
  Pressable,
  ScrollView,
  Share,
  Image as RNImage,
} from 'react-native'
import { AppImage as Image } from '../AppImage'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  Easing,
} from 'react-native-reanimated'
import Svg, { Path, Rect } from 'react-native-svg'
import { Text } from '../AppText'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { usePlaybackState, usePlaybackProgress } from '../../hooks/usePlaybackState'
import { useLikedSongs } from '../../context/LikedSongsContext'
import { useAdaptiveUI } from '../../context/AdaptiveUIContext'
import { useAdaptiveMenu } from '../AdaptiveContextMenu'
import { songs, artists, type AudioBadge, type Song } from '../../data/mockData'
import { albumArtAssets, logoAssets } from '../../data/assetMap'
import { lyricForSong } from '../../data/artistPages'
import { C, R, FONT_FAMILY_DISPLAY, FONT_FAMILY_EMBER } from '../../theme'
import BlurredArtBackground from '../BlurredArtBackground'
import { parseDurationSeconds, formatClock } from '../../utils/color'
import { shareText } from '../../utils/share'

/**
 * Hannah Journey "playback page" — Figma node 2576-45065 (file 1vT9DKHEMGw7PrurGoeDVM).
 * Visual layer only: every piece of state/logic below (isPlaying, scrub position,
 * skip, like, queue, share, cast, adaptive menu) is the same real playback wiring
 * app/now-playing.tsx uses for every other persona — this file just renders it
 * to match the Figma spec exactly (layout, verbatim copy, colors, icon set).
 */

// Figma frame is 402pt wide — close enough to real device widths that literal
// Figma px values are used directly as RN dp, matching the convention already
// established in HannahJourneyAlbumPage.tsx (fixed 274px cover art etc.).
const ART_SIZE = 330
const PLAY_BTN_SIZE = 68
const ACTION_BTN_SIZE = 42
const NAV_BTN_SIZE = 42
const TRANSPORT_GAP = 70
const SKIP_ANIM_DURATION = 300
const SKIP_SLIDE_OFFSET = 44
const DISMISS_THRESHOLD = 100
const DISMISS_VELOCITY = 900
const DISMISS_ACTIVE_OFFSET_Y = 12
const DISMISS_FAIL_OFFSET_X = 28

function isForwardTrackChange(prevIdx: number, nextIdx: number, total: number): boolean {
  const delta = (nextIdx - prevIdx + total) % total
  return delta <= total - delta
}

const AUDIO_BADGE_LABELS: Record<AudioBadge, string> = {
  SD: 'SD',
  DOLBY_ATMOS: 'DOLBY ATMOS',
  '360_REALITY_AUDIO': '360 REALITY AUDIO',
}

function getAudioBadgeLabel(badge: AudioBadge | null | undefined): string {
  return AUDIO_BADGE_LABELS[badge ?? 'SD']
}

// ── Icons — exact paths exported from Figma node 2576-45065, rendered as
// react-native-svg (already a project dependency, see HannahJourneyAlbumPage's
// AtmosMark) instead of rasterized PNGs, so they stay crisp at any size and
// don't risk the "SVG saved as .png" bug. ────────────────────────────────────

/** Dolby Atmos "double-D" mark — same exact bezier paths as
 *  HannahJourneyAlbumPage's AtmosMark (Figma master component 1936:13537). */
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

/** "Add to playlist" glyph — Figma node 2907:26442 (Group 26), viewBox 17x15. */
function AddPlaylistIcon({ size = 18, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={(size * 15) / 17} viewBox="0 0 17 15" fill="none">
      <Path d="M16 4C16.5523 4 17 4.44772 17 5C17 5.55228 16.5523 6 16 6H15.2314C14.6822 5.3876 13.8874 5 13 5C12.1126 5 11.3178 5.3876 10.7686 6H1C0.447715 6 0 5.55228 0 5C0 4.44772 0.447715 4 1 4H16Z" fill={color} />
      <Path d="M7.17383 12C7.58594 13.1647 8.69415 14 10 14H1C0.447715 14 0 13.5523 0 13C0 12.4477 0.447715 12 1 12H7.17383Z" fill={color} />
      <Rect width={17} height={2} rx={1} fill={color} />
      <Path d="M10 8C8.69415 8 7.58594 8.83532 7.17383 10H1C0.447715 10 0 9.55228 0 9C0 8.44772 0.447715 8 1 8H10Z" fill={color} />
      <Path d="M13 7C13.5523 7 14 7.44772 14 8V10H16C16.5523 10 17 10.4477 17 11C17 11.5523 16.5523 12 16 12H14V14C14 14.5523 13.5523 15 13 15C12.4477 15 12 14.5523 12 14V12H10C9.44772 12 9 11.5523 9 11C9 10.4477 9.44772 10 10 10H12V8C12 7.44772 12.4477 7 13 7Z" fill={color} />
    </Svg>
  )
}

/** Share glyph — Figma node 2605:29234 (mi:share), viewBox 24x24. */
function ShareIcon({ size = 20, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M11.2916 2.29167C11.4791 2.1042 11.7334 1.99888 11.9986 1.99888C12.2638 1.99888 12.5181 2.1042 12.7056 2.29167L15.7056 5.29167C15.8878 5.48027 15.9886 5.73287 15.9863 5.99507C15.984 6.25727 15.8788 6.50808 15.6934 6.69349C15.508 6.8789 15.2572 6.98407 14.995 6.98634C14.7328 6.98862 14.4802 6.88783 14.2916 6.70567L12.9986 5.41267V14.9987C12.9986 15.2639 12.8932 15.5182 12.7057 15.7058C12.5182 15.8933 12.2638 15.9987 11.9986 15.9987C11.7334 15.9987 11.479 15.8933 11.2915 15.7058C11.104 15.5182 10.9986 15.2639 10.9986 14.9987V5.41267L9.7056 6.70567C9.517 6.88783 9.2644 6.98862 9.0022 6.98634C8.74001 6.98407 8.48919 6.8789 8.30379 6.69349C8.11838 6.50808 8.01321 6.25727 8.01093 5.99507C8.00865 5.73287 8.10945 5.48027 8.2916 5.29167L11.2916 2.29167ZM3.99861 10.9987C3.99861 10.4682 4.20932 9.95953 4.58439 9.58446C4.95946 9.20938 5.46817 8.99867 5.9986 8.99867H7.9986C8.26382 8.99867 8.51817 9.10403 8.70571 9.29156C8.89325 9.4791 8.9986 9.73345 8.9986 9.99867C8.9986 10.2639 8.89325 10.5182 8.70571 10.7058C8.51817 10.8933 8.26382 10.9987 7.9986 10.9987H5.9986V19.9987H17.9986V10.9987H15.9986C15.7334 10.9987 15.479 10.8933 15.2915 10.7058C15.104 10.5182 14.9986 10.2639 14.9986 9.99867C14.9986 9.73345 15.104 9.4791 15.2915 9.29156C15.479 9.10403 15.7334 8.99867 15.9986 8.99867H17.9986C18.529 8.99867 19.0377 9.20938 19.4128 9.58446C19.7879 9.95953 19.9986 10.4682 19.9986 10.9987V19.9987C19.9986 20.5291 19.7879 21.0378 19.4128 21.4129C19.0377 21.788 18.529 21.9987 17.9986 21.9987H5.9986C5.46817 21.9987 4.95946 21.788 4.58439 21.4129C4.20932 21.0378 3.99861 20.5291 3.99861 19.9987V10.9987Z" fill={color} />
    </Svg>
  )
}

/** Cast glyph — Figma node 2605:29729 (cast icon), viewBox 17x17. */
function CastIcon({ size = 18, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 17 17" fill="none">
      <Path d="M1.41667 1.41667C0.635375 1.41667 0 2.05204 0 2.83333V5.66667H1.41667V2.83333H15.5833V14.1667H9.91667V15.5833H15.5833C16.3646 15.5833 17 14.948 17 14.1667V2.83333C17 2.05204 16.3646 1.41667 15.5833 1.41667H1.41667ZM0 7.08333V8.5C3.66208 8.5 6.68383 11.2923 7.04792 14.8601C7.07153 15.0977 7.08333 15.3387 7.08333 15.5833H8.5C8.5 10.8963 4.68704 7.08333 0 7.08333ZM0 9.91667V11.3333C2.34387 11.3333 4.25 13.2395 4.25 15.5833H5.66667C5.66667 12.4589 3.12446 9.91667 0 9.91667ZM0 12.75V15.5833H2.83333C2.83333 14.8319 2.53482 14.1112 2.00347 13.5799C1.47212 13.0485 0.751447 12.75 0 12.75Z" fill={color} />
    </Svg>
  )
}

/** Queue glyph — Figma node 2907:26438 (Frame 270), viewBox 18.32x16. */
function QueueIcon({ size = 19, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={(size * 16) / 18.3197} viewBox="0 0 18.3197 16" fill="none">
      <Rect x={0.000745401} width={18} height={2} rx={1} fill={color} />
      <Rect x={0.000745401} y={14} width={18} height={2} rx={1} fill={color} />
      <Rect x={9.00075} y={10} width={9} height={2} rx={1} fill={color} />
      <Rect x={9.00075} y={7} width={9} height={2} rx={1} fill={color} />
      <Rect x={9.00075} y={4} width={9} height={2} rx={1} fill={color} />
      <Path d="M6.89852 7.35811C7.38923 7.67956 7.38923 8.39877 6.89852 8.72022L1.26031 12.4136C0.718844 12.7683 0 12.3799 0 11.7326V4.34574C0 3.69844 0.718843 3.30998 1.26031 3.66469L6.89852 7.35811Z" fill={color} />
    </Svg>
  )
}

/** 42x42 translucent circle button — Figma "Ellipse 5/9" (rgba(255,255,255,0.15), no stroke). */
function RoundGlassButton({
  size = NAV_BTN_SIZE,
  onPress,
  accessibilityLabel,
  children,
}: {
  size?: number
  onPress?: () => void
  accessibilityLabel: string
  children: ReactNode
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[s.roundBtn, { width: size, height: size, borderRadius: size / 2 }]}
    >
      {children}
    </TouchableOpacity>
  )
}

/** Central transport play/pause — Figma node 2907:26548, 68px, rgba(255,255,255,0.15), no stroke. */
function PlaybackPlayButton({ isPlaying, onPress }: { isPlaying: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
      style={s.playBtn}
    >
      {isPlaying ? (
        <View style={s.pauseBars}>
          <View style={s.pauseBar} />
          <View style={s.pauseBar} />
        </View>
      ) : (
        <View style={s.playTriangle} />
      )}
    </TouchableOpacity>
  )
}

type PlayerSheet = 'lyrics' | 'xray' | 'queue' | null

/**
 * Scrubber + clocks, isolated so the provider's 300ms progress tick only
 * re-renders this section — same isolation pattern as app/now-playing.tsx's
 * ScrubberSection. Drag/tap anywhere on the track seeks in real time via the
 * shared PlaybackProvider's setNowPlayingProgress (the same setter the mini
 * player and this screen's auto-advance timer both read from).
 */
function HannahJourneyScrubber({
  song,
  audioBadge,
  audioLabel,
}: {
  song: Song
  audioBadge: AudioBadge
  audioLabel: string
}) {
  const { nowPlayingProgress, setNowPlayingProgress } = usePlaybackProgress()
  const totalSecs = parseDurationSeconds(song.duration)
  const elapsedSecs = (nowPlayingProgress / 100) * totalSecs
  const remainingSecs = totalSecs - elapsedSecs
  const trackWidth = useSharedValue(1)

  const seekTo = useCallback(
    (pct: number) => setNowPlayingProgress(Math.min(100, Math.max(0, pct))),
    [setNowPlayingProgress],
  )

  const scrubGesture = Gesture.Pan()
    .minDistance(0)
    .onUpdate(e => {
      const pct = (e.x / Math.max(trackWidth.value, 1)) * 100
      runOnJS(seekTo)(pct)
    })

  return (
    <View style={s.scrubberWrap}>
      <GestureDetector gesture={scrubGesture}>
        <View
          style={s.scrubberHitArea}
          onLayout={e => { trackWidth.value = e.nativeEvent.layout.width }}
        >
          <View style={s.scrubberTrack}>
            <View style={[s.scrubberFill, { width: `${nowPlayingProgress}%` as `${number}%` }]} />
            <View style={[s.scrubberThumb, { left: `${nowPlayingProgress}%` as `${number}%` }]} />
          </View>
        </View>
      </GestureDetector>
      <View style={s.times}>
        <Text style={s.time}>{formatClock(elapsedSecs)}</Text>
        <View style={s.audioBadgeRow}>
          {audioBadge === 'DOLBY_ATMOS' ? <AtmosMark /> : null}
          <Text style={s.audioBadge}>{audioLabel}</Text>
        </View>
        <Text style={s.time}>-{formatClock(remainingSecs)}</Text>
      </View>
    </View>
  )
}

export default function HannahJourneyNowPlaying() {
  const router = useRouter()
  const {
    isPlaying, setIsPlaying,
    currentSongIdx,
    skipNext, skipPrev, playSongAt,
  } = usePlaybackState()
  const { isLiked, toggleLike, addLike } = useLikedSongs()
  const { showConfirmation } = useAdaptiveUI()
  const { open: openAdaptiveMenu } = useAdaptiveMenu()
  const [sheet, setSheet] = useState<PlayerSheet>(null)
  const prevSongIdxRef = useRef(currentSongIdx)
  const skipAnimMountRef = useRef(true)
  const slideX = useSharedValue(0)
  const trackOpacity = useSharedValue(1)
  const dismissY = useSharedValue(0)

  const song = songs[currentSongIdx] ?? songs[0]
  const audioBadge = song.audioBadge ?? 'SD'
  const audioLabel = getAudioBadgeLabel(audioBadge)
  const artistHasPage = artists.some(a => a.id === song.artistId)
  const openArtist = () => router.push(`/artist/${song.artistId}` as any)

  useEffect(() => {
    if (skipAnimMountRef.current) {
      skipAnimMountRef.current = false
      prevSongIdxRef.current = currentSongIdx
      return
    }

    const prevIdx = prevSongIdxRef.current
    if (prevIdx === currentSongIdx) return

    const forward = isForwardTrackChange(prevIdx, currentSongIdx, songs.length)
    const enterFrom = forward ? SKIP_SLIDE_OFFSET : -SKIP_SLIDE_OFFSET
    const timing = { duration: SKIP_ANIM_DURATION, easing: Easing.out(Easing.cubic) }

    slideX.value = enterFrom
    trackOpacity.value = 0.55
    slideX.value = withTiming(0, timing)
    trackOpacity.value = withTiming(1, timing)

    prevSongIdxRef.current = currentSongIdx
  }, [currentSongIdx, slideX, trackOpacity])

  const skipAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideX.value }],
    opacity: trackOpacity.value,
  }))

  const dismissAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: dismissY.value }],
  }))

  const dismissPan = Gesture.Pan()
    .activeOffsetY(DISMISS_ACTIVE_OFFSET_Y)
    .failOffsetX([-DISMISS_FAIL_OFFSET_X, DISMISS_FAIL_OFFSET_X])
    .onUpdate(e => {
      dismissY.value = Math.max(0, e.translationY)
    })
    .onEnd(e => {
      if (e.translationY > DISMISS_THRESHOLD || e.velocityY > DISMISS_VELOCITY) {
        runOnJS(router.back)()
      } else {
        dismissY.value = withSpring(0, { damping: 22, stiffness: 320 })
      }
    })

  const prev = skipPrev
  const next = skipNext

  const art = song.albumArtPath ? albumArtAssets[song.albumArtPath] : null

  const handleAddToPlaylist = () => {
    addLike(song.id)
    showConfirmation(`"${song.title}" added to Liked Songs`)
  }
  const handleShare = () => {
    void shareText(`Listen to "${song.title}" by ${song.artistName} on Amazon Music`)
  }
  const handleCast = () => showConfirmation('No Cast devices found nearby')
  const handleAskAlexa = () => showConfirmation(`Ask Alexa about "${song.title}"`)

  const upNext = Array.from({ length: 8 }, (_, i) => songs[(currentSongIdx + 1 + i) % songs.length])
  const lyric = lyricForSong(song.artistId, song.title)

  return (
    <GestureDetector gesture={dismissPan}>
      <Animated.View style={[s.screen, dismissAnimStyle]}>
        <BlurredArtBackground art={art} fallbackColor={song.albumArtColor} />

        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
          <View style={s.topBar}>
            <RoundGlassButton accessibilityLabel="Close" onPress={() => router.back()}>
              <Ionicons name="chevron-down" size={22} color="#fff" />
            </RoundGlassButton>
            <RoundGlassButton accessibilityLabel="Ask Alexa" onPress={handleAskAlexa}>
              <RNImage source={logoAssets.alexa} style={s.alexaIcon} resizeMode="contain" tintColor="#fff" />
            </RoundGlassButton>
          </View>

          <Animated.View style={[s.artSection, skipAnimStyle]}>
            <View style={s.artWrap}>
              {art ? (
                <Image source={art} style={s.art} resizeMode="cover" />
              ) : (
                <View style={[s.art, { backgroundColor: song.albumArtColor }]}>
                  <Ionicons name="musical-note" size={ART_SIZE * 0.3} color="rgba(255,255,255,0.08)" />
                </View>
              )}
            </View>
          </Animated.View>

          <View style={s.playerBottom}>
            <View style={s.trackInfo}>
              <View style={s.pillRow}>
                <TouchableOpacity style={s.glassPill} activeOpacity={0.8} onPress={() => setSheet('xray')}>
                  <Text style={s.pillText}>X-Ray</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.glassPill} activeOpacity={0.8} onPress={() => setSheet('lyrics')}>
                  <Text style={s.pillText}>Lyrics</Text>
                </TouchableOpacity>
              </View>

              <Animated.View style={[s.infoRow, skipAnimStyle]}>
                <View style={{ flex: 1 }}>
                  <Text style={s.songTitle} numberOfLines={1}>{song.title}</Text>
                  {artistHasPage ? (
                    <TouchableOpacity onPress={openArtist} activeOpacity={0.7} style={s.artistLink}>
                      <Text style={s.songArtist} numberOfLines={1}>{song.artistName}</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={s.songArtist} numberOfLines={1}>{song.artistName}</Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => toggleLike(song.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons
                    name={isLiked(song.id) ? 'heart' : 'heart-outline'}
                    size={24}
                    color={isLiked(song.id) ? C.cyan : '#fff'}
                  />
                </TouchableOpacity>
              </Animated.View>
            </View>

            <HannahJourneyScrubber song={song} audioBadge={audioBadge} audioLabel={audioLabel} />

            <View style={s.controls}>
              <TouchableOpacity onPress={prev} style={s.skipBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="play-skip-back" size={20} color="#fff" />
              </TouchableOpacity>

              <PlaybackPlayButton isPlaying={isPlaying} onPress={() => setIsPlaying(!isPlaying)} />

              <TouchableOpacity onPress={next} style={s.skipBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="play-skip-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={s.actionRow}>
              <RoundGlassButton accessibilityLabel="Add to playlist" onPress={handleAddToPlaylist}>
                <AddPlaylistIcon size={17} />
              </RoundGlassButton>
              <RoundGlassButton accessibilityLabel="Share" onPress={handleShare}>
                <ShareIcon size={20} />
              </RoundGlassButton>
              <RoundGlassButton accessibilityLabel="Cast" onPress={handleCast}>
                <CastIcon size={17} />
              </RoundGlassButton>
              <RoundGlassButton accessibilityLabel="Queue" onPress={() => setSheet('queue')}>
                <QueueIcon size={18} />
              </RoundGlassButton>
              <RoundGlassButton
                accessibilityLabel="More options"
                onPress={() => openAdaptiveMenu({ kind: 'song', song })}
              >
                <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
              </RoundGlassButton>
            </View>
          </View>
        </SafeAreaView>

        {/* Lyrics / X-Ray / Queue bottom sheet — same sheet language as the default
            now-playing screen and AdaptiveContextMenu. */}
        <Modal visible={sheet !== null} transparent animationType="slide" statusBarTranslucent onRequestClose={() => setSheet(null)}>
          <View style={s.sheetRoot}>
            <Pressable style={s.sheetBackdrop} onPress={() => setSheet(null)} />
            <View style={s.sheet}>
              <View style={s.sheetGrabber} />
              {sheet === 'lyrics' && (
                <>
                  <Text style={s.sheetTitle}>Lyrics</Text>
                  <Text style={s.sheetSub}>{song.title} · {song.artistName}</Text>
                  {lyric ? (
                    <View style={s.lyricBlock}>
                      <Text style={s.lyricText}>{lyric.lyric}</Text>
                      <Text style={s.lyricCredit}>From "{lyric.song}", full lyrics as the track plays</Text>
                    </View>
                  ) : (
                    <View style={s.lyricBlock}>
                      <Ionicons name="musical-notes-outline" size={28} color={C.textMuted} style={{ alignSelf: 'center', marginBottom: 10 }} />
                      <Text style={s.sheetEmpty}>Lyrics aren't available for this track yet.</Text>
                    </View>
                  )}
                </>
              )}
              {sheet === 'xray' && (
                <>
                  <Text style={s.sheetTitle}>X-Ray</Text>
                  <Text style={s.sheetSub}>About this track</Text>
                  <View style={s.xrayRow}><Text style={s.xrayLabel}>Song</Text><Text style={s.xrayValue} numberOfLines={1}>{song.title}</Text></View>
                  <View style={s.xrayRow}><Text style={s.xrayLabel}>Artist</Text><Text style={s.xrayValue} numberOfLines={1}>{song.artistName}</Text></View>
                  <View style={s.xrayRow}><Text style={s.xrayLabel}>Album</Text><Text style={s.xrayValue} numberOfLines={1}>{song.album}</Text></View>
                  <View style={s.xrayRow}><Text style={s.xrayLabel}>Audio</Text><Text style={s.xrayValue}>{audioLabel}</Text></View>
                  {(() => {
                    const artist = artists.find(a => a.id === song.artistId)
                    return artist ? (
                      <Text style={s.xrayBio} numberOfLines={4}>{artist.bio}</Text>
                    ) : null
                  })()}
                </>
              )}
              {sheet === 'queue' && (
                <>
                  <Text style={s.sheetTitle}>Up next</Text>
                  <Text style={s.sheetSub}>Playing from your station</Text>
                  <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={false}>
                    {upNext.map(q => {
                      const qArt = q.albumArtPath ? albumArtAssets[q.albumArtPath] : null
                      return (
                        <TouchableOpacity
                          key={q.id}
                          style={s.queueRow}
                          activeOpacity={0.75}
                          onPress={() => { playSongAt(q.id); setSheet(null) }}
                        >
                          {qArt ? (
                            <Image source={qArt} style={s.queueArt} resizeMode="cover" />
                          ) : (
                            <View style={[s.queueArt, { backgroundColor: q.albumArtColor }]} />
                          )}
                          <View style={{ flex: 1 }}>
                            <Text style={s.queueTitle} numberOfLines={1}>{q.title}</Text>
                            <Text style={s.queueArtist} numberOfLines={1}>{q.artistName}</Text>
                          </View>
                          <Text style={s.queueDuration}>{q.duration}</Text>
                        </TouchableOpacity>
                      )
                    })}
                  </ScrollView>
                </>
              )}
            </View>
          </View>
        </Modal>
      </Animated.View>
    </GestureDetector>
  )
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },

  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  roundBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alexaIcon: { width: 22, height: 22 },

  artSection: { alignItems: 'center', paddingTop: 24, paddingBottom: 24 },
  artWrap: {
    width: ART_SIZE,
    height: ART_SIZE,
    borderRadius: 4,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.45,
        shadowRadius: 16,
      },
      android: { elevation: 12 },
      web: { boxShadow: '0px 8px 16px rgba(0,0,0,0.45)' },
    }),
  },
  art: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },

  playerBottom: { marginTop: 'auto', paddingBottom: 12 },

  trackInfo: { paddingHorizontal: 16 },
  pillRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  glassPill: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: R.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  pillText: { fontFamily: FONT_FAMILY_EMBER.bold, fontSize: 12, lineHeight: 14.4, color: '#fff' },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  songTitle: { fontFamily: FONT_FAMILY_DISPLAY.bold, fontSize: 24, lineHeight: 24, color: '#fff' },
  songArtist: { fontFamily: FONT_FAMILY_EMBER.medium, fontSize: 16, color: '#A6A6A6', marginTop: 4 },
  artistLink: { alignSelf: 'flex-start' },

  scrubberWrap: { paddingHorizontal: 16, paddingVertical: 20 },
  scrubberHitArea: { paddingVertical: 10, marginVertical: -10 },
  scrubberTrack: { height: 2, backgroundColor: '#636261', borderRadius: R.full, position: 'relative' },
  scrubberFill: { position: 'absolute', top: 0, left: 0, height: '100%', borderRadius: R.full, backgroundColor: '#fff' },
  scrubberThumb: { position: 'absolute', top: -5.5, width: 13, height: 13, borderRadius: 6.5, backgroundColor: '#fff', marginLeft: -6.5 },
  times: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  time: { fontFamily: FONT_FAMILY_EMBER.regular, fontSize: 12, color: '#AFADAF', fontVariant: ['tabular-nums'] },
  audioBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  audioBadge: { fontFamily: FONT_FAMILY_DISPLAY.bold, fontSize: 12, color: '#A6A6A6' },

  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: TRANSPORT_GAP, paddingVertical: 8 },
  skipBtn: { alignItems: 'center', justifyContent: 'center' },
  playBtn: {
    width: PLAY_BTN_SIZE,
    height: PLAY_BTN_SIZE,
    borderRadius: PLAY_BTN_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseBars: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  pauseBar: { width: 5, height: 22, borderRadius: 2, backgroundColor: '#fff' },
  playTriangle: {
    width: 0,
    height: 0,
    marginLeft: 4,
    borderStyle: 'solid',
    borderTopWidth: 11,
    borderBottomWidth: 11,
    borderLeftWidth: 16,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#fff',
  },

  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 42, paddingTop: 20, paddingBottom: 16 },

  // Lyrics / X-Ray / Queue sheet (matches AdaptiveContextMenu's sheet language)
  sheetRoot: { flex: 1, justifyContent: 'flex-end' },
  sheetBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: R.xl,
    borderTopRightRadius: R.xl,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderColor: C.border,
  },
  sheetGrabber: {
    alignSelf: 'center',
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.22)',
    marginBottom: 14,
  },
  sheetTitle: { fontFamily: FONT_FAMILY_DISPLAY.bold, fontSize: 20, lineHeight: 20, color: C.textPrimary },
  sheetSub: { fontFamily: FONT_FAMILY_EMBER.regular, fontSize: 13, color: C.textMuted, marginTop: 4, marginBottom: 14 },
  sheetEmpty: { fontFamily: FONT_FAMILY_EMBER.regular, fontSize: 14, color: C.textSecondary, textAlign: 'center', lineHeight: 20 },

  lyricBlock: { paddingVertical: 18, paddingHorizontal: 4 },
  lyricText: { fontFamily: FONT_FAMILY_DISPLAY.bold, fontSize: 22, lineHeight: 26, color: C.textPrimary },
  lyricCredit: { fontFamily: FONT_FAMILY_EMBER.regular, fontSize: 12, color: C.textMuted, marginTop: 14 },

  xrayRow: { flexDirection: 'row', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: C.border },
  xrayLabel: { width: 72, fontFamily: FONT_FAMILY_EMBER.regular, fontSize: 13, color: C.textMuted },
  xrayValue: { flex: 1, fontFamily: FONT_FAMILY_EMBER.bold, fontSize: 14, color: C.textPrimary },
  xrayBio: { fontFamily: FONT_FAMILY_EMBER.regular, fontSize: 13, color: C.textSecondary, lineHeight: 19, marginTop: 14 },

  queueRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9 },
  queueArt: { width: 42, height: 42, borderRadius: 6, overflow: 'hidden' },
  queueTitle: { fontFamily: FONT_FAMILY_EMBER.bold, fontSize: 14, color: C.textPrimary },
  queueArtist: { fontFamily: FONT_FAMILY_EMBER.regular, fontSize: 12, color: C.textSecondary, marginTop: 2 },
  queueDuration: { fontFamily: FONT_FAMILY_EMBER.regular, fontSize: 12, color: C.textMuted, fontVariant: ['tabular-nums'] },
})
