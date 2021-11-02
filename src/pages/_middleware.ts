import { NextRequest, NextResponse } from 'next/server'

// Nextのリクエスト前に動かすmiddleware
export function middleware(req: NextRequest) {
  const basicAuth = req.headers.get('authorization')

  if (basicAuth) {
    const auth = basicAuth.split(' ')[1]
    const [user, pwd] = Buffer.from(auth, 'base64').toString().split(':')

    if (user ===  process.env.NEXT_PUBLIC_USER && pwd === process.env.NEXT_PUBLIC_PASS) {
      return NextResponse.next()
    }
  }

  return new Response('Auth required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  })
}
