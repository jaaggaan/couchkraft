/**
 * Mock catalogue for the frontend-only CouchKraft redesign.
 * Not connected to inventory, pricing, or availability on couchkraft.in.
 */

export type CollectionTab = 'bestsellers' | 'new' | 'sets' | 'classics'

export type ProductSpace = 'living' | 'dining' | 'bedroom' | 'lounge'

export type Product = {
  id: string
  slug: string
  name: string
  price: number
  compareAt?: number
  description: string
  category: string
  space: ProductSpace
  tabs: CollectionTab[]
  images: string[]
  finishes: string[]
  care: string
}

const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

export const products: Product[] = [
  {
    id: 'ck-arden-sofa',
    slug: 'arden-three-seater-sofa',
    name: 'Arden Three-Seater Sofa',
    price: 148000,
    description:
      'A low, generously proportioned sofa in cream upholstery. Soft seating, a quiet oak frame and the kind of silhouette that belongs in a sunlit living room.',
    category: 'Sofa',
    space: 'living',
    tabs: ['bestsellers', 'classics', 'sets'],
    images: [
      img('photo-1567016432779-094069958ea5'),
      img('photo-1631679706909-1844bbd07221'),
      img('photo-1554995207-c18c203602cb'),
      img('photo-1493663284031-b7e3aefcae8e'),
    ],
    finishes: ['Cream bouclé', 'Warm oat linen'],
    care: 'Vacuum regularly. Professional clean only.',
  },
  {
    id: 'ck-luma-chair',
    slug: 'luma-lounge-chair',
    name: 'Luma Lounge Chair',
    price: 42000,
    description:
      'An open oak frame with a deep, cushioned seat. Designed for reading, conversation and the slower hours of the day.',
    category: 'Chair',
    space: 'lounge',
    tabs: ['bestsellers', 'new'],
    images: [
      img('photo-1567538096630-e0c55bd6374c'),
      img('photo-1592078615290-033ee584e267'),
      img('photo-1580480055273-228ff5388ef8'),
      img('photo-1544457070-4cd773b4d71e'),
    ],
    finishes: ['Natural oak', 'Walnut stain'],
    care: 'Dust the frame with a dry cloth. Keep out of prolonged direct sun.',
  },
  {
    id: 'ck-nordic-sideboard',
    slug: 'nordic-walnut-sideboard',
    name: 'Nordic Walnut Sideboard',
    price: 98000,
    description:
      'A three-drawer walnut sideboard with a quiet grain and a low, architectural profile. Storage that reads as furniture, not cabinetry.',
    category: 'Storage',
    space: 'living',
    tabs: ['bestsellers', 'classics'],
    images: [
      img('photo-1611967164521-abae8fba4668'),
      img('photo-1600585154526-990dced4db0d'),
      img('photo-1600566753086-00f18fb6b3ea'),
      img('photo-1556228453-efd6c1ff04f6'),
    ],
    finishes: ['Walnut'],
    care: 'Wipe with a slightly damp cloth. Use coasters on the top surface.',
  },
  {
    id: 'ck-solene-daybed',
    slug: 'solene-upholstered-daybed',
    name: 'Solene Upholstered Daybed',
    price: 89000,
    description:
      'A slender daybed in oatmeal linen. Equally at home as a sofa, a guest bed or a quiet place to rest by a window.',
    category: 'Daybed',
    space: 'bedroom',
    tabs: ['new', 'classics'],
    images: [
      img('photo-1505693416388-ac5ce068fe85'),
      img('photo-1540518614846-7eded433c457'),
      img('photo-1522771739844-6a9f6d5f14af'),
      img('photo-1615873968403-89e068629265'),
    ],
    finishes: ['Oatmeal linen'],
    care: 'Rotate cushions periodically. Professional clean only.',
  },
  {
    id: 'ck-mira-mirror',
    slug: 'mira-wall-mirror',
    name: 'Mira Wall Mirror',
    price: 24000,
    description:
      'A round oak-framed mirror with a thin, tactile rim. A simple way to lift light across a hallway, dining room or dressing space.',
    category: 'Mirror',
    space: 'lounge',
    tabs: ['bestsellers', 'new', 'sets'],
    images: [
      img('photo-1616046229478-9901c5536a45'),
      img('photo-1578500494198-246f612d3b3d'),
      img('photo-1618220179428-22790b461013'),
      img('photo-1600210491892-03d54c0aaf87'),
    ],
    finishes: ['Natural oak'],
    care: 'Clean glass with a non-abrasive cloth.',
  },
  {
    id: 'ck-theo-table',
    slug: 'theo-coffee-table',
    name: 'Theo Coffee Table',
    price: 36000,
    description:
      'A two-tier oak coffee table with a calm, rectilinear plan. Open storage below for books, trays and the objects of everyday living.',
    category: 'Table',
    space: 'living',
    tabs: ['bestsellers', 'sets', 'classics'],
    images: [
      img('photo-1533090481720-856c6e3c1fdc'),
      img('photo-1611269154421-4e27233ac5c7'),
      img('photo-1600121848594-d8644e57abab'),
      img('photo-1616137466211-f939a420be84'),
    ],
    finishes: ['Natural oak'],
    care: 'Use felt pads. Avoid standing water on the surface.',
  },
  {
    id: 'ck-theo-dining-chair',
    slug: 'theo-oak-chair',
    name: 'Theo Oak Chair',
    price: 18000,
    description:
      'A sculpted oak dining chair with a curved backrest. Light enough to move, considered enough to keep.',
    category: 'Chair',
    space: 'dining',
    tabs: ['new', 'sets'],
    images: [
      img('photo-1503602642458-232111445657'),
      img('photo-1544457070-4cd773b4d71e'),
      img('photo-1592078615290-033ee584e267'),
      img('photo-1580480055273-228ff5388ef8'),
    ],
    finishes: ['Natural oak'],
    care: 'Wipe after meals. Tighten joinery once a year.',
  },
  {
    id: 'ck-haven-bed',
    slug: 'haven-upholstered-bed',
    name: 'Haven Upholstered Bed',
    price: 126000,
    compareAt: 142000,
    description:
      'A low upholstered bed with a generous headboard. Soft structure, quiet colour and a silhouette made for unhurried mornings.',
    category: 'Bed',
    space: 'bedroom',
    tabs: ['new', 'classics'],
    images: [
      img('photo-1540518614846-7eded433c457'),
      img('photo-1615876234886-fd9a39fda97f'),
      img('photo-1522771739844-6a9f6d5f14af'),
      img('photo-1615873968403-89e068629265'),
    ],
    finishes: ['Warm oat', 'Stone linen'],
    care: 'Spot clean fabric. Professional clean for the headboard.',
  },
  {
    id: 'ck-orb-pendant',
    slug: 'orb-pendant-light',
    name: 'Orb Pendant Light',
    price: 16000,
    description:
      'A dark, dome pendant that gathers light over a table or daybed. Understated, architectural and easy to live with.',
    category: 'Lighting',
    space: 'dining',
    tabs: ['new'],
    images: [
      img('photo-1513506003901-1e6a229e2d15'),
      img('photo-1600607687939-ce8a6c25118c'),
      img('photo-1550254478-ead40cc54513'),
      img('photo-1600566753190-17f0baa2a6c3'),
    ],
    finishes: ['Matte charcoal'],
    care: 'Disconnect power before cleaning. Dust with a dry cloth.',
  },
  {
    id: 'ck-linen-ottoman',
    slug: 'linen-ottoman',
    name: 'Linen Ottoman',
    price: 22000,
    description:
      'A compact upholstered ottoman in warm linen. Use as a footrest, extra seat or a low table with a tray.',
    category: 'Ottoman',
    space: 'lounge',
    tabs: ['bestsellers', 'sets'],
    images: [
      img('photo-1540574163026-643ea20ade25'),
      img('photo-1484101403633-562f891dc89a'),
      img('photo-1586023492125-27b2c045efd7'),
      img('photo-1550254478-ead40cc54513'),
    ],
    finishes: ['Warm oat linen'],
    care: 'Vacuum the fabric. Rotate to even the wear.',
  },
]

export const collectionTabs: { id: CollectionTab; label: string }[] = [
  { id: 'bestsellers', label: 'Bestsellers' },
  { id: 'new', label: 'New Arrivals' },
  { id: 'sets', label: 'Curated Sets' },
  { id: 'classics', label: 'Timeless Classics' },
]

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug)
}

export function getRelatedProducts(product: Product, limit = 3) {
  return products
    .filter((item) => item.id !== product.id && (item.space === product.space || item.category === product.category))
    .slice(0, limit)
}

export function searchProducts(query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return products
  return products.filter((product) =>
    [product.name, product.category, product.description].some((field) => field.toLowerCase().includes(q)),
  )
}
