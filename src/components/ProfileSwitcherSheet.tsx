import { Modal, View, TouchableOpacity, StyleSheet, Pressable, ScrollView, Dimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from './AppText'
import { AppImage as Image } from './AppImage'
import { useProfiles } from '../context/ProfilesContext'
import { useHannahJourney } from '../context/HannahJourneyContext'
import { hexWithAlpha } from '../utils/color'
import { C, typeHeadline, typeSubhead } from '../theme'

/**
 * Bottom-sheet profile switcher. Tapping the home avatar opens it; picking a
 * persona re-skins the whole app via ProfilesContext (Adaptive UI on/off + theme).
 */
export default function ProfileSwitcherSheet({
  visible,
  onClose,
}: {
  visible: boolean
  onClose: () => void
}) {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { profiles, activeProfile, setActiveProfileId, deleteCustomProfile } = useProfiles()
  const { isHannahJourney, restartJourney, forceSuperfan, stage: hannahJourneyStage } = useHannahJourney()

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={s.backdrop} onPress={onClose}>
        {/* Stop propagation so taps inside the sheet don't dismiss it */}
        <Pressable style={[s.sheet, { paddingBottom: insets.bottom + 12 }]} onPress={() => {}}>
          <View style={s.handle} />
          <Text style={s.title}>Switch profile</Text>
          <Text style={s.subtitle}>Each persona loads its own Adaptive UI</Text>

          {/* Scrolls only if the persona list outgrows the sheet (small screens / added profiles) */}
          <ScrollView style={s.listScroll} bounces={false} showsVerticalScrollIndicator={false}>
          <View style={s.list}>
            {profiles.map(p => {
              const active = p.id === activeProfile.id
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[s.row, active && s.rowActive]}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => {
                    setActiveProfileId(p.id)
                    onClose()
                  }}
                >
                  <View
                    style={[
                      s.avatar,
                      { backgroundColor: hexWithAlpha(p.color, 0.16), borderColor: p.color },
                    ]}
                  >
                    {p.image ? (
                      <Image source={p.image} style={s.avatarImg} resizeMode="cover" />
                    ) : (
                      <Text style={[s.avatarText, { color: p.color }]}>{p.initial}</Text>
                    )}
                  </View>

                  <View style={s.rowInfo}>
                    <Text style={s.name} numberOfLines={1}>{p.name}</Text>
                    <View style={s.tagRow}>
                      {p.adaptive ? (
                        <>
                          <Ionicons name="sparkles" size={11} color={C.cyan} />
                          <Text style={s.tagAdaptive} numberOfLines={1}>{p.tagline}</Text>
                        </>
                      ) : (
                        <Text style={s.tag} numberOfLines={1}>{p.tagline}</Text>
                      )}
                    </View>
                  </View>

                  <View style={s.rowRight}>
                    {active && <Ionicons name="checkmark-circle" size={22} color={C.cyan} />}
                    {p.id === 'custom' && (
                      <TouchableOpacity
                        onPress={deleteCustomProfile}
                        style={s.deleteBtn}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        accessibilityRole="button"
                        accessibilityLabel="Delete profile"
                      >
                        <Ionicons name="trash-outline" size={18} color={C.textMuted} />
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
          </ScrollView>

          {isHannahJourney && (
            // Hidden escape hatch: long-press jumps straight to superfan
            // (skips follow -> engaged -> reveal-popup) for testing/demo —
            // no visible hint, same as a normal tap otherwise resetting.
            <TouchableOpacity
              style={s.restartRow}
              activeOpacity={0.8}
              accessibilityRole="button"
              delayLongPress={600}
              onPress={() => {
                restartJourney()
                onClose()
              }}
              onLongPress={() => {
                forceSuperfan()
                onClose()
              }}
            >
              <View style={s.restartIcon}>
                <Ionicons name="refresh" size={18} color="#fff" />
              </View>
              <View style={s.rowInfo}>
                <Text style={s.name}>Restart Journey</Text>
                <Text style={s.tag}>
                  Reset to new listener · now {hannahJourneyStage.replace('-', ' ')}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Build your own */}
          <TouchableOpacity
            style={s.createRow}
            activeOpacity={0.8}
            accessibilityRole="button"
            onPress={() => {
              onClose()
              router.push('/create-profile' as any)
            }}
          >
            <View style={s.createIcon}>
              <Ionicons name="add" size={22} color={C.cyan} />
            </View>
            <View style={s.rowInfo}>
              <Text style={s.name}>Create your own</Text>
              <Text style={s.tag}>Name it and pick your superfan mix</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 14,
  },
  title: { ...typeHeadline(18), color: C.textPrimary },
  subtitle: { fontSize: 13, color: C.textSecondary, marginTop: 4, marginBottom: 14 },
  list: { gap: 4 },
  listScroll: { maxHeight: Math.round(Dimensions.get('window').height * 0.52) },
  restartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.12)',
  },
  restartIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(217,160,91,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  createRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: C.border,
    borderStyle: 'dashed',
  },
  createIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: hexWithAlpha(C.cyan, 0.5),
    backgroundColor: hexWithAlpha(C.cyan, 0.12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  rowActive: {
    backgroundColor: 'rgba(37,209,218,0.07)',
    borderLeftWidth: 2,
    borderLeftColor: C.cyan,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarText: { fontSize: 17, fontWeight: '700' },
  rowInfo: { flex: 1 },
  name: { ...typeSubhead(15), color: C.textPrimary },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  tag: { fontSize: 12, color: C.textMuted },
  tagAdaptive: { fontSize: 12, color: C.textSecondary },
})
