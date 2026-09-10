import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getSiteContent } from '@/lib/content'
import { getProduct, getProducts, getRelatedProducts } from '@/lib/get-products'
import { formatPrice, formatProductCategories } from '@/lib/products'
import { AddToCart } from '@/components/shop/add-to-cart'
import {
  CartDrawer,
  ProductGallery,
  ProductGalleryCarousel,
  RelatedProducts,
  SiteHeader,
} from '@/components/shop/shop-ui'
import { notFound } from 'next/navigation'

export function generateStaticParams() {
  return getProducts().map((product) => ({ slug: product.slug }))
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = getProduct(slug)
  const site = getSiteContent()

  if (!product) notFound()

  const galleryImages = product.galleryImages ?? []
  const relatedProducts = getRelatedProducts(product)

  return (
    <main>
      <SiteHeader />
      <div className="product-page">
        <Link href="/#shop" className="back-link">
          <ArrowLeft size={15} /> Back to shop
        </Link>
        <div className="product-detail">
          <ProductGallery product={product} productArt={site.productArt} />
          <div className="product-info">
            <p className="eyebrow">
              {formatProductCategories(product.categories)} / {site.productPage.brandName}
            </p>
            <h1>{product.name}</h1>
            <p className="product-description">{product.description}</p>
            <p className="detail-price">
              {formatPrice(product.price)} <span>{site.productPage.shippingLabel}</span>
            </p>
            <ul className="detail-list">
              {product.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
            <AddToCart product={product} />
          </div>
        </div>
        {galleryImages.length > 0 && (
          <ProductGalleryCarousel images={galleryImages} productName={product.name} />
        )}
      </div>
      <RelatedProducts products={relatedProducts} productArt={site.productArt} />
      <CartDrawer copy={site.cart} productArt={site.productArt} />
    </main>
  )
}
