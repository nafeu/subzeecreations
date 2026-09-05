import 'server-only'
import fs from 'fs'
import path from 'path'
import type { Product } from '@/lib/products'

const productsDir = path.join(process.cwd(), 'content/products')

function normalizeProduct(raw: Product & { details?: Array<string | { detail?: string }> }): Product {
  const details = (raw.details ?? [])
    .map((detail) => (typeof detail === 'string' ? detail : (detail.detail ?? '')))
    .filter(Boolean)

  return { ...raw, details }
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
