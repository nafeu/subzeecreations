'use client'

import { createContext, useContext, useMemo, useState } from 'react'
import type { Product } from '@/lib/products'

type CartItem = Product & { quantity: number; personalization: string }

type CartContextValue = {
  items: CartItem[]
  count: number
  subtotal: number
  addItem: (product: Product, quantity: number, personalization: string) => void
  removeItem: (slug: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const addItem = (product: Product, quantity: number, personalization: string) => {
    setItems((current) => {
      const existing = current.find((item) => item.slug === product.slug && item.personalization === personalization)
      if (existing) return current.map((item) => item === existing ? { ...item, quantity: item.quantity + quantity } : item)
      return [...current, { ...product, quantity, personalization }]
    })
  }
  const removeItem = (slug: string) => setItems((current) => current.filter((item) => item.slug !== slug))
  const clearCart = () => setItems([])
  const value = useMemo(() => ({ items, count: items.reduce((sum, item) => sum + item.quantity, 0), subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0), addItem, removeItem, clearCart }), [items])
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
