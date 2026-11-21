import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { authenticate, AuthenticatedRequest } from '../middleware/authenticate';
import { AppError } from '../middleware/errorHandler';

export const rewardsRouter = Router();

// GET /api/v1/rewards - Get user reward summary
rewardsRouter.get('/', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('reward_transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw new AppError(500, 'Failed to fetch rewards');
    res.json({ rewards: data });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/rewards/rules - Get active reward rules
rewardsRouter.get('/rules', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('reward_rules')
      .select('id, name, description, reward_type, reward_value, min_order_amount, is_active')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw new AppError(500, 'Failed to fetch reward rules');
    res.json(data);
  } catch (err) {
    next(err);
  }
});
