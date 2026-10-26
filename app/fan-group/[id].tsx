import { useMemo, useState } from 'react'
import { ScrollView, View, TouchableOpacity, StyleSheet, Share, Dimensions } from 'react-native'
import { AppImage as Image } from '../../src/components/AppImage'
import { Text } from '../../src/components/AppText'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import {
  findFanGroup,
  getFanGroupPosts,
  getFanGroupArtistName,
  resolveFanGroupArt,
  resolveFanGroupArtistId,
  formatMemberCount,
  resolvePostArt,
  type FanGroupPost,
} from '../../src/data/fanGroupContent'
import { songs } from '../../src/data/mockData'
import { albumArtAssets, resolveArtistAvatar } from '../../src/data/assetMap'
import { getArtistAbout } from '../../src/data/artistAbout'
import { usePlaybackState } from '../../src/hooks/usePlaybackState'
import { useAdaptiveUI } from '../../src/context/AdaptiveUIContext'
import { useAdaptiveMenu } from '../../src/components/AdaptiveContextMenu'
import { useHannahJourney } from '../../src/context/HannahJourneyContext'
import StandaloneTabBar from '../../src/components/StandaloneTabBar'
import { C, R, FONT_FAMILY, typeHeadline } from '../../src/theme'

// Local palette for this screen only — a blue-charcoal fandom header distinct
// from the app's neutral near-black surfaces, fading into a near-black feed.
const HEADER_BG = '#1D333D'
const HEADER_BG_2 = '#223843'
const FEED_BG = '#05090D'

const HERO_H = Math.round(Dimensions.get('window').height * 0.43)
const MEMBER_COLORS = [C.pink, C.gold, C.cyan]
const REACTION_EMOJI = ['🤘', '❤️', '🔥', '😭', '🎉']
const AVATAR_GRADIENTS: readonly (readonly [string, string])[] = [
  ['#f472b6', '#7c3aed'],
  ['#25D1DA', '#1BA8B0'],
  ['#fbbf24', '#f59e0b'],
  ['#60a5fa', '#3b82f6'],
]
const TABS = ['Posts', 'Music', 'About'] as const
type Tab = (typeof TABS)[number]

function hashStr(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}

function parseCount(v: string): number {
  const n = parseFloat(v)
  if (Number.isNaN(n)) return 0
  return v.toLowerCase().includes('k') ? n * 1000 : n
}

