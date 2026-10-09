import assert from 'node:assert';
import test from 'node:test';

// Import compiled or direct source logic using dynamic import or Node ESM
import {
  encodeCompactBusiness,
  decodeCompactBusiness,
  generateDemoSlug,
  buildDemoPath,
  buildDemoUrl,
  extractPlaceIdFromSlugOrId,
} from '../src/lib/utils/demoUrl.ts';

import { generateSmartDemo } from '../src/lib/services/smartDemoEngine.ts';

test('1. Compact Business Encoding & Decoding Parity', () => {
  const sampleBusiness = {
    id: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
    external_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
    placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
    name: 'Sharma Luxury Interiors & Decor — मुंबई',
    category: 'Interior Designer',
    address: '42 Marine Drive, Nariman Point',
    city: 'Mumbai',
    country: 'India',
    phone: '+91 98200 12345',
    website: 'https://sharmadesign.in',
    google_maps_url: 'https://maps.google.com/?cid=12345678',
    rating: 4.8,
    review_count: 87,
    opening_status: 'Open Now',
    source: 'google_places',
  };

  const encoded = encodeCompactBusiness(sampleBusiness);
  assert.ok(encoded, 'Encoded string should be non-empty');
  assert.ok(typeof encoded === 'string', 'Encoded string should be a string');
  assert.ok(!encoded.includes('+'), 'Base64url should not have +');
  assert.ok(!encoded.includes('/'), 'Base64url should not have /');
  assert.ok(!encoded.includes('='), 'Base64url should not have padding =');

  const decoded = decodeCompactBusiness(encoded);
  assert.ok(decoded, 'Decoded business should exist');
  assert.strictEqual(decoded.name, sampleBusiness.name, 'Business name must match including UTF-8');
  assert.strictEqual(decoded.city, sampleBusiness.city, 'City must match');
  assert.strictEqual(decoded.category, sampleBusiness.category, 'Category must match');
  assert.strictEqual(decoded.rating, sampleBusiness.rating, 'Rating must match');
  assert.strictEqual(decoded.phone, sampleBusiness.phone, 'Phone must match');
});

test('2. Graceful Handling of Missing / Partial Fields', () => {
  const minimalBusiness = {
    id: 'lead_17289901',
    name: 'Quick Fix Plumber',
  };

  const encoded = encodeCompactBusiness(minimalBusiness);
  assert.ok(encoded, 'Minimal business encodes successfully');

  const decoded = decodeCompactBusiness(encoded);
  assert.ok(decoded, 'Decoded minimal business should exist');
  assert.strictEqual(decoded.name, 'Quick Fix Plumber');
  assert.strictEqual(decoded.id, 'lead_17289901');
  assert.strictEqual(decoded.website, null);
  assert.strictEqual(decoded.phone, '');
});

test('3. Malformed and Corrupted Encoded Payloads', () => {
  assert.strictEqual(decodeCompactBusiness(''), null, 'Empty string returns null');
  assert.strictEqual(decodeCompactBusiness('not-a-valid-base64'), null, 'Invalid base64 returns null');
  assert.strictEqual(decodeCompactBusiness('eyJuYW1lIjoiIn0='), null, 'Empty name returns null');
});

test('4. SEO Slug Generation and Place ID Extraction', () => {
  const slug1 = generateDemoSlug('Apex Architects & Builders (India)', 'ChIJa0X_sample123');
  assert.ok(slug1.startsWith('apex-architects-builders-india--ChIJa0X_sample123'));

  const extracted1 = extractPlaceIdFromSlugOrId(slug1);
  assert.strictEqual(extracted1, 'ChIJa0X_sample123');

  const extracted2 = extractPlaceIdFromSlugOrId('ChIJAQAAwPPA1DsR');
  assert.strictEqual(extracted2, 'ChIJAQAAwPPA1DsR');

  const extractedNone = extractPlaceIdFromSlugOrId('lead_99212');
  assert.strictEqual(extractedNone, null);
});

