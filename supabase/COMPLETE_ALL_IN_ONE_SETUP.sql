-- =============================================================================
-- GROWPLUS PRODUCTION DATABASE: COMPLETE ALL-IN-ONE SETUP SCRIPT
-- =============================================================================
-- This single script sets up everything in one execution:
--   1. Extensions (uuid-ossp, pgcrypto)
--   2. All 23 Relational Tables with Constraints & Performance B-Tree Indexes
--   3. Row Level Security (RLS) Policies on all 23 tables
--   4. Automatic User Provisioning Triggers (Wallet, Referral Code, Cart)
--   5. Storage Buckets ('products', 'avatars') & Storage Access Policies
--   6. Atomic Ledger Functions (execute_atomic_wallet_debit, execute_atomic_reward_credit)
--   7. Seed Data (Default Staff Roles, Categories, Reward Rules)
-- =============================================================================

-- ============================================================
-- GrowPlus Initial Schema Migration
-- Migration: 001_initial_schema.sql
-- Created: 2026-11-19
-- Tables: 23
-- ============================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLE 1: user_profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    avatar_url TEXT,
    address JSONB,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_phone ON user_profiles(phone);

-- ============================================================
-- TABLE 2: referral_codes
-- ============================================================
CREATE TABLE IF NOT EXISTS referral_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    total_referrals INTEGER NOT NULL DEFAULT 0,
    successful_referrals INTEGER NOT NULL DEFAULT 0,
    total_credits_earned NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_referral_codes_user_id ON referral_codes(user_id);
CREATE INDEX idx_referral_codes_code ON referral_codes(code);

-- ============================================================
-- TABLE 3: referrals
-- ============================================================
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_code TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'qualified', 'rewarded', 'expired', 'cancelled')),
    qualified_at TIMESTAMPTZ,
    rewarded_at TIMESTAMPTZ,
    referrer_credit_amount NUMERIC(12, 2),
    referred_credit_amount NUMERIC(12, 2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(referrer_id, referred_id)
);

CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX idx_referrals_status ON referrals(status);

-- ============================================================
-- TABLE 4: categories
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_is_active ON categories(is_active);

-- ============================================================
-- TABLE 5: products
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    short_description TEXT,
    sku TEXT UNIQUE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    selling_price NUMERIC(12, 2) NOT NULL CHECK (selling_price >= 0),
    mrp NUMERIC(12, 2) CHECK (mrp >= 0),
    cost_price NUMERIC(12, 2) CHECK (cost_price >= 0),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived', 'out_of_stock')),
    is_eligible_for_rewards BOOLEAN NOT NULL DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    weight_grams INTEGER,
    dimensions JSONB,
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_is_eligible_for_rewards ON products(is_eligible_for_rewards);
CREATE INDEX idx_products_name_search ON products USING gin(to_tsvector('english', name));

-- ============================================================
-- TABLE 6: product_images
-- ============================================================
CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt_text TEXT,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_is_primary ON product_images(product_id, is_primary);

-- ============================================================
-- TABLE 7: inventory
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    reserved_quantity INTEGER NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
    low_stock_threshold INTEGER NOT NULL DEFAULT 10,
    reorder_point INTEGER NOT NULL DEFAULT 20,
    track_inventory BOOLEAN NOT NULL DEFAULT TRUE,
    allow_backorder BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inventory_product_id ON inventory(product_id);
CREATE INDEX idx_inventory_quantity ON inventory(quantity);

-- ============================================================
-- TABLE 8: product_variations
-- ============================================================
CREATE TABLE IF NOT EXISTS product_variations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku TEXT UNIQUE,
    name TEXT NOT NULL,
    attributes JSONB NOT NULL DEFAULT '{}',
    selling_price NUMERIC(12, 2),
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_variations_product_id ON product_variations(product_id);

-- ============================================================
-- TABLE 9: carts
-- ============================================================
CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_carts_user_id ON carts(user_id);

