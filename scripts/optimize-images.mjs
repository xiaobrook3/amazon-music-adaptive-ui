// Batch downsize oversized image assets in place (extensions preserved so require() paths stay valid).
// Usage: node scripts/optimize-images.mjs [--apply]
//   (default is a dry run; pass --apply to overwrite files)
import sharp from 'sharp'
import { readdir, stat, rename, unlink, readFile, writeFile } from 'node:fs/promises'
import { join, extname, dirname, basename, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'assets')
const APPLY = process.argv.includes('--apply')

// Longest-side cap by sub-path. Phone screens ~3x density; now-playing art needs
// ~1020px, album covers ship natively at ~1240 (keep them there rather than
// downscaling), and full-bleed heroes want more.
function capFor(p) {
  const n = p.replace(/\\/g, '/').toLowerCase()
  if (n.includes('olivia-rodrigo-era-')) return 1000  // era images: small cards + stats bg
  if (n.includes('olivia-rodrigo-hero')) return 1280  // artist hero, full-bleed
  if (n.includes('/album-art/')) return 1280      // keep native ~1240 covers; now-playing art at 3x
  if (n.includes('olivia-about/')) return 1280    // about-page media (cards + video thumbs)
  if (n.includes('/artists/')) return 1440        // other heroes / era images, full-bleed
  return 1280
}
const SIZE_FLOOR = 350 * 1024 // also recompress anything over this even if dimensions are small
const exts = new Set(['.jpg', '.jpeg', '.png', '.webp'])

// Leave app-config / branding assets untouched (splash, icons, logos) — resizing these
// can degrade the native splash screen or launcher icon and saves almost nothing.
function isExcluded(p) {
  const n = p.replace(/\\/g, '/').toLowerCase()
  if (n.includes('/logos/')) return true
  return /(^|\/)(splash|icon|adaptive-icon|favicon|notification|app-icon)[^/]*$/.test(n)
}

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, e.name)
    if (e.isDirectory()) yield* walk(full)
    else if (exts.has(extname(e.name).toLowerCase())) yield full
  }
}

function fmt(b) { return (b / 1024 / 1024).toFixed(2) + ' MB' }
const sleep = (ms) => new Promise(r => setTimeout(r, ms))
async function replaceWithRetry(file, buf) {
  // Windows can briefly lock files (Metro watcher); retry the swap a few times.
  for (let i = 0; i < 6; i++) {
    try { await writeFile(file, buf); return }
    catch (e) { if (e.code !== 'EBUSY' && e.code !== 'EPERM') throw e; await sleep(300) }
  }
  throw new Error('could not write (locked): ' + file)
}

let totalBefore = 0, totalAfter = 0, changed = 0, skipped = 0
const rows = []

for await (const file of walk(ROOT)) {
  if (isExcluded(file)) { skipped++; continue }
  const ext = extname(file).toLowerCase()
  const input = await readFile(file)            // read fully so no file handle is held during overwrite
  const beforeSize = input.length
  let meta
  try { meta = await sharp(input, { failOn: 'none' }).metadata() } catch { continue }
  const longest = Math.max(meta.width || 0, meta.height || 0)
  const cap = capFor(file)
  const needsResize = longest > cap
  const needsRecompress = beforeSize > SIZE_FLOOR
  if (!needsResize && !needsRecompress) { skipped++; continue }

  let pipe = sharp(input, { failOn: 'none' }).rotate()
  if (needsResize) pipe = pipe.resize({ width: cap, height: cap, fit: 'inside', withoutEnlargement: true })
  // Quality-first encodes. PNGs here are photographic (heroes/eras): palette mode
  // is the only way to keep them small, so use the best quantization (quality 100,
  // full dither) to minimise banding. JPEG/WebP get a real quality bump, and JPEG
  // keeps full 4:4:4 chroma so cover-art text and colour edges stay crisp.
  if (ext === '.png') pipe = pipe.png({ compressionLevel: 9, palette: true, quality: 100, dither: 1.0, effort: 10 })
  else if (ext === '.webp') pipe = pipe.webp({ quality: 86 })
  else pipe = pipe.jpeg({ quality: 88, mozjpeg: true, chromaSubsampling: '4:4:4' })

  const buf = await pipe.toBuffer()
  if (buf.length >= beforeSize) { skipped++; continue } // re-encode didn't help; leave original
  totalBefore += beforeSize; totalAfter += buf.length; changed++
  rows.push([file, beforeSize, buf.length, `${meta.width}x${meta.height}`, cap])
  if (APPLY) await replaceWithRetry(file, buf)
}

rows.sort((a, b) => b[1] - a[1])
for (const [f, b, a, dim, cap] of rows) {
  console.log(`${fmt(b).padStart(9)} -> ${fmt(a).padStart(9)}  ${dim.padStart(11)} cap${cap}  ${f.replace(ROOT, '')}`)
}
console.log('\n' + (APPLY ? 'APPLIED' : 'DRY RUN'))
console.log(`changed: ${changed}, skipped (already ok): ${skipped}`)
console.log(`total of changed: ${fmt(totalBefore)} -> ${fmt(totalAfter)}  (saved ${fmt(totalBefore - totalAfter)})`)
