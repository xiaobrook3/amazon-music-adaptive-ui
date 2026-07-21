import { useState } from 'react'
import { ScrollView, View, TouchableOpacity, StyleSheet, Share } from 'react-native'
import { AppImage as Image } from '../../src/components/AppImage'
import { Text } from '../../src/components/AppText'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import {
  findAudiobook,
  audiobooks,
  formatAudiobookDuration,
  formatChapterDuration,
  formatReviewCount,
  type AudiobookChapter,
} from '../../src/data/audibleBooks'
import { albumArtAssets } from '../../src/data/assetMap'
import StandaloneTabBar from '../../src/components/StandaloneTabBar'
import { C, R, typeHeadline } from '../../src/theme'

function ChapterRow({ chapter, index }: { chapter: AudiobookChapter; index: number }) {
  return (
    <View style={s.chapterRow}>
      <View style={s.chapterIndex}>
        <Text style={s.chapterIndexText}>{index + 1}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.chapterTitle} numberOfLines={2}>{chapter.title}</Text>
        <View style={s.chapterMetaRow}>
          <Text style={s.chapterDuration}>{formatChapterDuration(chapter.durationMinutes)}</Text>
          {chapter.isSample && (
            <View style={s.sampleBadge}>
              <Text style={s.sampleBadgeText}>Sample</Text>
            </View>
          )}
        </View>
      </View>
      <TouchableOpacity style={s.chapterPlayBtn} activeOpacity={0.8}>
        <Ionicons name="play" size={14} color={C.cyan} style={{ marginLeft: 2 }} />
      </TouchableOpacity>
    </View>
  )
}