-- ============================================================
-- TABLE 10: cart_items
-- ============================================================
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variation_id UUID REFERENCES product_variations(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(cart_id, product_id, variation_id)
);

CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);

-- ============================================================
-- TABLE 11: orders
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partially_refunded')),
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    shipping_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    credits_applied NUMERIC(12, 2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    notes TEXT,
    admin_notes TEXT,
    tracking_number TEXT,
    shipping_carrier TEXT,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    idempotency_key UUID UNIQUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_idempotency_key ON orders(idempotency_key);

-- ============================================================
-- TABLE 12: order_items
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    variation_id UUID REFERENCES product_variations(id) ON DELETE RESTRICT,
    product_name TEXT NOT NULL,
    product_sku TEXT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    total_price NUMERIC(12, 2) NOT NULL CHECK (total_price >= 0),
    is_eligible_for_rewards BOOLEAN NOT NULL DEFAULT FALSE,
    reward_credits_earned NUMERIC(12, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- ============================================================
-- TABLE 13: payments
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    gateway_order_id TEXT,
    gateway_payment_id TEXT,
    gateway_signature TEXT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'attempted', 'captured', 'failed', 'refunded', 'partially_refunded')),
    refund_id TEXT,
    refund_amount NUMERIC(12, 2),
    refunded_at TIMESTAMPTZ,
    webhook_id TEXT UNIQUE,
    webhook_processed_at TIMESTAMPTZ,
    failure_reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_gateway_order_id ON payments(gateway_order_id);
CREATE INDEX idx_payments_gateway_payment_id ON payments(gateway_payment_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================================
-- TABLE 14: wallet_accounts
-- ============================================================
CREATE TABLE IF NOT EXISTS wallet_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    balance NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
    pending_balance NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (pending_balance >= 0),
    lifetime_earned NUMERIC(12, 2) NOT NULL DEFAULT 0,
    lifetime_spent NUMERIC(12, 2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'INR',
    is_frozen BOOLEAN NOT NULL DEFAULT FALSE,
    freeze_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wallet_accounts_user_id ON wallet_accounts(user_id);

-- ============================================================
-- TABLE 15: wallet_transactions
-- ============================================================
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES wallet_accounts(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    balance_before NUMERIC(12, 2) NOT NULL,
    balance_after NUMERIC(12, 2) NOT NULL,
    source TEXT NOT NULL CHECK (source IN ('order_payment', 'reward_earned', 'referral_bonus', 'refund', 'admin_credit', 'admin_debit', 'expiry')),
    reference_id UUID,
    reference_type TEXT,
    description TEXT,
    idempotency_key TEXT UNIQUE,
    expires_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_type ON wallet_transactions(type);
CREATE INDEX idx_wallet_transactions_source ON wallet_transactions(source);
CREATE INDEX idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);

-- ============================================================
-- TABLE 16: reward_rules
-- ============================================================
CREATE TABLE IF NOT EXISTS reward_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    trigger_event TEXT NOT NULL CHECK (trigger_event IN ('order_delivered', 'first_order', 'referral_qualified', 'custom')),
    reward_type TEXT NOT NULL CHECK (reward_type IN ('percentage', 'fixed_amount', 'multiplier')),
    reward_value NUMERIC(10, 4) NOT NULL CHECK (reward_value > 0),
    max_reward_per_transaction NUMERIC(12, 2),
    min_order_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    applies_to_eligible_products_only BOOLEAN NOT NULL DEFAULT TRUE,
    credit_validity_days INTEGER NOT NULL DEFAULT 365,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    priority INTEGER NOT NULL DEFAULT 0,
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reward_rules_is_active ON reward_rules(is_active);
CREATE INDEX idx_reward_rules_trigger_event ON reward_rules(trigger_event);

-- ============================================================
-- TABLE 17: reward_transactions
-- ============================================================
CREATE TABLE IF NOT EXISTS reward_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    rule_id UUID REFERENCES reward_rules(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('earned', 'converted', 'expired', 'cancelled')),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    description TEXT,
    expires_at TIMESTAMPTZ,
    converted_to_wallet_at TIMESTAMPTZ,
    wallet_transaction_id UUID REFERENCES wallet_transactions(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reward_transactions_user_id ON reward_transactions(user_id);
CREATE INDEX idx_reward_transactions_order_id ON reward_transactions(order_id);
CREATE INDEX idx_reward_transactions_type ON reward_transactions(type);

-- ============================================================
-- TABLE 18: notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('order_update', 'payment', 'reward', 'referral', 'wallet', 'promotion', 'system', 'support')),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    action_url TEXT,
    image_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    is_pushed BOOLEAN NOT NULL DEFAULT FALSE,
    pushed_at TIMESTAMPTZ,
    reference_id UUID,
    reference_type TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================================
-- TABLE 19: staff_roles
-- ============================================================
CREATE TABLE IF NOT EXISTS staff_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    permissions JSONB NOT NULL DEFAULT '[]',
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE 20: staff
-- ============================================================
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL REFERENCES staff_roles(name),
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    invited_by UUID REFERENCES auth.users(id),
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_staff_user_id ON staff(user_id);
CREATE INDEX idx_staff_role ON staff(role);
CREATE INDEX idx_staff_is_active ON staff(is_active);

-- ============================================================
-- TABLE 21: audit_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES auth.users(id),
    actor_role TEXT,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    old_value JSONB,
    new_value JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================================
-- TABLE 22: support_tickets
-- ============================================================
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    ticket_number TEXT NOT NULL UNIQUE,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('order', 'payment', 'product', 'account', 'reward', 'other')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_for_customer', 'resolved', 'closed')),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    assigned_to UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at DESC);

-- ============================================================
-- TABLE 23: support_messages
-- ============================================================
CREATE TABLE IF NOT EXISTS support_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id),
    sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'staff')),
    message TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    is_internal BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_support_messages_ticket_id ON support_messages(ticket_id);
