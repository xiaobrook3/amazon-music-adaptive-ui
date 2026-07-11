# Artist profiles — native React everywhere

The HTML artist-page prototypes (`adaptive-artist-v3.html`, the generalized
`adaptive-artist-profile.html`, and their iframe embed components) are retired.
Artist pages are now React screens end to end, so web and Expo Go render the
same experience from the same code.

## How it works

- `app/artist/[id].tsx` — one dispatcher on every platform:
  `olivia-rodrigo` → `OliviaRodrigoArtistScreen`, `tswift` →
  `TaylorSwiftArtistScreen`, everyone else → `ArtistJourneyScreen`.
- `src/screens/ArtistJourneyScreen.tsx` carries the adaptive staging that
  used to live only in the HTML pages:
  - a durable listener state per artist (`listenerStateFor` in
    `src/data/artistPages.ts`: cold / casual / regular / superfan, derived
    from the listener's bond in `mockData`),
  - the relationship proof cluster in the hero and the default Follow state
    appear only once the relationship is real,
  - **Popular** starts as the standard chart, gets a "You play this most"
    marker at casual, converges to ranked your-top-songs rows at regular+,
    and gains an Everyone ⇄ Super fans scope toggle at superfan,
  - a session context strip, a "You & {artist}" history card that opens the
    journey tab, and a journey tab that stays an honest null state until the
    listener has earned a timeline,
  - the milestone "Exclusive For You" unlock renders only at superfan.
- Deep links: `/artist/<id>?tab=you|about|events|merch` selects the initial
  tab on both the Olivia screen and the journey screen.

The moderator annotation lens (✦ overlays / `?lens=1`) was removed with the
HTML pages; the product explains itself through what appears and when, not
through an overlay.

## Viewing / grading

```bash
npm install
npx expo export --platform web   # outputs dist/
npx serve dist                   # any static server works
```

- Open **`/phone.html`** on a laptop — the client runs true-to-size inside an
  iPhone frame (recommended for grading on desktop).
- Open `/` directly on a phone-sized viewport for the raw client.
- On a phone, `npx expo start` and scan the QR in Expo Go — same screens.

## Hosting the web export

`npx expo export --platform web` places the @expo/vector-icons fonts under
`dist/assets/node_modules/…` — and **Vercel (and several other hosts) refuse
to upload or serve any `node_modules` directory, even when the files are
committed**. The symptom: every Ionicons glyph renders as a tofu box (skip
buttons, chevrons, add / bookmark on Now Playing) while PNG icons keep
working. A `.gitignore` exception is NOT enough.

The fix that works everywhere — `node scripts/patch-web-export.mjs` after each
export (vendor rename + bundle path rewrite + desktop iPhone-frame CSS), or by
hand:

```bash
mv dist/assets/node_modules dist/assets/vendor
sed -i '' 's|assets/node_modules/|assets/vendor/|g' dist/_expo/static/js/web/entry-*.js
```

A live deployment is maintained at **https://derbc-adaptive-ui.vercel.app**
(root = the client, `/phone.html` = phone-framed reviewer view).
