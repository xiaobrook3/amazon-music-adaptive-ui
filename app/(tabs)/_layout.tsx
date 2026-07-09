import { View } from 'react-native'
import { Tabs } from 'expo-router'
import AmazonTabBar from '../../src/components/AmazonTabBar'

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        tabBar={(props) => <AmazonTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="index"   options={{ title: 'Home' }} />
        <Tabs.Screen name="search"  options={{ title: 'Find' }} />
        <Tabs.Screen name="library" options={{ title: 'Library' }} />
        <Tabs.Screen name="maestro" options={{ title: 'Maestro' }} />
      </Tabs>
    </View>
  )
}
