import { IPaymentGateway, PaymentProvider, GatewayCapability } from './types';
import { RazorpayAdapter } from './RazorpayAdapter';
import { EuropepayAdapter } from './EuropepayAdapter';
import { supabaseAdmin } from '../../config/supabase';
import { AppError } from '../../middleware/errorHandler';
import { logger } from '../../utils/logger';

export class PaymentGatewayService {
  private static gateways: Map<PaymentProvider, IPaymentGateway> = new Map();
  private static dynamicActiveProvider: PaymentProvider | null = null;

  static initialize() {
    this.gateways.set('razorpay', new RazorpayAdapter());
    this.gateways.set('europepay', new EuropepayAdapter());
    logger.info('[PaymentGatewayService] Initialized dual payment gateway adapters: [razorpay, europepay]');
  }

  /**
   * Get specific gateway by provider name
   */
  static getGateway(provider: PaymentProvider): IPaymentGateway {
    if (this.gateways.size === 0) {
      this.initialize();
    }

    const gateway = this.gateways.get(provider);
    if (!gateway) {
      throw new AppError(400, `Unknown payment provider: ${provider}`);
    }

    return gateway;
  }

  /**
   * Resolve currently active payment gateway (dynamic server-controlled)
   */
  static async getActiveGateway(): Promise<IPaymentGateway> {
    if (this.gateways.size === 0) {
      this.initialize();
    }

    // 1. Check in-memory cached dynamic override
    if (this.dynamicActiveProvider) {
      return this.getGateway(this.dynamicActiveProvider);
    }

    // 2. Check Supabase payment_gateway_settings table
    try {
      const { data: settings } = await supabaseAdmin
        .from('payment_gateway_settings')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();

      if (settings && settings.active_provider) {
        const provider = settings.active_provider as PaymentProvider;
        if (this.gateways.has(provider)) {
          return this.getGateway(provider);
        }
      }
    } catch (_) {
      // Fall through to environment variable if table doesn't exist yet
    }

    // 3. Check environment variable (PAYMENT_PROVIDER or ACTIVE_PAYMENT_PROVIDER)
    const envProvider = (
      process.env.ACTIVE_PAYMENT_PROVIDER ||
      process.env.PAYMENT_PROVIDER ||
      'razorpay'
    ).toLowerCase() as PaymentProvider;

    if (this.gateways.has(envProvider)) {
      return this.getGateway(envProvider);
    }

    return this.getGateway('razorpay');
  }

  /**
   * Switch the active payment provider via authenticated admin action
   */
  static async switchGateway(
    newProvider: PaymentProvider,
    reason: string,
    adminUserId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ previousProvider: PaymentProvider; activeProvider: PaymentProvider; capabilities: GatewayCapability }> {
    const currentGateway = await this.getActiveGateway();
    const previousProvider = currentGateway.name;

    if (!['razorpay', 'europepay'].includes(newProvider)) {
      throw new AppError(400, `Invalid payment provider: ${newProvider}. Permitted: [razorpay, europepay]`);
    }

    const targetGateway = this.getGateway(newProvider);
    const capabilities = targetGateway.getCapabilities();

    // Check if new gateway is available
    const availability = targetGateway.isAvailable();
    if (!availability.available && process.env.NODE_ENV === 'production') {
      throw new AppError(
        422,
        `Cannot switch to ${newProvider}: ${availability.reason || 'Provider not configured or disabled'}`
      );
    }

    // Update in-memory
    this.dynamicActiveProvider = newProvider;

    // Persist in Supabase settings
    try {
      await supabaseAdmin
        .from('payment_gateway_settings')
        .upsert({
          id: 'default',
          active_provider: newProvider,
          razorpay_enabled: newProvider === 'razorpay' ? true : process.env.RAZORPAY_ENABLED !== 'false',
          europepay_enabled: newProvider === 'europepay' ? true : process.env.EUROPEPAY_ENABLED === 'true',
          last_switched_at: new Date().toISOString(),
          last_switched_by: adminUserId || null,
          switch_reason: reason,
          updated_at: new Date().toISOString(),
        });

      // Record audit log
      await supabaseAdmin
        .from('payment_gateway_audit_logs')
        .insert({
          previous_provider: previousProvider,
          new_provider: newProvider,
          switched_by: adminUserId || null,
          reason,
          ip_address: ipAddress || null,
          user_agent: userAgent || null,
        });
    } catch (err: any) {
      logger.warn('[PaymentGatewayService] Could not persist gateway switch to Supabase settings table:', err.message);
    }

    logger.info(
      `[PaymentGatewayService] Payment gateway switched from ${previousProvider} to ${newProvider} by ${adminUserId || 'system'}. Reason: "${reason}"`
    );

    return {
      previousProvider,
      activeProvider: newProvider,
      capabilities,
    };
  }

  /**
   * Get comprehensive status of all gateways for Admin Dashboard
   */
  static async getGatewayOverview(): Promise<{
    activeProvider: PaymentProvider;
    environment: string;
    gateways: {
      provider: PaymentProvider;
      displayName: string;
      isActive: boolean;
      isAvailable: boolean;
      unavailabilityReason?: string;
      capabilities: GatewayCapability;
    }[];
    metrics: {
      totalPayments: number;
      byProvider: Record<PaymentProvider, number>;
      capturedCount: number;
      failedCount: number;
      refundedCount: number;
    };
  }> {
    const activeGateway = await this.getActiveGateway();
    const activeProvider = activeGateway.name;
    const environment = process.env.NODE_ENV || 'development';

    const providers: PaymentProvider[] = ['razorpay', 'europepay'];
    const gatewayList = providers.map((p) => {
      const gw = this.getGateway(p);
      const avail = gw.isAvailable();
      return {
        provider: p,
        displayName: gw.displayName,
        isActive: p === activeProvider,
        isAvailable: avail.available,
        unavailabilityReason: avail.reason,
        capabilities: gw.getCapabilities(),
      };
    });

    // Query transaction metrics from Supabase
    let totalPayments = 0;
    const byProvider: Record<PaymentProvider, number> = { razorpay: 0, europepay: 0 };
    let capturedCount = 0;
    let failedCount = 0;
    let refundedCount = 0;

    try {
      const { data: payments } = await supabaseAdmin
        .from('payments')
        .select('id, provider, status, amount, created_at')
        .limit(1000);

      if (payments) {
        totalPayments = payments.length;
        for (const pm of payments) {
          const prov = (pm.provider || 'razorpay') as PaymentProvider;
          if (byProvider[prov] !== undefined) byProvider[prov]++;

          if (pm.status === 'captured') capturedCount++;
          else if (pm.status === 'failed') failedCount++;
          else if (pm.status === 'refunded') refundedCount++;
        }
      }
    } catch (_) {}

    return {
      activeProvider,
      environment,
      gateways: gatewayList,
      metrics: {
        totalPayments,
        byProvider,
        capturedCount,
        failedCount,
        refundedCount,
      },
    };
  }
}
