import siteContent from '@/content/site.json'

export type SiteContent = typeof siteContent

export function getSiteContent(): SiteContent {
  return siteContent
}

export function getSiteUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    (process.env.VERCEL_ENV === 'production' ? 'https://www.subzeecreations.com' : undefined)

  if (configured) return configured.replace(/\/$/, '')
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}
