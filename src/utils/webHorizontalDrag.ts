import { Platform } from 'react-native'

/**
 * Web only: make every horizontal rail feel right on both input kinds.
 *
 * PHONE (touch/pen): we never intercept — the browser's native panning owns
 * the gesture, so hold-drag-release keeps its real fingertip inertia. Our
 * only job is guaranteeing the rails allow it (`touch-action: pan-x pan-y`),
 * swept on load, after navigations, and on first contact.
 *
 * COMPUTER (mouse): RN-web rails only move with a wheel, so we implement
 * drag-to-scroll — and on release the rail glides with the pointer's exit
 * velocity (decaying ~5% per frame) instead of stopping dead. The click that
 * would fire on a card after a drag is swallowed.
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

  /* ---------- touch: guarantee native panning (and its inertia) ---------- */
  const allowTouchPan = (el: HTMLElement) => {
    if (el.style.touchAction !== 'pan-x pan-y') {
      el.style.touchAction = 'pan-x pan-y'
      ;(el.style as any).webkitOverflowScrolling = 'touch'
    }
  }
  const sweep = () => {
    document.querySelectorAll('div').forEach(n => {
      if (n instanceof HTMLElement && n.scrollWidth > n.clientWidth + 1) {
        const cs = getComputedStyle(n)
        if (cs.overflowX === 'auto' || cs.overflowX === 'scroll') allowTouchPan(n)
      }
    })
  }
  ;[600, 2000, 5000].forEach(ms => setTimeout(sweep, ms))
  window.addEventListener('popstate', () => setTimeout(sweep, 500))

  /* ---------- mouse: drag-to-scroll + release momentum ---------- */
  let rail: HTMLElement | null = null
  let pointerId = -1
  let startX = 0
  let startY = 0
  let startLeft = 0
  let dragging = false
  let lastX = 0
  let lastT = 0
  let vx = 0 // px per ms, smoothed
  let glideTimer: ReturnType<typeof setTimeout> | null = null

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
      if (glideTimer) {
        clearTimeout(glideTimer)
        glideTimer = null
      }
      const r = findRail(e.target)
      if (!r) return
      if (e.pointerType !== 'mouse') {
        // finger/pen: native scrolling owns it — just make sure it can
        allowTouchPan(r)
        return
      }
      rail = r
      pointerId = e.pointerId
      startX = lastX = e.clientX
      startY = e.clientY
      startLeft = r.scrollLeft
      dragging = false
      vx = 0
      lastT = performance.now()
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
      const now = performance.now()
      const dt = now - lastT
      if (dt > 0) vx = 0.8 * vx + 0.2 * ((e.clientX - lastX) / dt)
      lastX = e.clientX
      lastT = now
      rail.scrollLeft = startLeft - dx
      if (e.cancelable) e.preventDefault()
    },
    { passive: false },
  )

  const end = () => {
    if (dragging && rail) {
      suppressNextClick()
      // glide with the exit velocity — the rail keeps moving and eases out.
      // Timer-driven (not rAF): rAF is suspended in backgrounded/embedded
      // tabs, and a 16ms step is indistinguishable for a decaying glide.
      const r = rail
      let v = -vx * 16.7 // px per ~frame
      const step = () => {
        const max = r.scrollWidth - r.clientWidth
        r.scrollLeft += v
        v *= 0.95
        const pinned = (v > 0 && r.scrollLeft >= max - 0.5) || (v < 0 && r.scrollLeft <= 0.5)
        if (Math.abs(v) < 0.4 || pinned) {
          glideTimer = null
          return
        }
        glideTimer = setTimeout(step, 16)
      }
      if (Math.abs(v) > 2) glideTimer = setTimeout(step, 16)
    }
    rail = null
    dragging = false
    pointerId = -1
  }
  document.addEventListener('pointerup', end, true)
  document.addEventListener('pointercancel', end, true)
}
