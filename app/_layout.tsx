import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect, useRef } from 'react'
import { PlaybackProvider, usePlaybackState } from '../src/hooks/usePlaybackState'
import { SavedSessionsProvider } from '../src/context/SavedSessionsContext'
import { LikedSongsProvider, useLikedSongs } from '../src/context/LikedSongsContext'
import { AdaptiveUIProvider } from '../src/context/AdaptiveUIContext'
import { ProfilesProvider } from '../src/context/ProfilesContext'
import { AdaptiveMenuProvider } from '../src/components/AdaptiveContextMenu'
import AdaptiveToast from '../src/components/AdaptiveToast'
import { songs } from '../src/data/mockData'
import { installWebHorizontalDrag } from '../src/utils/webHorizontalDrag'
import { C } from '../src/theme'

SplashScreen.preventAutoHideAsync()

// Web: horizontal rails must drag with a finger or mouse, not just a wheel.
installWebHorizontalDrag()

const EMBER_FONTS: Record<string, number> = {}
try {
  EMBER_FONTS['EmberModernDisplay-Regular'] = require('../assets/fonts/Amazon_Music_FONTS/Ember Modern 1.1/EmberModernDisplay-V1.1/EmberModernDisplayV1.1-Regular.otf')
  EMBER_FONTS['EmberModernDisplay-Bold']    = require('../assets/fonts/Amazon_Music_FONTS/Ember Modern 1.1/EmberModernDisplay-V1.1/EmberModernDisplayV1.1-Bold.otf')
  EMBER_FONTS['EmberModernText-Regular']    = require('../assets/fonts/Amazon_Music_FONTS/Ember Modern 1.1/EmberModernText-V1.1/EmberModernTextV1.1-Regular.otf')
  EMBER_FONTS['EmberModernText-Bold']       = require('../assets/fonts/Amazon_Music_FONTS/Ember Modern 1.1/EmberModernText-V1.1/EmberModernTextV1.1-Bold.otf')
} catch {
  // Font files missing — app falls back to system font
}

/**
 * Auto-likes whatever song is currently playing. Every entry point that plays a
 * song funnels through `currentSongIdx`, so opening/playing any song adds it to
 * Liked Songs. Passive track changes (the provider's timer auto-advancing at the
 * end of a song) are ignored via `manualChangeRef` so Liked Songs only reflects
 * tracks the user actually chose. `addLike` is idempotent so re-playing a liked
 * song never un-likes it.
 */
function AutoLikeCurrentSong() {
  const { currentSongIdx, manualChangeRef } = usePlaybackState()
  const { addLike } = useLikedSongs()
  const mounted = useRef(false)
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    const song = songs[currentSongIdx]
    if (song && manualChangeRef.current) addLike(song.id)
    // Only re-run when the playing track changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSongIdx])
  return null
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts(EMBER_FONTS)

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync()
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: C.bg }}>
      <PlaybackProvider>
        <SavedSessionsProvider>
          <LikedSongsProvider>
            <AdaptiveUIProvider>
            <ProfilesProvider>
            <AdaptiveMenuProvider>
            <AutoLikeCurrentSong />
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
              <Stack.Screen name="session/[id]" />
              <Stack.Screen name="artist-discography/[id]" />
              <Stack.Screen name="liked" />
              <Stack.Screen name="create-profile" options={{ animation: 'slide_from_bottom' }} />
            </Stack>
            {/* Single global toast — screens fire confirmations via showConfirmation() */}
            <AdaptiveToast />
            </AdaptiveMenuProvider>
            </ProfilesProvider>
            </AdaptiveUIProvider>
          </LikedSongsProvider>
        </SavedSessionsProvider>
      </PlaybackProvider>
    </GestureHandlerRootView>
  )
}