test('5. Stateless Cold-Start Demo Lifecycle (Zero Database Requirement)', () => {
  const originalBusiness = {
    id: 'ChIJz_sample_dentist',
    external_id: 'ChIJz_sample_dentist',
    name: 'Elite Dental Clinic',
    category: 'Dentist',
    city: 'Nagpur',
    country: 'India',
    phone: '+91 712 2555555',
    rating: 4.9,
    review_count: 142,
    source: 'google_places',
  };

  // Step A: Client generates URL containing stateless payload
  const demoPath = buildDemoPath(originalBusiness, { templateId: 'modern-dark' });
  assert.ok(demoPath.startsWith('/demo/elite-dental-clinic--ChIJz_sample_dentist?d='));
  assert.ok(demoPath.includes('&t=modern-dark'));

  // Step B: Simulate Vercel Lambda Cold Start
  // URL is parsed by fresh serverless container with completely empty memory & disk
  const urlObj = new URL(`https://lead-finder-sagar.vercel.app${demoPath}`);
  const dParam = urlObj.searchParams.get('d');
  assert.ok(dParam, 'd parameter must be present');

  // Step C: Cold server decodes business without any database query
  const restoredBusiness = decodeCompactBusiness(dParam);
  assert.ok(restoredBusiness, 'Business restored successfully');

  // Step D: Cold server deterministically generates full interactive smart demo
  const smartDemo = generateSmartDemo(restoredBusiness);
  assert.ok(smartDemo, 'Smart demo generated');
  assert.ok(smartDemo.hero, 'Smart demo has hero');
  assert.ok(smartDemo.hero.headline.includes('Elite Dental Clinic') || smartDemo.hero.subheadline.includes('Nagpur'), 'Hero references business or location');
  assert.ok(smartDemo.theme, 'Theme is defined');
  assert.strictEqual(smartDemo.businessType, 'DENTIST', 'Smart demo detects correct business niche');
});

test('6. Absolute and Relative Demo URL Construction', () => {
  const biz = {
    id: 'demo_123',
    name: 'Coffee Haven',
  };

  const relativeUrl = buildDemoUrl(biz);
  assert.ok(relativeUrl.startsWith('/demo/coffee-haven--demo_123?d='));

  const absoluteUrl = buildDemoUrl(biz, { origin: 'https://outreachly.ai' });
  assert.ok(absoluteUrl.startsWith('https://outreachly.ai/demo/coffee-haven--demo_123?d='));
});

test('7. Demo Scrolling Architecture and Viewport Verification', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const cssPath = path.resolve('src/app/globals.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');

  // Verify that root html and body are NOT globally hard-locked to overflow: hidden
  assert.ok(
    !cssContent.includes('html, body {\n  height: 100%;\n  width: 100%;\n  margin: 0;\n  padding: 0;\n  overflow: hidden;'),
    'Global html, body must not be unconditionally hard-locked with overflow: hidden'
  );

  // Verify that smooth scrolling, scroll padding, and touch scrolling are configured on html
  assert.ok(cssContent.includes('overflow-y: auto;'), 'Root must allow overflow-y: auto');
  assert.ok(cssContent.includes('scroll-behavior: smooth;'), 'Root must have smooth scrolling');
  assert.ok(cssContent.includes('scroll-padding-top:'), 'Root must have scroll-padding-top for sticky nav');

  // Verify that dashboard container isolation is scoped via :has(.outreachly-app-root)
  assert.ok(
    cssContent.includes('html:has(.outreachly-app-root)') &&
    cssContent.includes('body:has(.outreachly-app-root)'),
    'Dashboard lock must be scoped to .outreachly-app-root'
  );

  // Verify that demo pages are unlocked via .outreachly-demo-page / .outreachly-demo-root
  assert.ok(
    cssContent.includes('.outreachly-demo-page') &&
    cssContent.includes('.outreachly-demo-root'),
    'Demo pages must define dedicated scroll containers'
  );
  assert.ok(
    cssContent.includes('height: auto !important;') &&
    cssContent.includes('overflow-y: auto !important;'),
    'Demo pages must explicitly override height and overflow-y'
  );
});
