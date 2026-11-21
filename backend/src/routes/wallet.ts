import { Router } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import { supabaseAdmin } from '../config/supabase';
import { authenticate, AuthenticatedRequest } from '../middleware/authenticate';
import { AppError } from '../middleware/errorHandler';
import { MongoAnalyticsService } from '../services/mongoAnalytics';
import { GoogleSheetsService } from '../services/googleSheets';
import { PaymentGatewayService } from '../services/payment/PaymentGatewayService';
import { logger } from '../utils/logger';

export const walletRouter = Router();

// Initialize Razorpay
const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new AppError(503, 'Payment gateway not configured. Please contact support.');
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// GET /api/v1/wallet - Get user wallet balance
walletRouter.get('/', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('wallet_accounts')
      .select('balance, pending_balance, lifetime_earned, lifetime_spent, currency, is_frozen')
      .eq('user_id', req.user!.id)
      .single();

    if (error || !data) throw new AppError(404, 'Wallet not found');
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/wallet/transactions - Get transaction history
walletRouter.get('/transactions', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { page = '1', limit = '20', type } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;

    let queryBuilder = supabaseAdmin
      .from('wallet_transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (type) queryBuilder = queryBuilder.eq('type', type);

    const { data, error, count } = await queryBuilder;
    if (error) throw new AppError(500, 'Failed to fetch transactions');

    res.json({
      transactions: data,
      pagination: { page: pageNum, limit: limitNum, total: count || 0 },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/wallet/create-topup - Initialize active gateway order for purchasing shopping credits
walletRouter.post(
  '/create-topup',
  authenticate,
  [body('amount').isFloat({ min: 500 })],
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new AppError(422, 'Minimum credit purchase amount is ₹500');

      const amount = Math.round(Number(req.body.amount) * 100) / 100;
      const gateway = await PaymentGatewayService.getActiveGateway();

      if (gateway.name === 'europepay') {
        const topupId = `TOPUP-${Date.now()}`;
        const session = await gateway.createPayment({
          orderId: topupId,
          orderNumber: topupId,
          amount,
          currency: 'INR',
          userId: req.user!.id,
          customerEmail: req.user!.email,
          notes: {
            user_id: req.user!.id,
            type: 'wallet_topup',
            amount: amount.toString(),
          },
          returnUrl: `http://localhost:8081/#/wallet?topup_success=true&ref=${topupId}`,
          cancelUrl: `http://localhost:8081/#/wallet?topup_cancelled=true&ref=${topupId}`,
        });

        return res.json({
          provider: 'europepay',
          gateway_type: session.gatewayType,
          checkout_url: session.checkoutUrl,
          gateway_order_id: session.gatewayOrderId,
          amount,
          currency: 'INR',
        });
      }

      // Default: Razorpay
      const razorpay = getRazorpay();
      const amountInPaise = Math.round(amount * 100);

      const razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `TOPUP-${Date.now()}`,
        notes: {
          user_id: req.user!.id,
          type: 'wallet_topup',
          amount: amount.toString(),
        },
      });

      res.json({
        provider: 'razorpay',
        razorpay_order_id: razorpayOrder.id,
        amount: amountInPaise,
        currency: 'INR',
        key_id: process.env.RAZORPAY_KEY_ID,
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/v1/wallet/verify-topup - Verify signature and add credits to wallet ledger atomically
walletRouter.post(
  '/verify-topup',
  authenticate,
  [
    body('amount').isFloat({ min: 500 }),
  ],
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new AppError(422, 'Invalid verification payload');

      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, provider, payment_id } = req.body;
      const amount = Math.round(Number(req.body.amount) * 100) / 100;
      const effectiveProvider = provider || (razorpay_order_id ? 'razorpay' : 'europepay');

      let topupIdempotencyKey: string;

      if (effectiveProvider === 'europepay') {
        const pId = payment_id || req.body.gateway_order_id || req.body.order_id || `eu_topup_${Date.now()}`;
        topupIdempotencyKey = `topup-europepay-${pId}`;
        const gateway = PaymentGatewayService.getGateway('europepay');
        await gateway.verifyPayment({ orderId: pId, gatewayPaymentId: pId });
      } else {
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
          throw new AppError(422, 'Razorpay verification requires razorpay_order_id, razorpay_payment_id and razorpay_signature');
        }
        topupIdempotencyKey = `topup-${razorpay_order_id}`;

        // 1. Verify Razorpay signature server-side
        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        if (!keySecret) throw new AppError(503, 'Payment gateway not configured');

        const expectedSignature = crypto
          .createHmac('sha256', keySecret)
          .update(`${razorpay_order_id}|${razorpay_payment_id}`)
          .digest('hex');

        if (expectedSignature !== razorpay_signature) {
          throw new AppError(400, 'Invalid payment signature');
        }
      }

      // 2. Check if topup already credited (idempotency via unique idempotency_key)
      const { data: existingTx } = await supabaseAdmin
        .from('wallet_transactions')
        .select('id, amount, balance_after')
        .eq('idempotency_key', topupIdempotencyKey)
        .single();

      if (existingTx) {
        const { data: existingWallet } = await supabaseAdmin
          .from('wallet_accounts')
          .select('balance')
          .eq('user_id', req.user!.id)
          .single();
        return res.json({
          success: true,
          status: 'already_captured',
          balance: Number(existingWallet?.balance || 0),
          message: 'Topup already processed',
        });
      }

      // 3. Credit user's wallet atomically
      let { data: wallet } = await supabaseAdmin
        .from('wallet_accounts')
        .select('id, balance, lifetime_earned, is_frozen')
        .eq('user_id', req.user!.id)
        .single();

      if (!wallet) {
        const { data: newW } = await supabaseAdmin
          .from('wallet_accounts')
          .insert({
            user_id: req.user!.id,
            balance: 0,
            pending_balance: 0,
            lifetime_earned: 0,
            is_frozen: false,
          })
          .select('id, balance, lifetime_earned, is_frozen')
          .single();
        wallet = newW;
      }

      if (!wallet) {
        throw new AppError(500, 'Could not retrieve or create wallet');
      }

      if (wallet.is_frozen) {
        throw new AppError(403, 'Wallet is frozen. Contact customer support.');
      }

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

      // Insert transaction ledger record
      await supabaseAdmin.from('wallet_transactions').insert({
        wallet_id: wallet.id,
        user_id: req.user!.id,
        type: 'credit',
        amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        source: 'reward_earned',
        reference_id: null,
        reference_type: 'topup',
        description: `Added ₹${amount.toFixed(2)} promotional shopping credits`,
        idempotency_key: topupIdempotencyKey,
        metadata: {
          razorpay_order_id,
          razorpay_payment_id,
          type: 'wallet_topup',
        },
      });

      // 4. Log to MongoDB analytics asynchronously
      MongoAnalyticsService.logEvent(
        'WALLET_TOPUP_SUCCESS',
        'growplus_rewards',
        {
          amount,
          razorpay_order_id,
          razorpay_payment_id,
          balance_before: balanceBefore,
          balance_after: balanceAfter,
        },
        req.user!.id
      ).catch(err => logger.warn('[MongoAnalytics] Topup log notice:', err));

      // 5. Trigger Google Sheets sync in background
      GoogleSheetsService.syncRewards().catch(err => logger.warn('[GoogleSheets] Topup sync notice:', err));

      res.json({
        success: true,
        amount,
        balance: balanceAfter,
        message: `Successfully added ₹${amount.toFixed(2)} shopping credits to your wallet!`,
      });
    } catch (err) {
      next(err);
    }
  }
);
