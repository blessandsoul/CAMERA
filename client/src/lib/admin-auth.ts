import { createHmac, randomUUID } from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// ── Rate Limiter (in-memory, per-IP) ────────────────────
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export function checkRateLimit(ip: string): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}

// Cleanup stale entries every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of loginAttempts) {
    if (now > entry.resetAt) loginAttempts.delete(ip);
  }
}, 30 * 60 * 1000).unref();

// ── Password Verification ───────────────────────────────
export async function verifyPassword(input: string): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  return input === password;
}

// ── HMAC-signed Session Tokens ──────────────────────────
function getSessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET ?? '';
}

export function generateSessionToken(): string {
  const id = randomUUID();
  const signature = createHmac('sha256', getSessionSecret())
    .update(id)
    .digest('hex');
  return `${id}.${signature}`;
}

export function verifySessionToken(token: string): boolean {
  const secret = getSessionSecret();
  if (!secret || !token) return false;

  const dotIndex = token.indexOf('.');
  if (dotIndex === -1) return false;

  const id = token.slice(0, dotIndex);
  const sig = token.slice(dotIndex + 1);

  const expectedSig = createHmac('sha256', secret)
    .update(id)
    .digest('hex');

  // Timing-safe comparison
  if (sig.length !== expectedSig.length) return false;
  let mismatch = 0;
  for (let i = 0; i < sig.length; i++) {
    mismatch |= sig.charCodeAt(i) ^ expectedSig.charCodeAt(i);
  }
  return mismatch === 0;
}

// ── Server Action Guard ─────────────────────────────────
export async function requireAdmin(): Promise<void> {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  if (!session?.value || !verifySessionToken(session.value)) {
    redirect('/admin');
  }
}
