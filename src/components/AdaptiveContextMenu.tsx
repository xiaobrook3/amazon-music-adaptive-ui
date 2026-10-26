import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Modal, View, StyleSheet, Pressable, Animated, Easing } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from './AppText'
import { AppImage } from './AppImage'
import { useAdaptiveUI, type AdaptiveTarget } from '../context/AdaptiveUIContext'
import { useHannahJourney } from '../context/HannahJourneyContext'
import { albumArtAssets, resolveArtistAvatar } from '../data/assetMap'
import { C, R, typeHeadline, typeSubhead } from '../theme'

// ── Target helpers ──────────────────────────────────────────────────────────────

function resolveThumb(target: AdaptiveTarget): number | null {
  if (target.kind === 'artist') return resolveArtistAvatar(target.artistId, target.imageUri)
  if (target.kind === 'song') return target.song.albumArtPath ? albumArtAssets[target.song.albumArtPath] : null
  return target.playlist.coverArtPath ? albumArtAssets[target.playlist.coverArtPath] : null
}

function headerTitle(target: AdaptiveTarget): string {
  if (target.kind === 'artist') return target.name
  if (target.kind === 'song') return target.song.artistName
  return target.playlist.name
}

function headerSubtitle(target: AdaptiveTarget): string {
  if (target.kind === 'artist') return 'Artist'
  if (target.kind === 'song') return 'Song'
  return 'Playlist'
}

/** The name the Adaptive UI would center on for this target. */
function focusName(target: AdaptiveTarget): string {
  if (target.kind === 'artist') return target.name
  if (target.kind === 'song') return target.song.artistName
  return target.playlist.name
}

/** The blockable artist for a target, or null (playlists have no single artist). */
function removableArtist(target: AdaptiveTarget): { id: string; name: string } | null {
  if (target.kind === 'artist') return { id: target.artistId, name: target.name }
  if (target.kind === 'song') return { id: target.song.artistId, name: target.song.artistName }
  return null
}

function fallbackIcon(target: AdaptiveTarget): keyof typeof Ionicons.glyphMap {
  if (target.kind === 'artist') return 'person'
  if (target.kind === 'playlist') return 'musical-notes'
  return 'musical-note'
}

// ── Provider / hook ──────────────────────────────────────────────────────────────

type MenuContextValue = { open: (target: AdaptiveTarget) => void }

const MenuContext = createContext<MenuContextValue | null>(null)

export function useAdaptiveMenu(): MenuContextValue {
  const ctx = useContext(MenuContext)
  if (!ctx) throw new Error('useAdaptiveMenu must be used within AdaptiveMenuProvider')
  return ctx
}

const SHEET_OFFSET = 420

