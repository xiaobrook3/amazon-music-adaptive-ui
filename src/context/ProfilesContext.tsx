import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef, type ReactNode } from 'react'
import { useAdaptiveUI } from './AdaptiveUIContext'
import { useLikedSongs } from './LikedSongsContext'
import { useArtistEngagement } from './ArtistEngagementContext'
import { profileAssets } from '../data/assetMap'
import { C } from '../theme'

export type CustomProfileConfig = {
  name: string
  artistIds: string[]
  genres: string[]
  moods: string[]
  /** Camera-captured profile photo URI from the "Create your own" flow. */
  photoUri?: string | null
  /** Which prototype era the built profile should actually render as — see
   *  `Profile.prototypeVersion` below. Defaults to the current version (4). */
  prototypeVersion?: 1 | 2 | 3 | 4
}

/**
 * Demo profiles / personas. "Derbc Studios" is the baseline account we ship today
 * (Adaptive UI OFF — plain Amazon Music). Its initials spell the five personas —
 * Dave, Erica, Rabiat, Brooke, Celine — each of which turns Adaptive UI ON and
 * pins a distinct superfan theme so the home page visibly re-skins per persona.
 *
 * `themeId` maps to a PREDEFINED_THEMES id in AdaptiveUIContext. To re-cast a
 * persona as a superfan of something else, just change its `themeId`/`tagline`.
 */
export type Profile = {
  id: string
  name: string
  initial: string
  color: string
  adaptive: boolean
  themeId: string | null
  tagline: string
  /** Casual (non-superfan) persona: adaptive home, but the generic Amazon-teal
   *  variant — no fandom "world", no superfan tiering, no personalized greeting.
   *  On an artist's "You & Artist" tab, casual also means the tab itself starts
   *  locked until the listener follows + plays + likes something of theirs. */
  casual?: boolean
  /** Engaged (regular, non-superfan) persona: sits between casual and superfan
   *  on an artist's "You & Artist" tab — journey/stats/played-then/playlists,
   *  but not the superfan-only exclusive content or favorite lyrics. */
  engaged?: boolean
  /** Superfan of her own themeId artist (e.g. Taylor), but a brand-new listener
   *  for Olivia specifically. Her Olivia artist page starts casual (tab locked
   *  until she follows + plays + likes) and ratchets all the way up to the full
   *  superfan Olivia experience once she has liked enough of Olivia's songs.
   *  Kept separate from `casual` so it does NOT downgrade her home page — she
   *  still gets her superfan persona home, just a casual Olivia page. */
  newToOlivia?: boolean
  /** Taylor (or other) superfan home hero stays fandom-branded, but song/artist
   *  rails pull from a broader discovery pool instead of filtering to one artist. */
  diverseRecommendations?: boolean
  /** Dedicated Final Prototype "Hannah Journey" persona — Olivia new → engaged →
   *  superfan arc. Gated separately from `newToOlivia` so the original Hannah
   *  persona keeps its existing like-based ratchet behavior. */
  hannahJourney?: boolean
  /** Optional persona headshot shown in the switcher + home avatar (falls back
   *  to the coloured initial when absent). */
  image?: any
  /** Which prototype era this profile renders as, purely for the "Create your
   *  own" version picker:
   *   1 — baseline, adaptive UI off (same as Derbc Studios)
   *   2 — adaptive home with the theme-pill switcher + mood/time re-skinning,
   *       no superfan-tier visual treatment
   *   3/4 — adaptive home PLUS the superfan gold-glow hero card, "TOP 1% FAN"
   *       badge, and share-card feature (`forceSuperfan`). 3 and 4 currently
   *       render identically for a custom fandom — the extra V4 richness
   *       (dedicated tiered artist pages) only exists for the hand-curated
   *       Olivia/Taylor/BTS artists, not an arbitrary custom pick.
   *  Presets don't set this; it's informational for custom profiles only. */
  prototypeVersion?: 1 | 2 | 3 | 4
  /** Forces the superfan-tier hero treatment (gold glow, Top 1% badge, share
   *  card) even when there's no hand-curated SuperFanContent for the theme —
   *  used by prototypeVersion 3/4 custom profiles. */
  forceSuperfan?: boolean
  /** "Create your own" profiles: the artists the user picked at creation.
   *  The listener is treated as a full superfan of each — artist pages skip
   *  the follow/play/like ratchet ("You & Artist" unlocked, Since bubble,
   *  connection signals on the bespoke Taylor/BTS pages), and the custom
   *  landing tailors its rails around them. */
  superfanArtistIds?: string[]
}

