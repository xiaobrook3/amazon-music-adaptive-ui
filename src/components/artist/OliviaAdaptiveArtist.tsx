import React, { useEffect, useMemo } from 'react'
import { Platform, View } from 'react-native'
import { useRouter } from 'expo-router'
import OliviaRodrigoArtistScreen from '../../screens/OliviaRodrigoArtistScreen'
import { exportBase } from '../../utils/exportBase'
import { useAdaptiveUI } from '../../context/AdaptiveUIContext'

/**
 * Olivia Rodrigo artist route — refined adaptive artist profile.
 *
 * On web this embeds the hi-fi v3 adaptive artist page (public/adaptive-artist-v3.html,
 * served alongside the export) so the artist profile and the adaptive home ship as one
 * client. The page runs in `?embed=1` mode: it drops its own phone chrome / moderator
 * console and hands navigation back to the app via postMessage (v3-back / v3-nav).
 *
 * On native (Expo Go / simulators) the existing hand-tuned OliviaRodrigoArtistScreen
 * renders unchanged.
 */

const NAV_ROUTES: Record<string, string> = {
  Home: '/',
  Find: '/search',
  Library: '/library',
  Maestro: '/maestro',
}

// Tabs the embedded page can deep-link to (?tab=…), e.g. Home's "Top 1% listener"
// lands in You & Olivia and the tour card lands in Events.
const DEEP_TABS = ['you', 'about', 'events', 'merch']

export default function OliviaAdaptiveArtist({ tab }: { tab?: string }) {
  const router = useRouter()
  const { lensOn } = useAdaptiveUI()

  // Resolve the embed URL relative to wherever the export is hosted
  // (works at "/" and under a sub-path like "/adaptive-ui/"). exportBase()
  // reads the entry bundle's URL, not location.pathname — the pathname can
  // still be the previous route (e.g. /search) mid-transition, which 404'd
  // the embed when the profile was opened from Find.
  const src = useMemo(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return ''
    const base = exportBase()
    const deepTab = tab && DEEP_TABS.includes(tab) ? `&tab=${tab}` : ''
    const lens = lensOn ? '&lens=1' : ''
    return `${base}adaptive-artist-v3.html?embed=1&state=superfan${deepTab}${lens}`
  }, [tab, lensOn])

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return
    const onMessage = (e: MessageEvent) => {
      const d = e?.data
      if (!d || typeof d !== 'object') return
      if (d.type === 'v3-back') {
        if (router.canGoBack()) router.back()
        else router.navigate('/')
      } else if (d.type === 'v3-nav') {
        const to = NAV_ROUTES[d.nav as string]
        if (to) router.navigate(to as any)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [router])

  if (Platform.OS !== 'web') {
    return <OliviaRodrigoArtistScreen />
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {React.createElement('iframe', {
        src,
        title: 'Olivia Rodrigo — adaptive artist profile',
        allow: 'autoplay',
        style: {
          border: 0,
          width: '100%',
          height: '100%',
          display: 'block',
          background: '#000',
        },
      } as any)}
    </View>
  )
}
