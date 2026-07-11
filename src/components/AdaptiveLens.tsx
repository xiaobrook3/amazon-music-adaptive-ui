import { View, TouchableOpacity, StyleSheet, type ViewStyle, type StyleProp } from 'react-native'
import type { ReactNode } from 'react'
import { Text } from './AppText'
import { useAdaptiveUI } from '../context/AdaptiveUIContext'

/**
 * Adaptive lens — the moderator annotation layer, in-client.
 *
 * Parity with the artist pages' ✦ / ?lens=1 overlay: the same four-color
 * vocabulary (cyan = adapts with identity, amber = temporal context,
 * gray = fixed, pink = you control), the same legend copy. LensMark wraps a
 * surface; with the lens on it draws the dashed outline + label chip and
 * otherwise renders children untouched. The floating ✦ button and the legend
 * live in the tab layout so every client screen carries the layer.
 */

export type LensType = 'adaptive' | 'fixed' | 'temporal' | 'control'

const LENS_COLORS: Record<LensType, { line: string; chipBg: string; label: string }> = {
  adaptive: { line: 'rgba(0,213,221,0.75)',   chipBg: '#25D1DA', label: 'ADAPTS' },
  fixed:    { line: 'rgba(138,147,160,0.6)',  chipBg: '#8A93A0', label: 'FIXED' },
  temporal: { line: 'rgba(232,184,96,0.8)',   chipBg: '#E8B860', label: 'TEMPORAL' },
  control:  { line: 'rgba(241,167,200,0.8)',  chipBg: '#F1A7C8', label: 'YOU CONTROL' },
}

export function LensMark({
  type,
  note,
  conf,
  children,
  style,
}: {
  type: LensType
  note: string
  conf?: string
  children: ReactNode
  style?: StyleProp<ViewStyle>
}) {
  const { lensOn } = useAdaptiveUI()
  if (!lensOn) return <View style={style}>{children}</View>
  const c = LENS_COLORS[type]
  return (
    <View style={[style, s.marked, { borderColor: c.line }]}>
      {children}
      <View style={[s.chip, { backgroundColor: c.chipBg }]} pointerEvents="none">
        <Text style={s.chipText} numberOfLines={1}>
          {c.label}{conf ? ` · ${conf}` : ''} · {note}
        </Text>
      </View>
    </View>
  )
}

export function LensButton({ bottom = 92 }: { bottom?: number }) {
  const { lensOn, setLensOn, showConfirmation } = useAdaptiveUI()
  return (
    <TouchableOpacity
      style={[s.btn, { bottom }, lensOn && s.btnOn]}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityState={{ selected: lensOn }}
      accessibilityLabel="Adaptive lens"
      onPress={() => {
        const next = !lensOn
        setLensOn(next)
        showConfirmation(
          next
            ? 'Adaptive lens: cyan adapts, amber comes & goes, gray is fixed, pink is yours'
            : 'Lens off',
        )
      }}
    >
      <Text style={[s.btnStar, lensOn && s.btnTextOn]}>✦</Text>
      <Text style={[s.btnText, lensOn && s.btnTextOn]}>{lensOn ? 'Lens on' : 'What adapts?'}</Text>
    </TouchableOpacity>
  )
}

export function LensLegend() {
  const { lensOn } = useAdaptiveUI()
  if (!lensOn) return null
  return (
    <View style={s.legend} pointerEvents="none">
      <Text style={s.legendText}>
        <Text style={s.legendBold}>Adaptive UI</Text> models one listener by combining{' '}
        <Text style={s.legendBold}>durable identity + short-term context</Text> and restructures the
        interface, only as boldly as confidence allows, always over a standard baseline, always
        under user control.
      </Text>
      <View style={s.keys}>
        {(Object.keys(LENS_COLORS) as LensType[]).map(k => (
          <View key={k} style={s.key}>
            <View style={[s.keyDot, { backgroundColor: LENS_COLORS[k].chipBg }]} />
            <Text style={s.keyText}>{LENS_COLORS[k].label}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  marked: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 10,
    position: 'relative',
  },
  chip: {
    position: 'absolute',
    top: -10,
    left: 6,
    maxWidth: 310,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
    zIndex: 30,
  },
  chipText: {
    color: '#06222A',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  btn: {
    position: 'absolute',
    right: 10,
    zIndex: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(11,15,20,0.9)',
  },
  btnOn: {
    backgroundColor: 'rgba(0,213,221,0.18)',
    borderColor: 'rgba(0,213,221,0.55)',
  },
  btnStar: { color: '#CFD6DE', fontSize: 11 },
  btnText: { color: '#CFD6DE', fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
  btnTextOn: { color: '#7EE7EC' },
  legend: {
    position: 'absolute',
    left: 10,
    right: 10,
    top: 58,
    zIndex: 58,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(8,12,17,0.94)',
    borderWidth: 1,
    borderColor: 'rgba(0,213,221,0.3)',
  },
  legendText: { color: '#c9d2dc', fontSize: 11.5, lineHeight: 17 },
  legendBold: { color: '#fff', fontWeight: '700' },
  keys: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 5, marginTop: 8 },
  key: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  keyDot: { width: 8, height: 8, borderRadius: 3 },
  keyText: { color: '#8A93A0', fontSize: 8.5, fontWeight: '800', letterSpacing: 0.7 },
})