export default function AudibleBookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const book = findAudiobook(id) ?? audiobooks[0]
  const art = book.coverArtPath ? albumArtAssets[book.coverArtPath] : null
  const tint = book.coverColor

  const [inLibrary, setInLibrary] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  const handleShare = () => {
    Share.share({ message: `Check out "${book.title}" by ${book.author} on Audible` }).catch(() => {})
  }

  const similar = [
    ...audiobooks.filter(b => b.id !== book.id && b.category === book.category),
    ...audiobooks.filter(b => b.id !== book.id && b.category !== book.category),
  ].slice(0, 10)

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={s.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={s.topTitle}>Audible</Text>
        <TouchableOpacity style={s.iconBtn} accessibilityLabel="Share" onPress={handleShare}>
          <Ionicons name="share-outline" size={20} color={C.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <LinearGradient
          colors={[tint + '66', tint + '22', C.bg]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={s.hero}
        >
          <View style={s.coverShadow}>
            {art ? (
              <Image source={art} style={s.cover} resizeMode="cover" />
            ) : (
              <View style={[s.cover, { backgroundColor: tint, alignItems: 'center', justifyContent: 'center' }]}>
                <Ionicons name="book" size={54} color="rgba(255,255,255,0.35)" />
              </View>
            )}
          </View>

          <Text style={s.title} numberOfLines={3}>{book.title}</Text>
          <Text style={s.author}>by {book.author}</Text>
          <Text style={s.meta}>
            Narrated by {book.narrator} · {formatAudiobookDuration(book)} · {book.category}
          </Text>
          <View style={s.ratingRow}>
            <Ionicons name="star" size={13} color="#f5c842" />
            <Text style={s.ratingText}>{book.rating.toFixed(1)}</Text>
            <Text style={s.reviewText}>({formatReviewCount(book.reviewCount)} ratings)</Text>
          </View>

          <View style={s.actionRow}>
            <View style={s.pillGroup}>
              <TouchableOpacity
                style={[s.pill, inLibrary && s.pillActive]}
                activeOpacity={0.8}
                onPress={() => setInLibrary(v => !v)}
              >
                <Ionicons
                  name={inLibrary ? 'checkmark' : 'add'}
                  size={15}
                  color={inLibrary ? C.bg : C.textPrimary}
                />
                <Text style={[s.pillText, inLibrary && s.pillTextActive]}>
                  {inLibrary ? 'In library' : 'Add to library'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.pill, downloaded && s.pillActive]}
                activeOpacity={0.8}
                onPress={() => setDownloaded(v => !v)}
              >
                <Ionicons
                  name={downloaded ? 'checkmark-circle' : 'download-outline'}
                  size={16}
                  color={downloaded ? C.bg : C.textPrimary}
                />
                <Text style={[s.pillText, downloaded && s.pillTextActive]}>
                  {downloaded ? 'Downloaded' : 'Download'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={s.playBtn} activeOpacity={0.85}>
              <Ionicons name="play" size={26} color={C.bg} style={{ marginLeft: 3 }} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={s.section}>
          <Text style={s.sectionTitle}>About this book</Text>
          <Text style={s.about}>{book.description}</Text>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Chapters</Text>
          <View style={s.chapterList}>
            {book.chapters.map((chapter, i) => (
              <ChapterRow key={chapter.id} chapter={chapter} index={i} />
            ))}
          </View>
        </View>

        {similar.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>More like this</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail}>
              {similar.map(b => {
                const bArt = b.coverArtPath ? albumArtAssets[b.coverArtPath] : null
                return (
                  <TouchableOpacity
                    key={b.id}
                    style={s.simCard}
                    activeOpacity={0.85}
                    onPress={() => router.push(`/audible-book/${b.id}` as any)}
                  >
                    {bArt ? (
                      <Image source={bArt} style={s.simArt} resizeMode="cover" />
                    ) : (
                      <View style={[s.simArt, { backgroundColor: b.coverColor, alignItems: 'center', justifyContent: 'center' }]}>
                        <Ionicons name="book" size={26} color="rgba(255,255,255,0.3)" />
                      </View>
                    )}
                    <Text style={s.simTitle} numberOfLines={2}>{b.title}</Text>
                    <Text style={s.simAuthor} numberOfLines={1}>{b.author}</Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      <StandaloneTabBar />
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

  hero: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 12, paddingBottom: 26 },
  coverShadow: {
    borderRadius: R.md,
    shadowColor: '#000',
    shadowOpacity: 0.55,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 14,
    marginBottom: 20,
  },
  cover: { width: 190, height: 190, borderRadius: R.md, overflow: 'hidden' },
  title: { ...typeHeadline(24), color: C.textPrimary, textAlign: 'center' },
  author: { fontSize: 14, color: C.textSecondary, marginTop: 8 },
  meta: { fontSize: 12, color: C.textMuted, marginTop: 6, textAlign: 'center', lineHeight: 17 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  ratingText: { fontSize: 13, fontWeight: '700', color: C.textPrimary },
  reviewText: { fontSize: 12, color: C.textMuted },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    marginTop: 22,
  },
  pillGroup: { flexDirection: 'row', gap: 8, flex: 1, flexWrap: 'wrap' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: R.full,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: C.border,
  },
  pillActive: { backgroundColor: C.cyan, borderColor: C.cyan },
  pillText: { fontSize: 13, fontWeight: '600', color: C.textPrimary },
  pillTextActive: { color: C.bg },
  playBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.cyan,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    shadowColor: C.cyan,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },

  section: { paddingHorizontal: 16, marginTop: 18 },
  sectionTitle: { ...typeHeadline(18), color: C.textPrimary, marginBottom: 10 },
  about: { fontSize: 14, color: C.textSecondary, lineHeight: 21 },

  chapterList: { gap: 2 },
  chapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
  },
  chapterIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterIndexText: { fontSize: 12, fontWeight: '700', color: C.textMuted },
  chapterTitle: { fontSize: 14, fontWeight: '600', color: C.textPrimary, lineHeight: 19 },
  chapterMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 },
  chapterDuration: { fontSize: 12, color: C.textMuted },
  sampleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(37,209,218,0.15)',
  },
  sampleBadgeText: { fontSize: 10, fontWeight: '700', color: C.cyan },
  chapterPlayBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rail: { gap: 14, paddingRight: 8 },
  simCard: { width: 140 },
  simArt: { width: 140, height: 140, borderRadius: R.sm, overflow: 'hidden', marginBottom: 8 },
  simTitle: { fontSize: 13, fontWeight: '600', color: C.textPrimary, lineHeight: 17 },
  simAuthor: { fontSize: 12, color: C.textSecondary, marginTop: 2 },
})
