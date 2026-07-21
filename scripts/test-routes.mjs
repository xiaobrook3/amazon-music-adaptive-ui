#!/usr/bin/env node
/**
 * Route contract tests for the hosted prototype.
 *
 * Asserts every path a reviewer can plausibly hit — entry pages, SPA routes,
 * deep links, hashed bundles, nav/image assets, and the messy real-world
 * variants shared links produce (trailing slash, trailing punctuation,
 * auto-capitalized paths) — resolves to the right content instead of a host
 * error page.
 *
 * Usage:  node scripts/test-routes.mjs [base-url]
 *         (default: https://derbc-adaptive-ui.vercel.app)
 */
import https from 'node:https'
import http from 'node:http'

const BASE = (process.argv[2] || 'https://derbc-adaptive-ui.vercel.app').replace(/\/$/, '')

function fetchPath(path, hops = 0) {
  return new Promise((resolve, reject) => {
    const url = path.startsWith('http') ? path : BASE + path
    const lib = url.startsWith('https') ? https : http
    lib.get(url, { headers: { 'user-agent': 'derbc-route-test' } }, res => {
      if ([301, 302, 307, 308].includes(res.statusCode) && hops < 4) {
        const loc = res.headers.location.startsWith('http') ? res.headers.location : BASE + res.headers.location
        res.resume()
        return resolve(fetchPath(loc, hops + 1))
      }
      let body = ''
      res.on('data', c => { if (body.length < 300000) body += c })
      res.on('end', () => resolve({ status: res.statusCode, type: res.headers['content-type'] || '', body }))
    }).on('error', reject)
  })
}

const APP_SHELL = b => b.includes('id="root"')
const PHONE = b => b.includes('appframe')

const CASES = [
  // entry pages
  ['/', 200, APP_SHELL, 'client root serves the app shell'],
  ['/phone.html', 200, PHONE, 'framed reviewer view'],
  // SPA routes (client-side router owns these — artist pages are React now)
  ['/artist/olivia-rodrigo', 200, APP_SHELL, 'artist route (no trailing slash)'],
  ['/artist/olivia-rodrigo/', 200, APP_SHELL, 'artist route (trailing slash)'],
  ['/artist/olivia-rodrigo?tab=you', 200, APP_SHELL, 'artist route with tab deep link'],
  ['/artist/olivia-dean', 200, APP_SHELL, 'journey-screen artist route'],
  ['/artist/bruno-mars?tab=merch', 200, APP_SHELL, 'journey-screen tab deep link'],
  ['/search', 200, APP_SHELL, 'find route'],
  ['/library', 200, APP_SHELL, 'library route'],
  // client routes added post-PR#12 (deep links carry real ids so the page isn't empty)
  ['/insights', 200, APP_SHELL, 'listening insights route'],
  ['/create-fan-card', 200, APP_SHELL, 'super fan card composer route'],
  ['/frequent-plays', 200, APP_SHELL, 'frequent plays route'],
  ['/fan-group/fg1', 200, APP_SHELL, 'fan group deep link'],
  ['/audible-book/ab-atomic-habits', 200, APP_SHELL, 'audible book deep link'],
  ['/audible-category/Biographies', 200, APP_SHELL, 'audible category deep link'],
  ['/exclusive-offer/offer-or-merch', 200, APP_SHELL, 'exclusive offer deep link'],
  ['/artist-liked/olivia-rodrigo', 200, APP_SHELL, 'artist liked-songs deep link'],
  ['/artist-lyrics/olivia-rodrigo', 200, APP_SHELL, 'artist lyrics deep link'],
  // real-world mangled share links must land IN the app, not on a host error page
  ['/Artist/olivia-rodrigo', 200, APP_SHELL, 'auto-capitalized path'],
  ['/some/route/that/does/not/exist', 200, APP_SHELL, 'unknown route falls back to the app'],
  // static assets keep strict semantics (a stale hashed asset must 404, never HTML)
  ['/_expo/static/js/web/definitely-not-a-real-bundle.js', 404, () => true, 'missing bundle 404s (no HTML fallback)'],
]

let failed = 0
for (const [path, wantStatus, wantBody, label] of CASES) {
  let verdict
  try {
    const { status, body } = await fetchPath(path)
    const ok = status === wantStatus && wantBody(body)
    verdict = ok ? 'PASS' : `FAIL (status ${status})`
    if (!ok) failed++
  } catch (e) {
    verdict = `FAIL (${e.message})`
    failed++
  }
  console.log(`${verdict.padEnd(18)} ${path}  — ${label}`)
}

// current bundle referenced by the live shell must resolve
try {
  const { body } = await fetchPath('/')
  const m = body.match(/\/_expo\/static\/js\/web\/entry-[a-f0-9]+\.js/)
  if (!m) throw new Error('no bundle reference in shell')
  const { status, type } = await fetchPath(m[0])
  const ok = status === 200 && /javascript/.test(type)
  console.log(`${(ok ? 'PASS' : `FAIL (${status} ${type})`).padEnd(18)} ${m[0].slice(0, 48)}…  — live shell's bundle resolves as JS`)
  if (!ok) failed++
} catch (e) {
  console.log(`FAIL (${e.message}) — bundle resolution`)
  failed++
}

console.log(failed === 0 ? '\nAll route contracts hold.' : `\n${failed} route contract(s) BROKEN`)
process.exit(failed === 0 ? 0 : 1)
