import { Platform } from 'react-native'

/**
 * Web only: make every horizontal rail drag-scrollable with a finger or a
 * mouse, app-wide, without touching each ScrollView.
 *
 * RN-web rails scroll with a wheel/trackpad, but a finger or mouse drag that
 * starts on a card gets claimed by the touchable and the rail never moves.
 * One delegated pointer handler fixes all of them: on pointerdown we find the
 * nearest horizontally-scrollable ancestor, and once the gesture is clearly
 * horizontal we drive scrollLeft directly and suppress the click that would
 * otherwise fire on release.
 */
export function installWebHorizontalDrag() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return
  if ((document as any).__derbcHDrag) return
  ;(document as any).__derbcHDrag = true

  const findRail = (start: EventTarget | null): HTMLElement | null => {
    let n = start as HTMLElement | null
    while (n && n !== document.body) {
      if (n instanceof HTMLElement) {
        const cs = getComputedStyle(n)
        if (
          (cs.overflowX === 'auto' || cs.overflowX === 'scroll') &&
          n.scrollWidth > n.clientWidth + 1
        ) {
          return n
        }
      }
      n = n.parentElement
    }
    return null
  }

  let rail: HTMLElement | null = null
  let pointerId = -1
  let startX = 0
  let startY = 0
  let startLeft = 0
  let dragging = false

  const suppressNextClick = () => {
    const swallow = (ev: Event) => {
      ev.stopPropagation()
      ev.preventDefault()
      document.removeEventListener('click', swallow, true)
    }
    document.addEventListener('click', swallow, true)
    setTimeout(() => document.removeEventListener('click', swallow, true), 250)
  }

  document.addEventListener(
    'pointerdown',
    e => {
      if (!e.isPrimary) return
      rail = findRail(e.target)
      if (!rail) return
      pointerId = e.pointerId
      startX = e.clientX
      startY = e.clientY
      startLeft = rail.scrollLeft
      dragging = false
    },
    { passive: true },
  )

  document.addEventListener(
    'pointermove',
    e => {
      if (!rail || e.pointerId !== pointerId) return
      const dx = e.clientX - startX
      const dy = e.clientY - startY
      if (!dragging) {
        if (Math.abs(dx) < 6) return
        // horizontal intent only — a mostly-vertical move stays with the page
        if (Math.abs(dx) < Math.abs(dy) * 1.2) {
          rail = null
          return
        }
        dragging = true
      }
      rail.scrollLeft = startLeft - dx
      if (e.cancelable) e.preventDefault()
    },
    { passive: false },
  )

  const end = () => {
    if (dragging) suppressNextClick()
    rail = null
    dragging = false
    pointerId = -1
  }
  document.addEventListener('pointerup', end, true)
  document.addEventListener('pointercancel', end, true)
}
