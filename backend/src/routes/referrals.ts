import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { authenticate, AuthenticatedRequest } from '../middleware/authenticate';
import { AppError } from '../middleware/errorHandler';

export const referralsRouter = Router();

// GET /api/v1/referrals/my-code
referralsRouter.get('/my-code', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('referral_codes')
      .select('code, total_referrals, successful_referrals, total_credits_earned, is_active')
      .eq('user_id', req.user!.id)
      .single();

    if (error || !data) throw new AppError(404, 'Referral code not found');
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/referrals/history
referralsRouter.get('/history', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('referrals')
      .select(`
        id, status, created_at, qualified_at, rewarded_at,
        referred:referred_id(user_profiles(full_name))
      `)
      .eq('referrer_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (error) throw new AppError(500, 'Failed to fetch referral history');
    res.json(data);
  } catch (err) {
    next(err);
  }
});
