import type { Business } from '@/types';

/**
 * Universal (Browser + Node.js) Base64URL encoder supporting full UTF-8
 */
export function base64UrlEncode(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf8').toString('base64url');
  }
  // Universal browser UTF-8 to base64url:
  try {
    const encoded = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    });
    return btoa(encoded)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch {
    return '';
  }
}

/**
 * Universal (Browser + Node.js) Base64URL decoder supporting full UTF-8
 */
export function base64UrlDecode(str: string): string {
  if (!str) return '';
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'base64url').toString('utf8');
  }
  try {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const decoded = atob(base64);
    return decodeURIComponent(
      Array.prototype.map
        .call(decoded, (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch {
    return '';
  }
}

/**
 * Generates an SEO & human-friendly slug incorporating business name and ID
 */
export function generateDemoSlug(businessName: string, id: string): string {
  const cleanName = (businessName || 'business')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

  const cleanId = (id || 'demo').replace(/[^a-zA-Z0-9_-]/g, '');
  return `${cleanName}--${cleanId}`;
}

/**
 * Encodes a Business object into a compact base64url payload.
 * When attached to URLs as ?d=..., the demo can be rendered 100% deterministically
 * across any serverless container, cold start, or new browser session without DB dependency.
 */
export function encodeCompactBusiness(b: Business): string {
  if (!b) return '';
  try {
    const compact = {
      id: b.id || b.external_id || 'demo',
      name: b.name || (b as any).businessName || 'Local Business',
      category: b.category || 'Local Business',
      address: b.address || '',
      city: b.city || '',
      country: b.country || '',
      phone: b.phone || '',
      website: b.website || null,
      rating: typeof b.rating === 'number' ? b.rating : 4.5,
      reviewCount: b.review_count || (b as any).reviewCount || 10,
      googleMapsUrl: b.google_maps_url || (b as any).googleMapsUrl || null,
      openingStatus: b.opening_status || (b as any).openingStatus || 'Open Now',
    };
    return base64UrlEncode(JSON.stringify(compact));
  } catch {
    return '';
  }
}

/**
 * Decodes a compact base64url payload into a reconstructed Business object
 */
export function decodeCompactBusiness(encoded: string): Business | null {
  if (!encoded) return null;
  try {
    const json = base64UrlDecode(encoded);
    if (!json) return null;
    const b = JSON.parse(json);
    if (!b || !b.name) return null;

    const id = b.id || 'demo';
    return {
      id,
      external_id: id,
      placeId: id,
      name: b.name,
      businessName: b.name,
      category: b.category || 'Local Business',
      address: b.address || '',
      city: b.city || '',
      country: b.country || '',
      phone: b.phone || '',
      website: b.website || null,
      google_maps_url: b.googleMapsUrl || null,
      googleMapsUrl: b.googleMapsUrl || null,
      rating: typeof b.rating === 'number' ? b.rating : 4.5,
      review_count: b.reviewCount || 10,
      reviewCount: b.reviewCount || 10,
      opening_status: b.openingStatus || 'Open Now',
      source: 'google_places',
    } as Business;
  } catch {
    return null;
  }
}

/**
 * Builds the relative path for a demo, including slug, compact business payload,
 * and optional template identifier.
 */
export function buildDemoPath(
  business: Business,
  options?: { templateId?: string }
): string {
  if (!business) return '/demo/preview';
  const id = business.id || business.external_id || 'demo';
  const slug = generateDemoSlug(business.name, id);
  const encoded = encodeCompactBusiness(business);

  const queryParams: string[] = [];
  if (encoded) {
    queryParams.push(`d=${encoded}`);
  }
  if (options?.templateId) {
    queryParams.push(`t=${encodeURIComponent(options.templateId)}`);
  }

  const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
  return `/demo/${slug}${queryString}`;
}

/**
 * Builds the full absolute or relative URL for a demo.
 * Uses window.location.origin if available in the browser and origin is not specified.
 */
export function buildDemoUrl(
  business: Business,
  options?: { origin?: string; templateId?: string }
): string {
  const path = buildDemoPath(business, { templateId: options?.templateId });
  const origin =
    options?.origin ||
    (typeof window !== 'undefined' ? window.location.origin : '');

  return origin ? `${origin.replace(/\/+$/, '')}${path}` : path;
}

/**
 * Extracts a Google Place ID (ChIJ...) from a slug or ID string if present
 */
export function extractPlaceIdFromSlugOrId(idOrSlug: string): string | null {
  if (!idOrSlug) return null;
  const match = idOrSlug.match(/(ChIJ[a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}
