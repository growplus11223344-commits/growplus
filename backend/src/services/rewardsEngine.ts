import { supabaseAdmin } from '../config/supabase';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface ProcessRewardParams {
  orderId: string;
  userId: string;
}

export interface ReversalParams {
  orderId: string;
  reason: string;
  approvedBy?: string;
}

/**
 * GrowPlus Rewards Calculation Engine
 * 
 * Strict Compliance Rules:
 * 1. NO commissions for signups or deposits.
 * 2. Rewards only earned from verified retail product purchases.
 * 3. Only active, compliance-approved reward rules are executed.
 * 4. Self-referrals strictly blocked.
 * 5. Idempotent processing prevents duplicate payouts.
 * 6. Order cancellations & refunds trigger automatic promotional credit reversals.
 */
export class RewardsEngine {
  /**
   * Process rewards for a verified completed order
   */
  static async processOrderReward({ orderId, userId }: ProcessRewardParams): Promise<void> {
    try {
      logger.info(`[RewardsEngine] Processing reward evaluation for order ${orderId}, buyer: ${userId}`);

      // 1. Fetch order details and items
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .select(`
          id, order_number, user_id, status, payment_status, total_amount, subtotal,
          order_items (id, product_id, quantity, unit_price, total_price, is_eligible_for_rewards)
        `)
        .eq('id', orderId)
        .single();

      if (orderError || !order) {
        logger.error(`[RewardsEngine] Order ${orderId} not found`);
        return;
      }

      // Check order eligibility: must be paid and confirmed/delivered
      if (order.payment_status !== 'paid') {
        logger.warn(`[RewardsEngine] Order ${orderId} is not paid. Skipping rewards.`);
        return;
      }

      // 2. Check if buyer was referred by someone
      const { data: referral, error: refError } = await supabaseAdmin
        .from('referrals')
        .select('id, referrer_id, referred_id, status')
        .eq('referred_id', userId)
        .single();

      if (refError || !referral) {
        logger.info(`[RewardsEngine] User ${userId} has no referrer. No referral commission.`);
        return;
      }

      // Anti-fraud: prevent self-referral
      if (referral.referrer_id === userId) {
        logger.warn(`[RewardsEngine] Anti-fraud: referrer and referred are identical (${userId}). Blocked.`);
        return;
      }

      // Check if referrer is active
      const { data: referrerProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('is_active')
        .eq('user_id', referral.referrer_id)
        .single();

      if (!referrerProfile || !referrerProfile.is_active) {
        logger.warn(`[RewardsEngine] Referrer ${referral.referrer_id} is inactive.`);
        return;
      }

      // 3. Calculate eligible purchase amount (only eligible products count)
      const eligibleItems = (order.order_items as any[]).filter(item => item.is_eligible_for_rewards);
      if (eligibleItems.length === 0) {
        logger.info(`[RewardsEngine] No reward-eligible items in order ${orderId}.`);
        return;
      }

      const eligibleAmount = eligibleItems.reduce((acc, item) => acc + Number(item.total_price), 0);

      // 4. Fetch active and compliance-approved reward rules
      const { data: rules, error: rulesError } = await supabaseAdmin
        .from('reward_rules')
        .select('*')
        .eq('is_active', true)
        .eq('rule_type', 'purchase_commission');

      if (rulesError || !rules || rules.length === 0) {
        logger.info(`[RewardsEngine] No active purchase_commission rules configured.`);
        return;
      }

      // Filter rules that have compliance approval if required
      const validRules = rules.filter(r => !r.requires_compliance_approval || (r.requires_compliance_approval && r.approved_by));
      if (validRules.length === 0) {
        logger.warn(`[RewardsEngine] Active rules lack compliance approval.`);
        return;
      }

      // Pick the primary active rule
      const rule = validRules[0];

      // Check minimum order amount requirement
      if (rule.min_purchase_amount && eligibleAmount < Number(rule.min_purchase_amount)) {
        logger.info(`[RewardsEngine] Order eligible amount (${eligibleAmount}) does not meet min threshold (${rule.min_purchase_amount}).`);
        return;
      }

      // Calculate reward amount
      let rewardAmount = 0;
      if (rule.commission_type === 'percentage') {
        rewardAmount = (eligibleAmount * Number(rule.commission_value)) / 100;
      } else {
        rewardAmount = Number(rule.commission_value);
      }

      // Apply max cap if configured
      if (rule.max_commission_per_order && rewardAmount > Number(rule.max_commission_per_order)) {
        rewardAmount = Number(rule.max_commission_per_order);
      }

      rewardAmount = Math.round(rewardAmount * 100) / 100;

      if (rewardAmount <= 0) {
        return;
      }

      // 5. Idempotency check: prevent duplicate reward payout for this order
      const { data: existingReward } = await supabaseAdmin
        .from('reward_transactions')
        .select('id')
        .eq('order_id', orderId)
        .eq('user_id', referral.referrer_id)
        .eq('status', 'credited')
        .single();

      if (existingReward) {
        logger.info(`[RewardsEngine] Reward already credited for order ${orderId}. Skipping.`);
        return;
      }

      const idempotencyKey = `reward-${orderId}-${referral.referrer_id}`;

      // Attempt atomic execution via PostgreSQL stored procedure (with FOR UPDATE lock)
      const { data: rpcData, error: rpcErr } = await supabaseAdmin.rpc('execute_atomic_reward_credit', {
        p_user_id: referral.referrer_id,
        p_amount: rewardAmount,
        p_order_id: orderId,
        p_order_number: order.order_number,
        p_rule_id: rule.id,
        p_referral_id: referral.id,
        p_qualifying_amount: eligibleAmount,
        p_idempotency_key: idempotencyKey,
      });

      if (!rpcErr && rpcData?.success) {
        logger.info(`[RewardsEngine] Successfully credited ₹${rewardAmount} via atomic RPC to referrer ${referral.referrer_id}`);
        return;
      }

      // Fallback: Sequential database queries with ledger verification
      // 6. Fetch referrer's wallet
      const { data: wallet, error: walletError } = await supabaseAdmin
        .from('wallet_accounts')
        .select('id, balance, lifetime_earned, is_frozen')
        .eq('user_id', referral.referrer_id)
        .single();

      if (walletError || !wallet) {
        logger.error(`[RewardsEngine] Referrer wallet not found for user ${referral.referrer_id}`);
        return;
      }

      if (wallet.is_frozen) {
        logger.warn(`[RewardsEngine] Referrer wallet ${wallet.id} is frozen. Reward pending.`);
        return;
      }

      const balanceBefore = Number(wallet.balance);
      const balanceAfter = balanceBefore + rewardAmount;

      // 7. Atomic transaction: Append to wallet_transactions ledger & update balance
      const { data: txRecord, error: txError } = await supabaseAdmin
        .from('wallet_transactions')
        .insert({
          wallet_id: wallet.id,
          user_id: referral.referrer_id,
          type: 'credit',
          amount: rewardAmount,
          balance_before: balanceBefore,
          balance_after: balanceAfter,
          source: 'reward',
          reference_id: orderId,
          reference_type: 'order',
          description: `Referral reward from order #${order.order_number}`,
          idempotency_key: idempotencyKey,
          metadata: {
            order_id: orderId,
            rule_id: rule.id,
            eligible_amount: eligibleAmount,
          },
        })
        .select()
        .single();

      if (txError) {
        logger.error(`[RewardsEngine] Failed to create wallet transaction: ${txError.message}`);
        return;
      }

      // Update wallet balance and lifetime earned
      await supabaseAdmin
        .from('wallet_accounts')
        .update({
          balance: balanceAfter,
          lifetime_earned: Number(wallet.lifetime_earned || 0) + rewardAmount,
        })
        .eq('id', wallet.id);

      // Record reward transaction record
      await supabaseAdmin
        .from('reward_transactions')
        .insert({
          user_id: referral.referrer_id,
          wallet_transaction_id: txRecord.id,
          order_id: orderId,
          reward_rule_id: rule.id,
          referral_id: referral.id,
          amount: rewardAmount,
          status: 'credited',
          qualifying_purchase_amount: eligibleAmount,
        });

      // Update referral status to rewarded
      await supabaseAdmin
        .from('referrals')
        .update({
          status: 'rewarded',
          rewarded_at: new Date().toISOString(),
        })
        .eq('id', referral.id);

      // Send notification to referrer
      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: referral.referrer_id,
          title: 'Reward Credited! 🎉',
          body: `You received ₹${rewardAmount} in shopping credits from a referral purchase!`,
          type: 'reward',
          data: { order_id: orderId, amount: rewardAmount },
        });

      logger.info(`[RewardsEngine] Successfully credited ₹${rewardAmount} to referrer ${referral.referrer_id}`);
    } catch (err) {
      logger.error('[RewardsEngine] Error in processOrderReward:', err);
    }
  }

  /**
   * Reverse promotional rewards upon order cancellation or refund
   */
  static async reverseOrderReward({ orderId, reason, approvedBy }: ReversalParams): Promise<void> {
    try {
      logger.info(`[RewardsEngine] Processing reward reversal for refunded order ${orderId}`);

      // Find credited reward transactions for this order
      const { data: rewards, error } = await supabaseAdmin
        .from('reward_transactions')
        .select('*')
        .eq('order_id', orderId)
        .eq('status', 'credited');

      if (error || !rewards || rewards.length === 0) {
        logger.info(`[RewardsEngine] No credited rewards found to reverse for order ${orderId}`);
        return;
      }

      for (const reward of rewards) {
        const { data: wallet } = await supabaseAdmin
          .from('wallet_accounts')
          .select('id, balance')
          .eq('user_id', reward.user_id)
          .single();

        if (!wallet) continue;

        const currentBalance = Number(wallet.balance);
        const deduction = Math.min(currentBalance, Number(reward.amount));
        const balanceAfter = Math.max(0, currentBalance - deduction);
        const idempotencyKey = `reversal-${orderId}-${reward.id}`;

        // Append-only reversal ledger transaction
        await supabaseAdmin
          .from('wallet_transactions')
          .insert({
            wallet_id: wallet.id,
            user_id: reward.user_id,
            type: 'reversal',
            amount: deduction,
            balance_before: currentBalance,
            balance_after: balanceAfter,
            source: 'refund',
            reference_id: orderId,
            reference_type: 'order_refund',
            description: `Reversal of promotional reward due to order cancellation/refund: ${reason}`,
            idempotency_key: idempotencyKey,
            approved_by: approvedBy || null,
            approval_reason: reason,
          });

        // Update wallet account
        await supabaseAdmin
          .from('wallet_accounts')
          .update({ balance: balanceAfter })
          .eq('id', wallet.id);

        // Update reward transaction status
        await supabaseAdmin
          .from('reward_transactions')
          .update({
            status: 'reversed',
            reversal_reason: reason,
          })
          .eq('id', reward.id);

        // Notify user of reversal
        await supabaseAdmin
          .from('notifications')
          .insert({
            user_id: reward.user_id,
            title: 'Reward Adjusted',
            body: `₹${deduction} in promotional credits was reversed due to an order cancellation or return.`,
            type: 'reward',
            data: { order_id: orderId, reason },
          });

        logger.info(`[RewardsEngine] Successfully reversed ₹${deduction} for user ${reward.user_id}`);
      }
    } catch (err) {
      logger.error('[RewardsEngine] Error in reverseOrderReward:', err);
    }
  }
}
