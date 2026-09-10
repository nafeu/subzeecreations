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

export function productHasCategory(product: Pick<Product, 'categories'>, category: string) {
  const target = category.toLowerCase()
  return product.categories.some((entry) => entry.toLowerCase() === target)
}

export function getAllCategories(products: Product[]) {
  const seen = new Map<string, string>()

  for (const product of products) {
    for (const category of product.categories) {
      const key = category.toLowerCase()
      if (!seen.has(key)) seen.set(key, category)
    }
  }

  return Array.from(seen.values()).sort((a, b) => a.localeCompare(b))
}
