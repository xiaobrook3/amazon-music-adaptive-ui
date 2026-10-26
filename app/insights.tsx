import { useMemo, useState } from 'react'
import { ScrollView, View, TouchableOpacity, StyleSheet, Share } from 'react-native'
import SuperfanCardModal, { type SuperfanCardStat } from '../src/components/SuperfanCardModal'
import { AppImage as Image } from '../src/components/AppImage'
import { Text } from '../src/components/AppText'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { EdgeFadeRow } from '../src/components/EdgeFadeRow'
import { songs, artists } from '../src/data/mockData'
import { albumArtAssets, hannahJourneyAssets, resolveArtistAvatar } from '../src/data/assetMap'
import { useHannahJourney } from '../src/context/HannahJourneyContext'
import { C, FONT_FAMILY_EMBER, FONT_FAMILY, FONT_FAMILY_DISPLAY, typeHeadline, typeSubhead } from '../src/theme'

/**
 * Monthly recap / listening insights. Reached from the Library tab's header
 * icon (src/components/StickyLibraryHeader.tsx). Two states, per Figma node
 * 2604:19040 (generic) and 2604:18879 (superfan) in
 * design_iterations/final_prototype_draft/specs/insights-*-reference.reference.tsx —
 * the superfan layout (extra "Superfan highlights" hero cards + richer stats)
 * shows only for the Hannah Journey persona once she reaches the superfan
 * stage; every other persona/stage sees the generic recap.
 *
 * "Superfan highlights" is a horizontally scrollable row of TWO hero cards
 * (Figma node 2628:21295, an updated child of 2604:18879) — since Hannah is
 * a superfan of both Olivia Rodrigo AND Taylor Swift, she gets one card per
 * artist: Olivia ("Top 3% Listener", since July 2026) and Taylor Swift
 * ("Top 1% Listener", since March 2023 — the Eras Tour launch date).
 */

// Figma's own top-artist/top-song photos and album art for this screen were
// unlabeled stock exports with no reliable 1:1 mapping back to the markup, so
// the "most played" rows below resolve art from this app's existing artist/
// song catalog instead (verified real matches: Cruel Summer -> ts-lover,
// vampire -> GUTS, good 4 u -> SOUR, Anti-Hero -> Midnights art unavailable
// so it falls back to the song's album color). Only the decorative Superfan
// hero-card backdrops (stock/press photos, not tied to a specific song) are
// pulled directly from the Figma export.
const heroBgOlivia = require('../assets/hannah-journey/insights-superfan-hero-bg.png')
const heroBgTaylor = require('../assets/hannah-journey/insights-superfan-hero-bg-taylor.png')

type SuperfanHero = {
  key: string
  bg: number
  gradientColors: [string, string] | [string, string, string]
  since: string
  headline: string
  sub: string
  shareMessage: string
  /** Expanded-card copy — the full variant has room for the complete subline. */
  subline: string
  /** Expanded-card detail rows. Mock figures, consistent with the rest of the catalog. */
  stats: SuperfanCardStat[]
}

// Figma "superfan card / Property 1=insighthub" (node 2828:23737, 306x252 —
// the variant used inside this Insights hub) sets the subline as a single
// non-wrapping line "among 4M+ listeners " (no "worldwide"), unlike the wider
// "compact" You & Olivia variant which fits the full "...worldwide" copy.
const SUPERFAN_HERO_CARDS: SuperfanHero[] = [
  {
    key: 'olivia',
    bg: heroBgOlivia,
    gradientColors: ['#de909c', '#a6a0c7', '#6dafF1'],
    since: 'Since July 2026',
    headline: 'Top 3% Listener',
    sub: 'among 4M+ listeners',
    shareMessage: "I'm a Top 3% Olivia Rodrigo Listener on Amazon Music — among 4M+ listeners worldwide!",
    subline: 'among 4M+ listeners worldwide',
    stats: [
      { icon: 'history', title: 'First play, March 2021', subtitle: 'Olivia had 41k listeners' },
      { icon: 'repeat', title: '47 of the last 52 weeks', subtitle: 'You played her songs 3,240 times' },
      { icon: 'library-music', title: 'You played 38 of her 54 songs', subtitle: 'You explored more than her top hits' },
    ],
  },
  {
    key: 'taylor',
    bg: heroBgTaylor,
    gradientColors: ['#fae6bf', '#008ef3'],
    since: 'Since March 2023',
    headline: 'Top 1% Listener',
    sub: 'among 4M+ listeners',
    shareMessage: "I'm a Top 1% Taylor Swift Listener on Amazon Music — among 4M+ listeners worldwide!",
    subline: 'among 4M+ listeners worldwide',
    stats: [
      { icon: 'history', title: 'First play, March 2023', subtitle: 'The month the Eras Tour began' },
      { icon: 'repeat', title: '49 of the last 52 weeks', subtitle: 'You played her songs 4,120 times' },
      { icon: 'library-music', title: 'You played 96 of her 274 songs', subtitle: 'You went well past the singles' },
    ],
  },
]