export function AdaptiveMenuProvider({ children }: { children: ReactNode }) {
  const { makeAdaptiveAbout, removeArtistFromAdaptive, blockedArtistIds, showConfirmation } = useAdaptiveUI()
  const { isHannahJourney, stage: hannahJourneyStage, forceSuperfan, unfollow } = useHannahJourney()
  const insets = useSafeAreaInsets()
  const [target, setTarget] = useState<AdaptiveTarget | null>(null)

  const translateY = useRef(new Animated.Value(SHEET_OFFSET)).current
  const backdrop = useRef(new Animated.Value(0)).current

  const open = useCallback((next: AdaptiveTarget) => setTarget(next), [])

  useEffect(() => {
    if (!target) return
    translateY.setValue(SHEET_OFFSET)
    backdrop.setValue(0)
    Animated.parallel([
      Animated.timing(backdrop, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 220,
        mass: 0.9,
      }),
    ]).start()
  }, [target, translateY, backdrop])

  const dismiss = useCallback(
    (after?: () => void) => {
      Animated.parallel([
        Animated.timing(backdrop, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(translateY, {
          toValue: SHEET_OFFSET,
          duration: 190,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTarget(null)
        after?.()
      })
    },
    [translateY, backdrop],
  )

  const thumb = target ? resolveThumb(target) : null
  const removable = target ? removableArtist(target) : null
  const isBlocked = removable ? blockedArtistIds.includes(removable.id) : false
  // Visible debug shortcut (not hidden, unlike the profile-switcher long-press) —
  // only on Olivia's own three-dot menu, only for Hannah's Journey, only before
  // she's already superfan.
  const showJumpToSuperfan =
    isHannahJourney &&
    !!target &&
    target.kind === 'artist' &&
    target.artistId === 'olivia-rodrigo' &&
    hannahJourneyStage !== 'superfan'

  const handleMakeAdaptive = useCallback(() => {
    if (!target) return
    const captured = target
    dismiss(() => makeAdaptiveAbout(captured))
  }, [target, dismiss, makeAdaptiveAbout])

  const handleRemove = useCallback(() => {
    if (!removable) return
    const id = removable.id
    dismiss(() => removeArtistFromAdaptive(id))
  }, [removable, dismiss, removeArtistFromAdaptive])

  const handleJumpToSuperfan = useCallback(() => {
    dismiss(() => forceSuperfan())
  }, [dismiss, forceSuperfan])

  // Olivia's menu, once she's followed: the way out, including from Super Fan, whose
  // button opens this menu rather than unfollowing on one tap.
  const showUnfollow =
    isHannahJourney &&
    !!target &&
    target.kind === 'artist' &&
    target.artistId === 'olivia-rodrigo' &&
    hannahJourneyStage !== 'new-listener'

  const handleUnfollow = useCallback(() => {
    dismiss(() => {
      unfollow()
      showConfirmation('Unfollowed Olivia')
    })
  }, [dismiss, unfollow, showConfirmation])

  return (
    <MenuContext.Provider value={{ open }}>
      {children}
      <Modal
        visible={!!target}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={() => dismiss()}
      >
        {target && (
          <View style={s.root}>
            <AnimatedPressable style={[s.backdrop, { opacity: backdrop }]} onPress={() => dismiss()} />

            <Animated.View
              style={[
                s.sheet,
                { paddingBottom: Math.max(insets.bottom, 16) + 8, transform: [{ translateY }] },
              ]}
            >
              <View style={s.grabber} />

              {/* Header — what you long-pressed */}
              <View style={s.header}>
                {thumb ? (
                  <AppImage
                    source={thumb}
                    style={[s.thumb, target.kind === 'artist' && s.thumbRound]}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[s.thumb, s.thumbFallback, target.kind === 'artist' && s.thumbRound]}>
                    <Ionicons name={fallbackIcon(target)} size={22} color="rgba(255,255,255,0.35)" />
                  </View>
                )}
                <View style={s.headerText}>
                  <Text style={s.headerTitle} numberOfLines={1}>{headerTitle(target)}</Text>
                  <Text style={s.headerSubtitle} numberOfLines={1}>{headerSubtitle(target)}</Text>
                </View>
              </View>

              <View style={s.divider} />

              {/* Make Adaptive UI about this */}
              <Pressable
                style={({ pressed }) => [s.action, pressed && s.actionPressed]}
                onPress={handleMakeAdaptive}
              >
                <View style={[s.actionIcon, s.actionIconAccent]}>
                  <Ionicons name="sparkles" size={17} color={C.cyan} />
                </View>
                <View style={s.actionText}>
                  <Text style={s.actionLabel}>Make Adaptive UI about this</Text>
                  <Text style={s.actionSub} numberOfLines={1}>
                    Reshape home around {focusName(target)}
                  </Text>
                </View>
              </Pressable>

              {/* Remove from Adaptive UI (artists & songs only) */}
              {removable && !isBlocked && (
                <Pressable
                  style={({ pressed }) => [s.action, pressed && s.actionPressed]}
                  onPress={handleRemove}
                >
                  <View style={s.actionIcon}>
                    <Ionicons name="remove-circle-outline" size={19} color={C.rose} />
                  </View>
                  <View style={s.actionText}>
                    <Text style={[s.actionLabel, { color: C.cyan }]}>Remove from Adaptive UI</Text>
                    <Text style={s.actionSub} numberOfLines={1}>
                      Stop {removable.name} from shaping your home
                    </Text>
                  </View>
                </Pressable>
              )}

              {/* Hannah Journey debug shortcut — Olivia's menu only, pre-superfan only */}
              {showJumpToSuperfan && (
                <Pressable
                  style={({ pressed }) => [s.action, pressed && s.actionPressed]}
                  onPress={handleJumpToSuperfan}
                >
                  <View style={[s.actionIcon, s.actionIconAccent]}>
                    <Ionicons name="star" size={17} color={C.cyan} />
                  </View>
                  <View style={s.actionText}>
                    <Text style={s.actionLabel}>Jump to Super Fan</Text>
                    <Text style={s.actionSub} numberOfLines={1}>
                      Skip ahead to the superfan stage
                    </Text>
                  </View>
                </Pressable>
              )}

              {showUnfollow && (
                <Pressable
                  style={({ pressed }) => [s.action, pressed && s.actionPressed]}
                  onPress={handleUnfollow}
                  accessibilityRole="button"
                >
                  <View style={s.actionIcon}>
                    <Ionicons name="heart-dislike-outline" size={18} color={C.rose} />
                  </View>
                  <View style={s.actionText}>
                    <Text style={s.actionLabel}>Unfollow Olivia</Text>
                    <Text style={s.actionSub} numberOfLines={1}>
                      Back to the page a new listener sees
                    </Text>
                  </View>
                </Pressable>
              )}

              <Pressable
                style={({ pressed }) => [s.cancel, pressed && s.actionPressed]}
                onPress={() => dismiss()}
              >
                <Text style={s.cancelText}>Cancel</Text>
              </Pressable>
            </Animated.View>
          </View>
        )}
      </Modal>
    </MenuContext.Provider>
  )
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const s = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: R.xl,
    borderTopRightRadius: R.xl,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: C.border,
  },
  grabber: {
    alignSelf: 'center',
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.22)',
    marginBottom: 14,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 4 },
  thumb: { width: 52, height: 52, borderRadius: R.sm, overflow: 'hidden' },
  thumbRound: { borderRadius: 26 },
  thumbFallback: { backgroundColor: C.elevated, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  headerTitle: { ...typeSubhead(17), color: C.textPrimary },
  headerSubtitle: { fontSize: 12, color: C.textMuted, marginTop: 3 },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 12 },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 11,
    paddingHorizontal: 4,
    borderRadius: R.md,
  },
  actionPressed: { backgroundColor: 'rgba(255,255,255,0.06)' },
  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconAccent: {
    backgroundColor: 'rgba(37, 209, 218, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(37, 209, 218, 0.32)',
  },
  actionText: { flex: 1 },
  actionLabel: { fontSize: 15, fontWeight: '600', color: C.textPrimary },
  actionSub: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  cancel: {
    marginTop: 10,
    paddingVertical: 13,
    borderRadius: R.full,
    backgroundColor: C.elevated,
    alignItems: 'center',
  },
  cancelText: { ...typeSubhead(15), color: C.textSecondary },
})
