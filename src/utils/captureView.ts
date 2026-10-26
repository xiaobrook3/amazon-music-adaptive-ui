import type { RefObject } from 'react'
import type { View } from 'react-native'
import { captureRef } from 'react-native-view-shot'

/** Capture a view as a PNG file URI. The web version is captureView.web.ts. */
export function captureView(ref: RefObject<View | null>, quality = 1): Promise<string> {
  return captureRef(ref, { format: 'png', quality, result: 'tmpfile' })
}
