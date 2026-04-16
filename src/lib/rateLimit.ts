/**
 * Simple in-memory rate limiter for Next.js API routes.
 * Keyed by IP address. Resets after `windowMs` milliseconds.
 *
 * For production at scale, replace with Redis-backed rate limiting.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    store.forEach((entry, key) => {
      if (now > entry.resetAt) store.delete(key);
    });
  }, 60_000);
}

interface RateLimitOptions {
  windowMs?: number; // time window in ms (default: 15 minutes)
  max?: number;      // max requests per window (default: 10)
}

export function checkRateLimit(
  ip: string,
  options: RateLimitOptions = {}
): { allowed: boolean; remaining: number; resetIn: number } {
  const windowMs = options.windowMs ?? 15 * 60 * 1000; // 15 min
  const max = options.max ?? 10;
  const now = Date.now();

  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1, resetIn: windowMs };
  }

  entry.count += 1;
  const remaining = Math.max(0, max - entry.count);
  const resetIn = entry.resetAt - now;

  return { allowed: entry.count <= max, remaining, resetIn };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'unknown';
}
