import type { RefObject } from 'react'
import type { View } from 'react-native'
import html2canvas from 'html2canvas'

// react-native-view-shot's captureRef calls findNodeHandle, which react-native-web 0.21
// no longer has, so on web every capture threw and every card share failed. On web a
// View's ref is its DOM element, so render that with html2canvas directly.

/** Capture a view as a PNG data URL. `background` fills what the view leaves
 *  transparent, for views that sit on the page's color rather than their own. */
export async function captureView(
  ref: RefObject<View | null>,
  _quality = 1,
  background: string | null = null,
): Promise<string> {
  const node = ref.current as unknown as HTMLElement | null
  if (!node) throw new Error('Nothing to capture')
  const canvas = await html2canvas(node, {
    backgroundColor: background,
    scale: Math.min(window.devicePixelRatio || 1, 2),
  })
  return canvas.toDataURL('image/png')
}
