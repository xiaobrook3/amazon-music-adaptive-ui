import React, { useEffect, useMemo } from 'react'
import { Platform, View } from 'react-native'
import { useRouter } from 'expo-router'
import { listenerStateFor } from '../../data/artistPages'
import { useAdaptiveUI } from '../../context/AdaptiveUIContext'
import { exportBase } from '../../utils/exportBase'
import ArtistJourneyScreen from '../../screens/ArtistJourneyScreen'

/**
 * Generalized artist route — every artist except the hand-tuned Olivia
 * flagship renders the adaptive artist profile page (public/
 * adaptive-artist-profile.html) in-client, hydrated from artist-registry.js.
 * Same embed contract as the flagship: the page drops its chrome/moderator
 * console (?embed=1) and hands navigation back via postMessage — v3-back,
 * v3-nav, plus v3-artist for "Fans also like" hops between profiles.
 *
 * On native (Expo Go / simulators) the existing ArtistJourneyScreen renders
 * unchanged.
 */

const NAV_ROUTES: Record<string, string> = {
  Home: '/',
  Find: '/search',
  Library: '/library',
  Maestro: '/maestro',
}

const DEEP_TABS = ['you', 'about', 'events', 'merch']

export default function AdaptiveArtistEmbed({ artistId, tab }: { artistId: string; tab?: string }) {
  const router = useRouter()
  const { lensOn } = useAdaptiveUI()

  // Resolve the embed URL relative to wherever the export is hosted
  // (works at "/" and under a sub-path like "/adaptive-ui/").
  const src = useMemo(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return ''
    const base = exportBase()
    const state = listenerStateFor(artistId)
    const deepTab = tab && DEEP_TABS.includes(tab) ? `&tab=${tab}` : ''
    const lens = lensOn ? '&lens=1' : ''
    return `${base}adaptive-artist-profile.html?embed=1&artist=${encodeURIComponent(artistId)}&state=${state}${deepTab}${lens}`
  }, [artistId, tab, lensOn])

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
      } else if (d.type === 'v3-artist' && typeof d.artist === 'string') {
        router.push(`/artist/${d.artist}` as any)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [router])

  if (Platform.OS !== 'web') {
    return <ArtistJourneyScreen id={artistId} />
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {React.createElement('iframe', {
        src,
        title: 'Adaptive artist profile',
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
