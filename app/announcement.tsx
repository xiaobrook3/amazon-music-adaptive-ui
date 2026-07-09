import { useEffect, useState } from 'react'
import { ScrollView, View, TouchableOpacity, StyleSheet, Image, Share } from 'react-native'
import { Text } from '../src/components/AppText'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { announcements, artists } from '../src/data/mockData'
import { playerIconAssets } from '../src/data/assetMap'
import { C, R, typeHeadline, typeSubhead } from '../src/theme'

export default function AnnouncementScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id?: string }>()
  const ann = announcements.find(a => a.id === id) ?? announcements[0]
  const artist = artists.find(a => a.id === ann.artistId)
  const [saved, setSaved] = useState(false)
  const [typedText, setTypedText] = useState('')
  const [typing, setTyping] = useState(true)

  useEffect(() => {
    const fullText = ann.headline
    let i = 0
    setTypedText('')
    setTyping(true)
    const interval = setInterval(() => {
      i++
      setTypedText(fullText.slice(0, i))
      if (i >= fullText.length) {
        clearInterval(interval)
        setTyping(false)
      }
    }, 50)
    return () => clearInterval(interval)
  }, [ann.headline])

  if (!artist) return null

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={s.navBtn}>
          <Ionicons name="chevron-back" size={22} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={s.topEyebrow}>ARTIST NEWS</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={s.hero}>
          <Text style={s.artistName}>{artist.name}</Text>
          <Text style={s.headline}>
            {typedText}
            {typing && <Text style={s.cursor}>|</Text>}
          </Text>
          <Text style={s.body}>{ann.body}</Text>
        </View>

        {ann.dates && ann.dates.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Tour dates</Text>
            {ann.dates.map(date => (
              <View key={date} style={s.dateRow}>
                <Ionicons name="calendar-outline" size={16} color={C.cyanBright} />
                <Text style={s.dateText}>{date}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={s.actions}>
          <TouchableOpacity
            style={s.primaryBtn}
            onPress={() => router.push(`/artist/${artist.id}`)}
          >
            <Text style={s.primaryBtnText}>{ann.ctaLabel}</Text>
          </TouchableOpacity>
          <View style={s.secondaryActions}>
            <TouchableOpacity onPress={() => setSaved(!saved)} style={s.secondaryBtn}>
              <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={20} color={saved ? C.cyanBright : C.textMuted} />
              <Text style={s.secondaryBtnText}>{saved ? 'Saved' : 'Save'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.secondaryBtn}
              accessibilityLabel="Share"
              onPress={() => Share.share({ message: `${ann.headline} — ${ann.body}` }).catch(() => {})}
            >
              <Image source={playerIconAssets.share} style={s.shareIcon} resizeMode="contain" />
              <Text style={s.secondaryBtnText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  topBar:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  navBtn:       { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  topEyebrow:   { fontSize: 11, fontWeight: '700', color: C.cyanBright, letterSpacing: 1.5 },
  hero:         { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 },
  artistName:   { fontSize: 13, color: C.textSecondary, fontWeight: '600', marginBottom: 8 },
  headline:     { ...typeHeadline(26), color: C.textPrimary, marginBottom: 12 },
  cursor:       { color: C.cyanBright },
  body:         { fontSize: 15, color: C.textSecondary, lineHeight: 22 },
  section:      { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { ...typeHeadline(20), color: C.textPrimary, marginBottom: 12 },
  dateRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  dateText:     { fontSize: 14, color: C.textPrimary },
  actions:      { paddingHorizontal: 20, gap: 16 },
  primaryBtn:   { paddingVertical: 14, borderRadius: R.md, alignItems: 'center', backgroundColor: C.cyan },
  primaryBtnText: { ...typeSubhead(15), color: C.textPrimary },
  secondaryActions: { flexDirection: 'row', justifyContent: 'center', gap: 32 },
  secondaryBtn: { alignItems: 'center', gap: 4 },
  shareIcon:    { width: 20, height: 20, opacity: 0.55 },
  secondaryBtnText: { fontSize: 12, color: C.textSecondary },
})
