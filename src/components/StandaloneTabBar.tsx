import { View, TouchableOpacity, Image, StyleSheet } from 'react-native'
import { useRouter, usePathname } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from './AppText'
import MiniPlayer from './MiniPlayer'
import { navIconAssets, logoAssets } from '../data/assetMap'
import { C, FONT_FAMILY } from '../theme'

/**
 * A drop-in copy of the bottom tab bar (AmazonTabBar) for screens that live
 * OUTSIDE the (tabs) navigator — e.g. the podcast show page — so the nav bar
 * stays visible there. Tapping a tab routes back into the tab navigator.
 */
type TabDef = {
  path: string
  label: string
  activeIcon?: any
  inactiveIcon?: any
  logoSource?: any
}

const TABS: TabDef[] = [
  { path: '/',        label: 'Home',    activeIcon: navIconAssets.homeActive,    inactiveIcon: navIconAssets.homeInactive },
  { path: '/search',  label: 'Find',    activeIcon: navIconAssets.findActive,    inactiveIcon: navIconAssets.findInactive },
  { path: '/library', label: 'Library', activeIcon: navIconAssets.libraryActive, inactiveIcon: navIconAssets.libraryInactive },
  { path: '/maestro', label: 'Maestro', logoSource: logoAssets.alexa },
]

export default function StandaloneTabBar() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const pathname = usePathname()
  const paddingBottom = Math.max(insets.bottom, 8)

  return (
    <View style={[s.wrap, { paddingBottom }]}>
      <MiniPlayer embedded />
      <View style={s.tabRow}>
        {TABS.map(tab => {
          const isFocused = pathname === tab.path
          return (
            <TouchableOpacity
              key={tab.path}
              style={s.tabItem}
              onPress={() => router.navigate(tab.path as any)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={tab.label}
            >
              {tab.logoSource ? (
                <Image
                  source={tab.logoSource}
                  style={s.icon}
                  resizeMode="contain"
                  tintColor={isFocused ? C.navActive : C.navInactive}
                  alt=""
                />
              ) : (
                <Image
                  source={isFocused ? tab.activeIcon : tab.inactiveIcon}
                  style={s.icon}
                  resizeMode="contain"
                  alt=""
                />
              )}
              <Text style={[s.label, isFocused && s.labelActive]} numberOfLines={1}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  wrap: { backgroundColor: C.navBg },
  tabRow: {
    flexDirection: 'row',
    paddingTop: C.navPaddingTop,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
  },
  tabItem: { alignItems: 'center', gap: 3, width: C.navItemWidth },
  icon: { width: C.navIconSize, height: C.navIconSize },
  label: {
    width: '100%',
    fontFamily: FONT_FAMILY.regular,
    fontSize: C.navLabelSize,
    fontWeight: '400',
    color: C.navInactive,
    textAlign: 'center',
  },
  labelActive: { color: C.navActive },
})
