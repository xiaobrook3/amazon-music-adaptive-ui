import { useState } from 'react'
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
} from 'react-native'
import { Text } from '../AppText'
import { AppImage as Image } from '../AppImage'
import { EdgeFadeRow } from '../EdgeFadeRow'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { albumArtAssets, artistAssets, logoAssets } from '../../data/assetMap'
import { songs } from '../../data/mockData'
import type { ArtistAboutData, AboutInfluence } from '../../data/artistAbout'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useAdaptiveUI } from '../../context/AdaptiveUIContext'
import { C, FONT_FAMILY, typeHeadline } from '../../theme'
import InfluenceWeb from './InfluenceWeb'
import { buildInfluenceWeb } from '../../data/influenceWeb'

const SCREEN_W = Dimensions.get('window').width
const CARD_W = (SCREEN_W - 44) / 2

function resolveArt(key: string) {
  return albumArtAssets[key] ?? artistAssets[key] ?? null
}

function InfluenceAvatar({ person, onPress }: { person: AboutInfluence; onPress: () => void }) {
  const art = resolveArt(person.artKey)
  return (
    <TouchableOpacity style={a.influenceItem} activeOpacity={0.8} onPress={onPress}>
      {art ? (
        <Image source={art} style={a.influenceAvatar} resizeMode="cover" />
      ) : (
        <LinearGradient colors={['#3a2a5a', '#1c1430']} style={a.influenceAvatar}>
          <Text style={a.influenceInitial}>{person.name.charAt(0)}</Text>
        </LinearGradient>
      )}
      <Text style={a.influenceName} numberOfLines={2}>{person.name}</Text>
    </TouchableOpacity>
  )
}

/**
 * A lighter cousin of OliviaAboutTab, driven entirely by data so any artist
 * with an entry in artistAbout.ts gets a story-led About page. Sections render
 * only when their data is present.
 */
