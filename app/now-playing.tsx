import { useState, useEffect, useRef, useCallback } from 'react'
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Modal,
  Pressable,
  ScrollView,
  Share,
} from 'react-native'
import { AppImage as Image } from '../src/components/AppImage'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  Easing,
} from 'react-native-reanimated'
import { Text } from '../src/components/AppText'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { usePlaybackState, usePlaybackProgress } from '../src/hooks/usePlaybackState'
import { useLikedSongs } from '../src/context/LikedSongsContext'
import { useSavedSessions } from '../src/context/SavedSessionsContext'
import { useAdaptiveUI } from '../src/context/AdaptiveUIContext'
import { useAdaptiveMenu } from '../src/components/AdaptiveContextMenu'
import { useHannahJourney } from '../src/context/HannahJourneyContext'
import HannahJourneyNowPlaying from '../src/components/hannah-journey/HannahJourneyNowPlaying'
import { songs, artists, type AudioBadge, type Song } from '../src/data/mockData'
import { albumArtAssets, playerIconAssets } from '../src/data/assetMap'
import { lyricForSong } from '../src/data/artistPages'
import { C, R, typeHeadline, typeSubhead } from '../src/theme'
import GlassCircleButton, { GlassPlayButton } from '../src/components/GlassCircleButton'
import BlurredArtBackground from '../src/components/BlurredArtBackground'
import { parseDurationSeconds, formatClock } from '../src/utils/color'

const { width, height } = Dimensions.get('window')
const ART_SIZE = Math.round(Math.min(width - 72, height * 0.4))
const PLAY_BTN_SIZE = 58
const ACTION_BTN_SIZE = 38
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

const BOTTOM_ACTIONS = [
  { key: 'add',   label: 'Add to playlist', icon: null as null },
  { key: 'share', label: 'Share',           icon: playerIconAssets.npShare },
  { key: 'cast',  label: 'Cast',            icon: playerIconAssets.npCast },
  { key: 'queue', label: 'Queue',           icon: playerIconAssets.npQueue },
  { key: 'save',  label: 'Save session',    icon: null as null },
] as const

const AUDIO_BADGE_LABELS: Record<AudioBadge, string> = {
  SD: 'SD',
  DOLBY_ATMOS: 'DOLBY ATMOS',
  '360_REALITY_AUDIO': '360 REALITY AUDIO',
}

function getAudioBadgeLabel(badge: AudioBadge | null | undefined): string {
  return AUDIO_BADGE_LABELS[badge ?? 'SD']
}

/**
 * Scrubber + clocks, isolated so the provider's 300ms progress tick only
 * re-renders this small section — not the whole player (blurred backdrop,
 * art, controls).
 */
function ScrubberSection({
  song,
  audioBadge,
  audioLabel,
}: {
  song: Song
  audioBadge: AudioBadge
  audioLabel: string
}) {
  const { nowPlayingProgress } = usePlaybackProgress()
  const totalSecs = parseDurationSeconds(song.duration)
  const elapsedSecs = (nowPlayingProgress / 100) * totalSecs
  const remainingSecs = totalSecs - elapsedSecs

  return (
    <View style={s.scrubberWrap}>
      <View style={s.scrubberTrack}>
        <View style={[s.scrubberFill, { width: `${nowPlayingProgress}%` as `${number}%` }]} />
        <View style={[s.scrubberThumb, { left: `${nowPlayingProgress}%` as `${number}%` }]} />
      </View>
      <View style={s.times}>
        <Text style={s.time}>{formatClock(elapsedSecs)}</Text>
        <Text style={s.time}>-{formatClock(remainingSecs)}</Text>
      </View>
      <Text style={[s.audioBadge, audioBadge === '360_REALITY_AUDIO' && s.audioBadgeLong]}>
        {audioLabel}
      </Text>
    </View>
  )
}

type PlayerSheet = 'lyrics' | 'xray' | 'queue' | null

