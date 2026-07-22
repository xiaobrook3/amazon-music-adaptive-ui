import { useMemo, useState } from 'react'
import { ScrollView, View, TouchableOpacity, StyleSheet, ImageBackground, Platform } from 'react-native'
import { Text } from '../AppText'
import { AppImage as Image } from '../AppImage'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { safeGoBack } from '../../utils/navigation'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { songs } from '../../data/mockData'
import { albumArtAssets, artistAssets, hannahJourneyAssets, resolveArtistAvatar } from '../../data/assetMap'
import { getHannahJourneyGenericArtist } from '../../data/hannahJourneyGenericArtists'
import { getEngagedArtistContent } from '../../data/hannahJourneyEngagedArtistContent'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useAdaptiveUI } from '../../context/AdaptiveUIContext'
import { useAdaptiveMenu } from '../AdaptiveContextMenu'
import { useArtistEngagement } from '../../context/ArtistEngagementContext'
import { C, typeHeadline, FONT_FAMILY_DISPLAY, FONT_FAMILY_EMBER } from '../../theme'
import HannahJourneyGenericArtistMusicTab from './HannahJourneyGenericArtistMusicTab'

function resolveArt(key?: string) {
  if (!key) return null
  return albumArtAssets[key] ?? artistAssets[key] ?? null
}

/**
 * Hannah-Journey-only artist page for every secondary artist her own content
 * (Landing rails, OliviaMusicTab's "Fans also like") links to — everyone
 * besides Olivia Rodrigo / Taylor Swift / BTS, who keep their bespoke,
 * hand-tuned screens. One reusable, data-driven pair (this file +
 * HannahJourneyGenericArtistMusicTab) instead of five near-duplicate bespoke
 * screens, per the same "should match down to the spacing and icon" ask that
 * built Taylor's screen off Olivia's.
 *
 * Structure/styling below is copied verbatim from OliviaRodrigoArtistScreen's
 * `isHannahJourney` hero + tab rail (see that file for the Figma node refs),
 * with these deliberate simplifications for an artist with no scripted
 * new/engaged/superfan arc — Hannah just already knows and enjoys them:
 *  - Follow button is always the plain heart+label pill (never the gradient-
 *    border "Super Fan" pill, which OliviaRodrigoArtistScreen's own comments
 *    mark as Olivia-exclusive).
 *  - No "Since {year}" pill / paired user-avatar bubble — that relationship
 *    framing only exists for artists with a scripted history; these six
 *    don't have one in the catalog, and this template avoids inventing one.
 *  - Tab rail is Music + About only (no Events/Merch/You & Artist) — there's
 *    no eras/journey narrative, ticket, or merch data for these artists,
 *    matching this codebase's own "lighter for artists we don't have much
 *    on" precedent (see app/artist/[id].tsx's routing comment).
 */

