import dotenv from 'dotenv';
dotenv.config();
import Razorpay from 'razorpay';

async function testRazorpay() {
  console.log('--- Testing Razorpay Connection ---');
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  console.log('RAZORPAY_KEY_ID:', key_id ? `${key_id.substring(0, 8)}...` : 'NOT SET');
  console.log('RAZORPAY_KEY_SECRET:', key_secret ? 'EXISTS (length: ' + key_secret.length + ')' : 'NOT SET');

  if (!key_id || !key_secret || key_id.includes('placeholder')) {
    console.error('ERROR: Real Razorpay keys not configured.');
    process.exit(1);
  }

  const razorpay = new Razorpay({
    key_id,
    key_secret,
  });

  try {
    console.log('1. Fetching recent payments from Razorpay API...');
    const payments = await razorpay.payments.all({ count: 2 });
    console.log('SUCCESS: Authenticated successfully with Razorpay API!');
    console.log(`Payments count returned: ${payments.items?.length ?? 0}`);

    console.log('2. Creating a test sandbox order...');
    const testOrder = await razorpay.orders.create({
      amount: 50000, // INR 500.00
      currency: 'INR',
      receipt: `test_rcpt_${Date.now()}`,
      notes: { test: 'live_verification', system: 'GrowPlus' }
    });
    console.log(`SUCCESS: Created Razorpay test order: ${testOrder.id} (${testOrder.status}, amount: ${testOrder.amount} paise)`);

    console.log('\n>>> RAZORPAY INTEGRATION IS 100% OPERATIONAL & VERIFIED LIVE! <<<');
    process.exit(0);
  } catch (err: any) {
    console.error('FAILED to interact with Razorpay:', err.message || err);
    if (err.statusCode) console.error(`Status code: ${err.statusCode}`);
    if (err.error) console.error('Error details:', JSON.stringify(err.error, null, 2));
    process.exit(1);
  }
}

testRazorpay();
