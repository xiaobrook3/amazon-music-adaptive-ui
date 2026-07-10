import { useLocalSearchParams } from 'expo-router'
import OliviaAdaptiveArtist from '../../src/components/artist/OliviaAdaptiveArtist'
import TaylorSwiftArtistScreen from '../../src/screens/TaylorSwiftArtistScreen'
import ArtistJourneyScreen from '../../src/screens/ArtistJourneyScreen'

export default function ArtistScreen() {
  const { id, tab } = useLocalSearchParams<{ id: string; tab?: string }>()

  if (id === 'olivia-rodrigo') {
    // Web: refined adaptive artist profile (v3) embedded in-client.
    // Native (Expo Go / simulator): the hand-tuned screen, unchanged.
    return <OliviaAdaptiveArtist tab={typeof tab === 'string' ? tab : undefined} />
  }

  if (id === 'tswift') {
    return <TaylorSwiftArtistScreen />
  }

  return <ArtistJourneyScreen id={id} />
}
