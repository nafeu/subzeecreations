import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getOrderEmailConfig } from '@/lib/order-email'
import { formatPrice } from '@/lib/products'
import { isValidEmail, isValidPhone } from '@/lib/validation'

type OrderItem = {
  name: string
  slug: string
  quantity: number
  price: number
  personalization: string
  customRequest?: string
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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
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
  if (!isValidEmail(customer.email)) return false
  if (!isValidPhone(customer.phone)) return false

  return items.every(
    (item) =>
      typeof item.name === 'string' &&
      typeof item.slug === 'string' &&
      typeof item.quantity === 'number' &&
      item.quantity > 0 &&
      typeof item.price === 'number' &&
      item.price >= 0 &&
      typeof item.personalization === 'string' &&
      item.personalization.trim().length > 0 &&
      (item.customRequest === undefined || typeof item.customRequest === 'string'),
  )
}

function buildItemSummary(items: OrderItem[]) {
  return items.map((item) => {
    const lineTotal = item.quantity * item.price
    return {
      ...item,
      lineTotal,
      textBlock: [
        `${item.name}`,
        `  Quantity: ${item.quantity} × ${formatPrice(item.price)} = ${formatPrice(lineTotal)}`,
        `  Personalization: ${item.personalization}`,
        ...(item.customRequest?.trim()
          ? [`  Custom request: ${item.customRequest.trim()}`]
          : []),
      ].join('\n'),
    }
  })
}

function buildShopOrderEmail(payload: OrderPayload) {
  const { customer, items, subtotal } = payload
  const itemSummaries = buildItemSummary(items)

  const text = [
    'NEW ORDER — subzeecreations.com',
    '═'.repeat(40),
    '',
    'CUSTOMER DETAILS',
    '─'.repeat(40),
    `Name:             ${customer.name}`,
    `Email:            ${customer.email}`,
    `Phone:            ${customer.phone}`,
    `Shipping address: ${customer.address}`,
    '',
    'ORDER SUMMARY',
    '─'.repeat(40),
    ...itemSummaries.map((item, index) => [`${index + 1}. ${item.textBlock}`, ''].join('\n')),
    '─'.repeat(40),
    `Subtotal: ${formatPrice(subtotal)} (free untracked shipping included)`,
    '',
    'Payment and fulfillment to be handled manually.',
  ].join('\n')

  const html = `
    <div style="font-family: Georgia, 'Times New Roman', serif; color: #20221d; max-width: 560px; line-height: 1.6;">
      <h2 style="font-weight: 400; margin: 0 0 8px;">New order received</h2>
      <p style="color: #777970; margin: 0 0 28px; font-size: 14px;">subzeecreations.com</p>

      <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.12em; color: #777970; font-weight: 400; margin: 0 0 12px;">Customer details</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px; font-size: 14px;">
        <tr><td style="padding: 4px 0; color: #777970; width: 130px;">Name</td><td>${escapeHtml(customer.name)}</td></tr>
        <tr><td style="padding: 4px 0; color: #777970;">Email</td><td>${escapeHtml(customer.email)}</td></tr>
        <tr><td style="padding: 4px 0; color: #777970;">Phone</td><td>${escapeHtml(customer.phone)}</td></tr>
        <tr><td style="padding: 4px 0; color: #777970; vertical-align: top;">Address</td><td>${escapeHtml(customer.address).replace(/\n/g, '<br />')}</td></tr>
      </table>

      <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.12em; color: #777970; font-weight: 400; margin: 0 0 12px;">Order summary</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
        <thead>
          <tr style="border-bottom: 1px solid #d9d7ce;">
            <th style="text-align: left; padding: 8px 0; font-weight: 400; color: #777970;">Item</th>
            <th style="text-align: right; padding: 8px 0; font-weight: 400; color: #777970;">Qty</th>
            <th style="text-align: right; padding: 8px 0; font-weight: 400; color: #777970;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemSummaries
            .map(
              (item) => `
            <tr style="border-bottom: 1px solid #eeece6;">
              <td style="padding: 14px 12px 14px 0; vertical-align: top;">
                <strong>${escapeHtml(item.name)}</strong><br />
                <span style="color: #777970; font-size: 12px;">Personalization: ${escapeHtml(item.personalization)}</span>
                ${item.customRequest?.trim() ? `<br /><span style="color: #777970; font-size: 12px;">Custom request: ${escapeHtml(item.customRequest.trim())}</span>` : ''}
              </td>
              <td style="padding: 14px 0; text-align: right; vertical-align: top;">${item.quantity}</td>
              <td style="padding: 14px 0; text-align: right; vertical-align: top;">${formatPrice(item.lineTotal)}</td>
            </tr>`,
            )
            .join('')}
        </tbody>
      </table>

      <p style="font-size: 16px; margin: 0 0 8px;"><strong>Subtotal:</strong> ${formatPrice(subtotal)}</p>
      <p style="color: #777970; font-size: 13px; margin: 0;">Free untracked shipping included.</p>
      <p style="color: #777970; font-size: 12px; margin-top: 24px;"><em>Payment and fulfillment to be handled manually.</em></p>
    </div>
  `

  return { text, html }
}

