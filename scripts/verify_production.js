const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(body), rawBody: body });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body: null, rawBody: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== STARTING PRODUCTION ARCHITECTURE & LAYOUT VERIFICATION ===\n');

  // Test 1: GET /api/status without session key
  console.log('1. Testing /api/status default response:');
  const status1 = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/status',
    method: 'GET',
  });
  console.log('Status HTTP Code:', status1.status);
  console.log('Database provider:', status1.body?.databaseProvider);
  console.log('Places Configured:', status1.body?.googlePlacesConfigured);
  console.log('Places Source:', status1.body?.placesSource);
  console.log('Places Message:', status1.body?.placesStatusMessage);
  console.log('Database Message:', status1.body?.databaseStatusMessage);
  console.log('Is Vercel Flag Present:', typeof status1.body?.isVercel !== 'undefined');

  // Test 2: GET /api/status with x-google-api-key session header
  console.log('\n2. Testing /api/status with session key (x-google-api-key):');
  const status2 = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/status',
    method: 'GET',
    headers: {
      'x-google-api-key': 'AIzaTestSessionKeyForValidation123456789',
    },
  });
  console.log('Status HTTP Code:', status2.status);
  console.log('Places Configured:', status2.body?.googlePlacesConfigured);
  console.log('Places Source:', status2.body?.placesSource);
  console.log('Places Message:', status2.body?.placesStatusMessage);

  // Test 3: POST /api/leads/search with invalid API key
  console.log('\n3. Testing /api/leads/search authentication failure handling:');
  const searchAuth = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/leads/search',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-google-api-key': 'AIzaSyFakeKeyInvalidAuthenticationTest1234',
    },
  }, {
    city: 'Nagpur',
    niche: 'Interior Designers',
    country: 'India',
    limit: 10,
  });
  console.log('Auth Failure HTTP Code:', searchAuth.status);
  console.log('Auth Failure Error Code:', searchAuth.body?.code);
  console.log('Auth Failure Message:', searchAuth.body?.message || searchAuth.body?.error);
  const leaksKey = searchAuth.rawBody.includes('AIzaSyFakeKeyInvalidAuthenticationTest1234');
  console.log('Key Leaked in Response (Must be FALSE):', leaksKey);

  // Test 4: Layout & CSS audit on root HTML
  console.log('\n4. Testing Layout & CSS rules on /:');
  const home = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET',
  });
  console.log('Home HTTP Code:', home.status);
  const hasAppShell = home.rawBody.includes('app-container');
  console.log('Has app-container shell:', hasAppShell);

  console.log('\n=== ALL ARCHITECTURE TESTS EXECUTED ===');
}

runTests().catch(console.error);
