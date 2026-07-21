// Taylor Swift superfan content — mirrors the shape of oliviaSuperFanContent.ts.
// Shown on the "You & Taylor" tab for users whose latenight identity is active
// or who have a high tswift bond tier (devoted / legendary).

export const TAYLOR_TOP_TRACK = {
  songId: 's-ts-red-03',
  title: 'All Too Well',
  playCount: 891,
  artKey: 'tswift-1',
}

export const TAYLOR_EXCLUSIVE_TRACK = {
  songId: 's-ts-folk-01',
  title: "All Too Well (10 Min Version), Studio Demo",
  subtitle: 'Only top 1% Swifties can access this',
  artKey: 'tswift-1',
}

export const TAYLOR_PODCASTS = [
  {
    id: 'ts-pod1',
    title: 'All Too Well: A Taylor Swift Podcast',
    host: 'Era by Era',
    coverColor: '#341c0e',
    coverArtPath: 'ts-showgirl',
  },
  {
    id: 'ts-pod2',
    title: 'Swiftology: Deep Cuts & Easter Eggs',
    host: 'Pop Culture Deep Dive',
    coverColor: '#0a0a14',
    coverArtPath: 'ts-reputation',
  },
  {
    id: 'ts-pod3',
    title: 'The Folklore Sessions',
    host: 'Indie Sound Lab',
    coverColor: '#3a3a3a',
    coverArtPath: 'ts-1989-polaroid',
  },
]

export const TAYLOR_NEWS = {
  headline: "The Life of a Showgirl, World Tour dates confirmed",
  body: "47 cities announced · 3 nights at SoFi Stadium · Ticket pre-sale opens July 14",
  date: 'Jul 7, 2026',
}

export const TAYLOR_SUPERFAN_MERCH = [
  { id: 'ts-merch1', label: "reputation Vinyl (Taylor's Version)", artKey: 'ts-reputation' },
  { id: 'ts-merch2', label: 'Eras Tour Crew Tee', artKey: 'ts-showgirl' },
  { id: 'ts-merch3', label: "folklore, Limited Edition LP", artKey: 'ts-1989-polaroid' },
  { id: 'ts-merch4', label: 'TTPD Signed Anthology', artKey: 'ts-tortured-poets' },
]

// ── Exclusive fan stats shown in the "You & Taylor" header ───────────────────

export const TAYLOR_SUPERFAN_STATS = {
  topPercentLabel: 'Top 1% listener',
  totalPlays: 3_180,
  streakDays: 94,
  firstListenYear: 2016,
  erasBadgeLabel: '7 Eras Unlocked',
}
