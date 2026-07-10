import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Text } from '../src/components/AppText'
import { C } from '../src/theme'

/**
 * Friendly dead-end for any route the prototype doesn't implement (replaces
 * Expo Router's default "Unmatched Route" screen). Every path out is one tap:
 * Home, or straight to the adaptive artist profile — the flagship flow.
 */
export default function NotFound() {
  const router = useRouter()
  return (
    <View style={s.screen}>
      <Text style={s.kicker}>AMAZON MUSIC · ADAPTIVE UI</Text>
      <Text style={s.title}>This corner isn't built yet</Text>
      <Text style={s.sub}>
        You've reached a path this prototype doesn't cover. The working flows
        are one tap away:
      </Text>
      <TouchableOpacity
        style={[s.btn, s.btnPrimary]}
        activeOpacity={0.85}
        onPress={() => router.replace('/artist/olivia-rodrigo' as any)}
      >
        <Text style={s.btnPrimaryText}>Open the adaptive artist profile</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={s.btn}
        activeOpacity={0.85}
        onPress={() => router.replace('/' as any)}
      >
        <Text style={s.btnText}>Go to Home</Text>
      </TouchableOpacity>
      <Text style={s.foot}>DERBC Studio · CMU MHCI 2026 × Amazon Music</Text>
    </View>
  )
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  kicker: {
    color: C.cyanBright ?? '#25D1DA',
    fontSize: 11,
    letterSpacing: 1.4,
    fontWeight: '700',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  sub: {
    color: '#A6A6A6',
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 10,
    maxWidth: 300,
  },
  btn: {
    minWidth: 260,
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
  },
  btnPrimary: {
    backgroundColor: '#25D1DA',
    borderColor: '#25D1DA',
  },
  btnPrimaryText: {
    color: '#06222A',
    fontSize: 14,
    fontWeight: '700',
  },
  btnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  foot: {
    color: '#5c6570',
    fontSize: 11,
    marginTop: 14,
  },
})
