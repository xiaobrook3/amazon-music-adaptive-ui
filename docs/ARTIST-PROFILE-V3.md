# Adaptive Artist Profile (v3) — in-client integration

The Olivia Rodrigo artist route now ships the refined **adaptive artist profile**
(hi-fi v3) inside this client on web, so the adaptive home and the adaptive
artist page demo as one prototype.

## How it works

- `public/adaptive-artist-v3.html` is the self-contained artist profile
  (HTML/CSS/JS + `public/static/adaptive/` assets). Expo copies `public/` into
  the web export automatically.
- On **web**, `app/artist/[id].tsx` routes `olivia-rodrigo` to
  `src/components/artist/OliviaAdaptiveArtist.tsx`, which embeds the page in
  `?embed=1` mode: the page drops its own phone chrome / moderator console and
  hands navigation back to the app via `postMessage`
  (`v3-back` → router back, `v3-nav` → Home / Find / Library / Maestro tabs).
- On **native** (Expo Go / simulators) nothing changes — the existing
  hand-tuned `OliviaRodrigoArtistScreen` renders as before.

The design language is shared by construction: Ember Modern type, Music Cyan
`#25D1DA` accent, and the same 4-item bottom nav (Home / Find / Library /
Maestro with the Alexa ring).

## What the profile demonstrates

One page, three forces: **who you are** (cold start → casual → engaged → super
fan, with Super fan *earned*, never self-declared), **the moment** (session,
presale, replay signals; time of day), and **your control** (✦ "why this
changed" on every adaptive surface, show-less/undo, adaptation level,
"not into Olivia right now", reset to standard page).

## Viewing / grading

```bash
npm install
npx expo export --platform web   # outputs dist/
npx serve dist                   # any static server works
```

- Open **`/phone.html`** on a laptop — the client runs true-to-size inside an
  iPhone frame (recommended for grading on desktop).
- Open `/` directly on a phone-sized viewport for the raw client.
- The standalone profile (with the moderator console for state-scrubbing) is at
  `/adaptive-artist-v3.html?state=superfan`.

## Hosting the web export

`npx expo export --platform web` places the @expo/vector-icons fonts under
`dist/assets/node_modules/…` — and **Vercel (and several other hosts) refuse
to upload or serve any `node_modules` directory, even when the files are
committed**. The symptom: every Ionicons glyph renders as a tofu box (skip
buttons, chevrons, add / bookmark on Now Playing) while PNG icons keep
working. A `.gitignore` exception is NOT enough.

The fix that works everywhere — rename the path and patch the bundle after
each export:

```bash
mv dist/assets/node_modules dist/assets/vendor
sed -i '' 's|assets/node_modules/|assets/vendor/|g' dist/_expo/static/js/web/entry-*.js
```

A live deployment is maintained at **https://derbc-adaptive-ui.vercel.app**
(root = phone-framed client, `/adaptive-artist-v3.html` = the standalone
moderator version).

## Known seam

Playback state inside the embedded profile is simulated independently of the
app's global playback context (they never show at the same time, but a song
started on the artist page won't appear in the app's mini player on Home).
Unifying them would mean invasive changes to the RN playback provider, which
we deliberately avoided.
