import { NextRequest, NextResponse } from 'next/server'
import { getSiteUrl } from '@/lib/content'

export async function GET(request: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID
  if (!clientId) {
    return NextResponse.json({ error: 'GitHub OAuth is not configured.' }, { status: 503 })
  }

  const redirectUri = `${getSiteUrl()}/api/decap-auth/callback`
  const url = new URL('https://github.com/login/oauth/authorize')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('scope', 'repo')

  return NextResponse.redirect(url)
}
