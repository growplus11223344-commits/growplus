import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { supabaseAdmin } from '../config/supabase';
import { authenticateAdmin, AuthenticatedRequest } from '../middleware/authenticate';
import { AppError } from '../middleware/errorHandler';

export const categoriesRouter = Router();

// GET /api/v1/categories
categoriesRouter.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('id, name, slug, description, image_url, parent_id, sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw new AppError(500, 'Failed to fetch categories');
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/categories/:slug
categoriesRouter.get('/:slug', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .eq('slug', req.params.slug)
      .eq('is_active', true)
      .single();

    if (error || !data) throw new AppError(404, 'Category not found');
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/categories - Admin only
categoriesRouter.post('/', authenticateAdmin, [
  body('name').trim().notEmpty(),
  body('slug').optional().trim(),
], async (req: AuthenticatedRequest, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError(422, errors.array()[0].msg);

    const { name, description, image_url, parent_id, sort_order = 0 } = req.body;
    const slug = req.body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert({ name, slug, description, image_url, parent_id, sort_order, is_active: true })
      .select()
      .single();

    if (error) throw new AppError(500, error.message);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/categories/:id - Admin only
categoriesRouter.patch('/:id', authenticateAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    const allowed = ['name', 'slug', 'description', 'image_url', 'parent_id', 'sort_order', 'is_active'];
    const updates: Record<string, any> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const { data, error } = await supabaseAdmin
      .from('categories')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !data) throw new AppError(404, 'Category not found');
    res.json(data);
  } catch (err) {
    next(err);
  }
});

