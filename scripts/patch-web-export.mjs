#!/usr/bin/env node
/**
 * Post-processes `npx expo export --platform web` output (dist/) for static hosting:
 *
 * 1. Renames dist/assets/node_modules → assets/vendor and rewrites those paths in
 *    the JS bundles (some hosts, e.g. Vercel, refuse to serve node_modules paths).
 * 2. Injects the desktop iPhone-frame CSS into dist/index.html so laptop viewers
 *    get the client inside a true-to-size device frame (phones are media-gated
 *    and untouched). Expo's SPA output ignores app/+html.tsx, hence this patch.
 *
 * Idempotent — safe to run more than once. Usage: node scripts/patch-web-export.mjs
 */
import { existsSync, readdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dist = join(process.cwd(), 'dist')
if (!existsSync(dist)) {
  console.error('dist/ not found — run `npx expo export --platform web` first')
  process.exit(1)
}

// 1 — vendor rename + bundle path rewrite
const nm = join(dist, 'assets', 'node_modules')
if (existsSync(nm)) renameSync(nm, join(dist, 'assets', 'vendor'))
const jsDir = join(dist, '_expo', 'static', 'js', 'web')
for (const f of readdirSync(jsDir).filter(f => f.endsWith('.js'))) {
  const p = join(jsDir, f)
  const src = readFileSync(p, 'utf8')
  const out = src.replaceAll('assets/node_modules/', 'assets/vendor/')
  if (out !== src) writeFileSync(p, out)
}

// 2 — desktop iPhone frame
const FRAME_CSS = `
  /* Desktop (laptop grading): the client renders inside a true-to-size iPhone
     frame — status bar + dynamic island are drawn by the frame, the app keeps
     its full behavior. Phones are untouched (media-gated). */
  @media (min-width:600px){
    body{background:radial-gradient(120% 90% at 50% -10%, #16121f 0%, #0a0a0e 42%, #050507 100%) #050507;
      display:flex;align-items:center;justify-content:center;min-height:100dvh;overflow:hidden;}
    #root{position:relative;flex:none;width:402px;height:min(874px, calc(100dvh - 64px));min-height:560px;
      margin:0;padding-top:54px;box-sizing:border-box;background:#000;border-radius:54px;overflow:hidden;
      box-shadow:0 0 0 9px #020203,0 0 0 13px #33363d,0 42px 90px -18px rgba(0,0,0,.82),inset 0 0 2px rgba(255,255,255,.16);}
    #root::before{content:"";position:absolute;top:12px;left:50%;transform:translateX(-50%);z-index:9991;
      width:112px;height:31px;border-radius:20px;background:#000;pointer-events:none;
      box-shadow:inset 0 0 2px rgba(255,255,255,.12);}
    #root::after{content:"9:41";position:absolute;top:19px;left:34px;z-index:9990;pointer-events:none;
      font:600 16px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#fff;
      font-variant-numeric:tabular-nums;letter-spacing:.01em;}
    /* React Native Web portals (modals, sheets) mount as body-level fixed
       overlays that span the browser viewport — clip them to the same device
       frame as #root so sheets stay inside the phone */
    body > div:not(#root){
      position:fixed !important;
      left:50% !important;top:50% !important;right:auto !important;bottom:auto !important;
      transform:translate(-50%,-50%);
      width:402px !important;
      height:min(874px, calc(100dvh - 64px)) !important;
      min-height:560px;
      border-radius:54px;
      overflow:hidden;
      outline:none !important;
      pointer-events:none;
    }
    body > div:not(#root) > *{pointer-events:auto;}
  }
  `
const idx = join(dist, 'index.html')
let html = readFileSync(idx, 'utf8')
if (!html.includes('min-width:600px')) {
  html = html.replace('</head>', `<style>${FRAME_CSS}</style></head>`)
  writeFileSync(idx, html)
}

console.log('patched: vendor paths + desktop iPhone frame')
