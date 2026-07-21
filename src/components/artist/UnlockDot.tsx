import { View, StyleSheet } from 'react-native'
import { C } from '../../theme'

/** One-time blue notification dot for a newly unlocked "You & Artist" tab. */
export default function UnlockDot() {
  return <View style={s.dot} />
}

const s = StyleSheet.create({
  dot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: C.cyan },
})
