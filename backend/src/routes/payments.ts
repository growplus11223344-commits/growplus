import { Router } from 'express';
import crypto from 'crypto';
import { supabaseAdmin } from '../config/supabase';
import { authenticate, AuthenticatedRequest } from '../middleware/authenticate';
import { AppError } from '../middleware/errorHandler';
import { RewardsEngine } from '../services/rewardsEngine';
import { PaymentGatewayService } from '../services/payment/PaymentGatewayService';
import { PaymentProvider } from '../services/payment/types';
import { logger } from '../utils/logger';

export const paymentsRouter = Router();

// GET /api/v1/payments/active-gateway - Check current payment provider & readiness
paymentsRouter.get('/active-gateway', async (req, res, next) => {
  try {
    const gateway = await PaymentGatewayService.getActiveGateway();
    const availability = gateway.isAvailable();
    const capabilities = gateway.getCapabilities();

    res.json({
      provider: gateway.name,
      displayName: gateway.displayName,
      isAvailable: availability.available,
      unavailabilityReason: availability.reason,
      capabilities,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/payments/create-order - Initiate payment with active gateway
paymentsRouter.post('/create-order', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { order_id } = req.body;
    if (!order_id) throw new AppError(400, 'order_id is required');

    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', order_id)
      .eq('user_id', req.user!.id)
      .single();

    if (!order) throw new AppError(404, 'Order not found');
    if (order.payment_status === 'paid') throw new AppError(400, 'Order is already paid');

    const gateway = await PaymentGatewayService.getActiveGateway();
    const availability = gateway.isAvailable();

    if (!availability.available) {
      throw new AppError(503, `Payment gateway (${gateway.displayName}) is currently unavailable: ${availability.reason}`);
    }

    // Customer profile info
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('full_name, phone')
      .eq('id', req.user!.id)
      .maybeSingle();

    const amount = Number(order.total_amount);
    const orderNumber = order.order_number || `ORD-${order.id.slice(0, 8)}`;

    // Create session via active gateway adapter
    const session = await gateway.createPayment({
      orderId: order.id,
      orderNumber,
      amount,
      currency: 'INR',
      userId: req.user!.id,
      customerPhone: profile?.phone,
      customerName: profile?.full_name,
      customerEmail: req.user!.email,
      returnUrl: `http://localhost:8082/#/orders?payment_success=true&order_id=${order.id}&provider=${gateway.name}`,
      cancelUrl: `http://localhost:8082/#/orders?payment_cancelled=true&order_id=${order.id}&provider=${gateway.name}`,
      notes: { order_id: order.id, user_id: req.user!.id, provider: gateway.name },
    });

    // Record payment attempt in Supabase
    const paymentInsertPayload: any = {
      order_id: order.id,
      user_id: req.user!.id,
      gateway_order_id: session.gatewayOrderId || null,
      amount: order.total_amount,
      currency: session.currency || 'INR',
      status: 'created',
      metadata: {
        provider: gateway.name,
        gateway_type: session.gatewayType,
        checkout_url: session.checkoutUrl,
        ...(session.metadata || {}),
      },
    };

    // Store in Supabase payments table
    await supabaseAdmin.from('payments').insert(paymentInsertPayload);

    // Update orders table with payment_provider
    await supabaseAdmin
      .from('orders')
      .update({ notes: `Initiated via ${gateway.displayName}` })
      .eq('id', order.id);

    // Return unified response (backward-compatible with Razorpay SDK fields + hosted checkout fields)
    res.json({
      provider: gateway.name,
      gateway_type: session.gatewayType,
      order_id: order.id,
      order_number: orderNumber,
      amount: session.amount, // in paise for razorpay or standard for europepay
      currency: session.currency,
      // Razorpay specific client fields (preserved for existing apps)
      razorpay_order_id: session.gatewayOrderId,
      key_id: session.keyId || process.env.RAZORPAY_KEY_ID,
      // Europepay / Hosted checkout specific fields
      checkout_url: session.checkoutUrl,
      instructions: session.instructions,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/payments/verify - Verify payment with responsible gateway
paymentsRouter.post('/verify', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const {
      order_id,
      provider: requestedProvider,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      payment_id,
    } = req.body;

    if (!order_id) throw new AppError(400, 'order_id is required');

    // 1. Fetch payment record to identify original provider (Preserve gateway mapping)
    const { data: paymentRecord } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('order_id', order_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const providerName: PaymentProvider =
      (paymentRecord?.metadata?.provider ||
        paymentRecord?.provider ||
        requestedProvider ||
        (razorpay_order_id ? 'razorpay' : 'europepay')) as PaymentProvider;

    const gateway = PaymentGatewayService.getGateway(providerName);

    // 2. Execute verification via provider adapter
    const verifyResult = await gateway.verifyPayment({
      orderId: order_id,
      gatewayOrderId: razorpay_order_id || paymentRecord?.gateway_order_id,
      gatewayPaymentId: razorpay_payment_id || payment_id,
      gatewaySignature: razorpay_signature,
    });

    if (!verifyResult.success || verifyResult.status !== 'captured') {
      throw new AppError(400, verifyResult.failureReason || 'Payment verification failed');
    }

    // 3. Update payment record in Supabase
    if (paymentRecord) {
      await supabaseAdmin
        .from('payments')
        .update({
          gateway_payment_id: razorpay_payment_id || payment_id || paymentRecord.gateway_payment_id,
          gateway_signature: razorpay_signature || null,
          status: 'captured',
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentRecord.id);
    }

    // 4. Update order payment status
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('payment_status')
      .eq('id', order_id)
      .single();

    if (order?.payment_status !== 'paid') {
      await supabaseAdmin
        .from('orders')
        .update({ payment_status: 'paid', status: 'confirmed' })
        .eq('id', order_id);

      // Evaluate rewards for verified retail product purchase asynchronously
      RewardsEngine.processOrderReward({ orderId: order_id, userId: req.user!.id }).catch(err => {
        logger.error('RewardsEngine background processing error:', err);
      });
    }

    res.json({
      message: 'Payment verified successfully',
      provider: providerName,
      status: 'paid',
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/payments/fail - Handle payment failure or user cancellation, restore reserved credits atomically
paymentsRouter.post('/fail', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { order_id, reason = 'Payment failed or cancelled', idempotency_key } = req.body;
    if (!order_id) throw new AppError(400, 'order_id is required');

    const failKey = idempotency_key || `fail-${order_id}`;

    // Get order
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('*, payments(*)')
      .eq('id', order_id)
      .eq('user_id', req.user!.id)
      .single();

    if (!order) throw new AppError(404, 'Order not found');

    // Never cancel an already paid order via /fail
    if (order.payment_status === 'paid') {
      return res.status(400).json({ error: 'Cannot fail an already paid order' });
    }

    // Update payment record to failed
    await supabaseAdmin
      .from('payments')
      .update({ status: 'failed', failure_reason: reason })
      .eq('order_id', order.id);

    // Update order status to cancelled
    await supabaseAdmin
      .from('orders')
      .update({ status: 'cancelled', payment_status: 'failed', notes: `Payment failed: ${reason}` })
      .eq('id', order.id);

    // Atomically restore reserved credits if any were applied
    if (order.credits_applied && Number(order.credits_applied) > 0) {
      const { data: wallet } = await supabaseAdmin
        .from('wallet_accounts')
        .select('id, balance')
        .eq('user_id', req.user!.id)
        .single();

      if (wallet) {
        const restoreAmount = Number(order.credits_applied);
        const restoreTxKey = `restore-${failKey}`;

        // Check if already restored via idempotency key
        const { data: existingTx } = await supabaseAdmin
          .from('wallet_transactions')
          .select('id')
          .eq('idempotency_key', restoreTxKey)
          .single();

        if (!existingTx) {
          const balanceBefore = Number(wallet.balance);
          const balanceAfter = balanceBefore + restoreAmount;

          await supabaseAdmin.from('wallet_transactions').insert({
            wallet_id: wallet.id,
            user_id: req.user!.id,
            type: 'credit',
            amount: restoreAmount,
            balance_before: balanceBefore,
            balance_after: balanceAfter,
            source: 'refund',
            reference_id: order.id,
            reference_type: 'order',
            description: `Restored credits for failed payment on order #${order.order_number}`,
            idempotency_key: restoreTxKey,
          });

          await supabaseAdmin
            .from('wallet_accounts')
            .update({ balance: balanceAfter })
            .eq('id', wallet.id);
        }
      }
    }

    res.json({ message: 'Payment marked as failed, reserved credits restored', order_id: order.id });
  } catch (err) {
    next(err);
  }
});
