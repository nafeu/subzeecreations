import 'server-only'
import fs from 'fs'
import path from 'path'
import type { Product } from '@/lib/products'

const productsDir = path.join(process.cwd(), 'content/products')

function normalizeImages(raw: { image?: string; images?: Array<string | { image?: string }> }): string[] {
  if (raw.images?.length) {
    return raw.images
      .map((entry) => (typeof entry === 'string' ? entry : (entry.image ?? '')))
      .filter(Boolean)
  }

  if (raw.image) return [raw.image]

  return []
}

function normalizeCategories(raw: {
  category?: string
  categories?: Array<string | { category?: string }>
}): string[] {
  if (raw.categories?.length) {
    return raw.categories
      .map((entry) => (typeof entry === 'string' ? entry : (entry.category ?? '')))
      .map((category) => category.trim())
      .filter(Boolean)
  }

  if (raw.category?.trim()) return [raw.category.trim()]

  return []
}

function normalizeProduct(
  raw: Omit<Product, 'categories'> & {
    category?: string
    categories?: Array<string | { category?: string }>
    image?: string
    details?: Array<string | { detail?: string }>
    galleryImages?: Array<string | { image?: string }>
  },
): Product {
  const details = (raw.details ?? [])
    .map((detail) => (typeof detail === 'string' ? detail : (detail.detail ?? '')))
    .filter(Boolean)

  const {
    image: _image,
    images: _images,
    galleryImages: _galleryImages,
    category: _category,
    categories: _categories,
    ...rest
  } = raw
  const images = normalizeImages(raw)
  const galleryImages = normalizeImages({ images: raw.galleryImages })

  return {
    ...rest,
    categories: normalizeCategories(raw),
    details,
    ...(images.length ? { images } : {}),
    ...(galleryImages.length ? { galleryImages } : {}),
  }
}

export function getProducts(): Product[] {
  if (!fs.existsSync(productsDir)) return []

  return fs
    .readdirSync(productsDir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => normalizeProduct(JSON.parse(fs.readFileSync(path.join(productsDir, file), 'utf-8'))))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

export function getProduct(slug: string) {
  return getProducts().find((product) => product.slug === slug)
}

export function getRelatedProducts(product: Pick<Product, 'slug' | 'categories'>) {
  return getProducts().filter(
    (candidate) =>
      candidate.slug !== product.slug &&
      candidate.categories.some((category) => product.categories.includes(category)),
  )
}
