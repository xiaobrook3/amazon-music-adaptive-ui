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
import { albumArtAssets, oliviaAboutAssets, oliviaPageAssets, logoAssets } from '../../data/assetMap'
import { songs } from '../../data/mockData'
import { findFanGroupForArtist, getFanGroupPosts, resolvePostArt } from '../../data/fanGroupContent'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useAdaptiveUI } from '../../context/AdaptiveUIContext'
import {
  OLIVIA_ABOUT_ASK_CHIPS,
  OLIVIA_ABOUT_INSPIRES,
  OLIVIA_ABOUT_INFLUENCED_BY,
  OLIVIA_ABOUT_LYRIC_NOTES,
  OLIVIA_ABOUT_MERCH,
  OLIVIA_ABOUT_VIDEOS,
  OLIVIA_ABOUT_EVENTS,
} from '../../data/oliviaRodrigoAbout'
import { C, FONT_FAMILY, typeHeadline } from '../../theme'

const SCREEN_W = Dimensions.get('window').width
const CARD_W = (SCREEN_W - 44) / 2

function resolveAboutArt(key: string) {
  return oliviaAboutAssets[key] ?? albumArtAssets[key] ?? oliviaPageAssets.profile
}

function InfluenceAvatar({
  name,
  artKey,
  size = 58,
  onPress,
}: {
  name: string
  artKey: string
  size?: number
  onPress?: () => void
}) {
  return (
    <TouchableOpacity
      style={[a.influenceItem, { width: size + 34 }]}
      activeOpacity={0.8}
      onPress={onPress}
      disabled={!onPress}
    >
      <Image
        source={resolveAboutArt(artKey)}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1.5,
          borderColor: 'rgba(255,255,255,0.2)',
        }}
        resizeMode="cover"
      />
      <Text style={a.influenceName} numberOfLines={2}>{name}</Text>
    </TouchableOpacity>
  )
}

