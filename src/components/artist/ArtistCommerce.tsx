import { useState } from 'react'
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { Text } from '../AppText'
import { AppImage as Image } from '../AppImage'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useAdaptiveUI } from '../../context/AdaptiveUIContext'
import { C, FONT_FAMILY, typeHeadline } from '../../theme'
import type { PastArtistEvent } from '../../data/oliviaRodrigoAbout'
import type { AboutFanPost } from '../../data/artistAbout'

// Shared Events + Merch presentation so the dedicated Events / Merch tabs and
// the About tab render the exact same cards throughout an artist page.

export interface ArtistEvent {
  month: string
  day: string
  title: string
  venue: string
  time: string
}

export interface MerchItem {
  title: string
  subtitle?: string
  price: string
  artKey: string
}

export function ArtistEventsCard({ events }: { events: ArtistEvent[] }) {
  const { showConfirmation } = useAdaptiveUI()
  if (events.length === 0) return null
  return (
    <View style={s.eventsCard}>
      {events.map((ev, i) => (
        <View key={`${ev.title}-${ev.day}`} style={[s.eventRow, i > 0 && s.eventDivider]}>
          <View style={s.dateBox}>
            <Text style={s.dateMonth}>{ev.month}</Text>
            <Text style={s.dateDay}>{ev.day}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.eventTitle}>{ev.title}</Text>
            <Text style={s.eventVenue}>{ev.venue}</Text>
            <Text style={s.eventTime}>{ev.time}</Text>
          </View>
          <TouchableOpacity
            style={s.ticketsBtn}
            activeOpacity={0.85}
            onPress={() => showConfirmation(`Opening Ticketmaster — ${ev.title}, ${ev.month} ${ev.day}`)}
          >
            <Text style={s.ticketsBtnText}>Tickets</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  )
}

const PAST_BADGE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  past: { bg: 'rgba(80,80,80,0.82)', text: '#ccc', label: 'PAST' },
  'live-rec': { bg: 'rgba(0,188,188,0.18)', text: C.cyan, label: '● LIVE REC' },
  replay: { bg: 'rgba(0,188,188,0.18)', text: C.cyan, label: '▶ REPLAY' },
}

export function PastArtistEventsCard({ events }: { events: PastArtistEvent[] }) {
  const { showConfirmation } = useAdaptiveUI()
  if (events.length === 0) return null
  return (
    <View style={s.eventsCard}>
      {events.map((ev, i) => {
        const badge = PAST_BADGE_COLORS[ev.kind]
        const isPast = ev.kind === 'past'
        return (
          <View
            key={`${ev.title}-${ev.day}-past`}
            style={[s.eventRow, i > 0 && s.eventDivider, isPast && s.pastEventRow]}
          >
            <View style={[s.dateBox, isPast && s.pastDateBox]}>
              <Text style={[s.dateMonth, isPast && s.pastDateMonth]}>{ev.month}</Text>
              <Text style={[s.dateDay, isPast && s.pastDateDay]}>{ev.day}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={s.pastBadgeRow}>
                <View style={[s.pastBadgePill, { backgroundColor: badge.bg }]}>
                  <Text style={[s.pastBadgeText, { color: badge.text }]}>{badge.label}</Text>
                </View>
              </View>
              <Text style={[s.eventTitle, isPast && s.pastEventTitle]}>{ev.title}</Text>
              <Text style={s.eventVenue}>{ev.venue}</Text>
              <Text style={s.eventTime}>{ev.subtitle}</Text>
            </View>
            {!isPast && (
              <TouchableOpacity
                style={s.replayBtn}
                activeOpacity={0.85}
                onPress={() => showConfirmation(`Playing ${ev.kind === 'live-rec' ? 'live recording' : 'replay'} — ${ev.title}`)}
              >
                <Ionicons
                  name={ev.kind === 'live-rec' ? 'radio-outline' : 'play-circle-outline'}
                  size={22}
                  color={C.cyan}
                />
              </TouchableOpacity>
            )}
          </View>
        )
      })}
    </View>
  )
}

export function ArtistMerchGrid({
  items,
  resolveArt,
}: {
  items: MerchItem[]
  resolveArt: (key: string) => any
}) {
  const { showConfirmation } = useAdaptiveUI()
  // v3.1 storefront proportions: two compact cards per row, 110px art, the
  // whole card is the tap target (no oversized Buy pill fighting the price).
  return (
    <View style={s.merchGrid}>
      {items.map(item => (
        <TouchableOpacity
          key={item.title}
          style={s.merchCard}
          activeOpacity={0.85}
          onPress={() => showConfirmation(`Opening ${item.title} · ${item.price}`)}
        >
          <Image source={resolveArt(item.artKey)} style={s.merchArt} resizeMode="cover" />
          <Text style={s.merchTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={s.merchPrice}>
            {item.price}{item.subtitle ? <Text style={s.merchSubtitle}>  ·  {item.subtitle}</Text> : null}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

/* v3.1 IA: the fandom gathers around the live moments, so fan-group posts and
 * the community card live on the EVENTS tab — not About. */
export function FanPostsCarousel({ posts, resolveArt }: { posts: AboutFanPost[]; resolveArt: (key: string) => any }) {
  // Instagram-threads feel: snap cards, one thumb-flick per post.
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={298}
      decelerationRate="fast"
      contentContainerStyle={s.postRail}
    >
      {posts.map(p => (
        <FanPostCard key={`${p.group}-${p.handle}`} post={p} resolveArt={resolveArt} width={286} />
      ))}
    </ScrollView>
  )
}

export function FanPostCard({ post, resolveArt, width }: { post: AboutFanPost; resolveArt: (key: string) => any; width?: number }) {
  const { showConfirmation } = useAdaptiveUI()
  const [joined, setJoined] = useState(false)
  const [liked, setLiked] = useState(false)
  return (
    <View style={[s.postCard, width != null && { width }]}>
      <TouchableOpacity
        style={[s.groupPill, joined && s.groupPillJoined]}
        activeOpacity={0.8}
        onPress={() => {
          const next = !joined
          setJoined(next)
          showConfirmation(next ? `Joined ${post.group} — its posts now surface here` : `Left ${post.group}`)
        }}
      >
        <Text style={[s.groupPillText, joined && { color: C.cyan }]}>
          {post.group}{joined ? '  ✓ Joined' : '  · Join'}
        </Text>
      </TouchableOpacity>
      <View style={s.postUserRow}>
        <LinearGradient colors={['#f472b6', '#7c3aed']} style={s.postAvatar}>
          <Ionicons name="person" size={16} color="#fff" />
        </LinearGradient>
        <View>
          <Text style={s.postHandle}>{post.handle}</Text>
          <Text style={s.postTime}>{post.time}</Text>
        </View>
      </View>
      <Text style={s.postBody}>{post.body}</Text>
      <Image source={resolveArt(post.artKey)} style={s.postImage} resizeMode="cover" />
      <View style={s.reactionsRow}>
        <TouchableOpacity style={s.reaction} activeOpacity={0.7} onPress={() => setLiked(v => !v)}>
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={14} color={liked ? '#f472b6' : '#a7aeb6'} />
          <Text style={[s.reactionText, liked && { color: '#f472b6' }]}>{post.likes}</Text>
        </TouchableOpacity>
        <View style={s.reaction}>
          <Ionicons name="chatbubble-outline" size={14} color="#a7aeb6" />
          <Text style={s.reactionText}>{post.comments}</Text>
        </View>
      </View>
    </View>
  )
}

export function FanCommunityCard({ name, members, note }: { name: string; members: string; note: string }) {
  const [joined, setJoined] = useState(false)
  return (
    <View style={s.communityCard}>
      <View style={s.communityRow}>
        <View style={s.avatarStack}>
          {['#f472b6', '#0ea5e9', '#4fe3c0', '#e8b860'].map((color, i) => (
            <View
              key={color}
              style={[s.stackAvatar, { backgroundColor: color, marginLeft: i === 0 ? 0 : -12, zIndex: 4 - i }]}
            />
          ))}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.communityCount}>{members} {name}</Text>
          <Text style={s.communitySub}>shared meaning, opt-in</Text>
        </View>
        <TouchableOpacity
          style={[s.joinBtn, joined && s.joinedBtn]}
          onPress={() => setJoined(v => !v)}
          activeOpacity={0.85}
        >
          <Text style={[s.joinBtnText, joined && { color: '#c2c9d1' }]}>{joined ? 'Joined' : 'Join'}</Text>
        </TouchableOpacity>
      </View>
      <Text style={s.communityNote}>{note}</Text>
    </View>
  )
}

const s = StyleSheet.create({
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

  pastEventRow: { opacity: 0.78 },
  pastDateBox: { backgroundColor: '#181e24' },
  pastDateMonth: { color: '#5a6472' },
  pastDateDay: { color: '#8c96a2' },
  pastEventTitle: { color: '#b0b8c1' },
  pastBadgeRow: { flexDirection: 'row', marginBottom: 4 },
  pastBadgePill: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  pastBadgeText: { fontFamily: FONT_FAMILY.medium, fontSize: 9, letterSpacing: 0.4 },
  replayBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },

  merchGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  merchCard: { flexBasis: '46%', flexGrow: 1, maxWidth: '48%', gap: 8 },
  merchArt: { width: '100%', height: 110, borderRadius: 12, backgroundColor: '#161616' },
  merchTitle: { fontFamily: FONT_FAMILY.medium, fontSize: 12.5, color: '#fff', lineHeight: 16 },
  merchSubtitle: { fontFamily: FONT_FAMILY.regular, fontSize: 11, color: '#8b939c' },
  merchPrice: { fontFamily: FONT_FAMILY.medium, fontSize: 12, color: C.cyan },

  postRail: { gap: 12, paddingVertical: 4 },
  postCard: {
    backgroundColor: '#141414',
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  groupPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#1d1d1f',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  groupPillJoined: { backgroundColor: 'rgba(0,213,221,0.14)' },
  groupPillText: { fontFamily: FONT_FAMILY.medium, fontSize: 11, color: '#c9b6e0' },
  postUserRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  postAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  postHandle: { fontFamily: FONT_FAMILY.medium, fontSize: 13, color: '#fff' },
  postTime: { fontFamily: FONT_FAMILY.medium, fontSize: 11, color: '#6e7681', marginTop: 1 },
  postBody: { fontFamily: FONT_FAMILY.regular, fontSize: 14, lineHeight: 21, color: '#c2c9d1' },
  postImage: { width: '100%', height: 120, borderRadius: 12, backgroundColor: '#161616' },
  reactionsRow: { flexDirection: 'row', gap: 18 },
  reaction: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reactionText: { fontFamily: FONT_FAMILY.medium, fontSize: 12, color: '#a7aeb6' },

  communityCard: {
    backgroundColor: '#141414',
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  communityRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarStack: { flexDirection: 'row' },
  stackAvatar: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: '#10161d' },
  communityCount: { fontFamily: FONT_FAMILY.medium, fontSize: 14, color: '#fff' },
  communitySub: { fontFamily: FONT_FAMILY.regular, fontSize: 11.5, color: '#8b939c', marginTop: 1 },
  joinBtn: { backgroundColor: C.cyan, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 8 },
  joinedBtn: { backgroundColor: '#1c232b' },
  joinBtnText: { fontFamily: FONT_FAMILY.medium, fontSize: 12.5, color: '#06222a' },
  communityNote: { fontFamily: FONT_FAMILY.regular, fontSize: 12.5, lineHeight: 18, color: '#8b939c' },
})
