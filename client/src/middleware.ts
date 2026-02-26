import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

async function verifySessionEdge(token: string, secret: string): Promise<boolean> {
  if (!token || !secret) return false;

  const dotIndex = token.indexOf('.');
  if (dotIndex === -1) return false;

  const id = token.slice(0, dotIndex);
  const sig = token.slice(dotIndex + 1);

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(id));
  const expectedSig = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return sig === expectedSig;
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Admin auth check
  if (pathname.startsWith('/admin') && pathname !== '/admin') {
    const session = request.cookies.get('admin_session');
    const secret = process.env.ADMIN_SESSION_SECRET ?? '';
    const valid = await verifySessionEdge(session?.value ?? '', secret);

    if (!valid) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // Skip intl for admin and api routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
};
