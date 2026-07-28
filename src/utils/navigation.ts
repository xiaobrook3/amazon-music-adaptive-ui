import type { useRouter } from 'expo-router'

/**
 * router.back() silently no-ops when there's no history entry to go back to
 * — most often on web, where a fresh page load / refresh / direct URL visit
 * leaves an empty stack even though the exact same navigation works fine
 * natively (the in-memory stack there always has a start screen to fall
 * back to). Falls back to the home tab so back buttons never leave the user
 * stuck on the current screen.
 */
export function safeGoBack(router: ReturnType<typeof useRouter>) {
  if (router.canGoBack()) {
    router.back()
  } else {
    router.replace('/')
  }
}
