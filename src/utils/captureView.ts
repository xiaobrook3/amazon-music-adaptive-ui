import type { RefObject } from 'react'
import type { View } from 'react-native'
import { captureRef } from 'react-native-view-shot'

/** Capture a view as a PNG file URI. The web version is captureView.web.ts; its
 *  `background` has no view-shot equivalent, so native ignores it. */
export function captureView(
  ref: RefObject<View | null>,
  quality = 1,
  _background: string | null = null,
): Promise<string> {
  return captureRef(ref, { format: 'png', quality, result: 'tmpfile' })
}
