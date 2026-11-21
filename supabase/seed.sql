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
