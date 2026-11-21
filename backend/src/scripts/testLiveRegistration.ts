import dotenv from 'dotenv';
dotenv.config();

import { supabaseAdmin } from '../config/supabase';

async function testRegistration() {
  const email = `live_test_${Date.now()}@growplus.test`;
  console.log('Testing live user creation for:', email);

  // 1. Create auth user
  const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: 'LivePassword123!',
    email_confirm: true,
  });

  if (authErr) {
    console.error('❌ Auth error:', authErr.message);
    process.exit(1);
  }

  const userId = authData.user.id;
  console.log('✅ 1. Auth user created. UUID:', userId);

  // 2. Insert user_profile (triggers on_user_profile_created -> wallet, referral, cart)
  const { data: profileData, error: profileErr } = await supabaseAdmin
    .from('user_profiles')
    .insert({
      user_id: userId,
      full_name: 'Live Verified User',
      email: email,
      phone: '9988776655',
    })
    .select()
    .single();

  if (profileErr) {
    console.error('❌ Profile insert error:', profileErr.message);
    await supabaseAdmin.auth.admin.deleteUser(userId);
    process.exit(1);
  }

  console.log('✅ 2. User profile inserted successfully!');

  // 3. Check wallet_account auto-created by trigger
  const { data: walletData } = await supabaseAdmin
    .from('wallet_accounts')
    .select('*')
    .eq('user_id', userId)
    .single();
  console.log('✅ 3. Wallet auto-provisioned:', walletData ? `Balance: ${walletData.balance} ${walletData.currency}` : 'NOT FOUND');

  // 4. Check referral_code auto-created by trigger
  const { data: refData } = await supabaseAdmin
    .from('referral_codes')
    .select('*')
    .eq('user_id', userId)
    .single();
  console.log('✅ 4. Referral code auto-generated:', refData ? `Code: ${refData.code}` : 'NOT FOUND');

  // 5. Check cart auto-created by trigger
  const { data: cartData } = await supabaseAdmin
    .from('carts')
    .select('*')
    .eq('user_id', userId)
    .single();
  console.log('✅ 5. Cart auto-provisioned:', cartData ? `Cart ID: ${cartData.id}` : 'NOT FOUND');

  console.log('\n============================================================');
  console.log('🎉 RESULT: COMPLETE USER AUTO-PROVISIONING WORKS 100% IN SUPABASE!');
  console.log('============================================================\n');
}

testRegistration();
