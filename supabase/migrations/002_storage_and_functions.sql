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
CREATE POLICY "Public Read Product Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

-- Authenticated staff can upload product images
CREATE POLICY "Staff Insert Product Images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'products');

-- Staff can update/delete product images
CREATE POLICY "Staff Update Product Images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'products');

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
        'Reward Credited! 🎉',
        'You earned ₹' || p_amount || ' in shopping credits from a referral purchase!',
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
