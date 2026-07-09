import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { songs } from '../data/mockData'
import { parseDurationSeconds } from '../utils/color'

/**
 * Playback state is split across two contexts so the fast-ticking progress
 * value doesn't re-render every screen: nearly every screen consumes
 * `usePlaybackState()` (for `playSongAt` etc.), while only the mini-player
 * progress bar and the now-playing screen consume `usePlaybackProgress()`.
 * The progress timer lives here (not in the now-playing screen) so the bar
 * keeps moving everywhere in the app, like a real player.
 */

const TICK_MS = 300

interface PlaybackControls {
  isPlaying: boolean
  setIsPlaying: (v: boolean) => void
  currentSongIdx: number
  setCurrentSongIdx: (v: number) => void
  playSongAt: (songId: string) => void
  skipNext: () => void
  skipPrev: () => void
  /** True when the last track change was user-initiated (tap/skip) rather than
   *  the timer auto-advancing — lets AutoLike ignore passive plays. */
  manualChangeRef: React.MutableRefObject<boolean>
}

interface PlaybackProgress {
  nowPlayingProgress: number
  setNowPlayingProgress: (v: number) => void
}

const PlaybackControlsContext = createContext<PlaybackControls | null>(null)
const PlaybackProgressContext = createContext<PlaybackProgress | null>(null)

export function PlaybackProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [nowPlayingProgress, setNowPlayingProgress] = useState(78)
  const [currentSongIdx, setCurrentSongIdx] = useState(0)
  const progressRef = useRef(nowPlayingProgress)
  progressRef.current = nowPlayingProgress
  const manualChangeRef = useRef(false)

  const playSongAt = useCallback((songId: string) => {
    const idx = songs.findIndex(s => s.id === songId)
    if (idx >= 0) {
      manualChangeRef.current = true
      setCurrentSongIdx(idx)
      setNowPlayingProgress(0)
      setIsPlaying(true)
    }
  }, [])

  const skipNext = useCallback(() => {
    manualChangeRef.current = true
    setCurrentSongIdx(idx => (idx + 1) % songs.length)
    setNowPlayingProgress(0)
  }, [])

  const skipPrev = useCallback(() => {
    manualChangeRef.current = true
    setCurrentSongIdx(idx => (idx - 1 + songs.length) % songs.length)
    setNowPlayingProgress(0)
  }, [])

  // Advance progress in real time, scaled to the current track's duration,
  // and roll over to the next track at 100%.
  useEffect(() => {
    if (!isPlaying) return
    const durationSecs = parseDurationSeconds(songs[currentSongIdx]?.duration)
    const stepPct = (TICK_MS / 1000 / Math.max(durationSecs, 30)) * 100
    const interval = setInterval(() => {
      const next = progressRef.current + stepPct
      if (next >= 100) {
        manualChangeRef.current = false
        setCurrentSongIdx(idx => (idx + 1) % songs.length)
        setNowPlayingProgress(0)
      } else {
        setNowPlayingProgress(next)
      }
    }, TICK_MS)
    return () => clearInterval(interval)
  }, [isPlaying, currentSongIdx])

  const controls = useMemo(
    () => ({
      isPlaying, setIsPlaying,
      currentSongIdx, setCurrentSongIdx,
      playSongAt, skipNext, skipPrev,
      manualChangeRef,
    }),
    [isPlaying, currentSongIdx, playSongAt, skipNext, skipPrev],
  )

  const progress = useMemo(
    () => ({ nowPlayingProgress, setNowPlayingProgress }),
    [nowPlayingProgress],
  )

  return (
    <PlaybackControlsContext.Provider value={controls}>
      <PlaybackProgressContext.Provider value={progress}>
        {children}
      </PlaybackProgressContext.Provider>
    </PlaybackControlsContext.Provider>
  )
}

export function usePlaybackState(): PlaybackControls {
  const ctx = useContext(PlaybackControlsContext)
  if (!ctx) throw new Error('usePlaybackState must be inside PlaybackProvider')
  return ctx
}

export function usePlaybackProgress(): PlaybackProgress {
  const ctx = useContext(PlaybackProgressContext)
  if (!ctx) throw new Error('usePlaybackProgress must be inside PlaybackProvider')
  return ctx
}
