import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { supabaseAdmin, supabaseClient } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import rateLimit from 'express-rate-limit';

import { authenticate, AuthenticatedRequest } from '../middleware/authenticate';
import { SharedIdentityService } from '../services/sharedIdentity';

export const authRouter = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many auth attempts, please try again later.' },
});

// POST /api/v1/auth/register
authRouter.post(
  '/register',
  authLimiter,
  [
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').optional().isMobilePhone('any'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('full_name').trim().notEmpty().withMessage('Full name is required'),
    body('referral_code').optional().trim().toUpperCase(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError(422, errors.array()[0].msg);
      }

      const { email, phone, password, full_name, referral_code } = req.body;

      if (!email && !phone) {
        throw new AppError(422, 'Either email or phone is required');
      }

      // Register with Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email || undefined,
        phone: phone || undefined,
        password,
        email_confirm: true,
      });

      if (authError) {
        throw new AppError(400, authError.message);
      }

      const userId = authData.user.id;

      // Create user profile (triggers wallet + referral code creation)
      const { error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          user_id: userId,
          full_name,
          email: email || null,
          phone: phone || null,
        });

      if (profileError) {
        // Rollback auth user
        await supabaseAdmin.auth.admin.deleteUser(userId);
        throw new AppError(500, 'Failed to create user profile');
      }

      // Handle referral
      if (referral_code) {
        const { data: refCode } = await supabaseAdmin
          .from('referral_codes')
          .select('user_id')
          .eq('code', referral_code)
          .eq('is_active', true)
          .single();

        if (refCode && refCode.user_id !== userId) {
          await supabaseAdmin.from('referrals').insert({
            referrer_id: refCode.user_id,
            referred_id: userId,
            referral_code,
            status: 'pending',
          });
        }
      }

      res.status(201).json({
        message: 'Registration successful',
        user_id: userId,
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/v1/auth/login
authRouter.post(
  '/login',
  authLimiter,
  [
    body('email').optional().isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError(422, errors.array()[0].msg);
      }

      const { email, password } = req.body;

      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.session) {
        throw new AppError(401, 'Invalid credentials');
      }

      // Check if user is an authorized staff member
      const { data: staff } = await supabaseAdmin
        .from('staff')
        .select('role, is_active, full_name')
        .eq('user_id', data.user.id)
        .single();

      const userRole = (staff && staff.is_active) ? staff.role : 'customer';

      res.json({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_in: data.session.expires_in,
        user: {
          id: data.user.id,
          email: data.user.email,
          role: userRole,
          full_name: staff?.full_name,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/v1/auth/refresh
authRouter.post('/refresh', async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) throw new AppError(400, 'Refresh token required');

    const { data, error } = await supabaseAdmin.auth.refreshSession({ refresh_token });
    if (error || !data.session) throw new AppError(401, 'Invalid refresh token');

    res.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/logout
authRouter.post('/logout', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      await supabaseAdmin.auth.admin.signOut(authHeader.split(' ')[1]);
    }
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/cross-app-token - Called from Rewards App to handoff to Shopping App
authRouter.post('/cross-app-token', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { launchToken, deepLink } = SharedIdentityService.generateCrossAppToken(req.user!.id);
    res.json({
      launch_token: launchToken,
      handoff_token: launchToken,
      deep_link: deepLink,
      expires_in_seconds: 300,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/verify-cross-app - Called from Shopping App when opened via handoff token
authRouter.post('/verify-cross-app', async (req, res, next) => {
  try {
    const token = req.body.handoff_token || req.body.launch_token || req.body.token;
    if (!token) {
      throw new AppError(400, 'handoff_token is required');
    }

    const linkedSession = await SharedIdentityService.validateAndLinkSession(token);

    // Generate authenticated session token for the target Shopping App
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-for-jwt';
    const accessToken = jwt.sign(
      {
        sub: linkedSession.userId,
        userId: linkedSession.userId,
        email: linkedSession.profile?.email,
        role: 'authenticated',
        app: 'growplus_shopping',
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      access_token: accessToken,
      user_id: linkedSession.userId,
      profile: linkedSession.profile,
      wallet: linkedSession.wallet,
    });
  } catch (err) {
    next(err);
  }
});

// Helper for generating referral codes
function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// POST /api/v1/auth/google-sync - Sync Google OAuth session, ensure user_profile & wallet exist
authRouter.post('/google-sync', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const userEmail = req.user!.email || null;
    const { full_name, avatar_url } = req.body || {};

    // 1. Fetch or create user profile
    let { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!profile) {
      const defaultName = full_name || (userEmail ? userEmail.split('@')[0] : 'GrowPlus Member');
      const { data: newProfile, error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          user_id: userId,
          full_name: defaultName,
          email: userEmail,
          phone: null,
          avatar_url: avatar_url || null,
          metadata: { provider: 'google', is_oauth: true, synced_at: new Date().toISOString() },
        })
        .select()
        .single();

      if (profileError) {
        throw new AppError(500, `Failed to initialize user profile: ${profileError.message}`);
      }
      profile = newProfile;
    }

    // 2. Ensure wallet_accounts exists (trigger normally handles it, fallback if needed)
    let { data: wallet } = await supabaseAdmin
      .from('wallet_accounts')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!wallet) {
      const { data: newWallet, error: walletError } = await supabaseAdmin
        .from('wallet_accounts')
        .insert({
          user_id: userId,
          balance: 0.00,
          pending_balance: 0.00,
          lifetime_earned: 0.00,
          lifetime_spent: 0.00,
          currency: 'INR',
          is_frozen: false,
        })
        .select()
        .single();

      if (!walletError && newWallet) {
        wallet = newWallet;
      }
    }

    // 3. Ensure carts exists
    const { data: cart } = await supabaseAdmin
      .from('carts')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!cart) {
      await supabaseAdmin.from('carts').insert({ user_id: userId });
    }

    // 4. Ensure referral_codes exists
    const { data: refCode } = await supabaseAdmin
      .from('referral_codes')
      .select('id, code')
      .eq('user_id', userId)
      .maybeSingle();

    if (!refCode) {
      await supabaseAdmin.from('referral_codes').insert({
        user_id: userId,
        code: generateReferralCode(),
      });
    }

    // 5. Check if mobile phone number is set
    const isProfileComplete = Boolean(profile.phone && profile.phone.trim().length >= 10);

    res.json({
      success: true,
      user_id: userId,
      email: userEmail,
      is_profile_complete: isProfileComplete,
      profile,
      wallet: wallet ? {
        id: wallet.id,
        balance: wallet.balance,
        pending_balance: wallet.pending_balance,
        currency: wallet.currency,
      } : null,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/complete-profile - Mandatory mobile number completion for Google OAuth users
authRouter.post(
  '/complete-profile',
  authenticate,
  [
    body('phone')
      .trim()
      .notEmpty()
      .withMessage('Mobile number is required')
      .matches(/^(\+91[\-\s]?)?[0-9]{10}$/)
      .withMessage('Please enter a valid 10-digit mobile number'),
    body('full_name').optional().trim().notEmpty(),
  ],
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError(422, errors.array()[0].msg);
      }

      const userId = req.user!.id;
      let rawPhone = req.body.phone.replace(/[\s\-]/g, '');
      if (!rawPhone.startsWith('+91') && rawPhone.length === 10) {
        rawPhone = `+91${rawPhone}`;
      }

      const updates: Record<string, any> = {
        phone: rawPhone,
        updated_at: new Date().toISOString(),
      };

      if (req.body.full_name) {
        updates.full_name = req.body.full_name.trim();
      }

      const { data: updatedProfile, error: updateError } = await supabaseAdmin
        .from('user_profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        throw new AppError(500, `Failed to update profile: ${updateError.message}`);
      }

      res.json({
        success: true,
        message: 'Profile completed successfully',
        profile: updatedProfile,
      });
    } catch (err) {
      next(err);
    }
  }
);


