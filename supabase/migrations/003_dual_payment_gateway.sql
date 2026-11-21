-- ============================================================
-- GROWPLUS MIGRATION 003: DUAL PAYMENT GATEWAY ARCHITECTURE
-- Adds provider tracking, idempotency, and audit fields
-- ============================================================

-- 1. Ensure payments table has provider and verification columns
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'razorpay';

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS verified_amount NUMERIC(12, 2);

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS checkout_url TEXT;

-- 2. Add indexes for provider-aware payment lookups
CREATE INDEX IF NOT EXISTS idx_payments_provider ON payments(provider);
CREATE INDEX IF NOT EXISTS idx_payments_idempotency_key ON payments(idempotency_key);

-- 3. Ensure orders table records payment provider
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_provider TEXT DEFAULT 'razorpay';

-- 4. Payment Gateway System Settings Table (for server-controlled gateway switching)
CREATE TABLE IF NOT EXISTS payment_gateway_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    active_provider TEXT NOT NULL DEFAULT 'razorpay' CHECK (active_provider IN ('razorpay', 'europepay')),
    razorpay_enabled BOOLEAN NOT NULL DEFAULT true,
    europepay_enabled BOOLEAN NOT NULL DEFAULT false,
    environment TEXT NOT NULL DEFAULT 'sandbox' CHECK (environment IN ('sandbox', 'production')),
    last_switched_at TIMESTAMPTZ DEFAULT NOW(),
    last_switched_by UUID,
    switch_reason TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default configuration if not present
INSERT INTO payment_gateway_settings (id, active_provider, razorpay_enabled, europepay_enabled, environment)
VALUES ('default', 'razorpay', true, false, 'sandbox')
ON CONFLICT (id) DO NOTHING;

-- 5. Audit Log for Gateway Switching
CREATE TABLE IF NOT EXISTS payment_gateway_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    previous_provider TEXT NOT NULL,
    new_provider TEXT NOT NULL,
    switched_by UUID,
    reason TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
