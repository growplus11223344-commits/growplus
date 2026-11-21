import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import crypto from 'crypto';
import { supabaseAdmin } from '../config/supabase';

const API_BASE = 'http://localhost:3001/api/v1';

async function runWalletTopupLiveTest() {
  console.log('================================================================');
  console.log('  GROWPLUS WALLET TOPUP LIVE END-TO-END TEST');
  console.log('================================================================\n');

  // 1. Authenticate QA user
  console.log('[Step 1] Authenticating QA user...');
  const loginRes = await axios.post(`${API_BASE}/auth/login`, {
    email: 'growplus.qa.20261120@example.com',
    password: 'GPqa!eWbgq19A5PV7HY7mGdI',
  });
  const token = loginRes.data.access_token;
  const userId = loginRes.data.user.id;
  const authHeaders = { Authorization: `Bearer ${token}` };
  console.log(`✅ Authenticated QA User (${userId})\n`);

  // 2. Fetch Initial Balance
  console.log('[Step 2] Fetching initial wallet balance...');
  const initialWalletRes = await axios.get(`${API_BASE}/wallet`, { headers: authHeaders });
  const initialBalance = Number(initialWalletRes.data.balance || 0);
  console.log(`✅ Initial Wallet Balance: ₹${initialBalance.toFixed(2)}\n`);

  // 3. Create Topup Order (₹500)
  console.log('[Step 3] Initializing Razorpay top-up order for ₹500...');
  const topupAmount = 500;
  const createOrderRes = await axios.post(
    `${API_BASE}/wallet/create-topup`,
    { amount: topupAmount },
    { headers: authHeaders }
  );
  const { razorpay_order_id, amount: amountPaise, key_id } = createOrderRes.data;
  console.log(`✅ Razorpay Order Created: ${razorpay_order_id}`);
  console.log(`   Amount: ${amountPaise} paise (₹${amountPaise / 100}) | Key ID: ${key_id}\n`);

  // 4. Generate Valid Razorpay Signature
  console.log('[Step 4] Simulating successful payment & generating HMAC SHA-256 signature...');
  const mockPaymentId = `pay_test_${Date.now()}`;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) throw new Error('RAZORPAY_KEY_SECRET missing in environment');

  const validSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpay_order_id}|${mockPaymentId}`)
    .digest('hex');
  console.log(`✅ Generated valid signature for payment ${mockPaymentId}\n`);

  // 5. Verify Topup and credit wallet atomically
  console.log('[Step 5] Calling /api/v1/wallet/verify-topup with verified signature...');
  const verifyRes = await axios.post(
    `${API_BASE}/wallet/verify-topup`,
    {
      razorpay_order_id,
      razorpay_payment_id: mockPaymentId,
      razorpay_signature: validSignature,
      amount: topupAmount,
    },
    { headers: authHeaders }
  );
  console.log(`✅ Server Verification Response:`, verifyRes.data);

  // 6. Verify Updated Balance
  console.log('\n[Step 6] Verifying updated wallet balance in Supabase...');
  const updatedWalletRes = await axios.get(`${API_BASE}/wallet`, { headers: authHeaders });
  const updatedBalance = Number(updatedWalletRes.data.balance);
  const expectedBalance = initialBalance + topupAmount;
  console.log(`   Initial Balance: ₹${initialBalance.toFixed(2)}`);
  console.log(`   Added Credits:   ₹${topupAmount.toFixed(2)}`);
  console.log(`   Updated Balance: ₹${updatedBalance.toFixed(2)}`);

  if (Math.abs(updatedBalance - expectedBalance) > 0.01) {
    throw new Error(`Balance mismatch! Expected ₹${expectedBalance}, got ₹${updatedBalance}`);
  }
  console.log(`✅ Balance verified! Accurately incremented by ₹${topupAmount}.\n`);

  // 7. Verify Transaction History Ledger
  console.log('[Step 7] Checking wallet transaction history ledger...');
  const txRes = await axios.get(`${API_BASE}/wallet/transactions`, { headers: authHeaders });
  const latestTx = txRes.data.transactions[0];
  console.log(`✅ Latest Ledger Record:`, {
    type: latestTx.type,
    amount: latestTx.amount,
    balance_before: latestTx.balance_before,
    balance_after: latestTx.balance_after,
    source: latestTx.source,
    reference_id: latestTx.reference_id,
  });

  // 8. Test Idempotency (replay attack protection)
  console.log('\n[Step 8] Testing replay idempotency with identical verification payload...');
  const replayRes = await axios.post(
    `${API_BASE}/wallet/verify-topup`,
    {
      razorpay_order_id,
      razorpay_payment_id: mockPaymentId,
      razorpay_signature: validSignature,
      amount: topupAmount,
    },
    { headers: authHeaders }
  );
  console.log(`✅ Replay Response:`, replayRes.data);
  if (replayRes.data.status !== 'already_captured') {
    throw new Error('Idempotency failed: Did not report already_captured');
  }

  const postReplayWallet = await axios.get(`${API_BASE}/wallet`, { headers: authHeaders });
  if (Number(postReplayWallet.data.balance) !== updatedBalance) {
    throw new Error('Idempotency failed: Balance was double-credited!');
  }
  console.log(`✅ Double-credit prevention confirmed! Balance remained ₹${updatedBalance.toFixed(2)}.\n`);

  console.log('================================================================');
  console.log('🎉 ALL LIVE WALLET TOPUP INTEGRATION TESTS PASSED!');
  console.log('================================================================');
}

runWalletTopupLiveTest()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Topup test error:', err.response?.data || err.message);
    process.exit(1);
  });
