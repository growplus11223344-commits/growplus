import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { authenticate, AuthenticatedRequest } from '../middleware/authenticate';
import { AppError } from '../middleware/errorHandler';

export const notificationsRouter = Router();

// GET /api/v1/notifications
notificationsRouter.get('/', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { page = '1', limit = '20' } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;

    const { data, error, count } = await supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) throw new AppError(500, 'Failed to fetch notifications');
    res.json({ notifications: data, pagination: { page: pageNum, limit: limitNum, total: count || 0 } });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/notifications/:id/read
notificationsRouter.patch('/:id/read', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id);

    if (error) throw new AppError(500, 'Failed to mark notification as read');
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/notifications/mark-all-read
notificationsRouter.patch('/mark-all-read', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', req.user!.id)
      .eq('is_read', false);

    if (error) throw new AppError(500, 'Failed to mark notifications as read');
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
});
