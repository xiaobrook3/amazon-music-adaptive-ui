import { useState, useEffect, useRef } from 'react'
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Modal,
  Alert,
} from 'react-native'
import { Swipeable } from 'react-native-gesture-handler'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Text } from '../../src/components/AppText'
import { AppImage as Image } from '../../src/components/AppImage'
import { logoAssets, albumArtAssets } from '../../src/data/assetMap'
import { usePlaybackState } from '../../src/hooks/usePlaybackState'
import { useSavedSessions } from '../../src/context/SavedSessionsContext'
import {
  MAESTRO_PROMPT_ROWS,
  MAESTRO_DISCLAIMER,
  generatePlaylist,
  isQuestion,
  answerQuestion,
  type MaestroResult,
  type MaestroAnswer,
} from '../../src/data/maestro'
import type { Song } from '../../src/data/mockData'
import { C, R, typeHeadline, typeSubhead } from '../../src/theme'

type Mode = 'idle' | 'generating' | 'result' | 'answer'

// Show the intro disclaimer once per app session.
let introSeen = false

// ── Generating animation ─────────────────────────────────────────────────────
function GeneratingView({ prompt, asking }: { prompt: string; asking: boolean }) {
  const pulse = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [pulse])

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.12] })
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] })

  return (
    <View style={s.centerFill}>
      <View style={s.starWrap}>
        <Animated.View style={[s.starGlow, { opacity: glowOpacity }]}>
          <LinearGradient
            colors={['#8B5CF6', '#25D1DA']}
            style={s.starGlowInner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="sparkles" size={90} color="#C9B6F0" />
        </Animated.View>
      </View>
      <Text style={s.generatingTitle} numberOfLines={2}>“{prompt}”</Text>
      <Text style={s.generatingCaption}>{asking ? 'Thinking…' : 'Creating your playlist…'}</Text>
    </View>
  )
}

// ── Swipeable result row ─────────────────────────────────────────────────────
function ResultRow({ song, onPlay, onRemove }: { song: Song; onPlay: () => void; onRemove: () => void }) {
  const art = song.albumArtPath ? albumArtAssets[song.albumArtPath] : null
  const action = () => (
    <View style={s.removeAction}>
      <Ionicons name="trash-outline" size={20} color="#fff" />
      <Text style={s.removeActionText}>Remove</Text>
    </View>
  )
  return (
    <Swipeable
      renderRightActions={action}
      renderLeftActions={action}
      onSwipeableWillOpen={onRemove}
      overshootLeft={false}
      overshootRight={false}
    >
      <TouchableOpacity style={s.songRow} activeOpacity={0.8} onPress={onPlay}>
        {art ? (
          <Image source={art} style={s.songArt} resizeMode="cover" />
        ) : (
          <View style={[s.songArt, { backgroundColor: song.albumArtColor }]} />
        )}
        <View style={s.songInfo}>
          <Text style={s.songTitle} numberOfLines={1}>{song.title}</Text>
          <Text style={s.songArtist} numberOfLines={1}>{song.artistName}</Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  )
}