export default function OliviaAboutTab() {
  const router = useRouter()
  const { playSongAt } = usePlaybackState()
  const { showConfirmation } = useAdaptiveUI()
  const [joined, setJoined] = useState(false)
  const [query, setQuery] = useState('')

  // Real fan group + a real post from it (src/data/fanGroupContent.ts),
  // replacing the previous hardcoded "Sad Girl Hour" placeholder post.
  const fanGroup = findFanGroupForArtist('olivia-rodrigo')
  const fanPost = fanGroup ? getFanGroupPosts(fanGroup.id)[0] : undefined
  const openFanGroup = () => {
    if (fanGroup) router.push(`/fan-group/${fanGroup.id}` as any)
  }

  // Ask-Alexa hands the question to Maestro, which actually answers it.
  const askAlexa = (text?: string) => {
    const asked = (text ?? query).trim()
    if (!asked) return
    router.push(`/(tabs)/maestro?q=${encodeURIComponent(asked)}` as any)
  }

  // Video tiles play the matching track's audio when one exists in the catalog.
  const playVideo = (title: string) => {
    const related = songs.find(
      sg => sg.artistId === 'olivia-rodrigo' && title.toLowerCase().includes(sg.title.toLowerCase()),
    )
    if (related) {
      playSongAt(related.id)
      router.push('/now-playing' as any)
    } else {
      showConfirmation('Full videos come with the real app')
    }
  }

  return (
    <View style={a.wrap}>
      <View style={a.storyCard}>
        <Text style={a.sectionTitle18}>The story so far</Text>
        <View style={a.storyMediaWrap}>
          <Image source={resolveAboutArt('olivia-about-story')} style={a.storyMedia} resizeMode="cover" />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.55)']} style={StyleSheet.absoluteFill} />
          <View style={a.eraPill}>
            <Text style={a.eraPillText}>THE ERA · 2021 – 2024</Text>
          </View>
        </View>
        <Text style={a.bodyText}>
          From bedroom demos to SOUR's record-breaking debut, then the sharper, restless GUTS, here's how Olivia turned teenage heartbreak into a generation's soundtrack.
        </Text>
        <TouchableOpacity
          style={a.linkRow}
          activeOpacity={0.8}
          onPress={() => askAlexa("Tell me Olivia Rodrigo's story")}
        >
          <Text style={a.linkText}>Read the full story</Text>
          <Text style={a.linkText}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={a.block}>
        <Text style={a.sectionTitle18}>Ask about this era</Text>
        <Text style={a.muted13}>
          Ask Alexa anything about the GUTS era, she knows its whole world.
        </Text>
        <View style={a.askBar}>
          <Image source={logoAssets.alexa} style={a.alexaLogo} resizeMode="contain" />
          <TextInput
            style={a.askInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Ask about GUTS…"
            placeholderTextColor="#6e7681"
            returnKeyType="send"
            onSubmitEditing={() => askAlexa()}
          />
          <TouchableOpacity style={a.askSend} activeOpacity={0.85} onPress={() => askAlexa()}>
            <Ionicons name="arrow-forward" size={14} color="#06222a" />
          </TouchableOpacity>
        </View>
        <View style={a.chipRow}>
          {OLIVIA_ABOUT_ASK_CHIPS.map(chip => (
            <TouchableOpacity key={chip} style={a.chip} activeOpacity={0.8} onPress={() => setQuery(chip)}>
              <Text style={a.chipText}>{chip}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={a.block}>
        <Text style={a.sectionTitle18}>Lyric meanings & production notes</Text>
        <Text style={a.muted13}>Layers reveal as you listen, never dumped all at once.</Text>
        <EdgeFadeRow>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={a.noteRail}>
            {OLIVIA_ABOUT_LYRIC_NOTES.map(note => (
              <View key={note.id} style={[a.noteCard, note.locked && a.noteCardLocked]}>
                <View style={a.noteArtWrap}>
                  <Image
                    source={resolveAboutArt(note.artKey)}
                    style={[a.noteArt, note.locked && { opacity: 0.2 }]}
                    resizeMode="cover"
                  />
                  {note.locked && (
                    <View style={a.lockedPill}>
                      <Text style={a.lockedPillText}>LOCKED</Text>
                    </View>
                  )}
                </View>
                <Text style={[a.noteTitle, note.locked && a.noteTitleLocked]}>{note.title}</Text>
                <Text style={[a.noteLink, note.locked && a.noteLinkLocked]}>{note.linkLabel}</Text>
              </View>
            ))}
          </ScrollView>
        </EdgeFadeRow>
      </View>

      <View style={a.block}>
        <View style={a.titleRow}>
          <Text style={a.sectionTitle18}>Interviews & behind the scenes</Text>
          <Text style={a.tagInline}>seek when you want</Text>
        </View>
        <EdgeFadeRow>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={a.noteRail}>
            {OLIVIA_ABOUT_VIDEOS.map(video => (
              <TouchableOpacity key={video.id} style={a.videoCard} activeOpacity={0.85} onPress={() => playVideo(video.title)}>
                <View style={a.videoThumbWrap}>
                  <Image source={resolveAboutArt(video.artKey)} style={a.videoThumb} resizeMode="cover" />
                  <View style={a.playCircle}>
                    <Ionicons name="play" size={14} color="#fff" style={{ marginLeft: 2 }} />
                  </View>
                  <View style={a.durationPill}>
                    <Text style={a.durationText}>{video.duration}</Text>
                  </View>
                </View>
                <Text style={a.videoTitle}>{video.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </EdgeFadeRow>
      </View>

      <View style={a.influencePanel}>
        <Text style={a.sectionTitle18}>Influence web</Text>
        <Text style={a.muted13}>Who shaped her sound, and who she's shaping</Text>

        <Text style={a.influenceLabel}>INFLUENCED BY</Text>
        <EdgeFadeRow fadeColor="#000">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={a.influenceRail}>
            {OLIVIA_ABOUT_INFLUENCED_BY.map(person => (
              <InfluenceAvatar
                key={person.name}
                name={person.name}
                artKey={person.artKey}
                onPress={() => setQuery(`Tell me about ${person.name}`)}
              />
            ))}
          </ScrollView>
        </EdgeFadeRow>

        {/* Compact divider hub — same photo/name/tag as before, just no
            longer a full-width centered circle breaking up the two rails. */}
        <View style={a.influenceHub}>
          <View style={a.hubDivider} />
          <View style={a.hubRing}>
            <Image source={oliviaPageAssets.profile} style={a.hubPhoto} resizeMode="cover" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={a.hubName}>Olivia Rodrigo</Text>
            <Text style={a.hubTag}>THE ARTIST</Text>
          </View>
          <View style={a.hubDivider} />
        </View>

        <Text style={a.influenceLabel}>SHE INSPIRES</Text>
        <EdgeFadeRow fadeColor="#000">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={a.influenceRail}>
            {OLIVIA_ABOUT_INSPIRES.map(person => (
              <InfluenceAvatar
                key={person.name}
                name={person.name}
                artKey={person.artKey}
                onPress={() => setQuery(`Tell me about ${person.name}`)}
              />
            ))}
          </ScrollView>
        </EdgeFadeRow>
      </View>

      {/* Real post from Olivia's actual fan group (src/data/fanGroupContent.ts
          fg-hj-olivia), not a hardcoded placeholder — "See more" opens the
          real /fan-group/[id] page. */}
      {fanGroup && fanPost && (
        <>
          <View style={a.fanHeader}>
            <Text style={a.sectionTitle16}>Popular posts from fan groups</Text>
            <TouchableOpacity onPress={openFanGroup} activeOpacity={0.8}>
              <Text style={a.seeMore}>See more</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={a.postCard} activeOpacity={0.85} onPress={openFanGroup}>
            <View style={a.groupPill}>
              <Text style={a.groupPillText}>{fanGroup.name}</Text>
            </View>
            <View style={a.postUserRow}>
              <LinearGradient colors={['#f472b6', '#7c3aed']} style={a.postAvatar}>
                <Ionicons name="person" size={16} color="#fff" />
              </LinearGradient>
              <View>
                <Text style={a.postHandle}>{fanPost.handle}</Text>
                <Text style={a.postTime}>{fanPost.time}</Text>
              </View>
            </View>
            <Text style={a.bodyText}>{fanPost.body}</Text>
            {fanPost.artKey && (
              <Image source={resolvePostArt(fanPost.artKey)} style={a.postImage} resizeMode="cover" />
            )}
            <View style={a.reactionsRow}>
              <View style={a.reaction}>
                <Ionicons name="heart-outline" size={14} color="#a7aeb6" />
                <Text style={a.reactionText}>{fanPost.likes}</Text>
              </View>
              <View style={a.reaction}>
                <Ionicons name="chatbubble-outline" size={14} color="#a7aeb6" />
                <Text style={a.reactionText}>{fanPost.comments}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </>
      )}

      <Text style={a.sectionTitle18}>The Livies</Text>
      <View style={a.liviesCard}>
        <View style={a.liviesRow}>
          <View style={a.avatarStack}>
            {['#f472b6', '#0ea5e9', '#4fe3c0', '#e8b860'].map((color, i) => (
              <View
                key={color}
                style={[a.stackAvatar, { backgroundColor: color, marginLeft: i === 0 ? 0 : -12, zIndex: 4 - i }]}
              />
            ))}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={a.liviesCount}>12,480 Livies</Text>
            <Text style={a.liviesSub}>shared meaning, opt-in</Text>
          </View>
          <TouchableOpacity
            style={[a.joinBtn, joined && a.joinedBtn]}
            onPress={() => setJoined(!joined)}
            activeOpacity={0.85}
          >
            <Text style={[a.joinBtnText, joined && { color: '#c2c9d1' }]}>
              {joined ? 'Joined' : 'Join'}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={a.muted13}>
          A fan space, not a public feed, your posts stay among Livies.
        </Text>
      </View>

      <View style={a.eventsCard}>
        <View style={a.eventRow}>
          <View style={a.dateBox}>
            <Text style={a.dateMonth}>{OLIVIA_ABOUT_EVENTS[0].month}</Text>
            <Text style={a.dateDay}>{OLIVIA_ABOUT_EVENTS[0].day}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={a.eventTitle}>{OLIVIA_ABOUT_EVENTS[0].title}</Text>
            <Text style={a.eventVenue}>{OLIVIA_ABOUT_EVENTS[0].venue}</Text>
            <Text style={a.eventTime}>{OLIVIA_ABOUT_EVENTS[0].time}</Text>
          </View>
          <TouchableOpacity
            style={a.ticketsBtn}
            activeOpacity={0.85}
            onPress={() => showConfirmation(`Opening Ticketmaster, ${OLIVIA_ABOUT_EVENTS[0].title}`)}
          >
            <Text style={a.ticketsBtnText}>Tickets</Text>
          </TouchableOpacity>
        </View>
        <EdgeFadeRow fadeColor="#161c23">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={a.merchRail}>
            {OLIVIA_ABOUT_MERCH.map(item => (
              <TouchableOpacity
                key={item.title}
                style={a.merchCard}
                activeOpacity={0.85}
                onPress={() => showConfirmation(`Added to bag, ${item.title} · ${item.price}`)}
              >
                <Image source={resolveAboutArt(item.artKey)} style={a.merchArt} resizeMode="cover" />
                <Text style={a.merchTitle}>{item.title}</Text>
                <Text style={a.merchPrice}>{item.price}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </EdgeFadeRow>
      </View>
    </View>
  )
}

const a = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingTop: 12, gap: 24, paddingBottom: 24 },
  block: { gap: 12 },
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
  storyMediaWrap: { height: 152, borderRadius: 12, overflow: 'hidden' },
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
  eraPillText: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: 11,
    color: '#fff',
    letterSpacing: 0.11,
  },
  bodyText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14,
    lineHeight: 21,
    color: '#c2c9d1',
  },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  linkText: { fontFamily: FONT_FAMILY.medium, fontSize: 14, color: C.cyan },
  muted13: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 13,
    lineHeight: 19,
    color: '#a7aeb6',
  },
  askBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1c232b',
    borderWidth: 1,
    borderColor: '#242c35',
    borderRadius: 24,
    paddingLeft: 14,
    paddingRight: 8,
    paddingVertical: 8,
  },
  askPlaceholder: {
    flex: 1,
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14,
    color: '#6e7681',
  },
  alexaLogo: { width: 22, height: 22 },
  askInput: {
    flex: 1,
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14,
    color: '#fff',
    padding: 0,
  },
  askSend: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.cyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: '#161c23',
    borderWidth: 1,
    borderColor: '#242c35',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: { fontFamily: FONT_FAMILY.medium, fontSize: 12.5, color: '#c2c9d1' },
  titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  tagInline: { fontFamily: FONT_FAMILY.medium, fontSize: 12, letterSpacing: 0.03, color: C.cyan },
  noteRail: { gap: 12, paddingVertical: 4 },
  noteCard: {
    width: CARD_W,
    backgroundColor: '#161c23',
    borderWidth: 1,
    borderColor: '#242c35',
    borderRadius: 14,
    padding: 11,
    gap: 9,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
  },
  noteCardLocked: { backgroundColor: '#11161c' },
  noteArtWrap: { height: 82, borderRadius: 9, overflow: 'hidden', backgroundColor: '#1c232b' },
  noteArt: { width: '100%', height: '100%' },
  lockedPill: {
    position: 'absolute',
    top: 11,
    left: 11,
    backgroundColor: '#232b34',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  lockedPillText: { fontFamily: FONT_FAMILY.medium, fontSize: 11, color: '#6e7681' },
  noteTitle: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: 13,
    lineHeight: 17,
    color: '#fff',
  },
  noteTitleLocked: { color: '#6e7681' },
  noteLink: { fontFamily: FONT_FAMILY.medium, fontSize: 11, color: '#4fe3c0' },
  noteLinkLocked: { color: '#6e7681' },
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
  influencePanel: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#242c35',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 10,
  },
  influenceLabel: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: 11,
    color: '#6e7681',
    letterSpacing: 1.8,
    marginTop: 4,
  },
  influenceRail: { gap: 14, paddingVertical: 4 },
  influenceItem: { alignItems: 'center', gap: 9, width: 76 },
  influenceName: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: 11,
    color: '#c2c9d1',
    textAlign: 'center',
  },
  // Compact horizontal divider — Olivia's photo + name flanked by hairlines,
  // anchoring the two influence rails instead of a full-width centered circle.
  influenceHub: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  hubDivider: { flex: 1, height: 1, backgroundColor: '#242c35' },
  hubRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(79,231,238,0.95)',
    padding: 2,
    shadowColor: C.cyan,
    shadowOpacity: 0.5,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  hubPhoto: { width: '100%', height: '100%', borderRadius: 20 },
  hubName: { fontFamily: FONT_FAMILY.medium, fontSize: 13, color: '#fff' },
  hubTag: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: 10,
    color: '#4fe7ee',
    letterSpacing: 1.4,
    marginTop: 1,
  },
  fanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
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
  postAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postHandle: { fontFamily: FONT_FAMILY.medium, fontSize: 13, color: '#fff' },
  postTime: { fontFamily: FONT_FAMILY.medium, fontSize: 11, color: '#6e7681' },
  postImage: { width: '100%', height: 150, borderRadius: 12 },
  reactionsRow: { flexDirection: 'row', gap: 18 },
  reaction: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reactionText: { fontFamily: FONT_FAMILY.medium, fontSize: 12, color: '#a7aeb6' },
  liviesCard: {
    backgroundColor: '#161c23',
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
  liviesRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarStack: { flexDirection: 'row', alignItems: 'center' },
  stackAvatar: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: '#161c23' },
  liviesCount: { fontFamily: FONT_FAMILY.medium, fontSize: 14, color: '#fff' },
  liviesSub: { fontFamily: FONT_FAMILY.medium, fontSize: 11.5, color: '#6e7681' },
  joinBtn: {
    backgroundColor: C.cyan,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  joinedBtn: { backgroundColor: '#242c35' },
  joinBtnText: { fontFamily: FONT_FAMILY.medium, fontSize: 13, color: '#06222a' },
  eventsCard: {
    backgroundColor: '#161c23',
    borderWidth: 1,
    borderColor: '#242c35',
    borderRadius: 16,
    padding: 14,
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 6 },
  },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: 13 },
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
  ticketsBtn: {
    backgroundColor: C.cyan,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  ticketsBtnText: { fontFamily: FONT_FAMILY.medium, fontSize: 13, color: '#06222a' },
  merchRail: { gap: 12 },
  merchCard: { width: 155, gap: 8 },
  merchArt: { width: 155, height: 110, borderRadius: 12 },
  merchTitle: { fontFamily: FONT_FAMILY.medium, fontSize: 12.5, color: '#fff' },
  merchPrice: { fontFamily: FONT_FAMILY.medium, fontSize: 12, color: C.cyan },
})
