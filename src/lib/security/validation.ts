import { NextResponse } from 'next/server';

/**
 * Strips dangerous HTML tags and script elements
 */
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '')
    .trim();
}

/**
 * Validates and sanitizes lead search input parameters
 */
export function validateSearchInput(body: any): {
  valid: boolean;
  data?: {
    country: string;
    city: string;
    niche: string;
    limit: number;
  };
  errorResponse?: NextResponse;
} {
  if (!body || typeof body !== 'object') {
    return {
      valid: false,
      errorResponse: NextResponse.json(
        { error: 'Invalid request body. JSON object expected.', code: 'INVALID_REQUEST' },
        { status: 400 }
      ),
    };
  }

  const country = sanitizeString(body.country || 'India');
  const city = sanitizeString(body.city);
  const niche = sanitizeString(body.niche);

  if (!city || city.length < 2) {
    return {
      valid: false,
      errorResponse: NextResponse.json(
        { error: 'City / location is required (minimum 2 characters).', code: 'VALIDATION_ERROR' },
        { status: 400 }
      ),
    };
  }

  if (city.length > 100) {
    return {
      valid: false,
      errorResponse: NextResponse.json(
        { error: 'City length cannot exceed 100 characters.', code: 'VALIDATION_ERROR' },
        { status: 400 }
      ),
    };
  }

  if (!niche || niche.length < 2) {
    return {
      valid: false,
      errorResponse: NextResponse.json(
        { error: 'Business niche is required (minimum 2 characters).', code: 'VALIDATION_ERROR' },
        { status: 400 }
      ),
    };
  }

  if (niche.length > 100) {
    return {
      valid: false,
      errorResponse: NextResponse.json(
        { error: 'Business niche length cannot exceed 100 characters.', code: 'VALIDATION_ERROR' },
        { status: 400 }
      ),
    };
  }

  let limit = Number(body.limit) || 10;
  if (isNaN(limit) || limit < 1) limit = 10;
  if (limit > 100) limit = 100; // Hard max to prevent quota depletion

  return {
    valid: true,
    data: {
      country: country || 'India',
      city,
      niche,
      limit,
    },
  };
}

/**
 * Validates external URL for safety and SSRF protection
 */
export function isSafeExternalUrl(urlStr: string): boolean {
  if (!urlStr || typeof urlStr !== 'string') return false;

  try {
    let normalized = urlStr.trim();
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = `https://${normalized}`;
    }

    const parsed = new URL(normalized);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;

    const hostname = parsed.hostname.toLowerCase();

    // Check for SSRF / local / internal targets
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '::1' ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal')
    ) {
      return false;
    }

    // Check for private IPv4 ranges (10.x, 172.16-31.x, 192.168.x, 169.254.x AWS metadata)
    const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipv4Match) {
      const p1 = parseInt(ipv4Match[1], 10);
      const p2 = parseInt(ipv4Match[2], 10);

      if (p1 === 10) return false;
      if (p1 === 127) return false;
      if (p1 === 169 && p2 === 254) return false; // AWS metadata IP
      if (p1 === 192 && p2 === 168) return false;
      if (p1 === 172 && p2 >= 16 && p2 <= 31) return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Safe error response that never leaks internal stack traces or connection strings
 */
export function createSafeErrorResponse(
  error: any,
  defaultMessage = 'An unexpected server error occurred.',
  statusCode = 500
): NextResponse {
  const rawMsg = error?.message || '';

  // Clean friendly user messages for known external API errors
  let friendlyMsg = defaultMessage;
  let code = 'INTERNAL_ERROR';

  if (rawMsg.includes('PLACES_API_NOT_CONFIGURED') || rawMsg.includes('Google Places API is not configured')) {
    friendlyMsg = 'Places API is not configured on the server.';
    code = 'PLACES_API_NOT_CONFIGURED';
    statusCode = 503;
  } else if (rawMsg.includes('PLACES_API_AUTH_FAILED') || rawMsg.includes('Invalid Google Maps API key') || rawMsg.includes('authentication failed')) {
    friendlyMsg = 'Places API authentication failed.';
    code = 'PLACES_API_AUTH_FAILED';
    statusCode = 401;
  } else if (rawMsg.includes('PLACES_API_QUOTA_EXCEEDED') || rawMsg.includes('quota') || rawMsg.includes('OVER_QUERY_LIMIT') || rawMsg.includes('RESOURCE_EXHAUSTED')) {
    friendlyMsg = 'Places API quota/rate limit reached.';
    code = 'PLACES_API_QUOTA_EXCEEDED';
    statusCode = 429;
  } else if (rawMsg.includes('PLACES_API_NOT_ENABLED')) {
    friendlyMsg = 'Places API (New) is not enabled on your Google Cloud project.';
    code = 'PLACES_API_NOT_ENABLED';
    statusCode = 503;
  } else if (rawMsg.includes('PLACES_API_REQUEST_FAILED')) {
    friendlyMsg = 'Places API request failed.';
    code = 'PLACES_API_REQUEST_FAILED';
    statusCode = 502;
  } else if (rawMsg.includes('rate limit')) {
    friendlyMsg = 'Request rate limit exceeded. Please wait a moment before trying again.';
    code = 'RATE_LIMIT_EXCEEDED';
    statusCode = 429;
  } else if (statusCode === 400) {
    friendlyMsg = rawMsg || 'Invalid request parameters.';
    code = 'BAD_REQUEST';
  } else if (statusCode === 404) {
    friendlyMsg = rawMsg || 'Resource not found.';
    code = 'NOT_FOUND';
  }

  // Security guarantee: Strictly redact any accidental Google API keys or credentials
  friendlyMsg = friendlyMsg.replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_KEY]');

  return NextResponse.json(
    {
      error: friendlyMsg,
      code,
      message: friendlyMsg,
    },
    { status: statusCode }
  );
}
