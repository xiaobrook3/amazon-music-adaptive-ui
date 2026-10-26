import { Platform, Share } from 'react-native'
import * as Sharing from 'expo-sharing'
import { notifyToast } from '../context/AdaptiveUIContext'

// Native keeps the system share sheet. On web, react-native's Share and expo-sharing both
// need the Web Share API, which most desktop browsers lack, so every share button there
// either failed silently or said sharing was unavailable. These helpers use the Web Share
// API when the browser has it and otherwise copy the text, or download the image, and say so.

const isAbort = (e: unknown) => (e as { name?: string } | null)?.name === 'AbortError'

/** Share a line of text. */
export async function shareText(message: string): Promise<void> {
  if (Platform.OS !== 'web') {
    await Share.share({ message }).catch(() => {})
    return
  }
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ text: message })
      return
    } catch (e) {
      if (isAbort(e)) return
    }
  }
  try {
    await navigator.clipboard.writeText(message)
    notifyToast('Copied to your clipboard')
  } catch {
    notifyToast('Sharing is not available in this browser')
  }
}

/** Share a captured image (a file URI on native, a data URL on web). */
export async function shareImage(
  uri: string,
  { dialogTitle, filename }: { dialogTitle: string; filename: string },
): Promise<void> {
  if (Platform.OS !== 'web') {
    if (!(await Sharing.isAvailableAsync())) {
      notifyToast('Sharing is not available on this device')
      return
    }
    await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle })
    return
  }
  const blob = await (await fetch(uri)).blob()
  const file = new File([blob], filename, { type: 'image/png' })
  const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean }
  if (typeof nav.share === 'function' && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: dialogTitle })
      return
    } catch (e) {
      if (isAbort(e)) return
    }
  }
  const href = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = href
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(href), 1000)
  notifyToast('Saved your card as an image')
}
