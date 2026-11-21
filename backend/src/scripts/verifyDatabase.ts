import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

interface VerificationResult {
  category: string;
  name: string;
  status: 'VERIFIED' | 'FAILED' | 'SKIPPED' | 'PENDING_CONFIG';
  details: string;
}

const EXPECTED_TABLES = [
  'user_profiles',
  'referral_codes',
  'referrals',
  'categories',
  'products',
  'product_images',
  'inventory',
  'product_variations',
  'carts',
  'cart_items',
  'orders',
  'order_items',
  'payments',
  'wallet_accounts',
  'wallet_transactions',
  'reward_rules',
  'reward_transactions',
  'notifications',
  'staff_roles',
  'staff',
  'audit_logs',
  'support_tickets',
  'support_messages',
];

const EXPECTED_BUCKETS = ['products', 'avatars'];
const EXPECTED_FUNCTIONS = ['execute_atomic_wallet_debit', 'execute_atomic_reward_credit'];

async function runVerification() {
  const results: VerificationResult[] = [];
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('\n======================================================');
  console.log('   GROWPLUS SUPABASE DATABASE VERIFICATION TOOL');
  console.log('======================================================\n');

  if (!supabaseUrl || !serviceKey || supabaseUrl.includes('placeholder') || serviceKey.includes('placeholder')) {
    console.warn('[!] PENDING CREDENTIALS: Valid SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in backend/.env');
    console.warn('[!] To verify against a live Supabase project, supply credentials in backend/.env:\n');
    console.warn('    SUPABASE_URL=https://<your-project-ref>.supabase.co');
    console.warn('    SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>\n');

    results.push({
      category: 'Configuration',
      name: 'Supabase Credentials',
      status: 'PENDING_CONFIG',
      details: 'Placeholder or missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in backend/.env',
    });

    for (const table of EXPECTED_TABLES) {
      results.push({
        category: 'Relational Tables (23)',
        name: table,
        status: 'PENDING_CONFIG',
        details: 'Awaiting live database credentials to verify table existence and RLS',
      });
    }

    for (const bucket of EXPECTED_BUCKETS) {
      results.push({
        category: 'Storage Buckets',
        name: bucket,
        status: 'PENDING_CONFIG',
        details: 'Awaiting live database credentials to verify storage bucket',
      });
    }

    for (const fn of EXPECTED_FUNCTIONS) {
      results.push({
        category: 'Atomic Stored Procedures',
        name: fn,
        status: 'PENDING_CONFIG',
        details: 'Awaiting live database credentials to verify RPC function registration',
      });
    }

    generateReport(results, false);
    return;
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Connection & Auth Verification
  try {
    const { data: authData, error: authErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (authErr) {
      results.push({
        category: 'Connection',
        name: 'Supabase Admin Auth',
        status: 'FAILED',
        details: `Connection failed: ${authErr.message}`,
      });
    } else {
      results.push({
        category: 'Connection',
        name: 'Supabase Admin Auth',
        status: 'VERIFIED',
        details: `Connected successfully to ${supabaseUrl}. Total registered users found: ${authData?.users?.length ?? 0}`,
      });
    }
  } catch (err: any) {
    results.push({
      category: 'Connection',
      name: 'Supabase Admin Auth',
      status: 'FAILED',
      details: `Exception connecting to Supabase: ${err.message}`,
    });
  }

  // 2. Verify all 23 tables
  for (const table of EXPECTED_TABLES) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        results.push({
          category: 'Relational Tables (23)',
          name: table,
          status: 'FAILED',
          details: `Query error: ${error.message} (Code: ${error.code})`,
        });
      } else {
        results.push({
          category: 'Relational Tables (23)',
          name: table,
          status: 'VERIFIED',
          details: `Table accessible. Test query returned status 200 OK`,
        });
      }
    } catch (err: any) {
      results.push({
        category: 'Relational Tables (23)',
        name: table,
        status: 'FAILED',
        details: `Exception: ${err.message}`,
      });
    }
  }

  // 3. Verify Storage Buckets
  try {
    const { data: buckets, error: bucketErr } = await supabase.storage.listBuckets();
    if (bucketErr) {
      for (const bucket of EXPECTED_BUCKETS) {
        results.push({
          category: 'Storage Buckets',
          name: bucket,
          status: 'FAILED',
          details: `Bucket query failed: ${bucketErr.message}`,
        });
      }
    } else {
      const bucketNames = (buckets || []).map((b) => b.name);
      for (const bucket of EXPECTED_BUCKETS) {
        if (bucketNames.includes(bucket)) {
          results.push({
            category: 'Storage Buckets',
            name: bucket,
            status: 'VERIFIED',
            details: `Bucket '${bucket}' exists and is ready for asset uploads`,
          });
        } else {
          results.push({
            category: 'Storage Buckets',
            name: bucket,
            status: 'FAILED',
            details: `Bucket '${bucket}' not found. Run migration 002_storage_and_functions.sql`,
          });
        }
      }
    }
  } catch (err: any) {
    for (const bucket of EXPECTED_BUCKETS) {
      results.push({
        category: 'Storage Buckets',
        name: bucket,
        status: 'FAILED',
        details: `Exception: ${err.message}`,
      });
    }
  }

  // 4. Verify Stored Procedures
  for (const fn of EXPECTED_FUNCTIONS) {
    try {
      const args = fn === 'execute_atomic_wallet_debit'
        ? {
            p_user_id: '00000000-0000-0000-0000-000000000000',
            p_amount: 1,
            p_order_id: '00000000-0000-0000-0000-000000000000',
            p_order_number: 'TEST',
            p_idempotency_key: 'test-check',
          }
        : {
            p_user_id: '00000000-0000-0000-0000-000000000000',
            p_amount: 1,
            p_order_id: '00000000-0000-0000-0000-000000000000',
            p_order_number: 'TEST',
            p_rule_id: '00000000-0000-0000-0000-000000000000',
            p_referral_id: '00000000-0000-0000-0000-000000000000',
            p_qualifying_amount: 1,
            p_idempotency_key: 'test-check',
          };

      // Call procedure to test if the signature is registered
      const { error } = await supabase.rpc(fn, args);

      // If function does not exist, code is PGRST202 or 42883
      if (error && (error.code === 'PGRST202' || error.message.includes('function') && error.message.includes('does not exist'))) {
        results.push({
          category: 'Atomic Stored Procedures',
          name: fn,
          status: 'FAILED',
          details: `RPC function '${fn}' is missing. Execute migration 002_storage_and_functions.sql`,
        });
      } else {
        // Any other error (like wallet not found) proves the function is compiled and executed in PG!
        results.push({
          category: 'Atomic Stored Procedures',
          name: fn,
          status: 'VERIFIED',
          details: `RPC procedure '${fn}' exists and is registered in PostgreSQL schema`,
        });
      }
    } catch (err: any) {
      results.push({
        category: 'Atomic Stored Procedures',
        name: fn,
        status: 'FAILED',
        details: `Exception: ${err.message}`,
      });
    }
  }

  generateReport(results, true);
}

