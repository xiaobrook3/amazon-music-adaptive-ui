import React from 'react'
import { FlatList, FlatListProps } from 'react-native'

/**
 * Horizontal, virtualized rail — a drop-in replacement for the
 * `<ScrollView horizontal>{items.map(...)}</ScrollView>` pattern.
 *
 * A plain horizontal ScrollView mounts and decodes every tile up front, even the
 * ones scrolled off the right edge. FlatList only mounts a small window and
 * recycles tiles as they scroll in, so a rail with 20 covers renders ~4 to start
 * instead of 20. Nesting a *horizontal* list inside the page's *vertical*
 * ScrollView is supported and warning-free (different orientation).
 */
export function HRail<T>(props: FlatListProps<T>) {
  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      removeClippedSubviews
      initialNumToRender={4}
      maxToRenderPerBatch={4}
      windowSize={5}
      {...props}
    />
  )
}

export default HRail
