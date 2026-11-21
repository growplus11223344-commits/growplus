import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/supabase';
import { AppError } from './errorHandler';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError(401, 'No authorization token provided');
    }

    const token = authHeader.split(' ')[1];

    // 1. Try Supabase Auth user verification
    try {
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      if (!error && user) {
        req.user = { id: user.id, email: user.email };
        return next();
      }
    } catch {}

    // 2. Try Admin Server-Signed Token verification (ADMIN_JWT_SECRET)
    const adminJwtSecret = process.env.ADMIN_JWT_SECRET;
    if (adminJwtSecret) {
      try {
        const decoded = jwt.verify(token, adminJwtSecret) as any;
        if (decoded && (decoded.userId || decoded.sub || decoded.id)) {
          req.user = {
            id: decoded.userId || decoded.sub || decoded.id,
            email: decoded.email,
            role: decoded.role || 'owner',
          };
          return next();
        }
      } catch {}
    }

    // 3. Fallback: verify backend-signed cross-app JWT
    const jwtSecret = process.env.JWT_SECRET || 'test-jwt-secret-growplus-at-least-32-chars';
    if (jwtSecret) {
      try {
        const decoded = jwt.verify(token, jwtSecret) as any;
        if (decoded && (decoded.userId || decoded.sub || decoded.id)) {
          req.user = {
            id: decoded.userId || decoded.sub || decoded.id,
            email: decoded.email,
          };
          return next();
        }
      } catch {}
    }

    throw new AppError(401, 'Invalid or expired token');
  } catch (err) {
    next(err);
  }
};

export const authenticateAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await new Promise<void>((resolve, reject) => authenticate(req, res, (err) => err ? reject(err) : resolve()));

    // If role was already verified by trusted server ADMIN_JWT_SECRET
    if (req.user?.role && ['owner', 'admin', 'product_manager', 'order_manager'].includes(req.user.role)) {
      return next();
    }

    // Check if user is staff in Supabase public.staff table
    const { data: staff } = await supabaseAdmin
      .from('staff')
      .select('role, is_active')
      .eq('user_id', req.user!.id)
      .single();

    if (!staff || !staff.is_active) {
      throw new AppError(403, 'Access denied: not an authorized staff member');
    }

    req.user!.role = staff.role;
    next();
  } catch (err) {
    next(err);
  }
};
