import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { supabaseAdmin } from '../config/supabase';
import { authenticate, authenticateAdmin, AuthenticatedRequest } from '../middleware/authenticate';
import { AppError } from '../middleware/errorHandler';
import { MongoAnalyticsService } from '../services/mongoAnalytics';
import { GoogleSheetsService } from '../services/googleSheets';
import { logger } from '../utils/logger';

export const supportRouter = Router();

// GET /api/v1/support/tickets - User's support tickets
supportRouter.get('/tickets', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('support_tickets')
      .select('*')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (error) throw new AppError(500, 'Failed to fetch support tickets');
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/support/tickets - Create support ticket
supportRouter.post('/tickets', authenticate, [
  body('subject').trim().notEmpty().isLength({ max: 200 }),
  body('description').trim().notEmpty().isLength({ max: 5000 }),
  body('category').optional().isIn(['order', 'payment', 'product', 'account', 'reward', 'other']),
  body('order_id').optional().isUUID(),
], async (req: AuthenticatedRequest, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError(422, errors.array()[0].msg);

    const { subject, description, category = 'other', order_id } = req.body;

    const { data, error } = await supabaseAdmin
      .from('support_tickets')
      .insert({
        user_id: req.user!.id,
        subject,
        description,
        category,
        order_id: order_id || null,
        status: 'open',
      })
      .select()
      .single();

    if (error) throw new AppError(500, 'Failed to create support ticket');

    // Asynchronously log to MongoDB Analytics & sync to Google Sheets
    MongoAnalyticsService.logEvent(
      'SUPPORT_TICKET_CREATED',
      'growplus_rewards',
      {
        ticket_id: data.id,
        subject: data.subject,
        category: data.category,
        status: data.status,
      },
      req.user!.id,
      req.ip,
      req.headers['user-agent']
    ).catch(e => logger.warn('[MongoAnalytics] Failed to log ticket creation event:', e));

    GoogleSheetsService.syncSupportTickets().catch(e =>
      logger.warn('[GoogleSheets] Failed to sync support ticket to sheets:', e)
    );

    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/support/tickets/:id
supportRouter.get('/tickets/:id', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('support_tickets')
      .select('*, support_messages(*)')
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id)
      .single();

    if (error || !data) throw new AppError(404, 'Support ticket not found');
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/support/tickets/:id/messages - Customer sends follow-up message on their ticket
supportRouter.post(
  '/tickets/:id/messages',
  authenticate,
  [
    body('message').trim().notEmpty().withMessage('Message cannot be empty').isLength({ max: 5000 }),
  ],
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new AppError(422, errors.array()[0].msg);

      const ticketId = req.params.id;
      const userId = req.user!.id;
      const { message } = req.body;

      // Verify ticket exists and belongs to user
      const { data: ticket, error: ticketError } = await supabaseAdmin
        .from('support_tickets')
        .select('id, status')
        .eq('id', ticketId)
        .eq('user_id', userId)
        .single();

      if (ticketError || !ticket) {
        throw new AppError(404, 'Ticket not found or unauthorized');
      }

      if (ticket.status === 'closed') {
        throw new AppError(400, 'Cannot reply to a closed ticket. Please raise a new ticket.');
      }

      // Insert message
      const { data: newMessage, error: msgError } = await supabaseAdmin
        .from('support_messages')
        .insert({
          ticket_id: ticketId,
          sender_id: userId,
          sender_type: 'customer',
          message,
          is_internal: false,
        })
        .select()
        .single();

      if (msgError) throw new AppError(500, 'Failed to send message');

      // Update ticket updated_at and set status to open if waiting_for_customer
      const statusUpdate = ticket.status === 'waiting_for_customer' ? { status: 'open' } : {};
      await supabaseAdmin
        .from('support_tickets')
        .update({
          ...statusUpdate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', ticketId);

      MongoAnalyticsService.logEvent(
        'SUPPORT_TICKET_CUSTOMER_MESSAGE',
        'growplus_rewards',
        { ticket_id: ticketId, message_id: newMessage.id },
        userId
      ).catch(e => logger.warn('[MongoAnalytics] Failed to log ticket message event:', e));

      res.status(201).json(newMessage);
    } catch (err) {
      next(err);
    }
  }
);

// ==========================================
// ADMIN SUPPORT TICKET MANAGEMENT
// ==========================================

// GET /api/v1/support/admin/tickets - Staff view all support tickets
supportRouter.get('/admin/tickets', authenticateAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { status, category, page = '1', limit = '20' } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;

    let query = supabaseAdmin
      .from('support_tickets')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (status) query = query.eq('status', status);
    if (category) query = query.eq('category', category);

    const { data: tickets, error, count } = await query;
    if (error) throw new AppError(500, `Failed to fetch admin tickets: ${error.message}`);

    // Fetch user profiles concurrently
    const userIds = Array.from(new Set((tickets || []).map(t => t.user_id).filter(Boolean)));
    let profileMap: Record<string, any> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from('user_profiles')
        .select('id, full_name, phone')
        .in('id', userIds);
      if (profiles) {
        profileMap = Object.fromEntries(profiles.map(p => [p.id, p]));
      }
    }

    const ticketsWithProfiles = (tickets || []).map(t => ({
      ...t,
      user_profiles: profileMap[t.user_id] || null,
    }));

    res.json({
      tickets: ticketsWithProfiles,
      pagination: { page: pageNum, limit: limitNum, total: count || 0 },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/support/admin/tickets/:id - Staff view ticket details & all messages
supportRouter.get('/admin/tickets/:id', authenticateAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('support_tickets')
      .select('*, support_messages(*)')
      .eq('id', req.params.id)
      .single();

    if (error || !data) throw new AppError(404, 'Ticket not found');

    let userProfile: any = null;
    if (data.user_id) {
      const { data: profile } = await supabaseAdmin
        .from('user_profiles')
        .select('id, full_name, phone')
        .eq('id', data.user_id)
        .maybeSingle();
      userProfile = profile;
    }

    res.json({
      ...data,
      user_profiles: userProfile,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/support/admin/tickets/:id/messages - Staff reply or internal note
supportRouter.post(
  '/admin/tickets/:id/messages',
  authenticateAdmin,
  [
    body('message').trim().notEmpty().withMessage('Message is required'),
    body('is_internal').optional().isBoolean(),
  ],
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new AppError(422, errors.array()[0].msg);

      const ticketId = req.params.id;
      const { message, is_internal = false } = req.body;

      const { data: newMessage, error: msgError } = await supabaseAdmin
        .from('support_messages')
        .insert({
          ticket_id: ticketId,
          sender_id: req.user!.id,
          sender_type: 'staff',
          message,
          is_internal,
        })
        .select()
        .single();

      if (msgError) throw new AppError(500, 'Failed to save staff message');

      // If public reply, set status to waiting_for_customer unless closed
      if (!is_internal) {
        await supabaseAdmin
          .from('support_tickets')
          .update({
            status: 'waiting_for_customer',
            updated_at: new Date().toISOString(),
          })
          .eq('id', ticketId);
      }

      res.status(201).json(newMessage);
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/v1/support/admin/tickets/:id - Staff update ticket status / priority / assignment
supportRouter.patch(
  '/admin/tickets/:id',
  authenticateAdmin,
  [
    body('status').optional().isIn(['open', 'in_progress', 'waiting_for_customer', 'resolved', 'closed']),
    body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']),
    body('assigned_to').optional().isUUID(),
  ],
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new AppError(422, errors.array()[0].msg);

      const updates: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (req.body.status) {
        updates.status = req.body.status;
        if (req.body.status === 'resolved') updates.resolved_at = new Date().toISOString();
        if (req.body.status === 'closed') updates.closed_at = new Date().toISOString();
      }
      if (req.body.priority) updates.priority = req.body.priority;
      if (req.body.assigned_to) updates.assigned_to = req.body.assigned_to;

      const { data, error } = await supabaseAdmin
        .from('support_tickets')
        .update(updates)
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) throw new AppError(500, 'Failed to update ticket');
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
);