export default function HannahJourneyGenericArtistScreen({ artistId }: { artistId: string }) {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { playSongAt } = usePlaybackState()
  const { showConfirmation } = useAdaptiveUI()
  const { open: openAdaptiveMenu } = useAdaptiveMenu()
  const { markFollowed } = useArtistEngagement()

  const config = getHannahJourneyGenericArtist(artistId)
  // Only Ariana Grande and Sabrina Carpenter have Engaged-tier "You & Artist"
  // content configured (real songs, no invented lyrics) — everyone else in
  // this template keeps the plain Music/About rail.
  const engagedContent = getEngagedArtistContent(artistId)
  const youAndArtistLabel = `You & ${config?.name ?? 'Artist'}`
  const tabs = engagedContent ? (['Music', youAndArtistLabel, 'About'] as const) : (['Music', 'About'] as const)
  const [tab, setTab] = useState<string>('Music')
  // Hannah already follows every one of her existing top artists from the
  // start of the journey — Olivia is the only relationship that's meant to
  // begin unfollowed and grow through the app. This screen only ever renders
  // for Hannah's Journey (routing gates on isHannahJourney), so defaulting
  // true here can't affect any other persona.
  const [following, setFollowing] = useState(true)

  const playSong = (songId?: string) => {
    if (!songId) return
    playSongAt(songId)
    router.push('/now-playing')
  }

  const heroArt = useMemo(
    () => (config ? resolveArtistAvatar(config.id, config.imageUri) : null),
    [config],
  )

  const artistSongs = useMemo(
    () => songs.filter(sg => sg.artistId === artistId),
    [artistId],
  )
  const firstSong = artistSongs[0]

  const playArtist = () => {
    if (firstSong) {
      playSongAt(firstSong.id)
      router.push('/now-playing')
    }
  }

  const shuffleArtist = () => {
    if (artistSongs.length === 0) return
    const pick = artistSongs[Math.floor(Math.random() * artistSongs.length)]
    playSongAt(pick.id)
    showConfirmation(`Shuffling ${config?.name ?? 'artist'}`)
  }

  const toggleFollow = () => {
    // Side effects out of the setState updater: React 19 runs updaters during
    // render, so the engagement mark fired here is dropped on web.
    if (!following) markFollowed(artistId)
    setFollowing(v => !v)
  }

  const showArtistMenu = () => {
    if (!config) return
    openAdaptiveMenu({ kind: 'artist', artistId: config.id, name: config.name, imageUri: config.imageUri })
  }

  if (!config) {
    // Defensive only — app/artist/[id].tsx only routes here for known ids.
    return <View style={s.screen} />
  }

  return (
    <View style={s.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Hero — same structure/spacing as Olivia's Hannah Journey hero */}
        <View style={s.heroWrap}>
          <ImageBackground
            source={heroArt ?? undefined}
            style={s.heroBg}
            resizeMode="cover"
            // Web: RNW doesn't apply the inner img's absolute-fill inset, so force
            // it inline or the natural-size image spills under the page content.
            imageStyle={Platform.OS === 'web' ? ({ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' } as any) : undefined}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.12)', 'rgba(22,38,49,0.7)', 'rgba(13,22,29,0.95)', '#000']}
              locations={[0.3, 0.48, 0.72, 0.9, 1]}
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient colors={['rgba(0,0,0,0.45)', 'rgba(0,0,0,0)']} style={s.heroTopGradient} />

            <View style={[s.heroTopNav, { paddingTop: insets.top + 4 }]}>
              <TouchableOpacity onPress={() => safeGoBack(router)} style={s.iconBtn} hitSlop={8}>
                <Ionicons name="chevron-back" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={s.iconBtn} hitSlop={8} onPress={showArtistMenu}>
                <Image source={hannahJourneyAssets.filterIcon} style={s.filterIconHJ} resizeMode="contain" />
              </TouchableOpacity>
            </View>

            <View style={s.profileCluster}>
              {heroArt ? (
                <Image source={heroArt} style={s.artistAvatar} resizeMode="cover" />
              ) : (
                <View style={[s.artistAvatar, s.artistAvatarFallback]}>
                  <Ionicons name="person" size={30} color="rgba(255,255,255,0.35)" />
                </View>
              )}
            </View>

            <View style={s.heroMeta}>
              <Text style={s.heroName}>{config.name}</Text>
              <Text style={[s.heroFollowers, s.heroFollowersHJ]}>{config.listenerLabel}</Text>
            </View>

            <View style={s.controlPanel}>
              <View style={s.controlLeft}>
                <TouchableOpacity
                  onPress={toggleFollow}
                  style={[s.followBtn, following && s.followingBtn, s.followBtnPaddingHJ]}
                  activeOpacity={0.7}
                >
                  {/* Figma: Follow (not-yet-following) heart is outline, Following is
                      filled — same HJ-gated 18px treatment as Olivia's plain Follow state. */}
                  <Ionicons
                    name={!following ? 'heart-outline' : 'heart'}
                    size={18}
                    color={following ? C.cyan : '#fff'}
                  />
                  <Text style={[s.followBtnText, following ? s.followBtnTextDisplayHJ : s.followBtnTextEmber]}>
                    {following ? 'Following' : 'Follow'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.roundIconBtn} onPress={showArtistMenu} hitSlop={8}>
                  <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
              <View style={s.controlRight}>
                <TouchableOpacity style={s.roundIconBtn} onPress={shuffleArtist} hitSlop={8}>
                  <Ionicons name="shuffle" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={s.playBtn} onPress={playArtist} activeOpacity={0.85}>
                  <Ionicons name="play" size={26} color="#000" style={{ marginLeft: 3 }} />
                </TouchableOpacity>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* Tabs */}
        <View style={s.tabBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[s.tabRow, s.tabRowHJ]}
          >
            {tabs.map(t => (
              <TouchableOpacity key={t} onPress={() => setTab(t)} style={s.tabItem}>
                <Text style={[s.tabText, tab === t && s.tabTextActive, s.tabTextHJ]}>{t}</Text>
                {tab === t && <View style={s.tabUnderline} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {tab === 'Music' ? (
          <HannahJourneyGenericArtistMusicTab artistId={artistId} />
        ) : tab === youAndArtistLabel && engagedContent ? (
          <View style={s.content}>
            {/* Time You Spent Together — same stat-block shape as Olivia's
                Hannah-Journey Engaged tab (hardcoded per-tier numbers there
                too; see HannahJourneyYouAndOlivia.tsx). */}
            <View style={s.block}>
              <Text style={s.sectionTitle}>Time You Spent Together</Text>
              <View style={s.statsCard}>
                <View style={s.statItem}>
                  <Text style={s.statNum}>{engagedContent.timeSpent.minutesListened}</Text>
                  <Text style={s.statLabel}>Minutes Listened</Text>
                </View>
                <View style={s.statDivider} />
                <View style={s.statItem}>
                  <Text style={s.statNum}>{engagedContent.timeSpent.streakDays}</Text>
                  <Text style={s.statLabel}>Longest Streak</Text>
                </View>
                <View style={s.statDivider} />
                <View style={s.statItem}>
                  <Text style={s.statNum}>{engagedContent.timeSpent.amongFriendsRank}</Text>
                  <Text style={s.statLabel}>Among Friends</Text>
                </View>
              </View>
            </View>

            {/* Your Top Songs — real catalog songs stand in for "Favorite
                Lyrics" since there's no curated lyric-snippet data for this
                artist in the app (unlike Olivia/BTS), and inventing quoted
                lyrics isn't something this data set does. */}
            <View style={s.block}>
              <Text style={s.sectionTitle}>Your Top Songs</Text>
              {engagedContent.topSongs.map(song => (
                <TouchableOpacity
                  key={song.songId}
                  style={s.topSongRow}
                  activeOpacity={0.8}
                  onPress={() => playSong(song.songId)}
                >
                  {resolveArt(song.artKey) ? (
                    <Image source={resolveArt(song.artKey)} style={s.topSongArt} resizeMode="cover" />
                  ) : (
                    <View style={[s.topSongArt, s.topSongArtFallback]}>
                      <Ionicons name="musical-note" size={18} color="rgba(255,255,255,0.3)" />
                    </View>
                  )}
                  <Text style={s.topSongTitle} numberOfLines={1}>{song.title}</Text>
                  <Ionicons name="play-circle-outline" size={26} color={C.cyan} />
                </TouchableOpacity>
              ))}
            </View>

            {/* Where It Started */}
            <View style={s.block}>
              <Text style={s.sectionTitle}>Where It Started</Text>
              <TouchableOpacity
                style={s.highlightCard}
                activeOpacity={0.85}
                onPress={() => playSong(engagedContent.firstPlay.songId)}
              >
                {resolveArt(engagedContent.firstPlay.artKey) ? (
                  <Image source={resolveArt(engagedContent.firstPlay.artKey)} style={s.highlightArt} resizeMode="cover" />
                ) : (
                  <View style={[s.highlightArt, s.topSongArtFallback]}>
                    <Ionicons name="musical-note" size={22} color="rgba(255,255,255,0.3)" />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={s.highlightTag}>YOUR FIRST EVER PLAY</Text>
                  <Text style={s.highlightTitle} numberOfLines={1}>{engagedContent.firstPlay.title}</Text>
                  <Text style={s.highlightSub}>{engagedContent.firstPlay.date}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={s.aboutWrap}>
            <Text style={s.aboutSectionTitle}>About</Text>
            <Text style={s.aboutBio}>{config.bio}</Text>
            <View style={s.aboutStatsRow}>
              <View style={s.aboutStat}>
                <Text style={s.aboutStatLabel}>Genre</Text>
                <Text style={s.aboutStatValue}>{config.genre}</Text>
              </View>
              <View style={s.aboutStatDivider} />
              <View style={s.aboutStat}>
                <Text style={s.aboutStatLabel}>Monthly Listeners</Text>
                <Text style={s.aboutStatValue}>{config.listenerLabel.replace(' Monthly Listeners', '')}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  heroWrap: { height: 406, backgroundColor: '#000', overflow: 'hidden' },
  heroBg: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#1a1a1a' },
  heroTopNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  heroTopGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 100 },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  filterIconHJ: { width: 24, height: 24 },
  profileCluster: { position: 'absolute', left: 16, top: 168, width: 200, height: 76 },
  artistAvatar: {
    width: 71,
    height: 71,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  artistAvatarFallback: { backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  heroMeta: { paddingHorizontal: 16, paddingBottom: 8, marginTop: 108 },
  heroName: { ...typeHeadline(33), color: '#fff', letterSpacing: -0.5 },
  heroFollowers: { fontSize: 15, color: '#acb3b4', marginTop: 2 },
  heroFollowersHJ: { fontSize: 14 },
  controlPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  controlLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  controlRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#4c4c4c',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  followingBtn: { borderColor: '#4c4c4c', backgroundColor: 'transparent' },
  followBtnPaddingHJ: { paddingLeft: 18, paddingRight: 16 },
  followBtnTextDisplayHJ: { fontFamily: FONT_FAMILY_DISPLAY.regular },
  followBtnText: { color: '#fff', fontSize: 14 },
  followBtnTextEmber: { fontFamily: FONT_FAMILY_EMBER.regular },
  roundIconBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  playBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: C.cyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: { backgroundColor: '#000', borderBottomWidth: 1, borderBottomColor: C.border },
  tabRow: { paddingHorizontal: 8 },
  tabRowHJ: { paddingHorizontal: 16, gap: 15, paddingBottom: 12 },
  tabItem: { paddingHorizontal: 10, paddingVertical: 10, position: 'relative' },
  tabText: { fontSize: 12, color: '#fff', fontWeight: '400' },
  tabTextActive: { fontWeight: '700' },
  tabTextHJ: { fontFamily: FONT_FAMILY_EMBER.regular, fontSize: 12, fontWeight: '400' },
  tabUnderline: { position: 'absolute', bottom: 0, left: 8, right: 8, height: 2, backgroundColor: C.cyan },
  aboutWrap: { paddingHorizontal: 16, paddingTop: 20, gap: 16 },
  aboutSectionTitle: { ...typeHeadline(20), color: '#fff' },
  aboutBio: { fontSize: 14, color: '#ccc', lineHeight: 21 },
  aboutStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.elevated,
    borderRadius: 12,
    padding: 16,
  },
  aboutStat: { flex: 1, gap: 4 },
  aboutStatLabel: { fontSize: 12, color: '#888' },
  aboutStatValue: { fontSize: 16, color: '#fff', fontWeight: '700' },
  aboutStatDivider: { width: StyleSheet.hairlineWidth, height: 32, backgroundColor: '#444', marginHorizontal: 16 },

  // You & Artist (Engaged tier)
  content: { paddingHorizontal: 16, paddingTop: 20, gap: 24 },
  block: { gap: 12 },
  sectionTitle: { fontFamily: FONT_FAMILY_DISPLAY.bold, fontSize: 20, color: '#fff' },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontFamily: FONT_FAMILY_DISPLAY.bold, fontSize: 32, color: '#fff' },
  statLabel: { fontFamily: FONT_FAMILY_EMBER.regular, fontSize: 12, color: '#a6a6a6', marginTop: 4, textAlign: 'center' },
  statDivider: { width: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.2)' },
  topSongRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  topSongArt: { width: 48, height: 48, borderRadius: 6 },
  topSongArtFallback: { backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  topSongTitle: { flex: 1, fontFamily: FONT_FAMILY_EMBER.regular, fontSize: 14, color: '#fff' },
  highlightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 105,
    borderRadius: 12,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  highlightArt: { width: 72, height: 72, borderRadius: 4, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.24)' },
  highlightTag: { fontFamily: FONT_FAMILY_DISPLAY.bold, fontSize: 12, color: C.cyan },
  highlightTitle: { fontFamily: FONT_FAMILY_EMBER.bold, fontSize: 16, color: '#fff', marginTop: 4 },
  highlightSub: { fontFamily: FONT_FAMILY_EMBER.regular, fontSize: 12, color: '#a6a6a6', marginTop: 2 },
})
