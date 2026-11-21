import dotenv from 'dotenv';
dotenv.config();

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { PaymentGatewayService } from '../services/payment/PaymentGatewayService';
import { RazorpayAdapter } from '../services/payment/RazorpayAdapter';
import { EuropepayAdapter } from '../services/payment/EuropepayAdapter';
import { supabaseAdmin } from '../config/supabase';

async function runDualGatewayTests() {
  console.log('===============================================================');
  console.log(' GROWPLUS DUAL PAYMENT GATEWAY ARCHITECTURE TEST SUITE');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName} ${detail ? `(${detail})` : ''}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  // -------------------------------------------------------------------------
  // TEST 1: Razorpay Adapter Capabilities & Configuration Preservation
  // -------------------------------------------------------------------------
  console.log('[Phase 1 & 2] Testing Razorpay Gateway Adapter Preservation...');
  const razorpayAdapter = new RazorpayAdapter();
  const rzpCaps = razorpayAdapter.getCapabilities();

  assert(rzpCaps.supportsINR === true, 'Razorpay supports INR');
  assert(rzpCaps.gatewayType === 'sdk', 'Razorpay uses native SDK / iframe');
  assert(rzpCaps.supportedCurrencies.includes('INR'), 'Razorpay currency list has INR');

  const rzpSession = await razorpayAdapter.createPayment({
    orderId: '00000000-0000-0000-0000-000000000001',
    orderNumber: 'TEST-RZP-001',
    amount: 500,
    currency: 'INR',
    userId: '00000000-0000-0000-0000-000000000001',
  });

  assert(rzpSession.provider === 'razorpay', 'Razorpay session provider is razorpay');
  assert(rzpSession.amount === 50000, 'Razorpay amount is in paise (50000)');
  assert(Boolean(rzpSession.gatewayOrderId), 'Razorpay order ID generated', rzpSession.gatewayOrderId);
  assert(rzpSession.keyId === process.env.RAZORPAY_KEY_ID, 'Razorpay key ID preserved');

  // Signature verification test
  const testOrderId = rzpSession.gatewayOrderId!;
  const testPaymentId = 'pay_test_' + Date.now();
  const validSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${testOrderId}|${testPaymentId}`)
    .digest('hex');

  const rzpVerifyResult = await razorpayAdapter.verifyPayment({
    orderId: '00000000-0000-0000-0000-000000000001',
    gatewayOrderId: testOrderId,
    gatewayPaymentId: testPaymentId,
    gatewaySignature: validSignature,
  });

  assert(rzpVerifyResult.success === true, 'Razorpay signature verified successfully');
  assert(rzpVerifyResult.status === 'captured', 'Razorpay status normalized to captured');

  // Invalid signature rejection test
  try {
    await razorpayAdapter.verifyPayment({
      orderId: '00000000-0000-0000-0000-000000000001',
      gatewayOrderId: testOrderId,
      gatewayPaymentId: testPaymentId,
      gatewaySignature: 'tampered_invalid_signature',
    });
    assert(false, 'Razorpay tampered signature rejection');
  } catch (err: any) {
    assert(true, 'Razorpay rejects invalid signature', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST 2: EuropeanPay Adapter Capabilities & Currency Compatibility
  // -------------------------------------------------------------------------
  console.log('\n[Phase 1 & 5] Testing Europepay Gateway Adapter & Currency Gates...');
  const europepayAdapter = new EuropepayAdapter();
  const euCaps = europepayAdapter.getCapabilities();

  assert(euCaps.provider === 'europepay', 'Europepay provider name matches');
  assert(euCaps.supportsINR === false, 'EuropeanPay direct INR support is FALSE (EUR-only SEPA)');
  assert(euCaps.supportsEUR === true, 'EuropeanPay supports EUR');
  assert(euCaps.gatewayType === 'hosted_checkout', 'EuropeanPay uses hosted checkout URL');
  assert(euCaps.isLiveReady === false, 'EuropeanPay is correctly GATED / NOT live ready for direct INR store');

  // Attempt INR payment without sandbox exemption (must be rejected)
  delete process.env.ALLOW_EUROPEPAY_INR_SANDBOX;
  try {
    await europepayAdapter.createPayment({
      orderId: '00000000-0000-0000-0000-000000000002',
      orderNumber: 'TEST-EU-001',
      amount: 100,
      currency: 'INR',
      userId: '00000000-0000-0000-0000-000000000001',
    });
    assert(false, 'Europepay direct INR payment rejection gate');
  } catch (err: any) {
    assert(true, 'Europepay correctly rejected direct INR payment', err.message);
  }

  // Allow sandbox simulated testing
  process.env.ALLOW_EUROPEPAY_INR_SANDBOX = 'true';
  const euSession = await europepayAdapter.createPayment({
    orderId: '00000000-0000-0000-0000-000000000002',
    orderNumber: 'TEST-EU-002',
    amount: 100,
    currency: 'INR',
    userId: '00000000-0000-0000-0000-000000000001',
  });

  assert(euSession.provider === 'europepay', 'Europepay session provider is europepay');
  assert(euSession.gatewayType === 'hosted_checkout', 'Europepay gatewayType is hosted_checkout');
  assert(Boolean(euSession.checkoutUrl), 'Europepay hosted checkout URL generated', euSession.checkoutUrl);

  // Europepay verification test
  const euVerify = await europepayAdapter.verifyPayment({
    orderId: '00000000-0000-0000-0000-000000000002',
    gatewayPaymentId: euSession.gatewayOrderId,
  });

  assert(euVerify.success === true, 'Europepay session verification passed');
  assert(euVerify.status === 'captured', 'Europepay status normalized to captured');

  // Europepay Webhook HMAC-SHA256 test
  process.env.EUROPEPAY_WEBHOOK_SECRET = 'test_europepay_webhook_secret_key_123';
  const mockEuWebhookBody = JSON.stringify({
    event_id: 'evt_eu_test_' + Date.now(),
    event_type: 'payment.succeeded',
    data: {
      reference: '00000000-0000-0000-0000-000000000002',
      payment_id: euSession.gatewayOrderId,
      amount: 100,
      currency: 'EUR',
      status: 'succeeded',
    },
  });

  const validEuSignature = crypto
    .createHmac('sha256', process.env.EUROPEPAY_WEBHOOK_SECRET)
    .update(mockEuWebhookBody)
    .digest('hex');

  const mockEuReq: any = {
    headers: { 'x-signature': validEuSignature },
    body: JSON.parse(mockEuWebhookBody),
    rawBody: Buffer.from(mockEuWebhookBody),
  };

  const euWebhookResult = await europepayAdapter.verifyWebhook(mockEuReq);
  assert(euWebhookResult.valid === true, 'Europepay webhook HMAC-SHA256 signature verified');
  assert(euWebhookResult.status === 'captured', 'Europepay webhook status mapped to captured');
  assert(euWebhookResult.orderId === '00000000-0000-0000-0000-000000000002', 'Europepay webhook orderId preserved');

  // Test tampered Europepay webhook signature rejection
  const mockTamperedEuReq: any = {
    headers: { 'x-signature': 'tampered_signature_xyz' },
    body: JSON.parse(mockEuWebhookBody),
    rawBody: Buffer.from(mockEuWebhookBody),
  };
  const tamperedEuWebhookResult = await europepayAdapter.verifyWebhook(mockTamperedEuReq);
  assert(tamperedEuWebhookResult.valid === false, 'Europepay webhook correctly rejects tampered signature');

  // -------------------------------------------------------------------------
  // TEST 3: Dynamic Server-Controlled Gateway Switching & Rollback
  // -------------------------------------------------------------------------
  console.log('\n[Phase 3 & 4] Testing Server-Controlled Dynamic Gateway Selection & Switching...');
  PaymentGatewayService.initialize();

  // Switch to Europepay
  const switch1 = await PaymentGatewayService.switchGateway(
    'europepay',
    'Admin switched gateway to Europepay for European customers'
  );
  assert(switch1.activeProvider === 'europepay', 'Active gateway switched to europepay');

  const activeGw1 = await PaymentGatewayService.getActiveGateway();
  assert(activeGw1.name === 'europepay', 'getActiveGateway returns Europepay adapter');

  // Switch back to Razorpay
  const switch2 = await PaymentGatewayService.switchGateway(
    'razorpay',
    'Admin switched back to primary Razorpay gateway'
  );
  assert(switch2.activeProvider === 'razorpay', 'Active gateway switched back to razorpay');

  const activeGw2 = await PaymentGatewayService.getActiveGateway();
  assert(activeGw2.name === 'razorpay', 'getActiveGateway returns Razorpay adapter');

  // -------------------------------------------------------------------------
  // TEST 4: Pending Transaction Preservation during Switch
  // -------------------------------------------------------------------------
  console.log('\n[Phase 4 & 10] Testing Pending Transaction Gateway Preservation...');
  // Even if active provider is Razorpay, an order tagged with Europepay is resolved by EuropepayAdapter
  const pendingEuropepayGateway = PaymentGatewayService.getGateway('europepay');
  assert(pendingEuropepayGateway.name === 'europepay', 'Pending Europepay order routes to Europepay adapter');

  // And an order tagged with Razorpay is resolved by RazorpayAdapter
  const pendingRazorpayGateway = PaymentGatewayService.getGateway('razorpay');
  assert(pendingRazorpayGateway.name === 'razorpay', 'Pending Razorpay order routes to Razorpay adapter');

  // -------------------------------------------------------------------------
  // TEST 5: Admin Overview & Metrics Inspection
  // -------------------------------------------------------------------------
  console.log('\n[Phase 11] Testing Admin Dashboard Overview Data Contract...');
  const overview = await PaymentGatewayService.getGatewayOverview();
  assert(overview.activeProvider === 'razorpay', 'Overview reflects active provider');
  assert(overview.gateways.length === 2, 'Overview lists both Razorpay and Europepay gateways');
  assert(Boolean(overview.metrics), 'Overview provides transaction counts and metrics');

  console.log('\n===============================================================');
  console.log(` SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runDualGatewayTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