CREATE INDEX idx_support_messages_created_at ON support_messages(created_at);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- user_profiles: users can read/update own profile
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- referral_codes: users can view own code
DROP POLICY IF EXISTS "Users can view own referral code" ON referral_codes;
CREATE POLICY "Users can view own referral code" ON referral_codes
    FOR SELECT USING (auth.uid() = user_id);

-- referrals: users can view referrals where they are referrer
DROP POLICY IF EXISTS "Users can view own referrals" ON referrals;
CREATE POLICY "Users can view own referrals" ON referrals
    FOR SELECT USING (auth.uid() = referrer_id);

-- categories: public read
DROP POLICY IF EXISTS "Categories are publicly readable" ON categories;
CREATE POLICY "Categories are publicly readable" ON categories
    FOR SELECT USING (is_active = TRUE);

-- products: public read for active products
DROP POLICY IF EXISTS "Active products are publicly readable" ON products;
CREATE POLICY "Active products are publicly readable" ON products
    FOR SELECT USING (status = 'active');

-- product_images: public read
DROP POLICY IF EXISTS "Product images are publicly readable" ON product_images;
CREATE POLICY "Product images are publicly readable" ON product_images
    FOR SELECT USING (TRUE);

-- inventory: public read (stock levels visible)
DROP POLICY IF EXISTS "Inventory is publicly readable" ON inventory;
CREATE POLICY "Inventory is publicly readable" ON inventory
    FOR SELECT USING (TRUE);

-- product_variations: public read
DROP POLICY IF EXISTS "Product variations are publicly readable" ON product_variations;
CREATE POLICY "Product variations are publicly readable" ON product_variations
    FOR SELECT USING (is_active = TRUE);

-- carts: users can manage own cart
DROP POLICY IF EXISTS "Users can manage own cart" ON carts;
CREATE POLICY "Users can manage own cart" ON carts
    FOR ALL USING (auth.uid() = user_id);

