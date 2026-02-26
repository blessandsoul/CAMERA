import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, verifyPassword, generateSessionToken } from '@/lib/admin-auth';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? 'unknown';

  const { allowed, retryAfterMs } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { success: false, error: 'Too many attempts. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } },
    );
  }

  const body = await request.json() as { password?: string };
  if (!body.password) {
    return NextResponse.json({ success: false, error: 'Password required' }, { status: 400 });
  }

  const valid = await verifyPassword(body.password);
  if (!valid) {
    return NextResponse.json({ success: false, error: 'Wrong password' }, { status: 401 });
  }

  const token = generateSessionToken();
  const response = NextResponse.json({ success: true });
  const isSecure = request.headers.get('x-forwarded-proto') === 'https'
    || request.url.startsWith('https://');
  response.cookies.set('admin_session', token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
  return response;
}
