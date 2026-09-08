export type Product = {
  slug: string
  name: string
  category: string
  price: number
  description: string
  details: string[]
  image?: string
  color: string
  pattern: 'grid' | 'lines' | 'dots'
  order?: number
}

export const formatPrice = (price: number) => `$${price.toFixed(2)}`
