import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react'
import { useAdaptiveUI } from './AdaptiveUIContext'
import { C } from '../theme'

export type CustomProfileConfig = {
  name: string
  artistIds: string[]
  genres: string[]
  moods: string[]
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
   *  variant — no fandom "world", no superfan tiering, no personalized greeting. */
  casual?: boolean
}

export const PROFILES: Profile[] = [
  { id: 'derbc',  name: 'Derbc Studios', initial: 'D', color: C.cyan,   adaptive: false, themeId: null,                      tagline: 'Baseline · Adaptive UI off' },
  { id: 'dave',   name: 'Dave',          initial: 'D', color: C.purple, adaptive: true,  themeId: 'hip-hop',                 tagline: 'Hip-Hop head' },
  { id: 'erica',  name: 'Erica',         initial: 'E', color: C.violet, adaptive: true,  themeId: 'kpop',                    tagline: 'K-pop superfan' },
  { id: 'rabiat', name: 'Rabiat',        initial: 'R', color: C.gold,   adaptive: true,  themeId: 'latin',                   tagline: 'Bad Bunny & Rosalía · true adaptive' },
  { id: 'brooke', name: 'Brook',         initial: 'B', color: C.blue,   adaptive: true,  themeId: 'chill',                   tagline: 'Indie & chill' },
  { id: 'celine', name: 'Celine',        initial: 'C', color: C.pink,   adaptive: true,  themeId: 'olivia-rodrigo-superfan', tagline: 'Olivia Rodrigo superfan' },
  { id: 'ksm',    name: 'KSM',           initial: 'K', color: C.cyan,   adaptive: true,  themeId: null, casual: true,        tagline: 'Casual listener' },
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
  const [activeProfileId, setActiveProfileId] = useState('celine')
  const [customProfile, setCustomProfile] = useState<Profile | null>(null)
  const { setAdaptiveEnabled, setActiveTheme, applyCustomTheme } = useAdaptiveUI()

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
      setCustomProfile({
        id: 'custom',
        name,
        initial: (name[0] ?? 'Y').toUpperCase(),
        color: C.violet,
        adaptive: true,
        themeId: theme.id,
        tagline: 'Built by you',
      })
      setActiveProfileId('custom')
    },
    [applyCustomTheme],
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
