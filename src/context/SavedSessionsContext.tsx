import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Song } from '../data/mockData'
import { songs } from '../data/mockData'

export type SavedSession = {
  id: string
  savedAt: Date
  label: string
  description?: string
  songs: Song[]
  coverArtPath?: string
}

type SavedSessionsContextValue = {
  sessions: SavedSession[]
  saveCurrentSession: (songs: Song[], label?: string) => void
  deleteSavedSession: (id: string) => void
  playSavedSession: (session: SavedSession, playSongAt: (songId: string) => void) => void
}

const SavedSessionsContext = createContext<SavedSessionsContextValue | null>(null)

function generateLabel(): string {
  const hour = new Date().getHours()
  const tod =
    hour < 5  ? 'Late Night' :
    hour < 12 ? 'Morning' :
    hour < 17 ? 'Afternoon' :
    hour < 21 ? 'Evening' :
                'Night'
  const d = new Date()
  const month = d.toLocaleString('en-US', { month: 'short' })
  return `${tod} Vibes · ${month} ${d.getDate()}`
}

export function generateSessionDescription(sessionSongs: Song[], label: string): string {
  const artist = sessionSongs[0]?.artistName ?? 'your favorites'
  const labelLower = label.toLowerCase()

  if (labelLower.includes('late night')) {
    return 'Your late-night wind-down — picked up right where you left off'
  }
  if (labelLower.includes('morning')) {
    return `Your morning soundtrack with ${artist} — start right where you paused`
  }
  if (labelLower.includes('afternoon')) {
    return 'You enjoyed this mix I made for you for your jazzy afternoon'
  }
  if (labelLower.includes('evening')) {
    return `Evening with ${artist} — a vibe worth keeping`
  }
  if (labelLower.includes('night')) {
    return 'A vibe you saved when everything was hitting just right'
  }
  if (label.includes(' with ')) {
    return `A vibe you saved when everything was hitting just right with ${artist}`
  }
  return `A personal mix anchored by ${artist} — saved for when you're ready`
}

const SEED_SESSIONS: SavedSession[] = [
  {
    id: 'ss-seed-1',
    savedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    label: 'Evening Vibes · Jun 24',
    description: 'Evening with BTS — a vibe worth keeping',
    songs: songs.slice(0, 10),
    coverArtPath: songs[0]?.albumArtPath,
  },
  {
    id: 'ss-seed-2',
    savedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    label: 'Afternoon Session · Jun 23',
    description: 'You enjoyed this mix I made for you for your jazzy afternoon',
    songs: songs.slice(5, 15),
    coverArtPath: songs[5]?.albumArtPath,
  },
]

export function SavedSessionsProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<SavedSession[]>(SEED_SESSIONS)

  function saveCurrentSession(sessionSongs: Song[], label?: string) {
    const resolvedLabel = label ?? generateLabel()
    const session: SavedSession = {
      id: `ss-${Date.now()}`,
      savedAt: new Date(),
      label: resolvedLabel,
      description: generateSessionDescription(sessionSongs, resolvedLabel),
      songs: sessionSongs.slice(0, 20),
      coverArtPath: sessionSongs[0]?.albumArtPath,
    }
    setSessions(prev => [session, ...prev])
  }

  function deleteSavedSession(id: string) {
    setSessions(prev => prev.filter(s => s.id !== id))
  }

  function playSavedSession(
    session: SavedSession,
    playSongAt: (songId: string) => void,
  ) {
    if (session.songs.length > 0) {
      playSongAt(session.songs[0].id)
    }
  }

  return (
    <SavedSessionsContext.Provider
      value={{ sessions, saveCurrentSession, deleteSavedSession, playSavedSession }}
    >
      {children}
    </SavedSessionsContext.Provider>
  )
}

export function useSavedSessions(): SavedSessionsContextValue {
  const ctx = useContext(SavedSessionsContext)
  if (!ctx) throw new Error('useSavedSessions must be used within SavedSessionsProvider')
  return ctx
}
