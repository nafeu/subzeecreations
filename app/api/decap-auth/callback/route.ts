import { NextRequest, NextResponse } from 'next/server'
import { getSiteUrl } from '@/lib/content'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const clientId = process.env.GITHUB_CLIENT_ID
  const clientSecret = process.env.GITHUB_CLIENT_SECRET

  if (!code || !clientId || !clientSecret) {
    return NextResponse.json({ error: 'GitHub OAuth is not configured.' }, { status: 503 })
  }

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: `${getSiteUrl()}/api/decap-auth/callback`,
    }),
  })

  const tokenData = (await tokenResponse.json()) as { access_token?: string; error?: string }
  if (!tokenResponse.ok || !tokenData.access_token) {
    return NextResponse.json({ error: tokenData.error ?? 'Failed to authorize with GitHub.' }, { status: 502 })
  }

  const content = `<!DOCTYPE html><html><body><script>
    (function() {
      function receiveMessage(event) {
        window.opener.postMessage(
          'authorization:github:success:' + JSON.stringify({ token: ${JSON.stringify(tokenData.access_token)}, provider: 'github' }),
          event.origin
        );
        window.removeEventListener('message', receiveMessage, false);
      }
      window.addEventListener('message', receiveMessage, false);
      window.opener.postMessage('authorizing:github', '*');
    })();
  </script></body></html>`

  return new NextResponse(content, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
