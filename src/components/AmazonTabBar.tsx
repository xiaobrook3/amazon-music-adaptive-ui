import { View, TouchableOpacity, Image, StyleSheet } from 'react-native'
import { Text } from './AppText'
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import MiniPlayer from './MiniPlayer'
import { navIconAssets, logoAssets } from '../data/assetMap'
import { C, FONT_FAMILY } from '../theme'

type TabDef = {
  name: string
  label: string
  activeIcon?: any
  inactiveIcon?: any
  /** When set, render this single logo tinted per focus state (e.g. the Alexa mark). */
  logoSource?: any
}

const TABS: TabDef[] = [
  {
    name: 'index',
    label: 'Home',
    activeIcon: navIconAssets.homeActive,
    inactiveIcon: navIconAssets.homeInactive,
  },
  {
    name: 'search',
    label: 'Find',
    activeIcon: navIconAssets.findActive,
    inactiveIcon: navIconAssets.findInactive,
  },
  {
    name: 'library',
    label: 'Library',
    activeIcon: navIconAssets.libraryActive,
    inactiveIcon: navIconAssets.libraryInactive,
  },
  {
    name: 'maestro',
    label: 'Maestro',
    logoSource: logoAssets.alexa,
  },
]

export default function AmazonTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()
  const paddingBottom = Math.max(insets.bottom, 8)

  return (
    <View style={[s.wrap, { paddingBottom }]}>
      <MiniPlayer embedded />
      <View style={s.tabRow}>
        {TABS.map(tab => {
          const routeIndex = state.routes.findIndex(r => r.name === tab.name)
          const isFocused = state.index === routeIndex

          const onPress = () => {
            if (routeIndex === -1) return
            const event = navigation.emit({
              type: 'tabPress',
              target: state.routes[routeIndex].key,
              canPreventDefault: true,
            })
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(state.routes[routeIndex].name)
            }
          }

          return (
            <TouchableOpacity
              key={tab.name}
              style={s.tabItem}
              onPress={onPress}
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
                />
              ) : (
                <Image
                  source={isFocused ? tab.activeIcon : tab.inactiveIcon}
                  style={s.icon}
                  resizeMode="contain"
                />
              )}
              <Text
                style={[s.label, isFocused && s.labelActive]}
                numberOfLines={1}
              >
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
  wrap: {
    backgroundColor: C.navBg,
  },
  tabRow: {
    flexDirection: 'row',
    paddingTop: C.navPaddingTop,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
  },
  tabItem: {
    alignItems: 'center',
    gap: 3,
    width: C.navItemWidth,
  },
  // Figma "Nav Bar" (node 28:239) specifies 31x31 icons, but that reads too
  // large on-device — reverted to the original shared size.
  icon: {
    width: C.navIconSize,
    height: C.navIconSize,
  },
  label: {
    width: '100%',
    fontFamily: FONT_FAMILY.regular,
    fontSize: C.navLabelSize,
    fontWeight: '400',
    color: C.navInactive,
    textAlign: 'center',
  },
  labelActive: {
    color: C.navActive,
  },
})
