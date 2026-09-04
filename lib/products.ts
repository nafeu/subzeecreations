export type Product = {
  slug: string
  name: string
  category: string
  price: number
  description: string
  details: string[]
  color: string
  pattern: 'grid' | 'lines' | 'dots'
}

export const products: Product[] = [
  {
    slug: 'everyday-notebook',
    name: 'Everyday Notebook',
    category: 'Notebooks',
    price: 24,
    description: 'A quiet place for loud ideas, small lists, and everything in between.',
    details: ['A5 softcover', '160 dotted pages', 'FSC-certified paper'],
    color: '#d7dfcf',
    pattern: 'grid',
  },
  {
    slug: 'correspondence-set',
    name: 'Correspondence Set',
    category: 'Paper goods',
    price: 18,
    description: 'A considered set for sending a little more thought through the post.',
    details: ['8 folded cards', '8 recycled envelopes', 'Soy-based ink'],
    color: '#e7d8cc',
    pattern: 'lines',
  },
  {
    slug: 'desk-notes',
    name: 'Desk Notes',
    category: 'Everyday tools',
    price: 12,
    description: 'The little tear-off pad that keeps your desk, and your day, in order.',
    details: ['80 tear-off sheets', 'A6 format', 'Vegetable inks'],
    color: '#ded4b9',
    pattern: 'dots',
  },
]

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug)
}

export const formatPrice = (price: number) => `$${price.toFixed(2)}`

