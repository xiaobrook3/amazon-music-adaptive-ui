import { useState } from 'react'
import {
  ScrollView,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native'
import { Text } from '../src/components/AppText'
import { AppImage as Image } from '../src/components/AppImage'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { artists, songs } from '../src/data/mockData'
import { useProfiles } from '../src/context/ProfilesContext'
import { useAdaptiveUI } from '../src/context/AdaptiveUIContext'
import { C, R, typeHeadline, typeSubhead, MOOD_EMOJI } from '../src/theme'

// Selectable pools, derived once from the catalog.
const ALL_ARTISTS = [...artists].sort((a, b) => a.name.localeCompare(b.name))
const ALL_GENRES = [...new Set(artists.map(a => a.genre))].sort()
const ALL_MOODS = [...new Set(songs.map(s => String(s.mood)))]

const VERSION_OPTIONS: { value: 1 | 2 | 3 | 4; label: string; desc: string }[] = [
  { value: 4, label: 'Latest', desc: 'Our most current design' },
  { value: 3, label: 'Prototype V3', desc: 'Adds the earned superfan hero card' },
  { value: 2, label: 'Prototype V2', desc: 'Re-skins by mood, time, and your picks' },
  { value: 1, label: 'Prototype V1', desc: 'Baseline — adaptive UI off' },
]

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[s.chip, selected && s.chipSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {selected ? <Ionicons name="checkmark" size={13} color={C.bg} style={{ marginRight: 4 }} /> : null}
      <Text style={[s.chipText, selected && s.chipTextSel]}>{label}</Text>
    </TouchableOpacity>
  )
}

