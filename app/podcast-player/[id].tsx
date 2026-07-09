import { useState, useEffect, useRef } from 'react'
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  ImageBackground,
  Platform,
  Modal,
  Pressable,
  Share,
} from 'react-native'
import { AppImage as Image } from '../../src/components/AppImage'
import { Text } from '../../src/components/AppText'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { GlassPlayButton } from '../../src/components/GlassCircleButton'
import { useAdaptiveUI } from '../../src/context/AdaptiveUIContext'
import { albumArtAssets } from '../../src/data/assetMap'
import { findPodcast, podcastEpisode } from '../../src/data/podcastEpisodes'
import { hexWithAlpha } from '../../src/utils/color'
import { C, R, PLAYER_GRADIENT, typeHeadline, typeSubhead } from '../../src/theme'

const SPEEDS = [0.75, 1, 1.25, 1.5, 2] as const
const SLEEP_OPTIONS = ['5 min', '10 min', '15 min', '30 min', '45 min', 'End of episode', 'Off'] as const

function fmt(secs: number): string {
  const s = Math.max(0, Math.floor(secs))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m)
  return h > 0 ? `${h}:${mm}:${String(sec).padStart(2, '0')}` : `${mm}:${String(sec).padStart(2, '0')}`
}

/** Scrolls the title horizontally, but only when it overflows the container. */
function Marquee({ text, style }: { text: string; style: any }) {
  const [boxW, setBoxW] = useState(0)
  const [textW, setTextW] = useState(0)
  const x = useRef(new Animated.Value(0)).current
  const overflow = textW > 0 && boxW > 0 && textW > boxW

  useEffect(() => {
    x.stopAnimation()
    x.setValue(0)
    if (!overflow) return
    const distance = textW - boxW + 24
    const dur = Math.max(3200, distance * 26)
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(1400),
        Animated.timing(x, { toValue: -distance, duration: dur, easing: Easing.linear, useNativeDriver: true }),
        Animated.delay(900),
        Animated.timing(x, { toValue: 0, duration: dur, easing: Easing.linear, useNativeDriver: true }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [overflow, textW, boxW, x])

  return (
    <View style={s.marqueeBox} onLayout={e => setBoxW(e.nativeEvent.layout.width)}>
      <Animated.View style={{ flexDirection: 'row', transform: [{ translateX: x }] }}>
        <Text numberOfLines={1} style={style} onLayout={e => setTextW(e.nativeEvent.layout.width)}>
          {text}
        </Text>
      </Animated.View>
    </View>
  )
}

export default function PodcastPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { showConfirmation } = useAdaptiveUI()
  const pod = findPodcast(id)
  const ep = podcastEpisode(pod)
  const art = pod.coverArtPath ? albumArtAssets[pod.coverArtPath] : null

  const [isPlaying, setIsPlaying] = useState(true)
  const [elapsed, setElapsed] = useState(0)
  const [speedIdx, setSpeedIdx] = useState(1)
  const [showAbout, setShowAbout] = useState(false)
  const [showSleep, setShowSleep] = useState(false)
  const [sleep, setSleep] = useState<string | null>(null)

  // Advance playback; speed scales how fast the clock moves.
  useEffect(() => {
    if (!isPlaying) return
    const t = setInterval(() => {
      setElapsed(e => {
        const next = e + SPEEDS[speedIdx]
        if (next >= ep.durationSecs) {
          setIsPlaying(false)
          return ep.durationSecs
        }
        return next
      })
    }, 1000)
    return () => clearInterval(t)
  }, [isPlaying, speedIdx, ep.durationSecs])

  const progress = Math.min(100, (elapsed / ep.durationSecs) * 100)
  const remaining = ep.durationSecs - elapsed
  const back10 = () => setElapsed(e => Math.max(0, e - 10))
  const fwd10 = () => setElapsed(e => Math.min(ep.durationSecs, e + 10))
  const cycleSpeed = () => setSpeedIdx(i => (i + 1) % SPEEDS.length)

  const gradientColors = art
    ? [
        hexWithAlpha(pod.coverColor, 0.52),
        hexWithAlpha(pod.coverColor, 0.32),
        hexWithAlpha(pod.coverColor, 0.14),
        'rgba(10,10,10,0.6)',
      ]
    : [...PLAYER_GRADIENT]

  return (
    <View style={s.screen}>
      {/* Dynamic background */}
      <View style={StyleSheet.absoluteFill}>
        {art ? (
          <ImageBackground
            source={art}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
            blurRadius={Platform.OS === 'ios' ? 56 : 32}
          >
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.14)' }]} />
          </ImageBackground>
        ) : null}
        <LinearGradient
          colors={gradientColors as [string, string, ...string[]]}
          locations={art ? [0, 0.28, 0.58, 1] : undefined}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <View style={s.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={s.navBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="chevron-down" size={26} color={C.textPrimary} />
          </TouchableOpacity>
          <Text style={s.playingFrom}>PLAYING PODCAST</Text>
          <TouchableOpacity
            style={s.navBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => setShowAbout(true)}
          >
            <Ionicons name="ellipsis-horizontal" size={22} color={C.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Cover */}
        <View style={s.artSection}>
          <View style={s.artWrap}>
            {art ? (
              <Image source={art} style={s.art} resizeMode="cover" />
            ) : (
              <View style={[s.art, { backgroundColor: pod.coverColor }]}>
                <Ionicons name="mic" size={90} color="rgba(255,255,255,0.14)" />
              </View>
            )}
          </View>
        </View>

        <View style={s.bottom}>
          {/* About pill (no lyrics / X-Ray) */}
          <View style={s.pillRow}>
            <TouchableOpacity style={s.glassPill} activeOpacity={0.8} onPress={() => setShowAbout(true)}>
              <Ionicons name="information-circle-outline" size={15} color="#fff" />
              <Text style={s.pillText}>About</Text>
            </TouchableOpacity>
          </View>

          {/* Title (marquee if long) + host */}
          <Marquee text={ep.title} style={s.title} />
          <Text style={s.host} numberOfLines={1}>{pod.host}</Text>

          {/* Scrubber */}
          <View style={s.scrubberWrap}>
            <View style={s.scrubberTrack}>
              <View style={[s.scrubberFill, { width: `${progress}%` as `${number}%` }]} />
              <View style={[s.scrubberThumb, { left: `${progress}%` as `${number}%` }]} />
            </View>
            <View style={s.times}>
              <Text style={s.time}>{fmt(elapsed)}</Text>
              <Text style={s.time}>-{fmt(remaining)}</Text>
            </View>
          </View>

          {/* Controls: back 10s · play · forward 10s (no track skip) */}
          <View style={s.controls}>
            <TouchableOpacity onPress={back10} style={s.skipBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <MaterialIcons name="replay-10" size={38} color="#fff" />
            </TouchableOpacity>
            <GlassPlayButton size={64} isPlaying={isPlaying} onPress={() => setIsPlaying(p => !p)} />
            <TouchableOpacity onPress={fwd10} style={s.skipBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <MaterialIcons name="forward-10" size={38} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Bottom utility row — five controls */}
          <View style={s.utilRow}>
            <TouchableOpacity style={s.util} onPress={cycleSpeed} activeOpacity={0.8}>
              <Text style={s.speedText}>{SPEEDS[speedIdx]}x</Text>
              <Text style={s.utilLabel}>Speed</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.util} onPress={() => setShowSleep(true)} activeOpacity={0.8}>
              <Ionicons name="moon-outline" size={20} color={sleep ? C.cyan : '#fff'} />
              <Text style={[s.utilLabel, sleep && { color: C.cyan }]}>{sleep && sleep !== 'Off' ? sleep : 'Timer'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.util}
              activeOpacity={0.8}
              onPress={() => showConfirmation('No Cast devices found nearby')}
            >
              <Ionicons name="tv-outline" size={20} color="#fff" />
              <Text style={s.utilLabel}>Cast</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.util} activeOpacity={0.8} onPress={() => router.push(`/podcast-show/${pod.id}` as any)}>
              <Ionicons name="list" size={20} color="#fff" />
              <Text style={s.utilLabel}>Episodes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.util}
              activeOpacity={0.8}
              onPress={() => Share.share({ message: `Listening to "${ep.title}" from ${pod.title} on Amazon Music Podcasts` }).catch(() => {})}
            >
              <Ionicons name="share-outline" size={20} color="#fff" />
              <Text style={s.utilLabel}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* About modal */}
      <Modal visible={showAbout} transparent animationType="fade" onRequestClose={() => setShowAbout(false)} statusBarTranslucent>
        <Pressable style={s.modalBackdrop} onPress={() => setShowAbout(false)}>
          <Pressable style={s.aboutCard} onPress={() => {}}>
            <Text style={s.aboutTitle}>{pod.title}</Text>
            <Text style={s.aboutEp}>{ep.title}</Text>
            <Text style={s.aboutBody}>{ep.about}</Text>
            <TouchableOpacity style={s.aboutClose} onPress={() => setShowAbout(false)}>
              <Text style={s.aboutCloseText}>Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Sleep-timer sheet */}
      <Modal visible={showSleep} transparent animationType="slide" onRequestClose={() => setShowSleep(false)} statusBarTranslucent>
        <Pressable style={s.sheetBackdrop} onPress={() => setShowSleep(false)}>
          <Pressable style={s.sheet} onPress={() => {}}>
            <View style={s.sheetHandle} />
            <Text style={s.sheetTitle}>Sleep timer</Text>
            {SLEEP_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt}
                style={s.sheetRow}
                onPress={() => {
                  setSleep(opt === 'Off' ? null : opt)
                  setShowSleep(false)
                }}
              >
                <Text style={[s.sheetRowText, sleep === opt && { color: C.cyan }]}>{opt}</Text>
                {sleep === opt ? <Ionicons name="checkmark" size={18} color={C.cyan} /> : null}
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 },
  navBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  playingFrom: { fontSize: 10, color: C.textSecondary, letterSpacing: 0.7, fontWeight: '700' },

  artSection: { alignItems: 'center', marginTop: 18 },
  artWrap: {
    borderRadius: R.md,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.6, shadowRadius: 30 },
      android: { elevation: 24 },
    }),
  },
  art: { width: 300, height: 300, maxWidth: '82%', borderRadius: R.md, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },

  bottom: { marginTop: 'auto', marginBottom: 20, paddingHorizontal: 22 },
  pillRow: { flexDirection: 'row', marginBottom: 14 },
  glassPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: R.full,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  pillText: { fontSize: 13, fontWeight: '600', color: '#fff' },

  marqueeBox: { width: '100%', overflow: 'hidden' },
  title: { ...typeHeadline(24), color: C.textPrimary },
  host: { fontSize: 14, color: C.textSecondary, marginTop: 6 },

  scrubberWrap: { marginTop: 20, marginBottom: 22 },
  scrubberTrack: { height: 3, backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 2, position: 'relative' },
  scrubberFill: { position: 'absolute', top: 0, left: 0, height: '100%', borderRadius: 2, backgroundColor: '#fff' },
  scrubberThumb: { position: 'absolute', top: -5, width: 13, height: 13, borderRadius: 7, backgroundColor: '#fff', marginLeft: -6 },
  times: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 9 },
  time: { fontSize: 11, color: 'rgba(255,255,255,0.75)', fontVariant: ['tabular-nums'] },

  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 34, marginBottom: 26 },
  skipBtn: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },

  utilRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 4 },
  util: { alignItems: 'center', gap: 5, minWidth: 52 },
  speedText: { fontSize: 15, fontWeight: '700', color: '#fff', height: 20, lineHeight: 20 },
  utilLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },

  // About modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  aboutCard: { width: '100%', backgroundColor: C.surface, borderRadius: R.xl, padding: 22, borderWidth: 1, borderColor: C.border },
  aboutTitle: { ...typeHeadline(20), color: '#fff' },
  aboutEp: { fontSize: 13, fontWeight: '700', color: C.cyan, marginTop: 8, lineHeight: 18 },
  aboutBody: { fontSize: 14, color: C.textSecondary, lineHeight: 21, marginTop: 10 },
  aboutClose: { marginTop: 20, alignSelf: 'stretch', backgroundColor: C.elevated, borderRadius: R.full, paddingVertical: 12, alignItems: 'center' },
  aboutCloseText: { ...typeSubhead(15), color: C.textPrimary },

  // Sleep sheet
  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: C.surface, borderTopLeftRadius: R.xl, borderTopRightRadius: R.xl, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 30, borderTopWidth: 1, borderColor: C.border },
  sheetHandle: { alignSelf: 'center', width: 38, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.22)', marginBottom: 14 },
  sheetTitle: { ...typeHeadline(18), color: '#fff', marginBottom: 8 },
  sheetRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: C.border },
  sheetRowText: { fontSize: 15, color: C.textPrimary },
})
