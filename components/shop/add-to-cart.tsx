'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { ArrowUpRight, Minus, Plus } from 'lucide-react'
import type { Product } from '@/lib/products'
import { useCart } from './cart-context'

function readPersonalization(input: HTMLInputElement | null) {
  return input?.value.trim() ?? ''
}

export function AddToCart({ product }: { product: Product }) {
  const { addItem } = useCart()
  const personalizationId = useId()
  const customRequestId = useId()
  const personalizationRef = useRef<HTMLInputElement>(null)

  const [quantity, setQuantity] = useState(1)
  const [personalization, setPersonalization] = useState('')
  const [customRequest, setCustomRequest] = useState('')
  const [added, setAdded] = useState(false)
  const [showValidation, setShowValidation] = useState(false)

  const syncPersonalization = useCallback(() => {
    const value = readPersonalization(personalizationRef.current)
    setPersonalization(value)
    return value
  }, [])

  useEffect(() => {
    const input = personalizationRef.current
    if (!input) return

    const sync = () => {
      syncPersonalization()
    }

    input.addEventListener('input', sync)
    input.addEventListener('change', sync)

    // Browser autofill often skips React's onChange — recheck shortly after mount/focus.
    const timers = [0, 100, 300, 600].map((delay) => window.setTimeout(sync, delay))

    return () => {
      input.removeEventListener('input', sync)
      input.removeEventListener('change', sync)
      timers.forEach(window.clearTimeout)
    }
  }, [syncPersonalization])

  const canAdd = personalization.length > 0

  return (
    <div className="add-panel">
      <div className="add-fields">
        <div>
          <label className="field-label" htmlFor={personalizationId}>
            Personalise it for <span>required</span>
          </label>
          <input
            ref={personalizationRef}
            id={personalizationId}
            name="personalization"
            autoComplete="off"
            required
            value={personalization}
            onInput={(event) => {
              setPersonalization(event.currentTarget.value)
              setShowValidation(false)
            }}
            onChange={(event) => {
              setPersonalization(event.target.value)
              setShowValidation(false)
            }}
            onBlur={syncPersonalization}
            onAnimationStart={(event) => {
              if (event.animationName === 'onAutoFillStart') {
                syncPersonalization()
              }
            }}
            placeholder="Name to personalise with"
          />
        </div>
        <div>
          <label className="field-label" htmlFor={customRequestId}>
            Custom request <span>optional</span>
          </label>
          <input
            id={customRequestId}
            name="custom-request"
            autoComplete="off"
            value={customRequest}
            onChange={(event) => setCustomRequest(event.target.value)}
            placeholder="Any special instructions or requests"
          />
        </div>
      </div>
      {showValidation && !canAdd && (
        <p className="form-error">Please enter a name to personalise before adding to cart.</p>
      )}
      <div className="add-row">
        <div className="quantity">
          <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity">
            <Minus size={14} />
          </button>
          <span>{quantity}</span>
          <button type="button" onClick={() => setQuantity(Math.min(9, quantity + 1))} aria-label="Increase quantity">
            <Plus size={14} />
          </button>
        </div>
        <button
          type="button"
          className="button button-dark"
          disabled={!canAdd}
          onClick={() => {
            const trimmedName = syncPersonalization()
            const trimmedRequest = customRequest.trim()

            if (!trimmedName) {
              setShowValidation(true)
              return
            }

            addItem(product, quantity, trimmedName, trimmedRequest)
            setAdded(true)
          }}
        >
          {added ? 'Added to cart' : 'Add to cart'} <ArrowUpRight size={16} />
        </button>
      </div>
    </div>
  )
}
