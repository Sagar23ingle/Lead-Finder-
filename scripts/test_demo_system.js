const http = require('http');

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', (err) => reject(err));

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING DEMO & VERCEL ROUTING TESTS ---');

  // Test 1: Non-existent demo MUST return 404
  console.log('\n[Test 1] Testing non-existent demo URL: /demo/does-not-exist');
  const notFoundRes = await request('http://localhost:3000/demo/does-not-exist');
  console.log(`HTTP Status: ${notFoundRes.statusCode}`);
  if (notFoundRes.statusCode === 404) {
    console.log('✅ PASS: Invalid demo URL properly returns HTTP 404 Not Found.');
  } else {
    console.error(`❌ FAIL: Expected 404, got ${notFoundRes.statusCode}`);
  }

  // Test businesses across required industries
  const testCases = [
    {
      niche: 'DENTIST',
      business: {
        id: 'test_dentist_001',
        external_id: 'test_dentist_001',
        name: 'SmileCare Dental Clinic',
        category: 'Dentist',
        city: 'Nagpur',
        country: 'India',
        address: '12 Medical Square, Nagpur',
        phone: '+919876543210',
        rating: 4.9,
        review_count: 82,
        website: null,
      },
      expectedCta: 'Book an Appointment',
      expectedSection: 'Comprehensive Dental Treatments',
    },
    {
      niche: 'CAFE',
      business: {
        id: 'test_cafe_002',
        external_id: 'test_cafe_002',
        name: 'The Roasted Bean Cafe',
        category: 'Coffee Shop & Cafe',
        city: 'Pune',
        country: 'India',
        address: '45 FC Road, Pune',
        phone: '+919811122233',
        rating: 4.7,
        review_count: 140,
        website: null,
      },
      expectedCta: 'Explore Specialties',
      expectedSection: 'Crafted Specialties & Signature Brews',
    },
    {
      niche: 'INTERIOR_DESIGNER',
      business: {
        id: 'test_interior_003',
        external_id: 'test_interior_003',
        name: 'Aura Spatial Interior Studio',
        category: 'Interior Designer & Architecture',
        city: 'Mumbai',
        country: 'India',
        address: 'Studio 4, Bandra West, Mumbai',
        phone: '+919822233344',
        rating: 4.8,
        review_count: 36,
        website: null,
      },
      expectedCta: 'View Selected Projects',
      expectedSection: 'Selected Project Concepts',
    },
    {
      niche: 'SALON',
      business: {
        id: 'test_salon_004',
        external_id: 'test_salon_004',
        name: 'Luxe Velvet Hair & Beauty Salon',
        category: 'Beauty Salon & Spa',
        city: 'Bangalore',
        country: 'India',
        address: '88 Indiranagar 100ft Road, Bangalore',
        phone: '+919833344455',
        rating: 4.6,
        review_count: 95,
        website: null,
      },
      expectedCta: 'Book an Appointment',
      expectedSection: 'Signature Salon Services',
    },
    {
      niche: 'GYM',
      business: {
        id: 'test_gym_005',
        external_id: 'test_gym_005',
        name: 'IronCore Athletic Fitness Gym',
        category: 'Gym & Fitness Center',
        city: 'Delhi',
        country: 'India',
        address: 'Plot 10, Connaught Place, Delhi',
        phone: '+919844455566',
        rating: 4.8,
        review_count: 110,
        website: null,
      },
      expectedCta: 'Claim Free Day Pass',
      expectedSection: 'Training Programs & Facilities',
    },
    {
      niche: 'REAL_ESTATE',
      business: {
        id: 'test_re_006',
        external_id: 'test_re_006',
        name: 'Skyline Landmark Realty',
        category: 'Real Estate Agency & Property Advisory',
        city: 'Hyderabad',
        country: 'India',
        address: 'Hitec City, Phase 2, Hyderabad',
        phone: '+919855566677',
        rating: 4.9,
        review_count: 64,
        website: null,
      },
      expectedCta: 'Explore Available Properties',
      expectedSection: 'Property Advisory & Portfolio',
    },
    {
      niche: 'LOCAL_BUSINESS (Unknown)',
      business: {
        id: 'test_local_007',
        external_id: 'test_local_007',
        name: 'Apex Precision Machine Works',
        category: 'Industrial Manufacturing & Supply',
        city: 'Chennai',
        country: 'India',
        address: 'Industrial Estate, Guindy, Chennai',
        phone: '+919866677788',
        rating: 4.5,
        review_count: 18,
        website: null,
      },
      expectedCta: 'Contact Us Today',
      expectedSection: 'Professional Services by Apex Precision Machine Works',
    },
  ];

  for (const tc of testCases) {
    console.log(`\n--- Testing ${tc.niche} ---`);
    // Step A: Generate demo via API
    const genRes = await request('http://localhost:3000/api/demos/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { business: tc.business },
    });

    if (genRes.statusCode !== 200) {
      console.error(`❌ FAIL generating demo for ${tc.niche}: status ${genRes.statusCode}`, genRes.body);
      continue;
    }

    const genJson = JSON.parse(genRes.body);
    console.log(`Generated Slug: ${genJson.slug}`);
    console.log(`Public URL: ${genJson.publicUrl}`);

    // Check validation
    if (!genJson.demo.validationPassed) {
      console.error(`❌ Validation failed for ${tc.niche}`);
    } else {
      console.log(`✅ Validation Passed (no placeholder text, no fake doctors, 4-7 sections)`);
    }

    // Step B: Load public URL via GET
    const demoPageRes = await request(`http://localhost:3000/demo/${genJson.slug}`);
    console.log(`GET /demo/${genJson.slug} -> HTTP ${demoPageRes.statusCode}`);

    if (demoPageRes.statusCode === 200) {
      const html = demoPageRes.body;
      const escapeHtml = (str) => str.replace(/&/g, '&amp;');
      const hasBusinessName = html.includes(tc.business.name) || html.includes(escapeHtml(tc.business.name));
      const hasCta = html.includes(tc.expectedCta);
      const hasSection = html.includes(tc.expectedSection) || html.includes(escapeHtml(tc.expectedSection));
      const hasNoPlaceholder = !html.includes('Lorem ipsum') && !html.includes('[doctor name]');

      console.log(`Business Name Present: ${hasBusinessName ? '✅' : '❌'}`);
      console.log(`Expected CTA Present ("${tc.expectedCta}"): ${hasCta ? '✅' : '❌'}`);
      console.log(`Expected Section Present ("${tc.expectedSection}"): ${hasSection ? '✅' : '❌'}`);
      console.log(`Zero Hallucinations/Placeholders: ${hasNoPlaceholder ? '✅' : '❌'}`);

      if (hasBusinessName && hasCta && hasSection && hasNoPlaceholder) {
        console.log(`✅ ${tc.niche} DEMO VERIFIED FULLY!`);
      } else {
        console.error(`❌ ${tc.niche} verification had missing elements!`);
      }
    } else {
      console.error(`❌ Failed to retrieve demo page: status ${demoPageRes.statusCode}`);
    }

    // Step C: Test Refresh-Safety (re-fetch by ID and Slug)
    const reFetchRes = await request(`http://localhost:3000/demo/${tc.business.id}`);
    console.log(`GET /demo/${tc.business.id} (Rehydration by ID) -> HTTP ${reFetchRes.statusCode} ${reFetchRes.statusCode === 200 ? '✅' : '❌'}`);
  }

  console.log('\n--- ALL TEST CASES COMPLETED ---');
}

runTests().catch(console.error);
