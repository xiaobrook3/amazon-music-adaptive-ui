import { View } from 'react-native'
import { Tabs } from 'expo-router'
import AmazonTabBar from '../../src/components/AmazonTabBar'
import { LensMark, LensButton, LensLegend } from '../../src/components/AdaptiveLens'

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        tabBar={(props) => (
          <LensMark type="fixed" note="global nav; never moves">
            <AmazonTabBar {...props} />
          </LensMark>
        )}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="index"   options={{ title: 'Home' }} />
        <Tabs.Screen name="search"  options={{ title: 'Find' }} />
        <Tabs.Screen name="library" options={{ title: 'Library' }} />
        <Tabs.Screen name="maestro" options={{ title: 'Maestro' }} />
      </Tabs>
      <LensButton />
      <LensLegend />
    </View>
  )
}
