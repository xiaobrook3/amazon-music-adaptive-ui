import { useRef, useMemo, useState, useEffect } from 'react'
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from './AppText'
import ProfileSwitcherSheet from './ProfileSwitcherSheet'
import { useProfiles } from '../context/ProfilesContext'
import { hexWithAlpha } from '../utils/color'
import { C } from '../theme'

const CONTENT_PILLS = ['Music', 'Podcast', 'Audible'] as const

export const STICKY_HEADER_BODY_HEIGHT = 48

/**
 * Drill-down domain nav. When `domain` is null the three domain pills show; tap
 * one and the others collapse, a back arrow appears, and the domain becomes a
 * two-segment toggle (domain browse vs the tailored `subLabel` cut).
 */
export type DomainNav = {
  domains: readonly string[]
  domain: number | null
  focus: number
  subLabel: string
  onSelectDomain: (i: number) => void
  onBack: () => void
  onFocus: (i: number) => void
}

type Props = {
  firstName: string
  activePill: number | null
  onPillChange: (index: number) => void
  scrollY: Animated.Value
  /** When provided, the pill row becomes a dynamic domain drill-down. */
  domainNav?: DomainNav
}

export function useStickyHomeHeaderHeight() {
  const insets = useSafeAreaInsets()
  return insets.top + STICKY_HEADER_BODY_HEIGHT
}

export function useStickyHomeScroll() {
  const scrollY = useRef(new Animated.Value(0)).current
  const onScroll = useMemo(
    () =>
      Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false },
      ),
    [scrollY],
  )
  return { scrollY, onScroll }
}

const SEG_W = 94

/** Two-segment control with an accent indicator that springs left↔right. */
function SegToggle({
  labels,
  active,
  onSelect,
  accent,
}: {
  labels: [string, string]
  active: number
  onSelect: (i: number) => void
  accent: string
}) {
  const anim = useRef(new Animated.Value(active)).current
  useEffect(() => {
    Animated.spring(anim, { toValue: active, useNativeDriver: true, damping: 20, stiffness: 240, mass: 0.7 }).start()
  }, [active, anim])
  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, SEG_W] })
  return (
    <View style={s.segTrack}>
      <Animated.View
        style={[s.segIndicator, { backgroundColor: accent, transform: [{ translateX }] }]}
        pointerEvents="none"
      />
      {labels.map((label, i) => (
        <TouchableOpacity key={label} style={s.seg} activeOpacity={0.85} onPress={() => onSelect(i)}>
          <Text style={[s.segLabel, i === active && s.segLabelActive]} numberOfLines={1}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

export default function StickyHomeHeader({ firstName, activePill, onPillChange, scrollY, domainNav }: Props) {
  const insets = useSafeAreaInsets()
  const { activeProfile } = useProfiles()
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const fallbackScrollY = useRef(new Animated.Value(0)).current
  const animatedScrollY = scrollY ?? fallbackScrollY

  const frostOpacity = animatedScrollY.interpolate({
    inputRange: [0, 24, 100],
    outputRange: [0, 0.18, 0.52],
    extrapolate: 'clamp',
  })

  const borderOpacity = animatedScrollY.interpolate({
    inputRange: [0, 60, 120],
    outputRange: [0, 0, 0.12],
    extrapolate: 'clamp',
  })

  return (
    <View style={[s.wrapper, { paddingTop: insets.top }]} pointerEvents="box-none">
      {/* Gradient frost: transparent at the top (status-bar area) → dark at the bottom (pill row) */}
      <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: frostOpacity }]}>
        <LinearGradient
          colors={['transparent', 'rgba(8,8,14,0.96)']}
          locations={[0, 1]}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>
      <Animated.View
        style={[
          s.borderLine,
          { opacity: borderOpacity },
        ]}
      />
      <View style={s.topBar}>
        {/* Avatar reflects the active persona and opens the profile switcher.
            (Adaptive UI is now driven by the chosen profile, so the old toggle
            pill has been removed.) */}
        <TouchableOpacity
          style={[
            s.avatarBtn,
            { borderColor: C.cyan, backgroundColor: hexWithAlpha(C.cyan, 0.14) },
          ]}
          onPress={() => setSwitcherOpen(true)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Switch profile, current: ${activeProfile.name}`}
        >
          <Text style={[s.avatarText, { color: C.cyan }]}>{activeProfile.initial}</Text>
        </TouchableOpacity>

        {domainNav ? (
          <View style={s.pillRow}>
            {domainNav.domain === null ? (
              // Level 1 — pick a domain
              domainNav.domains.map((d, i) => (
                <TouchableOpacity
                  key={d}
                  style={s.contentPill}
                  onPress={() => domainNav.onSelectDomain(i)}
                  activeOpacity={0.8}
                >
                  <Text style={s.contentPillLabel}>{d}</Text>
                </TouchableOpacity>
              ))
            ) : (
              // Level 2 — back + [domain | subLabel] segmented toggle
              <>
                <TouchableOpacity
                  style={s.backPill}
                  onPress={domainNav.onBack}
                  activeOpacity={0.8}
                  hitSlop={6}
                  accessibilityRole="button"
                  accessibilityLabel="Back to all"
                >
                  <Ionicons name="chevron-back" size={20} color="#fff" />
                </TouchableOpacity>
                <SegToggle
                  labels={[domainNav.domains[domainNav.domain], domainNav.subLabel]}
                  active={domainNav.focus}
                  onSelect={domainNav.onFocus}
                  accent={C.cyan}
                />
              </>
            )}
          </View>
        ) : (
          <View style={s.pillRow}>
            {CONTENT_PILLS.map((pill, i) => {
              const isActive = i === activePill
              return (
                <TouchableOpacity
                  key={pill}
                  style={[s.contentPill, isActive && s.contentPillActive]}
                  onPress={() => onPillChange(i)}
                  activeOpacity={0.8}
                >
                  <Text style={[s.contentPillLabel, isActive && s.contentPillLabelActive]}>{pill}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        )}
      </View>

      <ProfileSwitcherSheet visible={switcherOpen} onClose={() => setSwitcherOpen(false)} />
    </View>
  )
}

const s = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: 'hidden',
  },
  borderLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    gap: 15,
    height: STICKY_HEADER_BODY_HEIGHT,
  },
  pillRow: { flex: 1, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 6 },
  backPill: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segTrack: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 17,
    padding: 3,
    height: 34,
    position: 'relative',
  },
  segIndicator: {
    position: 'absolute',
    top: 3,
    left: 3,
    width: SEG_W,
    height: 28,
    borderRadius: 14,
  },
  seg: { width: SEG_W, alignItems: 'center', justifyContent: 'center' },
  segLabel: { fontSize: 14, fontWeight: '600', color: '#fff' },
  segLabelActive: { color: '#000', fontWeight: '700' },
  contentPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  contentPillActive: {
    backgroundColor: C.cyan,
  },
  contentPillLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  contentPillLabelActive: {
    color: '#000000',
    fontWeight: '700',
  },
  avatarBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 13, fontWeight: '700', color: C.cyan },
})
