// Superfan unlock perks for artist "You & Artist" tabs and detail pages.
// Merch discounts, show tickets, presales, and fan bundles — no exclusive audio.

import { albumArtAssets, artistAssets, oliviaAboutAssets } from './assetMap'

export type ExclusiveOfferKind = 'merch' | 'tickets' | 'presale' | 'bundle'

export type ExclusiveOffer = {
  id: string
  kind: ExclusiveOfferKind
  title: string
  subtitle: string
  cardTitle: string
  badge: string
  artistName: string
  heroArtKey: string
  heroHue: string
  unlockReason: string
  description: string
  perks: string[]
  originalPrice?: string
  discountedPrice?: string
  expiresLabel?: string
  ctaLabel: string
  relatedOfferIds?: string[]
}

const OFFERS: Record<string, ExclusiveOffer> = {
  'offer-or-merch': {
    id: 'offer-or-merch',
    kind: 'merch',
    title: '20% off GUTS tour merch',
    subtitle: 'Superfan discount on tees, vinyl & posters',
    cardTitle: '20% off tour merch',
    badge: '20% OFF',
    artistName: 'Olivia Rodrigo',
    heroArtKey: 'olivia-about-merch-tee',
    heroHue: '#6B3FA0',
    unlockReason: 'Top 1% listener perk',
    description:
      'Your superfan status unlocks 20% off the official GUTS World Tour collection — tees, hoodies, vinyl, and signed posters, shipped from the artist store.',
    perks: [
      'Tour tee & hoodie collection',
      'Signed GUTS vinyl (limited qty)',
      'Exclusive poster set',
      'Free shipping on orders $50+',
    ],
    originalPrice: '$45',
    discountedPrice: '$36',
    expiresLabel: 'Ends Aug 15, 2026',
    ctaLabel: 'Claim discount',
    relatedOfferIds: ['offer-or-tickets'],
  },
  'offer-or-tickets': {
    id: 'offer-or-tickets',
    kind: 'tickets',
    title: 'GUTS World Tour presale',
    subtitle: '48-hour early access to tickets',
    cardTitle: 'Tour ticket presale',
    badge: 'PRESALE',
    artistName: 'Olivia Rodrigo',
    heroArtKey: 'olivia-rodrigo-guts',
    heroHue: '#6B3FA0',
    unlockReason: 'Top 1% listener perk',
    description:
      'Jump the line for GUTS World Tour dates. Superfans get a 48-hour presale window before tickets go on sale to everyone else.',
    perks: [
      '48-hour presale window',
      'Up to 4 tickets per order',
      'Venue map priority seating',
      'Presale code sent to your inbox',
    ],
    expiresLabel: 'Presale opens Jul 18, 2026',
    ctaLabel: 'Get presale access',
    relatedOfferIds: ['offer-or-merch'],
  },
  'offer-ts-presale': {
    id: 'offer-ts-presale',
    kind: 'presale',
    title: 'Eras Tour ticket presale',
    subtitle: 'Verified Swiftie early access',
    cardTitle: 'Eras Tour presale',
    badge: 'PRESALE',
    artistName: 'Taylor Swift',
    heroArtKey: 'ts-showgirl',
    heroHue: '#C9A0DC',
    unlockReason: 'Top 1% Swiftie perk',
    description:
      'The Life of a Showgirl World Tour presale is live for verified superfans. Lock in your seats before the public on-sale.',
    perks: [
      'Verified fan presale code',
      'Up to 6 tickets per city',
      'SoFi Stadium priority blocks',
      'Companion pass for one show',
    ],
    expiresLabel: 'Presale ends Jul 21, 2026',
    ctaLabel: 'Enter presale',
    relatedOfferIds: ['offer-ts-merch'],
  },
  'offer-ts-merch': {
    id: 'offer-ts-merch',
    kind: 'merch',
    title: '15% off Eras Tour merch',
    subtitle: 'Crew tees, vinyl & signed anthologies',
    cardTitle: '15% off Eras merch',
    badge: '15% OFF',
    artistName: 'Taylor Swift',
    heroArtKey: 'ts-reputation',
    heroHue: '#C9A0DC',
    unlockReason: 'Top 1% Swiftie perk',
    description:
      'Shop the Eras Tour capsule with a superfan-only discount — crew tees, limited vinyl pressings, and signed anthology sets.',
    perks: [
      'Eras Tour crew tee',
      'Limited reputation vinyl',
      'Signed TTPD anthology',
      'Early access to new drops',
    ],
    originalPrice: '$55',
    discountedPrice: '$47',
    expiresLabel: 'Ends Sep 1, 2026',
    ctaLabel: 'Shop with discount',
    relatedOfferIds: ['offer-ts-presale'],
  },
  'offer-bts-tickets': {
    id: 'offer-bts-tickets',
    kind: 'tickets',
    title: 'Yet To Come tour tickets',
    subtitle: 'ARMY-exclusive early access',
    cardTitle: 'Tour ticket bundle',
    badge: 'EARLY ACCESS',
    artistName: 'BTS',
    heroArtKey: 'bts-proof-door',
    heroHue: '#7B2D8E',
    unlockReason: 'Top 1% ARMY perk',
    description:
      'The 2026 group comeback tour opens to ARMY superfans first. Secure your seats for Seoul, LA, and London before general sale.',
    perks: [
      '24-hour ARMY presale',
      'Seoul & LA priority blocks',
      'Fan light stick bundle included',
      'Meet-up lounge access (select cities)',
    ],
    expiresLabel: 'Presale opens Aug 2, 2026',
    ctaLabel: 'Reserve tickets',
    relatedOfferIds: ['offer-bts-merch'],
  },
  'offer-bts-merch': {
    id: 'offer-bts-merch',
    kind: 'merch',
    title: 'ARMY merch bundle deal',
    subtitle: 'Proof vinyl + tour tee combo',
    cardTitle: 'ARMY merch bundle',
    badge: 'BUNDLE',
    artistName: 'BTS',
    heroArtKey: 'bts-young-forever',
    heroHue: '#7B2D8E',
    unlockReason: 'Top 1% ARMY perk',
    description:
      'A superfan-only bundle: Proof collector vinyl, Yet To Come tour tee, and an exclusive pin — one checkout, one discount.',
    perks: [
      'Proof collector vinyl',
      'Yet To Come tour tee',
      'ARMY exclusive enamel pin',
      '25% off vs buying separately',
    ],
    originalPrice: '$89',
    discountedPrice: '$67',
    expiresLabel: 'Limited stock',
    ctaLabel: 'View bundle',
    relatedOfferIds: ['offer-bts-tickets'],
  },
  'offer-kpop-bundle': {
    id: 'offer-kpop-bundle',
    kind: 'bundle',
    title: 'Stan merch starter pack',
    subtitle: 'BTS, BLACKPINK & NewJeans picks',
    cardTitle: 'K-pop fan bundle',
    badge: 'BUNDLE',
    artistName: 'K-pop',
    heroArtKey: 'bts-proof-door',
    heroHue: '#7B2D8E',
    unlockReason: 'Loyal listener perk',
    description:
      'Curated merch picks across your top K-pop artists — light sticks, photocards, and official tees at a bundled superfan rate.',
    perks: [
      'Artist tee of your choice',
      'Official light stick accessory',
      'Photocard set (3 artists)',
      '10% off your next order',
    ],
    originalPrice: '$72',
    discountedPrice: '$58',
    ctaLabel: 'View bundle',
  },
  'offer-li-bundle': {
    id: 'offer-li-bundle',
    kind: 'bundle',
    title: 'Villa watch party kit',
    subtitle: 'Merch + streaming perks for Islanders',
    cardTitle: 'Villa fan bundle',
    badge: 'EXCLUSIVE',
    artistName: 'Love Island',
    heroArtKey: 'love-island-banner',
    heroHue: '#D4A843',
    unlockReason: 'Villa season perk',
    description:
      'Everything for grafting season — official Villa tee, Casa Amor poster, and early access to the next episode drop party stream.',
    perks: [
      'Official Villa season tee',
      'Casa Amor wall poster',
      'Episode drop party stream access',
      'Islanders playlist pin',
    ],
    originalPrice: '$38',
    discountedPrice: '$29',
    ctaLabel: 'Claim bundle',
  },
  'offer-generic-merch': {
    id: 'offer-generic-merch',
    kind: 'merch',
    title: '10% off official merch',
    subtitle: 'Superfan store discount',
    cardTitle: '10% off merch',
    badge: '10% OFF',
    artistName: 'Your artist',
    heroArtKey: 'beyonce-lemonade',
    heroHue: '#3a2030',
    unlockReason: 'Loyal listener perk',
    description:
      'Your listening streak unlocked a store-wide discount on official artist merch — tees, vinyl, and accessories.',
    perks: [
      'Official artist store items',
      'Vinyl & CD pressings',
      'Tour merchandise',
      'Free returns within 30 days',
    ],
    originalPrice: '$40',
    discountedPrice: '$36',
    ctaLabel: 'Claim discount',
  },
}

