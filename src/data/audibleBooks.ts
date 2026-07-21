export interface AudiobookChapter {
  id: string
  title: string
  durationMinutes: number
  isSample?: boolean
}

export interface Audiobook {
  id: string
  title: string
  author: string
  narrator: string
  description: string
  category: string
  durationHours: number
  durationMinutes: number
  coverColor: string
  coverArtPath?: string
  rating: number
  reviewCount: number
  releaseYear: number
  chapters: AudiobookChapter[]
  isExclusive?: boolean
}

export const AUDIBLE_CATEGORIES = [
  'Bestsellers',
  'New Releases',
  'Sci-Fi',
  'Self-Help',
  'Biographies',
  'Mystery',
] as const

export type AudibleCategory = (typeof AUDIBLE_CATEGORIES)[number]

export const audiobooks: Audiobook[] = [
  {
    id: 'ab-atomic-habits',
    title: 'Atomic Habits',
    author: 'James Clear',
    narrator: 'James Clear',
    description:
      'Tiny changes, remarkable results. An easy and proven way to build good habits and break bad ones — practical strategies that will teach you how to design your environment for success.',
    category: 'Self-Help',
    durationHours: 5,
    durationMinutes: 35,
    coverColor: '#2a3a1a',
    coverArtPath: 'carole-king-tapestry',
    rating: 4.8,
    reviewCount: 89200,
    releaseYear: 2018,
    isExclusive: true,
    chapters: [
      { id: 'ch1', title: 'Introduction: My Story', durationMinutes: 14, isSample: true },
      { id: 'ch2', title: 'The Fundamentals', durationMinutes: 22, isSample: true },
      { id: 'ch3', title: 'How Your Habits Shape Your Identity', durationMinutes: 28 },
      { id: 'ch4', title: 'The 1st Law: Make It Obvious', durationMinutes: 31 },
      { id: 'ch5', title: 'The 2nd Law: Make It Attractive', durationMinutes: 26 },
      { id: 'ch6', title: 'The 3rd Law: Make It Easy', durationMinutes: 29 },
      { id: 'ch7', title: 'The 4th Law: Make It Satisfying', durationMinutes: 24 },
    ],
  },
  {
    id: 'ab-project-hail-mary',
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    narrator: 'Ray Porter',
    description:
      'Ryland Grace is the sole survivor on a desperate, last-chance mission — and if he fails, humanity and Earth itself will perish. A propulsive, full-throttle adventure from the author of The Martian.',
    category: 'Sci-Fi',
    durationHours: 16,
    durationMinutes: 10,
    coverColor: '#1a2a4a',
    coverArtPath: 'pink-floyd-dark-side',
    rating: 4.9,
    reviewCount: 124500,
    releaseYear: 2021,
    chapters: [
      { id: 'ch1', title: 'Chapter 1', durationMinutes: 42, isSample: true },
      { id: 'ch2', title: 'Chapter 2', durationMinutes: 38 },
      { id: 'ch3', title: 'Chapter 3', durationMinutes: 45 },
      { id: 'ch4', title: 'Chapter 4', durationMinutes: 41 },
      { id: 'ch5', title: 'Chapter 5', durationMinutes: 39 },
    ],
  },
  {
    id: 'ab-midnight-library',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    narrator: 'Carey Mulligan',
    description:
      'Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.',
    category: 'New Releases',
    durationHours: 8,
    durationMinutes: 50,
    coverColor: '#1a2840',
    coverArtPath: 'lana-norman-rockwell',
    rating: 4.6,
    reviewCount: 67800,
    releaseYear: 2020,
    chapters: [
      { id: 'ch1', title: 'Nineteen Years Before She Decides to Die', durationMinutes: 18, isSample: true },
      { id: 'ch2', title: 'The Midnight Library', durationMinutes: 24 },
      { id: 'ch3', title: 'A Life Without Swimming', durationMinutes: 31 },
      { id: 'ch4', title: 'A Life Where She Stays in Bedford', durationMinutes: 28 },
    ],
  },
  {
    id: 'ab-educated',
    title: 'Educated',
    author: 'Tara Westover',
    narrator: 'Julia Whelan',
    description:
      'A memoir about a young girl who, kept out of school, leaves her survivalist family and goes on to earn a PhD from Cambridge University.',
    category: 'Biographies',
    durationHours: 12,
    durationMinutes: 10,
    coverColor: '#3a2a1a',
    coverArtPath: 'whitney-self-titled',
    rating: 4.7,
    reviewCount: 95600,
    releaseYear: 2018,
    chapters: [
      { id: 'ch1', title: 'Choose the Good', durationMinutes: 35, isSample: true },
      { id: 'ch2', title: 'The Midwife', durationMinutes: 42 },
      { id: 'ch3', title: 'Shakespeare, My Mother, and You', durationMinutes: 38 },
      { id: 'ch4', title: 'Apostate', durationMinutes: 44 },
    ],
  },
  {
    id: 'ab-silent-patient',
    title: 'The Silent Patient',
    author: 'Alex Michaelides',
    narrator: 'Jack Hawkins & Louise Brealey',
    description:
      'A woman refuses to speak after allegedly murdering her husband. A criminal psychotherapist is determined to unravel her motive in this gripping psychological thriller.',
    category: 'Mystery',
    durationHours: 8,
    durationMinutes: 43,
    coverColor: '#1a1a3a',
    coverArtPath: 'fka-twigs-lp1',
    rating: 4.5,
    reviewCount: 112300,
    releaseYear: 2019,
    chapters: [
      { id: 'ch1', title: 'Part One: Alicia Berenson', durationMinutes: 22, isSample: true },
      { id: 'ch2', title: 'Part Two: Theo Faber', durationMinutes: 28 },
      { id: 'ch3', title: 'Part Three: The Truth', durationMinutes: 31 },
    ],
  },
  {
    id: 'ab-fourth-wing',
    title: 'Fourth Wing',
    author: 'Rebecca Yarros',
    narrator: 'Rebecca Soler & Teddy Hamilton',
    description:
      'Enter the brutal and elite world of a war college for dragon riders. Twenty-year-old Violet Sorrengail was supposed to enter the Scribe Quadrant, but the general has ordered her to become a candidate.',
    category: 'Bestsellers',
    durationHours: 23,
    durationMinutes: 2,
    coverColor: '#4a1a2a',
    coverArtPath: 'drake-iceman',
    rating: 4.8,
    reviewCount: 187400,
    releaseYear: 2023,
    isExclusive: true,
    chapters: [
      { id: 'ch1', title: 'Chapter 1', durationMinutes: 48, isSample: true },
      { id: 'ch2', title: 'Chapter 2', durationMinutes: 52 },
      { id: 'ch3', title: 'Chapter 3', durationMinutes: 46 },
      { id: 'ch4', title: 'Chapter 4', durationMinutes: 50 },
    ],
  },
  {
    id: 'ab-tomorrow-tomorrow',
    title: 'Tomorrow, and Tomorrow, and Tomorrow',
    author: 'Gabrielle Zevin',
    narrator: 'Jennifer Beals & Arthur Gregory Pugh',
    description:
      'Two friends find their way through love, fame, and fortune over thirty years as they create a legendary video game and navigate the complexities of ambition and art.',
    category: 'Bestsellers',
    durationHours: 13,
    durationMinutes: 52,
    coverColor: '#2a3a4a',
    coverArtPath: 'beatles-sgt-peppers',
    rating: 4.7,
    reviewCount: 73400,
    releaseYear: 2022,
    chapters: [
      { id: 'ch1', title: 'Part I: Wozniak', durationMinutes: 36, isSample: true },
      { id: 'ch2', title: 'Part II: Unfair', durationMinutes: 41 },
      { id: 'ch3', title: 'Part III: Mapmaker', durationMinutes: 38 },
    ],
  },
  {
    id: 'ab-dune',
    title: 'Dune',
    author: 'Frank Herbert',
    narrator: 'Scott Brick, Orlagh Cassidy & others',
    description:
      'Set on the desert planet Arrakis, Dune is the story of Paul Atreides — who would become Muad\'Dib — and would bring to fruition humankind\'s most ancient and unattainable dream.',
    category: 'Sci-Fi',
    durationHours: 21,
    durationMinutes: 2,
    coverColor: '#3a2a10',
    coverArtPath: 'metallica-master',
    rating: 4.6,
    reviewCount: 156800,
    releaseYear: 1965,
    chapters: [
      { id: 'ch1', title: 'Book I: Dune', durationMinutes: 55, isSample: true },
      { id: 'ch2', title: 'Book II: Muad\'Dib', durationMinutes: 62 },
      { id: 'ch3', title: 'Book III: The Prophet', durationMinutes: 58 },
    ],
  },
  {
    id: 'ab-becoming',
    title: 'Becoming',
    author: 'Michelle Obama',
    narrator: 'Michelle Obama',
    description:
      'In her memoir, a work of deep reflection and storytelling, Michelle Obama invites readers into her world, chronicling the experiences that have shaped her.',
    category: 'Biographies',
    durationHours: 19,
    durationMinutes: 3,
    coverColor: '#1a3040',
    coverArtPath: 'beyonce-lemonade',
    rating: 4.9,
    reviewCount: 203500,
    releaseYear: 2018,
    chapters: [
      { id: 'ch1', title: 'Becoming Me', durationMinutes: 44, isSample: true },
      { id: 'ch2', title: 'Becoming Us', durationMinutes: 52 },
      { id: 'ch3', title: 'Becoming More', durationMinutes: 48 },
    ],
  },
  {
    id: 'ab-thursday-murder',
    title: 'The Thursday Murder Club',
    author: 'Richard Osman',
    narrator: 'Lesley Manville',
    description:
      'In a peaceful retirement village, four unlikely friends meet weekly to investigate cold cases. But when a local developer is found dead, they find a live case on their hands.',
    category: 'Mystery',
    durationHours: 12,
    durationMinutes: 25,
    coverColor: '#2a1a3a',
    coverArtPath: 'fleetwood-rumours',
    rating: 4.4,
    reviewCount: 48900,
    releaseYear: 2020,
    chapters: [
      { id: 'ch1', title: 'Chapter 1', durationMinutes: 32, isSample: true },
      { id: 'ch2', title: 'Chapter 2', durationMinutes: 28 },
      { id: 'ch3', title: 'Chapter 3', durationMinutes: 35 },
    ],
  },
  {
    id: 'ab-5am-club',
    title: 'The 5 AM Club',
    author: 'Robin Sharma',
    narrator: 'Adam Verner',
    description:
      'Legendary leadership and elite performance expert Robin Sharma introduced The 5 AM Club concept over twenty years ago. Now this life-changing book reveals how great geniuses and everyday heroes use the morning to rise to world-class.',
    category: 'Self-Help',
    durationHours: 13,
    durationMinutes: 58,
    coverColor: '#1a3a3a',
    coverArtPath: 'elton-goodbye-yellow',
    rating: 4.3,
    reviewCount: 32100,
    releaseYear: 2018,
    chapters: [
      { id: 'ch1', title: 'The Spellbinder\'s Gift', durationMinutes: 26, isSample: true },
      { id: 'ch2', title: 'The 5 AM Method', durationMinutes: 34 },
      { id: 'ch3', title: 'The 20/20/20 Formula', durationMinutes: 29 },
    ],
  },
  {
    id: 'ab-iron-flame',
    title: 'Iron Flame',
    author: 'Rebecca Yarros',
    narrator: 'Rebecca Soler & Teddy Hamilton',
    description:
      'Everyone expected Violet Sorrengail to die during her first year at Basgiath War College — Violet included. But Threshing was only the first impossible test.',
    category: 'New Releases',
    durationHours: 26,
    durationMinutes: 30,
    coverColor: '#4a2010',
    coverArtPath: 'janet-rhythm-nation',
    rating: 4.7,
    reviewCount: 98200,
    releaseYear: 2023,
    chapters: [
      { id: 'ch1', title: 'Chapter 1', durationMinutes: 50, isSample: true },
      { id: 'ch2', title: 'Chapter 2', durationMinutes: 54 },
      { id: 'ch3', title: 'Chapter 3', durationMinutes: 48 },
    ],
  },
]

export const libraryAudiobookIds = [
  'ab-atomic-habits',
  'ab-project-hail-mary',
  'ab-midnight-library',
  'ab-educated',
  'ab-fourth-wing',
  'ab-silent-patient',
]

export function findAudiobook(id: string | undefined): Audiobook | undefined {
  return audiobooks.find(b => b.id === id)
}

export function getBooksByCategory(category: string): Audiobook[] {
  const inCat = audiobooks.filter(b => b.category === category)
  const rest = audiobooks.filter(b => b.category !== category)
  const seen = new Set<string>()
  return [...inCat, ...rest].filter(b => (seen.has(b.id) ? false : seen.add(b.id)))
}

export function getLibraryAudiobooks(): Audiobook[] {
  return libraryAudiobookIds
    .map(id => findAudiobook(id))
    .filter((b): b is Audiobook => b != null)
}

export function formatAudiobookDuration(book: Audiobook): string {
  if (book.durationMinutes === 0) return `${book.durationHours} hr`
  return `${book.durationHours} hr ${book.durationMinutes} min`
}

export function formatChapterDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h} hr ${m} min` : `${h} hr`
}

export function formatReviewCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}K`
  return String(count)
}
