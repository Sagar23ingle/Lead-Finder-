const https = require('https');

function request(url, options = {}, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
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

async function verifyLiveVercel() {
  console.log('=== VERIFYING LIVE VERCEL DEPLOYMENT ===');
  console.log('Target URL: https://lead-finder-sagar.vercel.app\n');

  try {
    // 1. Check /api/status
    console.log('1. Checking /api/status...');
    const statusRes = await request('https://lead-finder-sagar.vercel.app/api/status');
    console.log('Status HTTP Code:', statusRes.status);
    console.log('Status Body:', JSON.stringify(statusRes.body, null, 2));

    // 2. Check / HTML
    console.log('\n2. Checking root HTML layout...');
    const rootRes = await request('https://lead-finder-sagar.vercel.app/');
    console.log('Root HTTP Code:', rootRes.status);
    console.log('Contains app-container shell:', rootRes.rawBody.includes('app-container'));
    console.log('Contains modal-backdrop CSS:', rootRes.rawBody.includes('modal-backdrop'));

    // 3. Check /api/status with session key
    console.log('\n3. Checking /api/status with x-google-api-key header...');
    const sessionRes = await request('https://lead-finder-sagar.vercel.app/api/status', {
      headers: {
        'x-google-api-key': 'AIzaTestSessionKeyForLiveVerification123456789'
      }
    });
    console.log('Session Status HTTP Code:', sessionRes.status);
    console.log('Session Status Body:', JSON.stringify(sessionRes.body, null, 2));

    // 4. Check auth failure categorization on /api/leads/search without leaking key
    console.log('\n4. Checking safe auth failure handling on live /api/leads/search...');
    const searchRes = await request('https://lead-finder-sagar.vercel.app/api/leads/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-google-api-key': 'AIzaSyFakeKeyInvalidAuthenticationTest1234'
      }
    }, {
      city: 'Nagpur',
      niche: 'Interior Designers',
      country: 'India',
      limit: 10
    });
    console.log('Search HTTP Code:', searchRes.status);
    console.log('Search Error Code:', searchRes.body?.code);
    console.log('Search Error Message:', searchRes.body?.message || searchRes.body?.error);
    const leaksKey = searchRes.rawBody.includes('AIzaSyFakeKeyInvalidAuthenticationTest1234');
    console.log('Leaked Key (Must be FALSE):', leaksKey);

    console.log('\n=== LIVE VERCEL VERIFICATION COMPLETE ===');
  } catch (err) {
    console.error('Live Vercel verification error:', err.message);
  }
}

verifyLiveVercel();
