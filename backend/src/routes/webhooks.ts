import { Router, Request, Response } from 'express';
import express from 'express';
import crypto from 'crypto';
import { supabaseAdmin } from '../config/supabase';
import { logger } from '../utils/logger';
import { RewardsEngine } from '../services/rewardsEngine';
import { MongoAnalyticsService } from '../services/mongoAnalytics';
import { GoogleSheetsService } from '../services/googleSheets';
import { PaymentGatewayService } from '../services/payment/PaymentGatewayService';

export const webhooksRouter = Router();

// Razorpay webhook - signature verification via rawBody
webhooksRouter.post(
  '/razorpay',
  async (req: Request, res: Response) => {
    try {
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
      if (!webhookSecret) {
        logger.error('Razorpay webhook secret not configured');
        return res.status(500).json({ error: 'Webhook not configured' });
      }

      const signature = req.headers['x-razorpay-signature'] as string;
      const rawBody = (req as any).rawBody
        ? (req as any).rawBody.toString('utf8')
        : (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));

      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      if (expectedSignature !== signature) {
        logger.warn('Invalid Razorpay webhook signature');
        return res.status(400).json({ error: 'Invalid signature' });
      }

      const event = typeof req.body === 'object' && req.body !== null && !Buffer.isBuffer(req.body)
        ? req.body
        : JSON.parse(rawBody);
      const webhookId = req.headers['x-razorpay-event-id'] as string;

      // Idempotency: check if already processed
      if (webhookId) {
        const { data: existing } = await supabaseAdmin
          .from('payments')
          .select('id')
          .eq('webhook_id', webhookId)
          .single();

        if (existing) {
          logger.info(`Webhook ${webhookId} already processed`);
          return res.json({ status: 'already_processed' });
        }
      }

      // Handle events
      switch (event.event) {
        case 'payment.captured': {
          const payment = event.payload.payment.entity;
          const { data: pRecord } = await supabaseAdmin
            .from('payments')
            .select('*, orders(*)')
            .eq('gateway_order_id', payment.order_id)
            .single();

          if (pRecord && pRecord.status === 'captured') {
            return res.json({ status: 'already_captured' });
          }

          await supabaseAdmin
            .from('payments')
            .update({
              status: 'captured',
              gateway_payment_id: payment.id,
              webhook_id: webhookId,
              webhook_processed_at: new Date().toISOString(),
            })
            .eq('gateway_order_id', payment.order_id);

          if (pRecord?.order_id && pRecord.orders?.payment_status !== 'paid') {
            await supabaseAdmin
              .from('orders')
              .update({ payment_status: 'paid', status: 'confirmed' })
              .eq('id', pRecord.order_id);

            RewardsEngine.processOrderReward({
              orderId: pRecord.order_id,
              userId: pRecord.user_id,
            }).catch(err => logger.error('RewardsEngine webhook error:', err));
          } else if (payment.notes?.type === 'wallet_topup' || pRecord?.metadata?.type === 'wallet_topup') {
            const topupTxKey = `topup-${payment.order_id}`;
            const { data: existingTx } = await supabaseAdmin
              .from('wallet_transactions')
              .select('id')
              .eq('idempotency_key', topupTxKey)
              .single();

            if (!existingTx) {
              const amount = Number(payment.notes?.amount || pRecord?.amount || (payment.amount / 100));
              const topupUserId = payment.notes?.user_id || pRecord?.user_id;
              if (topupUserId) {
                let { data: wallet } = await supabaseAdmin
                  .from('wallet_accounts')
                  .select('id, balance, lifetime_earned, is_frozen')
                  .eq('user_id', topupUserId)
                  .single();

                if (!wallet) {
                  const { data: newW } = await supabaseAdmin
                    .from('wallet_accounts')
                    .insert({
                      user_id: topupUserId,
                      balance: 0,
                      pending_balance: 0,
                      lifetime_earned: 0,
                      is_frozen: false,
                    })
                    .select()
                    .single();
                  wallet = newW;
                }

                if (wallet && !wallet.is_frozen) {
                  const balanceBefore = Number(wallet.balance || 0);
                  const balanceAfter = balanceBefore + amount;
                  const lifetimeEarnedAfter = Number(wallet.lifetime_earned || 0) + amount;

                  await supabaseAdmin
                    .from('wallet_accounts')
                    .update({
                      balance: balanceAfter,
                      lifetime_earned: lifetimeEarnedAfter,
                      updated_at: new Date().toISOString(),
                    })
                    .eq('id', wallet.id);

                  await supabaseAdmin.from('wallet_transactions').insert({
                    wallet_id: wallet.id,
                    user_id: topupUserId,
                    type: 'credit',
                    amount,
                    balance_before: balanceBefore,
                    balance_after: balanceAfter,
                    source: 'reward_earned',
                    reference_id: pRecord ? pRecord.id : null,
                    reference_type: 'topup',
                    description: `Added ₹${amount.toFixed(2)} promotional shopping credits via webhook`,
                    idempotency_key: topupTxKey,
                    metadata: {
                      razorpay_order_id: payment.order_id,
                      razorpay_payment_id: payment.id,
                      type: 'wallet_topup',
                    },
                  });

                  MongoAnalyticsService.logEvent(
                    'WALLET_TOPUP_SUCCESS_WEBHOOK',
                    'growplus_rewards',
                    { amount, razorpay_order_id: payment.order_id, razorpay_payment_id: payment.id },
                    topupUserId
                  ).catch(err => logger.warn('[MongoAnalytics] Webhook topup log notice:', err));

                  GoogleSheetsService.syncRewards().catch(err => logger.warn('[GoogleSheets] Webhook topup sync notice:', err));
                }
              }
            }
          }
          break;
        }
        case 'payment.failed': {
          const payment = event.payload.payment.entity;
          const { data: pRecord } = await supabaseAdmin
            .from('payments')
            .select('*, orders(*)')
            .eq('gateway_order_id', payment.order_id)
            .single();

          if (pRecord) {
            await supabaseAdmin
              .from('payments')
              .update({ status: 'failed', webhook_id: webhookId, webhook_processed_at: new Date().toISOString() })
              .eq('gateway_order_id', payment.order_id);

            if (pRecord.orders && pRecord.orders.payment_status !== 'paid') {
              await supabaseAdmin
                .from('orders')
                .update({ status: 'cancelled', payment_status: 'failed', notes: 'Payment failed via webhook' })
                .eq('id', pRecord.order_id);

              if (pRecord.orders.credits_applied && Number(pRecord.orders.credits_applied) > 0) {
                const restoreTxKey = `webhook-restore-${pRecord.order_id}`;
                const { data: existingTx } = await supabaseAdmin
                  .from('wallet_transactions')
                  .select('id')
                  .eq('idempotency_key', restoreTxKey)
                  .single();

                if (!existingTx) {
                  const { data: wallet } = await supabaseAdmin
                    .from('wallet_accounts')
                    .select('id, balance')
                    .eq('user_id', pRecord.user_id)
                    .single();

                  if (wallet) {
                    const balanceBefore = Number(wallet.balance);
                    const restoreAmount = Number(pRecord.orders.credits_applied);
                    const balanceAfter = balanceBefore + restoreAmount;

                    await supabaseAdmin.from('wallet_transactions').insert({
                      wallet_id: wallet.id,
                      user_id: pRecord.user_id,
                      type: 'credit',
                      amount: restoreAmount,
                      balance_before: balanceBefore,
                      balance_after: balanceAfter,
                      source: 'payment_failure_refund',
                      reference_id: pRecord.order_id,
                      reference_type: 'order',
                      description: `Restored credits from webhook for failed order #${pRecord.orders.order_number}`,
                      idempotency_key: restoreTxKey,
                    });

                    await supabaseAdmin
                      .from('wallet_accounts')
                      .update({ balance: balanceAfter })
                      .eq('id', wallet.id);
                  }
                }
              }
            }
          }
          break;
        }
        case 'refund.created': {
          const refund = event.payload.refund.entity;
          await supabaseAdmin
            .from('payments')
            .update({
              refund_id: refund.id,
              refund_amount: refund.amount / 100,
              refunded_at: new Date().toISOString(),
              status: 'refunded',
            })
            .eq('gateway_payment_id', refund.payment_id);
          break;
        }
      }

      logger.info(`Webhook processed: ${event.event}`);
      res.json({ status: 'ok' });
    } catch (err) {
      logger.error('Webhook processing error:', err);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
);

// ============================================================
// EUROPEPAY WEBHOOK - HMAC-SHA256 SIGNED NOTIFICATIONS
// ============================================================
webhooksRouter.post('/europepay', async (req: Request, res: Response) => {
  try {
    const gateway = PaymentGatewayService.getGateway('europepay');
    const result = await gateway.verifyWebhook(req);

    if (!result.valid) {
      logger.warn(`[Europepay Webhook] Verification failed: ${result.error}`);
      return res.status(400).json({ error: result.error || 'Invalid Europepay signature' });
    }

    const { eventId, eventType, orderId, gatewayPaymentId, status } = result;

    // Idempotency check: check if already processed
    if (eventId) {
      const { data: existing } = await supabaseAdmin
        .from('payments')
        .select('id')
        .eq('webhook_id', eventId)
        .maybeSingle();

      if (existing) {
        logger.info(`[Europepay Webhook] Event ${eventId} already processed. Skipping duplicate.`);
        return res.json({ status: 'already_processed' });
      }
    }

    // Find payment record by reference (orderId or gatewayOrderId)
    const { data: payment } = await supabaseAdmin
      .from('payments')
      .select('*, orders(*)')
      .or(`order_id.eq.${orderId},gateway_order_id.eq.${orderId}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!payment) {
      logger.warn(`[Europepay Webhook] No matching payment found for order reference ${orderId}`);
      return res.status(404).json({ error: 'Order not found for webhook' });
    }

    // Process event status
    if (status === 'captured') {
      if (payment.status !== 'captured') {
        await supabaseAdmin
          .from('payments')
          .update({
            status: 'captured',
            gateway_payment_id: gatewayPaymentId || payment.gateway_payment_id,
            webhook_id: eventId,
            webhook_processed_at: new Date().toISOString(),
          })
          .eq('id', payment.id);

        if (payment.order_id && payment.orders?.payment_status !== 'paid') {
          await supabaseAdmin
            .from('orders')
            .update({ payment_status: 'paid', status: 'confirmed' })
            .eq('id', payment.order_id);

          RewardsEngine.processOrderReward({
            orderId: payment.order_id,
            userId: payment.user_id,
          }).catch(err => logger.error('[Europepay Webhook] Rewards processing error:', err));
        }
      }
    } else if (status === 'failed') {
      await supabaseAdmin
        .from('payments')
        .update({
          status: 'failed',
          webhook_id: eventId,
          webhook_processed_at: new Date().toISOString(),
        })
        .eq('id', payment.id);

      if (payment.order_id && payment.orders?.payment_status !== 'paid') {
        await supabaseAdmin
          .from('orders')
          .update({ status: 'cancelled', payment_status: 'failed' })
          .eq('id', payment.order_id);
      }
    }

    MongoAnalyticsService.logEvent(
      'EUROPEPAY_WEBHOOK_PROCESSED',
      'backend_system',
      { eventId, eventType, orderId, status },
      payment?.user_id
    ).catch(e => logger.warn('[MongoAnalytics] Failed to log Europepay webhook:', e));

    logger.info(`[Europepay Webhook] Successfully processed event ${eventId} (${eventType})`);
    res.json({ status: 'ok', event_id: eventId });
  } catch (err: any) {
    logger.error('[Europepay Webhook] Processing error:', err);
    res.status(500).json({ error: 'Internal error processing Europepay webhook' });
  }
});
