import dotenv from 'dotenv';
dotenv.config();
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/supabase';

const API_BASE = 'http://localhost:3001/api/v1';

interface TestResult {
  num: number;
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
  details?: any;
}

const results: TestResult[] = [];

function createCustomerToken(userId: string, email: string): string {
  const secret = process.env.JWT_SECRET || '0f066869f35db1e034fa178ecb1226b487b69f718d2866a07a9abc5295824964cf8d385c4439c704b25412cb4979eb60dbdce60b31a4cb15685ab03925da95b0';
  return jwt.sign(
    {
      userId,
      sub: userId,
      id: userId,
      email,
      role: 'customer',
    },
    secret,
    { expiresIn: '2h' }
  );
}

function createAdminToken(userId: string, email: string): string {
  const secret = process.env.ADMIN_JWT_SECRET || 'growplus-super-secret-admin-key-minimum-32-characters';
  return jwt.sign(
    {
      userId,
      sub: userId,
      id: userId,
      email,
      role: 'owner',
    },
    secret,
    { expiresIn: '2h' }
  );
}

async function runTest(
  num: number,
  name: string,
  fn: () => Promise<{ expected: string; actual: string; details?: any }>
) {
  process.stdout.write(`[Test ${num.toString().padStart(2, '0')}/16] ${name}... `);
  try {
    const res = await fn();
    const passed = res.expected === res.actual;
    results.push({ num, name, passed, expected: res.expected, actual: res.actual, details: res.details });
    if (passed) {
      console.log('✅ PASSED');
    } else {
      console.log(`❌ FAILED (Expected: ${res.expected}, Got: ${res.actual})`);
      if (res.details) console.log('   Details:', res.details);
    }
  } catch (err: any) {
    results.push({ num, name, passed: false, expected: 'Success', actual: `Exception: ${err.message}` });
    console.log(`❌ EXCEPTION: ${err.message}`);
  }
}

