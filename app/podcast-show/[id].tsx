import { useMemo, useState } from 'react'
import {
  ScrollView,
  View,
  TouchableOpacity,
  StyleSheet,
  Share,
  ImageBackground,
} from 'react-native'
import { AppImage as Image } from '../../src/components/AppImage'
import { Text } from '../../src/components/AppText'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { podcasts } from '../../src/data/mockData'
import { albumArtAssets } from '../../src/data/assetMap'
import { findPodcast, podcastEpisode, droppedLabel } from '../../src/data/podcastEpisodes'
import { EdgeFadeRow } from '../../src/components/EdgeFadeRow'
import StandaloneTabBar from '../../src/components/StandaloneTabBar'
import { C, R, typeHeadline } from '../../src/theme'
import { shareText } from '../../src/utils/share'

const EPISODE_TOPICS = [
  'The full story behind the biggest moments this week',
  'A deep dive into everything you might have missed',
  'Our longest conversation yet, completely unpacked',
  'Everything that happened this era, explained in detail',
  'The complete breakdown, from the very start to right now',
  'Unpacking the news, the drama, and what comes next',
]

function hash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

function EpisodeCard({
  title,
  meta,
  onPress,
  featured = false,
}: {
  title: string
  meta: string
  onPress: () => void
  featured?: boolean
}) {
  return (
    <TouchableOpacity
      style={[s.episodeCard, featured && s.episodeCardFeatured]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={s.episodePlayIcon}>
        <Ionicons name="play" size={featured ? 18 : 14} color={featured ? C.bg : C.cyan} />
      </View>
      <View style={s.episodeCardBody}>
        {featured ? <Text style={s.episodeEyebrow}>LATEST EPISODE</Text> : null}
        <Text style={[s.episodeTitle, featured && s.episodeTitleFeatured]} numberOfLines={2}>
          {title}
        </Text>
        <Text style={s.episodeMeta}>{meta}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
    </TouchableOpacity>
  )
}

export default function PodcastShowScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const pod = findPodcast(id)
  const ep = podcastEpisode(pod)
  const art = pod.coverArtPath ? albumArtAssets[pod.coverArtPath] : null
  const tint = pod.coverColor

  const [following, setFollowing] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  const handleShare = () => {
    void shareText(`Check out "${pod.title}" by ${pod.host} on Amazon Music Podcasts`)
  }

  const similar = useMemo(
    () =>
      [
        ...podcasts.filter(p => p.id !== pod.id && p.category === pod.category),
        ...podcasts.filter(p => p.id !== pod.id && p.category !== pod.category),
      ].slice(0, 10),
    [pod],
  )

  const recentEpisodes = useMemo(() => {
    const count = Math.min(5, pod.episodeCount)
    const h = hash(pod.id)
    return Array.from({ length: count }, (_, i) => {
      const epNum = pod.episodeCount - i
      const topic = EPISODE_TOPICS[(h + i) % EPISODE_TOPICS.length]
      const daysAgo = ep.daysAgo + i * 7
      const durationMins = 30 + ((h + i * 3) % 46)
      const durationLabel = durationMins >= 60
        ? `${Math.floor(durationMins / 60)}h ${durationMins % 60}m`
        : `${durationMins}m`
      return {
        key: `${pod.id}-${epNum}`,
        title: `Ep. ${epNum} · ${topic}`,
        meta: `${droppedLabel(daysAgo)} · ${durationLabel}`,
      }
    })
  }, [pod, ep.daysAgo])

  const openPlayer = () => router.push(`/podcast-player/${pod.id}` as any)

  return (
    <View style={s.screen}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Hero — full-width cover with gradient overlay */}
        <View style={s.heroWrap}>
          <ImageBackground
            source={art ?? undefined}
            style={[s.heroBg, !art && { backgroundColor: tint }]}
            resizeMode="cover"
          >
            <LinearGradient
              colors={[
                'rgba(0,0,0,0.35)',
                'rgba(0,0,0,0.08)',
                'transparent',
                'rgba(10,10,10,0.35)',
                'rgba(10,10,10,0.72)',
                C.bg,
              ]}
              locations={[0, 0.1, 0.35, 0.55, 0.78, 1]}
              style={StyleSheet.absoluteFill}
            />

            <View style={[s.heroNav, { paddingTop: insets.top + 6 }]}>
              <TouchableOpacity onPress={() => router.back()} style={s.iconBtn} hitSlop={8}>
                <Ionicons name="chevron-back" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={s.iconBtn} accessibilityLabel="Share" onPress={handleShare} hitSlop={8}>
                <Ionicons name="share-outline" size={22} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={s.heroBottom}>
              <Text style={s.heroEyebrow}>PODCAST · {pod.category.toUpperCase()}</Text>
              <Text style={s.heroTitle} numberOfLines={3}>{pod.title}</Text>
              <Text style={s.heroHost}>by {pod.host}</Text>
              <Text style={s.heroMeta}>
                {pod.episodeCount} episodes · {droppedLabel(ep.daysAgo)} · {ep.durationLabel}
              </Text>

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
                      color={following ? C.bg : '#fff'}
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
                      color={downloaded ? C.bg : '#fff'}
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
            </View>
          </ImageBackground>
        </View>

        {/* Latest episode */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Now playing next</Text>
          <EpisodeCard
            title={ep.title}
            meta={`${droppedLabel(ep.daysAgo)} · ${ep.durationLabel}`}
            onPress={openPlayer}
            featured
          />
        </View>

        {/* Episodes */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>Episodes</Text>
            <Text style={s.sectionCount}>{pod.episodeCount}</Text>
          </View>
          <View style={s.episodeList}>
            {recentEpisodes.map(item => (
              <EpisodeCard
                key={item.key}
                title={item.title}
                meta={item.meta}
                onPress={openPlayer}
              />
            ))}
          </View>
        </View>

        {/* About */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>About</Text>
          <View style={s.aboutCard}>
            <Text style={s.about}>{ep.about}</Text>
          </View>
        </View>

        {/* You might also like */}
        {similar.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>You might also like</Text>
            <EdgeFadeRow>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled
                contentContainerStyle={s.rail}
              >
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
            </EdgeFadeRow>
          </View>
        )}
      </ScrollView>

      <StandaloneTabBar />
    </View>
  )
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },

  heroWrap: { marginBottom: 4 },
  heroBg: { width: '100%', height: 380 },
  heroNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  heroBottom: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 22,
  },
  heroEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: C.cyan,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  heroTitle: { ...typeHeadline(28), color: '#fff', lineHeight: 34 },
  heroHost: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 6 },
  heroMeta: { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 4 },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  pillGroup: { flexDirection: 'row', gap: 8, flex: 1, flexWrap: 'wrap' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: R.full,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  pillActive: { backgroundColor: C.cyan, borderColor: C.cyan },
  pillText: { fontSize: 13, fontWeight: '600', color: '#fff' },
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

  section: { paddingHorizontal: 16, marginTop: 22 },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: { ...typeHeadline(18), color: C.textPrimary },
  sectionCount: { fontSize: 13, fontWeight: '600', color: C.textMuted },

  episodeList: { gap: 10 },
  episodeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.surface,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
  },
  episodeCardFeatured: {
    backgroundColor: '#161c23',
    borderColor: 'rgba(0, 217, 255, 0.25)',
  },
  episodePlayIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 217, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  episodeCardBody: { flex: 1 },
  episodeEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: C.cyan,
    letterSpacing: 1,
    marginBottom: 4,
  },
  episodeTitle: { fontSize: 14, fontWeight: '600', color: C.textPrimary, lineHeight: 19 },
  episodeTitleFeatured: { fontSize: 15 },
  episodeMeta: { fontSize: 12, color: C.textMuted, marginTop: 3 },

  aboutCard: {
    backgroundColor: C.surface,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
  },
  about: { fontSize: 14, color: C.textSecondary, lineHeight: 21 },

  rail: { gap: 14, paddingRight: 8 },
  simCard: { width: 140 },
  simArt: { width: 140, height: 140, borderRadius: R.sm, overflow: 'hidden', marginBottom: 8 },
  simTitle: { fontSize: 13, fontWeight: '600', color: C.textPrimary, lineHeight: 17 },
  simHost: { fontSize: 12, color: C.textSecondary, marginTop: 2 },
})
