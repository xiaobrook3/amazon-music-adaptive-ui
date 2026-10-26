import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from 'react'
import { useProfiles } from './ProfilesContext'
import { useLikedSongs } from './LikedSongsContext'
import { useArtistEngagement } from './ArtistEngagementContext'

/** Three connected demo stages for the Hannah Journey persona only. */
export type HannahJourneyStage = 'new-listener' | 'engaged' | 'superfan'

/** Superfan You & Olivia era carousel states (same screen, swappable content). */
export type HannahJourneyEraId = 'girl-in-love' | 'sour' | 'pretty' | 'newbie'

export type HannahJourneyEra = {
  id: HannahJourneyEraId
  season: string
  title: string
  badge: string
  description: string
  topTrackTitle: string
  topTrackPlays: number
  artKey: string
  minutesListened: number
  streakDays: number
  friendsRank: string
}

export const HANNAH_JOURNEY_ERAS: HannahJourneyEra[] = [
  {
    id: 'girl-in-love',
    season: 'Spring 2026 • Now',
    title: 'Girl So In Love Era',
    badge: 'Top 3% listener',
    description:
      'You played this one like you were falling for someone, over and over, mostly in the morning.',
    topTrackTitle: 'Drivers License',
    topTrackPlays: 482,
    artKey: 'olivia-rodrigo-girl-in-love',
    minutesListened: 740,
    streakDays: 21,
    friendsRank: '#1',
  },
  {
    id: 'sour',
    season: 'Spring 2024',
    title: 'Sour Girl Era',
    badge: 'Top 12% listener',
    description: 'You listened to a lot of angry songs back then, mostly played after midnight.',
    topTrackTitle: 'Drivers License',
    topTrackPlays: 482,
    artKey: 'olivia-rodrigo-sour',
    minutesListened: 1840,
    streakDays: 47,
    friendsRank: '#1',
  },
  {
    id: 'pretty',
    season: 'Spring 2022',
    title: 'Petty Era',
    badge: 'Top 16% listener',
    description:
      "You played this one like you weren't sorry, over and over, mostly with the volume up.",
    topTrackTitle: 'Drivers License',
    topTrackPlays: 482,
    artKey: 'olivia-rodrigo-pretty-sad',
    minutesListened: 620,
    streakDays: 21,
    friendsRank: '#3',
  },
  {
    id: 'newbie',
    season: 'Spring 2021',
    title: 'Newbie Livie',
    badge: 'You found Olivia',
    description:
      "You played this one like you weren't sorry, over and over, mostly with the volume up.",
    topTrackTitle: 'Drivers License',
    topTrackPlays: 482,
    artKey: 'olivia-rodrigo-sour',
    minutesListened: 120,
    streakDays: 2,
    friendsRank: '#40',
  },
]

type HannahJourneyContextValue = {
  /** True only when the active profile is the dedicated Hannah Journey persona. */
  isHannahJourney: boolean
  stage: HannahJourneyStage
  selectedEraId: HannahJourneyEraId
  selectedEra: HannahJourneyEra
  /** Engaged landing: mid-scroll reveal is eligible (not yet shown/completed). */
  revealEligible: boolean
  /** Modal currently visible over landing. */
  revealVisible: boolean
  /** Follow on Artist/Music while new-listener → engaged. */
  becomeEngaged: () => void
  // This is for skipping the follw to engaged and reveal the pop 
  forceSuperfan: () => void
  /** Open the Top 3% reveal modal (landing mid-scroll). */
  openReveal: () => void
  dismissReveal: () => void
  /** CTA from reveal → superfan stage. */
  completeRevealToSuperfan: () => void
  setSelectedEraId: (id: HannahJourneyEraId) => void
  /** Full demo reset: stage → new-listener, clear likes + engagement. */
  restartJourney: () => void
  /** Hidden debug escape hatch: jump straight to superfan from any stage,
   * skipping the follow → engaged → reveal-popup flow, for testing/demo. */
  // forceSuperfan: () => void
}

const HannahJourneyContext = createContext<HannahJourneyContextValue | null>(null)

