import { useState, Children, cloneElement, type ReactElement } from 'react'
import {
  View,
  StyleSheet,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { C } from '../theme'

/**
 * Wraps a single horizontal scroller (`<ScrollView horizontal>`, `<FlatList horizontal>`,
 * or `<HRail>`) and feathers its left/right edges into the surrounding canvas.
 *
 * Why: a horizontal rail whose content is wider than the viewport gets hard-clipped
 * at the edge — the last tile is sliced by a razor-straight line that reads as a
 * cropped image, not "scroll for more". This overlays a soft gradient mask on
 * whichever side still has off-screen content, so the row dissolves instead of
 * getting cut, and the mask disappears once you reach an end (nothing more that way).
 *
 * Usage — just wrap the scroller you already have:
 *   <EdgeFadeRow fadeColor={C.bg}>
 *     <ScrollView horizontal>{tiles}</ScrollView>
 *   </EdgeFadeRow>
 *
 * The wrapper injects onScroll/onLayout/onContentSizeChange via cloneElement and
 * *composes* them with any handlers the child already declares, so it never clobbers
 * existing scroll logic.
 */

type ScrollerElement = ReactElement<{
  scrollEventThrottle?: number
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void
  onLayout?: (e: LayoutChangeEvent) => void
  onContentSizeChange?: (w: number, h: number) => void
}>

type Props = {
  /** The horizontal scroller to feather. Must be a single element. */
  children: ScrollerElement
  /**
   * The color the edges blend into — must match the surface directly behind the
   * rail (e.g. C.bg on the dark canvas, C.surface inside a card). The mask fades
   * from this color to the same RGB at zero alpha, so it works on any solid bg.
   */
  fadeColor?: string
  /** Width of each edge mask in px. */
  fadeWidth?: number
  /** Style for the wrapping container (e.g. margins). */
  style?: StyleProp<ViewStyle>
}

/** Returns the given color at zero alpha, preserving its RGB. */
function toZeroAlpha(color: string): string {
  if (color.startsWith('#')) {
    const hex = color.replace('#', '')
    // support #rgb and #rrggbb
    const full = hex.length === 3 ? hex.split('').map(c => c + c).join('') : hex
    const r = parseInt(full.slice(0, 2), 16)
    const g = parseInt(full.slice(2, 4), 16)
    const b = parseInt(full.slice(4, 6), 16)
    return `rgba(${r},${g},${b},0)`
  }
  const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (m) return `rgba(${m[1]},${m[2]},${m[3]},0)`
  // Fading to `transparent` (rgba 0,0,0,0) can interpolate through black; only
  // used as a last resort for colors we can't parse.
  return 'transparent'
}

function compose<A extends unknown[]>(
  existing: ((...a: A) => void) | undefined,
  added: (...a: A) => void,
): (...a: A) => void {
  return (...a: A) => {
    existing?.(...a)
    added(...a)
  }
}

export function EdgeFadeRow({ children, fadeColor = C.bg, fadeWidth = 32, style }: Props) {
  const [viewportW, setViewportW] = useState(0)
  const [contentW, setContentW] = useState(0)
  const [scrollX, setScrollX] = useState(0)

  const canScroll = contentW > viewportW + 1
  const showLeft = canScroll && scrollX > 4
  const showRight = canScroll && scrollX < contentW - viewportW - 4

  const transparent = toZeroAlpha(fadeColor)

  const child = Children.only(children)
  const injected = cloneElement(child, {
    scrollEventThrottle: child.props.scrollEventThrottle ?? 16,
    onScroll: compose(child.props.onScroll, (e: NativeSyntheticEvent<NativeScrollEvent>) =>
      setScrollX(e.nativeEvent.contentOffset.x),
    ),
    onLayout: compose(child.props.onLayout, (e: LayoutChangeEvent) =>
      setViewportW(e.nativeEvent.layout.width),
    ),
    onContentSizeChange: compose(child.props.onContentSizeChange, (w: number) => setContentW(w)),
  })

  return (
    <View style={[styles.wrap, style]}>
      {injected}
      {showLeft && (
        <LinearGradient
          colors={[fadeColor, transparent]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.fade, { left: 0, width: fadeWidth }]}
          pointerEvents="none"
        />
      )}
      {showRight && (
        <LinearGradient
          colors={[transparent, fadeColor]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.fade, { right: 0, width: fadeWidth }]}
          pointerEvents="none"
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
  },
  fade: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    zIndex: 2,
  },
})

export default EdgeFadeRow
