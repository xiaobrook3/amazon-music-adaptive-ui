import { artistAssets, oliviaAboutAssets, albumArtAssets } from './assetMap'
import { listenerStateFor } from './artistPages'
import type { AboutInfluence } from './artistAbout'

/**
 * Influence web — the hub-and-spoke editorial map from the retired HTML
 * artist page (adaptive-artist-v3.html), ported verbatim: same node copy,
 * same canvas geometry (336×378, hub at 168,172), same familiarity layer
 * (★ fan · ● listens sometimes · ○ new to you).
 *
 * The web itself is editorial (curated by Amazon Music editors); the
 * familiarity marks are the listener's own layer.
 */

export type Familiarity = 'fan' | 'casual' | 'new'

export interface InfluenceWebNode {
  key: string
  name: string
  /** true = the hub artist is shaping them (pink); false = they shaped the hub (cyan). */
  out: boolean
  rel: string
  meta: string
  /** Keyword chips inside the detail card. */
  kws: string[]
  /** The single keyword shown under the bubble (empty = none). */
  kw: string
  conn: string
  lbl: string
  tracks: string[]
  hop2?: string
  fam: Familiarity
  image: any
  /** Position + avatar size in the 336×378 canvas. */
  x: number
  y: number
  s: number
  /** Float-motion variant (mirrors the HTML's bob1/bob2 phases). */
  float: 1 | 2 | 3 | 4 | 5
}

export interface InfluenceWebData {
  hubName: string
  hubImage: any
  hubFamLine: string
  hubDetail: Omit<InfluenceWebNode, 'x' | 'y' | 's' | 'float' | 'fam' | 'image'>
  nodes: InfluenceWebNode[]
  /** e.g. "SHAPED OLIVIA" / "OLIVIA IS SHAPING" */
  legendIn: string
  legendOut: string
  description: string
}

/* The HTML page's FAM_BY_STATE.superfan row — the recognized-fan read the
 * flagship page ships with. */
export const OLIVIA_INFLUENCE_WEB: InfluenceWebData = {
  hubName: 'Olivia Rodrigo',
  hubImage: artistAssets['olivia-rodrigo'],
  hubFamLine: '★ Top 1% listener · fan since 2021',
  hubDetail: {
    key: 'olivia',
    name: 'Olivia Rodrigo',
    out: false,
    rel: 'THE CENTER OF THE WEB',
    meta: 'Pop-rock · 85M monthly',
    kws: ['diary-first', 'pop-punk revival', 'the big bridge'],
    kw: '',
    conn: "Every thread runs through her. Taylor's diarism, Lorde's restraint, and Alanis's bite go in; a new generation of songwriters comes out the other side.",
    lbl: 'WHERE THE THREADS MEET',
    tracks: ['drivers license', 'vampire', 'good 4 u'],
    hop2: 'Tap any artist around her to see one thread up close.',
  },
  legendIn: 'SHAPED OLIVIA',
  legendOut: 'OLIVIA IS SHAPING',
  description: 'Who shaped her sound, including artists you already know',
  nodes: [
    {
      key: 'taylor', name: 'Taylor Swift', out: false,
      rel: 'SHAPED OLIVIA’S SOUND', meta: 'Pop · singer-songwriter · 84M monthly',
      kws: ['diaristic lyrics', 'bridge as climax', 'owning the catalog'], kw: 'bridge as climax',
      conn: 'A north star since childhood: “deja vu” openly interpolates “Cruel Summer,” and “1 step forward, 3 steps back” is built on the “New Year’s Day” piano line.',
      lbl: 'TRACKS THAT SHAPED OLIVIA', tracks: ['Cruel Summer', 'New Year’s Day', 'All Too Well'],
      hop2: "Two degrees out: Taylor's own diaristic style traces back to Dolly Parton and Joni Mitchell.",
      fam: 'fan', image: oliviaAboutAssets['olivia-about-influence-tswift'],
      x: 66, y: 56, s: 62, float: 1,
    },
    {
      key: 'lorde', name: 'Lorde', out: false,
      rel: 'SHAPED OLIVIA’S SOUND', meta: 'Alt-pop · New Zealand · 31M monthly',
      kws: ['restraint', 'moody minimalism', 'lyric-first'], kw: 'less is more',
      conn: '“Pure Heroine” proved a teenager could go pop on her own terms. You hear its quiet in SOUR’s back half: “enough for you,” “hope ur ok.”',
      lbl: 'TRACKS THAT SHAPED OLIVIA', tracks: ['Ribs', 'Liability', 'Buzzcut Season'],
      hop2: "Two degrees out: Lorde's minimalism echoes early Kate Bush and The xx.",
      fam: 'casual', image: oliviaAboutAssets['olivia-about-influence-lorde'],
      x: 272, y: 48, s: 56, float: 2,
    },
    {
      key: 'alanis', name: 'Alanis Morissette', out: false,
      rel: 'SHAPED OLIVIA’S SOUND', meta: '’90s alt-rock · 12M monthly',
      kws: ['rage as hook', 'alt-rock bite'], kw: 'rage as hook',
      conn: '“good 4 u” leans so far into “You Oughta Know” that Morissette and Glen Ballard earned a retroactive writing credit, the most literal thread on the web.',
      lbl: 'TRACKS THAT SHAPED OLIVIA', tracks: ['You Oughta Know', 'Hand in My Pocket'],
      hop2: "Two degrees out: Morissette's confessional bite draws on Chrissie Hynde and Patti Smith.",
      fam: 'new', image: oliviaAboutAssets['olivia-about-influence-alanis'],
      x: 48, y: 196, s: 54, float: 3,
    },
    {
      key: 'gracie', name: 'Gracie Abrams', out: true,
      rel: 'OLIVIA IS SHAPING', meta: 'Bedroom-pop · songwriter · 29M monthly',
      kws: ['same songbook', 'shared producer'], kw: 'same songbook',
      conn: 'She opened the SOUR Tour and shares producer Dan Nigro: the same sound-world, one room over. The post-Olivia lane, made real.',
      lbl: 'OLIVIA TRACKS IN HER DNA', tracks: ['drivers license', 'enough for you'],
      fam: 'new', image: oliviaAboutAssets['olivia-about-influence-gracie'],
      x: 280, y: 218, s: 58, float: 4,
    },
    {
      key: 'chappell', name: 'Chappell Roan', out: true,
      rel: 'OLIVIA IS SHAPING', meta: 'Theatrical pop · 45M monthly',
      kws: ['door she opened', 'maximal pop'], kw: 'door she opened',
      conn: 'Different costume, same door kicked open, proof the new wave of pop women can be camp and theatrical, not just sad-girl acoustic.',
      lbl: 'OLIVIA TRACKS IN HER DNA', tracks: ['good 4 u', 'brutal'],
      fam: 'casual', image: oliviaAboutAssets['olivia-about-influence-chappell'],
      x: 110, y: 302, s: 54, float: 5,
    },
  ],
}

