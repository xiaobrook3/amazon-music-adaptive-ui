import { useState } from 'react'
import { ScrollView, View, TouchableOpacity, StyleSheet, Share } from 'react-native'
import { AppImage as Image } from '../../src/components/AppImage'
import { Text } from '../../src/components/AppText'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { podcasts } from '../../src/data/mockData'
import { albumArtAssets } from '../../src/data/assetMap'
import { findPodcast, podcastEpisode, droppedLabel } from '../../src/data/podcastEpisodes'
import StandaloneTabBar from '../../src/components/StandaloneTabBar'
import { C, R, typeHeadline, typeSubhead } from '../../src/theme'

export default function PodcastShowScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const pod = findPodcast(id)
  const ep = podcastEpisode(pod)
  const art = pod.coverArtPath ? albumArtAssets[pod.coverArtPath] : null
  const tint = pod.coverColor

  const [following, setFollowing] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  const handleShare = () => {
    Share.share({ message: `Check out "${pod.title}" by ${pod.host} on Amazon Music Podcasts` }).catch(() => {})
  }

  // "You might also like" — same category first, then the rest; capped at one row.
  const similar = [
    ...podcasts.filter(p => p.id !== pod.id && p.category === pod.category),
    ...podcasts.filter(p => p.id !== pod.id && p.category !== pod.category),
  ].slice(0, 10)

  const openPlayer = () => router.push(`/podcast-player/${pod.id}` as any)

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={s.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={s.topTitle}>Podcast</Text>
        <TouchableOpacity style={s.iconBtn} accessibilityLabel="Share" onPress={handleShare}>
          <Ionicons name="share-outline" size={20} color={C.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Hero — cover centered, then title / by / meta */}
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
                <Ionicons name="mic" size={54} color="rgba(255,255,255,0.35)" />
              </View>
            )}
          </View>

          <Text style={s.title} numberOfLines={3}>{pod.title}</Text>
          <Text style={s.host}>by {pod.host}</Text>
          <Text style={s.meta}>
            {droppedLabel(ep.daysAgo)} · {ep.durationLabel} · {pod.category}
          </Text>

          {/* Pills + blue AM play button */}
          <View style={s.actionRow}>
            <View style={s.pillGroup}>
              <TouchableOpacity
                style={[s.pill, following && s.pillActive]}
                activeOpacity={0.8}
                onPress={() => setFollowing(v => !v)}
              >
                <Ionicons
                  name={following ? 'checkmark' : 'add'}
                  size={15}
                  color={following ? C.bg : C.textPrimary}
                />
                <Text style={[s.pillText, following && s.pillTextActive]}>
                  {following ? 'Following' : 'Follow'}
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

            <TouchableOpacity style={s.playBtn} activeOpacity={0.85} onPress={openPlayer}>
              <Ionicons name="play" size={26} color={C.bg} style={{ marginLeft: 3 }} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* About */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>About</Text>
          <Text style={s.episodeTitle}>{ep.title}</Text>
          <Text style={s.about}>{ep.about}</Text>
        </View>

        {/* You might also like — a single horizontal row */}
        {similar.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>You might also like</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail}>
              {similar.map(p => {
                const pArt = p.coverArtPath ? albumArtAssets[p.coverArtPath] : null
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={s.simCard}
                    activeOpacity={0.85}
                    onPress={() => router.push(`/podcast-show/${p.id}` as any)}
                  >
                    {pArt ? (
                      <Image source={pArt} style={s.simArt} resizeMode="cover" />
                    ) : (
                      <View style={[s.simArt, { backgroundColor: p.coverColor, alignItems: 'center', justifyContent: 'center' }]}>
                        <Ionicons name="mic" size={26} color="rgba(255,255,255,0.3)" />
                      </View>
                    )}
                    <Text style={s.simTitle} numberOfLines={2}>{p.title}</Text>
                    <Text style={s.simHost} numberOfLines={1}>{p.host}</Text>
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
  host: { fontSize: 14, color: C.textSecondary, marginTop: 8 },
  meta: { fontSize: 12, color: C.textMuted, marginTop: 6 },

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
  episodeTitle: { fontSize: 14, fontWeight: '700', color: C.textPrimary, marginBottom: 6, lineHeight: 19 },
  about: { fontSize: 14, color: C.textSecondary, lineHeight: 21 },

  rail: { gap: 14, paddingRight: 8 },
  simCard: { width: 140 },
  simArt: { width: 140, height: 140, borderRadius: R.sm, overflow: 'hidden', marginBottom: 8 },
  simTitle: { fontSize: 13, fontWeight: '600', color: C.textPrimary, lineHeight: 17 },
  simHost: { fontSize: 12, color: C.textSecondary, marginTop: 2 },
})
