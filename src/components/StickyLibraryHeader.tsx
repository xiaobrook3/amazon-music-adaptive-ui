import { useState } from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from './AppText'
import ProfileSwitcherSheet from './ProfileSwitcherSheet'
import { useProfiles } from '../context/ProfilesContext'
import { C } from '../theme'

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
        <TouchableOpacity style={s.avatarBtn} onPress={() => setSwitcherOpen(true)}>
          <Text style={s.avatarText}>{activeProfile.initial}</Text>
        </TouchableOpacity>

        <View style={s.topActions}>
          <TouchableOpacity style={s.iconBtn} onPress={() => router.push('/genre/Charts' as any)}>
            <Ionicons name="stats-chart-outline" size={22} color={C.textPrimary} />
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
  avatarBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 13, fontWeight: '700', color: C.cyan },
})
