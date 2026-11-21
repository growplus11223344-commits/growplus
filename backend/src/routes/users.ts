import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import crypto from 'crypto';
import { supabaseAdmin } from '../config/supabase';
import { authenticate, AuthenticatedRequest } from '../middleware/authenticate';
import { AppError } from '../middleware/errorHandler';

export const usersRouter = Router();

const upload = multer({
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    }
  },
});

// Helper to generate avatar signed URL
async function attachAvatarSignedUrl(profile: any) {
  if (profile?.avatar_url && !profile.avatar_url.startsWith('http')) {
    try {
      const { data: signed } = await supabaseAdmin.storage
        .from('avatars')
        .createSignedUrl(profile.avatar_url, 3600);
      if (signed?.signedUrl) {
        profile.avatar_signed_url = signed.signedUrl;
      }
    } catch {}
  }
  return profile;
}

// GET /api/v1/users/me
usersRouter.get('/me', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('user_id', req.user!.id)
      .single();

    if (error || !profile) throw new AppError(404, 'User profile not found');

    const [{ data: referral_codes }, { data: wallet_accounts }] = await Promise.all([
      supabaseAdmin
        .from('referral_codes')
        .select('code, total_referrals, successful_referrals, total_credits_earned')
        .eq('user_id', req.user!.id)
        .maybeSingle(),
      supabaseAdmin
        .from('wallet_accounts')
        .select('balance, pending_balance, currency')
        .eq('user_id', req.user!.id)
        .maybeSingle(),
    ]);

    const fullProfile = {
      ...profile,
      referral_codes: referral_codes || null,
      wallet_accounts: wallet_accounts || null,
    };

    await attachAvatarSignedUrl(fullProfile);
    res.json(fullProfile);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/users/me/avatar - Upload profile photo to private avatars bucket
usersRouter.post('/me/avatar', authenticate, upload.single('avatar'), async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.file) {
      throw new AppError(400, 'No image file uploaded');
    }

    const userId = req.user!.id;
    const fileExt = req.file.mimetype.split('/')[1] || 'jpg';
    const uniqueFilename = `${crypto.randomUUID()}.${fileExt}`;
    const storagePath = `${userId}/${uniqueFilename}`;

    // 1. Fetch current profile to cleanup old avatar if exists
    const { data: currentProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('avatar_url')
      .eq('user_id', userId)
      .single();

    // 2. Upload to private avatars bucket
    const { error: uploadError } = await supabaseAdmin.storage
      .from('avatars')
      .upload(storagePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      });

    if (uploadError) {
      throw new AppError(500, `Storage upload failed: ${uploadError.message}`);
    }

    // 3. Update user_profiles.avatar_url
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        avatar_url: storagePath,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      throw new AppError(500, 'Failed to update profile avatar path');
    }

    // 4. Cleanup old avatar file safely
    if (currentProfile?.avatar_url && currentProfile.avatar_url.startsWith(`${userId}/`)) {
      try {
        await supabaseAdmin.storage.from('avatars').remove([currentProfile.avatar_url]);
      } catch {}
    }

    // 5. Generate signed URL for immediate client display
    await attachAvatarSignedUrl(updatedProfile);

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatar_url: storagePath,
      avatar_signed_url: updatedProfile.avatar_signed_url,
      profile: updatedProfile,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/users/me/avatar - Remove profile photo
usersRouter.delete('/me/avatar', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;

    // Fetch existing avatar path
    const { data: currentProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('avatar_url')
      .eq('user_id', userId)
      .single();

    if (currentProfile?.avatar_url && currentProfile.avatar_url.startsWith(`${userId}/`)) {
      try {
        await supabaseAdmin.storage.from('avatars').remove([currentProfile.avatar_url]);
      } catch {}
    }

    // Clear avatar_url
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        avatar_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      throw new AppError(500, 'Failed to remove avatar');
    }

    res.json({
      success: true,
      message: 'Avatar removed successfully',
      profile: updatedProfile,
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/users/me
usersRouter.patch('/me', authenticate, [
  body('full_name').optional().trim().notEmpty(),
  body('phone').optional().isMobilePhone('any'),
  body('date_of_birth').optional().isDate(),
  body('gender').optional().isIn(['male', 'female', 'other', 'prefer_not_to_say']),
], async (req: AuthenticatedRequest, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError(422, errors.array()[0].msg);

    const allowedFields = ['full_name', 'phone', 'date_of_birth', 'gender', 'address', 'avatar_url'];
    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update(updates)
      .eq('user_id', req.user!.id)
      .select()
      .single();

    if (error) throw new AppError(500, 'Failed to update profile');
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/users/me — Google Play Store Account Deletion Compliance
usersRouter.delete('/me', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;

    // 1. Freeze wallet account
    await supabaseAdmin
      .from('wallet_accounts')
      .update({ is_frozen: true, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    // 2. Anonymize/delete user profile
    await supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('user_id', userId);

    // 3. Delete from Supabase Auth
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteAuthError) {
      throw new AppError(500, `Failed to delete user account: ${deleteAuthError.message}`);
    }

    res.json({ message: 'Account and associated personal data deleted successfully' });
  } catch (err) {
    next(err);
  }
});
