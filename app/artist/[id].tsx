import { useLocalSearchParams } from 'expo-router'
import OliviaRodrigoArtistScreen from '../../src/screens/OliviaRodrigoArtistScreen'
import TaylorSwiftArtistScreen from '../../src/screens/TaylorSwiftArtistScreen'
import ArtistJourneyScreen from '../../src/screens/ArtistJourneyScreen'

export default function ArtistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  if (id === 'olivia-rodrigo') {
    return <OliviaRodrigoArtistScreen />
  }

  if (id === 'tswift') {
    return <TaylorSwiftArtistScreen />
  }

  return <ArtistJourneyScreen id={id} />
}
