import { useLocalSearchParams } from 'expo-router'
import OliviaRodrigoArtistScreen from '../../src/screens/OliviaRodrigoArtistScreen'
import TaylorSwiftArtistScreen from '../../src/screens/TaylorSwiftArtistScreen'
import BTSArtistScreen from '../../src/screens/BTSArtistScreen'
import ArtistJourneyScreen from '../../src/screens/ArtistJourneyScreen'
import HannahJourneyGenericArtistScreen from '../../src/components/hannah-journey/HannahJourneyGenericArtistScreen'
import { useHannahJourney } from '../../src/context/HannahJourneyContext'
import { isHannahJourneyGenericArtist } from '../../src/data/hannahJourneyGenericArtists'

export default function ArtistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { isHannahJourney } = useHannahJourney()

  // Olivia Rodrigo, Taylor Swift, and BTS have fully hand-tuned reference
  // pages. Every other artist gets the same Olivia-style layout (hero top
  // bar, exclusives, journey eras, stats, lyrics, playlists), tailored from
  // their own data — lighter for artists we don't have much on.
  if (id === 'olivia-rodrigo') {
    return <OliviaRodrigoArtistScreen />
  }

  if (id === 'tswift') {
    return <TaylorSwiftArtistScreen />
  }

  if (id === 'bts') {
    return <BTSArtistScreen />
  }

  // Hannah Journey only: every other artist her own content (Landing rails,
  // Olivia's "Fans also like") can navigate to gets the same Olivia-template
  // layout — hero/tabs/Music-tab structure — tailored with that artist's own
  // real photos/songs/albums, instead of falling through to the generic
  // ArtistJourneyScreen every other persona still sees for these ids.
  if (isHannahJourney && isHannahJourneyGenericArtist(id)) {
    return <HannahJourneyGenericArtistScreen artistId={id as string} />
  }

  return <ArtistJourneyScreen id={id} />
}
