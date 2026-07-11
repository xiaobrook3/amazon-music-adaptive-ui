# Engineering notes — Amazon Music Adaptive UI (DERBC)

Orientation for the next engineer or agent touching this prototype. It is an
Expo (React Native + react-native-web) app: **one codebase renders the web
deployments and Expo Go on phones.** No HTML page prototypes remain — the
former `adaptive-artist-v3.html` era is retired (preserved on the
`archive/*` branches of xiaobrook3/derbc-adaptive-ui and xiaobrook3/Website).

## Map

```
app/                     expo-router routes
  (tabs)/                Home · Find · Library · Maestro (AmazonTabBar)
  artist/[id].tsx        dispatcher: olivia-rodrigo → OliviaRodrigoArtistScreen,
                         tswift → TaylorSwiftArtistScreen, unknown id → NotFound,
                         everyone else → ArtistJourneyScreen. ?tab=you|about|events|merch
                         picks the initial tab on all of them.
  artist-discography/    Olivia-only catalog (guards other ids → NotFound)
  album/ radio/ …        secondary routes; +not-found.tsx is the dead-end screen
src/screens/             the three artist screens + the rest of the app
src/components/artist/   shared artist-page pieces (see below)
src/data/                mockData.ts is the single source of truth for artists/songs;
                         artistPages.ts derives per-artist page data (buildArtistPage,
                         listenerStateFor); artistAbout.ts, oliviaRodrigo*.ts add curation
src/utils/webHorizontalDrag.ts   web-only scroll feel (see Gotchas)
scripts/patch-web-export.mjs     REQUIRED after every web export
scripts/test-routes.mjs          route contracts vs the live Vercel deploy
```

## The adaptive artist-page system

- `listenerStateFor(artistId)` (src/data/artistPages.ts) maps the listener's
  bond from mockData to a durable state: **cold / casual / regular /
  superfan**. `ArtistJourneyScreen` stages itself from it: hero proof cluster
  and default Follow only when the relationship is real; **Popular** goes
  standard chart → "You play this most" marker (casual) → ranked
  your-top-songs rows (regular+) → Everyone ⇄ Super fans scope (superfan);
  session context strip; You-&-artist history card; the journey tab is an
  honest null state until earned; the Exclusive unlock is superfan-only.
- Shared pieces in `src/components/artist/`:
  - `InfluenceWeb` — the hub-and-spoke editorial canvas (336×432, hub at
    168,172). Olivia's data is verbatim in `src/data/influenceWeb.ts`
    (OLIVIA_INFLUENCE_WEB); any artist with about data gets a generated web
    (`buildInfluenceWeb`), familiarity marks derived from real bonds.
  - `JourneyTimeline` — time reads **right to left** (Figma s694… nodes
    123:4279/123:4877): "now" at the left behind a dotted future stub, oldest
    at the far right. The filled line is the whole history and never moves on
    selection — a glow travels right→left along it; selection lives in the
    era cards (chosen = full strength, rest dimmed) and the active dot.
  - `ArtistCommerce` — events card, past events, compact 2-across merch grid
    (110px art, whole card = tap target), `FanPostsCarousel` (snap cards),
    `FanCommunityCard`.
  - `StandaloneTabBar` — the bottom nav + mini player for screens OUTSIDE
    the (tabs) navigator (all three artist screens, podcast show).
- Tab placement (v3.1 IA): **About = the story** (banner, story, Ask,
  lyric/production notes, interviews, influence web). **Events = the live
  moments + the fandom** (shows, past events, fan-group posts, community).
  **Merch = the storefront only.**

## Deploy pipeline (three targets)

1. **Team repo (this one)** — contribute via `brook/*` (or your own) branch +
   PR; the maintainer merges. Commits here are authored by the contributor
   only — no AI co-author trailers. Never amend/force-push a branch after its
   PR is open (the maintainer may merge the old head and every child branch
   starts reporting conflicts).
2. **derbc-adaptive-ui.vercel.app** — repo xiaobrook3/derbc-adaptive-ui, main
   auto-deploys. Ship a ROOT-variant export:
   `npx expo export --platform web && node scripts/patch-web-export.mjs`,
   then rsync `dist/_expo dist/assets` + copy
   `index.html metadata.json phone.html serve.json`. **Keep old hashed
   `entry-*.js` bundles** — deleting them black-screens cached clients.
3. **xiaobrook.com/adaptive-ui** — repo xiaobrook3/Website, `adaptive-ui/`.
   Needs its OWN export with `expo.experiments.baseUrl:"/adaptive-ui"`
   temporarily set in app.json (revert after). A root-variant bundle under
   the subpath = black screen + unmatched routes; hand-patching index.html is
   NOT enough (the router's baseUrl is baked into the bundle).

After deploying, run `node scripts/test-routes.mjs` (hits the live Vercel
app). To grade on a laptop, open `/phone.html`; on a phone use `/` or Expo Go
(`npx expo start`).

## Gotchas that have already bitten

- **`Dimensions.get('window')` on web reads the whole browser window**, not
  the 402px phone column — size cards with fixed constants (see CARD_W notes
  in the About tabs) or flex, never from window width.
- **RN-web `ImageBackground` collapses to the asset's intrinsic size** when
  the style has no explicit width/height (native stretches it). Every artist
  screen passes `COVER_IMG = { width:'100%', height:'100%' }` via imageStyle.
- **Scroll feel** (`src/utils/webHorizontalDrag.ts`): touch/pen gestures are
  NEVER intercepted — native browser panning keeps real fingertip inertia
  (we only guarantee `touch-action: pan-x pan-y` on rails). Mouse gets
  drag-to-scroll with a decaying momentum glide on release, timer-driven
  because **rAF is suspended in backgrounded/embedded tabs**. Post-drag
  clicks are swallowed for 250ms.
- **Deep links have no history** — every back button must fall through
  (`router.canGoBack() ? back() : replace('/')`), never bare `router.back()`.
- Vercel refuses to serve `node_modules` paths — `patch-web-export.mjs`
  renames `dist/assets/node_modules → assets/vendor` and rewrites the bundle.
- SPA rewrites must exclude dotted paths (`/([^.]*)`) or stale hashed assets
  return HTML as 200 and cached clients black-screen forever.
- Known pre-existing TS error in AdaptivePersonaHome (`radioStations` key) —
  teammate's file, build-safe, leave it.

## Low-res assets that still need real hi-res source files

sabrina-carpenter (88px), charli-xcx / harry-styles / sombr /
ariana-dangerous-woman / taylor-showgirl / olivia-pretty-sad-album (80px),
kpop-demon-hunters (64px), EXO / Jungkook / Lisa / NewJeans (160px).
Drop replacements into `assets/album-art/` / `assets/artists/` under the
same filenames — everything resolves through `src/data/assetMap.ts`.