function buildCustomerConfirmationEmail(payload: OrderPayload) {
  const { customer, items, subtotal } = payload
  const itemSummaries = buildItemSummary(items)

  const text = [
    `Hi ${customer.name},`,
    '',
    'Your order has been received!',
    '',
    'Thank you for ordering from subzeecreations. Here is a summary of what you ordered:',
    '',
    'ORDER SUMMARY',
    '─'.repeat(40),
    ...itemSummaries.map((item, index) => [`${index + 1}. ${item.textBlock}`, ''].join('\n')),
    '─'.repeat(40),
    `Subtotal: ${formatPrice(subtotal)} (free untracked shipping included)`,
    '',
    'SHIPPING TO',
    customer.address,
    '',
    "I'll be in touch shortly to confirm the details. If you have any questions, just reply to this email.",
    '',
    '— subzeecreations',
  ].join('\n')

  const html = `
    <div style="font-family: Georgia, 'Times New Roman', serif; color: #20221d; max-width: 560px; line-height: 1.6;">
      <h2 style="font-weight: 400; margin: 0 0 8px;">Your order has been received!</h2>
      <p style="margin: 0 0 24px;">Hi ${escapeHtml(customer.name)}, thank you for ordering from subzeecreations.</p>

      <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.12em; color: #777970; font-weight: 400; margin: 0 0 12px;">Order summary</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
        <thead>
          <tr style="border-bottom: 1px solid #d9d7ce;">
            <th style="text-align: left; padding: 8px 0; font-weight: 400; color: #777970;">Item</th>
            <th style="text-align: right; padding: 8px 0; font-weight: 400; color: #777970;">Qty</th>
            <th style="text-align: right; padding: 8px 0; font-weight: 400; color: #777970;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemSummaries
            .map(
              (item) => `
            <tr style="border-bottom: 1px solid #eeece6;">
              <td style="padding: 14px 12px 14px 0; vertical-align: top;">
                <strong>${escapeHtml(item.name)}</strong><br />
                <span style="color: #777970; font-size: 12px;">Personalization: ${escapeHtml(item.personalization)}</span>
                ${item.customRequest?.trim() ? `<br /><span style="color: #777970; font-size: 12px;">Custom request: ${escapeHtml(item.customRequest.trim())}</span>` : ''}
              </td>
              <td style="padding: 14px 0; text-align: right; vertical-align: top;">${item.quantity}</td>
              <td style="padding: 14px 0; text-align: right; vertical-align: top;">${formatPrice(item.lineTotal)}</td>
            </tr>`,
            )
            .join('')}
        </tbody>
      </table>

      <p style="font-size: 16px; margin: 0 0 8px;"><strong>Subtotal:</strong> ${formatPrice(subtotal)}</p>
      <p style="color: #777970; font-size: 13px; margin: 0 0 24px;">Free untracked shipping included.</p>

      <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.12em; color: #777970; font-weight: 400; margin: 0 0 12px;">Shipping to</h3>
      <p style="margin: 0 0 24px; font-size: 14px;">${escapeHtml(customer.address).replace(/\n/g, '<br />')}</p>

      <p style="font-size: 14px; margin: 0;">I'll be in touch shortly to confirm the details. If you have any questions, just reply to this email.</p>
      <p style="color: #777970; font-size: 13px; margin-top: 28px;">— subzeecreations</p>
    </div>
  `

  return { text, html }
}

export async function POST(request: NextRequest) {
  const { apiKey, from: fromEmail, toEmail } = getOrderEmailConfig()

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
  const shopEmail = buildShopOrderEmail(payload)
  const customerEmail = buildCustomerConfirmationEmail(payload)

  const shopResult = await resend.emails.send({
    from: fromEmail,
    to: [toEmail],
    replyTo: payload.customer.email,
    subject: `New order from ${payload.customer.name}`,
    text: shopEmail.text,
    html: shopEmail.html,
  })

  if (shopResult.error) {
    console.error('Shop order email failed:', shopResult.error)
    return NextResponse.json({ error: 'Failed to send order email.' }, { status: 502 })
  }

  const customerResult = await resend.emails.send({
    from: fromEmail,
    to: [payload.customer.email],
    replyTo: toEmail,
    subject: 'Your order has been received!',
    text: customerEmail.text,
    html: customerEmail.html,
  })

  if (customerResult.error) {
    console.error('Customer confirmation email failed:', customerResult.error)
  }

  return NextResponse.json({ ok: true })
}
