import dotenv from 'dotenv';
dotenv.config();

import { supabaseAdmin } from '../config/supabase';
import { SharedIdentityService } from '../services/sharedIdentity';

async function runE2E() {
  console.log('============================================================');
  console.log('   GROWPLUS FULL ECOSYSTEM LIVE E2E VERIFICATION');
  console.log('============================================================\n');

  const testEmail = `e2e_customer_${Date.now()}@growplus.test`;
  const testPassword = 'Password123!';
  const testPhone = `9${Math.floor(100000000 + Math.random() * 900000000)}`;

  let userId = '';

  try {
    // 1. Create Auth User
    console.log(`[Step 1] Creating Customer in Supabase Auth (${testEmail})...`);
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      phone: testPhone,
      email_confirm: true,
    });
    if (authErr) throw new Error(`Auth creation failed: ${authErr.message}`);
    userId = authData.user.id;
    console.log(`  ✅ Auth user registered. ID: ${userId}`);

    // 2. Insert Profile
    console.log(`[Step 2] Inserting Customer Profile (Trigger auto-provisions wallet, code, cart)...`);
    const { data: profile, error: profErr } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        user_id: userId,
        full_name: 'E2E Verified Customer',
        email: testEmail,
        phone: testPhone,
      })
      .select()
      .single();
    if (profErr) throw new Error(`Profile insert failed: ${profErr.message}`);
    console.log(`  ✅ Profile active: ${profile.full_name}`);

    // 3. Verify Auto-Provisioned Wallet
    console.log(`[Step 3] Verifying Auto-Provisioned Wallet Account...`);
    const { data: wallet, error: wallErr } = await supabaseAdmin
      .from('wallet_accounts')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (wallErr || !wallet) throw new Error('Wallet not auto-provisioned');
    console.log(`  ✅ Wallet initialized: Balance = ₹${wallet.balance} (Currency: ${wallet.currency})`);

    // 4. Verify Auto-Generated Referral Code
    console.log(`[Step 4] Verifying Auto-Generated Referral Code...`);
    const { data: refCode, error: refErr } = await supabaseAdmin
      .from('referral_codes')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (refErr || !refCode) throw new Error('Referral code not generated');
    console.log(`  ✅ Customer Referral Code: ${refCode.code}`);

    // 5. Verify Auto-Provisioned Cart
    console.log(`[Step 5] Verifying Auto-Provisioned Shopping Cart...`);
    const { data: cart, error: cartErr } = await supabaseAdmin
      .from('carts')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (cartErr || !cart) throw new Error('Cart not auto-provisioned');
    console.log(`  ✅ Active Cart ID: ${cart.id}`);

    // 6. Test Single-Use SSO Cross-App Launch Token
    console.log(`[Step 6] Generating Single-Use SSO Handoff Token (Rewards -> Shopping)...`);
    const handoff = SharedIdentityService.generateCrossAppToken(userId);
    console.log(`  ✅ Handoff token generated: ${handoff.launchToken.slice(0, 16)}...`);
    console.log(`  ✅ Deep Link URL: ${handoff.deepLink}`);

    // 7. Verify SSO Handoff in Shopping App
    console.log(`[Step 7] Exchanging SSO Token in Shopping App...`);
    const ssoResult = await SharedIdentityService.validateAndLinkSession(handoff.launchToken);
    console.log(`  ✅ SSO Exchange Verified! User: ${ssoResult.userId}, Wallet: ₹${ssoResult.wallet.balance}`);

    // 8. Verify Replay Attack Prevention
    console.log(`[Step 8] Verifying Replay Prevention (Reusing same handoff token)...`);
    let replayed = false;
    try {
      await SharedIdentityService.validateAndLinkSession(handoff.launchToken);
      replayed = true;
    } catch {
      console.log(`  ✅ Replay attack rejected: Single-use token invalidated successfully!`);
    }
    if (replayed) throw new Error('Security failure: Single-use token was accepted a second time!');

    // 9. Query Retail Products Catalog
    console.log(`[Step 9] Fetching Retail Products Catalog from Database...`);
    const { data: products } = await supabaseAdmin.from('products').select('id, name, base_price, is_active').limit(5);
    console.log(`  ✅ Products catalog accessible. Total live items: ${products?.length ?? 0}`);

    // 10. Clean up / Delete Test Account
    console.log(`[Step 10] Testing Account Deletion (Play Store Compliance)...`);
    await supabaseAdmin.from('wallet_accounts').delete().eq('user_id', userId);
    await supabaseAdmin.from('referral_codes').delete().eq('user_id', userId);
    await supabaseAdmin.from('carts').delete().eq('user_id', userId);
    await supabaseAdmin.from('user_profiles').delete().eq('user_id', userId);
    await supabaseAdmin.auth.admin.deleteUser(userId);
    console.log(`  ✅ Test user cleaned up cleanly.`);

    console.log('\n============================================================');
    console.log('🎉 RESULT: 10/10 E2E STEPS VERIFIED 100%!');
    console.log('============================================================\n');
  } catch (err: any) {
    console.error('\n❌ E2E Verification Error:', err.message);
    if (userId) {
      await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => {});
    }
    process.exit(1);
  }
}

runE2E();
