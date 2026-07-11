import { useEffect, useState } from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  useReducedMotion,
  Easing,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '../AppText'
import { AppImage as Image } from '../AppImage'
import { typeHeadline } from '../../theme'
import {
  famLine,
  type Familiarity,
  type InfluenceWebData,
  type InfluenceWebNode,
} from '../../data/influenceWeb'

/**
 * The influence web from the retired HTML artist page, rebuilt natively so
 * web and Expo Go render the same thing: a hub-and-spoke canvas (336×378,
 * hub at 168,172) with editorial threads, gently bobbing avatar bubbles
 * (bob1/bob2 motion from the HTML, paused under reduced motion), the
 * listener's ★●○ familiarity marks, and a selection-driven detail card —
 * relationship, keyword chips, the connection story, and playable tracks.
 */

const HUB = { x: 168, y: 172, s: 90 }
const CANVAS_W = 336
// 378 was the HTML canvas, but its labels overflowed onto the section below;
// natively the canvas owns the extra 54px so the bottom bubble's name and
// keyword chip never sit under the detail card.
const CANVAS_H = 432

const CYAN = '#4FE7EE'
const PINK = '#F472B6'
const PINK_TEXT = '#F9A8D4'
const FAINT = '#8A93A0'
const MUTED = '#C2C9D1'

const FAM_GLYPH: Record<Familiarity, string> = { fan: '★', casual: '●', new: '' }

/* The HTML's bob1/bob2 keyframes: a slow two-step drift, phase-shifted per bubble. */
const BOB: Record<number, { dx: [number, number]; dy: [number, number]; dur: number; delay: number }> = {
  1: { dx: [3, -3], dy: [-6, 4], dur: 5800, delay: 0 },
  2: { dx: [-4, 3], dy: [5, -5], dur: 6600, delay: 400 },
  3: { dx: [3, -3], dy: [-6, 4], dur: 7200, delay: 1100 },
  4: { dx: [-4, 3], dy: [5, -5], dur: 6100, delay: 800 },
  5: { dx: [3, -3], dy: [-6, 4], dur: 6900, delay: 1600 },
}

function Bobbing({ variant, children }: { variant: number; children: React.ReactNode }) {
  const reduce = useReducedMotion()
  const t = useSharedValue(0)
  useEffect(() => {
    if (reduce) return
    const { dur, delay } = BOB[variant] ?? BOB[1]
    t.value = 0
    t.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: dur / 3, easing: Easing.inOut(Easing.sin) }),
          withTiming(2, { duration: dur / 3, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: dur / 3, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
      ),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, variant])
  const style = useAnimatedStyle(() => {
    const { dx, dy } = BOB[variant] ?? BOB[1]
    const x = t.value <= 1 ? t.value * dx[0] : dx[0] + (t.value - 1) * (dx[1] - dx[0])
    const y = t.value <= 1 ? t.value * dy[0] : dy[0] + (t.value - 1) * (dy[1] - dy[0])
    return { transform: [{ translateX: x }, { translateY: y }] }
  })
  return <Animated.View style={style}>{children}</Animated.View>
}

function Thread({ node }: { node: InfluenceWebNode }) {
  const dx = node.x - HUB.x
  const dy = node.y - HUB.y
  const len = Math.sqrt(dx * dx + dy * dy)
  const angle = Math.atan2(dy, dx)
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: HUB.x + dx / 2 - len / 2,
        top: HUB.y + dy / 2,
        width: len,
        height: 1,
        backgroundColor: node.out ? 'rgba(244,114,182,0.25)' : 'rgba(79,231,238,0.25)',
        transform: [{ rotate: `${angle}rad` }],
      }}
    />
  )
}

function FamBadge({ fam, size }: { fam: Familiarity; size: number }) {
  return (
    <View
      style={[
        w.famBadge,
        { left: size / 2 + size / 2 - 10, top: size - 8 },
        fam === 'fan' && w.famFan,
        fam === 'casual' && w.famCasual,
        fam === 'new' && w.famNew,
      ]}
    >
      <Text style={[w.famGlyph, fam === 'fan' && { color: '#F0CB80' }, fam === 'casual' && { color: '#fff' }]}>
        {FAM_GLYPH[fam]}
      </Text>
    </View>
  )
}