// Figma export for the insighthub variant (306x252 box): fill =
// `linear-gradient(75.58deg, #DE909C 2.7313%, #A6A0C7 57.408%, #6DAFF1
// 110.15%)`. RN's LinearGradient start/end are box-relative fractions, so
// these are the CSS gradient-line endpoints for a 306x252 box at 75.58deg,
// extended past the box edge so location 1.0 lands at the stop's true
// 110.15% mark (same derivation as the compact/full superfan-card variants
// in HannahJourneyYouAndOlivia.tsx / SuperfanRevealPopup.tsx). Only applied
// (via locations) to 3-stop cards — Taylor's 2-stop palette isn't part of
// the Figma reference and keeps RN's default even spacing.
const HERO_GRADIENT_START = { x: -0.0683, y: 0.6774 }
const HERO_GRADIENT_END = { x: 1.1837, y: 0.2866 }
const HERO_GRADIENT_LOCATIONS: [number, number, number] = [0.0248, 0.5212, 1]

type ArtistRow = { artistId: string; minutes: number; superfan?: boolean }
type SongRow = {
  key: string
  title: string
  artistName: string
  plays: number
  albumArtPath?: string
  albumArtColor?: string
}

const GENERIC_STATS = { minutes: 226, artistsPlayed: 35, songsPlayed: 83 }
const SUPERFAN_STATS = { minutes: 2458, artistsPlayed: 35, songsPlayed: 210 }

const GENERIC_ARTISTS: ArtistRow[] = [
  { artistId: 'olivia-rodrigo', minutes: 82 },
  { artistId: 'tswift', minutes: 61 },
  { artistId: 'ariana-grande', minutes: 45 },
  { artistId: 'bts', minutes: 38 },
  { artistId: 'sabrina-carpenter', minutes: 29 },
]

const SUPERFAN_ARTISTS: ArtistRow[] = [
  { artistId: 'tswift', minutes: 625, superfan: true },
  { artistId: 'olivia-rodrigo', minutes: 472, superfan: true },
  { artistId: 'ariana-grande', minutes: 245 },
  { artistId: 'bts', minutes: 209 },
  { artistId: 'sabrina-carpenter', minutes: 95 },
]

// mockData song ids -> illustrative play counts for this recap
const GENERIC_SONG_PLAYS: [string, number][] = [
  ['s-or1', 24],      // Drivers License — Olivia Rodrigo
  ['s11', 19],        // Cruel Summer — Taylor Swift
  ['s-sabrina1', 15], // Espresso — Sabrina Carpenter
  ['s2', 12],         // Dynamite — BTS
  ['s-ariana1', 9],   // God is a Woman — Ariana Grande
]

const SUPERFAN_SONG_PLAYS: [string, number][] = [
  ['s11', 82],        // Cruel Summer — Taylor Swift
  ['s-or4', 21],      // vampire — Olivia Rodrigo
  ['s-ts-mid-01', 20], // Anti-Hero — Taylor Swift
  ['s-or2', 15],      // good 4 u — Olivia Rodrigo
]

// Ariana Grande's "we can't be friends (wait for your love)" isn't in the
// song catalog — kept verbatim from Figma with the closest real cover art.
const SUPERFAN_EXTRA_SONG: SongRow = {
  key: 'we-cant-be-friends',
  title: "we can't be friends (wait for your love)",
  artistName: 'Ariana Grande',
  plays: 3,
  albumArtPath: 'ariana-sweetener',
  albumArtColor: '#2a1a3a',
}

function resolveSongRows(pairs: [string, number][]): SongRow[] {
  return pairs
    .map(([id, plays]): SongRow | null => {
      const song = songs.find(sg => sg.id === id)
      if (!song) return null
      return {
        key: id,
        title: song.title,
        artistName: song.artistName,
        plays,
        albumArtPath: song.albumArtPath,
        albumArtColor: song.albumArtColor,
      }
    })
    .filter((row): row is SongRow => row != null)
}

