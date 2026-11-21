# Supabase Database Migration & Verification Guide

This guide provides instructions to execute, verify, and validate the 23-table relational schema, storage permissions, and atomic stored procedures for GROWPLUS.

---

## 1. Migration Execution Order

Execute the SQL files in this exact order:

1. **`001_initial_schema.sql`**
   - Enables `uuid-ossp` and `pgcrypto` extensions.
   - Creates all 23 core production tables.
   - Adds foreign key constraints, unique constraints, and check constraints.
   - Adds performance B-tree indexes for fast lookups.
   - Enables Row Level Security (RLS) on all tables with customer/staff isolation policies.
   - Creates `trigger_set_updated_at` and auto-provisioning triggers (`on_user_profile_created`).

2. **`002_storage_and_functions.sql`**
   - Configures `storage.buckets` (`products` with 5MB limit, `avatars` with 2MB limit).
   - Configures `storage.objects` RLS policies (public read, authenticated staff write).
   - Installs atomic stored procedure `execute_atomic_wallet_debit` (with `FOR UPDATE` row lock & idempotency check).
   - Installs atomic stored procedure `execute_atomic_reward_credit` (with `FOR UPDATE` row lock & referral update).

3. **`seed.sql`**
   - Inserts the default RBAC roles into `staff_roles`: `owner`, `admin`, `product_manager`, `order_manager`, `support`.
   - Inserts root retail product categories: `Electronics`, `Clothing`, `Health & Beauty`, `Home & Kitchen`, `Sports`.

---

## 2. Execution Methods

### Option A: Via Supabase Web Dashboard
1. Log into your project at [app.supabase.com](https://app.supabase.com).
2. Go to **SQL Editor** in the left sidebar.
3. Click **New Query**.
4. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql` and click **Run**.
5. Copy and paste the contents of `supabase/migrations/002_storage_and_functions.sql` and click **Run**.
6. Copy and paste the contents of `supabase/seed.sql` and click **Run**.

### Option B: Via Supabase CLI (Local Dev or Automated CI/CD)
```bash
# Link your project (one-time)
supabase link --project-ref your-project-ref

# Apply all migrations
supabase db push

# Or apply manually via psql
psql -h db.your-project.supabase.co -U postgres -d postgres -f supabase/migrations/001_initial_schema.sql
psql -h db.your-project.supabase.co -U postgres -d postgres -f supabase/migrations/002_storage_and_functions.sql
psql -h db.your-project.supabase.co -U postgres -d postgres -f supabase/seed.sql
```

---

## 3. Post-Migration Verification Queries

Run the following SQL queries in the Supabase SQL editor to confirm the schema is completely deployed:

### A. Verify All 23 Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```
*Expected: 23 tables listed.*

### B. Verify Row Level Security (RLS) is Active on All Tables
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = false;
```
*Expected output: 0 rows (all public tables must have `rowsecurity = true`).*

### C. Verify Storage Buckets
```sql
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets;
```
*Expected output: `products` (public=true) and `avatars` (public=true).*

### D. Verify Atomic Stored Procedures Exist
```sql
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('execute_atomic_wallet_debit', 'execute_atomic_reward_credit');
```
*Expected output: 2 rows.*

---

## 4. Wallet Integrity & Append-Only Guarantees

- **No Overwrite Policy:** The `wallet_transactions` table has NO `UPDATE` or `DELETE` policies for clients.
- **Atomic Balance Mutex:** Checkouts applying store credits call `execute_atomic_wallet_debit`, which acquires an exclusive row lock (`SELECT ... FOR UPDATE`) on the user's `wallet_accounts` record, preventing race conditions or double spending.
- **Idempotency Keys:** Every wallet debit or credit checks `idempotency_key = p_idempotency_key` before modifying balances, ensuring duplicate HTTP requests cannot result in multiple debits or payouts.
