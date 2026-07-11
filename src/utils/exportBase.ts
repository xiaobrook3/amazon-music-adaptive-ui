/**
 * Where the web export is hosted, with trailing slash — "/" on
 * derbc-adaptive-ui.vercel.app, "/adaptive-ui/" on xiaobrook.com.
 *
 * Derived from the entry bundle's <script src> (…/_expo/static/js/…), which is
 * stable from boot, NOT from window.location.pathname: during a client-side
 * route transition the pathname can still be the previous route (e.g. /search)
 * at render time, which used to produce iframe URLs like
 * "/searchadaptive-artist-v3.html" → a 404 inside the artist route — the
 * "profile doesn't exist" bug when opening an artist from Find.
 */
export function exportBase(): string {
  if (typeof document !== 'undefined') {
    const s = document.querySelector('script[src*="_expo/static/js"]') as HTMLScriptElement | null
    if (s?.src) {
      try {
        const u = new URL(s.src, window.location.href)
        const i = u.pathname.indexOf('_expo/')
        if (i >= 0) return u.pathname.slice(0, i)
      } catch {
        /* fall through to the pathname heuristic */
      }
    }
  }
  if (typeof window === 'undefined') return '/'
  // Fallback: strip the artist route suffix off the current path.
  return window.location.pathname.replace(/artist\/[^/]*\/?$/, '')
}