export default function NowPlayingScreen() {
  const router = useRouter()
  const {
    isPlaying, setIsPlaying,
    currentSongIdx,
    skipNext, skipPrev, playSongAt,
  } = usePlaybackState()
  const { isLiked, toggleLike, addLike } = useLikedSongs()
  const { saveCurrentSession } = useSavedSessions()
  const { showConfirmation } = useAdaptiveUI()
  const { open: openAdaptiveMenu } = useAdaptiveMenu()
  const { isHannahJourney } = useHannahJourney()
  const [sessionSaved, setSessionSaved] = useState(false)
  const [sheet, setSheet] = useState<PlayerSheet>(null)
  const prevSongIdxRef = useRef(currentSongIdx)
  const skipAnimMountRef = useRef(true)
  const slideX = useSharedValue(0)
  const trackOpacity = useSharedValue(1)
  const dismissY = useSharedValue(0)

  const song = songs[currentSongIdx] ?? songs[0]
  const audioBadge = song.audioBadge ?? 'SD'
  const audioLabel = getAudioBadgeLabel(audioBadge)
  // The progress timer lives in PlaybackProvider; this screen only animates
  // track changes and renders the scrubber via <ScrubberSection>.

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

  // Auto-clear "Session saved!" confirmation after 2 s
  useEffect(() => {
    if (!sessionSaved) return
    const id = setTimeout(() => setSessionSaved(false), 2000)
    return () => clearTimeout(id)
  }, [sessionSaved])

  const handleSaveSession = useCallback(() => {
    // Capture recent plays: current song + songs before it (most recent first)
    const prevSongs = songs
      .slice(Math.max(0, currentSongIdx - 9), currentSongIdx)
      .reverse()
    const recentPlays = [song, ...prevSongs].slice(0, 10)
    const hour = new Date().getHours()
    const tod =
      hour >= 5 && hour < 12 ? 'Morning' :
      hour >= 12 && hour < 17 ? 'Afternoon' :
      hour >= 17 && hour < 21 ? 'Evening' :
      'Late Night'
    const d = new Date()
    const month = d.toLocaleString('en-US', { month: 'short' })
    const label = `${tod} with ${song.artistName} · ${month} ${d.getDate()}`
    saveCurrentSession(recentPlays, label)
    setSessionSaved(true)
  }, [currentSongIdx, song, saveCurrentSession])

  const prev = skipPrev
  const next = skipNext

  const art = song.albumArtPath ? albumArtAssets[song.albumArtPath] : null
  const artistHasPage = artists.some(a => a.id === song.artistId)
  const openArtist = () => router.push(`/artist/${song.artistId}` as any)

  const handleAddToPlaylist = () => {
    addLike(song.id)
    showConfirmation(`"${song.title}" added to Liked Songs`)
  }
  const handleShare = () => {
    Share.share({ message: `Listen to "${song.title}" by ${song.artistName} on Amazon Music` }).catch(() => {})
  }
  const handleCast = () => showConfirmation('No Cast devices found nearby')

  // Up next — the songs that the provider's auto-advance will play, in order.
  const upNext = Array.from({ length: 8 }, (_, i) => songs[(currentSongIdx + 1 + i) % songs.length])
  const lyric = lyricForSong(song.artistId, song.title)

  // Hannah Journey gets a Figma-matched visual layer (node 2576-45065,
  // "playback page") built on the same real playback state above; every other
  // persona falls through to the default screen below unchanged. All hooks
  // for this component have already run, so branching here is safe.
  if (isHannahJourney) {
    return <HannahJourneyNowPlaying />
  }

  return (
    <GestureDetector gesture={dismissPan}>
      <Animated.View style={[s.screen, dismissAnimStyle]}>
        <BlurredArtBackground art={art} fallbackColor={song.albumArtColor} />

        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <View style={s.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={s.navBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="chevron-down" size={26} color={C.textPrimary} />
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text style={s.playingFrom}>PLAYING FROM PLAYLIST</Text>
          </View>
          <TouchableOpacity
            style={s.navBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => openAdaptiveMenu({ kind: 'song', song })}
          >
            <Ionicons name="ellipsis-horizontal" size={22} color={C.textSecondary} />
          </TouchableOpacity>
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
              <TouchableOpacity style={s.glassPill} activeOpacity={0.8} onPress={() => setSheet('lyrics')}>
                <Text style={s.pillText}>Lyrics</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.glassPill} activeOpacity={0.8} onPress={() => setSheet('xray')}>
                <Text style={s.pillText}>X-Ray</Text>
              </TouchableOpacity>
            </View>

            <View style={s.infoRow}>
              <Animated.View style={[{ flex: 1 }, skipAnimStyle]}>
                <Text style={s.songTitle} numberOfLines={1}>{song.title}</Text>
                {artistHasPage ? (
                  <TouchableOpacity
                    onPress={openArtist}
                    activeOpacity={0.6}
                    hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                    style={s.artistLink}
                  >
                    <Text style={[s.songArtist, { marginTop: 0 }]}>{song.artistName}</Text>
                    <Ionicons name="chevron-forward" size={14} color={C.textSecondary} style={{ marginLeft: 2 }} />
                  </TouchableOpacity>
                ) : (
                  <Text style={s.songArtist}>{song.artistName}</Text>
                )}
              </Animated.View>
              <TouchableOpacity onPress={() => toggleLike(song.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons
                  name={isLiked(song.id) ? 'heart' : 'heart-outline'}
                  size={26}
                  color={isLiked(song.id) ? C.cyanBright : C.textPrimary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.bottomSection}>
          <ScrubberSection song={song} audioBadge={audioBadge} audioLabel={audioLabel} />

          <View style={s.controls}>
            <TouchableOpacity onPress={prev} style={s.skipBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="play-skip-back" size={26} color="#fff" />
            </TouchableOpacity>

            <GlassPlayButton
              size={PLAY_BTN_SIZE}
              isPlaying={isPlaying}
              onPress={() => setIsPlaying(!isPlaying)}
            />

            <TouchableOpacity onPress={next} style={s.skipBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="play-skip-forward" size={26} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={s.actionRow}>
            {BOTTOM_ACTIONS.map(action => (
              <GlassCircleButton
                key={action.key}
                size={ACTION_BTN_SIZE}
                accessibilityLabel={action.label}
                icon={action.icon ?? undefined}
                iconSize={action.key === 'cast' || action.key === 'share' ? 20 : 18}
                onPress={
                  action.key === 'save' ? handleSaveSession :
                  action.key === 'add' ? handleAddToPlaylist :
                  action.key === 'share' ? handleShare :
                  action.key === 'cast' ? handleCast :
                  () => setSheet('queue')
                }
              >
                {action.key === 'add' ? (
                  <Ionicons name="add" size={22} color="#fff" />
                ) : action.key === 'save' ? (
                  <Ionicons
                    name={sessionSaved ? 'bookmark' : 'bookmark-outline'}
                    size={18}
                    color={sessionSaved ? C.cyan : '#fff'}
                  />
                ) : undefined}
              </GlassCircleButton>
            ))}
          </View>
        </View>
        </View>
        </SafeAreaView>

        {/* Lyrics / X-Ray / Queue bottom sheet — same sheet language as the adaptive menu */}
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
  screen:       { flex: 1, backgroundColor: C.bg },
  topBar:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 },
  navBtn:       { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  playingFrom:  { fontSize: 10, color: C.textSecondary, letterSpacing: 0.7, fontWeight: '700' },
  artSection:   { alignItems: 'center', marginTop: 12 },
  artWrap:      {
    borderRadius: R.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: 0.62,
        shadowRadius: 30,
      },
      android: { elevation: 24 },
      web: { boxShadow: '0px 18px 30px rgba(0,0,0,0.62)' },
    }),
  },
  art:          {
    width: ART_SIZE, height: ART_SIZE,
    borderRadius: R.sm,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  playerBottom: { marginTop: 'auto', marginBottom: 24 },
  trackInfo:    { paddingHorizontal: 22, paddingTop: 14, paddingBottom: 0 },
  pillRow:      { flexDirection: 'row', justifyContent: 'flex-start', gap: 10, marginBottom: 10 },
  glassPill:    {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: R.full,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  pillText:     { fontSize: 13, fontWeight: '600', color: '#fff' },
  infoRow:      { flexDirection: 'row', alignItems: 'center' },
  songTitle:    { ...typeHeadline(26), color: C.textPrimary },
  songArtist:   { fontSize: 14, color: C.textSecondary, marginTop: 4 },
  artistLink:   { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginTop: 4 },
  bottomSection:{ paddingBottom: 4 },
  scrubberWrap: { paddingHorizontal: 22, marginTop: 14, marginBottom: 30 },
  scrubberTrack:{ height: 2, backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 1, position: 'relative' },
  scrubberFill: { position: 'absolute', top: 0, left: 0, height: '100%', borderRadius: 1, backgroundColor: '#fff' },
  scrubberThumb:{ position: 'absolute', top: -5, width: 12, height: 12, borderRadius: 6, backgroundColor: '#fff', marginLeft: -6 },
  times:        { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  time:         { fontSize: 11, color: 'rgba(255,255,255,0.75)', fontVariant: ['tabular-nums'] },
  audioBadge:     { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginTop: -2, letterSpacing: 0.8 },
  audioBadgeLong: { fontSize: 8, letterSpacing: 0.5 },
  controls:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 32, marginBottom: 22 },
  skipBtn:      { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  actionRow:    { flexDirection: 'row', justifyContent: 'center', gap: 18, paddingHorizontal: 22 },

  // Lyrics / X-Ray / Queue sheet (matches AdaptiveContextMenu's sheet language)
  sheetRoot:     { flex: 1, justifyContent: 'flex-end' },
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
  sheetTitle: { ...typeHeadline(20), color: C.textPrimary },
  sheetSub:   { fontSize: 13, color: C.textMuted, marginTop: 4, marginBottom: 14 },
  sheetEmpty: { fontSize: 14, color: C.textSecondary, textAlign: 'center', lineHeight: 20 },

  lyricBlock:  { paddingVertical: 18, paddingHorizontal: 4 },
  lyricText:   { ...typeHeadline(22), color: C.textPrimary, lineHeight: 30 },
  lyricCredit: { fontSize: 12, color: C.textMuted, marginTop: 14 },

  xrayRow:   { flexDirection: 'row', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: C.border },
  xrayLabel: { width: 72, fontSize: 13, color: C.textMuted },
  xrayValue: { flex: 1, fontSize: 14, fontWeight: '600', color: C.textPrimary },
  xrayBio:   { fontSize: 13, color: C.textSecondary, lineHeight: 19, marginTop: 14 },

  queueRow:      { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9 },
  queueArt:      { width: 42, height: 42, borderRadius: 6, overflow: 'hidden' },
  queueTitle:    { fontSize: 14, fontWeight: '600', color: C.textPrimary },
  queueArtist:   { fontSize: 12, color: C.textSecondary, marginTop: 2 },
  queueDuration: { fontSize: 12, color: C.textMuted, fontVariant: ['tabular-nums'] },
})
