import Link from 'next/link'
import { ArrowDown, ArrowUpRight, Mail } from 'lucide-react'
import { getSiteContent } from '@/lib/content'
import { getProducts } from '@/lib/get-products'
import { CartDrawer, ProductCard, SiteHeader } from '@/components/shop/shop-ui'

export default function Home() {
  const site = getSiteContent()
  const products = getProducts()

  return (
    <main id="top">
      <SiteHeader />
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">{site.hero.eyebrow}</p>
          <h1>
            {site.hero.headlineBefore}
            <br />
            <em>{site.hero.headlineEmphasis}</em>
          </h1>
          <p className="hero-intro">{site.hero.intro}</p>
          <Link href="#shop" className="button button-dark">
            {site.hero.cta} <ArrowDown size={16} />
          </Link>
        </div>
      </section>
      <section id="shop" className="shop-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{site.shop.eyebrow}</p>
            <h2>
              {site.shop.headlineBefore}
              <br />
              <em>{site.shop.headlineEmphasis}</em>
            </h2>
          </div>
          <p className="section-note">{site.shop.note}</p>
        </div>
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} productArt={site.productArt} />
          ))}
        </div>
      </section>
      <section id="about" className="about-section">
        <div className="about-number">02</div>
        <div className="about-copy">
          <p className="eyebrow">{site.about.eyebrow}</p>
          <h2>
            {site.about.headlineBefore}
            <br />
            <em>{site.about.headlineEmphasis}</em>
          </h2>
          <p>{site.about.body}</p>
          <Link href="#contact" className="text-link">
            {site.about.cta} <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="about-note">
          {site.about.noteLine1}
          <br />
          {site.about.noteLine2}
          <br />
          <span>{site.about.noteLine3}</span>
        </div>
      </section>
      <section id="contact" className="contact-section">
        <div>
          <p className="eyebrow">{site.contact.eyebrow}</p>
          <h2>
            {site.contact.headlineBefore}
            <br />
            <em>{site.contact.headlineEmphasis}</em>
          </h2>
        </div>
        <div className="contact-details">
          <p>{site.contact.intro}</p>
          <a href={`mailto:${site.contact.email}`} className="contact-link">
            {site.contact.email} <Mail size={16} />
          </a>
          <div className="contact-footer">
            <span>{site.contact.copyright}</span>
            <a href="#top">
              {site.contact.footerLink} <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      </section>
      <CartDrawer copy={site.cart} productArt={site.productArt} />
    </main>
  )
}
