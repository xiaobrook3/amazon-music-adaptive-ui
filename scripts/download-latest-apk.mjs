#!/usr/bin/env node
/**
 * Downloads the latest finished Android APK from EAS Build.
 * Usage: npm run apk:download
 */
import { execSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

const listJson = execSync(
  'npx eas-cli build:list --platform android --status finished --limit 1 --json --non-interactive',
  { encoding: 'utf8', stdio: ['pipe', 'pipe', 'inherit'] },
)

const builds = JSON.parse(listJson)
const latest = builds[0]

if (!latest) {
  console.error('No finished Android builds found. Run: npm run build:android')
  process.exit(1)
}

const url = latest.artifacts?.applicationArchiveUrl ?? latest.artifacts?.buildUrl
if (!url) {
  console.error(`Build ${latest.id} has no APK artifact.`)
  process.exit(1)
}

console.log(`Downloading build ${latest.id}…`)
console.log(`Install page: https://expo.dev/accounts/rabiats/projects/amazon-music-clone/builds/${latest.id}`)

const response = await fetch(url)
if (!response.ok) {
  console.error(`Download failed: ${response.status} ${response.statusText}`)
  process.exit(1)
}

const buffer = Buffer.from(await response.arrayBuffer())
const outPath = join(process.cwd(), `amazon-music-clone-${latest.appBuildVersion ?? 'preview'}.apk`)
writeFileSync(outPath, buffer)
console.log(`Saved: ${outPath}`)
