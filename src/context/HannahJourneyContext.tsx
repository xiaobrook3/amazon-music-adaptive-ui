import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  type ReactNode,
} from 'react'
import { Platform } from 'react-native'
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

/** The era rail runs newest first, so the tab opens on the newest era, "Now". */
const DEFAULT_ERA_ID: HannahJourneyEraId = HANNAH_JOURNEY_ERAS[0].id

const OLIVIA_ID = 'olivia-rodrigo'

/** Fan groups on the journey's Home. Per the team's spec (report p136) the listener has
 * already joined two groups before Olivia's, and a super fan is an active member of hers. */
const OLIVIA_GROUP_ID = 'fg-hj-olivia'
const GROUPS_JOINED_FROM_START = ['fg-hj-swifties', 'fg-hj-arianators']

/** Web only: the journey survives reloads within a tab, so a reviewer who follows Olivia
 * and then opens another path (which reloads the embedded client) keeps their tier. */
const STORE_KEY = 'adaptive-ui:hannah-journey'

type JourneyBoot = {
  stage: HannahJourneyStage
  selectedEraId: HannahJourneyEraId
  revealCompleted: boolean
  revealOpenedOnce: boolean
  groups: Record<string, boolean>
  /** Where the boot state came from: a ?stage= link, a stored session, or nothing. */
  source: 'param' | 'stored' | 'fresh'
}

const FRESH_BOOT: JourneyBoot = {
  stage: 'new-listener',
  selectedEraId: DEFAULT_ERA_ID,
  revealCompleted: false,
  revealOpenedOnce: false,
  groups: {},
  source: 'fresh',
}

/** The ?stage= link last applied in this tab. The router keeps the parameter in the
 * address, so a plain reload of that address restores the session instead of resetting
 * it; the walkthrough adds a unique t= so each of its buttons applies afresh. */
const APPLIED_LINK_KEY = 'adaptive-ui:hannah-journey:applied-link'

/** Web only: ?stage=new|engaged|superfan starts the demo at that tier (the walkthrough
 * beside the client links to these); otherwise the tab's stored session; otherwise fresh. */
function readJourneyBoot(): JourneyBoot {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return FRESH_BOOT
  try {
    const param = new URLSearchParams(window.location.search).get('stage')
    const isNewLink = window.sessionStorage.getItem(APPLIED_LINK_KEY) !== window.location.href
    if ((param === 'new' || param === 'engaged' || param === 'superfan') && isNewLink) {
      window.sessionStorage.setItem(APPLIED_LINK_KEY, window.location.href)
      const stage: HannahJourneyStage = param === 'new' ? 'new-listener' : param
      return {
        ...FRESH_BOOT,
        stage,
        revealCompleted: stage === 'superfan',
        revealOpenedOnce: stage === 'superfan',
        source: 'param',
      }
    }
    const raw = window.sessionStorage.getItem(STORE_KEY)
    if (raw) {
      const saved = JSON.parse(raw) as Partial<JourneyBoot>
      const stage = saved.stage
      const era = saved.selectedEraId
      if (stage === 'new-listener' || stage === 'engaged' || stage === 'superfan') {
        return {
          stage,
          selectedEraId: HANNAH_JOURNEY_ERAS.some(e => e.id === era) ? (era as HannahJourneyEraId) : DEFAULT_ERA_ID,
          revealCompleted: !!saved.revealCompleted,
          revealOpenedOnce: !!saved.revealOpenedOnce,
          groups: saved.groups && typeof saved.groups === 'object' ? saved.groups : {},
          source: 'stored',
        }
      }
    }
  } catch {
    // Storage blocked (private mode, sandboxed frame): start fresh.
  }
  return FRESH_BOOT
}

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
  /** Unfollow Olivia from Engaged or Super fan: the page goes back to the new-listener
   * layout. Likes stay; the reveal can run again after the next follow. */
  unfollow: () => void
  /** Fan-group membership, shared by Home's group cards and the group page. */
  isGroupJoined: (groupId: string) => boolean
  setGroupJoined: (groupId: string, joined: boolean) => void
  /** Hidden debug escape hatch: jump straight to superfan from any stage,
   * skipping the follow → engaged → reveal-popup flow, for testing/demo. */
  // forceSuperfan: () => void
}

