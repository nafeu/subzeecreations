function readResendApiKey() {
  for (const key of [process.env.RESEND_API_KEY, process.env.MESSAGING_RESEND_API_KEY]) {
    if (key?.startsWith('re_')) return key
  }

  return undefined
}

function readEnvValue(value: string | undefined) {
  if (value && !value.includes('[')) return value
  return undefined
}

function readEmailAddress(value: string | undefined, fallback: string) {
  const cleaned = readEnvValue(value)
  if (cleaned?.includes('@')) return cleaned
  return fallback
}

export function getOrderEmailConfig() {
  const apiKey = readResendApiKey()
  const domain = readEnvValue(process.env.MESSAGING_RESEND_EMAIL_DOMAIN)
  const toEmail = readEmailAddress(process.env.ORDER_TO_EMAIL, 'subzeecreations@proton.me')

  let fromEmail = readEmailAddress(process.env.ORDER_FROM_EMAIL, '')
  if (!fromEmail && domain) {
    fromEmail = `orders@${domain}`
  }
  if (!fromEmail) {
    fromEmail = 'onboarding@resend.dev'
  }

  const from = fromEmail.includes('<') ? fromEmail : `subzeecreations <${fromEmail}>`

  return { apiKey, from, toEmail }
}
