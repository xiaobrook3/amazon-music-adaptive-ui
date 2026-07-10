import { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Text } from '../../src/components/AppText'
import { usePlaybackState } from '../../src/hooks/usePlaybackState'
import { songs } from '../../src/data/mockData'

/**
 * Radio station route — the home "Radio stations" rail pushes /radio/radio-<songId>.
 * A station is lean-back playback: seed from the station's song, start playing,
 * and hand off to Now Playing. (Previously this path had no route at all and
 * every station tap dead-ended on Unmatched Route.)
 */
export default function RadioStation() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { playSongAt } = usePlaybackState()

  useEffect(() => {
    const seedId = (id ?? '').replace(/^radio-/, '')
    const seed = songs.find(s => s.id === seedId) ?? songs[0]
    playSongAt(seed.id)
    // replace, not push — Back from Now Playing should return to Home, not replay the tune-in
    const t = setTimeout(() => router.replace('/now-playing' as any), 60)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const seedId = (id ?? '').replace(/^radio-/, '')
  const seed = songs.find(s => s.id === seedId) ?? songs[0]

  return (
    <View style={s.screen}>
      <Text style={s.kicker}>STATION</Text>
      <Text style={s.title}>{seed.album} Radio</Text>
      <Text style={s.sub}>Tuning in — songs in the spirit of “{seed.title}”</Text>
    </View>
  )
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 32 },
  kicker: { color: '#25D1DA', fontSize: 11, letterSpacing: 1.4, fontWeight: '700' },
  title: { color: '#fff', fontSize: 22, fontWeight: '700', textAlign: 'center' },
  sub: { color: '#A6A6A6', fontSize: 13, textAlign: 'center' },
})
