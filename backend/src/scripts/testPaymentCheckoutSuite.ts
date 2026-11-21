import dotenv from 'dotenv';
dotenv.config();
import { supabaseAdmin } from '../config/supabase';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

interface TestResult {
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
  details?: any;
}

const results: TestResult[] = [];

async function runTest(name: string, fn: () => Promise<{ expected: string; actual: string }>) {
  process.stdout.write(`Testing: ${name}... `);
  try {
    const { expected, actual } = await fn();
    const passed = expected === actual;
    results.push({ name, passed, expected, actual });
    console.log(passed ? 'PASSED' : `FAILED (Expected: ${expected}, Got: ${actual})`);
  } catch (err: any) {
    results.push({ name, passed: false, expected: 'Success', actual: `Threw Error: ${err.message}` });
    console.log(`FAILED with exception: ${err.message}`);
  }
}

async function runSuite() {
  console.log('====================================================');
  console.log('GROWPLUS PAYMENT & CHECKOUT SYSTEM TEST SUITE');
  console.log('====================================================\n');

  // 1. Create a clean test auth user
  const email = `payment_test_${Date.now()}@growplus.internal`;
  const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: 'TestPassword123!',
    email_confirm: true,
  });

  if (authErr || !authData?.user) {
    throw new Error(`Failed to create test auth user: ${authErr?.message}`);
  }

  const userId = authData.user.id;
  console.log(`Initialized test user: ${email} (${userId})`);

  // 2. Insert user profile
  await supabaseAdmin.from('user_profiles').insert({
    user_id: userId,
    full_name: 'Payment Test User',
    email: email,
    phone: '9876543299',
    role: 'buyer',
  });

  // 3. Ensure wallet exists with initial 1000 balance
  let { data: wallet } = await supabaseAdmin
    .from('wallet_accounts')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!wallet) {
    const { data: newWallet } = await supabaseAdmin
      .from('wallet_accounts')
      .insert({ user_id: userId, balance: 1000.0, pending_balance: 0.0, is_frozen: false })
      .select()
      .single();
    wallet = newWallet;
  } else {
    await supabaseAdmin
      .from('wallet_accounts')
      .update({ balance: 1000.0, is_frozen: false })
      .eq('id', wallet.id);
  }

  // 4. Ensure active product exists
  let { data: product } = await supabaseAdmin
    .from('products')
    .select('id, selling_price')
    .eq('status', 'active')
    .limit(1)
    .single();

  if (!product) {
    const { data: newProd, error: prodErr } = await supabaseAdmin
      .from('products')
      .insert({
        name: 'Premium Consumer Retail Item',
        slug: `retail-item-${Date.now()}`,
        sku: `SKU-${Date.now()}`,
        selling_price: 1000,
        status: 'active',
        is_eligible_for_rewards: true,
      })
      .select()
      .single();

    if (prodErr || !newProd) {
      throw new Error(`Failed to insert test product: ${prodErr?.message}`);
    }
    product = newProd;
  }

  const productId = product!.id;

  // Helper to setup cart
  async function setupCart(targetSubtotal: number) {
    let { data: cart } = await supabaseAdmin
      .from('carts')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!cart) {
      const { data: newCart } = await supabaseAdmin
        .from('carts')
        .insert({ user_id: userId })
        .select()
        .single();
      cart = newCart;
    }

    const cartId = cart!.id;

    // Clear cart items
    await supabaseAdmin.from('cart_items').delete().eq('cart_id', cartId);

    // Add item with exact target price
    await supabaseAdmin.from('cart_items').insert({
      cart_id: cartId,
      product_id: productId,
      quantity: 1,
      unit_price: targetSubtotal,
    });

    return cartId;
  }

  // Reset wallet balance helper
  async function setWalletBalance(balance: number) {
    await supabaseAdmin
      .from('wallet_accounts')
      .update({ balance, is_frozen: false })
      .eq('user_id', userId);
  }

  const token = createTestToken(userId, email);

  // -----------------------------------------------------------
  // TEST 1: Order ₹1,000, credits ₹300. Expected Razorpay amount: ₹700.
  // -----------------------------------------------------------
  await runTest('TEST 1: Order ₹1,000, credits ₹300 -> Razorpay ₹700', async () => {
    await setupCart(1000);
    await setWalletBalance(1000);

    const idempotencyKey = crypto.randomUUID();
    const res = await fetch('http://localhost:3001/api/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        shipping_address: { name: 'Tester', phone: '9876543210', address_line: '123 Test St', city: 'Bengaluru', state: 'Karnataka', pincode: '560001' },
        credits_to_apply: 300,
        idempotency_key: idempotencyKey,
      }),
    });

    const data: any = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');

    const expectedRazorpayAmount = '700';
    const actualRazorpayAmount = String(data.total_amount);

    return { expected: expectedRazorpayAmount, actual: actualRazorpayAmount };
  });

  // -----------------------------------------------------------
  // TEST 2: Order ₹500, credits ₹500. Expected Razorpay amount: ₹0 (Credits-only checkout)
  // -----------------------------------------------------------
  await runTest('TEST 2: Order ₹500, credits ₹500 -> Razorpay ₹0 (Credits-only checkout)', async () => {
    await setupCart(500);
    await setWalletBalance(500);

    const idempotencyKey = crypto.randomUUID();
    const res = await fetch('http://localhost:3001/api/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        shipping_address: { name: 'Tester', phone: '9876543210', address_line: '123 Test St', city: 'Bengaluru', state: 'Karnataka', pincode: '560001' },
        credits_to_apply: 500,
        idempotency_key: idempotencyKey,
      }),
    });

    const data: any = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');

    const expected = '0:paid:confirmed';
    const actual = `${data.total_amount}:${data.payment_status}:${data.status}`;

    return { expected, actual };
  });

  // -----------------------------------------------------------
  // TEST 3: Order ₹1,000, credits ₹0. Expected Razorpay amount: ₹1,000.
  // -----------------------------------------------------------
  await runTest('TEST 3: Order ₹1,000, credits ₹0 -> Razorpay ₹1,000', async () => {
    await setupCart(1000);
    await setWalletBalance(500);

    const idempotencyKey = crypto.randomUUID();
    const res = await fetch('http://localhost:3001/api/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        shipping_address: { name: 'Tester', phone: '9876543210', address_line: '123 Test St', city: 'Bengaluru', state: 'Karnataka', pincode: '560001' },
        credits_to_apply: 0,
        idempotency_key: idempotencyKey,
      }),
    });

    const data: any = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');

    const expected = '1000';
    const actual = String(data.total_amount);

    return { expected, actual };
  });

  // -----------------------------------------------------------
  // TEST 4: Order ₹1,000, credits ₹1,200. Expected: Reject excess credits (400)
  // -----------------------------------------------------------
  await runTest('TEST 4: Order ₹1,000, credits ₹1,200 -> Reject excess credits', async () => {
    await setupCart(1000);
    await setWalletBalance(2000);

    const idempotencyKey = crypto.randomUUID();
    const res = await fetch('http://localhost:3001/api/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        shipping_address: { name: 'Tester', phone: '9876543210', address_line: '123 Test St', city: 'Bengaluru', state: 'Karnataka', pincode: '560001' },
        credits_to_apply: 1200,
        idempotency_key: idempotencyKey,
      }),
    });

    const expected = '400';
    const actual = String(res.status);

    return { expected, actual };
  });

  // -----------------------------------------------------------
  // TEST 5: Razorpay payment fails -> Restore reserved credits & no paid order
  // -----------------------------------------------------------
  await runTest('TEST 5: Razorpay payment fails -> No paid order & credits restored', async () => {
    await setupCart(1000);
    await setWalletBalance(500);

    const idempotencyKey = crypto.randomUUID();
    // 1. Create order applying 300 credits
    const orderRes = await fetch('http://localhost:3001/api/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        shipping_address: { name: 'Tester', phone: '9876543210', address_line: '123 Test St', city: 'Bengaluru', state: 'Karnataka', pincode: '560001' },
        credits_to_apply: 300,
        idempotency_key: idempotencyKey,
      }),
    });
    const orderData: any = await orderRes.json();
    const orderId = orderData.id;

    // 2. Report payment failure
    await fetch('http://localhost:3001/api/v1/payments/fail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        order_id: orderId,
        reason: 'Customer cancelled gateway checkout',
        idempotency_key: crypto.randomUUID(),
      }),
    });

    // 3. Verify order is cancelled and wallet balance restored to 500
    const { data: updatedOrder } = await supabaseAdmin
      .from('orders')
      .select('payment_status, status')
      .eq('id', orderId)
      .single();

    const { data: restoredWallet } = await supabaseAdmin
      .from('wallet_accounts')
      .select('balance')
      .eq('user_id', userId)
      .single();

    const expected = 'failed:cancelled:500';
    const actual = `${updatedOrder?.payment_status}:${updatedOrder?.status}:${restoredWallet?.balance}`;

    return { expected, actual };
  });

  // -----------------------------------------------------------
  // TEST 6: Duplicate webhook -> Only one payment confirmation
  // -----------------------------------------------------------
  await runTest('TEST 6: Duplicate webhook -> Only one payment confirmation', async () => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'test_webhook_secret';
    const eventId = `evt_${Date.now()}`;
    const gatewayOrderId = `order_wh_${Date.now()}`;
    const gatewayPaymentId = `pay_wh_${Date.now()}`;

    // Create a real order via API
    await setupCart(700);
    const orderRes = await fetch('http://localhost:3001/api/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        shipping_address: { name: 'Webhook Test', phone: '9876543210', address_line: '123 St', city: 'C', state: 'TS', pincode: '560001' },
        credits_to_apply: 0,
        idempotency_key: crypto.randomUUID(),
      }),
    });
    const orderData: any = await orderRes.json();
    const orderId = orderData.id;

    // Record payment initiation with gatewayOrderId
    await supabaseAdmin.from('payments').insert({
      order_id: orderId,
      user_id: userId,
      gateway_order_id: gatewayOrderId,
      amount: 700,
      currency: 'INR',
      status: 'created',
    });

    const payload = {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: gatewayPaymentId,
            order_id: gatewayOrderId,
            amount: 70000,
            status: 'captured',
          },
        },
      },
    };
    const bodyStr = JSON.stringify(payload);
    const signature = crypto.createHmac('sha256', webhookSecret).update(bodyStr).digest('hex');

    // First webhook call
    const res1 = await fetch('http://localhost:3001/api/v1/webhooks/razorpay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': signature,
        'x-razorpay-event-id': eventId,
      },
      body: bodyStr,
    });
    const data1: any = await res1.json();

    // Duplicate webhook call with same event id
    const res2 = await fetch('http://localhost:3001/api/v1/webhooks/razorpay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': signature,
        'x-razorpay-event-id': eventId,
      },
      body: bodyStr,
    });
    const data2: any = await res2.json();

    const expected = 'ok:already_processed';
    const actual = `${data1.status}:${data2.status}`;

    return { expected, actual };
  });

  // -----------------------------------------------------------
  // TEST 7: Two simultaneous checkout requests -> No wallet double spending
  // -----------------------------------------------------------
  await runTest('TEST 7: Two simultaneous checkout requests -> No wallet double spending', async () => {
    // Set wallet balance to exactly ₹400
    await setWalletBalance(400);

    // Prepare cart with ₹1000 item
    await setupCart(1000);

    // Both requests attempt to use ₹400 credits simultaneously
    const req1 = fetch('http://localhost:3001/api/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        shipping_address: { name: 'Concurrent 1', phone: '9876543210', address_line: '123 St', city: 'C1', state: 'TS', pincode: '560001' },
        credits_to_apply: 400,
        idempotency_key: crypto.randomUUID(),
      }),
    });

    const req2 = fetch('http://localhost:3001/api/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        shipping_address: { name: 'Concurrent 2', phone: '9876543210', address_line: '123 St', city: 'C2', state: 'TS', pincode: '560001' },
        credits_to_apply: 400,
        idempotency_key: crypto.randomUUID(),
      }),
    });

    const [res1, res2] = await Promise.all([req1, req2]);

    // Check final wallet balance: must never be negative!
    const { data: finalWallet } = await supabaseAdmin
      .from('wallet_accounts')
      .select('balance')
      .eq('user_id', userId)
      .single();

    const balanceNonNegative = Number(finalWallet?.balance) >= 0;
    const finalBalance = Number(finalWallet?.balance);
    // At most 400 debited once: final balance should be 0 (if one succeeded) or 400 (if rejected), NEVER negative or double-debited
    const noDoubleSpending = finalBalance === 0 || finalBalance === 400;

    const expected = 'true:true';
    const actual = `${balanceNonNegative}:${noDoubleSpending}`;

    return { expected, actual };
  });

  // Cleanup test user
  try {
    await supabaseAdmin.auth.admin.deleteUser(userId);
  } catch (_) {}

  console.log('\n====================================================');
  console.log('TEST SUITE SUMMARY:');
  const totalPassed = results.filter(r => r.passed).length;
  console.log(`Passed: ${totalPassed}/${results.length}`);
  console.log('====================================================');

  if (totalPassed < results.length) {
    process.exit(1);
  }
}

function createTestToken(userId: string, email: string): string {
  const secret = process.env.JWT_SECRET || '0f066869f35db1e034fa178ecb1226b487b69f718d2866a07a9abc5295824964cf8d385c4439c704b25412cb4979eb60dbdce60b31a4cb15685ab03925da95b0';
  return jwt.sign(
    {
      userId: userId,
      sub: userId,
      id: userId,
      email: email,
      role: 'buyer',
    },
    secret,
    { expiresIn: '1h' }
  );
}

runSuite().catch(err => {
  console.error('Fatal suite error:', err);
  process.exit(1);
});
