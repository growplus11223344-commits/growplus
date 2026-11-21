import dotenv from 'dotenv';
dotenv.config();

async function testGoogleSheets() {
  const url = process.env.GOOGLE_APPS_SCRIPT_URL;
  const secret = process.env.GOOGLE_APPS_SCRIPT_SECRET;

  console.log('============================================================');
  console.log('   GROWPLUS LIVE GOOGLE APPS SCRIPT WEB APP TEST');
  console.log('============================================================\n');
  console.log(`Target URL: ${url}`);
  console.log(`Secret configured: ${secret ? 'YES (Length: ' + secret.length + ')' : 'NO'}\n`);

  if (!url) {
    console.error('❌ GOOGLE_APPS_SCRIPT_URL is missing in backend/.env');
    process.exit(1);
  }

  const categories = ['CUSTOMERS', 'PRODUCTS', 'ORDERS', 'SALES', 'INVENTORY', 'REWARDS'];

  for (const cat of categories) {
    console.log(`\n------------------------------------------------------------`);
    console.log(`Testing Category: ${cat}`);
    console.log(`------------------------------------------------------------`);

    const payload = {
      action: 'REPLACE',
      category: cat,
      secret: secret,
      headers: ['Record ID', 'Category', 'Test Marker', 'Verified Timestamp'],
      rows: [
        [
          `test-${cat.toLowerCase()}-${Date.now()}`,
          cat,
          'GrowPlus Live Verification',
          new Date().toISOString()
        ]
      ]
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        redirect: 'follow',
      });

      console.log(`HTTP Status: ${response.status} ${response.statusText}`);
      const text = await response.text();

      let parsed: any = null;
      try {
        parsed = JSON.parse(text);
        if (parsed.success) {
          console.log(`✅ Success response received for ${cat}:`);
          console.log(`   - Rows Synced: ${parsed.rowsSynced}`);
          console.log(`   - Target Sheet: ${parsed.sheetName}`);
        } else {
          console.log(`❌ Apps Script returned logical error for ${cat}:`, parsed.error || parsed);
        }
      } catch {
        const errorMatch = text.match(/<div class="errorMessage">(.*?)<\/div>/i) ||
                           text.match(/<div style="[^"]*">(Script function not found: [^<]+)<\/div>/i);
        const errMsg = errorMatch ? errorMatch[1] : text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 150);
        console.log(`❌ Response is not JSON. Server returned: "${errMsg}"`);
      }
    } catch (err: any) {
      console.log(`❌ Fetch network error for ${cat}: ${err.message}`);
    }
  }

  console.log('\n============================================================');
  console.log('Test completed.');
  console.log('============================================================');
}

testGoogleSheets();