function Bubble({
  node,
  selected,
  onPress,
}: {
  node: InfluenceWebNode
  selected: boolean
  onPress: () => void
}) {
  const ring = node.out ? 'rgba(244,114,182,0.45)' : 'rgba(79,231,238,0.45)'
  const ringSel = node.out ? 'rgba(244,114,182,0.95)' : 'rgba(79,231,238,0.95)'
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${node.name} — ${famLine(node.fam, node.name, node.out)}`}
      style={{
        position: 'absolute',
        left: node.x - node.s / 2,
        top: node.y - node.s / 2,
        width: node.s,
        alignItems: 'center',
      }}
    >
      <Bobbing variant={node.float}>
        <View style={{ alignItems: 'center' }}>
          <View style={{ width: node.s, height: node.s }}>
            <View
              style={[
                w.avatarWrap,
                {
                  width: node.s,
                  height: node.s,
                  borderRadius: node.s / 2,
                  borderColor: selected ? ringSel : ring,
                },
                selected && {
                  transform: [{ scale: 1.08 }],
                  shadowColor: node.out ? PINK : CYAN,
                  shadowOpacity: 0.45,
                  shadowRadius: 12,
                  shadowOffset: { width: 0, height: 0 },
                  elevation: 8,
                },
              ]}
            >
              {node.image ? (
                <Image source={node.image} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              ) : (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: '#3a2a5a', alignItems: 'center', justifyContent: 'center' }]}>
                  <Text style={{ color: '#fff', fontWeight: '800', fontSize: 17 }}>{node.name[0]}</Text>
                </View>
              )}
            </View>
            <FamBadge fam={node.fam} size={node.s} />
          </View>
          <Text style={[w.bubName, selected && w.bubNameSel]} numberOfLines={2}>{node.name}</Text>
          {node.kw ? (
            <View style={[w.kwChip, node.out && w.kwChipOut]}>
              <Text style={[w.kwText, node.out && { color: PINK_TEXT }]}>{node.kw}</Text>
            </View>
          ) : null}
        </View>
      </Bobbing>
    </TouchableOpacity>
  )
}

export default function InfluenceWeb({
  data,
  onPlayTrack,
  onAsk,
}: {
  data: InfluenceWebData
  /** Play a named track (or toast) — mirrors the HTML's tappable track pills. */
  onPlayTrack?: (title: string, byName: string) => void
  /** Ask-Alexa hook for webs without curated track lists. */
  onAsk?: (name: string) => void
}) {
  const [sel, setSel] = useState<string>(data.nodes[0]?.key ?? 'hub')
  const fade = useSharedValue(1)
  const reduce = useReducedMotion()

  const select = (key: string) => {
    if (key === sel) return
    setSel(key)
    if (!reduce) {
      fade.value = 0
      fade.value = withTiming(1, { duration: 260, easing: Easing.out(Easing.cubic) })
    }
  }
  const fadeStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [{ translateY: (1 - fade.value) * 6 }],
  }))

  const node = data.nodes.find(n => n.key === sel)
  const isHub = !node
  const d = node ?? { ...data.hubDetail, fam: 'fan' as Familiarity, image: data.hubImage, out: false }
  const famText = isHub ? data.hubFamLine : famLine(d.fam as Familiarity, d.name, d.out)
  const byName = d.out ? data.hubName : d.name

  return (
    <View>
      <Text style={w.title}>Influence web</Text>
      <Text style={w.desc}>{data.description}</Text>
      <View style={w.legendRow}>
        <View style={w.legend}>
          <View style={[w.legendDot, { backgroundColor: CYAN, shadowColor: CYAN }]} />
          <Text style={w.legendText}>{data.legendIn}</Text>
        </View>
        <View style={w.legend}>
          <View style={[w.legendDot, { backgroundColor: PINK, shadowColor: PINK }]} />
          <Text style={w.legendText}>{data.legendOut}</Text>
        </View>
      </View>
      <Text style={w.famLegend}>★ you're a fan   ·   ● you listen sometimes   ·   ○ new to you</Text>

      {/* the canvas */}
      <View style={w.canvas}>
        {data.nodes.map(n => <Thread key={`t-${n.key}`} node={n} />)}
        {/* hub */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => select('hub')}
          accessibilityRole="button"
          accessibilityLabel={`${data.hubName}, the center of the web`}
          style={{
            position: 'absolute',
            left: HUB.x - HUB.s / 2,
            top: HUB.y - HUB.s / 2,
            width: HUB.s,
            alignItems: 'center',
          }}
        >
          <View
            style={[
              w.avatarWrap,
              { width: HUB.s, height: HUB.s, borderRadius: HUB.s / 2, borderColor: 'rgba(79,231,238,0.6)' },
              sel === 'hub' && { transform: [{ scale: 1.04 }], shadowColor: CYAN, shadowOpacity: 0.4, shadowRadius: 14, shadowOffset: { width: 0, height: 0 }, elevation: 8 },
            ]}
          >
            {data.hubImage ? (
              <Image source={data.hubImage} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            ) : null}
          </View>
          <Text style={[w.bubName, { color: '#fff' }]} numberOfLines={1}>{data.hubName}</Text>
        </TouchableOpacity>
        {data.nodes.map(n => (
          <Bubble key={n.key} node={n} selected={sel === n.key} onPress={() => select(n.key)} />
        ))}
      </View>

      {/* detail card */}
      <Animated.View style={[w.detail, fadeStyle]}>
        <View style={w.detailHead}>
          <View style={[w.detailPhoto, { borderColor: d.out ? 'rgba(244,114,182,0.5)' : 'rgba(79,231,238,0.5)' }]}>
            {(isHub ? data.hubImage : (d as InfluenceWebNode).image) ? (
              <Image
                source={isHub ? data.hubImage : (d as InfluenceWebNode).image}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            ) : null}
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={[w.detailRel, d.out && { color: PINK_TEXT }]}>{d.rel}</Text>
            <View style={w.detailRow}>
              <Text style={w.detailName}>{d.name}</Text>
              {d.meta ? <Text style={w.detailMeta}>{d.meta}</Text> : null}
            </View>
          </View>
        </View>
        <View style={[w.famPill, (isHub || d.fam === 'fan') && w.famPillFan]}>
          <Text style={[w.famPillText, (isHub || d.fam === 'fan') && { color: '#F0CB80' }]}>{famText}</Text>
        </View>
        {d.kws.length > 0 && (
          <View style={w.kwRow}>
            {d.kws.map(k => (
              <View key={k} style={[w.kwChipLg, d.out && w.kwChipOut]}>
                <Text style={[w.kwTextLg, d.out && { color: PINK_TEXT }]}>{k}</Text>
              </View>
            ))}
          </View>
        )}
        <Text style={w.conn}>{d.conn}</Text>
        {d.tracks.length > 0 && (
          <>
            <Text style={w.tracksLbl}>{d.lbl}</Text>
            <View style={w.trackRow}>
              {d.tracks.map(t => (
                <TouchableOpacity
                  key={t}
                  style={w.trackPill}
                  activeOpacity={0.8}
                  onPress={() => onPlayTrack?.(t, byName)}
                >
                  <Ionicons name="play" size={11} color={MUTED} />
                  <Text style={w.trackText}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
        {d.tracks.length === 0 && !isHub && onAsk ? (
          <TouchableOpacity style={w.askBtn} activeOpacity={0.8} onPress={() => onAsk(d.name)}>
            <Ionicons name="sparkles" size={12} color={CYAN} />
            <Text style={w.askText}>Ask Alexa about {d.name.split(' ')[0]}</Text>
          </TouchableOpacity>
        ) : null}
        {'hop2' in d && d.hop2 ? <Text style={w.hop2}>{d.hop2}</Text> : null}
      </Animated.View>

      <Text style={w.src}>Curated by Amazon Music editors, drawn from interviews & press, not fan-submitted.</Text>
    </View>
  )
}

const w = StyleSheet.create({
  title: { ...typeHeadline(18), color: '#fff' },
  desc: { fontSize: 12, color: '#8A929B', marginTop: 3 },
  legendRow: { flexDirection: 'row', gap: 14, marginTop: 7 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 7, height: 7, borderRadius: 4, shadowOpacity: 0.8, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } },
  legendText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, color: FAINT },
  famLegend: { fontSize: 10, color: FAINT, marginTop: 6 },
  canvas: { alignSelf: 'center', width: CANVAS_W, height: CANVAS_H, marginTop: 6 },
  avatarWrap: {
    borderWidth: 1.5,
    overflow: 'hidden',
    backgroundColor: '#14181d',
  },
  bubName: { marginTop: 7, maxWidth: 110, fontSize: 11.5, lineHeight: 14, textAlign: 'center', color: MUTED },
  bubNameSel: { color: '#fff', fontWeight: '700' },
  kwChip: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: 'rgba(79,231,238,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(79,231,238,0.3)',
  },
  kwChipOut: { backgroundColor: 'rgba(244,114,182,0.10)', borderColor: 'rgba(244,114,182,0.3)' },
  kwText: { fontSize: 9.5, fontWeight: '700', color: CYAN },
  famBadge: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B0F14',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  famFan: { borderColor: 'rgba(240,203,128,0.55)' },
  famCasual: { backgroundColor: 'rgba(255,255,255,0.28)', borderColor: 'rgba(255,255,255,0.5)' },
  famNew: { backgroundColor: 'transparent', borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.35)' },
  famGlyph: { fontSize: 9, lineHeight: 11 },
  detail: {
    marginTop: 8,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#1D1D1F',
  },
  detailHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  detailPhoto: { width: 52, height: 52, borderRadius: 26, overflow: 'hidden', borderWidth: 1.5, backgroundColor: '#14181d' },
  detailRel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.7, color: CYAN },
  detailRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, flexWrap: 'wrap', marginTop: 3 },
  detailName: { fontSize: 17, fontWeight: '700', color: '#fff' },
  detailMeta: { fontSize: 11, color: FAINT },
  famPill: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: '#242C35',
  },
  famPillFan: { backgroundColor: 'rgba(240,203,128,0.10)', borderColor: 'rgba(240,203,128,0.3)' },
  famPillText: { fontSize: 11, fontWeight: '700', color: MUTED },
  kwRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  kwChipLg: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: 'rgba(79,231,238,0.09)',
    borderWidth: 1,
    borderColor: 'rgba(79,231,238,0.26)',
  },
  kwTextLg: { fontSize: 11, fontWeight: '700', color: CYAN },
  conn: { fontSize: 13, lineHeight: 19.5, color: MUTED, marginTop: 10 },
  tracksLbl: { fontSize: 10, fontWeight: '700', letterSpacing: 0.7, color: FAINT, marginTop: 12, marginBottom: 7 },
  trackRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  trackPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: '#2A2A2E',
  },
  trackText: { fontSize: 12.5, fontWeight: '700', color: MUTED },
  askBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(79,231,238,0.09)',
    borderWidth: 1,
    borderColor: 'rgba(79,231,238,0.26)',
  },
  askText: { fontSize: 12.5, fontWeight: '700', color: CYAN },
  hop2: {
    fontSize: 11.5,
    fontStyle: 'italic',
    lineHeight: 17,
    color: FAINT,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#242C35',
  },
  src: { fontSize: 11, lineHeight: 16, color: FAINT, textAlign: 'center', marginTop: 12, alignSelf: 'center', maxWidth: 300 },
})
