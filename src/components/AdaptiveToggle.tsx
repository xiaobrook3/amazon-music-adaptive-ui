import { TouchableOpacity, View, StyleSheet } from 'react-native'
import { Text } from './AppText'
import { useAdaptiveUI } from '../context/AdaptiveUIContext'
import { C } from '../theme'

export default function AdaptiveToggle() {
  const { adaptiveEnabled, setAdaptiveEnabled } = useAdaptiveUI()

  return (
    <View style={s.wrap}>
      <TouchableOpacity
        style={[s.track, adaptiveEnabled && s.trackOn]}
        onPress={() => setAdaptiveEnabled(!adaptiveEnabled)}
        activeOpacity={0.85}
        accessibilityRole="switch"
        accessibilityState={{ checked: adaptiveEnabled }}
        accessibilityLabel="Adaptive UI"
      >
        <View style={[s.thumb, adaptiveEnabled && s.thumbOn]} />
      </TouchableOpacity>
      <Text style={[s.label, adaptiveEnabled && s.labelOn]}>Adaptive UI</Text>
    </View>
  )
}

const s = StyleSheet.create({
  wrap: {
    width: 52,
    alignItems: 'center',
    gap: 3,
  },
  track: {
    width: 36,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    padding: 2,
    justifyContent: 'center',
  },
  trackOn: {
    backgroundColor: C.cyan,
  },
  thumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  thumbOn: {
    alignSelf: 'flex-end',
  },
  label: {
    fontSize: 10,
    color: C.textMuted,
    textAlign: 'center',
    lineHeight: 12,
  },
  labelOn: {
    color: C.textSecondary,
  },
})