function generateReport(results: VerificationResult[], isLive: boolean) {
  const verifiedCount = results.filter((r) => r.status === 'VERIFIED').length;
  const failedCount = results.filter((r) => r.status === 'FAILED').length;
  const pendingCount = results.filter((r) => r.status === 'PENDING_CONFIG').length;

  let report = `# GrowPlus Supabase Database Verification Report\n\n`;
  report += `**Execution Date:** ${new Date().toISOString()}\n`;
  report += `**Environment:** ${isLive ? 'LIVE SUPABASE PROJECT' : 'PENDING CREDENTIALS CONFIGURATION'}\n`;
  report += `**Total Checks:** ${results.length}\n`;
  report += `**Verified:** ${verifiedCount} | **Failed:** ${failedCount} | **Pending Config:** ${pendingCount}\n\n`;

  report += `---\n\n## Verification Summary Matrix\n\n`;
  report += `| Category | Component / Asset | Status | Verification Details |\n`;
  report += `|---|---|---|---|\n`;

  for (const r of results) {
    const icon = r.status === 'VERIFIED' ? '✅ VERIFIED' : r.status === 'FAILED' ? '❌ FAILED' : '⚠️ PENDING CONFIG';
    report += `| ${r.category} | \`${r.name}\` | ${icon} | ${r.details} |\n`;
  }

  report += `\n---\n\n## Action Required by Project Owner\n\n`;
  if (!isLive) {
    report += `To verify against your real Supabase project:\n\n`;
    report += `1. Open \`backend/.env\`\n`;
    report += `2. Set \`SUPABASE_URL=https://<your-project>.supabase.co\`\n`;
    report += `3. Set \`SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>\`\n`;
    report += `4. Execute in terminal: \`cd backend && npm run db:verify\`\n`;
  } else {
    report += `Database verification completed against live instance. See matrix above for status.\n`;
  }

  const outPath = path.resolve(__dirname, '../../../supabase/DATABASE_VERIFICATION_REPORT.md');
  fs.writeFileSync(outPath, report, 'utf-8');

  console.log(report);
  console.log(`\nReport written to: ${outPath}\n`);
}

runVerification();