const HANNAH_JOURNEY_ID = 'hannah-journey'

export function HannahJourneyProvider({ children }: { children: ReactNode }) {
  const { activeProfile } = useProfiles()
  const { resetLikes } = useLikedSongs()
  const { resetEngagement } = useArtistEngagement()

  const isHannahJourney = activeProfile.id === HANNAH_JOURNEY_ID

  const [stage, setStage] = useState<HannahJourneyStage>('new-listener')
  const [selectedEraId, setSelectedEraId] = useState<HannahJourneyEraId>('sour')
  const [revealVisible, setRevealVisible] = useState(false)
  const [revealCompleted, setRevealCompleted] = useState(false)
  const [revealOpenedOnce, setRevealOpenedOnce] = useState(false)

  // Switching onto Hannah Journey always restarts the demo arc.
  useEffect(() => {
    if (!isHannahJourney) {
      setRevealVisible(false)
      return
    }
    setStage('new-listener')
    setSelectedEraId('sour')
    setRevealVisible(false)
    setRevealCompleted(false)
    setRevealOpenedOnce(false)
    resetLikes()
    resetEngagement()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHannahJourney, activeProfile.id])

  const becomeEngaged = useCallback(() => {
    if (!isHannahJourney) return
    setStage(prev => (prev === 'new-listener' ? 'engaged' : prev))
  }, [isHannahJourney])

  const openReveal = useCallback(() => {
    if (!isHannahJourney || stage !== 'engaged' || revealCompleted || revealOpenedOnce) return
    setRevealOpenedOnce(true)
    setRevealVisible(true)
  }, [isHannahJourney, stage, revealCompleted, revealOpenedOnce])

  const dismissReveal = useCallback(() => {
    setRevealVisible(false)
  }, [])

  const completeRevealToSuperfan = useCallback(() => {
    if (!isHannahJourney) return
    setRevealVisible(false)
    setRevealCompleted(true)
    setStage('superfan')
  }, [isHannahJourney])

  const restartJourney = useCallback(() => {
    if (!isHannahJourney) return
    resetLikes()
    resetEngagement()
    setStage('new-listener')
    setSelectedEraId('sour')
    setRevealVisible(false)
    setRevealCompleted(false)
    setRevealOpenedOnce(false)
  }, [isHannahJourney, resetLikes, resetEngagement])

  const forceSuperfan = useCallback(() => {
    if (!isHannahJourney) return
    // Mark the reveal as already-completed so the engaged-landing popup never
    // tries to fire later if something bounces the stage back down.
    setRevealVisible(false)
    setRevealCompleted(true)
    setRevealOpenedOnce(true)
    setStage('superfan')
  }, [isHannahJourney])

  const selectedEra = useMemo(
    () => HANNAH_JOURNEY_ERAS.find(e => e.id === selectedEraId) ?? HANNAH_JOURNEY_ERAS[1],
    [selectedEraId],
  )

  const revealEligible =
    isHannahJourney && stage === 'engaged' && !revealCompleted && !revealOpenedOnce

  const value = useMemo(
    () => ({
      isHannahJourney,
      stage,
      selectedEraId,
      selectedEra,
      revealEligible,
      revealVisible,
      becomeEngaged,
      openReveal,
      dismissReveal,
      completeRevealToSuperfan,
      setSelectedEraId,
      restartJourney,
      forceSuperfan,
    }),
    [
      isHannahJourney,
      stage,
      selectedEraId,
      selectedEra,
      revealEligible,
      revealVisible,
      becomeEngaged,
      openReveal,
      dismissReveal,
      completeRevealToSuperfan,
      restartJourney,
      forceSuperfan,
    ],
  )

  return <HannahJourneyContext.Provider value={value}>{children}</HannahJourneyContext.Provider>
}

export function useHannahJourney(): HannahJourneyContextValue {
  const ctx = useContext(HannahJourneyContext)
  if (!ctx) throw new Error('useHannahJourney must be used within HannahJourneyProvider')
  return ctx
}

export function isHannahJourneyProfileId(id: string): boolean {
  return id === HANNAH_JOURNEY_ID
}
