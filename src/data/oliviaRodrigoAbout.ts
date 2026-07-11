import type { AboutFanPost } from './artistAbout'
export const OLIVIA_ABOUT_ASK_CHIPS = [
  'What inspired "vampire"?',
  'The making of GUTS',
]

export const OLIVIA_ABOUT_LYRIC_NOTES = [
  {
    id: 'drivers',
    title: '"drivers license" — the bridge heard \'round the world',
    linkLabel: 'Production note',
    locked: false,
    artKey: 'olivia-about-note-drivers',
  },
  {
    id: 'vampire',
    title: '"vampire" — the key change, decoded',
    linkLabel: 'Keep listening to unlock',
    locked: true,
    artKey: 'olivia-rodrigo-guts',
  },
]

export const OLIVIA_ABOUT_VIDEOS = [
  {
    id: 'v1',
    title: 'Olivia on writing "vampire"',
    duration: '4:12',
    artKey: 'olivia-about-video-vampire',
  },
  {
    id: 'v2',
    title: 'Inside the GUTS studio sessions',
    duration: '8:30',
    artKey: 'olivia-about-video-studio',
  },
]

export const OLIVIA_ABOUT_INFLUENCED_BY = [
  { name: 'Taylor Swift', artKey: 'olivia-about-influence-tswift' },
  { name: 'Lorde', artKey: 'olivia-about-influence-lorde' },
  { name: 'Alanis Morissette', artKey: 'olivia-about-influence-alanis' },
]

export const OLIVIA_ABOUT_INSPIRES = [
  { name: 'Gracie Abrams', artKey: 'olivia-about-influence-gracie' },
  { name: 'Chappell Roan', artKey: 'olivia-about-influence-chappell' },
]

export const OLIVIA_ABOUT_MERCH = [
  { title: 'GUTS Tour Tee', price: '$38', artKey: 'olivia-about-merch-tee' },
  { title: 'GUTS Vinyl — Purple', price: '$32', artKey: 'olivia-about-merch-vinyl' },
  { title: 'GUTS Era Poster', price: '$18', artKey: 'olivia-rodrigo-guts' },
]

export const OLIVIA_ABOUT_EVENTS = [
  { month: 'SEP', day: '14', title: 'GUTS World Tour', venue: 'PPG Paints Arena · Pittsburgh', time: 'Sat, Sep 14 · 7:30 PM' },
  { month: 'SEP', day: '17', title: 'GUTS World Tour', venue: 'Madison Square Garden · New York', time: 'Tue, Sep 17 · 8:00 PM' },
]

export type PastEventKind = 'past' | 'live-rec' | 'replay'

export interface PastArtistEvent {
  month: string
  day: string
  title: string
  venue: string
  subtitle: string
  kind: PastEventKind
}

export const OLIVIA_PAST_EVENTS: PastArtistEvent[] = [
  {
    month: 'JUN',
    day: '14',
    title: 'GUTS World Tour',
    venue: 'Madison Square Garden · New York',
    subtitle: 'Live recording available · Jun 14, 2025',
    kind: 'live-rec',
  },
  {
    month: 'MAR',
    day: '22',
    title: 'GUTS World Tour',
    venue: 'Kia Forum · Los Angeles',
    subtitle: 'Sat, Mar 22, 2025',
    kind: 'past',
  },
  {
    month: 'NOV',
    day: '08',
    title: 'GUTS World Tour',
    venue: 'United Center · Chicago',
    subtitle: 'Fri, Nov 8, 2024',
    kind: 'past',
  },
  {
    month: 'OCT',
    day: '22',
    title: 'SOUR Tour Finale',
    venue: 'Kia Forum · Los Angeles',
    subtitle: 'Fan-filmed highlights · Oct 22, 2024',
    kind: 'replay',
  },
]

/* Fan-group posts — the v3.1 Events view's carousel (the fandom gathers
 * around the live moments). Copy ported from the HTML page. */

export const OLIVIA_FAN_POSTS: AboutFanPost[] = [
  {
    group: 'Sad Girl Hour',
    handle: '@i<3orod',
    time: '2 days ago',
    body: 'Whenever I just need to unwind and let things out, this album is the one. six years and it still hits the exact same.',
    artKey: 'olivia-about-fan-post',
    likes: '1.2k',
    comments: '84',
  },
  {
    group: 'r/oliviarodrigo',
    handle: 'vampirestan',
    time: '2h ago',
    body: "just realized the bridge in “happier” hits completely different once you've actually been the second choice 😭 she KNEW",
    artKey: 'olivia-rodrigo-sour',
    likes: '1.2k',
    comments: '84',
  },
  {
    group: 'GUTS Stans',
    handle: 'gutsgremlin',
    time: '5h ago',
    body: "“ballad of a homeschooled girl” is the single most accurate song about social anxiety ever recorded. that's the post. that's it.",
    artKey: 'olivia-rodrigo-guts',
    likes: '3.4k',
    comments: '210',
  },
  {
    group: 'Olivia Daily',
    handle: 'spicypisces',
    time: '1d ago',
    body: '“good 4 u” / “misery business” parallels: a thread 🧵 with timestamps. the Paramore DNA runs deeper than the obvious chorus, i promise',
    artKey: 'olivia-rodrigo-guts',
    likes: '5.6k',
    comments: '489',
  },
]