async function runAllTests() {
  console.log('================================================================');
  console.log('  GROWPLUS ORDER MANAGEMENT & PAYMENTS INTEGRATION SUITE');
  console.log('  Testing 16 Critical Integration Criteria');
  console.log('================================================================\n');

  // --- Step 0: Setup QA Customer and Admin Test Credentials ---
  const timestamp = Date.now();
  const customerEmail = `qa.order.test.${timestamp}@growplus.internal`;
  const adminEmail = `admin@growplus.internal`;

  // 1. Create test customer
  const { data: authCust, error: authCustErr } = await supabaseAdmin.auth.admin.createUser({
    email: customerEmail,
    password: 'QATestPassword!2026',
    email_confirm: true,
  });

  if (authCustErr || !authCust?.user) {
    throw new Error(`Failed to create test customer auth: ${authCustErr?.message}`);
  }

  const customerId = authCust.user.id;
  await supabaseAdmin.from('user_profiles').insert({
    user_id: customerId,
    full_name: 'QA Order Tester',
    email: customerEmail,
    phone: '+919876543210',
    role: 'customer',
  });

  // Ensure wallet account for customer
  await supabaseAdmin
    .from('wallet_accounts')
    .insert({
      user_id: customerId,
      balance: 0.0,
      pending_balance: 0.0,
      is_frozen: false,
    });

  const customerToken = createCustomerToken(customerId, customerEmail);

  // 2. Get or ensure admin user
  let adminId: string;
  const { data: staffRecord } = await supabaseAdmin
    .from('staff')
    .select('user_id, role')
    .eq('role', 'owner')
    .limit(1)
    .single();

  if (staffRecord) {
    adminId = staffRecord.user_id;
  } else {
    adminId = '310f8285-a778-49f6-9ded-507f338f65ee';
  }
  const adminToken = createAdminToken(adminId, adminEmail);

  // 3. Ensure test product exists
  let { data: product } = await supabaseAdmin
    .from('products')
    .select('id, name, sku, selling_price, is_eligible_for_rewards')
    .eq('status', 'active')
    .limit(1)
    .single();

  if (!product) {
    const { data: newProd } = await supabaseAdmin
      .from('products')
      .insert({
        name: 'Premium Consumer Retail Item',
        slug: `retail-item-${timestamp}`,
        sku: `SKU-${timestamp}`,
        selling_price: 1000,
        status: 'active',
        is_eligible_for_rewards: true,
      })
      .select()
      .single();
    product = newProd;
  }

  const productId = product!.id;

  // Helper to reset and populate cart
  async function setCart(quantity: number = 1, unitPrice: number = 1000) {
    let { data: cart } = await supabaseAdmin
      .from('carts')
      .select('id')
      .eq('user_id', customerId)
      .single();

    if (!cart) {
      const { data: newCart } = await supabaseAdmin
        .from('carts')
        .insert({ user_id: customerId })
        .select()
        .single();
      cart = newCart;
    }

    await supabaseAdmin.from('cart_items').delete().eq('cart_id', cart!.id);
    await supabaseAdmin.from('cart_items').insert({
      cart_id: cart!.id,
      product_id: productId,
      quantity,
      unit_price: unitPrice,
    });
    return cart!.id;
  }

  // Helper to set customer wallet balance
  async function setWallet(balance: number) {
    await supabaseAdmin
      .from('wallet_accounts')
      .update({ balance, is_frozen: false })
      .eq('user_id', customerId);
  }

  // Track shared order between tests 3 to 9
  let testOrder1Id: string = '';
  let testOrder1Number: string = '';
  let testRazorpayOrderId: string = '';
  let initialStockBeforeTest3: number = 0;

  // =================================================================
  // TEST 1: Product creation with positive stock
  // =================================================================
  await runTest(1, 'Product creation with positive stock', async () => {
    let { data: inv } = await supabaseAdmin
      .from('inventory')
      .select('quantity')
      .eq('product_id', productId)
      .single();

    if (!inv || inv.quantity < 20) {
      await supabaseAdmin
        .from('inventory')
        .upsert({
          product_id: productId,
          quantity: 50,
          reserved_quantity: 0,
          updated_at: new Date().toISOString(),
        });
      inv = { quantity: 50 };
    }

    const expected = 'true:true';
    const actual = `${Boolean(product && product.id)}:${inv.quantity >= 20}`;
    return { expected, actual };
  });

  // =================================================================
  // TEST 2: Customer cart additions
  // =================================================================
  await runTest(2, 'Customer cart additions', async () => {
    const cartId = await setCart(1, 1000);
    const { data: items } = await supabaseAdmin
      .from('cart_items')
      .select('product_id, quantity, unit_price')
      .eq('cart_id', cartId);

    const hasItem = Array.isArray(items) && items.length > 0;
    const item = items?.[0];
    const correctDetails = item?.product_id === productId && item?.quantity === 1 && Number(item?.unit_price) === 1000;

    const expected = 'true:true';
    const actual = `${hasItem}:${correctDetails}`;
    return { expected, actual };
  });

  // =================================================================
  // TEST 3: Order creation checking stock decrement
  // =================================================================
  await runTest(3, 'Order creation checking stock decrement', async () => {
    const { data: invPre } = await supabaseAdmin
      .from('inventory')
      .select('quantity')
      .eq('product_id', productId)
      .single();

    initialStockBeforeTest3 = invPre?.quantity || 50;

    const idempotencyKey = crypto.randomUUID();
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        shipping_address: {
          name: 'QA Order Tester',
          email: customerEmail,
          phone: '+919876543210',
          address_line1: '123 Test Street',
          city: 'Bangalore',
          state: 'Karnataka',
          postal_code: '560001',
          country: 'India',
        },
        idempotency_key: idempotencyKey,
        credits_to_apply: 0,
      }),
    });

    const data = await res.json() as any;
    if (res.status !== 201) {
      return { expected: 'status:201', actual: `status:${res.status}`, details: data };
    }

    testOrder1Id = data.id;
    testOrder1Number = data.order_number;

    const { data: invPost } = await supabaseAdmin
      .from('inventory')
      .select('quantity')
      .eq('product_id', productId)
      .single();

    const stockDecremented = (invPost?.quantity || 0) === initialStockBeforeTest3 - 1;
    const expected = '201:true';
    const actual = `${res.status}:${stockDecremented}`;
    return { expected, actual };
  });

  // =================================================================
  // TEST 4: Supabase DB order record creation
  // =================================================================
  await runTest(4, 'Supabase DB order record creation', async () => {
    const { data: dbOrder } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', testOrder1Id)
      .single();

    const orderMatches = Boolean(
      dbOrder &&
      dbOrder.user_id === customerId &&
      Number(dbOrder.subtotal) === 1000 &&
      Number(dbOrder.total_amount) === 1000 &&
      Number(dbOrder.credits_applied) === 0 &&
      dbOrder.status === 'pending' &&
      dbOrder.payment_status === 'pending'
    );

    const itemsMatch = Boolean(
      dbOrder?.order_items &&
      dbOrder.order_items.length === 1 &&
      dbOrder.order_items[0].product_id === productId &&
      dbOrder.order_items[0].quantity === 1
    );

    const expected = 'true:true';
    const actual = `${orderMatches}:${itemsMatch}`;
    return { expected, actual };
  });

  // =================================================================
  // TEST 5: Admin dashboard order visibility with customer details
  // =================================================================
  await runTest(5, 'Admin dashboard order visibility with customer details', async () => {
    const res = await fetch(`${API_BASE}/admin/orders?search=${testOrder1Number}`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    const data = await res.json() as any;
    const foundOrder = (data.orders || []).find((o: any) => o.id === testOrder1Id);
    const hasProfile = Boolean(
      foundOrder?.user_profiles &&
      foundOrder.user_profiles.full_name &&
      foundOrder.user_profiles.email
    );

    const expected = '200:true:true';
    const actual = `${res.status}:${Boolean(foundOrder)}:${hasProfile}`;
    return { expected, actual };
  });

  // =================================================================
  // TEST 6: Customer privacy enforcement (RLS / non-staff rejection)
  // =================================================================
  await runTest(6, 'Customer privacy enforcement (RLS / non-staff rejection)', async () => {
    const resAdminOrders = await fetch(`${API_BASE}/admin/orders`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });

    const resAdminDashboard = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });

    const expected = '403:403';
    const actual = `${resAdminOrders.status}:${resAdminDashboard.status}`;
    return { expected, actual };
  });

  // =================================================================
  // TEST 7: Razorpay payment order creation
  // =================================================================
  await runTest(7, 'Razorpay payment order creation', async () => {
    const res = await fetch(`${API_BASE}/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ order_id: testOrder1Id }),
    });

    const data = await res.json() as any;
    testRazorpayOrderId = data.razorpay_order_id;

    const { data: paymentRecord } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('gateway_order_id', testRazorpayOrderId)
      .single();

    const correctAmountInPaise = data.amount === 100000; // ₹1,000 * 100
    const paymentCreatedInDb = Boolean(paymentRecord && paymentRecord.status === 'created');

    const expected = '200:true:true';
    const actual = `${res.status}:${correctAmountInPaise}:${paymentCreatedInDb}`;
    return { expected, actual };
  });

  // =================================================================
  // TEST 8: Signature verification & webhook HMAC SHA-256 verification
  // =================================================================
  await runTest(8, 'Signature verification & webhook HMAC SHA-256 verification', async () => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'placeholder_webhook_secret';
    const fakePaymentId = `pay_qa_test_${Date.now()}`;
    const webhookEventId = `evt_qa_test_${Date.now()}`;

    const payload = {
      entity: 'event',
      account_id: 'acc_test123',
      event: 'payment.captured',
      contains: ['payment'],
      payload: {
        payment: {
          entity: {
            id: fakePaymentId,
            order_id: testRazorpayOrderId,
            amount: 100000,
            currency: 'INR',
            status: 'captured',
            method: 'card',
          },
        },
      },
    };

    const rawBody = JSON.stringify(payload);

    // 1. Invalid signature check
    const invalidRes = await fetch(`${API_BASE}/webhooks/razorpay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': 'invalid_signature_hex_digest_99999',
        'x-razorpay-event-id': `${webhookEventId}_bad`,
      },
      body: rawBody,
    });

    // 2. Valid signature check
    const validSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    const validRes = await fetch(`${API_BASE}/webhooks/razorpay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': validSignature,
        'x-razorpay-event-id': webhookEventId,
      },
      body: rawBody,
    });

    const expected = '400:200';
    const actual = `${invalidRes.status}:${validRes.status}`;
    return { expected, actual };
  });

  // =================================================================
  // TEST 9: Order status transition on payment capture (paid / confirmed)
  // =================================================================
  await runTest(9, 'Order status transition on payment capture (paid / confirmed)', async () => {
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('status, payment_status')
      .eq('id', testOrder1Id)
      .single();

    const { data: payment } = await supabaseAdmin
      .from('payments')
      .select('status')
      .eq('gateway_order_id', testRazorpayOrderId)
      .single();

    const expected = 'paid:confirmed:captured';
    const actual = `${order?.payment_status}:${order?.status}:${payment?.status}`;
    return { expected, actual };
  });

  // =================================================================
  // TEST 10: Admin dashboard counters update
  // =================================================================
  await runTest(10, 'Admin dashboard counters update', async () => {
    const res = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const data = await res.json() as any;
    const hasMetrics = res.status === 200 && typeof data.total_orders === 'number';
    const metricsAccurate = data.total_orders > 0 && typeof data.total_sales === 'number';

    const expected = '200:true:true';
    const actual = `${res.status}:${hasMetrics}:${metricsAccurate}`;
    return { expected, actual };
  });

  // =================================================================
  // TEST 11: Customer order history retrieval
  // =================================================================
  await runTest(11, 'Customer order history retrieval', async () => {
    const res = await fetch(`${API_BASE}/orders`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });

    const data = await res.json() as any;
    const userOrders = data.orders || [];
    const found = userOrders.find((o: any) => o.id === testOrder1Id);
    const hasItems = found && found.order_items && found.order_items.length > 0;

    const expected = '200:true:true';
    const actual = `${res.status}:${Boolean(found)}:${Boolean(hasItems)}`;
    return { expected, actual };
  });

  // =================================================================
  // TEST 12: Credits + Razorpay split calculation
  // =================================================================
  let splitOrderId: string = '';
  await runTest(12, 'Credits + Razorpay split calculation (₹1,000 order, ₹300 credits -> ₹700 Razorpay)', async () => {
    await setCart(1, 1000);
    await setWallet(300);

    const idempotencyKey = crypto.randomUUID();
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        shipping_address: { address: 'Split Test Address' },
        idempotency_key: idempotencyKey,
        credits_to_apply: 300,
      }),
    });

    const data = await res.json() as any;
    splitOrderId = data.id;

    // Check wallet balance after debit
    const { data: postWallet } = await supabaseAdmin
      .from('wallet_accounts')
      .select('balance')
      .eq('user_id', customerId)
      .single();

    // Create payment order for split
    const payRes = await fetch(`${API_BASE}/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ order_id: splitOrderId }),
    });
    const payData = await payRes.json() as any;

    const expected = '1000:300:700:0:70000';
    const actual = `${data.subtotal}:${data.credits_applied}:${data.total_amount}:${Number(postWallet?.balance)}:${payData.amount}`;
    return { expected, actual };
  });

  // =================================================================
  // TEST 13: Zero-credit payment flow
  // =================================================================
  await runTest(13, 'Zero-credit payment flow (Zero Credits -> 100% Razorpay; 100% Credits -> Zero Razorpay)', async () => {
    // 13A: Customer has 0 credits applied -> 100% Razorpay gateway
    await setCart(1, 1000);
    await setWallet(0);

    const idempA = crypto.randomUUID();
    const resA = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        shipping_address: { address: 'Zero Credit Address' },
        idempotency_key: idempA,
        credits_to_apply: 0,
      }),
    });
    const dataA = await resA.json() as any;

    // 13B: Customer applies 100% credits -> total_amount = 0, automatically paid & confirmed
    await setCart(1, 500);
    await setWallet(500);

    const idempB = crypto.randomUUID();
    const resB = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        shipping_address: { address: '100% Credit Address' },
        idempotency_key: idempB,
        credits_to_apply: 500,
      }),
    });
    const dataB = await resB.json() as any;

    const testAPassed = dataA.subtotal === 1000 && dataA.credits_applied === 0 && dataA.total_amount === 1000 && dataA.payment_status === 'pending';
    const testBPassed = dataB.subtotal === 500 && dataB.credits_applied === 500 && dataB.total_amount === 0 && dataB.payment_status === 'paid' && dataB.status === 'confirmed';

    const expected = 'true:true';
    const actual = `${testAPassed}:${testBPassed}`;
    return { expected, actual };
  });

  // =================================================================
  // TEST 14: Payment failure / cancellation handling and credit restoration
  // =================================================================
  await runTest(14, 'Payment failure / cancellation handling and credit restoration', async () => {
    const { data: preWallet } = await supabaseAdmin
      .from('wallet_accounts')
      .select('balance')
      .eq('user_id', customerId)
      .single();

    const walletBeforeFail = Number(preWallet?.balance);

    // Call fail endpoint
    const res = await fetch(`${API_BASE}/payments/fail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        order_id: splitOrderId,
        reason: 'Payment cancelled by customer during Razorpay checkout',
      }),
    });

    const { data: postOrder } = await supabaseAdmin
      .from('orders')
      .select('status, payment_status')
      .eq('id', splitOrderId)
      .single();

    const { data: postWallet } = await supabaseAdmin
      .from('wallet_accounts')
      .select('balance')
      .eq('user_id', customerId)
      .single();

    const creditsRestored = Number(postWallet?.balance) === walletBeforeFail + 300;

    const expected = '200:cancelled:failed:true';
    const actual = `${res.status}:${postOrder?.status}:${postOrder?.payment_status}:${creditsRestored}`;
    return { expected, actual };
  });

  // =================================================================
  // TEST 15: Webhook replay idempotency test
  // =================================================================
  await runTest(15, 'Webhook replay idempotency test', async () => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'placeholder_webhook_secret';
    const replayEventId = `evt_replay_${Date.now()}`;
    const replayPaymentId = `pay_replay_${Date.now()}`;

    // Create a new order to test replay idempotency
    await setCart(1, 1000);
    const idemp = crypto.randomUUID();
    const orderRes = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        shipping_address: { address: 'Replay Address' },
        idempotency_key: idemp,
        credits_to_apply: 0,
      }),
    });
    const orderData = await orderRes.json() as any;

    const payRes = await fetch(`${API_BASE}/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ order_id: orderData.id }),
    });
    const payData = await payRes.json() as any;

    const payload = {
      entity: 'event',
      account_id: 'acc_test123',
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: replayPaymentId,
            order_id: payData.razorpay_order_id,
            amount: 100000,
            currency: 'INR',
            status: 'captured',
          },
        },
      },
    };
    const rawBody = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    // First delivery -> returns 200 { status: 'ok' }
    const firstDelivery = await fetch(`${API_BASE}/webhooks/razorpay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': signature,
        'x-razorpay-event-id': replayEventId,
      },
      body: rawBody,
    });
    const firstData = await firstDelivery.json() as any;

    // Second delivery (Replay with same event ID) -> returns 200 { status: 'already_processed' }
    const secondDelivery = await fetch(`${API_BASE}/webhooks/razorpay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': signature,
        'x-razorpay-event-id': replayEventId,
      },
      body: rawBody,
    });
    const secondData = await secondDelivery.json() as any;

    // Third delivery (Different event ID, but order already captured) -> returns 200 { status: 'already_captured' }
    const thirdEventId = `evt_replay_diff_${Date.now()}`;
    const thirdDelivery = await fetch(`${API_BASE}/webhooks/razorpay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': signature,
        'x-razorpay-event-id': thirdEventId,
      },
      body: rawBody,
    });
    const thirdData = await thirdDelivery.json() as any;

    const expected = 'ok:already_processed:already_captured';
    const actual = `${firstData.status}:${secondData.status}:${thirdData.status}`;
    return { expected, actual };
  });

  // =================================================================
  // TEST 16: Cancelled order inventory and wallet reconciliation
  // =================================================================
  await runTest(16, 'Cancelled order inventory and wallet reconciliation', async () => {
    // 1. Record stock before order
    const { data: invPre } = await supabaseAdmin
      .from('inventory')
      .select('quantity')
      .eq('product_id', productId)
      .single();
    const stockPre = invPre?.quantity || 50;

    // 2. Setup cart with 2 units (each ₹1,000) and ₹200 credits
    await setCart(2, 1000);
    await setWallet(200);

    const idemp = crypto.randomUUID();
    const orderRes = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        shipping_address: { address: 'Cancel Recon Address' },
        idempotency_key: idemp,
        credits_to_apply: 200,
      }),
    });
    const orderData = await orderRes.json() as any;

    // Verify stock decremented by 2
    const { data: invMid } = await supabaseAdmin
      .from('inventory')
      .select('quantity')
      .eq('product_id', productId)
      .single();
    const stockMid = invMid?.quantity || 0;
    const decrementedBy2 = stockMid === stockPre - 2;

    // Verify wallet debited by 200 (now 0)
    const { data: walletMid } = await supabaseAdmin
      .from('wallet_accounts')
      .select('balance')
      .eq('user_id', customerId)
      .single();
    const walletDebited = Number(walletMid?.balance) === 0;

    // 3. Admin cancels order
    const cancelRes = await fetch(`${API_BASE}/admin/orders/${orderData.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'cancelled',
        refund_reason: 'Automated test cancellation verification',
      }),
    });

    // 4. Verify inventory restored (+2)
    const { data: invPost } = await supabaseAdmin
      .from('inventory')
      .select('quantity')
      .eq('product_id', productId)
      .single();
    const stockRestored = (invPost?.quantity || 0) === stockPre;

    // 5. Verify customer wallet restored (+200)
    const { data: walletPost } = await supabaseAdmin
      .from('wallet_accounts')
      .select('balance')
      .eq('user_id', customerId)
      .single();
    const walletRestored = Number(walletPost?.balance) === 200;

    const expected = '200:true:true:true:true';
    const actual = `${cancelRes.status}:${decrementedBy2}:${walletDebited}:${stockRestored}:${walletRestored}`;
    return { expected, actual };
  });

  // --- Teardown QA test user ---
  try {
    await supabaseAdmin.auth.admin.deleteUser(customerId);
  } catch (_) {}

  // --- Summary ---
  console.log('\n================================================================');
  console.log('  TEST SUITE RESULTS SUMMARY');
  console.log('================================================================');
  const passedCount = results.filter(r => r.passed).length;
  console.log(`  Total Criteria: 16`);
  console.log(`  Passed: ${passedCount}/16`);
  console.log(`  Failed: ${16 - passedCount}/16`);
  console.log('================================================================\n');

  if (passedCount < 16) {
    console.error('❌ Test suite failed one or more criteria.');
    process.exit(1);
  } else {
    console.log('🎉 ALL 16 INTEGRATION TEST CRITERIA PASSED SUCCESSFULLY!');
    process.exit(0);
  }
}

runAllTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
