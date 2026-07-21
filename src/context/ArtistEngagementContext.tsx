import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react'

/**
 * Tracks, per artist, whether a listener has ever followed / played / liked
 * something of theirs, plus whether they've already seen the one-time
 * "You & Artist" unlock glow. Each flag is a one-way ratchet — once earned it
 * stays earned even if the listener later unfollows or unlikes — because the
 * tab shouldn't retroactively re-lock itself. In-memory only (matches every
 * other piece of state in this app; resets on a full reload), scoped to the
 * whole session rather than per-profile, same as LikedSongsContext.
 */
type ArtistEngagementContextValue = {
  hasEverFollowed: (artistId: string) => boolean
  markFollowed: (artistId: string) => void
  hasEverPlayed: (artistId: string) => boolean
  markPlayed: (artistId: string) => void
  hasEverLiked: (artistId: string) => boolean
  markLiked: (artistId: string) => void
  hasSeenUnlock: (artistId: string) => boolean
  markSeenUnlock: (artistId: string) => void
  /** Clear follow/play/like/unlock flags — used when switching to the KSM new-user persona. */
  resetEngagement: () => void
}

const ArtistEngagementContext = createContext<ArtistEngagementContextValue | null>(null)

export function ArtistEngagementProvider({ children }: { children: ReactNode }) {
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set())
  const [playedIds, setPlayedIds] = useState<Set<string>>(new Set())
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [seenUnlockIds, setSeenUnlockIds] = useState<Set<string>>(new Set())

  const hasEverFollowed = useCallback((id: string) => followedIds.has(id), [followedIds])
  const markFollowed = useCallback((id: string) => {
    setFollowedIds(prev => (prev.has(id) ? prev : new Set(prev).add(id)))
  }, [])
  const hasEverPlayed = useCallback((id: string) => playedIds.has(id), [playedIds])
  const markPlayed = useCallback((id: string) => {
    setPlayedIds(prev => (prev.has(id) ? prev : new Set(prev).add(id)))
  }, [])
  const hasEverLiked = useCallback((id: string) => likedIds.has(id), [likedIds])
  const markLiked = useCallback((id: string) => {
    setLikedIds(prev => (prev.has(id) ? prev : new Set(prev).add(id)))
  }, [])
  const hasSeenUnlock = useCallback((id: string) => seenUnlockIds.has(id), [seenUnlockIds])
  const markSeenUnlock = useCallback((id: string) => {
    setSeenUnlockIds(prev => (prev.has(id) ? prev : new Set(prev).add(id)))
  }, [])

  const resetEngagement = useCallback(() => {
    setFollowedIds(new Set())
    setPlayedIds(new Set())
    setLikedIds(new Set())
    setSeenUnlockIds(new Set())
  }, [])

  const value = useMemo(
    () => ({
      hasEverFollowed,
      markFollowed,
      hasEverPlayed,
      markPlayed,
      hasEverLiked,
      markLiked,
      hasSeenUnlock,
      markSeenUnlock,
      resetEngagement,
    }),
    [
      hasEverFollowed,
      markFollowed,
      hasEverPlayed,
      markPlayed,
      hasEverLiked,
      markLiked,
      hasSeenUnlock,
      markSeenUnlock,
      resetEngagement,
    ],
  )

  return <ArtistEngagementContext.Provider value={value}>{children}</ArtistEngagementContext.Provider>
}

export function useArtistEngagement(): ArtistEngagementContextValue {
  const ctx = useContext(ArtistEngagementContext)
  if (!ctx) throw new Error('useArtistEngagement must be used within ArtistEngagementProvider')
  return ctx
}
