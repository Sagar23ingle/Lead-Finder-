import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

interface RateLimitRecord {
  timestamps: number[];
}

// In-memory sliding window store (shared across requests in same serverless container)
const store = new Map<string, RateLimitRecord>();

// Clean up stale entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function purgeStaleRecords(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  const threshold = now - windowMs;
  for (const [key, record] of store.entries()) {
    const valid = record.timestamps.filter((ts) => ts > threshold);
    if (valid.length === 0) {
      store.delete(key);
    } else {
      record.timestamps = valid;
    }
  }
}

/**
 * Extracts client IP safely from request headers
 */
export function getClientIp(req: Request | NextRequest): string {
  const headers = req.headers;
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0].trim();
    if (firstIp) return firstIp;
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  const cfIp = headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();

  return '127.0.0.1';
}

export type RateLimitTier = 'search' | 'analyze' | 'enrich' | 'export';

/**
 * Checks if a request exceeds rate limits.
 * Default sliding window: 15 minutes (900,000 ms).
 */
export function checkRateLimit(
  req: Request | NextRequest,
  tier: RateLimitTier = 'search'
): {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
  errorResponse?: NextResponse;
} {
  const windowMs = 15 * 60 * 1000; // 15 minutes
  purgeStaleRecords(windowMs);

  let limit: number;
  switch (tier) {
    case 'search':
      limit = config.rateLimitSearch;
      break;
    case 'analyze':
      limit = config.rateLimitAnalyze;
      break;
    case 'enrich':
      limit = config.rateLimitEnrich;
      break;
    case 'export':
      limit = config.rateLimitExport;
      break;
    default:
      limit = 30;
  }

  const ip = getClientIp(req);
  const key = `${tier}:${ip}`;
  const now = Date.now();
  const threshold = now - windowMs;

  const record = store.get(key) || { timestamps: [] };
  const validTimestamps = record.timestamps.filter((ts) => ts > threshold);

  if (validTimestamps.length >= limit) {
    const oldestTimestamp = validTimestamps[0];
    const resetInSeconds = Math.max(1, Math.ceil((oldestTimestamp + windowMs - now) / 1000));

    const errorResponse = NextResponse.json(
      {
        error: 'Too Many Requests',
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Rate limit of ${limit} ${tier} requests per 15 minutes exceeded. Please wait ${resetInSeconds}s before retrying.`,
        retryAfter: resetInSeconds,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(resetInSeconds),
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.floor((now + resetInSeconds * 1000) / 1000)),
        },
      }
    );

    return {
      allowed: false,
      limit,
      remaining: 0,
      resetInSeconds,
      errorResponse,
    };
  }

  validTimestamps.push(now);
  store.set(key, { timestamps: validTimestamps });

  const remaining = Math.max(0, limit - validTimestamps.length);
  const oldestTimestamp = validTimestamps[0] || now;
  const resetInSeconds = Math.max(1, Math.ceil((oldestTimestamp + windowMs - now) / 1000));

  return {
    allowed: true,
    limit,
    remaining,
    resetInSeconds,
  };
}
