const https = require('https');
const fs = require('fs');

// Read key from .env.local safely
const envContent = fs.readFileSync('.env.local', 'utf8');
const keyMatch = envContent.match(/GOOGLE_MAPS_API_KEY=([^\r\n]+)/);
const apiKey = keyMatch ? keyMatch[1].trim() : null;

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

async function testLiveProductionWorkflow() {
  console.log('=== REAL WORKFLOW TEST ON LIVE VERCEL DEPLOYMENT ===');
  console.log('Target: https://lead-finder-sagar.vercel.app\n');

  if (!apiKey) {
    console.error('No API key found in .env.local');
    return;
  }

  // 1. Search leads using real Google Places API
  console.log('1. Performing real lead search (Interior Designers in Nagpur)...');
  const searchRes = await request('https://lead-finder-sagar.vercel.app/api/leads/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-google-api-key': apiKey,
    },
  }, {
    city: 'Nagpur',
    niche: 'Interior Designers',
    country: 'India',
    limit: 10,
  });

  console.log('Search HTTP Status:', searchRes.status);
  const leads = searchRes.body?.businesses || searchRes.body?.leads || [];
  console.log('Found Leads Count:', leads.length);

  if (leads.length > 0) {
    const firstLead = leads[0];
    console.log('\nFirst Lead Details:');
    console.log('- Name:', firstLead.businessName);
    console.log('- Address:', firstLead.address);
    console.log('- Rating:', firstLead.rating);
    console.log('- Has Website:', !!firstLead.website);
    console.log('- Opportunity Score:', firstLead.opportunityScore);
    console.log('- Pitch Angle:', firstLead.pitchAngle);

    // 2. Generate a Demo Website for the first lead
    console.log('\n2. Generating Smart Demo Website on live Vercel...');
    const demoRes = await request('https://lead-finder-sagar.vercel.app/api/demos/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }, {
      business: firstLead,
      businessId: firstLead.id,
    });

    console.log('Demo Generation HTTP Status:', demoRes.status);
    console.log('Demo Generation Response Body:', demoRes.body);
    const demoSlug = demoRes.body?.slug || demoRes.body?.demoId;
    const publicUrl = demoRes.body?.publicUrl;
    console.log('Demo Slug:', demoSlug);
    console.log('Demo Public URL:', publicUrl);

    // 3. Verify demo page can be loaded directly (no Vercel 404)
    if (demoSlug) {
      console.log('\n3. Verifying Demo Page URL rendering (/demo/' + encodeURIComponent(demoSlug) + ')...');
      const demoPageRes = await request('https://lead-finder-sagar.vercel.app/demo/' + encodeURIComponent(demoSlug));
      console.log('Demo Page HTTP Status:', demoPageRes.status);
      console.log('Demo Page renders successfully (No 404):', demoPageRes.status === 200);
    }

    // 4. Verify CRM Outreach Proposal Generation
    console.log('\n4. Testing CRM Outreach generation on live Vercel...');
    const proposalRes = await request('https://lead-finder-sagar.vercel.app/api/crm/proposal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }, {
      businessId: firstLead.id,
    });
    console.log('Proposal HTTP Status:', proposalRes.status);
    console.log('Proposal Response Body:', proposalRes.body);
    console.log('Has Pitch Angle:', !!proposalRes.body?.proposal?.pitchAngle);
    console.log('Has Action Plan:', Array.isArray(proposalRes.body?.proposal?.actionPlan));
  } else {
    console.log('Search response body:', searchRes.body);
  }

  console.log('\n=== LIVE VERCEL WORKFLOW TEST FINISHED ===');
}

testLiveProductionWorkflow().catch(console.error);