-- cart_items: users can manage items in own cart
DROP POLICY IF EXISTS "Users can manage own cart items" ON cart_items;
CREATE POLICY "Users can manage own cart items" ON cart_items
    FOR ALL USING (
        cart_id IN (SELECT id FROM carts WHERE user_id = auth.uid())
    );

-- orders: users can view own orders
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

-- order_items: users can view own order items
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
CREATE POLICY "Users can view own order items" ON order_items
    FOR SELECT USING (
        order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
    );

-- payments: users can view own payments
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (auth.uid() = user_id);

-- wallet_accounts: users can view own wallet
DROP POLICY IF EXISTS "Users can view own wallet" ON wallet_accounts;
CREATE POLICY "Users can view own wallet" ON wallet_accounts
    FOR SELECT USING (auth.uid() = user_id);

-- wallet_transactions: users can view own transactions
DROP POLICY IF EXISTS "Users can view own wallet transactions" ON wallet_transactions;
CREATE POLICY "Users can view own wallet transactions" ON wallet_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- reward_rules: public read active rules
DROP POLICY IF EXISTS "Active reward rules are publicly readable" ON reward_rules;
CREATE POLICY "Active reward rules are publicly readable" ON reward_rules
    FOR SELECT USING (is_active = TRUE);

-- reward_transactions: users can view own rewards
DROP POLICY IF EXISTS "Users can view own reward transactions" ON reward_transactions;
CREATE POLICY "Users can view own reward transactions" ON reward_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- notifications: users can view own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- support_tickets: users can manage own tickets
DROP POLICY IF EXISTS "Users can manage own support tickets" ON support_tickets;
CREATE POLICY "Users can manage own support tickets" ON support_tickets
    FOR ALL USING (auth.uid() = user_id);

-- support_messages: users can view messages on own tickets
DROP POLICY IF EXISTS "Users can view own ticket messages" ON support_messages;
CREATE POLICY "Users can view own ticket messages" ON support_messages
    FOR SELECT USING (
        ticket_id IN (SELECT id FROM support_tickets WHERE user_id = auth.uid())
        AND is_internal = FALSE
    );
DROP POLICY IF EXISTS "Users can send messages on own tickets" ON support_messages;
CREATE POLICY "Users can send messages on own tickets" ON support_messages
    FOR INSERT WITH CHECK (
        ticket_id IN (SELECT id FROM support_tickets WHERE user_id = auth.uid())
        AND sender_type = 'customer'
    );

-- staff_roles: authenticated read
DROP POLICY IF EXISTS "Staff roles are readable by authenticated users" ON staff_roles;
CREATE POLICY "Staff roles are readable by authenticated users" ON staff_roles
    FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================
-- TRIGGERS AND FUNCTIONS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_user_profiles ON user_profiles;
CREATE TRIGGER set_updated_at_user_profiles
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_referral_codes ON referral_codes;
CREATE TRIGGER set_updated_at_referral_codes
    BEFORE UPDATE ON referral_codes
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_referrals ON referrals;
CREATE TRIGGER set_updated_at_referrals
    BEFORE UPDATE ON referrals
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_categories ON categories;
CREATE TRIGGER set_updated_at_categories
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_products ON products;
CREATE TRIGGER set_updated_at_products
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_carts ON carts;
CREATE TRIGGER set_updated_at_carts
    BEFORE UPDATE ON carts
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_cart_items ON cart_items;
CREATE TRIGGER set_updated_at_cart_items
    BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_orders ON orders;
CREATE TRIGGER set_updated_at_orders
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_payments ON payments;
CREATE TRIGGER set_updated_at_payments
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_wallet_accounts ON wallet_accounts;
CREATE TRIGGER set_updated_at_wallet_accounts
    BEFORE UPDATE ON wallet_accounts
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_reward_rules ON reward_rules;
CREATE TRIGGER set_updated_at_reward_rules
    BEFORE UPDATE ON reward_rules
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_staff ON staff;
CREATE TRIGGER set_updated_at_staff
    BEFORE UPDATE ON staff
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_support_tickets ON support_tickets;
CREATE TRIGGER set_updated_at_support_tickets
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- Generate referral code on user profile creation
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
    v_code TEXT;
    exists_count INTEGER;
