import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { supabaseAdmin } from '../config/supabase';
import { authenticateAdmin, AuthenticatedRequest } from '../middleware/authenticate';
import { AppError } from '../middleware/errorHandler';
import { RewardsEngine } from '../services/rewardsEngine';
import { GoogleSheetsService } from '../services/googleSheets';
import { PaymentGatewayService } from '../services/payment/PaymentGatewayService';
import { PaymentProvider } from '../services/payment/types';
import { v4 as uuidv4 } from 'uuid';

export const adminRouter = Router();

// All admin routes require authenticateAdmin middleware
adminRouter.use(authenticateAdmin);

// Role check helper
const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: any, next: any) => {
    const role = req.user?.role || '';
    if (!allowedRoles.includes(role)) {
      return next(new AppError(403, `Access denied: requires ${allowedRoles.join(' or ')} role`));
    }
    next();
  };
};

// ============================================================
// DASHBOARD METRICS
// ============================================================
adminRouter.get('/dashboard', async (req: AuthenticatedRequest, res, next) => {
  try {
    const [
      { count: totalUsers },
      { count: totalOrders },
      { count: pendingOrders },
      { count: totalProducts },
      { data: salesData },
      { data: creditsData },
    ] = await Promise.all([
      supabaseAdmin.from('user_profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabaseAdmin.from('products').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabaseAdmin.from('orders').select('total_amount').eq('payment_status', 'paid'),
      supabaseAdmin.from('wallet_transactions').select('amount').eq('type', 'credit').eq('source', 'reward'),
    ]);

    const totalSales = (salesData || []).reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const promotionalCreditsIssued = (creditsData || []).reduce((sum, c) => sum + Number(c.amount || 0), 0);

    res.json({
      total_users: totalUsers || 0,
      total_orders: totalOrders || 0,
      pending_orders: pendingOrders || 0,
      active_products: totalProducts || 0,
      total_sales: Math.round(totalSales * 100) / 100,
      promotional_credits_issued: Math.round(promotionalCreditsIssued * 100) / 100,
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// ORDER MANAGEMENT
// ============================================================
adminRouter.get('/orders', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { page = '1', limit = '20', status, payment_status, search } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;

    let query = supabaseAdmin
      .from('orders')
      .select('*, order_items(*), payments(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (status && status !== 'all') {
      if (status === 'new') {
        query = query.in('status', ['pending', 'confirmed']);
      } else if (status === 'paid') {
        query = query.eq('payment_status', 'paid');
      } else {
        query = query.eq('status', status);
      }
    }

    if (payment_status && payment_status !== 'all') {
      query = query.eq('payment_status', payment_status);
    }

    if (search && search.trim()) {
      const q = search.trim();
      query = query.or(`order_number.ilike.%${q}%,notes.ilike.%${q}%`);
    }

    const { data: orders, error, count } = await query;
    if (error) throw new AppError(500, `Failed to fetch orders: ${error.message}`);

    // Enrich orders with authorized customer user_profiles
    const userIds = [...new Set((orders || []).map((o: any) => o.user_id).filter(Boolean))];
    let profileMap = new Map<string, any>();
    if (userIds.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from('user_profiles')
        .select('user_id, full_name, email, phone')
        .in('user_id', userIds);
      profileMap = new Map(profiles?.map((p: any) => [p.user_id, p]) || []);
    }

    const enrichedOrders = (orders || []).map((o: any) => {
      const profile = profileMap.get(o.user_id);
      return {
        ...o,
        user_profiles: {
          full_name: profile?.full_name || o.shipping_address?.name || 'Customer',
          email: profile?.email || o.shipping_address?.email || 'N/A',
          phone: profile?.phone || o.shipping_address?.phone || 'N/A',
        },
      };
    });

    res.json({ orders: enrichedOrders, pagination: { page: pageNum, limit: limitNum, total: count || 0 } });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/admin/orders/:id/status - Update fulfillment, process refunds/cancellations
adminRouter.patch('/orders/:id/status', [
  body('status').isIn(['confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']),
], async (req: AuthenticatedRequest, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError(422, errors.array()[0].msg);

    const { status, tracking_number, tracking_url, notes, refund_reason } = req.body;
    const orderId = req.params.id;

    // Fetch existing order
    const { data: order, error: fetchErr } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single();

    if (fetchErr || !order) throw new AppError(404, 'Order not found');

    const updatePayload: Record<string, any> = {
      status,
      tracking_number: tracking_number !== undefined ? tracking_number : order.tracking_number,
      tracking_url: tracking_url !== undefined ? tracking_url : order.tracking_url,
      notes: notes !== undefined ? notes : order.notes,
    };

    if (status === 'cancelled') updatePayload.cancelled_at = new Date().toISOString();
    if (status === 'delivered') updatePayload.delivered_at = new Date().toISOString();
    if (status === 'refunded') updatePayload.payment_status = 'refunded';

    // Handle Cancellations / Refunds
    if (status === 'cancelled' || status === 'refunded') {
      const reason = refund_reason || notes || 'Order cancelled/refunded by admin';

      // 1. Reverse promotional rewards awarded to referrers
      await RewardsEngine.reverseOrderReward({
        orderId,
        reason,
        approvedBy: req.user!.id,
      });

      // 2. Restore credits applied by buyer on this order (if any)
      if (order.credits_applied && Number(order.credits_applied) > 0) {
        const { data: buyerWallet } = await supabaseAdmin
          .from('wallet_accounts')
          .select('id, balance')
          .eq('user_id', order.user_id)
          .single();

        if (buyerWallet) {
          const restoredAmount = Number(order.credits_applied);
          const balanceBefore = Number(buyerWallet.balance);
          const balanceAfter = balanceBefore + restoredAmount;

          await supabaseAdmin.from('wallet_transactions').insert({
            wallet_id: buyerWallet.id,
            user_id: order.user_id,
            type: 'credit',
            amount: restoredAmount,
            balance_before: balanceBefore,
            balance_after: balanceAfter,
            source: 'refund',
            reference_id: orderId,
            reference_type: 'order_refund',
            description: `Restoration of promotional credits for cancelled order #${order.order_number}`,
            idempotency_key: `restore-credits-${orderId}`,
            approved_by: req.user!.id,
            approval_reason: reason,
          });

          await supabaseAdmin
            .from('wallet_accounts')
            .update({ balance: balanceAfter })
            .eq('id', buyerWallet.id);
        }
      }

      // 3. Restore inventory quantities
      if (order.order_items && Array.isArray(order.order_items)) {
        for (const item of order.order_items) {
          const { data: inv } = await supabaseAdmin
            .from('inventory')
            .select('id, quantity')
            .eq('product_id', item.product_id)
            .single();

          if (inv) {
            await supabaseAdmin
              .from('inventory')
              .update({ quantity: inv.quantity + item.quantity })
              .eq('id', inv.id);
          }
        }
      }
    }

    const { data: updatedOrder, error: updateErr } = await supabaseAdmin
      .from('orders')
      .update(updatePayload)
      .eq('id', orderId)
      .select()
      .single();

    if (updateErr) throw new AppError(500, updateErr.message);

    // Audit log
    await supabaseAdmin.from('audit_logs').insert({
      actor_id: req.user!.id,
      actor_type: 'staff',
      action: `ORDER_STATUS_${status.toUpperCase()}`,
      resource_type: 'order',
      resource_id: orderId,
      old_values: { status: order.status },
      new_values: { status },
      metadata: { reason: refund_reason || notes },
    });

    res.json(updatedOrder);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// REWARD RULES MANAGEMENT
// ============================================================
adminRouter.get('/rewards/rules', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('reward_rules')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new AppError(500, 'Failed to fetch reward rules');
    res.json(data);
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/rewards/rules', requireRole(['owner', 'admin']), [
  body('name').trim().notEmpty(),
  body('rule_type').isIn(['purchase_commission', 'referral_bonus']),
  body('commission_type').isIn(['percentage', 'fixed']),
  body('commission_value').isFloat({ min: 0 }),
], async (req: AuthenticatedRequest, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError(422, errors.array()[0].msg);

    const { name, description, rule_type, commission_type, commission_value, min_purchase_amount, max_commission_per_order, requires_compliance_approval = true } = req.body;

    const { data, error } = await supabaseAdmin
      .from('reward_rules')
      .insert({
        name,
        description,
        rule_type,
        commission_type,
        commission_value,
        min_purchase_amount,
        max_commission_per_order,
        is_active: false, // Default inactive until approved
        requires_compliance_approval,
        created_by: req.user!.id,
      })
      .select()
      .single();

    if (error) throw new AppError(500, error.message);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

// Approve & activate reward rule
adminRouter.patch('/rewards/rules/:id/approve', requireRole(['owner', 'admin']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('reward_rules')
      .update({
        is_active: true,
        approved_by: req.user!.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !data) throw new AppError(404, 'Reward rule not found');

    // Audit log
    await supabaseAdmin.from('audit_logs').insert({
      actor_id: req.user!.id,
      actor_type: 'staff',
      action: 'REWARD_RULE_APPROVED',
      resource_type: 'reward_rule',
      resource_id: req.params.id,
      new_values: data,
    });

    res.json(data);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// AUDITABLE WALLET ADJUSTMENT (No direct balance overwrite!)
// ============================================================
adminRouter.post('/wallet/adjust', requireRole(['owner', 'admin']), [
  body('user_id').isUUID(),
  body('amount').isFloat(),
  body('type').isIn(['credit', 'debit']),
  body('reason').trim().isLength({ min: 10 }).withMessage('Detailed approval reason required'),
], async (req: AuthenticatedRequest, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError(422, errors.array()[0].msg);

    const { user_id, amount, type, reason } = req.body;
    const absAmount = Math.abs(parseFloat(amount));

    const { data: wallet, error: walletErr } = await supabaseAdmin
      .from('wallet_accounts')
      .select('id, balance')
      .eq('user_id', user_id)
      .single();

    if (walletErr || !wallet) throw new AppError(404, 'User wallet not found');

    const balanceBefore = Number(wallet.balance);
    let balanceAfter: number;

    if (type === 'credit') {
      balanceAfter = balanceBefore + absAmount;
    } else {
      if (balanceBefore < absAmount) {
        throw new AppError(400, `Insufficient wallet balance. Current: ₹${balanceBefore}`);
      }
      balanceAfter = balanceBefore - absAmount;
    }

    const idempotencyKey = `manual-adj-${uuidv4()}`;

    // Append-only transaction
    const { data: tx, error: txErr } = await supabaseAdmin
      .from('wallet_transactions')
      .insert({
        wallet_id: wallet.id,
        user_id,
        type: 'adjustment',
        amount: absAmount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        source: 'admin_adjustment',
        description: `Manual admin adjustment: ${reason}`,
        idempotency_key: idempotencyKey,
        approved_by: req.user!.id,
        approval_reason: reason,
      })
      .select()
      .single();

    if (txErr) throw new AppError(500, txErr.message);

    // Update wallet balance
    await supabaseAdmin
      .from('wallet_accounts')
      .update({ balance: balanceAfter })
      .eq('id', wallet.id);

    // Audit log
    await supabaseAdmin.from('audit_logs').insert({
      actor_id: req.user!.id,
      actor_type: 'staff',
      action: 'WALLET_MANUAL_ADJUSTMENT',
      resource_type: 'wallet_account',
      resource_id: wallet.id,
      old_values: { balance: balanceBefore },
      new_values: { balance: balanceAfter },
      metadata: { reason, amount: absAmount, type, tx_id: tx.id },
    });

    res.json({
      message: 'Wallet adjusted successfully and logged to immutable ledger',
      transaction: tx,
      new_balance: balanceAfter,
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// STAFF MANAGEMENT (RBAC)
// ============================================================
adminRouter.get('/staff', requireRole(['owner', 'admin']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('staff')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new AppError(500, 'Failed to fetch staff');
    res.json(data);
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/staff', requireRole(['owner']), [
  body('email').isEmail(),
  body('full_name').trim().notEmpty(),
  body('role').isIn(['admin', 'product_manager', 'order_manager', 'support']),
  body('password').isLength({ min: 8 }),
], async (req: AuthenticatedRequest, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError(422, errors.array()[0].msg);

    const { email, full_name, role, password } = req.body;

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) throw new AppError(400, authError.message);

    const userId = authData.user.id;

    // Create staff record
    const { data: staff, error: staffError } = await supabaseAdmin
      .from('staff')
      .insert({
        user_id: userId,
        full_name,
        email,
        role,
        created_by: req.user!.id,
      })
      .select()
      .single();

    if (staffError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw new AppError(500, staffError.message);
    }

    res.status(201).json(staff);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GOOGLE SHEETS REPORT SYNC TRIGGER
// ============================================================
adminRouter.post('/reports/sync-sheets', requireRole(['owner', 'admin']), async (req: AuthenticatedRequest, res, next) => {
  try {
    GoogleSheetsService.syncAllReports().catch(err => {
      console.error('Google Sheets async sync error:', err);
    });

    res.json({ message: 'Google Sheets sync dispatched successfully' });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/admin/users
adminRouter.get('/users', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { page = '1', limit = '20', search } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;

    let query = supabaseAdmin
      .from('user_profiles')
      .select('*, wallet_accounts(balance)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data, error, count } = await query;
    if (error) throw new AppError(500, 'Failed to fetch users');

    res.json({ users: data, pagination: { page: pageNum, limit: limitNum, total: count || 0 } });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// DUAL PAYMENT GATEWAY MANAGEMENT (ADMIN CONTROLS)
// ============================================================

// GET /api/v1/admin/payments/overview - View active gateway, readiness & metrics
adminRouter.get('/payments/overview', requireRole(['owner', 'admin']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const overview = await PaymentGatewayService.getGatewayOverview();
    res.json(overview);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/admin/payments/switch-gateway - Restricted admin gateway switching
adminRouter.post(
  '/payments/switch-gateway',
  requireRole(['owner', 'admin']),
  [
    body('provider').isIn(['razorpay', 'europepay']).withMessage('provider must be razorpay or europepay'),
    body('reason').trim().notEmpty().withMessage('reason is required for audit trail'),
  ],
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new AppError(422, errors.array()[0].msg);

      const { provider, reason } = req.body;
      const result = await PaymentGatewayService.switchGateway(
        provider as PaymentProvider,
        reason,
        req.user?.id,
        req.ip,
        req.headers['user-agent']
      );

      res.json({
        success: true,
        message: `Active payment gateway switched to ${result.activeProvider}`,
        activeProvider: result.activeProvider,
        previousProvider: result.previousProvider,
        capabilities: result.capabilities,
      });
    } catch (err) {
      next(err);
    }
  }
);
