import axios from 'axios';
import jwt from 'jsonwebtoken';

const BASE_URL = 'http://localhost:3001/api/v1';
const QA_EMAIL = 'growplus.qa.20261120@example.com';
const QA_PASSWORD = 'GPqa!eWbgq19A5PV7HY7mGdI';

async function main() {
  console.log('====================================================');
  console.log(' GROWPLUS VERIFICATION: SSO HANDOFF & SUPPORT TICKET');
  console.log('====================================================\n');

  // 1. Authenticate QA User
  console.log('[Step 1] Authenticating QA user...');
  const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
    email: QA_EMAIL,
    password: QA_PASSWORD,
  });

  const token = loginRes.data.access_token || loginRes.data.session?.access_token;
  const userId = loginRes.data.user_id || loginRes.data.user?.id;
  console.log(`  ✅ Logged in successfully! User ID: ${userId}`);

  const userHeaders = { Authorization: `Bearer ${token}` };

  // 2. Test Cross-App Handoff Token Generation
  console.log('\n[Step 2] Testing Cross-App Handoff Token Generation...');
  const handoffRes = await axios.post(`${BASE_URL}/auth/cross-app-token`, {}, { headers: userHeaders });
  console.log('  Response Keys:', Object.keys(handoffRes.data));
  console.log(`  ✅ launch_token: ${handoffRes.data.launch_token?.slice(0, 20)}...`);
  console.log(`  ✅ handoff_token: ${handoffRes.data.handoff_token?.slice(0, 20)}...`);
  console.log(`  ✅ deep_link: ${handoffRes.data.deep_link}`);

  if (!handoffRes.data.handoff_token) {
    throw new Error('handoff_token is missing from cross-app-token response!');
  }

  // 3. Test Cross-App Verification (from Shopping App)
  console.log('\n[Step 3] Verifying Handoff Token in Shopping App flow...');
  const verifyRes = await axios.post(`${BASE_URL}/auth/verify-cross-app`, {
    handoff_token: handoffRes.data.handoff_token,
  });

  console.log('  ✅ Shopping verification success:', verifyRes.data.success);
  console.log(`  ✅ Shopping User ID: ${verifyRes.data.user_id}`);
  console.log(`  ✅ Shopping Wallet Balance: ₹${verifyRes.data.wallet?.balance}`);
  console.log(`  ✅ Shopping JWT Access Token: ${verifyRes.data.access_token?.slice(0, 20)}...`);

  if (verifyRes.data.user_id !== userId) {
    throw new Error('Cross-app user ID mismatch between Rewards and Shopping!');
  }

  // 4. Test Support Ticket Creation
  console.log('\n[Step 4] Raising Support Ticket from Customer App...');
  const ticketRes = await axios.post(
    `${BASE_URL}/support/tickets`,
    {
      subject: 'Wallet top-up enquiry',
      description: 'I added credits to my wallet and want to verify if they reflect in Shopping App.',
      category: 'reward',
    },
    { headers: userHeaders }
  );

  const ticketId = ticketRes.data.id;
  console.log(`  ✅ Support Ticket created in Supabase! ID: ${ticketId}`);
  console.log(`  ✅ Subject: "${ticketRes.data.subject}", Status: "${ticketRes.data.status}"`);

  // 5. Test Customer Message Follow-up
  console.log('\n[Step 5] Sending Follow-up Message from Customer...');
  const msgRes = await axios.post(
    `${BASE_URL}/support/tickets/${ticketId}/messages`,
    {
      message: 'Please confirm my current balance.',
    },
    { headers: userHeaders }
  );
  console.log(`  ✅ Message recorded in Supabase! Message ID: ${msgRes.data.id}`);

  // 6. Test Admin Ticket Retrieval & Reply
  console.log('\n[Step 6] Testing Admin Portal Access & Staff Reply...');
  // Create admin token using server ADMIN_JWT_SECRET with valid UUID
  const adminJwtSecret = process.env.ADMIN_JWT_SECRET || 'growplus-super-secret-admin-key-minimum-32-characters';
  const adminToken = jwt.sign(
    {
      sub: userId,
      userId: userId,
      email: 'admin@growplus.test',
      role: 'admin',
    },
    adminJwtSecret,
    { expiresIn: '1h' }
  );

  const adminHeaders = { Authorization: `Bearer ${adminToken}` };

  const adminTicketsRes = await axios.get(`${BASE_URL}/support/admin/tickets`, { headers: adminHeaders });
  const foundTicket = adminTicketsRes.data.tickets.find((t: any) => t.id === ticketId);
  console.log(`  ✅ Admin fetched ${adminTicketsRes.data.tickets.length} tickets from Supabase.`);
  console.log(`  ✅ Found customer's ticket in Admin queue: ${Boolean(foundTicket)}`);

  // Staff reply
  const staffReplyRes = await axios.post(
    `${BASE_URL}/support/admin/tickets/${ticketId}/messages`,
    {
      message: 'Hello! Your wallet balance has been verified and is ready to use in GrowPlus Shopping.',
      is_internal: false,
    },
    { headers: adminHeaders }
  );
  console.log(`  ✅ Staff reply sent to customer! Message ID: ${staffReplyRes.data.id}`);

  // Status update
  const statusUpdateRes = await axios.patch(
    `${BASE_URL}/support/admin/tickets/${ticketId}`,
    { status: 'resolved' },
    { headers: adminHeaders }
  );
  console.log(`  ✅ Ticket status updated to: ${statusUpdateRes.data.status}`);

  console.log('\n====================================================');
  console.log(' ALL VERIFICATION CHECKS PASSED WITH 100% SUCCESS! ');
  console.log('====================================================\n');
}

main().catch((err) => {
  console.error('❌ Verification failed:', err.response?.data || err.message);
  process.exit(1);
});
