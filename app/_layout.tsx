import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Platform, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { PlaybackProvider } from '../src/hooks/usePlaybackState'
import { SavedSessionsProvider } from '../src/context/SavedSessionsContext'
import { LikedSongsProvider } from '../src/context/LikedSongsContext'
import { ArtistEngagementProvider } from '../src/context/ArtistEngagementContext'
import { AdaptiveUIProvider } from '../src/context/AdaptiveUIContext'
import { ProfilesProvider } from '../src/context/ProfilesContext'
import { HannahJourneyProvider } from '../src/context/HannahJourneyContext'
import { AdaptiveMenuProvider } from '../src/components/AdaptiveContextMenu'
import AdaptiveToast from '../src/components/AdaptiveToast'
import { C } from '../src/theme'

SplashScreen.preventAutoHideAsync()

const EMBER_FONTS: Record<string, number> = {}
try {
  if (Platform.OS === 'web') {
    // Browsers' OpenType sanitizer rejects the Ember Modern OTFs (they load
    // fine natively), so the hosted web build used to fall back to Amazon
    // Ember for every headline — the wrong typeface. Repacked as woff2, the
    // real Ember Modern faces parse in every browser, so web and native now
    // render the same families. Regenerate with scripts/build-web-fonts.py.
    EMBER_FONTS['EmberModernDisplay-Regular'] = require('../assets/fonts/EmberModern/EmberModernDisplay-Regular.woff2')
    EMBER_FONTS['EmberModernDisplay-Bold']    = require('../assets/fonts/EmberModern/EmberModernDisplay-Bold.woff2')
    EMBER_FONTS['EmberModernText-Regular']    = require('../assets/fonts/EmberModern/EmberModernText-Regular.woff2')
    EMBER_FONTS['EmberModernText-Bold']       = require('../assets/fonts/EmberModern/EmberModernText-Bold.woff2')
  } else {
    EMBER_FONTS['EmberModernDisplay-Regular'] = require('../assets/fonts/Amazon_Music_FONTS/Ember Modern 1.1/EmberModernDisplay-V1.1/EmberModernDisplayV1.1-Regular.otf')
    EMBER_FONTS['EmberModernDisplay-Bold']    = require('../assets/fonts/Amazon_Music_FONTS/Ember Modern 1.1/EmberModernDisplay-V1.1/EmberModernDisplayV1.1-Bold.otf')
    EMBER_FONTS['EmberModernText-Regular']    = require('../assets/fonts/Amazon_Music_FONTS/Ember Modern 1.1/EmberModernText-V1.1/EmberModernTextV1.1-Regular.otf')
    EMBER_FONTS['EmberModernText-Bold']       = require('../assets/fonts/Amazon_Music_FONTS/Ember Modern 1.1/EmberModernText-V1.1/EmberModernTextV1.1-Bold.otf')
  }
  EMBER_FONTS['AmazonEmber-Regular']        = require('../assets/fonts/Ember/AmazonEmber_Rg.ttf')
  EMBER_FONTS['AmazonEmber-Bold']           = require('../assets/fonts/Ember/AmazonEmber_Bd.ttf')
  EMBER_FONTS['AmazonEmber-Medium']         = require('../assets/fonts/Ember/Amazon-Ember-Medium.ttf')
} catch {
  // Font files missing — app falls back to system font
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts(EMBER_FONTS)

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync()
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  // Web: the phone prototype is designed for phone proportions — full-browser
  // width stretches every fixed-height hero into an ultra-wide crop. Constrain
  // the app to a centered phone-width column (native is untouched).
  const webFrame = Platform.OS === 'web' ? { width: '100%' as const, maxWidth: 480 } : null

  return (
    <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center' }}>
    <GestureHandlerRootView style={[{ flex: 1, backgroundColor: C.bg, width: '100%' }, webFrame]}>
      <PlaybackProvider>
        <SavedSessionsProvider>
          <LikedSongsProvider>
            <ArtistEngagementProvider>
            <AdaptiveUIProvider>
            <ProfilesProvider>
            <HannahJourneyProvider>
            <AdaptiveMenuProvider>
            <StatusBar style="light" backgroundColor="transparent" translucent />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: C.bg },
                animation: 'slide_from_right',
              }}
            >
              <Stack.Screen name="index" options={{ animation: 'fade' }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="music" />
              <Stack.Screen name="podcast" />
              <Stack.Screen name="podcast-category/[id]" />
              <Stack.Screen name="podcast-show/[id]" />
              <Stack.Screen name="podcast-player/[id]" options={{ animation: 'slide_from_bottom' }} />
              <Stack.Screen name="now-playing" options={{ animation: 'slide_from_bottom' }} />
              <Stack.Screen name="announcement" options={{ animation: 'slide_from_bottom' }} />
              <Stack.Screen name="artist/[id]" />
              <Stack.Screen name="playlist/[id]" />
              <Stack.Screen name="genre/[id]" />
              <Stack.Screen name="insights" />
              <Stack.Screen name="session/[id]" />
              <Stack.Screen name="artist-discography/[id]" />
              <Stack.Screen name="artist-lyrics/[id]" />
              <Stack.Screen name="artist-liked/[id]" />
              <Stack.Screen name="fan-group/[id]" />
              <Stack.Screen name="audible-book/[id]" />
              <Stack.Screen name="audible-category/[id]" />
              <Stack.Screen name="exclusive-offer/[id]" />
              <Stack.Screen name="liked" />
              <Stack.Screen name="frequent-plays" />
              <Stack.Screen name="create-profile" options={{ animation: 'slide_from_bottom' }} />
              <Stack.Screen name="create-fan-card" options={{ animation: 'slide_from_bottom' }} />
            </Stack>
            {/* Single global toast — screens fire confirmations via showConfirmation() */}
            <AdaptiveToast />
            </AdaptiveMenuProvider>
            </HannahJourneyProvider>
            </ProfilesProvider>
            </AdaptiveUIProvider>
            </ArtistEngagementProvider>
          </LikedSongsProvider>
        </SavedSessionsProvider>
      </PlaybackProvider>
    </GestureHandlerRootView>
    </View>
  )
}