export default function MaestroScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { playSongAt } = usePlaybackState()
  const { saveCurrentSession } = useSavedSessions()

  const [mode, setMode] = useState<Mode>('idle')
  const [input, setInput] = useState('')
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState<MaestroResult | null>(null)
  const [answer, setAnswer] = useState<MaestroAnswer | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [showIntro, setShowIntro] = useState(!introSeen)

  const submit = (text: string) => {
    const p = text.trim()
    if (!p) return
    Keyboard.dismiss()
    setPrompt(p)
    setResult(null)
    setShowPrompt(false)
    setMode('generating')
  }

  // Deep-link handoff: artist pages' "Ask Alexa" boxes route here with ?q=…
  const { q } = useLocalSearchParams<{ q?: string }>()
  const lastHandoff = useRef<string | null>(null)
  useEffect(() => {
    if (q && q !== lastHandoff.current) {
      lastHandoff.current = q
      dismissIntro()
      submit(q)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  // Generating → answer (for questions) or playlist result, after the beat.
  useEffect(() => {
    if (mode !== 'generating') return
    const question = isQuestion(prompt)
    const t = setTimeout(() => {
      if (question) {
        setAnswer(answerQuestion(prompt))
        setMode('answer')
      } else {
        setResult(generatePlaylist(prompt))
        setMode('result')
      }
    }, question ? 1400 : 2200)
    return () => clearTimeout(t)
  }, [mode, prompt])

  const reset = () => {
    setMode('idle')
    setResult(null)
    setAnswer(null)
    setShowPrompt(false)
  }

  const dismissIntro = () => {
    introSeen = true
    setShowIntro(false)
  }

  const handleSave = () => {
    if (!result) return
    saveCurrentSession(result.songs, result.name)
    Alert.alert('Saved', `“${result.name}” was saved to your library.`)
  }

  const handlePlay = () => {
    if (!result || result.songs.length === 0) return
    playSongAt(result.songs[0].id)
    router.push('/now-playing')
  }

  const removeSong = (id: string) => {
    setResult(r => (r ? { ...r, songs: r.songs.filter(song => song.id !== id) } : r))
  }

  return (
    <View style={s.screen}>
      <LinearGradient
        colors={['#0a0a0a', '#12101c', '#1b1533']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 6 }]}>
        <TouchableOpacity
          style={s.headerBtn}
          onPress={mode === 'idle' ? undefined : reset}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {mode !== 'idle' ? <Ionicons name="chevron-back" size={24} color="#fff" /> : null}
        </TouchableOpacity>
        <TouchableOpacity onPress={reset} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}>
          <Text style={s.headerTitle}>Maestro Beta</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.headerBtn}
          onPress={() => (mode === 'result' ? Alert.alert('Report', 'Thanks — we\'ll take a look at this playlist.') : setShowIntro(true))}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {mode === 'result' ? (
            <Ionicons name="flag-outline" size={20} color="#fff" />
          ) : (
            <Ionicons name="information-circle-outline" size={22} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* ── IDLE ── */}
      {mode === 'idle' && (
        <KeyboardAvoidingView
          style={s.flex1}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={90}
        >
          <ScrollView
            contentContainerStyle={s.idleScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={s.createTitle}>
              What will{'\n'}you <Text style={s.createAccent}>create</Text>?
            </Text>

            <View style={s.pillRows}>
              {MAESTRO_PROMPT_ROWS.map((row, i) => (
                <ScrollView
                  key={`row-${i}`}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.pillRowContent}
                >
                  {row.map(p => (
                    <TouchableOpacity key={p} style={s.promptPill} activeOpacity={0.8} onPress={() => submit(p)}>
                      <Text style={s.promptPillText}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ))}
            </View>

            <TouchableOpacity
              style={s.communityPill}
              activeOpacity={0.85}
              onPress={() => submit('Community favorites')}
            >
              <Text style={s.communityPillText}>Explore community playlists</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Input bar */}
          <View style={[s.inputRow, { paddingBottom: 12 }]}>
            <TouchableOpacity style={s.cameraBtn} activeOpacity={0.8}>
              <Ionicons name="camera-outline" size={20} color="#fff" />
            </TouchableOpacity>
            <View style={s.inputBar}>
              <Ionicons name="sparkles" size={16} color="#B9A7F0" />
              <TextInput
                style={s.input}
                value={input}
                onChangeText={setInput}
                placeholder="Type your playlist idea here…"
                placeholderTextColor="#8b8b94"
                returnKeyType="send"
                onSubmitEditing={() => {
                  submit(input)
                  setInput('')
                }}
              />
              <TouchableOpacity
                onPress={() => {
                  submit(input)
                  setInput('')
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name={input.trim() ? 'arrow-up-circle' : 'mic-outline'} size={22} color="#B9A7F0" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* ── GENERATING ── */}
      {mode === 'generating' && <GeneratingView prompt={prompt} asking={isQuestion(prompt)} />}

      {/* ── RESULT ── */}
      {mode === 'result' && result && (
        <ScrollView
          style={s.flex1}
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={s.resultHeader}>
            <Text style={s.resultName}>{result.name}</Text>
            <Text style={s.resultDesc}>{result.description}</Text>
            <TouchableOpacity onPress={() => setShowPrompt(v => !v)} activeOpacity={0.7}>
              <Text style={s.showPrompt}>{showPrompt ? 'Hide prompt' : 'Show prompt'}</Text>
            </TouchableOpacity>
            {showPrompt ? <Text style={s.promptEcho}>“{prompt}”</Text> : null}

            <View style={s.controlsRow}>
              <TouchableOpacity style={s.saveBtn} activeOpacity={0.85} onPress={handleSave}>
                <Ionicons name="bookmark-outline" size={15} color="#fff" />
                <Text style={s.saveBtnText}>Save playlist</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.playBtn} activeOpacity={0.85} onPress={handlePlay}>
                <Ionicons name="play" size={20} color={C.bg} style={{ marginLeft: 2 }} />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={s.swipeHint}>Swipe a track left or right to remove it</Text>
          {result.songs.map(song => (
            <ResultRow
              key={song.id}
              song={song}
              onPlay={() => {
                playSongAt(song.id)
                router.push('/now-playing')
              }}
              onRemove={() => removeSong(song.id)}
            />
          ))}
        </ScrollView>
      )}

      {/* ── ANSWER (Q&A — Maestro can answer, not just build) ── */}
      {mode === 'answer' && answer && (
        <ScrollView style={s.flex1} contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
          <View style={s.answerWrap}>
            <View style={s.answerBadge}>
              <Ionicons name="sparkles" size={15} color="#B9A7F0" />
              <Text style={s.answerBadgeText}>Maestro</Text>
            </View>
            <Text style={s.answerTitle}>{answer.title}</Text>
            <Text style={s.answerBody}>{answer.body}</Text>
            <Text style={s.answerFollowLabel}>Keep going</Text>
            <View style={s.answerChips}>
              {answer.followUps.map(f => (
                <TouchableOpacity key={f} style={s.promptPill} activeOpacity={0.8} onPress={() => submit(f)}>
                  <Text style={s.promptPillText}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      )}

      {/* Intro disclaimer */}
      <Modal visible={showIntro} transparent animationType="fade" onRequestClose={dismissIntro} statusBarTranslucent>
        <View style={s.introBackdrop}>
          <View style={s.introCard}>
            <View style={s.introIcon}>
              <Image source={logoAssets.alexa} style={s.introLogo} resizeMode="contain" />
            </View>
            <Text style={s.introTitle}>Create with Maestro</Text>
            <Text style={s.introBody}>{MAESTRO_DISCLAIMER}</Text>
            <TouchableOpacity style={s.introBtn} activeOpacity={0.85} onPress={dismissIntro}>
              <Text style={s.introBtnText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  flex1: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },

  // Idle
  idleScroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 16, paddingBottom: 12 },
  createTitle: { ...typeHeadline(34), color: '#fff', textAlign: 'center', marginBottom: 28 },
  // Bolder, brighter blue-purple with a glow so "create" pops as the accent word.
  createAccent: {
    ...typeHeadline(40),
    color: '#B57BFF',
    textShadowColor: 'rgba(122,92,255,0.65)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  pillRows: { gap: 12 },
  pillRowContent: { gap: 10, paddingHorizontal: 4 },
  promptPill: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: R.md,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  promptPillText: { fontSize: 14, color: '#fff', fontWeight: '500' },
  communityPill: {
    alignSelf: 'center',
    marginTop: 28,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: R.full,
    paddingHorizontal: 22,
    paddingVertical: 13,
  },
  communityPillText: { fontSize: 14, color: '#fff', fontWeight: '500' },

  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16 },
  cameraBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 46,
    borderRadius: 23,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(185,167,240,0.55)',
  },
  input: { flex: 1, fontSize: 14, color: '#fff', padding: 0 },

  // Generating
  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  starWrap: { width: 160, height: 160, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  starGlow: { position: 'absolute', width: 160, height: 160, alignItems: 'center', justifyContent: 'center' },
  starGlowInner: { width: 120, height: 120, borderRadius: 60, opacity: 0.5 },
  generatingTitle: { ...typeHeadline(26), color: '#fff', textAlign: 'center' },
  generatingCaption: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 14 },

  // Result
  resultHeader: { paddingHorizontal: 16, paddingTop: 4 },
  resultName: { ...typeHeadline(26), color: '#fff' },
  resultDesc: { fontSize: 15, color: 'rgba(255,255,255,0.78)', marginTop: 10, lineHeight: 21 },
  showPrompt: { fontSize: 13, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', marginTop: 8 },
  promptEcho: { fontSize: 14, color: C.cyan, marginTop: 6, fontStyle: 'italic' },
  controlsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, marginBottom: 8 },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: R.full,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  saveBtnText: { fontSize: 14, color: '#fff', fontWeight: '600' },
  playBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.cyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeHint: { fontSize: 12, color: 'rgba(255,255,255,0.4)', paddingHorizontal: 16, marginTop: 12, marginBottom: 6 },

  // Answer (Q&A)
  answerWrap: { paddingHorizontal: 16, paddingTop: 8 },
  answerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(185,167,240,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(185,167,240,0.4)',
    borderRadius: R.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 14,
  },
  answerBadgeText: { fontSize: 13, fontWeight: '700', color: '#C9B6F0' },
  answerTitle: { ...typeHeadline(26), color: '#fff' },
  answerBody: { fontSize: 16, color: 'rgba(255,255,255,0.82)', marginTop: 12, lineHeight: 24 },
  answerFollowLabel: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.5)', letterSpacing: 0.4, marginTop: 26, marginBottom: 12 },
  answerChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },

  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: C.bg,
  },
  songArt: { width: 52, height: 52, borderRadius: R.sm, overflow: 'hidden' },
  songInfo: { flex: 1, marginLeft: 12 },
  songTitle: { fontSize: 15, fontWeight: '600', color: '#fff' },
  songArtist: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  removeAction: {
    backgroundColor: '#8a1c2b',
    alignItems: 'center',
    justifyContent: 'center',
    width: 92,
    gap: 3,
  },
  removeActionText: { fontSize: 11, color: '#fff', fontWeight: '600' },

  // Intro modal
  introBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  introCard: {
    width: '100%',
    backgroundColor: C.surface,
    borderRadius: R.xl,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  introIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(37,209,218,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(37,209,218,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  introLogo: { width: 30, height: 30 },
  introTitle: { ...typeHeadline(20), color: '#fff', marginBottom: 12 },
  introBody: { fontSize: 14, color: 'rgba(255,255,255,0.72)', textAlign: 'center', lineHeight: 21 },
  introBtn: {
    marginTop: 22,
    alignSelf: 'stretch',
    backgroundColor: C.cyan,
    borderRadius: R.full,
    paddingVertical: 14,
    alignItems: 'center',
  },
  introBtnText: { ...typeSubhead(15), color: C.bg },
})
