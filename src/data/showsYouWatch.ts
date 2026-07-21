export type ShowYouWatch = {
  id: string
  title: string
  subtitle: string
  bannerKey: string
  playlistId: string
  accentColor: string
}

export const SHOWS_YOU_WATCH: ShowYouWatch[] = [
  {
    id: 'show-love-island',
    title: 'For the Villa',
    subtitle: 'Official playlist · For Islanders',
    bannerKey: 'love-island-banner',
    playlistId: 'pl-love-island',
    accentColor: '#D4A843',
  },
  {
    id: 'show-summer-turned-pretty',
    title: 'The Summer I Turned Pretty',
    subtitle: 'Soundtrack',
    bannerKey: 'summer-i-turned-pretty',
    playlistId: 'pl-summer-turned-pretty',
    accentColor: '#4A8BC4',
  },
  {
    id: 'show-heated-rivalry',
    title: 'Heated Rivalry',
    subtitle: 'Music from the show',
    bannerKey: 'heated-rivalry',
    playlistId: 'pl-heated-rivalry',
    accentColor: '#C4924A',
  },
]

export const showYouWatchPlaylistIds = SHOWS_YOU_WATCH.map(sh => sh.playlistId)
