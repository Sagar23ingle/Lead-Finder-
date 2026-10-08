import { config } from '@/lib/config';
import { Business } from '@/types';

export interface PlaceSearchParams {
  country: string;
  city: string;
  niche: string;
  limit: number;
}

export interface GooglePlacesResult {
  businesses: Business[];
  totalFound: number;
}

/**
 * Normalizes category string from Google Places type identifiers
 */
function formatCategory(primaryTypeDisplayName?: { text: string }, primaryType?: string, types?: string[]): string {
  if (primaryTypeDisplayName?.text) {
    return primaryTypeDisplayName.text;
  }
  const rawType = primaryType || (types && types[0]) || '';
  if (!rawType) return 'Local Business';
  return rawType
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Service to discover authentic businesses using Google Places API.
 * NO MOCK DATA. NO FAKE LEADS.
 */
export class GooglePlacesService {
  private static readonly NEW_PLACES_URL = 'https://places.googleapis.com/v1/places:searchText';
  private static readonly LEGACY_TEXT_URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
  private static readonly LEGACY_DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json';

  /**
   * Search places matching the given query parameters
   */
  public static async search(params: PlaceSearchParams, sessionApiKey?: string): Promise<GooglePlacesResult> {
    const apiKey = (sessionApiKey || config.googleMapsApiKey || '').trim();
    if (!apiKey) {
      throw new Error(
        'PLACES_API_NOT_CONFIGURED: Google Places API is not configured on the server. Please set GOOGLE_MAPS_API_KEY in server environment.'
      );
    }

    const { country, city, niche, limit } = params;
    const query = `${niche} in ${city}, ${country}`.trim();

    try {
      // Primary discovery method: Google Places API (New)
      return await this.searchUsingNewPlacesApi(query, limit, apiKey, city, country, niche);
    } catch (newApiError: any) {
      // Check if error is due to Places API (New) not being enabled while legacy Places API is
      const errorMessage = newApiError?.message || '';
      if (
        errorMessage.includes('PLACES_API_NOT_ENABLED') ||
        errorMessage.includes('has not been used in project') ||
        errorMessage.includes('Places API (New) is not enabled')
      ) {
        console.warn('Places API (New) not enabled, attempting legacy Places API fallback...');
        return await this.searchUsingLegacyPlacesApi(query, limit, apiKey, city, country, niche);
      }
      throw newApiError;
    }
  }

  /**
   * Fetches authentic business details by Google Place ID
   * Essential for persistent, refresh-safe demo URLs on Vercel serverless.
   */
  public static async getPlaceById(placeId: string, sessionApiKey?: string): Promise<Business | null> {
    const apiKey = (sessionApiKey || config.googleMapsApiKey || '').trim();
    if (!apiKey || !placeId) return null;

    const cleanId = placeId.trim();

    try {
      // 1. Try Google Places API (New) v1/places/{placeId}
      const fieldMask = [
        'id',
        'displayName',
        'formattedAddress',
        'nationalPhoneNumber',
        'internationalPhoneNumber',
        'websiteUri',
        'googleMapsUri',
        'rating',
        'userRatingCount',
        'primaryType',
        'primaryTypeDisplayName',
        'types',
        'location',
        'currentOpeningHours',
      ].join(',');

      const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(cleanId)}`;
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': fieldMask,
        },
      });

      if (res.ok) {
        const place = await res.json();
        if (place && place.displayName?.text) {
          const category = formatCategory(place.primaryTypeDisplayName, place.primaryType, place.types);
          let openingStatus: string | undefined = undefined;
          if (place.currentOpeningHours?.openNow !== undefined) {
            openingStatus = place.currentOpeningHours.openNow ? 'Open Now' : 'Closed';
          }

          const cityMatch = place.formattedAddress?.split(',')?.slice(-3, -2)?.[0]?.trim() || '';

          return {
            id: place.id,
            external_id: place.id,
            name: place.displayName.text,
            category,
            address: place.formattedAddress || '',
            city: cityMatch,
            country: 'India',
            phone: place.internationalPhoneNumber || place.nationalPhoneNumber || '',
            website: place.websiteUri || '',
            google_maps_url: place.googleMapsUri || '',
            rating: place.rating || 0,
            review_count: place.userRatingCount || 0,
            latitude: place.location?.latitude || null,
            longitude: place.location?.longitude || null,
            opening_status: openingStatus,
            source: 'google_places',
            raw_data: place,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        }
      }

      // 2. Fallback to legacy place details API
      const legacyUrl = `${this.LEGACY_DETAILS_URL}?place_id=${encodeURIComponent(cleanId)}&fields=place_id,name,formatted_address,formatted_phone_number,international_phone_number,website,url,rating,user_ratings_total,types,geometry,opening_hours&key=${apiKey}`;
      const legacyRes = await fetch(legacyUrl);
      if (legacyRes.ok) {
        const data = await legacyRes.json();
        const p = data.result;
        if (p && p.name) {
          const category = p.types?.[0]
            ? p.types[0].replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
            : 'Local Business';

          return {
            id: p.place_id || cleanId,
            external_id: p.place_id || cleanId,
            name: p.name,
            category,
            address: p.formatted_address || '',
            city: '',
            country: '',
            phone: p.international_phone_number || p.formatted_phone_number || '',
            website: p.website || '',
            google_maps_url: p.url || '',
            rating: p.rating || 0,
            review_count: p.user_ratings_total || 0,
            latitude: p.geometry?.location?.lat || null,
            longitude: p.geometry?.location?.lng || null,
            opening_status: p.opening_hours?.open_now ? 'Open Now' : undefined,
            source: 'google_places',
            raw_data: p,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        }
      }
    } catch (err) {
      console.warn('GooglePlacesService.getPlaceById error:', err);
    }

    return null;
  }

  /**
   * Discovers places using the modern Google Places API (New) v1
   */
  private static async searchUsingNewPlacesApi(
    query: string,
    limit: number,
    apiKey: string,
    city: string,
    country: string,
    niche: string
  ): Promise<GooglePlacesResult> {
    const fieldMask = [
      'places.id',
      'places.displayName',
      'places.formattedAddress',
      'places.nationalPhoneNumber',
      'places.internationalPhoneNumber',
      'places.websiteUri',
      'places.googleMapsUri',
      'places.rating',
      'places.userRatingCount',
      'places.primaryType',
      'places.primaryTypeDisplayName',
      'places.types',
      'places.location',
      'places.currentOpeningHours',
      'places.regularOpeningHours',
      'nextPageToken',
    ].join(',');

    const collectedBusinesses: Business[] = [];
    const seenIds = new Set<string>();
    const seenNames = new Set<string>();
    const seenPhones = new Set<string>();
    const seenDomains = new Set<string>();
    let nextPageToken: string | undefined = undefined;
    let pageCount = 0;
    const maxPages = Math.ceil(limit / 20) + 2; // Controlled pagination limit

    while (collectedBusinesses.length < limit && pageCount < maxPages) {
      pageCount++;
      const remaining = limit - collectedBusinesses.length;
      const pageSize = Math.min(remaining, 20);

      const requestBody: Record<string, any> = {
        textQuery: query,
        pageSize: pageSize,
      };

      if (nextPageToken) {
        requestBody.pageToken = nextPageToken;
        // Small delay recommended between paginated Google requests
        await new Promise((resolve) => setTimeout(resolve, 350));
      }

      const response = await fetch(this.NEW_PLACES_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': fieldMask,
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(15000), // 15s timeout
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorStatus = errorData?.error?.status || response.statusText;
        const errorMsg = errorData?.error?.message || response.statusText;

        if (response.status === 400 || errorStatus === 'INVALID_ARGUMENT') {
          if (errorMsg.includes('API key') || errorMsg.includes('API_KEY_INVALID')) {
            throw new Error(`PLACES_API_AUTH_FAILED: Places API authentication failed. Verify your Google Places API key.`);
          }
        }
        if (response.status === 401 || response.status === 403) {
          if (
            errorMsg.includes('Places API (New) has not been used') ||
            errorMsg.includes('has not been used in project') ||
            errorMsg.includes('Places API (New) is not enabled')
          ) {
            throw new Error(`PLACES_API_NOT_ENABLED: Places API (New) is not enabled on this Google Cloud project.`);
          }
          if (
            errorStatus === 'PERMISSION_DENIED' ||
            errorMsg.includes('API key not valid') ||
            errorMsg.includes("Method doesn't allow unregistered callers")
          ) {
            throw new Error(`PLACES_API_AUTH_FAILED: Places API authentication failed. Verify your Google Places API key credentials.`);
          }
          throw new Error(`PLACES_API_AUTH_FAILED: Places API authorization failed (HTTP ${response.status}).`);
        }
        if (response.status === 429 || errorStatus === 'RESOURCE_EXHAUSTED') {
          throw new Error('PLACES_API_QUOTA_EXCEEDED: Places API quota/rate limit reached or billing is not enabled.');
        }

        throw new Error(`PLACES_API_REQUEST_FAILED: Places API request failed (HTTP ${response.status}): ${errorMsg}`);
      }

      const data = await response.json();
      const places: any[] = data.places || [];

      if (places.length === 0) {
        break;
      }

      for (const place of places) {
        if (!place.id || seenIds.has(place.id)) continue;

        const rawName = place.displayName?.text || 'Unnamed Business';
        const cleanNameKey = rawName.toLowerCase().replace(/[^a-z0-9]/g, '');

        // Deduplication by name if in same city
        if (cleanNameKey && cleanNameKey.length > 3 && seenNames.has(cleanNameKey)) {
          continue;
        }

        const rawPhone = place.internationalPhoneNumber || place.nationalPhoneNumber || null;
        const cleanPhoneKey = rawPhone ? rawPhone.replace(/\D/g, '') : null;
        if (cleanPhoneKey && cleanPhoneKey.length >= 8 && seenPhones.has(cleanPhoneKey)) {
          continue;
        }

        const rawWebsite = place.websiteUri || null;
        let domainKey: string | null = null;
        if (rawWebsite) {
          try {
            domainKey = new URL(rawWebsite.startsWith('http') ? rawWebsite : `https://${rawWebsite}`).hostname.replace(/^www\./, '').toLowerCase();
          } catch {
            // ignore
          }
        }
        if (domainKey && domainKey.length > 4 && seenDomains.has(domainKey)) {
          continue;
        }

        // Mark as seen
        seenIds.add(place.id);
        if (cleanNameKey) seenNames.add(cleanNameKey);
        if (cleanPhoneKey && cleanPhoneKey.length >= 8) seenPhones.add(cleanPhoneKey);
        if (domainKey) seenDomains.add(domainKey);

        const now = new Date().toISOString();
        const mapUrl = place.googleMapsUri || (place.id ? `https://www.google.com/maps/place/?q=place_id:${place.id}` : null);
        const ratingVal = typeof place.rating === 'number' ? place.rating : null;
        const reviewCountVal = typeof place.userRatingCount === 'number' ? place.userRatingCount : 0;

        const business: Business = {
          id: place.id,
          external_id: place.id,
          placeId: place.id,
          name: rawName,
          businessName: rawName,
          category: formatCategory(place.primaryTypeDisplayName, place.primaryType, place.types),
          address: place.formattedAddress || null,
          city: city,
          country: country,
          phone: rawPhone,
          website: rawWebsite,
          google_maps_url: mapUrl,
          googleMapsUrl: mapUrl,
          rating: ratingVal,
          review_count: reviewCountVal,
          reviewCount: reviewCountVal,
          latitude: place.location?.latitude ?? null,
          longitude: place.location?.longitude ?? null,
          opening_status: place.currentOpeningHours?.openNow ? 'Open Now' : (place.currentOpeningHours ? 'Closed' : null),
          source: 'google_places',
          raw_data: place,
          discoveredAt: now,
          created_at: now,
          updated_at: now,
        };

        collectedBusinesses.push(business);
        if (collectedBusinesses.length >= limit) break;
      }

      nextPageToken = data.nextPageToken;
      if (!nextPageToken) break;
    }

    return {
      businesses: collectedBusinesses,
      totalFound: collectedBusinesses.length,
    };
  }

  /**
   * Fallback for classic Google Places API Text Search if Places (New) is not enabled
   */
  private static async searchUsingLegacyPlacesApi(
    query: string,
    limit: number,
    apiKey: string,
    city: string,
    country: string,
    niche: string
  ): Promise<GooglePlacesResult> {
    const collectedBusinesses: Business[] = [];
    const seenIds = new Set<string>();
    let nextPageToken: string | undefined = undefined;

    while (collectedBusinesses.length < limit) {
      const url = new URL(this.LEGACY_TEXT_URL);
      url.searchParams.set('query', query);
      url.searchParams.set('key', apiKey);
      if (nextPageToken) {
        url.searchParams.set('pagetoken', nextPageToken);
        // Google requires ~2 seconds delay before pagetoken becomes active in legacy API
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      const response = await fetch(url.toString(), {
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        throw new Error(`Legacy Google Places API request failed with HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'REQUEST_DENIED') {
        throw new Error(`PLACES_API_AUTH_FAILED: Places API authentication failed: ${data.error_message || 'Check API key & permissions.'}`);
      }
      if (data.status === 'OVER_QUERY_LIMIT') {
        throw new Error('PLACES_API_QUOTA_EXCEEDED: Places API quota/rate limit reached or billing is not enabled.');
      }
      if (data.status === 'ZERO_RESULTS' || !data.results || data.results.length === 0) {
        break;
      }

      for (const place of data.results) {
        if (!place.place_id || seenIds.has(place.place_id)) continue;
        seenIds.add(place.place_id);

        // Fetch details for website, phone, and direct map url
        const details = await this.fetchLegacyPlaceDetails(place.place_id, apiKey).catch(() => null);

        const now = new Date().toISOString();
        const bName = details?.name || place.name || 'Unnamed Business';
        const mapUrl = details?.url || `https://www.google.com/maps/place/?q=place_id:${place.place_id}`;
        const ratingVal = typeof place.rating === 'number' ? place.rating : null;
        const reviewCountVal = typeof place.user_ratings_total === 'number' ? place.user_ratings_total : 0;

        const business: Business = {
          id: place.place_id,
          external_id: place.place_id,
          placeId: place.place_id,
          name: bName,
          businessName: bName,
          category: formatCategory(undefined, undefined, place.types),
          address: details?.formatted_address || place.formatted_address || null,
          city: city,
          country: country,
          phone: details?.formatted_phone_number || details?.international_phone_number || null,
          website: details?.website || null,
          google_maps_url: mapUrl,
          googleMapsUrl: mapUrl,
          rating: ratingVal,
          review_count: reviewCountVal,
          reviewCount: reviewCountVal,
          latitude: place.geometry?.location?.lat ?? null,
          longitude: place.geometry?.location?.lng ?? null,
          opening_status: place.opening_hours?.open_now ? 'Open Now' : null,
          source: 'google_places',
          raw_data: { search_result: place, details: details },
          discoveredAt: now,
          created_at: now,
          updated_at: now,
        };

        collectedBusinesses.push(business);
        if (collectedBusinesses.length >= limit) break;
      }

      nextPageToken = data.next_page_token;
      if (!nextPageToken) break;
    }

    return {
      businesses: collectedBusinesses,
      totalFound: collectedBusinesses.length,
    };
  }

  /**
   * Fetch details for a place in legacy API
   */
  private static async fetchLegacyPlaceDetails(placeId: string, apiKey: string): Promise<any> {
    const url = new URL(this.LEGACY_DETAILS_URL);
    url.searchParams.set('place_id', placeId);
    url.searchParams.set('fields', 'name,formatted_address,formatted_phone_number,international_phone_number,website,url,rating,user_ratings_total,types,opening_hours');
    url.searchParams.set('key', apiKey);

    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const json = await res.json();
    return json.result || null;
  }
}
