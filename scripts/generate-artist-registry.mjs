#!/usr/bin/env node
/**
 * Generates public/artist-registry.js — the data blob behind the generalized
 * adaptive artist profile page (public/adaptive-artist-profile.html).
 *
 * Single source of truth stays src/data/ (mockData + artistPages + artistAbout):
 * this script evaluates those TS modules (sucrase transform, image requires
 * stubbed to their asset-map keys) and resolves every art key to the URL the
 * web export serves it at (assets/assets/<dir>/<name>.<md5>.<ext> — Metro names
 * exported assets by content hash, so the URL is computable ahead of export).
 *
 * Usage: node scripts/generate-artist-registry.mjs
 * Idempotent; run before `npx expo export --platform web`.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, join, resolve, basename, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const require = createRequire(join(root, 'package.json'))
const { transform } = require('sucrase')

/* ---------- 1. asset-map key → exported URL ---------- */

// Parse the literal require() maps in assetMap.ts (keys → repo asset paths).
const assetMapSrc = readFileSync(join(root, 'src/data/assetMap.ts'), 'utf8')
const keyToFile = {}
for (const m of assetMapSrc.matchAll(/['"]?([\w .-]+)['"]?\s*:\s*require\('([^']+)'\)/g)) {
  keyToFile[m[1]] = resolve(join(root, 'src/data'), m[2])
}

function exportedUrl(file) {
  const hash = createHash('md5').update(readFileSync(file)).digest('hex')
  const rel = file.slice(root.length + 1) // e.g. assets/album-art/foo.jpg
  const dir = dirname(rel)
  const ext = extname(rel)
  const name = basename(rel, ext)
  return `assets/${dir}/${name}.${hash}${ext}`
}

const urlCache = {}
function artUrl(key) {
  if (!key || !keyToFile[key]) return null
  if (!urlCache[key]) urlCache[key] = exportedUrl(keyToFile[key])
  return urlCache[key]
}

/* ---------- 2. evaluate the TS data modules ---------- */

const moduleCache = {}
function loadTS(relPath) {
  const abs = join(root, 'src/data', relPath + '.ts')
  if (moduleCache[abs]) return moduleCache[abs].exports
  const src = readFileSync(abs, 'utf8')
  const { code } = transform(src, { transforms: ['typescript', 'imports'] })
  const mod = { exports: {} }
  moduleCache[abs] = mod
  const localRequire = spec => {
    if (spec === './assetMap' || spec.endsWith('/assetMap')) return assetMapStub
    if (spec.startsWith('.')) return loadTS(spec.replace(/^\.\//, ''))
    return require(spec)
  }
  new Function('require', 'module', 'exports', code)(localRequire, mod, mod.exports)
  return mod.exports
}

// Image requires resolve to their key string so art keys survive evaluation.
const keyProxy = new Proxy({}, { get: (_, p) => (typeof p === 'string' ? p : undefined), has: () => true })
const assetMapStub = {
  albumArtAssets: keyProxy,
  artistAssets: keyProxy,
  oliviaAboutAssets: keyProxy,
  oliviaPageAssets: keyProxy,
  resolveArtistAvatar: (artistId, imageUri) =>
    (keyToFile[artistId] ? artistId : null) ?? (imageUri && keyToFile[imageUri] ? imageUri : null),
}

const { artists, songs } = loadTS('mockData')
const { buildArtistPage, listenerStateFor } = loadTS('artistPages')
const { getArtistAbout } = loadTS('artistAbout')

/* ---------- 3. compose the registry ---------- */

// Deterministic stream counts, same visual scale the journey screen uses.
const STREAMS = [89234567, 45678901, 23456789, 12345678, 9876543, 4567890]

const registry = {}
for (const a of artists) {
  const page = buildArtistPage(a.id)
  const about = getArtistAbout(a.id)
  const artistSongs = songs.filter(s => s.artistId === a.id)

  const seen = new Set()
  const popular = []
  for (const s of artistSongs) {
    if (seen.has(s.title)) continue
    seen.add(s.title)
    popular.push({
      title: s.title,
      album: s.album,
      duration: s.duration,
      streams: STREAMS[popular.length % STREAMS.length].toLocaleString('en-US'),
      art: artUrl(s.albumArtPath) ,
      color: s.albumArtColor ?? '#15181d',
    })
    if (popular.length >= 5) break
  }

  const albums = []
  const albumSeen = new Set()
  for (const s of artistSongs) {
    if (albumSeen.has(s.album)) continue
    albumSeen.add(s.album)
    albums.push({ title: s.album, art: artUrl(s.albumArtPath), color: s.albumArtColor ?? '#15181d' })
    if (albums.length >= 6) break
  }

  const related = artists
    .filter(o => o.id !== a.id && o.genre === a.genre)
    .slice(0, 6)
    .map(o => ({
      id: o.id,
      name: o.name,
      art: artUrl(o.id) ?? artUrl(o.imageUri),
    }))

  registry[a.id] = {
    id: a.id,
    name: a.name,
    firstName: page.firstName,
    genre: a.genre,
    verified: !!a.isVerified,
    bio: a.bio,
    followers: page.followersLabel,
    since: page.sinceLabel,
    badge: page.listenerBadge,
    state: listenerStateFor(a.id),
    hero: artUrl(a.id) ?? artUrl(a.imageUri),
    heroColor: popular[0]?.color ?? '#15181d',
    popular,
    albums,
    eras: page.eras.map(e => ({
      title: e.title,
      season: e.season,
      badge: e.badge,
      art: artUrl(e.eraImageKey),
      topTrack: e.topTrack.title,
    })),
    stats: page.stats,
    merch: page.merch.map(mi => ({ name: mi.name, type: mi.type, price: mi.price, art: artUrl(mi.artKey) })),
    events: about?.events ?? [],
    aboutStory: about?.storyBody ?? null,
    aboutEra: about?.eraLabel ?? null,
    firstPlay: page.firstPlay ? { title: page.firstPlay.title, date: page.firstPlay.date } : null,
    related,
  }
}

/* ---------- 4. emit ---------- */

const out =
  `/* Generated by scripts/generate-artist-registry.mjs — do not edit by hand.\n` +
  `   Source of truth: src/data/mockData.ts (+artistPages, artistAbout). */\n` +
  `window.__ARTIST_REGISTRY = ${JSON.stringify(registry, null, 1)};\n`
writeFileSync(join(root, 'public/artist-registry.js'), out)
console.log(`artist-registry.js: ${Object.keys(registry).length} artists, ${(out.length / 1024).toFixed(0)} KB`)
