import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/supabase';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

export interface CrossAppTokenPayload {
  userId: string;
  sourceApp: 'growplus_rewards';
  targetApp: 'growplus_shopping';
  jti: string; // Unique token ID for replay prevention
  iat: number;
  exp: number;
}

// In-memory or Redis-compatible replay prevention store for single-use launch tokens
const usedTokenJtis = new Set<string>();

export class SharedIdentityService {
  private static getSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is required for shared identity service');
    }
    return secret;
  }

  /**
   * Generate a cross-app handoff token (5-minute expiration, single use)
   */
  static generateCrossAppToken(userId: string): { launchToken: string; deepLink: string } {
    const jti = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const token = jwt.sign(
      {
        userId,
        sourceApp: 'growplus_rewards',
        targetApp: 'growplus_shopping',
        jti,
      },
      this.getSecret(),
      { expiresIn: '5m' }
    );

    const deepLink = `growplus://shopping?handoff_token=${token}`;
    return { launchToken: token, deepLink };
  }

  /**
   * Validate cross-app token and return verified user session & wallet details
   */
  static async validateAndLinkSession(token: string): Promise<{
    userId: string;
    profile: any;
    wallet: {
      balance: number;
      pendingBalance: number;
      currency: string;
      isFrozen: boolean;
    };
  }> {
    try {
      const decoded = jwt.verify(token, this.getSecret()) as CrossAppTokenPayload;

      // 1. Fast in-memory replay prevention
      if (usedTokenJtis.has(decoded.jti)) {
        throw new AppError(401, 'Cross-app handoff token has already been used');
      }

      // 2. Durable database replay prevention (multi-instance / restart safe)
      try {
        const fromAudit = typeof supabaseAdmin?.from === 'function' ? supabaseAdmin.from('audit_logs') : null;
        if (fromAudit && typeof fromAudit.select === 'function') {
          const { data: existingLog } = await fromAudit
            .select('id')
            .eq('action', 'SSO_HANDOFF_TOKEN_CONSUMED')
            .contains('new_value', { jti: decoded.jti })
            .maybeSingle();

          if (existingLog) {
            usedTokenJtis.add(decoded.jti);
            throw new AppError(401, 'Cross-app handoff token has already been consumed (durable ledger)');
          }
        }
      } catch (dbErr: any) {
        if (dbErr instanceof AppError) throw dbErr;
        // Fall back safely to in-memory check
      }

      usedTokenJtis.add(decoded.jti);

      // Record durable consumption in audit_logs
      try {
        const fromAudit = typeof supabaseAdmin?.from === 'function' ? supabaseAdmin.from('audit_logs') : null;
        if (fromAudit && typeof fromAudit.insert === 'function') {
          Promise.resolve(
            fromAudit.insert({
              actor_id: decoded.userId,
              action: 'SSO_HANDOFF_TOKEN_CONSUMED',
              resource_type: 'handoff_token',
              new_value: { jti: decoded.jti, source: decoded.sourceApp, target: decoded.targetApp },
            })
          ).then(() => {}, (err: any) => logger.warn('[SharedIdentity] Could not persist token audit log:', err?.message));
        }
      } catch (_) {}

      // Clean up token store periodically
      if (usedTokenJtis.size > 10000) {
        usedTokenJtis.clear();
      }

      // Fetch user profile from Supabase
      const { data: profile, error: profileErr } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('user_id', decoded.userId)
        .single();

      if (profileErr || !profile) {
        throw new AppError(404, 'User account not found');
      }

      if (!profile.is_active) {
        throw new AppError(403, 'User account is inactive');
      }

      // Fetch immutable wallet account from Supabase
      const { data: wallet, error: walletErr } = await supabaseAdmin
        .from('wallet_accounts')
        .select('balance, pending_balance, currency, is_frozen')
        .eq('user_id', decoded.userId)
        .single();

      if (walletErr || !wallet) {
        throw new AppError(404, 'Wallet account not found');
      }

      logger.info(`[SharedIdentity] Cross-app handoff verified for user ${decoded.userId}. Available credits: ₹${wallet.balance}`);

      return {
        userId: decoded.userId,
        profile,
        wallet: {
          balance: Number(wallet.balance),
          pendingBalance: Number(wallet.pending_balance),
          currency: wallet.currency || 'INR',
          isFrozen: Boolean(wallet.is_frozen),
        },
      };
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      logger.warn(`[SharedIdentity] Token verification failed: ${err.message}`);
      throw new AppError(401, 'Invalid or expired cross-app handoff token');
    }
  }
}