BEGIN
    LOOP
        -- Generate 8 character alphanumeric code
        v_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
        SELECT COUNT(*) INTO exists_count FROM referral_codes WHERE referral_codes.code = v_code;
        EXIT WHEN exists_count = 0;
    END LOOP;
    RETURN v_code;
END;
$$ LANGUAGE plpgsql;

-- Auto-create wallet and referral code on new user profile
CREATE OR REPLACE FUNCTION on_user_profile_created()
RETURNS TRIGGER AS $$
BEGIN
    -- Create wallet account
    INSERT INTO wallet_accounts (user_id, balance, currency)
    VALUES (NEW.user_id, 0, 'INR')
    ON CONFLICT (user_id) DO NOTHING;

    -- Create referral code
    INSERT INTO referral_codes (user_id, code)
    VALUES (NEW.user_id, generate_referral_code())
    ON CONFLICT (user_id) DO NOTHING;

    -- Create cart
    INSERT INTO carts (user_id)
    VALUES (NEW.user_id)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_profile_created ON user_profiles;
CREATE TRIGGER on_user_profile_created
    AFTER INSERT ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION on_user_profile_created();

-- Generate ticket number for support tickets
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.ticket_number := 'TKT' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS generate_support_ticket_number ON support_tickets;
CREATE TRIGGER generate_support_ticket_number
    BEFORE INSERT ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION generate_ticket_number();


-- =============================================================================
-- PART 2: STORAGE BUCKETS, STORAGE POLICIES & ATOMIC LEDGER FUNCTIONS
-- =============================================================================

-- ============================================================
-- GROWPLUS MIGRATION 002: STORAGE POLICIES & ATOMIC LEDGER FUNCTIONS
-- ============================================================

