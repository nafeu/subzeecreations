export type Product = {
  slug: string
  name: string
  category: string
  price: number
  description: string
  details: string[]
  images?: string[]
  color: string
  pattern: 'grid' | 'lines' | 'dots'
  order?: number
}

export const getPrimaryImage = (product: Pick<Product, 'images'>) => product.images?.[0]

export const formatPrice = (price: number) => `$${price.toFixed(2)}`