function PostCard({ post, index }: { post: FanGroupPost; index: number }) {
  const art = resolvePostArt(post.artKey)
  const gradient = AVATAR_GRADIENTS[hashStr(post.handle) % AVATAR_GRADIENTS.length]
  const emoji = post.reactionEmoji ?? REACTION_EMOJI[index % REACTION_EMOJI.length]
  return (
    <View style={s.postCard}>
      <View style={s.postHeaderRow}>
        <LinearGradient colors={gradient} style={s.postAvatar}>
          <Ionicons name="person" size={16} color="#fff" />
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text style={s.postHandle}>{post.handle}</Text>
          <Text style={s.postTime}>{post.time}</Text>
        </View>
        <Ionicons name="ellipsis-horizontal" size={16} color="rgba(255,255,255,0.7)" />
      </View>

      <Text style={s.postBody}>{post.body}</Text>

      {art ? <Image source={art} style={s.postImage} resizeMode="cover" /> : null}

      <View style={s.postFooter}>
        <View style={s.footerLeft}>
          <Ionicons name="chatbubble-outline" size={16} color="#a7aeb6" />
          <Text style={s.footerText}>{post.comments}</Text>
        </View>
        <View style={s.footerRight}>
          <View style={s.reactionPill}>
            <Text style={s.reactionEmoji}>{emoji}</Text>
            <Text style={s.reactionCount}>{post.likes}</Text>
          </View>
          <TouchableOpacity style={s.addReactionBtn} hitSlop={6} accessibilityLabel="Add reaction">
            <Ionicons name="add-circle-outline" size={20} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default function FanGroupScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { playSongAt } = usePlaybackState()
  const { showConfirmation } = useAdaptiveUI()
  const { open: openAdaptiveMenu } = useAdaptiveMenu()

  const group = findFanGroup(id) ?? findFanGroup('fg1')!
  const art = resolveFanGroupArt(group)
  const artistId = resolveFanGroupArtistId(group)
  const artistName = getFanGroupArtistName(group)
  const posts = getFanGroupPosts(group.id)
  const artistAvatar = artistId ? resolveArtistAvatar(artistId, undefined) : null
  const artistSongs = useMemo(
    () => (artistId ? songs.filter(sg => sg.artistId === artistId) : []),
    [artistId],
  )
  const aboutBlurb = artistId ? getArtistAbout(artistId)?.storyBody : null

  // The journey's groups share membership with Home's group cards (a super fan is
  // already a member of Olivia's); other groups keep this page's own toggle.
  const { isHannahJourney, isGroupJoined, setGroupJoined } = useHannahJourney()
  const journeyGroup = isHannahJourney && group.id.startsWith('fg-hj-')
  const [localJoined, setLocalJoined] = useState(false)
  const joined = journeyGroup ? isGroupJoined(group.id) : localJoined
  const toggleJoined = () =>
    journeyGroup ? setGroupJoined(group.id, !joined) : setLocalJoined(v => !v)
  const [tab, setTab] = useState<Tab>('Posts')
  const [sort, setSort] = useState<'Newest' | 'Top'>('Newest')

  const sortedPosts = useMemo(() => {
    if (sort === 'Newest') return posts
    return [...posts].sort((a, b) => parseCount(b.likes) - parseCount(a.likes))
  }, [posts, sort])

  const handleShare = () => {
    Share.share({ message: `Join "${group.name}" on Amazon Music` }).catch(() => {})
  }

  const play = (songId?: string) => {
    const target = songId ?? artistSongs[0]?.id
    if (!target) return
    playSongAt(target)
    router.push('/now-playing')
  }

  const openArtistMenu = () => {
    if (!artistId) return
    openAdaptiveMenu({ kind: 'artist', artistId, name: artistName ?? group.name })
  }

  return (
    <View style={s.screen}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* ── Hero ── */}
        <View style={[s.hero, { height: HERO_H }]}>
          {art ? (
            <Image source={art} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : (
            <View style={[StyleSheet.absoluteFill, s.heroFallback]}>
              <Ionicons name="people" size={64} color="rgba(255,255,255,0.2)" />
            </View>
          )}
          <LinearGradient
            colors={['transparent', 'rgba(17,30,38,0.55)', HEADER_BG_2]}
            locations={[0, 0.6, 1]}
            style={StyleSheet.absoluteFill}
          />

          <View style={[s.heroTopRow, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity onPress={() => router.back()} style={s.circleBtn} hitSlop={8} accessibilityLabel="Back">
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>
            <View style={s.heroTopRight}>
              <TouchableOpacity onPress={handleShare} style={s.circleBtn} hitSlop={8} accessibilityLabel="Share">
                <Ionicons name="share-outline" size={19} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={openArtistMenu} style={s.circleBtn} hitSlop={8} accessibilityLabel="More options">
                <Ionicons name="ellipsis-horizontal" size={19} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Group header panel ── */}
        <View style={s.panel}>
          <View style={s.titleRow}>
            <Text style={s.title} numberOfLines={2}>{group.name}</Text>
            <TouchableOpacity style={s.playBtn} activeOpacity={0.85} onPress={() => play()} accessibilityLabel="Play">
              <View style={s.playTriangle} />
            </TouchableOpacity>
          </View>

          <View style={s.metaRow}>
            <TouchableOpacity
              style={[s.joinPill, joined && s.joinPillActive]}
              activeOpacity={0.8}
              onPress={toggleJoined}
              accessibilityRole="button"
              accessibilityState={{ selected: joined }}
            >
              <Text style={[s.joinPillText, joined && s.joinPillTextActive]}>{joined ? 'Joined' : 'Join'}</Text>
            </TouchableOpacity>

            <View style={s.avatarCluster}>
              {MEMBER_COLORS.map((color, i) => (
                <View
                  key={i}
                  style={[s.memberAvatar, { backgroundColor: color, marginLeft: i === 0 ? 0 : -14, zIndex: MEMBER_COLORS.length - i }]}
                />
              ))}
            </View>

            <Text style={s.memberCount}>{formatMemberCount(group.memberCount)}</Text>
          </View>

          {/* ── Featured artist card ── */}
          {artistId && artistName ? (
            <TouchableOpacity
              style={s.featuredCard}
              activeOpacity={0.85}
              onPress={() => router.push(`/artist/${artistId}` as any)}
            >
              {artistAvatar ? (
                <Image source={artistAvatar} style={s.featuredAvatar} resizeMode="cover" />
              ) : (
                <View style={[s.featuredAvatar, s.featuredAvatarFallback]}>
                  <Ionicons name="person" size={26} color="rgba(255,255,255,0.3)" />
                </View>
              )}
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={s.featuredLabel}>FEATURED</Text>
                <Text style={s.featuredName} numberOfLines={1}>{artistName}</Text>
                <Text style={s.featuredSub}>Artist</Text>
              </View>
              <TouchableOpacity hitSlop={8} onPress={openArtistMenu} style={{ marginRight: 4 }}>
                <Ionicons name="ellipsis-horizontal" size={18} color={C.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity style={s.featuredPlayBtn} activeOpacity={0.85} onPress={() => play()} accessibilityLabel="Play">
                <Ionicons name="play" size={18} color="#fff" style={{ marginLeft: 2 }} />
              </TouchableOpacity>
            </TouchableOpacity>
          ) : null}

          {/* ── Tabs ── */}
          <View style={s.tabRow}>
            {TABS.map(t => (
              <TouchableOpacity key={t} onPress={() => setTab(t)} activeOpacity={0.7}>
                <Text style={[s.tabLabel, tab === t && s.tabLabelActive]}>{t.toUpperCase()}</Text>
                <View style={[s.tabUnderline, tab === t && s.tabUnderlineActive]} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <LinearGradient colors={[HEADER_BG, FEED_BG]} style={s.panelFade} />

        {/* ── Tab content ── */}
        <View style={s.feedWrap}>
          {tab === 'Posts' ? (
            <>
              <View style={s.toolbar}>
                <TouchableOpacity
                  style={s.sortBtn}
                  activeOpacity={0.7}
                  onPress={() => setSort(v => (v === 'Newest' ? 'Top' : 'Newest'))}
                >
                  <Ionicons name="swap-vertical" size={16} color="#fff" />
                  <Text style={s.sortText}>{sort}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.postBtn}
                  activeOpacity={0.8}
                  onPress={() => showConfirmation('Posting opens in a future update')}
                >
                  <Ionicons name="add" size={16} color="#fff" />
                  <Text style={s.postBtnText}>Post</Text>
                </TouchableOpacity>
              </View>

              {sortedPosts.length === 0 ? (
                <Text style={s.emptyText}>No posts yet, be the first to share something.</Text>
              ) : (
                <View style={s.postList}>
                  {sortedPosts.map((post, i) => (
                    <PostCard key={post.id} post={post} index={i} />
                  ))}
                </View>
              )}
            </>
          ) : tab === 'Music' ? (
            artistSongs.length === 0 ? (
              <Text style={s.emptyText}>No tracks to show yet.</Text>
            ) : (
              <View style={s.musicList}>
                {artistSongs.slice(0, 12).map((sg, i) => {
                  const trackArt = sg.albumArtPath ? albumArtAssets[sg.albumArtPath] : null
                  return (
                    <TouchableOpacity key={sg.id} style={s.trackRow} activeOpacity={0.8} onPress={() => play(sg.id)}>
                      <Text style={s.trackIdx}>{i + 1}</Text>
                      {trackArt ? (
                        <Image source={trackArt} style={s.trackArt} resizeMode="cover" />
                      ) : (
                        <View style={[s.trackArt, { backgroundColor: sg.albumArtColor }]} />
                      )}
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={s.trackTitle} numberOfLines={1}>{sg.title}</Text>
                        <Text style={s.trackArtist} numberOfLines={1}>{sg.artistName}</Text>
                      </View>
                      <Ionicons name="play-circle-outline" size={22} color={C.cyan} />
                    </TouchableOpacity>
                  )
                })}
              </View>
            )
          ) : (
            <Text style={s.aboutText}>
              {aboutBlurb ?? `A space for ${artistName ?? group.name} fans to share posts, music, and everything in between.`}
            </Text>
          )}
        </View>
      </ScrollView>

      <StandaloneTabBar />
    </View>
  )
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: FEED_BG },

  // Hero
  hero: { width: '100%', overflow: 'hidden' },
  heroFallback: { backgroundColor: C.elevated, alignItems: 'center', justifyContent: 'center' },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  heroTopRight: { flexDirection: 'row', gap: 10 },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(36,43,49,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Header panel (blue-charcoal)
  panel: { backgroundColor: HEADER_BG, paddingHorizontal: 16, paddingTop: 6 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { ...typeHeadline(30), color: '#fff', flex: 1 },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.cyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playTriangle: {
    width: 0,
    height: 0,
    marginLeft: 4,
    borderStyle: 'solid',
    borderTopWidth: 12,
    borderBottomWidth: 12,
    borderLeftWidth: 18,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#000',
  },

  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  joinPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: R.full,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  joinPillActive: { borderColor: C.cyan },
  joinPillText: { fontFamily: FONT_FAMILY.semibold, fontSize: 14, color: '#fff' },
  joinPillTextActive: { color: C.cyan },
  avatarCluster: { flexDirection: 'row', marginLeft: 18 },
  memberAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: HEADER_BG,
  },
  memberCount: { fontFamily: FONT_FAMILY.semibold, fontSize: 14, color: '#fff', marginLeft: 10 },

  // Featured artist card
  featuredCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
    padding: 14,
    borderRadius: R.xl,
    backgroundColor: 'rgba(51,70,80,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  featuredAvatar: { width: 56, height: 56, borderRadius: 28 },
  featuredAvatarFallback: { backgroundColor: C.elevated, alignItems: 'center', justifyContent: 'center' },
  featuredLabel: { fontFamily: FONT_FAMILY.semibold, fontSize: 11, color: C.cyan, letterSpacing: 0.8 },
  featuredName: { fontFamily: FONT_FAMILY.semibold, fontSize: 16, color: '#fff', marginTop: 2 },
  featuredSub: { fontFamily: FONT_FAMILY.regular, fontSize: 12, color: C.textSecondary, marginTop: 1 },
  featuredPlayBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Tabs
  tabRow: { flexDirection: 'row', gap: 26, marginTop: 20, paddingBottom: 14 },
  tabLabel: { fontFamily: FONT_FAMILY.semibold, fontSize: 14, letterSpacing: 0.4, color: C.textMuted },
  tabLabelActive: { color: '#fff' },
  tabUnderline: { height: 3, borderRadius: 2, marginTop: 8, backgroundColor: 'transparent' },
  tabUnderlineActive: { backgroundColor: C.cyan },

  panelFade: { height: 16 },

  // Feed
  feedWrap: { backgroundColor: FEED_BG, paddingHorizontal: 16, paddingTop: 4, minHeight: 200 },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sortText: { fontFamily: FONT_FAMILY.semibold, fontSize: 14, color: '#fff' },
  postBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: R.full,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  postBtnText: { fontFamily: FONT_FAMILY.semibold, fontSize: 14, color: '#fff' },

  emptyText: { fontFamily: FONT_FAMILY.regular, fontSize: 14, color: C.textMuted, paddingVertical: 12 },

  postList: { gap: 26 },
  postCard: {
    backgroundColor: '#14181D',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: R.xl,
    padding: 16,
    gap: 12,
  },
  postHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  postAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  postHandle: { fontFamily: FONT_FAMILY.semibold, fontSize: 14, color: '#fff' },
  postTime: { fontFamily: FONT_FAMILY.regular, fontSize: 12, color: '#6e7681', marginTop: 1 },
  postBody: { fontFamily: FONT_FAMILY.regular, fontSize: 14, lineHeight: 20, color: '#e9ecee' },
  postImage: { width: '100%', height: 160, borderRadius: 14, backgroundColor: '#1c232b' },

  postFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerText: { fontFamily: FONT_FAMILY.medium, fontSize: 13, color: '#a7aeb6' },
  footerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reactionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: R.full,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  reactionEmoji: { fontSize: 14 },
  reactionCount: { fontFamily: FONT_FAMILY.medium, fontSize: 12, color: '#a7aeb6' },
  addReactionBtn: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },

  // Music tab
  musicList: { gap: 4, paddingBottom: 8 },
  trackRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  trackIdx: { width: 20, fontSize: 13, color: C.textMuted, textAlign: 'center' },
  trackArt: { width: 44, height: 44, borderRadius: 6 },
  trackTitle: { fontFamily: FONT_FAMILY.semibold, fontSize: 14, color: '#fff' },
  trackArtist: { fontFamily: FONT_FAMILY.regular, fontSize: 12, color: C.textSecondary, marginTop: 2 },

  // About tab
  aboutText: { fontFamily: FONT_FAMILY.regular, fontSize: 14, lineHeight: 21, color: C.textSecondary, paddingVertical: 8 },
})