export default function CreateProfileScreen() {
  const router = useRouter()
  const { createCustomProfile } = useProfiles()
  const { showConfirmation } = useAdaptiveUI()

  const [name, setName] = useState('')
  const [photoUri, setPhotoUri] = useState<string | null>(null)
  const [version, setVersion] = useState<1 | 2 | 3 | 4>(4)
  const [artistSel, setArtistSel] = useState<Set<string>>(new Set())
  const [genreSel, setGenreSel] = useState<Set<string>>(new Set())
  const [moodSel, setMoodSel] = useState<Set<string>>(new Set())

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      showConfirmation('Camera access is off — enable it in Settings to add a photo')
      return
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    })
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri)
    }
  }

  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      showConfirmation('Photo access is off — enable it in Settings to add a photo')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    })
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri)
    }
  }

  const choosePhoto = () => {
    // Web: Alert.alert renders no buttons in react-native-web, so go straight
    // to the library picker (no camera capture path in the browser build).
    if (Platform.OS === 'web') return pickFromLibrary()
    Alert.alert('Add a photo', undefined, [
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Choose from Library', onPress: pickFromLibrary },
      { text: 'Cancel', style: 'cancel' },
    ])
  }

  const toggle = (setFn: React.Dispatch<React.SetStateAction<Set<string>>>, value: string) =>
    setFn(prev => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })

  const totalPicks = artistSel.size + genreSel.size + moodSel.size
  // Nothing here is required — a blank name, no photo, or no picks still
  // creates a profile; createCustomProfile fills in sensible defaults.
  const canCreate = true

  const handleCreate = () => {
    createCustomProfile({
      name: name.trim(),
      artistIds: [...artistSel],
      genres: [...genreSel],
      moods: [...moodSel],
      photoUri,
      prototypeVersion: version,
    })
    if (router.canGoBack()) router.back()
    else router.replace('/(tabs)' as any)
  }

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={s.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={s.topTitle}>Create your profile</Text>
        <View style={s.iconBtn} />
      </View>

      {/* Separate, lighter-weight path — a fun shareable card, not a profile. */}
      <TouchableOpacity
        style={s.fanCardLink}
        activeOpacity={0.8}
        onPress={() => router.push('/create-fan-card' as any)}
      >
        <Ionicons name="sparkles-outline" size={15} color={C.cyan} />
        <Text style={s.fanCardLinkText}>Or create a Super Fan card to share instead</Text>
        <Ionicons name="chevron-forward" size={14} color={C.cyan} />
      </TouchableOpacity>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {/* Name */}
          <View style={s.section}>
            <Text style={s.label}>What should we call you?</Text>
            <TextInput
              style={s.nameInput}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={C.textMuted}
              returnKeyType="done"
              maxLength={24}
            />
          </View>

          {/* Profile picture */}
          <View style={[s.section, s.photoSection]}>
            <TouchableOpacity style={s.photoCircle} activeOpacity={0.8} onPress={choosePhoto}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={s.photoImage} resizeMode="cover" />
              ) : (
                <Ionicons name="camera" size={26} color={C.textMuted} />
              )}
              <View style={s.photoBadge}>
                <Ionicons name="camera" size={13} color={C.bg} />
              </View>
            </TouchableOpacity>
            <Text style={s.photoLabel}>{photoUri ? 'Retake photo' : 'Add a profile picture'}</Text>
          </View>

          {/* Selection intro */}
          <View style={s.section}>
            <Text style={s.superLabel}>What are you a superfan of?</Text>
            <Text style={s.superSub}>
              Pick any mix of artists, genres, and moods, your home is built from these.
            </Text>
          </View>

          {/* Artists */}
          <View style={s.section}>
            <Text style={s.groupTitle}>Artists</Text>
            <View style={s.chipWrap}>
              {ALL_ARTISTS.map(a => (
                <Chip
                  key={a.id}
                  label={a.name}
                  selected={artistSel.has(a.id)}
                  onPress={() => toggle(setArtistSel, a.id)}
                />
              ))}
            </View>
          </View>

          {/* Genres */}
          <View style={s.section}>
            <Text style={s.groupTitle}>Genres</Text>
            <View style={s.chipWrap}>
              {ALL_GENRES.map(g => (
                <Chip key={g} label={g} selected={genreSel.has(g)} onPress={() => toggle(setGenreSel, g)} />
              ))}
            </View>
          </View>

          {/* Moods */}
          <View style={s.section}>
            <Text style={s.groupTitle}>Moods</Text>
            <View style={s.chipWrap}>
              {ALL_MOODS.map(m => (
                <Chip
                  key={m}
                  label={`${MOOD_EMOJI[m] ? MOOD_EMOJI[m] + ' ' : ''}${m}`}
                  selected={moodSel.has(m)}
                  onPress={() => toggle(setMoodSel, m)}
                />
              ))}
            </View>
          </View>

          {/* Prototype version — an afterthought by design: the latest build
              is the obvious default, older ones are dimmed but still pickable
              if you want to see how your profile looked back then. */}
          <View style={s.section}>
            <Text style={s.groupTitle}>Prototype version</Text>
            <Text style={s.versionSub}>Latest is picked for you — older builds are here if you want to compare.</Text>
            <View style={s.versionRow}>
              {VERSION_OPTIONS.map(v => {
                const isSelected = version === v.value
                const isLatest = v.value === 4
                return (
                  <TouchableOpacity
                    key={v.value}
                    style={[
                      s.versionCard,
                      isSelected && (isLatest ? s.versionCardActive : s.versionCardActiveMuted),
                    ]}
                    activeOpacity={0.8}
                    onPress={() => setVersion(v.value)}
                  >
                    <Text style={[s.versionLabel, isSelected && s.versionLabelActive, !isLatest && !isSelected && s.versionLabelMuted]}>
                      {v.label}
                    </Text>
                    <Text style={s.versionDesc} numberOfLines={2}>
                      {v.desc}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>
        </ScrollView>

        {/* Create */}
        <View style={s.footer}>
          <TouchableOpacity
            style={[s.createBtn, !canCreate && s.createBtnDisabled]}
            onPress={handleCreate}
            activeOpacity={0.85}
            disabled={!canCreate}
          >
            <Ionicons name="sparkles" size={16} color={canCreate ? C.bg : C.textMuted} />
            <Text style={[s.createBtnText, !canCreate && { color: C.textMuted }]}>
              {totalPicks > 0 ? `Create profile · ${totalPicks} picked` : 'Create profile'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontSize: 16, fontWeight: '700', color: C.textPrimary },
  fanCardLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    backgroundColor: 'rgba(37,209,218,0.10)',
    borderRadius: R.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 4,
    marginBottom: 4,
  },
  fanCardLinkText: { fontSize: 12.5, fontWeight: '600', color: C.cyan },

  section: { paddingHorizontal: 16, marginTop: 20 },
  label: { ...typeHeadline(18), color: C.textPrimary, marginBottom: 10 },
  nameInput: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: C.textPrimary,
  },
  photoSection: { alignItems: 'center' },
  photoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoImage: { width: '100%', height: '100%' },
  photoBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.cyan,
    borderWidth: 2,
    borderColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoLabel: { fontSize: 13, fontWeight: '600', color: C.cyan, marginTop: 10 },
  superLabel: { ...typeHeadline(20), color: C.textPrimary },
  superSub: { fontSize: 13, color: C.textSecondary, marginTop: 6, lineHeight: 18 },
  groupTitle: { fontSize: 13, fontWeight: '700', color: C.textMuted, letterSpacing: 0.6, marginBottom: 12, textTransform: 'uppercase' },

  versionSub: { fontSize: 12, color: C.textMuted, marginTop: -6, marginBottom: 12, lineHeight: 16 },
  versionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  versionCard: {
    width: '47%',
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 12,
    paddingVertical: 12,
    opacity: 0.55,
  },
  versionCardActive: { opacity: 1, backgroundColor: C.surface, borderColor: C.cyan },
  versionCardActiveMuted: { opacity: 1, backgroundColor: C.surface, borderColor: C.textMuted },
  versionLabel: { fontSize: 13, fontWeight: '700', color: C.textSecondary },
  versionLabelActive: { color: C.cyan },
  versionLabelMuted: { color: C.textMuted },
  versionDesc: { fontSize: 11, color: C.textMuted, marginTop: 4, lineHeight: 14 },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: R.full,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: C.border,
  },
  chipSelected: { backgroundColor: C.cyan, borderColor: C.cyan },
  chipText: { fontSize: 13, fontWeight: '600', color: C.textPrimary },
  chipTextSel: { color: C.bg },

  footer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
    backgroundColor: C.bg,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.cyan,
    borderRadius: R.full,
    paddingVertical: 15,
  },
  createBtnDisabled: { backgroundColor: C.elevated },
  createBtnText: { ...typeSubhead(15), color: C.bg },
})
