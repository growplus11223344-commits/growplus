import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { supabaseAdmin } from '../config/supabase';
import { authenticate, AuthenticatedRequest } from '../middleware/authenticate';
import { AppError } from '../middleware/errorHandler';
import { RewardsEngine } from '../services/rewardsEngine';
import { GoogleSheetsService } from '../services/googleSheets';

export const ordersRouter = Router();

// GET /api/v1/orders - User's order history
ordersRouter.get('/', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { page = '1', limit = '10' } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;

    const { data, error, count } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*)', { count: 'exact' })
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) throw new AppError(500, 'Failed to fetch orders');
    res.json({ orders: data, pagination: { page: pageNum, limit: limitNum, total: count || 0 } });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/orders - Create order
ordersRouter.post('/', authenticate, [
  body('shipping_address').custom((val) => val && (typeof val === 'object' || typeof val === 'string')),
  body('idempotency_key').trim().notEmpty().isLength({ min: 8, max: 128 }),
  body('credits_to_apply').optional().isFloat({ min: 0 }),
], async (req: AuthenticatedRequest, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = errors.array()[0] as any;
      throw new AppError(422, `${err.msg} (${err.path || err.param})`);
    }

    const { shipping_address, billing_address, credits_to_apply = 0, idempotency_key, notes } = req.body;

    // Check idempotency - prevent duplicate orders
    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('idempotency_key', idempotency_key)
      .single();

    if (existingOrder) {
      return res.json({ order_id: existingOrder.id, message: 'Order already created' });
    }

    // Get user's cart
    const { data: cart } = await supabaseAdmin
      .from('carts')
      .select('id, cart_items(*, products(*))')
      .eq('user_id', req.user!.id)
      .single();

    if (!cart || !(cart.cart_items as any[])?.length) throw new AppError(400, 'Cart is empty');

    const items = cart.cart_items as any[];

    // 1. Validate inventory stock for all cart items
    for (const item of items) {
      const prodName = item.products?.name || 'Product';
      const { data: inv, error: invErr } = await supabaseAdmin
        .from('inventory')
        .select('quantity, reserved_quantity')
        .eq('product_id', item.product_id)
        .single();

      if (invErr || !inv) {
        throw new AppError(400, `Stock has not been configured for "${prodName}". Please contact an administrator.`);
      }

      const availableStock = inv.quantity - (inv.reserved_quantity || 0);
      if (availableStock < item.quantity) {
        throw new AppError(400, `Insufficient stock for "${prodName}". Available: ${Math.max(0, availableStock)}, requested: ${item.quantity}.`);
      }
    }

    // Calculate totals first
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.unit_price * item.quantity), 0);

    // Validate wallet credits strictly
    let creditsApplied = 0;
    if (credits_to_apply > 0) {
      if (credits_to_apply > subtotal) {
        throw new AppError(400, `Credits applied (₹${credits_to_apply}) cannot exceed order total (₹${subtotal})`);
      }

      const { data: wallet } = await supabaseAdmin
        .from('wallet_accounts')
        .select('balance, is_frozen')
        .eq('user_id', req.user!.id)
        .single();

      if (!wallet || wallet.is_frozen) throw new AppError(400, 'Wallet is not available or is frozen');
      if (credits_to_apply > Number(wallet.balance)) {
        throw new AppError(400, `Credits applied (₹${credits_to_apply}) cannot exceed available wallet balance (₹${wallet.balance})`);
      }
      creditsApplied = credits_to_apply;
    }

    const totalAmount = Math.max(0, subtotal - creditsApplied);

    // Generate order number
    const orderNumber = `GP${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Create order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: req.user!.id,
        subtotal,
        credits_applied: creditsApplied,
        total_amount: totalAmount,
        shipping_address,
        billing_address: billing_address || shipping_address,
        notes,
        idempotency_key,
        status: totalAmount === 0 ? 'confirmed' : 'pending',
        payment_status: totalAmount === 0 ? 'paid' : 'pending',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error details:', orderError);
      throw new AppError(500, `Failed to create order: ${orderError.message}`);
    }

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      variation_id: item.variation_id,
      product_name: item.products.name,
      product_sku: item.products.sku,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.unit_price * item.quantity,
      is_eligible_for_rewards: item.products.is_eligible_for_rewards,
    }));

    await supabaseAdmin.from('order_items').insert(orderItems);

    // Deduct stock from inventory
    for (const item of items) {
      const { data: currentInv } = await supabaseAdmin
        .from('inventory')
        .select('quantity')
        .eq('product_id', item.product_id)
        .single();
      if (currentInv) {
        const newQty = Math.max(0, currentInv.quantity - item.quantity);
        await supabaseAdmin
          .from('inventory')
          .update({ quantity: newQty, updated_at: new Date().toISOString() })
          .eq('product_id', item.product_id);
      }
    }

    // Deduct wallet credits atomically if applied
    if (creditsApplied > 0) {
      const debitIdempotencyKey = `order-debit-${order.id}`;

      // Try RPC stored procedure first (row-level locking FOR UPDATE)
      const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc('execute_atomic_wallet_debit', {
        p_user_id: req.user!.id,
        p_amount: creditsApplied,
        p_order_id: order.id,
        p_order_number: orderNumber,
        p_idempotency_key: debitIdempotencyKey,
      });

      if (rpcError) {
        // Fallback to table queries with concurrency check and idempotency
        const { data: walletData } = await supabaseAdmin
          .from('wallet_accounts')
          .select('id, balance')
          .eq('user_id', req.user!.id)
          .single();

        if (!walletData || Number(walletData.balance) < creditsApplied) {
          // Rollback created order to prevent orphaned unbacked order
          await supabaseAdmin.from('orders').delete().eq('id', order.id);
          throw new AppError(409, 'Insufficient wallet balance or concurrent transaction detected');
        }

        const balanceBefore = Number(walletData.balance);
        const balanceAfter = balanceBefore - creditsApplied;

        // Perform conditional update: balance must still be >= creditsApplied
        const { data: updatedWallet, error: updateErr } = await supabaseAdmin
          .from('wallet_accounts')
          .update({ balance: balanceAfter })
          .eq('id', walletData.id)
          .gte('balance', creditsApplied)
          .select();

        if (updateErr || !updatedWallet || updatedWallet.length === 0) {
          await supabaseAdmin.from('orders').delete().eq('id', order.id);
          throw new AppError(409, 'Concurrent transaction detected, wallet debit failed');
        }

        await supabaseAdmin.from('wallet_transactions').insert({
          wallet_id: walletData.id,
          user_id: req.user!.id,
          type: 'debit',
          amount: creditsApplied,
          balance_before: balanceBefore,
          balance_after: balanceAfter,
          source: 'order_payment',
          reference_id: order.id,
          reference_type: 'order',
          description: `Credits applied to order ${orderNumber}`,
          idempotency_key: debitIdempotencyKey,
        });
      }
    }

    // Clear cart
    await supabaseAdmin.from('cart_items').delete().eq('cart_id', cart.id);

    // If order was 100% paid by credits, trigger rewards processing
    if (totalAmount === 0) {
      await supabaseAdmin.from('orders').update({ status: 'confirmed' }).eq('id', order.id);
      RewardsEngine.processOrderReward({ orderId: order.id, userId: req.user!.id }).catch(err => {
        console.error('RewardsEngine background processing error:', err);
      });
    }

    // Trigger automated Google Sheets order sync in background
    GoogleSheetsService.syncOrders().catch((err) => {
      console.warn('[GoogleSheets] Background order sync notice:', err.message);
    });

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});