// Figma insights top-artists/songs (node 2628:21140): regular badge 28.778px
// with 4.667px radius (ratio 0.162) and a flat 16px digit; the featured
// (rank 1) badge is a flattened bitmap in Figma but visually the same white
// square + black digit, just larger — scaled by the same ratios.
function RankBadge({ rank, size = 29 }: { rank: number; size?: number }) {
  return (
    <View style={[s.rankBadge, { width: size, height: size, borderRadius: size * 0.162 }]}>
      <Text style={[s.rankBadgeText, { fontSize: size * 0.556 }]}>{rank}</Text>
    </View>
  )
}

function ArtistPhoto({ artistId, size }: { artistId: string; size: number }) {
  const artist = artists.find(a => a.id === artistId)
  const avatar = artist ? resolveArtistAvatar(artist.id, artist.imageUri) : null
  const style = { width: size, height: size, borderRadius: size / 2 }
  if (avatar) return <Image source={avatar} style={style} resizeMode="cover" />
  return <View style={[style, s.artFallback]}><Ionicons name="person" size={size * 0.4} color="rgba(255,255,255,0.25)" /></View>
}

function SongArt({ row, size }: { row: SongRow; size: number }) {
  const art = row.albumArtPath ? albumArtAssets[row.albumArtPath] : null
  const style = { width: size, height: size, borderRadius: size * 0.08 }
  if (art) return <Image source={art} style={style} resizeMode="cover" />
  return <View style={[style, { backgroundColor: row.albumArtColor ?? C.surface }]} />
}

function TopArtistRow({ row, rank, featured }: { row: ArtistRow; rank: number; featured?: boolean }) {
  const artist = artists.find(a => a.id === row.artistId)
  const name = artist?.name ?? row.artistId
  const photoSize = featured ? 98 : 50

  return (
    <View style={[s.topRow, featured && s.topRowFeatured]}>
      <View style={{ width: featured ? photoSize : photoSize + 11, height: featured ? 101 : 60 }}>
        <View style={{ marginLeft: featured ? 0 : 11 }}>
          <ArtistPhoto artistId={row.artistId} size={photoSize} />
        </View>
        <View style={[s.rankBadgeWrap, featured && s.rankBadgeWrapFeatured]}>
          <RankBadge rank={rank} size={featured ? 37 : 29} />
        </View>
      </View>
      <View style={s.topRowInfo}>
        <View style={{ flex: 1 }}>
          {row.superfan && (
            <View style={s.superfanTag}>
              <Image source={hannahJourneyAssets.superfanIcon} style={s.superfanTagIcon} resizeMode="contain" />
              <Text style={s.superfanTagText}>SUPERFAN</Text>
            </View>
          )}
          <Text style={s.topRowName} numberOfLines={1}>{name}</Text>
        </View>
        <Text style={s.topRowMeta}>{row.minutes} min</Text>
      </View>
    </View>
  )
}

function TopSongRow({ row, rank, featured }: { row: SongRow; rank: number; featured?: boolean }) {
  const size = featured ? 100 : 50
  return (
    <View style={[s.topRow, featured && s.topRowFeatured]}>
      <View style={{ width: featured ? size : size + 11, height: featured ? 101 : 60 }}>
        <View style={{ marginLeft: featured ? 0 : 11 }}>
          <SongArt row={row} size={size} />
        </View>
        <View style={[s.rankBadgeWrap, featured && s.rankBadgeWrapFeatured]}>
          <RankBadge rank={rank} size={featured ? 37 : 29} />
        </View>
      </View>
      <View style={[s.topRowInfo, featured && { alignItems: 'flex-start' }]}>
        <View style={{ flex: 1 }}>
          <Text style={s.songTitle} numberOfLines={1}>{row.title}</Text>
          <Text style={s.songArtist} numberOfLines={1}>{row.artistName}</Text>
        </View>
        <Text style={s.topRowMeta}>{row.plays} plays</Text>
      </View>
    </View>
  )
}

function StatCard({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={s.statCard}>
      <View style={s.statCardHead}>
        <Ionicons name={icon} size={18} color="#a6a6a6" />
        <Text style={s.statCardLabel}>{label}</Text>
      </View>
      <Text style={s.statCardValue}>{value}</Text>
    </View>
  )
}

