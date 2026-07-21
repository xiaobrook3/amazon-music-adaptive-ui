import { useState } from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from './AppText'
import { AppImage as Image } from './AppImage'
import ProfileSwitcherSheet from './ProfileSwitcherSheet'
import { useProfiles } from '../context/ProfilesContext'
import { hexWithAlpha } from '../utils/color'
import { C } from '../theme'

// Figma "insights_icon" glyph (node 1734:12551 in the Library reference,
// design_iterations/final_prototype_draft/specs/playlist-page-reference.reference.tsx)
// rasterized from playlist-page-reference-asset-14.svg — the three-bar
// insights icon, shown on a white rounded-square chip matching the Figma spec.
const insightsBarsIcon = require('../../assets/hannah-journey/insights-bars-icon.png')

export const LIBRARY_HEADER_BODY_HEIGHT = 48

type Props = {
  firstName: string
}

export function useStickyLibraryHeaderHeight() {
  const insets = useSafeAreaInsets()
  return insets.top + LIBRARY_HEADER_BODY_HEIGHT
}

export default function StickyLibraryHeader({ firstName }: Props) {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { activeProfile } = useProfiles()
  const [switcherOpen, setSwitcherOpen] = useState(false)

  return (
    <View style={[s.wrapper, { paddingTop: insets.top }]}>
      <View style={s.topBar}>
        {/* Same affordance as Home's avatar — opens the persona switcher */}
        <TouchableOpacity
          style={[
            s.avatarBtn,
            { borderColor: C.cyan, backgroundColor: hexWithAlpha(C.cyan, 0.14) },
          ]}
          onPress={() => setSwitcherOpen(true)}
        >
          {activeProfile.image ? (
            <Image source={activeProfile.image} style={s.avatarImg} resizeMode="cover" />
          ) : (
            <Text style={s.avatarText}>{activeProfile.initial}</Text>
          )}
        </TouchableOpacity>

        <View style={s.topActions}>
          <TouchableOpacity
            style={s.insightsBtn}
            onPress={() => router.push('/insights' as any)}
            accessibilityLabel="Insights"
          >
            <Image source={insightsBarsIcon} style={s.insightsIcon} resizeMode="contain" />
          </TouchableOpacity>
          <TouchableOpacity style={s.iconBtn} onPress={() => router.push('/announcement' as any)}>
            <Ionicons name="notifications-outline" size={22} color={C.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ProfileSwitcherSheet visible={switcherOpen} onClose={() => setSwitcherOpen(false)} />
    </View>
  )
}

const s = StyleSheet.create({
  wrapper: {
    backgroundColor: C.bg,
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    height: LIBRARY_HEADER_BODY_HEIGHT,
  },
  topActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightsBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#feffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightsIcon: { width: 13, height: 17 },
  avatarBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarText: { fontSize: 13, fontWeight: '700', color: C.cyan },
})
