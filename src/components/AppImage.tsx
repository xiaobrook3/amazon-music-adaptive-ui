import React from 'react'
import { Platform } from 'react-native'
import { Image as ExpoImage, ImageProps as ExpoImageProps } from 'expo-image'

/**
 * Drop-in replacement for react-native's <Image> backed by expo-image.
 *
 * Why: expo-image decodes to a right-sized bitmap, keeps a memory+disk cache
 * (so a thumbnail decoded once reappears instantly), and fades in instead of
 * popping from blank. It accepts the same `source={require(...)}` / `{uri}` and
 * `style` props we already use; this wrapper just translates the legacy
 * `resizeMode` prop to expo-image's `contentFit` so existing call sites work
 * unchanged when imported as `Image`.
 */
type ResizeMode = 'cover' | 'contain' | 'stretch' | 'center' | 'repeat'

const RESIZE_TO_FIT: Record<ResizeMode, ExpoImageProps['contentFit']> = {
  cover: 'cover',
  contain: 'contain',
  stretch: 'fill',
  center: 'none',
  repeat: 'cover',
}

export type AppImageProps = Omit<ExpoImageProps, 'contentFit'> & {
  resizeMode?: ResizeMode
  contentFit?: ExpoImageProps['contentFit']
}

export function AppImage({ resizeMode, contentFit, transition, cachePolicy, blurRadius, style, ...rest }: AppImageProps) {
  // expo-image silently ignores blurRadius on web — translate it to a CSS
  // filter there (with a slight scale so blurred edges don't vignette).
  // Callers already clip via overflow:hidden containers.
  const webBlurStyle =
    Platform.OS === 'web' && blurRadius
      ? ({ filter: `blur(${Math.min(blurRadius, 40)}px)`, transform: [{ scale: 1.15 }] } as any)
      : null
  return (
    <ExpoImage
      contentFit={contentFit ?? (resizeMode ? RESIZE_TO_FIT[resizeMode] : 'cover')}
      transition={transition ?? 150}
      cachePolicy={cachePolicy ?? 'memory-disk'}
      blurRadius={webBlurStyle ? undefined : blurRadius}
      style={webBlurStyle ? [style, webBlurStyle] : style}
      {...rest}
    />
  )
}

export default AppImage
