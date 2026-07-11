import { useLocalSearchParams } from 'expo-router'
import OliviaRodrigoArtistScreen from '../../src/screens/OliviaRodrigoArtistScreen'
import TaylorSwiftArtistScreen from '../../src/screens/TaylorSwiftArtistScreen'
import ArtistJourneyScreen from '../../src/screens/ArtistJourneyScreen'

// One React artist page everywhere — the same screens render on web and on
// Expo Go. Olivia and Taylor keep their hand-tuned screens; every other
// artist gets the adaptive journey screen, which stages itself to the
// listener's relationship with that artist.
export default function ArtistScreen() {
  const { id, tab } = useLocalSearchParams<{ id: string; tab?: string }>()
  const deepTab = typeof tab === 'string' ? tab : undefined

  if (id === 'olivia-rodrigo') {
    return <OliviaRodrigoArtistScreen initialTab={deepTab} />
  }

  if (id === 'tswift') {
    return <TaylorSwiftArtistScreen />
  }

  return <ArtistJourneyScreen id={id ?? ''} initialTab={deepTab} />
}