export default function ArtistAboutTab({
  data,
  artistName,
  sinceYear,
  hubImage,
}: {
  data: ArtistAboutData
  artistName?: string
  sinceYear?: number
  hubImage?: any
}) {
  const who = artistName ?? 'this artist'
  const firstName = who.split(' ')[0]
  const router = useRouter()
  const { playSongAt } = usePlaybackState()
  const { showConfirmation } = useAdaptiveUI()
  const [query, setQuery] = useState('')
  const chips = data.askChips ?? [`What defines ${firstName}?`, 'Best song to start with?', 'Who inspired them?']

  // Ask-Alexa hands the question to Maestro, which actually answers it.
  const askAlexa = (text?: string) => {
    const asked = (text ?? query).trim()
    if (!asked) return
    router.push(`/(tabs)/maestro?q=${encodeURIComponent(asked)}` as any)
  }

  // Video tiles play the matching track's audio when one exists in the catalog.
  const playVideo = (title: string) => {
    const related = songs.find(
      sg => sg.artistName === who && title.toLowerCase().includes(sg.title.toLowerCase()),
    )
    if (related) {
      playSongAt(related.id)
      router.push('/now-playing' as any)
    } else {
      showConfirmation('Full videos come with the real app')
    }
  }
  // Tailor the era + banner to the listener's own journey so the "since" year
  // matches the hero's "Since {year}" bubble instead of the artist's career span.
  const eraLabel = sinceYear ? `YOUR JOURNEY · SINCE ${sinceYear}` : data.eraLabel
  const bannerText = sinceYear
    ? `Deeper because you've been with ${firstName} since ${sinceYear} — new fans see a shorter version.`
    : data.bannerText

  return (
    <View style={a.wrap}>
      {bannerText ? (
        <View style={a.banner}>
          <Ionicons name="sparkles" size={14} color={C.cyan} />
          <Text style={a.bannerText}>{bannerText}</Text>
        </View>
      ) : null}

      {/* Ask Alexa */}
      <View style={a.block}>
        <Text style={a.sectionTitle18}>Ask about {firstName}</Text>
        <Text style={a.muted13}>Ask Alexa anything about {who} — the music, the eras, the story.</Text>
        <View style={a.askBar}>
          <Image source={logoAssets.alexa} style={a.alexaLogo} resizeMode="contain" />
          <TextInput
            style={a.askInput}
            value={query}
            onChangeText={setQuery}
            placeholder={`Ask about ${firstName}…`}
            placeholderTextColor="#5c6873"
            returnKeyType="send"
            onSubmitEditing={() => askAlexa()}
          />
          <TouchableOpacity style={a.askSend} activeOpacity={0.85} onPress={() => askAlexa()}>
            <Ionicons name="arrow-forward" size={14} color="#06222a" />
          </TouchableOpacity>
        </View>
        <View style={a.chipRow}>
          {chips.map(chip => (
            <TouchableOpacity key={chip} style={a.chip} activeOpacity={0.8} onPress={() => setQuery(chip)}>
              <Text style={a.chipText}>{chip}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Story */}
      <View style={a.storyCard}>
        <Text style={a.sectionTitle18}>The story so far</Text>
        <View style={a.storyMediaWrap}>
          <Image source={resolveArt(data.storyArtKey)} style={a.storyMedia} resizeMode="cover" />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.55)']} style={StyleSheet.absoluteFill} />
          <View style={a.eraPill}>
            <Text style={a.eraPillText}>{eraLabel}</Text>
          </View>
        </View>
        <Text style={a.bodyText}>{data.storyBody}</Text>
        <TouchableOpacity
          style={a.linkRow}
          activeOpacity={0.8}
          onPress={() => askAlexa(`Tell me ${who}'s story`)}
        >
          <Text style={a.linkText}>Read the full story</Text>
          <Ionicons name="arrow-forward" size={15} color={C.cyan} />
        </TouchableOpacity>
      </View>

      {/* Key releases */}
      {data.releases && data.releases.length > 0 ? (
        <View style={a.block}>
          <Text style={a.sectionTitle18}>{data.releasesTitle ?? 'Albums that defined the era'}</Text>
          <EdgeFadeRow>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={a.rail}>
              {data.releases.map(r => (
                <View key={r.title} style={a.releaseCard}>
                  <Image source={resolveArt(r.artKey)} style={a.releaseArt} resizeMode="cover" />
                  <Text style={a.releaseTitle} numberOfLines={1}>{r.title}</Text>
                  <Text style={a.releaseSub}>{r.subtitle}</Text>
                </View>
              ))}
            </ScrollView>
          </EdgeFadeRow>
        </View>
      ) : null}

      {/* Interviews & behind the scenes */}
      {data.videos && data.videos.length > 0 ? (
        <View style={a.block}>
          <View style={a.titleRow}>
            <Text style={a.sectionTitle18}>Interviews & behind the scenes</Text>
            <Text style={a.tagInline}>seek when you want</Text>
          </View>
          <EdgeFadeRow>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={a.rail}>
              {data.videos.map(v => (
                <TouchableOpacity key={v.id} style={a.videoCard} activeOpacity={0.85} onPress={() => playVideo(v.title)}>
                  <View style={a.videoThumbWrap}>
                    <Image source={resolveArt(v.artKey)} style={a.videoThumb} resizeMode="cover" />
                    <View style={a.playCircle}>
                      <Ionicons name="play" size={14} color="#fff" style={{ marginLeft: 2 }} />
                    </View>
                    <View style={a.durationPill}>
                      <Text style={a.durationText}>{v.duration}</Text>
                    </View>
                  </View>
                  <Text style={a.videoTitle}>{v.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </EdgeFadeRow>
        </View>
      ) : null}

      {/* Influence web — the same hub-and-spoke canvas as the flagship,
          built from this artist's about data */}
      {(() => {
        const web = buildInfluenceWeb(
          who,
          hubImage ?? resolveArt(data.storyArtKey),
          sinceYear ? `★ You're a fan · since ${sinceYear}` : `● You've started listening to ${firstName}`,
          data.influencedBy,
          data.inspires,
        )
        if (!web) return null
        return (
          <View style={a.influencePanel}>
            <InfluenceWeb
              data={web}
              onAsk={name => askAlexa(`Tell me about ${name}`)}
            />
          </View>
        )
      })()}

      {/* v3.1 IA: events live on the Events tab, merch on the Merch tab, and
          fan posts with the live moments on Events — About stays the story. */}
    </View>
  )
}

const a = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingTop: 12, gap: 24, paddingBottom: 24 },
  block: { gap: 12 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: '#121a22',
    borderWidth: 1,
    borderColor: '#1c2a30',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  bannerText: { flex: 1, fontFamily: FONT_FAMILY.regular, fontSize: 13, lineHeight: 18, color: '#c2c9d1' },
  storyCard: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#242c35',
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 6 },
  },
  sectionTitle18: { ...typeHeadline(18), color: '#fff' },
  sectionTitle16: { ...typeHeadline(16), color: '#fff' },
  storyMediaWrap: { height: 152, borderRadius: 12, overflow: 'hidden', backgroundColor: '#161c23' },
  storyMedia: { width: '100%', height: '100%' },
  eraPill: {
    position: 'absolute',
    bottom: 11,
    left: 14,
    backgroundColor: 'rgba(0,0,0,0.42)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  eraPillText: { fontFamily: FONT_FAMILY.medium, fontSize: 11, color: '#fff', letterSpacing: 0.11 },
  bodyText: { fontFamily: FONT_FAMILY.regular, fontSize: 14, lineHeight: 21, color: '#c2c9d1' },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  linkText: { fontFamily: FONT_FAMILY.medium, fontSize: 14, color: C.cyan },

  muted13: { fontFamily: FONT_FAMILY.regular, fontSize: 13, lineHeight: 18, color: '#8b939c' },
  askBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#0e151b',
    borderWidth: 1,
    borderColor: '#233240',
    borderRadius: 14,
    paddingLeft: 12,
    paddingRight: 6,
    height: 48,
  },
  alexaLogo: { width: 22, height: 22 },
  askInput: { flex: 1, fontFamily: FONT_FAMILY.regular, fontSize: 14, color: '#fff', padding: 0 },
  askSend: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.cyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 8,
    backgroundColor: '#161c23',
    borderWidth: 1,
    borderColor: '#242c35',
  },
  chipText: { fontFamily: FONT_FAMILY.medium, fontSize: 12, color: '#c2c9d1' },
  influencePanel: {
    backgroundColor: '#0d1319',
    borderWidth: 1,
    borderColor: '#1c2630',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  influenceLabel: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: 11,
    letterSpacing: 1,
    color: '#6e7681',
    marginTop: 4,
  },
  influenceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  influenceItem: { width: 72, alignItems: 'center', gap: 8 },
  influenceAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#161c23',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  influenceInitial: { fontFamily: FONT_FAMILY.bold, fontSize: 20, color: '#fff' },
  influenceName: { fontFamily: FONT_FAMILY.medium, fontSize: 11, color: '#c2c9d1', textAlign: 'center' },
  rail: { gap: 12, paddingVertical: 4 },
  releaseCard: { width: 128, gap: 7 },
  releaseArt: { width: 128, height: 128, borderRadius: 10, backgroundColor: '#161c23' },
  releaseTitle: { fontFamily: FONT_FAMILY.medium, fontSize: 13, color: '#fff' },
  releaseSub: { fontFamily: FONT_FAMILY.regular, fontSize: 12, color: '#6e7681' },
  titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  tagInline: { fontFamily: FONT_FAMILY.medium, fontSize: 12, letterSpacing: 0.03, color: C.cyan },
  videoCard: { width: CARD_W, gap: 9 },
  videoThumbWrap: {
    height: 98,
    borderRadius: 11,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1c232b',
  },
  videoThumb: { ...StyleSheet.absoluteFillObject },
  playCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.34)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  durationPill: {
    position: 'absolute',
    bottom: 8,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  durationText: { fontFamily: FONT_FAMILY.medium, fontSize: 10, color: '#fff' },
  videoTitle: { fontFamily: FONT_FAMILY.medium, fontSize: 13, lineHeight: 17, color: '#fff' },
  fanHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  seeMore: { fontFamily: FONT_FAMILY.medium, fontSize: 12, color: C.cyan },
  postCard: {
    backgroundColor: '#161c23',
    borderWidth: 1,
    borderColor: '#242c35',
    borderRadius: 16,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.32,
    shadowRadius: 11,
    shadowOffset: { width: 0, height: 8 },
  },
  groupPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#1c232b',
    borderWidth: 1,
    borderColor: '#242c35',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  groupPillText: { fontFamily: FONT_FAMILY.medium, fontSize: 11, color: '#c9b6e0' },
  postUserRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  postAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  postHandle: { fontFamily: FONT_FAMILY.medium, fontSize: 13, color: '#fff' },
  postTime: { fontFamily: FONT_FAMILY.medium, fontSize: 11, color: '#6e7681' },
  postImage: { width: '100%', height: 150, borderRadius: 12, backgroundColor: '#1c232b' },
  reactionsRow: { flexDirection: 'row', gap: 18 },
  reaction: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reactionText: { fontFamily: FONT_FAMILY.medium, fontSize: 12, color: '#a7aeb6' },
  eventsCard: {
    backgroundColor: '#161c23',
    borderWidth: 1,
    borderColor: '#242c35',
    borderRadius: 16,
    padding: 14,
    gap: 14,
  },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  eventDivider: { borderTopWidth: 1, borderTopColor: '#242c35', paddingTop: 14 },
  dateBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#1c232b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateMonth: { fontFamily: FONT_FAMILY.medium, fontSize: 11, color: C.cyan, letterSpacing: 0.11 },
  dateDay: { ...typeHeadline(22), color: '#fff', lineHeight: 24 },
  eventTitle: { fontFamily: FONT_FAMILY.medium, fontSize: 15, color: '#fff' },
  eventVenue: { fontFamily: FONT_FAMILY.regular, fontSize: 12, color: '#a7aeb6', marginTop: 2 },
  eventTime: { fontFamily: FONT_FAMILY.medium, fontSize: 11.5, color: '#6e7681', marginTop: 2 },
  ticketsBtn: { backgroundColor: C.cyan, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 9 },
  ticketsBtnText: { fontFamily: FONT_FAMILY.medium, fontSize: 13, color: '#06222a' },
})
