import { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { Text } from './AppText'
import { useAdaptiveUI } from '../context/AdaptiveUIContext'
import { C, R } from '../theme'

export default function AdaptiveToast() {
  const { confirmationMessage, clearConfirmation } = useAdaptiveUI()

  useEffect(() => {
    if (!confirmationMessage) return
    const timer = setTimeout(clearConfirmation, 2200)
    return () => clearTimeout(timer)
  }, [confirmationMessage, clearConfirmation])

  if (!confirmationMessage) return null

  return (
    <View style={s.wrap} pointerEvents="none">
      <View style={s.toast}>
        <Text style={s.text}>{confirmationMessage}</Text>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 100,
    zIndex: 300,
    alignItems: 'center',
  },
  toast: {
    backgroundColor: 'rgba(24, 24, 24, 0.94)',
    borderRadius: R.md,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: 'rgba(37, 209, 218, 0.35)',
  },
  text: {
    fontSize: 14,
    color: C.textPrimary,
    textAlign: 'center',
  },
})