-- 1. Create storage buckets for products and avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('products', 'products', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage RLS Policies
-- Anyone can view product images
DROP POLICY IF EXISTS "Public Read Product Images" ON storage.objects;
CREATE POLICY "Public Read Product Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

-- Authenticated staff can upload product images
DROP POLICY IF EXISTS "Staff Insert Product Images" ON storage.objects;
CREATE POLICY "Staff Insert Product Images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'products');

-- Staff can update/delete product images
DROP POLICY IF EXISTS "Staff Update Product Images" ON storage.objects;
CREATE POLICY "Staff Update Product Images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Staff Delete Product Images" ON storage.objects;
CREATE POLICY "Staff Delete Product Images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'products');

-- 3. ATOMIC WALLET DEBIT WITH ROW-LEVEL LOCKING (FOR UPDATE)
-- Prevents race conditions, double spending, and negative balances
CREATE OR REPLACE FUNCTION public.execute_atomic_wallet_debit(
    p_user_id UUID,
    p_amount NUMERIC(12,2),
    p_order_id UUID,
    p_order_number TEXT,
    p_idempotency_key TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_wallet RECORD;
    v_balance_before NUMERIC(12,2);
    v_balance_after NUMERIC(12,2);
    v_tx_id UUID;
    v_existing_tx RECORD;
BEGIN
    -- Check idempotency: if already processed for this key, return existing
    SELECT * INTO v_existing_tx 
    FROM public.wallet_transactions 
    WHERE idempotency_key = p_idempotency_key;

    IF FOUND THEN
        RETURN jsonb_build_object(
            'success', true,
            'idempotent_replay', true,
            'transaction_id', v_existing_tx.id,
            'balance_after', v_existing_tx.balance_after
        );
    END IF;

    -- Row-level lock on wallet_account to prevent race conditions
    SELECT * INTO v_wallet
    FROM public.wallet_accounts
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Wallet account not found for user %', p_user_id;
    END IF;

    IF v_wallet.is_frozen THEN
        RAISE EXCEPTION 'Wallet account is frozen';
    END IF;

    v_balance_before := v_wallet.balance;

    IF v_balance_before < p_amount THEN
        RAISE EXCEPTION 'Insufficient store credits. Available: %, Requested: %', v_balance_before, p_amount;
    END IF;

    v_balance_after := v_balance_before - p_amount;

    -- Append-only transaction record
    INSERT INTO public.wallet_transactions (
        wallet_id,
        user_id,
        type,
        amount,
        balance_before,
        balance_after,
        source,
        reference_id,
        reference_type,
        description,
        idempotency_key
    ) VALUES (
        v_wallet.id,
        p_user_id,
        'debit',
        p_amount,
        v_balance_before,
        v_balance_after,
        'order_payment',
        p_order_id,
        'order',
        'Credits applied to order #' || p_order_number,
        p_idempotency_key
    ) RETURNING id INTO v_tx_id;

    -- Update wallet balance and lifetime spent
    UPDATE public.wallet_accounts
    SET 
        balance = v_balance_after,
        lifetime_spent = COALESCE(lifetime_spent, 0) + p_amount,
        updated_at = NOW()
    WHERE id = v_wallet.id;

    RETURN jsonb_build_object(
        'success', true,
        'idempotent_replay', false,
        'transaction_id', v_tx_id,
        'balance_before', v_balance_before,
        'balance_after', v_balance_after
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. ATOMIC REWARD CREDIT WITH ROW-LEVEL LOCKING
CREATE OR REPLACE FUNCTION public.execute_atomic_reward_credit(
    p_user_id UUID,
    p_amount NUMERIC(12,2),
    p_order_id UUID,
    p_order_number TEXT,
    p_rule_id UUID,
    p_referral_id UUID,
    p_qualifying_amount NUMERIC(12,2),
    p_idempotency_key TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_wallet RECORD;
    v_balance_before NUMERIC(12,2);
    v_balance_after NUMERIC(12,2);
    v_tx_id UUID;
    v_reward_tx_id UUID;
    v_existing_tx RECORD;
BEGIN
    -- Idempotency check
    SELECT * INTO v_existing_tx 
    FROM public.wallet_transactions 
    WHERE idempotency_key = p_idempotency_key;

    IF FOUND THEN
        RETURN jsonb_build_object('success', true, 'idempotent_replay', true);
    END IF;

    -- Row-level lock on recipient wallet
    SELECT * INTO v_wallet
    FROM public.wallet_accounts
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Wallet account not found for user %', p_user_id;
    END IF;

    IF v_wallet.is_frozen THEN
        RAISE EXCEPTION 'Wallet is frozen for user %', p_user_id;
    END IF;

    v_balance_before := v_wallet.balance;
    v_balance_after := v_balance_before + p_amount;

    -- Append-only transaction
    INSERT INTO public.wallet_transactions (
        wallet_id,
        user_id,
        type,
        amount,
        balance_before,
        balance_after,
        source,
        reference_id,
        reference_type,
        description,
        idempotency_key
    ) VALUES (
        v_wallet.id,
        p_user_id,
        'credit',
        p_amount,
        v_balance_before,
        v_balance_after,
        'reward',
        p_order_id,
        'order',
        'Referral reward from order #' || p_order_number,
        p_idempotency_key
    ) RETURNING id INTO v_tx_id;

    -- Update wallet balance and lifetime earned
    UPDATE public.wallet_accounts
    SET 
        balance = v_balance_after,
        lifetime_earned = COALESCE(lifetime_earned, 0) + p_amount,
        updated_at = NOW()
    WHERE id = v_wallet.id;

    -- Record reward transaction
    INSERT INTO public.reward_transactions (
        user_id,
        wallet_transaction_id,
        order_id,
        reward_rule_id,
        referral_id,
        amount,
        status,
        qualifying_purchase_amount
    ) VALUES (
        p_user_id,
        v_tx_id,
        p_order_id,
        p_rule_id,
        p_referral_id,
        p_amount,
        'credited',
        p_qualifying_amount
    ) RETURNING id INTO v_reward_tx_id;

    -- Update referral status
    UPDATE public.referrals
    SET status = 'rewarded', rewarded_at = NOW()
    WHERE id = p_referral_id;

    -- Update referral code performance stats
    UPDATE public.referral_codes
    SET 
        successful_referrals = COALESCE(successful_referrals, 0) + 1,
        total_credits_earned = COALESCE(total_credits_earned, 0) + p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Send in-app notification
    INSERT INTO public.notifications (
        user_id,
        title,
        body,
        type,
        data
    ) VALUES (
        p_user_id,
        'Reward Credited! ðŸŽ‰',
        'You earned â‚¹' || p_amount || ' in shopping credits from a referral purchase!',
        'reward',
        jsonb_build_object('order_id', p_order_id, 'amount', p_amount)
    );

    RETURN jsonb_build_object(
        'success', true,
        'idempotent_replay', false,
        'transaction_id', v_tx_id,
        'reward_id', v_reward_tx_id,
        'balance_after', v_balance_after
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================================================
-- PART 3: INITIAL SEED DATA (ROLES, CATEGORIES, REWARD RULES)
-- =============================================================================

-- ============================================================
-- GrowPlus Seed Data
-- ============================================================

-- ============================================================
-- Staff Roles
-- ============================================================
INSERT INTO staff_roles (name, display_name, description, permissions) VALUES
(
    'owner',
    'Owner',
    'Full system access, cannot be modified',
    '["*"]'::jsonb
),
(
    'admin',
    'Administrator',
    'Full access except owner-level operations',
    '["users:read","users:write","products:read","products:write","orders:read","orders:write","payments:read","support:read","support:write","staff:read","analytics:read","rewards:read","rewards:write"]'::jsonb
),
(
    'product_manager',
    'Product Manager',
    'Manage products, categories, and inventory',
    '["products:read","products:write","categories:read","categories:write","inventory:read","inventory:write"]'::jsonb
),
(
    'order_manager',
    'Order Manager',
    'Manage and fulfill orders',
    '["orders:read","orders:write","users:read","payments:read","support:read"]'::jsonb
),
(
    'support',
    'Support Agent',
    'Handle customer support tickets',
    '["users:read","orders:read","support:read","support:write","notifications:write"]'::jsonb
)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- Default Categories
-- ============================================================
INSERT INTO categories (name, slug, description, sort_order, is_active) VALUES
(
    'Electronics',
    'electronics',
    'Gadgets, devices, and electronic accessories',
    1,
    TRUE
),
(
    'Clothing & Fashion',
    'clothing-fashion',
    'Men''s, women''s and kids'' apparel and accessories',
    2,
    TRUE
),
(
    'Health & Beauty',
    'health-beauty',
    'Personal care, health supplements, and beauty products',
    3,
    TRUE
),
(
    'Home & Kitchen',
    'home-kitchen',
    'Household essentials, appliances, and kitchen tools',
    4,
    TRUE
),
(
    'Sports & Fitness',
    'sports-fitness',
    'Sports equipment, activewear, and fitness accessories',
    5,
    TRUE
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Default Reward Rules
-- ============================================================
INSERT INTO reward_rules (name, description, trigger_event, reward_type, reward_value, min_order_amount, applies_to_eligible_products_only, credit_validity_days, is_active, priority) VALUES
(
    'Standard Purchase Reward',
    'Earn 5% back on eligible product purchases as GrowPlus credits',
    'order_delivered',
    'percentage',
    5.0,
    0,
    TRUE,
    365,
    TRUE,
    1
),
(
    'First Order Bonus',
    'Earn 100 credits on your first order',
    'first_order',
    'fixed_amount',
    100.0,
    0,
    FALSE,
    180,
    TRUE,
    10
),
(
    'Referral Reward',
    'Earn 150 credits when your referral completes their first order',
    'referral_qualified',
    'fixed_amount',
    150.0,
    0,
    FALSE,
    365,
    TRUE,
    5
)
ON CONFLICT DO NOTHING;