// Hannah Journey leads — it's the flagship new→engaged→superfan demo and the
// first thing everyone sees. Celine/KSM/Rabiat follow as the other core
// storyline personas, then the rest.
export const PROFILES: Profile[] = [
  { id: 'hannah-journey', name: 'Hannah Journey', initial: 'H', color: '#D9A05B', adaptive: true, themeId: 'taylor-swift-superfan', hannahJourney: true, diverseRecommendations: true, image: profileAssets.hannah, tagline: 'Prototype V4.2 · Olivia journey · new → engaged → superfan' },
  { id: 'celine', name: 'Celine',        initial: 'C', color: C.pink,   adaptive: true,  themeId: 'olivia-rodrigo-superfan', tagline: 'Prototype V3 · Olivia Superfan', image: profileAssets.celine },
  { id: 'ksm',    name: 'KSM',           initial: 'K', color: C.cyan,   adaptive: true,  themeId: null, casual: true,        tagline: 'Prototype V3 · Casual Listener', image: profileAssets.ksm },
  { id: 'rabiat', name: 'Rabiat',        initial: 'R', color: C.gold,   adaptive: true,  themeId: 'latin', engaged: true,    tagline: 'Prototype V2 · Adaptive UI', image: profileAssets.rabiat },
  { id: 'hannah', name: 'Hannah',        initial: 'H', color: '#D9A05B', adaptive: true, themeId: 'taylor-swift-superfan', newToOlivia: true, diverseRecommendations: true, image: profileAssets.hannah, tagline: 'Taylor Swift superfan · new to Olivia' },

  { id: 'derbc',  name: 'Derbc Studios', initial: 'D', color: C.cyan,   adaptive: false, themeId: null,                      tagline: 'Baseline · Adaptive UI off', image: profileAssets.derbc },
  { id: 'dave',   name: 'Dave',          initial: 'D', color: C.purple, adaptive: true,  themeId: 'hip-hop',                 tagline: 'Prototype V1 · Hip-Hop head', image: profileAssets.dave },
  { id: 'erica',  name: 'Erica',         initial: 'E', color: C.violet, adaptive: true,  themeId: 'bts-superfan',            tagline: 'Prototype V1 · BTS superfan', image: profileAssets.erica },
  { id: 'brooke', name: 'Brook',         initial: 'B', color: C.blue,   adaptive: true,  themeId: 'taylor-swift-superfan',   tagline: 'Prototype V1 · Taylor Swift superfan', image: profileAssets.brooke },
]

type ProfilesContextValue = {
  profiles: Profile[]
  activeProfile: Profile
  setActiveProfileId: (id: string) => void
  /** Build a user-made profile from picked artists/genres/moods and switch to it. */
  createCustomProfile: (config: CustomProfileConfig) => void
  /** Remove the user-made profile; falls back to the baseline if it was active. */
  deleteCustomProfile: () => void
}

const ProfilesContext = createContext<ProfilesContextValue | null>(null)

