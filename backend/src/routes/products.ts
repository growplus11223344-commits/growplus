import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import crypto from 'crypto';
import { supabaseAdmin } from '../config/supabase';
import { authenticate, authenticateAdmin, AuthenticatedRequest } from '../middleware/authenticate';
import { AppError } from '../middleware/errorHandler';

export const productsRouter = Router();

const uploadProductImage = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP) are allowed'));
    }
  },
});

// POST /api/v1/products/upload-image - Upload product image via Supabase Storage service role
productsRouter.post('/upload-image', authenticateAdmin, uploadProductImage.any(), async (req: AuthenticatedRequest, res, next) => {
  try {
    const files = (req.files as Express.Multer.File[]) || (req.file ? [req.file] : []);
    if (!files || files.length === 0) {
      throw new AppError(400, 'No image file uploaded');
    }

    const file = files[0];
    const fileExt = file.originalname.split('.').pop() || file.mimetype.split('/')[1] || 'jpg';
    const filename = `${Date.now()}-${crypto.randomUUID().substring(0, 8)}.${fileExt}`;
    const storagePath = `products/${filename}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('products')
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (uploadError) {
      throw new AppError(500, `Storage upload failed: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from('products')
      .getPublicUrl(storagePath);

    res.status(201).json({
      url: publicUrlData.publicUrl,
      storage_path: storagePath,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/products - Public: list active products
productsRouter.get('/', async (req, res, next) => {
  try {
    const { category, search, page = '1', limit = '20', sort = 'created_at' } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    let queryBuilder = supabaseAdmin
      .from('products')
      .select(`
        *,
        categories(id, name, slug),
        product_images(url, alt_text, is_primary, sort_order),
        inventory(quantity, reserved_quantity)
      `, { count: 'exact' })
      .eq('status', 'active')
      .range(offset, offset + limitNum - 1)
      .order(sort, { ascending: sort !== 'created_at' });

    if (category) {
      const { data: cat } = await supabaseAdmin.from('categories').select('id').eq('slug', category).single();
      if (cat) queryBuilder = queryBuilder.eq('category_id', cat.id);
    }

    if (search) {
      queryBuilder = queryBuilder.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error, count } = await queryBuilder;
    if (error) throw new AppError(500, 'Failed to fetch products');

    res.json({
      products: data,
      pagination: { page: pageNum, limit: limitNum, total: count || 0, pages: Math.ceil((count || 0) / limitNum) },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/products/:id
productsRouter.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select(`
        *,
        categories(id, name, slug),
        product_images(url, alt_text, is_primary, sort_order),
        inventory(quantity, reserved_quantity, low_stock_threshold),
        product_variations(*)
      `)
      .eq('id', req.params.id)
      .eq('status', 'active')
      .single();

    if (error || !data) throw new AppError(404, 'Product not found');
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/products - Admin only
productsRouter.post('/', authenticateAdmin, [
  body('name').trim().notEmpty(),
  body('selling_price').isFloat({ min: 0 }),
  body('category_id').optional().isUUID(),
  body('sku').optional().trim(),
  body('stock_quantity').optional().isInt({ min: 0 }),
], async (req: AuthenticatedRequest, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError(422, errors.array()[0].msg);

    const { name, description, short_description, sku, category_id, selling_price, mrp, cost_price, stock_quantity = 0, is_eligible_for_rewards = false, tags } = req.body;

    // Generate slug
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .insert({ name, slug, description, short_description, sku, category_id, selling_price, mrp, cost_price, is_eligible_for_rewards, tags, created_by: req.user!.id, status: 'draft' })
      .select()
      .single();

    if (error) throw new AppError(500, error.message);

    // Create inventory record
    await supabaseAdmin.from('inventory').insert({
      product_id: product.id,
      quantity: stock_quantity,
    });

    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/products/:id - Admin only
productsRouter.patch('/:id', authenticateAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    const allowedFields = ['name', 'description', 'short_description', 'sku', 'category_id', 'selling_price', 'mrp', 'cost_price', 'status', 'is_eligible_for_rewards', 'tags'];
    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !data) throw new AppError(404, 'Product not found');

    // Update or initialize inventory stock quantity if provided
    if (req.body.stock_quantity !== undefined) {
      const stockQty = parseInt(req.body.stock_quantity);
      if (!isNaN(stockQty) && stockQty >= 0) {
        await supabaseAdmin.from('inventory').upsert({
          product_id: req.params.id,
          quantity: stockQty,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'product_id' });
      }
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/products/:id - Admin only (archives)
productsRouter.delete('/:id', authenticateAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { error } = await supabaseAdmin
      .from('products')
      .update({ status: 'archived' })
      .eq('id', req.params.id);

    if (error) throw new AppError(500, 'Failed to archive product');
    res.json({ message: 'Product archived successfully' });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/products/admin/all - Admin product listing (includes draft, inactive)
productsRouter.get('/admin/all', authenticateAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { page = '1', limit = '50', status } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;

    let query = supabaseAdmin
      .from('products')
      .select(`
        *,
        categories(id, name, slug),
        product_images(id, url, is_primary),
        inventory(id, quantity, reserved_quantity, low_stock_threshold),
        product_variations(id, name, value, additional_price, stock)
      `, { count: 'exact' })
      .range(offset, offset + limitNum - 1)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    } else {
      query = query.neq('status', 'archived');
    }

    const { data, error, count } = await query;
    if (error) throw new AppError(500, error.message);

    res.json({ products: data, pagination: { page: pageNum, limit: limitNum, total: count || 0 } });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/products/:id/images - Add product image
productsRouter.post('/:id/images', authenticateAdmin, [
  body('url').isURL(),
  body('is_primary').optional().isBoolean(),
], async (req: AuthenticatedRequest, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError(422, errors.array()[0].msg);

    const { url, alt_text, is_primary = false, sort_order = 0, storage_path } = req.body;
    const productId = req.params.id;

    if (is_primary) {
      await supabaseAdmin.from('product_images').update({ is_primary: false }).eq('product_id', productId);
    }

    const { data, error } = await supabaseAdmin
      .from('product_images')
      .insert({
        product_id: productId,
        url,
        storage_path,
        alt_text,
        is_primary,
        sort_order,
      })
      .select()
      .single();

    if (error) throw new AppError(500, error.message);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/products/:id/variations - Add variation
productsRouter.post('/:id/variations', authenticateAdmin, [
  body('name').trim().notEmpty(),
  body('value').trim().notEmpty(),
  body('additional_price').optional().isFloat(),
  body('stock').optional().isInt({ min: 0 }),
], async (req: AuthenticatedRequest, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError(422, errors.array()[0].msg);

    const { name, value, additional_price = 0, sku, stock = 0 } = req.body;
    const productId = req.params.id;

    const { data, error } = await supabaseAdmin
      .from('product_variations')
      .insert({
        product_id: productId,
        name,
        value,
        additional_price,
        sku,
        stock,
      })
      .select()
      .single();

    if (error) throw new AppError(500, error.message);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/products/:id/stock - Update stock quantity
productsRouter.patch('/:id/stock', authenticateAdmin, [
  body('quantity').isInt({ min: 0 }),
], async (req: AuthenticatedRequest, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError(422, errors.array()[0].msg);

    const { quantity } = req.body;
    const productId = req.params.id;

    const { data, error } = await supabaseAdmin
      .from('inventory')
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq('product_id', productId)
      .select()
      .single();

    if (error) throw new AppError(500, error.message);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