function SuperfanHeroCard({ card, onExpand }: { card: SuperfanHero; onExpand: () => void }) {
  const handleShare = () => {
    Share.share({ message: card.shareMessage }).catch(() => {})
  }
  const gradientLocations = card.gradientColors.length === 3 ? HERO_GRADIENT_LOCATIONS : undefined
  return (
    <TouchableOpacity
      style={s.heroCard}
      activeOpacity={0.9}
      onPress={onExpand}
      accessibilityLabel={`Expand ${card.headline} card`}
    >
      <LinearGradient
        colors={card.gradientColors}
        locations={gradientLocations}
        start={HERO_GRADIENT_START}
        end={HERO_GRADIENT_END}
        style={StyleSheet.absoluteFill}
      />
      {/* Glass panel only covers the 216px photo tile + its own 8px padding
          (232 of the card's 252 total height) — like the compact/full superfan
          card variants, the remaining ~20px is left uncovered so the gradient
          plate above peeks out as a colored strip along the card's bottom
          edge (Figma "superfan card / Property 1=insighthub", node
          2828:23737). Previously this panel stretched to fill the full card
          interior (flex:1 + margin:8 = 236px), which both oversized the photo
          tile relative to spec and hid that reveal. */}
      <View style={s.heroGlass}>
        <View style={s.heroPhoto}>
          <Image source={card.bg} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.32)']}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={s.heroTopRow}>
            <View style={s.heroSuperfanLabel}>
              <Image source={hannahJourneyAssets.superfanIcon} style={s.heroSuperfanIcon} resizeMode="contain" />
              <Text style={s.heroSuperfanText}>Superfan</Text>
            </View>
            <Text style={s.heroSinceText}>{card.since}</Text>
          </View>
          <View style={s.heroStatsRow}>
            <View style={s.heroTextCol}>
              <Text style={s.heroHeadline}>{card.headline}</Text>
              <Text style={s.heroSub}>{card.sub}</Text>
            </View>
            <TouchableOpacity style={s.heroShareBtn} onPress={handleShare} accessibilityLabel="Share">
              <Ionicons name="share-outline" size={15} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default function InsightsScreen() {
  const router = useRouter()
  const { isHannahJourney, stage } = useHannahJourney()
  const isSuperfan = isHannahJourney && stage === 'superfan'

  const stats = isSuperfan ? SUPERFAN_STATS : GENERIC_STATS
  const topArtists = isSuperfan ? SUPERFAN_ARTISTS : GENERIC_ARTISTS
  const topSongs = useMemo(
    () => (isSuperfan ? [...resolveSongRows(SUPERFAN_SONG_PLAYS), SUPERFAN_EXTRA_SONG] : resolveSongRows(GENERIC_SONG_PLAYS)),
    [isSuperfan],
  )

  const handleShareList = (label: string) => {
    Share.share({ message: `My most played ${label.toLowerCase()} this month on Amazon Music` }).catch(() => {})
  }

  // Tapping a compact superfan card expands it into the full 340x528 card.
  const [expandedCardKey, setExpandedCardKey] = useState<string | null>(null)
  const expandedCard = SUPERFAN_HERO_CARDS.find(c => c.key === expandedCardKey) ?? null

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={s.navBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={22} color={C.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        <Text style={s.pageTitle}>Insights</Text>

        <View style={s.recapBlock}>
          <Text style={s.recapTitle}>Monthly recap</Text>
          <Text style={s.recapMonth}>June 2026</Text>
        </View>

        {isSuperfan && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>Superfan highlights</Text>
            <EdgeFadeRow>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.heroRow}>
                {SUPERFAN_HERO_CARDS.map(card => (
                  <SuperfanHeroCard
                    key={card.key}
                    card={card}
                    onExpand={() => setExpandedCardKey(card.key)}
                  />
                ))}
              </ScrollView>
            </EdgeFadeRow>
          </View>
        )}

        <View style={s.section}>
          <Text style={s.sectionLabel}>Listening stats</Text>
          <EdgeFadeRow>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.statsRow}>
              <StatCard icon="headset-outline" label="Music minutes listened" value={stats.minutes.toLocaleString()} />
              <StatCard icon="person-outline" label="Artists Played" value={String(stats.artistsPlayed)} />
              <StatCard icon="musical-notes-outline" label="Songs played" value={String(stats.songsPlayed)} />
            </ScrollView>
          </EdgeFadeRow>
        </View>

        <View style={s.section}>
          <Text style={s.sectionLabel}>Most played</Text>
          <EdgeFadeRow>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.mostPlayedRow}>
              <View style={s.mostPlayedCard}>
                <View style={s.mostPlayedHead}>
                  <Text style={s.mostPlayedTitle}>Artists</Text>
                  <TouchableOpacity style={s.shareChip} onPress={() => handleShareList('Artists')} accessibilityLabel="Share top artists">
                    <Ionicons name="share-outline" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
                <View style={{ gap: 14 }}>
                  {topArtists.map((row, i) => (
                    <TopArtistRow key={row.artistId} row={row} rank={i + 1} featured={i === 0} />
                  ))}
                </View>
              </View>

              <View style={s.mostPlayedCard}>
                <View style={s.mostPlayedHead}>
                  <Text style={s.mostPlayedTitle}>Songs</Text>
                  <TouchableOpacity style={s.shareChip} onPress={() => handleShareList('Songs')} accessibilityLabel="Share top songs">
                    <Ionicons name="share-outline" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
                <View style={{ gap: 14 }}>
                  {topSongs.map((row, i) => (
                    <TopSongRow key={row.key} row={row} rank={i + 1} featured={i === 0} />
                  ))}
                </View>
              </View>
            </ScrollView>
          </EdgeFadeRow>
        </View>
      </ScrollView>

      <SuperfanCardModal
        card={expandedCard}
        visible={expandedCard != null}
        onClose={() => setExpandedCardKey(null)}
      />
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8 },
  navBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  pageTitle: { ...typeHeadline(33), color: C.textPrimary, paddingHorizontal: 16, marginBottom: 20 },

  recapBlock: { paddingHorizontal: 16, marginBottom: 24, gap: 8 },
  recapTitle: { ...typeHeadline(24), color: C.textPrimary },
  recapMonth: { ...typeSubhead(14), color: '#a6a6a6' },

  section: { marginBottom: 24, gap: 16 },
  sectionLabel: {
    ...typeHeadline(12),
    color: '#a6a6a6',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
  },

  // ---- superfan hero cards ----
  heroRow: { paddingHorizontal: 16, gap: 16 },
  heroCard: { width: 306, height: 252, borderRadius: 24, overflow: 'hidden', backgroundColor: '#000' },
  heroGlass: { padding: 8, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: 'rgba(30,30,30,0.6)' },
  heroPhoto: {
    height: 216,
    borderRadius: 16,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'space-between',
  },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroSuperfanLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroSuperfanIcon: { width: 27, height: 24 },
  heroSuperfanText: { fontFamily: FONT_FAMILY_EMBER.bold, fontSize: 16, color: '#fff' },
  heroSinceText: { fontFamily: FONT_FAMILY_EMBER.regular, fontSize: 12, color: '#fff' },
  heroStatsRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  heroTextCol: { width: 185 },
  heroHeadline: { ...typeHeadline(28), color: '#fff' },
  heroSub: { fontFamily: FONT_FAMILY_EMBER.regular, fontSize: 16, color: '#fff' },
  heroShareBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },

  // ---- listening stats ----
  statsRow: { paddingHorizontal: 16, gap: 12 },
  statCard: { width: 230, height: 128, borderRadius: 14, backgroundColor: '#14191a', paddingHorizontal: 18, paddingVertical: 15, justifyContent: 'space-between' },
  statCardHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statCardLabel: { fontFamily: FONT_FAMILY_EMBER.regular, fontSize: 15, color: '#a6a6a6', flexShrink: 1 },
  statCardValue: { fontFamily: FONT_FAMILY.bold, fontSize: 42, color: C.textPrimary },

  // ---- most played ----
  mostPlayedRow: { paddingHorizontal: 16, gap: 16 },
  mostPlayedCard: { width: 320, borderRadius: 18, backgroundColor: '#14191a', paddingHorizontal: 16, paddingVertical: 20, gap: 24 },
  mostPlayedHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mostPlayedTitle: { ...typeHeadline(21), color: C.textPrimary },
  shareChip: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#373b3c', alignItems: 'center', justifyContent: 'center' },

  topRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  topRowFeatured: { alignItems: 'center', gap: 16 },
  artFallback: { backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 0.75, borderColor: 'rgba(255,255,255,0.24)' },
  rankBadgeWrap: { position: 'absolute', left: 0, top: 25 },
  rankBadgeWrapFeatured: { top: 56 },
  rankBadge: { backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  rankBadgeText: { fontFamily: FONT_FAMILY_DISPLAY.bold, color: '#000' },

  topRowInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  superfanTag: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  superfanTagIcon: { width: 15, height: 14 },
  superfanTagText: { fontFamily: FONT_FAMILY_DISPLAY.bold, fontSize: 11, color: '#fff', textTransform: 'uppercase' },
  topRowName: { fontFamily: FONT_FAMILY_EMBER.bold, fontSize: 15, color: C.textPrimary },
  topRowMeta: { fontFamily: FONT_FAMILY_EMBER.regular, fontSize: 13, color: '#a6a6a6' },

  songTitle: { fontFamily: FONT_FAMILY_EMBER.bold, fontSize: 14, color: C.textPrimary },
  songArtist: { fontFamily: FONT_FAMILY_EMBER.regular, fontSize: 12, color: '#a6a6a6', marginTop: 3 },
})