export function famLine(fam: Familiarity, name: string, out: boolean): string {
  if (fam === 'fan') return `★ You're a fan of ${name}`
  if (fam === 'casual') return `● You listen to ${name} sometimes`
  return out ? '○ New to you. Discover her through this page' : "○ New to you. You haven't played her yet"
}

/* ---------- generic web (any artist with about data) ---------- */

const IN_SLOTS = [
  { x: 66, y: 56, s: 62, float: 1 as const },
  { x: 272, y: 48, s: 56, float: 2 as const },
  { x: 48, y: 196, s: 54, float: 3 as const },
]
const OUT_SLOTS = [
  { x: 280, y: 218, s: 58, float: 4 as const },
  { x: 110, y: 302, s: 54, float: 5 as const },
]

function famFromBond(artKey: string): Familiarity {
  // The familiarity marks are the listener's own layer: read the real bond
  // with that artist when the avatar key is an artist id.
  const st = listenerStateFor(artKey)
  if (st === 'superfan' || st === 'regular') return 'fan'
  if (st === 'casual') return 'casual'
  return 'new'
}

function resolveImage(artKey: string): any {
  return artistAssets[artKey] ?? albumArtAssets[artKey] ?? null
}

/** Build the same spatial web from an artist's lightweight about data. */
export function buildInfluenceWeb(
  artistName: string,
  hubImage: any,
  hubFamLine: string,
  influencedBy: AboutInfluence[] = [],
  inspires: AboutInfluence[] = [],
): InfluenceWebData | null {
  if (influencedBy.length === 0 && inspires.length === 0) return null
  const first = artistName.split(' ')[0]
  const nodes: InfluenceWebNode[] = []
  influencedBy.slice(0, IN_SLOTS.length).forEach((p, i) => {
    nodes.push({
      key: p.artKey || p.name, name: p.name, out: false,
      rel: `SHAPED ${first.toUpperCase()}’S SOUND`, meta: '',
      kws: [], kw: '',
      conn: `Editors trace ${first}'s sound back through ${p.name}. Ask Alexa for the full thread.`,
      lbl: '', tracks: [],
      fam: famFromBond(p.artKey), image: resolveImage(p.artKey),
      ...IN_SLOTS[i],
    })
  })
  inspires.slice(0, OUT_SLOTS.length).forEach((p, i) => {
    nodes.push({
      key: p.artKey || p.name, name: p.name, out: true,
      rel: `${first.toUpperCase()} IS SHAPING`, meta: '',
      kws: [], kw: '',
      conn: `A new lane ${first} helped open. Editors hear the echo in ${p.name}. Ask Alexa for the full thread.`,
      lbl: '', tracks: [],
      fam: famFromBond(p.artKey), image: resolveImage(p.artKey),
      ...OUT_SLOTS[i],
    })
  })
  return {
    hubName: artistName,
    hubImage,
    hubFamLine,
    hubDetail: {
      key: 'hub', name: artistName, out: false,
      rel: 'THE CENTER OF THE WEB', meta: '',
      kws: [], kw: '',
      conn: `Every thread on this web runs through ${first}. Tap any artist around ${first} to see one thread up close.`,
      lbl: '', tracks: [],
    },
    legendIn: `SHAPED ${first.toUpperCase()}`,
    legendOut: `${first.toUpperCase()} IS SHAPING`,
    description: `Who shaped ${first}'s sound, including artists you already know`,
    nodes,
  }
}
