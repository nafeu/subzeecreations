import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { formatPrice } from '@/lib/products'

type OrderItem = {
  name: string
  slug: string
  quantity: number
  price: number
  personalization?: string
}

type OrderPayload = {
  customer: {
    name: string
    email: string
    phone: string
    address: string
  }
  items: OrderItem[]
  subtotal: number
}

function isValidPayload(payload: unknown): payload is OrderPayload {
  if (!payload || typeof payload !== 'object') return false
  const data = payload as OrderPayload
  const customer = data.customer
  const items = data.items

  if (!customer || typeof customer !== 'object') return false
  if (!items || !Array.isArray(items) || items.length === 0) return false
  if (typeof data.subtotal !== 'number') return false

  const fields = [customer.name, customer.email, customer.phone, customer.address]
  if (!fields.every((field) => typeof field === 'string' && field.trim().length > 0)) return false

  return items.every(
    (item) =>
      typeof item.name === 'string' &&
      typeof item.slug === 'string' &&
      typeof item.quantity === 'number' &&
      item.quantity > 0 &&
      typeof item.price === 'number' &&
      item.price >= 0,
  )
}

function buildOrderEmail(payload: OrderPayload) {
  const { customer, items, subtotal } = payload
  const itemLines = items
    .map((item) => {
      const personalization = item.personalization ? `\n  Personalization: ${item.personalization}` : ''
      return `- ${item.name} (${item.slug})\n  Qty: ${item.quantity} × ${formatPrice(item.price)}${personalization}`
    })
    .join('\n\n')

  const text = [
    'New order from subzeecreations.com',
    '',
    'Customer',
    `Name: ${customer.name}`,
    `Email: ${customer.email}`,
    `Phone: ${customer.phone}`,
    `Shipping address: ${customer.address}`,
    '',
    'Items',
    itemLines,
    '',
    `Subtotal: ${formatPrice(subtotal)} (shipping included)`,
    '',
    'Payment and fulfillment to be handled manually.',
  ].join('\n')

  const html = `
    <h2>New order from subzeecreations.com</h2>
    <h3>Customer</h3>
    <ul>
      <li><strong>Name:</strong> ${customer.name}</li>
      <li><strong>Email:</strong> ${customer.email}</li>
      <li><strong>Phone:</strong> ${customer.phone}</li>
      <li><strong>Shipping address:</strong> ${customer.address.replace(/\n/g, '<br />')}</li>
    </ul>
    <h3>Items</h3>
    <ul>
      ${items
        .map(
          (item) => `
        <li>
          <strong>${item.name}</strong> (${item.slug})<br />
          Qty: ${item.quantity} × ${formatPrice(item.price)}
          ${item.personalization ? `<br />Personalization: ${item.personalization}` : ''}
        </li>`,
        )
        .join('')}
    </ul>
    <p><strong>Subtotal:</strong> ${formatPrice(subtotal)} (shipping included)</p>
    <p><em>Payment and fulfillment to be handled manually.</em></p>
  `

  return { text, html }
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY
  const toEmail = process.env.ORDER_TO_EMAIL ?? 'subzeecreations@proton.me'
  const fromEmail = process.env.ORDER_FROM_EMAIL ?? 'onboarding@resend.dev'

  if (!apiKey) {
    return NextResponse.json({ error: 'Email service is not configured.' }, { status: 503 })
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  if (!isValidPayload(payload)) {
    return NextResponse.json({ error: 'Invalid order payload.' }, { status: 400 })
  }

  const resend = new Resend(apiKey)
  const { text, html } = buildOrderEmail(payload)

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: toEmail,
    replyTo: payload.customer.email,
    subject: `New order from ${payload.customer.name}`,
    text,
    html,
  })

  if (error) {
    console.error('Order email failed:', error)
    return NextResponse.json({ error: 'Failed to send order email.' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
