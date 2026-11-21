import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('[!] Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function provisionAdministrator() {
  console.log('\n======================================================');
  console.log('   GROWPLUS AUTHORIZED ADMIN & INVENTORY PROVISIONING');
  console.log('======================================================\n');

  const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@growplus.internal';
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'GrowPlusAdmin!2026#Secure';
  const adminName = 'GrowPlus System Administrator';

  console.log(`[1/4] Checking existing staff records in public.staff...`);
  const { data: existingStaff, error: staffFetchErr } = await supabase
    .from('staff')
    .select('*')
    .eq('role', 'owner');

  if (staffFetchErr) {
    console.error('[!] Failed to query staff table:', staffFetchErr.message);
    process.exit(1);
  }

  let adminUserId: string | null = null;

  // Check if admin user already exists in auth.users
  const { data: userList } = await supabase.auth.admin.listUsers();
  const existingUser = userList?.users?.find(u => u.email?.toLowerCase() === adminEmail.toLowerCase());

  if (existingUser) {
    adminUserId = existingUser.id;
    console.log(`[✓] Existing Auth account found for ${adminEmail} (UUID: ${adminUserId})`);
    // Update password if needed to ensure access
    await supabase.auth.admin.updateUserById(adminUserId, {
      password: adminPassword,
      email_confirm: true,
    });
  } else {
    console.log(`[+] Creating new Auth account for ${adminEmail}...`);
    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { full_name: adminName, is_staff: true },
    });

    if (createErr || !newUser.user) {
      console.error('[!] Failed to create admin user:', createErr?.message);
      process.exit(1);
    }
    adminUserId = newUser.user.id;
    console.log(`[✓] Created Auth account: ${adminUserId}`);
  }

  // 2. Ensure profile exists in user_profiles
  console.log(`[2/4] Ensuring public.user_profiles record...`);
  const { error: profileErr } = await supabase
    .from('user_profiles')
    .upsert({
      user_id: adminUserId,
      email: adminEmail,
      full_name: adminName,
      is_active: true,
      is_verified: true,
      metadata: { role: 'owner', is_staff: true },
    }, { onConflict: 'user_id' });

  if (profileErr) {
    console.warn('[!] Profile upsert notice:', profileErr.message);
  } else {
    console.log(`[✓] user_profiles record verified`);
  }

  // 3. Ensure staff record in public.staff
  console.log(`[3/4] Registering staff record in public.staff...`);
  const { data: staffRecord, error: staffErr } = await supabase
    .from('staff')
    .upsert({
      user_id: adminUserId,
      email: adminEmail,
      full_name: adminName,
      role: 'owner',
      is_active: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    .select()
    .single();

  if (staffErr) {
    console.error('[!] Failed to upsert staff record:', staffErr.message);
    process.exit(1);
  }
  console.log(`[✓] Authorized Staff Registered:`, {
    id: staffRecord.id,
    user_id: staffRecord.user_id,
    email: staffRecord.email,
    role: staffRecord.role,
    is_active: staffRecord.is_active,
  });

  // 4. Verify and configure initial inventory stock for unconfigured active products
  console.log(`[4/4] Auditing catalog inventory stock...`);
  const { data: activeProducts } = await supabase
    .from('products')
    .select('id, name, sku, status')
    .eq('status', 'active');

  if (activeProducts && activeProducts.length > 0) {
    for (const prod of activeProducts) {
      const { data: inv } = await supabase
        .from('inventory')
        .select('*')
        .eq('product_id', prod.id)
        .single();

      if (!inv) {
        const initialStock = 50;
        await supabase.from('inventory').insert({
          product_id: prod.id,
          quantity: initialStock,
          reserved_quantity: 0,
          low_stock_threshold: 10,
          reorder_point: 20,
        });
        console.log(`[+] Initialized inventory for "${prod.name}" (${prod.sku}): ${initialStock} units in stock`);
      } else {
        console.log(`[✓] Product "${prod.name}" already has inventory record: ${inv.quantity} units`);
      }
    }
  }

  console.log('\n======================================================');
  console.log('   PROVISIONING COMPLETED SUCCESSFULLY');
  console.log('======================================================');
  console.log(`Admin Portal: http://localhost:3000/login`);
  console.log(`Email:        ${adminEmail}`);
  console.log(`Password:     ${adminPassword}`);
  console.log(`Role:         owner (Full System Access)`);
  console.log('======================================================\n');
}

provisionAdministrator().catch(console.error);
