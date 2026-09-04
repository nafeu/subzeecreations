'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowUpRight, Minus, Plus, ShoppingBag, X } from 'lucide-react'
import { formatPrice, products, type Product } from '@/lib/products'
import { useCart } from './cart-context'

export function ProductArtwork({ product, large = false }: { product: Product; large?: boolean }) {
  return <div className={`product-art product-art-${product.pattern} ${large ? 'product-art-large' : ''}`} style={{ backgroundColor: product.color }} aria-label={`${product.name} product illustration`} role="img"><div className="art-label">field<br />notes</div><span>{product.category}</span></div>
}

export function SiteHeader() {
  const { count } = useCart()
  return <header className="site-header"><Link href="/#top" className="brand">STUDIO <em>FIELD</em></Link><nav><Link href="/#shop">Shop</Link><Link href="/#about">About</Link><Link href="/#contact">Contact</Link></nav><Link href="/#cart" className="cart-link"><ShoppingBag size={16} strokeWidth={1.5} /> Cart <span>{count.toString().padStart(2, '0')}</span></Link></header>
}

export function ProductCard({ product }: { product: Product }) {
  return <Link href={`/products/${product.slug}`} className="product-card"><ProductArtwork product={product} /><div className="product-card-copy"><div><p className="eyebrow">{product.category}</p><h3>{product.name}</h3></div><div className="product-price"><span>{formatPrice(product.price)}</span><ArrowUpRight size={16} strokeWidth={1.5} /></div></div></Link>
}

export function CartDrawer() {
  const { items, count, subtotal, removeItem, clearCart } = useCart()
  const [open, setOpen] = useState(false)
  const [ordered, setOrdered] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' })
  const canOrder = Object.values(form).every(Boolean) && items.length > 0
  return <>
    <button className="cart-chip" onClick={() => setOpen(true)} aria-label="Open shopping cart"><ShoppingBag size={18} strokeWidth={1.5} /><span>{count} {count === 1 ? 'item' : 'items'}</span><strong>{formatPrice(subtotal)}</strong></button>
    {open && <div className="drawer-backdrop" onClick={() => setOpen(false)}><aside className="cart-drawer" onClick={(event) => event.stopPropagation()}><div className="drawer-head"><div><p className="eyebrow">Your selection</p><h2>Cart <span>({count})</span></h2></div><button className="icon-button" onClick={() => setOpen(false)} aria-label="Close cart"><X size={18} /></button></div>{ordered ? <div className="order-success"><div className="success-mark">✓</div><p className="eyebrow">Thank you, {form.name}</p><h2>Your order is noted.</h2><p>We&apos;ll be in touch shortly to confirm the details. Shipping is included in the price.</p><button className="button button-dark" onClick={() => { setOrdered(false); setOpen(false); clearCart() }}>Done</button></div> : <>{items.length === 0 ? <div className="empty-cart"><ShoppingBag size={28} strokeWidth={1} /><p>Your cart is waiting for something good.</p><Link href="/#shop" className="text-link" onClick={() => setOpen(false)}>Browse the shop <ArrowUpRight size={14} /></Link></div> : <><div className="cart-items">{items.map((item) => <div className="cart-item" key={`${item.slug}-${item.personalization}`}><ProductArtwork product={item} /><div><h3>{item.name}</h3>{item.personalization && <p className="item-note">For: {item.personalization}</p>}<p>{item.quantity} × {formatPrice(item.price)}</p><button className="remove-button" onClick={() => removeItem(item.slug)}>Remove</button></div></div>)}</div><div className="cart-total"><span>Subtotal <small>Shipping included</small></span><strong>{formatPrice(subtotal)}</strong></div><div className="checkout-form"><p className="eyebrow">Finish your order</p><div className="form-grid"><input placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /><input type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /><input type="tel" placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /><input placeholder="Shipping address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div><button className="button button-dark full-width" disabled={!canOrder} onClick={() => setOrdered(true)}>Place order <ArrowUpRight size={16} /></button><button className="clear-button" onClick={clearCart}>Clear cart</button></div></>}</>}</aside></div>}
  </>
}

export function AddToCart({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [name, setName] = useState('')
  const [added, setAdded] = useState(false)
  return <div className="add-panel"><label className="field-label" htmlFor="name">Personalise it for <span>optional</span></label><input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Add a name or leave blank" /><div className="add-row"><div className="quantity"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity"><Minus size={14} /></button><span>{quantity}</span><button onClick={() => setQuantity(Math.min(9, quantity + 1))} aria-label="Increase quantity"><Plus size={14} /></button></div><button className="button button-dark" onClick={() => { addItem(product, quantity, name); setAdded(true) }}>{added ? 'Added to cart' : 'Add to cart'} <ArrowUpRight size={16} /></button></div></div>
}
