import { useRef, useState } from 'react'
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
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import * as Sharing from 'expo-sharing'
import { captureRef } from 'react-native-view-shot'
import { useAdaptiveUI } from '../src/context/AdaptiveUIContext'
import SuperFanCard, {
  FAN_CARD_MAIN_MAX,
  FAN_CARD_SUB_MAX,
  FAN_CARD_DEFAULT_MAIN,
  FAN_CARD_DEFAULT_SUB,
} from '../src/components/SuperFanCard'
import { artists } from '../src/data/mockData'
import { artistAssets } from '../src/data/assetMap'
import { C, R, typeHeadline, typeSubhead } from '../src/theme'

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const ALL_ARTISTS = [...artists].sort((a, b) => a.name.localeCompare(b.name))
type ImageMode = 'photo' | 'artist'

export default function CreateFanCardScreen() {
  const router = useRouter()
  const { showConfirmation } = useAdaptiveUI()
  const cardRef = useRef<View>(null)

  const [imageMode, setImageMode] = useState<ImageMode>('photo')
  const [photoUri, setPhotoUri] = useState<string | null>(null)
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null)
  const [dateLabel, setDateLabel] = useState('')
  const [mainText, setMainText] = useState('')
  const [subText, setSubText] = useState('')
  const [sharing, setSharing] = useState(false)

  const imageSource =
    imageMode === 'photo'
      ? (photoUri ? { uri: photoUri } : null)
      : (selectedArtistId ? artistAssets[selectedArtistId] ?? null : null)

  // Stamped once, at the moment an image is chosen — a photo-booth timestamp,
  // not something typed in. Shared by both the photo and artist paths.
  const stampDate = () => {
    const now = new Date()
    setDateLabel(`${MONTH_NAMES[now.getMonth()].toUpperCase()} ${now.getFullYear()}`)
  }

  const applyPhoto = (uri: string) => {
    setPhotoUri(uri)
    stampDate()
  }

  const selectArtist = (artistId: string) => {
    setSelectedArtistId(artistId)
    stampDate()
  }

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      showConfirmation('Camera access is off — enable it in Settings to add a photo')
      return
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.85,
    })
    if (!result.canceled && result.assets[0]) applyPhoto(result.assets[0].uri)
  }

  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      showConfirmation('Photo access is off — enable it in Settings to add a photo')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.85,
    })
    if (!result.canceled && result.assets[0]) applyPhoto(result.assets[0].uri)
  }

  const choosePhoto = () => {
    Alert.alert('Add a photo', undefined, [
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Choose from Library', onPress: pickFromLibrary },
      { text: 'Cancel', style: 'cancel' },
    ])
  }

  const handleShare = async () => {
    if (!imageSource) {
      showConfirmation(imageMode === 'photo' ? 'Add a photo first' : 'Pick an artist first')
      return
    }
    setSharing(true)
    try {
      const uri = await captureRef(cardRef, { format: 'png', quality: 0.95 })
      const canShare = await Sharing.isAvailableAsync()
      if (!canShare) {
        showConfirmation('Sharing is not available on this device')
        return
      }
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share your Super Fan card' })
    } catch {
      showConfirmation('Could not create your card — try again')
    } finally {
      setSharing(false)
    }
  }

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={s.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={s.topTitle}>Create a Super Fan card</Text>
        <View style={s.iconBtn} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 24, alignItems: 'center' }}
        >
          <Text style={s.intro}>
            A fun, shareable card for the moment — take a picture, add your own words, share it outside the app.
          </Text>

          {/* Live preview — the exact view that gets captured and shared */}
          <View style={s.previewWrap}>
            <SuperFanCard
              ref={cardRef}
              imageSource={imageSource}
              dateLabel={dateLabel || 'READY WHEN YOU ARE'}
              mainText={mainText}
              subText={subText}
            />
          </View>

          {/* Photo vs. artist image */}
          <View style={s.modeToggle}>
            <TouchableOpacity
              style={[s.modeSeg, imageMode === 'photo' && s.modeSegActive]}
              activeOpacity={0.8}
              onPress={() => setImageMode('photo')}
            >
              <Text style={[s.modeSegText, imageMode === 'photo' && s.modeSegTextActive]}>Your photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.modeSeg, imageMode === 'artist' && s.modeSegActive]}
              activeOpacity={0.8}
              onPress={() => setImageMode('artist')}
            >
              <Text style={[s.modeSegText, imageMode === 'artist' && s.modeSegTextActive]}>Choose an artist</Text>
            </TouchableOpacity>
          </View>

          {imageMode === 'photo' ? (
            <TouchableOpacity style={s.photoBtn} activeOpacity={0.85} onPress={choosePhoto}>
              <Ionicons name="camera" size={16} color={C.bg} />
              <Text style={s.photoBtnText}>{photoUri ? 'Change picture' : 'Add your picture'}</Text>
            </TouchableOpacity>
          ) : (
            <View style={s.artistPicker}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.artistPickerContent}>
                {ALL_ARTISTS.map(a => (
                  <TouchableOpacity
                    key={a.id}
                    style={[s.artistChip, selectedArtistId === a.id && s.artistChipSelected]}
                    activeOpacity={0.8}
                    onPress={() => selectArtist(a.id)}
                  >
                    <Text style={[s.artistChipText, selectedArtistId === a.id && s.artistChipTextSel]} numberOfLines={1}>
                      {a.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Main text */}
          <View style={s.section}>
            <View style={s.labelRow}>
              <Text style={s.label}>Your text (optional)</Text>
              <Text style={s.counter}>{mainText.length}/{FAN_CARD_MAIN_MAX}</Text>
            </View>
            <TextInput
              style={s.input}
              value={mainText}
              onChangeText={setMainText}
              placeholder={`e.g. "${FAN_CARD_DEFAULT_MAIN}" or "Top 3%"`}
              placeholderTextColor={C.textMuted}
              maxLength={FAN_CARD_MAIN_MAX}
              returnKeyType="done"
            />
          </View>

          {/* Subtext */}
          <View style={s.section}>
            <View style={s.labelRow}>
              <Text style={s.label}>Subtext (optional)</Text>
              <Text style={s.counter}>{subText.length}/{FAN_CARD_SUB_MAX}</Text>
            </View>
            <TextInput
              style={s.input}
              value={subText}
              onChangeText={setSubText}
              placeholder={`e.g. "${FAN_CARD_DEFAULT_SUB}" or "among 4% of listeners"`}
              placeholderTextColor={C.textMuted}
              maxLength={FAN_CARD_SUB_MAX}
              returnKeyType="done"
            />
            <Text style={s.hint}>Leave either blank and we'll use a generic default — this is just for fun.</Text>
          </View>
        </ScrollView>

        <View style={s.footer}>
          <TouchableOpacity
            style={[s.shareBtn, (!imageSource || sharing) && s.shareBtnDisabled]}
            onPress={handleShare}
            activeOpacity={0.85}
            disabled={!imageSource || sharing}
          >
            <Ionicons name="share-outline" size={17} color={imageSource ? C.bg : C.textMuted} />
            <Text style={[s.shareBtnText, !imageSource && { color: C.textMuted }]}>
              {sharing ? 'Preparing…' : 'Share your card'}
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

  intro: { fontSize: 13, color: C.textSecondary, lineHeight: 18, textAlign: 'center', paddingHorizontal: 32, marginTop: 6 },

  previewWrap: { marginTop: 20, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 10 },

  modeToggle: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
  },
  modeSeg: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: R.full,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: C.border,
  },
  modeSegActive: { backgroundColor: C.cyan, borderColor: C.cyan },
  modeSegText: { fontSize: 13, fontWeight: '600', color: C.textPrimary },
  modeSegTextActive: { color: C.bg },

  artistPicker: { width: '100%', marginTop: 4 },
  artistPickerContent: { paddingHorizontal: 16, gap: 8 },
  artistChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: R.full,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: C.border,
  },
  artistChipSelected: { backgroundColor: C.cyan, borderColor: C.cyan },
  artistChipText: { fontSize: 13, fontWeight: '600', color: C.textPrimary },
  artistChipTextSel: { color: C.bg },

  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.cyan,
    borderRadius: R.full,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 18,
  },
  photoBtnText: { ...typeSubhead(14), color: C.bg },

  section: { width: '100%', paddingHorizontal: 16, marginTop: 22 },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  label: { ...typeHeadline(15), color: C.textPrimary },
  counter: { fontSize: 11, color: C.textMuted },
  input: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.md,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: C.textPrimary,
  },
  hint: { fontSize: 12, color: C.textMuted, marginTop: 8, lineHeight: 16 },

  footer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
    backgroundColor: C.bg,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.cyan,
    borderRadius: R.full,
    paddingVertical: 15,
  },
  shareBtnDisabled: { backgroundColor: C.elevated },
  shareBtnText: { ...typeSubhead(15), color: C.bg },
})
