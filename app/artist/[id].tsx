import { Platform } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import OliviaAdaptiveArtist from '../../src/components/artist/OliviaAdaptiveArtist'
import AdaptiveArtistEmbed from '../../src/components/artist/AdaptiveArtistEmbed'
import TaylorSwiftArtistScreen from '../../src/screens/TaylorSwiftArtistScreen'
import ArtistJourneyScreen from '../../src/screens/ArtistJourneyScreen'

export default function ArtistScreen() {
  const { id, tab } = useLocalSearchParams<{ id: string; tab?: string }>()
  const deepTab = typeof tab === 'string' ? tab : undefined

  if (id === 'olivia-rodrigo') {
    // Web: the hand-tuned adaptive artist flagship (v3) embedded in-client.
    // Native (Expo Go / simulator): the hand-tuned screen, unchanged.
    return <OliviaAdaptiveArtist tab={deepTab} />
  }

  if (Platform.OS === 'web') {
    // Every other artist: the generalized profile page — same content
    // placement, grammar, and lens vocabulary as the flagship, hydrated
    // from the artist registry. Search, rails, and fan groups all land here.
    return <AdaptiveArtistEmbed artistId={id ?? ''} tab={deepTab} />
  }

  if (id === 'tswift') {
    return <TaylorSwiftArtistScreen />
  }

  return <ArtistJourneyScreen id={id} />
}