const THEME_PRIMARY_OFFER: Record<string, string> = {
  'olivia-rodrigo-superfan': 'offer-or-merch',
  'taylor-swift-superfan': 'offer-ts-presale',
  'bts-superfan': 'offer-bts-tickets',
  'taylor-swift': 'offer-ts-merch',
  kpop: 'offer-kpop-bundle',
  'love-island': 'offer-li-bundle',
}

const ARTIST_PRIMARY_OFFER: Record<string, string> = {
  'olivia-rodrigo': 'offer-or-merch',
  tswift: 'offer-ts-presale',
  bts: 'offer-bts-tickets',
}

export function findExclusiveOffer(id: string | undefined): ExclusiveOffer | undefined {
  if (!id) return undefined
  return OFFERS[id]
}

export function getExclusiveOffersForArtist(artistId: string): ExclusiveOffer[] {
  const primaryId = ARTIST_PRIMARY_OFFER[artistId]
  if (!primaryId) return []
  const primary = OFFERS[primaryId]
  if (!primary) return []
  const related = (primary.relatedOfferIds ?? [])
    .map(id => OFFERS[id])
    .filter((o): o is ExclusiveOffer => o != null)
  return [primary, ...related]
}

export function getExclusiveOfferForTheme(
  themeId: string | undefined,
  heroArtistId?: string,
  fandomLabel?: string,
): ExclusiveOffer {
  const primaryId =
    (themeId && THEME_PRIMARY_OFFER[themeId]) ??
    (heroArtistId && ARTIST_PRIMARY_OFFER[heroArtistId]) ??
    'offer-generic-merch'

  const offer = OFFERS[primaryId] ?? OFFERS['offer-generic-merch']
  if (offer.id === 'offer-generic-merch' && fandomLabel) {
    return {
      ...offer,
      artistName: fandomLabel,
      title: `10% off ${fandomLabel} merch`,
      subtitle: 'Superfan store discount',
      cardTitle: '10% off merch',
    }
  }
  return offer
}

export function resolveOfferArt(artKey: string) {
  return albumArtAssets[artKey] ?? artistAssets[artKey] ?? oliviaAboutAssets[artKey] ?? null
}

export function iconForOfferKind(kind: ExclusiveOfferKind): string {
  switch (kind) {
    case 'merch':
      return 'shirt-outline'
    case 'tickets':
      return 'ticket-outline'
    case 'presale':
      return 'flash-outline'
    case 'bundle':
      return 'gift-outline'
  }
}
