import { useEffect, useMemo } from 'react'
import { useArtistEngagement } from '../context/ArtistEngagementContext'

type Options = {
  /** When true, hide the journey tab until follow + play + like are all earned. */
  gateTab: boolean
  /** When true, show the one-time blue dot after unlock (casual tier only). */
  showDot: boolean
  /** Liked-song ids for this artist — keeps `hasEverLiked` in sync with hearts. */
  artistSongIds?: readonly string[]
  likedSongIds?: ReadonlySet<string>
}

/**
 * Shared unlock + blue-dot logic for artist "You & …" sub-tabs.
 * Unlock requires follow, play, and like (each a one-way ratchet in
 * ArtistEngagementContext). The dot dismisses once the user opens the tab.
 */
export function useYouAndArtistUnlock(artistId: string, options: Options) {
  const {
    hasEverFollowed,
    markFollowed,
    hasEverPlayed,
    markPlayed,
    hasEverLiked,
    markLiked,
    hasSeenUnlock,
    markSeenUnlock,
  } = useArtistEngagement()

  const isUnlocked = useMemo(
    () =>
      !options.gateTab ||
      (hasEverFollowed(artistId) && hasEverPlayed(artistId) && hasEverLiked(artistId)),
    [options.gateTab, artistId, hasEverFollowed, hasEverPlayed, hasEverLiked],
  )

  const showUnlockDot = options.gateTab && options.showDot && isUnlocked && !hasSeenUnlock(artistId)

  useEffect(() => {
    if (!options.artistSongIds?.length || !options.likedSongIds) return
    const liked = options.artistSongIds.some(id => options.likedSongIds!.has(id))
    if (liked) markLiked(artistId)
  }, [artistId, options.artistSongIds, options.likedSongIds, markLiked])

  return {
    isUnlocked,
    showUnlockDot,
    markFollowed: () => markFollowed(artistId),
    markPlayed: () => markPlayed(artistId),
    markLiked: () => markLiked(artistId),
    hasEverFollowed: () => hasEverFollowed(artistId),
    hasSeenUnlock: () => hasSeenUnlock(artistId),
    dismissUnlockDot: () => markSeenUnlock(artistId),
  }
}

export function filterJourneyTab<T extends string>(
  tabs: readonly T[],
  journeyTab: T,
  isUnlocked: boolean,
): T[] {
  return isUnlocked ? [...tabs] : tabs.filter(t => t !== journeyTab)
}
