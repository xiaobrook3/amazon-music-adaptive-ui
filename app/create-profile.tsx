import { useState } from 'react'
import {
  ScrollView,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { Text } from '../src/components/AppText'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { artists, songs } from '../src/data/mockData'
import { useProfiles } from '../src/context/ProfilesContext'
import { C, R, typeHeadline, typeSubhead, MOOD_EMOJI } from '../src/theme'

// Selectable pools, derived once from the catalog.
const ALL_ARTISTS = [...artists].sort((a, b) => a.name.localeCompare(b.name))
const ALL_GENRES = [...new Set(artists.map(a => a.genre))].sort()
const ALL_MOODS = [...new Set(songs.map(s => String(s.mood)))]

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

  const [name, setName] = useState('')
  const [artistSel, setArtistSel] = useState<Set<string>>(new Set())
  const [genreSel, setGenreSel] = useState<Set<string>>(new Set())
  const [moodSel, setMoodSel] = useState<Set<string>>(new Set())

  const toggle = (setFn: React.Dispatch<React.SetStateAction<Set<string>>>, value: string) =>
    setFn(prev => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })

  const totalPicks = artistSel.size + genreSel.size + moodSel.size
  const canCreate = name.trim().length > 0 && totalPicks > 0

  const handleCreate = () => {
    if (!canCreate) return
    createCustomProfile({
      name: name.trim(),
      artistIds: [...artistSel],
      genres: [...genreSel],
      moods: [...moodSel],
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

          {/* Selection intro */}
          <View style={s.section}>
            <Text style={s.superLabel}>What are you a superfan of?</Text>
            <Text style={s.superSub}>
              Pick any mix of artists, genres, and moods — your home is built from these.
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
  superLabel: { ...typeHeadline(20), color: C.textPrimary },
  superSub: { fontSize: 13, color: C.textSecondary, marginTop: 6, lineHeight: 18 },
  groupTitle: { fontSize: 13, fontWeight: '700', color: C.textMuted, letterSpacing: 0.6, marginBottom: 12, textTransform: 'uppercase' },

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
