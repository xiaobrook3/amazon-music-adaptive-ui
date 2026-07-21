import { useState, useMemo, type ReactNode } from 'react'
import {
  ScrollView,
  View,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from 'react-native'
import { Text } from '../src/components/AppText'
import { AppImage as Image } from '../src/components/AppImage'
import { EdgeFadeRow } from '../src/components/EdgeFadeRow'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { podcasts, type Podcast } from '../src/data/mockData'
import { albumArtAssets } from '../src/data/assetMap'
import { C, R, typeHeadline } from '../src/theme'

const FEATURED = podcasts.slice(0, 6)
const CONTINUE = podcasts.slice(2, 5)
const CATEGORIES = ['All', 'Following', 'Music', 'Charts', 'Comedy', 'News']

function PlayOverlay({ size = 28 }: { size?: number }) {
  return (
    <View style={[p.playOverlay, { width: size, height: size, borderRadius: size / 2 }]}>
      <Ionicons name="play" size={size * 0.45} color="#fff" style={{ marginLeft: 1 }} />
    </View>
  )
}

function SectionRow({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <View style={p.section}>
      {title ? <Text style={p.sectionTitle}>{title}</Text> : null}
      {subtitle ? <Text style={p.sectionSubtitle}>{subtitle}</Text> : null}
      <EdgeFadeRow>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled
          contentContainerStyle={p.hRailContent}
        >
          {children}
        </ScrollView>
      </EdgeFadeRow>
    </View>
  )
}

function PodcastCard({ pod, onPress, wide = false }: { pod: Podcast; onPress?: () => void; wide?: boolean }) {
  const art = pod.coverArtPath ? albumArtAssets[pod.coverArtPath] : null
  return (
    <TouchableOpacity
      style={[p.podcastCard, wide && p.podcastCardWide]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[p.podcastArtWrap, wide && p.podcastArtWrapWide]}>
        {art ? (
          <Image source={art} style={[p.podcastArt, wide && p.podcastArtWide]} resizeMode="cover" />
        ) : (
          <View style={[p.podcastArt, wide && p.podcastArtWide, { backgroundColor: pod.coverColor }]}>
            <Ionicons name="mic" size={wide ? 36 : 28} color="rgba(255,255,255,0.25)" />
          </View>
        )}
        <View style={p.podcastPlayPos}>
          <PlayOverlay size={wide ? 30 : 26} />
        </View>
      </View>
      <Text style={p.podcastTitle} numberOfLines={2}>{pod.title}</Text>
      <Text style={p.podcastHost} numberOfLines={1}>{pod.host}</Text>
    </TouchableOpacity>
  )
}

export default function PodcastScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [activeCategory, setActiveCategory] = useState('All')

  const hero = useMemo(() => podcasts[Math.floor(Math.random() * podcasts.length)], [])
  const heroArt = hero.coverArtPath ? albumArtAssets[hero.coverArtPath] : null

  const openShow = (pid: string) => router.push(`/podcast-show/${pid}` as any)
  const openPlayer = (pid: string) => router.push(`/podcast-player/${pid}` as any)

  // Category chips filter the discover rails; 'Following' approximates the
  // shows already surfaced as "yours" on the Resume tab.
  const filteredPods = useMemo(() => {
    if (activeCategory === 'All') return podcasts
    if (activeCategory === 'Following') return [...FEATURED, ...CONTINUE]
    return podcasts.filter(pod => pod.category === activeCategory)
  }, [activeCategory])

  const discoverContent = (
    <>
      <View style={p.heroWrap}>
        <ImageBackground
          source={heroArt ?? undefined}
          style={[p.heroBg, !heroArt && { backgroundColor: hero.coverColor }]}
          resizeMode="cover"
        >
          <LinearGradient
            colors={[
              'rgba(0,0,0,0.18)',
              'rgba(0,0,0,0.10)',
              'transparent',
              'rgba(10,10,10,0.18)',
              'rgba(10,10,10,0.42)',
              'rgba(10,10,10,0.68)',
              C.bg,
            ]}
            locations={[0, 0.08, 0.32, 0.52, 0.72, 0.88, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={p.heroInner}>
            <View style={p.heroContent}>
              <View style={{ flex: 1 }}>
                <Text style={p.heroEyebrow}>PODCAST</Text>
                <Text style={p.heroTitle}>Daily Listen</Text>
                <Text style={p.heroSub} numberOfLines={2}>
                  Featuring {hero.title} with {hero.host}
                </Text>
              </View>
              <TouchableOpacity style={p.heroPlayBtn} activeOpacity={0.85} onPress={() => openPlayer(hero.id)}>
                <Ionicons name="play" size={22} color="#000" style={{ marginLeft: 2 }} />
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </View>

      <EdgeFadeRow>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled
          contentContainerStyle={p.chipRow}
          style={{ marginBottom: 20 }}
        >
          {CATEGORIES.map(chip => (
            <TouchableOpacity
              key={chip}
              style={[p.chip, activeCategory === chip && p.chipActive]}
              onPress={() => setActiveCategory(chip)}
              activeOpacity={0.8}
            >
              <Text style={[p.chipText, activeCategory === chip && p.chipTextActive]}>{chip}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </EdgeFadeRow>

      <SectionRow title="Featured">
        {(activeCategory === 'All' ? FEATURED : filteredPods.slice(0, 6)).map(pod => (
          <PodcastCard key={pod.id} pod={pod} wide onPress={() => openShow(pod.id)} />
        ))}
      </SectionRow>

      <SectionRow title="New this week">
        {[...filteredPods].reverse().slice(0, 10).map(pod => (
          <PodcastCard key={`new-${pod.id}`} pod={pod} onPress={() => openShow(pod.id)} />
        ))}
      </SectionRow>

      <SectionRow title="Popular in Music">
        {podcasts.filter(pod => pod.category === 'Music').map(pod => (
          <PodcastCard key={`music-${pod.id}`} pod={pod} onPress={() => openShow(pod.id)} />
        ))}
      </SectionRow>

      <View style={p.section}>
        <Text style={p.sectionTitle}>Browse all</Text>
        <View style={p.grid}>
          {filteredPods.map(pod => {
            const art = pod.coverArtPath ? albumArtAssets[pod.coverArtPath] : null
            return (
              <TouchableOpacity key={pod.id} style={p.gridCard} activeOpacity={0.8} onPress={() => openShow(pod.id)}>
                <View style={[p.gridArt, { backgroundColor: pod.coverColor }]}>
                  {art && <Image source={art} style={StyleSheet.absoluteFillObject} resizeMode="cover" />}
                </View>
                <Text style={p.gridTitle} numberOfLines={2}>{pod.title}</Text>
                <Text style={p.gridHost} numberOfLines={1}>{pod.host}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>
    </>
  )

  return (
    <View style={p.screen}>
      <LinearGradient
        colors={['rgba(14,28,22,0.96)', 'rgba(12,18,14,0.80)', C.bg]}
        locations={[0, 0.28, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={[p.header, { paddingTop: insets.top + 6 }]}>
        <TouchableOpacity
          style={p.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={p.headerTitle}>Explore Podcast</Text>
        <View style={p.headerSpacer} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {discoverContent}
      </ScrollView>
    </View>
  )
}

const p = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typeHeadline(20),
    color: C.textPrimary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerSpacer: { width: 40 },

  heroWrap: { marginBottom: 20 },
  heroBg: { width: '100%', height: 320 },
  heroInner: { flex: 1, justifyContent: 'flex-end' },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 16,
    paddingHorizontal: 16,
    paddingBottom: 22,
  },
  heroEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: C.cyan,
    letterSpacing: 2,
    marginTop: 8,
    marginBottom: 12,
  },
  heroTitle: { ...typeHeadline(38), color: '#fff' },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.72)', marginTop: 6, lineHeight: 18 },
  heroPlayBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.cyan,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.cyan,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },

  section: { marginBottom: 28 },
  sectionTitle: {
    ...typeHeadline(21),
    color: C.textPrimary,
    marginBottom: 14,
    paddingHorizontal: 16,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: C.textSecondary,
    paddingHorizontal: 16,
    marginTop: 0,
    marginBottom: 14,
  },

  hRailContent: { paddingHorizontal: 16, gap: 12 },

  chipRow: { paddingHorizontal: 16, gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: R.full,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  chipActive: { backgroundColor: C.cyanBright + '22', borderColor: C.cyanBright },
  chipText: { fontSize: 13, fontWeight: '600', color: C.textMuted },
  chipTextActive: { color: C.cyanBright },

  podcastCard: { width: 140 },
  podcastCardWide: { width: 200 },
  podcastArtWrap: { position: 'relative', marginBottom: 8 },
  podcastArtWrapWide: {},
  podcastArt: {
    width: 140,
    height: 140,
    borderRadius: R.sm,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  podcastArtWide: { width: 200, height: 200 },
  podcastPlayPos: { position: 'absolute', bottom: 8, left: 8 },
  podcastTitle: { fontSize: 14, fontWeight: '600', color: C.textPrimary, marginBottom: 2, lineHeight: 18 },
  podcastHost: { fontSize: 12, color: C.textSecondary },

  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12 },
  gridCard: { width: '47%', gap: 4 },
  gridArt: { width: '100%', aspectRatio: 1, borderRadius: R.md, overflow: 'hidden' },
  gridTitle: { fontSize: 13, fontWeight: '600', color: C.textPrimary, lineHeight: 17 },
  gridHost: { fontSize: 11, color: C.textSecondary },

  playOverlay: {
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