const HannahJourneyContext = createContext<HannahJourneyContextValue | null>(null)

const HANNAH_JOURNEY_ID = 'hannah-journey'

export function HannahJourneyProvider({ children }: { children: ReactNode }) {
  const { activeProfile } = useProfiles()
  const { resetLikes } = useLikedSongs()
  const { resetEngagement, markFollowed, markSeenUnlock } = useArtistEngagement()

  const isHannahJourney = activeProfile.id === HANNAH_JOURNEY_ID

  const [boot] = useState(readJourneyBoot)
  const [stage, setStage] = useState<HannahJourneyStage>(boot.stage)
  const [selectedEraId, setSelectedEraId] = useState<HannahJourneyEraId>(boot.selectedEraId)
  const [revealVisible, setRevealVisible] = useState(false)
  const [revealCompleted, setRevealCompleted] = useState(boot.revealCompleted)
  const [revealOpenedOnce, setRevealOpenedOnce] = useState(boot.revealOpenedOnce)
  const [groups, setGroups] = useState<Record<string, boolean>>(boot.groups)
  const firstRunRef = useRef(true)

  // Switching onto Hannah Journey always restarts the demo arc. The first run keeps a
  // stage that came from a ?stage= link or the tab's stored session instead.
  useEffect(() => {
    if (!isHannahJourney) {
      setRevealVisible(false)
      return
    }
    if (firstRunRef.current) {
      firstRunRef.current = false
      if (boot.source !== 'fresh') {
        if (boot.stage !== 'new-listener') markFollowed(OLIVIA_ID)
        // A reload should not replay the "You & Olivia unlocked" moment; a link should.
        if (boot.source === 'stored' && boot.stage !== 'new-listener') markSeenUnlock(OLIVIA_ID)
        return
      }
    }
    setStage('new-listener')
    setSelectedEraId(DEFAULT_ERA_ID)
    setRevealVisible(false)
    setRevealCompleted(false)
    setRevealOpenedOnce(false)
    setGroups({})
    resetLikes()
    resetEngagement()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHannahJourney, activeProfile.id])

  // Web: write the journey through to the tab's session (see STORE_KEY).
  useEffect(() => {
    if (Platform.OS !== 'web' || !isHannahJourney) return
    try {
      window.sessionStorage.setItem(
        STORE_KEY,
        JSON.stringify({ stage, selectedEraId, revealCompleted, revealOpenedOnce, groups }),
      )
    } catch {
      // Storage blocked: the journey still works, it just won't survive a reload.
    }
  }, [isHannahJourney, stage, selectedEraId, revealCompleted, revealOpenedOnce, groups])

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
    setSelectedEraId(DEFAULT_ERA_ID)
    setRevealVisible(false)
    setRevealCompleted(false)
    setRevealOpenedOnce(false)
    setGroups({})
  }, [isHannahJourney, resetLikes, resetEngagement])

  const unfollow = useCallback(() => {
    if (!isHannahJourney) return
    setStage('new-listener')
    setRevealVisible(false)
    setRevealCompleted(false)
    setRevealOpenedOnce(false)
  }, [isHannahJourney])

  const isGroupJoined = useCallback(
    (groupId: string) => {
      if (groupId in groups) return groups[groupId]
      if (groupId === OLIVIA_GROUP_ID) return stage === 'superfan'
      return GROUPS_JOINED_FROM_START.includes(groupId)
    },
    [groups, stage],
  )

  const setGroupJoined = useCallback((groupId: string, joined: boolean) => {
    setGroups(prev => ({ ...prev, [groupId]: joined }))
  }, [])

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
    () => HANNAH_JOURNEY_ERAS.find(e => e.id === selectedEraId) ?? HANNAH_JOURNEY_ERAS[0],
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
      unfollow,
      isGroupJoined,
      setGroupJoined,
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
      unfollow,
      isGroupJoined,
      setGroupJoined,
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
