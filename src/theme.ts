export const C = {
  // Amazon Music canvas & surfaces — near-black base
  bg:          '#0a0a0a',
  surface:     '#161616',
  elevated:    '#222222',
  border:      '#2a2a2a',
  tabBar:      '#080808',
  gradientTop: '#1a1a1a',

  // Brand teal — Figma Amazon Music canonical #25D1DA
  cyan:        '#25D1DA',   // play button, scrubber, primary CTA
  cyanBright:  '#25D1DA',   // active tab, highlights, badges (alias)
  cyanDim:     '#1BA8B0',   // pressed / darker variant

  // Character system (research prototype)
  purple:      '#7c3aed',
  violet:      '#8b5cf6',
  pink:        '#ec4899',
  blue:        '#3b82f6',
  rose:        '#f43f5e',
  indigo:      '#6366f1',
  green:       '#10b981',

  // Achievement
  gold:        '#f59e0b',
  goldLight:   '#fbbf24',

  // Text (teal-tinted greys)
  textPrimary:   '#ffffff',
  textSecondary: '#9FB6BF',
  textMuted:     '#6B8693',

  // Bottom tab bar (Figma Nav bar)
  navBg:           '#000000',
  navActive:       '#25D1DA',
  navInactive:     '#999999',
  navIconSize:     23,
  navItemWidth:    56,
  navLabelSize:    12,
  navPaddingTop:   8,
  navPaddingH:     68,
} as const

export const R = {
  sm:  6,
  md:  10,
  lg:  16,
  xl:  24,
  full: 9999,
} as const

export const FONT = {
  xs:   11,
  sm:   13,
  base: 15,
  md:   16,
  lg:   18,
  xl:   20,
  xxl:  24,
  xxxl: 28,
  h:    32,
} as const

// Amazon Music brand typography (Ember Modern v1.1)
//   EmberModernDisplay — headlines, hero titles, section headers (Bold/Regular)
//   EmberModernText    — body copy, labels, metadata (Bold/Regular)

export const FONT_FAMILY_DISPLAY = {
  regular: 'EmberModernDisplay-Regular',
  bold:    'EmberModernDisplay-Bold',
} as const

export const FONT_FAMILY = {
  light:    'EmberModernText-Regular',
  regular:  'EmberModernText-Regular',
  medium:   'EmberModernText-Bold',
  semibold: 'EmberModernText-Bold',
  bold:     'EmberModernText-Bold',
  heavy:    'EmberModernDisplay-Bold',
} as const

/** Ember Modern Display Bold — sentence case, 90% leading, 0 tracking */
export function typeHeadline(fontSize: number) {
  return {
    fontFamily: FONT_FAMILY_DISPLAY.bold,
    fontSize,
    lineHeight: fontSize * 0.9,
    letterSpacing: 0,
  } as const
}

/** Ember Modern Display Regular — sentence case, 100% leading, 0 tracking */
export function typeSubhead(fontSize: number) {
  return {
    fontFamily: FONT_FAMILY_DISPLAY.regular,
    fontSize,
    lineHeight: fontSize,
    letterSpacing: 0,
  } as const
}

export const PLAYER_GRADIENT = ['#1C4A57', '#163A45', '#0F2730', C.bg] as const

export const VARIANT_EMOJI: Record<string, string> = {
  kpop:      '\u{1F49C}',
  indie:     '\u{1F33F}',
  latenight: '\u{1F319}',
  hiphop:    '\u{1F3A4}',
}

export const MOOD_EMOJI: Record<string, string> = {
  idle:     '\u2728',
  sad:      '\u{1F4A7}',
  hype:     '\u26A1',
  chill:    '\u{1F60E}',
  happy:    '\u{1F604}',
  love:     '\u{1F970}',
  sleepy:   '\u{1F634}',
  angry:    '\u{1F620}',
  anxious:  '\u{1F630}',
  surprised:'\u{1F632}',
}

export const MOOD_COLOR: Record<string, string> = {
  idle:      C.cyanBright,
  sad:       C.indigo,
  hype:      C.pink,
  chill:     '#4fc3f7',
  happy:     '#ffb300',
  love:      '#f48fb1',
  sleepy:    '#9575cd',
  angry:     '#ef5350',
  anxious:   '#ff8f00',
  surprised: '#ab47bc',
}