export function ProfilesProvider({ children }: { children: ReactNode }) {
  const [activeProfileId, setActiveProfileId] = useState('hannah-journey')
  const [customProfile, setCustomProfile] = useState<Profile | null>(null)
  const { setAdaptiveEnabled, setActiveTheme, applyCustomTheme } = useAdaptiveUI()
  const { resetLikes } = useLikedSongs()
  const { resetEngagement, markFollowed, markPlayed, markLiked, markSeenUnlock } = useArtistEngagement()
  const prevProfileIdRef = useRef(activeProfileId)

  // KSM / Hannah Journey are brand-new-listener demos — each time selected,
  // wipe likes or artist engagement carried over from another persona.
  // Journey stage reset itself lives in HannahJourneyContext.
  useEffect(() => {
    const switchedToKsm = activeProfileId === 'ksm' && prevProfileIdRef.current !== 'ksm'
    const switchedToHannahJourney =
      activeProfileId === 'hannah-journey' && prevProfileIdRef.current !== 'hannah-journey'
    if (switchedToKsm || switchedToHannahJourney) {
      resetLikes()
      resetEngagement()
      
    }
    prevProfileIdRef.current = activeProfileId
  }, [activeProfileId, resetLikes, resetEngagement])

  // The custom "build your own" profile (if created) lives alongside the presets.
  const profiles = useMemo(
    () => (customProfile ? [...PROFILES, customProfile] : PROFILES),
    [customProfile],
  )

  const activeProfile = useMemo(
    () => profiles.find(p => p.id === activeProfileId) ?? PROFILES[0],
    [profiles, activeProfileId],
  )

  // Drive the adaptive engine from the active persona: the baseline turns it off,
  // every persona turns it on and pins its superfan (or custom) theme.
  useEffect(() => {
    setAdaptiveEnabled(activeProfile.adaptive)
    if (activeProfile.adaptive) {
      // themeId may be null for a casual persona — passing null clears any
      // lingering superfan theme and overrides the time-based theme that
      // setAdaptiveEnabled(true) would otherwise auto-pick.
      setActiveTheme(activeProfile.themeId)
    }
    // Re-sync only when the chosen persona changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProfile.id])

  const createCustomProfile = useCallback(
    (config: CustomProfileConfig) => {
      const theme = applyCustomTheme(config)
      const name = config.name.trim() || 'You'
      const version = config.prototypeVersion ?? 4
      // V1 = baseline, adaptive UI off. V2 = adaptive re-skin, no superfan
      // treatment. V3/V4 = adaptive + forced superfan hero (gold glow, Top 1%
      // badge, share card) — see `Profile.prototypeVersion` for why 3 and 4
      // aren't more distinct than that for a custom (non-curated) fandom.
      const tagline = version === 4 ? 'Built by you' : `Built by you · Prototype V${version}`
      // The creator IS a superfan of every artist they picked — pre-earn the
      // follow/play/like ratchets (and mark the unlock as already seen so no
      // stale blue dot fires) so each chosen artist's page opens fully
      // unlocked with the "You & Artist" tab and connection signals in place.
      for (const artistId of config.artistIds) {
        markFollowed(artistId)
        markPlayed(artistId)
        markLiked(artistId)
        markSeenUnlock(artistId)
      }
      setCustomProfile({
        id: 'custom',
        name,
        initial: (name[0] ?? 'Y').toUpperCase(),
        color: C.violet,
        adaptive: version !== 1,
        themeId: theme.id,
        tagline,
        image: config.photoUri ? { uri: config.photoUri } : undefined,
        prototypeVersion: version,
        forceSuperfan: version >= 3,
        superfanArtistIds: [...config.artistIds],
      })
      setActiveProfileId('custom')
    },
    [applyCustomTheme, markFollowed, markPlayed, markLiked, markSeenUnlock],
  )

  const deleteCustomProfile = useCallback(() => {
    setCustomProfile(null)
    setActiveProfileId(prev => (prev === 'custom' ? 'derbc' : prev))
  }, [])

  const value = useMemo(
    () => ({ profiles, activeProfile, setActiveProfileId, createCustomProfile, deleteCustomProfile }),
    [profiles, activeProfile, createCustomProfile, deleteCustomProfile],
  )

  return <ProfilesContext.Provider value={value}>{children}</ProfilesContext.Provider>
}

export function useProfiles(): ProfilesContextValue {
  const ctx = useContext(ProfilesContext)
  if (!ctx) throw new Error('useProfiles must be used within ProfilesProvider')
  return ctx
}
