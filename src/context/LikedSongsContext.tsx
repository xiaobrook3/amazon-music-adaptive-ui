import { createContext, useContext, useState, type ReactNode } from 'react'

type LikedSongsContextValue = {
  likedSongIds: ReadonlySet<string>
  toggleLike: (songId: string) => void
  /** Idempotent add — used to auto-like a song on play without ever un-liking it. */
  addLike: (songId: string) => void
  isLiked: (songId: string) => boolean
}

const LikedSongsContext = createContext<LikedSongsContextValue | null>(null)

export function LikedSongsProvider({ children }: { children: ReactNode }) {
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())

  function toggleLike(songId: string) {
    setLikedIds(prev => {
      const next = new Set(prev)
      if (next.has(songId)) {
        next.delete(songId)
      } else {
        next.add(songId)
      }
      return next
    })
  }

  function addLike(songId: string) {
    setLikedIds(prev => {
      if (prev.has(songId)) return prev
      const next = new Set(prev)
      next.add(songId)
      return next
    })
  }

  return (
    <LikedSongsContext.Provider
      value={{
        likedSongIds: likedIds,
        toggleLike,
        addLike,
        isLiked: (id: string) => likedIds.has(id),
      }}
    >
      {children}
    </LikedSongsContext.Provider>
  )
}

export function useLikedSongs(): LikedSongsContextValue {
  const ctx = useContext(LikedSongsContext)
  if (!ctx) throw new Error('useLikedSongs must be used within LikedSongsProvider')
  return ctx
}
