import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { supabaseAdmin } from '../config/supabase';
import { authenticate, AuthenticatedRequest } from '../middleware/authenticate';
import { AppError } from '../middleware/errorHandler';

export const cartRouter = Router();

// GET /api/v1/cart
cartRouter.get('/', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('carts')
      .select(`
        id,
        cart_items(
          id, quantity, unit_price,
          products(id, name, slug, selling_price, is_eligible_for_rewards,
            product_images(url, is_primary)
          )
        )
      `)
      .eq('user_id', req.user!.id)
      .single();

    if (error || !data) {
      // Create cart if it doesn't exist
      const { data: newCart, error: createError } = await supabaseAdmin
        .from('carts')
        .insert({ user_id: req.user!.id })
        .select('id, cart_items(*)')
        .single();
      if (createError) throw new AppError(500, 'Failed to initialize cart');
      return res.json(newCart);
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/cart/items - Add item to cart
cartRouter.post('/items', authenticate, [
  body('product_id').isUUID(),
  body('quantity').isInt({ min: 1, max: 100 }),
  body('variation_id').optional().isUUID(),
], async (req: AuthenticatedRequest, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError(422, errors.array()[0].msg);

    const { product_id, quantity, variation_id } = req.body;

    // Get/create cart
    let { data: cart } = await supabaseAdmin
      .from('carts')
      .select('id')
      .eq('user_id', req.user!.id)
      .single();

    if (!cart) {
      const { data: newCart } = await supabaseAdmin
        .from('carts')
        .insert({ user_id: req.user!.id })
        .select('id')
        .single();
      cart = newCart;
    }

    // Get product price
    const { data: product } = await supabaseAdmin
      .from('products')
      .select('selling_price, status')
      .eq('id', product_id)
      .single();

    if (!product || product.status !== 'active') throw new AppError(404, 'Product not found');

    // Upsert cart item
    const { data, error } = await supabaseAdmin
      .from('cart_items')
      .upsert({
        cart_id: cart!.id,
        product_id,
        variation_id: variation_id || null,
        quantity,
        unit_price: product.selling_price,
      }, { onConflict: 'cart_id,product_id,variation_id' })
      .select()
      .single();

    if (error) throw new AppError(500, 'Failed to add item to cart');
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/cart/items/:id
cartRouter.patch('/items/:id', authenticate, [
  body('quantity').isInt({ min: 0, max: 100 }),
], async (req: AuthenticatedRequest, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError(422, errors.array()[0].msg);

    const { quantity } = req.body;

    if (quantity === 0) {
      await supabaseAdmin.from('cart_items').delete().eq('id', req.params.id);
      return res.json({ message: 'Item removed from cart' });
    }

    const { data, error } = await supabaseAdmin
      .from('cart_items')
      .update({ quantity })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !data) throw new AppError(404, 'Cart item not found');
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/cart/items/:id
cartRouter.delete('/items/:id', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { error } = await supabaseAdmin
      .from('cart_items')
      .delete()
      .eq('id', req.params.id);

    if (error) throw new AppError(500, 'Failed to remove item');
    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    next(err);
  }
});
