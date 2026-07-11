# Working in this repo

Read `docs/ENGINEERING-NOTES.md` first — it maps the codebase, the adaptive
artist-page system, the three-target deploy pipeline, and the gotchas that
have already cost debugging time (web sizing, ImageBackground, scroll feel,
deep-link back buttons, Vercel quirks).

House rules:

- One codebase for web and Expo Go — never add web-only or native-only
  behavior without a parity story for the other platform.
- Contribute via a feature branch + PR (`brook/*` pattern); the maintainer
  merges. Commits are authored by the human contributor only — no AI
  co-author trailers. Don't amend/force-push once a PR is open.
- After `npx expo export --platform web`, ALWAYS run
  `node scripts/patch-web-export.mjs`, and keep old hashed bundles when
  syncing a deploy. Verify with `node scripts/test-routes.mjs`.
- The xiaobrook.com deployment needs its own export with
  `expo.experiments.baseUrl:"/adaptive-ui"` temporarily set in app.json
  (revert it afterward).
- Typecheck with `npx tsc --noEmit -p tsconfig.json`; the single
  pre-existing `radioStations` error in AdaptivePersonaHome is known and
  build-safe.
