// One registry mapping a superfan theme id → its loyalty "world" content, so the
// adaptive home can render the same rich bento (top track, exclusive, tour news,
// merch) for any superfan persona — Olivia, Taylor, BTS — instead of hard-coding
// one artist.
import { OLIVIA_TOP_TRACK, OLIVIA_EXCLUSIVE_TRACK, OLIVIA_NEWS, OLIVIA_MERCH } from './oliviaSuperFanContent'
import { TAYLOR_TOP_TRACK, TAYLOR_EXCLUSIVE_TRACK, TAYLOR_NEWS, TAYLOR_SUPERFAN_MERCH } from './taylorSuperFanContent'
import { BTS_TOP_TRACK, BTS_EXCLUSIVE_TRACK, BTS_NEWS, BTS_SUPERFAN_MERCH } from './btsSuperFanContent'

export type SuperFanMerch = { id: string; label: string; artKey: string }

export type SuperFanContent = {
  topTrack: { songId: string; title: string; playCount: number; artKey: string }
  exclusive: { songId: string; title: string; subtitle: string; artKey: string }
  news: { headline: string; body: string; date: string }
  merch: SuperFanMerch[]
}

export const SUPERFAN_CONTENT: Record<string, SuperFanContent> = {
  'olivia-rodrigo-superfan': {
    topTrack: OLIVIA_TOP_TRACK,
    exclusive: OLIVIA_EXCLUSIVE_TRACK,
    news: OLIVIA_NEWS,
    merch: OLIVIA_MERCH,
  },
  'taylor-swift-superfan': {
    topTrack: TAYLOR_TOP_TRACK,
    exclusive: TAYLOR_EXCLUSIVE_TRACK,
    news: TAYLOR_NEWS,
    merch: TAYLOR_SUPERFAN_MERCH,
  },
  'bts-superfan': {
    topTrack: BTS_TOP_TRACK,
    exclusive: BTS_EXCLUSIVE_TRACK,
    news: BTS_NEWS,
    merch: BTS_SUPERFAN_MERCH,
  },
}

export function getSuperFanContent(themeId: string | undefined): SuperFanContent | undefined {
  return themeId ? SUPERFAN_CONTENT[themeId] : undefined
}
