export type Product = {
  slug: string
  name: string
  categories: string[]
  price: number
  description: string
  details: string[]
  images?: string[]
  galleryImages?: string[]
  color: string
  pattern: 'grid' | 'lines' | 'dots'
  order?: number
}

export const getPrimaryImage = (product: Pick<Product, 'images'>) => product.images?.[0]

export const formatPrice = (price: number) => `$${price.toFixed(2)}`

export const formatProductCategories = (categories: string[]) => categories.join(' · ')
